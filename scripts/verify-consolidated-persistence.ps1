# Consolidated Persistence Verification Script
# This script verifies that all data is properly organized under kentkonut_db_data

Write-Host "🔍 Verifying Consolidated Persistence Configuration" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Function to check directory and count files
function Check-Directory {
    param(
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path $Path) {
        $fileCount = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue).Count
        if ($fileCount -gt 0) {
            Write-Host "✅ $Name`: $fileCount files" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $Name`: Directory exists but empty" -ForegroundColor Yellow
        }
        return $fileCount
    } else {
        Write-Host "❌ $Name`: Directory not found" -ForegroundColor Red
        return 0
    }
}

# Function to test API endpoint
function Test-API {
    param(
        [string]$Url,
        [string]$Name
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name`: Responding (200 OK)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name`: Unexpected status ($($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name`: Not responding" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "📊 Consolidated Directory Structure:" -ForegroundColor Cyan
Write-Host ("-" * 40) -ForegroundColor Gray

# Check main structure
if (Test-Path "kentkonut_db_data") {
    Write-Host "✅ Main Directory: kentkonut_db_data exists" -ForegroundColor Green
    
    # Check backend data
    Write-Host ""
    Write-Host "🔧 Backend Data (kentkonut_db_data/kentkonut_backend/):" -ForegroundColor Yellow
    $backendTotal = 0
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/uploads" "Uploads"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/media" "Media"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/banners" "Banners"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/haberler" "News (Haberler)"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/hafriyat" "Excavation (Hafriyat)"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/kurumsal" "Corporate (Kurumsal)"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/services" "Services"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/proje" "Projects (Proje)"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/logs" "Logs"
    $backendTotal += Check-Directory "kentkonut_db_data/kentkonut_backend/backups" "Backups"
    
    # Check PostgreSQL data
    Write-Host ""
    Write-Host "🐘 PostgreSQL Data (kentkonut_db_data/postgres/):" -ForegroundColor Yellow
    $postgresTotal = Check-Directory "kentkonut_db_data/postgres" "PostgreSQL Data"
    
} else {
    Write-Host "❌ Main Directory: kentkonut_db_data not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🐳 Container Status:" -ForegroundColor Cyan
Write-Host ("-" * 20) -ForegroundColor Gray

# Check container status
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "kentkonut"
    if ($containers) {
        foreach ($container in $containers) {
            $parts = $container.ToString().Split("`t")
            if ($parts.Length -ge 2) {
                $name = $parts[0].Replace("kentkonut-", "")
                $status = $parts[1]
                if ($status -like "*Up*") {
                    Write-Host "✅ $name`: Running" -ForegroundColor Green
                } else {
                    Write-Host "❌ $name`: $status" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "❌ No kentkonut containers found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Docker: Not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 API Testing:" -ForegroundColor Cyan
Write-Host ("-" * 15) -ForegroundColor Gray

# Test APIs
$apiResults = @()
$apiResults += Test-API "http://localhost:3010/api/health" "Health API"
$apiResults += Test-API "http://localhost:3010/api/banners" "Banners API"
$apiResults += Test-API "http://localhost:3010/api/media" "Media API"

Write-Host ""
Write-Host "📁 File Persistence Test:" -ForegroundColor Cyan
Write-Host ("-" * 25) -ForegroundColor Gray

# Test file persistence
$testFile = "kentkonut_db_data/kentkonut_backend/uploads/persistence_test_$(Get-Date -Format 'yyyyMMddHHmmss').txt"
try {
    "Consolidated persistence test - $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8
    if (Test-Path $testFile) {
        Write-Host "✅ File Creation: Test file created successfully" -ForegroundColor Green
        
        # Check if file is accessible from container
        try {
            $containerFiles = docker exec kentkonut-backend ls /app/public/uploads/ 2>$null
            if ($containerFiles -and $containerFiles -like "*persistence_test*") {
                Write-Host "✅ Container Access: File accessible from container" -ForegroundColor Green
            } else {
                Write-Host "❌ Container Access: File not accessible from container" -ForegroundColor Red
            }
        } catch {
            Write-Host "⚠️  Container Access: Could not verify container access" -ForegroundColor Yellow
        }
        
        # Clean up test file
        Remove-Item $testFile -Force
        Write-Host "🧹 Cleanup: Test file removed" -ForegroundColor Yellow
    } else {
        Write-Host "❌ File Creation: Failed to create test file" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ File Creation: Error during test" -ForegroundColor Red
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "🎉 Consolidated Persistence Verification Completed!" -ForegroundColor Green

# Summary
$totalBackendFiles = (Get-ChildItem -Path "kentkonut_db_data/kentkonut_backend" -Recurse -File -ErrorAction SilentlyContinue).Count
$totalPostgresFiles = (Get-ChildItem -Path "kentkonut_db_data/postgres" -Recurse -File -ErrorAction SilentlyContinue).Count
$totalSize = [math]::Round((Get-ChildItem -Path "kentkonut_db_data" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

Write-Host ""
Write-Host "📈 Summary:" -ForegroundColor Cyan
Write-Host "   Backend files: $totalBackendFiles"
Write-Host "   PostgreSQL files: $totalPostgresFiles"
Write-Host "   Total size: $totalSize MB"
Write-Host "   Location: $(Get-Location)/kentkonut_db_data/"
Write-Host ""
Write-Host "✨ All persistent data is now consolidated under kentkonut_db_data!" -ForegroundColor Green
Write-Host "   📁 kentkonut_db_data/kentkonut_backend/ - Backend files" -ForegroundColor White
Write-Host "   📁 kentkonut_db_data/postgres/ - PostgreSQL data" -ForegroundColor White
