# Hackathon Project

A full-stack application with .NET 9 Web API backend and frontend components.

## 🚀 Quick Start

### Prerequisites
- .NET 9 SDK
- Git

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd hackathon
   ```

2. **Run the Backend API:**
   ```bash
   cd backend
   dotnet run --project HackathonApi
   ```
   
   The API will be available at `https://localhost:5001`

3. **Frontend Setup:**
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
- **Features:** OpenAPI/Swagger, Controllers, Health checks
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
- **API Health:** `GET /api/api/health` - Returns JSON health status
- **OpenAPI Docs:** `GET /openapi` - API documentation (development only)

## 📝 Notes

- This project uses PowerShell-compatible commands for Windows development
- All paths are relative to the repository root for cross-platform compatibility
- See individual component README files for specific setup instructions

---

**Happy Hacking!** 🎉
