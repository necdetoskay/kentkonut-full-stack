# Kentkonut Uygulaması Yedekleme Scripti
# Bu script, uygulamanın mevcut halini yedekler

# Tarih formatını ayarla (YYYYMMDD-HHMMSS)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = ".\backups\backup_$timestamp"

# Yedekleme klasörünü oluştur
Write-Host "Yedekleme klasörü oluşturuluyor: $backupDir"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Yedeklenecek klasörler
$foldersToBackup = @(
    ".\kentkonut-frontend\src",
    ".\kentkonut-backend\app",
    ".\kentkonut-backend\lib",
    ".\kentkonut-backend\config",
    ".\config",
    ".\scripts"
)

# Yedeklenecek dosyalar
$filesToBackup = @(
    ".\.env.production",
    ".\package.json",
    ".\kentkonut-frontend\package.json",
    ".\kentkonut-backend\package.json",
    ".\kentkonut-frontend\tsconfig.json",
    ".\kentkonut-backend\tsconfig.json",
    ".\docker-compose.production.yml"
)

# Klasörleri yedekle
foreach ($folder in $foldersToBackup) {
    if (Test-Path $folder) {
        $folderName = Split-Path $folder -Leaf
        $parentFolder = Split-Path (Split-Path $folder -Parent) -Leaf
        $destFolder = "$backupDir\$parentFolder\$folderName"
        
        Write-Host "Yedekleniyor: $folder -> $destFolder"
        New-Item -ItemType Directory -Force -Path "$backupDir\$parentFolder" | Out-Null
        Copy-Item -Path $folder -Destination "$backupDir\$parentFolder" -Recurse -Force
    } else {
        Write-Host "Uyarı: $folder klasörü bulunamadı, yedeklenemedi." -ForegroundColor Yellow
    }
}

# Dosyaları yedekle
foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        $parentFolder = Split-Path (Split-Path $file -Parent) -Leaf
        
        if ($parentFolder -eq "kentkonut-full-stack") {
            # Kök dizindeki dosyalar için
            $destFile = "$backupDir\$fileName"
            New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
        } else {
            # Alt dizinlerdeki dosyalar için
            $destFile = "$backupDir\$parentFolder\$fileName"
            New-Item -ItemType Directory -Force -Path "$backupDir\$parentFolder" | Out-Null
        }
        
        Write-Host "Yedekleniyor: $file -> $destFile"
        Copy-Item -Path $file -Destination $destFile -Force
    } else {
        Write-Host "Uyarı: $file dosyası bulunamadı, yedeklenemedi." -ForegroundColor Yellow
    }
}

# Veritabanı yedeği (eğer PostgreSQL yüklüyse)
$pgDumpPath = "pg_dump"
$dbHost = "172.41.42.51"
$dbPort = "5433"
$dbName = "kentkonut"
$dbUser = "postgres"
$dbBackupFile = "$backupDir\db_backup_$timestamp.sql"

Write-Host "Veritabanı yedeği alınıyor..."
try {
    $pgDumpCmd = "$pgDumpPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $dbBackupFile"
    Invoke-Expression "cmd /c $pgDumpCmd"
    Write-Host "Veritabanı yedeği alındı: $dbBackupFile" -ForegroundColor Green
} catch {
    Write-Host "Veritabanı yedeği alınamadı. Lütfen PostgreSQL'in yüklü olduğundan emin olun." -ForegroundColor Red
    Write-Host "Hata: $_" -ForegroundColor Red
}

# Yedekleme bilgilerini kaydet
$infoFile = "$backupDir\backup_info.txt"
@"
Kentkonut Uygulaması Yedek Bilgileri
Yedekleme Tarihi: $(Get-Date)
Yedekleme Klasörü: $backupDir

Yedeklenen Klasörler:
$($foldersToBackup -join "`n")

Yedeklenen Dosyalar:
$($filesToBackup -join "`n")

Geri Yükleme Talimatları:
1. Yedeklenen dosyaları ilgili klasörlere kopyalayın
2. Veritabanını geri yüklemek için:
   pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName $dbBackupFile
"@ | Out-File -FilePath $infoFile -Encoding utf8

Write-Host ""
Write-Host "Yedekleme tamamlandı!" -ForegroundColor Green
Write-Host "Yedek klasörü: $backupDir"
Write-Host "Yedek bilgileri: $infoFile"