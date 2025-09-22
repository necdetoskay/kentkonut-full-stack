# API Utilities - Kullanım Kılavuzu

Bu klasör, tüm modüller için merkezi API yönetimi sağlayan utility dosyalarını içerir.

## 📁 Dosya Yapısı

```
utils/
├── apiClient.ts          # Genel API client (tüm modüller için)
├── corporateApi.ts       # Kurumsal modül API'leri
├── newsApi.ts           # Haberler modülü API'leri
├── mediaApi.ts          # Medya modülü API'leri
├── projectsApi.ts       # Projeler modülü API'leri
├── pagesApi.ts          # Sayfalar modülü API'leri
├── simplePagesApi.ts    # Basit sayfalar modülü API'leri
└── README.md            # Bu dosya
```

## 🚀 Kullanım Örnekleri

### 1. Genel API Client Kullanımı

```typescript
import { ApiClient, CachedApiClient } from '@/utils/apiClient';

// Basit GET isteği
const users = await ApiClient.get<any[]>('/api/users');

// POST isteği
const newUser = await ApiClient.post<any>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Cache'li GET isteği
const cachedUsers = await CachedApiClient.get<any[]>('/api/users', 'users-cache');
```

### 2. Modül-Spesifik API Kullanımı

#### Kurumsal Modül
```typescript
import { CorporateAPI, CachedCorporateAPI } from '@/utils/corporateApi';

// Yönetici listesi
const executives = await CorporateAPI.executives.getAll();

// Cache'li yönetici listesi
const cachedExecutives = await CachedCorporateAPI.executives.getAll();
```

#### Haberler Modülü
```typescript
import { NewsAPI, CachedNewsAPI } from '@/utils/newsApi';

// Haber listesi
const news = await NewsAPI.getAll({ category: 'genel' });

// Cache'li haber kategorileri
const categories = await CachedNewsAPI.getCategories();
```

#### Medya Modülü
```typescript
import { MediaAPI, CachedMediaAPI } from '@/utils/mediaApi';

// Medya listesi
const media = await MediaAPI.getAll({ category: 'resimler' });

// Dosya yükleme
const formData = new FormData();
formData.append('file', file);
const uploadedMedia = await MediaAPI.upload(formData);
```

#### Projeler Modülü
```typescript
import { ProjectsAPI, CachedProjectsAPI } from '@/utils/projectsApi';

// Proje listesi
const projects = await ProjectsAPI.getAll({ status: 'ONGOING' });

// Proje detayı
const project = await ProjectsAPI.getBySlug('proje-slug');

// İlgili projeler
const related = await ProjectsAPI.getRelated('project-id', 3);
```

#### Sayfalar Modülü
```typescript
import { PagesAPI, CachedPagesAPI } from '@/utils/pagesApi';

// Sayfa listesi
const pages = await PagesAPI.getAll({ status: 'published' });

// Sayfa içeriği
const content = await PagesAPI.getContent('page-id');
```

#### Basit Sayfalar Modülü
```typescript
import { SimplePagesAPI, CachedSimplePagesAPI } from '@/utils/simplePagesApi';

// Basit sayfa listesi
const pages = await SimplePagesAPI.getAll();

// Basit sayfa detayı
const page = await SimplePagesAPI.getById('page-id');
```

## 🔧 Error Handling

```typescript
import { handleApiError } from '@/utils/apiClient';

try {
  const data = await ApiClient.get('/api/some-endpoint');
} catch (error) {
  const { message, details } = handleApiError(error);
  console.error('API Hatası:', message);
}
```

## 📦 Cache Yönetimi

```typescript
import { invalidateCache } from '@/utils/apiClient';
import { invalidateNewsCache } from '@/utils/newsApi';

// Belirli bir cache'i temizle
invalidateCache.byKey('users-cache');

// Pattern ile cache temizle
invalidateCache.byPattern('news');

// Tüm cache'i temizle
invalidateCache.all();

// Modül-spesifik cache temizleme
invalidateNewsCache.all();
```

## 🎯 Avantajlar

### ✅ Merkezi Yönetim
- Tüm API çağrıları tek yerden yönetilir
- Kod tekrarı önlenir
- Tutarlılık sağlanır

### ✅ Performans
- Otomatik cache sistemi
- Retry mekanizması
- Timeout yönetimi

### ✅ Güvenilirlik
- Hata yakalama ve loglama
- Otomatik yeniden deneme
- Detaylı hata mesajları

### ✅ Bakım Kolaylığı
- Modüler yapı
- Kolay güncelleme
- Temiz kod

## 🔄 Yeni Modül Ekleme

Yeni bir modül için API utility oluşturmak:

1. `utils/moduleNameApi.ts` dosyası oluştur
2. `ApiClient`'ı import et
3. Modül-spesifik fonksiyonları tanımla
4. Cache fonksiyonları ekle
5. Bu README'yi güncelle

## 📝 Best Practices

1. **Her zaman try-catch kullan**
2. **Cache'li versiyonları tercih et**
3. **Error handling'i unutma**
4. **Cache invalidation'ı doğru yap**
5. **TypeScript tiplerini kullan**

## 🚨 Önemli Notlar

- `corporateApi.ts` eski versiyon, yeni projelerde `apiClient.ts` kullan
- Cache TTL varsayılan olarak 5 dakika
- Retry mekanizması sadece network hatalarında çalışır
- CORS ayarları otomatik olarak yapılır
