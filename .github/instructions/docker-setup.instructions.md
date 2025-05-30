---
applyTo: "**"
---

# Docker Setup Instructions

## Prerequisites

### 1. Install Docker Desktop
Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

### 2. Verify Docker Installation
```powershell
docker --version
docker-compose --version
```

## Quick Start

### 1. Start All Services
```powershell
# Navigate to project root
Set-Location "c:\Users\PrahveenT\Documents\Projects\hackathon"

# Start services using the script
.\scripts\start-services.ps1
```

### 2. Stop All Services
```powershell
.\scripts\stop-services.ps1
```

## Manual Docker Commands

### Start Services
```powershell
# Build and start all containers
docker-compose up --build -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f
```

### Stop Services
```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

## Service Information

### Running Services
| Service | URL | Purpose |
|---------|-----|---------|
| API | http://localhost:5000 | Backend REST API |
| PostgreSQL | localhost:5432 | Database |
| pgAdmin | http://localhost:5050 | Database admin UI |

### Default Credentials
- **Database**: hackathon_db
- **User**: hackathon_user  
- **Password**: hackathon_password
- **pgAdmin**: admin@hackathon.local / admin123

## Development Utilities

### Quick Commands
```powershell
# View service status
.\scripts\dev-utils.ps1 status

# View real-time logs
.\scripts\dev-utils.ps1 logs

# Restart API service
.\scripts\dev-utils.ps1 restart

# Open database shell
.\scripts\dev-utils.ps1 db-shell

# Open API container shell
.\scripts\dev-utils.ps1 api-shell

# Clean up everything
.\scripts\dev-utils.ps1 clean
```

### Database Operations
```powershell
# Connect to PostgreSQL
docker-compose exec postgres psql -U hackathon_user -d hackathon_db

# Run migrations manually
docker-compose exec api dotnet ef database update

# View database tables
docker-compose exec postgres psql -U hackathon_user -d hackathon_db -c "\dt"
```

## API Testing

### Health Checks
```powershell
# Test main endpoint
Invoke-RestMethod -Uri "http://localhost:5000" -Method Get

# Test database connectivity
Invoke-RestMethod -Uri "http://localhost:5000/health/db" -Method Get
```

### API Endpoints
```powershell
# Get all users
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get

# Get all teams
Invoke-RestMethod -Uri "http://localhost:5000/api/teams" -Method Get

# Create a new user
$user = @{
    Email = "test@example.com"
    FirstName = "John"
    LastName = "Doe"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Post -Body ($user | ConvertTo-Json) -ContentType "application/json"
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```powershell
   # Check what's using port 5000
   netstat -ano | findstr :5000
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database connection issues**
   ```powershell
   # Check if PostgreSQL container is healthy
   docker-compose exec postgres pg_isready -U hackathon_user -d hackathon_db
   
   # View database logs
   docker-compose logs postgres
   ```

3. **API startup issues**
   ```powershell
   # View API logs
   docker-compose logs api
   
   # Restart API service
   docker-compose restart api
   ```

### Container Management
```powershell
# Rebuild specific service
docker-compose build api
docker-compose up -d api

# Reset everything (database will be empty)
docker-compose down -v
docker-compose up --build -d

# View container resource usage
docker stats
```

## Development Workflow

### 1. Code Changes
- Make changes to backend code
- API container will automatically reload (in development mode)

### 2. Database Schema Changes
1. Modify entity models in `Models/` folder
2. Create migration: `docker-compose exec api dotnet ef migrations add MigrationName`
3. Apply migration: `docker-compose exec api dotnet ef database update`

### 3. Environment Variables
Modify `docker-compose.yml` or create `.env` file:
```
POSTGRES_PASSWORD=your_secure_password
API_VERSION=v1
```

## Production Considerations

### 1. Security
- Change default passwords
- Use secrets management
- Configure SSL/TLS
- Set up proper firewall rules

### 2. Performance
- Configure connection pooling
- Set up database backups
- Monitor resource usage
- Configure logging

### 3. Deployment
- Use multi-stage builds for smaller images
- Configure health checks
- Set up container orchestration
- Configure reverse proxy

---

**Note**: This setup is optimized for development. For production deployment, additional security and performance configurations are required.
