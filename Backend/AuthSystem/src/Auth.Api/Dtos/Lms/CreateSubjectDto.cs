using System.ComponentModel.DataAnnotations;

namespace Auth.Api.Dtos.Lms;

public class CreateSubjectDto
{
    [Required(ErrorMessage = "Fan nomi kiritilishi shart.")]
    [MinLength(2, ErrorMessage = "Fan nomi kamida 2 belgi bo'lishi kerak.")]
    public string Name { get; set; } = string.Empty;
}
