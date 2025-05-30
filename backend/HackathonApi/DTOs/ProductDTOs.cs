namespace HackathonApi.DTOs;

public class ProductSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string? MainImageUrl { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsOnSale { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public bool IsInStock { get; set; }
    public bool IsFeatured { get; set; }
    public CategorySummaryDto Category { get; set; } = new();
    public BrandSummaryDto? Brand { get; set; }
}

public class ProductDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DetailedDescription { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? MainImageUrl { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int ViewCount { get; set; }
    public bool IsOnSale { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public bool IsInStock { get; set; }
    public bool IsLowStock { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public CategoryDetailDto Category { get; set; } = new();
    public BrandDetailDto? Brand { get; set; }
    public List<ProductImageDto> ProductImages { get; set; } = new();
    public List<ProductAttributeDto> ProductAttributes { get; set; } = new();
}

public class CategorySummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class CategoryDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public int ProductCount { get; set; }
}

public class BrandSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}

public class BrandDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsMain { get; set; }
}

public class ProductAttributeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class ProductSearchRequestDto
{
    public string? Query { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? OnSale { get; set; }
    public bool? InStock { get; set; }
    public bool? Featured { get; set; }
    public string SortBy { get; set; } = "name";
    public string SortDirection { get; set; } = "asc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class ProductSearchResponseDto
{
    public List<ProductSummaryDto> Products { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
    public List<CategorySummaryDto> AvailableCategories { get; set; } = new();
    public List<BrandSummaryDto> AvailableBrands { get; set; } = new();
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
} 