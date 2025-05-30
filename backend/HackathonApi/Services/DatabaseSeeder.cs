using HackathonApi.Data;
using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Services;

public class DatabaseSeeder
{
    private readonly HackathonDbContext _context;
    private readonly IPasswordService _passwordService;

    public DatabaseSeeder(HackathonDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task SeedAsync()
    {
        // Ensure database is created
        await _context.Database.EnsureCreatedAsync();

        // Check if data already exists
        if (await _context.Users.AnyAsync())
        {
            return; // Database already seeded
        }

        // Create default roles
        var customerRole = new Role
        {
            Name = "customer",
            Description = "Customer role for regular users"
        };

        var adminRole = new Role
        {
            Name = "admin",
            Description = "Administrator role with elevated permissions"
        };

        _context.Roles.AddRange(customerRole, adminRole);
        await _context.SaveChangesAsync();

        // Create mock customers
        var customer1 = new User
        {
            Email = "john.doe@example.com",
            PasswordHash = _passwordService.HashPassword("Password123!"),
            IsActive = true,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            LastLogin = DateTime.UtcNow.AddDays(-1)
        };

        var customer2 = new User
        {
            Email = "jane.smith@example.com",
            PasswordHash = _passwordService.HashPassword("Password123!"),
            IsActive = true,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow.AddDays(-7),
            LastLogin = DateTime.UtcNow.AddHours(-3)
        };

        var customer3 = new User
        {
            Email = "mike.johnson@example.com",
            PasswordHash = _passwordService.HashPassword("Password123!"),
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };

        // Create mock admin
        var admin1 = new User
        {
            Email = "admin@smartcart.com",
            PasswordHash = _passwordService.HashPassword("AdminPass123!"),
            IsActive = true,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            LastLogin = DateTime.UtcNow.AddMinutes(-15)
        };

        var admin2 = new User
        {
            Email = "manager@smartcart.com",
            PasswordHash = _passwordService.HashPassword("ManagerPass123!"),
            IsActive = true,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow.AddDays(-15),
            LastLogin = DateTime.UtcNow.AddHours(-2)
        };

        _context.Users.AddRange(customer1, customer2, customer3, admin1, admin2);
        await _context.SaveChangesAsync();

        // Create customer profiles
        var customerProfile1 = new CustomerProfile
        {
            UserId = customer1.Id,
            FirstName = "John",
            LastName = "Doe",
            Phone = "+1234567890",
            DateOfBirth = new DateTime(1990, 5, 15),
            CreatedAt = DateTime.UtcNow
        };

        var customerProfile2 = new CustomerProfile
        {
            UserId = customer2.Id,
            FirstName = "Jane",
            LastName = "Smith",
            Phone = "+1987654321",
            DateOfBirth = new DateTime(1985, 11, 22),
            CreatedAt = DateTime.UtcNow.AddDays(-7)
        };

        var customerProfile3 = new CustomerProfile
        {
            UserId = customer3.Id,
            FirstName = "Mike",
            LastName = "Johnson",
            Phone = "+1122334455",
            DateOfBirth = new DateTime(1992, 8, 30),
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };

        _context.CustomerProfiles.AddRange(customerProfile1, customerProfile2, customerProfile3);
        await _context.SaveChangesAsync();

        // Create admin profiles
        var adminProfile1 = new AdminProfile
        {
            UserId = admin1.Id,
            FirstName = "Admin",
            LastName = "User",
            Department = "IT",
            PermissionsLevel = PermissionLevel.SuperAdmin,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        var adminProfile2 = new AdminProfile
        {
            UserId = admin2.Id,
            FirstName = "Store",
            LastName = "Manager",
            Department = "Operations",
            PermissionsLevel = PermissionLevel.Manager,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        };

        _context.AdminProfiles.AddRange(adminProfile1, adminProfile2);
        await _context.SaveChangesAsync();

        // Assign roles to users
        var userRoles = new List<UserRole>
        {
            new UserRole { UserId = customer1.Id, RoleId = customerRole.Id },
            new UserRole { UserId = customer2.Id, RoleId = customerRole.Id },
            new UserRole { UserId = customer3.Id, RoleId = customerRole.Id },
            new UserRole { UserId = admin1.Id, RoleId = adminRole.Id },
            new UserRole { UserId = admin2.Id, RoleId = adminRole.Id }
        };

        _context.UserRoles.AddRange(userRoles);
        await _context.SaveChangesAsync();

        // Create some mock user sessions
        var sessions = new List<UserSession>
        {
            new UserSession
            {
                UserId = customer1.Id,
                SessionToken = Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IpAddress = "192.168.1.100",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new UserSession
            {
                UserId = admin1.Id,
                SessionToken = Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                IpAddress = "192.168.1.50",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-15)
            }
        };

        _context.UserSessions.AddRange(sessions);
        await _context.SaveChangesAsync();

        // Seed Product Data
        await SeedProductDataAsync();

        Console.WriteLine("Database seeded successfully with mock data!");
        Console.WriteLine("\n=== Mock User Accounts ===");
        Console.WriteLine("CUSTOMERS:");
        Console.WriteLine("  john.doe@example.com / Password123!");
        Console.WriteLine("  jane.smith@example.com / Password123!");
        Console.WriteLine("  mike.johnson@example.com / Password123!");
        Console.WriteLine("\nADMINS:");
        Console.WriteLine("  admin@smartcart.com / AdminPass123!");
        Console.WriteLine("  manager@smartcart.com / ManagerPass123!");
        Console.WriteLine("============================\n");
    }

    private async Task SeedProductDataAsync()
    {
        // Create Categories
        var categories = new List<Category>
        {
            new Category { Name = "Electronics", Description = "Latest electronic devices and gadgets", ImageUrl = "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300", DisplayOrder = 1 },
            new Category { Name = "Clothing", Description = "Fashion and apparel for all occasions", ImageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300", DisplayOrder = 2 },
            new Category { Name = "Home & Garden", Description = "Everything for your home and garden", ImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300", DisplayOrder = 3 },
            new Category { Name = "Sports & Outdoor", Description = "Sports equipment and outdoor gear", ImageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300", DisplayOrder = 4 },
            new Category { Name = "Books", Description = "Books and educational materials", ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300", DisplayOrder = 5 }
        };

        _context.Categories.AddRange(categories);
        await _context.SaveChangesAsync();

        // Create Brands
        var brands = new List<Brand>
        {
            new Brand { Name = "TechnoCore", Description = "Leading technology brand", LogoUrl = "https://via.placeholder.com/100x50/2563eb/ffffff?text=TechnoCore", Website = "https://technocore.example.com" },
            new Brand { Name = "StyleHub", Description = "Premium fashion brand", LogoUrl = "https://via.placeholder.com/100x50/7c3aed/ffffff?text=StyleHub", Website = "https://stylehub.example.com" },
            new Brand { Name = "HomeComfort", Description = "Quality home products", LogoUrl = "https://via.placeholder.com/100x50/059669/ffffff?text=HomeComfort", Website = "https://homecomfort.example.com" },
            new Brand { Name = "ActiveLife", Description = "Sports and outdoor equipment", LogoUrl = "https://via.placeholder.com/100x50/dc2626/ffffff?text=ActiveLife", Website = "https://activelife.example.com" },
            new Brand { Name = "BookWorld", Description = "Educational and entertainment books", LogoUrl = "https://via.placeholder.com/100x50/7c2d12/ffffff?text=BookWorld", Website = "https://bookworld.example.com" }
        };

        _context.Brands.AddRange(brands);
        await _context.SaveChangesAsync();

        // Create Products
        var products = new List<Product>
        {
            // Electronics
            new Product
            {
                Name = "Wireless Bluetooth Headphones",
                Description = "Premium noise-canceling wireless headphones with 30-hour battery life",
                DetailedDescription = "Experience superior sound quality with these professional-grade wireless headphones. Features include active noise cancellation, 30-hour battery life, quick charge capability, and premium comfort padding.",
                Price = 199.99m,
                OriginalPrice = 249.99m,
                SKU = "WBH-001",
                StockQuantity = 50,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                Rating = 4.5,
                ReviewCount = 128,
                ViewCount = 2341,
                IsFeatured = true,
                CategoryId = categories[0].Id,
                BrandId = brands[0].Id
            },
            new Product
            {
                Name = "Smart Watch Series X",
                Description = "Advanced fitness tracking smartwatch with health monitoring",
                DetailedDescription = "Monitor your health and fitness with this advanced smartwatch. Features include heart rate monitoring, GPS tracking, sleep analysis, water resistance, and 7-day battery life.",
                Price = 349.99m,
                OriginalPrice = 399.99m,
                SKU = "SWX-002",
                StockQuantity = 35,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                Rating = 4.7,
                ReviewCount = 89,
                ViewCount = 1876,
                IsFeatured = true,
                CategoryId = categories[0].Id,
                BrandId = brands[0].Id
            },
            new Product
            {
                Name = "4K Ultra HD Webcam",
                Description = "Professional 4K webcam for streaming and video calls",
                DetailedDescription = "Perfect for content creators and professionals. This 4K webcam offers crystal-clear video quality, auto-focus, built-in microphone, and plug-and-play setup.",
                Price = 129.99m,
                SKU = "4KW-003",
                StockQuantity = 25,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
                Rating = 4.3,
                ReviewCount = 67,
                ViewCount = 1234,
                IsFeatured = false,
                CategoryId = categories[0].Id,
                BrandId = brands[0].Id
            },

            // Clothing
            new Product
            {
                Name = "Premium Cotton T-Shirt",
                Description = "Comfortable, breathable cotton t-shirt in multiple colors",
                DetailedDescription = "Made from 100% organic cotton, this premium t-shirt offers exceptional comfort and durability. Available in various sizes and colors to suit any style.",
                Price = 29.99m,
                OriginalPrice = 39.99m,
                SKU = "PCT-004",
                StockQuantity = 100,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
                Rating = 4.2,
                ReviewCount = 156,
                ViewCount = 2867,
                IsFeatured = true,
                CategoryId = categories[1].Id,
                BrandId = brands[1].Id
            },
            new Product
            {
                Name = "Denim Jacket Classic",
                Description = "Timeless denim jacket with modern fit and premium finish",
                DetailedDescription = "This classic denim jacket features a modern slim fit, premium denim fabric, and durable construction. Perfect for layering and available in multiple washes.",
                Price = 89.99m,
                SKU = "DJC-005",
                StockQuantity = 40,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
                Rating = 4.4,
                ReviewCount = 73,
                ViewCount = 1543,
                IsFeatured = false,
                CategoryId = categories[1].Id,
                BrandId = brands[1].Id
            },
            new Product
            {
                Name = "Running Shoes Pro",
                Description = "Professional running shoes with advanced cushioning technology",
                DetailedDescription = "Engineered for performance with responsive cushioning, breathable mesh upper, and durable rubber outsole. Ideal for daily training and long-distance running.",
                Price = 159.99m,
                OriginalPrice = 189.99m,
                SKU = "RSP-006",
                StockQuantity = 60,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
                Rating = 4.6,
                ReviewCount = 234,
                ViewCount = 3421,
                IsFeatured = true,
                CategoryId = categories[1].Id,
                BrandId = brands[1].Id
            },

            // Home & Garden
            new Product
            {
                Name = "Smart LED Light Bulbs Set",
                Description = "WiFi-enabled smart LED bulbs with color changing capabilities",
                DetailedDescription = "Transform your home lighting with these smart LED bulbs. Features include 16 million colors, dimming control, voice assistant compatibility, and energy-efficient design.",
                Price = 79.99m,
                OriginalPrice = 99.99m,
                SKU = "SLB-007",
                StockQuantity = 80,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
                Rating = 4.3,
                ReviewCount = 145,
                ViewCount = 1987,
                IsFeatured = true,
                CategoryId = categories[2].Id,
                BrandId = brands[2].Id
            },
            new Product
            {
                Name = "Ceramic Plant Pot Set",
                Description = "Beautiful handcrafted ceramic pots perfect for indoor plants",
                DetailedDescription = "Set of 3 elegant ceramic plant pots with drainage holes and matching saucers. Perfect for succulents, herbs, and small plants. Adds natural beauty to any space.",
                Price = 34.99m,
                SKU = "CPP-008",
                StockQuantity = 45,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
                Rating = 4.1,
                ReviewCount = 92,
                ViewCount = 1456,
                IsFeatured = false,
                CategoryId = categories[2].Id,
                BrandId = brands[2].Id
            },

            // Sports & Outdoor
            new Product
            {
                Name = "Professional Yoga Mat",
                Description = "Non-slip yoga mat with superior grip and cushioning",
                DetailedDescription = "Premium yoga mat made from eco-friendly materials. Provides excellent grip, cushioning, and durability. Perfect for yoga, pilates, and general fitness exercises.",
                Price = 49.99m,
                OriginalPrice = 69.99m,
                SKU = "PYM-009",
                StockQuantity = 70,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                Rating = 4.5,
                ReviewCount = 187,
                ViewCount = 2654,
                IsFeatured = true,
                CategoryId = categories[3].Id,
                BrandId = brands[3].Id
            },
            new Product
            {
                Name = "Hiking Backpack 40L",
                Description = "Durable hiking backpack with multiple compartments and weather protection",
                DetailedDescription = "Spacious 40L hiking backpack with ergonomic design, multiple compartments, hydration system compatibility, and weather-resistant materials. Perfect for day hikes and weekend adventures.",
                Price = 119.99m,
                SKU = "HBP-010",
                StockQuantity = 30,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
                Rating = 4.4,
                ReviewCount = 156,
                ViewCount = 1876,
                IsFeatured = false,
                CategoryId = categories[3].Id,
                BrandId = brands[3].Id
            },

            // Books
            new Product
            {
                Name = "JavaScript Programming Guide",
                Description = "Comprehensive guide to modern JavaScript programming",
                DetailedDescription = "Learn JavaScript from basics to advanced concepts. Covers ES6+, async programming, frameworks, and best practices. Perfect for beginners and experienced developers.",
                Price = 39.99m,
                OriginalPrice = 49.99m,
                SKU = "JPG-011",
                StockQuantity = 55,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                Rating = 4.7,
                ReviewCount = 298,
                ViewCount = 4321,
                IsFeatured = true,
                CategoryId = categories[4].Id,
                BrandId = brands[4].Id
            },
            new Product
            {
                Name = "Mindfulness Meditation Book",
                Description = "Practical guide to mindfulness and meditation techniques",
                DetailedDescription = "Discover the power of mindfulness with this comprehensive guide. Includes practical exercises, meditation techniques, and scientific insights for stress reduction and mental well-being.",
                Price = 24.99m,
                SKU = "MMB-012",
                StockQuantity = 40,
                Status = ProductStatus.Active,
                MainImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                Rating = 4.6,
                ReviewCount = 176,
                ViewCount = 2543,
                IsFeatured = false,
                CategoryId = categories[4].Id,
                BrandId = brands[4].Id
            }
        };

        _context.Products.AddRange(products);
        await _context.SaveChangesAsync();

        // Create Product Images
        var productImages = new List<ProductImage>();
        foreach (var product in products)
        {
            // Add main image
            productImages.Add(new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = product.MainImageUrl!,
                AltText = $"{product.Name} main image",
                DisplayOrder = 1,
                IsMain = true
            });

            // Add additional images
            productImages.Add(new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
                AltText = $"{product.Name} side view",
                DisplayOrder = 2,
                IsMain = false
            });
        }

        _context.ProductImages.AddRange(productImages);
        await _context.SaveChangesAsync();

        // Create Product Attributes
        var productAttributes = new List<ProductAttribute>
        {
            // Headphones attributes
            new ProductAttribute { ProductId = products[0].Id, Name = "Battery Life", Value = "30 hours", DisplayOrder = 1 },
            new ProductAttribute { ProductId = products[0].Id, Name = "Connectivity", Value = "Bluetooth 5.2", DisplayOrder = 2 },
            new ProductAttribute { ProductId = products[0].Id, Name = "Weight", Value = "285g", DisplayOrder = 3 },
            new ProductAttribute { ProductId = products[0].Id, Name = "Warranty", Value = "2 years", DisplayOrder = 4 },

            // Smart Watch attributes
            new ProductAttribute { ProductId = products[1].Id, Name = "Display", Value = "1.4-inch AMOLED", DisplayOrder = 1 },
            new ProductAttribute { ProductId = products[1].Id, Name = "Water Resistance", Value = "50 meters", DisplayOrder = 2 },
            new ProductAttribute { ProductId = products[1].Id, Name = "Battery Life", Value = "7 days", DisplayOrder = 3 },
            new ProductAttribute { ProductId = products[1].Id, Name = "GPS", Value = "Built-in", DisplayOrder = 4 },

            // T-Shirt attributes
            new ProductAttribute { ProductId = products[3].Id, Name = "Material", Value = "100% Organic Cotton", DisplayOrder = 1 },
            new ProductAttribute { ProductId = products[3].Id, Name = "Sizes", Value = "XS, S, M, L, XL, XXL", DisplayOrder = 2 },
            new ProductAttribute { ProductId = products[3].Id, Name = "Colors", Value = "Black, White, Navy, Gray", DisplayOrder = 3 },
            new ProductAttribute { ProductId = products[3].Id, Name = "Care", Value = "Machine washable", DisplayOrder = 4 },

            // Running Shoes attributes
            new ProductAttribute { ProductId = products[5].Id, Name = "Sizes", Value = "6-13 US", DisplayOrder = 1 },
            new ProductAttribute { ProductId = products[5].Id, Name = "Cushioning", Value = "React Foam", DisplayOrder = 2 },
            new ProductAttribute { ProductId = products[5].Id, Name = "Weight", Value = "310g", DisplayOrder = 3 },
            new ProductAttribute { ProductId = products[5].Id, Name = "Drop", Value = "10mm", DisplayOrder = 4 }
        };

        _context.ProductAttributes.AddRange(productAttributes);
        await _context.SaveChangesAsync();

        Console.WriteLine("Product data seeded successfully!");
        Console.WriteLine($"Categories: {categories.Count}");
        Console.WriteLine($"Brands: {brands.Count}");
        Console.WriteLine($"Products: {products.Count}");
        Console.WriteLine($"Product Images: {productImages.Count}");
        Console.WriteLine($"Product Attributes: {productAttributes.Count}");
    }
} 