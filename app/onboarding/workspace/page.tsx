import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { CreateWorkspaceForm } from '@/components/onboarding/create-workspace-form';

export default async function OnboardingWorkspacePage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // Must have a company first
  if (companies.length === 0) {
    redirect('/onboarding/company');
  }
  
  const companyId = companies[0].id;
  
  // Check if already has a workspace
  const workspaceCount = await prisma.workspace.count({
    where: { companyId },
  });
  
  if (workspaceCount > 0) {
    redirect('/onboarding/api-key');
  }
  
  // If not at workspace step, redirect appropriately
  if (currentStep && currentStep !== 'billing' && currentStep !== 'workspace') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Your First Workspace</h1>
          <p className="text-muted-foreground">
            Workspaces help you organize your audit logs by project or environment
          </p>
        </div>
        
        <CreateWorkspaceForm companyId={companyId} />
      </div>
    </div>
  );
}

