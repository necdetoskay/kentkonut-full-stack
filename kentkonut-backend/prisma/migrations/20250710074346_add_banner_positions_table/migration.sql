-- AlterTable
ALTER TABLE "banner_groups" ADD COLUMN     "usageType" TEXT;

-- CreateTable
CREATE TABLE "banner_positions" (
    "id" SERIAL NOT NULL,
    "positionUUID" VARCHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerGroupId" INTEGER,
    "fallbackGroupId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banner_positions_positionUUID_key" ON "banner_positions"("positionUUID");

-- CreateIndex
CREATE INDEX "banner_positions_positionUUID_idx" ON "banner_positions"("positionUUID");

-- CreateIndex
CREATE INDEX "banner_positions_isActive_idx" ON "banner_positions"("isActive");

-- CreateIndex
CREATE INDEX "banner_groups_usageType_idx" ON "banner_groups"("usageType");

-- AddForeignKey
ALTER TABLE "banner_positions" ADD CONSTRAINT "banner_positions_bannerGroupId_fkey" FOREIGN KEY ("bannerGroupId") REFERENCES "banner_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_positions" ADD CONSTRAINT "banner_positions_fallbackGroupId_fkey" FOREIGN KEY ("fallbackGroupId") REFERENCES "banner_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
