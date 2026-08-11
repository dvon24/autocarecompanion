/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildPacket } = require('./build-subaru-model-adjudication');
const { expectedPublishedModels, getContract, supportedModels } = require('./subaru-model-adjudication-contracts');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-subaru-model-adjudication');
const { assertSubaruSnapshot } = require('./subaru-snapshot-contract');
const { OUTPUT_FILE: ROUTING_FILE, buildRoutingReport, validateRoutingReport } = require('./build-subaru-routing-report');

const OUTPUT_FILE = 'data/known-issue-subaru-make-reconciliation-2026-08-11.json';
const STATUS_INVENTORY_FILE = 'data/_subaru-status-inventory-2026-08-11.json';
const EXPECTED_BASELINE = '950c28cdec60ea49df4cdd6642ba7dbb6239641a';
const EXPECTED_BRANCH = 'codex/subaru-final-audit';
const IDENTITY_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function git(args) { return execFileSync('git', args, { cwd: resolveRepo('.'), encoding: 'utf8' }).trim(); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }

function reviewedArtifactFiles() {
  const scriptFiles = [
    'build-subaru-make-reconciliation.js',
    'build-subaru-model-adjudication.js',
    'build-subaru-review-ledger.js',
    'build-subaru-routing-report.js',
    'capture-subaru-inventory.js',
    'enrich-subaru-snapshot-provenance.js',
    'subaru-audit-normalization.js',
    'subaru-independent-adversarial.test.js',
    'subaru-model-adjudication-contracts.js',
    'subaru-review-ledger.js',
    'subaru-routing-equivalence.test.ts',
    'subaru-snapshot-contract.js',
    'validate-subaru-make-reconciliation.js',
    'validate-subaru-model-adjudication.js',
    'validate-subaru-model-adjudication.test.js',
    'validate-subaru-primary-evidence.js',
    'verify-subaru-all-hold-live.js',
    'verify-subaru-all-hold-live.test.js',
  ].map((file) => `scripts/${file}`);
  const dataFiles = fs.readdirSync(resolveRepo('data'))
    .filter((file) => /^(?:_subaru|known-issue-subaru)/i.test(file) && file !== path.basename(OUTPUT_FILE))
    .map((file) => `data/${file}`);
  return ['.gitignore', '_bmad-output/implementation-artifacts/spec-subaru-known-issues-audit.md', ...scriptFiles, ...dataFiles].sort();
}

function sourceControlProvenance() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const baseline = git(['rev-parse', EXPECTED_BASELINE]);
  const containsBaseline = git(['merge-base', 'HEAD', EXPECTED_BASELINE]) === EXPECTED_BASELINE;
  if (branch !== EXPECTED_BRANCH) throw new Error(`unexpected Subaru audit branch ${branch}`);
  if (baseline !== EXPECTED_BASELINE || !containsBaseline) throw new Error('Subaru audit is not based on the reviewed Skoda commit');
  const files = reviewedArtifactFiles().map((file) => ({ file, sha256: sha256(fs.readFileSync(resolveRepo(file))) }));
  return { branch, baselineCommit: baseline, containsBaseline, reviewedTree: { files, sha256: sha256(JSON.stringify(files)) } };
}

