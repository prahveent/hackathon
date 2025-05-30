# SmartCart Mock Database Setup

## Overview
The SmartCart API has been configured to use an **in-memory database** for development and testing purposes. This eliminates the need for PostgreSQL installation and provides instant access to a fully populated database with realistic test data.

## Features
- ✅ **No External Dependencies** - No PostgreSQL installation required
- ✅ **Instant Setup** - Database is created and seeded automatically on startup
- ✅ **Realistic Test Data** - Pre-populated with customers, admins, and relationships
- ✅ **Fast Development** - Data resets on each application restart
- ✅ **Consistent Testing** - Same data set every time

## Configuration Changes

### Database Provider
Changed from PostgreSQL to Entity Framework Core In-Memory provider:

```csharp
// Before: PostgreSQL
builder.Services.AddDbContext<HackathonDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// After: In-Memory Database
builder.Services.AddDbContext<HackathonDbContext>(options =>
    options.UseInMemoryDatabase("SmartCartDb"));
```

### Automatic Data Seeding
The application automatically seeds the database on startup with comprehensive test data.

## Mock Data Structure

### Test User Accounts

#### Customer Accounts
| Email | Password | Name | Status |
|-------|----------|------|--------|
| john.doe@example.com | Password123! | John Doe | ✅ Verified |
| jane.smith@example.com | Password123! | Jane Smith | ✅ Verified |
| mike.johnson@example.com | Password123! | Mike Johnson | ⚠️ Unverified |

#### Administrator Accounts
| Email | Password | Name | Department | Level |
|-------|----------|------|------------|-------|
| admin@smartcart.com | AdminPass123! | Admin User | IT | SuperAdmin |
| manager@smartcart.com | ManagerPass123! | Store Manager | Operations | Manager |

### Database Entities Populated

1. **Users** - 5 total users (3 customers, 2 admins)
2. **Roles** - Customer and Admin roles
3. **Customer Profiles** - Personal information for customers
4. **Admin Profiles** - Administrative details for admins
5. **User Roles** - Role assignments
6. **User Sessions** - Active session examples

## API Endpoints for Testing

### Health Check
```
GET /health/db
```
**Response:**
```json
{
  "status": "healthy",
  "database": "in-memory",
  "userCount": 5,
  "message": "Mock database is running successfully"
}
```

### View Mock Data
```
GET /mock-data
```
Returns complete list of all users with their profiles and roles for inspection.

### Authentication Testing
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

## Frontend Integration

### Updated CORS Configuration
Added Angular development server to allowed origins:
```csharp
policy.WithOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost:5173")
```

### API URL Configuration
Frontend should use:
```typescript
private apiUrl = 'https://localhost:5001/api';
```

## Development Workflow

### Starting the API
```bash
cd backend/HackathonApi
dotnet run
```

The application will:
1. Create in-memory database
2. Seed with test data
3. Display seeded account information in console
4. Start API server on `https://localhost:5001`

### Console Output
```
Database seeded successfully with mock data!

=== Mock User Accounts ===
CUSTOMERS:
  john.doe@example.com / Password123!
  jane.smith@example.com / Password123!
  mike.johnson@example.com / Password123!

ADMINS:
  admin@smartcart.com / AdminPass123!
  manager@smartcart.com / ManagerPass123!
============================
```

## Testing Scenarios

### Customer Login Flow
1. Use `john.doe@example.com` / `Password123!` to test verified customer
2. Use `mike.johnson@example.com` / `Password123!` to test unverified customer
3. Test dashboard access and profile display

### Admin Login Flow
1. Use `admin@smartcart.com` / `AdminPass123!` for SuperAdmin testing
2. Use `manager@smartcart.com` / `ManagerPass123!` for Manager testing
3. Test admin role-based access

### Registration Testing
1. Register new customers through frontend
2. New users automatically get customer role
3. Data persists until application restart

## Data Persistence

### During Development
- Data persists while application is running
- Perfect for testing CRUD operations
- All changes are lost when application restarts

### For Production
To switch back to persistent database:
1. Change back to PostgreSQL provider in `Program.cs`
2. Update connection string in `appsettings.json`
3. Remove or modify seeding logic as needed

## Advantages for Development

1. **Zero Setup Time** - No database installation or configuration
2. **Clean Slate** - Fresh data on every restart
3. **Fast Testing** - No cleanup needed between test runs
4. **Isolation** - No external database dependencies
5. **Consistent State** - Same starting data every time

## Security Note
Mock passwords use the same BCrypt hashing as production, ensuring security practices are maintained even with test data.

This setup provides a complete, immediately usable database environment perfect for frontend development, API testing, and demonstration purposes. 