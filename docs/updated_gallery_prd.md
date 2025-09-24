# Proje Detay Galerisi - Product Requirements Document (PRD)

## 📋 Genel Bakış

### Proje Adı
Hiyerarşik Proje Galerisi Sistemi

### Versiyon
v1.1 - Güncellenmiş Veritabanı Yapısı

### Tarih
24 Eylül 2025

### Durum
Tasarım Aşaması - Güncellenmiş

---

## 🎯 Amaç ve Hedefler

### Ana Amaç
Emlak projelerinin çoklu medya dosyalarını (resim, video, PDF, Word belgesi) hiyerarşik galeri sistemi ile organize edilmiş, kullanıcı dostu bir yapıda sunmak.

### İş Hedefleri
- Kullanıcı deneyimini iyileştirmek
- Proje medyalarını kategorik galeri yapısında düzenlemek
- Çoklu dosya formatını desteklemek (resim, video, PDF, Word)
- Esnek galeri hiyerarşisi ile organizasyon sağlamak
- Yönetici panelinde kolay galeri ve medya yönetimi

### Başarı Kriterleri
- Kullanıcıların %80'i 3 saniye içinde aradığı medyayı bulabilmeli
- Sayfa yükleme süresi 2 saniyenin altında olmalı
- Mobil uyumluluk %100 olmalı
- Farklı dosya formatları sorunsuz görüntülenmeli

---

## 👥 Hedef Kitle

### Birincil Kullanıcılar
- **Emlak Alıcıları**: Proje medyalarını inceleyen potansiyel müşteriler
- **Emlak Danışmanları**: Müşterilere proje sunan satış ekipleri

### İkincil Kullanıcılar
- **İçerik Yöneticileri**: Galeri ve medya içeriğini yöneten admin kullanıcıları
- **Pazarlama Ekibi**: Proje tanıtımı yapan ekipler

---

## ⚙️ Fonksiyonel Gereksinimler

### 1. Galeri Yapısı

#### 1.1 Hiyerarşik Galeri Organizasyonu
- **Ana Galeri Seviyesi**: Root level galeri kategorileri
- **Alt Galeri Seviyesi**: Parent galerinin alt galerileri
- **Sınırsız Derinlik**: İstediği kadar galeri seviyesi oluşturulabilmeli
- **Esnek Yapı**: Her galeri hem alt galeri hem de medya içerebilir

#### 1.2 Galeri İçerik Senaryoları

##### Senaryo A: Galeri + Alt Galeriler + Medya
```
📁 İç Mekan (Galeri)
├── 🖼️ iç-mekan-genel.jpg
├── 🎥 iç-mekan-tour.mp4
├── 📁 Salon (Alt Galeri)
│   ├── 🖼️ salon-1.jpg
│   └── 📄 salon-detay.pdf
├── 📁 Mutfak (Alt Galeri)
└── 📁 Yatak Odaları (Alt Galeri)
    ├── 📁 Master Yatak Odası
    └── 📁 Çocuk Odası
```

##### Senaryo B: Sadece Alt Galeriler
```
📁 Dış Mekan (Galeri)
├── 📁 Bahçe (Alt Galeri)
├── 📁 Havuz Alanı (Alt Galeri)
└── 📁 Cephe Görünümleri (Alt Galeri)
```

##### Senaryo C: Sadece Medya
```
📁 Kat Planları (Galeri)
├── 🖼️ kat-plani-zemin.jpg
├── 🖼️ kat-plani-1.jpg
├── 📄 kat-planlari-detay.pdf
└── 📄 teknik-cizim.dwg
```

### 2. Medya Yönetimi

#### 2.1 Desteklenen Dosya Formatları
- **Görseller**: JPG, PNG, WebP, SVG
- **Videolar**: MP4, WebM, MOV
- **Belgeler**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **CAD Dosyaları**: DWG, DXF (görüntüleyici ile)
- **3D Modeller**: GLB, GLTF (isteğe bağlı)

#### 2.2 Medya Görüntüleme
- **Görseller**: Grid layout + Lightbox
- **Videolar**: Video player ile popup
- **PDF**: Inline PDF viewer
- **Office Belgeler**: Google Docs Viewer entegrasyonu
- **CAD Dosyaları**: Özel viewer component

### 3. Navigasyon ve Arayüz

