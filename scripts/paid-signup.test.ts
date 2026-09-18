import assert from 'node:assert/strict';
import test from 'node:test';
import type Stripe from 'stripe';
import { productEntitlements } from '../src/lib/product-entitlements';
import { resolveTier } from '../src/lib/pricing/tiers';
import { authoritativeProduct } from '../src/lib/billing-policy';
import { createStripeWebhookHandler } from '../src/lib/stripe-webhook-handler';
import { createCheckoutHandler } from '../src/lib/stripe-create-checkout-handler';
import { evaluateTwinAccess } from '../src/lib/twin-access';
import { enrollmentDestination, enrollmentTokenHash, startEnrollment, redeemEnrollment } from '../src/lib/account-enrollment';
import { confirmedEnrollmentIntent, getSelectedEnrollment, needsEnrollmentCompletion } from '../src/lib/selected-enrollment';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { KNOWN_ISSUE_TWIN_VISUALS } from '../src/lib/known-issue-twin-visuals';
import { enrollmentContinuation } from '../src/lib/visual-return-destination';
import { safeInternalCallback } from '../src/lib/auth-callback';

const verified = { email: 'member@example.com', emailVerified: new Date(), subscriptionId: 'sub_1', subscriptionStatus: 'active' };
test('Visual is account/visual access without personal Hub, maintenance or AI', () => {
  const access = productEntitlements({ ...verified, subscriptionTier: 'visual' });
  assert.equal(access.visual, true); assert.equal(access.hub, false); assert.equal(access.personalAi, false); assert.equal(access.maintenance, false);
});
test('Hub includes Visual during its approved trial; Visual never has a trial', () => {
  assert.equal(productEntitlements({ ...verified, subscriptionTier: 'hub', subscriptionStatus: 'trialing' }).hub, true);
  assert.equal(productEntitlements({ ...verified, subscriptionTier: 'visual', subscriptionStatus: 'trialing' }).visual, false);
});
test('unverified, unknown-tier and inactive subscriptions fail closed', () => {
  for (const subscriptionStatus of ['past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'canceled', 'paused']) {
    assert.equal(productEntitlements({ ...verified, subscriptionTier: 'hub', subscriptionStatus }).hub, false);
  }
  assert.equal(productEntitlements({ ...verified, emailVerified: null, subscriptionTier: 'hub' }).hub, false);
  for (const tier of [null, 'made-up', 'pro_from_metadata']) { assert.equal(productEntitlements({ ...verified, subscriptionTier: tier }).hub, false); assert.equal(resolveTier('active', tier), 'free'); }
});
test('reviewed legacy rights survive; explicit Visual cannot inherit legacy Hub rights', () => {
  assert.equal(productEntitlements({ ...verified, emailVerified: null, subscriptionTier: 'plus', legacySubscriptionTier: 'plus' }).hub, true);
  assert.equal(productEntitlements({ ...verified, subscriptionTier: 'visual', legacySubscriptionTier: 'pro' }).hub, false);
  assert.equal(productEntitlements({ ...verified, subscriptionTier: 'unknown', legacySubscriptionTier: 'pro' }).hub, false);
});
test('founder identities remain independent of public enrollment and billing', () => {
  assert.equal(productEntitlements({ email: 'devonsroberson24@yahoo.com' }).founder, true);
  assert.equal(productEntitlements({ email: 'member@example.com' }).founder, false);
});
test('verification hashes, safe destination and callback rejection', () => {
  assert.equal(enrollmentTokenHash('token').length, 64);
  assert.notEqual(enrollmentTokenHash('token'), 'token');
  assert.equal(enrollmentDestination('hub', 'a/b'), '/subscribe?product=hub&vehicleId=a%2Fb');
  assert.equal(safeInternalCallback('//evil.example', '/account'), '/account');
  assert.equal(safeInternalCallback('/\\evil.example', '/account'), '/account');
});
test('enrollment is independently off by default and unknown geography fails before database writes', async () => {
  const old = process.env.ACCOUNT_ENROLLMENT_ENABLED;
  delete process.env.ACCOUNT_ENROLLMENT_ENABLED;
  assert.equal((await startEnrollment(new Request('https://au7o.io/api/auth/signup', { method: 'POST' }))).status, 410);
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true';
  assert.equal((await startEnrollment(new Request('https://au7o.io/api/auth/signup', { method: 'POST' }))).status, 403);
  if (old === undefined) delete process.env.ACCOUNT_ENROLLMENT_ENABLED; else process.env.ACCOUNT_ENROLLMENT_ENABLED = old;
});

const price = (id = 'price_visual', amount = 499) => ({ id, active: true, currency: 'usd', type: 'recurring', unit_amount: amount, billing_scheme: 'per_unit', transform_quantity: null, recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' } });
const subscription = (overrides: Record<string, unknown> = {}) => ({ id: 'sub_1', customer: 'cus_1', status: 'active', metadata: {}, items: { data: [{ id: 'si_1', quantity: 1, price: price() }] }, ...overrides });
test('price identity, amount, interval and quantity—not caller metadata—define product', () => {
  process.env.STRIPE_PRICE_ID_VISUAL = 'price_visual'; process.env.STRIPE_PRICE_ID_HUB = 'price_hub';
  assert.equal(authoritativeProduct(subscription({ metadata: { tier: 'hub' } }) as unknown as Stripe.Subscription), 'visual');
  assert.equal(authoritativeProduct(subscription({ items: { data: [{ quantity: 1, price: price('wrong') }] } }) as unknown as Stripe.Subscription), null);
  assert.equal(authoritativeProduct(subscription({ items: { data: [{ quantity: 2, price: price() }] } }) as unknown as Stripe.Subscription), null);
  assert.equal(authoritativeProduct(subscription({ items: { data: [{ quantity: 1, price: price('price_visual', 1499) }] } }) as unknown as Stripe.Subscription), null);
});
function webhookFixture() {
  let current = subscription(); let fail = false; let invalidSignature = false;
  const receipts = new Set<string>(); const writes: Record<string, unknown>[] = [];
  const account = { ...verified, id: 'u1', stripeCustomerId: 'cus_1', subscriptionTier: 'visual', legacySubscriptionTier: null };
  const tx = { $queryRaw: async () => [], user: {
    findUnique: async () => account, findUniqueOrThrow: async () => account,
    update: async ({ data }: { data: Record<string, unknown> }) => { writes.push(data); Object.assign(account, data); },
  }, billingAttempt: { findUnique: async () => null }, billingEvent: {
    findUnique: async ({ where }: { where: { id: string } }) => receipts.has(where.id) ? {} : null,
    create: async ({ data }: { data: { id: string } }) => { receipts.add(data.id); },
  } };
  const deps = { prisma: { ...tx, $transaction: async (fn: (value: typeof tx) => unknown) => fn(tx) }, secret: () => 'test_secret', getStripe: () => ({
    webhooks: { constructEvent: (body: string) => { if (invalidSignature) throw Error('signature'); return JSON.parse(body); } },
    subscriptions: { retrieve: async () => { if (fail) throw Error('transient'); return current; } },
  }) } as unknown as Parameters<typeof createStripeWebhookHandler>[0];
  const handler = createStripeWebhookHandler(deps);
  return { writes, receipts, account, setCurrent: (value: ReturnType<typeof subscription>) => { current = value; }, fail: (value: boolean) => { fail = value; }, invalid: () => { invalidSignature = true; },
    send: (id: string, type = 'customer.subscription.updated', object = { id: 'sub_1', status: 'canceled' }) => handler(new Request('https://au7o.io/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': 'mock-signature' }, body: JSON.stringify({ id, type, data: { object } }) })) };
}
test('invalid signatures cause no entitlement writes', async () => { const f = webhookFixture(); f.invalid(); assert.equal((await f.send('evt_invalid')).status, 400); assert.equal(f.writes.length, 0); });
test('delayed events use current subscription and duplicate receipts write once', async () => {
  const f = webhookFixture(); assert.equal((await f.send('evt_1')).status, 200); assert.equal(f.account.subscriptionStatus, 'active');
  await f.send('evt_1'); assert.equal(f.writes.length, 1);
});
test('renewal failure and recovery use authoritative status', async () => {
  const f = webhookFixture(); f.setCurrent(subscription({ status: 'past_due' })); await f.send('evt_fail'); assert.equal(f.account.subscriptionStatus, 'past_due');
  f.setCurrent(subscription({ status: 'active' })); await f.send('evt_recover'); assert.equal(f.account.subscriptionStatus, 'active');
});
test('unrelated subscription cannot replace the bound subscription', async () => { const f = webhookFixture(); f.setCurrent(subscription({ id: 'sub_foreign', status: 'canceled' })); await f.send('evt_foreign'); assert.equal(f.writes.length, 0); });
test('unknown price revokes new-product access and transient failures remain retryable', async () => {
  const f = webhookFixture(); f.fail(true); assert.equal((await f.send('evt_retry')).status, 503); assert.equal(f.receipts.size, 0);
  f.fail(false); f.setCurrent(subscription({ items: { data: [{ quantity: 1, price: price('foreign') }] } })); await f.send('evt_retry'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.receipts.size, 1);
});
test('paid owner Hub requires ready fitment and actual mileage without a beta reservation', () => {
  const input = { founder: false, paidHub: true, supported: true, garageMatches: true, positiveMileage: true, assignmentMatches: false, requiresTransmissionChoice: true, customerTransmissionMatches: true, reservation: null, now: new Date() };
  assert.equal(evaluateTwinAccess(input).reason, 'allowed-paid-hub');
  assert.equal(evaluateTwinAccess({ ...input, supported: false }).allowed, false);
  assert.equal(evaluateTwinAccess({ ...input, positiveMileage: false }).allowed, false);
  assert.equal(evaluateTwinAccess({ ...input, customerTransmissionMatches: false }).allowed, false);
});
test('checkout geo/flag/auth boundaries cause no billing writes', async () => {
  let touches = 0;
  const handler = createCheckoutHandler({ auth: async () => { touches++; return null; }, prisma: {} as never, getStripe: () => { touches++; throw Error(); }, getPriceIdForTier: () => 'price_visual' });
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true'; process.env.VERCEL = '1';
  assert.equal((await handler(new Request('https://au7o.io/api/stripe/create-checkout', { method: 'POST' }))).status, 403); assert.equal(touches, 0);
  assert.equal((await handler(new Request('https://au7o.io/api/stripe/create-checkout', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' } }))).status, 401); assert.equal(touches, 1);
  delete process.env.ACCOUNT_ENROLLMENT_ENABLED;
});

function redemptionFixture({ expired = false, existing = false } = {}) {
  const row = { id: 'token1', email: 'member@example.com', product: 'hub', intent: 'reservation', vehicleId: null, usedAt: null as Date | null, expiresAt: new Date(Date.now() + (expired ? -1000 : 100000)) };
  let created = 0;
  const tx = { accountEnrollment: { findUnique: async () => ({ ...row }), updateMany: async () => { if (row.usedAt || row.expiresAt <= new Date()) return { count: 0 }; row.usedAt = new Date(); return { count: 1 }; } }, user: { findUnique: async () => existing ? { id: 'original' } : null, create: async () => { created++; } } };
  const db = { $transaction: async (fn: (arg: typeof tx) => unknown) => fn(tx) } as unknown as Parameters<typeof redeemEnrollment>[0];
  return { redeem: () => redeemEnrollment(db, 'hash', 'new-hash'), created: () => created };
}
test('expired/replayed verification tokens create no account, and concurrent redemption succeeds once', async () => {
  const expired = redemptionFixture({ expired: true }); await assert.rejects(expired.redeem()); assert.equal(expired.created(), 0);
  const f = redemptionFixture(); const results = await Promise.allSettled([f.redeem(), f.redeem()]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1); assert.equal(f.created(), 1);
  await assert.rejects(f.redeem());
});
test('verified existing identity is never overwritten and reservation intent returns Account', async () => {
  const f = redemptionFixture({ existing: true }); const result = await f.redeem();
  assert.equal(result.callbackUrl, '/account'); assert.equal(result.existing, true); assert.equal(f.created(), 0);
});

function checkoutFixture() {
  // Synthetic provider only. The deployment configuration remains closed.
  process.env.VERCEL_ENV = 'preview'; process.env.STRIPE_SECRET_KEY = 'sk_test_synthetic';
  process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV = 'preview:test';
  const ownerVehicle = { ...VEHICLE_TWIN_CATALOG.find((entry) => entry.ownerReady)!.identity, id: 'v1', userId: 'u1', currentMileage: 42000, transmission: 'automatic' };
  const account = { id: 'u1', email: 'member@example.com', emailVerified: new Date(), stripeCustomerId: null as string | null, subscriptionId: null as string | null };
  let attempt: Record<string, unknown> | null = null;
  let tail = Promise.resolve(); let failNext = false; let creates = 0; let customers = 0;
  const sessions = new Map<string, Record<string, unknown>>(); const parameters: Record<string, unknown>[] = [];
  let subscriptionRows: Record<string, unknown>[] = [];
  const tx = { $queryRaw: async () => [], user: { findUnique: async () => account, findUniqueOrThrow: async () => account, update: async ({ data }: { data: Record<string, unknown> }) => Object.assign(account, data) },
    vehicle: { findFirst: async ({ where }: { where: { id: string } }) => where.id === 'v1' ? ownerVehicle : null },
    billingAttempt: { findUnique: async () => attempt, findUniqueOrThrow: async () => { if (!attempt) throw Error('missing'); return attempt; }, create: async ({ data }: { data: Record<string, unknown> }) => attempt = { ...data, createdAt: new Date(), sessionId: null }, update: async ({ data }: { data: Record<string, unknown> }) => Object.assign(attempt!, data), delete: async () => { attempt = null; } },
  };
  const stripe = { prices: { retrieve: async (id: string) => price(id, id === 'price_hub' ? 1499 : 499) }, customers: { create: async () => { customers++; return { id: 'cus_1' }; } },
    subscriptions: { list: async () => ({ data: subscriptionRows, has_more: false }), retrieve: async (id: string) => subscriptionRows.find((sub) => sub.id === id) || subscription({ id, status: 'canceled' }) },
    checkout: { sessions: { retrieve: async (id: string) => [...sessions.values()].find((value) => value.id === id), expire: async (id: string) => { const value = [...sessions.values()].find((value) => value.id === id)!; value.status = 'expired'; return value; },
      create: async (params: Record<string, unknown>, options: { idempotencyKey: string }) => { creates++; parameters.push(params); let value = sessions.get(options.idempotencyKey); if (!value) { value = { id: `cs_${sessions.size + 1}`, status: 'open', url: 'https://checkout.stripe.com/c/pay/mock', subscription: null }; sessions.set(options.idempotencyKey, value); } if (failNext) { failNext = false; throw Error('timeout'); } return value; } } },
  };
  const database = { ...tx, $transaction: async (fn: (arg: typeof tx) => unknown) => { const previous = tail; let release!: () => void; tail = new Promise<void>((resolve) => { release = resolve; }); await previous; try { return await fn(tx); } finally { release(); } } };
  const handler = createCheckoutHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: database, getStripe: () => stripe, getPriceIdForTier: (product: string) => `price_${product}` } as unknown as Parameters<typeof createCheckoutHandler>[0]);
  return { account, parameters, attempt: () => attempt, creates: () => creates, customers: () => customers, fail: () => { failNext = true; },
    completeCanceled: () => { for (const value of sessions.values()) { value.status = 'complete'; value.subscription = 'sub_old'; } account.subscriptionId = 'sub_old'; subscriptionRows = [subscription({ id: 'sub_old', status: 'canceled', trial_start: 100 })]; },
    request: (body: Record<string, unknown> = { product: 'visual' }) => { process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true'; process.env.VERCEL = '1'; return handler(new Request('https://au7o.io/api/stripe/create-checkout', { method: 'POST', headers: { 'x-vercel-ip-country': 'US', 'Content-Type': 'application/json' }, body: JSON.stringify({ billingCountry: 'US', ...body }) })); },
  };
}
test('concurrent checkout calls share one customer and one session', async () => {
  const f = checkoutFixture(); const responses = await Promise.all([f.request(), f.request()]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200]); assert.equal(f.creates(), 1); assert.equal(f.customers(), 1);
});
test('cancel/Back and repeated retry reuse the open session and its originating Visual page', async () => {
  const f = checkoutFixture();
  const first = await (await f.request({ product: 'visual', returnTo: '/known-issues/cadillac-xt6?year=2020#battery' })).json();
  const key = f.attempt()!.key;
  const second = await (await f.request({ product: 'visual', returnTo: '/visual' })).json();
  assert.equal(second.url, first.url); assert.equal(f.attempt()!.key, key);
  assert.equal(f.attempt()!.returnTo, '/known-issues/cadillac-xt6?year=2020&twinPilot=1#battery');
  assert.equal(f.creates(), 1); assert.equal(f.customers(), 1);
});

test('every prepared Visual return survives checkout and stable-attempt recovery', async () => {
  for (const definition of KNOWN_ISSUE_TWIN_VISUALS) {
    for (const uncertain of [false, true]) {
      const f = checkoutFixture();
      const path = `/known-issues/${definition.slug}`;
      const query = new URLSearchParams({ year: String(definition.year), trim: definition.identity.trim, engine: definition.identity.engine, twinPilot: '1' });
      const destination = `${path}?${query}#${definition.slug}-issue-1`;
      const continuation = new URL(enrollmentContinuation('visual', null, destination), 'https://fixture.invalid');
      if (uncertain) f.fail();
      const first = await f.request({ product: continuation.searchParams.get('product'), returnTo: continuation.searchParams.get('returnTo') });
      assert.equal(first.status, uncertain ? 503 : 200);
      const key = f.attempt()!.key;
      assert.equal(f.attempt()!.returnTo, destination);
      const initialParameters = f.parameters[0];
      const nextDefinition = KNOWN_ISSUE_TWIN_VISUALS.find(row => row.slug !== definition.slug)!;
      for (const returnTo of [nextDefinition.returnPath, '//external.invalid', '/visual']) {
        const retry = await f.request({ product: 'visual', returnTo });
        assert.equal(retry.status, 200);
        assert.equal((await retry.json()).url, 'https://checkout.stripe.com/c/pay/mock');
        assert.equal(f.attempt()!.key, key);
        assert.equal(f.attempt()!.sessionId, 'cs_1');
        assert.equal(f.attempt()!.returnTo, destination);
      }
      assert.equal(f.creates(), uncertain ? 2 : 1);
      assert.equal(f.customers(), 1);
      for (const params of f.parameters) {
        assert.deepEqual(params, initialParameters);
        assert.equal((params.subscription_data as { trial_period_days?: number }).trial_period_days, undefined);
      }
      // Resuming on a fresh device prefers the durable attempt over a later URL.
      const reader = { accountEnrollment: { findFirst: async () => ({ id: 'enrollment', intent: confirmedEnrollmentIntent('u1'), returnTo: nextDefinition.returnPath }) }, billingAttempt: { findUnique: async () => f.attempt() } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
      const selected = await getSelectedEnrollment(reader, { ...f.account, createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null });
      assert.equal(selected?.returnTo, destination);
      assert.equal(selected?.product, 'visual');
      assert.equal(selected?.usConfirmed, true);
      assert.equal(selected?.attemptState, 'open');
    }
  }
});

test('Hub checkout ignores every prepared Visual return and retains its vehicle and trial', async () => {
  for (const definition of KNOWN_ISSUE_TWIN_VISUALS) {
    const f = checkoutFixture();
    assert.equal((await f.request({ product: 'hub', vehicleId: 'v1', returnTo: definition.returnPath })).status, 200);
    assert.equal(f.attempt()!.returnTo, null);
    assert.equal(f.attempt()!.vehicleId, 'v1');
    const success = new URL(String(f.parameters[0].success_url));
    assert.equal(success.searchParams.get('product'), 'hub');
    assert.equal(success.searchParams.get('vehicleId'), 'v1');
    assert.equal(success.searchParams.has('returnTo'), false);
    assert.equal((f.parameters[0].subscription_data as { trial_period_days: number }).trial_period_days, 7);
  }
});

test('only unfinished enrollments get the completion surface; established members and offers retain Account', () => {
  const first = { email: 'new@example.com', emailVerified: new Date(), enrollmentProduct: 'visual', subscriptionId: null };
  assert.equal(needsEnrollmentCompletion(first, {}), true);
  assert.equal(needsEnrollmentCompletion({ ...first, enrollmentProduct: 'hub' }, {}), true);
  assert.equal(needsEnrollmentCompletion({ ...first, enrollmentProduct: null }, {}), false);
  for (const subscriptionStatus of ['incomplete', 'incomplete_expired', 'unpaid']) assert.equal(needsEnrollmentCompletion({ ...first, subscriptionId: 'sub_pending', subscriptionStatus }, {}), true);
  assert.equal(needsEnrollmentCompletion({ ...first, subscriptionId: 'sub_review', subscriptionStatus: 'active', subscriptionTier: 'free' }, { initialVerified: false }), true);
  for (const facts of [{ establishedHistory: true }, { initialVerified: true }, { hasReservationOffer: true }]) assert.equal(needsEnrollmentCompletion(first, facts), false);
  for (const subscriptionStatus of ['active', 'trialing', 'canceled', 'past_due', 'paused']) assert.equal(needsEnrollmentCompletion({ ...first, subscriptionId: 'sub_old', subscriptionStatus, subscriptionTier: 'hub' }, {}), false);
  assert.equal(needsEnrollmentCompletion({ ...first, email: 'devonsroberson24@yahoo.com' }, {}), false);
  assert.equal(needsEnrollmentCompletion({ ...first, emailVerified: null }, {}), false);
  // Later delinquency never demotes an established customer to signup.
  assert.equal(needsEnrollmentCompletion({ ...first, subscriptionId: 'sub_old', subscriptionStatus: 'unpaid' }, { initialVerified: true }), false);
});
test('uncertain checkout retries its durable key while preserving customer binding', async () => {
  const f = checkoutFixture(); f.fail(); assert.equal((await f.request()).status, 503); assert.equal(f.account.stripeCustomerId, 'cus_1');
  const key = f.attempt()!.key; assert.equal((await f.request()).status, 200); assert.equal(f.attempt()!.key, key); assert.equal(f.customers(), 1); assert.equal(f.attempt()!.sessionId, 'cs_1');
});
test('invalid Hub setup allocates no attempt and a corrected vehicle can proceed', async () => {
  const f = checkoutFixture(); assert.equal((await f.request({ product: 'hub', vehicleId: 'wrong' })).status, 409); assert.equal(f.attempt(), null); assert.equal(f.customers(), 0);
  assert.equal((await f.request({ product: 'hub', vehicleId: 'v1' })).status, 200);
  assert.equal((f.parameters[0].subscription_data as { trial_period_days: number }).trial_period_days, 7);
});

test('Visual return destination is frozen across an uncertain checkout retry', async () => {
  const f = checkoutFixture(); f.fail();
  assert.equal((await f.request({ product: 'visual', returnTo: '/known-issues/cadillac-xt6?year=2020#battery' })).status, 503);
  const original = f.attempt()!.returnTo;
  assert.equal(original, '/known-issues/cadillac-xt6?year=2020&twinPilot=1#battery');
  const key = f.attempt()!.key;
  assert.equal((await f.request({ product: 'visual', returnTo: '//external.invalid' })).status, 200);
  assert.equal(f.attempt()!.key, key); assert.equal(f.attempt()!.returnTo, original);
  assert.deepEqual(f.parameters[0], f.parameters[1]);
});
test('changing an open offer expires its old session before a replacement', async () => {
  const f = checkoutFixture(); await f.request(); assert.equal((await f.request({ product: 'hub', vehicleId: 'v1' })).status, 200); assert.equal(f.attempt()!.sessionId, 'cs_2');
});
test('a canceled completed checkout can resubscribe without restarting its trial', async () => {
  const f = checkoutFixture(); await f.request({ product: 'hub', vehicleId: 'v1' }); f.completeCanceled();
  assert.equal((await f.request({ product: 'hub', vehicleId: 'v1' })).status, 200); assert.equal(f.attempt()!.sessionId, 'cs_2');
  assert.equal((f.parameters[1].subscription_data as { trial_period_days?: number }).trial_period_days, undefined);
});
test('Visual checkout has no trial and ignores malicious return URLs', async () => {
  const f = checkoutFixture(); await f.request({ product: 'visual', successUrl: 'https://evil.example', cancelUrl: '//evil.example' });
  assert.equal((f.parameters[0].subscription_data as { trial_period_days?: number }).trial_period_days, undefined);
  assert.equal(String(f.parameters[0].success_url).includes('evil'), false); assert.equal(String(f.parameters[0].cancel_url).includes('evil'), false);
});
test('upgrade pending payment returns the same subscription invoice without granting Hub', async () => {
  const { upgradeFixture } = await import('./helpers/upgrade-fixture');
  const f = upgradeFixture(); f.state.pending = true;
  const preview = await (await f.send()).json(); assert.equal(f.updates.length, 0);
  const response = await f.confirm(preview.quote.token);
  assert.equal(response.status, 200); const result = await response.json(); assert.equal(result.paymentRequired, true); assert.equal(result.changed, false); assert.equal(result.paymentUrl, 'https://invoice.stripe.com/i/mock'); assert.equal(f.updates.length, 1); assert.equal(f.state.writes, 0);
});

test('declared foreign/missing billing country cannot allocate Checkout', async () => {
  for (const billingCountry of ['DE', 'CA', '', null]) {
    const f = checkoutFixture();
    assert.equal((await f.request({ product: 'visual', billingCountry })).status, 403);
    assert.equal(f.creates(), 0); assert.equal(f.customers(), 0); assert.equal(f.attempt(), null);
  }
});
test('Checkout requires a billing address, USD and preserves exact selected-car return', async () => {
  const f = checkoutFixture(); await f.request({ product: 'hub', vehicleId: 'v1' });
  const params = f.parameters[0];
  assert.equal(params.billing_address_collection, 'required');
  assert.deepEqual(params.customer_update, { address: 'auto' });
  assert.equal(params.currency, 'usd'); assert.deepEqual(params.adaptive_pricing, { enabled: false });
  const url = new URL(String(params.success_url));
  assert.equal(url.searchParams.get('product'), 'hub'); assert.equal(url.searchParams.get('vehicleId'), 'v1');
});
