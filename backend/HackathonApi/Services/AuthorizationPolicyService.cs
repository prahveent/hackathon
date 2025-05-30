using Microsoft.AspNetCore.Authorization;

namespace HackathonApi.Services;

public static class AuthorizationPolicyService
{
    public static void AddAuthorizationPolicies(AuthorizationOptions options)
    {
        // Policy for Administrators only
        options.AddPolicy("AdminOnly", policy =>
        {
            policy.RequireRole("Administrator");
        });
        
        // Policy for Customers only
        options.AddPolicy("CustomerOnly", policy =>
        {
            policy.RequireRole("Customer");
        });
    }
}
