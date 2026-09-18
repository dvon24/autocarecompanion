import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { createReservationHandler } from '../src/lib/reservation-handler';

// Synthetic trusted-edge environment; no external requests or database access.
process.env.VERCEL = '1';

const body = { email: 'owner@example.invalid', vehicle: 'Custom vehicle A', country: 'United States', source: 'hub-owner' };
function fixture(existing: object | null, email: string | null = body.email) {
  const calls = { reads: 0, writes: 0 };
  const handler = createReservationHandler({
    auth: async () => email ? { user: { id: 'synthetic-owner', email } } : null,
    rateLimit: () => null,
    prisma: { $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ $queryRaw: async () => existing ? [{id:'synthetic-reservation'}] : [], reservation: {
      findMany: async () => { calls.reads++; return existing ? [existing] : []; },
      create: async () => { calls.writes++; return {}; },
    } }) } as unknown as Parameters<typeof createReservationHandler>[0]['prisma'],
  });
  return { calls, send: (value = body) => handler(new NextRequest('https://review.invalid/api/reservation', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-vercel-ip-country': 'US' }, body: JSON.stringify(value),
  })) };
}
test('owner request requires matching authenticated email before reading reservations', async () => {
  for (const email of [null, 'different@example.invalid']) {
    const f = fixture(null, email);
    assert.equal((await f.send()).status, 401);
    assert.deepEqual(f.calls, { reads: 0, writes: 0 });
  }
});
test('first owner request can save, and same vehicle resubmission remains idempotent', async () => {
  for (const existing of [null, { id: 'synthetic-reservation', updatedAt: new Date(), vehicle: body.vehicle, vehicleVerified: false, transmission: null, twinStatus: 'claimed' }]) {
    const f = fixture(existing);
    assert.equal((await f.send()).status, 200);
    assert.equal(f.calls.writes, existing ? 0 : 1);
  }
});
test('another vehicle creates an independent request without changing the existing reservation', async () => {
  const f = fixture({ id: 'synthetic-reservation', updatedAt: new Date(), vehicle: 'Different vehicle B', vehicleVerified: false, transmission: null, twinStatus: 'claimed' });
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(f.calls.writes, 1);
});
