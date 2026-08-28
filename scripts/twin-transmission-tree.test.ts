// @ts-nocheck -- assertions exercise the intentionally untyped legacy JSX tree.
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTwinTrees, servicedFromRecords } from '../src/components/twin/twin-trees';
import { buildOwnerTwinValue } from '../src/components/twin/LiveTwinHub';

test('automatic owners receive only the ZF fluid branch and an order link', () => {
  const trees = buildTwinTrees({}, 65_000, 'automatic');
  assert.equal(trees.trans.nodes.trx.sub, 'ZF 8HP70 · 8-speed automatic');
  assert.equal(trees.trans.nodes.transFluid.partNo, '68218925AA');
  assert.match(trees.trans.nodes.transFluid.buyUrl, /ebay\.com\/itm\/152808690128/);
  assert.ok(trees.trans.nodes.transPan);
});

test('manual owners receive only the TR-6060 ATF+4 branch and an order link', () => {
  const trees = buildTwinTrees({}, 65_000, 'manual');
  assert.equal(trees.trans.nodes.trx.sub, 'Tremec TR-6060 · 6-speed manual');
  assert.equal(trees.trans.nodes.transFluid.partNo, '68218057AC');
  assert.match(trees.trans.nodes.transFluid.buyUrl, /ebay\.com\/itm\/389013189748/);
  assert.equal(trees.trans.nodes.transPan, undefined);
  assert.equal(trees.car.nodes.transPan, undefined);
});

test('unknown transmission renders no transmission parts', () => {
  const trees = buildTwinTrees({}, 65_000, null);
  assert.equal(trees.trans, undefined);
  assert.equal(trees.car.nodes.trx, undefined);
  assert.equal(trees.car.nodes.transFluid, undefined);
});

test('rear tire exposes an honest persisted rotation action without guessing overdue state', () => {
  const unlogged = buildTwinTrees({}, 65_000, 'automatic');
  assert.equal(unlogged.wheel.nodes.tire.maintenanceType, 'tire_rotation');
  assert.equal(unlogged.wheel.nodes.tire.serviceIntervalMiles, 6_000);
  assert.equal(unlogged.wheel.nodes.tire.unlogged, true);
  assert.equal(unlogged.wheel.nodes.tire.riskAt, undefined);

  const serviced = servicedFromRecords([{
    type:'tire_rotation', mileage:64_000, date:'2026-08-20T00:00:00.000Z', nextDueMileage:70_000, nextDueDate:null,
  }], 65_000, 'automatic', '2026-08-28T00:00:00.000Z');
  const logged = buildTwinTrees(serviced, 65_000, 'automatic', '2026-08-28T00:00:00.000Z');
  assert.equal(logged.wheel.nodes.tire.servicedAt, 64_000);
  assert.equal(logged.wheel.nodes.tire.dueMileage, 70_000);
});

test('inspection records do not reset brake replacement clocks', () => {
  const serviced = servicedFromRecords([{
    type:'brake_inspection', mileage:64_000, date:'2026-08-20T00:00:00.000Z', nextDueMileage:70_000, nextDueDate:null,
  }], 65_000, 'automatic', '2026-08-28T00:00:00.000Z');
  assert.equal(serviced.pads, undefined);
  assert.equal(serviced.rotor, undefined);
});

test('persisted Mishimoto part resolves the radiator issue in owner context', () => {
  const value = buildOwnerTwinValue({
    fulfillmentId:'dodge-challenger',
    vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},
    miles:65_000,
    records:[],
    recent:[],
    transmission:'automatic',
    evaluatedAt:'2026-08-28T00:00:00.000Z',
    installedPartNumbers:['  mmrad-srt-15  '],
    issues:[{id:'dodge-challenger-radiator-failure',title:'OEM Radiator Premature Failure',severity:'Moderate',href:'/known-issues/dodge-challenger#dodge-challenger-radiator-failure'}],
  });
  assert.equal(value.equipped.radCore, true);
  assert.equal(value.issues[0].resolved, true);
  assert.equal(value.trees.engine.nodes.radCore.knownIssue.title, 'OEM Radiator Premature Failure');
});

test('owner trees fail closed on absent and transmission-inapplicable issue evidence', () => {
  const base = {
    fulfillmentId:'dodge-challenger',
    vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},
    miles:65_000, records:[], recent:[], evaluatedAt:'2026-08-28T00:00:00.000Z', installedPartNumbers:[],
  };
  const absent = buildOwnerTwinValue({...base,transmission:'automatic',issues:[]});
  assert.equal(absent.trees.engine.nodes.radCore.knownIssue, undefined);
  assert.equal(absent.trees.trans.nodes.transFluid.knownIssue, undefined);

  const manual = buildOwnerTwinValue({...base,transmission:'manual',issues:[{id:'dodge-challenger-zf8-trans-2015',title:'ZF8 issue',severity:'Moderate',href:'/known-issues/dodge-challenger#dodge-challenger-zf8-trans-2015'}]});
  assert.equal(manual.trees.trans.nodes.transFluid.knownIssue, undefined);
  assert.equal(manual.issues.length, 0);
});
