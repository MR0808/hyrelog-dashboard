/**
 * RBAC (Role-Based Access Control) Helpers
 * 
 * Server-side enforcement for dashboard routes and server actions.
 */

import { auth } from './auth';
import { prisma } from './db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthContext {
  userId: string;
  userEmail: string;
  userRole: 'HYRELOG_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_MEMBER';
  companyId?: string;
  isHyrelogAdmin: boolean;
  companyMemberships: Array<{
    companyId: string;
    role: 'COMPANY_ADMIN' | 'COMPANY_MEMBER';
  }>;
}

/**
 * Get selected company ID from cookie
 */
export function getSelectedCompanyId(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('selectedCompanyId')?.value;
}

/**
 * Set selected company ID in cookie
 */
export function setSelectedCompanyId(companyId: string) {
  const cookieStore = cookies();
  cookieStore.set('selectedCompanyId', companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Get current authenticated user context
 */
export async function getAuthContext(): Promise<AuthContext> {
  // Get session from better-auth
  // For Next.js App Router, we need to get headers from the request
  const headersList = headers();
  
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Get user with memberships and platform role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      companyMemberships: true,
      platformRole: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const selectedCompanyId = getSelectedCompanyId();
  const membership = selectedCompanyId
    ? user.companyMemberships.find((m) => m.companyId === selectedCompanyId)
    : user.companyMemberships[0];

  const isHyrelogAdmin = user.platformRole?.role === 'HYRELOG_ADMIN';

  return {
    userId: user.id,
    userEmail: user.email,
    userRole: isHyrelogAdmin
      ? 'HYRELOG_ADMIN'
      : membership?.role === 'COMPANY_ADMIN'
        ? 'COMPANY_ADMIN'
        : 'COMPANY_MEMBER',
    companyId: membership?.companyId,
    isHyrelogAdmin,
    companyMemberships: user.companyMemberships.map((m) => ({
      companyId: m.companyId,
      role: m.role,
    })),
  };
}

/**
 * Require HyreLog admin role
 */
export async function requireHyrelogAdmin(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context.isHyrelogAdmin) {
    redirect('/app');
  }

  return context;
}

/**
 * Require company membership
 */
export async function requireCompanyMembership(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (context.isHyrelogAdmin) {
    // Admins can access company routes if they have a selected company
    if (!context.companyId) {
      redirect('/admin/companies');
    }
    return context;
  }

  if (!context.companyId || context.companyMemberships.length === 0) {
    redirect('/admin/attach-membership');
  }

  return context;
}

/**
 * Get company ID from context or throw
 */
export async function requireCompanyId(): Promise<string> {
  const context = await requireCompanyMembership();

  if (!context.companyId) {
    throw new Error('Company ID required');
  }

  return context.companyId;
}
