-- AlterTable
ALTER TABLE "executives" ADD COLUMN     "quickAccessUrl" TEXT;

-- CreateTable
CREATE TABLE "executive_quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "executiveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_quick_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "executive_quick_links" ADD CONSTRAINT "executive_quick_links_executiveId_fkey" FOREIGN KEY ("executiveId") REFERENCES "executives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
