# Galeri Sistemi Uygulama Rehberi

Bu belge, yeni galeri sistemi yapısının uygulanması için adım adım rehber sunmaktadır.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Veritabanı Şeması](#veritabanı-şeması)
3. [Uygulama Adımları](#uygulama-adımları)
4. [API Endpoint'leri](#api-endpointleri)
5. [Frontend Entegrasyonu](#frontend-entegrasyonu)
6. [Sorun Giderme](#sorun-giderme)

## Genel Bakış

Yeni galeri sistemi, PRD'ye uygun olarak hiyerarşik bir yapıda tasarlanmıştır. Sistem iki ana bileşenden oluşur:

1. **ProjectGallery**: Galeri klasörleri (kategoriler, alt kategoriler)
2. **ProjectGalleryItem**: Galeri içindeki medya öğeleri

Bu yapı, eski `ProjectGalleryItem` tablosundaki `isFolder` alanı ile karışık tutulan yapıdan farklıdır. Yeni yapıda galeriler ve medya öğeleri ayrı tablolarda tutularak daha temiz bir yapı oluşturulmuştur.

## Veritabanı Şeması

### ProjectGallery Modeli

```prisma
model ProjectGallery {
  id          Int             @id @default(autoincrement())
  projectId   Int             // Hangi projeye ait
  title       String          // Galeri başlığı
  description String?         // Galeri açıklaması
  parentId    Int?            // Üst galeri (hiyerarşik yapı için)
  order       Int             @default(0)
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  
  // İlişkiler
  project     Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent      ProjectGallery? @relation("GalleryHierarchy", fields: [parentId], references: [id])
  children    ProjectGallery[] @relation("GalleryHierarchy")
  items       ProjectGalleryItem[] // Galerinin içindeki medya öğeleri
}
```

### ProjectGalleryItem Modeli

```prisma
model ProjectGalleryItem {
  id          Int           @id @default(autoincrement())
  galleryId   Int           // Hangi galeriye ait
  mediaId     String        // Medya ID'si (boş olamaz)
  title       String?       // Öğe başlığı (opsiyonel)
  description String?       // Öğe açıklaması
  order       Int           @default(0)
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // İlişkiler
  gallery     ProjectGallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  media       Media          @relation(fields: [mediaId], references: [id], onDelete: Cascade)
}
```

## Uygulama Adımları

### 1. Veritabanı Şemasını Güncelleme

1. `prisma/migrations/20250924_create_project_gallery_tables.sql` dosyasını PostgreSQL veritabanınızda çalıştırın:

```bash
psql -U postgres -d kentkonut -f prisma/migrations/20250924_create_project_gallery_tables.sql
```

2. Prisma şemasını güncelleyin:

```bash
# schema.prisma dosyasını schema-update.prisma ile değiştirin
cp prisma/schema-update.prisma prisma/schema.prisma

# Prisma client'ı güncelleyin
npx prisma generate
```

### 2. Veri Geçişi

1. Eski verilerinizi yeni yapıya geçirmek için veri geçiş script'ini çalıştırın:

```bash
node scripts/migrate-gallery-data-simple.js
```

2. Test verisi oluşturmak için:

```bash
node scripts/create-test-gallery-structure.js
```

### 3. API Endpoint'lerini Güncelleme

1. Yeni API endpoint'lerini aktif edin:

```bash
# Eski API dosyalarını yedekleyin
mv app/api/projects/[id]/gallery/route.ts app/api/projects/[id]/gallery/route.ts.old
mv app/api/projects/[id]/gallery/[galleryId]/route.ts app/api/projects/[id]/gallery/[galleryId]/route.ts.old

# Yeni API dosyalarını aktif edin
mv app/api/projects/[id]/gallery/route-new.ts app/api/projects/[id]/gallery/route.ts
mv app/api/projects/[id]/gallery/[galleryId]/route-new.ts app/api/projects/[id]/gallery/[galleryId]/route.ts
```

## API Endpoint'leri

Yeni galeri sistemi için aşağıdaki API endpoint'leri mevcuttur:

### Galeri Yapısı

- `GET /api/projects/[id]/gallery`: Proje için galeri yapısını getirir
- `POST /api/projects/[id]/gallery`: Yeni galeri oluşturur

### Galeri İşlemleri

- `GET /api/projects/[id]/gallery/[galleryId]`: Belirli bir galerinin detaylarını getirir
- `PUT /api/projects/[id]/gallery/[galleryId]`: Galeriyi günceller
- `DELETE /api/projects/[id]/gallery/[galleryId]`: Galeriyi siler

### Medya Öğeleri

- `GET /api/projects/[id]/gallery/[galleryId]/items`: Galerinin medya öğelerini getirir
- `POST /api/projects/[id]/gallery/[galleryId]/items`: Galeriye yeni medya öğesi ekler

### Medya Öğesi İşlemleri

- `GET /api/projects/[id]/gallery/[galleryId]/items/[itemId]`: Belirli bir medya öğesinin detaylarını getirir
- `PUT /api/projects/[id]/gallery/[galleryId]/items/[itemId]`: Medya öğesini günceller
- `DELETE /api/projects/[id]/gallery/[galleryId]/items/[itemId]`: Medya öğesini siler

### Arama

- `GET /api/projects/[id]/gallery/search?q=arama_terimi`: Galeri ve medya öğelerinde arama yapar

## Frontend Entegrasyonu

Frontend tarafında aşağıdaki değişiklikleri yapmanız gerekecektir:

1. Yeni API endpoint'lerini kullanacak servis katmanı oluşturun
2. Galeri bileşenlerini yeni veri yapısına göre güncelleyin
3. Medya öğesi ekleme/düzenleme/silme işlemlerini yeni API'lere göre güncelleyin

Örnek servis katmanı:

```typescript
// services/galleryService.ts

// Galeri yapısını getir
export async function getGalleryStructure(projectId: number) {
  const response = await fetch(`/api/projects/${projectId}/gallery`);
  return response.json();
}

// Galerinin medya öğelerini getir
export async function getGalleryItems(projectId: number, galleryId: number, page = 1, limit = 12) {
  const response = await fetch(`/api/projects/${projectId}/gallery/${galleryId}/items?page=${page}&limit=${limit}`);
  return response.json();
}

// Galeriye medya öğesi ekle
export async function addGalleryItem(projectId: number, galleryId: number, data: any) {
  const response = await fetch(`/api/projects/${projectId}/gallery/${galleryId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Diğer servis fonksiyonları...
```

## Sorun Giderme

### Veritabanı Hataları

- **Tablo bulunamadı hatası**: Veritabanı migration dosyasının başarıyla çalıştırıldığından emin olun.
- **İlişki hataları**: Silme işlemlerinde CASCADE kısıtlamalarına dikkat edin.

### API Hataları

- **404 Not Found**: URL yapısını ve ID'lerin doğru formatta olduğunu kontrol edin.
- **400 Bad Request**: İstek gövdesindeki zorunlu alanların doğru formatta gönderildiğinden emin olun.

### Veri Geçişi Sorunları

- Veri geçişi sırasında hata alırsanız, `migrate-gallery-data-simple.js` dosyasındaki hata ayıklama çıktılarını kontrol edin.
- Gerekirse veritabanını manuel olarak kontrol edin ve düzeltin.
