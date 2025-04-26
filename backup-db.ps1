# Veritabanı bağlantı bilgileri
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "kentkonutdb"
$DB_USER = "postgres"
$DB_PASSWORD = "P@ssw0rd"

# Yedek dosyasının adı ve yolu
$BACKUP_DIR = ".\db-backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\$DB_NAME`_$TIMESTAMP.sql"

# Yedek dizini oluştur (yoksa)
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Yedek dizini oluşturuldu: $BACKUP_DIR"
}

# PostgreSQL'in muhtemel kurulum yolları
$PG_PATHS = @(
    "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\13\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\12\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\11\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\10\bin\pg_dump.exe"
)

# pg_dump komutunun yerini bul
$PG_DUMP_PATH = $null
foreach ($path in $PG_PATHS) {
    if (Test-Path $path) {
        $PG_DUMP_PATH = $path
        break
    }
}

# pg_dump bulunamadıysa kullanıcıdan iste
if (-not $PG_DUMP_PATH) {
    Write-Host "pg_dump.exe bulunamadı! Lütfen tam yolunu girin (örn: C:\Program Files\PostgreSQL\17\bin\pg_dump.exe):" -ForegroundColor Yellow
    $PG_DUMP_PATH = Read-Host
    
    if (-not (Test-Path $PG_DUMP_PATH)) {
        Write-Host "Belirtilen dosya bulunamadı!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "pg_dump yolu: $PG_DUMP_PATH" -ForegroundColor Green
Write-Host "Veritabanı yedeği alınıyor: $DB_NAME"

# Ortam değişkeni ayarla (pg_dump için şifre)
$env:PGPASSWORD = $DB_PASSWORD

# pg_dump komutunu çalıştır
try {
    & $PG_DUMP_PATH -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F p -f $BACKUP_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Yedek başarıyla alındı: $BACKUP_FILE"
        Write-Host "Yedek dosyası boyutu: $((Get-Item $BACKUP_FILE).Length / 1MB) MB"
    } else {
        Write-Host "Yedek alma işlemi başarısız! Hata kodu: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
} finally {
    # PGPASSWORD çevre değişkenini temizle
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`nBu yedek tüm tablo yapısını ve verileri içerir."
Write-Host "Yedekten geri yüklemek için şu komutu kullanabilirsiniz:"
Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_FILE" -ForegroundColor Cyan 