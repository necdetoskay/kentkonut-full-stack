# 🔄 KentKonut Seed Data Backup & Restore Guide

Bu rehber, KentKonut uygulamasının seed verilerini yedekleme ve geri yükleme işlemlerini detaylı olarak açıklar.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Yedekleme Yöntemleri](#yedekleme-yöntemleri)
- [Geri Yükleme Yöntemleri](#geri-yükleme-yöntemleri)
- [Yedekleme Konumları](#yedekleme-konumları)
- [Kullanım Senaryoları](#kullanım-senaryoları)
- [Sorun Giderme](#sorun-giderme)
- [En İyi Uygulamalar](#en-iyi-uygulamalar)

## 🎯 Genel Bakış

KentKonut uygulaması aşağıdaki seed verilerini içerir:

### 📊 Veritabanı Tabloları
- **👤 Users**: Kullanıcı hesapları (Admin, vb.)
- **🏗️ Hafriyat**: Bölgeler, sahalar, belge kategorileri
- **📰 News**: Haberler ve haber kategorileri
- **🏢 Projects**: Projeler ve proje detayları
- **🏷️ Tags**: Etiketler ve proje-etiket ilişkileri
- **🔗 Relations**: Proje ilişkileri
- **🖼️ Galleries**: Proje galerileri ve medya
- **📁 Media**: Medya kategorileri
- **⚡ Quick Access**: Hızlı erişim linkleri
- **💬 Comments**: Proje yorumları
- **🏛️ Corporate**: Birimler, yöneticiler, personel
- **📑 Menu**: Menü öğeleri

### 📈 Mevcut Veri Durumu
```
👤 Users: 2
🏗️ Hafriyat Bölgeleri: 3
⛏️ Hafriyat Sahaları: 6
📁 Belge Kategorileri: 5
📂 Haber Kategorileri: 5
📰 Haberler: 15
🏢 Projeler: 20
🏛️ Birimler: 9
👔 Yöneticiler: 7
👥 Personeller: 8
🏷️ Tags: 33
🔗 Proje-Tag İlişkileri: 3
🔗 Proje İlişkileri: 2
🖼️ Proje Galerileri: 80
📸 Galeri Medyaları: 8
📁 Media Kategorileri: 6
⚡ Hızlı Erişim Linkleri: 6
💬 Yorumlar: 4
📑 Menü Öğeleri: 9
```

## 🔄 Yedekleme Yöntemleri

### 1. 📊 JSON Formatında Yedekleme (Önerilen)

#### Avantajları:
- ✅ Tüm tabloları ve ilişkileri korur
- ✅ BigInt değerleri güvenli şekilde serialize eder
- ✅ Kolay taşınabilir
- ✅ İnsan tarafından okunabilir
- ✅ Hızlı yedekleme ve geri yükleme

#### Yedekleme Komutu:
```bash
cd kentkonut-backend
node backup-seed.js
```

#### Çıktı:
```
🔄 Starting seed data backup...
📤 Exporting seed data...
📊 Checking database status...
✅ user: 2 records exported
✅ hafriyatBolge: 3 records exported
✅ hafriyatSaha: 6 records exported
...
💾 Seed data saved to: E:\...\backups\seed-backup-2025-09-24T14-32-13-734Z.json
✅ Seed data backup completed!
```

### 2. ⚡ Hızlı Seed Yedekleme

#### Avantajları:
- ✅ Seed script'leri ve veritabanı durumunu yedekler
- ✅ PowerShell script'i ile otomatik geri yükleme
- ✅ Küçük dosya boyutu

#### Yedekleme Komutu:
```powershell
cd kentkonut-backend
.\scripts\quick-backup-seed.ps1
```

#### Çıktı:
```
=== KentKonut Quick Seed Backup ===
1. Seed Script'leri Yedekleniyor...
2. Veritabanı Durumu Kaydediliyor...
3. Hızlı Geri Yükleme Script'i Oluşturuluyor...
4. Bilgi Dosyası Oluşturuluyor...
=== Quick Seed Backup Tamamlandı ===
```

### 3. 🗄️ Tam Veritabanı Yedekleme

#### Avantajları:
- ✅ Docker container'ları dahil tam yedekleme
- ✅ Medya dosyaları dahil
- ✅ Konfigürasyon dosyaları dahil
- ✅ Production ortamı için uygun

#### Yedekleme Komutu:
```powershell
cd kentkonut-backend
.\scripts\backup-seed-data.ps1 -IncludeMedia
```

#### Parametreler:
- `-BackupDir`: Yedekleme dizini (opsiyonel)
- `-IncludeMedia`: Medya dosyalarını dahil et

## 🔙 Geri Yükleme Yöntemleri

### 1. JSON Formatından Geri Yükleme

#### Komut:
```bash
cd kentkonut-backend
node restore-seed.js seed-backup-2025-09-24T14-32-13-734Z.json
```

#### Mevcut Yedekleri Listele:
```bash
node restore-seed.js
```

#### Çıktı:
```
🔄 Restoring seed data from: seed-backup-2025-09-24T14-32-13-734Z.json
📥 Importing seed data...
🗑️ Clearing existing data...
✅ user cleared
✅ hafriyatBolge cleared
...
📥 Importing data...
✅ user: 2 records imported
✅ hafriyatBolge: 3 records imported
...
🎉 Seed data import completed!
✅ Seed data restore completed!
```

### 2. Hızlı Geri Yükleme

#### Komut:
```powershell
cd kentkonut-backend
.\quick-seed-backups\[timestamp]\quick-restore-seed.ps1
```

### 3. Tam Sistem Geri Yükleme

#### Komut:
```powershell
cd kentkonut-backend
.\seed-backups\[timestamp]\restore-seed-data.ps1 -BackupDir ".\seed-backups\[timestamp]"
```

### 4. Manuel Seed Çalıştırma

#### Komut:
```bash
cd kentkonut-backend
node prisma/consolidated-seed.js
```

## 📁 Yedekleme Konumları

### Dosya Yapısı:
```
kentkonut-backend/
├── backups/                          # JSON yedekleri
│   └── seed-backup-2025-09-24T14-32-13-734Z.json
├── quick-seed-backups/               # Hızlı yedekler
│   └── 20250924-173223/
│       ├── consolidated-seed.js
│       ├── schema.prisma
│       ├── database-status.json
│       ├── quick-restore-seed.ps1
│       └── INFO.txt
├── seed-backups/                     # Tam yedekler
│   └── [timestamp]/
│       ├── database/
│       │   └── kentkonut-seed-backup-[timestamp].sql
│       ├── seed-scripts/
│       │   ├── consolidated-seed.js
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── media/
│       │   ├── public/uploads/
│       │   ├── public/media/
│       │   └── ...
│       ├── restore-seed-data.ps1
│       └── BACKUP-INFO.txt
└── scripts/
    ├── backup-seed-data.ps1
    ├── quick-backup-seed.ps1
    └── backup-data.sh
```

### Dosya Boyutları:
- **JSON Yedek**: ~2-5 MB
- **Hızlı Yedek**: ~1-2 MB
- **Tam Yedek**: ~50-200 MB (medya dahil)

## 🎯 Kullanım Senaryoları

### Geliştirme Ortamı
```bash
# 1. Mevcut durumu yedekle
node backup-seed.js

# 2. Yeni özellik geliştir
# ... kod değişiklikleri ...

# 3. Eski verileri geri yükle
node restore-seed.js seed-backup-[timestamp].json
```

### Test Ortamı
```powershell
# 1. Test verilerini yedekle
.\scripts\quick-backup-seed.ps1

# 2. Test senaryolarını çalıştır
# ... testler ...

# 3. Temiz duruma geri dön
.\quick-seed-backups\[timestamp]\quick-restore-seed.ps1
```

### Production Ortamı
```powershell
# 1. Tam sistem yedekleme
.\scripts\backup-seed-data.ps1 -IncludeMedia

# 2. Güncelleme yap
# ... deployment ...

# 3. Gerekirse geri yükle
.\seed-backups\[timestamp]\restore-seed-data.ps1
```

### Veri Migrasyonu
```bash
# 1. Mevcut verileri yedekle
node backup-seed.js

# 2. Veritabanını sıfırla
npx prisma migrate reset --force

# 3. Yeni seed'i çalıştır
node prisma/consolidated-seed.js

# 4. Eski verileri geri yükle (gerekirse)
node restore-seed.js seed-backup-[timestamp].json
```

## 🔧 Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. BigInt Serialization Hatası
```
❌ Error: Do not know how to serialize a BigInt
```
**Çözüm**: JSON.stringify için BigInt dönüştürücü kullanılır (otomatik çözüldü)

#### 2. Veritabanı Bağlantı Hatası
```
❌ Error: Could not connect to database
```
**Çözümler**:
- Docker container'ların çalıştığını kontrol edin
- DATABASE_URL environment variable'ını kontrol edin
- PostgreSQL servisinin çalıştığını kontrol edin

#### 3. Dosya Bulunamadı Hatası
```
❌ Error: File not found: [filename]
```
**Çözümler**:
- Yedekleme dosyasının doğru konumda olduğunu kontrol edin
- Dosya adını tam olarak yazın
- `node restore-seed.js` ile mevcut yedekleri listeleyin

#### 4. Foreign Key Constraint Hatası
```
❌ Error: Foreign key constraint failed
```
**Çözüm**: Import sırası otomatik olarak düzenlenir (otomatik çözüldü)

### Debug Komutları

#### Veritabanı Durumunu Kontrol Et:
```bash
cd kentkonut-backend
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

#### Yedekleme Dosyalarını Listele:
```bash
ls backups/
ls quick-seed-backups/
ls seed-backups/
```

#### Docker Container Durumunu Kontrol Et:
```bash
docker ps | grep kentkonut
```

## 📚 En İyi Uygulamalar

### Yedekleme Stratejisi
1. **Günlük**: JSON yedekleme (geliştirme)
2. **Haftalık**: Hızlı yedekleme (test)
3. **Aylık**: Tam yedekleme (production)

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

## 🚀 Hızlı Başlangıç

### İlk Yedekleme
```bash
# 1. Proje dizinine git
cd kentkonut-backend

# 2. İlk yedeklemeyi al
node backup-seed.js

# 3. Yedekleme dosyasını kontrol et
ls backups/
```

### Rutin Yedekleme
```bash
# Günlük yedekleme (cron job olarak)
0 2 * * * cd /path/to/kentkonut-backend && node backup-seed.js
```

### Acil Geri Yükleme
```bash
# En son yedeklemeyi geri yükle
node restore-seed.js $(ls -t backups/*.json | head -1)
```

## 📞 Destek

### Log Dosyaları
- Yedekleme logları: `backups/` dizininde
- Hata logları: Console çıktısında
- Debug bilgileri: `database-status.json` dosyalarında

### Yardım Komutları
```bash
# Mevcut yedekleri listele
node restore-seed.js

# Veritabanı durumunu kontrol et
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"

# Seed script'ini test et
node prisma/consolidated-seed.js
```

---

**Son Güncelleme**: 2025-09-24  
**Versiyon**: 1.0  
**Uyumluluk**: KentKonut v2.0+

> 💡 **İpucu**: Bu rehberi düzenli olarak güncelleyin ve ekibinizle paylaşın!
