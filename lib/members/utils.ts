import type { CompanyRole, WorkspaceRole } from '@/generated/prisma/client';

/**
 * Normalize email for storage and comparison: lowercase, trim.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Company role order: higher index = higher privilege (OWNER > ADMIN > BILLING > MEMBER) */
const COMPANY_ROLE_ORDER: CompanyRole[] = ['MEMBER', 'BILLING', 'ADMIN', 'OWNER'];

/** Workspace role order: higher index = higher privilege */
const WORKSPACE_ROLE_ORDER: WorkspaceRole[] = ['READER', 'WRITER', 'ADMIN'];

export function companyRoleLevel(role: CompanyRole): number {
  const i = COMPANY_ROLE_ORDER.indexOf(role);
  return i === -1 ? 0 : i;
}

export function workspaceRoleLevel(role: WorkspaceRole): number {
  const i = WORKSPACE_ROLE_ORDER.indexOf(role);
  return i === -1 ? 0 : i;
}

/** True if inviteRole is strictly higher than existingRole (company). */
export function isCompanyRoleUpgrade(existingRole: CompanyRole, inviteRole: CompanyRole): boolean {
  return companyRoleLevel(inviteRole) > companyRoleLevel(existingRole);
}

/** True if inviteRole is strictly higher than existingRole (workspace). */
export function isWorkspaceRoleUpgrade(
  existingRole: WorkspaceRole,
  inviteRole: WorkspaceRole
): boolean {
  return workspaceRoleLevel(inviteRole) > workspaceRoleLevel(existingRole);
}
