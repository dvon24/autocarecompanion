import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
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
