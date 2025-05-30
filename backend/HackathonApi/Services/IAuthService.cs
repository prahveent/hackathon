using HackathonApi.DTOs;

namespace HackathonApi.Services;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> RegisterCustomerAsync(RegisterCustomerRequest request);
    Task<ApiResponse<LoginResponse>> RegisterAdminAsync(RegisterAdminRequest request);
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserInfoResponse>> GetUserInfoAsync(int userId);
    Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<ApiResponse> ResetPasswordAsync(ResetPasswordRequest request);
    Task<ApiResponse> LogoutAsync(int userId, string sessionToken);
} 