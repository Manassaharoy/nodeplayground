/*
  Warnings:

  - Made the column `accessToken` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accessTokenExpiresAt` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshTokenExpiresAt` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `client` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "accessTokenExpiresAt" SET NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL,
ALTER COLUMN "refreshTokenExpiresAt" SET NOT NULL,
ALTER COLUMN "client" SET NOT NULL,
ALTER COLUMN "user" SET NOT NULL;
