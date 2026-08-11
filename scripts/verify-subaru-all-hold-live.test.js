/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { reviewedArtifactFiles } = require('./build-subaru-make-reconciliation');
const { ALL_STATUS_MODELS, ARCHIVED_MODELS, PUBLISHED_MODELS } = require('./enrich-subaru-snapshot-provenance');
const { clone, FULL_RECORD_FIELDS } = require('./known-issue-adjudication-utils');
const {
  evaluateLiveInventory,
  loadValidatedLocalAuditState,
  validateLocalAuditState,
  verifySubaruAllHoldLive,
} = require('./verify-subaru-all-hold-live');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_subaru-deeplink-snapshot-2026-08-11.json'), 'utf8'));
const INVENTORY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_subaru-status-inventory-2026-08-11.json'), 'utf8'));
const RECONCILIATION = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/known-issue-subaru-make-reconciliation-2026-08-11.json'), 'utf8'));

function frozenRows() { return clone(SNAPSHOT.records); }

function rows() {
  const result = [];
  for (let index = 0; index < 7437; index += 1) result.push({ id: `other-published-${index}`, make: 'Other', model: 'Model', status: 'published' });
  result.push(...frozenRows());
  result.push(...clone(INVENTORY.rows.filter((row) => row.status === 'archived')));
  return result;
}

function reconciliation() { return clone(RECONCILIATION); }

test('all-hold inventory accepts exact counts and all 205 frozen full records', () => {
  const result = evaluateLiveInventory(rows(), reconciliation(), frozenRows());
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.deepEqual(result.statusCounts, { published: 205, archived: 12, other: 0 });
  assert.deepEqual(result.modelCounts, { allStatuses: ALL_STATUS_MODELS, published: PUBLISHED_MODELS, archived: ARCHIVED_MODELS });
  assert.deepEqual(result.fullRecordComparison, { fields: [...FULL_RECORD_FIELDS], matched: 205, drift: [], clickCountDeltas: [], missingPublishedIds: [], unexpectedPublishedIds: [], missingFullRecordIds: [], unexpectedFullRecordIds: [] });
});

test('Unicode-normalized Subaru variants are detected and raw-variant drift fails', () => {
  for (const make of ['SUBARU', 'S\u0301ubaru']) {
    const changed = rows();
    changed.find((row) => row.make === 'Subaru').make = make;
    const result = evaluateLiveInventory(changed, reconciliation(), frozenRows());
    assert.equal(result.normalizedSubaruCount, 217);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /raw make variants/);
  }
});

test('global, model, status, archive ID and local decision mutations fail', () => {
  const input = rows();
  assert.match(evaluateLiveInventory(input.slice(1), reconciliation(), frozenRows()).failures.join('\n'), /global published count/);
  const changedModel = rows(); changedModel.find((row) => row.make === 'Subaru' && row.status === 'published').model = 'Wrong';
  assert.match(evaluateLiveInventory(changedModel, reconciliation(), frozenRows()).failures.join('\n'), /model counts|full-record drift/);
  const republished = rows(); republished.find((row) => row.status === 'archived').status = 'published';
  assert.match(evaluateLiveInventory(republished, reconciliation(), frozenRows()).failures.join('\n'), /status inventory|global published count/);
  const wrongArchive = reconciliation(); wrongArchive.archivedInventory.ids.pop();
  assert.match(evaluateLiveInventory(input, wrongArchive, frozenRows()).failures.join('\n'), /archived IDs/);
  const wrongSummary = reconciliation(); wrongSummary.summary = { ...wrongSummary.summary, retained: 1, held: 204, archivedExcluded: 11, authorizedWriteCandidates: 1 };
  assert.match(evaluateLiveInventory(input, wrongSummary, frozenRows()).failures.join('\n'), /zero-write/);
});

const fullRecordMutations = [
  ['title', (row) => { row.title = `${row.title} mutated`; }],
  ['years', (row) => { row.years = [...row.years, 1900]; }],
  ['trims', (row) => { row.trims = [...row.trims, 'Mutated trim']; }],
  ['engines', (row) => { row.engines = [...row.engines, 'Mutated engine']; }],
  ['reportCount', (row) => { row.reportCount = Number(row.reportCount || 0) + 1; }],
  ['lastReportedByOwners', (row) => { row.lastReportedByOwners = Number(row.lastReportedByOwners || 0) + 1; }],
  ['fixParts', (row) => { row.fixParts = [...row.fixParts, { name: 'Mutated part' }]; }],
  ['communityRecommendations', (row) => { row.communityRecommendations = [...row.communityRecommendations, 'Mutated recommendation']; }],
];

for (const [field, mutate] of fullRecordMutations) {
  test(`live full-record comparison rejects ${field} drift`, () => {
    const changed = rows();
    const target = changed.find((row) => row.make === 'Subaru' && row.status === 'published');
    mutate(target);
    const result = evaluateLiveInventory(changed, reconciliation(), frozenRows());
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /full-record drift/);
    assert.deepEqual(result.fullRecordComparison.drift, [{ id: target.id, fields: [field] }]);
  });
}

