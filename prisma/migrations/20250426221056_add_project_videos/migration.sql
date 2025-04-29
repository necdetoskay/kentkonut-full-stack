/*
  Warnings:

  - You are about to drop the column `clickCount` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `lastClickedAt` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `lastViewedAt` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Statistics` table. All the data in the column will be lost.
  - You are about to drop the column `referer` on the `Statistics` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Statistics` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "clickCount",
DROP COLUMN "lastClickedAt",
DROP COLUMN "lastViewedAt",
DROP COLUMN "viewCount";

-- AlterTable
ALTER TABLE "Statistics" DROP COLUMN "ipAddress",
DROP COLUMN "referer",
DROP COLUMN "userAgent";

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "features" JSONB,
    "details" JSONB,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "completionDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVideo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_isActive_idx" ON "Project"("isActive");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

-- CreateIndex
CREATE INDEX "ProjectVideo_projectId_idx" ON "ProjectVideo"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVideo" ADD CONSTRAINT "ProjectVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
