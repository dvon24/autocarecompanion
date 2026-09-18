import assert from 'node:assert/strict';
import test from 'node:test';
import type Stripe from 'stripe';
import { verifyUsBilling, usBillingCheckoutEnabled } from '../src/lib/us-billing-eligibility';
import { createStripeWebhookHandler } from '../src/lib/stripe-webhook-handler';
import { createBillingStatusHandler } from '../src/lib/billing-status-handler';
import { createCheckoutHandler } from '../src/lib/stripe-create-checkout-handler';
import { createChangeTierHandler } from '../src/lib/stripe-change-tier-handler';
import { createBillingRecheckHandler } from '../src/lib/billing-recheck-handler';
import { productEntitlements } from '../src/lib/product-entitlements';
import type { BillingEnrollmentReview } from '../src/lib/billing-enrollment-review';

function fixture() {
  const address = () => ({ country: 'US' as string | null });
  const customer = { id: 'cus_1', deleted: false, address: address(), invoice_settings: { default_payment_method: 'pm_1' } };
  const method = { id: 'pm_1', type: 'card', customer: 'cus_1' as string | null, billing_details: { address: address() }, card: { country: 'DE' } };
  const sub = { id: 'sub_1', customer: 'cus_1', status: 'active', currency: 'usd', collection_method: 'charge_automatically', metadata: { attemptKey: 'key_1' }, default_payment_method: 'pm_1' as string | null, pending_setup_intent: null as string | null,
    items: { data: [{ quantity: 1, price: { id: 'price_visual', active: true, currency: 'usd', type: 'recurring', unit_amount: 499, billing_scheme: 'per_unit', transform_quantity: null, recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' } } }] } };
  const checkout = { id: 'cs_1', status: 'complete', customer: 'cus_1', subscription: 'sub_1', client_reference_id: 'u1', metadata: { attemptKey: 'key_1' }, invoice: 'in_1', created: 100, payment_status: 'paid', customer_details: { address: address() }, setup_intent: null as string | null };
  const invoice = { id: 'in_1', customer: 'cus_1', parent: { subscription_details: { subscription: 'sub_1' } }, customer_address: address(), amount_due: 499 };
  const intent = { id: 'pi_1', customer: 'cus_1', status: 'succeeded', payment_method: 'pm_1' };
  const setup = { id: 'seti_1', customer: 'cus_1', status: 'succeeded', payment_method: 'pm_1', created: 100 };
  const payments = { data: [{ invoice: 'in_1', payment: { type: 'payment_intent', payment_intent: 'pi_1' } }], has_more: false };
  const state = { failProvider: false, failCheckout: false, failMethod: false, lockBusy: false, cooldown: false, missingProvider: false, failReceipt: false, held: false, reads: 0, writes: 0, review: null as BillingEnrollmentReview | null };
  const account = { id: 'u1', email: 'synthetic@example.invalid', emailVerified: new Date(), stripeCustomerId: 'cus_1', subscriptionId: null as string | null, subscriptionStatus: null as string | null, subscriptionTier: 'free', legacySubscriptionTier: null as string | null };
  const attempt = { userId: 'u1', key: 'key_1', product: 'visual', customerId: 'cus_1', sessionId: 'cs_1', subscriptionId: null as string | null, state: 'open' };
  const receipts = new Set<string>();
  const stripe = { customers: { retrieve: async () => { state.reads++; if (state.failProvider) throw Error('network'); if (state.missingProvider) throw Object.assign(Error('not found'), { code: 'resource_missing' }); return customer; } }, paymentMethods: { retrieve: async (id: string) => { state.reads++; if (state.failMethod) throw Error('method network'); return { ...method, id }; } },
    invoices: { retrieve: async () => invoice }, invoicePayments: { list: async () => payments }, paymentIntents: { retrieve: async () => intent }, setupIntents: { retrieve: async () => setup },
    checkout: { sessions: { retrieve: async () => { if (state.failCheckout) throw Error('checkout network'); return checkout; } } }, subscriptions: { retrieve: async () => sub, list: async () => ({ data: [sub], has_more: false }) },
    webhooks: { constructEvent: (body: string) => JSON.parse(body) },
  } as unknown as Stripe;
  const tx = { user: { findUnique: async () => account, findUniqueOrThrow: async () => account, update: async ({ data }: { data: object }) => { state.writes++; Object.assign(account, data); } },
    billingAttempt: { findUnique: async () => attempt, update: async ({ data }: { data: object }) => Object.assign(attempt, data) },
    billingEvent: { findUnique: async ({ where }: { where: { id: string } }) => receipts.has(where.id) ? {} : null, create: async ({ data }: { data: { id: string } }) => { if (state.failReceipt) throw Error('write failure'); receipts.add(data.id); } },
    $queryRaw: async (sql: TemplateStringsArray, ...args: unknown[]) => {
      const query = sql.join('');
      if (query.includes('pg_try_advisory')) return [{ locked: !state.lockBusy }];
      if (query.startsWith('UPDATE "BillingEnrollmentReview"')) {
        if (state.cooldown || state.review?.userId !== args[0] || state.review?.subscriptionId !== args[1]) return [];
        state.cooldown = true; return [{ subscriptionId: args[1] }];
      }
      return query.includes('BillingEnrollmentReview') && state.review?.subscriptionId === args[0] && state.review?.userId === args[1] ? [state.review] : [];
    },
    $executeRaw: async (_sql: TemplateStringsArray, subscriptionId: string, userId: string, customerId: string, sessionId: string, attemptKey: string, reviewState: string, initialVerified: boolean) => {
      assert.equal(state.held, true, 'review writes use the held account transaction');
      state.review = { subscriptionId, userId, customerId, sessionId, attemptKey, state: reviewState, initialVerified: state.review?.initialVerified || initialVerified }; return 1;
    },
  };
  const db = { ...tx, $queryRaw: async (...args: Parameters<typeof tx.$queryRaw>) => { assert.equal(state.held, false, 'no root pool query while transaction holds a connection'); return tx.$queryRaw(...args); },
    $transaction: async (fn: (value: typeof tx) => unknown) => {
      const before = structuredClone({ account, attempt, review: state.review, receipts: [...receipts] }); state.held = true;
      try { return await fn(tx); } catch (error) { Object.assign(account, before.account); Object.assign(attempt, before.attempt); state.review = before.review; receipts.clear(); before.receipts.forEach(id => receipts.add(id)); throw error; }
      finally { state.held = false; }
    },
  };
  const handler = createStripeWebhookHandler({ prisma: db, getStripe: () => stripe, secret: () => 'synthetic' } as unknown as Parameters<typeof createStripeWebhookHandler>[0]);
  const recheck = createBillingRecheckHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: db, getStripe: () => stripe } as unknown as Parameters<typeof createBillingRecheckHandler>[0]);
  return { customer, method, sub, checkout, invoice, intent, setup, payments, state, account, attempt, receipts, db, stripe,
    recheck: (body: object = {}, origin = 'https://au7o.io') => recheck(new Request('https://au7o.io/api/billing/recheck', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })),
    verify: (initialVerified = false) => verifyUsBilling(stripe, sub as unknown as Stripe.Subscription, checkout as unknown as Stripe.Checkout.Session, initialVerified),
    send: (id = 'evt_1', type = 'checkout.session.completed') => handler(new Request('https://example.invalid/webhook', { method: 'POST', body: JSON.stringify({ id, type, data: { object: type.startsWith('checkout') ? checkout : sub } }) })),
  };
}

test('US collected/customer/effective/paid method evidence grants regardless of card issuing country', async () => {
  const f = fixture(); assert.equal(await f.verify(), true); f.method.card.country = 'US'; f.method.billing_details.address.country = 'DE'; assert.equal(await f.verify(), false);
});
test('foreign, missing, deleted and conflicting billing evidence or wrong ownership fails closed', async () => {
  for (const country of ['DE', null, '']) for (const field of ['checkout', 'customer', 'method', 'invoice'] as const) {
    const f = fixture(); const address = field === 'checkout' ? f.checkout.customer_details.address : field === 'customer' ? f.customer.address : field === 'method' ? f.method.billing_details.address : f.invoice.customer_address;
    address.country = country; assert.equal(await f.verify(), false, `${field}:${country}`);
  }
  for (const mutate of [(f: ReturnType<typeof fixture>) => { f.customer.deleted = true; }, (f: ReturnType<typeof fixture>) => { f.method.customer = null; }, (f: ReturnType<typeof fixture>) => { f.intent.customer = 'foreign'; }, (f: ReturnType<typeof fixture>) => { f.invoice.parent.subscription_details.subscription = 'foreign'; }, (f: ReturnType<typeof fixture>) => { f.payments.has_more = true; }, (f: ReturnType<typeof fixture>) => { f.payments.data = []; }, (f: ReturnType<typeof fixture>) => { f.sub.default_payment_method = null; f.customer.invoice_settings.default_payment_method = ''; }]) {
    const f = fixture(); mutate(f); assert.equal(await f.verify(), false);
  }
});
test('trial SetupIntent supports cleared pointers/saved methods; rejects pending, foreign and unbound selection', async () => {
  for (const pending of [null, 'seti_1']) {
    const f = fixture(); f.invoice.amount_due = 0; f.checkout.payment_status = 'no_payment_required'; f.sub.status = 'trialing'; f.sub.pending_setup_intent = pending;
    assert.equal(await f.verify(), true);
    if (pending) { f.setup.status = 'requires_action'; assert.equal(await f.verify(), false); f.setup.status = 'succeeded'; f.setup.payment_method = 'pm_unrelated'; assert.equal(await f.verify(), false); }
    f.sub.default_payment_method = null; assert.equal(await f.verify(), false);
  }
  const f = fixture(); f.invoice.amount_due = 0; f.checkout.payment_status = 'no_payment_required'; f.method.billing_details.address.country = 'CA'; assert.equal(await f.verify(), false);
});
test('rejected subscription remains bound and durable scope survives next events and unrelated attempt', async () => {
  process.env.STRIPE_PRICE_ID_VISUAL = 'price_visual'; const f = fixture(); f.customer.address.country = 'DE';
  assert.equal((await f.send()).status, 200); assert.equal(f.account.subscriptionId, 'sub_1'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.attempt.state, 'billing_review'); assert.equal(f.state.review?.initialVerified, false);
  await f.send('evt_2', 'customer.subscription.updated'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.state.review?.state, 'review_required');
  f.attempt.key = 'other'; f.attempt.sessionId = 'cs_other'; f.attempt.state = 'open'; await f.send('evt_3', 'customer.subscription.updated'); assert.equal(f.attempt.state, 'open'); assert.equal(f.state.review?.sessionId, 'cs_1');
  const writes = f.state.writes; f.sub.id = 'sub_unrelated'; await f.send('evt_4', 'customer.subscription.updated'); assert.equal(f.state.writes, writes); assert.equal(f.state.review?.subscriptionId, 'sub_1');
});
test('US payment grants, duplicate is idempotent, corrected customer recovers same subscription', async () => {
  const f = fixture(); f.customer.address.country = 'DE'; await f.send(); f.customer.address.country = 'US'; await f.send('evt_recover', 'customer.subscription.updated');
  assert.equal(f.account.subscriptionTier, 'visual'); assert.equal(f.state.review?.initialVerified, true); assert.equal(f.attempt.subscriptionId, 'sub_1');
  const writes = f.state.writes; await f.send('evt_recover'); assert.equal(f.state.writes, writes);
  assert.equal(productEntitlements(f.account).visual, true);
});
test('confirmed renewal and later review recovery use replacement card without retaining old paid method', async () => {
  const f = fixture(); await f.send(); f.sub.default_payment_method = 'pm_new'; f.intent.customer = 'original_method_detached';
  await f.send('evt_renew', 'customer.subscription.updated'); assert.equal(f.account.subscriptionTier, 'visual');
  f.customer.address.country = 'CA'; await f.send('evt_review', 'customer.subscription.updated'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.state.review?.initialVerified, true);
  f.customer.address.country = 'US'; await f.send('evt_recover', 'customer.subscription.updated'); assert.equal(f.account.subscriptionTier, 'visual');
});
test('provider and receipt failures roll back state and event receipt so same event retries', async () => {
  for (const field of ['failProvider', 'failReceipt'] as const) {
    const f = fixture(); f.state[field] = true; assert.equal((await f.send()).status, 503); assert.equal(f.receipts.size, 0); assert.equal(f.state.review, null); assert.equal(f.account.subscriptionId, null);
    f.state[field] = false; assert.equal((await f.send()).status, 200); assert.equal(f.receipts.size, 1); assert.equal(f.account.subscriptionTier, 'visual');
  }
});
test('review cancellation commits authoritative terminal status during address provider outage', async () => {
  const f = fixture(); f.customer.address.country = 'DE'; await f.send(); f.sub.status = 'canceled'; f.state.failProvider = true;
  assert.equal((await f.send('evt_cancel', 'customer.subscription.deleted')).status, 200); assert.equal(f.account.subscriptionStatus, 'canceled'); assert.equal(f.state.review?.state, 'review_required');
});
test('definitively missing provider resources commit a recoverable denial instead of endless retries', async () => {
  const f = fixture(); f.state.missingProvider = true; assert.equal((await f.send()).status, 200);
  assert.equal(f.state.review?.state, 'review_required'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.receipts.size, 1);
});
test('reviewed existing legacy and founder access retain preservation paths', async () => {
  const f = fixture(); f.account.subscriptionId = 'sub_1'; f.account.legacySubscriptionTier = 'plus'; f.account.subscriptionTier = 'plus'; f.sub.items.data[0].price.id = 'legacy';
  process.env.STRIPE_REVIEWED_LEGACY_PRICE_IDS = 'legacy'; f.state.failProvider = true; await f.send('evt_legacy', 'customer.subscription.updated');
  assert.equal(f.account.subscriptionTier, 'plus'); assert.equal(f.state.review, null); assert.equal(productEntitlements(f.account).hub, true);
  assert.equal(productEntitlements({ ...f.account, email: 'devonsroberson24@yahoo.com', subscriptionTier: 'free' }).founder, true);
});
test('authenticated review status is terminal/private and checkout cannot replace rejected subscription', async () => {
  const f = fixture(); f.customer.address.country = 'DE'; await f.send();
  const response = await createBillingStatusHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: f.db } as unknown as Parameters<typeof createBillingStatusHandler>[0])(new Request('https://example.invalid/api/billing/status?product=hub'));
  assert.deepEqual(await response.json(), { ready: false, reviewRequired: true, destination: '/account' }); assert.match(response.headers.get('Cache-Control')!, /private, no-store/);
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true'; process.env.VERCEL = '1'; process.env.VERCEL_ENV = 'preview'; process.env.STRIPE_SECRET_KEY = 'sk_test_synthetic'; process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV = 'preview:test';
  const stripe = { prices: { retrieve: async () => f.sub.items.data[0].price } };
  const checkout = createCheckoutHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: f.db, getPriceIdForTier: () => 'price_visual', getStripe: () => stripe } as unknown as Parameters<typeof createCheckoutHandler>[0]);
  const result = await checkout(new Request('https://example.invalid/checkout', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ product: 'visual', billingCountry: 'US' }) }));
  assert.equal(result.status, 409); assert.equal((await result.json()).error, 'billing_review_required');
});
test('precharge attestation is closed by default and scoped to environment plus Stripe mode', async () => {
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true'; process.env.VERCEL = '1'; process.env.VERCEL_ENV = 'preview'; process.env.STRIPE_SECRET_KEY = 'sk_test_synthetic';
  for (const value of ['', 'true', 'production:test', 'preview:live']) { process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV = value; assert.equal(usBillingCheckoutEnabled(), false); }
  delete process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV;
  let touches = 0;
  const handler = createCheckoutHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: {} as never, getStripe: () => { touches++; throw Error('no provider'); }, getPriceIdForTier: () => { touches++; return null; } });
  const result = await handler(new Request('https://example.invalid/checkout', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' } })); assert.equal(result.status, 503); assert.equal((await result.json()).error, 'us_billing_enforcement_unverified'); assert.equal(touches, 0);
  process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV = 'preview:test'; assert.equal(usBillingCheckoutEnabled(), true);
});
test('persisted enrollment review blocks a direct new upgrade even after current address is corrected', async () => {
  const f = fixture(); f.checkout.customer_details.address.country = 'CA'; await f.send();
  const handler = createChangeTierHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: f.db, getStripe: () => f.stripe, getPriceIdForTier: () => 'price_hub' } as unknown as Parameters<typeof createChangeTierHandler>[0]);
  const response = await handler(new Request('https://example.invalid/upgrade', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ product: 'hub', action: 'preview', billingCountry: 'US', vehicleId: 'v1' }) }));
  assert.equal(response.status, 409); assert.equal((await response.json()).error, 'billing_review_required'); assert.equal(f.account.subscriptionTier, 'free');
});

