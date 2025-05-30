using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.Models.DTOs;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly HackathonDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(HackathonDbContext context, ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null,
        [FromQuery] bool? isActive = true,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .AsQueryable();

            // Apply filters
            if (isActive.HasValue)
                query = query.Where(p => p.IsActive == isActive.Value);

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (brandId.HasValue)
                query = query.Where(p => p.BrandId == brandId.Value);

            if (isFeatured.HasValue)
                query = query.Where(p => p.IsFeatured == isFeatured.Value);

            // Apply pagination
            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                SKU = p.SKU,
                Price = p.Price,
                CompareAtPrice = p.CompareAtPrice,
                StockQuantity = p.StockQuantity,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name,
                BrandId = p.BrandId,
                BrandName = p.Brand?.Name,
                MainImageUrl = p.MainImageUrl,
                Weight = p.Weight,
                WeightUnit = p.WeightUnit,
                Images = p.Images?.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    AltText = img.AltText,
                    DisplayOrder = img.DisplayOrder,
                    IsMain = img.IsMain
                }).ToList() ?? new List<ProductImageDto>(),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(productDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products");
            return StatusCode(500, "An error occurred while retrieving products");
        }
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                SKU = product.SKU,
                Price = product.Price,
                CompareAtPrice = product.CompareAtPrice,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name,
                BrandId = product.BrandId,
                BrandName = product.Brand?.Name,
                MainImageUrl = product.MainImageUrl,
                Weight = product.Weight,
                WeightUnit = product.WeightUnit,
                Images = product.Images?.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    AltText = img.AltText,
                    DisplayOrder = img.DisplayOrder,
                    IsMain = img.IsMain
                }).ToList() ?? new List<ProductImageDto>(),
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };

            return Ok(productDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product with ID {ProductId}", id);
            return StatusCode(500, "An error occurred while retrieving the product");
        }
    }

    // POST: api/products
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
    {
        try
        {
            // Validate category exists if provided
            if (createProductDto.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories
                    .AnyAsync(c => c.Id == createProductDto.CategoryId.Value && c.IsActive);
                if (!categoryExists)
                {
                    return BadRequest("Invalid category ID");
                }
            }

            // Validate brand exists if provided
            if (createProductDto.BrandId.HasValue)
            {
                var brandExists = await _context.Brands
                    .AnyAsync(b => b.Id == createProductDto.BrandId.Value && b.IsActive);
                if (!brandExists)
                {
                    return BadRequest("Invalid brand ID");
                }
            }

            // Check if SKU already exists
            var skuExists = await _context.Products.AnyAsync(p => p.SKU == createProductDto.SKU);
            if (skuExists)
            {
                return BadRequest("A product with this SKU already exists");
            }

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                SKU = createProductDto.SKU,
                Price = createProductDto.Price,
                CompareAtPrice = createProductDto.CompareAtPrice,
                StockQuantity = createProductDto.StockQuantity,
                IsActive = createProductDto.IsActive,
                IsFeatured = createProductDto.IsFeatured,
                CategoryId = createProductDto.CategoryId,
                BrandId = createProductDto.BrandId,
                MainImageUrl = createProductDto.MainImageUrl,
                Weight = createProductDto.Weight,
                WeightUnit = createProductDto.WeightUnit,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Reload with related data
            await _context.Entry(product)
                .Reference(p => p.Category)
                .LoadAsync();
            await _context.Entry(product)
                .Reference(p => p.Brand)
                .LoadAsync();

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                SKU = product.SKU,
                Price = product.Price,
                CompareAtPrice = product.CompareAtPrice,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name,
                BrandId = product.BrandId,
                BrandName = product.Brand?.Name,
                MainImageUrl = product.MainImageUrl,
                Weight = product.Weight,
                WeightUnit = product.WeightUnit,
                Images = new List<ProductImageDto>(),
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return StatusCode(500, "An error occurred while creating the product");
        }
    }

    // PUT: api/products/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto updateProductDto)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            // Validate category exists if provided
            if (updateProductDto.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories
                    .AnyAsync(c => c.Id == updateProductDto.CategoryId.Value && c.IsActive);
                if (!categoryExists)
                {
                    return BadRequest("Invalid category ID");
                }
            }

            // Validate brand exists if provided
            if (updateProductDto.BrandId.HasValue)
            {
                var brandExists = await _context.Brands
                    .AnyAsync(b => b.Id == updateProductDto.BrandId.Value && b.IsActive);
                if (!brandExists)
                {
                    return BadRequest("Invalid brand ID");
                }
            }

            // Check if SKU already exists for another product
            if (updateProductDto.SKU != product.SKU)
            {
                var skuExists = await _context.Products
                    .AnyAsync(p => p.SKU == updateProductDto.SKU && p.Id != id);
                if (skuExists)
                {
                    return BadRequest("A product with this SKU already exists");
                }
            }

            // Update product properties
            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.SKU = updateProductDto.SKU;
            product.Price = updateProductDto.Price;
            product.CompareAtPrice = updateProductDto.CompareAtPrice;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.IsActive = updateProductDto.IsActive;
            product.IsFeatured = updateProductDto.IsFeatured;
            product.CategoryId = updateProductDto.CategoryId;
            product.BrandId = updateProductDto.BrandId;
            product.MainImageUrl = updateProductDto.MainImageUrl;
            product.Weight = updateProductDto.Weight;
            product.WeightUnit = updateProductDto.WeightUnit;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product with ID {ProductId}", id);
            return StatusCode(500, "An error occurred while updating the product");
        }
    }

    // DELETE: api/products/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product with ID {ProductId}", id);
            return StatusCode(500, "An error occurred while deleting the product");
        }
    }

    // GET: api/products/featured
    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeaturedProducts([FromQuery] int count = 10)
    {
        try
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Where(p => p.IsFeatured && p.IsActive)
                .Take(count)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                SKU = p.SKU,
                Price = p.Price,
                CompareAtPrice = p.CompareAtPrice,
                StockQuantity = p.StockQuantity,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name,
                BrandId = p.BrandId,
                BrandName = p.Brand?.Name,
                MainImageUrl = p.MainImageUrl,
                Weight = p.Weight,
                WeightUnit = p.WeightUnit,
                Images = p.Images?.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    AltText = img.AltText,
                    DisplayOrder = img.DisplayOrder,
                    IsMain = img.IsMain
                }).ToList() ?? new List<ProductImageDto>(),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            return Ok(productDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving featured products");
            return StatusCode(500, "An error occurred while retrieving featured products");
        }
    }
}
