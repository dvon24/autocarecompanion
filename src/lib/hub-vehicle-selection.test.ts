import test from 'node:test';
import assert from 'node:assert/strict';
import { canResumeHubOwnerSession, savedVehicleHubHref, selectHubChatOwnerVehicle, selectOwnedHubVehicle } from './hub-vehicle-selection';

test('vehicle links carry exact owner row as well as year/model/trim', () => {
  assert.equal(savedVehicleHubHref({ id:'camaro-2', year:2019, make:'Chevrolet', model:'Camaro', trim:'ZL1 1LE' }), '/vehicle/2019-chevrolet-camaro-zl1-1le?vehicleId=camaro-2');
});
test('selection never attaches another car history to an invalid or ambiguous request', () => {
  const vehicles = [{ id:'one' }, { id:'two' }];
  assert.equal(selectOwnedHubVehicle(vehicles), null);
  assert.deepEqual(selectOwnedHubVehicle(vehicles, 'two'), vehicles[1]);
  assert.equal(selectOwnedHubVehicle(vehicles, 'someone-elses-car'), null);
  assert.equal(selectOwnedHubVehicle([vehicles[0]], 'missing'), null);
  assert.deepEqual(selectOwnedHubVehicle([vehicles[0]]), vehicles[0]);
});

test('lossy model and trim parsing uses the exact saved records page', () => {
  assert.equal(savedVehicleHubHref({ id:'prado', year:2019, make:'Toyota', model:'Land Cruiser Prado' }), '/garage/prado/records');
  assert.equal(savedVehicleHubHref({ id:'xt6', year:2020, make:'Cadillac', model:'XT6' }), '/vehicle/2020-cadillac-xt6?vehicleId=xt6');
});

test('chat owner binding validates ID plus full identity and refuses ambiguous fallback', () => {
  const identity = { year:2019, make:'Chevrolet', model:'Camaro', trim:'ZL1 1LE' };
  const cars = [{ ...identity, id:'first' }, { ...identity, id:'second' }, { ...identity, id:'ss', trim:'SS' }];
  assert.equal(selectHubChatOwnerVehicle(cars, identity), null);
  assert.equal(selectHubChatOwnerVehicle(cars, identity, 'second')?.id, 'second');
  assert.equal(selectHubChatOwnerVehicle(cars, identity, 'ss'), null);
  assert.equal(selectHubChatOwnerVehicle(cars, identity, 'foreign-id'), null);
  assert.equal(selectHubChatOwnerVehicle([{ ...identity, id:'base', trim:null }], { ...identity, trim:'Base' })?.id, 'base');
  assert.equal(canResumeHubOwnerSession('first', 'second'), false);
  assert.equal(canResumeHubOwnerSession(null, null), false);
  assert.equal(canResumeHubOwnerSession('second', 'second'), true);
});
