-- AlterEnum
ALTER TYPE "WorkspaceStatus" ADD VALUE 'ARCHIVED';

-- CreateTable
CREATE TABLE "workspace_api_keys" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_api_keys_workspaceId_idx" ON "workspace_api_keys"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_api_keys_workspaceId_name_key" ON "workspace_api_keys"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "workspace_api_keys" ADD CONSTRAINT "workspace_api_keys_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
