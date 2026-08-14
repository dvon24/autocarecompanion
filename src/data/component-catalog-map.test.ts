import assert from 'node:assert/strict';
import test from 'node:test';
import { mapComponent } from './component-catalog-map';

// Every case below is a real article title that produced a WRONG part before the
// veto existed. They are kept as tests so the mapping cannot regress into
// recommending a battery for an infotainment reboot again.
test('a title that names a component but describes another repair is vetoed', () => {
  assert.equal(mapComponent('SYNC 4 Infotainment Freezing')?.partTypeMatch, undefined);
  assert.equal(mapComponent('Infotainment Reboot')?.partTypeMatch, undefined);
});

test('battery DRAIN is a symptom, not a battery job', () => {
  assert.notEqual(mapComponent('Battery Drain and No Start')?.partTypeMatch, 'battery');
});

test('a hybrid pack is not the 12V battery this category sells', () => {
  assert.notEqual(mapComponent('Hybrid Battery Degradation')?.partTypeMatch, 'battery');
});

test('a door-ajar switch causing battery drain maps to the switch, not the battery', () => {
  const m = mapComponent('Door Ajar Switch Sticks, Dome Lights Stay On, Battery Drain');
  assert.notEqual(m?.partTypeMatch, 'battery');
});

test('an actual battery failure still maps to a battery', () => {
  assert.equal(mapComponent('12V Battery Premature Failure')?.partTypeMatch, 'battery');
});

test('unrelated mappings are unaffected by the veto', () => {
  assert.equal(mapComponent('Head Gasket Failure')?.partTypeMatch, 'head gasket');
  assert.equal(mapComponent('Water Pump Leak')?.partTypeMatch, 'water pump');
});

test('radiator support and cooling fan do not collapse into a radiator', () => {
  assert.equal(mapComponent('Radiator Support Rust')?.partTypeMatch, 'radiator support');
  assert.equal(mapComponent('Cooling Fan Failure')?.partTypeMatch, 'fan');
  assert.equal(mapComponent('Radiator Leak')?.partTypeMatch, 'radiator');
  assert.equal(mapComponent('Radiator Hose Leak')?.partTypeMatch, 'hose');
});

test('a DPF article maps to the filter, not an exhaust temperature sensor', () => {
  assert.equal(mapComponent('Diesel Particulate Filter (DPF) Clogging')?.partTypeMatch, 'particulate filter');
  assert.equal(mapComponent('Exhaust Gas Temperature Sensor Failure')?.partTypeMatch, 'temperature sensor');
});

test('a generic EVAP leak does not guess that the purge valve is the cause', () => {
  assert.equal(mapComponent('EVAP System Small Leak (P0456)'), null);
  assert.equal(mapComponent('EVAP Purge Solenoid Failure')?.partTypeMatch, 'vapor canister purge valve');
});

// The title is authoritative: matching title+solution as one blob once made a
// head-gasket article resolve to a thermostat mentioned in its solution text.
test('the more specific rule wins over the generic one', () => {
  assert.equal(mapComponent('Fuel Pump Failure')?.partTypeMatch, 'fuel pump');
  assert.equal(mapComponent('Power Steering Pump Whine')?.partTypeMatch, 'power steering pump');
});

// Real titles that produced the wrong part before the subject/disclaimer rules.
test('a component the title says it is NOT does not get recommended', () => {
  const m = mapComponent('4.0L Oil Filter Adapter Housing O-Ring Leak (Frequently Misdiagnosed as Rear Main Seal)');
  assert.notEqual(m?.partTypeMatch, 'seal', 'must not propose the part the article rules out');
});

test('local negation cannot become a component recommendation', () => {
  for (const title of [
    'Coolant leak — not the water pump',
    'Coolant leak is not the water pump',
    'Coolant leak, not caused by the water pump',
    'Coolant leak not due to the water pump',
    'Coolant leak is not from the water pump',
    'Coolant leak, not a failed water pump',
    'Coolant leak — water pump ruled out',
    'Coolant leak — water pump is not the cause',
    'Coolant leak — water pump not at fault',
    'Coolant leak — water pump was ruled out',
    'Coolant leak — water pump was not the cause',
    'Coolant leak — water pump has been ruled out',
    "Coolant leak isn't the water pump",
    "Coolant leak — water pump isn't the cause",
    "Coolant leak — water pump wasn't at fault",
  ]) {
    assert.notEqual(mapComponent(title)?.partTypeMatch, 'water pump', title);
  }
});

