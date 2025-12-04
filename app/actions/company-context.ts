'use server';

import { cookies } from 'next/headers';
import { getUserCompanies } from '@/lib/permissions';

/**
 * Set the selected company ID in cookies
 * This is a Server Action, so it can modify cookies
 */
export async function setSelectedCompany(companyId: string) {
  const cookieStore = await cookies();
  
  // Verify user has access to this company
  const companies = await getUserCompanies();
  const hasAccess = companies.some((c) => c.id === companyId);
  
  if (!hasAccess) {
    return {
      success: false,
      error: 'Access denied',
    };
  }
  
  cookieStore.set('hyrelog-selected-company-id', companyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  
  return {
    success: true,
  };
}

/**
 * Initialize company cookie if not set
 * Call this from pages that need the company cookie
 */
export async function ensureCompanyCookie() {
  const cookieStore = await cookies();
  const currentCompanyId = cookieStore.get('hyrelog-selected-company-id')?.value;
  
  if (currentCompanyId) {
    return { success: true, companyId: currentCompanyId };
  }
  
  // Set to first company if available
  const companies = await getUserCompanies();
  if (companies.length > 0) {
    return await setSelectedCompany(companies[0].id);
  }
  
  return {
    success: false,
    error: 'No companies available',
  };
}

