using System.Security.Claims;

namespace HackathonApi.Services;

public interface IJwtService
{
    string GenerateToken(int userId, string email, List<string> roles);
    ClaimsPrincipal? ValidateToken(string token);
    int GetUserIdFromToken(string token);
} 