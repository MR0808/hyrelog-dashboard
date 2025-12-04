import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep, updateOnboardingStep } from '@/app/actions/onboarding';
import { getUserCompanies } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FancyButton } from '@/components/ui/fancy-button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function OnboardingCompletePage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  const companies = await getUserCompanies();
  
  // Must have completed previous steps
  if (currentStep !== 'send-event' && currentStep !== 'complete') {
    redirect(`/onboarding/${currentStep || 'start'}`);
  }
  
  // Mark onboarding as complete
  if (companies.length > 0 && currentStep !== 'complete') {
    await updateOnboardingStep(companies[0].id, 'complete');
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl">You're All Set!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your HyreLog account is ready to use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">What's Next?</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Explore your dashboard</strong>
                  <p className="text-sm">View your audit events, usage stats, and more</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Integrate with your app</strong>
                  <p className="text-sm">Use our SDKs to start logging events automatically</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Set up alerts</strong>
                  <p className="text-sm">Configure notifications for important events</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center pt-4">
            <FancyButton 
              asChild 
              size="md"
              variant="primary"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              <Link href="/overview">
                Go to Dashboard
              </Link>
            </FancyButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

