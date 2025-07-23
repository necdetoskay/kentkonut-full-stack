# 🎯 Banner Modülü Yol Haritası ve Checklist

## 📋 Genel Bakış
Bu doküman, banner yönetim modülünün sıfırdan oluşturulması için detaylı yol haritasını içerir. Modül, carousel sistemi için gruplandırılmış banner yönetimi sağlar.

## 🎯 Modül Amacı
- Birden fazla carousel desteği için banner grupları
- Her banner grubu bir carousel'e hizmet eder
- Sürükle-bırak sıralama sistemi
- Detaylı istatistik toplama
- Responsive banner boyutları
- Animasyon ve geçiş efektleri

---

## ✅ YAPILACAKLAR LİSTESİ

### 🔧 1. VERİTABANI KATMANI

#### 1.1 Prisma Schema Güncellemesi
- [ ] `BannerAnimasyonTipi` enum'ını ekle
- [ ] `BannerGroup` modelini oluştur
- [ ] `Banner` modelini oluştur
- [ ] `BannerIstatistik` modelini oluştur
- [ ] İlişkileri tanımla (BannerGroup ↔ Banner ↔ BannerIstatistik)
- [ ] İndeksleri ekle

#### 1.2 Migration Oluşturma
- [ ] Prisma migration dosyası oluştur
- [ ] Veritabanı şemasını güncelle
- [ ] Migration'ı test et

#### 1.3 Tip Tanımları
- [ ] `shared/types/src/enums/banner.ts` oluştur
- [ ] Banner ile ilgili TypeScript interface'lerini tanımla
- [ ] Form tiplerini oluştur
- [ ] API response tiplerini tanımla

---

### 🌐 2. API KATMANI

#### 2.1 Banner Grupları API'leri
- [ ] `GET /api/banner-groups` - Tüm grupları listele
- [ ] `GET /api/banner-groups/:id` - Belirli grubu getir
- [ ] `POST /api/banner-groups` - Yeni grup oluştur
- [ ] `PUT /api/banner-groups/:id` - Grubu güncelle
- [ ] `DELETE /api/banner-groups/:id` - Grubu sil (deletable kontrolü ile)

#### 2.2 Banner API'leri
- [ ] `GET /api/banner-groups/:id/banners` - Gruptaki bannerları listele
- [ ] `POST /api/banners` - Yeni banner oluştur
- [ ] `PUT /api/banners/:id` - Banner güncelle
- [ ] `DELETE /api/banners/:id` - Banner sil
- [ ] `PUT /api/banners/reorder` - Banner sırasını güncelle (sürükle-bırak)

#### 2.3 İstatistik API'leri
- [ ] `POST /api/banners/:id/statistics` - İstatistik kaydet
- [ ] `GET /api/banners/:id/statistics` - Banner istatistiklerini getir
- [ ] `GET /api/banner-groups/:id/statistics` - Grup istatistiklerini getir

#### 2.4 Public API'leri
- [ ] `GET /api/public/banner-groups/:id/active` - Aktif bannerları getir
- [ ] `POST /api/public/banners/:id/track` - İstatistik kaydet (public)

---

### 🎨 3. FRONTEND KATMANI

#### 3.1 Dashboard Sayfaları
- [ ] `/dashboard/banner-groups` - Banner grupları listesi
- [ ] `/dashboard/banner-groups/new` - Yeni grup oluşturma
- [ ] `/dashboard/banner-groups/[id]/edit` - Grup düzenleme
- [ ] `/dashboard/banner-groups/[id]/banners` - Gruptaki bannerlar
- [ ] `/dashboard/banners/new` - Yeni banner oluşturma
- [ ] `/dashboard/banners/[id]/edit` - Banner düzenleme

#### 3.2 Bileşenler
- [ ] `BannerGroupForm` - Banner grubu form bileşeni
- [ ] `BannerForm` - Banner form bileşeni
- [ ] `BannerList` - Banner listesi bileşeni
- [ ] `BannerReorder` - Sürükle-bırak sıralama bileşeni
- [ ] `BannerStatistics` - İstatistik görüntüleme bileşeni
- [ ] `BannerPreview` - Banner önizleme bileşeni

#### 3.3 UI Bileşenleri
- [ ] `BannerThumbnail` - Banner küçük resmi
- [ ] `BannerGroupCard` - Banner grubu kartı
- [ ] `BannerOrderManager` - Sıralama yöneticisi
- [ ] `BannerSettingsPanel` - Ayarlar paneli

---

### 🔧 4. YARDIMCI FONKSİYONLAR

#### 4.1 Validasyon
- [ ] `lib/validations/banner.ts` - Banner validasyonları
- [ ] `lib/validations/banner-group.ts` - Banner grubu validasyonları

