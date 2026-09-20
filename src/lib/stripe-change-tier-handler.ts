import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import type { prisma as Database } from './db';
import type { getStripe as StripeFactory, getPriceIdForTier as PriceResolver } from './stripe';
import { isAllowedSubscriptionRegion } from './pricing/region';
import { publicEnrollmentEnabled } from './product-entitlements';
import { getBillingEnrollmentReview } from './billing-enrollment-review';
import { authoritativeProduct, objectId } from './billing-policy';
import { assertUsdPlanPrice } from './stripe-checkout-policy';
import { getLiveTwinForVehicle, resolveTwinTransmissionBranch } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { ownedVisualSchedule, releaseVisualScheduleForUpgrade } from './stripe-downgrade-upgrade';
import { newOperationId, previewUpgrade, publicUpgradeQuote, QUOTE_SECONDS, readUpgradeQuote, RETRY_SECONDS, signUpgradeQuote, UpgradeQuoteError, upgradeParameters, upgradeQuoteHash, vehicleQuoteHash, type UpgradeQuote } from './stripe-upgrade-quote';

type Attempt = {
  userId: string; subscriptionId: string; token: string; vehicleId: string;
  createdAt: Date; dispatchStartedAt: Date | null; invoiceId: string | null; completedAt: Date | null;
};
type Result = { kind: 'reply'; body: Record<string, unknown>; status?: number }
  | { kind: 'continue'; subscriptionId: string; token: string };
