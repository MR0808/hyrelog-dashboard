import { listWorkspacesForCompany } from '@/lib/workspaces/queries';
import type { WorkspaceRole } from '@/generated/prisma/client';

/** One workspace from listWorkspacesForCompany, with optional current-user role when available. */
export type Workspace = Awaited<ReturnType<typeof listWorkspacesForCompany>>[number] & {
  myWorkspaceRole?: WorkspaceRole;
};

export interface WorkspacesContentProps {
  workspaces: Workspace[];
  isAdmin: boolean;
  /** When provided (e.g. CreateWorkspaceSheet for admins), rendered in the header. */
  createButton?: React.ReactNode;
}
