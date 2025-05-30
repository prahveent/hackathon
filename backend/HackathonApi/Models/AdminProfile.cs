using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public enum PermissionLevel
{
    Staff,
    Manager,
    SuperAdmin
}

public class AdminProfile
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    public PermissionLevel PermissionsLevel { get; set; } = PermissionLevel.Staff;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
} 