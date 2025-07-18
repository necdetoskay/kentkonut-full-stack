/*
  Warnings:

  - You are about to drop the `quick_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "hafriyat_saha_durum" AS ENUM ('DEVAM_EDIYOR', 'TAMAMLANDI');

-- DropTable
DROP TABLE "quick_links";

-- CreateTable
CREATE TABLE "hafriyat_bolgeler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "yetkiliKisi" TEXT NOT NULL,
    "yetkiliTelefon" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_bolgeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_sahalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "konumAdi" TEXT NOT NULL,
    "enlem" DOUBLE PRECISION NOT NULL,
    "boylam" DOUBLE PRECISION NOT NULL,
    "durum" "hafriyat_saha_durum" NOT NULL DEFAULT 'DEVAM_EDIYOR',
    "ilerlemeyuzdesi" INTEGER NOT NULL DEFAULT 0,
    "tonBasiUcret" DECIMAL(65,30) NOT NULL,
    "kdvOrani" INTEGER NOT NULL DEFAULT 20,
    "bolgeId" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_sahalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_belge_kategorileri" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "ikon" TEXT NOT NULL DEFAULT 'document',
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_belge_kategorileri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_belgeler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "dosyaAdi" TEXT NOT NULL,
    "orjinalAd" TEXT NOT NULL,
    "dosyaTipi" TEXT NOT NULL,
    "boyut" INTEGER NOT NULL,
    "dosyaYolu" TEXT NOT NULL,
    "sahaId" TEXT NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_belgeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_resim_kategorileri" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "ikon" TEXT NOT NULL DEFAULT 'image',
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_resim_kategorileri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_resimler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT,
    "dosyaAdi" TEXT NOT NULL,
    "orjinalAd" TEXT,
    "dosyaYolu" TEXT NOT NULL,
    "altMetin" TEXT,
    "aciklama" TEXT,
    "sahaId" TEXT NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_resimler_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hafriyat_sahalar" ADD CONSTRAINT "hafriyat_sahalar_bolgeId_fkey" FOREIGN KEY ("bolgeId") REFERENCES "hafriyat_bolgeler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_belgeler" ADD CONSTRAINT "hafriyat_belgeler_sahaId_fkey" FOREIGN KEY ("sahaId") REFERENCES "hafriyat_sahalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_belgeler" ADD CONSTRAINT "hafriyat_belgeler_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "hafriyat_belge_kategorileri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_resimler" ADD CONSTRAINT "hafriyat_resimler_sahaId_fkey" FOREIGN KEY ("sahaId") REFERENCES "hafriyat_sahalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_resimler" ADD CONSTRAINT "hafriyat_resimler_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "hafriyat_resim_kategorileri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