test('live full-record comparison rejects malformed Prisma JSON container shapes', () => {
  const invalidContainers = [{ invalid: true }, null, 'invalid-container'];
  for (const field of ['citations', 'communityRecommendations', 'fixParts']) {
    for (const invalidContainer of invalidContainers) {
      const changed = rows();
      const target = changed.find((row) => row.make === 'Subaru' && row.status === 'published');
      target[field] = invalidContainer;
      const result = evaluateLiveInventory(changed, reconciliation(), frozenRows());
      assert.equal(result.passed, false, `${field} ${JSON.stringify(invalidContainer)} must fail`);
      assert.deepEqual(result.fullRecordComparison.drift, [{ id: target.id, fields: [field] }]);
    }
  }
});

test('clickCount-only recommendation telemetry passes content verification and is reported separately', () => {
  const changed = rows();
  const target = changed.find((row) => row.make === 'Subaru' && row.status === 'published' && row.communityRecommendations.length);
  target.communityRecommendations[0].clickCount = 7;
  const result = evaluateLiveInventory(changed, reconciliation(), frozenRows());
  assert.equal(result.passed, true);
  assert.deepEqual(result.fullRecordComparison.drift, []);
  assert.deepEqual(result.fullRecordComparison.clickCountDeltas, [{ id: target.id, recommendationIndex: 0, frozenClickCount: null, liveClickCount: 7 }]);
});

const recommendationContentMutations = [
  ['URL', (recommendations) => { recommendations[0].affiliateUrl = 'https://example.com/dp/direct-product'; }],
  ['content', (recommendations) => { recommendations[0].content = `${recommendations[0].content || ''} mutated`; }],
  ['add', (recommendations) => { recommendations.push({ type: 'tip', content: 'Added recommendation' }); }],
  ['remove', (recommendations) => { recommendations.splice(0, 1); }],
  ['order', (recommendations) => { recommendations.reverse(); }],
];

for (const [name, mutate] of recommendationContentMutations) {
  test(`recommendation ${name} changes remain blocking`, () => {
    const changed = rows();
    const target = changed.find((row) => row.make === 'Subaru' && row.status === 'published' && row.communityRecommendations.length >= 2);
    mutate(target.communityRecommendations);
    const result = evaluateLiveInventory(changed, reconciliation(), frozenRows());
    assert.equal(result.passed, false);
    assert.deepEqual(result.fullRecordComparison.drift, [{ id: target.id, fields: ['communityRecommendations'] }]);
  });
}

test('same-summary reconciliation tampering fails deterministic validation', () => {
  const deterministic = reconciliation();
  const tampered = reconciliation();
  tampered.rows[0].proposalSha256 = '0'.repeat(64);
  assert.deepEqual(tampered.summary, deterministic.summary);
  assert.throws(
    () => validateLocalAuditState(tampered, deterministic, frozenRows()),
    /make reconciliation does not match deterministic packet union/,
  );
});

test('committed local state validates against a fresh deterministic reconciliation', () => {
  const state = loadValidatedLocalAuditState();
  assert.equal(state.frozenRows.length, 205);
  assert.equal(state.reconciliation.summary.held, 205);
});

test('reviewed-tree provenance binds the canonical projection and ignores temporary Subaru capture candidates', () => {
  const files = reviewedArtifactFiles();
  assert.equal(files.includes('scripts/apply-known-issue-catalog-deeplinks.js'), true);
  assert.equal(files.includes('data/_subaru-deeplink-snapshot-refreeze-candidate-2026-08-11.json'), false);
});

test('production loader is deterministic across two consecutive runs and does not rewrite reconciliation', () => {
  const reconciliationFile = path.join(ROOT, 'data/known-issue-subaru-make-reconciliation-2026-08-11.json');
  const before = fs.readFileSync(reconciliationFile, 'utf8');
  const first = loadValidatedLocalAuditState();
  const between = fs.readFileSync(reconciliationFile, 'utf8');
  const second = loadValidatedLocalAuditState();
  const after = fs.readFileSync(reconciliationFile, 'utf8');
  assert.equal(between, before);
  assert.equal(after, before);
  assert.deepEqual(second, first);
});

test('live verifier validates local state first, selects every full-record field for exact frozen IDs, and uses no mutation query', async () => {
  const statements = [];
  const client = { async query(sql, values) { statements.push(sql); if (!/^SELECT/i.test(sql)) return { rows: [] }; const input = rows(); return { rows: values ? input.filter((row) => values[0].includes(row.id)) : input }; }, release() {} };
  const result = await verifySubaruAllHoldLive({ connect: async () => client });
  assert.equal(result.passed, true);
  assert.match(statements[0], /READ ONLY/);
  assert.match(statements[1], /^SELECT/i);
  assert.match(statements[2], /WHERE id = ANY/);
  for (const field of FULL_RECORD_FIELDS) assert.match(statements[2], new RegExp(`"${field}"`));
  assert.equal(statements[3], 'COMMIT');
  assert.doesNotMatch(statements.join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});
