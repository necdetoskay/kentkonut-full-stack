/*
  Warnings:

  - A unique constraint covering the columns `[ad,bolgeId]` on the table `hafriyat_sahalar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_sahalar_ad_bolgeId_key" ON "hafriyat_sahalar"("ad", "bolgeId");
