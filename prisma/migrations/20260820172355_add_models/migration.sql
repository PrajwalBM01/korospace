/*
  Warnings:

  - A unique constraint covering the columns `[issuer,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuer` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModelProvider" AS ENUM ('OPENROUTER', 'ANTHROPIC', 'GOOGLE', 'OPENAI');

-- CreateEnum
CREATE TYPE "ModelStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PAID');

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "issuer" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
ADD COLUMN     "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "ModelRoute" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "description" TEXT,
    "provider" "ModelProvider" NOT NULL,
    "inputPricePerM" DECIMAL(12,4),
    "outputPricePerM" DECIMAL(12,4),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "contextWindow" INTEGER,
    "maxOutputTokens" INTEGER,
    "platformEnabled" BOOLEAN NOT NULL DEFAULT false,
    "byokEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "ModelStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProviderKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ModelProvider" NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserProviderKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelRoute_modelName_key" ON "ModelRoute"("modelName");

-- CreateIndex
CREATE INDEX "ModelRoute_modelId_status_idx" ON "ModelRoute"("modelId", "status");

-- CreateIndex
CREATE INDEX "ModelRoute_provider_status_idx" ON "ModelRoute"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ModelRoute_provider_modelId_key" ON "ModelRoute"("provider", "modelId");

-- CreateIndex
CREATE INDEX "UserProviderKey_userId_idx" ON "UserProviderKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProviderKey_userId_provider_key" ON "UserProviderKey"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "UserProviderKey_userId_fingerprint_key" ON "UserProviderKey"("userId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account"("issuer", "accountId");

-- AddForeignKey
ALTER TABLE "UserProviderKey" ADD CONSTRAINT "UserProviderKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
