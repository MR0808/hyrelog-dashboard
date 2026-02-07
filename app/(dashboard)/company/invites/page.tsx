import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { listCompanyInvites } from '@/actions/invites';
import { CompanyInvitesContent } from '@/components/company/CompanyInvitesContent';

export default async function CompanyInvitesPage() {
  const session = await requireDashboardAccess('/company/invites');
  const sessionWithCompany = session as { company: { id: string }; userCompany: { role: string } };
  const result = await listCompanyInvites(sessionWithCompany.company.id);

  if (!result.ok) {
    return (
      <div className="p-4">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  const canManage = ['OWNER', 'ADMIN'].includes(sessionWithCompany.userCompany.role);

  return (
    <CompanyInvitesContent
      companyId={sessionWithCompany.company.id}
      invites={result.invites}
      canManage={canManage}
    />
  );
}
