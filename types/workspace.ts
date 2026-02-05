import { listWorkspacesForCompany } from '@/actions/workspaces';
import type { WorkspaceRole } from '@/generated/prisma/client';

/** One workspace from listWorkspacesForCompany, with optional current-user role when available. */
export type Workspace = Awaited<ReturnType<typeof listWorkspacesForCompany>>[number] & {
  myWorkspaceRole?: WorkspaceRole;
};

export interface WorkspacesContentProps {
  workspaces: Workspace[];
  isAdmin: boolean;
}
