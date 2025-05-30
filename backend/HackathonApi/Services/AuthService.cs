using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.DTOs;

namespace HackathonApi.Services;

public class AuthService : IAuthService
{
    private readonly HackathonDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public AuthService(HackathonDbContext context, IPasswordService passwordService, IJwtService jwtService)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<ApiResponse<LoginResponse>> RegisterCustomerAsync(RegisterCustomerRequest request)
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "User with this email already exists",
                    Errors = new List<string> { "Email already registered" }
                };
            }

            // Create user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                IsActive = true,
                EmailVerified = false // In a real app, you'd send verification email
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Get customer role
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "customer");
            if (customerRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = customerRole.Id
                };
                _context.UserRoles.Add(userRole);
            }

            // Create customer profile
            var customerProfile = new CustomerProfile
            {
                UserId = user.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                DateOfBirth = request.DateOfBirth
            };

            _context.CustomerProfiles.Add(customerProfile);
            await _context.SaveChangesAsync();

            // Generate token and create login response
            var roles = new List<string> { "customer" };
            var token = _jwtService.GenerateToken(user.Id, user.Email, roles);
            var expiresAt = DateTime.UtcNow.AddHours(24);

            // Create user session
            var session = new UserSession
            {
                UserId = user.Id,
                SessionToken = Guid.NewGuid().ToString(),
                ExpiresAt = expiresAt,
                IsActive = true
            };
            _context.UserSessions.Add(session);

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var userInfo = await GetUserInfoResponse(user.Id);

            return new ApiResponse<LoginResponse>
            {
                Success = true,
                Message = "Customer registered successfully",
                Data = new LoginResponse
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = userInfo
                }
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Registration failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse<LoginResponse>> RegisterAdminAsync(RegisterAdminRequest request)
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "User with this email already exists",
                    Errors = new List<string> { "Email already registered" }
                };
            }

            // Create user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                IsActive = true,
                EmailVerified = true // Admins are auto-verified
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Get admin role
            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "admin");
            if (adminRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = adminRole.Id
                };
                _context.UserRoles.Add(userRole);
            }

            // Parse permission level
            Enum.TryParse<PermissionLevel>(request.PermissionsLevel, out var permissionLevel);

            // Create admin profile
            var adminProfile = new AdminProfile
            {
                UserId = user.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Department = request.Department,
                PermissionsLevel = permissionLevel
            };

            _context.AdminProfiles.Add(adminProfile);
            await _context.SaveChangesAsync();

            // Generate token and create login response
            var roles = new List<string> { "admin" };
            var token = _jwtService.GenerateToken(user.Id, user.Email, roles);
            var expiresAt = DateTime.UtcNow.AddHours(24);

            // Create user session
            var session = new UserSession
            {
                UserId = user.Id,
                SessionToken = Guid.NewGuid().ToString(),
                ExpiresAt = expiresAt,
                IsActive = true
            };
            _context.UserSessions.Add(session);

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var userInfo = await GetUserInfoResponse(user.Id);

            return new ApiResponse<LoginResponse>
            {
                Success = true,
                Message = "Admin registered successfully",
                Data = new LoginResponse
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = userInfo
                }
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Registration failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        try
        {
            // Find user by email
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !user.IsActive)
            {
                return new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Invalid email or password",
                    Errors = new List<string> { "Authentication failed" }
                };
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Invalid email or password",
                    Errors = new List<string> { "Authentication failed" }
                };
            }

            // Get user roles
            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

            // Generate token
            var token = _jwtService.GenerateToken(user.Id, user.Email, roles);
            var expiresAt = DateTime.UtcNow.AddHours(24);

            // Create user session
            var session = new UserSession
            {
                UserId = user.Id,
                SessionToken = Guid.NewGuid().ToString(),
                ExpiresAt = expiresAt,
                IsActive = true
            };
            _context.UserSessions.Add(session);

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var userInfo = await GetUserInfoResponse(user.Id);

            return new ApiResponse<LoginResponse>
            {
                Success = true,
                Message = "Login successful",
                Data = new LoginResponse
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = userInfo
                }
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Login failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse<UserInfoResponse>> GetUserInfoAsync(int userId)
    {
        try
        {
            var userInfo = await GetUserInfoResponse(userId);
            
            if (userInfo == null)
            {
                return new ApiResponse<UserInfoResponse>
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            return new ApiResponse<UserInfoResponse>
            {
                Success = true,
                Message = "User info retrieved successfully",
                Data = userInfo
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<UserInfoResponse>
            {
                Success = false,
                Message = "Failed to get user info",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Current password is incorrect"
                };
            }

            // Update password
            user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ApiResponse
            {
                Success = true,
                Message = "Password changed successfully"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Password change failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                // Don't reveal if email exists
                return new ApiResponse
                {
                    Success = true,
                    Message = "If the email exists, a reset link has been sent"
                };
            }

            // Create password reset token
            var resetToken = Guid.NewGuid().ToString();
            var passwordReset = new PasswordReset
            {
                UserId = user.Id,
                Token = resetToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1) // 1 hour expiry
            };

            _context.PasswordResets.Add(passwordReset);
            await _context.SaveChangesAsync();

            // TODO: Send email with reset link in a real application
            // For now, just return success

            return new ApiResponse
            {
                Success = true,
                Message = "If the email exists, a reset link has been sent"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Password reset request failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            var passwordReset = await _context.PasswordResets
                .Include(pr => pr.User)
                .FirstOrDefaultAsync(pr => pr.Token == request.Token && pr.UsedAt == null);

            if (passwordReset == null || passwordReset.ExpiresAt < DateTime.UtcNow)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Invalid or expired reset token"
                };
            }

            // Update password
            passwordReset.User.PasswordHash = _passwordService.HashPassword(request.NewPassword);
            passwordReset.User.UpdatedAt = DateTime.UtcNow;
            passwordReset.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ApiResponse
            {
                Success = true,
                Message = "Password reset successfully"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Password reset failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<ApiResponse> LogoutAsync(int userId, string sessionToken)
    {
        try
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionToken == sessionToken);

            if (session != null)
            {
                session.IsActive = false;
                await _context.SaveChangesAsync();
            }

            return new ApiResponse
            {
                Success = true,
                Message = "Logged out successfully"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Logout failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    private async Task<UserInfoResponse> GetUserInfoResponse(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Include(u => u.CustomerProfile)
            .Include(u => u.AdminProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        var userInfo = new UserInfoResponse
        {
            Id = user.Id,
            Email = user.Email,
            EmailVerified = user.EmailVerified,
            LastLogin = user.LastLogin,
            Roles = roles
        };

        if (user.CustomerProfile != null)
        {
            userInfo.CustomerProfile = new CustomerProfileResponse
            {
                FirstName = user.CustomerProfile.FirstName,
                LastName = user.CustomerProfile.LastName,
                Phone = user.CustomerProfile.Phone,
                DateOfBirth = user.CustomerProfile.DateOfBirth
            };
        }

        if (user.AdminProfile != null)
        {
            userInfo.AdminProfile = new AdminProfileResponse
            {
                FirstName = user.AdminProfile.FirstName,
                LastName = user.AdminProfile.LastName,
                Department = user.AdminProfile.Department,
                PermissionsLevel = user.AdminProfile.PermissionsLevel.ToString()
            };
        }

        return userInfo;
    }
} 