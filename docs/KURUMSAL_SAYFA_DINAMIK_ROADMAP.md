# Kurumsal Sayfa Dinamik İçerik Yönetimi Roadmap

## 📋 Sayfa Yapısı Analizi

Mevcut kurumsal sayfada şu bölümler tespit edilmiştir:

### 🎯 Ana Bölümler
1. **Breadcrumb Navigation** - Anasayfa / Kurumsal
2. **Yönetim Kartları** (5 adet):
   - BAŞKANIMIZ (Doç. Dr. Tahir BÜYÜKAKIN)
   - GENEL MÜDÜR (Erhan COŞAN)
   - BİRİMLERİMİZ (MÜDÜRLÜKLER)
   - STRATEJİMİZ
   - HEDEFİMİZ

### 🔍 Kart Yapısı Detayları
- **Görsel**: Dairesel profil fotoğrafı/ikon
- **Başlık**: Pozisyon/bölüm adı
- **Alt Başlık**: Kişi adı (yönetici kartları için)
- **Renk Teması**: Her kart için özel renk paleti
- **Hover Efektleri**: İnteraktif animasyonlar

## 🗃️ Veri Modeli Tasarımı

### 1. KurumsalKart (CorporateCard) Modeli

```prisma
model CorporateCard {
  id              String   @id @default(cuid())
  title           String   // Kart başlığı (örn: "BAŞKANIMIZ", "GENEL MÜDÜR", "HİZMETLERİMİZ")
  subtitle        String?  // Alt başlık (kişi adı, departman adı vb.)
  description     String?  // Detaylı açıklama
  imageUrl        String?  // Görsel URL'si
  backgroundColor String   @default("#ffffff") // Arka plan rengi
  textColor       String   @default("#000000") // Metin rengi
  accentColor     String   @default("#007bff") // Vurgu rengi
  displayOrder    Int      @default(0) // Sıralama için kritik alan
  isActive        Boolean  @default(true)
  targetUrl       String?  // Tıklama hedef URL'si

  // Esnek içerik alanları
  content         Json?    // Zengin içerik (HTML/Markdown/JSON)
  customData      Json?    // Özel veri alanları

  // Görsel ayarları
  imagePosition   String   @default("center") // "center", "top", "bottom"
  cardSize        String   @default("medium")  // "small", "medium", "large"
  borderRadius    String   @default("rounded") // "none", "small", "medium", "large", "full"

  // Meta bilgiler
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?

  @@map("corporate_cards")
  @@index([displayOrder])
  @@index([isActive, displayOrder])
}
```

### 2. KurumsalSayfa (CorporatePage) Modeli

```prisma
model CorporatePage {
  id              String   @id @default(cuid())
  title           String   @default("Kurumsal")
  metaTitle       String?
  metaDescription String?
  headerImage     String?  // Sayfa başlık görseli
  introText       String?  // Giriş metni
  
  // Sayfa ayarları
  showBreadcrumb  Boolean  @default(true)
  customCss       String?  // Özel CSS
  
  // SEO ve Meta
  slug            String   @unique @default("kurumsal")
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("corporate_pages")
}
```

## 🛠️ Backend Modülü Roadmap

### Faz 1: Temel Veri Yapısı (1-2 gün)
- [ ] Prisma schema güncellemesi
- [ ] Database migration oluşturma
- [ ] Seed data hazırlama
- [ ] Temel API endpoint'leri

### Faz 2: Admin Arayüzü (3-4 gün) - SİRALAMA ÖNCELİKLİ
- [ ] **Drag & Drop Sıralama Sistemi** (Öncelik 1)
- [ ] Kurumsal kart yönetim sayfası
- [ ] Görsel yükleme (GlobalMediaSelector)
- [ ] Renk seçici bileşeni
- [ ] Kart boyut ve stil ayarları
- [ ] Önizleme özelliği

