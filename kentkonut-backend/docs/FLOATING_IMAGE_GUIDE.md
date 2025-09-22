# Metin Yanına Görsel Ekleme Özelliği (Floating Images)

Bu dokümantasyon, Kent Konut CMS içerik düzenleyicisinde bulunan metin yanına görsel ekleme (floating image) özelliğinin nasıl kullanılacağını anlatır.

## Genel Bakış

Metin yanına görsel ekleme özelliği, metni görsel etrafında akıtarak daha zengin ve profesyonel sayfa düzenleri oluşturmanıza olanak tanır. Bu özellik sayesinde görseller:

- Metnin sol veya sağ tarafına yerleştirilebilir
- Metin görselin etrafını sarar
- Farklı boyutlarda (küçük, orta, büyük) gösterilebilir
- Mobil cihazlarda otomatik olarak duyarlı (responsive) hale gelir

## Kullanım Adımları

1. İçerik düzenleyicide, görselin eklenmesini istediğiniz noktaya tıklayın
2. Editör araç çubuğundaki "↔️🖼️" simgesine tıklayın
3. Açılan "Metin Yanına Görsel Ekle" dialogunda:
   - "Resim Konumu" bölümünden görselin sol veya sağ tarafta olmasını seçin
   - "Resim Boyutu" bölümünden küçük, orta veya büyük boyutu seçin
   - "Resim Seç" butonuna tıklayarak medya kitaplığından bir görsel seçin
4. "Ekle" butonuna tıklayarak görseli ekleyin

## Boyut Seçenekleri

- **Küçük**: Sayfanın %25'i genişliğinde
- **Orta**: Sayfanın %40'ı genişliğinde
- **Büyük**: Sayfanın %50'si genişliğinde

## Konumlandırma

- **Sol**: Görsel sol tarafta yer alır, metin sağdan ve alttan akar
- **Sağ**: Görsel sağ tarafta yer alır, metin soldan ve alttan akar

## Mobil Görünüm

Mobil cihazlarda (640px ve altı genişlikte), görseller otomatik olarak tam genişlikte ve akışı bozmayacak şekilde gösterilir. Bu sayede mobil kullanıcılarda da içeriğin okunabilirliği korunur.

## İpuçları

- En iyi görünüm için, görselin ekleneceği paragraftan önce en az bir paragraf metin olması önerilir
- Görseller arasında yeterli boşluk bırakın
- Çok büyük boyutlu görseller için "Küçük" veya "Orta" seçeneğini tercih edin
- Özellikle önemli bilgilerin görsellerin yanında olduğundan emin olun

## Teknik Detaylar

Bu özellik, TipTap editörünün özelleştirilmiş bir CustomImage bileşeni kullanılarak geliştirilmiştir. Görseller bir div içerisine sarılır ve CSS float özelliği ile konumlandırılır, böylece metin doğal bir şekilde etrafında akar.

## Sorun Giderme

Eğer metin görselin etrafında düzgün akmıyorsa:

1. Görselin boyutunu küçültmeyi deneyin
2. Metni düzenlerken enter tuşu ile yeni paragraflar oluşturun
3. Sayfayı önizleyerek gerçek görünümünü kontrol edin
