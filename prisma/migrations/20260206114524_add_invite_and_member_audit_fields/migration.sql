-- AlterTable
ALTER TABLE "company_members" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT;

-- AlterTable: add nullable first for backfill
ALTER TABLE "invites" ADD COLUMN     "emailNormalized" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedByUserId" TEXT;

-- Backfill emailNormalized from email (lowercased, trimmed)
UPDATE "invites" SET "emailNormalized" = LOWER(TRIM("email")) WHERE "emailNormalized" IS NULL;

-- Make emailNormalized required
ALTER TABLE "invites" ALTER COLUMN "emailNormalized" SET NOT NULL;

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "invites_emailNormalized_idx" ON "invites"("emailNormalized");

-- CreateIndex
CREATE INDEX "invites_companyId_emailNormalized_idx" ON "invites"("companyId", "emailNormalized");

-- CreateIndex
CREATE INDEX "invites_workspaceId_emailNormalized_idx" ON "invites"("workspaceId", "emailNormalized");

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
