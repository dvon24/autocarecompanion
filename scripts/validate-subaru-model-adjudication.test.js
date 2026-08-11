/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { buildForModel, buildPacket } = require('./build-subaru-model-adjudication');
const { clone, diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { duplicateClusters, expectedPublishedModels, getContract, supportedModels } = require('./subaru-model-adjudication-contracts');
const { validatePacket } = require('./validate-subaru-model-adjudication');
const { buildRoutingReport, routeClassification, validateRoutingReport } = require('./build-subaru-routing-report');
const { assertReconciliationWritable, buildReconciliation, writeValidatedReconciliation } = require('./build-subaru-make-reconciliation');
const { validateReconciliation } = require('./validate-subaru-make-reconciliation');
const { assertSubaruEvidence } = require('./validate-subaru-primary-evidence');
const { validateReviewLedger } = require('./subaru-review-ledger');

for (const model of supportedModels) {
  test(`${model} packet is a deterministic complete published hold`, () => {
    const { contract, packet, snapshot } = buildForModel(model);
    assert.deepEqual(validatePacket(contract, packet, snapshot), []);
    assert.equal(packet.summary.total, expectedPublishedModels[model]);
    assert.equal(packet.summary.retain_indexed_identity_and_accuracy_cleanup, 0);
    assert.equal(packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy, expectedPublishedModels[model]);
    assert.equal(packet.summary.pages_preserved_published, expectedPublishedModels[model]);
    assert.equal(packet.summary.archived_rows_excluded, 12);
    assert.equal(packet.applicationGate.status, 'blocked');
  });
}

test('all 205 Subaru rows are byte-identical published holds and no archived ID appears', () => {
  const statusInventory = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/_subaru-status-inventory-2026-08-11.json'), 'utf8'));
  const archived = new Set(statusInventory.rows.filter((row) => row.status === 'archived').map((row) => row.id));
  const rows = supportedModels.flatMap((model) => buildForModel(model).packet.rows);
  assert.equal(rows.length, 205);
  assert.equal(archived.size, 12);
  for (const row of rows) {
    assert.equal(archived.has(row.id), false);
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

test('five duplicate-looking clusters remain separately indexed', () => {
  assert.equal(duplicateClusters.length, 5);
  const allIds = new Set(supportedModels.flatMap((model) => getContract(model).allIds));
  for (const cluster of duplicateClusters) {
    assert.equal(cluster.ids.length, 2);
    for (const id of cluster.ids) assert.equal(allIds.has(id), true, `${cluster.key}/${id}`);
  }
});

test('empty primary-evidence set authorizes no conflict correction or retained rewrite', () => {
  const evidence = assertSubaruEvidence();
  assert.equal(evidence.sources.length, 0);
  assert.deepEqual(evidence.summary, { exactIdentityConflictCaptures: 0, retainedRewriteCaptures: 0 });
  assert.equal(evidence.writeAuthorization, false);
});

test('snapshot contract rejects case variants, archive leakage and frozen-field mutation', () => {
  const { contract, snapshot } = buildForModel('Ascent');
  const caseVariant = clone(snapshot);
  caseVariant.records.push({ ...clone(snapshot.records[0]), id: 'subaru-case-variant-test', make: 'SUBARU' });
  assert.throws(() => buildPacket(contract, caseVariant), /published row count|make variants/);
  const archiveLeak = clone(snapshot); archiveLeak.records[0].status = 'archived';
  assert.throws(() => buildPacket(contract, archiveLeak), /non-published row|frozen status/);
  const titleMutation = clone(snapshot); titleMutation.records[0].title += ' changed';
  assert.throws(() => buildPacket(contract, titleMutation), /frozen title hash drifted/);
});

function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}

test('validator rejects body mutation to a held row', () => {
  const { contract, packet, snapshot } = buildForModel('Baja');
  const changed = clone(packet); changed.rows[0].proposal.description += ' changed'; rehash(changed.rows[0]);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|deterministic/);
});

test('validator rejects title, status, owner telemetry and commerce mutation', () => {
  const { contract, packet, snapshot } = buildForModel('Forester');
  const changed = clone(packet);
  const row = changed.rows[0];
  row.proposal.title += ' changed'; row.proposal.status = 'archived'; row.proposal.reportCount = 9; row.proposal.lastReportedByOwners = '2026-08-11'; row.proposal.fixParts.push({ component: 'fake' }); rehash(row);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|page became unpublished|commerce drifted|owner telemetry drifted|deterministic/);
});

test('routing report inventories every issue/year/selectable-trim route with zero metadata writes', () => {
  const report = buildRoutingReport();
  assert.deepEqual(validateRoutingReport(report), []);
  assert.equal(report.summary.rows, 205);
  assert.equal(report.summary.issueYears, 1369);
  assert.equal(report.summary.issueYearsWithoutSelectableTrims, 2);
  assert.equal(report.summary.issueYearSelectableTrimRoutes, 5521);
  assert.equal(report.summary.exactTrimRoutes, 1219);
  assert.equal(report.summary.substringOnlyRoutes, 889);
  assert.equal(report.summary.hiddenRoutes, 542);
  assert.equal(report.summary.noLegitimateSelectableTrimOverlap, 7);
  assert.equal(report.summary.metadataWrites, 0);
});

test('applicability prose fails open while exact, substring and hidden routes remain distinct', () => {
  assert.equal(routeClassification(['Vehicles built before 2020'], 'Premium'), 'applicability-prose-fail-open');
  assert.equal(routeClassification(['Sport'], 'Sport'), 'exact-trim-route');
  assert.equal(routeClassification(['Base'], 'Base Premium'), 'substring-only-route');
  assert.equal(routeClassification(['Sport'], 'Premium'), 'hidden-route');
});

test('routing validator rejects a silently staged year or trim mutation', () => {
  const changed = clone(buildRoutingReport());
  const candidate = changed.findings.find((row) => row.correctionCandidate);
  candidate.metadataWriteAuthorized = true;
  candidate.correctionCandidate.proposedYears = [2025];
  assert.match(validateRoutingReport(changed).join('\n'), /metadata write|deterministic/);
});

test('make reconciliation covers 14 models, 205 holds and 12 excluded archives', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, { models: 14, rows: 205, retained: 0, held: 205, archivedExcluded: 12, pagesPreservedPublished: 205, authorizedWriteCandidates: 0 });
  assert.deepEqual(report.snapshot.frozenMakeValues, ['Subaru']);
  assert.deepEqual(report.snapshot.frozenMakeCounts, { Subaru: 205 });
  assert.equal(report.archivedInventory.ids.length, 12);
  assert.equal(report.archivedInventory.republishAuthorized, false);
});

