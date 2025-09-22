# Geliştirme Planı: İnteraktif Veri Seed Script'i

## 1. Genel Amaç

Projenin geliştirme (development) ortamı için başlangıç verilerini (seed data) veritabanına kolayca eklemeyi sağlayan, interaktif ve genişletilebilir bir komut satırı arayüzü (CLI) script'i oluşturmak. Bu script, `npm run seed` komutuyla çalışacak ve geliştiricinin hangi veri setini (Üst Menü, Haberler, Projeler vb.) eklemek istediğini seçmesine olanak tanıyacaktır.

**Stratejik Faydalar:**
- **Standardizasyon:** Tüm geliştiricilerin aynı temel veri setiyle çalışmasını sağlar.
- **Verimlilik:** Yeni bir geliştiricinin veya temiz bir veritabanının dakikalar içinde hazır hale gelmesini sağlar.
- **Kontrollü Test:** Belirli veri senaryolarını test etmek için ortamı hızla kurma imkanı verir.
- **Genişletilebilirlik:** Yeni modüller (örneğin, "İnsan Kaynakları", "İhale Duyuruları") eklendiğinde, seed mekanizmasına kolayca entegre edilebilir.

## 2. Teknik Gereksinimler

- **Platform:** Node.js
- **CLI İnteraktif Menü:** `inquirer` veya `prompts` gibi bir kütüphane kullanılacak. Bu, kullanıcı dostu menüler oluşturmayı kolaylaştırır.
- **Veri Kaynağı:** Seed verileri, yönetimi kolaylaştırmak için ayrı JSON dosyalarında (`/data/seed/haberler.json` gibi) tutulmalıdır. Bu, kod ile veriyi ayırır.
- **Veritabanı Bağlantısı:** Script, `kentkonut-backend` projesinin mevcut veritabanı bağlantı mantığını ve konfigürasyonunu (`.env.development` dosyasını okuyarak) yeniden kullanmalıdır. Bu, tutarlılığı sağlar ve konfigürasyon tekrarını önler.
- **Modüler Yapı:** Her bir veri tipi (Haberler, Projeler vb.) için ayrı bir "seeder" dosyası oluşturulmalıdır. Ana script, bu modülleri çağırarak işlemleri gerçekleştirecektir.
- **Paket Yönetimi:** Gerekli kütüphaneler (`inquirer`, `dotenv`) `package.json` dosyasına `devDependency` olarak eklenecektir.

## 3. Adım Adım Geliştirme Planı

| Faz | Adım | Açıklama | Sorumlu Rol | Tahmini Süre |
| :-- | :--- | :--- | :--- | :--- |
| **1. Kurulum ve Çekirdek Yapı (MVP)** | 1.1. Gerekli Paketleri Kur | `npm install inquirer dotenv --save-dev` komutları ile geliştirme bağımlılıkları eklenir. | Backend Developer | 0.5 Saat |
| | 1.2. `package.json` Script'ini Ekle | `scripts` altına `"seed": "node ./scripts/seed.js"` komutu eklenir. | Backend Developer | 0.5 Saat |
| | 1.3. Ana Script Dosyasını Oluştur | Proje ana dizininde `/scripts/seed.js` dosyası oluşturulur. Bu dosya, menüyü gösterecek ve ilgili seeder'ı tetikleyecektir. | Backend Developer | 2 Saat |
| | 1.4. Veri ve Seeder Dizinlerini Oluştur | `/kentkonut-backend/data/seed` ve `/kentkonut-backend/scripts/seeders` dizinleri oluşturulur. | Backend Developer | 0.5 Saat |
| **2. İlk Seeder'ın (Üst Menü) Geliştirilmesi** | 2.1. Örnek Veri Dosyasını Oluştur | `/kentkonut-backend/data/seed/ust-menu.json` dosyası, menü yapısını içeren veri ile doldurulur. | Backend Developer | 1 Saat |
| | 2.2. Üst Menü Seeder'ını Yaz | `/kentkonut-backend/scripts/seeders/ust-menu.seeder.js` dosyası oluşturulur. Bu script, JSON'u okur, veritabanına bağlanır ve veriyi ilgili tabloya yazar. | Backend Developer | 3 Saat |
| | 2.3. Test | `npm run seed` ile "Üst Menü" seçeneği test edilir. Veritabanı kontrolü yapılır. | Backend Developer | 1 Saat |
| **3. Diğer Seeder'ların Eklenmesi** | 3.1. Haberler, Projeler, Birimler | Faz 2'deki adımlar diğer veri tipleri için tekrarlanır. Her biri için ayrı `.json` ve `.seeder.js` dosyaları oluşturulur. | Backend Developer | 4 Saat |
| | 3.2. "Tümünü Seedle" Seçeneği | Menüye, tüm seeder'ları sırayla çalıştıracak bir "Tümünü Seedle" (Seed All) seçeneği eklenir. | Backend Developer | 1 Saat |
| **4. İyileştirme ve Dokümantasyon** | 4.1. Dinamik Menü Oluşturma | Ana script (`seed.js`), `/seeders` dizinindeki dosyaları okuyarak menüyü dinamik olarak oluşturacak şekilde refactor edilir. Bu, yeni seeder eklemeyi çok kolaylaştırır. | Sr. Backend Developer | 2 Saat |
| | 4.2. Dokümantasyon | `README.md` dosyasına veya ayrı bir doküman olarak, script'in nasıl kullanılacağı ve nasıl yeni bir seeder ekleneceği anlatılır. | Backend Developer | 1 Saat |

