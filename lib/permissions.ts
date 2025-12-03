import { requireAuth } from './auth-server';
import { prisma } from './prisma';

// Note: Role type should match your Prisma schema
// Common roles: OWNER, ADMIN, MEMBER, VIEWER
export type Role = string;

/**
 * Get user's role for a company
 */
export async function getUserCompanyRole(companyId: string): Promise<Role | null> {
  const session = await requireAuth();
  
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      userId: session.user.id,
      companyId,
    },
    select: {
      role: true,
    },
  });

  return companyUser?.role as Role | null;
}

/**
 * Get user's role for a workspace
 */
export async function getUserWorkspaceRole(workspaceId: string): Promise<Role | null> {
  const session = await requireAuth();
  
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: {
      userId: session.user.id,
      workspaceId,
    },
    select: {
      role: true,
    },
  });

  return workspaceUser?.role as Role | null;
}

/**
 * Require a specific role for a company
 */
export async function requireCompanyRole(companyId: string, requiredRole: Role) {
  const role = await getUserCompanyRole(companyId);
  
  if (!role) {
    throw new Error('Access denied: Not a member of this company');
  }

  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };

  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    throw new Error(`Access denied: Requires ${requiredRole} role or higher`);
  }

  return role;
}

/**
 * Require a specific role for a workspace
 */
export async function requireWorkspaceRole(workspaceId: string, requiredRole: Role) {
  const role = await getUserWorkspaceRole(workspaceId);
  
  if (!role) {
    throw new Error('Access denied: Not a member of this workspace');
  }

  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };

  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    throw new Error(`Access denied: Requires ${requiredRole} role or higher`);
  }

  return role;
}

/**
 * Check if user can manage API keys
 */
export async function canManageApiKeys(companyId: string): Promise<boolean> {
  try {
    await requireCompanyRole(companyId, 'ADMIN');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user can manage company settings
 */
export async function canManageCompanySettings(companyId: string): Promise<boolean> {
  try {
    await requireCompanyRole(companyId, 'ADMIN');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user's companies
 */
export async function getUserCompanies() {
  const session = await requireAuth();
  
  const companyUsers = await prisma.companyUser.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return companyUsers.map((cu) => ({
    id: cu.company.id,
    name: cu.company.name,
    slug: cu.company.slug,
    role: cu.role,
  }));
}

