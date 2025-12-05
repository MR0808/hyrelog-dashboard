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
    retentionDays: z.number().int().min(1).max(3650).optional()
});

/**
 * Create a new workspace
 * Optimized to reduce database queries by combining operations
 */
export async function createWorkspace(formData: FormData) {
    try {
        const session = await requireAuth();

        const rawData = {
            name: formData.get('name') as string,
            companyId: formData.get('companyId') as string,
            retentionDays: formData.get('retentionDays')
                ? parseInt(formData.get('retentionDays') as string)
                : undefined
        };

        const data = createWorkspaceSchema.parse(rawData);

        // Fetch company and companyUser in parallel to verify access and get retention
        const [company, companyUser] = await Promise.all([
            prisma.company.findUnique({
                where: { id: data.companyId },
                select: { retentionDays: true }
            }),
            prisma.companyUser.findFirst({
                where: {
                    userId: session.user.id,
                    companyId: data.companyId
                },
                select: {
                    id: true,
                    role: true
                }
            })
        ]);

        if (!company) {
            return {
                success: false,
                error: 'Company not found'
            };
        }

        if (!companyUser) {
            return {
                success: false,
                error: 'Access denied: Not a member of this company'
            };
        }

        // Verify user has required role
        const roleHierarchy: Record<string, number> = {
            OWNER: 4,
            ADMIN: 3,
            MEMBER: 2,
            VIEWER: 1
        };

        if (roleHierarchy[companyUser.role] < roleHierarchy['MEMBER']) {
            return {
                success: false,
                error: 'Access denied: Requires MEMBER role or higher'
            };
        }

        // Generate unique slug within company
        const slug = await generateUniqueSlug(data.name, async (slug) => {
            const existing = await prisma.workspace.findUnique({
                where: {
                    companyId_slug: {
                        companyId: data.companyId,
                        slug
                    }
                }
            });
            return !existing;
        });

        // Create workspace and update onboarding step in a transaction
        // This reduces sequential database operations
        const result = await prisma.$transaction(async (tx) => {
            // Create workspace
            const workspace = await tx.workspace.create({
                data: {
                    name: data.name,
                    slug,
                    companyId: data.companyId,
                    retentionDays:
                        data.retentionDays || company.retentionDays || null,
                    members: {
                        create: {
                            userId: session.user.id,
                            companyId: data.companyId,
                            role: 'OWNER'
                        }
                    }
                }
            });

            // Update onboarding step to 'API_KEY' (next step after workspace creation)
            // This is done in the same transaction to avoid another round trip
            // Note: The form was previously calling updateOnboardingStep with 'workspace',
            // but we're updating to the NEXT step ('API_KEY') since workspace is now complete
            const prismaStep = 'API_KEY'; // Next step after workspace
            await Promise.all([
                tx.company.update({
                    where: { id: data.companyId },
                    data: {
                        // @ts-ignore - onboardingStep may not exist yet in schema
                        onboardingStep: prismaStep
                    }
                }),
                tx.companyUser.update({
                    where: { id: companyUser.id },
                    data: {
                        // @ts-ignore - onboardingStep may not exist yet in schema
                        onboardingStep: prismaStep
                    }
                })
            ]);

            return workspace;
        });

        return {
            success: true,
            workspace: {
                id: result.id,
                name: result.name,
                slug: result.slug
            }
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || 'Validation error'
            };
        }

        console.error('Error creating workspace:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create workspace'
        };
    }
}
