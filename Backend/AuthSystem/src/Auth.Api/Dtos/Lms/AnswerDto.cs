namespace Auth.Api.Dtos.Lms;

public class AnswerDto
{
    public int QuestionId { get; set; }
    public List<int> SelectedOptionIds { get; set; } = new();
}