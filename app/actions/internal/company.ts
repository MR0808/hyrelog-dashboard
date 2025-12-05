'use server';

import { requireInternalAuth } from '@/lib/internal-auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import crypto from 'node:crypto';

const createCompanySchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    dataRegion: z.enum(['AU', 'US', 'EU', 'APAC']),
    retentionDays: z.number().int().min(1).max(3650),
    billingMode: z.enum(['STRIPE', 'CUSTOM']),
    ownerEmail: z.string().email(),
    planId: z.string().optional(),
    customMonthlyPrice: z.number().int().optional(),
    customEventLimit: z.number().int().optional(),
    customRetentionDays: z.number().int().optional(),
    invoiceTerm: z.enum(['NET_30', 'NET_60', 'MANUAL']).optional(),
    crmDealId: z.string().optional()
});

/**
 * Create a company as internal admin
 */
export async function createInternalCompany(formData: FormData) {
    try {
        await requireInternalAuth();

        const rawData = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            dataRegion: formData.get('dataRegion') as
                | 'AU'
                | 'US'
                | 'EU'
                | 'APAC',
            retentionDays: parseInt(formData.get('retentionDays') as string),
            billingMode: formData.get('billingMode') as 'STRIPE' | 'CUSTOM',
            ownerEmail: formData.get('ownerEmail') as string,
            planId: formData.get('planId') as string | undefined,
            customMonthlyPrice: formData.get('customMonthlyPrice')
                ? parseInt(formData.get('customMonthlyPrice') as string)
                : undefined,
            customEventLimit: formData.get('customEventLimit')
                ? parseInt(formData.get('customEventLimit') as string)
                : undefined,
            customRetentionDays: formData.get('customRetentionDays')
                ? parseInt(formData.get('customRetentionDays') as string)
                : undefined,
            invoiceTerm: formData.get('invoiceTerm') as
                | 'NET_30'
                | 'NET_60'
                | 'MANUAL'
                | undefined,
            crmDealId: formData.get('crmDealId') as string | undefined
        };

        const data = createCompanySchema.parse(rawData);

        // Generate unique slug if needed
        const finalSlug = await generateUniqueSlug(data.slug, async (slug) => {
            const existing = await prisma.company.findUnique({
                where: { slug }
            });
            return !existing;
        });

        // Find or create owner user
        let owner = await prisma.user.findUnique({
            where: { email: data.ownerEmail }
        });

        if (!owner) {
            // Create user with temporary password (they'll need to reset)
            const tempPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await hashPassword(tempPassword);

            owner = await prisma.user.create({
                data: {
                    email: data.ownerEmail,
                    // @ts-ignore - password may not exist in User model
                    password: hashedPassword,
                    // @ts-ignore - isVerified may not exist yet
                    isVerified: false
                }
            });

            // TODO: Send password reset email
        }

        // Create company
        const companyData: any = {
            name: data.name,
            slug: finalSlug,
            dataRegion: data.dataRegion,
            retentionDays: data.retentionDays,
            // @ts-ignore - billingMode may not exist yet
            billingMode: data.billingMode,
            // @ts-ignore - onboardingStep may not exist yet
            onboardingStep: 'COMPLETE', // Enterprise companies skip onboarding - Prisma enum value
            members: {
                create: {
                    userId: owner.id,
                    role: 'OWNER',
                    // @ts-ignore - onboardingStep may not exist yet
                    onboardingStep: 'COMPLETE' // Prisma enum value
                }
            }
        };

        // Add custom billing fields if CUSTOM mode
        if (data.billingMode === 'CUSTOM') {
            if (data.customMonthlyPrice) {
                // @ts-ignore
                companyData.customMonthlyPrice = data.customMonthlyPrice;
            }
            if (data.customEventLimit) {
                // @ts-ignore
                companyData.customEventLimit = data.customEventLimit;
            }
            if (data.customRetentionDays) {
                // @ts-ignore
                companyData.customRetentionDays = data.customRetentionDays;
            }
            if (data.invoiceTerm) {
                // @ts-ignore
                companyData.invoiceTerm = data.invoiceTerm;
            }
            if (data.crmDealId) {
                // @ts-ignore
                companyData.crmDealId = data.crmDealId;
            }
        }

        const company = await prisma.company.create({
            data: companyData
        });

        // Create plan if STRIPE mode
        if (data.billingMode === 'STRIPE' && data.planId) {
            const plan = await prisma.plan.findUnique({
                where: { id: data.planId }
            });

            if (plan) {
                const now = new Date();
                const periodEnd = new Date();
                periodEnd.setMonth(periodEnd.getMonth() + 1);

                await prisma.companyPlan.create({
                    data: {
                        companyId: company.id,
                        planId: plan.id,
                        billingCycle: 'MONTHLY',
                        currentPeriodStart: now,
                        currentPeriodEnd: periodEnd
                    }
                });
            }
        }

        revalidatePath('/internal/companies');
        revalidatePath(`/internal/companies/${company.id}`);

        return {
            success: true,
            companyId: company.id
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || 'Validation error'
            };
        }

        console.error('Error creating company:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create company'
        };
    }
}
