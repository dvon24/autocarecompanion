/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket } = require('./build-suzuki-model-adjudication');
const { getContract } = require('./suzuki-case-inventory-contract');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');
const { isSuzukiMake } = require('./suzuki-audit-normalization');
const { loadAndValidateReviewLedger } = require('./suzuki-review-ledger');

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(contract, packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(contract, snapshot);
  const suzukiRows = snapshot.records.filter((row) => isSuzukiMake(row.make));
  const expected = suzukiRows.filter((row) => row.model === contract.model).sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const ledger = loadAndValidateReviewLedger(suzukiRows);
  const decisionById = new Map(ledger.entries.map((entry) => [entry.id, entry]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Suzuki' || packet.make !== contract.make || packet.model !== contract.model) errors.push('wrong make/model or make casing');
  if (rows.length !== contract.allIds.length || new Set(ids).size !== contract.allIds.length || !equal([...ids].sort(), contract.allIds)) errors.push(`${contract.model} coverage mismatch`);
  if (!equal(packet.applicationGate?.blockerRecordIds, contract.allIds)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_accuracy_cleanup !== 0 || packet.summary?.authorized_write_candidates !== 0 || packet.summary?.hold_indexed_identity_byte_identical_pending_identity_policy !== contract.allIds.length) errors.push('write/hold summary drifted');

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    const decision = decisionById.get(row.id);
    if (!decision || row.action !== decision.action || row.identityConflict !== decision.justification || !equal(row.reviewLedger?.existingSourcesInspected, decision.existingSourcesInspected)) errors.push(`${row.id}: packet does not consume its independent ledger decision`);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    if (row.action !== 'hold_indexed_identity_byte_identical_pending_identity_policy' || row.identityReviewRequired !== true || !row.identityConflict) errors.push(`${row.id}: hold verdict drifted`);
    if (!equal(row.proposal, row.before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields.length !== 0) errors.push(`${row.id}: held row is not byte-identical`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page became unpublished`);
    if (!equal(row.proposal.fixParts, row.before.fixParts) || !equal(row.proposal.communityRecommendations, row.before.communityRecommendations)) errors.push(`${row.id}: commerce drifted`);
    if (row.proposal.reportCount !== row.before.reportCount || row.proposal.lastReportedByOwners !== row.before.lastReportedByOwners) errors.push(`${row.id}: owner telemetry drifted`);
    if (row.proposal.humanApproved !== row.before.humanApproved || row.proposal.source !== row.before.source || !equal(row.proposal.relatedIssueIds, row.before.relatedIssueIds)) errors.push(`${row.id}: review/source/related state drifted`);
    if (!equal(row.evidence?.primaryEvidence, [])) errors.push(`${row.id}: uncaptured evidence was attached`);
  }
  return errors;
}

if (require.main === module) {
  const model = argValue('--model');
  if (!model) throw new Error('--model is required');
  const contract = getContract(model);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8'));
  const packet = JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8'));
  const errors = validatePacket(contract, packet, snapshot);
  console.log(JSON.stringify({ model, valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validatePacket };
