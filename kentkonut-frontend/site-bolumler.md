# Kent Konut Web Sayfası - İşlevsel Bölümlendirme Planı

## 1. Header/Navbar Bölümü
- **Logo Yönetimi**: 
  - Logo görseli
  - Logo boyutları ve konumu
- **Menü Yönetimi**:
  - Ana menü öğeleri (ekleme, silme, düzenleme)
  - Alt menüler (dropdown menüler)
  - Menü sıralaması
  - Menü öğelerinin aktif/pasif durumu
- **İletişim Bilgileri**: 
  - Telefon numarası
  - Sosyal medya linkleri

## 2. Ana Sayfa Bölümleri
- **Carousel/Slider Yönetimi**:
  - Slider görselleri (ekleme, silme, düzenleme)
  - Slider başlıkları ve açıklamaları
  - Slider butonları ve yönlendirme linkleri
  - Slider geçiş hızı ve efektleri
  
- **Proje Vitrin Bölümü**:
  - Öne çıkan projeler (seçim yapabilme)
  - Proje görselleri
  - Proje başlıkları ve kısa açıklamaları
  - "Detaylar" butonu yönlendirme linkleri
  
- **Hizmetler Bölümü**:
  - Hizmet kategorileri
  - Hizmet ikonları/görselleri
  - Hizmet başlıkları ve açıklamaları
  
- **Hakkımızda Özet Bölümü**:
  - Tanıtıcı metin
  - Kurumsal görsel
  - Misyon/Vizyon özetleri
  
- **İstatistik/Sayaç Bölümü**:
  - Tamamlanan proje sayısı
  - Toplam inşa edilen alan
  - Müşteri sayısı
  - Diğer sayısal veriler
  
- **Haberler/Duyurular Bölümü**:
  - Son haberler (başlık, görsel, özet ve tarih)
  - Haber kategorileri
  - "Tümünü Gör" bağlantısı

## 3. İçerik Sayfaları
- **Kurumsal Sayfalar**:
  - Hakkımızda
  - Misyon & Vizyon
  - Kurumsal Kimlik
  - Yönetim Kadrosu
  
- **Projeler Modülü**:
  - Proje kategorileri (Tamamlanan, Devam Eden, Planlanan)
  - Proje detay sayfaları
  - Proje görselleri (galeri)
  - Proje özellikleri ve teknik bilgiler
  - Kat planları ve yerleşim planları
  - Konum bilgisi ve harita entegrasyonu
  
- **Hafriyat Hizmetleri**:
  - Hafriyat ücret tarifeleri
  - Hafriyat sahaları bilgileri
  - Başvuru formları
  
- **Medya Merkezi**:
  - Fotoğraf galerisi
  - Video galerisi
  - Broşürler ve dökümanlar
  - Yayınlar
  
- **İletişim Sayfası**:
  - İletişim formu
  - Harita
  - Ofis bilgileri ve çalışma saatleri

## 4. Footer Bölümü
- **Menü Yönetimi**:
  - Sol kolon menü öğeleri
  - Sağ kolon menü öğeleri
- **Logo Yönetimi**:
  - Büyükşehir logosu
  - Logo boyutları ve konumu
- **İletişim Bilgileri**:
  - Adres
  - E-posta
  - Telefon
- **Alt Bilgiler**:
  - Telif hakkı metni
  - Alt menü linkleri (Site Kullanımı, KVKK, Web Mail vb.)

## 5. Genel Ayarlar
- **SEO Ayarları**:
  - Sayfa başlıkları
  - Meta açıklamaları
  - Meta anahtar kelimeleri
  - Open Graph/Twitter Card etiketleri
  
- **Güvenlik ve Erişim Ayarları**:
  - Kullanıcı yönetimi
  - Rol ve izin yönetimi
  - Login geçmişi

- **İçerik Onay Mekanizması**:
  - Taslak/Yayın durumları
  - Onay iş akışları
  - İçerik revizyonları

## Veri Modeli Önerisi
Admin panelde içerik yönetimi için şu veri modellerini oluşturmanızı öneriyorum:

1. **Users** (Kullanıcılar): Admin panel kullanıcıları
2. **Menus** (Menüler): Tüm menü öğeleri ve hiyerarşileri
3. **Pages** (Sayfalar): Statik içerik sayfaları
4. **Projects** (Projeler): Konut ve diğer projeler
5. **Services** (Hizmetler): Sunulan hizmetler
6. **News** (Haberler): Duyurular ve haberler
7. **Media** (Medya): Görsel ve dosya kütüphanesi
8. **ContactInfo** (İletişim Bilgileri): Adres, telefon vb.
9. **Settings** (Ayarlar): Sistem ve site ayarları
10. **Stats** (İstatistikler): Sayaçlar ve istatistikler 