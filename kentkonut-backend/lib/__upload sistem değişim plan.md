### PRD: Medya Yükleme Sistemi İyileştirmesi

- Problem
  - Büyük dosyalarda RAM kullanımı yükseliyor, ilk an görünürlükte gecikmeler yaşanabiliyor.
  - URL/servisleme ortam farklarından etkilenebiliyor.
  - Aynı dosyalar tekrar tekrar yüklenebiliyor (disk israfı).
- Amaçlar
  - Bellek güvenli (stream) yükleme + atomik yazma.
  - URL’lerin her ortamda kararlı çalışması.
  - Hash tabanlı deduplikasyon ile disk tasarrufu.
  - Görsel varyantlarını arka planda işleyerek hızlı yanıt.
  - Gözlemlenebilirlik ve tutarlı loglar.
- Başarı ölçütleri
  - 50MB dosya yüklemede Node bellek artışı < 80MB.
  - P95 upload yanıt süresi < 1.5 sn (işleme hariç).
  - Aynı görseli ikinci kez yüklemede DB’de yeni satır oluşturmadan referanslanması (%100 dedup).
  - “Yükle → 201 → URL GET 200” smoke testi %100 geçer.
- Kapsam dışı
  - Tam CDN mimarisi (opsiyonel sprint 3’te POC).
  - Video transcode.

### Ana gereksinimler

- Fonksiyonel
  - Admin bir dosya yüklediğinde dosya stream ile `.tmp/`’a yazılır, doğrulamalar geçince hedef klasöre atomik taşınır.
  - Dosya SHA-256 hash’i hesaplanır; mevcutsa kopyalamadan referans verilir.
  - Görseller için EXIF temizleme + WebP/AVIF varyantları arka planda üretilir; UI “işleniyor” durumunu gösterir.
  - URL’ler `getMediaUrl` üzerinden kanonik olarak üretilir ve `next.config.js` rewrites + `/api/static/...` ile servislenir.
- Non-fonksiyonel
  - Rate limit, MIME magic number doğrulaması, virüs taraması (mevcut) sürdürülür.
  - Her upload için `uploadId` ile yapılandırılmış loglar.
  - Docker volume izinleri (dosya 0644, klasör 0775) garanti edilir.

### Mimari/Tech değişiklikleri

- `lib/media-utils.ts`
  - `saveUploadedFileStream(file, finalPath)` yeni; `saveUploadedFile` geriye dönük kalsın ama içten stream’e yönlendirsin.
  - `computeFileHash(file.stream())`, `atomicMove(tmp, final)`, `withTmpTarget(finalPath)` yardımcıları.
- `app/api/media/route.ts`
  - `arrayBuffer` yerine `file.stream()` kullan.
  - Hash hesapla → DB’de `media.hash` araması → varsa dedup.
  - Dosya yazıldıktan sonra job kuyruğuna “image-process” ekle, response’u bekletme.
- Queue/Worker
  - `lib/queue.ts` (BullMQ), `workers/image-processor.ts` (sharp ile EXIF strip + WebP/AVIF).
- DB değişiklikleri (`prisma/schema.prisma` + migration)
  - `hash: String @unique?`, `status: MediaStatus @default(PENDING)` (PENDING | READY | FAILED)
  - `processingStartedAt`, `processingCompletedAt`, `width/height` (opsiyonel).
- Servisleme
  - Mevcut `next.config.js` rewrites + `app/api/static/banners/[filename]/route.ts` korunur.
- Gözlemlenebilirlik
  - `lib/metrics.ts` (Prometheus): `uploads_total`, `upload_bytes_total`, `upload_failures_total`, `processing_duration_seconds`.
- Konfig
  - `.env`: `REDIS_URL`, `IMAGE_PROCESSING_ENABLED=true`, `MAX_UPLOAD_SIZE_MB=50`.

### User Story’ler ve Kabul Kriterleri

- US-01 Admin olarak büyük dosyaları RAM şişirmeden yüklemek isterim.
  - AC: 50MB dosyada süreç tamamlanır, container bellek artışı < 80MB.
- US-02 Aynı görseli tekrar yüklediğimde diski şişirmeden referanslansın.
  - AC: Aynı hash için yeni fiziksel dosya yazılmaz; DB kayıtları aynı `hash`’i paylaşır.
- US-03 Upload sonrasında anında bir URL döner; işleme arkada sürer.
  - AC: 201 yanıtında kanonik URL, GET 200; `status=READY` olana kadar varyantlar eksik olsa da orijinal dosya servislenir.
