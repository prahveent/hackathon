using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public class Brand
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(255)]
    public string? LogoUrl { get; set; }
    
    [MaxLength(255)]
    public string? Website { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
} 