using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
      [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    public int? TeamId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
