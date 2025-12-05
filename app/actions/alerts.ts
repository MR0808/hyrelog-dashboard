'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { Prisma, BillingMeterType } from '@prisma/client';

/**
 * Update alert threshold
 */
export async function updateAlertThreshold(formData: FormData) {
    try {
        const session = await requireAuth();

        const thresholdId = formData.get('thresholdId') as string;
        const thresholdValue = formData.get('thresholdValue')
            ? parseFloat(formData.get('thresholdValue') as string)
            : undefined;

        if (!thresholdId) {
            return { error: 'Threshold ID is required' };
        }

        // Get threshold and verify access
        const threshold = await prisma.notificationThreshold.findUnique({
            where: { id: thresholdId },
            include: {
                company: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id
                            }
                        }
                    }
                }
            }
        });

        if (!threshold) {
            return { error: 'Threshold not found' };
        }

        // Check if user is a member of the company
        if (threshold.company.members.length === 0) {
            return { error: 'Access denied' };
        }

        // Build update data
        const updateData: Partial<Prisma.NotificationThresholdUncheckedUpdateInput> =
            {};
        if (thresholdValue !== undefined && thresholdValue !== null) {
            updateData.softLimitPercent = Math.round(thresholdValue);
            updateData.hardLimitPercent = Math.round(thresholdValue);
        }

        // Update threshold
        const updated = await prisma.notificationThreshold.update({
            where: { id: thresholdId },
            data: updateData
        });

        revalidatePath('/alerts');

        return {
            success: true,
            threshold: updated
        };
    } catch (error) {
        console.error('Error updating alert threshold:', error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update alert threshold'
        };
    }
}

/**
 * Create a new alert threshold
 */
export async function createAlertThreshold(formData: FormData) {
    try {
        const session = await requireAuth();

        const companyId = formData.get('companyId') as string;
        const meterType = formData.get('meterType') as BillingMeterType;
        const thresholdValue = parseFloat(
            formData.get('thresholdValue') as string
        );
        const channel = (formData.get('channel') as string) || 'email';

        if (!companyId || !meterType || isNaN(thresholdValue)) {
            return { error: 'Missing required fields' };
        }

        // Verify user is a member of the company
        const companyUser = await prisma.companyUser.findFirst({
            where: {
                userId: session.user.id,
                companyId
            }
        });

        if (!companyUser) {
            return { error: 'Access denied' };
        }

        // Create threshold
        const threshold = await prisma.notificationThreshold.create({
            data: {
                companyId,
                meterType,
                softLimitPercent: Math.round(thresholdValue),
                hardLimitPercent: Math.round(thresholdValue),
                channel
            }
        });

        revalidatePath('/alerts');

        return {
            success: true,
            threshold
        };
    } catch (error) {
        console.error('Error creating alert threshold:', error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create alert threshold'
        };
    }
}
