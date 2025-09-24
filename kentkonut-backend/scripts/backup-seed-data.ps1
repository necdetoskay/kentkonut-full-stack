# KentKonut Seed Data Backup Script
# Bu script seed verilerini yedekler ve geri yükleme için hazırlar

param(
    [string]$BackupDir = "./seed-backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    [switch]$IncludeMedia = $false
)

Write-Host "=== KentKonut Seed Data Backup ===" -ForegroundColor Green
Write-Host "Yedekleme Dizini: $BackupDir" -ForegroundColor Yellow

# Yedekleme dizinini oluştur
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/database" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupDir/seed-scripts" -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host "`n1. Veritabanı Dump'ı Alınıyor..." -ForegroundColor Cyan

# PostgreSQL dump al
$dbDumpFile = "$BackupDir/database/kentkonut-seed-backup-$timestamp.sql"
Write-Host "   - PostgreSQL dump: $dbDumpFile"

# Docker container üzerinden dump al
if (docker ps | Select-String "kentkonut-postgres") {
    docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > $dbDumpFile
    Write-Host "   ✅ Database dump completed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ PostgreSQL container not found, trying direct connection..." -ForegroundColor Yellow
    # Doğrudan bağlantı ile dump al
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/kentkonutdb"
    npx prisma db execute --stdin < $null 2>$null
    if ($LASTEXITCODE -eq 0) {
        pg_dump -h localhost -U postgres kentkonutdb > $dbDumpFile
        Write-Host "   ✅ Database dump completed via direct connection" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Could not connect to database" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n2. Seed Script'leri Yedekleniyor..." -ForegroundColor Cyan

# Seed dosyalarını kopyala
Copy-Item "prisma/consolidated-seed.js" "$BackupDir/seed-scripts/" -Force
Copy-Item "prisma/schema.prisma" "$BackupDir/seed-scripts/" -Force

# Prisma migrations'ları kopyala
if (Test-Path "prisma/migrations") {
    Copy-Item "prisma/migrations" "$BackupDir/seed-scripts/" -Recurse -Force
    Write-Host "   ✅ Prisma migrations backed up" -ForegroundColor Green
}

Write-Host "`n3. Medya Dosyaları Yedekleniyor..." -ForegroundColor Cyan

if ($IncludeMedia) {
    $mediaDirs = @("public/uploads", "public/media", "public/banners", "public/haberler", "public/hafriyat", "public/kurumsal", "public/services", "public/proje")
    
    foreach ($dir in $mediaDirs) {
        if (Test-Path $dir) {
            $targetDir = "$BackupDir/media/$dir"
            New-Item -ItemType Directory -Path (Split-Path $targetDir) -Force | Out-Null
            Copy-Item $dir $targetDir -Recurse -Force
            Write-Host "   ✅ $dir backed up" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ⏭️ Media files skipped (use -IncludeMedia to include)" -ForegroundColor Yellow
}

Write-Host "`n4. Geri Yükleme Script'i Oluşturuluyor..." -ForegroundColor Cyan

# Geri yükleme script'i oluştur
$restoreScript = @"
# KentKonut Seed Data Restore Script
# Bu script yedeklenen seed verilerini geri yükler

param(
    [string]`$BackupDir = "$BackupDir"
)

Write-Host "=== KentKonut Seed Data Restore ===" -ForegroundColor Green
Write-Host "Yedekleme Dizini: `$BackupDir" -ForegroundColor Yellow

# Veritabanını temizle
Write-Host "`n1. Mevcut Veritabanı Temizleniyor..." -ForegroundColor Cyan
npx prisma migrate reset --force

# Seed script'lerini geri yükle
Write-Host "`n2. Seed Script'leri Geri Yükleniyor..." -ForegroundColor Cyan
Copy-Item "`$BackupDir/seed-scripts/consolidated-seed.js" "prisma/" -Force
Copy-Item "`$BackupDir/seed-scripts/schema.prisma" "prisma/" -Force

if (Test-Path "`$BackupDir/seed-scripts/migrations") {
    Copy-Item "`$BackupDir/seed-scripts/migrations" "prisma/" -Recurse -Force
}

# Veritabanı dump'ını geri yükle
Write-Host "`n3. Veritabanı Dump'ı Geri Yükleniyor..." -ForegroundColor Cyan
`$dumpFile = Get-ChildItem "`$BackupDir/database" -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (`$dumpFile) {
    if (docker ps | Select-String "kentkonut-postgres") {
        Get-Content `$dumpFile.FullName | docker exec -i kentkonut-postgres-prod psql -U postgres kentkonutdb
    } else {
        Get-Content `$dumpFile.FullName | psql -h localhost -U postgres kentkonutdb
    }
    Write-Host "   ✅ Database restored from `$(`$dumpFile.Name)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ No dump file found, running seed script instead..." -ForegroundColor Yellow
    node prisma/consolidated-seed.js
}

# Medya dosyalarını geri yükle
if (Test-Path "`$BackupDir/media") {
    Write-Host "`n4. Medya Dosyaları Geri Yükleniyor..." -ForegroundColor Cyan
    Copy-Item "`$BackupDir/media/*" "public/" -Recurse -Force
    Write-Host "   ✅ Media files restored" -ForegroundColor Green
}

Write-Host "`n=== Geri Yükleme Tamamlandı ===" -ForegroundColor Green
Write-Host "Veritabanı başarıyla geri yüklendi! 🎉" -ForegroundColor Green
"@

$restoreScript | Out-File "$BackupDir/restore-seed-data.ps1" -Encoding UTF8

Write-Host "`n5. Yedekleme Bilgi Dosyası Oluşturuluyor..." -ForegroundColor Cyan

# Yedekleme bilgi dosyası
$backupInfo = @"
=== KentKonut Seed Data Backup Information ===
Yedekleme Tarihi: $(Get-Date)
Yedekleme Dizini: $BackupDir
Timestamp: $timestamp

=== Yedeklenen Dosyalar ===
Database:
$(Get-ChildItem "$BackupDir/database" | ForEach-Object { "  - $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" })

Seed Scripts:
$(Get-ChildItem "$BackupDir/seed-scripts" | ForEach-Object { "  - $($_.Name)" })

Media Files:
$(if ($IncludeMedia) { Get-ChildItem "$BackupDir/media" -Recurse | ForEach-Object { "  - $($_.FullName.Replace($BackupDir, ''))" } } else { "  - Skipped (use -IncludeMedia to include)" })

=== Geri Yükleme Talimatları ===
1. PowerShell'de: .\restore-seed-data.ps1 -BackupDir "$BackupDir"
2. Veya manuel olarak:
   - npx prisma migrate reset --force
   - Copy seed scripts back
   - Restore database dump
   - Copy media files back

=== Veritabanı Durumu ===
$(npx prisma db execute --stdin < $null 2>$null; if ($LASTEXITCODE -eq 0) { "Database connection: OK" } else { "Database connection: FAILED" })
"@

$backupInfo | Out-File "$BackupDir/BACKUP-INFO.txt" -Encoding UTF8

Write-Host "`n=== Yedekleme Tamamlandı ===" -ForegroundColor Green
Write-Host "Yedekleme Dizini: $BackupDir" -ForegroundColor Yellow
Write-Host "Toplam Boyut: $([math]::Round((Get-ChildItem $BackupDir -Recurse | Measure-Object -Property Length -Sum).Sum/1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "`nGeri yüklemek için: .\restore-seed-data.ps1 -BackupDir `"$BackupDir`"" -ForegroundColor Cyan

Write-Host "`nSeed data backup completed! 🎉" -ForegroundColor Green
