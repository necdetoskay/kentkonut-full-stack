/*
  Warnings:

  - The `playMode` column on the `BannerGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `animation` column on the `BannerGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PlayMode" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "AnimationType" AS ENUM ('FADE', 'SLIDE', 'ZOOM');

-- AlterTable
ALTER TABLE "BannerGroup" DROP COLUMN "playMode",
ADD COLUMN     "playMode" "PlayMode" NOT NULL DEFAULT 'MANUAL',
DROP COLUMN "animation",
ADD COLUMN     "animation" "AnimationType" NOT NULL DEFAULT 'FADE';
