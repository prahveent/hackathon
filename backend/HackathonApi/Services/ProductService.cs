using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.DTOs;

namespace HackathonApi.Services;

public interface IProductService
{
    Task<ProductSearchResponseDto> SearchProductsAsync(ProductSearchRequestDto request);
    Task<ProductDetailDto?> GetProductByIdAsync(int id);
    Task<List<CategoryDetailDto>> GetCategoriesAsync();
    Task<List<BrandDetailDto>> GetBrandsAsync();
    Task<List<ProductSummaryDto>> GetFeaturedProductsAsync(int count = 8);
    Task IncrementViewCountAsync(int productId);
}

public class ProductService : IProductService
{
    private readonly HackathonDbContext _context;

    public ProductService(HackathonDbContext context)
    {
        _context = context;
    }

    public async Task<ProductSearchResponseDto> SearchProductsAsync(ProductSearchRequestDto request)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.ProductImages)
            .Where(p => p.Status == ProductStatus.Active);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.Description!.ToLower().Contains(searchTerm) ||
                p.Category.Name.ToLower().Contains(searchTerm) ||
                (p.Brand != null && p.Brand.Name.ToLower().Contains(searchTerm)));
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (request.BrandId.HasValue)
        {
            query = query.Where(p => p.BrandId == request.BrandId.Value);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }

        if (request.OnSale == true)
        {
            query = query.Where(p => p.OriginalPrice.HasValue && p.OriginalPrice > p.Price);
        }

        if (request.InStock == true)
        {
            query = query.Where(p => p.StockQuantity > 0);
        }

        if (request.Featured == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        // Apply sorting
        query = request.SortBy.ToLower() switch
        {
            "price" => request.SortDirection.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Price)
                : query.OrderBy(p => p.Price),
            "rating" => request.SortDirection.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Rating)
                : query.OrderBy(p => p.Rating),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "popularity" => query.OrderByDescending(p => p.ViewCount),
            _ => request.SortDirection.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var products = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                OriginalPrice = p.OriginalPrice,
                MainImageUrl = p.MainImageUrl,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                IsOnSale = p.IsOnSale,
                DiscountPercentage = p.DiscountPercentage,
                IsInStock = p.IsInStock,
                IsFeatured = p.IsFeatured,
                Category = new CategorySummaryDto
                {
                    Id = p.Category.Id,
                    Name = p.Category.Name,
                    ImageUrl = p.Category.ImageUrl
                },
                Brand = p.Brand != null ? new BrandSummaryDto
                {
                    Id = p.Brand.Id,
                    Name = p.Brand.Name,
                    LogoUrl = p.Brand.LogoUrl
                } : null
            })
            .ToListAsync();

        // Get available categories and brands for filters
        var availableCategories = await _context.Categories
            .Where(c => c.IsActive && c.Products.Any(p => p.Status == ProductStatus.Active))
            .Select(c => new CategorySummaryDto
            {
                Id = c.Id,
                Name = c.Name,
                ImageUrl = c.ImageUrl
            })
            .OrderBy(c => c.Name)
            .ToListAsync();

        var availableBrands = await _context.Brands
            .Where(b => b.IsActive && b.Products.Any(p => p.Status == ProductStatus.Active))
            .Select(b => new BrandSummaryDto
            {
                Id = b.Id,
                Name = b.Name,
                LogoUrl = b.LogoUrl
            })
            .OrderBy(b => b.Name)
            .ToListAsync();

        // Get price range
        var priceRange = await _context.Products
            .Where(p => p.Status == ProductStatus.Active)
            .GroupBy(p => 1)
            .Select(g => new { MinPrice = g.Min(p => p.Price), MaxPrice = g.Max(p => p.Price) })
            .FirstOrDefaultAsync();

        return new ProductSearchResponseDto
        {
            Products = products,
            TotalCount = totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasPreviousPage = request.Page > 1,
            HasNextPage = request.Page < totalPages,
            AvailableCategories = availableCategories,
            AvailableBrands = availableBrands,
            MinPrice = priceRange?.MinPrice,
            MaxPrice = priceRange?.MaxPrice
        };
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.ProductImages.OrderBy(pi => pi.DisplayOrder))
            .Include(p => p.ProductAttributes.OrderBy(pa => pa.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id && p.Status == ProductStatus.Active);

        if (product == null)
            return null;

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            DetailedDescription = product.DetailedDescription,
            Price = product.Price,
            OriginalPrice = product.OriginalPrice,
            SKU = product.SKU,
            StockQuantity = product.StockQuantity,
            Status = product.Status.ToString(),
            MainImageUrl = product.MainImageUrl,
            Rating = product.Rating,
            ReviewCount = product.ReviewCount,
            ViewCount = product.ViewCount,
            IsOnSale = product.IsOnSale,
            DiscountPercentage = product.DiscountPercentage,
            IsInStock = product.IsInStock,
            IsLowStock = product.IsLowStock,
            IsFeatured = product.IsFeatured,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            Category = new CategoryDetailDto
            {
                Id = product.Category.Id,
                Name = product.Category.Name,
                Description = product.Category.Description,
                ImageUrl = product.Category.ImageUrl,
                IsActive = product.Category.IsActive,
                DisplayOrder = product.Category.DisplayOrder,
                ProductCount = await _context.Products.CountAsync(p => p.CategoryId == product.Category.Id && p.Status == ProductStatus.Active)
            },
            Brand = product.Brand != null ? new BrandDetailDto
            {
                Id = product.Brand.Id,
                Name = product.Brand.Name,
                Description = product.Brand.Description,
                LogoUrl = product.Brand.LogoUrl,
                Website = product.Brand.Website,
                IsActive = product.Brand.IsActive,
                ProductCount = await _context.Products.CountAsync(p => p.BrandId == product.Brand.Id && p.Status == ProductStatus.Active)
            } : null,
            ProductImages = product.ProductImages.Select(pi => new ProductImageDto
            {
                Id = pi.Id,
                ImageUrl = pi.ImageUrl,
                AltText = pi.AltText,
                DisplayOrder = pi.DisplayOrder,
                IsMain = pi.IsMain
            }).ToList(),
            ProductAttributes = product.ProductAttributes.Select(pa => new ProductAttributeDto
            {
                Id = pa.Id,
                Name = pa.Name,
                Value = pa.Value,
                DisplayOrder = pa.DisplayOrder
            }).ToList()
        };
    }

    public async Task<List<CategoryDetailDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDetailDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                ProductCount = c.Products.Count(p => p.Status == ProductStatus.Active)
            })
            .ToListAsync();
    }

    public async Task<List<BrandDetailDto>> GetBrandsAsync()
    {
        return await _context.Brands
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new BrandDetailDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                LogoUrl = b.LogoUrl,
                Website = b.Website,
                IsActive = b.IsActive,
                ProductCount = b.Products.Count(p => p.Status == ProductStatus.Active)
            })
            .ToListAsync();
    }

    public async Task<List<ProductSummaryDto>> GetFeaturedProductsAsync(int count = 8)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.Status == ProductStatus.Active && p.IsFeatured)
            .OrderByDescending(p => p.Rating)
            .ThenByDescending(p => p.ViewCount)
            .Take(count)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                OriginalPrice = p.OriginalPrice,
                MainImageUrl = p.MainImageUrl,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                IsOnSale = p.IsOnSale,
                DiscountPercentage = p.DiscountPercentage,
                IsInStock = p.IsInStock,
                IsFeatured = p.IsFeatured,
                Category = new CategorySummaryDto
                {
                    Id = p.Category.Id,
                    Name = p.Category.Name,
                    ImageUrl = p.Category.ImageUrl
                },
                Brand = p.Brand != null ? new BrandSummaryDto
                {
                    Id = p.Brand.Id,
                    Name = p.Brand.Name,
                    LogoUrl = p.Brand.LogoUrl
                } : null
            })
            .ToListAsync();
    }

    public async Task IncrementViewCountAsync(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product != null)
        {
            product.ViewCount++;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
} 