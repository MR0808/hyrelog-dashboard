'use server';

import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth-server';
import { getSelectedCompanyId } from '@/lib/company-context';
import { prisma } from '@/lib/prisma';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover'
});

/**
 * Get available plans
 */
export async function getAvailablePlans() {
    const plans = await prisma.plan.findMany({
        where: {
            active: true
        },
        orderBy: {
            priceCents: 'asc'
        }
    });

    return plans.map((plan) => ({
        id: plan.id,
        code: plan.code,
        name: plan.name,
        description: plan.description,
        monthlyEventLimit: plan.monthlyEventLimit,
        retentionDays: plan.retentionDays,
        priceCents: plan.priceCents,
        tier: plan.tier
    }));
}

/**
 * Assign free plan to company (no billing required)
 */
export async function assignFreePlan(planId: string) {
    try {
        const session = await requireAuth();

        // Ensure company cookie is set
        const { ensureCompanyCookie } =
            await import('@/app/actions/company-context');
        const cookieResult = await ensureCompanyCookie();
        if (!cookieResult.success) {
            return {
                success: false,
                error:
                    'error' in cookieResult
                        ? cookieResult.error
                        : 'No company available'
            };
        }

        const companyId = await getSelectedCompanyId();

        if (!companyId) {
            return {
                success: false,
                error: 'No company selected'
            };
        }

        // Verify user has access to company
        const companyUser = await prisma.companyUser.findFirst({
            where: {
                userId: session.user.id,
                companyId
            }
        });

        if (!companyUser) {
            return {
                success: false,
                error: 'Access denied'
            };
        }

        // Get plan details
        const plan = await prisma.plan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return {
                success: false,
                error: 'Plan not found'
            };
        }

        // Verify it's actually a free plan
        if (plan.priceCents !== 0) {
            return {
                success: false,
                error: 'This plan requires payment. Please use checkout.'
            };
        }

        // Create company plan
        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month from now

        await prisma.companyPlan.upsert({
            where: { companyId },
            create: {
                companyId,
                planId,
                billingCycle: 'MONTHLY',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd
            },
            update: {
                planId,
                billingCycle: 'MONTHLY',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd
            }
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Error assigning free plan:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to assign free plan'
        };
    }
}

/**
 * Create Stripe Checkout Session
 */
export async function createCheckoutSession(
    planId: string,
    billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'
) {
    try {
        const session = await requireAuth();

        // Ensure company cookie is set
        const { ensureCompanyCookie } =
            await import('@/app/actions/company-context');
        const cookieResult = await ensureCompanyCookie();
        if (!cookieResult.success) {
            return {
                success: false,
                error:
                    'error' in cookieResult
                        ? cookieResult.error
                        : 'No company available'
            };
        }

        const companyId = await getSelectedCompanyId();

        if (!companyId) {
            return {
                success: false,
                error: 'No company selected'
            };
        }

        // Verify user has access to company
        const companyUser = await prisma.companyUser.findFirst({
            where: {
                userId: session.user.id,
                companyId
            }
        });

        if (!companyUser) {
            return {
                success: false,
                error: 'Access denied'
            };
        }

        // Get plan details
        const plan = await prisma.plan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return {
                success: false,
                error: 'Plan not found'
            };
        }

        // Calculate price based on billing cycle
        const priceCents =
            billingCycle === 'ANNUAL'
                ? Math.round(plan.priceCents * 12 * 0.85) // 15% annual discount
                : plan.priceCents;

        // Create or get Stripe customer
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                stripeCustomerId: true,
                name: true
            }
        });

        let customerId = company?.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: company?.name,
                metadata: {
                    companyId,
                    userId: session.user.id
                }
            });
            customerId = customer.id;

            // Save customer ID to company
            await prisma.company.update({
                where: { id: companyId },
                data: {
                    stripeCustomerId: customerId
                }
            });
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan.name,
                            description: plan.description || undefined
                        },
                        recurring: {
                            interval:
                                billingCycle === 'ANNUAL' ? 'year' : 'month'
                        },
                        unit_amount: priceCents
                    },
                    quantity: 1
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/plan`,
            metadata: {
                companyId,
                planId,
                billingCycle
            }
        });

        return {
            success: true,
            sessionId: checkoutSession.id,
            url: checkoutSession.url
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create checkout session'
        };
    }
}

/**
 * Verify Stripe subscription and update company plan
 */
export async function verifyStripeSubscription(sessionId: string) {
    try {
        const session = await requireAuth();

        console.log('Verifying Stripe subscription:', sessionId);

        const checkoutSession =
            await stripe.checkout.sessions.retrieve(sessionId);

        console.log('Checkout session status:', {
            payment_status: checkoutSession.payment_status,
            status: checkoutSession.status,
            metadata: checkoutSession.metadata
        });

        if (checkoutSession.payment_status !== 'paid') {
            console.error(
                'Payment not completed:',
                checkoutSession.payment_status
            );
            return {
                success: false,
                error: `Payment status: ${checkoutSession.payment_status}`
            };
        }

        const companyId = checkoutSession.metadata?.companyId;
        const planId = checkoutSession.metadata?.planId;
        const billingCycle = checkoutSession.metadata?.billingCycle as
            | 'MONTHLY'
            | 'ANNUAL';

        if (!companyId || !planId) {
            console.error('Missing metadata:', {
                companyId,
                planId,
                metadata: checkoutSession.metadata
            });
            return {
                success: false,
                error: 'Invalid session metadata'
            };
        }

        // Verify user has access
        const companyUser = await prisma.companyUser.findFirst({
            where: {
                userId: session.user.id,
                companyId
            }
        });

        if (!companyUser) {
            console.error('Access denied for user:', {
                userId: session.user.id,
                companyId
            });
            return {
                success: false,
                error: 'Access denied'
            };
        }

        // Get subscription details
        const subscriptionId = checkoutSession.subscription as string;
        if (!subscriptionId) {
            console.error('No subscription ID in checkout session');
            return {
                success: false,
                error: 'No subscription found'
            };
        }

        const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

        // Create or update company plan
        const now = new Date();
        // current_period_end may be at SubscriptionItem level or top-level depending on API version
        // Type assertion needed due to Stripe API version differences
        interface SubscriptionWithPeriod {
            current_period_end?: number;
            items?: {
                data?: Array<{ current_period_end?: number }>;
            };
        }
        const sub = subscription as unknown as SubscriptionWithPeriod;
        const periodEndTimestamp =
            sub.items?.data?.[0]?.current_period_end ||
            sub.current_period_end ||
            Math.floor(now.getTime() / 1000) + 30 * 24 * 60 * 60; // fallback to 30 days from now
        const periodEnd = new Date(periodEndTimestamp * 1000);

        console.log('Creating/updating company plan:', {
            companyId,
            planId,
            billingCycle
        });

        await prisma.companyPlan.upsert({
            where: { companyId },
            create: {
                companyId,
                planId,
                billingCycle,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd
            },
            update: {
                planId,
                billingCycle,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd
            }
        });

        // Update company billing mode
        await prisma.company.update({
            where: { id: companyId },
            data: {
                billingMode: 'STRIPE',
                stripeSubscriptionId: subscriptionId
            }
        });

        console.log('Subscription verified successfully');
        return {
            success: true
        };
    } catch (error) {
        console.error('Error verifying subscription:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to verify subscription'
        };
    }
}
