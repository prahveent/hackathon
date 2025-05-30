using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonApi.Models;

public enum ProductStatus
{
    Draft,
    Active,
    Inactive,
    OutOfStock
}

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(2000)]
    public string? DetailedDescription { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? OriginalPrice { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    public int StockQuantity { get; set; } = 0;
    
    public int LowStockThreshold { get; set; } = 10;
    
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    
    [MaxLength(255)]
    public string? MainImageUrl { get; set; }
    
    public double Rating { get; set; } = 0;
    
    public int ReviewCount { get; set; } = 0;
    
    public int ViewCount { get; set; } = 0;
    
    public bool IsFeatured { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign Keys
    public int CategoryId { get; set; }
    
    public int? BrandId { get; set; }
    
    // Navigation properties
    public virtual Category Category { get; set; } = null!;
    
    public virtual Brand? Brand { get; set; }
    
    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    
    public virtual ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();
    
    // Computed properties
    public bool IsOnSale => OriginalPrice.HasValue && OriginalPrice > Price;
    
    public decimal? DiscountPercentage => OriginalPrice.HasValue && OriginalPrice > 0 
        ? Math.Round(((OriginalPrice.Value - Price) / OriginalPrice.Value) * 100, 2) 
        : null;
    
    public bool IsInStock => StockQuantity > 0;
    
    public bool IsLowStock => StockQuantity <= LowStockThreshold && StockQuantity > 0;
} 