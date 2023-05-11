/*
  Warnings:

  - Added the required column `tokenAvailerId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "tokenAvailerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_tokenAvailerId_fkey" FOREIGN KEY ("tokenAvailerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
