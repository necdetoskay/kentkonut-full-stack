#!/bin/bash

# Veritabanı bağlantı bilgileri
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="kentkonutdb"
DB_USER="postgres"
DB_PASSWORD="P@ssw0rd"  # Güvenlik için gerçek bir uygulamada bu şifreyi doğrudan yazmayın

# Yedek dosyasının adı ve yolu
BACKUP_DIR="./db-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Yedek dizini oluştur (yoksa)
mkdir -p $BACKUP_DIR

echo "Veritabanı yedeği alınıyor: $DB_NAME"

# pg_dump'ı çalıştır
export PGPASSWORD=$DB_PASSWORD
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F p > $BACKUP_FILE

# Sonucu kontrol et
if [ $? -eq 0 ]; then
  echo "Yedek başarıyla alındı: $BACKUP_FILE"
  echo "Yedek dosyası boyutu: $(du -h $BACKUP_FILE | cut -f1)"
else
  echo "Yedek alma işlemi başarısız!"
  exit 1
fi

# PGPASSWORD çevre değişkenini temizle
unset PGPASSWORD

echo -e "\nBu yedek tüm tablo yapısını ve verileri içerir."
echo "Yedekten geri yüklemek için şu komutu kullanabilirsiniz:"
echo -e "\033[0;36mpsql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_FILE\033[0m" 