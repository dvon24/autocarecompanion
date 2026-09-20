import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { prisma as Database } from './db';
import type { getStripe as StripeFactory, getPriceIdForTier as PriceResolver } from './stripe';
import { isAllowedSubscriptionRegion } from './pricing/region';
import { publicEnrollmentEnabled } from './product-entitlements';
import { billingOrigin, billingProduct, objectId } from './billing-policy';
import { assertUsdPlanPrice, USD_CHECKOUT_OPTIONS } from './stripe-checkout-policy';
import { getLiveTwinForVehicle, resolveTwinTransmissionBranch } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { usBillingCheckoutEnabled } from './us-billing-eligibility';
import { getBillingEnrollmentReview } from './billing-enrollment-review';
import { visualReturnDestination } from './visual-return-destination';

export function createCheckoutHandler(deps: {
  auth: () => Promise<{ user?: { id?: string; email?: string | null } } | null>;
  prisma: Pick<typeof Database, 'user' | 'billingAttempt' | '$transaction'>;
  getStripe: typeof StripeFactory; getPriceIdForTier: typeof PriceResolver;
}) {
  return async function POST(request: Request) {
    if (!publicEnrollmentEnabled()) return NextResponse.json({ error: 'enrollment_closed' }, { status: 410 });
    if (!isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))) return NextResponse.json({ error: 'region_unavailable' }, { status: 403 });
    const session = await deps.auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 });
    if (!usBillingCheckoutEnabled()) return NextResponse.json({ error: 'us_billing_enforcement_unverified', message: 'New paid enrollment is unavailable until US billing enforcement is verified for this environment. Existing account and billing management remain available.' }, { status: 503 });
    const body = await request.json().catch(() => ({}));
    if (body.billingCountry !== 'US') return NextResponse.json({ error: 'us_billing_required', message: 'Subscriptions currently require US residence and a US billing address.' }, { status: 403 });
    const product = billingProduct(body.product ?? body.tierId);
    if (!product || (body.interval && body.interval !== 'month')) return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
    const userId = session.user.id;
    const vehicleId = product === 'hub' && typeof body.vehicleId === 'string' ? body.vehicleId : null;
    const priceId = deps.getPriceIdForTier(product);
    if (!priceId) return NextResponse.json({ error: 'price_not_configured' }, { status: 503 });
    try {
      const user = await deps.prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
      if (!user?.emailVerified) return NextResponse.json({ error: 'verification_required' }, { status: 403 });
      const stripe = deps.getStripe();
      assertUsdPlanPrice(await stripe.prices.retrieve(priceId), product, 'month');
      // Validate fitment BEFORE allocating an attempt. Commit customer identity and
      // the immutable attempt key BEFORE any Checkout call, including uncertain ones.
      const prepared = await deps.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
        const account = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        if (!account.emailVerified) return { error: 'verification_required', status: 403 };
        if ((await getBillingEnrollmentReview(tx, userId, account.subscriptionId))?.state === 'review_required') return { error: 'billing_review_required', status: 409 };
        if (product === 'hub') {
          const vehicle = vehicleId ? await tx.vehicle.findFirst({ where: { id: vehicleId, userId } }) : null;
          const twin = vehicle && getLiveTwinForVehicle(vehicle);
          const branch = twin && vehicle && resolveTwinTransmissionBranch(twin, vehicle.transmission, vehicle);
          if (!vehicle || !twin || !getTwinByFulfillmentId(twin.id)?.ownerReady || !branch?.options.length
            || (branch.requiresChoice && !branch.branch) || !vehicle.currentMileage || vehicle.currentMileage <= 0) return { error: 'owner_ready_vehicle_required', status: 409 };
        }
        let attempt = await tx.billingAttempt.findUnique({ where: { userId } });
        if (attempt?.sessionId) {
          const previous = await stripe.checkout.sessions.retrieve(attempt.sessionId);
          if (previous.status === 'open') {
            if (attempt.product === product && attempt.vehicleId === vehicleId) return { url: previous.url };
            // The user selected another product/vehicle. Only a confirmed expiration
            // permits replacing an open checkout. Uncertain expiration never does.
            await stripe.checkout.sessions.expire(previous.id);
          } else if (previous.status === 'complete') {
            const previousSubId = objectId(previous.subscription);
            const previousSub = previousSubId ? await stripe.subscriptions.retrieve(previousSubId) : null;
            if (!previousSub || !['canceled', 'incomplete_expired'].includes(previousSub.status)) return { error: 'existing_subscription_use_account', status: 409 };
          }
          await tx.billingAttempt.delete({ where: { userId } }); attempt = null;
        }
        if (attempt && (attempt.product !== product || attempt.vehicleId !== vehicleId)) return { error: 'checkout_outcome_needs_review', status: 409 };
        if (attempt && Date.now() - attempt.createdAt.getTime() >= 23 * 3600000) return { error: 'checkout_attempt_needs_review', status: 409 };
        let customerId = account.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({ email: account.email, metadata: { userId } }, { idempotencyKey: `au7o-customer-${userId}` });
          customerId = customer.id;
          await tx.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
        }
        if (!attempt) {
          const existing = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
          if (existing.has_more || existing.data.some((sub) => !['canceled', 'incomplete_expired'].includes(sub.status))) return { error: 'existing_subscription_use_account', status: 409 };
        }
        if (!attempt) attempt = await tx.billingAttempt.create({ data: { userId, key: randomUUID(), product, vehicleId, customerId, state: 'creating', returnTo: product === 'visual' ? visualReturnDestination(body.returnTo) : null } });
        return { key: attempt.key };
      }, { timeout: 30000, maxWait: 10000 });
      if ('error' in prepared) return NextResponse.json({ error: prepared.error }, { status: prepared.status });
      if ('url' in prepared) return NextResponse.json({ url: prepared.url });
      const result = await deps.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
        const account = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        const attempt = await tx.billingAttempt.findUniqueOrThrow({ where: { userId } });
        if (!account.emailVerified || attempt.key !== prepared.key) return { error: 'checkout_attempt_changed', status: 409 };
        if (attempt.sessionId) {
          const checkout = await stripe.checkout.sessions.retrieve(attempt.sessionId);
          return checkout.status === 'open' ? { url: checkout.url } : { error: 'subscription_confirmation_pending', status: 409 };
        }
        const customerId = account.stripeCustomerId;
        if (!customerId) throw new Error('customer_binding_missing');
        if (account.subscriptionId) {
          const existing = await stripe.subscriptions.retrieve(account.subscriptionId);
          if (objectId(existing.customer) !== customerId || (!['canceled', 'incomplete_expired'].includes(existing.status) && existing.metadata.attemptKey !== attempt.key)) return { error: 'existing_subscription_use_account', status: 409 };
        }
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
        if (subscriptions.has_more || subscriptions.data.some((sub) => !['canceled', 'incomplete_expired'].includes(sub.status) && sub.metadata.attemptKey !== attempt.key)) return { error: 'existing_subscription_use_account', status: 409 };
        const checkout = await stripe.checkout.sessions.create({
          ...USD_CHECKOUT_OPTIONS, mode: 'subscription', payment_method_types: ['card'], customer: customerId,
          client_reference_id: userId, line_items: [{ price: priceId, quantity: 1 }],
          billing_address_collection: 'required', customer_update: { address: 'auto' },
          success_url: `${billingOrigin()}/subscribe/success?product=${product}${vehicleId ? `&vehicleId=${encodeURIComponent(vehicleId)}` : ''}&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${billingOrigin()}/account`,
          metadata: { attemptKey: attempt.key }, subscription_data: { ...(product === 'hub' && !account.subscriptionId && !subscriptions.data.some((sub) => sub.trial_start != null) ? { trial_period_days: 7 } : {}), metadata: { userId, attemptKey: attempt.key } },
        }, { idempotencyKey: `au7o-checkout-${attempt.key}` });
        await tx.billingAttempt.update({ where: { userId }, data: { customerId, sessionId: checkout.id, url: checkout.url, state: checkout.status === 'complete' ? 'complete' : 'open' } });
        return { url: checkout.url || `${billingOrigin()}/subscribe/success` };
      }, { timeout: 30000, maxWait: 10000 });
      return 'error' in result ? NextResponse.json({ error: result.error }, { status: result.status }) : NextResponse.json(result);
    } catch (error) {
      console.error('[billing.checkout] failed', error instanceof Error ? error.name : 'unknown');
      return NextResponse.json({ error: 'checkout_unavailable', message: 'Checkout could not be confirmed. Retry to resume the same attempt.' }, { status: 503 });
    }
  };
}
