namespace HackathonApi.Models;

/// <summary>
/// Represents the different roles a user can have in the system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Standard customer role with basic access
    /// </summary>
    Customer = 0,
    
    /// <summary>
    /// Administrator role with full system access
    /// </summary>
    Administrator = 1
}