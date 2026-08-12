import assert from 'node:assert/strict';
import test from 'node:test';
import { visionVehicleRequestContext } from './vision-vehicle-context';

test('forwards exact selected fitment dimensions without inventing missing ones', () => {
  assert.deepEqual(visionVehicleRequestContext({
    year: '2012',
    make: 'Dodge',
    model: 'Challenger',
    trim: 'R/T',
    engine: '5.7L HEMI V8',
    drivetrain: 'RWD',
    transmission: '6-speed manual',
  }), {
    year: 2012,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'R/T',
    engine: '5.7L HEMI V8',
    drivetrain: 'RWD',
    transmission: '6-speed manual',
  });

  const ymmtOnly = visionVehicleRequestContext({ year: 2012, make: 'Dodge', model: 'Challenger', trim: 'R/T' });
  assert.equal(ymmtOnly?.engine, undefined);
  assert.equal(ymmtOnly?.drivetrain, undefined);
  assert.equal(ymmtOnly?.transmission, undefined);
});
