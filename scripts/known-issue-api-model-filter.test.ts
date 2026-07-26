import assert from 'node:assert/strict';
import test from 'node:test';

import { buildKnownIssueVehicleFilter } from '../src/lib/known-issue-query';

test('known-issues API uses an exact case-insensitive model boundary', () => {
  const filter = buildKnownIssueVehicleFilter(
    2022,
    'Audi',
    'e-tron GT',
    'published',
  );

  assert.deepEqual(filter, {
    make: { equals: 'Audi', mode: 'insensitive' },
    model: { equals: 'e-tron GT', mode: 'insensitive' },
    years: { has: 2022 },
    status: 'published',
  });
  assert.equal('contains' in filter.model, false);
});
