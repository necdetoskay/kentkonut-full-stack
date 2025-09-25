# 🔄 Veri Geri Yükleme Cheat Sheet

## ⚡ Hızlı Komutlar

### Mevcut Yedeklemeleri Listele
```bash
node restore-seed.js
```

### Veri Geri Yükleme
```bash
node restore-seed.js current-data-backup-[timestamp].json
```

### Veritabanı Durumu
```bash
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

## 📋 Geri Yükleme Senaryoları

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
| File not found | Dosya yolunu kontrol et |
| DB connection failed | Docker kontrol et |
| Foreign key error | Tabloları sıralı temizle |
| JSON parse error | Dosyayı yeniden oluştur |

## 📊 Örnek Çıktı

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

## 🚀 Hızlı Başlangıç

```bash
# 1. Mevcut yedeklemeleri listele
node restore-seed.js

# 2. Yedekleme dosyasını geri yükle
node restore-seed.js current-data-backup-[timestamp].json

# 3. Geri yükleme durumunu kontrol et
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"
```

## ⚠️ Önemli Notlar

- **Mevcut veriler silinir**: Geri yükleme işlemi mevcut tüm verileri siler
- **Geri alınamaz**: Bu işlem geri alınamaz, önce yedek alın
- **Production dikkat**: Production ortamında dikkatli kullanın

## 📁 Dosya Konumları

```
backups/
└── current-data-[timestamp]/
    └── current-data-backup-[timestamp].json
```

## 🔐 Güvenlik

- Şifreler hash'lenmiş olarak korunur
- Token'lar temizlenir (güvenlik)
- Session'lar temizlenir (güvenlik)
- API anahtarları yedeklenmez

---
**Hızlı Referans** | **Detaylı Rehber**: `docs/DATA_RESTORE_GUIDE.md`
