using Auth.Api.Models.Identity;

namespace Auth.Api.Models.Lms;

public class ExamResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public double Score { get; set; }
    public DateTime TakenAt { get; set; } = DateTime.UtcNow;

    public List<TestResult> Details { get; set; } = new();
}

 