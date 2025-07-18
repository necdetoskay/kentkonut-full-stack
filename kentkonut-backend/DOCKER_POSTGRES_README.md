# PostgreSQL Docker Setup

Bu dokümantasyon PostgreSQL veritabanının Docker ile kurulumu ve yönetimi hakkındadır.

## Kurulum

### 1. Docker Container'ı Başlatma

```bash
# PostgreSQL container'ını başlat
docker-compose up -d

# Logları kontrol et
docker logs kentkonut-postgres

# Container durumunu kontrol et
docker ps
```

### 2. Veritabanı Kurulumu

```bash
# Prisma migration'larını çalıştır
npx prisma migrate dev --name init

# Başlangıç verilerini ekle
npx prisma db seed

# Veritabanı bağlantısını test et
node scripts/verify-db.js
```

### 3. PgAdmin (Opsiyonel)

PgAdmin'i başlatmak için:

```bash
# PgAdmin profili ile başlat
docker-compose --profile tools up -d

# PgAdmin'e şu adresten erişin: http://localhost:8080
# Email: admin@kentkonut.com
# Password: admin123
```

## Çevre Değişkenleri

`.env` dosyasında şu değişkenlerin tanımlı olduğundan emin olun:

```
DATABASE_URL="postgresql://postgres:P@ssw0rd@localhost:5432/kentkonutdb"
```

## Önemli Bilgiler

### PostgreSQL Container Bilgileri:
- **Container Adı**: kentkonut-postgres
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: kentkonutdb
- **Kullanıcı**: postgres
- **Şifre**: P@ssw0rd

### Volume Bilgileri:
- **Volume**: postgres_data
- **Lokasyon**: Docker managed volume

### Network:
- **Network**: kentkonut-network
- **Driver**: bridge

## Yönetim Komutları

```bash
# Container'ı durdur
docker-compose down

# Volume ile birlikte container'ı sil (VERİ KAYBEDİLİR!)
docker-compose down -v

# Container'ı yeniden başlat
docker-compose restart postgresql

# Container'a bağlan
docker exec -it kentkonut-postgres psql -U postgres -d kentkonutdb

# Backup al
docker exec kentkonut-postgres pg_dump -U postgres kentkonutdb > backup.sql

# Backup'tan restore et
docker exec -i kentkonut-postgres psql -U postgres -d kentkonutdb < backup.sql
```

## Sorun Giderme

### Bağlantı Sorunları:
1. Container'ın çalıştığından emin olun: `docker ps`
2. Health check'i kontrol edin: `docker inspect kentkonut-postgres`
3. Logları inceleyin: `docker logs kentkonut-postgres`

### Port Çakışması:
5432 portu kullanımda ise docker-compose.yml'de farklı port kullanın:
```yaml
ports:
  - "5433:5432"
```

### Volume Sorunları:
Veritabanı başlatılamıyorsa volume'u temizleyin:
```bash
docker-compose down -v
docker-compose up -d
```
