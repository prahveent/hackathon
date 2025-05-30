using Microsoft.AspNetCore.Authorization;
using HackathonApi.Models;

namespace HackathonApi.Attributes;

public class AuthorizeRolesAttribute : AuthorizeAttribute
{
    public AuthorizeRolesAttribute(params UserRole[] roles)
    {
        var rolesString = roles.Select(r => r.ToString());
        Roles = string.Join(",", rolesString);
    }
}