const options = { timeout: 30000, maxWait: 10000 };
const reply = (body: Record<string, unknown>, status = 200): Result => ({ kind: 'reply', body, status });
function failure(code: string, status = 409): Result {
  const messages: Record<string, string> = {
    upgrade_operation_needs_review: 'Your earlier upgrade could not be confirmed and needs billing or support review. Open Account to review billing; no new upgrade has been started.',
    upgrade_quote_changed: 'Upgrade details changed. Review the current price and confirm again.',
    upgrade_quote_expired: 'Your upgrade quote expired. Review the current price and confirm again.',
    upgrade_quote_invalid: 'This upgrade quote could not be verified. Review the current price and confirm again.',
    enrollment_closed: 'New subscriptions and upgrades are not currently available. Your existing access remains available in Account.',
    region_unavailable: 'Subscriptions and upgrades are currently available in the United States only.',
    unauthorized: 'Sign in to the account with your Visual subscription to review an upgrade.',
    verified_subscription_required: 'Verify your email and open Account to confirm your existing Visual subscription before upgrading.',
    us_billing_required: 'Confirm that you live in the United States and use a US billing address before continuing.',
    us_provider_billing_required: 'Your saved billing address and card must use a US billing address. Open Account to update billing details before upgrading.',
    multiple_subscriptions_need_review: 'More than one subscription or an incomplete subscription history needs billing review. Open Account or contact support before upgrading.',
    subscription_not_active: 'Your subscription is not eligible for an upgrade in its current billing state. Open Account to review payment or paused billing.',
    subscription_not_upgradable: 'This subscription cannot be upgraded through the Visual-to-Hub offer. Open Account to review your plan.',
    unrelated_pending_update: 'Another subscription change is pending. Open Account to review it before starting a Hub upgrade.',
    owner_ready_vehicle_required: 'Choose an available exact vehicle and confirm its actual mileage and transmission before upgrading.',
    price_not_configured: 'Hub upgrade pricing is temporarily unavailable. Try again later or contact support.',
    upgrade_quote_unavailable: 'Secure upgrade pricing is temporarily unavailable. Try again later or contact support.',
    upgrade_preview_invalid: 'An exact upgrade invoice could not be verified. No upgrade was started; try again later or contact support.',
    upgrade_review_required: 'Start by reviewing the Hub upgrade from your subscription page.',
    upgrade_consent_required: 'Confirm the displayed amount and Hub renewal terms before applying the upgrade.',
    billing_review_required: 'Your existing subscription needs US billing review. Open Account to manage billing and contact support. Do not check out again.',
  };
  return reply({ error: code, message: messages[code] || 'The upgrade is unavailable. Open Account to review billing or contact support.' }, status);
}
async function attemptFor(tx: Prisma.TransactionClient, subscriptionId: string) {
  const rows = await tx.$queryRaw<Attempt[]>`SELECT * FROM "HubUpgradeAttempt" WHERE "subscriptionId" = ${subscriptionId}`;
  return rows[0];
}
async function removeAttempt(tx: Prisma.TransactionClient, attempt: Attempt, timestamp: number) {
  const expiresAt = new Date(readUpgradeQuote(attempt.token, timestamp, true).expiresAt * 1000);
  // Retain an irreversible tombstone while this signed quote can still be valid.
  // Expired tombstones are pruned on the account's next retirement; account
  // deletion also cascades them. A retired operation can never be resurrected.
  await tx.$executeRaw`DELETE FROM "HubUpgradeRetiredQuote" WHERE "userId" = ${attempt.userId} AND "expiresAt" <= CURRENT_TIMESTAMP`;
  await tx.$executeRaw`INSERT INTO "HubUpgradeRetiredQuote" ("quoteHash", "userId", "expiresAt") VALUES (${upgradeQuoteHash(attempt.token)}, ${attempt.userId}, ${expiresAt}) ON CONFLICT ("quoteHash") DO NOTHING`;
  await tx.$executeRaw`DELETE FROM "HubUpgradeAttempt" WHERE "subscriptionId" = ${attempt.subscriptionId} AND "token" = ${attempt.token}`;
}
async function providerState(stripe: Stripe, customerId: string, subscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || customer.address?.country !== 'US') throw new UpgradeQuoteError('us_provider_billing_required', 403);
  // A subscription-level legacy source overrides customer invoice settings.
  // Fail closed unless the actual selected payment instrument is a reviewed card.
  if (!sub.default_payment_method && sub.default_source) throw new UpgradeQuoteError('us_provider_billing_required', 403);
  const paymentMethodId = objectId(sub.default_payment_method) || objectId(customer.invoice_settings.default_payment_method);
  const method = paymentMethodId ? await stripe.paymentMethods.retrieve(paymentMethodId) : null;
  if (!method || method.type !== 'card' || method.billing_details.address?.country !== 'US') throw new UpgradeQuoteError('us_provider_billing_required', 403);
  if (objectId(sub.customer) !== customerId || sub.status !== 'active' || sub.currency !== 'usd'
    || sub.collection_method !== 'charge_automatically' || sub.pause_collection) throw new UpgradeQuoteError('subscription_not_active');
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
  const current = subscriptions.data.filter(row => !['canceled', 'incomplete_expired'].includes(row.status));
  if (subscriptions.has_more || current.length !== 1 || current[0].id !== sub.id) throw new UpgradeQuoteError('multiple_subscriptions_need_review');
  return sub;
}
function invoiceMatches(invoice: Stripe.Invoice, q: UpgradeQuote) {
  return objectId(invoice.customer) === q.customerId
    && objectId(invoice.parent?.subscription_details?.subscription) === q.subscriptionId && invoice.currency === 'usd';
}
function pendingMatches(sub: Stripe.Subscription, q: UpgradeQuote) {
  const items = sub.pending_update?.subscription_items;
  return items?.length === 1 && items[0].id === q.itemId && objectId(items[0].price) === q.priceId && items[0].quantity === 1;
}
/** Recovery precedes quote-age limits: a conclusively void invoice can expire at
 * the period boundary. Never create another operation for an open/paid/unknown invoice. */
