using System.ComponentModel.DataAnnotations.Schema;

namespace Auth.Api.Models.Lms;

public class TestResult
{
    public int Id { get; set; }
    public int ExamResultId { get; set; }
    public ExamResult ExamResult { get; set; } = null!;
    public int QuestionId { get; set; }
    public bool IsCorrect { get; set; }

    public string SelectedOptionIds { get; set; } = string.Empty;
}