test('independent review ledger rejects missing decisions, archive coverage inflation and authorization', () => {
  const { snapshot } = buildForModel('Ascent');
  const ledger = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/known-issue-subaru-review-ledger-2026-08-11.json'), 'utf8'));
  const missing = clone(ledger); missing.entries.pop();
  assert.match(validateReviewLedger(missing, snapshot.records).join('\n'), /coverage/);
  const inflated = clone(ledger); inflated.entries.push({ ...clone(inflated.entries[0]), id: 'subaru-ascent-battery-drain-parasitic-2019' });
  assert.match(validateReviewLedger(inflated, snapshot.records).join('\n'), /coverage/);
  const authorized = clone(ledger); authorized.entries[0].metadataWriteAuthorized = true;
  assert.match(validateReviewLedger(authorized, snapshot.records).join('\n'), /authorizes a write/);
});

test('reconciliation refuses invalid routing, archives or packet coverage before write callback', () => {
  for (const mutate of [
    (report) => { report.routing.validationErrors = 1; },
    (report) => { report.crossPacketChecks.exactArchivedExclusion = false; },
    (report) => { report.crossPacketChecks.exactRowInventory = false; },
  ]) {
    const changed = clone(buildReconciliation()); mutate(changed);
    let writes = 0;
    assert.throws(() => writeValidatedReconciliation(changed, () => { writes += 1; }), /Refusing to write/);
    assert.equal(writes, 0);
    assert.throws(() => assertReconciliationWritable(changed));
  }
});
