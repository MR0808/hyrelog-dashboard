import { isCompanyAdmin } from '@/actions/dashboard';
import { DashboardHomeWithSession } from '@/components/dashboard/DashboardHomeWithSession';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { mockProjects, mockMembers, mockBillingInfo } from '@/lib/data/dashboard-mock';

export default async function HomePage() {
  const session = await requireDashboardAccess('/');

  const role = session.userCompany.role;
  const admin = isCompanyAdmin(role);

  return (
    <DashboardHomeWithSession
      projects={mockProjects}
      members={mockMembers}
      billingInfo={mockBillingInfo}
    />
  );
}