### Faz 3: Frontend Entegrasyonu (2-3 gün)
- [ ] API servis katmanı
- [ ] Dinamik kart renderı
- [ ] Responsive tasarım
- [ ] Loading states
- [ ] Error handling

### Faz 4: Gelişmiş Özellikler (2-3 gün)
- [ ] İçerik editörü (rich text)
- [ ] Çoklu dil desteği
- [ ] Analytics entegrasyonu
- [ ] Cache optimizasyonu

## 📡 API Endpoint'leri

### Public API
```
GET /api/public/kurumsal/kartlar
GET /api/public/kurumsal/sayfa
```

### Admin API
```
GET    /api/admin/kurumsal/kartlar
POST   /api/admin/kurumsal/kartlar
PUT    /api/admin/kurumsal/kartlar/[id]
DELETE /api/admin/kurumsal/kartlar/[id]
PATCH  /api/admin/kurumsal/kartlar/siralama  # Kritik: Sıralama endpoint'i

GET    /api/admin/kurumsal/sayfa
PUT    /api/admin/kurumsal/sayfa
```

## 🎨 Admin Arayüz Tasarımı

### Ana Yönetim Sayfası
- **Başlık**: "Kurumsal Sayfa Yönetimi"
- **Sekmeler**:
  1. Kartlar Yönetimi
  2. Sayfa Ayarları
  3. Önizleme

### Kart Yönetimi Özellikleri
- Drag & drop sıralama
- Inline düzenleme
- Toplu işlemler
- Durum değiştirme (aktif/pasif)
- Renk tema editörü

## 🔄 Entegrasyon Stratejisi

### Frontend Veri Akışı
1. **Sayfa Yükleme**: API'den kart verilerini çek
2. **Render**: Dinamik kart bileşenleri oluştur
3. **İnteraksiyon**: Tıklama olaylarını yönet
4. **Cache**: Performans için veri önbellekleme

### Hata Yönetimi
- API hata durumlarında fallback içerik
- Loading skeleton'ları
- Retry mekanizması
- User-friendly hata mesajları

## 📱 Responsive Tasarım
- **Desktop**: 3 kart/satır
- **Tablet**: 2 kart/satır  
- **Mobile**: 1 kart/satır
- **Hover Efektleri**: Touch cihazlarda uygun alternatifler

## 🚀 Performans Optimizasyonu
- **Image Optimization**: WebP format desteği
- **Lazy Loading**: Görsel yükleme optimizasyonu
- **CDN**: Statik dosyalar için CDN kullanımı
- **Caching**: Redis ile API cache

## 📊 Analytics & Tracking
- Kart tıklama sayıları
- Sayfa görüntüleme istatistikleri
- Kullanıcı etkileşim analizi
- A/B test desteği

## 🔐 Güvenlik Considerations
- Admin yetki kontrolü
- Input validation
- XSS koruması
- CSRF token kullanımı
- File upload güvenliği

## 📋 Test Stratejisi
- Unit testler (API endpoints)
- Integration testler (Frontend-Backend)
- E2E testler (Admin workflow)
- Performance testler
- Accessibility testler

## 🎯 Başarı Kriterleri
- [ ] Tüm kartlar dinamik olarak yönetilebilir
- [ ] Admin arayüzü kullanıcı dostu
- [ ] Sayfa yükleme süresi < 2 saniye
- [ ] Mobile responsive tasarım
- [ ] SEO optimizasyonu tamamlandı
- [ ] Accessibility standartları karşılandı

## 📅 Tahmini Süre
**Toplam**: 8-12 iş günü
- Faz 1: 1-2 gün
- Faz 2: 3-4 gün  
- Faz 3: 2-3 gün
- Faz 4: 2-3 gün

## 🔄 Sonraki Adımlar
1. Stakeholder onayı
2. Database schema review
3. UI/UX mockup hazırlama
4. Development sprint planning
5. Implementation başlangıcı
