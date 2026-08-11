/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel, buildPacket } = require('./build-skoda-model-adjudication');
const { clone, diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { duplicateClusters, getContract, supportedModels } = require('./skoda-model-adjudication-contracts');
const { validatePacket } = require('./validate-skoda-model-adjudication');
const { buildRoutingReport, validateRoutingReport } = require('./build-skoda-routing-report');
const { assertReconciliationWritable, buildReconciliation, writeValidatedReconciliation } = require('./build-skoda-make-reconciliation');
const { validateReconciliation } = require('./validate-skoda-make-reconciliation');
const { assertCapture, assertSkodaEvidence } = require('./validate-skoda-primary-evidence');
const { validateReviewLedger } = require('./skoda-review-ledger');
const { routeClassification } = require('./build-skoda-routing-report');

const EXPECTED = { Enyaq: 2, Fabia: 16, Kodiaq: 9, Octavia: 13, Scala: 9, Superb: 10, Yeti: 1 };

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

test('all 60 Skoda rows are byte-identical published holds', () => {
  const rows = supportedModels.flatMap((model) => buildForModel(model).packet.rows);
  assert.equal(rows.length, 60);
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

test('five duplicate-looking clusters, including Kodiaq DSG, remain separately indexed', () => {
  assert.equal(duplicateClusters.length, 5);
  assert.deepEqual(duplicateClusters.map((cluster) => cluster.ids.length), [3, 2, 2, 2, 2]);
  const allIds = new Set(supportedModels.flatMap((model) => getContract(model).allIds));
  for (const cluster of duplicateClusters) for (const id of cluster.ids) assert.equal(allIds.has(id), true);
});

test('pinned evidence blocks the impossible Kodiaq iV identity and narrows Haldex scope', () => {
  const evidence = assertSkodaEvidence();
  assert.equal(evidence.sources.length, 2);
  const kodiaq = evidence.sources.find((source) => source.key === 'kodiaqFirstPhev2024');
  assert.match(kodiaq.facts.identityBoundary, /first Kodiaq plug-in hybrid/i);
  assert.equal(kodiaq.facts.powertrain, '1.5 TSI plug-in hybrid');
  const haldex = evidence.sources.find((source) => source.key === 'skodaServiceMaintenance2023');
  assert.deepEqual(haldex.page.requiredText, ['Haldex clutch oil (4WD cars)', 'Every 3 years']);
});

test('evidence validator reads captured bytes and required text', () => {
  const evidence = assertSkodaEvidence();
  const badHash = clone(evidence.sources[0]); badHash.binary.sha256 = '0'.repeat(64);
  assert.throws(() => assertCapture(badHash), /captured source bytes drifted/);
  const missingText = clone(evidence.sources[0]); missingText.requiredText.push('not present in the captured source');
  assert.throws(() => assertCapture(missingText), /captured HTML lacks required text/);
});

test('snapshot contract rejects case-variant inventory and frozen field mutation', () => {
  const { contract, snapshot } = buildForModel('Kodiaq');
  const caseVariant = clone(snapshot);
  caseVariant.records.push({ ...clone(snapshot.records[0]), id: 'skoda-case-variant-test', make: 'SKODA' });
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
  const { contract, packet, snapshot } = buildForModel('Enyaq');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' changed';
  rehash(changed.rows[0]);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|deterministic/);
});

test('validator rejects title, status, owner telemetry and commerce mutation', () => {
  const { contract, packet, snapshot } = buildForModel('Fabia');
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
  assert.equal(report.summary.noLegitimateSelectableTrimOverlap, 19);
  assert.equal(report.summary.hiddenForAllSelectableTrims, 18);
  assert.equal(report.summary.issueYearSelectableTrimRoutes, 3061);
  assert.equal(report.summary.substringOnlyRoutes, 20);
  assert.equal(report.summary.rowsWithSubstringOnlyRoutes, 4);
  assert.equal(report.findings.flatMap((row) => row.substringOnlyRoutes).length, 20);
  assert.equal(report.summary.metadataWrites, 0);
});

test('applicability prose fails open while exact and substring routes remain distinct', () => {
  assert.equal(routeClassification(['Vehicles built before 2020'], 'Active'), 'applicability-prose-fail-open');
  assert.equal(routeClassification(['Sport'], 'Sport'), 'exact-trim-route');
  assert.equal(routeClassification(['iV'], 'Active iV'), 'substring-only-route');
  assert.equal(routeClassification(['Sport'], 'Active'), 'hidden-route');
});

test('routing validator rejects a silently staged metadata mutation', () => {
  const changed = clone(buildRoutingReport());
  changed.findings.find((row) => row.correctionCandidate).metadataWriteAuthorized = true;
  assert.match(validateRoutingReport(changed).join('\n'), /metadata write|deterministic/);
});

test('make reconciliation covers all seven models and 60 byte-identical holds', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, { models: 7, rows: 60, retained: 0, held: 60, pagesPreservedPublished: 60, authorizedWriteCandidates: 0 });
  assert.deepEqual(report.snapshot.frozenMakeValues, ['Skoda']);
  assert.deepEqual(report.snapshot.frozenMakeCounts, { Skoda: 60 });
});

test('independent review ledger validator rejects missing decision and authorized metadata', () => {
  const { snapshot } = buildForModel('Enyaq');
  const frozen = snapshot.records;
  const ledger = JSON.parse(require('node:fs').readFileSync(require('node:path').resolve(__dirname, '..', 'data/known-issue-skoda-review-ledger-2026-08-11.json'), 'utf8'));
  const missing = clone(ledger); missing.entries.pop();
  assert.match(validateReviewLedger(missing, frozen).join('\n'), /coverage/);
  const authorized = clone(ledger); authorized.entries[0].metadataWriteAuthorized = true;
  assert.match(validateReviewLedger(authorized, frozen).join('\n'), /authorizes a write/);
});

test('reconciliation refuses invalid routing before write callback', () => {
  const changed = clone(buildReconciliation());
  changed.routing.validationErrors = 1;
  let writes = 0;
  assert.throws(() => writeValidatedReconciliation(changed, () => { writes += 1; }), /Refusing to write/);
  assert.equal(writes, 0);
  assert.throws(() => assertReconciliationWritable(changed), /routing validation failed/);
});
