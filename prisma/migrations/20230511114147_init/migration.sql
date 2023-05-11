-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_tokenAvailerId_fkey";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_tokenAvailerId_fkey" FOREIGN KEY ("tokenAvailerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
