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
