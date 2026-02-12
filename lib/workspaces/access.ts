import { prisma } from '@/lib/prisma';
import type { CompanyRole, WorkspaceRole } from '@/generated/prisma/client';

export type EffectiveWorkspaceAccess = {
  companyRole: CompanyRole;
  workspaceRole: WorkspaceRole | null;
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
};

/**
 * Single source of truth for workspace access. Resolve in this order:
 * 1. Fetch CompanyMember — if none → deny (null).
 * 2. If companyRole == OWNER → full admin access.
 * 3. If companyRole == ADMIN → full admin access.
 * 4. If companyRole == BILLING → read-only access.
 * 5. If companyRole == MEMBER: look for WorkspaceMember; if none → deny; else map WorkspaceRole (ADMIN→admin, WRITER→write, READER→read).
 * All server actions and loaders must use this helper. No inline RBAC.
 */
export async function getEffectiveWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<EffectiveWorkspaceAccess | null> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
    select: { id: true, companyId: true }
  });
  if (!workspace) return null;

  const companyMember = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId: workspace.companyId } },
    select: { role: true }
  });

  if (!companyMember) return null;

  const companyRole = companyMember.role as CompanyRole;

  if (companyRole === 'OWNER') {
    return {
      companyRole,
      workspaceRole: null,
      canRead: true,
      canWrite: true,
      canAdmin: true
    };
  }

  if (companyRole === 'ADMIN') {
    return {
      companyRole,
      workspaceRole: null,
      canRead: true,
      canWrite: true,
      canAdmin: true
    };
  }

  if (companyRole === 'BILLING') {
    return {
      companyRole,
      workspaceRole: null,
      canRead: true,
      canWrite: false,
      canAdmin: false
    };
  }

  if (companyRole === 'MEMBER') {
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      select: { role: true }
    });
    if (!workspaceMember) {
      return {
        companyRole,
        workspaceRole: null,
        canRead: false,
        canWrite: false,
        canAdmin: false
      };
    }
    const workspaceRole = workspaceMember.role as WorkspaceRole;
    const canAdmin = workspaceRole === 'ADMIN';
    const canWrite = workspaceRole === 'ADMIN' || workspaceRole === 'WRITER';
    const canRead = true;
    return {
      companyRole,
      workspaceRole,
      canRead,
      canWrite,
      canAdmin
    };
  }

  return null;
}

export type CompanyAccess = {
  companyRole: CompanyRole;
  canAdmin: boolean;
  canBilling: boolean;
  canMember: boolean;
};

/**
 * Resolve company-level access for a user.
 */
export async function getCompanyAccess(
  userId: string,
  companyId: string
): Promise<CompanyAccess | null> {
  const companyMember = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
    select: { role: true }
  });
  if (!companyMember) return null;

  const role = companyMember.role as CompanyRole;
  return {
    companyRole: role,
    canAdmin: role === 'OWNER' || role === 'ADMIN',
    canBilling: role === 'BILLING',
    canMember: role === 'MEMBER'
  };
}

/**
 * Require that the user is Company OWNER for the given company.
 * Returns the actor's CompanyMember row if they are OWNER; otherwise null.
 * Use for ownership-only operations (e.g. transfer ownership).
 */
export async function requireCompanyOwner(
  companyId: string,
  userId: string
): Promise<{ id: string; role: string } | null> {
  const companyMember = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
    select: { id: true, role: true }
  });
  if (!companyMember || companyMember.role !== 'OWNER') return null;
  return companyMember;
}
