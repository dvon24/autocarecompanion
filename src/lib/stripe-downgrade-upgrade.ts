import type Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import { authoritativeProduct, objectId } from './billing-policy';
import { latestDowngrade, setDowngradeState } from './stripe-downgrade-journal';
import { readDowngradeQuote, scheduleMatches } from './stripe-downgrade-policy';
import { UpgradeQuoteError } from './stripe-upgrade-quote';

/** Read-only proof that the remaining schedule is our already-effective Visual
 * phase. Foreign schedules and pending undo/cancel never qualify for upgrade. */
export async function ownedVisualSchedule(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, userId: string, now: number) {
  if (!sub.schedule) {
    if (authoritativeProduct(sub) === 'visual') {
      const pending = await latestDowngrade(tx, sub.id);
      if (pending && ['cancel','undo','pending'].includes(pending.state)) throw new UpgradeQuoteError('unrelated_pending_update');
    }
    return null;
  }
  const op = await latestDowngrade(tx, sub.id);
  if (!op || !op.scheduleId || !['scheduled','completed'].includes(op.state) || op.userId !== userId || op.scheduleId !== objectId(sub.schedule))
    throw new UpgradeQuoteError('unrelated_pending_update');
  const q = readDowngradeQuote(op.token, now, true);
  if (q.userId !== userId || q.customerId !== objectId(sub.customer) || q.subscriptionId !== sub.id || q.operationId !== op.id
    || now < q.renewalAt || authoritativeProduct(sub) !== 'visual' || sub.items.data[0].price.id !== q.visualPriceId)
    throw new UpgradeQuoteError('unrelated_pending_update');
  const schedule = await stripe.subscriptionSchedules.retrieve(op.scheduleId);
  if (!scheduleMatches(schedule, q)) throw new UpgradeQuoteError('unrelated_pending_update');
  return { op, schedule };
}
/** Invoke only after immutable Hub upgrade dispatch has committed. */
export async function releaseVisualScheduleForUpgrade(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, userId: string, now: number) {
  const owned = await ownedVisualSchedule(tx, stripe, sub, userId, now);
  if (!owned) return;
  const released = await stripe.subscriptionSchedules.release(owned.schedule.id, { preserve_cancel_date: false });
  if (released.id !== owned.schedule.id || released.status !== 'released' || objectId(released.released_subscription) !== sub.id)
    throw new UpgradeQuoteError('upgrade_operation_needs_review');
  const current = await stripe.subscriptions.retrieve(sub.id);
  if (current.id !== sub.id || objectId(current.customer) !== objectId(sub.customer) || current.schedule || current.cancel_at_period_end || authoritativeProduct(current) !== 'visual')
    throw new UpgradeQuoteError('upgrade_operation_needs_review');
  await setDowngradeState(tx, owned.op.id, 'completed');
}
