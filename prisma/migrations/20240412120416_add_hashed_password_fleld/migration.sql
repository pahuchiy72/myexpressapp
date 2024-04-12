/*
  Warnings:

  - You are about to drop the column `nashedPassword` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "nashedPassword",
ADD COLUMN     "hashedPassword" TEXT;
