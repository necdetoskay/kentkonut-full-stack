/*
  Warnings:

  - You are about to drop the column `active` on the `banner_groups` table. All the data in the column will be lost.
  - You are about to drop the column `animation` on the `banner_groups` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `banner_groups` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "banner_groups_active_idx";

-- AlterTable
ALTER TABLE "banner_groups" DROP COLUMN "active",
DROP COLUMN "animation",
DROP COLUMN "duration",
ADD COLUMN     "animationType" TEXT NOT NULL DEFAULT 'FADE',
ADD COLUMN     "displayDuration" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "playMode" SET DEFAULT 'MANUAL',
ALTER COLUMN "transitionDuration" SET DEFAULT 0.5,
ALTER COLUMN "transitionDuration" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "banner_groups_isActive_idx" ON "banner_groups"("isActive");
