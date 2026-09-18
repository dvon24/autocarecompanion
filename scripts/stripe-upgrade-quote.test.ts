import assert from 'node:assert/strict';
import test from 'node:test';
import { upgradeFixture } from './helpers/upgrade-fixture';
import { readUpgradeQuote, RETRY_SECONDS, signUpgradeQuote } from '../src/lib/stripe-upgrade-quote';
const review = async (f: ReturnType<typeof upgradeFixture>) => { const response = await f.send(); assert.equal(response.status, 200); return (await response.json()).quote; };
test('review uses full Stripe USD due-now invoice separately from renewal; zero writes', async () => {
  const f = upgradeFixture(); const q = await review(f);
  assert.equal(q.amountDue, 737); assert.equal(q.monthlyAmount, 1499); assert.equal(q.renewalAt, f.sub.items.data[0].current_period_end);
  assert.equal(f.updates.length, 0); assert.equal(f.attempt(), undefined); assert.equal(f.state.writes + f.state.checkoutWrites, 0);
  assert.equal((f.previews[0].subscription_details as { proration_behavior: string }).proration_behavior, 'always_invoice');
});
test('explicit confirmation commits before provider call, re-previews and preserves fixed date/subscription', async () => {
  const f = upgradeFixture(); const q = await review(f); assert.equal((await f.confirm(q.token)).status, 200);
  assert.equal(f.updates.length, 1); assert(f.updates[0].committed); assert.equal(f.updates[0].id, 'sub_1');
  assert.equal(f.updates[0].params.payment_behavior, 'pending_if_incomplete');
  for (const preview of f.previews) assert.equal((preview.subscription_details as { proration_date: number }).proration_date, f.updates[0].params.proration_date);
  assert.equal(f.state.writes + f.state.checkoutWrites, 0);
});
test('missing consent, missing quote, tampering, expiry and changed binding cannot dispatch', async () => {
  for (const mode of ['consent', 'missing', 'tamper', 'expired', 'owner', 'vehicle', 'price', 'amount', 'period']) {
    const f = upgradeFixture(); const q = await review(f); let token = q.token;
    if (mode === 'tamper') token = token.slice(0, -5) + 'xxxxx';
    if (mode === 'missing') token = '';
    if (['expired', 'owner', 'vehicle', 'price', 'amount'].includes(mode)) {
      const payload = readUpgradeQuote(token, Math.floor(Date.now() / 1000));
      if (mode === 'expired') { payload.prorationDate -= 301; payload.expiresAt -= 301; }
      if (mode === 'owner') payload.userId = 'foreign'; if (mode === 'vehicle') payload.vehicleId = 'foreign'; if (mode === 'price') payload.priceId = 'foreign'; if (mode === 'amount') payload.amountDue++;
      token = signUpgradeQuote(payload);
    }
    if (mode === 'period') f.sub.items.data[0].current_period_end++;
    const response = await f.confirm(token, mode === 'consent' ? { confirmProration: false } : {});
    assert(response.status >= 400, mode); assert.equal(f.updates.length, 0, mode); assert.equal(f.attempt(), undefined, mode);
  }
});
test('changed invoice and vehicle mileage require a fresh review', async () => {
  for (const mode of ['invoice', 'mileage', 'transmission']) { const f = upgradeFixture(); const q = await review(f); if (mode === 'invoice') f.state.due++; else if (mode === 'mileage') f.vehicle.currentMileage++; else f.vehicle.transmission = 'manual'; assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.updates.length, 0); }
});
test('committing the confirmed operation fails before any provider update', async () => { const f = upgradeFixture(); const q = await review(f); f.state.commitFails = true; assert.equal((await f.confirm(q.token)).status, 503); assert.equal(f.updates.length, 0); assert.equal(f.attempt(), undefined); });
test('ambiguous timeout and page reload recover immutable token/key/parameters', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.timeout = true;
  assert.equal((await f.confirm(q.token)).status, 503); assert(f.attempt());
  const again = await review(f); assert.equal(again.token, q.token); assert(again.recovering); assert.equal(f.updates.length, 1);
  assert.equal((await f.confirm(again.token)).status, 200); assert.equal(f.updates.length, 2);
  assert.deepEqual(f.updates[0], f.updates[1]);
});
test('lost successful response and simultaneous confirmations perform one effective upgrade', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.timeoutAfterApply = true;
  const responses = await Promise.all([f.confirm(q.token), f.confirm(q.token)]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 503]); assert.equal(f.updates.length, 1); assert.equal(f.state.writes, 0);
});
test('ambiguous operation with a changed invoice cannot dispatch an unseen amount', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.timeout = true; await f.confirm(q.token);
  f.state.due++; assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.updates.length, 1); assert.equal(f.attempt()!.token, q.token);
});
test('pending payment recovers invoice without another charge or granting Hub', async () => {
  const f = upgradeFixture(); f.state.pending = true; const q = await review(f);
  const first = await (await f.confirm(q.token)).json(); assert(first.paymentRequired); assert.equal(first.paymentUrl, 'https://invoice.stripe.com/i/mock');
  assert.equal((await (await f.send()).json()).paymentRequired, true); assert.equal(f.updates.length, 1); assert.equal(f.account.subscriptionTier, 'visual');
});
test('zero, credits and tax-inclusive due use complete invoice totals', async () => {
  for (const [due, total] of [[0, 0], [0, -213], [849, 800]]) { const f = upgradeFixture(); f.state.due = due; f.state.total = total; const q = await review(f); assert.equal(q.amountDue, due); assert.equal(q.invoiceTotal, total); assert.equal((await f.confirm(q.token)).status, 200); }
});
test('foreign/missing provider billing, currency, wrong plan, quantity, extra subscription and unavailable preview deny updates', async () => {
  for (const mode of ['country', 'payment', 'missing', 'currency', 'invoiceCurrency', 'quantity', 'plan', 'duplicate', 'provider']) {
    const f = upgradeFixture(); if (mode === 'country') f.state.country = 'DE'; if (mode === 'payment') f.state.paymentCountry = 'DE'; if (mode === 'missing') f.state.country = ''; if (mode === 'currency') f.sub.currency = 'eur'; if (mode === 'invoiceCurrency') f.state.invoiceCurrency = 'eur'; if (mode === 'quantity') f.sub.items.data[0].quantity = 2; if (mode === 'plan') f.sub.items.data[0].price.id = 'price_unknown'; if (mode === 'duplicate') f.state.duplicate = true; if (mode === 'provider') f.state.previewFails = true;
    assert((await f.send()).status >= 400, mode); assert.equal(f.updates.length, 0); assert.equal(f.attempt(), undefined);
  }
});
test('missing signing secret fails closed', async () => { const f = upgradeFixture(); const original = process.env.AUTH_SECRET; delete process.env.AUTH_SECRET; delete process.env.NEXTAUTH_SECRET; assert.equal((await f.send()).status, 503); assert.equal(f.updates.length, 0); if (original) process.env.AUTH_SECRET = original; });
test('old ambiguous operation cannot outlive idempotency retention or accept a new quote', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.timeout = true; await f.confirm(q.token);
  assert.equal((await f.confirm(q.token + 'changed')).status, 409); f.attempt()!.dispatchStartedAt = new Date(Date.now() - 24 * 3600000);
  assert.equal((await f.send()).status, 409); assert.equal(f.updates.length, 1);
});
test('post-confirm preview changes retire only never-dispatched operations and reject replay even if totals revert', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.changeOnPreview = 3;
  assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.updates.length, 0); assert.equal(f.attempt(), undefined);
  f.state.changeOnPreview = 0; f.state.due--; assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.attempt(), undefined);
  const next = await review(f); assert.notEqual(next.token, q.token); assert.equal((await f.confirm(next.token)).status, 200);
});
test('expiry during post-confirm preview commits invalidation before allowing fresh review', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.expireOnPreview = 3;
  assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.updates.length, 0); assert.equal(f.attempt(), undefined);
  f.state.expireOnPreview = 0; assert.notEqual((await review(f)).token, q.token);
});
test('dispatch intent must commit before Stripe; result rollback preserves the durable marker', async () => {
  const before = upgradeFixture(); const q = await review(before); before.state.markerCommitFails = true;
  assert.equal((await before.confirm(q.token)).status, 503); assert.equal(before.updates.length, 0); assert.equal(before.attempt()!.dispatchStartedAt, null);
  const after = upgradeFixture(); const confirmed = await review(after); after.state.resultCommitFails = true;
  assert.equal((await after.confirm(confirmed.token)).status, 503); assert(after.attempt()!.dispatchStartedAt); assert.equal(after.attempt()!.invoiceId, null);
  assert(after.updates[0].dispatchCommitted); after.state.resultCommitFails = false;
  assert.equal((await after.confirm(confirmed.token)).status, 200); assert.equal(after.updates.length, 1);
});
test('exact void unpaid upgrade can retire before period/retention limits; a fresh confirmed operation uses a new key', async () => {
  const f = upgradeFixture(); f.state.pending = true; const q = await review(f); await f.confirm(q.token);
  assert.equal(f.attempt()!.invoiceId, 'in_upgrade'); assert.equal(f.attempt()!.vehicleId, 'v1');
  f.sub.pending_update = null; f.state.invoiceStatus = 'void'; f.state.invoicePaid = 0;
  f.state.now = f.sub.items.data[0].current_period_end + 1; f.sub.items.data[0].current_period_start = f.state.now; f.sub.items.data[0].current_period_end = f.state.now + 100000;
  assert.equal((await f.send()).status, 409); assert.equal(f.attempt(), undefined); assert.equal(f.updates.length, 1);
  const next = await review(f); assert.equal((await f.confirm(next.token)).status, 200); assert.notEqual(f.updates[1].key, f.updates[0].key);
});
test('a still-valid retired void quote cannot resurrect its cached invoice', async () => {
  const f = upgradeFixture(); f.state.pending = true; const q = await review(f); await f.confirm(q.token);
  f.sub.pending_update = null; f.state.invoiceStatus = 'void'; f.state.invoicePaid = 0;
  assert.equal((await f.send()).status, 409); assert.equal(f.attempt(), undefined);
  assert.equal((await f.confirm(q.token)).status, 409); assert.equal(f.updates.length, 1); assert.equal(f.attempt(), undefined);
  assert.notEqual((await review(f)).token, q.token);
});
test('open, paid, foreign, missing and unknown invoices cannot replace an operation', async () => {
  for (const mode of ['open', 'paid', 'foreignCustomer', 'foreignSubscription', 'unavailable', 'unknown', 'voidButPaid']) {
    const f = upgradeFixture(); f.state.pending = true; const q = await review(f); await f.confirm(q.token); f.sub.pending_update = null;
    if (mode === 'paid') { f.state.invoiceStatus = 'paid'; f.state.invoicePaid = 737; }
    if (mode === 'foreignCustomer') f.state.invoiceCustomer = 'foreign'; if (mode === 'foreignSubscription') f.state.invoiceSubscription = 'foreign';
    if (mode === 'unavailable') f.state.invoiceUnavailable = true; if (mode === 'unknown') f.state.invoiceStatus = 'uncollectible';
    if (mode === 'voidButPaid') { f.state.invoiceStatus = 'void'; f.state.invoicePaid = 1; }
    assert((await f.send()).status >= 400, mode); assert(f.attempt(), mode); assert.equal(f.updates.length, 1, mode);
  }
});
test('paused collection and unrelated pending updates cannot offer an upgrade payment', async () => {
  const paused = upgradeFixture(); paused.sub.pause_collection = { behavior: 'keep_as_draft' }; assert.equal((await paused.send()).status, 409); assert.equal(paused.updates.length, 0);
  const unknown = upgradeFixture(); unknown.sub.pending_update = { subscription_items: [] }; assert.equal((await unknown.send()).status, 409);
  for (const mode of ['price', 'quantity', 'item', 'invoice']) {
    const f = upgradeFixture(); f.state.pending = true; const q = await review(f); await f.confirm(q.token);
    if (mode === 'invoice') f.sub.latest_invoice = 'foreign_invoice';
    else f.sub.pending_update = { subscription_items: [{ id: mode === 'item' ? 'foreign' : 'si_1', quantity: mode === 'quantity' ? 2 : 1, price: { id: mode === 'price' ? 'foreign' : 'price_hub' } }] };
    const response = await f.send(); assert.equal(response.status, 409, mode); assert.equal((await response.json()).paymentRequired, undefined); assert.equal(f.updates.length, 1);
  }
});
test('lost pending response recovers the bound invoice without another update', async () => {
  const f = upgradeFixture(); f.state.pending = true; f.state.timeoutAfterApply = true; const q = await review(f);
  assert.equal((await f.confirm(q.token)).status, 503); assert(f.attempt()!.dispatchStartedAt); assert.equal(f.attempt()!.invoiceId, null);
  const result = await (await f.send()).json(); assert(result.paymentRequired); assert.equal(result.vehicleId, 'v1'); assert.equal(f.attempt()!.invoiceId, 'in_upgrade'); assert.equal(f.updates.length, 1);
});
test('noncanonical base64url signature aliases cannot bypass retired quote identity', async () => {
  const f = upgradeFixture(); f.state.pending = true; const q = await review(f); await f.confirm(q.token);
  f.sub.pending_update = null; f.state.invoiceStatus = 'void'; f.state.invoicePaid = 0; await f.send();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const token = q.token.slice(0, -1) + alphabet[alphabet.indexOf(q.token.at(-1)) | 1];
  assert.notEqual(token, q.token); assert.deepEqual(Buffer.from(token.split('.')[1], 'base64url'), Buffer.from(q.token.split('.')[1], 'base64url'));
  assert.throws(() => readUpgradeQuote(token, f.state.now)); assert.equal((await f.confirm(token)).status, 409); assert.equal(f.attempt(), undefined); assert.equal(f.updates.length, 1);
});
test('renewal and idempotency retention are rechecked after the final asynchronous retry preview', async () => {
  for (const boundary of ['renewal', 'retention']) {
    const f = upgradeFixture(); if (boundary === 'renewal') f.sub.items.data[0].current_period_end = f.state.now + 6000;
    const q = await review(f); f.state.timeout = true; assert.equal((await f.confirm(q.token)).status, 503);
    const limit = boundary === 'renewal' ? f.sub.items.data[0].current_period_end : Math.floor(f.attempt()!.dispatchStartedAt!.getTime() / 1000) + RETRY_SECONDS;
    f.state.now = limit - 1; f.state.advanceOnPreview = f.previews.length + 3; f.state.advanceTo = limit;
    const response = await f.confirm(q.token); assert.equal(response.status, 409, boundary);
    assert.equal((await response.json()).error, 'upgrade_operation_needs_review'); assert.equal(f.updates.length, 1); assert(f.attempt()!.dispatchStartedAt);
  }
});
test('lost successful response recovers the bound original car despite a changed requested selection', async () => {
  const f = upgradeFixture(); const q = await review(f); f.state.timeoutAfterApply = true;
  assert.equal((await f.confirm(q.token)).status, 503); assert.equal(f.attempt()!.invoiceId, null);
  const response = await f.send({ vehicleId: 'another-car' }); assert.equal(response.status, 200);
  const recovered = await response.json(); assert.equal(recovered.vehicleId, 'v1'); assert(recovered.confirmationPending);
  assert.equal(f.attempt()!.invoiceId, 'in_upgrade'); assert.equal(f.updates.length, 1); assert.equal(f.state.writes, 0);
});
test('active Hub recovery validates saved attempt identity and exact paid invoice before returning its car', async () => {
  for (const mode of ['vehicle', 'owner', 'invoiceCustomer', 'invoiceSubscription', 'unpaid']) {
    const f = upgradeFixture(); const q = await review(f); await f.confirm(q.token);
    if (mode === 'vehicle') f.attempt()!.vehicleId = 'another-car'; if (mode === 'owner') f.attempt()!.userId = 'foreign';
    if (mode === 'invoiceCustomer') f.state.invoiceCustomer = 'foreign'; if (mode === 'invoiceSubscription') f.state.invoiceSubscription = 'foreign';
    if (mode === 'unpaid') f.state.invoiceStatus = 'open';
    const response = await f.send(); assert.equal(response.status, 409, mode); assert.equal((await response.json()).vehicleId, undefined); assert.equal(f.updates.length, 1);
  }
});
test('eligibility, authentication and unavailable-pricing errors give their actual next action', async () => {
  for (const [mode, expected] of [['anonymous', /sign in/i], ['unverified', /verify your email/i], ['foreign', /saved billing address and card/i], ['multiple', /subscription.*billing review/i], ['closed', /not currently available/i], ['config', /pricing is temporarily unavailable/i]] as const) {
    const f = upgradeFixture(); if (mode === 'anonymous') f.account.id = ''; if (mode === 'unverified') f.account.emailVerified = null;
    if (mode === 'foreign') f.state.country = 'DE'; if (mode === 'multiple') f.state.duplicate = true;
    if (mode === 'closed') process.env.ACCOUNT_ENROLLMENT_ENABLED = 'false'; if (mode === 'config') f.state.priceConfigured = false;
    const response = await f.send(); assert(response.status >= 400, mode); const data = await response.json(); assert.match(data.message, expected, mode); assert.doesNotMatch(data.message, /review the current price/i); assert.equal(f.updates.length, 0);
  }
  const f = upgradeFixture(); const q = await review(f); f.state.now += 301; assert.match((await (await f.confirm(q.token)).json()).message, /quote expired.*review the current price/i);
});

