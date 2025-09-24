# KentKonut Quick Seed Backup
# Sadece seed verilerini hızlıca yedekler

param(
    [string]$BackupDir = "./quick-seed-backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "=== KentKonut Quick Seed Backup ===" -ForegroundColor Green

# Yedekleme dizinini oluştur
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host "`n1. Seed Script'leri Yedekleniyor..." -ForegroundColor Cyan
Copy-Item "prisma/consolidated-seed.js" "$BackupDir/" -Force
Copy-Item "prisma/schema.prisma" "$BackupDir/" -Force

Write-Host "`n2. Veritabanı Durumu Kaydediliyor..." -ForegroundColor Cyan

# Mevcut veritabanı durumunu kaydet
$dbStatus = @"
=== KentKonut Database Status - $timestamp ===
Date: $(Get-Date)

=== Table Counts ===
"@

# Prisma ile tablo sayılarını al
try {
    $statusScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getStatus() {
  const status = {
    users: await prisma.user.count(),
    hafriyatBolgeler: await prisma.hafriyatBolge.count(),
    hafriyatSahalar: await prisma.hafriyatSaha.count(),
    hafriyatBelgeKategorileri: await prisma.hafriyatBelgeKategori.count(),
    newsCategories: await prisma.newsCategory.count(),
    news: await prisma.news.count(),
    projects: await prisma.project.count(),
    departments: await prisma.department.count(),
    executives: await prisma.executive.count(),
    personnel: await prisma.personnel.count(),
    tags: await prisma.tag.count(),
    projectTags: await prisma.projectTag.count(),
    projectRelations: await prisma.projectRelation.count(),
    projectGalleries: await prisma.projectGallery.count(),
    projectGalleryMedia: await prisma.projectGalleryMedia.count(),
    mediaCategories: await prisma.mediaCategory.count(),
    quickAccessLinks: await prisma.quickAccessLink.count(),
    comments: await prisma.comment.count(),
    menuItems: await prisma.menuItem.count()
  };
  
  console.log(JSON.stringify(status, null, 2));
  await prisma.`$disconnect();
}

getStatus().catch(console.error);
"@

    $statusScript | Out-File "$BackupDir/get-status.js" -Encoding UTF8
    $statusResult = node "$BackupDir/get-status.js" 2>$null
    
    if ($statusResult) {
        $statusResult | Out-File "$BackupDir/database-status.json" -Encoding UTF8
        Write-Host "   ✅ Database status saved" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Could not get database status" -ForegroundColor Yellow
}

Write-Host "`n3. Hızlı Geri Yükleme Script'i Oluşturuluyor..." -ForegroundColor Cyan

$quickRestore = @"
# KentKonut Quick Seed Restore - $timestamp
# Bu script seed verilerini hızlıca geri yükler

Write-Host "=== KentKonut Quick Seed Restore ===" -ForegroundColor Green

# Seed script'ini çalıştır
Write-Host "`nSeed verileri yükleniyor..." -ForegroundColor Cyan
node prisma/consolidated-seed.js

if (`$LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Seed verileri başarıyla yüklendi!" -ForegroundColor Green
    Write-Host "Veritabanı hazır! 🎉" -ForegroundColor Green
} else {
    Write-Host "`n❌ Seed verileri yüklenirken hata oluştu!" -ForegroundColor Red
}
"@

$quickRestore | Out-File "$BackupDir/quick-restore-seed.ps1" -Encoding UTF8

Write-Host "`n4. Bilgi Dosyası Oluşturuluyor..." -ForegroundColor Cyan

$info = @"
KentKonut Quick Seed Backup - $timestamp
========================================
Date: $(Get-Date)
Backup Directory: $BackupDir

Files Included:
- consolidated-seed.js (main seed script)
- schema.prisma (database schema)
- database-status.json (current database state)
- quick-restore-seed.ps1 (restore script)

Restore Instructions:
1. Copy consolidated-seed.js to prisma/ folder
2. Run: .\quick-restore-seed.ps1
3. Or manually: node prisma/consolidated-seed.js

This backup contains only the seed scripts and current database state.
For full database backup, use backup-seed-data.ps1 instead.
"@

$info | Out-File "$BackupDir/INFO.txt" -Encoding UTF8

Write-Host "`n=== Quick Seed Backup Tamamlandı ===" -ForegroundColor Green
Write-Host "Dizin: $BackupDir" -ForegroundColor Yellow
Write-Host "Geri yüklemek için: $BackupDir\quick-restore-seed.ps1" -ForegroundColor Cyan
Write-Host "`nQuick seed backup completed! ⚡" -ForegroundColor Green
