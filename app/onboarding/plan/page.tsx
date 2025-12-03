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
  
  if (company?.plans) {
    redirect('/onboarding/workspace');
  }
  
  // If not at plan step, redirect appropriately
  if (currentStep && currentStep !== 'company' && currentStep !== 'plan') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  const plans = await getAvailablePlans();
  
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

