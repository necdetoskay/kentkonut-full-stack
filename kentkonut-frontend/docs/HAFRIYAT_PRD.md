# Hafriyat Sayfası Ürün Gereksinim Dokümanı (PRD)

## 1. Genel Bakış

Hafriyat sayfası, Kent Konut projelerinde yapılan hafriyat çalışmalarının durumunu görsel olarak takip etmek için geliştirilecek bir web sayfasıdır. Sayfa, farklı hafriyat sahalarının tamamlanma yüzdelerini gösterecek ve kullanıcılara hafriyat çalışmaları hakkında bilgi verecektir.

## 2. Hedefler

- Kullanıcılara hafriyat çalışmalarının güncel durumunu göstermek
- Farklı hafriyat sahalarının tamamlanma yüzdelerini görsel olarak sunmak
- Hafriyat çalışmaları hakkında bilgilendirici içerik sağlamak
- Mobil ve masaüstü cihazlarda uyumlu çalışacak responsive bir tasarım sunmak

## 3. Kullanıcı Kitlesi

- Kent Konut web sitesini ziyaret eden vatandaşlar
- Kent Konut projelerini takip eden potansiyel müşteriler
- Belediye yetkilileri ve proje paydaşları

## 4. Özellikler ve Fonksiyonlar

### 4.1 Hafriyat Bilgi Bölümü
- Hafriyat çalışmaları hakkında genel bilgi içeren bir metin alanı
- Çalışmaların amacı ve kapsamı hakkında açıklama
- Son güncelleme tarihi bilgisi

### 4.2 Hafriyat Saha İlerleme Göstergeleri
- Her bir hafriyat sahası için dairesel ilerleme göstergeleri
- Tamamlanma yüzdelerinin görsel olarak gösterimi
- Saha adları ve tamamlanma yüzdeleri

### 4.3 Detaylı İlerleme Çubukları
- Her bir saha için yatay ilerleme çubukları
- Daha detaylı yüzde bilgisi
- Renk kodlaması ile ilerleme durumunun vurgulanması

## 5. Teknik Gereksinimler

### 5.1 Backend Entegrasyonu
- Hafriyat verilerinin backend API'den alınması
- Verilerin düzenli olarak güncellenmesi
- Hata durumlarının yönetilmesi

### 5.2 UI Bileşenleri
- Dairesel ilerleme göstergeleri (Progress Circle)
- Yatay ilerleme çubukları (Progress Bar)
- Responsive tasarım için gerekli bileşenler

### 5.3 Performans Gereksinimleri
- Sayfa yüklenme süresi 3 saniyeden az olmalı
- Mobil cihazlarda optimum performans sağlanmalı
- Veri güncellemeleri kullanıcı deneyimini kesintiye uğratmamalı

## 6. Tasarım Gereksinimleri

- Kent Konut kurumsal kimliğine uygun renk şeması
- Kullanıcı dostu ve sezgisel arayüz
- Mobil cihazlarda uyumlu çalışacak responsive tasarım
- Erişilebilirlik standartlarına uygunluk

## 7. Kabul Kriterleri

- Tüm hafriyat sahalarının doğru verilerle gösterilmesi
- İlerleme göstergelerinin doğru çalışması
- Sayfanın tüm tarayıcılarda ve cihazlarda düzgün görüntülenmesi
- Backend API ile başarılı entegrasyon
- Sayfa yüklenme süresinin 3 saniyeden az olması

## 8. Kapsam Dışı

- Hafriyat verilerinin manuel olarak girilmesi
- Hafriyat sahalarının harita üzerinde gösterimi (ileriki versiyonlarda eklenebilir)
- Geçmiş hafriyat verilerinin arşivlenmesi
- Kullanıcı yorumları ve geri bildirim sistemi

## 9. Riskler ve Bağımlılıklar

- Backend API'nin kullanılabilirliği ve performansı
- Veri formatının değişmesi durumunda uyumluluk sorunları
- Çok sayıda hafriyat sahası olması durumunda performans sorunları

## 10. Zaman Çizelgesi

- Tasarım ve planlama: 2 gün
- Geliştirme: 3 gün
- Test ve hata düzeltme: 2 gün
- Canlıya alma: 1 gün
- Toplam: 8 gün