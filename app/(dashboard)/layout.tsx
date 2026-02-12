import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardSessionProvider } from '@/lib/dashboard/session-context';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { prisma } from '@/lib/prisma';
import { getCompanyAccess } from '@/lib/workspaces/access';
import { listWorkspacesForCompany, listWorkspacesForUser } from '@/lib/workspaces/queries';
import type { User, Company, Workspace } from '@/types/dashboard';
import { SubscriptionStatus } from '@/generated/prisma/client';

function trialDaysRemainingFrom(trialEndsAt: Date | null | undefined): number | undefined {
  if (trialEndsAt == null) return undefined;
  const now = Date.now();
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - now) / (24 * 60 * 60 * 1000)));
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  const session = await requireDashboardAccess(pathname);
  if (!session.company) redirect('/invites');

  const [access, companyWithSub] = await Promise.all([
    getCompanyAccess(session.user.id, session.company.id),
    prisma.company.findUnique({
      where: { id: session.company.id },
      select: {
        preferredRegion: true,
        subscription: {
          select: {
            status: true,
            trialEndsAt: true
          }
        }
      }
    })
  ]);

  if (!access) redirect('/invites');

  const seeAllWorkspaces = access.canAdmin || access.canBilling;
  const workspacesRows = seeAllWorkspaces
    ? await listWorkspacesForCompany(session.company.id)
    : await listWorkspacesForUser(session.user.id);

  const user: User = {
    id: session.user.id,
    email: session.user.email ?? '',
    firstName: (session.user as { firstName?: string }).firstName ?? '',
    lastName: (session.user as { lastName?: string }).lastName ?? '',
    companyRole: session.userCompany.role,
    platformRole: (session.user as { platformRole?: User['platformRole'] }).platformRole ?? null
  };

  const sub = companyWithSub?.subscription;
  const planType: Company['planType'] =
    sub?.status === SubscriptionStatus.TRIALING
      ? 'TRIAL'
      : sub?.status === SubscriptionStatus.ACTIVE
        ? 'ACTIVE'
        : 'INACTIVE';

  const company: Company = {
    id: session.company.id,
    name: session.company.name,
    slug: session.company.slug,
    preferredRegion: (
      session.company.preferredRegion ??
      companyWithSub?.preferredRegion ??
      'APAC'
    ).toString(),
    planType,
    trialDaysRemaining: trialDaysRemainingFrom(sub?.trialEndsAt)
  };

  const workspaces: Workspace[] = workspacesRows.map((w) => ({
    id: w.id,
    name: w.name,
    slug: w.slug,
    region: (w.preferredRegion ?? 'APAC').toString(),
    memberCount: w._count.members,
    status: ((w as { status?: string }).status ?? 'ACTIVE') as Workspace['status'],
    companyId: session.company.id
  }));

  const isCompanyAdmin = seeAllWorkspaces;

  const sessionPayload = {
    session,
    user,
    company,
    workspaces,
    isCompanyAdmin
  };

  return (
    <DashboardSessionProvider value={sessionPayload}>
      <DashboardShell
        user={user}
        company={company}
        workspaces={workspaces}
        isCompanyAdmin={isCompanyAdmin}
        pathname={pathname}
      >
        {children}
      </DashboardShell>
    </DashboardSessionProvider>
  );
}
