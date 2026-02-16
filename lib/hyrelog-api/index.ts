/**
 * HyreLog API client — typed methods for dashboard contract.
 * Use from server actions only (requires HYRELOG_API_URL, DASHBOARD_SERVICE_TOKEN).
 */

import { hyrelogRequest, type ActorHeaders } from './client';
import type {
  ProvisionCompanyResponse,
  GetCompanyResponse,
  ProvisionWorkspaceResponse,
  GetWorkspaceResponse,
  SyncApiKeyResponse,
  RevokeKeyResponse,
  ArchiveWorkspaceResponse,
  RestoreWorkspaceResponse,
} from './types';

const DASHBOARD_PREFIX = '/dashboard';

export type { ActorHeaders } from './client';
export { isHyreLogApiConfigured, HyreLogApiError } from './client';
export type { ApiError } from './client';

/** Map dashboard DataRegion to API dataRegion (API has US, EU, UK, AU; no APAC) */
export function toApiDataRegion(preferredRegion: string): 'US' | 'EU' | 'UK' | 'AU' {
  const r = preferredRegion.toUpperCase();
  if (r === 'US' || r === 'EU' || r === 'UK' || r === 'AU') return r as 'US' | 'EU' | 'UK' | 'AU';
  if (r === 'APAC') return 'US';
  return 'US';
}

export async function provisionCompany(params: {
  dashboardCompanyId: string;
  slug: string;
  name: string;
  dataRegion: 'US' | 'EU' | 'UK' | 'AU';
  actor?: ActorHeaders;
}): Promise<ProvisionCompanyResponse> {
  const { data } = await hyrelogRequest<ProvisionCompanyResponse>(
    `${DASHBOARD_PREFIX}/companies`,
    { method: 'POST', body: params, actor: params.actor }
  );
  return data;
}

export async function getCompany(
  dashboardCompanyId: string,
  actor?: ActorHeaders
): Promise<GetCompanyResponse> {
  const { data } = await hyrelogRequest<GetCompanyResponse>(
    `${DASHBOARD_PREFIX}/companies/${encodeURIComponent(dashboardCompanyId)}`,
    { actor }
  );
  return data;
}

export async function provisionWorkspace(params: {
  dashboardWorkspaceId: string;
  dashboardCompanyId: string;
  slug: string;
  name: string;
  actor?: ActorHeaders;
}): Promise<ProvisionWorkspaceResponse> {
  const { data } = await hyrelogRequest<ProvisionWorkspaceResponse>(
    `${DASHBOARD_PREFIX}/workspaces`,
    { method: 'POST', body: params, actor: params.actor }
  );
  return data;
}

export async function getWorkspace(
  dashboardWorkspaceId: string,
  actor?: ActorHeaders
): Promise<GetWorkspaceResponse> {
  const { data } = await hyrelogRequest<GetWorkspaceResponse>(
    `${DASHBOARD_PREFIX}/workspaces/${encodeURIComponent(dashboardWorkspaceId)}`,
    { actor }
  );
  return data;
}

export async function syncApiKey(params: {
  dashboardKeyId: string;
  scope: 'ws';
  dashboardCompanyId: string;
  dashboardWorkspaceId: string;
  name: string;
  prefix: string;
  hash: string;
  revokedAt?: string | null;
  actor?: ActorHeaders;
}): Promise<SyncApiKeyResponse> {
  const body = {
    dashboardKeyId: params.dashboardKeyId,
    scope: params.scope,
    dashboardCompanyId: params.dashboardCompanyId,
    dashboardWorkspaceId: params.dashboardWorkspaceId,
    name: params.name,
    prefix: params.prefix,
    hash: params.hash,
    ...(params.revokedAt != null && { revokedAt: params.revokedAt }),
  };
  const { data } = await hyrelogRequest<SyncApiKeyResponse>(`${DASHBOARD_PREFIX}/api-keys`, {
    method: 'POST',
    body,
    actor: params.actor,
  });
  return data;
}

export async function revokeApiKey(
  dashboardKeyId: string,
  revokedAt: string,
  actor?: ActorHeaders
): Promise<RevokeKeyResponse> {
  const { data } = await hyrelogRequest<RevokeKeyResponse>(
    `${DASHBOARD_PREFIX}/api-keys/${encodeURIComponent(dashboardKeyId)}/revoke`,
    { method: 'POST', body: { revokedAt }, actor }
  );
  return data;
}

export async function archiveWorkspace(
  dashboardWorkspaceId: string,
  params: { archivedAt: string; revokeAllKeys?: boolean },
  actor?: ActorHeaders
): Promise<ArchiveWorkspaceResponse> {
  const { data } = await hyrelogRequest<ArchiveWorkspaceResponse>(
    `${DASHBOARD_PREFIX}/workspaces/${encodeURIComponent(dashboardWorkspaceId)}/archive`,
    { method: 'POST', body: { revokeAllKeys: true, ...params }, actor }
  );
  return data;
}

export async function restoreWorkspace(
  dashboardWorkspaceId: string,
  params: { restoredAt: string },
  actor?: ActorHeaders
): Promise<RestoreWorkspaceResponse> {
  const { data } = await hyrelogRequest<RestoreWorkspaceResponse>(
    `${DASHBOARD_PREFIX}/workspaces/${encodeURIComponent(dashboardWorkspaceId)}/restore`,
    { method: 'POST', body: params, actor }
  );
  return data;
}
