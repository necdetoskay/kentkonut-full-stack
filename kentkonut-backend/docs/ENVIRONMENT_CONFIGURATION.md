# Environment Configuration Guide

Bu dokümantasyon, KentKonut uygulamasının environment konfigürasyon sistemini açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Environment Değişkenleri](#environment-değişkenleri)
3. [Konfigürasyon Dosyaları](#konfigürasyon-dosyaları)
4. [Validation Sistemi](#validation-sistemi)
5. [Development vs Production](#development-vs-production)
6. [Troubleshooting](#troubleshooting)

## 🎯 Genel Bakış

Uygulama, merkezi bir environment konfigürasyon sistemi kullanır:

- **Validation**: Zod ile tip güvenli environment validation
- **Centralized Config**: Tüm konfigürasyonlar tek yerden yönetilir
- **Type Safety**: TypeScript ile tam tip desteği
- **Environment Specific**: Development ve production için farklı ayarlar

### Konfigürasyon Mimarisi

```
config/
├── environment.ts     # Ana konfigürasyon dosyası
├── validation.ts      # Environment validation şemaları
└── types.ts          # TypeScript tip tanımları (opsiyonel)
```

## 🔧 Environment Değişkenleri

### Zorunlu Değişkenler

#### Server Configuration
```bash
# Server ayarları
NODE_ENV=development|production|test
PORT=3021
HOST=172.41.42.51
```

#### Database Configuration
```bash
# Veritabanı bağlantısı
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Authentication
```bash
# NextAuth.js ayarları
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
NEXTAUTH_URL=http://localhost:3021
NEXTAUTH_URL_INTERNAL=http://localhost:3021  # Opsiyonel
```

#### API Configuration
```bash
# API ayarları
NEXT_PUBLIC_API_URL=http://localhost:3021
```

#### Admin Configuration
```bash
# Admin kullanıcı bilgileri
ADMIN_EMAIL=admin@kentkonut.com
ADMIN_PASSWORD=SecurePassword123!
```

### Opsiyonel Değişkenler

#### Redis Configuration
```bash
# Redis ayarları (opsiyonel)
REDIS_HOST=172.41.42.51
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

#### API Settings
```bash
# API timeout ve retry ayarları
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
```

#### Security Settings
```bash
# Güvenlik ayarları
SESSION_MAX_AGE=2592000  # 30 gün (saniye)
USE_SECURE_COOKIES=false
SKIP_CSRF_CHECK=false
TRUST_HOST=true
```

#### CORS Configuration
```bash
# CORS ayarları
CORS_ALLOWED_ORIGIN=http://localhost:3020,http://172.41.42.51:3020
```

#### File Upload
```bash
# Dosya yükleme ayarları
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

#### Analytics
```bash
# Google Analytics (opsiyonel)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

#### Debug
```bash
# Debug ayarları
DEBUG_MODE=false
```

#### Default URLs
```bash
# Varsayılan URL'ler
DEFAULT_BASE_URL=https://kentkonut.com
```

## 📁 Konfigürasyon Dosyaları

### environment.ts

Ana konfigürasyon dosyası. Tüm environment değişkenlerini validate eder ve merkezi `ENV_CONFIG` objesini oluşturur.

```typescript
import { ENV_CONFIG } from '@/config/environment';

// Kullanım örneği
const apiUrl = ENV_CONFIG.API.BASE_URL;
const dbUrl = ENV_CONFIG.DATABASE.URL;
const isProduction = ENV_CONFIG.IS_PRODUCTION;
```

### validation.ts

Zod şemaları ile environment validation sağlar:

- **envSchema**: Ana validation şeması
- **validateEnv**: Environment validation fonksiyonu
- **featureValidators**: Özellik bazlı validation'lar
- **validateEnvWithWarnings**: Warning'ler ile validation

## 🔍 Validation Sistemi

### Otomatik Validation

Uygulama başlatıldığında tüm environment değişkenleri otomatik olarak validate edilir:

```typescript
// Başarılı validation
✅ Environment validation successful

// Hatalı validation
❌ Environment validation failed:
  - NEXTAUTH_SECRET: String must contain at least 32 character(s)
  - DATABASE_URL: Invalid url
```

### Warning Sistemi

Production ortamında eksik opsiyonel değişkenler için uyarılar:

```typescript
⚠️  Environment validation warnings:
  - GOOGLE_ANALYTICS_ID is not set for production environment
  - REDIS_PASSWORD is not set for production environment
```

### Özellik Bazlı Validation

```typescript
import { featureValidators } from '@/config/validation';

// Sadece database ayarlarını validate et
featureValidators.database(process.env);

// Sadece auth ayarlarını validate et
featureValidators.auth(process.env);
```

## 🚀 Development vs Production

### Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=3021
HOST=localhost
DATABASE_URL=postgresql://postgres:password@localhost:5432/kentkonutdb
NEXTAUTH_URL=http://localhost:3021
NEXT_PUBLIC_API_URL=http://localhost:3021
DEBUG_MODE=true
USE_SECURE_COOKIES=false
```

**Development Özellikleri:**
- Localhost URL'leri
- Debug mode aktif
- Güvenli cookie'ler devre dışı
- CORS için geniş origin listesi
- Detaylı hata mesajları

### Production Environment

```bash
# .env.production
NODE_ENV=production
PORT=3021
HOST=172.41.42.51
DATABASE_URL=postgresql://postgres:password@172.41.42.51:5433/kentkonutdb
NEXTAUTH_URL=http://172.41.42.51:3021
NEXT_PUBLIC_API_URL=http://172.41.42.51:3021
DEBUG_MODE=false
USE_SECURE_COOKIES=true
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

**Production Özellikleri:**
- Gerçek IP adresleri
- Debug mode kapalı
- Güvenli cookie'ler aktif
- Sınırlı CORS origins
- Analytics aktif

## 🔧 Kullanım Örnekleri

### API Client'da Kullanım

```typescript
import { ENV_CONFIG } from '@/config/environment';

const API_CONFIG = {
  baseUrl: ENV_CONFIG.API.BASE_URL,
  timeout: ENV_CONFIG.API.TIMEOUT,
  retryAttempts: ENV_CONFIG.API.RETRY_ATTEMPTS,
};
```

### CORS Ayarlarında Kullanım

```typescript
import { ENV_CONFIG } from '@/config/environment';

const corsOptions = {
  origin: ENV_CONFIG.CORS.ALLOWED_ORIGINS,
  credentials: true,
};
```

### NextAuth Konfigürasyonunda

```typescript
import { ENV_CONFIG } from '@/config/environment';

export default {
  secret: ENV_CONFIG.AUTH.SECRET,
  session: {
    maxAge: ENV_CONFIG.AUTH.SESSION_MAX_AGE,
  },
  useSecureCookies: ENV_CONFIG.AUTH.USE_SECURE_COOKIES,
} satisfies NextAuthConfig;
```

## 🛠️ Troubleshooting

### Yaygın Hatalar

#### 1. NEXTAUTH_SECRET Eksik
```bash
Error: NEXTAUTH_SECRET must be at least 32 characters
```
**Çözüm**: Minimum 32 karakter uzunluğunda secret oluşturun:
```bash
NEXTAUTH_SECRET="kentkonut-super-secret-jwt-key-2025-production"
```

#### 2. Geçersiz Database URL
```bash
Error: DATABASE_URL: Invalid url
```
**Çözüm**: Doğru PostgreSQL URL formatı kullanın:
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### 3. Port Çakışması
```bash
Error: Port 3021 is already in use
```
**Çözüm**: Farklı port kullanın veya çakışan servisi durdurun:
```bash
PORT=3022
```

### Debug Modunu Aktifleştirme

```bash
# Environment'ta debug aktif et
DEBUG_MODE=true

# NextAuth debug
NEXTAUTH_DEBUG=true
```

### Environment Validation Test

```typescript
// Test script
import { validateEnv } from '@/config/validation';

try {
  const config = validateEnv(process.env);
  console.log('✅ Environment validation successful');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
}
```

## 📝 Best Practices

### 1. Environment Dosyaları
- `.env.local` dosyasını git'e commit etmeyin
- Production'da gerçek değerleri kullanın
- Sensitive bilgileri şifreleyin

### 2. Validation
- Yeni environment değişkeni eklerken validation şemasını güncelleyin
- Zorunlu alanları belirtin
- Default değerler sağlayın

### 3. Type Safety
- `ENV_CONFIG` objesini kullanın
- Direct `process.env` erişiminden kaçının
- TypeScript tiplerini kullanın

### 4. Security
- Production'da debug mode'u kapatın
- Güvenli cookie'leri aktifleştirin
- CORS origins'i sınırlayın

## 🔄 Migration Guide

### Eski Hardcoded Değerlerden Migration

#### Önce (Hardcoded)
```typescript
const apiUrl = 'http://172.41.42.51:3021';
const timeout = 10000;
```

#### Sonra (Environment)
```typescript
import { ENV_CONFIG } from '@/config/environment';

const apiUrl = ENV_CONFIG.API.BASE_URL;
const timeout = ENV_CONFIG.API.TIMEOUT;
```

### Yeni Environment Değişkeni Ekleme

1. **validation.ts**'ye şema ekleyin:
```typescript
export const envSchema = z.object({
  // ... existing fields
  NEW_VARIABLE: z.string().default('default-value'),
});
```

2. **environment.ts**'ye konfigürasyon ekleyin:
```typescript
export const ENV_CONFIG = {
  // ... existing config
  NEW_FEATURE: {
    VARIABLE: env.NEW_VARIABLE,
  },
};
```

3. **.env** dosyalarına değişken ekleyin:
```bash
NEW_VARIABLE=production-value
```

---

**Son Güncelleme**: 2025-01-09  
**Versiyon**: 1.0.0  
**Durum**: Aktif Kullanımda