#### 3.1 Galeri Navigasyonu
- **Breadcrumb**: Galeri hiyerarşisinde konum gösterimi
- **Galeri Kartları**: Alt galerilerin görsel kartlar halinde sunumu
- **Medya Grid**: Galeri içindeki medyaların grid layoutu
- **Mixed View**: Alt galeriler + medyalar birlikte gösterimi

#### 3.2 Tab Sistemi (İsteğe Bağlı)
- Ana galerilerin tab formatında gösterimi
- Aktif galeri vurgulama
- Responsive tab scrolling

### 4. Arama ve Filtreleme

#### 4.1 Gelişmiş Arama
- Galeri adı ve açıklamasında arama
- Medya başlığı ve açıklamasında arama
- Dosya formatına göre arama
- Real-time arama sonuçları

#### 4.2 Akıllı Filtreleme
- **Medya Tipine Göre**: Resim, Video, Belge, CAD
- **Dosya Formatına Göre**: JPG, PDF, MP4, etc.
- **Tarih Aralığı**: Yüklenme tarihi
- **Boyut Filtresi**: Dosya boyutu
- **Galeri Bazlı Filtreleme**: Belirli galeriden medya gösterimi

---

## 🎨 Kullanıcı Arayüzü Gereksinimleri

### 1. Galeri Görünümleri

#### 1.1 Karma Görünüm (Varsayılan)
- Alt galeriler üstte büyük kartlar halinde
- Medyalar altta grid layoutta
- Her kart üzerinde içerik sayısı badge'i

#### 1.2 Sadece Galeri Görünümü
- Alt galerilerin liste veya grid halinde gösterimi
- Her galeri kartında preview görselleri
- İçerik istatistikleri (X resim, Y video, Z belge)

#### 1.3 Sadece Medya Görünümü
- Klasik grid layout
- Dosya tipi ikonları
- Hover'da medya bilgileri

### 2. Responsive Tasarım
- **Desktop**: 1920px+ (Ana kullanım)
- **Tablet**: 768px-1919px (Kartlar 2-3 kolon)
- **Mobile**: 320px-767px (Kartlar 1 kolon)

### 3. Medya Önizleme Sistemleri

#### 3.1 Lightbox Plus
- Görseller için geleneksel lightbox
- Videolar için video player
- PDF'ler için inline viewer
- Belgeler için download + preview seçeneği

#### 3.2 Dosya Kartları
- Dosya tipi ikonu
- Dosya adı ve boyutu
- Önizleme thumbnail'i (mümkünse)
- Download ve share butonları

---

## 🔧 Teknik Gereksinimler

### 1. Güncellenmiş Veritabanı Yapısı

#### 1.1 ProjectGallery Modeli
```prisma
model ProjectGallery {
  id          Int     @id @default(autoincrement())
  projectId   Int
  parentId    Int?    // NULL: root galeri, değer: parent galeri
  title       String
  description String?
  coverImage  String? // Galeri kapak görseli
  order       Int     @default(0)
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // İlişkiler
  project     Project @relation(fields: [projectId], references: [id])
  parent      ProjectGallery? @relation("GalleryHierarchy", fields: [parentId], references: [id])
  children    ProjectGallery[] @relation("GalleryHierarchy")
  media       ProjectGalleryMedia[]
  
  @@index([projectId, parentId])
  @@index([projectId, order])
}
```

#### 1.2 ProjectGalleryMedia Modeli
```prisma
model ProjectGalleryMedia {
  id          Int     @id @default(autoincrement())
  galleryId   Int
  fileName    String
  originalName String
  fileSize    BigInt
  mimeType    String
  fileUrl     String
  thumbnailUrl String?
  title       String?
  description String?
  alt         String?
  order       Int     @default(0)
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // İlişkiler
  gallery     ProjectGallery @relation(fields: [galleryId], references: [id])
  
  @@index([galleryId, order])
  @@index([mimeType])
}
```

### 2. API Gereksinimleri

