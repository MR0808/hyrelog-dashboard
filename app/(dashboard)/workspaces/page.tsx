import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import {
  isCompanyAdmin,
  listWorkspacesForCompany,
  listWorkspacesForUser
} from '@/lib/workspaces/queries';
import { WorkspacesContent } from '@/components/workspaces/list/WorkspacesContent';
import { CreateWorkspaceSheet } from '@/components/workspaces/list/CreateWorkspaceSheet';

export default async function WorkspacesPage() {
  const session = await requireDashboardAccess('/workspaces');

  const admin = isCompanyAdmin(session.userCompany.role);

  const workspaces = admin
    ? await listWorkspacesForCompany(session.company.id)
    : await listWorkspacesForUser(session.user.id);

  return (
    <WorkspacesContent
      workspaces={workspaces}
      isAdmin={admin}
      createButton={
        admin ? (
          <CreateWorkspaceSheet companyPreferredRegion={session.company.preferredRegion} />
        ) : null
      }
    />
  );
}
