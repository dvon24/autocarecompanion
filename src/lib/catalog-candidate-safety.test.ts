import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertFreshCatalogRestrictionFields,
  hasUnrepresentableCatalogScope,
  parseCatalogScope,
} from './catalog-candidate-safety';

test('stale candidates missing any restriction channel fail closed', () => {
  for (const missing of ['application', 'comment', 'location'] as const) {
    const candidate: Record<string, string> = { application: '', comment: '', location: '' };
    delete candidate[missing];
    assert.throws(() => assertFreshCatalogRestrictionFields(candidate, 'row-1'), new RegExp(`missing ${missing}`));
  }
});

test('any nonempty catalog restriction is unrepresentable and rejected', () => {
  for (const field of ['application', 'comment', 'location'] as const) {
    const candidate = { application: '', comment: '', location: '' };
    candidate[field] = 'restricted';
    assertFreshCatalogRestrictionFields(candidate);
    assert.equal(hasUnrepresentableCatalogScope(candidate), true, field);
  }
  assert.equal(hasUnrepresentableCatalogScope({ application: '', comment: '', location: '' }), false);
});

test('recognized application dimensions become enforceable scope', () => {
  const parsed = parseCatalogScope(
    { application: 'AWD; 6-Speed Automatic; Type S', comment: '', location: 'Front Left' },
    { trims: ['Base', 'Type S'] },
  );
  assert.deepEqual(parsed.drivetrains, ['AWD']);
  assert.deepEqual(parsed.transmissions, ['6-speed automatic']);
  assert.deepEqual(parsed.trims, ['Type S']);
  assert.deepEqual(parsed.positions, ['front-left', 'front', 'left']);
  assert.deepEqual(parsed.unparsedRestrictions, ['location: Front Left']);
});

test('unknown VIN, package and equipment restrictions remain explicit holds', () => {
  const parsed = parseCatalogScope({
    application: 'VIN 8; Technology Package',
    comment: 'Without oil level sensor',
    location: '',
  });
  assert.deepEqual(parsed.unparsedRestrictions, ['VIN 8 Technology Package', 'Without oil level sensor']);
});

test('empty catalog restriction fields are safe and unscoped', () => {
  const parsed = parseCatalogScope({ application: '', comment: '', location: '' });
  assert.deepEqual(parsed.unparsedRestrictions, []);
  assert.deepEqual(parsed.trims, []);
});

test('descriptive catalog comments remain review evidence but do not invent fitment scope', () => {
  const parsed = parseCatalogScope({
    application: '',
    comment: 'Includes: Water Pump, Timing Belt; Interference Engine Application',
    location: '',
  });
  assert.deepEqual(parsed.catalogNotes, ['Includes: Water Pump, Timing Belt; Interference Engine Application']);
  assert.deepEqual(parsed.unparsedRestrictions, []);
});

test('restriction-shaped catalog comments remain holds', () => {
  const parsed = parseCatalogScope({ application: '', comment: 'Without oil level sensor', location: '' });
  assert.deepEqual(parsed.unparsedRestrictions, ['Without oil level sensor']);
});
