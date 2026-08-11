/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { ALL_STATUS_MODELS, ARCHIVED_MODELS, PUBLISHED_MODELS } = require('./enrich-subaru-snapshot-provenance');
const { clone } = require('./known-issue-adjudication-utils');
const { evaluateLiveInventory, verifySubaruAllHoldLive } = require('./verify-subaru-all-hold-live');

function rows() {
  const result = [];
  let sequence = 0;
  for (let index = 0; index < 7437; index += 1) result.push({ id: `other-published-${sequence += 1}`, make: 'Other', model: 'Model', status: 'published' });
  for (const [model, count] of Object.entries(PUBLISHED_MODELS)) for (let index = 0; index < count; index += 1) result.push({ id: `subaru-published-${model}-${index}`, make: 'Subaru', model, status: 'published' });
  for (const [model, count] of Object.entries(ARCHIVED_MODELS)) for (let index = 0; index < count; index += 1) result.push({ id: `subaru-archived-${model}-${index}`, make: 'Subaru', model, status: 'archived' });
  return result;
}

function reconciliationFor(allRows = rows()) {
  return { summary: { retained: 0, held: 205, archivedExcluded: 12, authorizedWriteCandidates: 0 }, archivedInventory: { ids: allRows.filter((row) => row.make === 'Subaru' && row.status === 'archived').map((row) => row.id).sort(), republishAuthorized: false } };
}

test('all-hold inventory accepts exact 7,642 global, 205 published and 12 archived Subaru rows', () => {
  const input = rows();
  const result = evaluateLiveInventory(input, reconciliationFor(input));
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.deepEqual(result.statusCounts, { published: 205, archived: 12, other: 0 });
  assert.deepEqual(result.modelCounts, { allStatuses: ALL_STATUS_MODELS, published: PUBLISHED_MODELS, archived: ARCHIVED_MODELS });
});

test('Unicode-normalized Subaru variants are detected and raw-variant drift fails', () => {
  for (const make of ['SUBARU', 'S\u0301ubaru']) {
    const changed = rows();
    changed.find((row) => row.make === 'Subaru').make = make;
    const result = evaluateLiveInventory(changed, reconciliationFor(changed));
    assert.equal(result.normalizedSubaruCount, 217);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /raw make variants/);
  }
});

test('global, model, status, archive ID and local decision mutations fail', () => {
  const input = rows();
  assert.match(evaluateLiveInventory(input.slice(1), reconciliationFor(input.slice(1))).failures.join('\n'), /global published count/);
  const changedModel = rows(); changedModel.find((row) => row.make === 'Subaru' && row.status === 'published').model = 'Wrong';
  assert.match(evaluateLiveInventory(changedModel, reconciliationFor(changedModel)).failures.join('\n'), /model counts/);
  const republished = rows(); republished.find((row) => row.status === 'archived').status = 'published';
  assert.match(evaluateLiveInventory(republished, reconciliationFor(republished)).failures.join('\n'), /status inventory|global published count/);
  const wrongArchive = reconciliationFor(input); wrongArchive.archivedInventory.ids.pop();
  assert.match(evaluateLiveInventory(input, wrongArchive).failures.join('\n'), /archived IDs/);
  assert.match(evaluateLiveInventory(input, { ...reconciliationFor(input), summary: { retained: 1, held: 204, archivedExcluded: 11, authorizedWriteCandidates: 1 } }).failures.join('\n'), /zero-write/);
});

test('live verifier uses a read-only transaction and no mutation query', async () => {
  const statements = [];
  const input = rows();
  const client = { async query(sql) { statements.push(sql); return /SELECT/i.test(sql) ? { rows: input } : { rows: [] }; }, release() {} };
  const result = await verifySubaruAllHoldLive({ connect: async () => client }, clone(reconciliationFor(input)));
  assert.equal(result.passed, true);
  assert.match(statements[0], /READ ONLY/);
  assert.match(statements[1], /^SELECT/i);
  assert.equal(statements[2], 'COMMIT');
  assert.doesNotMatch(statements.join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});
