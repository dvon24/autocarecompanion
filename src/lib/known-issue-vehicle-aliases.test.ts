import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getKnownIssueVehicleCandidates,
  getSelectorVehicleForKnownIssue,
} from './known-issue-vehicle-aliases';
import { parseVehicleSlug, vehicleSlug } from './vehicle-slug';

test('maps selector catalog names to bounded KnownIssue article names', () => {
  assert.deepEqual(
    getKnownIssueVehicleCandidates({
      year: 2005,
      make: 'Ford',
      model: 'F-250 Super Duty',
    }),
    [
      { make: 'Ford', model: 'F-250 Super Duty' },
      { make: 'Ford', model: 'F-250' },
    ],
  );

  assert.deepEqual(
    getKnownIssueVehicleCandidates({
      year: 1998,
      make: 'Mazda',
      model: 'MX-5 Miata',
    }),
    [{ make: 'Mazda', model: 'MX-5 Miata' }],
  );
});

test('known-issue Hub links use and parse the canonical selector model', () => {
  assert.deepEqual(
    getSelectorVehicleForKnownIssue({
      year: 2006,
      make: 'Volkswagen',
      model: 'Beetle',
    }),
    { make: 'Volkswagen', model: 'New Beetle' },
  );
  assert.equal(
    vehicleSlug(2006, 'Volkswagen', 'Beetle'),
    '2006-volkswagen-new-beetle',
  );
  assert.deepEqual(parseVehicleSlug('2006-volkswagen-beetle'), {
    year: 2006,
    make: 'Volkswagen',
    model: 'New Beetle',
    trim: null,
  });
});
