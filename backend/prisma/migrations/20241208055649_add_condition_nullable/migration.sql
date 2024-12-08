/*
  Warnings:

  - A unique constraint covering the columns `[mailAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Analysis" ALTER COLUMN "point" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "cancelDate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_mailAddress_key" ON "User"("mailAddress");
