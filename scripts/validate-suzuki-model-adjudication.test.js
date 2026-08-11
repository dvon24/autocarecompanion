/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { buildForModel, buildPacket } = require('./build-suzuki-model-adjudication');
const { clone, diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { duplicateClusters, getContract, reviewReasons, supportedModels } = require('./suzuki-case-inventory-contract');
const { validatePacket } = require('./validate-suzuki-model-adjudication');
const { EXPECTED_SUMMARY, buildRoutingReport, routeClassification, validateRoutingReport } = require('./build-suzuki-routing-report');
const { assertReconciliationWritable, buildReconciliation, reviewedFiles, writeValidatedReconciliation } = require('./build-suzuki-make-reconciliation');
const { validateReconciliation } = require('./validate-suzuki-make-reconciliation');
const { assertSuzukiEvidence } = require('./validate-suzuki-primary-evidence');
const { validateReviewLedger } = require('./suzuki-review-ledger');

const EXPECTED = { Across: 1, Alto: 1, 'Grand Vitara': 7, Jimny: 3, Swift: 3, SX4: 1, Vitara: 2 };

for (const model of supportedModels) {
  test(`${model} packet is a deterministic complete hold`, () => {
    const { contract, packet, snapshot } = buildForModel(model);
    assert.deepEqual(validatePacket(contract, packet, snapshot), []);
    assert.equal(packet.summary.total, EXPECTED[model]);
    assert.equal(packet.summary.retain_indexed_identity_and_accuracy_cleanup, 0);
    assert.equal(packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy, EXPECTED[model]);
    assert.equal(packet.summary.pages_preserved_published, EXPECTED[model]);
    assert.equal(packet.applicationGate.status, 'blocked');
  });
}

test('all 18 Suzuki rows are byte-identical published holds', () => {
  const rows = supportedModels.flatMap((model) => buildForModel(model).packet.rows);
  assert.equal(rows.length, 18);
  for (const row of rows) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
    assert.equal(row.proposal.status, 'published');
    assert.equal(row.proposal.reportCount, row.before.reportCount);
    assert.equal(row.proposal.lastReportedByOwners, row.before.lastReportedByOwners);
    assert.deepEqual(row.proposal.fixParts, row.before.fixParts);
    assert.deepEqual(row.proposal.communityRecommendations, row.before.communityRecommendations);
  }
});

test('case inventory accounts for all rows and preserves both overlap families', () => {
  assert.equal(Object.keys(reviewReasons).length, 18);
  assert.equal(duplicateClusters.length, 2);
  assert.deepEqual(duplicateClusters.map((cluster) => cluster.ids.length), [2, 2]);
  const allIds = new Set(supportedModels.flatMap((model) => getContract(model).allIds));
  assert.equal(allIds.size, 18);
  for (const cluster of duplicateClusters) for (const id of cluster.ids) assert.equal(allIds.has(id), true);
});

test('evidence inventory proves no retained rewrite or exact conflict capture was required', () => {
  const evidence = assertSuzukiEvidence();
  assert.equal(evidence.writeAuthorization, false);
  assert.deepEqual(evidence.sources, []);
  assert.match(evidence.capturePolicy, /retained rewrite or exact primary-source conflict/i);
});

test('snapshot contract rejects case-variant inventory and frozen field mutation', () => {
  const { contract, snapshot } = buildForModel('Across');
  const caseVariant = clone(snapshot);
  caseVariant.records.push({ ...clone(snapshot.records[0]), id: 'suzuki-case-variant-test', make: 'SUZUKI' });
  assert.throws(() => buildPacket(contract, caseVariant), /Unicode-normalized row count|make variants/);
  const titleMutation = clone(snapshot);
  titleMutation.records[0].title += ' changed';
  assert.throws(() => buildPacket(contract, titleMutation), /frozen title hash drifted/);
});

function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}

test('validator rejects body mutation to a held row', () => {
  const { contract, packet, snapshot } = buildForModel('Across');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' changed';
  rehash(changed.rows[0]);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|deterministic/);
});

test('validator rejects title, status, owner telemetry and commerce mutation', () => {
  const { contract, packet, snapshot } = buildForModel('Grand Vitara');
  const changed = clone(packet);
  const row = changed.rows[0];
  row.proposal.title += ' changed';
  row.proposal.status = 'archived';
  row.proposal.reportCount = 9;
  row.proposal.lastReportedByOwners = '2026-08-11';
  row.proposal.fixParts.push({ component: 'fake' });
  rehash(row);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|page became unpublished|commerce drifted|owner telemetry drifted|deterministic/);
});

