-- CreateTable
CREATE TABLE "project_galleries" (
  "id" SERIAL NOT NULL,
  "projectId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "parentId" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "project_galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_gallery_items" (
  "id" SERIAL NOT NULL,
  "galleryId" INTEGER NOT NULL,
  "mediaId" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "project_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_galleries_projectId_idx" ON "project_galleries"("projectId");

-- CreateIndex
CREATE INDEX "project_galleries_parentId_idx" ON "project_galleries"("parentId");

-- CreateIndex
CREATE INDEX "project_gallery_items_galleryId_idx" ON "project_gallery_items"("galleryId");

-- CreateIndex
CREATE INDEX "project_gallery_items_mediaId_idx" ON "project_gallery_items"("mediaId");

-- AddForeignKey
ALTER TABLE "project_galleries" ADD CONSTRAINT "project_galleries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_galleries" ADD CONSTRAINT "project_galleries_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "project_galleries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "project_galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
