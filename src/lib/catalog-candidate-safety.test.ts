import assert from 'node:assert/strict';
import test from 'node:test';
import { assertFreshCatalogRestrictionFields, hasUnrepresentableCatalogScope } from './catalog-candidate-safety';

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
