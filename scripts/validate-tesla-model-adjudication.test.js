/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { buildForModel, buildPacket } = require('./build-tesla-model-adjudication');
const { clone, diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { duplicateClusters, getContract, supportedModels } = require('./tesla-model-adjudication-contracts');
const { validatePacket } = require('./validate-tesla-model-adjudication');
const { buildRoutingReport, routeClassification, validateRoutingReport } = require('./build-tesla-routing-report');
const { assertReconciliationWritable, buildReconciliation, writeValidatedReconciliation } = require('./build-tesla-make-reconciliation');
const { validateReconciliation } = require('./validate-tesla-make-reconciliation');
const { assertTeslaEvidence } = require('./validate-tesla-primary-evidence');
const { assertTeslaProvenance } = require('./tesla-snapshot-contract');
const { validateReviewLedger } = require('./tesla-review-ledger');

const EXPECTED = { Cybertruck: 1, 'Model 3': 15, 'Model S': 16, 'Model X': 12, 'Model Y': 15, Semi: 5 };

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

test('all 64 Tesla rows are byte-identical published holds with commerce preserved', () => {
  const rows = supportedModels.flatMap((model) => buildForModel(model).packet.rows);
  assert.equal(rows.length, 64);
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

test('eight duplicate and overlap clusters remain separately indexed', () => {
  assert.equal(duplicateClusters.length, 8);
  const allIds = new Set(supportedModels.flatMap((model) => getContract(model).allIds));
  for (const cluster of duplicateClusters) for (const id of cluster.ids) assert.equal(allIds.has(id), true, `${cluster.key}/${id}`);
  assert.deepEqual(duplicateClusters.find((cluster) => cluster.key === 'model-s-x-seatbelt-anchor').ids, [
    'tesla-model-s-first-row-seat-belt-not-connected-to-pretensioner-anchor',
    'tesla-model-x-first-row-seat-belt-anchor-may-detach',
    'tesla-model-y-seatbelt-anchor-recall',
  ]);
});

test('evidence inventory is explicitly empty and provenance is independently pinned', () => {
  assert.deepEqual(assertTeslaEvidence().sources, []);
  const provenance = assertTeslaProvenance();
  assert.equal(provenance.snapshotHash, '1629ca074d3017eac0158fb8c47e69085161ecca2658ca93f6d443745de8584d');
  assert.equal(provenance.independentInventory.normalizedTeslaRows, 64);
  const changed = clone(provenance); changed.independentInventory.globalPublishedCount -= 1;
  assert.throws(() => assertTeslaProvenance(changed), /independent inventory provenance drifted/);
});

test('snapshot contract rejects case variants, missing or duplicate IDs, and field mutation', () => {
  const { contract, snapshot } = buildForModel('Model Y');
  const caseVariant = clone(snapshot);
  caseVariant.records.push({ ...clone(snapshot.records[0]), id: 'tesla-case-variant-test', make: 'TESLA' });
  assert.throws(() => buildPacket(contract, caseVariant), /row count|Unicode-normalized row count|make variants/);
  const missing = clone(snapshot); missing.records.pop();
  assert.throws(() => buildPacket(contract, missing), /row count/);
  const duplicate = clone(snapshot); duplicate.records[1].id = duplicate.records[0].id;
  assert.throws(() => buildPacket(contract, duplicate), /duplicate or missing id/);
  const titleMutation = clone(snapshot); titleMutation.records[0].title += ' changed';
  assert.throws(() => buildPacket(contract, titleMutation), /frozen title hash drifted/);
});

function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}

test('validator rejects body mutation to a held row', () => {
  const { contract, packet, snapshot } = buildForModel('Cybertruck');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' changed';
  rehash(changed.rows[0]);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|deterministic/);
});

test('validator rejects title, status, owner telemetry and commerce mutation', () => {
  const { contract, packet, snapshot } = buildForModel('Model 3');
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

test('routing report inventories every per-year selectable-trim route', () => {
  const report = buildRoutingReport();
  assert.deepEqual(validateRoutingReport(report), []);
  assert.deepEqual(report.summary, {
    rows: 64,
    rowsWithFrozenTrimGate: 54,
    issueYearSelectableTrimRoutes: 4798,
    exactTrimRoutes: 1784,
    substringOnlyRoutes: 770,
    hiddenRoutes: 2058,
    modelWideFailOpenRoutes: 186,
    applicabilityProseFailOpenRoutes: 0,
    rowsWithSubstringOnlyRoutes: 48,
    noLegitimateSelectableTrimOverlap: 1,
    hiddenForAllSelectableTrims: 0,
    metadataWrites: 0,
  });
  assert.equal(report.findings.flatMap((row) => row.routes).length, 4798);
});

test('routing distinguishes exact, substring, hidden and applicability-prose fail-open paths', () => {
  assert.equal(routeClassification(['Vehicles built before 2020'], 'Long Range'), 'applicability-prose-fail-open');
  assert.equal(routeClassification(['Performance'], 'Performance'), 'exact-trim-route');
  assert.equal(routeClassification(['Long Range'], 'Long Range AWD'), 'substring-only-route');
  assert.equal(routeClassification(['Plaid'], 'Standard Range'), 'hidden-route');
});

test('routing validator rejects silently staged metadata mutation', () => {
  const changed = clone(buildRoutingReport());
  changed.findings.find((row) => row.correctionCandidate).metadataWriteAuthorized = true;
  assert.match(validateRoutingReport(changed).join('\n'), /metadata write|deterministic/);
});

test('review ledger covers the hard Model Y seatbelt contradiction and rejects write authority', () => {
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/_tesla-deeplink-snapshot-2026-08-11.json'), 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/known-issue-tesla-review-ledger-2026-08-11.json'), 'utf8'));
  assert.deepEqual(validateReviewLedger(ledger, snapshot.records), []);
  const hardHold = ledger.entries.find((entry) => entry.id === 'tesla-model-y-seatbelt-anchor-recall');
  assert.match(hardHold.justification, /contradicting its Model Y slug/);
  assert.ok(hardHold.duplicateClusterKeys.includes('model-s-x-seatbelt-anchor'));
  const missing = clone(ledger); missing.entries.pop();
  assert.match(validateReviewLedger(missing, snapshot.records).join('\n'), /coverage/);
  const authorized = clone(ledger); authorized.entries[0].metadataWriteAuthorized = true;
  assert.match(validateReviewLedger(authorized, snapshot.records).join('\n'), /authorizes a write/);
  const fabricatedEvidence = clone(ledger); fabricatedEvidence.entries[0].capturedEvidenceKeys.push('not-captured');
  assert.match(validateReviewLedger(fabricatedEvidence, snapshot.records).join('\n'), /uncaptured evidence/);
});

test('make reconciliation covers six models and 64 byte-identical holds', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, { models: 6, rows: 64, retained: 0, held: 64, pagesPreservedPublished: 64, authorizedWriteCandidates: 0 });
  assert.deepEqual(report.snapshot.frozenMakeValues, ['Tesla']);
  assert.deepEqual(report.snapshot.frozenMakeCounts, { Tesla: 64 });
});

test('reconciliation refuses invalid routing before write callback', () => {
  const changed = clone(buildReconciliation());
  changed.routing.validationErrors = 1;
  let writes = 0;
  assert.throws(() => writeValidatedReconciliation(changed, () => { writes += 1; }), /Refusing to write/);
  assert.equal(writes, 0);
  assert.throws(() => assertReconciliationWritable(changed), /routing validation failed/);
});
