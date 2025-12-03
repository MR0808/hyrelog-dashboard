'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { canManageCompanySettings } from '@/lib/permissions';

/**
 * Update company settings
 */
export async function updateCompanySettings(formData: FormData) {
  try {
    const session = await requireAuth();
    
    const companyId = formData.get('companyId') as string;
    const name = formData.get('name') as string;
    const retentionDays = formData.get('retentionDays') ? parseInt(formData.get('retentionDays') as string) : undefined;

    if (!companyId) {
      return { error: 'Company ID is required' };
    }

    // Check permissions
    const hasPermission = await canManageCompanySettings(companyId);
    if (!hasPermission) {
      return { error: 'Insufficient permissions to update company settings' };
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined && name !== null) {
      updateData.name = name;
    }
    if (retentionDays !== undefined && retentionDays !== null) {
      if (retentionDays < 1 || retentionDays > 3650) {
        return { error: 'Retention days must be between 1 and 3650' };
      }
      updateData.retentionDays = retentionDays;
    }

    // Update company
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    // Log config change (if ConfigChangeLog exists)
    try {
      await prisma.configChangeLog.create({
        data: {
          companyId,
          changedByUserId: session.user.id,
          changeType: 'COMPANY_SETTINGS',
          oldValue: {},
          newValue: updateData,
          description: 'Company settings updated',
        },
      });
    } catch (err) {
      // ConfigChangeLog might not exist, ignore
      console.warn('Could not log config change:', err);
    }

    revalidatePath('/settings');
    
    return {
      success: true,
      company: {
        id: updated.id,
        name: updated.name,
        retentionDays: updated.retentionDays,
      },
    };
  } catch (error) {
    console.error('Error updating company settings:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update company settings',
    };
  }
}

