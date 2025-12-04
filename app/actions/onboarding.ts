'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { getUserCompanies } from '@/lib/permissions';
import { generateUniqueSlug, generateSlug } from '@/lib/slug';
import type { OnboardingStep } from '@/lib/onboarding';
import { revalidatePath } from 'next/cache';

/**
 * Convert Prisma enum value to TypeScript onboarding step
 */
function fromPrismaOnboardingStep(step: string | null | undefined): OnboardingStep | null {
  if (!step) return null;
  
  const mapping: Record<string, OnboardingStep> = {
    'START': 'start',
    'COMPANY': 'company',
    'PLAN': 'plan',
    'BILLING': 'billing',
    'WORKSPACE': 'workspace',
    'API_KEY': 'api-key',
    'SEND_EVENT': 'send-event',
    'COMPLETE': 'complete',
  };
  
  return mapping[step] || null;
}

/**
 * Get current onboarding step for user
 */
export async function getCurrentOnboardingStep(): Promise<OnboardingStep | null> {
  const session = await requireAuth();
  
  // Check if user has any companies
  const companies = await getUserCompanies();
  
  if (companies.length === 0) {
    return 'start';
  }
  
  // Get the first company's onboarding step
  const company = await prisma.company.findFirst({
    where: {
      id: companies[0].id,
    },
    select: {
      // @ts-ignore - onboardingStep may not exist yet in schema
      onboardingStep: true,
    },
  });
  
  // @ts-ignore - onboardingStep may not exist yet in schema
  const prismaStep = company?.onboardingStep;
  return fromPrismaOnboardingStep(prismaStep);
}

/**
 * Convert TypeScript onboarding step to Prisma enum value
 */
function toPrismaOnboardingStep(step: OnboardingStep): string {
  const mapping: Record<OnboardingStep, string> = {
    'start': 'START',
    'company': 'COMPANY',
    'plan': 'PLAN',
    'billing': 'BILLING',
    'workspace': 'WORKSPACE',
    'api-key': 'API_KEY',
    'send-event': 'SEND_EVENT',
    'complete': 'COMPLETE',
  };
  return mapping[step];
}

/**
 * Update onboarding step for company
 */
export async function updateOnboardingStep(
  companyId: string,
  step: OnboardingStep
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();
    
    // Verify user has access to company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: session.user.id,
        companyId,
      },
    });
    
    if (!companyUser) {
      return { success: false, error: 'Access denied' };
    }
    
    // Convert to Prisma enum value
    const prismaStep = toPrismaOnboardingStep(step);
    
    // Update company onboarding step
    await prisma.company.update({
      where: { id: companyId },
      data: {
        // @ts-ignore - onboardingStep may not exist yet in schema
        onboardingStep: prismaStep,
      },
    });
    
    // Update CompanyUser onboarding step
    await prisma.companyUser.update({
      where: { id: companyUser.id },
      data: {
        // @ts-ignore - onboardingStep may not exist yet in schema
        onboardingStep: prismaStep,
      },
    });
    
    // Note: revalidatePath removed - cannot be called during Server Component render
    // The page will refresh naturally on navigation or we can use router.refresh() client-side
    return { success: true };
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return { success: false, error: 'Failed to update onboarding step' };
  }
}

/**
 * Check if user needs onboarding
 */
export async function needsOnboarding(): Promise<boolean> {
  try {
    const session = await requireAuth();
    const companies = await getUserCompanies();
    
    if (companies.length === 0) {
      return true;
    }
    
    // Check if any company has incomplete onboarding
    for (const company of companies) {
      const companyData = await prisma.company.findUnique({
        where: { id: company.id },
        select: {
          // @ts-ignore - onboardingStep may not exist yet in schema
          onboardingStep: true,
        },
      });
      
      // @ts-ignore - onboardingStep may not exist yet in schema
      const prismaStep = companyData?.onboardingStep;
      const step = fromPrismaOnboardingStep(prismaStep);
      if (!step || step !== 'complete') {
        return true;
      }
    }
    
    return false;
  } catch {
    return true;
  }
}

