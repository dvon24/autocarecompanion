import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Pull the tier (free/plus/pro) out of subscription metadata. Returns
 * null if missing or unrecognized so callers can decide whether to
 * leave the existing tier in place vs. forcibly overwrite.
 *
 * The tier is stamped on the subscription at checkout creation time
 * (see /api/stripe/create-checkout). Old single-tier subscriptions
 * created before this change have no metadata.tier — those keep
 * whatever value is already on the User row (backfilled to 'plus').
 */
function extractTier(metadata: Stripe.Metadata | null | undefined): 'free' | 'plus' | 'pro' | null {
  const t = metadata?.tier;
  if (t === 'free' || t === 'plus' || t === 'pro') return t;
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerEmail = session.customer_details?.email;

  if (!customerId || !subscriptionId || !customerEmail) {
    console.error('Missing required session data:', { customerId, subscriptionId, customerEmail });
    return;
  }

  // The tier lives on the subscription (set in create-checkout). Fetch
  // it so we persist the correct plan even if the user upgrades later.
  let tier: 'free' | 'plus' | 'pro' | null = null;
  try {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId);
    tier = extractTier(sub.metadata);
  } catch (err) {
    console.warn('Could not retrieve subscription to read tier:', err);
  }

  // Check if user already exists with this Stripe customer ID
  let user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    // Check if user exists with this email
    user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (user) {
      // Update existing user with Stripe info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
          subscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          ...(tier ? { subscriptionTier: tier } : {}),
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email: customerEmail,
          name: session.customer_details?.name || null,
          stripeCustomerId: customerId,
          subscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          subscriptionTier: tier ?? 'plus',
        },
      });
    }
  } else {
    // Update existing user's subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        ...(tier ? { subscriptionTier: tier } : {}),
      },
    });
  }

  console.log(`Subscription activated for customer: ${customerId} (tier=${tier ?? 'unknown'})`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const tier = extractTier(subscription.metadata);

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: status,
      ...(tier ? { subscriptionTier: tier } : {}),
    },
  });

  console.log(`Subscription updated for customer ${customerId}: ${status} (tier=${tier ?? 'unchanged'})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'canceled',
    },
  });

  console.log(`Subscription canceled for customer: ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`Payment failed for customer: ${customerId}`);
}
