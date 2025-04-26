/*
  Warnings:

  - The `playMode` column on the `BannerGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `animation` column on the `BannerGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BannerGroup" DROP COLUMN "playMode",
ADD COLUMN     "playMode" TEXT NOT NULL DEFAULT 'MANUAL',
DROP COLUMN "animation",
ADD COLUMN     "animation" TEXT NOT NULL DEFAULT 'FADE';
