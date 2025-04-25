# Banner Yönetim Modülü Dokümantasyonu

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Veritabanı Yapısı](#veritabanı-yapısı)
3. [API Endpoints](#api-endpoints)
4. [Bileşenler](#bileşenler)
5. [Kullanım Kılavuzu](#kullanım-kılavuzu)

## Genel Bakış

Banner Yönetim Modülü, web sitesinde görüntülenecek banner'ların yönetimini sağlayan bir sistemdir. Bu modül ile:

- Banner grupları oluşturabilir
- Her gruba birden fazla banner ekleyebilir
- Banner'ların görüntülenme sırasını belirleyebilir
- Gösterim istatistiklerini takip edebilirsiniz

## Veritabanı Yapısı

### BannerGroup Modeli

\`\`\`prisma
model BannerGroup {
  id              Int           @id @default(autoincrement())
  name            String
  description     String?
  isActive        Boolean       @default(true)
  playMode        PlayMode      @default(MANUAL)
  displayDuration Int           @default(5000)
  animationType   AnimationType @default(FADE)
  width           Int
  height          Int
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  banners         Banner[]
}
\`\`\`

### Banner Modeli

\`\`\`prisma
model Banner {
  id          Int          @id @default(autoincrement())
  groupId     Int
  title       String
  imageUrl    String
  linkUrl     String?
  order       Int
  isActive    Boolean      @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  group       BannerGroup  @relation(fields: [groupId], references: [id])
  statistics  Statistics[]
}
\`\`\`

### Statistics Modeli

\`\`\`prisma
model Statistics {
  id          Int      @id @default(autoincrement())
  bannerId    Int
  impressions Int      @default(0)
  clicks      Int      @default(0)
  date        DateTime @default(now())
  banner      Banner   @relation(fields: [bannerId], references: [id])
}
\`\`\`

## API Endpoints

### Banner Grupları

- `GET /api/banner-groups` - Tüm banner gruplarını listele
- `GET /api/banner-groups/:id` - Belirli bir grubu getir
- `POST /api/banner-groups` - Yeni grup oluştur
- `PUT /api/banner-groups/:id` - Grubu güncelle
- `DELETE /api/banner-groups/:id` - Grubu sil

### Bannerlar

- `GET /api/banner-groups/:id/banners` - Bir gruptaki tüm bannerları listele
- `POST /api/banners` - Yeni banner oluştur
- `PUT /api/banners/:id` - Banner güncelle
- `DELETE /api/banners/:id` - Banner sil
- `PUT /api/banners/reorder` - Banner sırasını değiştir

### İstatistikler

- `GET /api/banners/:id/statistics` - Banner istatistiklerini getir
- `POST /api/statistics/impression` - Gösterim kaydet
- `POST /api/statistics/click` - Tıklama kaydet

## Bileşenler

### Banner Slider Bileşeni

\`\`\`typescript
import { BannerSlider } from '@/components/banners/BannerSlider';

// Kullanım
<BannerSlider 
  groupId={1}
  autoPlay={true}
  displayDuration={5000}
/>
\`\`\`

### Banner Yönetim Formu

\`\`\`typescript
import { BannerForm } from '@/components/banners/BannerForm';

// Kullanım
<BannerForm 
  groupId={1}
  onSubmit={(data) => console.log(data)}
/>
\`\`\`

## Kullanım Kılavuzu

### Banner Grubu Oluşturma

1. Dashboard'da "Banner Grupları" menüsüne gidin
2. "Yeni Grup" butonuna tıklayın
3. Gerekli bilgileri doldurun:
   - Grup adı
   - Açıklama (opsiyonel)
   - Oynatma modu (manuel/otomatik)
   - Görüntüleme süresi
   - Animasyon tipi
   - Genişlik ve yükseklik
4. "Kaydet" butonuna tıklayın

### Banner Ekleme

1. İlgili banner grubunun detay sayfasına gidin
2. "Yeni Banner" butonuna tıklayın
3. Gerekli bilgileri doldurun:
   - Banner başlığı
   - Görsel
   - Link URL (opsiyonel)
   - Aktiflik durumu
   - Gösterim tarihleri (opsiyonel)
4. "Kaydet" butonuna tıklayın

### Banner Sıralama

1. Banner listesi sayfasında, bannerları sürükle-bırak yöntemiyle sıralayabilirsiniz
2. Sıralama otomatik olarak kaydedilecektir

### İstatistikleri Görüntüleme

1. Banner detay sayfasında "İstatistikler" sekmesine gidin
2. Gösterim ve tıklama istatistiklerini görüntüleyin
3. Tarih aralığını filtreleyebilirsiniz 