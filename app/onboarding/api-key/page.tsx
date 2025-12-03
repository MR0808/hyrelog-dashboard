import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ApiKeyGeneration } from '@/components/onboarding/api-key-generation';

export default async function OnboardingApiKeyPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // Must have a company and workspace first
  if (companies.length === 0) {
    redirect('/onboarding/company');
  }
  
  const companyId = companies[0].id;
  
  // Check if already has an API key
  const apiKeyCount = await prisma.apiKey.count({
    where: { companyId },
  });
  
  if (apiKeyCount > 0) {
    redirect('/onboarding/send-event');
  }
  
  // Check if has workspace
  const workspaceCount = await prisma.workspace.count({
    where: { companyId },
  });
  
  if (workspaceCount === 0) {
    redirect('/onboarding/workspace');
  }
  
  // If not at api-key step, redirect appropriately
  if (currentStep && currentStep !== 'workspace' && currentStep !== 'api-key') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  const workspaces = await prisma.workspace.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Your API Key</h1>
          <p className="text-muted-foreground">
            Create an API key to start sending audit events to HyreLog
          </p>
        </div>
        
        <ApiKeyGeneration companyId={companyId} workspaces={workspaces} />
      </div>
    </div>
  );
}

