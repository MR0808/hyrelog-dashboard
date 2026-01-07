import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { sendEmail, getEmailBaseUrl } from '@/lib/email/send';
import { PlanChanged } from '@/lib/email/templates/PlanChanged';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('[Stripe Webhook] Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      logger.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    logger.log('[Stripe Webhook] Received event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(invoice);
        break;
      }

      default:
        logger.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('[Stripe Webhook] Exception:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const company = await prisma.company.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    include: { memberships: { include: { user: true } } },
  });

  if (!company) {
    logger.warn('[Stripe Webhook] Company not found for subscription:', subscription.id);
    return;
  }

  // Map Stripe plan to our plan tier (you'll need to adjust this based on your Stripe plan IDs)
  const planTier = mapStripePlanToTier(subscription.items.data[0]?.price.id);

  const oldPlan = company.planTier;
  const newPlan = planTier;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      planTier: planTier,
      billingStatus: 'ACTIVE',
      billingGraceEndsAt: null,
    },
  });

  // Log audit event
  await audit.companyPlanChanged(company.id, oldPlan, newPlan);

  // Send email to company admins
  const admins = company.memberships
    .filter((m) => m.role === 'COMPANY_ADMIN')
    .map((m) => m.user);

  for (const admin of admins) {
    try {
      await sendEmail({
        to: admin.email,
        subject: 'Your HyreLog plan has changed',
        react: PlanChanged({
          companyName: company.name,
          oldPlan,
          newPlan,
          effectiveAt: new Date().toISOString(),
        }),
      });
    } catch (emailError) {
      logger.error('[Stripe Webhook] Failed to send plan change email:', emailError);
    }
  }

  logger.log('[Stripe Webhook] Updated company plan:', company.id);
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const company = await prisma.company.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!company) {
    logger.warn('[Stripe Webhook] Company not found for subscription:', invoice.subscription);
    return;
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      billingStatus: 'ACTIVE',
      billingGraceEndsAt: null,
    },
  });

  if (company.billingStatus === 'PAST_DUE' || company.billingStatus === 'SUSPENDED') {
    await audit.companyReactivated(company.id);
  }

  logger.log('[Stripe Webhook] Payment succeeded for company:', company.id);
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const company = await prisma.company.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!company) {
    logger.warn('[Stripe Webhook] Company not found for subscription:', invoice.subscription);
    return;
  }

  const graceEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days grace

  await prisma.company.update({
    where: { id: company.id },
    data: {
      billingStatus: 'PAST_DUE',
      billingGraceEndsAt: graceEndsAt,
    },
  });

  await audit.billingPaymentFailed(company.id, {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
  });

  await audit.billingGraceStarted(company.id, graceEndsAt);

  logger.log('[Stripe Webhook] Payment failed for company:', company.id);
}

function mapStripePlanToTier(stripePlanId: string | undefined): 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'CUSTOM' {
  // Map your Stripe plan IDs to plan tiers
  // This is a placeholder - adjust based on your actual Stripe plan IDs
  if (!stripePlanId) return 'FREE';
  
  // Example mapping (adjust based on your Stripe plan IDs):
  if (stripePlanId.includes('starter')) return 'STARTER';
  if (stripePlanId.includes('growth')) return 'GROWTH';
  if (stripePlanId.includes('enterprise')) return 'ENTERPRISE';
  if (stripePlanId.includes('custom')) return 'CUSTOM';
  
  return 'FREE';
}