test('explicit authenticated recheck recovers corrected billing without a webhook or fabricated receipt', async () => {
  process.env.APP_URL = 'https://au7o.io';
  const f = fixture(); f.customer.address.country = 'CA'; await f.send(); const receipts = f.receipts.size;
  f.customer.address.country = 'US'; const response = await f.recheck(); assert.equal(response.status, 200);
  const result = await response.json(); assert.equal(result.reviewRequired, false); assert.equal(result.ready, true);
  assert.equal(f.account.subscriptionTier, 'visual'); assert.equal(f.account.subscriptionId, 'sub_1'); assert.equal(f.receipts.size, receipts); assert.equal(f.state.review?.initialVerified, true);
  assert.match(response.headers.get('Cache-Control')!, /private, no-store/);
});
test('recheck retains invalid billing and gates identity spoofing, origin, scope and durable cooldown', async () => {
  const f = fixture(); f.customer.address.country = 'CA'; await f.send();
  assert.equal((await f.recheck({}, 'https://foreign.invalid')).status, 403);
  assert.equal((await f.recheck({ subscriptionId: 'sub_other' })).status, 400);
  assert.equal(f.state.cooldown, false);
  const response = await f.recheck(); assert.equal(response.status, 200); assert.equal((await response.json()).reviewRequired, true);
  const limited = await f.recheck(); assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '10');
  f.state.cooldown = false; f.state.lockBusy = true; assert.equal((await f.recheck()).status, 429); assert.equal(f.state.cooldown, false);
  const unbound = fixture(); assert.equal((await unbound.recheck()).status, 409);
  const existing = fixture(); existing.account.subscriptionId = 'sub_1'; assert.equal((await existing.recheck()).status, 409); assert.equal(existing.state.reads, 0);
});
test('failed provider recheck retains committed cooldown, review state and no receipt', async () => {
  const f = fixture(); f.customer.address.country = 'CA'; await f.send(); f.customer.address.country = 'US'; f.state.failProvider = true;
  const receipts = f.receipts.size; assert.equal((await f.recheck()).status, 503); assert.equal(f.state.review?.state, 'review_required');
  assert.equal(f.state.cooldown, true); assert.equal(f.receipts.size, receipts); assert.equal((await f.recheck()).status, 429);
  f.state.cooldown = false; f.state.failProvider = false; assert.equal((await f.recheck()).status, 200); assert.equal(f.account.subscriptionTier, 'visual');
});
test('already-bound non-granting status revokes active/trial access before every optional provider lookup', async () => {
  for (const initial of ['active', 'trialing']) for (const status of ['canceled', 'paused', 'past_due', 'incomplete_expired', 'unpaid', 'incomplete']) for (const failure of ['failCheckout', 'failProvider', 'failMethod'] as const) {
    const f = fixture(); f.sub.status = initial; if (initial === 'trialing') { f.sub.items.data[0].price.id = 'price_hub'; f.sub.items.data[0].price.unit_amount = 1499; process.env.STRIPE_PRICE_ID_HUB = 'price_hub'; }
    await f.send(); assert.equal(productEntitlements(f.account).visual, true);
    f.sub.status = status; f.state[failure] = true; const reads = f.state.reads;
    assert.equal((await f.send('evt_revoke', 'customer.subscription.updated')).status, 200, `${initial}:${status}:${failure}`);
    assert.equal(f.account.subscriptionStatus, status); assert.equal(productEntitlements(f.account).visual, false); assert.equal(f.state.reads, reads); assert.equal(f.receipts.size, 2);
    await f.send('evt_revoke', 'customer.subscription.updated'); assert.equal(f.receipts.size, 2);
  }
});
test('non-granting first binding still requires Checkout proof and retry has no receipt', async () => {
  const f = fixture(); f.sub.status = 'canceled'; f.state.failCheckout = true;
  assert.equal((await f.send()).status, 503); assert.equal(f.account.subscriptionId, null); assert.equal(f.receipts.size, 0);
});
test('unauthenticated recheck never reads provider or database and all failures stay private', async () => {
  const handler = createBillingRecheckHandler({ auth: async () => null, prisma: {} as never, getStripe: () => { throw Error('must not touch'); } });
  const response = await handler(new Request('https://au7o.io/api/billing/recheck', { method: 'POST', headers: { origin: 'https://au7o.io' }, body: '{}' }));
  assert.equal(response.status, 401); assert.match(response.headers.get('Cache-Control')!, /private, no-store/);
});
test('simultaneous rechecks share one durable cooldown and perform one reconciliation', async () => {
  const f = fixture(); f.customer.address.country = 'CA'; await f.send(); f.customer.address.country = 'US';
  const writes = f.state.writes; const responses = await Promise.all([f.recheck(), f.recheck()]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 429]); assert.equal(f.state.writes, writes + 1);
  assert.equal(f.account.subscriptionTier, 'visual'); assert.equal(f.receipts.size, 1);
});
test('first non-granting enrollment stays unverified through an active-before-webhook upgrade gap', async () => {
  for (const status of ['past_due', 'paused', 'canceled', 'incomplete_expired']) {
    const f = fixture(); f.sub.status = status;
    assert.equal((await f.send()).status, 200); assert.equal(f.state.review?.initialVerified, false);
    assert.equal(f.state.review?.state, 'review_required'); assert.equal(f.account.subscriptionTier, 'free'); assert.equal(f.attempt.state, 'billing_review');
    f.sub.status = 'active';
    const handler = createChangeTierHandler({ auth: async () => ({ user: { id: 'u1' } }), prisma: f.db, getStripe: () => f.stripe, getPriceIdForTier: () => 'price_hub' } as unknown as Parameters<typeof createChangeTierHandler>[0]);
    const response = await handler(new Request('https://example.invalid/upgrade', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ product: 'hub', action: 'preview', billingCountry: 'US', vehicleId: 'v1' }) }));
    assert.equal(response.status, 409); assert.equal((await response.json()).error, 'billing_review_required');
    await f.send('evt_active', 'customer.subscription.updated');
    assert.equal(f.state.review?.initialVerified, true); assert.equal(f.state.review?.state, 'confirmed'); assert.equal(f.account.subscriptionTier, 'visual');
  }
});
test('scoped confirmed-but-unverified records cannot start upgrades; verified and legacy records can', async () => {
  const { upgradeFixture } = await import('./helpers/upgrade-fixture');
  const denied = upgradeFixture({ review: { state: 'confirmed', initialVerified: false } });
  assert.equal((await denied.send()).status, 409); assert.equal(denied.updates.length, 0); assert.equal(denied.previews.length, 0);
  for (const options of [{}, { review: { state: 'confirmed', initialVerified: true } }]) {
    const allowed = upgradeFixture(options); assert.equal((await allowed.send()).status, 200); assert.equal(allowed.previews.length, 1); assert.equal(allowed.updates.length, 0);
  }
});
test('already dispatched upgrade recovery precedes the unverified enrollment guard without another charge', async () => {
  const { upgradeFixture } = await import('./helpers/upgrade-fixture');
  const options: { review?: { state: string; initialVerified: boolean } } = {};
  const f = upgradeFixture(options); f.state.pending = true;
  const quote = (await (await f.send()).json()).quote; await f.confirm(quote.token); assert.equal(f.updates.length, 1);
  options.review = { state: 'review_required', initialVerified: false };
  const response = await f.send(); assert.equal(response.status, 200); const result = await response.json();
  assert.equal(result.paymentRequired, true); assert.equal(result.paymentUrl, 'https://invoice.stripe.com/i/mock'); assert.equal(f.updates.length, 1);
});
