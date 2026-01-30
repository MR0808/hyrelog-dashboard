import { DashboardHomeContent } from '@/components/dashboard/DashboardHomeContent';
import {
  mockUser,
  mockCompany,
  mockWorkspaces,
  mockProjects,
  mockMembers,
  mockBillingInfo
} from '@/lib/data/dashboard-mock';

export default function HomePage() {
  // Server component - fetch data here in production
  // For now using mock data

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
