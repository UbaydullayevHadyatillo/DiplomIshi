using System.ComponentModel.DataAnnotations;

namespace Auth.Api.Dtos.Lms;

public class SumbitExamDto
{
    [Required]
    public int SubjectId { get; set; }

    [Required]
    public List<AnswerDto> Answers { get; set; } = new();
}


