param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod")]
    [string]$Mode,
    
    [switch]$Restart
)

$rootDir = $PSScriptRoot
$frontendDir = Join-Path $rootDir "kentkonut-frontend"
$backendDir = Join-Path $rootDir "kentkonut-backend"
$configDir = Join-Path $backendDir "config"

# Modu ayarla
if ($Mode -eq "dev") {
    # Development modu
    Write-Host "DEVELOPMENT moduna geciliyor..." -ForegroundColor Green
    
    # Doğru mod dosyasını kopyala
    $sourceFile = Join-Path $configDir "development-mode.ts"
    $targetFile = Join-Path $configDir "production-mode.ts"
    Copy-Item -Path $sourceFile -Destination $targetFile -Force
    
    $env:NODE_ENV = "development"
} else {
    # Production modu
    Write-Host "PRODUCTION moduna geciliyor..." -ForegroundColor Yellow
    
    # Doğru mod dosyasını kopyala
    $sourceFile = Join-Path $configDir "production-mode.ts"
    $targetFile = Join-Path $configDir "production-mode.ts"
    # Dosya içeriğini güncelle
    Set-Content -Path $targetFile -Value "// Bu dosya production modunu aktif eder`n// Uygulamanın production modunda çalışmasını sağlar`n`n// Production modu aktif`nexport const IS_PRODUCTION = true;"
    
    $env:NODE_ENV = "production"
}

# Ortam değişkenini kaydet
$envContent = "NODE_ENV=$($env:NODE_ENV)"
Set-Content -Path (Join-Path $frontendDir ".env") -Value $envContent
Set-Content -Path (Join-Path $backendDir ".env") -Value $envContent

Write-Host "Mod basariyla degistirildi: $($env:NODE_ENV)" -ForegroundColor Cyan

# Servisleri yeniden başlat
if ($Restart) {
    Write-Host "Servisler yeniden baslatiliyor..." -ForegroundColor Magenta
    
    # Çalışan servisleri durdur
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "kentkonut" } | Stop-Process -Force
    
    # Yeni terminal pencereleri aç
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev"
    
    Write-Host "Servisler yeniden baslatildi!" -ForegroundColor Green
}

Write-Host "Kullanim Kilavuzu:" -ForegroundColor Cyan
Write-Host "* Development modu: .\switch-mode.ps1 -Mode dev [-Restart]" -ForegroundColor White
Write-Host "* Production modu: .\switch-mode.ps1 -Mode prod [-Restart]" -ForegroundColor White
Write-Host "Erisim Bilgileri:" -ForegroundColor Cyan
if ($env:NODE_ENV -eq "development") {
    Write-Host "* Frontend: http://localhost:3020" -ForegroundColor White
    Write-Host "* Backend: http://localhost:3021" -ForegroundColor White
} else {
    Write-Host "* Frontend: http://172.41.42.51:3020" -ForegroundColor White
    Write-Host "* Backend: http://172.41.42.51:3021" -ForegroundColor White
}
Write-Host "* Veritabani: 172.41.42.51:5433" -ForegroundColor White