import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { SendEventGuide } from '@/components/onboarding/send-event-guide';

export default async function OnboardingSendEventPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // Must have a company, workspace, and API key first
  if (companies.length === 0) {
    redirect('/onboarding/company');
  }
  
  const companyId = companies[0].id;
  
  // Check if has API key
  const apiKey = await prisma.apiKey.findFirst({
    where: { companyId },
    select: {
      id: true,
      prefix: true,
    },
  });
  
  if (!apiKey) {
    redirect('/onboarding/api-key');
  }
  
  // Check if has workspace
  const workspace = await prisma.workspace.findFirst({
    where: { companyId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  
  if (!workspace) {
    redirect('/onboarding/workspace');
  }
  
  // If not at send-event step, redirect appropriately
  if (currentStep && currentStep !== 'api-key' && currentStep !== 'send-event') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  // Check if event has been sent (check for recent events)
  const recentEvent = await prisma.auditEvent.findFirst({
    where: {
      companyId,
      workspaceId: workspace.id,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    select: {
      id: true,
    },
  });
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Send Your First Event</h1>
          <p className="text-muted-foreground">
            Follow the guide below to send your first audit event to HyreLog
          </p>
        </div>
        
        <SendEventGuide 
          companyId={companyId}
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          apiKeyPrefix={apiKey.prefix}
          hasSentEvent={!!recentEvent}
        />
      </div>
    </div>
  );
}

