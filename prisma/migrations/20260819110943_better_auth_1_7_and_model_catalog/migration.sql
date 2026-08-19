-- CreateEnum
CREATE TYPE "ModelProvider" AS ENUM ('OPENROUTER', 'ANTHROPIC', 'GOOGLE', 'OPENAI');

-- CreateEnum
CREATE TYPE "ModelStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "CredentialSource" AS ENUM ('PLATFORM', 'BYOK');

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
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "family" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelRoute" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "provider" "ModelProvider" NOT NULL,
    "providerModelId" TEXT NOT NULL,
    "inputPricePerM" DECIMAL(12,4),
    "outputPricePerM" DECIMAL(12,4),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "contextWindow" INTEGER,
    "maxOutputTokens" INTEGER,
    "platformEnabled" BOOLEAN NOT NULL DEFAULT false,
    "byokEnabled" BOOLEAN NOT NULL DEFAULT true,
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
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE INDEX "Model_authorName_idx" ON "Model"("authorName");

-- CreateIndex
CREATE INDEX "ModelRoute_modelId_status_idx" ON "ModelRoute"("modelId", "status");

-- CreateIndex
CREATE INDEX "ModelRoute_provider_status_idx" ON "ModelRoute"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ModelRoute_provider_providerModelId_key" ON "ModelRoute"("provider", "providerModelId");

-- CreateIndex
CREATE INDEX "UserProviderKey_userId_idx" ON "UserProviderKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProviderKey_userId_provider_key" ON "UserProviderKey"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "UserProviderKey_userId_fingerprint_key" ON "UserProviderKey"("userId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account"("issuer", "accountId");

-- AddForeignKey
ALTER TABLE "ModelRoute" ADD CONSTRAINT "ModelRoute_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProviderKey" ADD CONSTRAINT "UserProviderKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