## 4. Tahmini Süre ve Rol Dağılımı

- **Toplam Tahmini Süre:** **16.5 Saat** (~2 Adam/Gün)
- **Sorumlu Roller:**
  - **Kıdemli Backend Developer:** Mimarinin kurulması, ilk seeder'ın yazılması ve dinamik menü refactoring'i.
  - **Orta Seviye Backend Developer:** Diğer seeder'ların geliştirilmesi ve test edilmesi.

## 5. Riskler ve Öneriler

- **Risk: Veri Tekrarı (Duplication)**
  - **Açıklama:** Script'in tekrar tekrar çalıştırılması, veritabanında aynı verilerin kopyalar halinde oluşmasına neden olabilir.
  - **Öneri (Idempotency):** Her seeder, veri eklemeden önce verinin mevcut olup olmadığını kontrol etmelidir. Eğer veri varsa, eklemeyi atlamalı veya mevcut veriyi güncellemeli. Alternatif olarak, her işlem öncesi ilgili tabloları temizleyen (`TRUNCATE TABLE ... CASCADE`) bir opsiyon sunulabilir.

- **Risk: Hatalı Ortamda Çalıştırma**
  - **Açıklama:** Geliştiricinin yanlışlıkla `production` veritabanı konfigürasyonu ile script'i çalıştırması felaketle sonuçlanabilir.
  - **Öneri:** Script, çalışmaya başlamadan önce `NODE_ENV` ortam değişkenini kontrol etmelidir. Eğer `production` ise, işlemi hemen durdurmalı ve bir uyarı mesajı göstermelidir. Ayrıca, `inquirer` ile "Bu işlem X veritabanını etkileyecektir. Emin misiniz?" gibi bir onay adımı eklenmelidir.

- **Risk: Veritabanı Şema Değişiklikleri**
  - **Açıklama:** Veritabanı şeması (tablo/kolon yapısı) değiştiğinde, seed script'leri ve veri dosyaları bozulabilir.
  - **Öneri:** Bu bir bakım görevidir. Proje dokümantasyonunda, şema değişiklikleri yapıldığında ilgili seed script'lerinin de güncellenmesi gerektiği açıkça belirtilmelidir.

- **Öneri: Genişletilebilirlik İçin İsimlendirme Standardı**
  - Seeder dosyalarını `01-ust-menu.seeder.js`, `02-haberler.seeder.js` gibi numaralandırmak, menüdeki sıralamayı kontrol etmeyi kolaylaştırır ve yönetimi basitleştirir.