async function recover(tx: Prisma.TransactionClient, stripe: Stripe, sub: Stripe.Subscription, attempt: Attempt | undefined, userId: string, now: number): Promise<Result | null> {
  if (attempt && attempt.userId !== userId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
  const product = authoritativeProduct(sub);
  if (!attempt) {
    if (product === 'hub') return reply({ ok: true, changed: false, confirmationPending: true });
    if (product !== 'visual') throw new UpgradeQuoteError('subscription_not_upgradable');
    if (sub.pending_update) throw new UpgradeQuoteError('unrelated_pending_update');
    return null;
  }
  const q = readUpgradeQuote(attempt.token, now, true);
  if (q.userId !== userId || q.subscriptionId !== sub.id || q.customerId !== objectId(sub.customer) || q.vehicleId !== attempt.vehicleId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
  if (product === 'hub') {
    if (!attempt.dispatchStartedAt || sub.items.data[0].id !== q.itemId || sub.items.data[0].price.id !== q.priceId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    const invoiceId = attempt.invoiceId || objectId(sub.latest_invoice);
    if (!invoiceId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice.id !== invoiceId || !invoiceMatches(invoice, q) || invoice.status !== 'paid'
      || invoice.amount_due !== q.amountDue || invoice.total !== q.invoiceTotal) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    if (!attempt.invoiceId) await tx.$executeRaw`UPDATE "HubUpgradeAttempt" SET "invoiceId" = ${invoiceId}, "completedAt" = CURRENT_TIMESTAMP WHERE "subscriptionId" = ${sub.id} AND "token" = ${attempt.token}`;
    // The eventual return endpoint still checks ownership/fitment. A changed
    // request selection cannot replace the car bound to the paid operation.
    return reply({ ok: true, changed: false, confirmationPending: true, vehicleId: q.vehicleId });
  }
  if (product !== 'visual') throw new UpgradeQuoteError('subscription_not_upgradable');
  if (sub.pending_update) {
    if (!attempt.dispatchStartedAt || !pendingMatches(sub, q)) throw new UpgradeQuoteError('unrelated_pending_update');
    const latestId = objectId(sub.latest_invoice);
    if (!latestId || (attempt.invoiceId && attempt.invoiceId !== latestId)) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    const invoice = await stripe.invoices.retrieve(latestId);
    if (!invoiceMatches(invoice, q) || invoice.amount_due !== q.amountDue || invoice.total !== q.invoiceTotal
      || !['open', 'paid'].includes(invoice.status || '')) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    // This also recovers a lost provider response: durable dispatch intent,
    // exact intended pending item and complete matching invoice bind the outcome.
    if (!attempt.invoiceId) {
      await tx.$executeRaw`UPDATE "HubUpgradeAttempt" SET "invoiceId" = ${latestId}, "completedAt" = CURRENT_TIMESTAMP WHERE "subscriptionId" = ${sub.id} AND "token" = ${attempt.token}`;
    }
    if (invoice.status === 'paid') return reply({ ok: true, changed: false, confirmationPending: true, vehicleId: q.vehicleId });
    return reply({ ok: true, changed: false, paymentRequired: true, confirmationPending: true, vehicleId: q.vehicleId,
      paymentUrl: invoice.hosted_invoice_url, message: 'Complete the upgrade payment to unlock Hub. Your current Visual access remains available.' });
  }
  if (attempt.invoiceId) {
    const invoice = await stripe.invoices.retrieve(attempt.invoiceId);
    if (!invoiceMatches(invoice, q) || invoice.id !== attempt.invoiceId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
    if (invoice.status === 'void' && invoice.amount_paid === 0
      && sub.items.data[0].id === q.itemId && sub.items.data[0].price.id === q.originalPriceId) {
      await removeAttempt(tx, attempt, now);
      // Return, do not throw: retirement must commit before a new review.
      return failure('upgrade_quote_changed');
    }
    // A proven paid historical upgrade may precede a later canonical Visual
    // period. Retire its quote before asking for a new, separately priced review.
    if (attempt.completedAt && attempt.dispatchStartedAt && invoice.status === 'paid'
      && invoice.amount_due === q.amountDue && invoice.total === q.invoiceTotal
      && sub.items.data[0].current_period_start >= q.renewalAt
      && sub.items.data[0].price.id === q.originalPriceId && !sub.cancel_at_period_end) {
      await removeAttempt(tx, attempt, now);
      return failure('upgrade_quote_changed');
    }
    throw new UpgradeQuoteError('upgrade_operation_needs_review');
  }
  if (attempt.completedAt) throw new UpgradeQuoteError('upgrade_operation_needs_review');
  return null;
}
function snapshotMatches(q: UpgradeQuote, sub: Stripe.Subscription, priceId: string, hash: string, ownsVisualSchedule = false) {
  const item = sub.items.data[0];
  return authoritativeProduct(sub) === 'visual' && !sub.cancel_at_period_end && (!sub.schedule || ownsVisualSchedule) && !sub.pending_update
    && q.itemId === item.id && q.originalPriceId === item.price.id && q.priceId === priceId && q.vehicleHash === hash
    && q.periodStart === item.current_period_start && q.renewalAt === item.current_period_end;
}
async function ownedVehicle(tx: Prisma.TransactionClient, userId: string, vehicleId: unknown) {
  const vehicle = typeof vehicleId === 'string' ? await tx.vehicle.findFirst({ where: { id: vehicleId, userId } }) : null;
  const twin = vehicle && getLiveTwinForVehicle(vehicle);
  const branch = twin && vehicle && resolveTwinTransmissionBranch(twin, vehicle.transmission, vehicle);
  if (!vehicle || !twin || !getTwinByFulfillmentId(twin.id)?.ownerReady || !vehicle.currentMileage || vehicle.currentMileage <= 0
    || !branch?.options.length || (branch.requiresChoice && !branch.branch)) throw new UpgradeQuoteError('owner_ready_vehicle_required');
  return vehicle;
}
export function createChangeTierHandler(deps: {
  auth: () => Promise<{ user?: { id?: string; email?: string | null } } | null>;
  prisma: Pick<typeof Database, 'user' | '$transaction'>;
  getStripe: typeof StripeFactory; getPriceIdForTier: typeof PriceResolver;
  now?: () => number;
}) {
  const now = deps.now || (() => Math.floor(Date.now() / 1000));
  return async function POST(request: Request) {
    const respond = (result: Result) => result.kind === 'reply' ? NextResponse.json(result.body, { status: result.status, headers: { 'Cache-Control': 'private, no-store' } }) : NextResponse.json({ error: 'upgrade_unavailable' }, { status: 503 });
    if (!publicEnrollmentEnabled()) return respond(failure('enrollment_closed', 410));
    if (!isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))) return respond(failure('region_unavailable', 403));
    const session = await deps.auth();
    if (!session?.user?.id) return respond(failure('unauthorized', 401));
    const input = await request.json().catch(() => null);
    const body = input && typeof input === 'object' ? input : {};
    if (body.billingCountry !== 'US') return respond(failure('us_billing_required', 403));
    if ((body.product ?? body.tierId) !== 'hub' || !['preview', 'confirm'].includes(body.action) || (body.interval && body.interval !== 'month')) return respond(failure('upgrade_review_required', 400));
    if (body.action === 'confirm' && body.confirmProration !== true) return respond(failure('upgrade_consent_required', 400));
    const userId = session.user.id;
    try {
      const stripe = deps.getStripe();
      async function context(tx: Prisma.TransactionClient) {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
        const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        if (!user.emailVerified || !user.subscriptionId || !user.stripeCustomerId) throw new UpgradeQuoteError('verified_subscription_required', 403);
        const sub = await providerState(stripe, user.stripeCustomerId, user.subscriptionId);
        await ownedVisualSchedule(tx, stripe, sub, userId, now());
        const attempt = await attemptFor(tx, sub.id);
        const recovered = await recover(tx, stripe, sub, attempt, userId, now());
        if (!recovered) {
          const review = await getBillingEnrollmentReview(tx, userId, sub.id);
          if (review && (review.state === 'review_required' || review.initialVerified !== true)) throw new UpgradeQuoteError('billing_review_required');
        }
        return { user, sub, attempt, recovered };
      }
      async function check(tx: Prisma.TransactionClient, q: UpgradeQuote, sub: Stripe.Subscription, attempt?: Attempt) {
        const vehicle = await ownedVehicle(tx, userId, q.vehicleId);
        const priceId = deps.getPriceIdForTier('hub');
        if (!priceId) throw new UpgradeQuoteError('price_not_configured', 503);
        assertUsdPlanPrice(await stripe.prices.retrieve(priceId), 'hub', 'month');
        if (q.userId !== userId || q.customerId !== objectId(sub.customer) || q.subscriptionId !== sub.id
          || !snapshotMatches(q, sub, priceId, vehicleQuoteHash(vehicle), !!await ownedVisualSchedule(tx, stripe, sub, userId, now()))) throw new UpgradeQuoteError('upgrade_quote_changed');
        readUpgradeQuote(signUpgradeQuote(q), now(), !!attempt?.dispatchStartedAt);
        if (attempt?.dispatchStartedAt && (now() >= q.renewalAt || now() - Math.floor(attempt.dispatchStartedAt.getTime() / 1000) >= RETRY_SECONDS)) throw new UpgradeQuoteError('upgrade_operation_needs_review');
        const totals = await previewUpgrade(stripe, q);
        if (totals.amountDue !== q.amountDue || totals.invoiceTotal !== q.invoiceTotal) throw new UpgradeQuoteError('upgrade_quote_changed');
        // A preview may cross any time boundary, including an ambiguous
        // operation's renewal or provider idempotency-retention boundary.
        readUpgradeQuote(signUpgradeQuote(q), now(), !!attempt?.dispatchStartedAt);
        if (attempt?.dispatchStartedAt && (now() >= q.renewalAt || now() - Math.floor(attempt.dispatchStartedAt.getTime() / 1000) >= RETRY_SECONDS)) throw new UpgradeQuoteError('upgrade_operation_needs_review');
      }
      async function invalidated(tx: Prisma.TransactionClient, attempt: Attempt | undefined, error: unknown): Promise<Result> {
        if (!(error instanceof UpgradeQuoteError)) throw error;
        if (attempt && !attempt.dispatchStartedAt && ['upgrade_quote_changed', 'upgrade_quote_expired', 'owner_ready_vehicle_required'].includes(error.code)) {
          await removeAttempt(tx, attempt, now());
          return failure(error.code);
        }
        if (attempt?.dispatchStartedAt) return failure('upgrade_operation_needs_review');
        return failure(error.code, error.status);
      }
      // Phase 1: commit the exact confirmed amount and immutable operation.
      const confirmed = await deps.prisma.$transaction(async (tx): Promise<Result> => {
        const { user, sub, attempt, recovered } = await context(tx);
        if (recovered) return recovered;
        if (attempt && body.action === 'confirm' && body.quote !== attempt.token) return failure('upgrade_operation_needs_review');
        try {
          const vehicle = await ownedVehicle(tx, userId, body.vehicleId);
          let q: UpgradeQuote;
          if (attempt || body.action === 'confirm') {
            q = readUpgradeQuote(attempt?.token || body.quote, now(), !!attempt?.dispatchStartedAt);
            if (!attempt) {
              const retired = await tx.$queryRaw<{ quoteHash: string }[]>`SELECT "quoteHash" FROM "HubUpgradeRetiredQuote" WHERE "userId" = ${userId} AND "quoteHash" = ${upgradeQuoteHash(body.quote)}`;
              if (retired.length) return failure('upgrade_quote_changed');
            }
            if (q.vehicleId !== vehicle.id) throw new UpgradeQuoteError('upgrade_quote_changed');
            await check(tx, q, sub, attempt);
          } else {
            const priceId = deps.getPriceIdForTier('hub');
            if (!priceId) throw new UpgradeQuoteError('price_not_configured', 503);
            const price = await stripe.prices.retrieve(priceId); assertUsdPlanPrice(price, 'hub', 'month');
            const item = sub.items.data[0]; const timestamp = now();
            q = { version: 1, operationId: newOperationId(), userId, customerId: user.stripeCustomerId!, subscriptionId: sub.id,
              itemId: item.id, originalPriceId: item.price.id, priceId, vehicleId: vehicle.id, vehicleHash: vehicleQuoteHash(vehicle),
              periodStart: item.current_period_start, renewalAt: item.current_period_end, prorationDate: timestamp,
              expiresAt: Math.min(timestamp + QUOTE_SECONDS, item.current_period_end), amountDue: 0, invoiceTotal: 0, monthlyAmount: price.unit_amount!, currency: 'usd' };
            if (!snapshotMatches(q, sub, priceId, vehicleQuoteHash(vehicle), !!await ownedVisualSchedule(tx, stripe, sub, userId, now()))) throw new UpgradeQuoteError('upgrade_quote_changed');
            Object.assign(q, await previewUpgrade(stripe, q));
            readUpgradeQuote(signUpgradeQuote(q), now());
          }
          const token = attempt?.token || (body.action === 'confirm' ? body.quote : signUpgradeQuote(q));
          if (body.action === 'preview') return reply({ ok: true, quote: publicUpgradeQuote(q, token, !!attempt?.dispatchStartedAt) });
          if (!attempt) await tx.$executeRaw`INSERT INTO "HubUpgradeAttempt" ("subscriptionId", "userId", "token", "vehicleId") VALUES (${sub.id}, ${userId}, ${token}, ${q.vehicleId})`;
          return { kind: 'continue', subscriptionId: sub.id, token };
        } catch (error) { return invalidated(tx, attempt, error); }
      }, options);
      if (confirmed.kind === 'reply') return respond(confirmed);
      // Phase 2: validate again; commit dispatch intent before any provider update.
      const dispatch = await deps.prisma.$transaction(async (tx): Promise<Result> => {
        const { sub, attempt, recovered } = await context(tx);
        if (recovered) return recovered;
        if (!attempt || attempt.token !== confirmed.token || sub.id !== confirmed.subscriptionId) return failure('upgrade_quote_changed');
        try {
          const q = readUpgradeQuote(attempt.token, now(), !!attempt.dispatchStartedAt);
          await check(tx, q, sub, attempt);
          if (!attempt.dispatchStartedAt) await tx.$executeRaw`UPDATE "HubUpgradeAttempt" SET "dispatchStartedAt" = CURRENT_TIMESTAMP WHERE "subscriptionId" = ${sub.id} AND "token" = ${attempt.token}`;
          return confirmed;
        } catch (error) { return invalidated(tx, attempt, error); }
      }, options);
      if (dispatch.kind === 'reply') return respond(dispatch);
      // Phase 3: a rollback/timeout cannot erase either confirmation or dispatch
      // intent. Every call reuses the same parameters and idempotency key.
      const result = await deps.prisma.$transaction(async (tx): Promise<Result> => {
        const { sub, attempt, recovered } = await context(tx);
        if (recovered) return recovered;
        if (!attempt?.dispatchStartedAt || attempt.token !== dispatch.token || sub.id !== dispatch.subscriptionId) return failure('upgrade_operation_needs_review');
        try {
          const q = readUpgradeQuote(attempt.token, now(), true);
          await check(tx, q, sub, attempt);
          if (sub.schedule) {
            await releaseVisualScheduleForUpgrade(tx, stripe, sub, userId, now());
            const current = await stripe.subscriptions.retrieve(sub.id);
            await check(tx, q, current, attempt);
          }
          const updated = await stripe.subscriptions.update(q.subscriptionId, upgradeParameters(q), { idempotencyKey: `au7o-hub-upgrade-${q.operationId}` });
          const invoiceId = objectId(updated.latest_invoice);
          if (!invoiceId || updated.id !== q.subscriptionId || objectId(updated.customer) !== q.customerId) throw new UpgradeQuoteError('upgrade_operation_needs_review');
          const invoice = await stripe.invoices.retrieve(invoiceId);
          if (!invoiceMatches(invoice, q) || invoice.amount_due !== q.amountDue || invoice.total !== q.invoiceTotal) throw new UpgradeQuoteError('upgrade_operation_needs_review');
          await tx.$executeRaw`UPDATE "HubUpgradeAttempt" SET "invoiceId" = ${invoiceId}, "completedAt" = CURRENT_TIMESTAMP WHERE "subscriptionId" = ${sub.id} AND "token" = ${attempt.token}`;
          if (updated.pending_update) {
            const pending = await recover(tx, stripe, updated, { ...attempt, invoiceId, completedAt: new Date() }, userId, now());
            if (pending) return pending;
          }
          return reply({ ok: true, changed: true, confirmationPending: true, vehicleId: q.vehicleId });
        } catch (error) { return invalidated(tx, attempt, error); }
      }, options);
      return respond(result);
    } catch (error) {
      if (error instanceof UpgradeQuoteError) return respond(failure(error.code, error.status));
      return respond(reply({ error: 'upgrade_unavailable', message: 'The upgrade could not be confirmed. Retry to resume the same reviewed amount.' }, 503));
    }
  };
}
