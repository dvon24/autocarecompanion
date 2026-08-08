import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendParts, type PartCandidate } from './part-recommendation';

// The real 2008 Grand Caravan water-pump set, trimmed. Note the repeats — the
// catalog returns the same part once per product/engine slice.
const pumps: PartCandidate[] = [
  { supplier: 'Aisin', partNumber: 'WPCH-715V', partType: 'Engine Water Pump', engine: 'V6 3.8L' },
  { supplier: 'ASC', partNumber: 'WP-2156', partType: 'Engine Water Pump', engine: 'V6 3.8L' },
  { supplier: 'Dayco', partNumber: 'DP1440', partType: 'Engine Water Pump', engine: 'V6 3.8L' },
  { supplier: 'Gates', partNumber: '41202', partType: 'Engine Water Pump', engine: 'V6 3.8L' },
  { supplier: 'Aisin', partNumber: 'WPCH-715V', partType: 'Engine Water Pump', engine: 'V6 3.8L' },
  { supplier: 'Aisin', partNumber: 'WPCH-602V', partType: 'Engine Water Pump', engine: 'V6 3.3L' },
];

test('picks an OE-supplier primary and an alternate from a different supplier', () => {
  const { primary, alternate } = recommendParts(pumps, { engine: '3.8L V6' });
  assert.equal(primary?.supplier, 'Aisin');
  assert.equal(primary?.partNumber, 'WPCH-715V');
  assert.equal(primary?.tier, 'oe');
  assert.notEqual(alternate?.supplier, 'Aisin');
  assert.ok(alternate?.partNumber);
});

test('scopes to the engine so a 3.3L pump never lands on a 3.8L article', () => {
  const { ranked } = recommendParts(pumps, { engine: '3.8L V6' });
  assert.ok(!ranked.some((p) => p.partNumber === 'WPCH-602V'), '3.3L pump must be filtered out');
});

test('collapses the duplicates the catalog returns', () => {
  const { consideredCount } = recommendParts(pumps, { engine: '3.8L V6' });
  assert.equal(consideredCount, 4, 'four distinct 3.8L pumps, not five rows');
});

test('never fills both slots from one supplier', () => {
  const sameSupplier: PartCandidate[] = [
    { supplier: 'Gates', partNumber: '41202', partType: 'Engine Water Pump' },
    { supplier: 'Gates', partNumber: '43090', partType: 'Engine Water Pump' },
  ];
  const { primary, alternate } = recommendParts(sameSupplier);
  assert.equal(primary?.supplier, 'Gates');
  assert.equal(alternate, null, 'no second supplier exists, so no alternate — not a second Gates');
});

test('a supplier rule only applies to the part types it covers', () => {
  // Moog is an established chassis brand; it is not a water-pump authority.
  const chassis = recommendParts([{ supplier: 'Moog', partNumber: 'K700902', partType: 'Stabilizer Bar Link' }]);
  assert.equal(chassis.primary?.tier, 'established');
  const pump = recommendParts([{ supplier: 'Moog', partNumber: 'X', partType: 'Engine Water Pump' }]);
  assert.equal(pump.primary?.tier, 'unlisted');
});

test('unknown suppliers rank last but are still offered', () => {
  const { primary, alternate } = recommendParts([
    { supplier: 'Some Unknown Co', partNumber: 'X1', partType: 'Engine Water Pump' },
    { supplier: 'Gates', partNumber: '41202', partType: 'Engine Water Pump' },
  ]);
  assert.equal(primary?.supplier, 'Gates');
  assert.equal(alternate?.supplier, 'Some Unknown Co');
  assert.equal(alternate?.tier, 'unlisted');
});

test('ordering is stable regardless of the order the catalog returned them', () => {
  const forward = recommendParts(pumps, { engine: '3.8L V6' }).ranked.map((p) => p.partNumber);
  const backward = recommendParts([...pumps].reverse(), { engine: '3.8L V6' }).ranked.map((p) => p.partNumber);
  assert.deepEqual(forward, backward);
});

test('candidates the catalog left unscoped are kept, not silently dropped', () => {
  const { consideredCount } = recommendParts(
    [{ supplier: 'Gates', partNumber: '41202', partType: 'Engine Water Pump' }],
    { engine: '3.8L V6' },
  );
  assert.equal(consideredCount, 1);
});

test('returns nulls rather than throwing when nothing fits', () => {
  const { primary, alternate, consideredCount } = recommendParts([], { engine: '3.8L V6' });
  assert.equal(primary, null);
  assert.equal(alternate, null);
  assert.equal(consideredCount, 0);
});
