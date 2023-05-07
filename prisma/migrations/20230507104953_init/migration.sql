/*
  Warnings:

  - You are about to drop the column `expiryStatus` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `expiryTime` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "expiryStatus",
DROP COLUMN "expiryTime";
