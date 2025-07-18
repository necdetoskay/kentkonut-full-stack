/*
  Warnings:

  - You are about to drop the column `description` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `manager` on the `departments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[directorId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `executives` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PersonnelType" AS ENUM ('DIRECTOR', 'CHIEF');

-- CreateEnum
CREATE TYPE "GalleryItemType" AS ENUM ('IMAGE', 'DOCUMENT', 'PDF', 'WORD');

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "description",
DROP COLUMN "manager",
ADD COLUMN     "content" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "directorId" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "executives" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "personnel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "slug" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "PersonnelType" NOT NULL DEFAULT 'CHIEF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_gallery" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" "GalleryItemType" NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'link',
    "departmentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_quick_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentChiefs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_slug_key" ON "personnel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentChiefs_AB_unique" ON "_DepartmentChiefs"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentChiefs_B_index" ON "_DepartmentChiefs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "departments_directorId_key" ON "departments"("directorId");

-- CreateIndex
CREATE UNIQUE INDEX "executives_slug_key" ON "executives"("slug");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_gallery" ADD CONSTRAINT "personnel_gallery_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_gallery" ADD CONSTRAINT "personnel_gallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_quick_links" ADD CONSTRAINT "department_quick_links_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentChiefs" ADD CONSTRAINT "_DepartmentChiefs_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentChiefs" ADD CONSTRAINT "_DepartmentChiefs_B_fkey" FOREIGN KEY ("B") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
