/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildPacket } = require('./build-suzuki-model-adjudication');
const { getContract, supportedModels } = require('./suzuki-case-inventory-contract');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-suzuki-model-adjudication');
const { assertSuzukiSnapshot } = require('./suzuki-snapshot-contract');
const { OUTPUT_FILE: ROUTING_FILE, buildRoutingReport, validateRoutingReport } = require('./build-suzuki-routing-report');

const OUTPUT_FILE = 'data/known-issue-suzuki-make-reconciliation-2026-08-11.json';
const EXPECTED_BASELINE = '950c28cdec60ea49df4cdd6642ba7dbb6239641a';
const EXPECTED_BRANCH = 'codex/suzuki-final-audit';
const IDENTITY_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function git(args) { return execFileSync('git', args, { cwd: resolveRepo('.'), encoding: 'utf8' }).trim(); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }

function reviewedFiles() {
  const scripts = fs.readdirSync(resolveRepo('scripts'))
    .filter((name) => /^(?:(?:build|validate|verify|enrich)-suzuki|suzuki-)/.test(name))
    .map((name) => `scripts/${name}`);
  const data = fs.readdirSync(resolveRepo('data'))
    .filter((name) => /^(?:_suzuki-deeplink|known-issue-suzuki-)/.test(name))
    .map((name) => `data/${name}`)
    .filter((file) => file !== OUTPUT_FILE);
  return [...scripts, ...data].sort().map((file) => ({ file, sha256: sha256(fs.readFileSync(resolveRepo(file), 'utf8').replace(/\r\n/g, '\n')) }));
}

function sourceControlProvenance() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== EXPECTED_BRANCH) throw new Error(`unexpected Suzuki audit branch ${branch}`);
  try { execFileSync('git', ['merge-base', '--is-ancestor', EXPECTED_BASELINE, 'HEAD'], { cwd: resolveRepo('.') }); } catch { throw new Error(`Suzuki audit baseline ${EXPECTED_BASELINE} is not an ancestor of HEAD`); }
  const files = reviewedFiles();
  return { branch, baselineCommit: EXPECTED_BASELINE, baselineIsAncestor: true, reviewedTree: { files, sha256: sha256(JSON.stringify(files)) } };
}

function buildReconciliation() {
  const firstContract = getContract(supportedModels[0]);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(firstContract.snapshotFile), 'utf8'));
  const frozenRows = assertSuzukiSnapshot(snapshot, resolveRepo(firstContract.snapshotFile));
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
    make: 'Suzuki',
    sourceControl: sourceControlProvenance(),
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
      exactFrozenMakeCounts: equal(frozenMakeCounts, { Suzuki: 18 }),
      makeDrift: rows.filter((row) => row.make !== 'Suzuki').length,
      ...checks,
    },
    applicationGate: { status: 'blocked', reason: 'All 18 rows are byte-identical holds; there is no authorized write set.' },
    models,
    rows,
  };
}

function assertReconciliationWritable(report) {
  const failures = [];
  const deterministic = buildReconciliation();
  if (!equal(report, deterministic)) failures.push('report does not match fresh deterministic reconciliation');
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0) failures.push('routing validation failed');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) if (name.startsWith('exact') ? value !== true : value !== 0) failures.push(`cross-packet ${name} failed`);
  if (report.summary?.retained !== 0 || report.summary?.held !== 18 || report.summary?.authorizedWriteCandidates !== 0) failures.push('all-hold totals failed');
  if (report.applicationGate?.status !== 'blocked') failures.push('application gate failed');
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
  console.log(JSON.stringify({ output: resolveRepo(OUTPUT_FILE), summary: report.summary, routing: report.routing.summary, crossPacketChecks: report.crossPacketChecks, reviewedTree: report.sourceControl.reviewedTree }, null, 2));
}

module.exports = { EXPECTED_BASELINE, EXPECTED_BRANCH, OUTPUT_FILE, assertReconciliationWritable, buildReconciliation, reviewedFiles, writeValidatedReconciliation };
