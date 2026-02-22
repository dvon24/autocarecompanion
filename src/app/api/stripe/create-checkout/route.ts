import { NextResponse } from 'next/server';
import { getStripe, SUBSCRIPTION_PRICE_ID } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { successUrl, cancelUrl } = await request.json();

    const origin = new URL(request.url).origin;
    const finalSuccessUrl = successUrl || `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${origin}/subscribe`;

    if (!SUBSCRIPTION_PRICE_ID) {
      return NextResponse.json(
        { error: 'Subscription price not configured' },
        { status: 500 }
      );
    }

    // If user is logged in, check if they already have a subscription
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true, subscriptionStatus: true },
      });

      if (user?.subscriptionStatus === 'active') {
        return NextResponse.json(
          { error: 'You already have an active subscription' },
          { status: 400 }
        );
      }

      // If they have a Stripe customer ID, use it
      if (user?.stripeCustomerId) {
        const checkoutSession = await getStripe().checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: SUBSCRIPTION_PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: finalSuccessUrl,
          cancel_url: finalCancelUrl,
          subscription_data: {
            metadata: {
              userId: session.user.id,
            },
          },
        });

        return NextResponse.json({ url: checkoutSession.url });
      }
    }

    // Create checkout session for new customer
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      subscription_data: {
        metadata: {
          source: 'autocarecompanion',
          userId: session?.user?.id || 'anonymous',
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
