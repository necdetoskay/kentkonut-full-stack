# KentKonut Konfigürasyon Rehberi

Bu rehber, KentKonut uygulamasının Development ve Production modlarında çalışması için gerekli konfigürasyonları açıklar.

## 📋 İçindekiler

1. [Modlar](#modlar)
2. [Environment Dosyaları](#environment-dosyaları)
3. [Konfigürasyon Dosyaları](#konfigürasyon-dosyaları)
4. [Modlar Arası Geçiş](#modlar-arası-geçiş)
5. [Test Etme](#test-etme)
6. [Sorun Giderme](#sorun-giderme)

---

## 🚀 Modlar

### Development Modu
- **Sunucu Adresi**: `localhost`
- **Frontend Port**: `3020`
- **Backend Port**: `3021`
- **Database**: `172.41.42.51:5433`

### Production Modu
- **Sunucu Adresi**: `172.41.42.51`
- **Frontend Port**: `3020`
- **Backend Port**: `3021`
- **Database**: `172.41.42.51:5433`

---

## 🔧 Environment Dosyaları

### Development Environment
```bash
# env.development.example dosyasını kopyala
cp env.development.example .env.development

# Gerekirse düzenle
nano .env.development
```

### Production Environment
```bash
# env.production.example dosyasını kopyala
cp env.production.example .env.production

# Gerekirse düzenle
nano .env.production
```

---

## 📁 Konfigürasyon Dosyaları

### 1. Ana Konfigürasyon (`config/environment.js`)
Bu dosya merkezi konfigürasyonu yönetir:

```javascript
// Development modunda
NODE_ENV=development
FRONTEND_HOST=localhost
BACKEND_HOST=localhost
DB_HOST=172.41.42.51

// Production modunda
NODE_ENV=production
FRONTEND_HOST=172.41.42.51
BACKEND_HOST=172.41.42.51
DB_HOST=172.41.42.51
```

### 2. Port Konfigürasyonu (`config/ports.json`)
Port ve URL konfigürasyonları:

```json
{
  "development": {
    "frontend": { "port": "3020", "url": "http://localhost:3020" },
    "backend": { "port": "3021", "url": "http://localhost:3021" },
    "database": { "port": "5433", "url": "postgresql://postgres:P@ssw0rd@172.41.42.51:5433/kentkonutdb" }
  },
  "production": {
    "frontend": { "port": "3020", "url": "http://172.41.42.51:3020" },
    "backend": { "port": "3021", "url": "http://172.41.42.51:3021" },
    "database": { "port": "5433", "url": "postgresql://postgres:P@ssw0rd@172.41.42.51:5433/kentkonutdb" }
  }
}
```

### 3. Frontend Konfigürasyonu
- `kentkonut-frontend/src/config/environment.js`
- `kentkonut-frontend/src/config/ports.ts`
- `kentkonut-frontend/src/config/ports.json`

### 4. Backend Konfigürasyonu
- `kentkonut-backend/config/ports.ts`
- `kentkonut-backend/prisma/schema.prisma`

### 5. Docker Konfigürasyonu
- `docker-compose.production.yml`

---

## 🔄 Modlar Arası Geçiş

### Development Moduna Geçiş

```bash
# 1. Environment değişkenini ayarla
export NODE_ENV=development

# 2. Environment dosyasını kopyala
cp env.development.example .env

# 3. Frontend'i başlat
cd kentkonut-frontend
npm run dev

# 4. Backend'i başlat (yeni terminal)
cd kentkonut-backend
npm run dev
```

### Production Moduna Geçiş

```bash
# 1. Environment değişkenini ayarla
export NODE_ENV=production

# 2. Environment dosyasını kopyala
cp env.production.example .env

# 3. Docker ile deploy et
docker-compose -f docker-compose.production.yml up -d
```

### Hızlı Geçiş Scriptleri

```bash
# Development moduna geç
./scripts/switch-to-dev.sh

# Production moduna geç
./scripts/switch-to-prod.sh
```

---

## 🧪 Test Etme

### Konfigürasyon Testi
```bash
# Tüm konfigürasyonları test et
node scripts/test-configuration.js
```

### Manuel Test
```bash
# Development modunda test
NODE_ENV=development node scripts/test-configuration.js

# Production modunda test
NODE_ENV=production node scripts/test-configuration.js
```

### Bağlantı Testi
```bash
# Frontend test
curl http://localhost:3020

# Backend test
curl http://localhost:3021/api/health

# Database test
psql -h 172.41.42.51 -p 5433 -U postgres -d kentkonutdb
```

---

## 🔍 Sorun Giderme

### Yaygın Sorunlar

#### 1. Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -tulpn | grep :3020
netstat -tulpn | grep :3021

# Gerekirse process'i sonlandır
sudo kill -9 <PID>
```

#### 2. Database Bağlantı Sorunu
```bash
# Database erişilebilirliğini test et
telnet 172.41.42.51 5433

# Firewall kontrolü
sudo ufw status
```

#### 3. CORS Hatası
```bash
# CORS ayarlarını kontrol et
# config/environment.js dosyasında cors.origin ayarları
```

#### 4. Environment Değişkeni Sorunu
```bash
# Environment değişkenlerini kontrol et
echo $NODE_ENV
env | grep NODE_ENV

# .env dosyasını kontrol et
cat .env
```

### Debug Komutları

```bash
# Konfigürasyon bilgilerini göster
node -e "console.log(require('./config/environment.js'))"

# Frontend konfigürasyonunu göster
node -e "console.log(require('./kentkonut-frontend/src/config/ports.json'))"

# Backend konfigürasyonunu göster
node -e "console.log(require('./kentkonut-backend/config/ports.ts'))"
```

---

## 📝 Önemli Notlar

### 1. Database Bağlantısı
- Her iki modda da database `172.41.42.51:5433` adresinde çalışır
- Database şifresi: `P@ssw0rd`
- Database adı: `kentkonutdb`

### 2. Port Kullanımı
- Frontend her zaman port `3020` kullanır
- Backend her zaman port `3021` kullanır
- Database her zaman port `5433` kullanır

### 3. Environment Değişkenleri
- `NODE_ENV`: `development` veya `production`
- `FRONTEND_HOST`: `localhost` (dev) veya `172.41.42.51` (prod)
- `BACKEND_HOST`: `localhost` (dev) veya `172.41.42.51` (prod)
- `DB_HOST`: Her iki modda da `172.41.42.51`

### 4. Docker Kullanımı
- Production modunda Docker kullanılır
- Development modunda local çalışma tercih edilir
- Docker konfigürasyonu `docker-compose.production.yml` dosyasında

---

## 🚀 Hızlı Başlangıç

### Development Modunda Çalıştırma
```bash
# 1. Environment ayarla
export NODE_ENV=development

# 2. Frontend başlat
cd kentkonut-frontend && npm run dev

# 3. Backend başlat (yeni terminal)
cd kentkonut-backend && npm run dev

# 4. Tarayıcıda aç
# Frontend: http://localhost:3020
# Backend: http://localhost:3021
```

### Production Modunda Çalıştırma
```bash
# 1. Environment ayarla
export NODE_ENV=production

# 2. Docker ile deploy et
docker-compose -f docker-compose.production.yml up -d

# 3. Tarayıcıda aç
# Frontend: http://172.41.42.51:3020
# Backend: http://172.41.42.51:3021
```

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Önce test scriptini çalıştırın: `node scripts/test-configuration.js`
2. Log dosyalarını kontrol edin
3. Environment değişkenlerini doğrulayın
4. Port kullanımını kontrol edin
5. Database bağlantısını test edin

Bu rehber ile uygulamanızı her iki modda da sorunsuz çalıştırabilirsiniz.
