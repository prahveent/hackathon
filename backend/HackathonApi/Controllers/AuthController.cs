using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HackathonApi.Models.Dto;
using HackathonApi.Services;

namespace HackathonApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }
        
        return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = GetTokenFromRequest();
        
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { message = "Invalid token" });
        }
        
        var success = await _authService.LogoutAsync(token);
        
        if (!success)
        {
            return BadRequest(new { message = "Logout failed" });
        }
        
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var user = await _authService.GetCurrentUserAsync(HttpContext);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            City = user.City,
            PostalCode = user.PostalCode,
            Country = user.Country,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt
        });
    }

    private string? GetTokenFromRequest()
    {
        var authorization = HttpContext.Request.Headers.Authorization.ToString();
        
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }
        
        return authorization.Substring("Bearer ".Length).Trim();
    }
}
