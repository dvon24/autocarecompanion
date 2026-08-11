/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const { buildPacket } = require('./build-tesla-model-adjudication');
const { getContract, supportedModels } = require('./tesla-model-adjudication-contracts');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-tesla-model-adjudication');
const { assertTeslaSnapshot } = require('./tesla-snapshot-contract');
const { OUTPUT_FILE: ROUTING_FILE, buildRoutingReport, validateRoutingReport } = require('./build-tesla-routing-report');

const OUTPUT_FILE = 'data/known-issue-tesla-make-reconciliation-2026-08-11.json';
const EXPECTED_BASELINE = '950c28cdec60ea49df4cdd6642ba7dbb6239641a';
const EXPECTED_BRANCH = 'codex/tesla-final-audit';
const IDENTITY_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const REVIEWED_FILES = Object.freeze([
  '.gitignore',
  'data/_tesla-deeplink-snapshot-2026-08-11.json',
  'data/known-issue-tesla-cybertruck-adjudication-2026-08-11.json',
  'data/known-issue-tesla-model-3-adjudication-2026-08-11.json',
  'data/known-issue-tesla-model-s-adjudication-2026-08-11.json',
  'data/known-issue-tesla-model-x-adjudication-2026-08-11.json',
  'data/known-issue-tesla-model-y-adjudication-2026-08-11.json',
  'data/known-issue-tesla-primary-evidence-2026-08-11.json',
  'data/known-issue-tesla-review-ledger-2026-08-11.json',
  'data/known-issue-tesla-routing-report-2026-08-11.json',
  'data/known-issue-tesla-semi-adjudication-2026-08-11.json',
  'data/known-issue-tesla-snapshot-provenance-2026-08-11.json',
  'scripts/build-tesla-make-reconciliation.js',
  'scripts/build-tesla-model-adjudication.js',
  'scripts/build-tesla-review-ledger.js',
  'scripts/build-tesla-routing-report.js',
  'scripts/tesla-audit-normalization.js',
  'scripts/tesla-model-adjudication-contracts.js',
  'scripts/tesla-review-ledger.js',
  'scripts/tesla-routing-equivalence.test.ts',
  'scripts/tesla-snapshot-contract.js',
  'scripts/validate-tesla-make-reconciliation.js',
  'scripts/validate-tesla-model-adjudication.js',
  'scripts/validate-tesla-model-adjudication.test.js',
  'scripts/validate-tesla-primary-evidence.js',
  'scripts/verify-tesla-all-hold-live.js',
  'scripts/verify-tesla-all-hold-live.test.js',
]);

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function git(args) { return execFileSync('git', args, { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }).trim(); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function sourceControlProvenance() {
  const rawStatus = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }).trimEnd();
  const statusPaths = rawStatus ? rawStatus.split(/\r?\n/).filter(Boolean).map((entry) => entry.slice(3).replace(/\\/g, '/')).sort() : [];
  const allowedDirtyPaths = new Set([...REVIEWED_FILES, OUTPUT_FILE, '_bmad-output/implementation-artifacts/spec-tesla-known-issues-audit-and-production-deploy.md']);
  const unrelatedDirtyPaths = statusPaths.filter((file) => !allowedDirtyPaths.has(file));
  if (unrelatedDirtyPaths.length) throw new Error(`unrelated dirty paths in Tesla audit worktree: ${unrelatedDirtyPaths.join(', ')}`);
  const reviewedFiles = [...REVIEWED_FILES].sort().map((file) => {
    const absolute = resolveRepo(file);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`reviewed Tesla artifact missing: ${file}`);
    return { file, sha256: sha256(fs.readFileSync(absolute)) };
  });
  const reviewedContentSha256 = sha256(JSON.stringify({ baseline: EXPECTED_BASELINE, files: reviewedFiles }));
  return {
    unrelatedDirtyPaths,
    reviewedContentSha256,
    reviewedTree: { files: reviewedFiles, sha256: sha256(JSON.stringify(reviewedFiles)) },
  };
}

