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
  /** Company name for empty state when member has no workspace access. */
  companyName?: string;
  /** When true, show dedicated empty state: "You're a member of <Company>, but you don't have workspace access yet." */
  memberWithNoWorkspaces?: boolean;
}
