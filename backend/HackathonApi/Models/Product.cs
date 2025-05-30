using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonApi.Models;

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? CompareAtPrice { get; set; }
    
    public int StockQuantity { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public bool IsFeatured { get; set; } = false;
    
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    
    public int? BrandId { get; set; }
    public Brand? Brand { get; set; }
    
    [MaxLength(255)]
    public string MainImageUrl { get; set; } = string.Empty;
    
    public double Weight { get; set; } = 0;
    
    [MaxLength(100)]
    public string WeightUnit { get; set; } = "kg";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
