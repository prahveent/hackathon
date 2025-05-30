# Hackathon Project

A full-stack application with .NET 9 Web API backend, PostgreSQL database, and frontend components.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Start all services**:
   ```powershell
   .\scripts\start-services.ps1
   ```

3. **Access the application**:
   - API: http://localhost:5000
   - Database Admin: http://localhost:5050  
   - API Health Check: http://localhost:5000/health/db

4. **Stop services**:
   ```powershell
   .\scripts\stop-services.ps1
   ```

### Option 2: Local Development

### Prerequisites
- .NET 9 SDK
- PostgreSQL (version 12 or higher)
- Git

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd hackathon
   ```

2. **Set up the Database:**
   ```sql
   -- Connect to PostgreSQL as postgres user
   CREATE DATABASE hackathon_db;
   CREATE USER hackathon_user WITH PASSWORD 'hackathon_password';
   GRANT ALL PRIVILEGES ON DATABASE hackathon_db TO hackathon_user;
   ```

3. **Run Database Migrations:**
   ```bash
   cd backend/HackathonApi
   dotnet tool install --global dotnet-ef
   dotnet ef database update
   ```

4. **Run the Backend API:**
   ```bash
   cd backend
   dotnet run --project HackathonApi
   ```
   
   The API will be available at `https://localhost:5001`

5. **Frontend Setup:**
   ```bash
   cd frontend
   # Frontend setup instructions will be added here
   ```

## 📁 Project Structure

```
hackathon/
├── .github/              # GitHub configuration and workflows
│   └── copilot-instructions.md
├── backend/              # .NET 9 Web API
│   ├── hackathon.sln     # Solution file
│   ├── README.md         # Backend-specific documentation
│   └── HackathonApi/     # Main API project
├── docs/                 # Project documentation
├── frontend/             # Frontend application (to be configured)
└── README.md            # This file
```

## 🛠️ Development

### Backend (.NET 9 Web API)
- **Location:** `backend/HackathonApi/`
- **Framework:** .NET 9
- **Database:** PostgreSQL with Entity Framework Core
- **Features:** OpenAPI/Swagger, Controllers, Health checks, User/Team management
- **Documentation:** See `backend/README.md` for detailed setup

### Frontend
- **Location:** `frontend/`
- **Status:** To be configured based on hackathon requirements

## 📖 Documentation

- **Backend API:** See `backend/README.md`
- **Project Documentation:** See `docs/`
- **Development Guidelines:** See `.github/copilot-instructions.md`

## 🔧 Available Scripts

From the repository root:

```bash
# Build the entire solution
cd backend && dotnet build

# Run the API
cd backend && dotnet run --project HackathonApi

# Test the API
cd backend && dotnet test
```

## 🌐 API Endpoints

Once running, the API provides:

- **Health Check:** `GET /` - Returns "Hackathon API is running!"
- **Database Health:** `GET /health/db` - Database connectivity check
- **Users API:** `GET/POST /api/users` - User management
- **Teams API:** `GET/POST /api/teams` - Team management  
- **OpenAPI Docs:** `GET /openapi` - API documentation (development only)

## 📝 Notes

- This project uses PowerShell-compatible commands for Windows development
- All paths are relative to the repository root for cross-platform compatibility
- See individual component README files for specific setup instructions

---

**Happy Hacking!** 🎉
