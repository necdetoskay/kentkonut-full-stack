# Yeni Proje Detay Sayfası İçin Gerekli Veritabanı Alanları

Bu dosya, yeni proje detay sayfası tasarımı için `Project` ve ilgili tablolara eklenmesi gereken yeni alanları listeler.

## Project Tablosuna Eklenecek Yeni Alanlar
 
- **location**: `String` - Projenin konumu (Örn: "İstanbul / Başakşehir"). [mecvut proje tablosunda il ve ilçe kısmından alınacak]
- **projectType**: `String` - Projenin tipi (Örn: "Konut+Ticari Ünite").[ enum olacak: Konut,Ticari,Konut+Ticari alanları olacak]
- **residentialUnitCount**: `Int` - Toplam konut sayısı.
- **commercialUnitCount**: `Int` - Toplam ticari ünite sayısı.
- **totalUnitCount**: `Int` - Toplam bağımsız bölüm sayısı.
- **secondaryImageUrl**: `String` - Ana içerik alanının sağındaki ikincil büyük resim URL'si.
- **certificateButtonText**: `String` - Sertifika butonu üzerindeki metin. [olmayacak iptal]
- **certificateButtonUrl**: `String` - Sertifika butonunun yönlendireceği URL. [olmayacak iptal]
- **certificateBadgeUrl**: `String` - Sertifika logosu/rozetinin resim URL'si. [olmayacak iptal]
- **mapUrl**: `String` - Harita ikonunun yönlendireceği URL. [mevcut tabloda enlem boylam alanıdan alıancak]
- **phoneNumber**: `String` - Telefon ikonunda gösterilecek veya `tel:` linkinde [iptal olmayacak]kullanılacak numara.
- **websiteUrl**: `String` - Web sitesi ikonunun yönlendireceği URL. [iptal olmayacak]

## GalleryItem Tablosuna Eklenecek Yeni Alan
galeri bölümüne gelince  yapı değişecek
galeri tablosu yapısı şu şekldie olacak, her galeri birde parent galeri şeklinde bir alan içerecek, bu alanca mevcut başka bir galeri ile bağlayacağız, bu alan seçimlik olacak
her galeri altında reismler, videolar, normal dosyalar (txt, word,pdf), video veya embed video yüklenebilecek, video resim veya dosya yüklemek için globalmediaselectör gibi bir komponent kullanılacak


