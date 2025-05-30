# Development utilities for Docker environment

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "logs", "restart", "db-shell", "api-shell", "clean")]
    [string]$Action = "status"
)

switch ($Action) {
    "status" {
        Write-Host "📋 Service Status:" -ForegroundColor Cyan
        docker-compose ps
        Write-Host "`n🔍 Container Health:" -ForegroundColor Cyan
        docker-compose exec api curl -s http://localhost:8080/health/db | ConvertFrom-Json | Format-Table
    }
    
    "logs" {
        Write-Host "📄 Service Logs:" -ForegroundColor Cyan
        docker-compose logs -f --tail=50
    }
    
    "restart" {
        Write-Host "🔄 Restarting API service..." -ForegroundColor Yellow
        docker-compose restart api
        Start-Sleep -Seconds 5
        Write-Host "✅ API service restarted." -ForegroundColor Green
    }
    
    "db-shell" {
        Write-Host "🐘 Opening PostgreSQL shell..." -ForegroundColor Cyan
        docker-compose exec postgres psql -U hackathon_user -d hackathon_db
    }
    
    "api-shell" {
        Write-Host "🔧 Opening API container shell..." -ForegroundColor Cyan
        docker-compose exec api /bin/bash
    }
    
    "clean" {
        Write-Host "🧹 Cleaning up containers and images..." -ForegroundColor Yellow
        docker-compose down -v --rmi all --remove-orphans
        docker system prune -f
        Write-Host "✅ Cleanup completed." -ForegroundColor Green
    }
    
    default {
        Write-Host "📋 Available actions: status, logs, restart, db-shell, api-shell, clean" -ForegroundColor Cyan
    }
}

if ($Action -eq "status") {
    Write-Host "`n📝 Usage examples:" -ForegroundColor Cyan
    Write-Host "   .\dev-utils.ps1 logs      # View logs" -ForegroundColor White
    Write-Host "   .\dev-utils.ps1 restart   # Restart API" -ForegroundColor White
    Write-Host "   .\dev-utils.ps1 db-shell  # Connect to database" -ForegroundColor White
}
