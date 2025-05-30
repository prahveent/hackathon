# Test script for SmartCart Product API endpoints
# Make sure the backend is running on https://localhost:7103

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SmartCart Product API Testing Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$baseUrl = "https://localhost:7103"

# Function to make API calls
function Test-Endpoint {
    param(
        [string]$url,
        [string]$description
    )
    
    Write-Host "`n$description" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -SkipCertificateCheck
        Write-Host "✓ Success" -ForegroundColor Green
        if ($response.GetType().Name -eq "Object[]") {
            Write-Host "  Returned: $($response.Count) items" -ForegroundColor White
        } elseif ($response.products) {
            Write-Host "  Returned: $($response.products.Count) products, Total: $($response.totalCount)" -ForegroundColor White
        } else {
            Write-Host "  Returned: Single item" -ForegroundColor White
        }
        return $response
    }
    catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test endpoints
Write-Host "`n1. Testing Health Check..." -ForegroundColor Magenta
Test-Endpoint "$baseUrl/health/db" "Database Health Check"

Write-Host "`n2. Testing Product Endpoints..." -ForegroundColor Magenta
Test-Endpoint "$baseUrl/api/products" "Get All Products (Default)"
Test-Endpoint "$baseUrl/api/products?page=1&pageSize=5" "Get Products with Pagination"
Test-Endpoint "$baseUrl/api/products/featured" "Get Featured Products"

Write-Host "`n3. Testing Category Endpoints..." -ForegroundColor Magenta
$categories = Test-Endpoint "$baseUrl/api/products/categories" "Get All Categories"

if ($categories -and $categories.Count -gt 0) {
    $categoryId = $categories[0].id
    Test-Endpoint "$baseUrl/api/products/categories/$categoryId" "Get Products by Category ($($categories[0].name))"
}

Write-Host "`n4. Testing Brand Endpoints..." -ForegroundColor Magenta
$brands = Test-Endpoint "$baseUrl/api/products/brands" "Get All Brands"

if ($brands -and $brands.Count -gt 0) {
    $brandId = $brands[0].id
    Test-Endpoint "$baseUrl/api/products/brands/$brandId" "Get Products by Brand ($($brands[0].name))"
}

Write-Host "`n5. Testing Search Functionality..." -ForegroundColor Magenta
Test-Endpoint "$baseUrl/api/products/search?q=headphones" "Search for 'headphones'"
Test-Endpoint "$baseUrl/api/products?query=wireless" "Search for 'wireless'"
Test-Endpoint "$baseUrl/api/products?minPrice=50&maxPrice=200" "Filter by Price Range ($50-$200)"
Test-Endpoint "$baseUrl/api/products?sortBy=price&sortDirection=desc" "Sort by Price (Descending)"
Test-Endpoint "$baseUrl/api/products?featured=true" "Get Featured Products Only"
Test-Endpoint "$baseUrl/api/products?inStock=true" "Get In-Stock Products Only"

Write-Host "`n6. Testing Individual Product..." -ForegroundColor Magenta
$products = Test-Endpoint "$baseUrl/api/products?pageSize=1" "Get First Product"

if ($products -and $products.products -and $products.products.Count -gt 0) {
    $productId = $products.products[0].id
    Test-Endpoint "$baseUrl/api/products/$productId" "Get Product Details (ID: $productId)"
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Product API Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. All endpoints should return ✓ Success" -ForegroundColor White
Write-Host "2. Check the frontend integration" -ForegroundColor White
Write-Host "3. Test the UI components" -ForegroundColor White 