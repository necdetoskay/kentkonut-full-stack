# Backend Uygulaması Hardcoded Değişkenler Analizi

## 📋 Genel Bakış

Bu rapor, KentKonut backend uygulamasında tespit edilen tüm hardcoded değişkenleri ve bunların merkezi environment yönetimine taşınması gereken alanları listeler.

## 🔍 Tespit Edilen Hardcoded Değişkenler

### 1. Port Konfigürasyonları

#### `config/ports.ts`
- **PRODUCTION_IP**: `'postgresql'` (satır 6)
- **DEVELOPMENT_IP**: `'localhost'` (satır 7)
- **PORT_CONFIG.FRONTEND_PORT**: `'3020'` (satır 69)
- **PORT_CONFIG.DATABASE_PORT**: `'5433'` (satır 72)
- **PORT_CONFIG.REDIS_PORT**: `'6379'` (satır 75)
- **PORT_CONFIG.PGADMIN_PORT**: `'8080'` (satır 78)

### 2. Next.js Konfigürasyonu

#### `next.config.js`
- **serverRuntimeConfig.hostname**: `'172.41.42.51'` (satır 20)
- **serverRuntimeConfig.port**: `3021` (satır 21)
- **publicRuntimeConfig.hostname**: `'172.41.42.51'` (satır 24)
- **publicRuntimeConfig.port**: `3021` (satır 25)
- **CORS Origins (Development)**: 
  - `'http://172.41.42.51:3000'`
  - `'http://172.41.42.51:3001'`
  - `'http://172.41.42.51:3002'`
  - `'http://172.41.42.51:3020'`
  - `'http://localhost:3020'` (satır 54)
- **CSP connect-src**: `'http://172.41.42.51:3020 http://172.41.42.51:3021'` (satır 74)

### 3. CORS Konfigürasyonu

#### `lib/cors.ts`
- **Fallback Origins**:
  - `'http://172.41.42.51:3020'`
  - `'http://172.41.42.51:3021'`
  - `'http://localhost:3020'`
  - `'http://localhost:3021'` (satır 35-40)

### 4. API Client Konfigürasyonları

#### `utils/corporateApi.ts`
- **API_CONFIG.timeout**: `30000` (satır 11)
- **API_CONFIG.retryAttempts**: `3` (satır 12)
- **API_CONFIG.retryDelay**: `1000` (satır 13)
- **Port conversion logic**: `:3021` -> `:3020` (satır 32)

#### `utils/apiClient.ts`
- **API_CONFIG.timeout**: `10000` (satır 9)
- **API_CONFIG.retryAttempts**: `3` (satır 10)
- **API_CONFIG.retryDelay**: `1000` (satır 11)

#### `lib/api-client.ts`
- **defaultHeaders**: Hardcoded Content-Type ve Accept headers

### 5. Environment Dosyalarındaki Hardcoded Değerler

#### `.env.development`
- **DATABASE_URL**: `postgresql://postgres:KentKonut2025@172.41.42.51:5433/kentkonutdb`
- **NEXTAUTH_URL**: `http://localhost:3021`
- **NEXT_PUBLIC_API_URL**: `http://localhost:3021`
- **REDIS_URL**: `redis://:redis123@172.41.42.51:6379`
- **PORT**: `3021`
- **ADMIN_EMAIL**: `admin@example.com`
- **ADMIN_PASSWORD**: `Admin123!`

#### `.env.production`
- **DATABASE_URL**: `postgresql://postgres:KentKonut2025@172.41.42.51:5433/kentkonutdb?charset=utf8`
- **NEXTAUTH_URL**: `http://172.41.42.51:3021`
- **NEXTAUTH_URL_INTERNAL**: `http://backend:3021`
- **NEXT_PUBLIC_API_URL**: `http://172.41.42.51:3021`
- **REDIS_URL**: `redis://redis:6379`
- **PORT**: `3021`

### 6. Çeşitli Dosyalardaki Hardcoded Değerler

#### `components/ui/seo-card.tsx`
- **baseUrl fallback**: `'https://kentkonut.com'` (satır 42, 71)

#### `scripts/check-service-cards.js`
- **apiBaseUrl fallback**: `'http://172.41.42.51:3022'` (satır 30)

#### Test dosyalarında:
- **connectionString fallback**: `'postgresql://postgres:P@ssw0rd@localhost:5432/kentkonutdb'`
- **API URL fallbacks**: `'http://localhost:3001'`, `'http://localhost:3010'`

### 7. Güvenlik ve Kimlik Doğrulama

