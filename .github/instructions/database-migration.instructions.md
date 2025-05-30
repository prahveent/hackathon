---
applyTo: "backend/**"
---

# Database Migration Instructions

## PostgreSQL Setup and Migration Guide

### Prerequisites

1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database and User**
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE hackathon_db;
CREATE USER hackathon_user WITH PASSWORD 'hackathon_password';
GRANT ALL PRIVILEGES ON DATABASE hackathon_db TO hackathon_user;
```

### Connection String Configuration

Update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=hackathon_db;Username=hackathon_user;Password=hackathon_password"
  }
}
```

### Entity Framework Migrations

#### 1. Create Migration
```powershell
# Navigate to API project
Set-Location "backend\HackathonApi"

# Create initial migration
dotnet ef migrations add InitialCreate
```

#### 2. Update Database
```powershell
# Apply migration to database
dotnet ef database update
```

#### 3. Add New Migration (when models change)
```powershell
# Create new migration
dotnet ef migrations add [MigrationName]

# Apply to database
dotnet ef database update
```

### Common Migration Commands

| Command | What it does |
|---------|-------------|
| `dotnet ef migrations add [Name]` | Create a new migration |
| `dotnet ef database update` | Apply pending migrations |
| `dotnet ef migrations remove` | Remove last migration |
| `dotnet ef database drop` | Drop the database |
| `dotnet ef migrations list` | List all migrations |

### Migration Workflow

1. **Add/Modify Entity Models** in `BusinessService/[Feature]/` folders
2. **Update DbContext** - Add DbSet properties
3. **Create Migration** - `dotnet ef migrations add [Name]`
4. **Review Migration** - Check generated migration files
5. **Apply Migration** - `dotnet ef database update`

### Database Structure

```
Data/
├── HackathonDbContext.cs          # Main DbContext
├── Migrations/                    # Auto-generated migrations
│   ├── 20250530_InitialCreate.cs
│   └── ...
└── Configurations/               # Entity configurations (optional)
    ├── UserConfiguration.cs
    └── ...
```

### Environment-Specific Configurations

#### Development
- Use local PostgreSQL instance
- Connection string in `appsettings.Development.json`

#### Production
- Use environment variables for connection strings
- Example: `ConnectionStrings__DefaultConnection`

### Troubleshooting

**Connection Issues:**
- Verify PostgreSQL is running
- Check connection string format
- Ensure database and user exist

**Migration Issues:**
- Delete migration files and recreate if needed
- Use `dotnet ef database drop` to reset database
- Check entity model annotations
