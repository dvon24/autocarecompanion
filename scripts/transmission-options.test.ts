import assert from 'node:assert/strict';
import test from 'node:test';
import { getTransmissionOptions } from '../src/lib/transmission-options';

test('asks only reviewed dual-transmission YMMTs', () => {
  assert.deepEqual(
    getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' }).map((o) => o.value),
    ['automatic', 'manual'],
  );
  assert.deepEqual(
    getTransmissionOptions({ year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1' }).map((o) => o.value),
    ['automatic', 'manual'],
  );
});

test('does not burden automatic-only, incomplete, or unreviewed vehicles', () => {
  assert.deepEqual(getTransmissionOptions({ year: 2019, make: 'Lincoln', model: 'Nautilus', trim: 'Reserve' }), []);
  assert.deepEqual(getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SXT' }), []);
  assert.deepEqual(getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: null }), []);
});
