using HackathonApi.Data;
using HackathonApi.Models;

namespace HackathonApi.Services;

public static class SeedDataService
{
    public static async Task SeedProductDataAsync(HackathonDbContext context)
    {
        // Check if data already exists
        if (context.Categories.Any() || context.Brands.Any() || context.Products.Any())
        {
            return; // DB has been seeded
        }

        // Seed Categories
        var electronics = new Category
        {
            Name = "Electronics",
            Description = "Electronic devices and accessories",
            DisplayOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var smartphones = new Category
        {
            Name = "Smartphones",
            Description = "Mobile phones and accessories",
            ParentId = null, // Will be set after electronics is saved
            DisplayOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var laptops = new Category
        {
            Name = "Laptops",
            Description = "Portable computers",
            ParentId = null, // Will be set after electronics is saved
            DisplayOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var clothing = new Category
        {
            Name = "Clothing",
            Description = "Apparel and fashion items",
            DisplayOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.AddRange(electronics, clothing);
        await context.SaveChangesAsync();

        // Set parent relationships
        smartphones.ParentId = electronics.Id;
        laptops.ParentId = electronics.Id;
        context.Categories.AddRange(smartphones, laptops);
        await context.SaveChangesAsync();

        // Seed Brands
        var apple = new Brand
        {
            Name = "Apple",
            Description = "Premium technology products",
            LogoUrl = "https://example.com/apple-logo.png",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var samsung = new Brand
        {
            Name = "Samsung",
            Description = "Innovative electronics and technology",
            LogoUrl = "https://example.com/samsung-logo.png",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var nike = new Brand
        {
            Name = "Nike",
            Description = "Athletic apparel and footwear",
            LogoUrl = "https://example.com/nike-logo.png",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Brands.AddRange(apple, samsung, nike);
        await context.SaveChangesAsync();

        // Seed Products
        var iphone15 = new Product
        {
            Name = "iPhone 15 Pro",
            Description = "The latest iPhone with titanium design and advanced camera system",
            SKU = "IPHONE15PRO-256GB",
            Price = 999.99m,
            CompareAtPrice = 1099.99m,
            StockQuantity = 50,
            IsActive = true,
            IsFeatured = true,
            CategoryId = smartphones.Id,
            BrandId = apple.Id,
            MainImageUrl = "https://example.com/iphone15pro.jpg",
            Weight = 0.187,
            WeightUnit = "kg",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var galaxyS24 = new Product
        {
            Name = "Samsung Galaxy S24 Ultra",
            Description = "Flagship smartphone with S Pen and advanced AI features",
            SKU = "GALAXY-S24-ULTRA-512GB",
            Price = 899.99m,
            StockQuantity = 35,
            IsActive = true,
            IsFeatured = true,
            CategoryId = smartphones.Id,
            BrandId = samsung.Id,
            MainImageUrl = "https://example.com/galaxy-s24-ultra.jpg",
            Weight = 0.232,
            WeightUnit = "kg",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var macbookPro = new Product
        {
            Name = "MacBook Pro 14-inch",
            Description = "Powerful laptop with M3 chip for professional workflows",
            SKU = "MACBOOK-PRO-14-M3-512GB",
            Price = 1999.99m,
            StockQuantity = 20,
            IsActive = true,
            IsFeatured = true,
            CategoryId = laptops.Id,
            BrandId = apple.Id,
            MainImageUrl = "https://example.com/macbook-pro-14.jpg",
            Weight = 1.55,
            WeightUnit = "kg",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var nikeShirt = new Product
        {
            Name = "Nike Dri-FIT T-Shirt",
            Description = "Moisture-wicking athletic shirt for workouts",
            SKU = "NIKE-DRIFIT-TEE-L-BLACK",
            Price = 29.99m,
            StockQuantity = 100,
            IsActive = true,
            IsFeatured = false,
            CategoryId = clothing.Id,
            BrandId = nike.Id,
            MainImageUrl = "https://example.com/nike-drifit-tee.jpg",
            Weight = 0.15,
            WeightUnit = "kg",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Products.AddRange(iphone15, galaxyS24, macbookPro, nikeShirt);
        await context.SaveChangesAsync();

        // Seed Product Images
        var iphone15Images = new List<ProductImage>
        {
            new ProductImage
            {
                ProductId = iphone15.Id,
                ImageUrl = "https://example.com/iphone15pro-main.jpg",
                AltText = "iPhone 15 Pro - Main view",
                DisplayOrder = 1,
                IsMain = true,
                CreatedAt = DateTime.UtcNow
            },
            new ProductImage
            {
                ProductId = iphone15.Id,
                ImageUrl = "https://example.com/iphone15pro-back.jpg",
                AltText = "iPhone 15 Pro - Back view",
                DisplayOrder = 2,
                IsMain = false,
                CreatedAt = DateTime.UtcNow
            }
        };

        var galaxyImages = new List<ProductImage>
        {
            new ProductImage
            {
                ProductId = galaxyS24.Id,
                ImageUrl = "https://example.com/galaxy-s24-ultra-main.jpg",
                AltText = "Galaxy S24 Ultra - Main view",
                DisplayOrder = 1,
                IsMain = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.ProductImages.AddRange(iphone15Images);
        context.ProductImages.AddRange(galaxyImages);
        await context.SaveChangesAsync();
    }
}
