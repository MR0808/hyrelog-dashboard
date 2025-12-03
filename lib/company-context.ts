/**
 * Server-side helper to get selected company from cookies
 */

import { cookies } from 'next/headers';
import { getUserCompanies } from './permissions';

/**
 * Get the selected company ID from cookies
 */
export async function getSelectedCompanyId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('hyrelog-selected-company-id')?.value || null;
}

/**
 * Get the selected company object
 */
export async function getSelectedCompany() {
  const companies = await getUserCompanies();
  const selectedId = await getSelectedCompanyId();
  
  if (selectedId) {
    return companies.find((c) => c.id === selectedId) || companies[0] || null;
  }
  
  return companies[0] || null;
}

/**
 * Filter queries by selected company
 */
export async function getCompanyFilter() {
  const company = await getSelectedCompany();
  return company ? { companyId: company.id } : {};
}

