/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildPacket } = require('./build-seat-model-adjudication');
const { getContract, supportedModels } = require('./seat-model-adjudication-contracts');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-seat-model-adjudication');
const { assertSeatSnapshot } = require('./seat-snapshot-contract');

const OUTPUT_FILE = 'data/known-issue-seat-make-reconciliation-2026-08-11.json';
const EXPECTED_BASELINE = '788bc03680e738d3ffb18c2718f78f1ae8887e6a';
const IDENTITY_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function allText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(allText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(allText).join(' ');
  return '';
}
function containsOwnerSocialProof(row) {
  return /\b\d[\d,.]*\+?\s+(?:owners?|drivers?|users?)\b|\b(?:many|numerous|several|multiple|most)\s+owners?\b|\bowners?\s+(?:have\s+)?(?:report(?:ed)?|say|complain(?:ed)?)\b/i.test(allText(row));
}
function git(args) { return execFileSync('git', args, { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }).trim(); }

function buildReconciliation() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const mergeBase = git(['merge-base', 'HEAD', 'origin/main']);
  if (branch !== 'codex/seat-deeplink-audit') throw new Error(`unexpected SEAT audit branch ${branch}`);
  if (mergeBase !== EXPECTED_BASELINE) throw new Error(`SEAT audit baseline ${mergeBase}; expected ${EXPECTED_BASELINE}`);
  const firstContract = getContract(supportedModels[0]);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(firstContract.snapshotFile), 'utf8'));
  const frozenRows = assertSeatSnapshot(snapshot, resolveRepo(firstContract.snapshotFile));
  const frozenMakeCounts = frozenRows.reduce((counts, row) => ({ ...counts, [row.make]: (counts[row.make] || 0) + 1 }), {});
  const models = [];
  const rows = [];
  let validationErrors = 0;
  let identityDrift = 0;
  let unpublished = 0;
  let noncanonicalSeverity = 0;
  let ownerDataDrift = 0;
  let ownerSocialProof = 0;
  let commerceDrift = 0;
  let holdMutation = 0;

  for (const model of supportedModels) {
    const contract = getContract(model);
    const packetFile = contract.outputFile;
    const packet = JSON.parse(fs.readFileSync(resolveRepo(packetFile), 'utf8'));
    const deterministic = buildPacket(contract, snapshot);
    const packetSha256 = normalizedFileHash(resolveRepo(packetFile));
    validationErrors += validatePacket(contract, packet, snapshot).length;
    for (const row of packet.rows || []) {
      for (const field of IDENTITY_FIELDS) if (!equal(row.before[field], row.proposal[field])) identityDrift += 1;
      if (row.proposal.status !== 'published') unpublished += 1;
      if (!['low', 'medium', 'high'].includes(row.proposal.severity)) noncanonicalSeverity += 1;
      if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') ownerDataDrift += 1;
      if (row.action.startsWith('retain_') && containsOwnerSocialProof(row.proposal)) ownerSocialProof += 1;
      if (!equal(row.before.fixParts, row.proposal.fixParts) || !equal(row.before.communityRecommendations, row.proposal.communityRecommendations)) commerceDrift += 1;
      if (row.action.startsWith('hold_') && (!equal(row.before, row.proposal) || row.changedFields.length !== 0 || row.beforeSha256 !== row.proposalSha256)) holdMutation += 1;
      rows.push({ id: row.id, make: row.proposal.make, model, action: row.action, proposalSha256: row.proposalSha256, changedFields: row.changedFields });
    }
    models.push({
      model,
      packetFile,
      packetSha256,
      deterministicPacketSha256: equal(packet, deterministic) ? packetSha256 : null,
      rows: packet.summary.total,
      retained: packet.summary.retain_indexed_identity_and_accuracy_cleanup,
      held: packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy,
      applicationGate: packet.applicationGate.status,
    });
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));
  const frozenIds = frozenRows.map((row) => row.id);
  const packetIds = rows.map((row) => row.id);
  const frozenModels = [...new Set(frozenRows.map((row) => row.model))].sort();
  const packetModels = [...supportedModels].sort();
  const retained = models.reduce((sum, row) => sum + row.retained, 0);
  const held = models.reduce((sum, row) => sum + row.held, 0);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-11',
    make: 'SEAT',
    sourceControl: { branch, baselineCommit: mergeBase },
    snapshot: {
      file: firstContract.snapshotFile,
      normalizedSha256: normalizedFileHash(resolveRepo(firstContract.snapshotFile)),
      generatedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      makeRows: frozenRows.length,
      frozenMakeValues: [...new Set(frozenRows.map((row) => row.make))].sort(),
      frozenMakeCounts,
    },
    summary: { models: models.length, rows: rows.length, retained, held, pagesPreservedPublished: rows.length - unpublished, authorizedWriteCandidates: retained },
    crossPacketChecks: {
      exactModelInventory: equal(packetModels, frozenModels),
      exactRowInventory: equal(packetIds, frozenIds),
      exactFrozenMakeCounts: equal(frozenMakeCounts, { SEAT: 36 }),
      makeDrift: rows.filter((row) => row.make !== 'SEAT').length,
      identityDrift,
      unpublished,
      noncanonicalSeverity,
      ownerDataDrift,
      ownerSocialProof,
      commerceDrift,
      holdMutation,
      perPacketValidationErrors: validationErrors,
    },
    applicationGate: {
      status: 'blocked',
      reason: 'No catalog write is authorized until an independent reviewer approves the retained rows and re-runs this make-wide reconciliation. Held rows always remain no-op.',
    },
    models,
    rows,
  };
}

if (require.main === module) {
  const report = buildReconciliation();
  fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output: resolveRepo(OUTPUT_FILE), summary: report.summary, crossPacketChecks: report.crossPacketChecks }, null, 2));
}

module.exports = { buildReconciliation, OUTPUT_FILE };
