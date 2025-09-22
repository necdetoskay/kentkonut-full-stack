-- =================================================================
-- YENI HIZLI ERISIM TABLOLARI
-- =================================================================

-- Bu tablo, hızlı erişim menüsünün hangi URL'de görüneceğini tanımlar.
CREATE TABLE IF NOT EXISTS "hizli_erisim_sayfalar" (
    "id" VARCHAR(255) NOT NULL,
    "sayfaUrl" VARCHAR(255) NOT NULL,
    "baslik" VARCHAR(255) NOT NULL DEFAULT 'HIZLI ERİŞİM',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_erisim_sayfalar_pkey" PRIMARY KEY ("id")
);

-- sayfaUrl kolonunun benzersiz (unique) olmasını sağlıyoruz.
CREATE UNIQUE INDEX IF NOT EXISTS "hizli_erisim_sayfalar_sayfaUrl_key" ON "hizli_erisim_sayfalar"("sayfaUrl");

-- =================================================================

-- Bu tablo, her bir menüde gösterilecek linkleri içerir.
CREATE TABLE IF NOT EXISTS "hizli_erisim_ogeleri" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "hedefUrl" VARCHAR(255) NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "sayfaId" VARCHAR(255) NOT NULL,

    CONSTRAINT "hizli_erisim_ogeleri_pkey" PRIMARY KEY ("id")
);

-- İki tablo arasındaki ilişkiyi (foreign key) kuruyoruz.
-- Bir sayfa silindiğinde, ona bağlı olan tüm linklerin de silinmesini sağlar (ON DELETE CASCADE).
ALTER TABLE "hizli_erisim_ogeleri" DROP CONSTRAINT IF EXISTS "hizli_erisim_ogeleri_sayfaId_fkey"; -- Önce varsa eski constraint'i kaldır
ALTER TABLE "hizli_erisim_ogeleri" ADD CONSTRAINT "hizli_erisim_ogeleri_sayfaId_fkey" FOREIGN KEY ("sayfaId") REFERENCES "hizli_erisim_sayfalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

