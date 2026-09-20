import type Stripe from 'stripe';
import { NextResponse } from 'next/server';
import type { prisma as Database } from './db';
import { objectId } from './billing-policy';
import { reconcileBillingSubscription } from './billing-reconcile';

export function createStripeWebhookHandler(deps: { prisma: typeof Database; getStripe: () => Stripe; secret: () => string | undefined }) {
  return async function POST(request: Request) {
    const secret = deps.secret();
    if (!secret) return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 });
    let event: Stripe.Event;
    try { event = deps.getStripe().webhooks.constructEvent(await request.text(), request.headers.get('stripe-signature') || '', secret); }
    catch { return NextResponse.json({ error: 'invalid_signature' }, { status: 400 }); }
    const object = event.data.object;
    let subscriptionId: string | null = null;
    let checkoutId: string | null = null;
    if (event.type.startsWith('customer.subscription.')) subscriptionId = (object as Stripe.Subscription).id;
    else if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const checkout = object as Stripe.Checkout.Session;
      subscriptionId = objectId(checkout.subscription); checkoutId = checkout.id;
    } else if (['invoice.paid', 'invoice.payment_failed', 'invoice.payment_action_required'].includes(event.type)) {
      subscriptionId = objectId((object as Stripe.Invoice).parent?.subscription_details?.subscription);
    }
    if (!subscriptionId) return NextResponse.json({ received: true });
    try {
      const stripe = deps.getStripe();
      // Use the event only to identify the resource. Every event re-reads current
      // Stripe state AFTER taking the same lock as checkout and upgrades.
      const initial = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = objectId(initial.customer);
      if (!customerId) throw new Error('missing customer');
      const user = await deps.prisma.user.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
      if (!user) {
        // A just-created checkout can race the transaction binding its customer.
        // A signed app attempt signal warrants retry, never email-based linking.
        if (initial.metadata.attemptKey) throw new Error('customer binding pending');
        return NextResponse.json({ received: true });
      }
      await deps.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${user.id}, 0))`;
        if (await tx.billingEvent.findUnique({ where: { id: event.id } })) return;
        await reconcileBillingSubscription(tx, stripe, user.id, subscriptionId!, checkoutId);
        // The receipt and state commit together. Transient failures leave no receipt.
        await tx.billingEvent.create({ data: { id: event.id } });
      }, { timeout: 30000, maxWait: 10000 });
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('[billing.webhook] reconciliation failed', error instanceof Error ? error.name : 'unknown');
      return NextResponse.json({ error: 'reconciliation_pending' }, { status: 503 });
    }
  };
}
