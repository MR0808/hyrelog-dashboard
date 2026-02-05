import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import {
  isCompanyAdmin,
  listWorkspacesForCompany,
  listWorkspacesForUser
} from '@/actions/workspaces';
import { WorkspacesContent } from '@/components/workspaces/list/WorkspacesContent';

export default async function WorkspacesPage() {
  const session = await requireDashboardAccess('/workspaces');

  const admin = await isCompanyAdmin(session.userCompany.role);

  const workspaces = admin
    ? await listWorkspacesForCompany(session.company.id)
    : await listWorkspacesForUser(session.user.id);

  return (
    <WorkspacesContent
      workspaces={workspaces}
      isAdmin={admin}
    />
  );
}
