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
} 