#### 2.1 GET /api/projects/[slug]/galleries
```json
{
  "galleries": [
    {
      "id": 1,
      "title": "İç Mekan",
      "description": "İç mekan görselleri ve belgeleri",
      "coverImage": "/images/cover-1.jpg",
      "mediaCount": 15,
      "subGalleryCount": 3,
      "children": [
        {
          "id": 2,
          "title": "Salon",
          "mediaCount": 8,
          "children": []
        }
      ],
      "media": [
        {
          "id": 1,
          "fileName": "salon-genel.jpg",
          "mimeType": "image/jpeg",
          "fileUrl": "/uploads/salon-genel.jpg",
          "thumbnailUrl": "/uploads/thumbs/salon-genel.jpg",
          "title": "Salon Genel Görünüm"
        }
      ]
    }
  ]
}
```

#### 2.2 GET /api/galleries/[id]
- Belirli galerinin detay bilgileri
- Alt galeriler ve medyalar
- Breadcrumb için parent bilgileri

#### 2.3 GET /api/galleries/[id]/media
- Galeri medyalarının sayfalı listesi
- Filtreleme ve sıralama parametreleri
- Lazy loading desteği

### 3. Dosya Yönetimi

#### 3.1 Upload System
- Multi-file upload desteği
- Drag & drop interface
- Progress bar gösterimi
- Otomatik thumbnail oluşturma
- Virus scanning entegrasyonu

#### 3.2 Storage Optimizasyonu
- CDN entegrasyonu
- Image compression
- Video transcoding
- Progressive download

### 4. Performans Gereksinimleri
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **File Download Speed**: > 2MB/s
- **Thumbnail Generation**: < 3s
- **Video Processing**: < 30s (1GB video için)

---

## 📱 Kullanıcı Deneyimi Akışları

### 1. Galeri Gezinme Akışı
1. Kullanıcı proje detay sayfasına gelir
2. Galeri bölümüne scroll yapar
3. Ana galerileri görür (karma görünüm)
4. Alt galeriye veya medyaya tıklar
5. Alt galeri seçerse → o galerinin içeriğini görür
6. Medya seçerse → ilgili viewer açılır
7. Breadcrumb ile üst seviyeye dönebilir

### 2. Medya Görüntüleme Akışları

#### 2.1 Resim Görüntüleme
1. Resim thumbnail'ine tıklama
2. Lightbox açılır
3. Zoom, rotate, navigate özellikler
4. Share ve download seçenekleri

#### 2.2 Video Görüntüleme
1. Video thumbnail'ine tıklama
2. Video player popup açılır
3. Full-screen, volume, subtitle kontrolleri
4. Share ve download seçenekleri

#### 2.3 Belge Görüntüleme
1. Belge ikonuna tıklama
2. PDF ise inline viewer açılır
3. Office belge ise Google Docs viewer
4. Download seçeneği her zaman mevcut