function buildReconciliation() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const mergeBase = git(['merge-base', 'HEAD', EXPECTED_BASELINE]);
  if (branch !== EXPECTED_BRANCH) throw new Error(`unexpected Tesla audit branch ${branch}`);
  if (mergeBase !== EXPECTED_BASELINE) throw new Error(`Tesla audit baseline ${mergeBase}; expected ${EXPECTED_BASELINE}`);
  const firstContract = getContract(supportedModels[0]);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(firstContract.snapshotFile), 'utf8'));
  const frozenRows = assertTeslaSnapshot(snapshot, resolveRepo(firstContract.snapshotFile));
  const routing = JSON.parse(fs.readFileSync(resolveRepo(ROUTING_FILE), 'utf8'));
  const deterministicRouting = buildRoutingReport(snapshot);
  const models = [];
  const rows = [];
  const checks = { identityDrift: 0, statusDrift: 0, ownerTelemetryDrift: 0, commerceDrift: 0, holdMutation: 0, perPacketValidationErrors: 0 };

  for (const model of supportedModels) {
    const contract = getContract(model);
    const packet = JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8'));
    const deterministic = buildPacket(contract, snapshot);
    checks.perPacketValidationErrors += validatePacket(contract, packet, snapshot).length;
    for (const row of packet.rows) {
      for (const field of IDENTITY_FIELDS) if (!equal(row.before[field], row.proposal[field])) checks.identityDrift += 1;
      if (row.before.status !== row.proposal.status || row.proposal.status !== 'published') checks.statusDrift += 1;
      if (row.before.reportCount !== row.proposal.reportCount || row.before.lastReportedByOwners !== row.proposal.lastReportedByOwners) checks.ownerTelemetryDrift += 1;
      if (!equal(row.before.fixParts, row.proposal.fixParts) || !equal(row.before.communityRecommendations, row.proposal.communityRecommendations)) checks.commerceDrift += 1;
      if (!equal(row.before, row.proposal) || row.beforeSha256 !== row.proposalSha256 || row.changedFields.length) checks.holdMutation += 1;
      rows.push({ id: row.id, make: row.proposal.make, model, action: row.action, proposalSha256: row.proposalSha256, changedFields: row.changedFields });
    }
    const packetSha256 = normalizedFileHash(resolveRepo(contract.outputFile));
    models.push({
      model,
      packetFile: contract.outputFile,
      packetSha256,
      deterministicPacketSha256: equal(packet, deterministic) ? packetSha256 : null,
      rows: packet.summary.total,
      retained: 0,
      held: packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy,
      applicationGate: packet.applicationGate.status,
    });
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));
  const frozenIds = frozenRows.map((row) => row.id).sort();
  const packetIds = rows.map((row) => row.id);
  const frozenModels = [...new Set(frozenRows.map((row) => row.model))].sort();
  const frozenMakeCounts = frozenRows.reduce((counts, row) => ({ ...counts, [row.make]: (counts[row.make] || 0) + 1 }), {});
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-11',
    make: 'Tesla',
    sourceControl: { branch, baselineCommit: mergeBase, ...sourceControlProvenance() },
    snapshot: {
      file: firstContract.snapshotFile,
      normalizedSha256: normalizedFileHash(resolveRepo(firstContract.snapshotFile)),
      generatedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      makeRows: frozenRows.length,
      frozenMakeValues: [...new Set(frozenRows.map((row) => row.make))].sort(),
      frozenMakeCounts,
    },
    routing: {
      file: ROUTING_FILE,
      normalizedSha256: normalizedFileHash(resolveRepo(ROUTING_FILE)),
      deterministic: equal(routing, deterministicRouting),
      validationErrors: validateRoutingReport(routing).length,
      summary: routing.summary,
    },
    summary: { models: models.length, rows: rows.length, retained: 0, held: rows.length, pagesPreservedPublished: rows.length - checks.statusDrift, authorizedWriteCandidates: 0 },
    crossPacketChecks: {
      exactModelInventory: equal([...supportedModels].sort(), frozenModels),
      exactRowInventory: equal(packetIds, frozenIds),
      exactFrozenMakeCounts: equal(frozenMakeCounts, { Tesla: 64 }),
      makeDrift: rows.filter((row) => row.make !== 'Tesla').length,
      ...checks,
    },
    applicationGate: { status: 'blocked', reason: 'All 64 rows are byte-identical holds; there is no authorized write set.' },
    models,
    rows,
  };
}

function assertReconciliationWritable(report) {
  const failures = [];
  if (!equal(report, buildReconciliation())) failures.push('full deterministic reconciliation mismatch');
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0) failures.push('routing validation failed');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) if (name.startsWith('exact') ? value !== true : value !== 0) failures.push(`cross-packet ${name} failed`);
  if (report.summary?.retained !== 0 || report.summary?.held !== 64 || report.summary?.authorizedWriteCandidates !== 0) failures.push('all-hold totals failed');
  if ((report.models || []).some((model) => !model.deterministicPacketSha256 || model.applicationGate !== 'blocked')) failures.push('packet determinism/gate failed');
  if (failures.length) throw new Error(`Refusing to write reconciliation: ${failures.join('; ')}`);
  return report;
}

function writeValidatedReconciliation(report, writeFile = fs.writeFileSync) {
  assertReconciliationWritable(report);
  writeFile(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  const report = buildReconciliation();
  writeValidatedReconciliation(report);
  console.log(JSON.stringify({ output: resolveRepo(OUTPUT_FILE), summary: report.summary, routing: report.routing.summary, crossPacketChecks: report.crossPacketChecks }, null, 2));
}

module.exports = { EXPECTED_BASELINE, EXPECTED_BRANCH, OUTPUT_FILE, assertReconciliationWritable, buildReconciliation, writeValidatedReconciliation };
