# Kent Konut Web Sayfası - Zengin İçerik Modülü

## 1. Modül Amacı ve Genel Bakış

Bu modül, Kent Konut web sitesindeki tüm sayfaların zengin içerikli HTML formatında oluşturulmasını ve yönetilmesini sağlamaktadır. Web sitesinin her sayfası için şu özellikleri sunar:

- Üst kısımda sabit menü ve özelleştirilebilir antet görseli
- Sürükle-bırak yöntemiyle oluşturulabilen zengin içerik alanı
- Sayfa altında sosyal medya paylaşım butonları ve istatistik/işlem düğmeleri
- SEO ve performans optimizasyonu araçları

## 2. Sayfa Yapısı Bileşenleri

### 2.1. Üst Kısım Bileşenleri
- **Sabit Üst Menü**: Tüm sayfalarda ortak görünen navigasyon menüsü
- **Sayfa Antet Görseli**: Her sayfanın üst kısmında menünün arkasında kalan geniş görsel
- **Breadcrumb Navigasyonu**: Sayfa hiyerarşisini gösteren ekmek kırıntısı navigasyonu

### 2.2. İçerik Alanı Bileşenleri
- **Gelişmiş WYSIWYG Editör**: Ne gördüğünüz ne alırsınız türünde zengin metin editörü
- **Sürükle-Bırak Komponentleri**: Hazır bloklar, sütunlar, medya öğeleri vb.
- **Özel HTML/CSS/JS Ekleme**: Gelişmiş içerik ihtiyaçları için kod ekleme imkanı

### 2.3. Sayfa Altı Bileşenleri
- **Sosyal Medya Paylaşım Butonları**: Facebook, Instagram, YouTube vb.
- **Görüntülenme Sayacı**: Sayfanın kaç kez görüntülendiğini gösteren sayaç
- **İşlem Butonları**: Geri, Yazdır, vb. sayfayla ilgili işlem düğmeleri 

## 3. Veri Modeli

### 3.1. Sayfa Veri Modeli (Page)

```
Page {
  id: unique_id,
  title: String,              // Sayfa başlığı
  slug: String,               // SEO dostu URL
  template_id: Reference,     // Sayfa şablonu
  
  // Antet ve Görsel Yönetimi
  header_image: {
    image_url: String,        // Antet görseli URL'si
    default_image: Boolean,   // Varsayılan görsel mi?
    alt_text: String,         // Alternatif metin (SEO için)
    overlay_opacity: Number,  // Menü altındaki gradient opaklığı
  },
  
  // Meta Bilgileri
  meta: {
    title: String,
    description: String,
    keywords: String,
    og_image: String
  },
  
  // Sayfa İçeriği
  content: [
    {
      component_type: String, // 'text', 'image', 'gallery', 'form', etc.
      settings: Object,       // Bileşen özellikleri
      content: Object,        // Bileşen içeriği
      style: Object,          // Özel stil
      position: Number        // Sayfa sıralaması
    }
  ],
  
  // Sayfa Altı Özellikleri
  footer_features: {
    show_social_share: Boolean,    // Sosyal medya butonları gösterilsin mi?
    social_channels: {             // Hangi sosyal kanallar aktif?
      facebook: Boolean,
      instagram: Boolean,
      youtube: Boolean,
      twitter: Boolean,
      linkedin: Boolean
    },
    show_view_counter: Boolean,    // Görüntülenme sayacı gösterilsin mi?
    show_back_button: Boolean,     // Geri butonu gösterilsin mi?
    show_print_button: Boolean,    // Yazdır butonu gösterilsin mi?
    custom_buttons: [              // Özel butonlar
      {
        label: String,
        icon: String,
        url: String,
        action: String            // 'link', 'function', 'download'
      }
    ]
  },
  
  // İstatistik Verileri
  statistics: {
    view_count: Number,           // Görüntülenme sayısı
    last_viewed_at: DateTime,     // Son görüntülenme zamanı
    print_count: Number,          // Yazdırılma sayısı
    share_count: {                // Paylaşım sayıları
      facebook: Number,
      twitter: Number,
      whatsapp: Number,
      email: Number
    }
  },
  
  // Durum Bilgileri
  status: String,                 // 'draft', 'published', 'archived'
  created_at: DateTime,
  updated_at: DateTime,
  published_at: DateTime,
  author_id: Reference,
  revision_history: Array
}
```

### 3.2. Antet Görseli Veri Modeli (HeaderImage)

```
HeaderImage {
  id: unique_id,
  name: String,               // Örn: "Kurumsal Antet"
  image_url: String,          // Görsel URL'si
  dimensions: {               // Önerilen boyutlar
    width: Number,            // Genişlik (px)
    height: Number            // Yükseklik (px)
  },
  is_default: Boolean,        // Varsayılan görsel mi?
  assigned_pages: [Reference], // Bu görseli kullanan sayfalar
  created_at: DateTime,
  updated_at: DateTime
}
```

