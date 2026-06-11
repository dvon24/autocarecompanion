import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { TierId, BillingInterval } from '@/lib/pricing/tiers';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';

/**
 * POST /api/stripe/create-checkout
 *
 * Body: { tierId?: 'plus' | 'pro', successUrl?, cancelUrl? }
 *
 * Defaults tierId to 'plus' so any old client (the legacy single-tier
 * /subscribe page) keeps working through the cutover. 'free' is rejected
 * — no checkout needed for that tier.
 *
 * The tier is round-tripped through `subscription_data.metadata.tier`
 * so the webhook can persist it on the User row without having to look
 * up the price ID → tier mapping again.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const requestedTier = (body.tierId as TierId | undefined) ?? 'plus';
    const interval: BillingInterval = body.interval === 'year' ? 'year' : 'month';
    const { successUrl, cancelUrl } = body as { successUrl?: string; cancelUrl?: string };

    if (requestedTier !== 'plus' && requestedTier !== 'pro') {
      return NextResponse.json(
        { error: 'invalid_tier', message: 'tierId must be plus or pro' },
        { status: 400 }
      );
    }

    // Region gate — read country from Vercel's edge geo header. Free
    // tier doesn't reach this endpoint (Free has no checkout), so any
    // request here is for a paid plan and must be in an allowed region.
    // Founder + ops bypass is keyed on session email so QA accounts can
    // exercise the flow from anywhere.
    const h = await headers();
    const country = h.get('x-vercel-ip-country');
    if (!isAllowedSubscriptionRegion(country, session?.user?.email)) {
      return NextResponse.json(
        {
          error: 'region_unavailable',
          message: 'Paid plans are available in the US only right now. We\'re working on EU/UK availability.',
          country: country ?? null,
        },
        { status: 403 }
      );
    }

    const priceId = getPriceIdForTier(requestedTier, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: 'price_not_configured', message: `No Stripe price configured for tier "${requestedTier}" (${interval}ly). Set the matching STRIPE_PRICE_ID_* env var.` },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;
    const finalSuccessUrl = successUrl || `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${origin}/subscribe`;

    // Logged-in user — block double-subscription, reuse Stripe customer.
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true, subscriptionStatus: true },
      });

      if (user?.subscriptionStatus === 'active') {
        return NextResponse.json(
          { error: 'already_subscribed', message: 'You already have an active subscription. Use the customer portal to switch plans.' },
          { status: 400 }
        );
      }

      if (user?.stripeCustomerId) {
        const checkoutSession = await getStripe().checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: finalSuccessUrl,
          cancel_url: finalCancelUrl,
          subscription_data: {
            metadata: {
              userId: session.user.id,
              tier: requestedTier,
              interval,
            },
          },
        });
        return NextResponse.json({ url: checkoutSession.url });
      }
    }

    // Anonymous or no-customer-id signed-in user — new Stripe customer.
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      subscription_data: {
        metadata: {
          source: 'autocarecompanion',
          userId: session?.user?.id || 'anonymous',
          tier: requestedTier,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    // Surface the actual Stripe error so debugging from the Vercel
    // function logs is possible. Stripe errors carry `.type`, `.code`,
    // and `.message` — all safe to log and the message is safe to
    // bubble up to the client (no secrets in it).
    const err = error as { type?: string; code?: string; message?: string; raw?: unknown; statusCode?: number };
    const errType = err.type || 'unknown';
    const errCode = err.code || 'unknown';
    const errMsg = err.message || 'Failed to create checkout session';
    console.error('[stripe.create-checkout] failed', {
      type: errType,
      code: errCode,
      statusCode: err.statusCode,
      message: errMsg,
    });
    return NextResponse.json(
      {
        error: 'create_failed',
        type: errType,
        code: errCode,
        message: errMsg,
      },
      { status: 500 }
    );
  }
}
