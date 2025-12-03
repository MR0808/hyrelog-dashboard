import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep, updateOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { CreateCompanyForm } from '@/components/onboarding/create-company-form';

export default async function OnboardingCompanyPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // If user already has a company, skip this step
  if (companies.length > 0) {
    redirect('/onboarding/plan');
  }
  
  // If not at company step, redirect to start
  if (currentStep && currentStep !== 'start' && currentStep !== 'company') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Your Company</h1>
          <p className="text-muted-foreground">
            Set up your organization and choose where your data will be stored
          </p>
        </div>
        
        <CreateCompanyForm />
      </div>
    </div>
  );
}

