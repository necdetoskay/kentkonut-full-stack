-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('ABOUT', 'SERVICES', 'CONTACT', 'CUSTOM');

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "pageType" "PageType" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN     "showInNavigation" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "pages_pageType_idx" ON "pages"("pageType");

-- CreateIndex
CREATE INDEX "pages_showInNavigation_idx" ON "pages"("showInNavigation");
