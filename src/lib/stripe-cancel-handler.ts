import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { prisma as Database } from './db';
import { objectId } from './billing-policy';
import { activeDowngrade, latestDowngrade, setDowngradeState } from './stripe-downgrade-journal';
import { billingTransactionOptions, downgradeFailure, ownedBillingSubscription, releaseDowngrade } from './stripe-downgrade-handler';
import { DowngradeError } from './stripe-downgrade-policy';
import { isAllowedSubscriptionRegion } from './pricing/region';
import { publicEnrollmentEnabled } from './product-entitlements';

export function createCancelSubscriptionHandler(deps: {
  auth: () => Promise<{ user?: { id?: string } } | null>;
  prisma: Pick<typeof Database, '$transaction'>; getStripe: () => Stripe; now?: () => number;
  audit?: (event: { userId: string; subscriptionId: string; action: string; status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: number | null }) => void;
}) {
  const now = deps.now || (() => Math.floor(Date.now() / 1000));
  return async function POST(request: Request) {
    try {
      const session = await deps.auth(); if (!session?.user?.id) throw new DowngradeError('unauthorized', 401);
      const userId = session.user.id; const body = await request.json().catch(() => ({})); const reactivate = body?.reactivate === true;
      if (reactivate && (!publicEnrollmentEnabled() || !isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))))
        return NextResponse.json({ error: 'paid_change_unavailable' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
      const stripe = deps.getStripe();
      // Persist cancellation supersession before a release can reach Stripe.
      const immediate = await deps.prisma.$transaction(async tx => {
        const { sub } = await ownedBillingSubscription(tx, stripe, userId);
        const op = activeDowngrade(await latestDowngrade(tx, sub.id));
        if (reactivate && (op || sub.schedule)) throw new DowngradeError('downgrade_needs_review');
        if (op) await setDowngradeState(tx, op.id, 'cancel');
        else {
          if (sub.schedule) throw new DowngradeError('unrelated_schedule');
          const result = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: !reactivate });
          if (result.id !== sub.id || objectId(result.customer) !== objectId(sub.customer)
            || result.cancel_at_period_end !== !reactivate || result.schedule) throw new DowngradeError('downgrade_needs_review');
          return result;
        }
      }, billingTransactionOptions);
      const updated = immediate || await deps.prisma.$transaction(async tx => {
        const { sub } = await ownedBillingSubscription(tx, stripe, userId);
        const op = activeDowngrade(await latestDowngrade(tx, sub.id));
        if (reactivate && (op || sub.schedule)) throw new DowngradeError('downgrade_needs_review');
        if (op) {
          if (op.state !== 'cancel') throw new DowngradeError('downgrade_needs_review');
          await releaseDowngrade(tx, stripe, sub, op, userId, now);
        } else if (sub.schedule) throw new DowngradeError('unrelated_schedule');
        const result = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: !reactivate });
        if (result.id !== sub.id || objectId(result.customer) !== objectId(sub.customer)
          || result.cancel_at_period_end !== !reactivate || result.schedule) throw new DowngradeError('downgrade_needs_review');
        if (op) await setDowngradeState(tx, op.id, 'canceled');
        return result;
      }, billingTransactionOptions);
      const auditEvent = { userId, subscriptionId: updated.id, action: reactivate ? 'reactivate' : 'cancel', status: updated.status,
        cancelAtPeriodEnd: updated.cancel_at_period_end, currentPeriodEnd: updated.items.data[0]?.current_period_end ?? null };
      try { (deps.audit || (event => console.info('[cancel-sub]', event)))(auditEvent); } catch { /* Logging must not turn verified success into an ambiguous billing retry. */ }
      return NextResponse.json({ ok: true, action: reactivate ? 'reactivated' : 'canceled', cancelAtPeriodEnd: updated.cancel_at_period_end,
        currentPeriodEnd: updated.items.data[0]?.current_period_end ?? null, status: updated.status }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) { return downgradeFailure(error); }
  };
}
