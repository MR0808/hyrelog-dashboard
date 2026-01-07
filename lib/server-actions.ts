/**
 * Server Action Wrapper with Audit Logging
 * 
 * Wraps server actions to automatically log audit events
 */

import { logAuditEvent, AuditLogData } from './audit';
import type { AuditAction } from '../generated/prisma/client';

type ServerAction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

interface ActionConfig {
  action: AuditAction;
  resourceType?: string;
  getResourceId?: (...args: any[]) => string | undefined;
  getCompanyId?: (...args: any[]) => string | undefined;
  getDetails?: (...args: any[]) => Record<string, unknown> | undefined;
}

/**
 * Wraps a server action to automatically log audit events
 */
export function withAuditLog<T extends any[], R>(
  action: ServerAction<T, R>,
  config: ActionConfig
): ServerAction<T, R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let success = false;
    let error: Error | null = null;

    try {
      const result = await action(...args);
      success = true;
      
      // Log the action
      await logAuditEvent({
        action: config.action,
        resourceType: config.resourceType,
        resourceId: config.getResourceId ? config.getResourceId(...args) : undefined,
        companyId: config.getCompanyId ? config.getCompanyId(...args) : undefined,
        details: {
          ...(config.getDetails ? config.getDetails(...args) : {}),
          duration: Date.now() - startTime,
          success: true,
        },
      });

      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      success = false;

      // Log the failed action
      await logAuditEvent({
        action: config.action,
        resourceType: config.resourceType,
        resourceId: config.getResourceId ? config.getResourceId(...args) : undefined,
        companyId: config.getCompanyId ? config.getCompanyId(...args) : undefined,
        details: {
          ...(config.getDetails ? config.getDetails(...args) : {}),
          duration: Date.now() - startTime,
          success: false,
          error: error.message,
        },
      });

      throw error;
    }
  };
}

/**
 * Creates a server action with audit logging
 */
export function createAuditedAction<T extends any[], R>(
  action: ServerAction<T, R>,
  config: ActionConfig
): ServerAction<T, R> {
  return withAuditLog(action, config);
}
