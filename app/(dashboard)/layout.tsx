import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { requireAuth } from '@/lib/auth-server';
import { getUserCompanies } from '@/lib/permissions';
import { CompanyProvider } from '@/app/providers/company-provider';
import { needsOnboarding } from '@/app/actions/onboarding';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication for all dashboard pages
  const session = await requireAuth();
  
  // Check if user needs onboarding
  const needsOnboardingCheck = await needsOnboarding();
  if (needsOnboardingCheck) {
    redirect('/onboarding/start');
  }
  
  // Get user's companies
  const companies = await getUserCompanies();
  
  // Get selected company from cookies
  const cookieStore = await cookies();
  const selectedCompanyId = cookieStore.get('hyrelog-selected-company-id')?.value;

  return (
    <CompanyProvider initialCompanies={companies} initialCompanyId={selectedCompanyId || undefined}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CompanyProvider>
  );
}
