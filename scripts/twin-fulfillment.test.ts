import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTwinDefinition,
  getLiveTwinForVehicle,
  twinMatchesVehicle,
} from '../src/lib/twin-fulfillment';

test('assigns the current twin only to its exact reviewed YMMT', () => {
  const twin = getTwinDefinition('dodge-challenger');
  assert.ok(twin);
  assert.equal(twinMatchesVehicle(twin, {
    year: 2015,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'SRT 392',
  }), true);
  assert.equal(twinMatchesVehicle(twin, {
    year: 2016,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'SRT 392',
  }), false);
  assert.equal(twinMatchesVehicle(twin, {
    year: 2015,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'R/T',
  }), false);
});

test('normalizes casing but never substitutes another model', () => {
  assert.equal(getLiveTwinForVehicle({
    year: 2015,
    make: ' dodge ',
    model: 'CHALLENGER',
    trim: 'srt 392',
  })?.id, 'dodge-challenger');
  assert.equal(getLiveTwinForVehicle({
    year: 2015,
    make: 'Lincoln',
    model: 'Nautilus',
    trim: 'Reserve',
  }), null);
});
