import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyVehicle } from '../src/lib/reservation-verify';

test('resolves a real vehicle and normalizes catalog casing', () => {
  const result = verifyVehicle({ year: 2019, make: 'chevrolet', model: 'camaro', trim: 'zl1' });
  assert.equal(result.vehicleVerified, true);
  assert.equal(result.trimVerified, true);
  assert.deepEqual(
    { year: result.year, make: result.make, model: result.model, trim: result.trim },
    { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1' },
  );
});

test('keeps an owner-entered trim without claiming catalog verification', () => {
  const result = verifyVehicle({ year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1 1LE' });
  assert.equal(result.vehicleVerified, true);
  assert.equal(result.trimVerified, false);
  assert.equal(result.trim, 'ZL1 1LE');
});

test('rejects invented or incomplete YMM combinations', () => {
  for (const claimed of [
    { year: 2019, make: 'Chevorlet', model: 'Camaro', trim: null },
    { year: 2019, make: 'Chevrolet', model: 'Not A Camaro', trim: null },
    { year: 1900, make: 'Chevrolet', model: 'Camaro', trim: null },
    { year: null, make: 'Chevrolet', model: 'Camaro', trim: null },
  ]) {
    assert.deepEqual(verifyVehicle(claimed), {
      year: null,
      make: null,
      model: null,
      trim: null,
      vehicleVerified: false,
      trimVerified: false,
    });
  }
});
