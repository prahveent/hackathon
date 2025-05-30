# Hackathon API

A .NET 9 Web API project for the hackathon with PostgreSQL database support.

## Getting Started

### Prerequisites
- .NET 9 SDK
- PostgreSQL (version 12 or higher)

### Database Setup

1. **Install PostgreSQL** if you haven't already from: https://www.postgresql.org/download/

2. **Create the database and user:**
   ```sql
   -- Connect to PostgreSQL as postgres user
   CREATE DATABASE hackathon_db;
   CREATE USER hackathon_user WITH PASSWORD 'hackathon_password';
   GRANT ALL PRIVILEGES ON DATABASE hackathon_db TO hackathon_user;
   
   -- Grant schema privileges (PostgreSQL 15+)
   \c hackathon_db
   GRANT ALL ON SCHEMA public TO hackathon_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hackathon_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hackathon_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hackathon_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hackathon_user;
   ```

3. **Install EF Core tools globally:**
   ```bash
   dotnet tool install --global dotnet-ef
   ```

4. **Run database migrations:**
   ```bash
   cd backend/HackathonApi
   dotnet ef database update
   ```

### Running the API

You can run the API in two ways:

#### Option 1: Using the Solution File
1. Navigate to the backend directory (from the repository root):
   ```bash
   cd backend
   ```

2. Run the solution:
   ```bash
   dotnet run --project HackathonApi
   ```

#### Option 2: Direct Project Run
1. Navigate to the project directory (from the repository root):
   ```bash
   cd backend/HackathonApi
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

3. The API will be available at:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:5001`

### Available Endpoints

- `GET /` - Simple health check that returns "Hackathon API is running!"
- `GET /health/db` - Database connectivity health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/teams` - Get all teams with members
- `POST /api/teams` - Create a new team
- `GET /openapi` - OpenAPI specification (Development only)

### Project Structure

```
HackathonApi/
├── Controllers/          # API Controllers
│   ├── UsersController.cs    # User management endpoints
│   └── TeamsController.cs    # Team management endpoints
├── Models/              # Entity models
│   ├── User.cs          # User entity
│   └── Team.cs          # Team entity
├── Data/                # Database context
│   └── HackathonDbContext.cs # Entity Framework DbContext
├── Migrations/          # Database migrations
├── Properties/          # Project properties
├── Program.cs          # Application entry point
├── HackathonApi.csproj # Project file
├── appsettings.json    # Configuration files
└── appsettings.Development.json # Development settings
```

## Database

This project uses PostgreSQL with Entity Framework Core for data access.

### Entity Models
- **User**: Represents hackathon participants with email, first name, last name
- **Team**: Represents hackathon teams with name, description, and member limit

### Migrations
To create new migrations when models change:
```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

For detailed migration instructions, see: [Database Migration Instructions](../.github/instructions/database-migration.instructions.md)

## Development

This API includes:
- PostgreSQL database integration with Entity Framework Core
- RESTful endpoints for users and teams
- Database health check endpoint
- OpenAPI/Swagger documentation
- Clean architecture ready for extension

### Adding New Features
1. Create entity models in `Models/` folder
2. Add DbSets to `HackathonDbContext`
3. Create migrations: `dotnet ef migrations add <Name>`
4. Apply migrations: `dotnet ef database update`
5. Create controllers in `Controllers/` folder
