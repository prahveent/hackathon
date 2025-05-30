using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HackathonApi.Services;
using HackathonApi.DTOs;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    /// <summary>
    /// Search and filter products with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProductSearchResponseDto>> SearchProducts([FromQuery] ProductSearchRequestDto request)
    {
        try
        {
            var result = await _productService.SearchProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products");
            return StatusCode(500, new { message = "An error occurred while searching products" });
        }
    }

    /// <summary>
    /// Get product details by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            // Increment view count asynchronously
            _ = Task.Run(async () =>
            {
                try
                {
                    await _productService.IncrementViewCountAsync(id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to increment view count for product {ProductId}", id);
                }
            });

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the product" });
        }
    }

    /// <summary>
    /// Get featured products for homepage
    /// </summary>
    [HttpGet("featured")]
    public async Task<ActionResult<List<ProductSummaryDto>>> GetFeaturedProducts([FromQuery] int count = 8)
    {
        try
        {
            var products = await _productService.GetFeaturedProductsAsync(count);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting featured products");
            return StatusCode(500, new { message = "An error occurred while retrieving featured products" });
        }
    }

    /// <summary>
    /// Get all categories with product counts
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryDetailDto>>> GetCategories()
    {
        try
        {
            var categories = await _productService.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting categories");
            return StatusCode(500, new { message = "An error occurred while retrieving categories" });
        }
    }

    /// <summary>
    /// Get products by category
    /// </summary>
    [HttpGet("categories/{categoryId}")]
    public async Task<ActionResult<ProductSearchResponseDto>> GetProductsByCategory(int categoryId, [FromQuery] ProductSearchRequestDto request)
    {
        try
        {
            request.CategoryId = categoryId;
            var result = await _productService.SearchProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products for category {CategoryId}", categoryId);
            return StatusCode(500, new { message = "An error occurred while retrieving products" });
        }
    }

    /// <summary>
    /// Get all brands with product counts
    /// </summary>
    [HttpGet("brands")]
    public async Task<ActionResult<List<BrandDetailDto>>> GetBrands()
    {
        try
        {
            var brands = await _productService.GetBrandsAsync();
            return Ok(brands);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting brands");
            return StatusCode(500, new { message = "An error occurred while retrieving brands" });
        }
    }

    /// <summary>
    /// Get products by brand
    /// </summary>
    [HttpGet("brands/{brandId}")]
    public async Task<ActionResult<ProductSearchResponseDto>> GetProductsByBrand(int brandId, [FromQuery] ProductSearchRequestDto request)
    {
        try
        {
            request.BrandId = brandId;
            var result = await _productService.SearchProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while retrieving products" });
        }
    }

    /// <summary>
    /// Search products by query string
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<ProductSearchResponseDto>> SearchProductsByQuery([FromQuery] string q, [FromQuery] ProductSearchRequestDto request)
    {
        try
        {
            request.Query = q;
            var result = await _productService.SearchProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products with query '{Query}'", q);
            return StatusCode(500, new { message = "An error occurred while searching products" });
        }
    }
} 