-- CreateIndex
CREATE INDEX "invites_status_idx" ON "invites"("status");

-- CreateIndex
CREATE INDEX "invites_companyRefId_status_idx" ON "invites"("companyRefId", "status");

-- CreateIndex
CREATE INDEX "invites_workspaceRefId_status_idx" ON "invites"("workspaceRefId", "status");
