import { DashboardHomeContent } from '@/components/dashboard/DashboardHomeContent';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import {
  mockUser,
  mockCompany,
  mockWorkspaces,
  mockProjects,
  mockMembers,
  mockBillingInfo
} from '@/lib/data/dashboard-mock';

export default async function HomePage() {
  // Server component - fetch data here in production
  // For now using mock data

  const session = await requireDashboardAccess('/');

  const isCompanyAdmin = ['OWNER', 'ADMIN', 'BILLING'].includes(mockUser.companyRole);

  return (
    <DashboardHomeContent
      company={mockCompany}
      workspaces={mockWorkspaces}
      projects={mockProjects}
      members={mockMembers}
      billingInfo={mockBillingInfo}
      isCompanyAdmin={isCompanyAdmin}
    />
  );
}