#### 4.2 Sabitler
- [ ] `lib/constants/banner.ts` - Banner sabitleri
- [ ] `lib/constants/banner-animations.ts` - Animasyon sabitleri

#### 4.3 Yardımcı Fonksiyonlar
- [ ] `lib/utils/banner-helpers.ts` - Banner yardımcı fonksiyonları
- [ ] `lib/utils/banner-statistics.ts` - İstatistik yardımcı fonksiyonları

---

### 📊 5. İSTATİSTİK SİSTEMİ

#### 5.1 İstatistik Türleri
- [ ] `view` - Görüntülenme
- [ ] `click` - Tıklama
- [ ] `impression` - Gösterim
- [ ] `hover` - Fare üzerine gelme
- [ ] `scroll` - Scroll etme
- [ ] `time_spent` - Geçirilen süre
- [ ] `bounce` - Hemen çıkma
- [ ] `conversion` - Hedef eylem
- [ ] `load_time` - Yükleme süresi
- [ ] `error` - Hata
- [ ] `device_type` - Cihaz tipi
- [ ] `browser` - Tarayıcı

#### 5.2 İstatistik Toplama
- [ ] Middleware ile otomatik istatistik toplama
- [ ] Client-side istatistik gönderme
- [ ] İstatistik verilerini işleme ve analiz

---

### 🎨 6. KULLANICI DENEYİMİ

#### 6.1 Sürükle-Bırak Sıralama
- [ ] React DnD veya benzeri kütüphane entegrasyonu
- [ ] Sıralama değişikliklerini API'ye gönderme
- [ ] Gerçek zamanlı güncelleme

#### 6.2 Banner Önizleme
- [ ] Canlı banner önizleme
- [ ] Farklı cihaz boyutlarında önizleme
- [ ] Animasyon önizleme

#### 6.3 Responsive Tasarım
- [ ] Mobil uyumlu dashboard
- [ ] Tablet uyumlu dashboard
- [ ] Desktop optimizasyonu

---

### 🔒 7. GÜVENLİK VE YETKİLENDİRME

#### 7.1 Yetkilendirme
- [ ] Banner yönetimi için rol kontrolü
- [ ] API endpoint'lerinde yetki kontrolü
- [ ] Silme işlemlerinde onay

#### 7.2 Veri Doğrulama
- [ ] Input validasyonu
- [ ] Dosya yükleme güvenliği
- [ ] XSS koruması

---

### 📚 8. DOKÜMANTASYON

#### 8.1 Teknik Dokümantasyon
- [ ] API dokümantasyonu
- [ ] Veritabanı şeması dokümantasyonu
- [ ] Bileşen dokümantasyonu

#### 8.2 Kullanıcı Dokümantasyonu
- [ ] Banner yönetimi kullanım kılavuzu
- [ ] İstatistik raporları kılavuzu
- [ ] Sık sorulan sorular

---

### 🧪 9. TEST

#### 9.1 Unit Testler
- [ ] API endpoint testleri
- [ ] Bileşen testleri
- [ ] Yardımcı fonksiyon testleri

#### 9.2 Integration Testler
- [ ] Banner CRUD işlemleri
- [ ] İstatistik toplama
- [ ] Sıralama işlemleri

#### 9.3 E2E Testler
- [ ] Banner yönetimi akışı
- [ ] Sürükle-bırak işlemleri
- [ ] İstatistik görüntüleme

---

### 🚀 10. DEPLOYMENT

#### 10.1 Production Hazırlığı
- [ ] Environment değişkenleri
- [ ] Error handling
- [ ] Logging
- [ ] Performance optimizasyonu

#### 10.2 Monitoring
- [ ] Banner performans izleme
- [ ] Hata izleme
- [ ] Kullanım istatistikleri

---

## 📅 TAHMİNİ SÜRE
- **Toplam Süre:** 3-4 gün
- **Veritabanı:** 0.5 gün
- **API:** 1 gün
- **Frontend:** 1.5 gün
- **Test & Dokümantasyon:** 1 gün

## 🎯 ÖNCELİK SIRASI
1. Veritabanı şeması ve migration
2. Temel API endpoint'leri
3. Dashboard sayfaları
4. Sürükle-bırak sıralama
5. İstatistik sistemi
6. Test ve optimizasyon

---

## ✅ TAMAMLAMA KRİTERLERİ
- [ ] Tüm CRUD işlemleri çalışıyor
- [ ] Sürükle-bırak sıralama çalışıyor
- [ ] İstatistik sistemi aktif
- [ ] Responsive tasarım tamamlandı
- [ ] Testler geçiyor
- [ ] Dokümantasyon tamamlandı

---

*Bu checklist, banner modülünün tamamlanması için gerekli tüm adımları içerir. Her madde tamamlandığında işaretlenecektir.* 