test('routing report inventories every per-year/selectable-trim route', () => {
  const report = buildRoutingReport();
  assert.deepEqual(validateRoutingReport(report), []);
  assert.deepEqual(report.summary, EXPECTED_SUMMARY);
  assert.equal(report.findings.flatMap((row) => row.substringOnlyRoutes).length, 15);
  assert.equal(report.summary.metadataWrites, 0);
});

test('applicability prose fails open while exact and substring routes remain distinct', () => {
  assert.equal(routeClassification(['Vehicles built before 2020'], 'Active'), 'applicability-prose-fail-open');
  assert.equal(routeClassification(['Sport'], 'Sport'), 'exact-trim-route');
  assert.equal(routeClassification(['Sport'], 'Sport Hybrid'), 'substring-only-route');
  assert.equal(routeClassification(['Sport'], 'Active'), 'hidden-route');
});

test('routing validator rejects a silently staged metadata mutation', () => {
  const changed = clone(buildRoutingReport());
  changed.findings[0].metadataWriteAuthorized = true;
  assert.match(validateRoutingReport(changed).join('\n'), /metadata write|deterministic/);
});

test('make reconciliation covers all seven models and 18 byte-identical holds', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, { models: 7, rows: 18, retained: 0, held: 18, pagesPreservedPublished: 18, authorizedWriteCandidates: 0 });
  assert.deepEqual(report.snapshot.frozenMakeValues, ['Suzuki']);
  assert.deepEqual(report.snapshot.frozenMakeCounts, { Suzuki: 18 });
  assert.equal(report.sourceControl.reviewedTree.files.length, reviewedFiles().length);
});

test('independent review ledger validator rejects missing decision and authorized metadata', () => {
  const { snapshot } = buildForModel('Across');
  const frozen = snapshot.records;
  const ledger = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/known-issue-suzuki-review-ledger-2026-08-11.json'), 'utf8'));
  const missing = clone(ledger); missing.entries.pop();
  assert.match(validateReviewLedger(missing, frozen).join('\n'), /coverage/);
  const authorized = clone(ledger); authorized.entries[0].metadataWriteAuthorized = true;
  assert.match(validateReviewLedger(authorized, frozen).join('\n'), /authorizes a write/);
  const wrongModel = clone(ledger); wrongModel.entries[0].model = 'Wrong';
  assert.match(validateReviewLedger(wrongModel, frozen).join('\n'), /case contract/);
  const cited = ledger.entries.findIndex((entry) => entry.existingSourcesInspected.length > 0);
  const missingCitation = clone(ledger); missingCitation.entries[cited].existingSourcesInspected = [];
  assert.match(validateReviewLedger(missingCitation, frozen).join('\n'), /citation\/cluster inventory/);
});

test('reconciliation refuses invalid routing before local write callback', () => {
  const changed = clone(buildReconciliation());
  changed.routing.validationErrors = 1;
  let writes = 0;
  assert.throws(() => writeValidatedReconciliation(changed, () => { writes += 1; }), /Refusing to write/);
  assert.equal(writes, 0);
  assert.throws(() => assertReconciliationWritable(changed), /routing validation failed/);
});

test('reconciliation refuses same-total gate, provenance and row-payload tampering before local write callback', () => {
  const mutations = [
    ['application gate', (report) => { report.applicationGate.status = 'approved'; }],
    ['source-control baseline', (report) => { report.sourceControl.baselineCommit = '0'.repeat(40); }],
    ['reviewed-tree provenance', (report) => { report.sourceControl.reviewedTree.sha256 = '0'.repeat(64); }],
    ['row changed-fields inventory', (report) => { report.rows[0].changedFields = ['description']; }],
    ['row payload hash', (report) => { report.rows[0].proposalSha256 = '0'.repeat(64); }],
  ];

  for (const [label, mutate] of mutations) {
    const changed = clone(buildReconciliation());
    mutate(changed);
    let writes = 0;
    assert.throws(
      () => writeValidatedReconciliation(changed, () => { writes += 1; }),
      /fresh deterministic reconciliation/,
      label,
    );
    assert.equal(writes, 0, label);
  }
});
