# Test script for Mock Database API endpoints
Write-Host "Testing SmartCart Mock Database API..." -ForegroundColor Cyan

try {
    # Test health endpoint
    Write-Host "`nTesting Health Check..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "https://localhost:5001/health/db" -Method GET
    Write-Host "✅ Health Check Response:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 3

    # Test mock data endpoint
    Write-Host "`nTesting Mock Data Endpoint..." -ForegroundColor Yellow
    $mockDataResponse = Invoke-RestMethod -Uri "https://localhost:5001/mock-data" -Method GET
    Write-Host "✅ Mock Data Response:" -ForegroundColor Green
    $mockDataResponse | ConvertTo-Json -Depth 4

    # Test login with mock customer
    Write-Host "`nTesting Customer Login..." -ForegroundColor Yellow
    $loginData = @{
        email = "john.doe@example.com"
        password = "Password123!"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $loginResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/auth/login" -Method POST -Body $loginData -Headers $headers
    Write-Host "✅ Customer Login Response:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 4

    Write-Host "`n🎉 All tests passed! Mock database is working correctly." -ForegroundColor Green

} catch {
    Write-Host "❌ Error testing API: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the API is running on https://localhost:5001" -ForegroundColor Yellow
} 