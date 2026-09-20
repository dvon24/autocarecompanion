import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import type Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { createCheckoutHandler } from '../src/lib/stripe-create-checkout-handler';
import { createChangeTierHandler } from '../src/lib/stripe-change-tier-handler';
import { createReservationHandler } from '../src/lib/reservation-handler';
import { createVisualSignupHandler } from '../src/lib/visual-signup-handler';
import { GET as eligibility } from '../src/app/api/enrollment-eligibility/route';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';

function vercel(t: TestContext, value: string | undefined = '1') {
  for (const [key, value] of Object.entries({ VERCEL_ENV: 'preview', STRIPE_SECRET_KEY: 'sk_test_synthetic', STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV: 'preview:test' })) {
    const original = process.env[key]; process.env[key] = value;
    t.after(() => { if (original === undefined) delete process.env[key]; else process.env[key] = original; });
  }
  const original = process.env.VERCEL;
  const flag = process.env.ACCOUNT_ENROLLMENT_ENABLED; process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true';
  t.after(() => { if (flag === undefined) delete process.env.ACCOUNT_ENROLLMENT_ENABLED; else process.env.ACCOUNT_ENROLLMENT_ENABLED = flag; });
  if (value === undefined) delete process.env.VERCEL; else process.env.VERCEL = value;
  t.after(() => { if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original; });
}
const request = (country: string | null, body: unknown = { product: 'visual', billingCountry: 'US' }) => new NextRequest('http://localhost/api/test', {
  method: 'POST', headers: country === null ? {} : { 'x-vercel-ip-country': country }, body: JSON.stringify(body),
});
const price = (overrides: Partial<Stripe.Price> = {}) => ({
  id: 'price_plan', active: true, currency: 'usd', type: 'recurring', unit_amount: 499,
  billing_scheme: 'per_unit', transform_quantity: null,
  recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, ...overrides,
} as Stripe.Price);

function billingMock(options: { customer?: string; price?: Stripe.Price; anonymous?: boolean; unverified?: boolean; product?: 'visual' | 'hub' } = {}) {
  const calls = { reads: 0, prices: 0, checkout: [] as Stripe.Checkout.SessionCreateParams[], stripeWrites: 0, databaseWrites: 0 };
  const account = { id: 'member', email: 'verified-member@example.com', emailVerified: options.unverified ? null : new Date(), stripeCustomerId: options.customer, subscriptionId: null };
  let attempt: Record<string, unknown> | null = null;
  const vehicle = { ...VEHICLE_TWIN_CATALOG.find(row => row.ownerReady)!.identity, id: 'v1', userId: 'member', currentMileage: 42000, transmission: 'automatic' };
  const tx = { $queryRaw: async () => [], user: {
    findUnique: async () => { calls.reads++; return account; }, findUniqueOrThrow: async () => account,
    update: async ({ data }: { data: Record<string, unknown> }) => { calls.databaseWrites++; Object.assign(account, data); },
  }, vehicle: { findFirst: async () => vehicle }, billingAttempt: {
    findUnique: async () => attempt, findUniqueOrThrow: async () => attempt,
    create: async ({ data }: { data: Record<string, unknown> }) => attempt = { ...data, createdAt: new Date(), sessionId: null },
    update: async ({ data }: { data: Record<string, unknown> }) => Object.assign(attempt!, data),
  } };
  const stripe = {
    prices: { retrieve: async () => { calls.prices++; return options.price ?? price({ unit_amount: options.product === 'hub' ? 1499 : 499 }); } },
    customers: { create: async () => { calls.stripeWrites++; return { id: 'cus_created' }; } },
    subscriptions: { list: async () => ({ data: [], has_more: false }) },
    checkout: { sessions: { create: async (params: Stripe.Checkout.SessionCreateParams) => { calls.checkout.push(params); calls.stripeWrites++; return { id: 'cs_test', status: 'open', url: 'https://example.invalid/checkout' }; } } },
  } as unknown as Stripe;
  const deps = {
    auth: async () => options.anonymous ? null : { user: { id: account.id } },
    getStripe: () => stripe, getPriceIdForTier: () => 'price_plan',
    prisma: { ...tx, $transaction: async (fn: (value: typeof tx) => unknown) => fn(tx) },
  } as unknown as Parameters<typeof createCheckoutHandler>[0];
  return { calls, deps };
}

test('geo denial precedes Stripe and persistence for checkout, changes, reservations and Visual capture', async (t) => {
  vercel(t);
  for (const country of [null, 'DE', 'CA', 'GB', 'us', 'USA']) {
    const { calls, deps } = billingMock();
    assert.equal((await createCheckoutHandler(deps)(request(country))).status, 403);
    assert.equal((await createChangeTierHandler(deps)(request(country))).status, 403);
    let touched = 0;
    const reservation = createReservationHandler({ prisma: new Proxy({}, { get() { touched++; throw new Error('must not access DB'); } }) as Parameters<typeof createReservationHandler>[0]['prisma'], rateLimit: () => { touched++; return null; } });
    const visual = createVisualSignupHandler({ rateLimit: () => { touched++; return null; }, validateEmail: async () => { touched++; return { ok: true }; }, save: async () => { touched++; } });
    const spoof = { email: 'person@example.com', country: 'US', consent: true, vehicle: '2020 Cadillac XT6' };
    assert.equal((await reservation(request(country, spoof))).status, 403);
    assert.equal((await visual(request(country, spoof))).status, 403);
    assert.equal(touched, 0);
    assert.deepEqual(calls, { reads: 0, prices: 0, checkout: [], stripeWrites: 0, databaseWrites: 0 });
  }
});

