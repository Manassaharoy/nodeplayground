-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "accessToken" DROP NOT NULL,
ALTER COLUMN "accessTokenExpiresAt" DROP NOT NULL,
ALTER COLUMN "accessTokenExpiresAt" DROP DEFAULT,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "expiryTime" DROP NOT NULL,
ALTER COLUMN "expiryStatus" DROP NOT NULL,
ALTER COLUMN "client" DROP NOT NULL,
ALTER COLUMN "user" DROP NOT NULL;
