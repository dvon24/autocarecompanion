import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { visualReturnDestination, enrollmentContinuation } from '../src/lib/visual-return-destination';
import { reserveEnrollment, reserveEnrollmentRequest, createStartEnrollmentHandler, redeemEnrollment, enrollmentFailureResponse } from '../src/lib/account-enrollment';
import { createEmailSender } from '../src/lib/email';
import { RateLimiter } from '../src/lib/rate-limit';
import { subscriptionRegionStatus, enrollmentRegionMessage } from '../src/lib/pricing/region';
import { billingReturnState } from '../src/lib/billing-return';
import { safeInternalCallback } from '../src/lib/auth-callback';
import { confirmedEnrollmentIntent, getSelectedEnrollment, hasCompletedEnrollmentHistory, needsEnrollmentCompletion, SELECTED_CHECKOUT_PATH } from '../src/lib/selected-enrollment';
import { KNOWN_ISSUE_TWIN_VISUALS } from '../src/lib/known-issue-twin-visuals';

const origin = '/known-issues/cadillac-xt6?year=2020&trim=Premium+Luxury&twinPilot=1#cadillac-xt6-auto-stop-2020';
test('Visual destinations are canonical and never external or unsupported', () => {
  assert.equal(visualReturnDestination(origin), origin);
  assert.equal(visualReturnDestination('/known-issues/cadillac-xt6?callbackUrl=https://evil.invalid&year=bad'), '/known-issues/cadillac-xt6?twinPilot=1');
  for (const value of [undefined, '', 'https://evil.invalid', '//evil.invalid', '/\\evil.invalid', '/%2f%2fevil.invalid', '/known-issues/cadillac-xt6%2f..', '/account', '/known-issues/bmw', '/known-issues/cadillac-xt6\n', 'javascript:alert(1)']) assert.equal(visualReturnDestination(value), '/visual');
  assert.equal(new URL(enrollmentContinuation('visual', null, origin), 'https://au7o.invalid').searchParams.get('returnTo'), origin);
  assert.equal(enrollmentContinuation('hub', 'v1', origin), '/subscribe?product=hub&vehicleId=v1');
});

test('every prepared Visual definition preserves its exact path and supported context through signup', () => {
  assert.deepEqual(KNOWN_ISSUE_TWIN_VISUALS.map(row => row.slug).sort(), [
    'acura-mdx', 'cadillac-xt6', 'lincoln-aviator', 'lincoln-nautilus', 'nissan-kicks', 'nissan-murano',
  ]);
  for (const definition of KNOWN_ISSUE_TWIN_VISUALS) {
    assert.equal(visualReturnDestination(definition.returnPath), definition.returnPath);
    const path = `/known-issues/${definition.slug}`;
    assert.equal(visualReturnDestination(`//au7o.invalid${path}`), '/visual');
    assert.equal(visualReturnDestination(`//evil.invalid${path}`), '/visual');
    const query = new URLSearchParams({ year: String(definition.year), trim: definition.identity.trim, engine: definition.identity.engine, twinPilot: '1' });
    const anchor = `#${definition.slug}-issue-1`;
    const canonical = `${path}?${query}${anchor}`;
    const input = `${path}?engine=${encodeURIComponent(definition.identity.engine)}&trim=${encodeURIComponent(definition.identity.trim)}&year=${definition.year}&twinPilot=0&token=secret&password=secret&callbackUrl=https://evil.invalid&returnTo=/account${anchor}`;
    assert.equal(visualReturnDestination(input), canonical);
    assert.equal(visualReturnDestination(canonical), canonical);
    const continuation = new URL(enrollmentContinuation('visual', null, input), 'https://au7o.invalid');
    assert.equal(continuation.searchParams.get('returnTo'), canonical);
    assert.deepEqual([...continuation.searchParams.keys()], ['product', 'returnTo']);
    assert.equal(enrollmentContinuation('hub', 'v1', input), '/subscribe?product=hub&vehicleId=v1');
    assert.equal(visualReturnDestination(path), `${path}?twinPilot=1`);
    for (const suffix of ['/', '/child', '-other', '%2fchild', '%00', '\\n', '\n']) {
      assert.equal(visualReturnDestination(`${path}${suffix}`), '/visual');
    }
  }
});

