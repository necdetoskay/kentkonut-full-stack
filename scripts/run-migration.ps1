# scripts/run-migration.ps1
# PowerShell wrapper to run the PostgreSQL migration

Write-Host "🗄️ PostgreSQL Data Migration to Local Directory" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue
Write-Host ""

# Check if Git Bash is available
$gitBashPath = ""
$possiblePaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Git\bin\bash.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitBashPath = $path
        break
    }
}

if ($gitBashPath -eq "") {
    Write-Host "❌ Git Bash not found!" -ForegroundColor Red
    Write-Host "Please install Git for Windows or run the migration manually:" -ForegroundColor Yellow
    Write-Host "  1. Open Git Bash" -ForegroundColor White
    Write-Host "  2. Navigate to: $PWD" -ForegroundColor White
    Write-Host "  3. Run: ./scripts/migrate-db-to-local.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use WSL if available" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found Git Bash at: $gitBashPath" -ForegroundColor Green
Write-Host ""

# Confirm migration
Write-Host "⚠️ This will migrate PostgreSQL data from Docker volumes to local directory" -ForegroundColor Yellow
Write-Host "📁 Target directory: kentkonut_db_data/" -ForegroundColor Yellow
Write-Host "💾 Backups will be created automatically" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to proceed with the migration? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting migration..." -ForegroundColor Green
Write-Host ""

# Run the migration script using Git Bash
try {
    & $gitBashPath -c "cd '$PWD' && ./scripts/migrate-db-to-local.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
        Write-Host "📁 Database data is now stored in: kentkonut_db_data/" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Verify migration: ./scripts/verify-db-migration.sh" -ForegroundColor White
        Write-Host "  2. Test your application thoroughly" -ForegroundColor White
        Write-Host "  3. Add kentkonut_db_data/ to .gitignore" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Check the error messages above for details" -ForegroundColor Yellow
        Write-Host "You can rollback using: ./scripts/rollback-db-migration.sh" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error running migration script: $_" -ForegroundColor Red
    Write-Host "Please run manually using Git Bash or WSL" -ForegroundColor Yellow
}
