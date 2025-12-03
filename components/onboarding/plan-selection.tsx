'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/app/actions/stripe';
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

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      {selfServePlans.some((p) => p.priceCents > 0) && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'MONTHLY'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'ANNUAL'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual <span className="text-xs">(15% off)</span>
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {selfServePlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isFree = plan.priceCents === 0;

          return (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{formatPrice(plan.priceCents)}</div>
                  {billingCycle === 'ANNUAL' && plan.priceCents > 0 && (
                    <div className="text-sm text-muted-foreground">
                      ${((plan.priceCents / 100) * 0.85 / 12).toFixed(0)}/month billed annually
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{plan.monthlyEventLimit.toLocaleString()} events/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{plan.retentionDays} days retention</span>
                  </div>
                </div>

                {plan.tier === 'FREE' && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Perfect for getting started
                  </Badge>
                )}
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
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href="/onboarding/company">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button onClick={handleContinue} disabled={isPending || !selectedPlan}>
          {isPending ? 'Processing...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

