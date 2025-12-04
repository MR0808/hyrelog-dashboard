import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep, updateOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { CreateCompanyForm } from '@/components/onboarding/create-company-form';
import { prisma } from '@/lib/prisma';

export default async function OnboardingCompanyPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // If user already has a company, check if they need to select a plan
  if (companies.length > 0) {
    // Check if company already has a plan
    const company = await prisma.company.findFirst({
      where: { id: companies[0].id },
      include: {
        plans: true,
      },
    });
    
    if (company?.plans && company.plans.length > 0) {
      // Has plan, go to workspace
      redirect('/onboarding/workspace');
    } else {
      // No plan yet, go to plan selection
      redirect('/onboarding/plan');
    }
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

