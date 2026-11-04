using Auth.Api.Dtos.Identity;
using Auth.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Auth.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterDto dto, CancellationToken ct)
    {
        var result = await _authService.RegisterAsync(dto, ct);
        return result.Succeeded ? Ok(new { message = result.Message, botLink = result.Data }) : BadRequest(result.Message);
    }

    [HttpPost("request-link")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestLink(RequestLinkDto dto, CancellationToken ct)
    {
        var result = await _authService.CreateLinkRequestAsync(dto, ct);
        if (!result.Succeeded) return BadRequest(result.Message);

        return Ok(new
        {
            message = result.Message,
            botLink = $"https://t.me/{result.Data?.BotUserName}?start={result.Data?.LinkCode}"
        });
    }

    [HttpPost("request-code")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestCode(RequestCodeDto dto, CancellationToken ct)
    {
        var result = await _authService.RequestLoginCodeAsync(dto, ct);
        return result.Succeeded ? Ok(new { message = result.Message }) : BadRequest(result.Message);
    }

    [HttpPost("verify-code")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyCode(VerifyCodeDto dto, CancellationToken ct)
    {
        var result = await _authService.VerifyCodeAsync(dto, ct);
        return result.Succeeded ? Ok(result.Data) : Unauthorized(result.Message);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(RefreshTokenRequestDto dto, CancellationToken ct)
    {
        var result = await _authService.RefreshAsync(dto, ct);
        return result.Succeeded ? Ok(result.Data) : Unauthorized(result.Message);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutDto dto, CancellationToken ct)
    {
        var result = await _authService.LogoutAsync(dto, ct);
        return result.Succeeded ? Ok(new { message = result.Message }) : BadRequest(result.Message);
    }

    [HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Foydalanuvchi aniqlanmadi" });

        var user = await _authService.FindByIdAsync(userId);

        if (user == null)
            return NotFound(new { message = "Foydalanuvchi topilmadi" });

        return Ok(new
        {
            userId = user.Id,
            userName = user.UserName,
            fullName = user.FullName,
            phoneNumber = user.PhoneNumber,
            role = (await _authService.GetRolesAsync(user)).FirstOrDefault() ?? "User"
        });
    }

    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized(new { message = "Foydalanuvchi aniqlanmadi" });

        var result = await _authService.UpdateProfileAsync(userId, dto, ct);

        if (!result.Succeeded) return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}