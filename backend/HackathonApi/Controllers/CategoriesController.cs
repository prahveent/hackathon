using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;
using HackathonApi.Models;
using HackathonApi.Models.DTOs;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly HackathonDbContext _context;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(HackathonDbContext context, ILogger<CategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories([FromQuery] bool includeInactive = false)
    {
        try
        {
            var query = _context.Categories
                .Include(c => c.Children.Where(child => includeInactive || child.IsActive))
                .Include(c => c.Products)
                .Where(c => c.ParentId == null); // Only root categories

            if (!includeInactive)
            {
                query = query.Where(c => c.IsActive);
            }

            var categories = await query
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();

            var categoryDtos = categories.Select(c => MapToCategoryDto(c, includeInactive)).ToList();

            return Ok(categoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, "An error occurred while retrieving categories");
        }
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        try
        {
            var category = await _context.Categories
                .Include(c => c.Parent)
                .Include(c => c.Children.Where(child => child.IsActive))
                .Include(c => c.Products.Where(p => p.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            var categoryDto = MapToCategoryDto(category);

            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while retrieving the category");
        }
    }

    // GET: api/categories/5/products
    [HttpGet("{id}/products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetCategoryProducts(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Where(p => p.CategoryId == id && p.IsActive);

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
            _logger.LogError(ex, "Error retrieving products for category {CategoryId}", id);
            return StatusCode(500, "An error occurred while retrieving category products");
        }
    }

    // POST: api/categories
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
    {
        try
        {
            // Validate parent category exists if provided
            if (createCategoryDto.ParentId.HasValue)
            {
                var parentExists = await _context.Categories
                    .AnyAsync(c => c.Id == createCategoryDto.ParentId.Value && c.IsActive);
                if (!parentExists)
                {
                    return BadRequest("Invalid parent category ID");
                }
            }

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                ParentId = createCategoryDto.ParentId,
                DisplayOrder = createCategoryDto.DisplayOrder,
                IsActive = createCategoryDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Reload with related data
            await _context.Entry(category)
                .Reference(c => c.Parent)
                .LoadAsync();

            var categoryDto = MapToCategoryDto(category);

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, "An error occurred while creating the category");
        }
    }

    // PUT: api/categories/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
    {
        try
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            // Validate parent category exists if provided and not self-referencing
            if (updateCategoryDto.ParentId.HasValue)
            {
                if (updateCategoryDto.ParentId.Value == id)
                {
                    return BadRequest("A category cannot be its own parent");
                }

                var parentExists = await _context.Categories
                    .AnyAsync(c => c.Id == updateCategoryDto.ParentId.Value && c.IsActive);
                if (!parentExists)
                {
                    return BadRequest("Invalid parent category ID");
                }

                // Check for circular reference
                var wouldCreateCircle = await WouldCreateCircularReference(id, updateCategoryDto.ParentId.Value);
                if (wouldCreateCircle)
                {
                    return BadRequest("This change would create a circular reference");
                }
            }

            // Update category properties
            category.Name = updateCategoryDto.Name;
            category.Description = updateCategoryDto.Description;
            category.ParentId = updateCategoryDto.ParentId;
            category.DisplayOrder = updateCategoryDto.DisplayOrder;
            category.IsActive = updateCategoryDto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while updating the category");
        }
    }

    // DELETE: api/categories/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var category = await _context.Categories
                .Include(c => c.Children)
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            // Check if category has children
            if (category.Children.Any())
            {
                return BadRequest("Cannot delete category that has child categories. Please delete or reassign child categories first.");
            }

            // Check if category has products
            if (category.Products.Any())
            {
                return BadRequest("Cannot delete category that has products. Please delete or reassign products first.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while deleting the category");
        }
    }

    private CategoryDto MapToCategoryDto(Category category, bool includeInactive = false)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentId = category.ParentId,
            ParentName = category.Parent?.Name,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductCount = category.Products?.Count(p => p.IsActive) ?? 0,
            Children = category.Children?
                .Where(c => includeInactive || c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .Select(c => MapToCategoryDto(c, includeInactive))
                .ToList() ?? new List<CategoryDto>(),
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }

    private async Task<bool> WouldCreateCircularReference(int categoryId, int newParentId)
    {
        var currentId = newParentId;
        var visited = new HashSet<int>();

        while (currentId != 0 && !visited.Contains(currentId))
        {
            if (currentId == categoryId)
            {
                return true;
            }

            visited.Add(currentId);
            var parent = await _context.Categories
                .Where(c => c.Id == currentId)
                .Select(c => c.ParentId)
                .FirstOrDefaultAsync();

            currentId = parent ?? 0;
        }

        return false;
    }
}
