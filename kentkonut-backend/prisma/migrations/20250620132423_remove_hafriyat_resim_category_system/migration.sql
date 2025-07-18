/*
  Warnings:

  - You are about to drop the column `kategoriId` on the `hafriyat_resimler` table. All the data in the column will be lost.
  - You are about to drop the `hafriyat_resim_kategorileri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "hafriyat_resimler" DROP CONSTRAINT "hafriyat_resimler_kategoriId_fkey";

-- AlterTable
ALTER TABLE "hafriyat_resimler" DROP COLUMN "kategoriId";

-- DropTable
DROP TABLE "hafriyat_resim_kategorileri";