#### `auth.config.ts`
- **session.maxAge**: `30 * 24 * 60 * 60` (30 gün, satır 75)
- **debug**: `true` (satır 78)
- **trustHost**: `true` (satır 79)
- **skipCSRFCheck**: `true` (satır 80)
- **useSecureCookies**: `false` (satır 83)

## 🎯 Öncelikli Düzeltilmesi Gerekenler

### Yüksek Öncelik
1. **IP Adresleri**: Tüm `172.41.42.51` referansları environment'a taşınmalı
2. **Port Numaraları**: Sabit port tanımları environment'a taşınmalı
3. **Database Credentials**: Şifreler ve connection string'ler güvenli hale getirilmeli
4. **API Base URLs**: Tüm hardcoded URL'ler merkezi konfigürasyona taşınmalı

### Orta Öncelik
1. **Timeout Değerleri**: API timeout'ları konfigüre edilebilir olmalı
2. **Retry Logic**: Retry sayıları ve delay'ler ayarlanabilir olmalı
3. **CORS Origins**: Dinamik origin yönetimi
4. **Security Settings**: Auth ayarları environment'a bağlı olmalı

### Düşük Öncelik
1. **Default Fallback Values**: Güvenli fallback değerleri
2. **Cache Settings**: Cache süreleri konfigüre edilebilir olmalı
3. **Debug Flags**: Debug modları environment'a bağlı olmalı

## 📝 Önerilen Çözümler

### 1. Merkezi Environment Konfigürasyonu
```typescript
// config/environment.ts
export const ENV_CONFIG = {
  SERVER: {
    HOST: process.env.SERVER_HOST || 'localhost',
    PORT: parseInt(process.env.PORT || '3021'),
    FRONTEND_PORT: parseInt(process.env.FRONTEND_PORT || '3020'),
  },
  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5433'),
    NAME: process.env.DB_NAME || 'kentkonutdb',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD,
  },
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379'),
    PASSWORD: process.env.REDIS_PASSWORD,
  },
  API: {
    TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),
    RETRY_ATTEMPTS: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
    RETRY_DELAY: parseInt(process.env.API_RETRY_DELAY || '1000'),
  }
};
```

### 2. Environment Validation
```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  SERVER_HOST: z.string().optional(),
  PORT: z.string().transform(Number).optional(),
  // ... diğer environment değişkenleri
});

export const env = envSchema.parse(process.env);
```

### 3. Dinamik CORS Konfigürasyonu
```typescript
// lib/cors-config.ts
export function getAllowedOrigins() {
  const baseHost = process.env.SERVER_HOST || 'localhost';
  const frontendPort = process.env.FRONTEND_PORT || '3020';
  const backendPort = process.env.PORT || '3021';
  
  return [
    `http://${baseHost}:${frontendPort}`,
    `http://${baseHost}:${backendPort}`,
    ...(process.env.ADDITIONAL_CORS_ORIGINS?.split(',') || [])
  ];
}
```

## 🔧 Gerekli Environment Değişkenleri

### Yeni Eklenecek Environment Değişkenleri
```bash
# Server Configuration
SERVER_HOST=172.41.42.51
FRONTEND_PORT=3020
BACKEND_PORT=3021

# Database Configuration
DB_HOST=172.41.42.51
DB_PORT=5433
DB_NAME=kentkonutdb
DB_USER=postgres
DB_PASSWORD=KentKonut2025

# Redis Configuration
REDIS_HOST=172.41.42.51
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# API Configuration
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# Security Configuration
SESSION_MAX_AGE=2592000
USE_SECURE_COOKIES=false
SKIP_CSRF_CHECK=true

# Additional CORS Origins
ADDITIONAL_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Default URLs
DEFAULT_BASE_URL=https://kentkonut.com
```

## 📊 Etki Analizi

### Değiştirilecek Dosyalar
- `config/ports.ts` - Tamamen yeniden yapılandırılacak
- `next.config.js` - Environment değişkenlerine bağlanacak
- `lib/cors.ts` - Dinamik origin yönetimi
- `utils/apiClient.ts` - Merkezi konfigürasyon kullanımı
- `utils/corporateApi.ts` - Hardcoded değerlerin kaldırılması
- `auth.config.ts` - Environment'a bağlı güvenlik ayarları
- `.env.development` ve `.env.production` - Yeni değişkenler

### Test Edilecek Alanlar
- API bağlantıları
- CORS ayarları
- Database bağlantısı
- Redis bağlantısı
- Authentication flow
- Frontend-Backend iletişimi

---

**Rapor Tarihi**: 2025-01-09  
**Analiz Kapsamı**: KentKonut Backend Uygulaması  
**Durum**: Analiz Tamamlandı, Implementasyon Bekliyor