### 3.3. Görüntülenme Kaydı Veri Modeli (PageViewLog)

```
PageViewLog {
  id: unique_id,
  page_id: Reference,        // İlgili sayfa
  ip_address: String,        // Görüntüleyenin IP adresi (anonim hale getirilebilir)
  user_agent: String,        // Tarayıcı bilgisi
  viewed_at: DateTime,       // Görüntülenme zamanı
  session_id: String,        // Tekrar sayımları önlemek için
  referrer: String           // Gelinen kaynak
}
```

### 3.4. Paylaşım Kaydı Veri Modeli (ShareLog)

```
ShareLog {
  id: unique_id,
  page_id: Reference,        // Paylaşılan sayfa
  channel: String,           // 'facebook', 'twitter', etc.
  shared_at: DateTime,       // Paylaşım zamanı
  user_id: Reference,        // Eğer giriş yapmış kullanıcı ise
  success: Boolean           // Paylaşım başarılı mı?
}
```

## 4. Modül Özellikleri

### 4.1. Gelişmiş İçerik Editörü Özellikleri
- **Zengin Metin Düzenleme**: Metinleri biçimlendirme, listeler, tablolar ve başlıklar
- **Medya Entegrasyonu**: Görsel, video ve belge ekleme
- **HTML Modu**: Doğrudan HTML koduna erişim ve düzenleme imkanı
- **Kod/Tasarım Geçişi**: Görsel düzenleyici ile kod editörü arasında geçiş yapabilme

### 4.2. Sürükle-Bırak Sayfa Oluşturucu
- **Bileşen Kütüphanesi**: Hazır bloklar (hero alanı, galeri, form, harita vb.)
- **Kolon Düzeni**: Çoklu sütun düzenleri oluşturabilme
- **Özel Stillendirme**: Arka plan rengi, padding, margin gibi stil özelliklerini değiştirebilme
- **Tam Sayfa Önizleme**: Değişiklikleri canlı olarak görebilme

### 4.3. Antet Yönetimi Özellikleri
- **Sayfa Antet Seçimi**: Mevcut antet görselleri arasından seçim yapma
- **Yeni Antet Yükleme**: Özel antet görseli ekleme
- **Varsayılan Antet**: Her sayfaya özel antet eklenmediğinde "antet_kurumsal.jpg" görselini varsayılan olarak kullanma
- **Antet Pozisyonu Ayarlama**: Görsel odak noktasını ayarlama

### 4.4. Sayfa Altı Özellikleri Yönetimi
- **Sosyal Medya Ayarları**: Hangi sosyal medya butonlarının görüneceğini seçme
- **İstatistik ve İşlem Butonları**: Görüntülenme sayacı, geri ve yazdır butonlarını özelleştirme
- **Özel Butonlar**: Sayfaya özel işlem butonları ekleme

### 4.5. SEO ve Performans Araçları
- **Meta Etiketler**: Başlık, açıklama, anahtar kelimeler
- **URL Yönetimi**: SEO dostu URL'ler
- **Schema.org Markup**: Yapılandırılmış veri işaretlemesi
- **Resim Optimizasyonu**: Otomatik resim sıkıştırma ve boyutlandırma

## 5. Admin Panel Arayüzü

### 5.1. Sayfa Yönetimi Ekranı
- Tüm sayfaların listesi
- Arama, filtreleme ve sıralama imkanı
- Sayfa türüne göre gruplama

### 5.2. Sayfa Düzenleme Ekranı
- **Genel Ayarlar Bölümü**: Başlık, URL ve SEO bilgileri
- **Antet Yönetimi Bölümü**: Antet görseli seçimi ve ayarları
- **İçerik Editörü**: Sürükle-bırak sayfa düzenleme
- **Sayfa Altı Özellikleri Bölümü**: Sosyal medya ve istatistik butonları
- **Yayın Ayarları**: Taslak/Yayın durumu ve zamanlama

### 5.3. Antet Görselleri Yönetim Ekranı
- Mevcut antet görsellerinin galeri görünümü
- Yeni antet görseli yükleme
- Varsayılan antet belirleme

### 5.4. İstatistik ve Analiz Ekranı
- Sayfa görüntülenme istatistikleri
- Sosyal medya paylaşım oranları
- Kullanıcı etkileşim raporları

## 6. Kullanıcı Deneyimi Özellikleri

### 6.1. Ziyaretçiler İçin
- Sayfalar arası tutarlı ve profesyonel tasarım
- Mobil uyumlu görünüm
- Kolay sosyal medya paylaşımı
- Yazdırma ve geri dönüş seçenekleri

