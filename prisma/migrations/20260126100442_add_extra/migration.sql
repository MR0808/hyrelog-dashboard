/*
  Warnings:

  - A unique constraint covering the columns `[providerId,accountId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InviteScope" AS ENUM ('COMPANY', 'WORKSPACE');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_countryId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_regionId_fkey";

-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "acceptedByEmail" TEXT,
ADD COLUMN     "acceptedIp" TEXT,
ADD COLUMN     "scope" "InviteScope" NOT NULL DEFAULT 'COMPANY';

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