test('the leading clause wins over a parenthetical aside', () => {
  const m = mapComponent('Front Wheel Hub/Bearing Assembly Failure (Integrated ABS Sensor) — Grinding & ABS Light');
  // The hub is the subject; "Integrated ABS Sensor" is qualification. Either the
  // hub or the bearing rule is a correct answer — the ABS sensor is not.
  assert.ok(['hub', 'wheel bearing'].includes(m?.partTypeMatch || ''), `got "${m?.partTypeMatch}"`);
  assert.notEqual(m?.partTypeMatch, 'speed sensor');
});

test('a title naming two valid components still maps to one of them', () => {
  const m = mapComponent('2007-2013 A4 2.0T Coolant Leak at Pump or Thermostat - TSB 2061604/5');
  assert.ok(['water pump', 'thermostat'].includes(m?.partTypeMatch || ''), 'either is defensible here');
});

// Three of the highest-traffic pages in the catalog resolved an A/C compressor
// clutch to a TRANSMISSION clutch kit before this veto.
test('an A/C compressor clutch is not a transmission clutch', () => {
  for (const t of ['A/C Compressor Clutch Failure', 'A/C Compressor and Clutch Failure',
                   'A/C Compressor Clutch Failure (9th Gen 2012-2015)']) {
    assert.notEqual(mapComponent(t)?.partTypeMatch, 'clutch', t);
  }
});

test('a real clutch article still maps to a clutch', () => {
  assert.equal(mapComponent('Manual Transmission Clutch Judder')?.partTypeMatch, 'clutch');
});

test('Acura repair components map to catalog families without a generic fallback', () => {
  assert.equal(mapComponent('crank seals')?.partTypeMatch, 'seal');
  assert.equal(mapComponent('O-rings')?.partTypeMatch, 'o-ring');
  assert.equal(mapComponent('ignition wires')?.partTypeMatch, 'spark plug wire');
  assert.equal(mapComponent('main relay')?.partTypeMatch, 'relay');
  assert.equal(mapComponent('transmission valve body')?.partTypeMatch, 'solenoid');
  assert.equal(mapComponent('aftermarket transmission cooler')?.partTypeMatch, 'transmission oil cooler');
  assert.equal(mapComponent('power steering return hose')?.partTypeMatch, 'hose');
  assert.equal(mapComponent('A/C expansion valve')?.partTypeMatch, 'expansion valve');
  assert.equal(mapComponent('balance shaft belt')?.partTypeMatch, 'balance shaft belt');
  assert.equal(mapComponent('idler pulleys kit')?.partTypeMatch, 'tensioner');
  assert.equal(mapComponent('head gaskets')?.partTypeMatch, 'head gasket');
  assert.equal(mapComponent('ignition switch electrical portion')?.partTypeMatch, 'ignition switch');
  assert.equal(mapComponent('hydraulic motor mounts')?.partTypeMatch, 'mount');
  assert.equal(mapComponent('1991-1999 NA1 modulator')?.partTypeMatch, 'abs modulator');
  assert.equal(mapComponent('piston rings')?.partTypeMatch, 'piston ring');
  assert.equal(mapComponent('quality pads')?.partTypeMatch, 'brake pad');
  assert.equal(mapComponent('full compressor')?.partTypeMatch, 'compressor');
});

test('Challenger suspension phrases map exactly while a complete driveshaft fails closed', () => {
  assert.equal(mapComponent('front sway-bar end links')?.partTypeMatch, 'stabilizer bar link');
  assert.equal(mapComponent('outer tie-rod ends')?.partTypeMatch, 'tie rod');
  assert.equal(mapComponent('front control-arm bushings')?.partTypeMatch, 'control arm bushing');
  assert.equal(mapComponent('ball joints')?.partTypeMatch, 'ball joint');
  assert.equal(mapComponent('aftermarket one-piece aluminum driveshaft'), null);
});
