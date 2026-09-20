import assert from 'node:assert/strict';
import test from 'node:test';
import { executeGarageAssistantMaintenanceInTransaction } from './garage-assistant-maintenance';
import { getScheduleForVehicle, MAINTENANCE_SCHEDULES } from './maintenance';
import { applyOwnerMaintenanceIntervals, getVehicleMaintenanceIntervals } from './vehicle-maintenance-intervals';
import { buildOwnerTwinValue } from '../components/twin/LiveTwinHub';
import { executeGarageAssistantProductionTool } from './garage-assistant-production-tool';
import { getOwnersManualSchedule } from './owners-manual-schedule';

const challenger = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', transmission: 'automatic' };
const camaro = { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1', transmission: 'manual' };

test('exact owner manual clocks override generic and model defaults without borrowing another trim', () => {
  assert.deepEqual(getVehicleMaintenanceIntervals('oil_change', challenger), {
    intervalMiles: 6000, intervalMonths: 6, source: 'owners-manual',
  });
  assert.notEqual(MAINTENANCE_SCHEDULES.oil_change.defaultIntervalMiles, 6000);
  const otherTrim = { ...challenger, trim: 'R/T' };
  const modelDefault = getScheduleForVehicle('oil_change', otherTrim)!;
  assert.deepEqual(getVehicleMaintenanceIntervals('oil_change', otherTrim), {
    intervalMiles: modelDefault.intervalMiles, intervalMonths: modelDefault.intervalMonths, source: 'vehicle-default',
  });
  assert.equal(getVehicleMaintenanceIntervals('oil_change', { ...challenger, year: 2010 }).source, 'vehicle-default');
  assert.equal(getVehicleMaintenanceIntervals('oil_change', { ...challenger, trim: null }).source, 'vehicle-default');
  assert.deepEqual(getVehicleMaintenanceIntervals('oil_change', { year: 2020, make: 'Unknown', model: 'Unknown' }), {
    intervalMiles: 5000, intervalMonths: 6, source: 'vehicle-default',
  });
});

test('manual and automatic clocks stay on the selected branch and retain null time clocks', () => {
  assert.deepEqual(getVehicleMaintenanceIntervals('transmission_fluid_manual', camaro), {
    intervalMiles: 45000, intervalMonths: 60, source: 'owners-manual',
  });
  assert.deepEqual(getVehicleMaintenanceIntervals('transmission_fluid_auto', { ...camaro, transmission: 'automatic' }), {
    intervalMiles: 97500, intervalMonths: null, source: 'owners-manual',
  });
  assert.equal(getVehicleMaintenanceIntervals('transmission_fluid', camaro).intervalMiles, 45000);
});

async function logService(type: string) {
  let persisted: Record<string, unknown> | undefined;
  const tx = {
    vehicle: { findFirst: async ({ where }: { where: object }) => {
      assert.deepEqual(where, { id: 'v1', userId: 'owner' });
      return { ...challenger, id: 'v1', currentMileage: 65000, updatedAt: new Date('2026-09-01') };
    } },
    maintenanceRecord: { create: async ({ data }: { data: Record<string, unknown> }) => {
      persisted = data;
      return { ...data, id: 'record', cost: null };
    } },
  };
  const message = await executeGarageAssistantMaintenanceInTransaction(tx as never, {
    vehicleId: 'v1', type, mileage: 65000, date: '2026-09-05',
  }, 'owner', new Date('2026-09-05'));
  assert.ok(persisted);
  return { data: persisted, message };
}

for (const type of ['oil_change', 'brake_fluid', 'brake_service', 'cooling_system_service']) {
  test(`chat write and owner tree share ${type} clocks and clear unlogged state`, async () => {
    const { data, message } = await logService(type);
    const interval = getVehicleMaintenanceIntervals(type, challenger);
    assert.equal(data.nextDueMileage ?? null, interval.intervalMiles ? 65000 + interval.intervalMiles : null);
    assert.equal(data.nextDueDate instanceof Date, interval.intervalMonths != null);
    const record = {
      type, mileage: 65000, date: '2026-09-05T00:00:00.000Z',
      nextDueMileage: (data.nextDueMileage as number | undefined) ?? null,
      nextDueDate: data.nextDueDate instanceof Date ? data.nextDueDate.toISOString() : null,
    };
    // The old tree can carry stale generic deadlines and an inherited unlogged flag.
    const node = { maintenanceType: type, servicedAt: 65000, servicedDate: record.date, unlogged: true,
      dueMileage: 70000 as number | null, dueDate: '2027-03-05' as string | null,
      serviceIntervalMiles: 5000 as number | null, serviceIntervalMonths: 6 as number | null };
    applyOwnerMaintenanceIntervals({ engine: { nodes: { service: node } } }, [record], challenger, 65000, '2026-09-06');
    assert.equal(node.unlogged, false);
    assert.equal(node.serviceIntervalMiles, interval.intervalMiles);
    assert.equal(node.serviceIntervalMonths, interval.intervalMonths);
    assert.equal(node.dueMileage, record.nextDueMileage);
    assert.equal(node.dueDate, record.nextDueDate);
    if (!interval.intervalMiles) assert.doesNotMatch(message, /Next due at/);
  });
}

test('time-only and condition-based entries never receive a generic mileage deadline', () => {
  assert.deepEqual(getVehicleMaintenanceIntervals('brake_fluid', challenger), {
    intervalMiles: null, intervalMonths: 24, source: 'owners-manual',
  });
  for (const type of ['brake_service', 'tire_replacement', 'cooling_system_service']) {
    assert.deepEqual(getVehicleMaintenanceIntervals(type, challenger), {
      intervalMiles: null, intervalMonths: null, source: 'condition-based',
    });
  }
  // After a coolant replacement, use the recurring clock, not the first-fill clock.
  assert.deepEqual(getVehicleMaintenanceIntervals('coolant_flush', challenger), {
    intervalMiles: 100000, intervalMonths: 60, source: 'owners-manual',
  });
});

test('owner tree preserves explicit owner deadlines and tire replacement evidence', () => {
  const node = { maintenanceType: 'tire_rotation', servicedAt: 65000, unlogged: true, dueMileage: null as number | null };
  applyOwnerMaintenanceIntervals({ tire: { nodes: { tire: node } } }, [{
    type: 'tire_replacement', mileage: 65000, date: '2026-09-05', nextDueMileage: 72000,
  }], challenger, 65000, '2026-09-06');
  assert.equal(node.unlogged, false);
  assert.equal(node.dueMileage, 72000);
});

test('future or missing service evidence stays unlogged and does not acquire replacement risk', () => {
  const node = { maintenanceType: 'oil_change', servicedAt: 65000, unlogged: false, riskAt: 5000 as number | null | undefined };
  applyOwnerMaintenanceIntervals({ engine: { nodes: { oil: node } } }, [{
    type: 'oil_change', mileage: 65000, date: '2027-09-05',
  }], challenger, 65000, '2026-09-06');
  assert.equal(node.unlogged, true);
  assert.equal(node.riskAt, undefined);
  assert.equal(node.servicedAt, undefined);
});

test('production owner-tree builder applies chat records to oil and filter nodes with shared clocks', async () => {
  const { data } = await logService('oil_change');
  const owner = buildOwnerTwinValue({
    fulfillmentId: 'dodge-challenger', vehicle: { ...challenger, engine: '6.4L V8 HEMI' },
    transmission: 'automatic', miles: 65000, evaluatedAt: '2026-09-06T00:00:00.000Z',
    records: [{ type: 'oil_change', mileage: 65000, date: '2026-09-05T00:00:00.000Z',
      nextDueMileage: data.nextDueMileage, nextDueDate: (data.nextDueDate as Date).toISOString() }],
    recent: [], issues: [], installedParts: [],
  });
  assert.ok(owner);
  for (const id of ['oilFluid', 'oilFilter']) {
    const node: { unlogged: boolean; servicedAt: number; dueMileage: number; serviceIntervalMiles: number; dueDate: string } = owner.trees.car.nodes[id];
    assert.equal(node.unlogged, false);
    assert.equal(node.servicedAt, 65000);
    assert.equal(node.dueMileage, 71000);
    assert.equal(node.serviceIntervalMiles, 6000);
    assert.equal(node.dueDate, '2027-03-05T00:00:00.000Z');
  }
});

test('assistant status read shares exact intervals, calendar-only deadlines and honest missing history', async () => {
  const output = await executeGarageAssistantProductionTool('get_maintenance_status', { vehicleId: 'v1' }, 'owner', {
    vehicle: { findFirst: async () => ({ ...challenger, currentMileage: 65000, maintenanceRecords: [
      { type: 'oil_change', mileage: 65000, date: new Date('2026-09-05'), nextDueMileage: null, nextDueDate: null },
      { type: 'brake_fluid', mileage: 64000, date: new Date('2024-08-01'), nextDueMileage: null, nextDueDate: null },
      { type: 'brake_service', mileage: 60000, date: new Date('2026-09-01'), nextDueMileage: null, nextDueDate: null },
    ] }) },
  } as never, new Date('2026-09-06'));
  const statuses = JSON.parse(output) as Array<{ type: string; status: string; message: string }>;
  assert.match(statuses.find((item) => item.type === 'Oil Change')!.message, /71,000 mi.*2027-03-05/);
  const brakeFluid = statuses.find((item) => item.type === 'Brake Fluid')!;
  assert.equal(brakeFluid.status, 'overdue');
  assert.match(brakeFluid.message, /2026-08-01/);
  assert.doesNotMatch(brakeFluid.message, /\bmi\b/);
  const brakes = statuses.find((item) => item.type === 'Brake Service')!;
  assert.equal(brakes.status, 'ok');
  assert.match(brakes.message, /no automatic replacement deadline/);
  assert.equal(statuses.find((item) => item.type === 'Spark Plugs')!.status, 'unknown');
});

test('2015 SRT 392 oil correction is primary-sourced and does not rewrite later-year data', () => {
  const correctedSchedule = getOwnersManualSchedule(challenger)!;
  assert.deepEqual(correctedSchedule.years, [2015]);
  assert.deepEqual(correctedSchedule.trims, ['SRT 392']);
  const corrected = correctedSchedule.schedule.engine_oil;
  assert.equal(corrected.interval_miles, 6000);
  assert.equal(corrected.interval_months, 6);
  assert.match(corrected.interval_source!.url!, /2015\/Challenger_SRT\/162\.pdf$/);
  assert.match(corrected.interval_source!.section!, /207/);
  assert.equal(corrected.interval_severe_miles, undefined);
  assert.equal(getOwnersManualSchedule({ ...challenger, year: 2016 })!.schedule.engine_oil.interval_source, undefined);
  assert.equal(getOwnersManualSchedule({ ...challenger, trim: 'Scat Pack' })!.schedule.engine_oil.interval_source, undefined);
});

test('estimated manual rows never become authoritative owner-manual intervals', () => {
  const manual = getOwnersManualSchedule(challenger)!;
  const estimated = { ...manual, schedule: { ...manual.schedule,
    engine_oil: { ...manual.schedule.engine_oil, interval_miles: 99000, interval_months: 99, verified: false },
  } };
  const result = getVehicleMaintenanceIntervals('oil_change', challenger, () => estimated);
  assert.equal(result.source, 'vehicle-default');
  assert.notEqual(result.intervalMiles, 99000);
  assert.notEqual(result.intervalMonths, 99);
});
