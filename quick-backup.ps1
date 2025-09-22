# KentKonut Hızlı Yedekleme
# Sadece kritik bileşenleri yedekler (Docker image'ları ve veritabanı)

param(
    [string]$BackupDir = "./quick-backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "=== KentKonut Hızlı Yedekleme ===" -ForegroundColor Green

# Yedekleme dizinini oluştur
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host "\n1. Docker Image'ları Yedekleniyor..." -ForegroundColor Cyan

# Sadece çalışan container'ları commit et
docker commit kentkonut-backend-prod "kentkonut-backend-quick:$timestamp"
docker commit kentkonut-frontend-prod "kentkonut-frontend-quick:$timestamp"
docker commit kentkonut-postgres-prod "kentkonut-postgres-quick:$timestamp"
docker commit kentkonut-redis-prod "kentkonut-redis-quick:$timestamp"

Write-Host "\n2. Veritabanı Dump'ları Alınıyor..." -ForegroundColor Cyan

# PostgreSQL dump
docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > "$BackupDir/postgres-quick-$timestamp.sql"

# Redis dump
docker exec kentkonut-redis-prod redis-cli -a redis123 BGSAVE 2>$null
Start-Sleep -Seconds 2
docker cp kentkonut-redis-prod:/data/dump.rdb "$BackupDir/redis-quick-$timestamp.rdb"

Write-Host "\n3. Konfigürasyon Yedekleniyor..." -ForegroundColor Cyan
Copy-Item "docker-compose.production.yml" "$BackupDir/" -Force

# Hızlı geri yükleme script'i oluştur
$quickRestore = @"
# Hızlı Geri Yükleme - $timestamp
# Bu dosyayı çalıştırmak için: .\quick-restore-$timestamp.ps1

Write-Host "Hızlı geri yükleme başlatılıyor..." -ForegroundColor Green

# Container'ları durdur
docker-compose -f docker-compose.production.yml down

# Image'ları yeniden etiketle
docker tag kentkonut-backend-quick:$timestamp kentkonut-backend:latest
docker tag kentkonut-frontend-quick:$timestamp kentkonut-frontend:latest
docker tag kentkonut-postgres-quick:$timestamp postgres:15-alpine
docker tag kentkonut-redis-quick:$timestamp redis:7-alpine

# Container'ları başlat
docker-compose -f docker-compose.production.yml up -d

Write-Host "Hızlı geri yükleme tamamlandı!" -ForegroundColor Green
Write-Host "Frontend: http://172.41.42.51:3020" -ForegroundColor Yellow
Write-Host "Backend: http://172.41.42.51:3021" -ForegroundColor Yellow
"@

$quickRestore | Out-File "$BackupDir/quick-restore-$timestamp.ps1" -Encoding UTF8

# Bilgi dosyası
$info = @"
Hızlı Yedekleme - $timestamp
Tarih: $(Get-Date)
Dizin: $BackupDir

Yedeklenen Image'lar:
- kentkonut-backend-quick:$timestamp
- kentkonut-frontend-quick:$timestamp
- kentkonut-postgres-quick:$timestamp
- kentkonut-redis-quick:$timestamp

Geri Yüklemek İçin:
.\quick-restore-$timestamp.ps1
"@

$info | Out-File "$BackupDir/INFO.txt" -Encoding UTF8

Write-Host "\n=== Hızlı Yedekleme Tamamlandı ===" -ForegroundColor Green
Write-Host "Dizin: $BackupDir" -ForegroundColor Yellow
Write-Host "Geri yüklemek için: $BackupDir\quick-restore-$timestamp.ps1" -ForegroundColor Cyan
Write-Host "\nHızlı yedekleme tamamlandı! ⚡" -ForegroundColor Green