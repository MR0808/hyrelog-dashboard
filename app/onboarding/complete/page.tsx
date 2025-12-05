import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getUserCompanies } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { FancyButton } from '@/components/ui/fancy-button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function OnboardingCompletePage() {
    const session = await requireAuth();

    // Get companies first (needed for both step check and update)
    const companies = await getUserCompanies();

    if (companies.length === 0) {
        redirect('/onboarding/company');
    }

    const companyId = companies[0].id;

    // Get company data and companyUser in parallel to check step and prepare for update
    const [company, companyUser] = await Promise.all([
        prisma.company.findFirst({
            where: { id: companyId },
            select: {
                onboardingStep: true
            }
        }),
        prisma.companyUser.findFirst({
            where: {
                userId: session.user.id,
                companyId
            },
            select: { id: true }
        })
    ]);

    // Convert Prisma step to TypeScript step
    const prismaStep = company?.onboardingStep;
    const currentStep =
        prismaStep === 'SEND_EVENT'
            ? 'send-event'
            : prismaStep === 'COMPLETE'
              ? 'complete'
              : prismaStep === 'API_KEY'
                ? 'api-key'
                : prismaStep === 'WORKSPACE'
                  ? 'workspace'
                  : prismaStep === 'BILLING'
                    ? 'billing'
                    : prismaStep === 'PLAN'
                      ? 'plan'
                      : prismaStep === 'COMPANY'
                        ? 'company'
                        : 'start';

    // Must have completed previous steps
    if (currentStep !== 'send-event' && currentStep !== 'complete') {
        redirect(`/onboarding/${currentStep || 'start'}`);
    }

    // Mark onboarding as complete (only if not already complete)
    // This is a safety check - updateOnboardingStep should already be called in send-event-guide
    if (currentStep !== 'complete' && companyUser) {
        // Use a transaction to update both company and companyUser in one go
        await prisma.$transaction([
            prisma.company.update({
                where: { id: companyId },
                data: {
                    onboardingStep: 'COMPLETE'
                }
            }),
            prisma.companyUser.update({
                where: { id: companyUser.id },
                data: {
                    onboardingStep: 'COMPLETE'
                }
            })
        ]);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl">
                        You&apos;re All Set!
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your HyreLog account is ready to use
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">
                            What&apos;s Next?
                        </h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-0" />
                                <div>
                                    <strong className="text-foreground">
                                        Explore your dashboard
                                    </strong>
                                    <p className="text-sm">
                                        View your audit events, usage stats, and
                                        more
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-0" />
                                <div>
                                    <strong className="text-foreground">
                                        Integrate with your app
                                    </strong>
                                    <p className="text-sm">
                                        Use our SDKs to start logging events
                                        automatically
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-0" />
                                <div>
                                    <strong className="text-foreground">
                                        Set up alerts
                                    </strong>
                                    <p className="text-sm">
                                        Configure notifications for important
                                        events
                                    </p>
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
                            <Link href="/overview">Go to Dashboard</Link>
                        </FancyButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
