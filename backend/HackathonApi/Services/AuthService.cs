using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.Models.Dto;

namespace HackathonApi.Services;

public class AuthService
{
    private readonly HackathonDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        HackathonDbContext context,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return null; // User not found
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null; // Invalid password
        }

        if (!user.IsActive)
        {
            return null; // Account disabled
        }

        // Update last login time
        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiration = DateTime.UtcNow.AddDays(7);

        // Create session record
        var session = new UserSession
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = expiration,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent()
        };

        _context.UserSessions.Add(session);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiration,
            User = MapUserToDto(user)
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("Email is already in use");
        }

        // Create new user
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            City = request.City,
            PostalCode = request.PostalCode,
            Country = request.Country,
            Role = UserRole.Customer, // Default role for new registrations
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiration = DateTime.UtcNow.AddDays(7);

        // Create session record
        var session = new UserSession
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = expiration,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent()
        };

        _context.UserSessions.Add(session);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiration,
            User = MapUserToDto(user)
        };
    }

    public async Task<bool> LogoutAsync(string token)
    {
        var session = await _context.UserSessions
            .FirstOrDefaultAsync(s => s.Token == token && s.IsActive);

        if (session == null)
        {
            return false;
        }

        session.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetCurrentUserAsync(HttpContext httpContext)
    {
        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
        {
            return null;
        }
        
        return await _context.Users.FindAsync(id);
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"] ?? throw new InvalidOperationException("JWT:Secret not configured"));
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["JWT:Issuer"],
            Audience = _configuration["JWT:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private UserDto MapUserToDto(User user)
    {
        return new UserDto
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
        };
    }

    private string? GetClientIpAddress()
    {
        return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString();
    }
}
