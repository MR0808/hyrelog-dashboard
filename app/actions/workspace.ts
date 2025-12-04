'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { requireCompanyRole } from '@/lib/permissions';
import { generateUniqueSlug } from '@/lib/slug';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSelectedCompanyId } from '@/lib/company-context';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  companyId: z.string(),
  retentionDays: z.number().int().min(1).max(3650).optional(),
});

/**
 * Create a new workspace
 */
export async function createWorkspace(formData: FormData) {
  try {
    const session = await requireAuth();
    
    const rawData = {
      name: formData.get('name') as string,
      companyId: formData.get('companyId') as string,
      retentionDays: formData.get('retentionDays')
        ? parseInt(formData.get('retentionDays') as string)
        : undefined,
    };
    
    const data = createWorkspaceSchema.parse(rawData);
    
    // Verify user has access to company
    await requireCompanyRole(data.companyId, 'MEMBER');
    
    // Get company to inherit retention if not specified
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { retentionDays: true },
    });
    
    if (!company) {
      return {
        success: false,
        error: 'Company not found',
      };
    }
    
    // Generate unique slug within company
    const slug = await generateUniqueSlug(
      data.name,
      async (slug) => {
        const existing = await prisma.workspace.findUnique({
          where: {
            companyId_slug: {
              companyId: data.companyId,
              slug,
            },
          },
        });
        return !existing;
      }
    );
    
    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        companyId: data.companyId,
        retentionDays: data.retentionDays || company.retentionDays || null,
        members: {
          create: {
            userId: session.user.id,
            companyId: data.companyId,
            role: 'OWNER',
          },
        },
      },
    });
    
    // Note: revalidatePath removed - cannot be called during Server Component render
    // The page will refresh naturally on navigation
    
    return {
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation error',
      };
    }
    
    console.error('Error creating workspace:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workspace',
    };
  }
}

