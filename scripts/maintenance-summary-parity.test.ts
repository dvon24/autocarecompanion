import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoVehicleTwin } from '../src/lib/vehicle-twin-catalog';
import { buildModelOwnerTrees, buildDemoTwinPresentation, collectHotspotNodes, summarizeEvidence } from '../src/components/twin/demo-trees';
import { applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { buildMaintenanceSuggestions } from '../src/lib/maintenance-suggestions';

const twin = resolveDemoVehicleTwin('mdx')!;
const vehicle = { ...twin.identity, transmission: null };
const now = new Date('2026-09-13T12:00:00Z');
type Record = { id: string; type: string; mileage: number; date: Date; nextDueMileage?: number | null };
const row = (id: string, type = 'transmission_fluid_auto', mileage = 50000, nextDueMileage: number | null = null): Record =>
  ({ id, type, mileage, date: new Date('2026-08-01T00:00:00Z'), nextDueMileage });
function project(records: Record[], miles = 60000) {
  const serialized = records.map(record => ({ ...record, date: record.date.toISOString(), nextDueDate: null }));
  const trees = buildModelOwnerTrees(twin, serialized, miles as never, null, now.toISOString() as never);
  applyOwnerMaintenanceIntervals(trees, serialized, vehicle, miles, now.toISOString());
  return { trees, summary: summarizeEvidence(collectHotspotNodes(trees, { branch: 'trans' }), miles) };
}
const options = (miles = 60000) => ({ vehicleId: 'synthetic-mdx', vehicle, currentMileage: miles, evaluatedAt: now });

test('static demo markers agree with actual clockless sample evidence without completing an owner vehicle', () => {
  for (const [id, hotspot] of [['nautilus', 'rearwheel'], ['murano', 'trans']]) {
    const catalog = resolveDemoVehicleTwin(id)!;
    assert.equal(catalog.hotspots.find(item => item.id === hotspot)?.status, id==='nautilus'?'unlogged':'on-track');
    assert.equal(buildDemoTwinPresentation(catalog).hotspots.find((item: any) => item.id === hotspot)?.serviceStatus, id==='nautilus'?'unlogged':'on-track', 'Newly routed inspections are not completed by tire sample history');
    const ownerTrees = buildModelOwnerTrees(catalog, [], 60000 as never, null, now.toISOString() as never);
    applyOwnerMaintenanceIntervals(ownerTrees, [], catalog.identity, 60000, now.toISOString());
    assert.equal(summarizeEvidence(collectHotspotNodes(ownerTrees, catalog.hotspots.find(item => item.id === hotspot)!), 60000).serviceStatus, 'unlogged');
    assert.equal(catalog.ownerReady, true,'Accepted owner readiness does not fabricate service history');
  }
});

test('actual recorded MDX clockless circuits count as history without invented repeat deadlines', () => {
  for (const mileage of [0, 50000]) {
    const records = ['transmission_fluid_auto', 'rear_axle_fluid', 'transfer_case_fluid'].map(type => row(type, type, mileage));
    const { trees, summary } = project(records);
    for (const id of ['transFluid', 'rearAxleFluid', 'transferFluid']) {
      assert.equal(trees.car.nodes[id].servicedAt, mileage);
      assert.equal(trees.car.nodes[id].dueMileage, null);
      assert.equal(trees.car.nodes[id].dueDate, null);
    }
    const circuitSummary=summarizeEvidence(['transFluid','rearAxleFluid','transferFluid'].map(id=>trees.car.nodes[id]),60000);
    assert.equal(circuitSummary.serviceStatus, 'on-track');
    assert.doesNotMatch(circuitSummary.serviceLabel, /Never logged|incomplete/);
    assert.equal(summary.serviceStatus,'unlogged');assert.match(summary.serviceLabel,/history incomplete/i);
    assert.equal(project([...records,row('boots','driveshaft_boots_inspection',mileage),row('levels','fluid_levels_inspection',mileage)]).summary.serviceStatus,'on-track','Only separately completed full inspections complete the expanded branch');
    assert.equal(summary.status, 'known-issue', 'known issues are independent of completed service');
    assert.deepEqual(buildMaintenanceSuggestions(options(), records), []);
  }
});

test('actual saved mileage deadline remains overdue even with partial clockless history', () => {
  const { summary } = project([row('saved', 'transmission_fluid_auto', 50000, 55000)]);
  assert.equal(summary.serviceStatus, 'overdue');
  assert.match(summary.serviceLabel, /1 overdue.*history incomplete/i);
  assert.equal(summary.due, null, 'do not imply complete history');
  assert.equal(project([]).summary.serviceStatus, 'unlogged');
  assert.match(project([]).summary.serviceLabel, /Never logged/);
});

test('assistant and tree choose the same latest valid date/mileage/id evidence, regardless of input order', () => {
  const scenarios = [
    [row('a', undefined, 50000, 55000), row('b', undefined, 59000, 65000)],
    [row('a', undefined, 59000, 60000), row('z', undefined, 59000, 64500)],
    [row('older', undefined, 59000, 60000), { ...row('newer', undefined, 50000, 64500), date: new Date('2026-09-01') }],
  ];
  for (const records of scenarios) for (const ordered of [records, [...records].reverse()]) {
    const before = structuredClone(ordered);
    const suggestion = buildMaintenanceSuggestions(options(), ordered).find(item => item.typeId === 'transmission_fluid_auto');
    assert(suggestion);
    assert.equal(suggestion.nextDueMileage, project(ordered).trees.car.nodes.transFluid.dueMileage);
    assert.equal(suggestion.status, 'upcoming');
    assert.deepEqual(ordered, before);
  }
});

test('assistant rejects invalid/future evidence before ordering and never fabricates current mileage', () => {
  const valid = row('valid', undefined, 59000, 64500);
  const invalid = [-1, NaN, Infinity, 61000].map((mileage, index) => ({ ...row('invalid' + index, undefined, mileage, 60000), date: new Date('2026-09-01') }));
  invalid.push({ ...valid, id: 'future', date: new Date('2027-01-01'), nextDueMileage: 60000 });
  invalid.push({ ...valid, id: 'invalid-date', date: new Date(NaN), nextDueMileage: 60000 });
  assert.equal(buildMaintenanceSuggestions(options(), [...invalid, valid])[0]?.nextDueMileage, 64500);
  assert.deepEqual(buildMaintenanceSuggestions(options(), invalid), []);
  for (const mileage of [-1, NaN, Infinity]) assert.deepEqual(buildMaintenanceSuggestions(options(mileage), [valid]), []);
  assert.deepEqual(buildMaintenanceSuggestions({ ...options(), evaluatedAt: new Date(NaN) }, [valid]), []);
});
