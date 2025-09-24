# 🚀 KentKonut Seed Backup Cheat Sheet

## ⚡ Hızlı Komutlar

### Yedekleme
```bash
# JSON yedekleme (önerilen)
node backup-seed.js

# Hızlı yedekleme
.\scripts\quick-backup-seed.ps1

# Tam yedekleme
.\scripts\backup-seed-data.ps1 -IncludeMedia
```

### Geri Yükleme
```bash
# JSON'dan geri yükleme
node restore-seed.js [filename]

# Mevcut yedekleri listele
node restore-seed.js

# Manuel seed çalıştır
node prisma/consolidated-seed.js
```

### Kontrol
```bash
# Veritabanı durumu
node -e "require('./prisma/consolidated-seed').getDatabaseStatus().then(console.log)"

# Docker durumu
docker ps | grep kentkonut

# Yedekleme dosyaları
ls backups/
```

## 📁 Dosya Konumları

```
backups/                    # JSON yedekleri
quick-seed-backups/         # Hızlı yedekler  
seed-backups/              # Tam yedekler
scripts/                   # Yedekleme script'leri
```

## 🎯 Senaryolar

### Geliştirme
```bash
node backup-seed.js
# ... kod değişiklikleri ...
node restore-seed.js [filename]
```

### Test
```powershell
.\scripts\quick-backup-seed.ps1
# ... testler ...
.\quick-seed-backups\[timestamp]\quick-restore-seed.ps1
```

### Production
```powershell
.\scripts\backup-seed-data.ps1 -IncludeMedia
# ... deployment ...
.\seed-backups\[timestamp]\restore-seed-data.ps1
```

## 🔧 Sorun Giderme

| Hata | Çözüm |
|------|-------|
| BigInt serialization | Otomatik çözüldü |
| DB connection failed | Docker kontrol et |
| File not found | Dosya adını kontrol et |
| Foreign key error | Otomatik çözüldü |

## 📊 Veri Durumu

```
👤 Users: 2
🏗️ Hafriyat: 3 bölge, 6 saha
📰 News: 5 kategori, 15 haber
🏢 Projects: 20 proje
🏷️ Tags: 33 etiket
🖼️ Galleries: 80 galeri
⚡ Quick Access: 6 link
💬 Comments: 4 yorum
```

---
**Hızlı Referans** | **Detaylı Rehber**: `docs/SEED_DATA_BACKUP_GUIDE.md`
