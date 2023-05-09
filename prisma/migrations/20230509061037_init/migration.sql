/*
  Warnings:

  - The `additionalData` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "maritualStatus" TEXT,
DROP COLUMN "additionalData",
ADD COLUMN     "additionalData" JSONB;
