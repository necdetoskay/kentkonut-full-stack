# KentKonut Production Deployment Guide

Bu rehber, KentKonut uygulamasını remote host'ta production ortamında çalıştırmak için gerekli adımları açıklar.

## 📋 Gereksinimler

- Docker Engine 20.10+
- Docker Compose 2.0+
- En az 4GB RAM
- En az 20GB disk alanı
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+

## 🚀 Hızlı Başlangıç

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/your-username/kentkonut-full-stack.git
cd kentkonut-full-stack
```

### 2. Environment Variables'ı Yapılandırın

```bash
# Production environment dosyasını kopyalayın
cp .env.production .env

# Environment variables'ı düzenleyin
nano .env
```

**Önemli:** Aşağıdaki değerleri mutlaka değiştirin:
- `POSTGRES_PASSWORD`: Güçlü bir PostgreSQL şifresi
- `REDIS_PASSWORD`: Güçlü bir Redis şifresi  
- `JWT_SECRET`: En az 32 karakter uzunluğunda güçlü bir secret key
- `API_BASE_URL` ve `VITE_API_BASE_URL`: Gerçek domain'inizi yazın
- `CORS_ORIGIN`: Frontend domain'lerinizi ekleyin

### 3. Uygulamayı Başlatın

```bash
# Sadece temel servisler (frontend, backend, database, redis)
docker-compose -f docker-compose.production.yml up -d

# Nginx reverse proxy ile birlikte (domain kullanıyorsanız)
docker-compose -f docker-compose.production.yml --profile nginx up -d
```

### 4. Servislerin Durumunu Kontrol Edin

```bash
# Container'ların durumunu kontrol edin
docker-compose -f docker-compose.production.yml ps

# Logları kontrol edin
docker-compose -f docker-compose.production.yml logs -f
```

## 🔧 Konfigürasyon

### Port Yapılandırması

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3021
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Nginx** (opsiyonel): http://localhost:80, https://localhost:443

### SSL/HTTPS Yapılandırması

1. SSL sertifikalarınızı `nginx/ssl/` klasörüne yerleştirin:
   ```bash
   mkdir -p nginx/ssl
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-private-key.key nginx/ssl/private.key
   ```

2. `nginx/nginx.conf` dosyasında SSL konfigürasyonunu aktif edin (yorum satırlarını kaldırın)

3. Nginx ile birlikte başlatın:
   ```bash
   docker-compose -f docker-compose.production.yml --profile nginx up -d
   ```

### Database Backup

```bash
# Database backup oluşturma
docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > backup.sql

# Backup'ı geri yükleme
docker exec -i kentkonut-postgres-prod psql -U postgres kentkonutdb < backup.sql
```

## 📊 Monitoring ve Logs

### Container Logları

```bash
# Tüm servislerin logları
docker-compose -f docker-compose.production.yml logs -f

# Sadece backend logları
docker-compose -f docker-compose.production.yml logs -f backend

# Sadece frontend logları
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Health Check

```bash
# Backend health check
curl http://localhost:3021/api/health

# Frontend health check
curl http://localhost:3000/health
```

## 🔄 Güncelleme

### Yeni Versiyon Deploy Etme

```bash
# Yeni imajları çek
docker-compose -f docker-compose.production.yml pull

# Servisleri yeniden başlat
docker-compose -f docker-compose.production.yml up -d

# Eski imajları temizle
docker image prune -f
```

### Belirli Bir Versiyonu Deploy Etme

`docker-compose.production.yml` dosyasında imaj tag'lerini değiştirin:

```yaml
backend:
  image: necdetoskay/kentkonut-backend:1.9.0  # Belirli versiyon

frontend:
  image: necdetoskay/kentkonut-frontend:1.9.0  # Belirli versiyon
```

## 🛠️ Troubleshooting

### Yaygın Sorunlar

1. **Container başlamıyor**:
   ```bash
   docker-compose -f docker-compose.production.yml logs [service-name]
   ```

2. **Database bağlantı hatası**:
   - PostgreSQL container'ının çalıştığını kontrol edin
   - Environment variables'ı kontrol edin
   - Network bağlantısını kontrol edin

3. **Banner resimleri yüklenmiyor**:
   - Volume mount'larını kontrol edin
   - File permissions'ları kontrol edin

### Performance Tuning

1. **PostgreSQL**:
   ```bash
   # postgresql.conf ayarları için
   docker exec kentkonut-postgres-prod psql -U postgres -c "SHOW all;"
   ```

2. **Redis**:
   ```bash
   # Redis memory kullanımı
   docker exec kentkonut-redis-prod redis-cli info memory
   ```

## 🔒 Güvenlik

### Önerilen Güvenlik Ayarları

1. **Firewall Konfigürasyonu**:
   ```bash
   # Sadece gerekli portları açın
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

2. **Docker Security**:
   - Container'ları root olmayan kullanıcı ile çalıştırın
   - Secrets'ları environment variables yerine Docker secrets kullanın
   - Regular security updates yapın

3. **SSL/TLS**:
   - Let's Encrypt kullanarak ücretsiz SSL sertifikası alın
   - Strong cipher suites kullanın
   - HSTS header'ları ekleyin

## 📞 Destek

Sorun yaşadığınızda:

1. Logları kontrol edin
2. GitHub Issues'da arama yapın
3. Yeni issue oluşturun

---

**Not**: Production ortamında çalıştırmadan önce tüm güvenlik ayarlarını gözden geçirin ve test edin.
