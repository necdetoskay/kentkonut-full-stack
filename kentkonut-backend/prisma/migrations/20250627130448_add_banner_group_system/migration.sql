/*
  Warnings:

  - You are about to drop the column `playMode` on the `banner_groups` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `banner_groups` table. All the data in the column will be lost.
  - The `animationType` column on the `banner_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `banner_statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `banners` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BannerAnimasyonTipi" AS ENUM ('SOLUKLESTIR', 'KAYDIR', 'YAKINLESTIR', 'CEVIR', 'ZIPLA');

-- DropForeignKey
ALTER TABLE "banner_statistics" DROP CONSTRAINT "banner_statistics_bannerId_fkey";

-- DropForeignKey
ALTER TABLE "banners" DROP CONSTRAINT "banners_groupId_fkey";

-- DropIndex
DROP INDEX "banner_groups_type_idx";

-- AlterTable
ALTER TABLE "banner_groups" DROP COLUMN "playMode",
DROP COLUMN "type",
ADD COLUMN     "mobileHeight" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "mobileWidth" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "tabletHeight" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "tabletWidth" INTEGER NOT NULL DEFAULT 800,
DROP COLUMN "animationType",
ADD COLUMN     "animationType" "BannerAnimasyonTipi" NOT NULL DEFAULT 'SOLUKLESTIR';

-- DropTable
DROP TABLE "banner_statistics";

-- DropTable
DROP TABLE "banners";
