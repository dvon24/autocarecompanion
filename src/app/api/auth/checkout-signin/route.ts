import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { RateLimiter } from '@/lib/rate-limit';

/**
 * POST /api/auth/checkout-signin — sign the buyer in right after Stripe
 * checkout so they land in their account without a second signup step.
 *
 * HARDENED (2026-06-12 review finding: this used to be an account-takeover
 * vector). A checkout-session ID is NOT a secret — it rides in the
 * /subscribe/success URL, browser history, Referer headers, and analytics
 * page_location — yet this route minted a 30-day session from it alone,
 * forever, including into EXISTING password-protected accounts. Now:
 *
 *   1. The session must be fresh (created within the last 30 minutes) —
 *      kills the "durable bearer credential" property.
 *   2. If a user with that email already has a password, we attach the
 *      subscription to their account but DO NOT log the caller in — they
 *      are redirected to sign in normally. Auto-login only ever creates or
 *      reuses passwordless checkout-created accounts.
 *   3. Per-IP rate limit so session IDs can't be enumerated.
 */

const CHECKOUT_SIGNIN_MAX_AGE_S = 30 * 60;
const ipLimiter = new RateLimiter(60 * 60 * 1000, 10); // 10/hour per IP

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : '') || 'unknown';
}

export async function POST(request: Request) {
  try {
    if (!ipLimiter.check(clientIp(request)).success) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Freshness gate: only the browser that JUST completed checkout should
    // be holding a young session ID. Stale IDs (leaked via logs/history)
    // can no longer mint sessions.
    const ageSeconds = Math.floor(Date.now() / 1000) - (checkoutSession.created || 0);
    if (ageSeconds > CHECKOUT_SIGNIN_MAX_AGE_S) {
      return NextResponse.json(
        { error: 'Checkout session expired. Please sign in normally — your subscription is active.', signin: true },
        { status: 401 }
      );
    }

    const customerEmail = checkoutSession.customer_details?.email;
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      );
    }

    // Find or create the user
    const customerId = typeof checkoutSession.customer === 'string'
      ? checkoutSession.customer
      : checkoutSession.customer?.id;
    const subscriptionId = typeof checkoutSession.subscription === 'string'
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;

    // Existing password-protected account: attach the subscription (they
    // paid for it) but never auto-login over their credentials.
    const existing = await prisma.user.findUnique({
      where: { email: customerEmail },
      select: { id: true, passwordHash: true },
    });

    const user = await prisma.user.upsert({
      where: { email: customerEmail },
      update: {
        stripeCustomerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        subscriptionStatus: 'active',
      },
      create: {
        email: customerEmail,
        name: checkoutSession.customer_details?.name || null,
        stripeCustomerId: customerId || null,
        subscriptionId: subscriptionId || null,
        subscriptionStatus: 'active',
      },
    });

    if (existing?.passwordHash) {
      return NextResponse.json(
        { error: 'This email already has an account. Please sign in — your subscription is active.', signin: true },
        { status: 401 }
      );
    }

    // Create a JWT token for the user
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
      },
      secret: process.env.AUTH_SECRET!,
      salt: 'authjs.session-token', // Cookie name used as salt
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('authjs.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error signing in after checkout:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
