'use server';

/**
 * Server Actions for Company Management
 */

import { prisma } from '@/lib/db';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { createCompanySchema } from '@/lib/validations/auth';
import { apiClient } from '@/lib/api/client';
import { getAuthContext } from '@/lib/rbac';
import { sendEmail, getEmailBaseUrl } from '@/lib/email/send';
import { CompanyCreated } from '@/lib/email/templates/CompanyCreated';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Create a new company
 */
export async function createCompanyAction(formData: FormData): Promise<ActionResult<{ companyId: string }>> {
  try {
    const authContext = await getAuthContext();
    const userId = authContext.userId;

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check email verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Email verification required before creating a company' };
    }

    // Extract and validate form data
    const rawData = {
      companyName: formData.get('companyName') as string,
      dataRegion: formData.get('dataRegion') as string,
      companySize: formData.get('companySize') as string,
      industry: formData.get('industry') as string,
      useCase: formData.get('useCase') as string,
    };

    const validatedData = createCompanySchema.parse(rawData);

    logger.log('[Create Company] Creating company:', validatedData.companyName);

    // Call API to create company
    try {
      const apiResult = await apiClient.createCompany({
        name: validatedData.companyName,
        dataRegion: validatedData.dataRegion as 'US' | 'EU' | 'APAC',
        companySize: validatedData.companySize,
        industry: validatedData.industry,
        useCase: validatedData.useCase,
      });

      const companyId = apiResult.id;

      // Create company membership for creator as COMPANY_ADMIN
      await prisma.companyMembership.create({
        data: {
          userId,
          companyId,
          role: 'COMPANY_ADMIN',
        },
      });

      // Log audit event
      await audit.custom('COMPANY_CREATED', {
        resourceType: 'company',
        resourceId: companyId,
        companyId,
        details: {
          companyName: validatedData.companyName,
          dataRegion: validatedData.dataRegion,
        },
      });

      // Send company created email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Your HyreLog workspace is ready',
          react: CompanyCreated({
            companyName: validatedData.companyName,
            dataRegion: validatedData.dataRegion,
            dashboardUrl: `${getEmailBaseUrl()}/app`,
            firstName: user.firstName || 'User',
          }),
        });
      } catch (emailError) {
        logger.error('[Create Company] Failed to send email:', emailError);
        // Don't fail if email fails
      }

      logger.log('[Create Company] Successfully created company:', companyId);

      return { success: true, data: { companyId } };
    } catch (apiError: any) {
      logger.error('[Create Company] API error:', apiError);
      return {
        success: false,
        error: apiError.message || 'Failed to create company',
      };
    }
  } catch (error) {
    logger.error('[Create Company] Exception:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company',
    };
  }
}
