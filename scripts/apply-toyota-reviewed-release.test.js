/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildManifest,
  manifestHash,
  validateManifest,
} = require('./build-toyota-reviewed-release-manifest');
const {
  evaluateRows,
  inventoryErrors,
  run,
  updateStatement,
} = require('./apply-toyota-reviewed-release');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rowsFor(manifest, state) {
  return manifest.issues.map((issue) => ({ id: issue.id, ...clone(issue[state]) }));
}

test('deterministic manifest freezes exactly the 32 independently reviewed republishes', () => {
  const manifest = buildManifest();
  assert.equal(manifest.summary.reviewedRows, 32);
  assert.equal(manifest.summary.archivedToPublished, 32);
  assert.equal(manifest.summary.titleRestorations, 32);
  assert.equal(manifest.summary.commerceRows, 0);
  assert.deepEqual(manifest.inventory.before, { globalPublished: 7642, toyotaPublished: 547, toyotaArchived: 107 });
  assert.deepEqual(manifest.inventory.after, { globalPublished: 7674, toyotaPublished: 579, toyotaArchived: 75 });
  assert.equal(new Set(manifest.issues.map((issue) => issue.id)).size, 32);
  assert.equal(manifest.manifestHash, manifestHash(manifest));
  assert.deepEqual(validateManifest(manifest), []);
});

test('manifest validation rejects same-count source, before, patch, and after tampering', () => {
  const mutations = [
    (manifest) => { manifest.source.reviewedIdSetSha256 = '0'.repeat(64); },
    (manifest) => { manifest.issues[0].before.title += ' forged'; },
    (manifest) => { manifest.issues[0].identityReview = 'different but same count'; },
    (manifest) => { manifest.issues[0].patch.title += ' forged'; },
    (manifest) => { manifest.issues[0].after.title += ' forged'; },
    (manifest) => { manifest.inventory.after.globalPublished += 1; },
  ];
  for (const mutate of mutations) {
    const manifest = clone(buildManifest());
    mutate(manifest);
    manifest.manifestHash = manifestHash(manifest);
    assert.notDeepEqual(validateManifest(manifest), []);
  }
});

test('row evaluation accepts only a uniform exact before or exact after state', () => {
  const manifest = buildManifest();
  assert.equal(evaluateRows(rowsFor(manifest, 'before'), manifest).state, 'before');
  assert.equal(evaluateRows(rowsFor(manifest, 'after'), manifest).state, 'after');
  const mixed = rowsFor(manifest, 'before');
  mixed[0] = { id: manifest.issues[0].id, ...clone(manifest.issues[0].after) };
  assert.equal(evaluateRows(mixed, manifest).state, 'drift');
  const contentDrift = rowsFor(manifest, 'before');
  contentDrift[0].solution += ' forged';
  assert.equal(evaluateRows(contentDrift, manifest).state, 'drift');
  assert.equal(evaluateRows(rowsFor(manifest, 'before').slice(1), manifest).state, 'drift');
});

test('update statement is parameterized and cannot change make, model, or category', () => {
  const manifest = buildManifest();
  const statement = updateStatement(manifest.issues[0]);
  assert.match(statement.text, /^UPDATE "KnownIssue" SET /);
  assert.match(statement.text, /"status"=/);
  assert.doesNotMatch(statement.text, /"make"=|"model"=|"category"=/);
  assert.equal(statement.values[0], manifest.issues[0].id);
  assert.equal(statement.values.length, Object.keys(manifest.issues[0].patch).length + 1);
  assert.equal(statement.text.includes(manifest.issues[0].patch.title), false);
});

test('inventory gate rejects any catalog-wide or Toyota status drift', () => {
  const expected = { globalPublished: 7642, toyotaPublished: 547, toyotaArchived: 107 };
  assert.deepEqual(inventoryErrors(expected, expected), []);
  assert.equal(inventoryErrors({ ...expected, globalPublished: 7641 }, expected).length, 1);
  assert.equal(inventoryErrors({ ...expected, toyotaPublished: 546 }, expected).length, 1);
  assert.equal(inventoryErrors({ ...expected, toyotaArchived: 106 }, expected).length, 1);
});

test('apply refuses to connect unless the exact batch confirmation is supplied', async () => {
  await assert.rejects(
    run({ mode: 'apply', confirmBatch: 'wrong-batch' }),
    /Apply requires --confirm-batch toyota-reviewed-rewrites-2026-08-11/,
  );
});
