# Stop and cleanup Docker services
Write-Host "🛑 Stopping Hackathon Project Services..." -ForegroundColor Yellow

# Stop all services
docker-compose down

Write-Host "✅ All services stopped." -ForegroundColor Green

# Optional: Remove volumes (uncomment if you want to reset database)
# Write-Host "🗑️ Removing volumes..." -ForegroundColor Yellow
# docker-compose down -v

Write-Host "`n📝 To remove everything including volumes (reset database):" -ForegroundColor Cyan
Write-Host "   docker-compose down -v" -ForegroundColor White
