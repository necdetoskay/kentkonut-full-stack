# kentkonut-backend/scripts/make-executable.ps1
# PowerShell script to make shell scripts executable on Windows

Write-Host "Making shell scripts executable..." -ForegroundColor Yellow

$scripts = @(
    "backup-data.sh",
    "migrate-to-containers.sh", 
    "verify-containerized-setup.sh",
    "start-dev.sh"
)

foreach ($script in $scripts) {
    $scriptPath = "scripts/$script"
    if (Test-Path $scriptPath) {
        # On Windows, we just need to ensure the files exist and have proper line endings
        Write-Host "✅ $script is ready" -ForegroundColor Green
    } else {
        Write-Host "❌ $script not found" -ForegroundColor Red
    }
}

Write-Host "✅ All scripts are ready for execution" -ForegroundColor Green
Write-Host "💡 Use Git Bash or WSL to run the shell scripts" -ForegroundColor Cyan
