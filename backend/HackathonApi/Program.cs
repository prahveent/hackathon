using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HackathonApi.Data;
using HackathonApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add In-Memory database context (Mock Database)
builder.Services.AddDbContext<HackathonDbContext>(options =>
    options.UseInMemoryDatabase("SmartCartDb"));

// Register services
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<DatabaseSeeder>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "SmartCartApi",
            ValidAudience = jwtSettings["Audience"] ?? "SmartCartClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost:5173") // Angular, React/Vite dev servers
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed the in-memory database with mock data
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    try
    {
        await seeder.SeedAsync();
        app.Logger.LogInformation("Mock database seeded successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while seeding the mock database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRouting();

app.MapControllers();

// Simple health check endpoint
app.MapGet("/", () => "SmartCart API is running with Mock Database!");

// Database health check endpoint
app.MapGet("/health/db", async (HackathonDbContext context) =>
{
    try
    {
        var userCount = await context.Users.CountAsync();
        var productCount = await context.Products.CountAsync();
        var categoryCount = await context.Categories.CountAsync();
        var brandCount = await context.Brands.CountAsync();
        
        return Results.Ok(new { 
            status = "healthy", 
            database = "in-memory", 
            userCount = userCount,
            productCount = productCount,
            categoryCount = categoryCount,
            brandCount = brandCount,
            message = "Mock database is running successfully"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            title: "Database connection failed",
            statusCode: 503
        );
    }
});

// Mock data info endpoint
app.MapGet("/mock-data", async (HackathonDbContext context) =>
{
    var users = await context.Users
        .Include(u => u.CustomerProfile)
        .Include(u => u.AdminProfile)
        .Include(u => u.UserRoles)
        .ThenInclude(ur => ur.Role)
        .Select(u => new
        {
            u.Id,
            u.Email,
            u.EmailVerified,
            u.IsActive,
            u.LastLogin,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CustomerProfile = u.CustomerProfile != null ? new
            {
                u.CustomerProfile.FirstName,
                u.CustomerProfile.LastName,
                u.CustomerProfile.Phone
            } : null,
            AdminProfile = u.AdminProfile != null ? new
            {
                u.AdminProfile.FirstName,
                u.AdminProfile.LastName,
                u.AdminProfile.Department,
                u.AdminProfile.PermissionsLevel
            } : null
        })
        .ToListAsync();

    return Results.Ok(new
    {
        message = "Mock database users",
        totalUsers = users.Count,
        users = users
    });
});

app.Run();
