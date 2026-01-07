/**
 * Audit Logging Utility
 * 
 * Logs all actions within the dashboard for compliance and security.
 */

import { prisma } from './db';
import { getAuthContext } from './rbac';
import { headers } from 'next/headers';
import type { AuditAction } from '../generated/prisma/client';

export interface AuditLogData {
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  companyId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an action to the audit log
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress = 
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    let userId: string | undefined;
    try {
      const authContext = await getAuthContext();
      userId = authContext.userId;
      // Use companyId from data if provided, otherwise from auth context
      data.companyId = data.companyId || authContext.companyId;
    } catch {
      // User not authenticated - this is OK for some actions
      userId = undefined;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        companyId: data.companyId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the application
    // But log to console for debugging (only in development)
    // Note: Audit logs are ALWAYS written to database, console logging is separate
    if (process.env.NODE_ENV === 'development') {
      console.error('[Audit] Failed to log event:', error);
      console.error('[Audit] Event data:', data);
    }
  }
}

/**
 * Convenience functions for common actions
 */
export const audit = {
  // Authentication
  userSignup: (userId: string, email: string) =>
    logAuditEvent({
      action: 'USER_SIGNUP',
      resourceType: 'user',
      resourceId: userId,
      details: { email },
    }),

  userLogin: (userId: string) =>
    logAuditEvent({
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: userId,
    }),

  userLogout: (userId: string) =>
    logAuditEvent({
      action: 'USER_LOGOUT',
      resourceType: 'user',
      resourceId: userId,
    }),

  // Company Management
  companyCreate: (companyId: string, companyName: string) =>
    logAuditEvent({
      action: 'COMPANY_CREATED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details: { companyName },
    }),

  companyPlanChanged: (companyId: string, oldPlan: string, newPlan: string) =>
    logAuditEvent({
      action: 'COMPANY_PLAN_CHANGED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details: { oldPlan, newPlan },
    }),

  companySuspended: (companyId: string) =>
    logAuditEvent({
      action: 'COMPANY_SUSPENDED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
    }),

  companyReactivated: (companyId: string) =>
    logAuditEvent({
      action: 'COMPANY_REACTIVATED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
    }),

  billingPaymentFailed: (companyId: string, details?: Record<string, unknown>) =>
    logAuditEvent({
      action: 'BILLING_PAYMENT_FAILED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details,
    }),

  billingGraceStarted: (companyId: string, graceEndsAt: Date) =>
    logAuditEvent({
      action: 'BILLING_GRACE_STARTED',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details: { graceEndsAt: graceEndsAt.toISOString() },
    }),

  memberInvited: (companyId: string, inviteId: string, email: string, role: string) =>
    logAuditEvent({
      action: 'MEMBER_INVITED',
      resourceType: 'company_invite',
      resourceId: inviteId,
      companyId,
      details: { email, role },
    }),

  memberInviteAccepted: (companyId: string, userId: string, role: string) =>
    logAuditEvent({
      action: 'MEMBER_INVITE_ACCEPTED',
      resourceType: 'company_membership',
      resourceId: userId,
      companyId,
      details: { role },
    }),

  userEmailVerified: (userId: string) =>
    logAuditEvent({
      action: 'USER_EMAIL_VERIFIED',
      resourceType: 'user',
      resourceId: userId,
      details: {},
    }),

  companyUpdate: (companyId: string, changes: Record<string, unknown>) =>
    logAuditEvent({
      action: 'COMPANY_UPDATE',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details: { changes },
    }),

  companyMemberAdd: (companyId: string, userId: string, role: string) =>
    logAuditEvent({
      action: 'COMPANY_MEMBER_ADD',
      resourceType: 'company_membership',
      resourceId: userId,
      companyId,
      details: { role },
    }),

  // Data Management
  exportCreate: (exportId: string, exportType: string) =>
    logAuditEvent({
      action: 'EXPORT_CREATE',
      resourceType: 'export',
      resourceId: exportId,
      details: { exportType },
    }),

  exportDownload: (exportId: string) =>
    logAuditEvent({
      action: 'EXPORT_DOWNLOAD',
      resourceType: 'export',
      resourceId: exportId,
    }),

  webhookCreate: (webhookId: string, url: string) =>
    logAuditEvent({
      action: 'WEBHOOK_CREATE',
      resourceType: 'webhook',
      resourceId: webhookId,
      details: { url: url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') }, // Redact credentials
    }),

  webhookTrigger: (webhookId: string, status: string) =>
    logAuditEvent({
      action: 'WEBHOOK_TRIGGER',
      resourceType: 'webhook',
      resourceId: webhookId,
      details: { status },
    }),

  restoreRequestCreate: (requestId: string, archiveId: string) =>
    logAuditEvent({
      action: 'RESTORE_REQUEST_CREATE',
      resourceType: 'restore_request',
      resourceId: requestId,
      details: { archiveId },
    }),

  // Admin Actions
  adminUserUpdate: (targetUserId: string, changes: Record<string, unknown>) =>
    logAuditEvent({
      action: 'ADMIN_USER_UPDATE',
      resourceType: 'user',
      resourceId: targetUserId,
      details: { changes },
    }),

  adminCompanyUpdate: (companyId: string, changes: Record<string, unknown>) =>
    logAuditEvent({
      action: 'ADMIN_COMPANY_UPDATE',
      resourceType: 'company',
      resourceId: companyId,
      companyId,
      details: { changes },
    }),

  // Generic
  custom: (action: AuditAction, data: Omit<AuditLogData, 'action'>) =>
    logAuditEvent({ action, ...data }),
};
