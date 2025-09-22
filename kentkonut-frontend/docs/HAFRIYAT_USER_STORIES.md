# Hafriyat Sayfası User Story'leri

## Kullanıcı Hikayeleri (User Stories)

### 1. Hafriyat Sayfasına Erişim

**Kullanıcı olarak,** hafriyat çalışmalarının durumunu görebilmek için hafriyat sayfasına erişmek istiyorum.

**Kabul Kriterleri:**
- Ana menüde "Hafriyat" bağlantısı bulunmalı
- URL üzerinden doğrudan erişim sağlanabilmeli (`http://172.41.42.51:3020/hafriyat`)
- Sayfa yüklendiğinde hafriyat bilgileri görüntülenmeli

### 2. Hafriyat Bilgilerini Görüntüleme

**Kullanıcı olarak,** hafriyat çalışmaları hakkında genel bilgi edinmek istiyorum.

**Kabul Kriterleri:**
- Sayfanın üst kısmında hafriyat çalışmaları hakkında açıklayıcı bir metin olmalı
- Metnin anlaşılır ve bilgilendirici olması
- Son güncelleme tarihi belirtilmeli

### 3. Hafriyat Sahalarının İlerleme Durumunu Görüntüleme

**Kullanıcı olarak,** farklı hafriyat sahalarının tamamlanma yüzdelerini görsel olarak görmek istiyorum.

**Kabul Kriterleri:**
- Her bir hafriyat sahası için dairesel ilerleme göstergeleri bulunmalı
- Göstergelerde tamamlanma yüzdeleri sayısal olarak belirtilmeli
- Göstergeler renk kodlaması ile ilerleme durumunu vurgulamalı

### 4. Detaylı İlerleme Bilgilerini Görüntüleme

**Kullanıcı olarak,** her bir hafriyat sahasının detaylı ilerleme bilgilerini görmek istiyorum.

**Kabul Kriterleri:**
- Her bir saha için yatay ilerleme çubukları bulunmalı
- İlerleme çubuklarında tamamlanma yüzdeleri belirtilmeli
- İlerleme çubukları renk kodlaması ile ilerleme durumunu vurgulamalı

### 5. Mobil Cihazlarda Görüntüleme

**Kullanıcı olarak,** hafriyat sayfasını mobil cihazımda da rahatça görüntüleyebilmek istiyorum.

**Kabul Kriterleri:**
- Sayfa responsive tasarıma sahip olmalı
- Mobil cihazlarda tüm içerikler düzgün görüntülenmeli
- Dokunmatik ekranlarda kullanımı kolay olmalı

### 6. Sayfa Yükleme Performansı

**Kullanıcı olarak,** hafriyat sayfasının hızlı bir şekilde yüklenmesini istiyorum.

**Kabul Kriterleri:**
- Sayfa 3 saniyeden kısa sürede yüklenmeli
- Veriler yüklenirken uygun bir yükleniyor göstergesi görüntülenmeli
- Veri yüklenemediğinde kullanıcıya bilgi verilmeli

### 7. Erişilebilirlik

**Engelli bir kullanıcı olarak,** hafriyat sayfasına erişebilmek ve içeriği anlayabilmek istiyorum.

**Kabul Kriterleri:**
- Sayfa WCAG 2.1 AA standartlarına uygun olmalı
- Ekran okuyucularla uyumlu çalışmalı
- Klavye ile gezinme desteklenmeli
- Yeterli kontrast oranları sağlanmalı

### 8. Güncel Verilere Erişim

**Kullanıcı olarak,** hafriyat sahalarının en güncel verilerine erişmek istiyorum.

**Kabul Kriterleri:**
- Veriler backend API'den düzenli olarak alınmalı
- Son güncelleme tarihi ve saati belirtilmeli
- Sayfa yenilendiğinde veriler güncellenebilmeli