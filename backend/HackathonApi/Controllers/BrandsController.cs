using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.Models.DTOs;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly HackathonDbContext _context;
    private readonly ILogger<BrandsController> _logger;

    public BrandsController(HackathonDbContext context, ILogger<BrandsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/brands
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetBrands([FromQuery] bool includeInactive = false)
    {
        try
        {
            var query = _context.Brands.Include(b => b.Products).AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(b => b.IsActive);
            }

            var brands = await query
                .OrderBy(b => b.Name)
                .ToListAsync();

            var brandDtos = brands.Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                LogoUrl = b.LogoUrl,
                IsActive = b.IsActive,
                ProductCount = b.Products?.Count(p => p.IsActive) ?? 0,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            }).ToList();

            return Ok(brandDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving brands");
            return StatusCode(500, "An error occurred while retrieving brands");
        }
    }

    // GET: api/brands/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BrandDto>> GetBrand(int id)
    {
        try
        {
            var brand = await _context.Brands
                .Include(b => b.Products.Where(p => p.IsActive))
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brand == null)
            {
                return NotFound($"Brand with ID {id} not found");
            }

            var brandDto = new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description,
                LogoUrl = brand.LogoUrl,
                IsActive = brand.IsActive,
                ProductCount = brand.Products?.Count ?? 0,
                CreatedAt = brand.CreatedAt,
                UpdatedAt = brand.UpdatedAt
            };

            return Ok(brandDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving brand with ID {BrandId}", id);
            return StatusCode(500, "An error occurred while retrieving the brand");
        }
    }

    // GET: api/brands/5/products
    [HttpGet("{id}/products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetBrandProducts(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null)
            {
                return NotFound($"Brand with ID {id} not found");
            }

            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Where(p => p.BrandId == id && p.IsActive);

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
            _logger.LogError(ex, "Error retrieving products for brand {BrandId}", id);
            return StatusCode(500, "An error occurred while retrieving brand products");
        }
    }

    // POST: api/brands
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BrandDto>> CreateBrand(CreateBrandDto createBrandDto)
    {
        try
        {
            var brand = new Brand
            {
                Name = createBrandDto.Name,
                Description = createBrandDto.Description,
                LogoUrl = createBrandDto.LogoUrl,
                IsActive = createBrandDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            var brandDto = new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description,
                LogoUrl = brand.LogoUrl,
                IsActive = brand.IsActive,
                ProductCount = 0,
                CreatedAt = brand.CreatedAt,
                UpdatedAt = brand.UpdatedAt
            };

            return CreatedAtAction(nameof(GetBrand), new { id = brand.Id }, brandDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating brand");
            return StatusCode(500, "An error occurred while creating the brand");
        }
    }

    // PUT: api/brands/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBrand(int id, UpdateBrandDto updateBrandDto)
    {
        try
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null)
            {
                return NotFound($"Brand with ID {id} not found");
            }

            // Update brand properties
            brand.Name = updateBrandDto.Name;
            brand.Description = updateBrandDto.Description;
            brand.LogoUrl = updateBrandDto.LogoUrl;
            brand.IsActive = updateBrandDto.IsActive;
            brand.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating brand with ID {BrandId}", id);
            return StatusCode(500, "An error occurred while updating the brand");
        }
    }

    // DELETE: api/brands/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBrand(int id)
    {
        try
        {
            var brand = await _context.Brands
                .Include(b => b.Products)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brand == null)
            {
                return NotFound($"Brand with ID {id} not found");
            }

            // Check if brand has products
            if (brand.Products.Any())
            {
                return BadRequest("Cannot delete brand that has products. Please delete or reassign products first.");
            }

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting brand with ID {BrandId}", id);
            return StatusCode(500, "An error occurred while deleting the brand");
        }
    }
}
