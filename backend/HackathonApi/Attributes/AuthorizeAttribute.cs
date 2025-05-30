using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using HackathonApi.Models;

namespace HackathonApi.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeAttribute : Attribute, IAuthorizationFilter
{
    private readonly UserRole[]? _roles;

    public AuthorizeAttribute(params UserRole[] roles)
    {
        _roles = roles?.Length > 0 ? roles : null;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Skip authorization if action is decorated with [AllowAnonymous] attribute
        var allowAnonymous = context.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any();
        if (allowAnonymous)
            return;

        // Check if user is authenticated
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new JsonResult(new { message = "Unauthorized" }) { StatusCode = StatusCodes.Status401Unauthorized };
            return;
        }

        // Check if specific roles are required
        if (_roles != null && _roles.Length > 0)
        {
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(userRole) || !Enum.TryParse<UserRole>(userRole, out var role) || !_roles.Contains(role))
            {
                context.Result = new JsonResult(new { message = "Insufficient permissions" }) { StatusCode = StatusCodes.Status403Forbidden };
                return;
            }
        }
    }
}

[AttributeUsage(AttributeTargets.Method)]
public class AllowAnonymousAttribute : Attribute
{
}
