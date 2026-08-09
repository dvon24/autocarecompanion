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
