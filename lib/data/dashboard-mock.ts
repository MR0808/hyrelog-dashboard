import type { User, Company, Workspace, Project, Member, BillingInfo } from '@/types/dashboard';

// Mock current user - change companyRole to test different views
export const mockUser: User = {
  id: 'user-1',
  email: 'john@company.com',
  firstName: 'John',
  lastName: 'Doe',
  companyRole: 'ADMIN' // Change to "MEMBER" to test workspace user view
};

export const mockCompany: Company = {
  id: 'company-1',
  name: 'Acme Inc.',
  slug: 'acme-inc',
  preferredRegion: 'us-east-1',
  planType: 'TRIAL',
  trialDaysRemaining: 12
};

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Production',
    slug: 'production',
    region: 'us-east-1',
    memberCount: 8,
    status: 'ACTIVE',
    companyId: 'company-1'
  },
  {
    id: 'ws-2',
    name: 'Staging',
    slug: 'staging',
    region: 'us-east-1',
    memberCount: 5,
    status: 'ACTIVE',
    companyId: 'company-1'
  },
  {
    id: 'ws-3',
    name: 'Development',
    slug: 'development',
    region: 'eu-west-1',
    memberCount: 12,
    status: 'ACTIVE',
    companyId: 'company-1'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Main API',
    slug: 'main-api',
    environment: 'production',
    workspaceId: 'ws-1'
  },
  {
    id: 'proj-2',
    name: 'Frontend App',
    slug: 'frontend-app',
    environment: 'production',
    workspaceId: 'ws-1'
  }
];

export const mockMembers: Member[] = [
  {
    id: 'member-1',
    email: 'john@company.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    status: 'ACTIVE',
    joinedAt: '2024-01-15'
  },
  {
    id: 'member-2',
    email: 'jane@company.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: '2024-02-20'
  },
  {
    id: 'member-3',
    email: 'bob@company.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'MEMBER',
    status: 'PENDING',
    joinedAt: '2024-03-10'
  }
];

export const mockBillingInfo: BillingInfo = {
  planName: 'Professional',
  nextInvoiceDate: '2024-04-15',
  amount: 99
};
