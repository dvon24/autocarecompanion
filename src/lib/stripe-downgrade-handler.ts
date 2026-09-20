import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import type { prisma as Database } from './db';
import { authoritativeProduct, objectId } from './billing-policy';
import { assertUsdPlanPrice } from './stripe-checkout-policy';
import { getBillingEnrollmentReview } from './billing-enrollment-review';
import { activeDowngrade, downgradeJournalAvailable, latestDowngrade, setDowngradeState, type DowngradeOperation } from './stripe-downgrade-journal';
import { assertSimpleHub, DOWNGRADE_RETRY_SECONDS, downgradeEnabled, DowngradeError, downgradeScheduleParameters, makeDowngradeQuote, quoteMatches, readDowngradeQuote, scheduleMatches, signDowngradeQuote, type DowngradeQuote } from './stripe-downgrade-policy';

export type DowngradeDependencies = {
  auth: () => Promise<{ user?: { id?: string } } | null>;
  prisma: Pick<typeof Database, '$transaction'>; getStripe: () => Stripe;
  getPriceIdForTier: (tier: 'visual') => string | null | undefined; now?: () => number;
};
export const billingTransactionOptions = { timeout: 30000, maxWait: 10000 };
export async function ownedBillingSubscription(tx: Prisma.TransactionClient, stripe: Stripe, userId: string) {
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.subscriptionId || !user.stripeCustomerId) throw new DowngradeError('subscription_missing', 404);
  const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
  if (sub.id !== user.subscriptionId || objectId(sub.customer) !== user.stripeCustomerId) throw new DowngradeError('subscription_binding_mismatch');
  return { user, sub };
}
function operationQuote(op: DowngradeOperation, sub: Stripe.Subscription, userId: string, now: number) {
  const q = readDowngradeQuote(op.token, now, true);
  if (op.userId !== userId || q.userId !== userId || op.id !== q.operationId || op.subscriptionId !== sub.id
    || q.subscriptionId !== sub.id || q.customerId !== objectId(sub.customer)) throw new DowngradeError('downgrade_needs_review');
  return q;
}
function assertRetry(op: DowngradeOperation, q: DowngradeQuote, now: number) {
  if (now >= q.renewalAt || now - Math.floor(op.dispatchedAt.getTime() / 1000) >= DOWNGRADE_RETRY_SECONDS)
    throw new DowngradeError('downgrade_needs_review');
}
function assertUndoBeforeTransition(sub: Stripe.Subscription, q: DowngradeQuote, now: number) {
  if (now >= q.renewalAt || authoritativeProduct(sub) !== 'hub') throw new DowngradeError('downgrade_already_started');
  if (!quoteMatches(q, sub)) throw new DowngradeError('downgrade_subscription_changed');
}
/** Recover a completed provider update from the attached exact schedule and
 * current canonical phase. This never creates or edits a provider schedule. */
async function recoverWorkingDowngrade(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, op: DowngradeOperation, userId: string, now: () => number): Promise<{ sub: Stripe.Subscription; op: DowngradeOperation | undefined }> {
  const q = operationQuote(op, sub, userId, now());
  if (op.state === 'cancel') return { sub, op };
  if (sub.schedule) {
    const scheduleId = objectId(sub.schedule)!;
    if (op.scheduleId && op.scheduleId !== scheduleId) throw new DowngradeError('downgrade_needs_review');
    const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
    const current = await stripe.subscriptions.retrieve(sub.id);
    operationQuote(op, current, userId, now());
    const item = current.items.data[0];
    const visualPhase = authoritativeProduct(current) === 'visual' && item.price.id === q.visualPriceId
      && now() >= q.renewalAt && item.current_period_start === q.renewalAt && item.current_period_end === schedule.phases[1]?.end_date;
    if (objectId(current.schedule) !== scheduleId || !scheduleMatches(schedule, q)
      || (!quoteMatches(q, current) && !visualPhase)) return { sub: current, op };
    if (!op.scheduleId) await tx.$executeRaw`UPDATE "SubscriptionDowngrade" SET "scheduleId" = ${scheduleId} WHERE "id" = ${op.id}`;
    const state = op.state === 'pending' || (op.state === 'undo' && now() >= q.renewalAt) ? 'scheduled' : op.state;
    if (state !== op.state) await setDowngradeState(tx, op.id, state);
    return { sub: current, op: { ...op, scheduleId, state } };
  }
  if (authoritativeProduct(sub) === 'visual' && now() >= q.renewalAt && sub.items.data[0].price.id === q.visualPriceId
    && sub.items.data[0].current_period_start >= q.renewalAt) {
    await setDowngradeState(tx, op.id, 'completed'); return { sub, op: undefined };
  }
  if (op.state === 'undo' && now() >= q.renewalAt && authoritativeProduct(sub) === 'hub') {
    await setDowngradeState(tx, op.id, 'undone'); return { sub, op: undefined };
  }
  return { sub, op };
}
/** A create response may have been lost before scheduleId committed. Recover only
 * through the same unexpired provider key, never by adopting an unbound schedule. */
