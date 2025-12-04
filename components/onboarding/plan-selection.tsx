'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/app/actions/stripe';
import { FancyButton } from '@/components/ui/fancy-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyEventLimit: number;
  retentionDays: number;
  priceCents: number;
  tier?: string | null;
}

interface PlanSelectionProps {
  plans: Plan[];
}

export function PlanSelection({ plans }: PlanSelectionProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter out enterprise plan (not self-serve)
  const selfServePlans = plans.filter(
    (plan) => plan.code !== 'ENTERPRISE' && plan.tier !== 'ENTERPRISE'
  );

  const handleContinue = () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    // Free plan doesn't need billing
    const selectedPlanData = selfServePlans.find((p) => p.id === selectedPlan);
    if (selectedPlanData?.priceCents === 0) {
      // Skip billing for free plan
      router.push('/onboarding/workspace');
      return;
    }

    // Create Stripe checkout session
    startTransition(async () => {
      const result = await createCheckoutSession(selectedPlan, billingCycle);

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    });
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    const monthly = cents / 100;
    const annual = (cents * 12 * 0.85) / 100;
    return billingCycle === 'ANNUAL'
      ? `$${annual.toFixed(0)}/year`
      : `$${monthly.toFixed(0)}/month`;
  };

  const getMonthlyEquivalent = (cents: number) => {
    if (cents === 0) return null;
    const annual = (cents * 12 * 0.85) / 100;
    return Math.round(annual / 12);
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      {selfServePlans.some((p) => p.priceCents > 0) && (
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium transition-colors ${
            billingCycle === 'MONTHLY' ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billingCycle === 'ANNUAL'}
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
            className={`
              relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${billingCycle === 'ANNUAL' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                : 'bg-gray-300 dark:bg-gray-700'
              }
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg 
                ring-0 transition duration-200 ease-in-out
                ${billingCycle === 'ANNUAL' ? 'translate-x-7' : 'translate-x-0.5'}
              `}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${
            billingCycle === 'ANNUAL' ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            Annual <span className="text-xs text-muted-foreground">(15% off)</span>
          </span>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {selfServePlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isFree = plan.priceCents === 0;
          const monthlyEquivalent = getMonthlyEquivalent(plan.priceCents);

          return (
            <Card
              key={plan.id}
              className={`flex flex-col cursor-pointer transition-all h-full ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isSelected && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
                </div>
                <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow space-y-4">
                <div className="h-[4.5rem] flex flex-col justify-start">
                  <div className="text-3xl font-bold leading-tight">{formatPrice(plan.priceCents)}</div>
                  <div className="text-sm text-muted-foreground h-[1.25rem] flex items-start">
                    {billingCycle === 'ANNUAL' && plan.priceCents > 0 && monthlyEquivalent
                      ? `$${monthlyEquivalent}/month billed annually`
                      : '\u00A0'}
                  </div>
                </div>

                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 text-sm min-h-[1.5rem]">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{plan.monthlyEventLimit.toLocaleString()} events/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm min-h-[1.5rem]">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{plan.retentionDays} days retention</span>
                  </div>
                </div>

                <div className="min-h-[2rem] flex items-center">
                  {plan.tier === 'FREE' && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Perfect for getting started
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enterprise Contact */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Need Enterprise Features?</h3>
            <p className="text-sm text-muted-foreground">
              Custom limits, dedicated support, and SLA guarantees
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:sales@hyrelog.com">Contact Sales</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <FancyButton 
          type="button" 
          variant="outline" 
          asChild 
          disabled={isPending}
          icon={<ArrowLeft className="h-4 w-4" />}
          iconPosition="left"
        >
          <Link href="/onboarding/company">
            Back
          </Link>
        </FancyButton>
        <FancyButton 
          onClick={handleContinue} 
          disabled={isPending || !selectedPlan}
          variant="primary"
          icon={<ArrowRight className="h-4 w-4" />}
          iconPosition="right"
        >
          {isPending ? 'Processing...' : 'Continue'}
        </FancyButton>
      </div>
    </div>
  );
}

