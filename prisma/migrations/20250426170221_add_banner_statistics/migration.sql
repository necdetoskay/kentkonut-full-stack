/*
  Warnings:

  - You are about to drop the column `active` on the `Banner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Banner_active_idx";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "active",
ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastClickedAt" TIMESTAMP(3),
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Statistics" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "referer" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "Banner_isActive_idx" ON "Banner"("isActive");
