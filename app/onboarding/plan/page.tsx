import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { getAvailablePlans } from '@/app/actions/stripe';
import { prisma } from '@/lib/prisma';
import { PlanSelection } from '@/components/onboarding/plan-selection';

export default async function OnboardingPlanPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // Must have a company first
  if (companies.length === 0) {
    redirect('/onboarding/company');
  }
  
  // Check if already has a plan
  const company = await prisma.company.findUnique({
    where: { id: companies[0].id },
    include: {
      plans: {
        include: {
          plan: true,
        },
      },
    },
  });
  
  if (company?.plans && company.plans.length > 0) {
    redirect('/onboarding/workspace');
  }
  
  // If not at plan step, redirect appropriately
  if (currentStep && currentStep !== 'company' && currentStep !== 'plan' && currentStep !== 'start') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  let plans;
  try {
    plans = await getAvailablePlans();
  } catch (error) {
    console.error('Error loading plans:', error);
    // If plans fail to load, show error message instead of redirecting
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">No Plans Available</h1>
          <p className="text-muted-foreground">
            Plans need to be seeded in the database. Please run the seed script in the backend repository.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }
  
  // If no plans available, show message
  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">No Plans Available</h1>
          <p className="text-muted-foreground">
            Plans need to be seeded in the database. Please run the seed script in the backend repository.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your needs. You can upgrade or downgrade anytime.
          </p>
        </div>
        
        <PlanSelection plans={plans} />
      </div>
    </div>
  );
}

