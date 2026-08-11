/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  compareCatalogStatus,
  compareModelCounts,
  expectedMakeCounts,
  expectedModelCounts,
} = require('./verify-reviewed-make-production');

test('detects catalog-wide status-count loss outside the reviewed make', () => {
  assert.deepEqual(compareCatalogStatus(
    { published: 7642, archived: 464, pending_review: 3 },
    { published: 7641, archived: 465, pending_review: 3 },
  ), [
    { status: 'archived', expected: 464, actual: 465 },
    { status: 'published', expected: 7642, actual: 7641 },
  ]);
});

test('sums case-preserved make inventories across packets', () => {
  const counts = expectedMakeCounts({
    batchId: 'reviewed-ram',
    packets: [
      { summary: { frozen_make_counts: { RAM: 25, Ram: 36 } } },
      { summary: { frozen_make_counts: { RAM: 5 } } },
    ],
  });
  assert.deepEqual(Object.fromEntries(counts), { RAM: 30, Ram: 36 });
});

test('sums packet rows for each model', () => {
  const counts = expectedModelCounts({
    batchId: 'reviewed-test',
    packets: [
      { model: 'Accent', summary: { total: 3 } },
      { model: 'Tucson', summary: { total: 4 } },
      { model: 'Accent', summary: { total: 2 } },
    ],
  });
  assert.deepEqual(Object.fromEntries(counts), { Accent: 5, Tucson: 4 });
});

test('reports missing, extra, and reduced model inventories', () => {
  const expected = new Map([['Accent', 5], ['Tucson', 4]]);
  assert.deepEqual(compareModelCounts(expected, [
    { model: 'Accent', count: 4 },
    { model: 'Venue', count: 1 },
  ]), [
    { model: 'Accent', expected: 5, actual: 4 },
    { model: 'Tucson', expected: 4, actual: 0 },
    { model: 'Venue', expected: 0, actual: 1 },
  ]);
});

test('accepts exact per-model inventories', () => {
  const expected = new Map([['Accent', 5], ['Tucson', 4]]);
  assert.deepEqual(compareModelCounts(expected, [
    { model: 'Accent', count: 5 },
    { model: 'Tucson', count: 4 },
  ]), []);
});

test('published inventory comparison is independent of historical archive rows', () => {
  const expected = new Map([['Accent', 5]]);
  assert.deepEqual(compareModelCounts(expected, [{ model: 'Accent', count: 5 }]), []);
});
