/* Offline fixtures: actual route/loader code, mocked auth and database only. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');

async function load() {
  const built = await esbuild.build({ stdin: { resolveDir: root, contents: `
    export {POST} from './src/app/api/billing/vehicle/route';
    export {getTwinHubData} from './src/lib/twin-hub-data';
    export {hasValidReviewedTransmissionState,resolveReviewedTransmissionBranch} from './src/lib/transmission-options';
    export {REVIEWED_OWNER_EQUIPMENT} from './src/lib/twin-owner-equipment';
    export {savedVehicleHubHref,selectOwnedHubVehicle} from './src/lib/hub-vehicle-selection';
  ` }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', plugins: [{ name: 'offline', setup(b) {
    b.onResolve({ filter: /^(@\/lib\/(db|auth|hub-data)|\.\/reservation-email-lock)$/ }, a => ({ path: a.path, namespace: 'fixture' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ contents: a.path.endsWith('/db') ? 'export const prisma=globalThis.__paidNavigation.db;export default prisma;' : a.path.endsWith('/auth') ? 'export async function auth(){return globalThis.__paidNavigation.session}' : a.path.endsWith('/hub-data') ? 'export async function getRecentThreads(){return []}' : 'export async function reservationEmailWhere(db,email){return {email}}', loader: 'js' }));
  } }] });
  const compiled = new Module(path.join(root, 'fixture-paid-navigation.cjs'));
  compiled.filename = path.join(root, 'fixture-paid-navigation.cjs'); compiled.paths = Module._nodeModulePaths(root);
  compiled._compile(built.outputFiles[0].text, compiled.filename); return compiled.exports;
}

test('billing singleton canonical writes and legacy reads preserve exact owner state', async t => {
  const keys = { ACCOUNT_ENROLLMENT_ENABLED: 'true', VERCEL: '1' };
  for (const [key, value] of Object.entries(keys)) { const before = process.env[key]; process.env[key] = value; t.after(() => before === undefined ? delete process.env[key] : process.env[key] = before); }
  let saved = [], writes = [], mileageLogs = [], verified = true, vehicleCount = 0;
  const tx = { $queryRaw: async () => [], user: { findUnique: async () => ({ emailVerified: verified ? new Date() : null }) }, vehicle: {
    findMany: async ({ where }) => { assert.equal(where.userId, 'owner'); return saved; }, count: async () => vehicleCount,
    create: async ({ data }) => { writes.push(data); return { id: 'created' }; },
    updateMany: async ({ where, data }) => {
      assert.equal(where.userId, 'owner'); assert.equal(where.id, saved[0].id);
      assert.deepEqual(where.updatedAt, saved[0].updatedAt); assert.equal(where.currentMileage, saved[0].currentMileage);
      assert.equal(where.reviewedEquipmentId, saved[0].reviewedEquipmentId); assert.equal(where.transmission, saved[0].transmission);
      assert.deepEqual(Object.keys(data).sort(), ['currentMileage', 'lastMileageUpdate', 'updatedAt']);
      writes.push(data); Object.assign(saved[0], data); return { count: 1 };
    },
  }, mileageLog: { create: async ({ data }) => { mileageLogs.push(data); return data; } } };
  globalThis.__paidNavigation = { session: { user: { id: 'owner' } }, db: { $transaction: async fn => fn(tx) } };
  t.after(() => delete globalThis.__paidNavigation);
  const api = await load();
  const send = (body = {}, country = 'US') => api.POST(new Request('https://fixture.invalid/api/billing/vehicle', { method: 'POST', headers: { 'x-vercel-ip-country': country }, body: JSON.stringify({ catalogId: 'xt6', mileage: 10000, ...body }) }));
  const xt6 = { year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Sport' };
  for (const transmission of [null, 'automatic']) assert.equal(api.hasValidReviewedTransmissionState({ ...xt6, transmission }), true);
  for (const transmission of ['manual', 'garbage', 'Automatic', '']) assert.equal(api.hasValidReviewedTransmissionState({ ...xt6, transmission }), false);
  assert.equal(api.hasValidReviewedTransmissionState({ ...xt6, trim: 'unreviewed', transmission: 'garbage' }), true);
  const dual = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };
  for (const transmission of [null, 'automatic', 'manual', 'garbage']) {
    assert.equal(api.hasValidReviewedTransmissionState({ ...dual, transmission }), transmission !== 'garbage');
    assert.deepEqual(api.resolveReviewedTransmissionBranch(dual, transmission), { branch: ['automatic', 'manual'].includes(transmission) ? transmission : null, requiresChoice: true, options: ['automatic', 'manual'] });
  }
  for (const body of [{}, { transmission: 'automatic' }]) {
    writes = []; assert.equal((await send(body)).status, 200); assert.equal(writes.length, 1);
    assert.equal(writes[0].transmission, null); assert.equal(writes[0].currentMileage, 10000); assert.equal(writes[0].reviewedEquipmentId, undefined);
  }
  for (const transmission of [null, 'automatic']) {
    saved = [{ id: 'original-owner-car', transmission, currentMileage: 12345, reviewedEquipmentId: null, updatedAt: new Date('2026-09-15') }];
    const before = structuredClone(saved); writes = []; mileageLogs = [];
    assert.deepEqual(await (await send()).json(), { vehicleId: 'original-owner-car' });
    assert.equal(saved[0].currentMileage, 10000); assert.equal(writes.length, 1);
    assert.equal(saved[0].transmission, before[0].transmission); assert.equal(saved[0].reviewedEquipmentId, before[0].reviewedEquipmentId);
    assert(saved[0].updatedAt > before[0].updatedAt);
    assert.deepEqual(mileageLogs, [{ vehicleId: 'original-owner-car', mileage: 10000, source: 'manual' }]);
    const corrected = structuredClone(saved); writes = [];
    assert.equal((await send()).status, 200); assert.deepEqual(saved, corrected); assert.deepEqual(writes, []); assert.equal(mileageLogs.length, 1);
  }
  for (const rows of [[{ id: 'bad', transmission: 'manual', currentMileage: 10000 }], [{ id: 'bad', transmission: 'garbage', currentMileage: 10000 }], [{ id: 'zero', transmission: null, currentMileage: 0 }], [{ id: 'a' }, { id: 'b' }]]) {
    saved = rows; assert.equal((await send()).status, 409); assert.deepEqual(writes, []);
  }
  saved = [];
  assert.equal((await send({ transmission: 'manual' })).status, 400);
  assert.equal((await send({ catalogId: 'unknown' })).status, 400);
  assert.equal((await send({}, 'DE')).status, 403);
  vehicleCount = 3; assert.equal((await send()).status, 409); vehicleCount = 0;
  verified = false; assert.equal((await send()).status, 409);
  globalThis.__paidNavigation.session = null; assert.equal((await send()).status, 401);
  assert.deepEqual(writes, []);
});

test('actual billing POST preserves automatic and manual dual choices, rejects missing choice and conflicts', async t => {
  for (const [key, value] of Object.entries({ ACCOUNT_ENROLLMENT_ENABLED: 'true', VERCEL: '1' })) {
    const before = process.env[key]; process.env[key] = value;
    t.after(() => before === undefined ? delete process.env[key] : process.env[key] = before);
  }
  let saved = [], writes = [], mileageLogs = [];
  const tx = { $queryRaw: async () => [], user: { findUnique: async () => ({ emailVerified: new Date() }) }, vehicle: {
    findMany: async ({ where }) => { assert.deepEqual(where, { userId: 'owner', year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' }); return saved; },
    count: async () => 0, create: async ({ data }) => { writes.push(data); return { id: 'created-dual' }; },
    updateMany: async ({ where, data }) => {
      assert.equal(where.userId, 'owner'); assert.equal(where.id, saved[0].id);
      assert.deepEqual(where.updatedAt, saved[0].updatedAt); assert.equal(where.currentMileage, saved[0].currentMileage);
      assert.equal(where.reviewedEquipmentId, saved[0].reviewedEquipmentId); assert.equal(where.transmission, saved[0].transmission);
      assert.deepEqual(Object.keys(data).sort(), ['currentMileage', 'lastMileageUpdate', 'updatedAt']);
      writes.push(data); Object.assign(saved[0], data); return { count: 1 };
    },
  }, mileageLog: { create: async ({ data }) => { mileageLogs.push(data); return data; } } };
  globalThis.__paidNavigation = { session: { user: { id: 'owner' } }, db: { $transaction: async fn => fn(tx) } };
  t.after(() => delete globalThis.__paidNavigation);
  const api = await load();
  const send = transmission => api.POST(new Request('https://fixture.invalid/api/billing/vehicle', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ catalogId: 'challenger', mileage: 10000, ...(transmission === undefined ? {} : { transmission }) }) }));
  for (const transmission of ['automatic', 'manual']) {
    saved = []; writes = [];
    assert.deepEqual(await (await send(transmission)).json(), { vehicleId: 'created-dual' });
    assert.equal(writes.length, 1); assert.equal(writes[0].transmission, transmission); assert.equal(writes[0].currentMileage, 10000);
    saved = [{ id: 'original-' + transmission, transmission, currentMileage: 12345, reviewedEquipmentId: 'preserved', updatedAt: new Date('2026-09-15') }];
    const before = structuredClone(saved); writes = []; mileageLogs = [];
    assert.deepEqual(await (await send(transmission)).json(), { vehicleId: 'original-' + transmission });
    assert.equal(saved[0].currentMileage, 10000); assert.equal(writes.length, 1);
    assert.equal(saved[0].transmission, before[0].transmission); assert.equal(saved[0].reviewedEquipmentId, before[0].reviewedEquipmentId);
    assert(saved[0].updatedAt > before[0].updatedAt);
    assert.deepEqual(mileageLogs, [{ vehicleId: saved[0].id, mileage: 10000, source: 'manual' }]);
    const corrected = structuredClone(saved); writes = [];
    assert.equal((await send(transmission)).status, 200); assert.deepEqual(saved, corrected); assert.deepEqual(writes, []); assert.equal(mileageLogs.length, 1);
    assert.equal((await send(transmission === 'automatic' ? 'manual' : 'automatic')).status, 409);
    assert.equal((await send(undefined)).status, 400); assert.deepEqual(saved, corrected); assert.deepEqual(writes, []);
    for (const existingTransmission of [null, 'garbage']) {
      saved = [{ id: 'unresolved', transmission: existingTransmission, currentMileage: 12345 }];
      assert.equal((await send(transmission)).status, 409); assert.deepEqual(writes, []);
    }
  }
  saved = [];
  for (const transmission of [undefined, null, 'garbage']) { assert.equal((await send(transmission)).status, 400); assert.deepEqual(writes, []); }
});

test('actual paid XT6 loader accepts billing automatic, requires equipment and keeps ownership', async t => {
  globalThis.__paidNavigation = { db: {} }; t.after(() => delete globalThis.__paidNavigation);
  const api = await load(), profile = api.REVIEWED_OWNER_EQUIPMENT.find(p => p.catalogId === 'xt6');
  const row = { id: 'exact-xt6', userId: 'owner', year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Sport', transmission: 'automatic', reviewedEquipmentId: null, currentMileage: 10000, color: null, updatedAt: new Date('2026-09-15T10:00:00Z') };
  let recordReads = 0;
  const tx = { $queryRaw: async () => [{ now: new Date('2026-09-15T12:00:00Z') }],
    user: { findUnique: async () => ({ email: 'owner@example.invalid', emailVerified: new Date(), subscriptionId: 'fixture-sub', subscriptionStatus: 'active', subscriptionTier: 'hub' }) },
    vehicle: { findFirst: async ({ where }) => row.id === where.id && row.userId === where.userId ? row : null },
    reservation: { findMany: async () => [] }, maintenanceRecord: { findFirst: async () => { recordReads++; return null; } },
    knownIssue: { findMany: async () => [] }, modification: { findMany: async () => [] },
  };
  const db = { ...tx, $transaction: async fn => fn(tx) };
  const run = (owner = 'owner', id = row.id) => api.getTwinHubData(owner, 'owner@example.invalid', id, { prisma: db, getRecentThreads: async () => [] });
  const selectedId = new URL(api.savedVehicleHubHref(row), 'https://fixture.invalid').searchParams.get('vehicleId');
  assert.equal(selectedId, row.id);
  assert.equal(api.selectOwnedHubVehicle([{ ...row, id: 'same-model-other-car' }, row], selectedId).id, row.id);
  assert.equal(api.selectOwnedHubVehicle([{ ...row, id: 'same-model-other-car' }], selectedId), null);
  const before = structuredClone(row), setup = await run('owner', selectedId);
  assert.equal(setup.access.reason, 'equipment-unconfirmed'); assert.equal(setup.data, null);
  assert.equal(setup.ownerSetup.vehicleId, row.id); assert.equal(setup.ownerSetup.equipment.id, profile.id);
  assert.equal(setup.ownerSetup.needsMileage, false);
  assert.deepEqual(setup.ownerSetup.transmissionOptions, []);
  assert.equal(setup.ownerSetup.vehicleRevision, row.updatedAt.toISOString());
  assert.equal(setup.equipmentSetup, undefined);
  assert.equal(recordReads, 0); assert.deepEqual(row, before);
  // A separate fixture models the state after the owner's explicit confirmation.
  row.reviewedEquipmentId = profile.id;
  const confirmed = await run(); assert.equal(confirmed.access.kind, 'allowed'); assert.equal(confirmed.data.vehicleId, row.id); assert.equal(confirmed.data.miles, 10000); assert.equal(confirmed.data.transmission, 'automatic');
  for (const result of [await run('another-owner'), await run('owner', 'another-car')]) {
    assert.equal(result.data, null);
    assert.equal(result.ownerSetup, undefined);
    assert.equal(result.equipmentSetup, undefined);
  }
  assert.deepEqual(row, { ...before, reviewedEquipmentId: profile.id });
  row.transmission = 'manual'; assert.equal((await run()).access.reason, 'unsupported-vehicle');
});
