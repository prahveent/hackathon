using Microsoft.EntityFrameworkCore;
using HackathonApi.Models;

namespace HackathonApi.Data;

public class HackathonDbContext : DbContext
{
    public HackathonDbContext(DbContextOptions<HackathonDbContext> options) : base(options)
    {
    }

    // DbSets for entities
    public DbSet<User> Users { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Configure Role as enum
            entity.Property(e => e.Role)
                  .HasConversion<int>();
            
            // Set default role as Customer
            entity.Property(e => e.Role)
                  .HasDefaultValue(UserRole.Customer);
            
            // Configure required fields
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.FirstName).IsRequired();
            entity.Property(e => e.LastName).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            
            // Set default values
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });
        
        // Configure Team entity
        modelBuilder.Entity<Team>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
        
        // Configure UserSession entity
        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            
            // Configure relationships
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        // Configure relationships
        modelBuilder.Entity<User>()
            .HasOne<Team>()
            .WithMany(t => t.Members)
            .HasForeignKey("TeamId")
            .IsRequired(false);
        
        // Seed default admin user
        SeedDefaultUsers(modelBuilder);
    }
      private void SeedDefaultUsers(ModelBuilder modelBuilder)
    {
        // Create default admin user
        // Password: Tomba@123 (hashed)
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Tomba@123");
        
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Email = "prahveent@gmail.com",
                FirstName = "Prahveen",
                LastName = "Tharwani",
                PasswordHash = adminPasswordHash,
                Role = UserRole.Administrator,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}
