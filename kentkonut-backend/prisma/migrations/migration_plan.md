# Veritabanı Şema Değişikliği Planı

## Özet

Bu belge, proje galerisi yapısının yeniden tasarlanması için gerekli veritabanı şema değişikliklerini ve veri geçiş planını açıklar.

## Mevcut Yapı

Mevcut yapıda, `ProjectGalleryItem` tablosu hem galeri klasörlerini hem de medya öğelerini içerir:

- `ProjectGalleryItem` tablosu:
  - `isFolder` alanı ile klasör/medya ayrımı yapılır
  - Hiyerarşik yapı `parentId` ile sağlanır
  - `mediaId` alanı medya öğeleri için doldurulur, klasörler için null olur

## Yeni Yapı

Yeni yapıda, galeriler ve medya öğeleri ayrı tablolarda tutulacak:

1. `ProjectGallery` tablosu:
   - Sadece galeri kategorilerini içerir (İç Mekan, Dış Mekan, vb.)
   - Hiyerarşik yapı `parentId` ile sağlanır
   - Her galeri bir projeye bağlıdır (`projectId`)

2. `ProjectGalleryItem` tablosu:
   - Sadece medya öğelerini içerir (resim, video, doküman)
   - Her öğe bir galeriye bağlıdır (`galleryId`)
   - Her öğe bir medyaya bağlıdır (`mediaId` - zorunlu alan)

## Veri Geçiş Planı

1. Yeni tabloları oluştur
2. Mevcut `ProjectGalleryItem` tablosundan verileri çek
3. Klasör olan kayıtları (`isFolder = true`) yeni `ProjectGallery` tablosuna aktar
4. Medya öğesi olan kayıtları (`isFolder = false` ve `mediaId != null`) yeni `ProjectGalleryItem` tablosuna aktar
5. İlişkileri kur (parent-child ilişkileri ve galeri-item ilişkileri)

## Geçiş Adımları

```sql
-- 1. Yeni tabloları oluştur
CREATE TABLE "project_galleries" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "parentId" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  "category" TEXT NOT NULL DEFAULT 'DIS_MEKAN',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
  FOREIGN KEY ("parentId") REFERENCES "project_galleries"("id")
);

CREATE TABLE "project_gallery_items" (
  "id" SERIAL PRIMARY KEY,
  "galleryId" INTEGER NOT NULL,
  "mediaId" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("galleryId") REFERENCES "project_galleries"("id") ON DELETE CASCADE,
  FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE
);

-- 2. İndeksler oluştur
CREATE INDEX "project_galleries_projectId" ON "project_galleries"("projectId");
CREATE INDEX "project_galleries_parentId" ON "project_galleries"("parentId");
CREATE INDEX "project_galleries_category" ON "project_galleries"("category");
CREATE INDEX "project_gallery_items_galleryId" ON "project_gallery_items"("galleryId");
CREATE INDEX "project_gallery_items_mediaId" ON "project_gallery_items"("mediaId");

-- 3. Veri geçişi için geçici ID eşleştirme tablosu
CREATE TEMPORARY TABLE "id_mapping" (
  "old_id" INTEGER PRIMARY KEY,
  "new_id" INTEGER NOT NULL,
  "is_folder" BOOLEAN NOT NULL
);
```

## Uygulama Değişiklikleri

1. API endpoint'leri yeni şemaya göre güncellenmeli
2. Frontend bileşenleri yeni API yanıtlarına göre adapte edilmeli
3. Yönetici paneli galeri yönetim arayüzü güncellenmeli

## Geri Dönüş Planı

1. Yeni tablolardan veri yedekle
2. Eski şemaya geri dön
3. Yedeklenen verileri eski formata dönüştür ve geri yükle

## Zaman Çizelgesi

1. Şema değişikliği ve test: 1 gün
2. Veri geçişi: 1 gün
3. API güncellemeleri: 2 gün
4. Frontend güncellemeleri: 2 gün
5. Test ve hata düzeltme: 2 gün

Toplam: 8 gün
