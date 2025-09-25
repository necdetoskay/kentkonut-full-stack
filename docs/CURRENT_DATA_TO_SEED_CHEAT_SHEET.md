# 🚀 Mevcut Veri → Seed Dönüşümü Cheat Sheet

## ⚡ Hızlı Komutlar

### Mevcut Verileri Seed'e Çevir
```bash
# Tüm tabloları yedekle
node convert-current-data-to-seed.js

# Test için sadece ilk 10 tablo
node test-convert-all.js
```

### Geri Yükleme
```bash
# JSON'dan geri yükleme
node restore-seed.js current-data-backup-[timestamp].json

# Mevcut yedekleri listele
node restore-seed.js
```

### Kontrol
```bash
# Veritabanı durumu
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"

# Yedekleme dosyaları
ls backups/current-data-*/

# Docker durumu
docker ps | grep kentkonut
```

## 📊 Desteklenen Tablolar (42 Tablo)

### 🔐 Auth & User (4)
- `user`, `account`, `session`, `verificationToken`

### 📁 Media & Categories (2)
- `mediaCategory`, `media`

### 📄 Pages & SEO (3)
- `pageCategory`, `page`, `pageSeoMetrics`

### 🏛️ Corporate (3)
- `department`, `executive`, `personnel`

### 📰 Content (5)
- `tag`, `newsCategory`, `news`, `newsTag`, `newsRelation`

### 🏢 Projects (5)
- `project`, `projectTag`, `projectRelation`, `projectGallery`, `projectGalleryMedia`

### 🏗️ Hafriyat (4)
- `hafriyatBolge`, `hafriyatSaha`, `hafriyatBelgeKategori`, `hafriyatBelge`

### 💬 Interactions (4)
- `comment`, `quickAccessLink`, `menuItem`, `menuPermission`

### 🎨 Other Content (14)
- `serviceCard`, `corporateContent`, `highlight`, `banner`
- `personnelGallery`, `newsGallery`, `newsGalleryItem`
- `applicationLog`

## 📁 Dosya Yapısı

```
backups/
└── current-data-[timestamp]/
    ├── current-data-backup-[timestamp].json  # Ana yedek
    └── INFO.md                               # Detaylı bilgi
```

## 🎯 Senaryolar

### Geliştirme
```bash
node convert-current-data-to-seed.js
# ... kod değişiklikleri ...
node restore-seed.js current-data-backup-[timestamp].json
```

### Test
```bash
node convert-current-data-to-seed.js
# ... testler ...
node restore-seed.js current-data-backup-[timestamp].json
```

### Production
```bash
node convert-current-data-to-seed.js
# ... deployment ...
node restore-seed.js current-data-backup-[timestamp].json
```

## 🔧 Sorun Giderme

| Hata | Çözüm |
|------|-------|
| DB connection failed | Docker kontrol et |
| Table doesn't exist | Script otomatik atlar |
| Permission denied | Backup dizini izinleri |
| BigInt serialization | Otomatik çözüldü |

## 📊 Örnek Çıktı

```
🔄 Mevcut uygulama verilerini seed formatına çeviriliyor...
📊 Tüm database tabloları işlenecek...
📁 Backup dizini oluşturuldu: ./backups/current-data-2025-09-25T05-30-24-250Z
📊 user tablosu işleniyor...
✅ user: 2 kayıt işlendi
📊 account tablosu işleniyor...
⏭️ account: Boş tablo
...
🎉 Mevcut veri seed dönüşümü tamamlandı!
📋 Toplam Kayıt: 30
📊 İşlenen Tablo: 10/42
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Mevcut verileri yedekle
node convert-current-data-to-seed.js

# 2. Oluşturulan dosyaları kontrol et
ls backups/current-data-*/

# 3. Geri yükleme test et
node restore-seed.js current-data-backup-[timestamp].json
```

## 📈 İstatistikler

- **Toplam Tablo**: 42
- **Desteklenen Tablo**: 42
- **Ortalama İşlem Süresi**: 2-5 saniye
- **Dosya Boyutu**: 1-10 MB (veri miktarına göre)

---
**Hızlı Referans** | **Detaylı Rehber**: `docs/CURRENT_DATA_TO_SEED_GUIDE.md`
