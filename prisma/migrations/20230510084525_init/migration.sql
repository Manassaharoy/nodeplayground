-- DropIndex
DROP INDEX "Token_userId_key";

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "userId" DROP NOT NULL;