test('Visual return validation retains existing year, query, length and anchor boundaries', () => {
  const path = '/known-issues/lincoln-nautilus';
  for (const year of ['1999', '2100', '20', '20200', '2020x', '%202020', '2020%00']) {
    assert.equal(visualReturnDestination(`${path}?year=${year}`), `${path}?twinPilot=1`);
  }
  for (const year of ['2000', '2099']) assert.equal(visualReturnDestination(`${path}?year=${year}`), `${path}?year=${year}&twinPilot=1`);
  for (const key of ['trim', 'engine']) {
    assert.equal(visualReturnDestination(`${path}?${key}=${'a'.repeat(100)}`), `${path}?${key}=${'a'.repeat(100)}&twinPilot=1`);
    for (const value of ['', 'a'.repeat(101), 'bad%5Cvalue', 'bad%00value', 'bad%1Fvalue']) {
      assert.equal(visualReturnDestination(`${path}?${key}=${value}`), `${path}?twinPilot=1`);
    }
  }
  assert.equal(visualReturnDestination(`${path}?year=2020&year=2021&trim=First&trim=Second&twinPilot=0`), `${path}?year=2020&trim=First&twinPilot=1`);
  assert.equal(visualReturnDestination(`${path}#${'a'.repeat(200)}`), `${path}?twinPilot=1#${'a'.repeat(200)}`);
  for (const anchor of ['a'.repeat(201), 'Upper', 'bad_anchor', 'bad%20anchor', 'bad%0Aanchor', '/account']) {
    assert.equal(visualReturnDestination(`${path}#${anchor}`), `${path}?twinPilot=1`);
  }
  const prefix = `${path}?discard=`;
  assert.equal(visualReturnDestination(prefix + 'a'.repeat(1000 - prefix.length)), `${path}?twinPilot=1`);
  assert.equal(visualReturnDestination(prefix + 'a'.repeat(1001 - prefix.length)), '/visual');
  for (const value of [null, 1, {}, '/known-issues/dodge-challenger', '/known-issues/chevrolet-camaro', '/known-issues/future-model',
    'https://au7o.invalid' + path, '//au7o.invalid' + path, '/\\\\evil.invalid' + path, '/\t/evil.invalid', path + '\u0000',
    '/known-issues/Lincoln-nautilus', '/known-issues/%6cincoln-nautilus']) {
    assert.equal(visualReturnDestination(value), '/visual');
  }
});

test('password recovery callback rejects browser-normalized external URLs', () => {
  for (const value of ['/\t/evil.invalid', '/\n/evil.invalid', '//evil.invalid', '/\\evil.invalid', 'https://evil.invalid', '/a/..//evil.invalid', '/a/%2e%2e//evil.invalid']) assert.equal(safeInternalCallback(value, '/account'), '/account');
  const callback = enrollmentContinuation('visual', null, origin);
  assert.equal(safeInternalCallback(callback, '/account'), callback);
});

