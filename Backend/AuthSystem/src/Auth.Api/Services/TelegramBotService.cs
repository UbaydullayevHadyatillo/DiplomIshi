using Auth.Api.Options;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;

namespace Auth.Api.Services;

public class TelegramBotService
{
    private readonly HttpClient _httpClient;
    private readonly TelegramOptions _telegramOptions;
    private readonly ILogger<TelegramBotService> _logger;

    public TelegramBotService(
        HttpClient httpClient,
        IOptions<TelegramOptions> telegramOptions,
        ILogger<TelegramBotService> logger)
    {
        _httpClient = httpClient;
        _telegramOptions = telegramOptions.Value;
        _logger = logger;
    }

    public async Task SendMessageAsync(long chatId, string text, CancellationToken ct = default)
    {
        var url = $"https://api.telegram.org/bot{_telegramOptions.BotToken}/sendMessage";
        var payload = new { chat_id = chatId, text = text, parse_mode = "HTML" };

        try
        {
            await _httpClient.PostAsJsonAsync(url, payload, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Telegramga xabar yuborishda xato.");
        }
    }

    public async Task<List<TelegramUpdate>> GetUpdatesAsync(long offset, CancellationToken ct = default)
    {
        try
        {
            var url = $"https://api.telegram.org/bot{_telegramOptions.BotToken}/getUpdates?offset={offset}&timeout=30";
            var response = await _httpClient.GetFromJsonAsync<TelegramApiResponse<List<TelegramUpdate>>>(url, ct);
            return response?.Result ?? new List<TelegramUpdate>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Polling xatosi: {Msg}", ex.Message);
            return new List<TelegramUpdate>();
        }
    }
}