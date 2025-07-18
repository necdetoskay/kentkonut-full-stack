/*
  Warnings:

  - You are about to drop the column `email` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `departments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "departments" DROP COLUMN "email",
DROP COLUMN "location",
DROP COLUMN "phone";
