# KentKonut Uygulama Yedekleme Sistemi
# Bu script uygulamanın mevcut durumunu tamamen yedekler

param(
    [string]$BackupDir = "./backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "=== KentKonut Uygulama Yedekleme Başlatılıyor ===" -ForegroundColor Green
Write-Host "Yedekleme Dizini: $BackupDir" -ForegroundColor Yellow

# Yedekleme dizinini oluştur
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/docker-images" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/database" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/config" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/source-code" -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host "\n1. Docker Container'ları Image Olarak Yedekleniyor..." -ForegroundColor Cyan

# Backend container yedekleme
Write-Host "   - Backend container yedekleniyor..."
docker commit kentkonut-backend-prod "kentkonut-backend-backup:$timestamp"
docker save "kentkonut-backend-backup:$timestamp" -o "$BackupDir/docker-images/backend-$timestamp.tar"

# Frontend container yedekleme
Write-Host "   - Frontend container yedekleniyor..."
docker commit kentkonut-frontend-prod "kentkonut-frontend-backup:$timestamp"
docker save "kentkonut-frontend-backup:$timestamp" -o "$BackupDir/docker-images/frontend-$timestamp.tar"

# PostgreSQL container yedekleme
Write-Host "   - PostgreSQL container yedekleniyor..."
docker commit kentkonut-postgres-prod "kentkonut-postgres-backup:$timestamp"
docker save "kentkonut-postgres-backup:$timestamp" -o "$BackupDir/docker-images/postgres-$timestamp.tar"

# Redis container yedekleme
Write-Host "   - Redis container yedekleniyor..."
docker commit kentkonut-redis-prod "kentkonut-redis-backup:$timestamp"
docker save "kentkonut-redis-backup:$timestamp" -o "$BackupDir/docker-images/redis-$timestamp.tar"

Write-Host "\n2. Veritabanları Yedekleniyor..." -ForegroundColor Cyan

# PostgreSQL dump
Write-Host "   - PostgreSQL veritabanı dump alınıyor..."
docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > "$BackupDir/database/postgres-$timestamp.sql"

# Redis dump
Write-Host "   - Redis veritabanı yedekleniyor..."
docker exec kentkonut-redis-prod redis-cli -a redis123 --rdb "/data/redis-backup-$timestamp.rdb" 2>$null
docker cp "kentkonut-redis-prod:/data/redis-backup-$timestamp.rdb" "$BackupDir/database/"

Write-Host "\n3. Konfigürasyon Dosyaları Yedekleniyor..." -ForegroundColor Cyan

# Docker compose ve environment dosyaları
Copy-Item "docker-compose.production.yml" "$BackupDir/config/" -Force
Copy-Item ".env.production" "$BackupDir/config/" -Force -ErrorAction SilentlyContinue
Copy-Item "kentkonut-backend/.env.production" "$BackupDir/config/backend-env.production" -Force -ErrorAction SilentlyContinue

# Nginx konfigürasyonu
if (Test-Path "nginx.conf") {
    Copy-Item "nginx.conf" "$BackupDir/config/" -Force
}

Write-Host "\n4. Kaynak Kod Yedekleniyor..." -ForegroundColor Cyan

# Git durumunu kaydet
git log -1 --oneline > "$BackupDir/source-code/git-commit-info.txt" 2>$null
git status --porcelain > "$BackupDir/source-code/git-status.txt" 2>$null
git diff > "$BackupDir/source-code/git-diff.txt" 2>$null

# Kritik dosyaları kopyala
robocopy "kentkonut-backend" "$BackupDir/source-code/kentkonut-backend" /E /XD node_modules .next .git /XF "*.log" /NFL /NDL /NJH /NJS
robocopy "kentkonut-frontend" "$BackupDir/source-code/kentkonut-frontend" /E /XD node_modules dist .git /XF "*.log" /NFL /NDL /NJH /NJS

Write-Host "\n5. Yedekleme Bilgi Dosyası Oluşturuluyor..." -ForegroundColor Cyan

# Yedekleme bilgi dosyası oluştur
$backupInfo = @"
=== KentKonut Uygulama Yedekleme Bilgileri ===
Yedekleme Tarihi: $(Get-Date)
Yedekleme Dizini: $BackupDir
Timestamp: $timestamp

=== Docker Container Durumları ===
$(docker ps --filter "name=kentkonut" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

=== Docker Image'ları ===
$(docker images --filter "reference=kentkonut*backup*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}")

=== Yedeklenen Dosyalar ===
Docker Images:
$(Get-ChildItem "$BackupDir/docker-images" | ForEach-Object { "  - $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" })

Database Dumps:
$(Get-ChildItem "$BackupDir/database" | ForEach-Object { "  - $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" })

Config Files:
$(Get-ChildItem "$BackupDir/config" | ForEach-Object { "  - $($_.Name)" })

=== Geri Yükleme Talimatları ===
1. Docker container'ları durdurun: docker-compose -f docker-compose.production.yml down
2. Geri yükleme script'ini çalıştırın: .\restore-system.ps1 -BackupDir "$BackupDir"
3. Veya manuel olarak:
   - docker load -i $BackupDir/docker-images/backend-$timestamp.tar
   - docker load -i $BackupDir/docker-images/frontend-$timestamp.tar
   - docker load -i $BackupDir/docker-images/postgres-$timestamp.tar
   - docker load -i $BackupDir/docker-images/redis-$timestamp.tar
"@

$backupInfo | Out-File "$BackupDir/BACKUP-INFO.txt" -Encoding UTF8

Write-Host "\n=== Yedekleme Tamamlandı ===" -ForegroundColor Green
Write-Host "Yedekleme Dizini: $BackupDir" -ForegroundColor Yellow
Write-Host "Toplam Boyut: $([math]::Round((Get-ChildItem $BackupDir -Recurse | Measure-Object -Property Length -Sum).Sum/1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "\nGeri yüklemek için: .\restore-system.ps1 -BackupDir \"$BackupDir\"" -ForegroundColor Cyan

Write-Host "\nYedekleme başarıyla tamamlandı! 🎉" -ForegroundColor Green