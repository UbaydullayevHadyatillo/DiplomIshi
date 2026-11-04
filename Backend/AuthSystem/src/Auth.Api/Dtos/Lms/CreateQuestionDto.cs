using System.ComponentModel.DataAnnotations;

namespace Auth.Api.Dtos.Lms;

public class CreateQuestionDto
{
    [Required]
    public int SubjectId { get; set; }

    [Required(ErrorMessage = "Savol matni kiritilishi shart.")]
    [MinLength(5, ErrorMessage = "Savol matni kamida 5 belgi bo'lishi kerak.")]
    public string Text { get; set; } = string.Empty;

    [Required]
    [MinLength(2)]
    [MaxLength(4)]
    public List<CreateOptionDto> Options { get; set; } = new();
}
