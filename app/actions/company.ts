'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { generateUniqueSlug } from '@/lib/slug';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const createCompanySchema = z.object({
    name: z.string().min(1).max(100),
    dataRegion: z.enum(['AU', 'US', 'EU', 'APAC']),
    retentionDays: z.number().int().min(1).max(3650).optional()
});

/**
 * Create a new company
 */
export async function createCompany(formData: FormData) {
    try {
        const session = await requireAuth();

        const rawData = {
            name: formData.get('name') as string,
            dataRegion: formData.get('dataRegion') as
                | 'AU'
                | 'US'
                | 'EU'
                | 'APAC',
            retentionDays: formData.get('retentionDays')
                ? parseInt(formData.get('retentionDays') as string)
                : undefined
        };

        const data = createCompanySchema.parse(rawData);

        // Generate unique slug
        const slug = await generateUniqueSlug(data.name, async (slug) => {
            const existing = await prisma.company.findUnique({
                where: { slug }
            });
            return !existing;
        });

        // Create company
        const company = await prisma.company.create({
            data: {
                name: data.name,
                slug,
                dataRegion: data.dataRegion,
                retentionDays: data.retentionDays || 90,
                // @ts-ignore - onboardingStep may not exist yet in schema
                onboardingStep: 'COMPANY', // Prisma enum value
                // @ts-ignore - billingMode may not exist yet in schema
                billingMode: 'STRIPE',
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'OWNER',
                        // @ts-ignore - onboardingStep may not exist yet in schema
                        onboardingStep: 'COMPANY' // Prisma enum value
                    }
                }
            }
        });

        // Set as selected company
        const cookieStore = await cookies();
        cookieStore.set('hyrelog-selected-company-id', company.id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 // 1 year
        });

        revalidatePath('/onboarding');
        revalidatePath('/overview');

        return {
            success: true,
            company: {
                id: company.id,
                name: company.name,
                slug: company.slug
            }
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