function buildReconciliation() {
  const sourceControl = sourceControlProvenance();
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo('data/_subaru-deeplink-snapshot-2026-08-11.json'), 'utf8'));
  const frozenRows = assertSubaruSnapshot(snapshot, resolveRepo('data/_subaru-deeplink-snapshot-2026-08-11.json'));
  const statusInventory = JSON.parse(fs.readFileSync(resolveRepo(STATUS_INVENTORY_FILE), 'utf8'));
  const archivedRows = statusInventory.rows.filter((row) => row.status === 'archived').sort((left, right) => left.id.localeCompare(right.id));
  const archivedIds = archivedRows.map((row) => row.id);
  const routing = JSON.parse(fs.readFileSync(resolveRepo(ROUTING_FILE), 'utf8'));
  const deterministicRouting = buildRoutingReport(snapshot);
  const models = [];
  const rows = [];
  const checks = { identityDrift: 0, statusDrift: 0, ownerTelemetryDrift: 0, commerceDrift: 0, holdMutation: 0, archivedLeak: 0, perPacketValidationErrors: 0 };

  for (const model of supportedModels) {
    const contract = getContract(model, snapshot.records);
    const packet = JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8'));
    const deterministic = buildPacket(contract, snapshot);
    checks.perPacketValidationErrors += validatePacket(contract, packet, snapshot).length;
    for (const row of packet.rows) {
      for (const field of IDENTITY_FIELDS) if (!equal(row.before[field], row.proposal[field])) checks.identityDrift += 1;
      if (row.before.status !== row.proposal.status || row.proposal.status !== 'published') checks.statusDrift += 1;
      if (row.before.reportCount !== row.proposal.reportCount || row.before.lastReportedByOwners !== row.proposal.lastReportedByOwners) checks.ownerTelemetryDrift += 1;
      if (!equal(row.before.fixParts, row.proposal.fixParts) || !equal(row.before.communityRecommendations, row.proposal.communityRecommendations)) checks.commerceDrift += 1;
      if (!equal(row.before, row.proposal) || row.beforeSha256 !== row.proposalSha256 || row.changedFields.length) checks.holdMutation += 1;
      if (archivedIds.includes(row.id)) checks.archivedLeak += 1;
      rows.push({ id: row.id, make: row.proposal.make, model, action: row.action, proposalSha256: row.proposalSha256, changedFields: row.changedFields });
    }
    const packetSha256 = normalizedFileHash(resolveRepo(contract.outputFile));
    models.push({ model, packetFile: contract.outputFile, packetSha256, deterministicPacketSha256: equal(packet, deterministic) ? packetSha256 : null, rows: packet.summary.total, retained: 0, held: packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy, applicationGate: packet.applicationGate.status });
  }

  rows.sort((left, right) => left.id.localeCompare(right.id));
  const frozenIds = frozenRows.map((row) => row.id).sort();
  const packetIds = rows.map((row) => row.id);
  const frozenModels = [...new Set(frozenRows.map((row) => row.model))].sort();
  const frozenMakeCounts = frozenRows.reduce((counts, row) => ({ ...counts, [row.make]: (counts[row.make] || 0) + 1 }), {});
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-11',
    make: 'Subaru',
    sourceControl,
    snapshot: { file: 'data/_subaru-deeplink-snapshot-2026-08-11.json', normalizedSha256: normalizedFileHash(resolveRepo('data/_subaru-deeplink-snapshot-2026-08-11.json')), generatedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, publishedRows: frozenRows.length, frozenMakeValues: [...new Set(frozenRows.map((row) => row.make))].sort(), frozenMakeCounts },
    archivedInventory: { file: STATUS_INVENTORY_FILE, normalizedSha256: normalizedFileHash(resolveRepo(STATUS_INVENTORY_FILE)), rows: archivedRows.length, modelCounts: statusInventory.modelCounts.archived, ids: archivedIds, republishAuthorized: false },
    routing: { file: ROUTING_FILE, normalizedSha256: normalizedFileHash(resolveRepo(ROUTING_FILE)), deterministic: equal(routing, deterministicRouting), validationErrors: validateRoutingReport(routing).length, summary: routing.summary },
    summary: { models: models.length, rows: rows.length, retained: 0, held: rows.length, archivedExcluded: archivedRows.length, pagesPreservedPublished: rows.length - checks.statusDrift, authorizedWriteCandidates: 0 },
    crossPacketChecks: {
      exactModelInventory: equal([...supportedModels].sort(), frozenModels),
      exactPublishedModelCounts: equal(statusInventory.modelCounts.published, expectedPublishedModels),
      exactRowInventory: equal(packetIds, frozenIds),
      exactFrozenMakeCounts: equal(frozenMakeCounts, { Subaru: 205 }),
      exactArchivedExclusion: archivedIds.length === 12 && !archivedIds.some((id) => packetIds.includes(id)),
      makeDrift: rows.filter((row) => row.make !== 'Subaru').length,
      ...checks,
    },
    applicationGate: { status: 'blocked', reason: 'All 205 published rows are byte-identical holds; twelve archived rows remain excluded and there is no authorized write set.' },
    models,
    rows,
  };
}

function assertReconciliationWritable(report) {
  const failures = [];
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0) failures.push('routing validation failed');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) if (name.startsWith('exact') ? value !== true : value !== 0) failures.push(`cross-packet ${name} failed`);
  if (report.summary?.retained !== 0 || report.summary?.held !== 205 || report.summary?.archivedExcluded !== 12 || report.summary?.authorizedWriteCandidates !== 0) failures.push('all-hold/archive totals failed');
  if ((report.models || []).some((model) => !model.deterministicPacketSha256 || model.applicationGate !== 'blocked')) failures.push('packet determinism/gate failed');
  if (report.archivedInventory?.republishAuthorized !== false) failures.push('archive republish boundary failed');
  if (failures.length) throw new Error(`Refusing to write reconciliation: ${failures.join('; ')}`);
  return report;
}

function writeValidatedReconciliation(report, writeFile = fs.writeFileSync) {
  assertReconciliationWritable(report);
  writeFile(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (require.main === module) {
  const report = buildReconciliation();
  writeValidatedReconciliation(report);
  console.log(JSON.stringify({ output: OUTPUT_FILE, summary: report.summary, routing: report.routing.summary, crossPacketChecks: report.crossPacketChecks }, null, 2));
}

module.exports = { EXPECTED_BASELINE, EXPECTED_BRANCH, OUTPUT_FILE, assertReconciliationWritable, buildReconciliation, reviewedArtifactFiles, sourceControlProvenance, writeValidatedReconciliation };
