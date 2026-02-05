// lib/dashboard/queries.ts
import { prisma } from '@/lib/prisma';
import type { CompanyRole } from '@/generated/prisma/client';

const ADMIN_ROLES: CompanyRole[] = ['OWNER', 'ADMIN', 'BILLING'];

export function isCompanyAdmin(role: CompanyRole) {
  return ADMIN_ROLES.includes(role);
}

// Company admin dashboard data
export async function getCompanyDashboardData(companyId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: { companyId, deletedAt: null },
    orderBy: [{ name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      preferredRegion: true,
      _count: { select: { members: true } }
    }
  });

  const memberCount = await prisma.companyMember.count({
    where: { companyId }
  });

  const pendingInvites = await prisma.invite.count({
    where: { companyId, status: 'PENDING' }
  });

  return { workspaces, memberCount, pendingInvites };
}

// Workspace user dashboard data (default workspace alphabetically)
export async function getWorkspaceUserDashboardData(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId, workspace: { deletedAt: null } },
    select: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          preferredRegion: true,
          company: { select: { name: true } },
          _count: { select: { members: true } }
        }
      }
    }
  });

  const workspaces = memberships
    .map((m) => m.workspace)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  const defaultWorkspace = workspaces[0] ?? null;

  return { defaultWorkspace, workspaces };
}
