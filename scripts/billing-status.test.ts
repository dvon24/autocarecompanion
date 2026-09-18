import assert from 'node:assert/strict';
import test from 'node:test';
import { createBillingStatusHandler } from '../src/lib/billing-status-handler';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
function fixture() {
  const vehicle = { ...VEHICLE_TWIN_CATALOG.find(row => row.ownerReady)!.identity, id: 'upgrade-car', userId: 'member', currentMileage: 42000, transmission: 'automatic' };
  const state = { upgradeVehicleId: 'upgrade-car', upgradeSubscriptionId: 'sub_current', upgradeUserId: 'member', checkoutVehicleId: 'checkout-car', missingVehicle: false, lookups: [] as string[] };
  const deps = { auth: async () => ({ user: { id: 'member' } }), prisma: {
    user: { findUnique: async () => ({ emailVerified: new Date(), subscriptionId: 'sub_current', subscriptionStatus: 'active', subscriptionTier: 'hub' }) },
    $queryRaw: async (_: TemplateStringsArray, userId: string, subId: string) => userId === state.upgradeUserId && subId === state.upgradeSubscriptionId ? [{ vehicleId: state.upgradeVehicleId }] : [],
    billingAttempt: { findUnique: async () => ({ vehicleId: state.checkoutVehicleId }) },
    vehicle: { findFirst: async ({ where }: { where: { id: string; userId: string } }) => { state.lookups.push(where.id); return !state.missingVehicle && ['upgrade-car', 'checkout-car'].includes(where.id) && where.userId === vehicle.userId ? { ...vehicle, id: where.id } : null; } },
  } } as unknown as Parameters<typeof createBillingStatusHandler>[0];
  return { state, send: async (suffix = '') => (await createBillingStatusHandler(deps)(new Request('https://au7o.io/api/billing/status?product=hub' + suffix))).json() };
}
test('parameter-free return selects the exact current subscription upgrade car before original Checkout', async () => {
  const f = fixture(); assert.match((await f.send()).destination, /vehicleId=upgrade-car$/); assert.deepEqual(f.state.lookups, ['upgrade-car']);
});
test('explicit invalid, empty or deleted upgrade target returns Account without substituting another car', async () => {
  for (const suffix of ['&vehicleId=foreign', '&vehicleId=']) { const f = fixture(); assert.equal((await f.send(suffix)).destination, '/account'); assert(!f.state.lookups.includes('checkout-car')); }
  const f = fixture(); f.state.missingVehicle = true; assert.equal((await f.send()).destination, '/account'); assert.deepEqual(f.state.lookups, ['upgrade-car']);
});
test('another subscription or owner upgrade cannot replace the original Checkout fallback', async () => {
  for (const key of ['upgradeSubscriptionId', 'upgradeUserId'] as const) { const f = fixture(); f.state[key] = 'foreign'; assert.match((await f.send()).destination, /vehicleId=checkout-car$/); }
});

test('selected Visual payment returns wait for server entitlement and retain the stored filtered page', async () => {
  const origin = '/known-issues/cadillac-xt6?year=2020&trim=Premium+Luxury&twinPilot=1#battery';
  const account = { email: 'member@example.com', emailVerified: new Date(), subscriptionId: 'sub_visual', subscriptionStatus: 'incomplete', subscriptionTier: 'visual' };
  let reviewRequired = false;
  const deps = { auth: async () => ({ user: { id: 'member' } }), prisma: {
    user: { findUnique: async () => account },
    $queryRaw: async () => reviewRequired ? [{ state: 'review_required', initialVerified: false }] : [],
    billingAttempt: { findUnique: async () => ({ product: 'visual', returnTo: origin }) },
    vehicle: { findFirst: async () => { throw Error('Visual never needs a Hub vehicle'); } },
  } } as unknown as Parameters<typeof createBillingStatusHandler>[0];
  const handler = createBillingStatusHandler(deps);
  const send = async () => (await handler(new Request('https://au7o.io/api/billing/status?product=visual&session_id=cs_forged&returnTo=https://evil.invalid'))).json();
  for (const status of ['incomplete', 'incomplete_expired', 'unpaid', 'past_due', 'trialing', 'canceled']) {
    account.subscriptionStatus = status; const result = await send(); assert.equal(result.ready, false); assert.equal(result.destination, null);
  }
  account.subscriptionStatus = 'active'; assert.deepEqual(await send(), { ready: true, destination: origin });
  reviewRequired = true; assert.deepEqual(await send(), { ready: false, reviewRequired: true, destination: '/account' });
});

test('signed-out payment return cannot disclose or confirm the selected account', async () => {
  const handler = createBillingStatusHandler({ auth: async () => null, prisma: {} as never });
  const response = await handler(new Request('https://au7o.io/api/billing/status?product=visual'));
  assert.equal(response.status, 401); assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});
