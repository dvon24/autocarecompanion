import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { billingOrigin } from '@/lib/billing-policy';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Portal configuration must disable paid plan switching; upgrades have
    // their own verified-US flow. Cancellation remains available while traveling.
    const configuration = process.env.STRIPE_ACCOUNT_PORTAL_CONFIGURATION_ID;
    if (!configuration) return NextResponse.json({ error: 'portal_not_configured' }, { status: 503 });
    const policy = await getStripe().billingPortal.configurations.retrieve(configuration);
    if (policy.features.subscription_update?.enabled) return NextResponse.json({ error: 'portal_configuration_invalid' }, { status: 503 });

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      configuration,
      return_url: `${billingOrigin()}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
