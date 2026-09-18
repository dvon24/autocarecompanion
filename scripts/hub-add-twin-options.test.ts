import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getHubAddTwinOptions, hubAddTwinFields } from '../src/lib/hub-add-twin-options';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { hubVehiclePayload } from '../src/components/twin/hub/hub-add-vehicle';

test('all eight reviewed builds are selectable; six require separate explicit equipment confirmation', () => {
  const options = getHubAddTwinOptions();
  assert.equal(options.length, 8);
  assert.deepEqual(options.filter((option) => option.ownerReady).map((option) => option.id), ['challenger','nautilus','murano','xt6','kicks','mdx','aviator','camaro']);
  assert.equal(options.filter((option) => option.equipment).length, 6);
  for (const option of options) {
    assert(option.artwork && existsSync(resolve('public', option.artwork.slice(1))), `${option.id} real artwork`);
    const source = VEHICLE_TWIN_CATALOG.find((twin) => twin.id === option.id)!;
    assert.deepEqual(option.identity, { year: source.identity.year, make: source.identity.make, model: source.identity.model, trim: source.identity.trim });
  }
});

test('no readiness prerequisite can be inferred from another flag', () => {
  const ready = VEHICLE_TWIN_CATALOG[0];
  for (const blocked of [
    { ...ready, ownerReady: false }, { ...ready, fulfillmentId: null },
    { ...ready, treeStatus: 'structure-only' as const }, { ...ready, treeResolver: '' },
    { ...ready, art: { ...ready.art, available: false } }, { ...ready, art: { ...ready.art, base: '' } },
  ]) assert.equal(getHubAddTwinOptions([blocked])[0].ownerReady, false);
});

test('only exact eligible identities can become payloads; sample state is never imported', () => {
  for (const option of getHubAddTwinOptions()) {
    if (!option.ownerReady) {
      assert.throws(() => hubAddTwinFields(option.id, { vin: '', currentMileage: '' }), /Choose an available twin/);
      continue;
    }
    const equipment = option.equipment ? {reviewedEquipmentId:option.equipment.id} : {};
    if(option.equipment)assert.throws(()=>hubVehiclePayload(hubAddTwinFields(option.id,{vin:'',currentMileage:''})),/Confirm/);
    assert.throws(()=>hubVehiclePayload(hubAddTwinFields(option.id, { vin: '', currentMileage: '', ...equipment })),/mileage/);
    const transmission=option.transmissionOptions.length?{transmission:option.transmissionOptions[0].value}:{};
    if(option.transmissionOptions.length)assert.throws(()=>hubVehiclePayload(hubAddTwinFields(option.id,{vin:'',currentMileage:'12345',...equipment})),/transmission/);
    const filled = hubVehiclePayload(hubAddTwinFields(option.id, { vin: '1gkknxlsxlz100001', currentMileage: '12345', ...equipment,...transmission }));
    assert.deepEqual(filled, { ...option.identity, ...equipment,...transmission, vin: '1GKKNXLSXLZ100001', currentMileage: 12345, hubSetup:true,isPrimary: false });
  }
  for (const id of ['', '2020 Honda Civic', 'CAMARO', 'camaro-other-trim']) {
    assert.throws(() => hubAddTwinFields(id, { vin: '', currentMileage: '' }), /Choose an available twin/);
  }
});
