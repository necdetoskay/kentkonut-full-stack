/*
  Warnings:

  - The primary key for the `media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `thumbnailLarge` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailMedium` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailSmall` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `allowComments` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `canonicalUrl` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `headerImage` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `headerType` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `lastViewedAt` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `ogDescription` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `ogImage` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `ogTitle` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `ogType` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `pageType` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `showBreadcrumb` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `showInNavigation` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `showSidebar` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `showSocialShare` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `twitterCard` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `twitterDescription` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `twitterImage` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `twitterTitle` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `pages` table. All the data in the column will be lost.
  - The `metaKeywords` column on the `pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_gallery_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page_contents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page_sidebar_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page_statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_gallery_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `pages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExecutiveType" AS ENUM ('PRESIDENT', 'GENERAL_MANAGER', 'DIRECTOR', 'MANAGER');

-- CreateEnum
CREATE TYPE "CorporateContentType" AS ENUM ('VISION', 'MISSION', 'STRATEGY', 'GOALS');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_newsId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_authorId_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "news_gallery_items" DROP CONSTRAINT "news_gallery_items_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "news_gallery_items" DROP CONSTRAINT "news_gallery_items_newsId_fkey";

-- DropForeignKey
ALTER TABLE "news_relations" DROP CONSTRAINT "news_relations_newsId_fkey";

-- DropForeignKey
ALTER TABLE "news_relations" DROP CONSTRAINT "news_relations_relatedNewsId_fkey";

-- DropForeignKey
ALTER TABLE "news_tags" DROP CONSTRAINT "news_tags_newsId_fkey";

-- DropForeignKey
ALTER TABLE "news_tags" DROP CONSTRAINT "news_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "page_contents" DROP CONSTRAINT "page_contents_pageId_fkey";

-- DropForeignKey
ALTER TABLE "page_sidebar_links" DROP CONSTRAINT "page_sidebar_links_pageId_fkey";

-- DropForeignKey
ALTER TABLE "page_statistics" DROP CONSTRAINT "page_statistics_pageId_fkey";

-- DropForeignKey
ALTER TABLE "project_comments" DROP CONSTRAINT "project_comments_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_comments" DROP CONSTRAINT "project_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "project_gallery_items" DROP CONSTRAINT "project_gallery_items_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "project_gallery_items" DROP CONSTRAINT "project_gallery_items_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_relations" DROP CONSTRAINT "project_relations_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_relations" DROP CONSTRAINT "project_relations_relatedProjectId_fkey";

-- DropForeignKey
ALTER TABLE "project_tags" DROP CONSTRAINT "project_tags_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_tags" DROP CONSTRAINT "project_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_authorId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_mediaId_fkey";

-- DropIndex
DROP INDEX "pages_isActive_idx";

-- DropIndex
DROP INDEX "pages_pageType_idx";

-- DropIndex
DROP INDEX "pages_publishedAt_idx";

-- DropIndex
DROP INDEX "pages_showInNavigation_idx";

-- DropIndex
DROP INDEX "pages_slug_idx";

-- AlterTable
ALTER TABLE "media" DROP CONSTRAINT "media_pkey",
DROP COLUMN "thumbnailLarge",
DROP COLUMN "thumbnailMedium",
DROP COLUMN "thumbnailSmall",
DROP COLUMN "url",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "uploadedBy" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "originalName" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "media_id_seq";

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "allowComments",
DROP COLUMN "canonicalUrl",
DROP COLUMN "description",
DROP COLUMN "headerImage",
DROP COLUMN "headerType",
DROP COLUMN "lastViewedAt",
DROP COLUMN "ogDescription",
DROP COLUMN "ogImage",
DROP COLUMN "ogTitle",
DROP COLUMN "ogType",
DROP COLUMN "pageType",
DROP COLUMN "showBreadcrumb",
DROP COLUMN "showInNavigation",
DROP COLUMN "showSidebar",
DROP COLUMN "showSocialShare",
DROP COLUMN "subtitle",
DROP COLUMN "template",
DROP COLUMN "twitterCard",
DROP COLUMN "twitterDescription",
DROP COLUMN "twitterImage",
DROP COLUMN "twitterTitle",
DROP COLUMN "viewCount",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "imageUrl" TEXT,
DROP COLUMN "metaKeywords",
ADD COLUMN     "metaKeywords" TEXT[];

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "news";

-- DropTable
DROP TABLE "news_categories";

-- DropTable
DROP TABLE "news_gallery_items";

-- DropTable
DROP TABLE "news_relations";

-- DropTable
DROP TABLE "news_tags";

-- DropTable
DROP TABLE "page_contents";

-- DropTable
DROP TABLE "page_sidebar_links";

-- DropTable
DROP TABLE "page_statistics";

-- DropTable
DROP TABLE "project_comments";

-- DropTable
DROP TABLE "project_gallery_items";

-- DropTable
DROP TABLE "project_relations";

-- DropTable
DROP TABLE "project_tags";

-- DropTable
DROP TABLE "projects";

-- DropTable
DROP TABLE "tags";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "HeaderType";

-- DropEnum
DROP TYPE "PageTemplate";

-- DropEnum
DROP TYPE "PageType";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "SidebarLinkType";

-- CreateTable
CREATE TABLE "page_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "biography" TEXT,
    "imageUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedIn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "ExecutiveType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manager" TEXT,
    "imageUrl" TEXT,
    "services" TEXT[],
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_content" (
    "id" TEXT NOT NULL,
    "type" "CorporateContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_categories_slug_key" ON "page_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_content_type_key" ON "corporate_content"("type");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "media_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "page_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
