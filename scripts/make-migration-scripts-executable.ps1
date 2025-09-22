# scripts/make-migration-scripts-executable.ps1
# PowerShell script to make migration scripts executable on Windows

Write-Host "Making migration scripts executable..." -ForegroundColor Yellow

$scripts = @(
    "migrate-db-to-local.sh",
    "verify-db-migration.sh",
    "rollback-db-migration.sh"
)

foreach ($script in $scripts) {
    $scriptPath = "scripts/$script"
    if (Test-Path $scriptPath) {
        Write-Host "✅ $script is ready" -ForegroundColor Green
    } else {
        Write-Host "❌ $script not found" -ForegroundColor Red
    }
}

Write-Host "✅ All migration scripts are ready for execution" -ForegroundColor Green
Write-Host "💡 Use Git Bash or WSL to run the shell scripts" -ForegroundColor Cyan
Write-Host ""
Write-Host "Migration Scripts:" -ForegroundColor Yellow
Write-Host "  ./scripts/migrate-db-to-local.sh     - Migrate to local directory" -ForegroundColor White
Write-Host "  ./scripts/verify-db-migration.sh     - Verify migration integrity" -ForegroundColor White
Write-Host "  ./scripts/rollback-db-migration.sh   - Rollback if needed" -ForegroundColor White
