import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import type { TierId } from '@/lib/pricing/tiers';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/change-tier
 *
 * Body: { tierId: 'plus' | 'pro' }
 *
 * Switches the user's existing Stripe subscription from one paid tier
 * to another. Used for in-account upgrades (Plus → Pro) and downgrades
 * (Pro → Plus). Free is not reachable here — going to free means
 * canceling, which lives at /api/account/cancel-subscription.
 *
 * Upgrade vs downgrade behavior:
 *   - Upgrade (Plus → Pro): immediate, prorated charge for the
 *     difference, takes effect right away. proration_behavior =
 *     'always_invoice' would charge now; 'create_prorations' (the
 *     default we use) creates the proration line and bills it on the
 *     next invoice — gentler on the card and Stripe-idiomatic.
 *   - Downgrade (Pro → Plus): same — proration is credited on next
 *     invoice, no refund right now.
 *
 * Same-tier requests are a no-op 200 so the UI can fire-and-forget.
 *
 * Region gate matches /api/stripe/create-checkout — users outside the
 * allowed region can't initiate paid changes, but already-paying
 * non-US users (grandfathered) can still cancel via the cancel
 * endpoint.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const requestedTier = body.tierId as TierId | undefined;
    if (requestedTier !== 'plus' && requestedTier !== 'pro') {
      return NextResponse.json(
        { error: 'invalid_tier', message: 'tierId must be plus or pro' },
        { status: 400 }
      );
    }

    const h = await headers();
    const country = h.get('x-vercel-ip-country');
    if (!isAllowedSubscriptionRegion(country, session.user.email)) {
      return NextResponse.json(
        {
          error: 'region_unavailable',
          message: 'Paid plan changes are available in the US only right now.',
          country: country ?? null,
        },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionId: true, subscriptionStatus: true, subscriptionTier: true },
    });

    if (!user?.subscriptionId) {
      return NextResponse.json(
        {
          error: 'no_active_subscription',
          message: 'You don\'t have a subscription to change. Go to /subscribe to start one.',
        },
        { status: 404 }
      );
    }

    if (user.subscriptionTier === requestedTier) {
      // No-op — already on this tier. Return 200 so the UI can treat
      // this as success and refresh its state.
      return NextResponse.json({
        ok: true,
        tier: requestedTier,
        changed: false,
      });
    }

    const newPriceId = getPriceIdForTier(requestedTier);
    if (!newPriceId) {
      return NextResponse.json(
        {
          error: 'price_not_configured',
          message: `No Stripe price configured for tier "${requestedTier}". Set STRIPE_PRICE_ID_${requestedTier.toUpperCase()}.`,
        },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
    const item = sub.items?.data?.[0];
    if (!item) {
      return NextResponse.json(
        { error: 'subscription_item_missing', message: 'Subscription has no items to update.' },
        { status: 500 }
      );
    }

    const updated = await stripe.subscriptions.update(user.subscriptionId, {
      items: [{ id: item.id, price: newPriceId }],
      // proration_behavior defaults to 'create_prorations' — proration
      // line is recorded now and billed on the next invoice rather than
      // immediately charging the card. Right move for trust + Stripe-idiomatic.
      proration_behavior: 'create_prorations',
      metadata: {
        ...sub.metadata,
        tier: requestedTier,
        userId: session.user.id,
      },
    });

    // Persist eagerly so the UI reflects the change without waiting on
    // the webhook round-trip. The webhook will idempotently re-apply
    // the same value when it arrives.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionTier: requestedTier, subscriptionStatus: updated.status },
    });

    return NextResponse.json({
      ok: true,
      tier: requestedTier,
      changed: true,
      status: updated.status,
    });
  } catch (error) {
    const err = error as { type?: string; code?: string; message?: string; statusCode?: number };
    console.error('[stripe.change-tier] failed', {
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
    });
    return NextResponse.json(
      {
        error: 'change_failed',
        type: err.type ?? 'unknown',
        code: err.code ?? 'unknown',
        message: err.message ?? 'Failed to change tier',
      },
      { status: 500 }
    );
  }
}
