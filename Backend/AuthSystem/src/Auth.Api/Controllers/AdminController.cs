using Auth.Api.Data;
using Auth.Api.Dtos.Lms;
using Auth.Api.Models.Lms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public AdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("subjects")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var exists = await _dbContext.Subjects.AnyAsync(s => s.Name == dto.Name.Trim(), ct);
        if (exists) return BadRequest("Bu nomdagi fan allaqachon mavjud.");

        var subject = new Subject { Name = dto.Name.Trim() };
        _dbContext.Subjects.Add(subject);
        await _dbContext.SaveChangesAsync(ct);

        return Ok(new { message = "Fan muvaffaqiyatli yaratildi", id = subject.Id });
    }

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects(CancellationToken ct)
    {
        var subjects = await _dbContext.Subjects
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new { s.Id, s.Name })
            .ToListAsync(ct);

        return Ok(subjects);
    }

    [HttpPost("questions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var subjectExists = await _dbContext.Subjects.AnyAsync(s => s.Id == dto.SubjectId, ct);
        if (!subjectExists) return NotFound($"Fan topilmadi. ID: {dto.SubjectId}");

        var correctCount = dto.Options.Count(o => o.IsCorrect);

        if (correctCount == 0)
            return BadRequest("Savolda kamida bitta to'g'ri javob bo'lishi shart.");

        if (correctCount > 3)
            return BadRequest("Savolda ko'pi bilan 3 ta to'g'ri javob bo'lishi mumkin.");

        if (dto.Options.Count != 4)
            return BadRequest("Savolda aniq 4 ta variant bo'lishi shart.");

        var question = new Question
        {
            SubjectId = dto.SubjectId,
            Text = dto.Text.Trim(),
            Options = dto.Options.Select(o => new Option
            {
                Text = o.Text.Trim(),
                IsCorrect = o.IsCorrect
            }).ToList()
        };

        _dbContext.Questions.Add(question);
        await _dbContext.SaveChangesAsync(ct);

        return StatusCode(201, new { message = "Savol muvaffaqiyatli saqlandi", id = question.Id });
    }

   
    [HttpGet("questions/{subjectId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetQuestionsBySubject(int subjectId, CancellationToken ct)
    {
        var subjectExists = await _dbContext.Subjects.AnyAsync(s => s.Id == subjectId, ct);
        if (!subjectExists) return NotFound("Fan topilmadi.");

        var questions = await _dbContext.Questions
            .Where(q => q.SubjectId == subjectId)
            .Include(q => q.Options)
            .AsNoTracking()
            .Select(q => new
            {
                q.Id,
                q.Text,
                Options = q.Options.Select(o => new { o.Id, o.Text, o.IsCorrect })
            })
            .ToListAsync(ct);

        return Ok(questions);
    }
}