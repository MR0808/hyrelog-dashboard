import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-server';
import { getCurrentOnboardingStep } from '@/app/actions/onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function OnboardingStartPage() {
  await requireAuth();
  
  const currentStep = await getCurrentOnboardingStep();
  
  // If already past start, redirect to current step
  if (currentStep && currentStep !== 'start') {
    redirect(`/onboarding/${currentStep}`);
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to HyreLog!</CardTitle>
          <CardDescription className="text-lg mt-4">
            Let's get you set up in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What you'll set up:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Create your company and choose a data region
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Select a plan that fits your needs
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Set up billing (if needed)
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Create your first workspace
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Generate your API key
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Send your first event
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/onboarding/company">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

