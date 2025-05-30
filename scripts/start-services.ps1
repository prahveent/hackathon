# Docker Management Scripts for Hackathon Project
# Run this script from the project root directory

Write-Host "🚀 Starting Hackathon Project Services..." -ForegroundColor Green

# Build and start all services
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service status
Write-Host "`n📋 Service Status:" -ForegroundColor Cyan
docker-compose ps

# Check logs
Write-Host "`n📄 Recent logs:" -ForegroundColor Cyan
docker-compose logs --tail=10

# Test API endpoints
Write-Host "`n🔍 Testing API endpoints..." -ForegroundColor Green

try {
    # Test main endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -TimeoutSec 10
    Write-Host "✅ Main endpoint: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Main endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    # Test database health check
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health/db" -Method Get -TimeoutSec 10
    Write-Host "✅ Database health: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Database health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Available Services:" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:5000" -ForegroundColor White
Write-Host "   • API Health Check: http://localhost:5000/health/db" -ForegroundColor White
Write-Host "   • API OpenAPI/Swagger: http://localhost:5000/openapi/v1.json" -ForegroundColor White
Write-Host "   • PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   • pgAdmin: http://localhost:5050 (admin@hackathon.local / admin123)" -ForegroundColor White

Write-Host "`n📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "   • View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   • Stop services: docker-compose down" -ForegroundColor White
Write-Host "   • Restart API: docker-compose restart api" -ForegroundColor White
Write-Host "   • Database shell: docker-compose exec postgres psql -U hackathon_user -d hackathon_db" -ForegroundColor White

Write-Host "`n✨ Setup completed! All services should be running." -ForegroundColor Green
