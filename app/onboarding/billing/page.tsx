import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { verifyStripeSubscription } from '@/app/actions/stripe';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { getSelectedCompanyId } from '@/lib/company-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default async function OnboardingBillingPage({
  searchParams,
}: {
  searchParams: { success?: string; session_id?: string };
}) {
  await requireAuth();
  
  const companyId = await getSelectedCompanyId();
  
  if (!companyId) {
    redirect('/onboarding/company');
  }
  
  // If no success param, redirect to plan selection
  if (!searchParams.success || !searchParams.session_id) {
    redirect('/onboarding/plan');
  }
  
  // Verify subscription
  const verification = await verifyStripeSubscription(searchParams.session_id);
  
  if (verification.success) {
    // Update onboarding step
    await updateOnboardingStep(companyId, 'billing');
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verification.success ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your subscription is now active. Let's continue with setup.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Payment Processing</CardTitle>
              <CardDescription>
                {verification.error || 'Please wait while we verify your payment...'}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {verification.success ? (
            <Button asChild className="w-full">
              <Link href="/onboarding/workspace">
                Continue to Workspace Setup
              </Link>
            </Button>
          ) : (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