async function recoverCreatedSchedule(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, op: DowngradeOperation, q: DowngradeQuote, now: () => number) {
  if (op.scheduleId) {
    const schedule = await stripe.subscriptionSchedules.retrieve(op.scheduleId);
    if (schedule.id !== op.scheduleId || objectId(schedule.customer) !== q.customerId
      || (objectId(schedule.subscription) || objectId(schedule.released_subscription)) !== q.subscriptionId) throw new DowngradeError('downgrade_needs_review');
    return schedule;
  }
  if (sub.schedule) {
    const attached = await stripe.subscriptionSchedules.retrieve(objectId(sub.schedule)!);
    if (scheduleMatches(attached, q)) {
      await tx.$executeRaw`UPDATE "SubscriptionDowngrade" SET "scheduleId" = ${attached.id} WHERE "id" = ${op.id}`;
      return attached;
    }
  }
  assertRetry(op, q, now());
  const schedule = await stripe.subscriptionSchedules.create({ from_subscription: sub.id }, { idempotencyKey: `au7o-downgrade-create-${op.id}` });
  if (schedule.status !== 'active' || objectId(schedule.subscription) !== sub.id || objectId(schedule.customer) !== q.customerId
    || (sub.schedule && objectId(sub.schedule) !== schedule.id)) throw new DowngradeError('downgrade_needs_review');
  await tx.$executeRaw`UPDATE "SubscriptionDowngrade" SET "scheduleId" = ${schedule.id} WHERE "id" = ${op.id}`;
  // Idempotent create may return an old snapshot after update/release succeeded.
  const fresh = await stripe.subscriptionSchedules.retrieve(schedule.id);
  if (fresh.id !== schedule.id || objectId(fresh.customer) !== q.customerId
    || (objectId(fresh.subscription) || objectId(fresh.released_subscription)) !== sub.id) throw new DowngradeError('downgrade_needs_review');
  return fresh;
}
/** Caller committed desired undo/cancel first, then reacquired the account lock.
 * Release is scoped to the exact persisted schedule; released outcomes are read back. */
