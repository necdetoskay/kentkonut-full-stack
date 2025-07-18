/*
  Warnings:

  - A unique constraint covering the columns `[ad]` on the table `hafriyat_belge_kategorileri` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ad]` on the table `hafriyat_bolgeler` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ad]` on the table `hafriyat_resim_kategorileri` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_belge_kategorileri_ad_key" ON "hafriyat_belge_kategorileri"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_bolgeler_ad_key" ON "hafriyat_bolgeler"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_resim_kategorileri_ad_key" ON "hafriyat_resim_kategorileri"("ad");
