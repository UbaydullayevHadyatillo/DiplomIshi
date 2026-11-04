using Auth.Api.Common;
using Auth.Api.Data;
using Auth.Api.Dtos.Identity;
using Auth.Api.Models.Identity;
using Auth.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Auth.Api.Services;

public class AuthService
{
    private readonly AppDbContext _dbContext;
    private readonly JwtService _jwtService;
    private readonly OtpService _otpService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly TelegramBotService _telegramBotService;
    private readonly TelegramOptions _telegramOptions;

    public AuthService(
        AppDbContext dbContext,
        JwtService jwtService,
        OtpService otpService,
        RefreshTokenService refreshTokenService,
        TelegramBotService telegramBotService,
        IOptions<TelegramOptions> telegramOptions)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
        _otpService = otpService;
        _refreshTokenService = refreshTokenService;
        _telegramBotService = telegramBotService;
        _telegramOptions = telegramOptions.Value;
    }

    public async Task<AppUser?> FindByIdAsync(string userId)
    {
        if (int.TryParse(userId, out int id))
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        }
        return null;
    }

    public async Task<IList<string>> GetRolesAsync(AppUser user)
    {
        return await Task.FromResult(new List<string> { user.Role ?? "User" });
    }

    public async Task<ServiceResult<string>> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
    {
        if (await _dbContext.Users.AnyAsync(x => x.UserName == dto.UserName || x.PhoneNumber == dto.PhoneNumber, ct))
            return new ServiceResult<string>(false, "Username yoki telefon band.");

        var linkCode = _otpService.GenerateLinkCode(12);
        var user = new AppUser
        {
            FullName = dto.FullName.Trim(),
            UserName = dto.UserName.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            TelegramLinkCode = linkCode,
            LinkCodeExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IsActive = true,
            Role = "User"
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(ct);

        return new ServiceResult<string>(true, "Muvaffaqiyatli", $"https://t.me/{_telegramOptions.BotUserName}?start={linkCode}");
    }

    public async Task<ServiceResult> RequestLoginCodeAsync(RequestCodeDto dto, CancellationToken ct = default)
    {
        var user = await FindUserByIdentifierAsync(dto.Identifier, ct);
        if (user == null || !user.IsTelegramVerified || user.TelegramChatId == null)
            return new ServiceResult(false, "Foydalanuvchi topilmadi yoki Telegram ulanmagan.");

        var (plainCode, _) = await _otpService.CreateLoginCodeAsync(user, ct);
        await _telegramBotService.SendMessageAsync(user.TelegramChatId.Value, $"Kod: {plainCode}", ct);
        return new ServiceResult(true, "Kod yuborildi.");
    }

    public async Task<ServiceResult<AuthResponseDto>> VerifyCodeAsync(VerifyCodeDto dto, CancellationToken ct = default)
    {
        var user = await FindUserByIdentifierAsync(dto.Identifier, ct);
        if (user == null) return new ServiceResult<AuthResponseDto>(false, "Foydalanuvchi topilmadi.");

        var verified = await _otpService.VerifyLoginCodeAsync(user, dto.Code, ct);
        if (!verified) return new ServiceResult<AuthResponseDto>(false, "Kod xato.");

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = await _refreshTokenService.CreateAsync(user, ct);

        return new ServiceResult<AuthResponseDto>(true, "Ok", new AuthResponseDto
        {
            AccessToken = accessToken.Token,
            AccessTokenExpiresAt = accessToken.ExpiresAt,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt,
            UserName = user.UserName,
            FullName = user.FullName,
            Role = user.Role
        });
    }

    public async Task<ServiceResult<AuthResponseDto>> RefreshAsync(RefreshTokenRequestDto dto, CancellationToken ct = default)
    {
        var token = await _refreshTokenService.GetByTokenAsync(dto.RefreshToken, ct);
        if (token == null || !token.IsActive) return new ServiceResult<AuthResponseDto>(false, "Xato.");

        var newRefreshToken = await _refreshTokenService.RotateAsync(token, ct);
        var newAccessToken = _jwtService.GenerateAccessToken(token.User);

        return new ServiceResult<AuthResponseDto>(true, "Ok", new AuthResponseDto
        {
            AccessToken = newAccessToken.Token,
            AccessTokenExpiresAt = newAccessToken.ExpiresAt,
            RefreshToken = newRefreshToken.Token,
            RefreshTokenExpiresAt = newRefreshToken.ExpiresAt, 
            UserName = token.User.UserName,
            Role = token.User.Role
        });
    }

    public async Task<ServiceResult> LogoutAsync(LogoutDto dto, CancellationToken ct = default)
    {
        var token = await _refreshTokenService.GetByTokenAsync(dto.RefreshToken, ct);
        if (token != null) await _refreshTokenService.RevokeAsync(token, "Logout", cancellationToken: ct);
        return new ServiceResult(true, "Chiqildi.");
    }

    public async Task<ServiceResult<TelegramLinkResponseDto>> CreateLinkRequestAsync(RequestLinkDto dto, CancellationToken ct = default)
    {
        var user = await FindUserByIdentifierAsync(dto.Identifier, ct);
        if (user is null) return new ServiceResult<TelegramLinkResponseDto>(false, "Foydalanuvchi topilmadi.");

        var linkCode = _otpService.GenerateLinkCode(12);
        user.TelegramLinkCode = linkCode;
        user.LinkCodeExpiresAt = DateTime.UtcNow.AddMinutes(15);
        await _dbContext.SaveChangesAsync(ct);

        return new ServiceResult<TelegramLinkResponseDto>(true, "Link yaratildi.", new TelegramLinkResponseDto
        {
            LinkCode = linkCode,
            BotUserName = _telegramOptions.BotUserName,
            ExpiresAt = user.LinkCodeExpiresAt
        });
    }

    public async Task<ServiceResult> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return new ServiceResult(false, "Foydalanuvchi topilmadi.");

        if (user.UserName != dto.UserName.Trim())
        {
            var exists = await _dbContext.Users.AnyAsync(u => u.UserName == dto.UserName.Trim() && u.Id != userId, ct);
            if (exists) return new ServiceResult(false, "Bu Username allaqachon band.");
        }

        user.FullName = dto.FullName.Trim();
        user.UserName = dto.UserName.Trim();
        user.PhoneNumber = dto.PhoneNumber.Trim();

        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(ct);

        return new ServiceResult(true, "Ma'lumotlar muvaffaqiyatli yangilandi.");
    }

    private async Task<AppUser?> FindUserByIdentifierAsync(string identifier, CancellationToken ct) =>
        await _dbContext.Users.FirstOrDefaultAsync(x => x.UserName == identifier || x.PhoneNumber == identifier, ct);
}