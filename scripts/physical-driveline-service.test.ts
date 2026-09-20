import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoVehicleTwin } from '../src/lib/vehicle-twin-catalog';
import { buildModelOwnerTrees, resolveTwinTrees } from '../src/components/twin/demo-trees';
import { buildTwinMaintenanceSchedule } from '../src/components/twin/maintenance-schedule';
import { resolveMaintenanceWriteType, resolveMaintenanceReadTypes } from '../src/lib/maintenance';
import { getTransmissionOptions, getReviewedTransmissionChoices } from '../src/lib/transmission-options';
import { applyOwnerMaintenanceIntervals, getVehicleMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { persistMaintenanceEntry } from '../src/lib/maintenance-service-mutation';
import { buildMaintenanceSuggestions } from '../src/lib/maintenance-suggestions';
import { TWIN_SERVICE_RECORD_TYPES } from '../src/lib/twin-hub-data';
import { createMaintenancePatchHandler } from '../src/lib/maintenance-patch-handler';

const evaluatedAt = '2026-09-13T12:00:00Z';
const record = (type: string) => ({ type, mileage: 50000, date: '2026-09-01T12:00:00Z' });
function vehicle(id: string) {
  const twin = resolveDemoVehicleTwin(id)!;
  assert(twin);
  return { ...twin.identity, transmission: null, id: 'synthetic-car', userId: 'synthetic-owner', currentMileage: 60000, updatedAt: new Date(evaluatedAt) };
}
function trees(id: string, records = [] as ReturnType<typeof record>[]) {
  const built = buildModelOwnerTrees(resolveDemoVehicleTwin(id), records, 60000 as never, null, evaluatedAt as never);
  applyOwnerMaintenanceIntervals(built, records, vehicle(id), 60000, evaluatedAt);
  return built;
}

for (const id of ['xt6', 'mdx', 'nautilus', 'murano', 'kicks', 'aviator']) test(`${id}: held exact automatic identity writes canonical fluid without a selector`, () => {
  const car = vehicle(id);
  assert.deepEqual(getTransmissionOptions(car), []);
  assert.deepEqual(getReviewedTransmissionChoices(car), ['automatic']);
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid', car), { ok: true, type: 'transmission_fluid_auto' });
  assert.equal(resolveMaintenanceWriteType('transmission_fluid_manual', car).ok, false);
  assert.equal(car.transmission, null);
  assert.equal(resolveDemoVehicleTwin(id)!.ownerReady, true, 'Owner rendering separately requires explicit reviewed equipment');
});

for (const id of ['nautilus', 'murano', 'kicks']) test(`${id}: integrated FWD context shares one transmission leaf and no differential job`, () => {
  const built = trees(id, [record('transmission_fluid_auto')]);
  assert.deepEqual(built.trans.nodes.driveline.kids, ['transFluid']);
  assert.equal(built.trans.nodes.driveline.group, true);
  assert.equal(built.trans.nodes.driveline.maintenanceType, undefined);
  const fluidJobs = Object.values(built.car.nodes).filter((node: any) => /transmission_fluid|differential_fluid/.test(node.maintenanceType || '')) as any[];
  assert.equal(fluidJobs.length, 1);
  assert.equal(fluidJobs[0].unlogged, false);
  assert.equal(built.trans.nodes.transFluid, built.car.nodes.transFluid);
  assert.equal(resolveMaintenanceWriteType('differential_fluid', vehicle(id)).ok, true, 'Saved trim does not prove FWD equipment');
  assert.equal(resolveMaintenanceWriteType('transfer_case_fluid', vehicle(id)).ok, true, 'Existing generic owner services remain available');
});

for (const [id, secondType, secondNode] of [['xt6', 'awd_clutch_fluid', 'clutchFluid'], ['mdx', 'transfer_case_fluid', 'transferFluid']]) {
  test(`${id}: distinct records complete only their own circuit`, async () => {
    for (const type of ['rear_axle_fluid', secondType]) {
      const saved: any[] = [];
      const tx = { vehicle: { updateMany: async ({ where }: any) => { assert.equal(where.userId, 'synthetic-owner'); return { count: 1 }; } }, maintenanceRecord: { create: async ({ data }: any) => { saved.push(data); return data; } } };
      const row = await persistMaintenanceEntry(tx as never, vehicle(id) as never, record(type), new Date(evaluatedAt));
      assert.equal(saved.length, 1);
      assert.equal(row.type, type);
      assert.equal(row.nextDueMileage, id === 'xt6' && type === 'rear_axle_fluid' ? 200000 : undefined);
      assert.equal(row.nextDueDate, null);
      const built = trees(id, [{ ...row, date: row.date.toISOString() }]);
      assert.equal(built.car.nodes.rearAxleFluid.unlogged, type !== 'rear_axle_fluid');
      assert.equal(built.car.nodes[secondNode].unlogged, type !== secondType);
      assert.equal(built.car.nodes.rearAxleFluid, built.trans.nodes.rearAxleFluid);
      assert.equal(built.car.nodes[secondNode], built.trans.nodes[secondNode]);
      assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
    }
  });
  test(`${id}: ambiguous legacy combined history remains unassigned and readable`, () => {
    const built = trees(id, [record('differential_fluid')]);
    assert.equal(built.car.nodes.rearAxleFluid.unlogged, true);
    assert.equal(built.car.nodes[secondNode].unlogged, true);
    assert.equal(built.car.nodes.driveline.maintenanceType, undefined);
    assert.deepEqual(resolveMaintenanceReadTypes('differential_fluid', vehicle(id)), ['differential_fluid']);
    assert.equal(resolveMaintenanceWriteType('differential_fluid', vehicle(id)).ok, true);
  });
}

test('physical products are preserved individually; unverified component art is explicitly held', () => {
  const xt6 = trees('xt6').car.nodes;
  assert.match(xt6.rearAxleFluid.partNo, /88862624/);
  assert.match(xt6.clutchFluid.partNo, /88901975/);
  assert.match(xt6.rearAxleFluid.buyUrl, /88862624/);
  assert.match(xt6.clutchFluid.buyUrl, /88901975/);
  assert.match(xt6.rearAxleFluid.life, /75,000/);
  assert.doesNotMatch(xt6.rearAxleFluid.img, /power-transfer|transmission/);
  assert.equal(xt6.clutchFluid.imageUnavailable,false);
  assert.equal(xt6.clutchFluid.img, '/twin-stage/parts/part-service-fluid.webp');
  const mdx = trees('mdx').car.nodes;
  assert.match(mdx.rearAxleFluid.partNo, /08200-9007A/);
  assert.match(mdx.transferFluid.partNo, /08200-9014A/);
  assert.match(mdx.rearAxleFluid.life, /Minder 6/);
  assert.match(mdx.transferFluid.life, /Minder 3/);
  assert.equal(mdx.transferFluid.imageUnavailable,false);
});

test('normal-use null clocks remain null in trees, writes and suggestions', async () => {
  for (const [id, type] of [['xt6', 'awd_clutch_fluid'], ['xt6', 'transmission_fluid_auto'], ['mdx', 'rear_axle_fluid'], ['mdx', 'transfer_case_fluid'], ['mdx', 'transmission_fluid_auto'], ['murano', 'transmission_fluid_auto'], ['aviator', 'differential_fluid']]) {
    assert.equal(getVehicleMaintenanceIntervals(type, vehicle(id)).intervalMiles, null, `${id}/${type}`);
    const projected = Object.values(trees(id, [record(type)]).car.nodes).find((node: any) => node.maintenanceType === type) as any;
    assert.equal(projected.serviceIntervalMiles, null);
    assert.equal(projected.dueMileage, null);
    assert.equal(projected.dueDate, null);
    assert(!buildMaintenanceSuggestions({ vehicleId: 'synthetic-car', vehicle: vehicle(id), currentMileage: 200000 }, []).some(s => s.typeId === type));
  }
  const saved = await persistMaintenanceEntry({ maintenanceRecord: { create: async ({ data }: any) => data } } as never, vehicle('aviator') as never, record('differential_fluid'), new Date(evaluatedAt));
  assert.equal(saved.nextDueMileage, undefined);
  assert.equal(saved.nextDueDate, null);
});

test('XT6 rear deadline is placed in driveline schedule category, not engine', () => {
  const built = trees('xt6');
  const schedule = buildTwinMaintenanceSchedule(built, 149999, 5);
  const containing = schedule.columns.flatMap((c: any) => c.groups).filter((g: any) => JSON.stringify(g).includes('rearAxleFluid'));
  assert(containing.length > 0);
  assert(containing.every((g: any) => g.id === 'driveline'));
});

test('new physical vocabulary rejects unreviewed exact identities, legacy history is not deleted', () => {
  for (const car of [{ ...vehicle('xt6'), year: 2021 }, { ...vehicle('mdx'), trim: 'Base' }, { ...vehicle('xt6'), model: 'XT5' }]) {
    assert.equal(resolveMaintenanceWriteType('rear_axle_fluid', car).ok, false);
    assert.equal(resolveMaintenanceWriteType('awd_clutch_fluid', car).ok, false);
  }
  assert.equal(resolveMaintenanceWriteType('awd_clutch_fluid', vehicle('mdx')).ok, false);
});

test('saved deadlines remain intact and are not presented as a verified factory clock', () => {
  const old = { ...record('differential_fluid'), nextDueMileage: 80000, nextDueDate: '2029-09-01T12:00:00Z' };
  const built = trees('aviator', [old]);
  assert.equal(built.car.nodes.driveline.unlogged, false);
  assert.equal(built.car.nodes.driveline.dueMileage, 80000);
  assert.equal(built.car.nodes.driveline.dueDate, old.nextDueDate);
  assert.match(built.car.nodes.driveline.dueNote, /Saved service-record deadline; not a verified factory/);
  assert.equal(old.nextDueMileage, 80000, 'Stored evidence is preserved, not rewritten');
});

test('suggestions preserve a verified no-mileage manual entry without identity context', () => {
  const schedule = { schedule: { transmission_fluid_auto: { verified: true, interval_miles: null } } } as never;
  const suggestions = buildMaintenanceSuggestions({ vehicleId: 'synthetic-car', currentMileage: 200000, ownersManualSchedule: schedule }, []);
  assert(!suggestions.some(item => item.typeId === 'transmission_fluid'));
});

test('demo sample records cannot restore a conditional severe interval as a normal-use clock', () => {
  const built = resolveTwinTrees(resolveDemoVehicleTwin('murano'));
  assert.equal(built.car.nodes.transFluid.serviceIntervalMiles, null);
  assert.equal(built.car.nodes.transFluid.riskAt, null);
  assert.equal(built.car.nodes.transFluid.dueMileage, null);
  assert.match(built.car.nodes.transFluid.sub, /no fixed normal-use/);
});

test('a changed exact vehicle identity aborts a physical-circuit save before creating records', async () => {
  let writes = 0;
  const tx = { vehicle: { updateMany: async () => ({ count: 0 }) }, maintenanceRecord: { create: async () => { writes++; } } };
  await assert.rejects(persistMaintenanceEntry(tx as never, vehicle('xt6') as never, record('rear_axle_fluid'), new Date(evaluatedAt)), /vehicle changed/);
  assert.equal(writes, 0);
});

test('legacy combined notes can be edited without reclassifying or duplicating the saved job', async () => {
  const car = vehicle('xt6');
  const existing = { ...record('differential_fluid'), id: 'legacy-record', vehicleId: car.id, vehicle: car, date: new Date(record('').date), description: null, cost: null, notes: null, shopName: null, receiptUrl: null, nextDueMileage: null, nextDueDate: null };
  const tx = { maintenanceRecord: { findUnique: async () => existing, update: async ({ data }: any) => ({ ...existing, ...data }) } };
  const handler = createMaintenancePatchHandler({ auth: async () => ({ user: { id: car.userId } }), prisma: { $transaction: async (run: any) => run(tx) } as never });
  const response = await handler(new Request('https://synthetic.test/maintenance/legacy-record', { method: 'PATCH', body: JSON.stringify({ notes: 'Receipt does not identify which circuit was serviced' }) }), { params: Promise.resolve({ id: existing.id }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.record.type, 'differential_fluid');
  assert.match(result.record.notes, /does not identify/);
});

test('unknown owner drivetrain keeps generic fluid writes without completing multiple demo circuits', async () => {
  for (const id of ['nautilus', 'murano', 'kicks', 'xt6', 'mdx']) {
    for (const type of ['differential_fluid', 'transfer_case_fluid']) {
      const tx = { maintenanceRecord: { create: async ({ data }: any) => data } };
      const saved = await persistMaintenanceEntry(tx as never, vehicle(id) as never, record(type), new Date(evaluatedAt));
      assert.equal(saved.type, type, 'Do not infer owner equipment from the demo trim');
      if (type === 'differential_fluid' && (id === 'xt6' || id === 'mdx')) {
        const built = trees(id, [{ ...saved, date: saved.date.toISOString() }]);
        assert.equal(built.car.nodes.rearAxleFluid.unlogged, true);
        assert.equal(built.car.nodes[id === 'xt6' ? 'clutchFluid' : 'transferFluid'].unlogged, true);
      }
    }
  }
});
