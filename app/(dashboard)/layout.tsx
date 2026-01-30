import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { mockUser, mockCompany, mockWorkspaces } from '@/lib/data/dashboard-mock';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server component - fetch data here in production
  // For now using mock data

  const isCompanyAdmin = ['OWNER', 'ADMIN', 'BILLING'].includes(mockUser.companyRole);

  return (
    <DashboardShell
      user={mockUser}
      company={mockCompany}
      workspaces={mockWorkspaces}
      isCompanyAdmin={isCompanyAdmin}
    >
      {children}
    </DashboardShell>
  );
}
