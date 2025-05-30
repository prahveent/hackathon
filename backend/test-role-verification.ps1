# Role Verification Test Script for SmartCart
Write-Host "Testing SmartCart Role-Based Authentication System" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$baseUrl = "https://localhost:7103"
$apiUrl = "$baseUrl/api"

# Test accounts
$customers = @(
    @{ email = "john.doe@example.com"; password = "Password123!"; name = "John Doe"; status = "Verified" },
    @{ email = "jane.smith@example.com"; password = "Password123!"; name = "Jane Smith"; status = "Verified" },
    @{ email = "mike.johnson@example.com"; password = "Password123!"; name = "Mike Johnson"; status = "Unverified" }
)

$admins = @(
    @{ email = "admin@smartcart.com"; password = "AdminPass123!"; name = "Admin User"; level = "SuperAdmin" },
    @{ email = "manager@smartcart.com"; password = "ManagerPass123!"; name = "Store Manager"; level = "Manager" }
)

function Test-Login {
    param($email, $password, $expectedRole)
    
    try {
        $loginData = @{
            email = $email
            password = $password
        } | ConvertTo-Json

        $headers = @{ "Content-Type" = "application/json" }
        
        $response = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method POST -Body $loginData -Headers $headers
        
        $hasExpectedRole = $response.user.roles -contains $expectedRole
        $rolesList = $response.user.roles -join ", "
        
        if ($hasExpectedRole) {
            Write-Host "   Success - Roles: [$rolesList]" -ForegroundColor Green
            return $response.token
        } else {
            Write-Host "   Role mismatch - Expected: $expectedRole, Got: [$rolesList]" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "   Login failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-AuthenticatedEndpoint {
    param($token, $endpoint, $description)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$apiUrl$endpoint" -Method GET -Headers $headers
        Write-Host "   $description - Access granted" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   $description - Access denied" -ForegroundColor Yellow
        return $false
    }
}

try {
    # Test health check first
    Write-Host "`nTesting API Health..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$baseUrl/health/db" -Method GET
    Write-Host "API Health: $($health.status) - Users: $($health.userCount)" -ForegroundColor Green

    # Test Customer Logins
    Write-Host "`nTesting CUSTOMER Role Authentication..." -ForegroundColor Yellow
    foreach ($customer in $customers) {
        Write-Host "Testing: $($customer.email) ($($customer.name) - $($customer.status))" -ForegroundColor White
        $token = Test-Login -email $customer.email -password $customer.password -expectedRole "customer"
        
        if ($token) {
            Test-AuthenticatedEndpoint -token $token -endpoint "/auth/me" -description "Get User Info"
        }
    }

    # Test Admin Logins
    Write-Host "`nTesting ADMIN Role Authentication..." -ForegroundColor Yellow
    foreach ($admin in $admins) {
        Write-Host "Testing: $($admin.email) ($($admin.name) - $($admin.level))" -ForegroundColor White
        $token = Test-Login -email $admin.email -password $admin.password -expectedRole "admin"
        
        if ($token) {
            Test-AuthenticatedEndpoint -token $token -endpoint "/auth/me" -description "Get User Info"
        }
    }

    Write-Host "`nRole Verification Test Complete!" -ForegroundColor Green

} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the API is running on https://localhost:7103" -ForegroundColor Yellow
}

# Display credentials summary
Write-Host "`n============= TEST ACCOUNT CREDENTIALS =============" -ForegroundColor Cyan

Write-Host "`nCUSTOMER ACCOUNTS:" -ForegroundColor Green
foreach ($customer in $customers) {
    Write-Host "Email: $($customer.email)" -ForegroundColor White
    Write-Host "Password: $($customer.password)" -ForegroundColor Gray
    Write-Host "Name: $($customer.name) ($($customer.status))" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "ADMIN ACCOUNTS:" -ForegroundColor Red
foreach ($admin in $admins) {
    Write-Host "Email: $($admin.email)" -ForegroundColor White
    Write-Host "Password: $($admin.password)" -ForegroundColor Gray  
    Write-Host "Name: $($admin.name) ($($admin.level))" -ForegroundColor Cyan
    Write-Host ""
} 