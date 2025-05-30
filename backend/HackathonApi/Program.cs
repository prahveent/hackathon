using Microsoft.EntityFrameworkCore;
using HackathonApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add PostgreSQL database context
builder.Services.AddDbContext<HackathonDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Automatically apply pending migrations in development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<HackathonDbContext>();
        try
        {
            context.Database.Migrate();
            app.Logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "An error occurred while applying database migrations.");
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseRouting();

app.MapControllers();

// Simple health check endpoint
app.MapGet("/", () => "Hackathon API is running!");

// Database health check endpoint
app.MapGet("/health/db", async (HackathonDbContext context) =>
{
    try
    {
        await context.Database.CanConnectAsync();
        return Results.Ok(new { status = "healthy", database = "connected" });
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

app.Run();