### 3. Mobil Deneyim
- Touch-friendly galeri kartları
- Swipe navigation (lightbox'ta)
- Pull-to-refresh
- Offline görüntüleme (cache'lenmiş medyalar)

---

## 🚀 Geliştirme Aşamaları

### Faz 1: Veritabanı ve API (3 hafta)
- [ ] Yeni veritabanı yapısı migration
- [ ] ProjectGallery CRUD API'leri
- [ ] ProjectGalleryMedia CRUD API'leri
- [ ] Dosya upload API'si
- [ ] Thumbnail generation servisi

### Faz 2: Temel Frontend (3 hafta)
- [ ] Galeri hiyerarşi componenti
- [ ] Medya grid componenti
- [ ] Dosya upload interface
- [ ] Basic responsive layout
- [ ] Breadcrumb navigasyonu

### Faz 3: Viewer Sistemleri (2 hafta)
- [ ] Enhanced lightbox (resim + video)
- [ ] PDF inline viewer
- [ ] Office belge viewer entegrasyonu
- [ ] Download manager
- [ ] Share functionality

### Faz 4: Gelişmiş Özellikler (2 hafta)
- [ ] Arama ve filtreleme sistemi
- [ ] Keyboard navigasyon
- [ ] Offline support
- [ ] Performance optimizasyonu
- [ ] Admin panel entegrasyonu

### Faz 5: Test ve Optimizasyon (1 hafta)
- [ ] Cross-browser testing
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Security audit
- [ ] Accessibility kontrolü

---

## 🧪 Test Planı

### 1. Unit Tests
- Galeri hiyerarşi logic testleri
- Medya upload/processing testleri
- API endpoint testleri
- Component rendering testleri

### 2. Integration Tests
- Galeri navigasyon testleri
- Multi-file upload testleri
- Viewer integration testleri
- Database transaction testleri

### 3. E2E Tests
- Complete user journey testleri
- File download testleri
- Mobile experience testleri
- Performance benchmark testleri

### 4. Dosya Format Testleri
- Her desteklenen format için upload/view testleri
- Büyük dosya (>100MB) upload testleri
- Corrupted file handling testleri
- Browser compatibility testleri

---

## 📊 Metrikler ve Analitik

### 1. Kullanıcı Metrikleri
- Galeri görüntülenme oranı
- En popüler medya tipleri
- Ortalama galeri gezinme süresi
- Download conversion rate
- Share activity

### 2. Performans Metrikleri
- Upload success rate
- Average upload time
- Thumbnail generation time
- Page load times per gallery depth
- CDN hit rate

### 3. İş Metrikleri
- Proje inquiry conversion from gallery
- Most engaging gallery types
- User engagement depth (galeri seviyesi)
- Mobile vs desktop usage patterns

---

## 🔮 Gelecek Geliştirmeler

### Versiyon 2.0
- 360° görsel desteği
- Virtual tour entegrasyonu
- Augmented Reality (AR) preview
- AI-powered medya tagging
- Collaborative commenting system

### Versiyon 3.0
- Real-time collaboration
- Version control for media
- Advanced analytics dashboard
- Multi-language media descriptions
- API for third-party integrations

---

## 📋 Kabul Kriterleri

### Must-Have
- ✅ Hiyerarşik galeri sistemi çalışıyor
- ✅ Çoklu dosya formatı desteği
- ✅ Upload/download functionality
- ✅ Mobile responsive design
- ✅ Performance benchmarks

### Should-Have
- ✅ Advanced search ve filtreleme
- ✅ Inline document viewing
- ✅ Breadcrumb navigasyon
- ✅ Thumbnail generation
- ✅ Error handling

### Could-Have
- ✅ Offline viewing
- ✅ Advanced sharing options
- ✅ Batch operations
- ✅ Analytics tracking
- ✅ Admin bulk management

---

## 🚨 Risk Analizi

### Yüksek Risk
- **Dosya Boyutu Yönetimi**: Büyük dosyaların upload/storage maliyetleri
- **Browser Compatibility**: Office belge görüntüleme uyumluluğu
- **Performance**: Çoklu medya formatında yükleme hızı

### Orta Risk
- **Storage Costs**: CDN ve storage maliyetlerinin artması
- **Security**: Çoklu dosya formatında güvenlik açıkları
- **User Experience**: Karmaşık hiyerarşide kaybolma riski

### Düşük Risk
- **Third-party Dependencies**: Google Docs Viewer bağımlılığı
- **Maintenance**: Çoklu format desteğinin maintenance yükü

---

## 💡 Teknik Notlar

### 1. Dosya İsimlendirme Konvansiyonu
```
/uploads/projects/{projectId}/galleries/{galleryId}/{timestamp}_{originalName}
/uploads/thumbs/projects/{projectId}/galleries/{galleryId}/{timestamp}_{originalName}
```

### 2. Mime Type Mapping
```javascript
const SUPPORTED_FORMATS = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  cad: ['application/dwg', 'application/dxf']
};
```

### 3. Database Indexing Strategy
```sql
-- Performance için kritik indexler
CREATE INDEX idx_project_gallery_hierarchy ON project_galleries(project_id, parent_id, order);
CREATE INDEX idx_gallery_media_type ON project_gallery_media(gallery_id, mime_type, order);
CREATE INDEX idx_media_search ON project_gallery_media(title, description);
```

---

## 📞 İletişim

### Product Owner
- **İsim**: [Product Owner Adı]
- **Email**: [email@company.com]
- **Slack**: @productowner

### Tech Lead
- **İsim**: [Tech Lead Adı]  
- **Email**: [email@company.com]
- **Slack**: @techlead

### DevOps Lead
- **İsim**: [DevOps Lead Adı]
- **Email**: [email@company.com]
- **Slack**: @devopslead

---

*Bu doküman yaşayan bir dokümandır ve proje geliştirme sürecinde güncellenecektir. Versiyon 1.1 - Güncellenmiş veritabanı yapısı ile hazırlanmıştır.*