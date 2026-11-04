using Auth.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Services;

public class TelegramUpdateProcessor
{
    private readonly AppDbContext _dbContext;
    private readonly TelegramBotService _telegramBotService;
    private readonly ILogger<TelegramUpdateProcessor> _logger;

    public TelegramUpdateProcessor(
        AppDbContext dbContext,
        TelegramBotService telegramBotService,
        ILogger<TelegramUpdateProcessor> logger)
    {
        _dbContext = dbContext;
        _telegramBotService = telegramBotService;
        _logger = logger;
    }

    public async Task ProcessAsync(TelegramUpdate update, CancellationToken ct = default)
    {
        if (update.Message?.Text == null || update.Message?.Chat == null) return;

        var text = update.Message.Text.Trim();
        var chatId = update.Message.Chat.Id;

        if (text.StartsWith("/start", StringComparison.OrdinalIgnoreCase))
        {
            var parts = text.Split(' ');
            if (parts.Length > 1)
            {
                var code = parts[1];
                await HandleLinkingAsync(chatId, code, ct);
            }
            else
            {
                await _telegramBotService.SendMessageAsync(chatId,
                    "👋 <b>Assalomu alaykum!</b>\n\nBotga ulanish uchun saytdan ro'yxatdan o'ting.", ct);
            }
        }
    }

    private async Task HandleLinkingAsync(long chatId, string code, CancellationToken ct)
    {
        // 1. Kelgan kodni tozalaymiz va katta harfga o'tkazamiz
        var cleanCode = code.Trim().ToUpper();
        _logger.LogInformation("Botga kelgan tozalangan kod: {Code}", cleanCode);

        // 2. Bazadan qidirishda ham katta-kichik harfni inobatga olmaymiz (ILike o'xshash mantiq)
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.TelegramLinkCode != null &&
                                      u.TelegramLinkCode.ToUpper() == cleanCode, ct);

        if (user == null)
        {
            await _telegramBotService.SendMessageAsync(chatId,
                $"❌ <b>Xatolik:</b> Kod topilmadi.\nKelgan kod: <code>{cleanCode}</code>\n\nIltimos, saytdan qaytadan ro'yxatdan o'ting.", ct);
            return;
        }

        // 3. Vaqtni tekshirish (Toshkent vaqti bilan ziddiyat bo'lmasligi uchun 5 soat qo'shamiz yoki Now ishlatamiz)
        var now = DateTime.UtcNow;
        if (user.LinkCodeExpiresAt < now)
        {
            await _telegramBotService.SendMessageAsync(chatId, "❌ <b>Havola muddati o'tgan!</b>", ct);
            return;
        }

        // 4. Bog'lash jarayoni
        user.TelegramChatId = chatId;
        user.IsTelegramVerified = true;
        user.TelegramLinkCode = null; // Ishlatib bo'lingach o'chiramiz

        await _dbContext.SaveChangesAsync(ct);

        await _telegramBotService.SendMessageAsync(chatId,
            $"✅ <b>Tabriklaymiz, {user.FullName}!</b>\n\nAkkauntingiz muvaffaqiyatli bog'landi.", ct);
    }
}