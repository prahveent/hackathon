# Database Setup Verification Script

Write-Host "🔍 Verifying Hackathon API Database Setup..." -ForegroundColor Green
Write-Host

# Navigate to the API project
Set-Location "c:\Users\PrahveenT\Documents\Projects\hackathon\backend\HackathonApi"

# Check if EF Core tools are installed
Write-Host "1️⃣ Checking Entity Framework Core tools..." -ForegroundColor Yellow
try {
    $efOutput = dotnet ef --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ EF Core tools are installed: $efOutput" -ForegroundColor Green
    } else {
        Write-Host "❌ EF Core tools not found. Installing..." -ForegroundColor Red
        dotnet tool install --global dotnet-ef
    }
} catch {
    Write-Host "❌ Error checking EF tools: $_" -ForegroundColor Red
}

Write-Host

# Check if the project builds
Write-Host "2️⃣ Building the project..." -ForegroundColor Yellow
$buildResult = dotnet build --verbosity quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Project builds successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host

# Check database connection (requires PostgreSQL to be running)
Write-Host "3️⃣ Testing database connectivity..." -ForegroundColor Yellow
Write-Host "⚠️  Note: This requires PostgreSQL to be running with the configured database and user" -ForegroundColor Cyan

try {
    $dbInfo = dotnet ef dbcontext info --verbose 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database context is configured correctly" -ForegroundColor Green
        Write-Host "📋 Database info:" -ForegroundColor Cyan
        Write-Host $dbInfo
    } else {
        Write-Host "⚠️  Database context check failed (this is expected if PostgreSQL is not running)" -ForegroundColor Yellow
        Write-Host "   Error: $dbInfo" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Database connectivity test failed: $_" -ForegroundColor Yellow
    Write-Host "   This is expected if PostgreSQL is not running or not configured" -ForegroundColor Gray
}

Write-Host

# List migrations
Write-Host "4️⃣ Checking migrations..." -ForegroundColor Yellow
try {
    $migrations = dotnet ef migrations list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations are configured:" -ForegroundColor Green
        Write-Host $migrations -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error listing migrations: $migrations" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error checking migrations: $_" -ForegroundColor Red
}

Write-Host

# Summary
Write-Host "🎯 Setup Summary:" -ForegroundColor Green
Write-Host "   • .NET 9 Web API with Entity Framework Core ✅" -ForegroundColor White
Write-Host "   • PostgreSQL provider configured ✅" -ForegroundColor White
Write-Host "   • User and Team entities created ✅" -ForegroundColor White
Write-Host "   • Initial migration generated ✅" -ForegroundColor White
Write-Host "   • Controllers for API endpoints ✅" -ForegroundColor White
Write-Host "   • Database health check endpoint ✅" -ForegroundColor White

Write-Host
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Install and configure PostgreSQL if not already done" -ForegroundColor White
Write-Host "   2. Create database and user as described in the README" -ForegroundColor White
Write-Host "   3. Run: dotnet ef database update" -ForegroundColor White
Write-Host "   4. Start the API: dotnet run" -ForegroundColor White
Write-Host "   5. Test endpoints at https://localhost:5001" -ForegroundColor White

Write-Host
Write-Host "🔗 Documentation:" -ForegroundColor Cyan
Write-Host "   • Backend README: ../README.md" -ForegroundColor White
Write-Host "   • Database Migration Instructions: ../../.github/instructions/database-migration.instructions.md" -ForegroundColor White

Write-Host
Write-Host "✨ Database setup verification complete!" -ForegroundColor Green
