/*
  Warnings:

  - You are about to drop the column `isActive` on the `Banner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Banner_isActive_idx";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "isActive",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Banner_active_idx" ON "Banner"("active");