function enrollmentFixture(existing = false, suppressed = false) {
  const rows: Array<Record<string, any>> = []; // In-memory test records only.
  let tail = Promise.resolve(); let createdUsers = 0; let locks = 0;
  const tx = {
    $queryRaw: async () => { locks++; return []; },
    accountEnrollment: {
      count: async ({ where }: any) => rows.filter(row => row.email === where.email && row.createdAt > where.createdAt.gt).length,
      findMany: async ({ where }: any) => rows.filter(row => row.email === where.email && row.createdAt > where.createdAt.gt).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime()),
      create: async ({ data }: any) => { const row = { usedAt: null, ...data, id: String(rows.length), createdAt: new Date() }; rows.push(row); return row; },
      findUnique: async ({ where }: any) => rows.find(row => row.tokenHash === where.tokenHash),
      update: async ({ where, data }: any) => { const row = rows.find(row => row.id === where.id); Object.assign(row!, data); return row; },
      updateMany: async ({ where, data }: any) => { const row = rows.find(row => row.id === where.id && !row.usedAt && row.expiresAt > where.expiresAt.gt); if (!row) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    },
    user: { findUnique: async () => existing ? { id: 'existing' } : null, create: async () => { createdUsers++; existing = true; return { id: 'created-user' }; } },
    emailSuppression: { findUnique: async () => suppressed ? { id: 'suppressed' } : null },
  };
  const db = { accountEnrollment: tx.accountEnrollment, $transaction: async (fn: (tx: any) => any) => { const previous = tail; let release!: () => void; tail = new Promise<void>(resolve => { release = resolve; }); await previous; try { return await fn(tx); } finally { release(); } } } as unknown as Parameters<typeof createStartEnrollmentHandler>[0]['database'];
  return { rows, db, users: () => createdUsers, locks: () => locks, setExisting: () => { existing = true; }, reserve: (hash = 'hash', returnTo = origin) => reserveEnrollment(db, { email: 'Member@example.com', product: 'visual', returnTo }, hash) };
}
test('all prepared Visual returns survive reservation, verification and selected enrollment', async () => {
  for (const definition of KNOWN_ISSUE_TWIN_VISUALS) {
    const f = enrollmentFixture();
    await f.reserve('hash', definition.returnPath);
    const redeemed = await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', true);
    assert.equal(redeemed.callbackUrl, SELECTED_CHECKOUT_PATH);
    assert.equal(f.rows[0].returnTo, definition.returnPath);
    const reader = { accountEnrollment: { findFirst: async () => f.rows[0] }, billingAttempt: { findUnique: async () => null } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
    const selected = await getSelectedEnrollment(reader, { id: 'created-user', email: 'member@example.com', createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null });
    assert.equal(selected?.returnTo, definition.returnPath);
    assert.equal(selected?.usConfirmed, true);
    assert.equal(new URL(enrollmentContinuation(selected!.product, selected!.vehicleId, selected!.returnTo), 'https://fixture.invalid').searchParams.get('returnTo'), definition.returnPath);
  }
});
test('concurrent resends share a server cooldown and cannot exceed three per hour', async () => {
  const f = enrollmentFixture();
  const results = await Promise.all([f.reserve(), f.reserve('second')]);
  assert.equal(results.filter(Boolean).length, 1); assert.equal(f.locks(), 2);
  assert.equal(f.rows[0].email, 'member@example.com'); assert.equal(f.rows[0].returnTo, origin);
  f.rows[0].createdAt = new Date(Date.now() - 61000); assert(await f.reserve('second'));
  f.rows[1].createdAt = new Date(Date.now() - 61000); assert(await f.reserve('third'));
  f.rows[2].createdAt = new Date(Date.now() - 61000); assert.equal(await f.reserve('fourth'), null);
  assert.equal(f.rows.length, 3); assert.equal(f.users(), 0);
});
test('existing and suppressed addresses record consumed attempts without usable tokens or user writes', async () => {
  for (const f of [enrollmentFixture(true), enrollmentFixture(false, true)]) {
    assert.equal(await f.reserve(), null); assert.equal(f.rows.length, 1); assert(f.rows[0].usedAt); assert.equal(f.users(), 0);
    await assert.rejects(redeemEnrollment(f.db, 'hash', 'synthetic'));
  }
});
test('verification transports Visual context across devices without granting paid access', async () => {
  const f = enrollmentFixture(); await f.reserve();
  const result = await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', true);
  assert.equal(result.email, 'member@example.com'); assert.equal(result.existing, false);
  assert.equal(result.callbackUrl, SELECTED_CHECKOUT_PATH);
  assert.equal(f.rows[0].returnTo, origin);
  assert.equal(f.rows[0].intent, confirmedEnrollmentIntent('created-user'));
  assert.equal(f.users(), 1); await assert.rejects(redeemEnrollment(f.db, 'hash', 'another-hash'));
});
test('an account created after the request is not silently signed in or overwritten', async () => {
  const f = enrollmentFixture(); await f.reserve(); f.setExisting();
  const result = await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', true);
  assert.equal(result.existing, true); assert.equal(result.email, undefined); assert.equal(f.users(), 0);
  assert.notEqual(result.callbackUrl, SELECTED_CHECKOUT_PATH);
  assert.notEqual(f.rows[0].intent, confirmedEnrollmentIntent('existing'));
});

test('US confirmation is required before token consumption or account creation for the stored paid intent', async () => {
  const f = enrollmentFixture(); await f.reserve();
  for (const confirmed of [false, undefined]) {
    const error = await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', confirmed).then(() => assert.fail('Confirmation must be required'), error => error);
    const response = enrollmentFailureResponse(error);
    assert.equal(response.status, 400); assert.equal((await response.json()).error, 'us_confirmation_required');
    assert.equal(f.rows[0].usedAt, null); assert.equal(f.users(), 0);
  }
  await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', true);
  assert.equal(f.users(), 1);
});

test('selected continuation survives token expiry and fresh browsers, never accepting a later recovery selection', async () => {
  const f = enrollmentFixture(); await f.reserve(); await redeemEnrollment(f.db, 'hash', 'synthetic-password-hash', true);
  f.rows[0].expiresAt = new Date(Date.now() - 1000);
  const account = { id: 'created-user', email: 'member@example.com', createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null };
  const reader = { accountEnrollment: { findFirst: async ({ where }: any) => f.rows.find(row => row.intent === where.intent && row.email === where.email) || null }, billingAttempt: { findUnique: async () => null } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
  const firstDevice = await getSelectedEnrollment(reader, account);
  const nextDevice = await getSelectedEnrollment(reader, account);
  assert.deepEqual(firstDevice, nextDevice); assert.equal(firstDevice?.product, 'visual'); assert.equal(firstDevice?.returnTo, origin); assert.equal(firstDevice?.usConfirmed, true);
  assert.equal(firstDevice?.resumeKey, f.rows[0].id);
  const otherUser = await getSelectedEnrollment(reader, { ...account, id: 'other-user' });
  assert.equal(otherUser?.usConfirmed, false);
});

test('pre-marker unpaid account retains its original source but must confirm before resuming', async () => {
  const f = enrollmentFixture(); await f.reserve();
  f.rows[0].intent = null; f.rows[0].usedAt = new Date();
  const account = { id: 'older-user', email: 'member@example.com', createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null };
  const reader = { accountEnrollment: { findFirst: async ({ where }: any) => f.rows.find(row => row.intent === where.intent && row.email === where.email && (!where.createdAt || row.createdAt <= where.createdAt.lte)) || null }, billingAttempt: { findUnique: async () => null } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
  const result = await getSelectedEnrollment(reader, account);
  assert.equal(result?.product, 'visual'); assert.equal(result?.returnTo, origin); assert.equal(result?.usConfirmed, false);
  assert.equal(safeInternalCallback(SELECTED_CHECKOUT_PATH, '/account'), SELECTED_CHECKOUT_PATH);
});

test('reservation-origin accounts retain their invitation flow even before an offer is ready', async () => {
  const account = { id: 'invite-user', email: 'invite@example.com', createdAt: new Date(), enrollmentProduct: 'hub', enrollmentVehicleId: null };
  const reader = { accountEnrollment: { findFirst: async ({ where }: any) => where.intent === 'reservation' ? { intent: 'reservation' } : null }, billingAttempt: { findUnique: async () => null } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
  assert.equal(await getSelectedEnrollment(reader, account), null);
});

test('a later owned Hub checkout resumes its product and vehicle without rewriting the original Visual enrollment', async () => {
  const account = { id: 'member', email: 'member@example.com', createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null };
  const original = { id: 'original', intent: confirmedEnrollmentIntent('member'), returnTo: origin };
  const attempt = { product: 'hub', vehicleId: 'owned-hub-car', state: 'open', returnTo: null };
  const reader = { accountEnrollment: { findFirst: async () => original }, billingAttempt: { findUnique: async () => attempt } } as unknown as Parameters<typeof getSelectedEnrollment>[0];
  const selected = await getSelectedEnrollment(reader, account);
  assert.equal(selected?.product, 'hub'); assert.equal(selected?.vehicleId, 'owned-hub-car');
  assert.equal(selected?.returnTo, origin); assert.equal(selected?.usConfirmed, true);
  assert.equal(account.enrollmentProduct, 'visual'); assert.equal(original.intent, confirmedEnrollmentIntent('member'));
});

test('actual subscribe and continuation routes resume a later Hub attempt without a redirect loop or picker', async () => {
  const { readFileSync } = await import('node:fs');
  const ts = await import('typescript');
  const account = { id: 'member', email: 'member@example.com', emailVerified: new Date(), createdAt: new Date(), enrollmentProduct: 'visual', enrollmentVehicleId: null, subscriptionId: null };
  const database = {
    user: { findUnique: async () => account },
    accountEnrollment: { findFirst: async () => ({ id: 'original', intent: confirmedEnrollmentIntent(account.id), returnTo: origin }) },
    billingAttempt: { findUnique: async () => ({ product: 'hub', vehicleId: 'owned-hub-car', state: 'open', returnTo: null }) },
    reservation: { findMany: async () => [] }, $queryRaw: async () => [],
  };
  const modules: Record<string, any> = {
    'react/jsx-runtime': { jsx: (type: unknown, props: unknown) => ({ type, props }), jsxs: (type: unknown, props: unknown) => ({ type, props }) },
    'next/headers': { headers: async () => new Headers({ 'x-vercel-ip-country': 'US' }) },
    'next/navigation': { redirect: (destination: string) => { throw Object.assign(new Error('redirect'), { destination }); } },
    'next/link': { default: () => null },
    '@/lib/auth': { auth: async () => ({ user: { id: account.id } }) },
    '@/lib/db': { prisma: database },
    '@/lib/pricing/region': { isAllowedSubscriptionRegion: () => true, enrollmentRegionMessage: () => null },
    '@/lib/product-entitlements': { publicEnrollmentEnabled: () => true, entitlementSelect: {}, productEntitlements: () => ({ visual: false }) },
    '@/lib/billing-enrollment-review': { getBillingEnrollmentReview: async () => null },
    '@/lib/selected-enrollment': { getSelectedEnrollment, hasCompletedEnrollmentHistory, needsEnrollmentCompletion, SELECTED_CHECKOUT_PATH },
    '@/lib/visual-return-destination': { visualReturnDestination, enrollmentContinuation },
    '@/lib/reservation-email-lock': { reservationEmailWhere: async () => ({ email: account.email }) },
    '@/lib/reservation-offer-summary': { reservationOfferEligible: () => false },
    '@/components/subscribe/SubscribeClient': { SubscribeClient: () => null },
    '@/components/subscribe/PaidSignupClient': { PaidSignupClient: () => null },
    '@/components/account/EnrollmentCompletion': { EnrollmentCompletion: () => null },
  };
  function loadRoute(file: string) {
    const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} as Record<string, any> };
    new Function('require', 'module', 'exports', output)((name: string) => { assert(name in modules, `Unexpected route dependency: ${name}`); return modules[name]; }, module, module.exports);
    return module.exports.default;
  }
  const subscribe = loadRoute('src/app/subscribe/page.tsx');
  const continuation = loadRoute('src/app/subscribe/continue/page.tsx');
  for (const enter of [() => continuation(), () => subscribe({ searchParams: Promise.resolve({ product: 'visual' }) }), () => subscribe({ searchParams: Promise.resolve({}) })]) {
    const redirect = await enter().then(() => assert.fail('Expected Hub continuation'), (error: any) => error.destination);
    assert.equal(redirect, '/subscribe?product=hub&vehicleId=owned-hub-car');
    const page = await subscribe({ searchParams: Promise.resolve(Object.fromEntries(new URL(redirect, 'https://fixture.invalid').searchParams)) });
    assert.equal(page.type, modules['@/components/subscribe/PaidSignupClient'].PaidSignupClient);
    assert.equal(page.props.selectedProduct, 'hub'); assert.equal(page.props.authenticated, true);
  }
});
test('database failures remain retryable; only invalid tokens ask for a new link', async () => {
  const transient = enrollmentFailureResponse(new Error('database unavailable'));
  assert.equal(transient.status, 503); assert.equal((await transient.json()).error, 'verification_temporarily_unavailable');
  const f = enrollmentFixture();
  try { await redeemEnrollment(f.db, 'missing', 'synthetic'); assert.fail('Must reject missing token'); }
  catch (error) { const response = enrollmentFailureResponse(error); assert.equal(response.status, 400); assert.equal((await response.json()).error, 'invalid_or_used_link'); }
});
test('only authoritative eligible access can return to the originating page', () => {
  const account = { emailVerified: new Date(), subscriptionId: 'sub_mock', subscriptionTier: 'visual', subscriptionStatus: 'active' };
  assert.equal(billingReturnState(account, 'visual', null, false, origin).destination, origin);
  assert.equal(billingReturnState({ ...account, subscriptionStatus: 'incomplete' }, 'visual', null, false, origin).destination, null);
  assert.deepEqual(billingReturnState(account, 'visual', null, true, origin), { ready: false, reviewRequired: true, destination: '/account' });
  assert.equal(billingReturnState(account, 'hub', null, false, origin).destination, null);
});

function trustedGeography(t: TestContext) {
  const original = process.env.VERCEL; process.env.VERCEL = '1';
  t.after(() => { if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original; });
}
const signupRequest = (email = 'Member@example.com', country: string | null = 'US', body?: string) => new Request('https://fixture.invalid/api/auth/signup', {
  method: 'POST', headers: { 'x-forwarded-for': '192.0.2.10', ...(country ? { 'x-vercel-ip-country': country } : {}) },
  body: body ?? JSON.stringify({ email, product: 'visual', returnTo: origin }),
});
function signupHandler(f = enrollmentFixture(), options: { ready?: boolean; send?: Parameters<typeof createStartEnrollmentHandler>[0]['send']; limit?: Parameters<typeof createStartEnrollmentHandler>[0]['rateLimit'] } = {}) {
  const messages: Array<Parameters<Parameters<typeof createStartEnrollmentHandler>[0]['send']>[0]> = [];
  const post = createStartEnrollmentHandler({ database: f.db, enabled: () => true, origin: () => 'https://fixture.invalid',
    deliveryReady: () => options.ready !== false, rateLimit: options.limit ?? (() => ({ success: true, reset: 3600 })),
    send: async args => { messages.push(args); return options.send ? options.send(args) : { ok: true, providerId: 'synthetic' }; },
  });
  return { post, messages };
}

test('new and existing signup have equivalent public responses and private safe next steps', async t => {
  trustedGeography(t); const bodies: unknown[] = [];
  for (const existing of [false, true]) {
    const f = enrollmentFixture(existing); const h = signupHandler(f); const response = await h.post(signupRequest());
    assert.equal(response.status, 200); bodies.push(await response.json()); assert.equal(h.messages.length, 1);
    assert.equal(h.messages[0].to, 'member@example.com'); assert.equal(f.users(), 0);
    if (existing) {
      assert.match(h.messages[0].text!, /already have an Au7o account/); assert.doesNotMatch(h.messages[0].text!, /auth\/verify|token=/);
      const signin = h.messages[0].text!.match(/https:\/\/fixture\.invalid\/auth\/signin\?[^\n]+/)![0];
      const continuation = new URL(signin).searchParams.get('callbackUrl')!;
      assert.equal(new URL(continuation, 'https://fixture.invalid').searchParams.get('returnTo'), origin);
      assert.match(h.messages[0].text!, /auth\/forgot-password/); assert(f.rows[0].usedAt);
    } else { assert.match(h.messages[0].text!, /auth\/verify\?token=[a-f0-9]{64}/); assert.equal(f.rows[0].usedAt, null); }
  }
  assert.deepEqual(bodies[0], bodies[1]); assert.doesNotMatch(JSON.stringify(bodies[0]), /email will arrive|email has been sent/);
});

test('suppressed requests have the same receipt and cooldown without any dispatch', async t => {
  trustedGeography(t); const reference = await signupHandler().post(signupRequest());
  for (const existing of [false,true]) {
    const f = enrollmentFixture(existing,true); const h = signupHandler(f); const response = await h.post(signupRequest());
    assert.equal(response.status, reference.status); assert.deepEqual(await response.json(), await reference.clone().json());
    assert.equal(h.messages.length, 0); assert(f.rows[0].usedAt); assert.equal(f.users(), 0);
    const second = await h.post(signupRequest(' MEMBER@example.com ')); assert.equal(second.status,429);
    assert.equal((await second.json()).retryScope, 'email');
  }
});

test('concurrent requests and hourly deadlines apply equally to verification, recovery and suppression', async t => {
  trustedGeography(t);
  for (const f of [enrollmentFixture(),enrollmentFixture(true),enrollmentFixture(false,true),enrollmentFixture(true,true)]) {
    const reserve = (token: string) => reserveEnrollmentRequest(f.db,{email:' MEMBER@example.com ', product:'hub'},token);
    const results = await Promise.all([reserve('one'),reserve('two'),reserve('three')]);
    assert.equal(results.filter(r=>r.kind !== 'limited').length,1); assert.equal(f.rows.length,1);
    f.rows[0].createdAt = new Date(Date.now()-120000); assert.notEqual((await reserve('four')).kind,'limited');
    f.rows[1].createdAt = new Date(Date.now()-61000); const third = await reserve('five');
    assert.notEqual(third.kind,'limited'); assert(third.retryAfter >= 3479 && third.retryAfter <=3480);
    const fourth = await reserve('six'); assert.equal(fourth.kind,'limited'); assert(fourth.retryAfter >=3479 && fourth.retryAfter<=3480);
    assert.equal(f.rows.length,3);
  }
});

test('operational failures are honest, account-independent and never leak provider details', async t => {
  trustedGeography(t);
  for (const outcome of ['not_sent','unknown'] as const) {
    const bodies: unknown[]=[];
    for (const existing of [false,true]) {
      const f = enrollmentFixture(existing); const h = signupHandler(f,{send:async()=>({ok:false,outcome,error:'private provider key/details'})});
      const response = await h.post(signupRequest()); assert.equal(response.status,503); const body=await response.json(); bodies.push(body);
      assert.equal(body.ok,undefined); assert.equal(body.retryAfter,60); assert.doesNotMatch(JSON.stringify(body),/private provider/);
      assert.equal(Boolean(f.rows[0].usedAt), existing || outcome==='not_sent');
    }
    assert.deepEqual(bodies[0],bodies[1]);
  }
  for (const f of [enrollmentFixture(),enrollmentFixture(true),enrollmentFixture(false,true)]) {
    const h=signupHandler(f,{ready:false}); const response=await h.post(signupRequest()); assert.equal(response.status,503); assert.equal(f.rows.length,0); assert.equal(h.messages.length,0);
  }
  const failing = enrollmentFixture(); failing.db.$transaction = (async()=>{throw new Error('private DB details');}) as typeof failing.db.$transaction;
  const h=signupHandler(failing); const response=await h.post(signupRequest()); assert.equal(response.status,503); assert.equal(h.messages.length,0); assert.doesNotMatch(await response.text(),/private DB/);
});

test('IP limit returns its actual retry deadline across changed addresses and concurrency', async t => {
  trustedGeography(t); const limiter=new RateLimiter(3600000,5); const h=signupHandler(enrollmentFixture(),{limit:ip=>limiter.check(ip)});
  const responses=await Promise.all(Array.from({length:6},(_,i)=>h.post(signupRequest(`member${i}@example.com`))));
  assert.equal(responses.filter(r=>r.status===200).length,5); const rejected=responses.find(r=>r.status===429)!;
  const body=await rejected.json(); assert.equal(body.retryScope,'ip'); assert(body.retryAfter>=3599 && body.retryAfter<=3600);
  assert.equal(rejected.headers.get('Retry-After'),String(body.retryAfter)); assert.equal(h.messages.length,5);
  const partial=signupHandler(enrollmentFixture(),{limit:()=>({success:false,reset:137})});
  assert.equal((await (await partial.post(signupRequest())).json()).retryAfter,137);
});

test('malformed and denied geography requests never claim dispatch or touch persistence',async t=>{
  trustedGeography(t); const f=enrollmentFixture(); const h=signupHandler(f);
  for(const body of ['{','null',JSON.stringify({email:'invalid',product:'visual'})]) assert.equal((await h.post(signupRequest('unused','US',body))).status,400);
  for(const country of [null,'us','USA','XX','ZZ','DE']) {
    const response=await h.post(signupRequest('member@example.com',country)); assert.equal(response.status,403); const body=await response.json();
    assert.equal(body.error,country==='DE'?'region_unavailable':'region_unknown'); assert.match(body.message,country==='DE'?/only in the United States/:/could not confirm/);
  }
  process.env.VERCEL='0'; assert.equal(subscriptionRegionStatus('US'),'unknown'); assert.match(enrollmentRegionMessage('US')!,/could not confirm/);
  assert.equal((await h.post(signupRequest())).status,403); assert.equal(f.rows.length,0); assert.equal(h.messages.length,0);
});

test('mock email sender classifies missing-config and preview denials without initializing provider',async()=>{
  const missing=createEmailSender({client:()=>null,isSuppressed:async()=>false,recipientAllowed:()=>true});
  const originalWarn=console.warn; console.warn=()=>{};
  try {assert.equal((await missing({to:'synthetic@example.com',subject:'Synthetic',html:'Synthetic'})).outcome,'not_sent');}
  finally {console.warn=originalWarn;}
  const denied=createEmailSender({client:()=>{throw new Error('Must not initialize provider');},isSuppressed:async()=>false,recipientAllowed:()=>false});
  assert.equal((await denied({to:'synthetic@example.com',subject:'Synthetic',html:'Synthetic'})).outcome,'not_sent');
});

test('SDK-shaped transport failures and missing acceptance IDs keep links usable; explicit rejections invalidate',async()=>{
  const originalError=console.error; console.error=()=>{};
  try {
    for(const statusCode of [null,500,503,408,409,400,401,403,422,429]) {
      const sender=createEmailSender({recipientAllowed:()=>true,isSuppressed:async()=>false,
        client:()=>({emails:{send:async()=>({data:null,error:{name:'application_error',statusCode,message:'synthetic failure'}})}} as never),
      });
      const result=await sender({to:'synthetic@example.com',subject:'Synthetic',html:'Synthetic'});
      assert.equal(result.ok,false); assert.equal(result.outcome,[400,401,403,422,429].includes(statusCode as number)?'not_sent':'unknown');
    }
    for(const response of [{data:null,error:null},{data:{},error:null}]) {
      const sender=createEmailSender({recipientAllowed:()=>true,isSuppressed:async()=>false,client:()=>({emails:{send:async()=>response}} as never)});
      const result=await sender({to:'synthetic@example.com',subject:'Synthetic',html:'Synthetic'}); assert.equal(result.ok,false); assert.equal(result.outcome,'unknown');
    }
    const throwing=createEmailSender({recipientAllowed:()=>true,isSuppressed:async()=>false,client:()=>({emails:{send:async()=>{throw new Error('synthetic transport interruption');}}} as never)});
    assert.equal((await throwing({to:'synthetic@example.com',subject:'Synthetic',html:'Synthetic'})).outcome,'unknown');
  } finally {console.error=originalError;}
});

test('recovery preserves Hub vehicle and reservation continuation without creating tokens or accounts',async t=>{
  trustedGeography(t);
  for(const input of [{product:'hub',vehicleId:'v1'}, {product:'hub',intent:'reservation',reservationId:'offer_1'}]) {
    const f=enrollmentFixture(true); const h=signupHandler(f);
    const response=await h.post(signupRequest('member@example.com','US',JSON.stringify({email:'Member@example.com',...input,returnTo:'https://evil.invalid'})));
    assert.equal(response.status,200);
    const signin=h.messages[0].text!.match(/https:\/\/fixture\.invalid\/auth\/signin\?[^\n]+/)![0];
    assert.equal(new URL(signin).searchParams.get('callbackUrl'),'intent' in input?'/twin/claim?reservationId=offer_1':'/subscribe?product=hub&vehicleId=v1');
    assert.equal(f.users(),0); assert(f.rows[0].usedAt);
  }
});

test('provider waiting time is deducted from the actual email retry window',async t=>{
  trustedGeography(t); const started=Date.now();
  const h=signupHandler(enrollmentFixture(),{send:async()=>{t.mock.method(Date,'now',()=>started+12000);return {ok:true,providerId:'synthetic'};}});
  const response=await h.post(signupRequest()); assert.equal(response.status,200);
  const body=await response.json(); assert(body.retryAfter>=48 && body.retryAfter<=49);
});
