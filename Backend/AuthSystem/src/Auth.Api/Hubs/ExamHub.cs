using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace Auth.Api.Hubs;

[Authorize]
public class ExamHub : Hub
{
    private readonly ILogger<ExamHub> _logger;

    public static readonly ConcurrentDictionary<string, string> UserConnections = new();

    public ExamHub(ILogger<ExamHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections[userId] = Context.ConnectionId;
            _logger.LogInformation("SignalR: Foydalanuvchi {UserId} ulandi. ConnectionId: {ConnId}", userId, Context.ConnectionId);
        }
        await base.OnConnectedAsync();
    }

    public async Task JoinExamSession(int subjectId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("SignalR: JoinExamSession — foydalanuvchi aniqlanmadi.");
            return;
        }

        UserConnections[userId] = Context.ConnectionId;

        string roomName = $"exam_{userId}_{subjectId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

        await Clients.Caller.SendAsync("SessionJoined", new
        {
            userId,
            subjectId,
            room = roomName,
            serverTime = DateTime.UtcNow
        });

        _logger.LogInformation("SignalR: User {UserId} imtihon sessiясiga qo'shildi. Fan: {SubjectId}", userId, subjectId);
    }

    public async Task SendTimeWarning(int subjectId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("SignalR: SendTimeWarning — foydalanuvchi aniqlanmadi.");
            return;
        }

        var warningMessage = "Vaqtingiz kam qoldi! Savollarni tezroq belgilang.";
        int timeLeftSeconds = 120;

        await Clients.Caller.SendAsync("ExamTimeWarning", new
        {
            message = warningMessage,
            timeLeftSeconds = timeLeftSeconds
        });

        _logger.LogInformation("SignalR: User {UserId} uchun 2 daqiqa qolgani haqida ogohlantirish signal yuborildi. Fan: {SubjectId}", userId, subjectId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.TryRemove(userId, out _);
            _logger.LogInformation("SignalR: Foydalanuvchi {UserId} uzildi.", userId);
        }

        if (exception != null)
        {
            _logger.LogError(exception, "SignalR: Foydalanuvchi {UserId} xatolik bilan uzildi.", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private string? GetUserId()
    {
        return Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? Context.UserIdentifier;
    }
}