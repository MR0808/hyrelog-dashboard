import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { listCompanyMembers } from '@/actions/members';
import { listCompanyInvites } from '@/actions/invites';
import { listWorkspacesForCompany } from '@/lib/workspaces/queries';
import { CompanyMembersContent } from '@/components/company/CompanyMembersContent';

export default async function CompanyMembersPage() {
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as {
    company: { id: string; slug: string };
    userCompany: { role: string };
  };
  const companyId = sessionWithCompany.company.id;
  const companySlug = sessionWithCompany.company.slug;
  const isCompanyOwnerAdmin = ['OWNER', 'ADMIN'].includes(sessionWithCompany.userCompany?.role ?? '');
  const isCompanyOwner = sessionWithCompany.userCompany?.role === 'OWNER';
  const [membersResult, invitesResult, workspaces] = await Promise.all([
    listCompanyMembers(companyId),
    listCompanyInvites(companyId),
    isCompanyOwnerAdmin ? listWorkspacesForCompany(companyId) : Promise.resolve([])
  ]);

  if (!membersResult.ok) {
    return (
      <div className="p-4">
        <p className="text-destructive">{membersResult.error}</p>
      </div>
    );
  }

  const invites = invitesResult.ok ? invitesResult.invites : [];

  return (
    <CompanyMembersContent
      companyId={companyId}
      companySlug={companySlug}
      members={membersResult.members}
      invites={invites}
      workspaces={workspaces.map((w) => ({ id: w.id, name: w.name, slug: w.slug }))}
      currentUserId={session.user.id}
      isCompanyOwnerAdmin={isCompanyOwnerAdmin}
      isCompanyOwner={isCompanyOwner}
    />
  );
}
