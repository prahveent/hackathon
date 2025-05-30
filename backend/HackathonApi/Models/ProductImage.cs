using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public class ProductImage
{
    public int Id { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string ImageUrl { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? AltText { get; set; }
    
    public int DisplayOrder { get; set; } = 0;
    
    public bool IsMain { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Product Product { get; set; } = null!;
} 