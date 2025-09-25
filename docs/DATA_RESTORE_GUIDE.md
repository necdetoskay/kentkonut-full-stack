# 🔄 Veri Geri Yükleme Rehberi

Bu rehber, KentKonut uygulamasının yedeklenen verilerini geri yükleme işlemini detaylı olarak açıklar.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Detaylı Kullanım](#detaylı-kullanım)
- [Geri Yükleme Senaryoları](#geri-yükleme-senaryoları)
- [Sorun Giderme](#sorun-giderme)
- [Güvenlik Notları](#güvenlik-notları)

## 🎯 Genel Bakış

Veri geri yükleme sistemi, yedeklenen seed verilerini veritabanına geri yükler:
- ✅ **Mevcut verileri temizler** ve yedekleme verilerini yükler
- ✅ **Foreign key ilişkilerini korur**
- ✅ **Tüm tabloları sıralı olarak işler**
- ✅ **Hata durumunda güvenli şekilde durur**

### ⚠️ Önemli Uyarılar
- **Mevcut veriler silinir**: Geri yükleme işlemi mevcut tüm verileri siler
- **Geri alınamaz**: Bu işlem geri alınamaz, önce yedek alın
- **Production dikkat**: Production ortamında dikkatli kullanın

## ⚡ Hızlı Başlangıç

### 1. Mevcut Yedeklemeleri Listele
```bash
cd kentkonut-backend
node restore-seed.js
```

### 2. Yedekleme Dosyasını Geri Yükle
```bash
node restore-seed.js current-data-backup-[timestamp].json
```

### 3. Geri Yükleme Durumunu Kontrol Et
```bash
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

## 📖 Detaylı Kullanım

### Mevcut Yedeklemeleri Görüntüleme
```bash
# Tüm yedeklemeleri listele
node restore-seed.js

# Çıktı örneği:
# ❌ Please provide backup filename
# Usage: node restore-seed.js <backup-filename>
# Available backups:
#   - current-data-backup-2025-09-25T05-35-23-529Z.json
#   - seed-backup-2025-09-24T14-32-13-734Z.json
```

### Geri Yükleme İşlemi
```bash
# Belirli bir yedekleme dosyasını geri yükle
node restore-seed.js current-data-backup-2025-09-25T05-35-23-529Z.json

# Çıktı örneği:
# 🔄 Restoring seed data from: current-data-backup-2025-09-25T05-35-23-529Z.json
# 📥 Importing seed data...
# 🗑️ Clearing existing data...
# ✅ user cleared
# ✅ project cleared
# ...
# 📥 Importing data...
# ✅ user: 2 records imported
# ✅ project: 20 records imported
# ...
# 🎉 Seed data import completed!
# ✅ Seed data restore completed!
```

### Yedekleme Dosyası Konumu
```
backups/
└── current-data-[timestamp]/
    └── current-data-backup-[timestamp].json
```

## 🔄 Geri Yükleme Senaryoları

### 1. **Geliştirme Ortamı**
```bash
# Mevcut verileri yedekle
node convert-current-data-to-seed.js

# Yeni özellik geliştir
# ... kod değişiklikleri ...

# Eski verileri geri yükle
node restore-seed.js current-data-backup-[timestamp].json
```

### 2. **Test Ortamı**
```bash
# Test verilerini yedekle
node convert-current-data-to-seed.js

# Test senaryolarını çalıştır
# ... testler ...

# Temiz duruma geri dön
node restore-seed.js current-data-backup-[timestamp].json
```

### 3. **Production Ortamı**
```bash
# Production verilerini yedekle
node convert-current-data-to-seed.js

# Güncelleme yap
# ... deployment ...

# Gerekirse eski duruma geri dön
node restore-seed.js current-data-backup-[timestamp].json
```

### 4. **Veri Migrasyonu**
```bash
# Mevcut verileri yedekle
node convert-current-data-to-seed.js

# Veritabanını sıfırla
npx prisma migrate reset --force

# Yeni seed'i çalıştır
node prisma/consolidated-seed.js

# Eski verileri geri yükle (gerekirse)
node restore-seed.js current-data-backup-[timestamp].json
```

## 🔧 Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. **Dosya Bulunamadı Hatası**
```
❌ Error: ENOENT: no such file or directory
```
**Çözümler**:
- Dosya yolunu kontrol edin
- Yedekleme dosyasının var olduğunu kontrol edin
- Tam dosya adını kullanın

#### 2. **Veritabanı Bağlantı Hatası**
```
❌ Error: Could not connect to database
```
**Çözümler**:
- Docker container'ların çalıştığını kontrol edin
- DATABASE_URL environment variable'ını kontrol edin
- PostgreSQL servisinin çalıştığını kontrol edin

#### 3. **Foreign Key Hatası**
```
❌ Error: Foreign key constraint failed
```
**Çözümler**:
- Tabloları doğru sırada temizleyin
- Yedekleme dosyasının bozuk olmadığını kontrol edin
- Veritabanını sıfırlayın ve tekrar deneyin

#### 4. **JSON Parse Hatası**
```
❌ Error: Unexpected token in JSON
```
**Çözümler**:
- Yedekleme dosyasının bozuk olmadığını kontrol edin
- Dosyayı yeniden oluşturun
- Dosya kodlamasını kontrol edin

### Debug Komutları

#### Veritabanı Durumunu Kontrol Et:
```bash
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

#### Yedekleme Dosyalarını Listele:
```bash
ls backups/current-data-*/
```

#### Docker Container Durumunu Kontrol Et:
```bash
docker ps | grep kentkonut
```

#### Veritabanı Bağlantısını Test Et:
```bash
node -e "require('@prisma/client').PrismaClient().$connect().then(() => console.log('✅ Connected')).catch(console.error)"
```

## 🔐 Güvenlik Notları

### Veri Güvenliği
- **Şifreler**: Hash'lenmiş olarak korunur
- **Token'lar**: Temizlenir (güvenlik)
- **Session'lar**: Temizlenir (güvenlik)
- **API Anahtarları**: Yedeklenmez

### Yedekleme Güvenliği
- Yedekleme dosyalarını güvenli konumda saklayın
- Hassas verileri yedeklemeyin
- Yedekleme dosyalarını şifreleyin (gerekirse)

### Production Güvenliği
- Production ortamında dikkatli kullanın
- Geri yükleme öncesi yedek alın
- Maintenance modunda çalıştırın

## 📊 Örnek Çıktı

### Başarılı Geri Yükleme
```
🔄 Restoring seed data from: current-data-backup-2025-09-25T05-35-23-529Z.json
📥 Importing seed data...
🗑️ Clearing existing data...
✅ user cleared
✅ project cleared
✅ news cleared
✅ department cleared
✅ executive cleared
✅ personnel cleared
✅ tag cleared
✅ mediaCategory cleared
✅ media cleared
✅ comment cleared
✅ quickAccessLink cleared
✅ menuItem cleared
✅ menuPermission cleared
✅ serviceCard cleared
✅ corporateContent cleared
✅ highlight cleared
✅ banner cleared
✅ personnelGallery cleared
✅ newsGallery cleared
✅ newsGalleryItem cleared
✅ applicationLog cleared
📥 Importing data...
✅ user: 2 records imported
✅ project: 20 records imported
✅ news: 15 records imported
✅ department: 9 records imported
✅ executive: 7 records imported
✅ personnel: 8 records imported
✅ tag: 33 records imported
✅ mediaCategory: 6 records imported
✅ media: 8 records imported
✅ comment: 5 records imported
✅ quickAccessLink: 12 records imported
✅ menuItem: 8 records imported
✅ menuPermission: 4 records imported
✅ serviceCard: 3 records imported
✅ corporateContent: 2 records imported
✅ highlight: 1 records imported
✅ banner: 2 records imported
✅ personnelGallery: 1 records imported
✅ newsGallery: 1 records imported
✅ newsGalleryItem: 1 records imported
✅ applicationLog: 0 records imported
🎉 Seed data import completed!
✅ Seed data restore completed!
```

## 🎯 En İyi Uygulamalar

### Geri Yükleme Stratejisi
1. **Önce Yedek Al**: Geri yükleme öncesi mevcut verileri yedekleyin
2. **Test Et**: Geri yükleme işlemini test ortamında deneyin
3. **Doğrula**: Geri yükleme sonrası verileri kontrol edin

### Güvenlik
- Yedekleme dosyalarını güvenli konumda saklayın
- Hassas verileri yedeklemeyin
- Yedekleme dosyalarını şifreleyin (gerekirse)

### Performans
- Büyük veri setleri için batch işleme kullanın
- Medya dosyalarını ayrı yedekleyin
- Sıkıştırma kullanın (büyük yedekler için)

### Monitoring
- Geri yükleme işlemlerini loglayın
- Geri yükleme sürelerini ölçün
- Hata durumlarını takip edin

## 🚀 Hızlı Referans

### Temel Komutlar
```bash
# Mevcut yedeklemeleri listele
node restore-seed.js

# Yedeklenen verileri geri yükle
node restore-seed.js [filename]

# Veritabanı durumunu kontrol et
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

### Dosya Konumları
```
backups/
└── current-data-[timestamp]/
    └── current-data-backup-[timestamp].json
```

### Rutin Geri Yükleme
```bash
# En son yedeklemeyi geri yükle
node restore-seed.js $(ls -t backups/current-data-*/*.json | head -1)
```

### Acil Geri Yükleme
```bash
# Belirli bir tarihteki yedeklemeyi geri yükle
node restore-seed.js current-data-backup-2025-09-25T05-35-23-529Z.json
```

---

**Son Güncelleme**: 2025-09-25  
**Versiyon**: 2.0  
**Uyumluluk**: KentKonut v2.0+

> 💡 **İpucu**: Bu rehberi düzenli olarak güncelleyin ve ekibinizle paylaşın!
