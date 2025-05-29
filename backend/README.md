# Hackathon API

A .NET 9 Web API project for the hackathon.

## Getting Started

### Prerequisites
- .NET 9 SDK

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
- `GET /api/api/health` - Returns health status with timestamp
- `GET /openapi` - OpenAPI specification (Development only)

### Project Structure

```
HackathonApi/
├── Controllers/          # API Controllers
│   └── ApiController.cs  # Sample API controller
├── Properties/           # Project properties
├── Program.cs           # Application entry point
├── HackathonApi.csproj  # Project file
└── appsettings.json     # Configuration files
```

## Development

This is a minimal Web API setup ready for extension. You can add:
- More controllers in the `Controllers/` folder
- Services and dependency injection
- Database connectivity
- Authentication and authorization
- Additional middleware
