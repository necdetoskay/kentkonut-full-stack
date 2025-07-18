-- AlterEnum
ALTER TYPE "CorporateContentType" ADD VALUE 'ABOUT';

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "target" TEXT NOT NULL DEFAULT '_self',
    "cssClass" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "menuLocation" TEXT NOT NULL DEFAULT 'main',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_access_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'link',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moduleType" TEXT NOT NULL,
    "pageId" TEXT,
    "newsId" INTEGER,
    "projectId" INTEGER,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_access_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_slug_key" ON "menu_items"("slug");

-- CreateIndex
CREATE INDEX "menu_items_menuLocation_idx" ON "menu_items"("menuLocation");

-- CreateIndex
CREATE INDEX "menu_items_orderIndex_idx" ON "menu_items"("orderIndex");

-- CreateIndex
CREATE INDEX "menu_items_parentId_idx" ON "menu_items"("parentId");

-- CreateIndex
CREATE INDEX "menu_items_isActive_idx" ON "menu_items"("isActive");

-- CreateIndex
CREATE INDEX "menu_permissions_menuItemId_idx" ON "menu_permissions"("menuItemId");

-- CreateIndex
CREATE INDEX "menu_permissions_role_idx" ON "menu_permissions"("role");

-- CreateIndex
CREATE INDEX "quick_access_links_moduleType_idx" ON "quick_access_links"("moduleType");

-- CreateIndex
CREATE INDEX "quick_access_links_pageId_idx" ON "quick_access_links"("pageId");

-- CreateIndex
CREATE INDEX "quick_access_links_newsId_idx" ON "quick_access_links"("newsId");

-- CreateIndex
CREATE INDEX "quick_access_links_projectId_idx" ON "quick_access_links"("projectId");

-- CreateIndex
CREATE INDEX "quick_access_links_departmentId_idx" ON "quick_access_links"("departmentId");

-- CreateIndex
CREATE INDEX "quick_access_links_sortOrder_idx" ON "quick_access_links"("sortOrder");

-- CreateIndex
CREATE INDEX "quick_access_links_isActive_idx" ON "quick_access_links"("isActive");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
