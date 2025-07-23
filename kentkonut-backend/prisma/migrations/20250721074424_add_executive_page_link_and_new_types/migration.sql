-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExecutiveType" ADD VALUE 'DEPARTMENT';
ALTER TYPE "ExecutiveType" ADD VALUE 'STRATEGY';
ALTER TYPE "ExecutiveType" ADD VALUE 'GOAL';

-- AlterTable
ALTER TABLE "executives" ADD COLUMN     "pageId" TEXT;

-- AddForeignKey
ALTER TABLE "executives" ADD CONSTRAINT "executives_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
