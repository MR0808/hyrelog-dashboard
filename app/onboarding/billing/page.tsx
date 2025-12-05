import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { verifyStripeSubscription } from '@/app/actions/stripe';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { getSelectedCompanyId } from '@/lib/company-context';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { FancyButton } from '@/components/ui/fancy-button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default async function OnboardingBillingPage({
    searchParams
}: {
    searchParams: Promise<{ success?: string; session_id?: string }>;
}) {
    await requireAuth();

    // Await searchParams (required in Next.js App Router)
    const params = await searchParams;

    console.log('Billing page searchParams:', params);
    console.log('All params keys:', Object.keys(params));

    // Get company ID (will fallback to first company if no cookie is set)
    const companyId = await getSelectedCompanyId();

    if (!companyId) {
        redirect('/onboarding/company');
    }

    // Check if we have the required Stripe callback parameters
    // Stripe might pass these as query params or in different formats
    const hasSuccess = params.success === 'true' || params.success === '1';
    const sessionId =
        params.session_id ||
        (params as any).sessionId ||
        (params as any)['session_id'];

    console.log('Parsed params:', { hasSuccess, sessionId, rawParams: params });

    // If no success param or session_id, show helpful error instead of redirecting
    if (!hasSuccess || !sessionId) {
        console.error('Missing Stripe callback params:', {
            success: params.success,
            session_id: sessionId,
            allParams: params
        });

        // Show error page instead of redirecting
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-destructive">
                            Payment Verification Issue
                        </CardTitle>
                        <CardDescription>
                            We couldn't verify your payment. Please check your
                            email for confirmation or contact support.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            <p>Debug info:</p>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(params, null, 2)}
                            </pre>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <FancyButton asChild variant="outline" size="md">
                                <Link href="/onboarding/plan">
                                    Back to Plans
                                </Link>
                            </FancyButton>
                            <FancyButton asChild variant="primary" size="md">
                                <Link href="/overview">Go to Dashboard</Link>
                            </FancyButton>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Verify subscription
    const verification = await verifyStripeSubscription(sessionId);

    if (!verification.success) {
        console.error('Stripe verification failed:', verification.error);
        // Still redirect to plan page if verification fails
        redirect('/onboarding/plan?error=verification_failed');
    }

    // Update onboarding step
    await updateOnboardingStep(companyId, 'billing');

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">
                        Payment Successful!
                    </CardTitle>
                    <CardDescription>
                        Your subscription is now active. Let's continue with
                        setup.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <FancyButton asChild variant="primary" size="md">
                        <Link href="/onboarding/workspace">
                            Continue to Workspace Setup
                        </Link>
                    </FancyButton>
                </CardContent>
            </Card>
        </div>
    );
}
