import { NextResponse } from 'next/server';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { TierId } from '@/lib/pricing/tiers';

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
    const { successUrl, cancelUrl } = body as { successUrl?: string; cancelUrl?: string };

    if (requestedTier !== 'plus' && requestedTier !== 'pro') {
      return NextResponse.json(
        { error: 'invalid_tier', message: 'tierId must be plus or pro' },
        { status: 400 }
      );
    }

    const priceId = getPriceIdForTier(requestedTier);
    if (!priceId) {
      return NextResponse.json(
        { error: 'price_not_configured', message: `No Stripe price configured for tier "${requestedTier}".` },
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
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'create_failed', message: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
