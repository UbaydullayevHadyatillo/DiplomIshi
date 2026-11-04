using Auth.Api.Data;
using Auth.Api.Dtos.Lms;
using Auth.Api.Hubs;
using Auth.Api.Models.Lms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Auth.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ExamController : ControllerBase
{
    private const int MaxQuestions = 10;

    private readonly AppDbContext _dbContext;
    private readonly IHubContext<ExamHub> _hubContext;

    public ExamController(AppDbContext dbContext, IHubContext<ExamHub> hubContext)
    {
        _dbContext = dbContext;
        _hubContext = hubContext;
    }

    [HttpGet("start/{subjectId:int}")]
    public async Task<IActionResult> GetQuestions(int subjectId, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var subject = await _dbContext.Subjects
            .Where(s => s.Id == subjectId)
            .Select(s => new { s.Id, s.Name })
            .FirstOrDefaultAsync(ct);

        if (subject == null) return NotFound("Fan topilmadi.");

        var questions = await _dbContext.Questions
            .Where(q => q.SubjectId == subjectId)
            .Include(q => q.Options)
            .OrderBy(q => Guid.NewGuid()) 
            .Take(MaxQuestions)
            .Select(q => new
            {
                q.Id,
                q.Text,
                Options = q.Options.Select(o => new { o.Id, o.Text })
            })
            .ToListAsync(ct);

        return Ok(new
        {
            SubjectId = subject.Id,
            SubjectName = subject.Name,
            Questions = questions
        });
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitExam([FromBody] SumbitExamDto dto, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId)) return Unauthorized();

        var userAnswers = dto.Answers ?? dto.Answers ?? new List<AnswerDto>();

        var subjectExists = await _dbContext.Subjects.AnyAsync(s => s.Id == dto.SubjectId, ct);
        if (!subjectExists) return NotFound("Fan topilmadi.");

        var dbQuestions = await _dbContext.Questions
            .Where(q => q.SubjectId == dto.SubjectId)
            .Include(q => q.Options)
            .ToDictionaryAsync(q => q.Id, q => q, ct);

        int correctAnswersCount = 0;
        int totalQuestions = userAnswers.Count;

        var reviewDataList = new List<object>();

        foreach (var userAns in userAnswers)
        {
            if (!dbQuestions.TryGetValue(userAns.QuestionId, out var dbQuestion)) continue;

            var correctOptionIds = dbQuestion.Options
                .Where(o => o.IsCorrect)
                .Select(o => o.Id)
                .ToList();

            var userSelectedOptionIds = userAns.SelectedOptionIds ?? new List<int>();

            bool isQuestionCorrect = correctOptionIds.Count == userSelectedOptionIds.Count &&
                                     correctOptionIds.All(id => userSelectedOptionIds.Contains(id));

            if (isQuestionCorrect) correctAnswersCount++;

            reviewDataList.Add(new
            {
                QuestionId = dbQuestion.Id,
                QuestionText = dbQuestion.Text,
                Options = dbQuestion.Options.Select(o => new
                {
                    o.Id,
                    o.Text,
                    o.IsCorrect,
                    IsSelected = userSelectedOptionIds.Contains(o.Id)
                }),
                IsCorrect = isQuestionCorrect
            });

            var testResult = new TestResult
            {
                QuestionId = dbQuestion.Id,
                IsCorrect = isQuestionCorrect,
                SelectedOptionIds = string.Join(",", userSelectedOptionIds)
            }; 
        }

        double score = totalQuestions > 0 ? Math.Round(((double)correctAnswersCount / totalQuestions) * 100, 1) : 0;

        var examResult = new ExamResult
        {
            UserId = userId,
            SubjectId = dto.SubjectId,
            CorrectAnswers = correctAnswersCount,
            TotalQuestions = totalQuestions,
            Score = score,
            TakenAt = DateTime.UtcNow
        };

        _dbContext.ExamResults.Add(examResult);
        await _dbContext.SaveChangesAsync(ct);

        var userIdStr = userId.ToString();
        if (ExamHub.UserConnections.TryGetValue(userIdStr, out var connectionId))
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ExamCompleted", new
            {
                examResultId = examResult.Id,
                correctAnswers = correctAnswersCount,
                total = totalQuestions,
                score
            }, ct);
        }

        return Ok(new
        {
            examResultId = examResult.Id,
            correctAnswers = correctAnswersCount,
            total = totalQuestions,
            score,
            reviewData = reviewDataList
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId)) return Unauthorized();

        var history = await _dbContext.ExamResults
            .Where(e => e.UserId == userId)
            .Include(e => e.Subject)
            .AsNoTracking()
            .OrderByDescending(e => e.TakenAt)
            .Select(e => new
            {
                e.Id,
                SubjectName = e.Subject.Name,
                e.CorrectAnswers,
                e.TotalQuestions,
                e.Score,
                e.TakenAt
            })
            .ToListAsync(ct);

        return Ok(history);
    }
}