'use client';

import { createContext, use } from 'react';
import type { User, Company, Workspace } from '@/types/dashboard';
import type { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';

export type DashboardSessionPayload = {
  /** Raw session from better-auth (user, company, userCompany). */
  session: Awaited<ReturnType<typeof requireDashboardAccess>>;
  user: User;
  company: Company;
  workspaces: Workspace[];
  isCompanyAdmin: boolean;
};

const DashboardSessionContext = createContext<DashboardSessionPayload | null>(null);

export { DashboardSessionContext };

export function DashboardSessionProvider({
  value,
  children
}: {
  value: DashboardSessionPayload;
  children: React.ReactNode;
}) {
  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

/**
 * Read the dashboard session from layout context.
 * Use in client components under the dashboard layout (context is client-only).
 * Server pages: pass data to a client component that calls this hook, or call requireDashboardAccess().
 */
export function useDashboardSession(): DashboardSessionPayload {
  const payload = use(DashboardSessionContext);
  if (payload == null) {
    throw new Error('useDashboardSession must be used under the dashboard layout');
  }
  return payload;
}
