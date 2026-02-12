import type { CompanyRole, WorkspaceRole } from '@/generated/prisma/client';

export type EffectiveWorkspaceRole = WorkspaceRole; // ADMIN | WRITER | READER

/**
 * Company OWNER or ADMIN (full company-level access).
 */
export function isCompanyOwnerOrAdmin(companyRole: CompanyRole): boolean {
  return companyRole === 'OWNER' || companyRole === 'ADMIN';
}

/**
 * Company BILLING (read-only at workspace level).
 */
export function isCompanyBilling(companyRole: CompanyRole): boolean {
  return companyRole === 'BILLING';
}

/**
 * Effective workspace role for UI and action checks.
 * - Company OWNER/ADMIN => Workspace ADMIN
 * - Company BILLING => READER
 * - Company MEMBER => workspaceMembership.role (MEMBER with no membership has no access; use getEffectiveWorkspaceAccess for that)
 */
export function effectiveWorkspaceRole(
  companyRole: CompanyRole,
  workspaceMemberRole: WorkspaceRole | null
): EffectiveWorkspaceRole {
  if (companyRole === 'OWNER' || companyRole === 'ADMIN') return 'ADMIN';
  if (companyRole === 'BILLING') return 'READER';
  return workspaceMemberRole ?? 'READER';
}

/**
 * Can create/edit projects (ADMIN or WRITER).
 */
export function canWorkspaceWrite(effectiveRole: EffectiveWorkspaceRole): boolean {
  return effectiveRole === 'ADMIN' || effectiveRole === 'WRITER';
}

/**
 * Can manage settings, members, delete projects (ADMIN only).
 */
export function canWorkspaceAdmin(effectiveRole: EffectiveWorkspaceRole): boolean {
  return effectiveRole === 'ADMIN';
}

/**
 * Can view workspace, projects, keys (all effective roles).
 */
export function canWorkspaceRead(_effectiveRole: EffectiveWorkspaceRole): boolean {
  return true;
}