test('proven completed historical Hub payment can retire after real later Visual period; old quote cannot replay', async () => {
  const f = upgradeFixture(); const old = await review(f); await f.confirm(old.token);
  const historical = readUpgradeQuote(old.token,f.state.now);
  f.state.now = historical.renewalAt + 1;
  f.sub.items.data[0].current_period_start = historical.renewalAt;
  f.sub.items.data[0].current_period_end = historical.renewalAt + 2592000;
  f.sub.items.data[0].price.id = 'price_visual'; f.sub.items.data[0].price.unit_amount = 499;
  assert.equal((await f.send()).status,409); assert.equal(f.attempt(),undefined);
  assert.equal((await f.confirm(old.token)).status,409);
  const current = await review(f); assert.notEqual(current.token,old.token);
  assert.equal((await f.confirm(current.token)).status,200); assert.equal(f.updates.length,2); assert.notEqual(f.updates[0].key,f.updates[1].key);
});

test('owned Visual schedule releases only after upgrade dispatch and rechecks renewal/retention after release', async () => {
  for (const boundary of ['none','renewal','retention']) {
    const f=upgradeFixture();f.attachVisualSchedule();const q=await review(f);
    if(boundary==='renewal')f.releaseState.advanceTo=f.sub.items.data[0].current_period_end;
    if(boundary==='retention')f.releaseState.advanceTo=f.state.now+RETRY_SECONDS;
    const response=await f.confirm(q.token);assert.equal(f.releaseState.calls,1,boundary);
    assert.equal(response.status,boundary==='none'?200:409,boundary);assert.equal(f.updates.length,boundary==='none'?1:0,boundary);
    if(boundary!=='none') { assert.equal((await response.json()).error,'upgrade_operation_needs_review');assert.equal(f.account.subscriptionTier,'visual'); }
  }
});
