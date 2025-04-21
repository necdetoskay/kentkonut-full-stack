# Carousel Yönetim Sistemi

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Özellikler](#özellikler)
3. [Veri Yapısı](#veri-yapısı)
4. [Yönetim Arayüzü](#yönetim-arayüzü)
5. [Template Sistemi](#template-sistemi)
6. [Görsel Yönetimi](#görsel-yönetimi)
7. [Teknik Gereksinimler](#teknik-gereksinimler)

## Genel Bakış

Carousel yönetim sistemi, web sitesindeki slider içeriklerinin yönetimini sağlayan kapsamlı bir sistemdir. Sistem, kullanıcı dostu bir arayüz üzerinden carousel içeriklerinin eklenmesi, düzenlenmesi ve yönetilmesini sağlar.

## Özellikler

### Ana Özellikler
- Wizard tabanlı içerik ekleme/düzenleme
- Sürükle-bırak sıralama
- Template bazlı metin yerleşimi
- Gelişmiş görsel yönetimi
- Responsive tasarım desteği
- Analitik takibi

### Wizard Adımları
1. Temel Bilgiler
   - Başlık
   - Alt başlık
   - Açıklama
   - Hedef URL
   - URL açılış şekli

2. Görsel Yönetimi
   - Görsel yükleme
   - Otomatik boyutlandırma
   - Responsive versiyonlar
   - Alt metin

3. Stil Ayarları
   - Animasyon seçimi
   - Overlay ayarları
   - Metin stili
   - Özel CSS

4. Zamanlama ve Yayın
   - Gösterim süresi
   - Yayın tarihi
   - Özel zamanlama
   - Durum kontrolü

### Template Sistemi

#### Hazır Template'ler
1. Sol Dikey Düzen
2. Sağ Kademeli Düzen
3. Merkez Blok Düzen
4. Üst Yatay Düzen
5. Sol Köşe Düzen
6. Merkez Split Düzen
7. Sol Kompakt Düzen
8. Merkez Oval Düzen

#### Template Özelleştirme
- Font seçimi
- Yazı boyutu
- Renk seçimi
- Opaklık ayarı
- Konum ayarları
- Hizalama seçenekleri
- Gölge efektleri

### Görsel Yönetimi

#### Görsel Gereksinimleri
- Boyut: 1920x1080px (16:9)
- Format: JPG, PNG, WEBP
- Dosya boyutu: Max. 2MB
- Kalite: 85%

#### Otomatik Düzeltme Seçenekleri
1. Akıllı Ölçeklendirme
   - AI tabanlı yüksek kaliteli büyütme
   - Detay kaybını minimize etme
   - Orijinal görsel karakterini koruma

2. AI ile Görsel Genişletme
   - Eksik alanları AI ile tamamlama
   - Doğal görünümlü arka plan oluşturma
   - Kesintisiz geçişler

3. Arka Plan Bulanıklaştırma
   - Orijinal görseli merkeze yerleştirme
   - Arka planı bulanık genişletme
   - Gradient overlay ekleme

#### Responsive Versiyonlar
- Desktop: 1920x1080px (16:9)
- Tablet: 1024x768px (4:3)
- Mobil: 640x480px (4:3)
- Lazy loading için placeholder
- WebP format desteği

## Veri Yapısı

### Carousel Item
```typescript
interface CarouselItem {
  // Temel Bilgiler
  id: number;
  title: string;
  subtitle: string;
  description: string;
  
  // Görsel Yönetimi
  image: {
    desktop_url: string;
    tablet_url: string;
    mobile_url: string;
    alt_text: string;
    title_text: string;
  };
  
  // Bağlantı Ayarları
  link: {
    url: string;
    target: '_blank' | '_self';
    rel: string;
    is_active: boolean;
  };
  
  // Animasyon Ayarları
  animation: {
    type: 'fade' | 'slide' | 'zoom' | 'flip';
    duration: number;
    delay: number;
    easing: string;
  };
  
  // Zamanlama
  timing: {
    display_duration: number;
    start_date: Date;
    end_date: Date;
    schedule: {
      days: number[];
      hours: number[];
    };
  };
  
  // Stil Ayarları
  style: {
    overlay_color: string;
    overlay_opacity: number;
    text_color: string;
    text_alignment: 'left' | 'center' | 'right';
    text_position: 'top' | 'center' | 'bottom';
    custom_css: string;
  };
  
  // Responsive Ayarlar
  responsive: {
    hide_on_mobile: boolean;
    hide_on_tablet: boolean;
    hide_on_desktop: boolean;
  };
  
  // Genel Ayarlar
  settings: {
    order_index: number;
    is_active: boolean;
    is_featured: boolean;
    priority: number;
  };
  
  // SEO ve Erişilebilirlik
  seo: {
    meta_title: string;
    meta_description: string;
    aria_label: string;
  };
}
```

## Teknik Gereksinimler

### Frontend
- React + TypeScript
- TanStack Query (React Query)
- React DnD
- React Hook Form
- Zod
- Shadcn/ui
- TailwindCSS

### Backend
- Node.js + Express
- TypeORM
- PostgreSQL
- Multer
- Sharp
- JWT

### Veritabanı Şeması
```sql
CREATE TABLE carousel_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url VARCHAR(255),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carousel_analytics (
    id SERIAL PRIMARY KEY,
    carousel_item_id INTEGER REFERENCES carousel_items(id),
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP
);
``` 