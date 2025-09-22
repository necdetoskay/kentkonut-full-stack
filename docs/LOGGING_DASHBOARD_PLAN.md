### Yol Haritası: Merkezi Loglama Sistemi

**Genel Hedef:** Uygulamanın tüm loglarını (hata, uyarı, bilgi vb.) yakalayıp veritabanında depolamak ve yönetici panelinde görüntülenebilir, filtrelenebilir bir arayüz sunmak.

**Faz 1: Temel Merkezi Loglama (Backend)**
*   **Hedef:** Tüm `console` çıktılarını (log, error, warn) yakalayıp veritabanına kaydetmek.
*   **Tahmini Süre:** 1-2 gün

**Faz 2: Log Görüntüleme API'si (Backend)**
*   **Hedef:** Kaydedilen logları filtreleme, sayfalama ve sıralama özellikleriyle sunan API endpoint'leri oluşturmak.
*   **Tahmini Süre:** 1 gün

**Faz 3: Log Paneli (Frontend)**
*   **Hedef:** Yönetici panelinde logları görüntülemek ve filtrelemek için kullanıcı arayüzü oluşturmak.
*   **Tahmini Süre:** 2-3 gün

**Faz 4: Gelişmiş Özellikler (Gelecek Planları)**
*   Loglarda tam metin arama.
*   Logları dışa aktarma (CSV, JSON).
*   Gerçek zamanlı log akışı (WebSocket kullanarak).
*   Üretim ortamı için harici loglama servisleriyle entegrasyon (Sentry, ELK Stack vb.).

---

### Görev Listesi (Faz 1: Temel Merkezi Loglama)

1.  **Veritabanı Şeması Oluşturma:**
    *   `kentkonut-backend/prisma/schema.prisma` dosyasına yeni bir `ApplicationLog` modeli ekle.
        *   `id` (String, @id, @default(uuid()))
        *   `timestamp` (DateTime, @default(now()))
        *   `level` (String) - (örn: "info", "warn", "error")
        *   `message` (String)
        *   `context` (String, optional) - (örn: "File Upload", "API Request")
        *   `details` (Json, optional) - (hata stack trace'i, request body gibi detaylar)
2.  **Prisma Migrasyonu Çalıştırma:**
    *   Yeni `ApplicationLog` tablosunu veritabanına eklemek için Prisma migrasyon komutunu çalıştır.
3.  **Logger Yardımcı Fonksiyonu Oluşturma:**
    *   `kentkonut-backend/lib/logger.ts` adında yeni bir dosya oluştur.
    *   Bu dosyada `log`, `error`, `warn` gibi fonksiyonlar tanımla. Bu fonksiyonlar, mesajı hem `console`'a yazacak hem de `ApplicationLog` tablosuna kaydedecek.
    *   Mevcut `console.log`, `console.error` vb. çağrılarını bu yeni logger fonksiyonlarıyla değiştir. Özellikle dosya yükleme ve okuma kısımlarındaki logları bu yeni logger ile değiştirirken `context` ve `details` alanlarını doldurmaya özen göster.
