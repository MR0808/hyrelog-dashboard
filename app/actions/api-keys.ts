'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { canManageApiKeys } from '@/lib/permissions';
import { ApiKeyType } from '@/generated/prisma/enums';
import crypto from 'node:crypto';

/**
 * Hash API key (same logic as backend - must use HMAC with secret)
 */
function hashApiKey(key: string): string {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error('API_KEY_SECRET environment variable is required');
  }
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
}

/**
 * Generate a new API key
 */
function generateApiKey(): string {
  return `hlk_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Create a new API key
 */
export async function createApiKey(formData: FormData) {
  try {
    const session = await requireAuth();
    
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'COMPANY' | 'WORKSPACE';
    const readOnly = formData.get('readOnly') === 'true';
    const workspaceId = formData.get('workspaceId') as string | null;
    const labels = formData.get('labels') ? JSON.parse(formData.get('labels') as string) : [];
    const ipAllowlist = formData.get('ipAllowlist') ? JSON.parse(formData.get('ipAllowlist') as string) : [];
    const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null;

    if (!name) {
      return { error: 'Name is required' };
    }

    // Get user's company from CompanyUser
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!companyUser) {
      return { error: 'User is not associated with a company' };
    }

    const companyId = companyUser.company.id;

    // Check permissions
    const hasPermission = await canManageApiKeys(companyId);
    if (!hasPermission) {
      return { error: 'Insufficient permissions to create API keys' };
    }

    // Validate workspace if provided
    if (type === 'WORKSPACE' && workspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          companyId,
        },
      });

      if (!workspace) {
        return { error: 'Workspace not found or access denied' };
      }
    }

    // Generate new API key
    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);
    const prefix = rawKey.substring(0, 12);

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        companyId,
        workspaceId: type === 'WORKSPACE' ? workspaceId : null,
        name,
        prefix,
        hashedKey,
        type: type as ApiKeyType,
        readOnly,
        labels,
        ipAllowlist,
        expiresAt,
      },
    });

    revalidatePath('/api-keys');
    
    return {
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        key: rawKey, // Only returned on creation
        readOnly: apiKey.readOnly,
        labels: apiKey.labels,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create API key',
    };
  }
}

/**
 * Rotate an API key
 */
export async function rotateApiKey(keyId: string, revokeOld: boolean = false) {
  try {
    const session = await requireAuth();
    
    // Get existing key
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        company: true,
      },
    });

    if (!existingKey) {
      return { error: 'API key not found' };
    }

    // Check permissions
    const hasPermission = await canManageApiKeys(existingKey.companyId);
    if (!hasPermission) {
      return { error: 'Insufficient permissions' };
    }

    // Generate new key
    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);
    const prefix = rawKey.substring(0, 12);

    // Create new key
    const newKey = await prisma.apiKey.create({
      data: {
        companyId: existingKey.companyId,
        workspaceId: existingKey.workspaceId,
        name: `${existingKey.name} (rotated)`,
        prefix,
        hashedKey,
        type: existingKey.type,
        readOnly: existingKey.readOnly,
        labels: existingKey.labels,
        ipAllowlist: existingKey.ipAllowlist,
        rotatedFrom: existingKey.id,
      },
    });

    // Update old key
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        rotatedTo: newKey.id,
        ...(revokeOld && {
          revokedAt: new Date(),
          revokedReason: 'Rotated and replaced',
        }),
      },
    });

    revalidatePath('/api-keys');
    
    return {
      success: true,
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        key: rawKey, // Only returned on creation
        oldKeyRevoked: revokeOld,
        createdAt: newKey.createdAt,
      },
    };
  } catch (error) {
    console.error('Error rotating API key:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to rotate API key',
    };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string, reason?: string) {
  try {
    const session = await requireAuth();
    
    // Get existing key
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        company: true,
      },
    });

    if (!existingKey) {
      return { error: 'API key not found' };
    }

    // Check permissions
    const hasPermission = await canManageApiKeys(existingKey.companyId);
    if (!hasPermission) {
      return { error: 'Insufficient permissions' };
    }

    // Revoke key
    const revoked = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        revokedAt: new Date(),
        revokedReason: reason || 'Revoked by user',
      },
    });

    revalidatePath('/api-keys');
    
    return {
      success: true,
      apiKey: {
        id: revoked.id,
        revokedAt: revoked.revokedAt,
        revokedReason: revoked.revokedReason,
      },
    };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to revoke API key',
    };
  }
}

