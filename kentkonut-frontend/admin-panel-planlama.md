# Kent Konut Admin Panel - Yönetilebilir Bölümler ve Best Practices

Bu belge, Kent Konut web sitesi için planlanan admin panel yapısını ve önerilen best practice'leri içermektedir. 

## İçindekiler
- [Yönetilebilir Bölümler](#yönetilebilir-bölümler)
- [Admin Panel Best Practices](#admin-panel-best-practices)
- [Teknik Öneriler](#teknik-öneriler)
- [Güvenlik Önlemleri](#güvenlik-önlemleri)

## Yönetilebilir Bölümler

### 1. 🖼️ Carousel Yönetimi
- **Slider Görselleri**: Ekleme, silme, sıralama, değiştirme
- **Başlıklar**: Her slide için başlık ve alt başlık metinleri
- **Butonlar**: "Sanal Pos", "Projelerimiz", "Sağlık Kent" butonlarının metinleri, linkleri ve renkleri
- **Otomatik Geçiş Süresi**: Kaç saniyede bir slide'ın değişeceği
- **Mobil Optimizasyon**: Mobil cihazlarda görünecek görsellerin ayrıca yüklenebilmesi

### 2. 📊 İstatistikler Bölümü
- **Devam Eden Projeler**: Sayı ve açıklama metni
- **Tamamlanan Projeler**: Sayı ve açıklama metni 
- **Bağlantı**: Detay sayfasına yönlendiren buton metni ve linki

### 3. 🏗️ Öne Çıkan Projeler
- **Proje Kartları**: Ekleme, silme, sıralama
- **Proje Bilgileri**: Her proje için başlık, açıklama, görsel ve detay sayfası linki
- **Görsel Ayarları**: Boyut, oran ve kırpma seçenekleri
- **Tüm Projeler Linki**: Buton metni ve yönlendirme linki

### 4. ℹ️ Hakkımızda Bölümü
- **Ana Metin**: Ana içerik metni ve başlık
- **Yan Görseller**: Görsel ekleme, değiştirme, kaldırma
- **İstatistikler**: Yıllar, personel sayısı ve diğer sayısal veriler
- **"Detaylar" Butonu**: Buton metni ve bağlantı linki

### 5. 🛠️ Hizmetlerimiz Bölümü
- **Hizmet Kartları**: Konut, Hafriyat, Mimari Projelendirme, Kentsel Dönüşüm vb.
- **Hizmet Bilgileri**: Her hizmet için başlık, kısa açıklama, ikon/görsel
- **Renk Şeması**: Her hizmet kartı için renk seçimi (ana renk, hover renk vb.)
- **Detaylar Butonu**: Yazı ve yönlendirme linki

### 6. 📰 Haberler Bölümü
- **Haber Ekleme**: Başlık, tarih, kısa açıklama, görsel ve tam içerik
- **Haber Listesi**: Haberleri sıralama, silme, düzenleme
- **Kategori Yönetimi**: Haberler için kategoriler oluşturma
- **"Tüm Haberler" Butonu**: Buton metni ve link

### 7. 🏢 Tamamlanmış Projeler
- **Proje Galerisi**: Tamamlanmış projeler için görsel galerisi
- **Proje Bilgileri**: Her projenin adı, tamamlanma tarihi, konumu ve özellikleri
- **Filtreleme Seçenekleri**: Yıl, konum, proje tipi vb. filtreleme kriterleri

### 8. 👣 Footer Yönetimi
- **İletişim Bilgileri**: Adres, telefon, e-posta
- **Sosyal Medya Linkleri**: İkon, link ve sıralama
- **Hızlı Erişim Linkleri**: Menü öğeleri ve bağlantıları
- **Telif Hakkı Metni**: Alt bilgi yazısı

### 9. 🔧 Genel Ayarlar
- **Logo Yönetimi**: Site logosu (normal ve mobil versiyonlar)
- **SEO Ayarları**: Başlık, açıklama, anahtar kelimeler
- **Renk Şeması**: Sitenin ana renkleri, buton renkleri
- **Font Ayarları**: Yazı tipleri, boyutları
- **Favicon**: Site simgesi

### 10. 📱 Mobil Uyumluluk Ayarları
- **Mobil Görünüm Önizleme**: Farklı cihaz boyutlarında önizleme
- **Responsive Ayarlar**: Mobil cihazlara özel içerik düzenlemeleri
- **Touch Optimizasyon**: Dokunmatik ekranlar için buton boyutları

### 11. 👥 Kullanıcı Yönetimi
- **Admin Kullanıcıları**: Ekleme, silme, rol atama
- **Kullanıcı Rolleri**: Süper admin, içerik editörü, moderatör gibi roller
- **İzin Yönetimi**: Hangi rolün hangi bölümleri yönetebileceği

### 12. 📂 Medya Kütüphanesi
- **Dosya Yöneticisi**: Tüm görseller, videolar ve dökümanlar için merkezi kütüphane
- **Klasör Yapısı**: Dosyaları kategorilere ayırma
- **Görsel Optimizasyon**: Görsellerin otomatik boyutlandırılması ve sıkıştırılması

## Admin Panel Best Practices

### 1. Kullanıcı Arayüzü Tasarımı
- **Dashboard Tasarımı**: Özet bilgiler ve hızlı erişim butonları içeren bir ana panel
- **Sürükle-Bırak Arayüzü**: Özellikle slider, projeler ve hizmetler gibi bölümlerin sıralanması için
- **Tutarlı Tasarım**: Tüm admin paneli boyunca aynı tasarım dilinin kullanılması
- **Bildirim Sistemi**: Önemli olaylarda (yeni yorum, sistem güncellemesi vb.) bildirimler
- **Yardım Dokümantasyonu**: Kullanıcı rehberi ve yardımcı ipuçları

### 2. İçerik Yönetim Özellikleri
- **İçerik Önizleme**: Değişiklikleri kaydetmeden önce nasıl görüneceğini görebilme
- **Versiyon Kontrol**: Yapılan değişikliklerin geçmişini tutma ve geri alma imkanı
- **İşlem Günlüğü**: Hangi kullanıcının ne zaman ne değişiklik yaptığını kaydetme
- **İçerik Takvimi**: Gelecekte yayınlanacak içerikleri planlama
- **İçerik Şablonları**: Sık kullanılan içerik tipleri için hazır şablonlar

### 3. Teknik Özellikler
- **Hızlı Düzenleme Modu**: Sitenin ön yüzünden doğrudan düzenleme yapabilme
- **Batch İşlemler**: Çoklu içerik öğelerinde toplu düzenleme yapabilme
- **Arama Fonksiyonu**: Tüm içerik türlerinde hızlı arama yapabilme
- **Filtreleme**: İçerikleri çeşitli kriterlere göre filtreleme
- **Dışa/İçe Aktarma**: İçerikleri CSV, JSON gibi formatlarda dışa/içe aktarma

### 4. Analytics ve Raporlama
- **Analytics Entegrasyonu**: Google Analytics gibi analiz araçlarıyla entegrasyon
- **Performans Metrikleri**: Sayfa yüklenme hızı, ziyaretçi etkileşimi gibi ölçümleri görüntüleme
- **Özelleştirilebilir Raporlar**: İhtiyaçlara göre özelleştirilebilir rapor oluşturma
- **Ziyaretçi Davranışları**: Site içi gezinme, tıklama oranları ve dönüşüm analizi
- **Gerçek Zamanlı İstatistikler**: Anlık ziyaretçi sayısı, popüler sayfalar gibi veriler

## Teknik Öneriler

### Backend Teknolojileri
- **Node.js/Express.js**: API odaklı, hızlı bir backend için
- **PHP/Laravel**: Geleneksel, olgun bir CMS yapısı için
- **Python/Django**: Güçlü admin paneli yetenekleri için
- **Database**: PostgreSQL, MySQL veya MongoDB
- **Caching**: Redis veya Memcached ile performans optimizasyonu

### Frontend Teknolojileri
- **React**: Dinamik ve hızlı admin paneli arayüzü
- **Vue.js**: Daha az karmaşık, kolay öğrenilebilir alternatif
- **Material-UI/Ant Design**: Hazır UI bileşenleri için
- **TailwindCSS**: Özelleştirilmiş tasarımlar için
- **Chart.js/D3.js**: Veri görselleştirme için

### Çoklu Dil Desteği
- **i18n Kütüphaneleri**: Çoklu dil desteği için
- **Dil Dosya Yapısı**: Kolay genişletilebilir çeviri sistemi
- **RTL Desteği**: Sağdan sola diller için tasarım desteği

## Güvenlik Önlemleri

### Kimlik Doğrulama ve Yetkilendirme
- **2FA Desteği**: İki faktörlü kimlik doğrulama
- **Rol Tabanlı Erişim Kontrolü**: Farklı kullanıcı rolleri için farklı erişim seviyeleri
- **Güvenli Şifre Politikaları**: Güçlü şifre gereksinimleri ve düzenli şifre yenileme
- **Oturum Yönetimi**: Güvenli token tabanlı oturum yönetimi ve otomatik oturum sonlandırma

### Veri Güvenliği
- **HTTPS Kullanımı**: Tüm admin panel iletişimi için SSL/TLS
- **CSRF Koruması**: Cross-Site Request Forgery saldırılarına karşı koruma
- **XSS Önleme**: Cross-Site Scripting saldırılarına karşı önlemler
- **SQL Injection Koruması**: Veritabanı sorgularının güvenli hale getirilmesi
- **Düzenli Yedekleme**: Otomatik ve düzenli veri yedekleme

### Sistem Güvenliği
- **Güncel Yazılım**: Tüm bağımlılıkların ve paketlerin güncel tutulması
- **Rate Limiting**: Brute force saldırılarına karşı istek sınırlama
- **IP Kısıtlaması**: Admin paneline erişim için IP kısıtlamaları
- **Güvenlik Günlükleri**: Şüpheli etkinliklerin kaydedilmesi ve uyarı sistemi

---

Bu belge, Kent Konut web sitesi admin paneli için bir kılavuz olarak hazırlanmıştır. Geliştirme sürecinde ihtiyaçlara göre güncellenebilir ve genişletilebilir.

**Son Güncelleme:** 1 Haziran 2023 