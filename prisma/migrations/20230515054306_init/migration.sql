/*
  Warnings:

  - You are about to drop the column `deleted` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `locked` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "deleted",
DROP COLUMN "locked";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;
