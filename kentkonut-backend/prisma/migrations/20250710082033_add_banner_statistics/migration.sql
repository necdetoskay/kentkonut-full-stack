-- CreateTable
CREATE TABLE "banner_statistics" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banner_statistics_bannerId_idx" ON "banner_statistics"("bannerId");

-- CreateIndex
CREATE INDEX "banner_statistics_type_idx" ON "banner_statistics"("type");

-- CreateIndex
CREATE INDEX "banner_statistics_createdAt_idx" ON "banner_statistics"("createdAt");

-- AddForeignKey
ALTER TABLE "banner_statistics" ADD CONSTRAINT "banner_statistics_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
