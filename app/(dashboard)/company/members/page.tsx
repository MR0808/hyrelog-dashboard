import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { listCompanyMembers } from '@/actions/members';
import { CompanyMembersContent } from '@/components/company/CompanyMembersContent';

export default async function CompanyMembersPage() {
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as { company: { id: string } };
  const result = await listCompanyMembers(sessionWithCompany.company.id);

  if (!result.ok) {
    return (
      <div className="p-4">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <CompanyMembersContent
      companyId={sessionWithCompany.company.id}
      members={result.members}
      currentUserId={session.user.id}
      isCompanyOwnerAdmin={['OWNER', 'ADMIN'].includes((session as any).userCompany?.role)}
    />
  );
}