### 6.2. İçerik Yöneticileri İçin
- Basit ve sezgisel sayfa oluşturma
- WYSIWYG (Ne görüyorsan onu alırsın) düzenleme
- Canlı önizleme
- Tasarım bilgisi gerektirmeyen yapı

## 7. Entegrasyon ve Genişletme

### 7.1. Diğer Modüllerle Entegrasyon
- Proje modülü ile entegrasyon
- Haberler/duyurular modülü ile entegrasyon
- İletişim formu modülü ile entegrasyon
- Medya kütüphanesi ile entegrasyon

### 7.2. Genişletme İmkanları
- Yeni bileşen tipleri ekleme
- Özel sayfa şablonları oluşturma
- Üçüncü parti araçlarla entegrasyon (ör. Google Maps, YouTube)
- Çoklu dil desteği

## 8. Geliştirme ve Best Practice Önerileri

### 8.1. Erişilebilirlik (Accessibility) İyileştirmeleri

- **WCAG 2.1 Uyumluluğu**: İçerik editöründe erişilebilirlik kontrolü özelliği
- **Alternatif Metin Zorunluluğu**: Görsel eklediğinde alt metin eklemenin zorunlu olması
- **Kontrast Kontrolü**: Metin/arka plan kontrast oranı kontrolü
- **Klavye Erişimi**: Tüm editör işlevlerine klavye ile erişilebilirlik
- **Ekran Okuyucu Uyumluluğu**: ARIA etiketleri ve uygun semantik HTML yapısı

### 8.2. İçerik Modelleme ve Yapılandırılmış İçerik

- **İçerik Blokları Kütüphanesi**: Yeniden kullanılabilir içerik blokları oluşturma
- **Dinamik İçerik Referansları**: Bir içeriğin başka bir sayfada referans edilebilmesi
- **İçerik Çoklayıcı**: Aynı içerik modelini kullanarak çoklu öğe oluşturma (projeler, haberler vs.)
- **İçerik İlişkileri**: Sayfalar arasında ilişki kurabilme (benzer sayfalar, ilgili içerikler)

### 8.3. Çok Dilli İçerik Yönetimi

```
Page {
  // Mevcut alanlar...

  // Çoklu dil desteği
  translations: {
    tr: {
      title: String,
      content: Array,
      meta: Object
    },
    en: {
      title: String,
      content: Array,
      meta: Object
    },
    // Diğer diller...
  },
  
  default_language: String,     // Varsayılan dil kodu
  available_languages: Array    // Mevcut dil seçenekleri
}
```

- **Dil Bazlı URL Yapısı**: `/tr/hakkimizda`, `/en/about-us` gibi
- **Çeviri Eksikliği Yönetimi**: Çevirisi olmayan içerikler için varsayılan dile dönme
- **Dil Değiştirme Arayüzü**: Kullanıcı için sayfa içi dil değiştirme modülü

### 8.4. Gelişmiş Versiyon Kontrolü ve İş Akışı

- **Modere Edilmiş İçerik Yayını**: İçerik onay mekanizması ve iş akışı
- **Planlı İçerik Değişiklikleri**: Gelecek tarihli içerik güncellemeleri
- **Versiyon Karşılaştırma**: Farklı içerik versiyonlarını yan yana karşılaştırma
- **Değişiklik Geri Alma**: Belirli bir versiyona geri dönebilme
- **İçerik Değişiklik Geçmişi**: Kimin, ne zaman, ne değiştirdiğini kaydetme

### 8.5. Performans Optimizasyonu

- **Lazy Loading Bileşenleri**: Sayfada görünür hale geldiğinde yüklenen içerikler
- **Resim Optimizasyonu**: WebP, avif gibi modern formatları otomatik kullanma
- **Kod Minimizasyonu**: Üretilen HTML/CSS/JS'nin otomatik minimizasyonu
- **Ön Bellekleme Stratejisi**: İçerik CDN ile dağıtma ve önbelleğe alma
- **Responsive Görsel Yönetimi**: Ekran boyutuna göre farklı görsel boyutları (srcset)

### 8.6. Analitik ve İçerik Verimliliği

- **İçerik Isı Haritası**: Kullanıcıların en çok ilgilendiği içerik bölümlerini ölçme
- **A/B Testi**: Farklı içerik versiyonlarını test edebilme
- **İçerik Kalitesi Skoru**: SEO ve okunabilirlik açısından içerik değerlendirme
- **Okunma Süresi Tahmini**: İçeriğin tahmini okunma süresini gösterme
- **İçerik Etkileşim Ölçümleri**: Beğeniler, yorumlar, paylaşımlar analizi

### 8.7. Gelişmiş Güvenlik Önlemleri

