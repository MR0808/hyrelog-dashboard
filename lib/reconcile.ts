/**
 * Reconcile utilities: backfill apiCompanyId / apiWorkspaceId from HyreLog API
 * when dashboard has null (e.g. API was provisioned manually or from another path).
 */

import { prisma } from '@/lib/prisma';
import { isHyreLogApiConfigured, getCompany, getWorkspace } from '@/lib/hyrelog-api';

/**
 * Call GET /dashboard/companies/:id. If API returns exists: true and dashboard company
 * has apiCompanyId null, backfill apiCompanyId (and optionally dataRegion) from response.
 */
export async function reconcileCompany(
  dashboardCompanyId: string
): Promise<{ ok: true; apiCompanyId: string } | { ok: false; error: string }> {
  if (!isHyreLogApiConfigured()) {
    return { ok: false, error: 'HyreLog API not configured' };
  }

  const company = await prisma.company.findUnique({
    where: { id: dashboardCompanyId },
    select: { id: true, apiCompanyId: true },
  });
  if (!company) return { ok: false, error: 'Company not found' };
  if (company.apiCompanyId) return { ok: true, apiCompanyId: company.apiCompanyId };

  try {
    const res = await getCompany(dashboardCompanyId);
    if (!res.exists || !res.apiCompanyId) {
      return { ok: false, error: 'Company not found in API (exists: false)' };
    }
    await prisma.company.update({
      where: { id: company.id },
      data: { apiCompanyId: res.apiCompanyId },
    });
    return { ok: true, apiCompanyId: res.apiCompanyId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

/**
 * Call GET /dashboard/workspaces/:id. If API returns exists: true and dashboard workspace
 * has apiWorkspaceId null, backfill apiWorkspaceId from response.
 */
export async function reconcileWorkspace(
  dashboardWorkspaceId: string
): Promise<{ ok: true; apiWorkspaceId: string } | { ok: false; error: string }> {
  if (!isHyreLogApiConfigured()) {
    return { ok: false, error: 'HyreLog API not configured' };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: dashboardWorkspaceId },
    select: { id: true, apiWorkspaceId: true },
  });
  if (!workspace) return { ok: false, error: 'Workspace not found' };
  if (workspace.apiWorkspaceId) return { ok: true, apiWorkspaceId: workspace.apiWorkspaceId };

  try {
    const res = await getWorkspace(dashboardWorkspaceId);
    if (!res.exists || !res.apiWorkspaceId) {
      return { ok: false, error: 'Workspace not found in API (exists: false)' };
    }
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { apiWorkspaceId: res.apiWorkspaceId },
    });
    return { ok: true, apiWorkspaceId: res.apiWorkspaceId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
