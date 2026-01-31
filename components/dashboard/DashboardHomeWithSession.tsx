'use client';

import { DashboardHomeContent } from './DashboardHomeContent';
import { useDashboardSession } from '@/lib/dashboard/session-context';
import type { Project, Member, BillingInfo } from '@/types/dashboard';

interface DashboardHomeWithSessionProps {
  projects: Project[];
  members: Member[];
  billingInfo?: BillingInfo;
}

/**
 * Client wrapper that reads session from layout context and renders DashboardHomeContent.
 * Use this from dashboard pages (server components) so they can pass page-specific data
 * without re-fetching session.
 */
export function DashboardHomeWithSession({
  projects,
  members,
  billingInfo
}: DashboardHomeWithSessionProps) {
  const { company, workspaces, isCompanyAdmin } = useDashboardSession();

  return (
    <DashboardHomeContent
      company={company}
      workspaces={workspaces}
      projects={projects}
      members={members}
      billingInfo={billingInfo}
      isCompanyAdmin={isCompanyAdmin}
    />
  );
}
