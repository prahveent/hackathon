using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public class ProductImage
{
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    [Required]
    [MaxLength(255)]
    public string ImageUrl { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string AltText { get; set; } = string.Empty;
    
    public int DisplayOrder { get; set; } = 0;
    
    public bool IsMain { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