test('off-Vercel spoofed US cannot enroll and eligibility response is private/no-store', async (t) => {
  vercel(t, '0');
  const { calls, deps } = billingMock();
  assert.equal((await createCheckoutHandler(deps)(request('US'))).status, 403);
  assert.equal(calls.prices + calls.reads + calls.stripeWrites, 0);
  const response = eligibility(request('US'));
  assert.deepEqual(await response.json(), { eligible: false, accountEnrollmentEnabled: false });
  assert.match(response.headers.get('Cache-Control')!, /private, no-store/);
  assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), 'no-store');
});

test('enrollment flag is opt-in and enabled enrollment still requires authentication and verified email', async (t) => {
  vercel(t);
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'false';
  let fixture = billingMock(); assert.equal((await createCheckoutHandler(fixture.deps)(request('US'))).status, 410); assert.equal(fixture.calls.stripeWrites, 0);
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true';
  for (const options of [{ anonymous: true }, { unverified: true }]) {
    fixture = billingMock(options); const response = await createCheckoutHandler(fixture.deps)(request('US'));
    assert.equal(response.status, options.anonymous ? 401 : 403); assert.equal(fixture.calls.stripeWrites, 0);
  }
});

test('verified non-founder Visual and Hub enrollment uses durable explicit USD sessions', async (t) => {
  vercel(t);
  for (const product of ['visual', 'hub'] as const) for (const customer of [undefined, 'cus_existing']) {
    const { calls, deps } = billingMock({ product, customer });
    assert.equal((await createCheckoutHandler(deps)(request('US', { product, vehicleId: 'v1', billingCountry: 'US' }))).status, 200);
    assert.equal(calls.checkout.length, 1); const session = calls.checkout[0];
    assert.equal(session.currency, 'usd'); assert.deepEqual(session.adaptive_pricing, { enabled: false });
    assert.equal(session.customer, customer || 'cus_created'); assert.equal(session.billing_address_collection, 'required');
    assert.deepEqual(session.line_items, [{ price: 'price_plan', quantity: 1 }]);
    assert.equal(session.subscription_data?.metadata?.userId, 'member');
    assert.equal(session.subscription_data?.trial_period_days, product === 'hub' ? 7 : undefined);
  }
});

test('inactive, non-USD, incorrect amount/interval and unsupported price shapes cannot write', async (t) => {
  vercel(t);
  const invalid = [price({ active: false }), price({ currency: 'eur' }), price({ unit_amount: 999 }), price({ type: 'one_time', recurring: null }), price({ recurring: { ...price().recurring!, interval: 'year' } }), price({ recurring: { ...price().recurring!, interval_count: 2 } }), price({ recurring: { ...price().recurring!, usage_type: 'metered' } }), price({ billing_scheme: 'tiered' }), price({ transform_quantity: { divide_by: 10, round: 'up' } })];
  for (const configured of invalid) {
    const { calls, deps } = billingMock({ price: configured });
    const response = await createCheckoutHandler(deps)(request('US'));
    assert.equal(response.status, 503); assert.equal(calls.stripeWrites + calls.databaseWrites, 0);
  }
});

test('superseded public Plus/Pro and annual offers remain rejected', async (t) => {
  vercel(t);
  for (const body of [{ tierId: 'plus' }, { tierId: 'pro' }, { product: 'visual', interval: 'year' }, { product: 'hub', interval: 'year' }]) {
    const { calls, deps } = billingMock();
    assert.equal((await createCheckoutHandler(deps)(request('US', { billingCountry: 'US', ...body }))).status, 400);
    assert.equal(calls.stripeWrites + calls.databaseWrites, 0);
  }
});

test('US reservation resubmission preserves existing international country and opt-outs', async (t) => {
  vercel(t);
  let written: Record<string, unknown> | undefined;
  const deps = {
    rateLimit: () => null,
    prisma: { $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ $queryRaw: async () => [{id:'existing'}], reservation: {
      findMany: async () => [{ id: 'existing', updatedAt: new Date(), country: 'Germany', vehicle: 'custom vehicle', vehicleVerified: false, unsubscribedAt: new Date(), unsubscribeToken: 'original-token', twinStatus: 'reserved' }],
      updateMany: async (args: { data: Record<string, unknown> }) => { written = args.data; return { count: 1 }; },
      create: async (args: { data: Record<string, unknown> }) => { written = args.data; return {}; },
    } }) },
  } as unknown as Parameters<typeof createReservationHandler>[0];
  const response = await createReservationHandler(deps)(request('US', { email: 'person@example.com', country: 'United States', vehicle: 'custom vehicle', source: 'hero' }));
  assert.equal(response.status, 200);
  assert.equal(written, undefined, 'An exact resubmission performs no mutation, preserving country, opt-out and token');
});
