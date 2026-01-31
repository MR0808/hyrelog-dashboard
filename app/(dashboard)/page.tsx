import { DashboardHomeWithSession } from '@/components/dashboard/DashboardHomeWithSession';
import {
  mockProjects,
  mockMembers,
  mockBillingInfo
} from '@/lib/data/dashboard-mock';

export default function HomePage() {
  // Session (company, workspaces, isCompanyAdmin) comes from layout via context.
  // TODO: replace with real data from DB (projects, members, billingInfo)
  return (
    <DashboardHomeWithSession
      projects={mockProjects}
      members={mockMembers}
      billingInfo={mockBillingInfo}
    />
  );
}
