/**
 * API Client for HyreLog API
 * 
 * Server-only typed client for calling /dashboard/* endpoints.
 * Automatically adds dashboard service token and actor headers.
 */

import { getAuthContext, getSelectedCompanyId } from '../rbac';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const DASHBOARD_SERVICE_TOKEN = process.env.DASHBOARD_SERVICE_TOKEN;

if (!DASHBOARD_SERVICE_TOKEN) {
  throw new Error('DASHBOARD_SERVICE_TOKEN environment variable is required');
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
  archiveIds?: string[];
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Make API request with dashboard authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    companyId?: string; // Override selected company
    requireCompany?: boolean; // Require companyId (for company-scoped routes)
  } = {}
): Promise<T> {
  const { method = 'GET', body, companyId: overrideCompanyId, requireCompany = true } = options;

  const authContext = await getAuthContext();
  const selectedCompanyId = await getSelectedCompanyId();
  const finalCompanyId = overrideCompanyId || selectedCompanyId || authContext.companyId;

  if (requireCompany && !finalCompanyId) {
    throw new Error('Company ID required for this request');
  }

  const headers: Record<string, string> = {
    'x-dashboard-token': DASHBOARD_SERVICE_TOKEN,
    'x-user-id': authContext.userId,
    'x-user-email': authContext.userEmail,
    'x-user-role': authContext.userRole,
    'Content-Type': 'application/json',
  };

  if (finalCompanyId && options.requireCompany !== false) {
    headers['x-company-id'] = finalCompanyId;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiError;
    throw new ApiClientError(
      response.status,
      errorData.code || 'API_ERROR',
      errorData.error || `API request failed: ${response.statusText}`,
      errorData.details
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}

/**
 * API Client Methods
 */
export const apiClient = {
  // Company
  createCompany: (body: {
    name: string;
    dataRegion: 'US' | 'EU' | 'APAC';
    companySize?: string;
    industry?: string;
    useCase?: string;
  }) =>
    apiRequest<{
      id: string;
      name: string;
      dataRegion: string;
      planTier: string;
      createdAt: string;
    }>(`/dashboard/companies`, {
      method: 'POST',
      body,
      requireCompany: false, // No company yet when creating
    }),

  getCompany: (companyId: string) =>
    apiRequest<{
      id: string;
      name: string;
      dataRegion: string;
      plan: {
        id: string;
        name: string;
        tier: string;
        config: unknown;
      };
      createdAt: string;
    }>(`/dashboard/company`, { companyId }),

  // Events
  getEvents: (
    companyId: string,
    params?: {
      limit?: number;
      cursor?: string;
      from?: string;
      to?: string;
      category?: string;
      action?: string;
      projectId?: string;
      workspaceId?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.workspaceId) searchParams.set('workspaceId', params.workspaceId);

    const query = searchParams.toString();
    return apiRequest<{
      events: Array<{
        id: string;
        timestamp: string;
        category: string;
        action: string;
        actorId?: string;
        actorEmail?: string;
        actorRole?: string;
        resourceType?: string;
        resourceId?: string;
        metadata: unknown;
        traceId: string;
        ipAddress?: string;
        geo?: string;
        userAgent?: string;
      }>;
      nextCursor: string | null;
    }>(`/dashboard/events${query ? `?${query}` : ''}`, { companyId }),
  },

  // Exports
  createExport: (companyId: string, body: {
    source: 'HOT' | 'ARCHIVED' | 'HOT_AND_ARCHIVED';
    format: 'JSONL' | 'CSV';
    filters?: {
      from?: string;
      to?: string;
      category?: string;
      action?: string;
      workspaceId?: string;
      projectId?: string;
    };
    limit?: number;
  }) =>
    apiRequest<{
      jobId: string;
      status: string;
    }>(`/dashboard/exports`, {
      method: 'POST',
      companyId,
      body,
    }),

  getExport: (companyId: string, jobId: string) =>
    apiRequest<{
      id: string;
      status: string;
      source: string;
      format: string;
      rowLimit: string;
      rowsExported: string;
      createdAt: string;
      startedAt?: string;
      finishedAt?: string;
      errorCode?: string;
      errorMessage?: string;
    }>(`/dashboard/exports/${jobId}`, { companyId }),

  // Webhooks
  getWebhooks: (companyId: string) =>
    apiRequest<{
      webhooks: Array<{
        id: string;
        url: string;
        status: string;
        events: string[];
        workspaceId: string;
        projectId?: string;
        createdAt: string;
      }>;
    }>(`/dashboard/webhooks`, { companyId }),

  // Restore Requests
  createRestoreRequest: (companyId: string, body: {
    archiveId: string;
    tier: 'EXPEDITED' | 'STANDARD' | 'BULK';
    days?: number;
  }) =>
    apiRequest<{
      id: string;
      status: string;
      archiveId: string;
      tier: string;
      days: number;
      estimatedCostUsd: number;
      estimatedCompletionMinutes: number;
      requestedAt: string;
    }>(`/dashboard/restore-requests`, {
      method: 'POST',
      companyId,
      body,
    }),

  getRestoreRequests: (companyId: string) =>
    apiRequest<{
      requests: Array<{
        id: string;
        status: string;
        archiveId: string;
        tier: string;
        days: number;
        estimatedCostUsd?: string;
        actualCostUsd?: string;
        requestedAt: string;
        approvedAt?: string;
        completedAt?: string;
        expiresAt?: string;
        errorMessage?: string;
        archive: {
          id: string;
          date: string;
          gzSizeBytes: number;
          rowCount?: number;
        };
      }>;
    }>(`/dashboard/restore-requests`, { companyId }),

  getRestoreRequest: (companyId: string, id: string) =>
    apiRequest<{
      id: string;
      status: string;
      archiveId: string;
      tier: string;
      days: number;
      estimatedCostUsd?: string;
      actualCostUsd?: string;
      requestedAt: string;
      approvedAt?: string;
      completedAt?: string;
      expiresAt?: string;
      errorMessage?: string;
      archive: unknown;
    }>(`/dashboard/restore-requests/${id}`, { companyId }),

  cancelRestoreRequest: (companyId: string, id: string) =>
    apiRequest<{ success: boolean }>(`/dashboard/restore-requests/${id}`, {
      method: 'DELETE',
      companyId,
    }),

  // Admin endpoints
  admin: {
    getCompanies: (params?: { search?: string; limit?: number; cursor?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.cursor) searchParams.set('cursor', params.cursor);

      const query = searchParams.toString();
      return apiRequest<{
        companies: Array<{
          id: string;
          name: string;
          dataRegion: string;
          planTier: string;
          plan: { id: string; name: string };
          createdAt: string;
        }>;
        nextCursor: string | null;
      }>(`/dashboard/admin/companies${query ? `?${query}` : ''}`, { requireCompany: false }),
    },

    getPlans: () =>
      apiRequest<{
        plans: Array<{
          id: string;
          name: string;
          planTier: string;
          planType: string;
          description?: string;
          isDefault: boolean;
        }>;
      }>(`/dashboard/admin/plans`, { requireCompany: false }),

    assignPlan: (companyId: string, planId: string) =>
      apiRequest<{ success: boolean }>(`/dashboard/admin/companies/${companyId}/plan`, {
        method: 'POST',
        body: { planId },
        requireCompany: false,
      }),

    getRestoreRequests: (params?: { status?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const query = searchParams.toString();
      return apiRequest<{
        requests: Array<{
          id: string;
          status: string;
          companyId: string;
          companyName: string;
          archiveId: string;
          tier: string;
          estimatedCostUsd?: string;
          requestedAt: string;
          approvedAt?: string;
        }>;
      }>(`/dashboard/admin/restore-requests${query ? `?${query}` : ''}`, { requireCompany: false }),
    },

    approveRestoreRequest: (id: string) =>
      apiRequest<{ success: boolean }>(`/dashboard/admin/restore-requests/${id}/approve`, {
        method: 'POST',
        requireCompany: false,
      }),

    rejectRestoreRequest: (id: string, reason?: string) =>
      apiRequest<{ success: boolean }>(`/dashboard/admin/restore-requests/${id}/reject`, {
        method: 'POST',
        body: { reason },
        requireCompany: false,
      }),

    getAuditLogs: (params?: {
      companyId?: string;
      action?: string;
      limit?: number;
      cursor?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.companyId) searchParams.set('companyId', params.companyId);
      if (params?.action) searchParams.set('action', params.action);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.cursor) searchParams.set('cursor', params.cursor);

      const query = searchParams.toString();
      return apiRequest<{
        logs: Array<{
          id: string;
          action: string;
          actorUserId: string;
          actorEmail: string;
          actorRole: string;
          targetCompanyId?: string;
          metadata: unknown;
          createdAt: string;
        }>;
        nextCursor: string | null;
      }>(`/dashboard/admin/audit-logs${query ? `?${query}` : ''}`, { requireCompany: false }),
    },
  },
};
