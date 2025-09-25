# 🔄 Mevcut Uygulama Verilerini Seed Verisine Çevirme Rehberi

Bu rehber, KentKonut uygulamasının mevcut verilerini seed formatına çevirme işlemini detaylı olarak açıklar.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Kullanım Senaryoları](#kullanım-senaryoları)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Detaylı Kullanım](#detaylı-kullanım)
- [Oluşturulan Dosyalar](#oluşturulan-dosyalar)
- [Geri Yükleme](#geri-yükleme)
- [Sorun Giderme](#sorun-giderme)

## 🎯 Genel Bakış

Bu sistem, mevcut uygulama verilerinizi seed formatına çevirerek:
- ✅ İstediğiniz zaman uygulamayı o anki duruma geri döndürebilirsiniz
- ✅ Tüm database tablolarını kapsar
- ✅ Güvenli şekilde şifreleri korur
- ✅ Foreign key ilişkilerini korur
- ✅ JSON formatında taşınabilir yedek oluşturur

### 📊 Desteklenen Tablolar

Script aşağıdaki tüm tabloları işler:

#### 🔐 Kimlik Doğrulama
- `user` - Kullanıcılar
- `account` - Hesap bilgileri
- `session` - Oturum bilgileri
- `verificationToken` - Doğrulama token'ları

#### 📁 Medya & Kategoriler
- `mediaCategory` - Medya kategorileri
- `media` - Medya dosyaları

#### 📄 Sayfalar & SEO
- `pageCategory` - Sayfa kategorileri
- `page` - Sayfalar
- `pageSeoMetrics` - SEO metrikleri

#### 🏛️ Kurumsal Yapı
- `department` - Birimler
- `executive` - Yöneticiler
- `personnel` - Personel

#### 📰 İçerik Yönetimi
- `tag` - Etiketler
- `newsCategory` - Haber kategorileri
- `news` - Haberler
- `newsTag` - Haber-etiket ilişkileri
- `newsRelation` - Haber ilişkileri

#### 🏢 Projeler
- `project` - Projeler
- `projectTag` - Proje-etiket ilişkileri
- `projectRelation` - Proje ilişkileri
- `projectGallery` - Proje galerileri
- `projectGalleryMedia` - Galeri medyaları

#### 🏗️ Hafriyat Sistemi
- `hafriyatBolge` - Hafriyat bölgeleri
- `hafriyatSaha` - Hafriyat sahaları
- `hafriyatBelgeKategori` - Belge kategorileri
- `hafriyatBelge` - Belgeler

#### 💬 Etkileşimler
- `comment` - Yorumlar
- `quickAccessLink` - Hızlı erişim linkleri
- `menuItem` - Menü öğeleri
- `menuPermission` - Menü izinleri

#### 🎨 Diğer İçerikler
- `serviceCard` - Hizmet kartları
- `corporateContent` - Kurumsal içerik
- `highlight` - Öne çıkanlar
- `banner` - Bannerlar
- `personnelGallery` - Personel galerisi
- `newsGallery` - Haber galerisi
- `newsGalleryItem` - Haber galeri öğeleri
- `applicationLog` - Uygulama logları

## 🚀 Kullanım Senaryoları

### 1. **Geliştirme Ortamı**
```bash
# Mevcut geliştirme verilerini yedekle
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

## ⚡ Hızlı Başlangıç

### 1. Mevcut Verileri Yedekle
```bash
cd kentkonut-backend
node convert-current-data-to-seed.js
```

### 2. Oluşturulan Dosyaları Kontrol Et
```bash
ls backups/current-data-[timestamp]/
```

### 3. Geri Yükleme Test Et
```bash
node restore-seed.js current-data-backup-[timestamp].json
```

## 📖 Detaylı Kullanım

### Script Çalıştırma
```bash
# Temel kullanım
node convert-current-data-to-seed.js

# Çıktı örneği:
# 🔄 Mevcut uygulama verilerini seed formatına çeviriliyor...
# 📊 Tüm database tabloları işlenecek...
# 📁 Backup dizini oluşturuldu: ./backups/current-data-2025-09-25T05-30-24-250Z
# 📊 user tablosu işleniyor...
# ✅ user: 2 kayıt işlendi
# 📊 account tablosu işleniyor...
# ⏭️ account: Boş tablo
# ...
# 🎉 Mevcut veri seed dönüşümü tamamlandı!
```

### Oluşturulan Dosyalar
```
backups/current-data-[timestamp]/
├── current-data-backup-[timestamp].json  # Ana yedek dosyası
└── INFO.md                               # Detaylı bilgi dosyası
```

## 📁 Oluşturulan Dosyalar

### 1. **JSON Backup Dosyası**
```json
{
  "metadata": {
    "timestamp": "2025-09-25T05:30:24.255Z",
    "description": "Mevcut uygulama verilerinden oluşturulan seed (Tüm Tablolar)",
    "version": "2.0",
    "totalRecords": 30,
    "tablesProcessed": 10
  },
  "tables": {
    "user": [...],
    "project": [...],
    "news": [...],
    // ... diğer tablolar
  }
}
```

### 2. **Bilgi Dosyası (INFO.md)**
- Backup tarihi ve detayları
- Tablo istatistikleri
- Kullanım talimatları
- Güvenlik notları

## 🔙 Geri Yükleme

### JSON Backup ile Geri Yükleme
```bash
# Mevcut yedekleri listele
node restore-seed.js

# Belirli bir yedekleme dosyasını geri yükle
node restore-seed.js current-data-backup-2025-09-25T05-30-24-250Z.json
```

### Geri Yükleme Süreci
```
🔄 Restoring seed data from: current-data-backup-[timestamp].json
📥 Importing seed data...
🗑️ Clearing existing data...
✅ user cleared
✅ project cleared
...
📥 Importing data...
✅ user: 2 records imported
✅ project: 20 records imported
...
🎉 Seed data import completed!
✅ Seed data restore completed!
```

## 🔧 Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. **Veritabanı Bağlantı Hatası**
```
❌ Error: Could not connect to database
```
**Çözümler**:
- Docker container'ların çalıştığını kontrol edin
- DATABASE_URL environment variable'ını kontrol edin
- PostgreSQL servisinin çalıştığını kontrol edin

#### 2. **Tablo Bulunamadı Hatası**
```
⚠️ [tableName]: Hata - Table doesn't exist
```
**Çözüm**: Script otomatik olarak tablo varlığını kontrol eder ve hata verir

#### 3. **Dosya Yazma Hatası**
```
❌ Error: EACCES: permission denied
```
**Çözüm**: Backup dizini yazma izinlerini kontrol edin

#### 4. **BigInt Serialization Hatası**
```
❌ Error: Do not know how to serialize a BigInt
```
**Çözüm**: Script otomatik olarak BigInt değerlerini string'e çevirir

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

## 📊 Örnek Çıktı

### Başarılı Yedekleme
```
🔄 Mevcut uygulama verilerini seed formatına çeviriliyor...
📊 Tüm database tabloları işlenecek...
📁 Backup dizini oluşturuldu: ./backups/current-data-2025-09-25T05-30-24-250Z
📊 user tablosu işleniyor...
✅ user: 2 kayıt işlendi
📊 account tablosu işleniyor...
⏭️ account: Boş tablo
📊 session tablosu işleniyor...
⏭️ session: Boş tablo
📊 verificationToken tablosu işleniyor...
⏭️ verificationToken: Boş tablo
📊 mediaCategory tablosu işleniyor...
✅ mediaCategory: 6 kayıt işlendi
📊 media tablosu işleniyor...
✅ media: 8 kayıt işlendi
📊 pageCategory tablosu işleniyor...
⏭️ pageCategory: Boş tablo
📊 page tablosu işleniyor...
⏭️ page: Boş tablo
📊 pageSeoMetrics tablosu işleniyor...
⏭️ pageSeoMetrics: Boş tablo
📊 department tablosu işleniyor...
✅ department: 9 kayıt işlendi

🎉 Mevcut veri seed dönüşümü tamamlandı!
📁 Backup Dizini: ./backups/current-data-2025-09-25T05-30-24-250Z
📊 JSON Backup: current-data-backup-2025-09-25T05-30-24-250Z.json
📋 Toplam Kayıt: 30
📊 İşlenen Tablo: 10/42

🚀 Kullanım:
   JSON Backup: node restore-seed.js current-data-backup-2025-09-25T05-30-24-250Z.json

📊 Tablo Özeti:
   ✅ user: 2 kayıt
   ✅ mediaCategory: 6 kayıt
   ✅ media: 8 kayıt
   ✅ department: 9 kayıt
   ✅ executive: 7 kayıt
   ✅ personnel: 8 kayıt
   ✅ tag: 33 kayıt
   ✅ newsCategory: 5 kayıt
   ✅ news: 15 kayıt
   ✅ project: 20 kayıt
```

## 🎯 En İyi Uygulamalar

### Yedekleme Stratejisi
1. **Günlük**: Mevcut veri yedekleme (geliştirme)
2. **Haftalık**: Tam sistem yedekleme (test)
3. **Aylık**: Production yedekleme (production)

### Güvenlik
- Yedekleme dosyalarını güvenli konumda saklayın
- Hassas verileri (şifreler, API anahtarları) yedeklemeyin
- Yedekleme dosyalarını şifreleyin (gerekirse)

### Performans
- Büyük veri setleri için batch işleme kullanın
- Medya dosyalarını ayrı yedekleyin
- Sıkıştırma kullanın (büyük yedekler için)

### Monitoring
- Yedekleme işlemlerini loglayın
- Yedekleme boyutlarını takip edin
- Geri yükleme sürelerini ölçün

## 🚀 Hızlı Referans

### Temel Komutlar
```bash
# Mevcut verileri yedekle
node convert-current-data-to-seed.js

# Yedeklenen verileri geri yükle
node restore-seed.js [filename]

# Mevcut yedekleri listele
node restore-seed.js
```

### Dosya Konumları
```
backups/
└── current-data-[timestamp]/
    ├── current-data-backup-[timestamp].json
    └── INFO.md
```

### Rutin Yedekleme
```bash
# Günlük yedekleme (cron job olarak)
0 2 * * * cd /path/to/kentkonut-backend && node convert-current-data-to-seed.js
```

### Acil Geri Yükleme
```bash
# En son yedeklemeyi geri yükle
node restore-seed.js $(ls -t backups/current-data-*/*.json | head -1)
```

---

**Son Güncelleme**: 2025-09-25  
**Versiyon**: 2.0  
**Uyumluluk**: KentKonut v2.0+

> 💡 **İpucu**: Bu rehberi düzenli olarak güncelleyin ve ekibinizle paylaşın!