- **İçerik Güvenlik Politikası (CSP)**: Üçüncü taraf kodları için güvenlik kısıtlamaları
- **CORS Yapılandırması**: API isteklerinin güvenliği
- **XSS Koruma**: Kullanıcı girişi filtreleme ve kod enjeksiyonu engelleme
- **İçerik Doğrulama**: Yüklenen içeriklerin güvenlik denetimi
- **DDoS Koruması**: Yüksek trafik yönetimi ve koruma

### 8.8. Dinamik Bileşenler ve Şablonlar

```
DynamicComponent {
  id: unique_id,
  name: String,                // Bileşen adı
  component_type: String,      // 'hero', 'gallery', 'testimonial', etc.
  template: String,            // HTML/React/Vue şablonu
  styles: String,              // CSS stili
  scripts: String,             // JS davranışı
  schema: Object,              // Bileşenin veri şeması
  preview_image: String,       // Admin panelde gösterim için önizleme
  category: String,            // Bileşen kategorisi
  is_global: Boolean,          // Global olarak kullanılabilir mi?
  created_at: DateTime,
  updated_at: DateTime
}
```

- **Özel Bileşen Oluşturucu**: Teknik ekibin özel bileşenler oluşturabilmesi
- **Parametre Varyasyonları**: Aynı bileşenin farklı parametrelerle kullanımı
- **Global Bileşenler**: Tüm sayfalarda kullanılabilen ve merkezi olarak yönetilebilen bileşenler
- **Dinamik Veri Kaynakları**: Bileşenlerin API'lardan veri çekebilmesi

### 8.9. Mobil Deneyim Odaklı Araçlar

- **Mobil Önizleme**: Farklı mobil cihazlarda içerik önizleme
- **Dokunmatik Optimizasyon**: Mobil için dokunma hedefi boyutları optimizasyonu 
- **Mobil-İlk Düzenleme**: Mobil görünümü öncelikli düzenleme arayüzü
- **Uygulama Bağlantıları**: Deep linking ve mobil uygulama entegrasyonu

### 8.10. İleri SEO ve Pazarlama Özellikleri

- **SEO Önerileri**: İçerik girilirken SEO önerileri sunma
- **Anahtar Kelime Optimizasyonu**: İçerik analizi ve anahtar kelime önerileri
- **Sosyal Medya Önizleme**: Sosyal medyada nasıl görüneceğinin önizlemesi
- **Yapılandırılmış Veri**: FAQ, ürün, etkinlik gibi yapılandırılmış veri şemaları
- **Pazarlama Otomasyonu Entegrasyonu**: E-posta pazarlama ve CRM entegrasyonu

### 8.11. İçerik Etki Alanı ve Yetkilendirme

```
ContentPermission {
  id: unique_id,
  page_id: Reference,          // İlgili sayfa
  role_id: Reference,          // Kullanıcı rolü
  actions: {                   // İzin verilen işlemler
    view: Boolean,
    edit: Boolean,
    publish: Boolean,
    delete: Boolean
  },
  section_restrictions: Array,  // Belirli bölümler için kısıtlamalar
  created_at: DateTime,
  updated_at: DateTime
}
```

- **Bölüm Bazlı Yetkilendirme**: Sayfanın belirli bölümlerini düzenleme yetkisi
- **Çoklu Editör Kilitleme**: Aynı içeriğin eşzamanlı düzenlenmesini engelleme
- **Düzenleme Oturumları**: Aktif düzenleme oturumlarını görme ve yönetme
- **İçerik Onay Zincirleri**: Çoklu seviyeli onay süreçleri oluşturma

### 8.12. Entegrasyon Ekosistemi

- **Webhook Tetikleyiciler**: İçerik değişikliklerinde harici sistemleri tetikleme
- **API-İlk Yaklaşım**: Tüm içerik modülünün API üzerinden erişilebilir olması
- **Headless CMS Yetenekleri**: Farklı ön yüzlerde (web, mobil, kiosk) içerik gösterimi
- **Üçüncü Parti Servis Entegrasyonları**: Analytics, Hotjar, ChatBot gibi servislerin kolay entegrasyonu

### 8.13. Uygulama Önerileri

Bu önerileri uygulamak için modern bir tech stack kullanılması önerilir:

1. **Backend**: Node.js, Express.js, GraphQL ile esnek API
2. **Frontend**: React/Next.js veya Vue/Nuxt.js ile modern SSR/SSG yaklaşımı
3. **Veritabanı**: MongoDB veya PostgreSQL (JSONB ile)
4. **Depolama**: AWS S3 veya benzeri bulut depolama
5. **CDN**: Cloudflare veya AWS CloudFront
6. **Arama**: Elasticsearch veya Algolia entegrasyonu 