- US-04 Galeride “işleniyor” ibaresi görürüm, tamamlanınca otomatik güncellenir.
  - AC: `status` alanına göre UI rozetleri; polling veya websocket ile güncelleme.
- US-05 Güvenlik ihlallerinde (virüs/mime spoof) dosya kalıntısı kalmaz.
  - AC: `.tmp` ve hedefte atomik temizleme; 400/422 döner, loglanır.
- US-06 Gözlemlenebilirlik: Upload metriklerini dashboard’da görürüm.
  - AC: Prometheus endpoint metrikleri expose edilir.

### Sprint Planı (3 sprint, 2 hafta)

- Sprint 1: Temel altyapı (Stream + Atomic + Hash Dedup)
  - `lib/media-utils.ts`: `saveUploadedFileStream`, `computeFileHash`, `atomicMove`, `ensureDirectoryExists` iyileştirmesi.
  - `app/api/media/route.ts`: stream’e geçiş, hash kontrolü, dedup.
  - Prisma migration: `hash`, `status`, timestamp kolonları; backfill script.
  - Log yapısı: `uploadId` ile tek satır akış.
  - Testler: Unit (hash, atomic), e2e “upload → GET 200”, yük testi 50MB.
  - DoD: 50MB testleri geçti, e2e smoke yeşil, lints/CI yeşil.

- Sprint 2: Arka plan işleme + UI iyileştirme
  - `lib/queue.ts` BullMQ, `workers/image-processor.ts` (EXIF strip, WebP/AVIF, boyut ölçümü).
  - API: işleme job enqueue; `status` güncelleme akışı.
  - Admin UI: “işleniyor” rozeti, hafif polling.
  - Metrikler: `processing_duration_seconds`, job failure metric.
  - DoD: Varyantlar üretiliyor, UI rozetleri çalışıyor, metrikler export ediliyor.

- Sprint 3: Ölçek ve servisleme POC (opsiyonel)
  - Storage abstraction: `lib/storage/index.ts` (disk + S3/MinIO implementasyonu).
  - Presigned URL POC (client→storage direkt yükleme).
  - CDN/Cache ayarlarının prova kurulumu.
  - DoD: Disk ve S3 provider ile aynı test paketi geçer; presigned POC ile 100MB parça yükleme demo.

### Görevler (dosya bazında)

- `kentkonut-backend/lib/media-utils.ts`
  - Yeni stream API, tmp dizin `public/.tmp/`, atomic rename, hash hesaplama.
- `kentkonut-backend/app/api/media/route.ts`
  - Stream’e geçiş, dedup, job enqueue, 201 yanıt.
- `kentkonut-backend/workers/image-processor.ts`
  - Sharp ile EXIF temizleme, WebP/AVIF üretimi, metadata yazımı.
- `kentkonut-backend/lib/queue.ts`
  - BullMQ client ve health check.
- `prisma/migrations/*`
  - Kolon ekleme, index (`hash` unique?), backfill script.
- `next.config.js`
  - Mevcut rewrites korunur; header/cache ayarları doğrulanır.
- `docker-compose.yml`
  - `REDIS_URL` doğrula, worker servisi (ayrı process) ekleme.
- `scripts/` 
  - `scripts/media-backfill-hash.ts`, `scripts/verify-media-urls.ts`

### QA Plan

- E2E
  - 1MB/20MB/50MB dosya yükle, 201 ve GET 200 doğrula.
  - Aynı dosyayı tekrar yükle, dedup beklenir; dosya sisteminde tek kopya.
  - Upload iptali/simüle hata: .tmp kalıntı yok.
- Performans
  - 10 eşzamanlı 20MB upload; 95p yanıt süresi ve bellek artışı ölç.
- Güvenlik
  - Yanlış MIME (spoof) → reddedilir; loglanır; dosya yok.
  - Virüslü simülasyon → reddedilir; dosya yok.

### Rollout

- Feature flag: `IMAGE_PROCESSING_ENABLED`, `DEDUP_ENABLED`.
- Kanarya: yalnızca `banners` ile başlat, sonra diğer klasörlere genişlet.
- Geri alma: flag kapat, worker durdur, stream yerine eski yol (fallback) kısa süreli.

### Riskler ve mitigasyon

- Windows/WSL/Docker path/izin farkları: `path.join` + testler, dosya `0644`, klasör `0775`.
- Sharp native modüller: Docker build katmanlarında cache ve platform imajını sabitle.
- Büyük dosya DoS: Nginx/Next `bodyParser` limitleri + rate limit.

İstersen Sprint 1’i başlatıp şu dosyadan başlayayım: `lib/media-utils.ts` (stream + tmp + atomic). Ardından API’ye entegrasyonu yaparız.