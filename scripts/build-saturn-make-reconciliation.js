/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket } = require('./build-saturn-model-adjudication');
const { getContract, supportedModels } = require('./saturn-model-adjudication-contracts');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-saturn-model-adjudication');

const OUTPUT_FILE = 'data/known-issue-saturn-make-reconciliation-2026-08-11.json';
const IDENTITY_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }

function buildReconciliation() {
  const firstContract = getContract(supportedModels[0]);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(firstContract.snapshotFile), 'utf8'));
  const frozenRows = snapshot.records.filter((row) => row.make === 'Saturn').sort((a, b) => a.id.localeCompare(b.id));
  const models = [];
  const rows = [];
  let validationErrors = 0;
  let identityDrift = 0;
  let unpublished = 0;
  let noncanonicalSeverity = 0;
  let ownerDataDrift = 0;
  let ownerSocialProof = 0;
  let commerceDrift = 0;

  for (const model of supportedModels) {
    const contract = getContract(model);
    const packetFile = contract.outputFile;
    const packet = JSON.parse(fs.readFileSync(resolveRepo(packetFile), 'utf8'));
    const deterministic = buildPacket(contract, snapshot);
    const packetSha256 = normalizedFileHash(resolveRepo(packetFile));
    validationErrors += validatePacket(contract, packet, snapshot).length;
    const packetRows = packet.rows || [];
    for (const row of packetRows) {
      for (const field of IDENTITY_FIELDS) if (!equal(row.before[field], row.proposal[field])) identityDrift += 1;
      if (row.proposal.status !== 'published') unpublished += 1;
      if (!['low', 'medium', 'high'].includes(row.proposal.severity)) noncanonicalSeverity += 1;
      if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') ownerDataDrift += 1;
      if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) ownerSocialProof += 1;
      if (row.proposal.fixParts.length || row.proposal.communityRecommendations.length || !/do not buy/i.test(row.proposal.solution)) commerceDrift += 1;
      rows.push({ id: row.id, model, action: row.action, proposalSha256: row.proposalSha256 });
    }
    models.push({
      model,
      packetFile,
      packetSha256,
      deterministicPacketSha256: equal(packet, deterministic) ? packetSha256 : null,
      rows: packet.summary.total,
      retained: packet.summary.retain_indexed_identity_and_accuracy_cleanup,
      held: packet.summary.hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy,
      unsupportedOwnerCountsZeroed: packet.summary.fabricated_report_counts_proposed_zero,
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
  const zeroed = models.reduce((sum, row) => sum + row.unsupportedOwnerCountsZeroed, 0);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-11',
    make: 'Saturn',
    branch: 'codex/saturn-deeplink-audit',
    snapshot: {
      file: firstContract.snapshotFile,
      normalizedSha256: normalizedFileHash(resolveRepo(firstContract.snapshotFile)),
      generatedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      makeRows: frozenRows.length,
    },
    summary: { models: models.length, rows: rows.length, retained, held, unsupportedOwnerCountsZeroed: zeroed, pagesPreservedPublished: rows.length - unpublished },
    crossPacketChecks: {
      exactModelInventory: equal(packetModels, frozenModels),
      exactRowInventory: equal(packetIds, frozenIds),
      makeDrift: rows.filter((row) => !row.id.startsWith('saturn-')).length,
      identityDrift,
      unpublished,
      noncanonicalSeverity,
      ownerDataDrift,
      ownerSocialProof,
      commerceDrift,
      perPacketValidationErrors: validationErrors,
    },
    applicationGate: {
      status: 'blocked',
      reason: 'Independent review is required for every model packet, and held identities require an approved identity policy before any catalog write.',
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
