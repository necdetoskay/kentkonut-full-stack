-- CreateEnum
CREATE TYPE "FooterSectionType" AS ENUM ('LINKS', 'IMAGE', 'CONTACT', 'TEXT', 'LEGAL');

-- CreateEnum
CREATE TYPE "FooterOrientation" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- CreateEnum
CREATE TYPE "FooterItemType" AS ENUM ('LINK', 'EMAIL', 'PHONE', 'ADDRESS', 'IMAGE', 'TEXT');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "blok_daire_sayisi" TEXT,
ADD COLUMN     "yil" TEXT;

-- CreateTable
CREATE TABLE "site_ayarlari" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_ayarlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_kolonlari" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_kolonlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_linkleri" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "columnId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_linkleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "type" "FooterSectionType" NOT NULL,
    "orientation" "FooterOrientation" NOT NULL DEFAULT 'VERTICAL',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "layoutConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_items" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "FooterItemType" NOT NULL,
    "label" TEXT,
    "url" TEXT,
    "target" TEXT DEFAULT '_self',
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "imageUrl" TEXT,
    "text" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_ayarlari_key_key" ON "site_ayarlari"("key");

-- CreateIndex
CREATE UNIQUE INDEX "footer_kolonlari_title_key" ON "footer_kolonlari"("title");

-- CreateIndex
CREATE UNIQUE INDEX "footer_sections_key_key" ON "footer_sections"("key");

-- CreateIndex
CREATE INDEX "footer_sections_order_idx" ON "footer_sections"("order");

-- CreateIndex
CREATE INDEX "footer_items_sectionId_order_idx" ON "footer_items"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "footer_linkleri" ADD CONSTRAINT "footer_linkleri_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "footer_kolonlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_items" ADD CONSTRAINT "footer_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "footer_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