export async function releaseDowngrade(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, op: DowngradeOperation, userId: string, now: () => number) {
  const q = operationQuote(op, sub, userId, now());
  if (op.state !== 'cancel') assertUndoBeforeTransition(sub, q, now());
  // Current provider detachment is sufficient to cancel/undo. Never recreate
  // an uncertain or expired schedule just to remove it; natural completion is
  // also detached and need not have released_subscription populated.
  if (!sub.schedule) return;
  const schedule = await recoverCreatedSchedule(tx, stripe, sub, op, q, now);
  if (schedule.status === 'released') {
    if (objectId(sub.schedule)) throw new DowngradeError('downgrade_needs_review');
    return;
  }
  if (schedule.status !== 'active' || (sub.schedule && objectId(sub.schedule) !== schedule.id)
    || (schedule.metadata?.au7oDowngradeOperation && schedule.metadata.au7oDowngradeOperation !== op.id)) throw new DowngradeError('downgrade_needs_review');
  const beforeRelease = await stripe.subscriptions.retrieve(sub.id);
  operationQuote(op, beforeRelease, userId, now());
  if (op.state !== 'cancel') assertUndoBeforeTransition(beforeRelease, q, now());
  if (objectId(beforeRelease.schedule) !== schedule.id) throw new DowngradeError('downgrade_needs_review');
  // Releasing never creates or charges, so retries remain safe beyond key retention.
  const released = await stripe.subscriptionSchedules.release(schedule.id, { preserve_cancel_date: false });
  if (released.id !== schedule.id || released.status !== 'released' || objectId(released.released_subscription) !== sub.id) throw new DowngradeError('downgrade_needs_review');
  const current = await stripe.subscriptions.retrieve(sub.id);
  if (current.id !== sub.id || objectId(current.customer) !== q.customerId || current.schedule) throw new DowngradeError('downgrade_needs_review');
  if (op.state !== 'cancel') assertUndoBeforeTransition(current, q, now());
}
export function downgradeFailure(error: unknown) {
  const code = error instanceof DowngradeError ? error.code : 'downgrade_unavailable';
  const messages: Record<string, string> = {
    downgrade_unavailable: 'The change could not be confirmed. Recheck your plan change to resume it safely, or contact support.',
    downgrade_disabled: 'Scheduling a change to Visual is not available yet. You can still manage billing and cancel your subscription.',
    downgrade_configuration_unsupported: 'This subscription has billing settings that need support review before a change to Visual. You can still cancel your subscription.',
    downgrade_needs_review: 'This plan change needs billing review. Recheck its status or contact support before starting another change.',
    downgrade_subscription_changed: 'Your subscription changed. Recheck billing and review the current plan details again.',
    downgrade_quote_expired: 'This review expired. Review the change to Visual again before confirming.',
    downgrade_quote_invalid: 'This review could not be verified. Review the change to Visual again.',
    downgrade_already_started: 'The change date has arrived. Recheck billing for your current plan before making another change.',
    downgrade_consent_required: 'Review and confirm the date and Visual renewal terms before scheduling this change.',
    subscription_binding_mismatch: 'The subscription could not be matched to your account. Contact support.',
    subscription_missing: 'No subscription is available on this account.',
    verified_subscription_required: 'Verify your email and resolve any billing review before changing plans.',
    unrelated_schedule: 'Another subscription schedule needs billing review before this change can continue.',
    unauthorized: 'Sign in to manage your subscription.',
  };
  return NextResponse.json({ error: code, message: messages[code] || messages.downgrade_needs_review },
    { status: error instanceof DowngradeError ? error.status : 503, headers: { 'Cache-Control': 'private, no-store' } });
}
export function createDowngradeHandler(deps: DowngradeDependencies) {
  const now = deps.now || (() => Math.floor(Date.now() / 1000));
  return async function POST(request: Request) {
    const respond = (body: Record<string, unknown>) => NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } });
    try {
      const session = await deps.auth(); if (!session?.user?.id) throw new DowngradeError('unauthorized', 401);
      const userId = session.user.id; const stripe = deps.getStripe();
      const body = await request.json().catch(() => ({}));
      if (!['status','preview','confirm','undo','resume'].includes(body?.action)) throw new DowngradeError('downgrade_consent_required', 400);
      if (body.action === 'confirm' && body.confirmPeriodEnd !== true) throw new DowngradeError('downgrade_consent_required', 400);
      // Durable dispatch intent commits before any provider mutation. Cancel/undo
      // can supersede pending work while an earlier request is between phases.
      const first = await deps.prisma.$transaction(async tx => {
        const { user, sub: boundSub } = await ownedBillingSubscription(tx, stripe, userId);
        let sub: Stripe.Subscription = boundSub;
        const available = await downgradeJournalAvailable(tx);
        const latest = available ? await latestDowngrade(tx, sub.id) : undefined;
        let op = activeDowngrade(latest);
        if (op && body.action === 'undo') assertUndoBeforeTransition(sub, operationQuote(op, sub, userId, now()), now());
        if (op && ['status','resume'].includes(body.action)) ({ sub, op } = await recoverWorkingDowngrade(tx, stripe, sub, op, userId, now));
        if (op && authoritativeProduct(sub) === 'visual') {
          const q = operationQuote(op, sub, userId, now());
          if (now() < q.renewalAt || sub.items.data[0].price.id !== q.visualPriceId) throw new DowngradeError('downgrade_needs_review');
          // Keep the managed Visual phase visible to upgrade/cancel until release.
          if (op.state !== 'cancel' && !sub.schedule) { await setDowngradeState(tx, op.id, 'completed'); op = undefined; }
        }
        if (body.action === 'status') {
          let pending = false;
          if (op) {
            const q = operationQuote(op, sub, userId, now());
            if (op.scheduleId && op.state === 'scheduled' && authoritativeProduct(sub) === 'visual') {
              const schedule = await stripe.subscriptionSchedules.retrieve(op.scheduleId);
              if (!scheduleMatches(schedule, q)) throw new DowngradeError('downgrade_needs_review');
              return { response: { ok: true, available: downgradeEnabled() && available, pending: false, currentProduct: 'visual' } };
            }
            if (op.scheduleId && op.state === 'scheduled') {
              const schedule = await stripe.subscriptionSchedules.retrieve(op.scheduleId);
              pending = objectId(sub.schedule) === op.scheduleId && scheduleMatches(schedule, q) && quoteMatches(q, sub) && !sub.cancel_at_period_end;
            }
            return { response: { ok: true, available: downgradeEnabled() && available, pending, recoveryRequired: !pending, action: op.state, renewalAt: q.renewalAt } };
          }
          return { response: { ok: true, available: downgradeEnabled() && available, pending: false, currentProduct: authoritativeProduct(sub) } };
        }
        if (body.action === 'undo' || body.action === 'resume') {
          if (!op) return { response: { ok: true, pending: false, currentProduct: authoritativeProduct(sub) } };
          if (op.state === 'cancel') throw new DowngradeError('downgrade_needs_review');
          if (body.action === 'resume' && op.state === 'scheduled' && authoritativeProduct(sub) === 'visual')
            return { response: { ok: true, pending: false, currentProduct: 'visual' } };
          if (body.action === 'undo') await setDowngradeState(tx, op.id, 'undo');
          return { operationId: op.id };
        }
        if (op) {
          if (body.action === 'confirm' && body.quote === op.token && !['undo','cancel'].includes(op.state)) return { operationId: op.id };
          throw new DowngradeError('downgrade_needs_review');
        }
        if (!downgradeEnabled() || !available) throw new DowngradeError('downgrade_disabled', 503);
        if (!user.emailVerified) throw new DowngradeError('verified_subscription_required', 403);
        const review = await getBillingEnrollmentReview(tx, userId, sub.id);
        if (review && (review.state === 'review_required' || !review.initialVerified)) throw new DowngradeError('verified_subscription_required');
        assertSimpleHub(sub, now()); if (sub.schedule) throw new DowngradeError('unrelated_schedule');
        const subscriptions = await stripe.subscriptions.list({ customer: user.stripeCustomerId!, status: 'all', limit: 100 });
        const currentSubscriptions = subscriptions.data.filter(s => !['canceled','incomplete_expired'].includes(s.status));
        if (subscriptions.has_more || currentSubscriptions.length !== 1 || currentSubscriptions[0].id !== sub.id) throw new DowngradeError('downgrade_needs_review');
        const priceId = deps.getPriceIdForTier('visual'); if (!priceId) throw new DowngradeError('downgrade_disabled', 503);
        assertUsdPlanPrice(await stripe.prices.retrieve(priceId), 'visual', 'month');
        const customer = await stripe.customers.retrieve(user.stripeCustomerId!);
        const pendingItems = await stripe.invoiceItems.list({ customer: user.stripeCustomerId!, pending: true, limit: 1 });
        if (customer.deleted || customer.balance !== 0 || pendingItems.data.length || pendingItems.has_more) throw new DowngradeError('downgrade_configuration_unsupported');
        const q = body.action === 'preview' ? makeDowngradeQuote(sub, userId, priceId, now()) : readDowngradeQuote(body.quote, now());
        if (q.userId !== userId || q.visualPriceId !== priceId || !quoteMatches(q, sub)) throw new DowngradeError('downgrade_subscription_changed');
        const token = body.action === 'preview' ? signDowngradeQuote(q) : body.quote;
        if (body.action === 'preview') return { response: { ok: true, quote: { token, renewalAt: q.renewalAt, monthlyAmount: 499, currency: 'usd', expiresAt: q.expiresAt } } };
        const replay = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "SubscriptionDowngrade" WHERE "id" = ${q.operationId}`;
        if (replay.length) throw new DowngradeError('downgrade_quote_invalid');
        await tx.$executeRaw`INSERT INTO "SubscriptionDowngrade" ("id", "userId", "subscriptionId", "token", "state", "dispatchedAt") VALUES (${q.operationId}, ${userId}, ${sub.id}, ${token}, 'pending', ${new Date(now() * 1000)})`;
        return { operationId: q.operationId };
      }, billingTransactionOptions);
      if (first.response) return respond(first.response);
      const result = await deps.prisma.$transaction(async tx => {
        const { sub } = await ownedBillingSubscription(tx, stripe, userId);
        const op = activeDowngrade(await latestDowngrade(tx, sub.id));
        if (!op || op.id !== first.operationId || op.state === 'cancel') throw new DowngradeError('downgrade_needs_review');
        const q = operationQuote(op, sub, userId, now());
        if (op.state === 'undo') {
          try { await releaseDowngrade(tx, stripe, sub, op, userId, now); }
          catch (error) {
            if (!(error instanceof DowngradeError) || error.code !== 'downgrade_already_started') throw error;
            // Commit the observed missed deadline instead of leaving an undo
            // intent that would incorrectly block a later reviewed upgrade.
            const current = await stripe.subscriptions.retrieve(sub.id);
            await recoverWorkingDowngrade(tx, stripe, current, op, userId, now);
            return downgradeFailure(error);
          }
          await setDowngradeState(tx, op.id, 'undone');
          return { ok: true, pending: false, keptHub: true };
        }
        assertSimpleHub(sub, now()); if (!quoteMatches(q, sub)) throw new DowngradeError('downgrade_subscription_changed');
        if (q.visualPriceId !== deps.getPriceIdForTier('visual')) throw new DowngradeError('downgrade_subscription_changed');
        assertUsdPlanPrice(await stripe.prices.retrieve(q.visualPriceId), 'visual', 'month');
        const customer = await stripe.customers.retrieve(q.customerId);
        const pendingItems = await stripe.invoiceItems.list({ customer: q.customerId, pending: true, limit: 1 });
        if (customer.deleted || customer.balance !== 0 || pendingItems.data.length || pendingItems.has_more) throw new DowngradeError('downgrade_configuration_unsupported');
        if (op.scheduleId && objectId(sub.schedule) !== op.scheduleId) throw new DowngradeError('unrelated_schedule');
        const schedule = await recoverCreatedSchedule(tx, stripe, sub, op, q, now);
        if (scheduleMatches(schedule, q)) {
          await setDowngradeState(tx, op.id, 'scheduled');
          return { ok: true, pending: true, renewalAt: q.renewalAt };
        }
        if (op.state === 'scheduled' || schedule.status !== 'active' || schedule.metadata?.au7oDowngradeOperation
          || schedule.phases.length !== 1 || schedule.phases[0].items.length !== 1 || objectId(schedule.phases[0].items[0].price) !== q.hubPriceId)
          throw new DowngradeError('downgrade_needs_review');
        assertRetry(op, q, now());
        const updated = await stripe.subscriptionSchedules.update(schedule.id, downgradeScheduleParameters(q), { idempotencyKey: `au7o-downgrade-update-${op.id}` });
        const current = await stripe.subscriptions.retrieve(sub.id);
        if (updated.id !== schedule.id || !scheduleMatches(updated, q) || !quoteMatches(q, current) || objectId(current.schedule) !== schedule.id || current.cancel_at_period_end)
          throw new DowngradeError('downgrade_needs_review');
        await setDowngradeState(tx, op.id, 'scheduled');
        return { ok: true, pending: true, renewalAt: q.renewalAt };
      }, billingTransactionOptions);
      return result instanceof NextResponse ? result : respond(result);
    } catch (error) { return downgradeFailure(error); }
  };
}
