/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { APPLY_ACTIONS, IDENTITY_FIELDS, NON_APPLY_ACTIONS, OUTPUT: PACKET, SNAPSHOT, packetFiles } = require('./build-kia-make-reconciliation');

const ROOT = path.resolve(__dirname, '..');
const LEVEL_VALUES = new Set(['high', 'medium', 'low']);
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(packet, snapshot) {
  const errors = [];
  const frozenById = new Map(snapshot.records.map((row) => [row.id, row]));
  const files = packetFiles();
  const expectedModelPackets = [];
  const decisions = [];
  const actionCounts = {};
  const seen = new Map();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.auditStage !== 'make-wide-reconciliation') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== normalizedFileHash(SNAPSHOT) || packet.source?.snapshotHash !== snapshot.snapshotHash || packet.source?.snapshotRecordCount !== 247 || snapshot.records.length !== 247) errors.push('snapshot binding mismatch');
  if (files.length !== 23) errors.push(`model packet count ${files.length}; expected 23`);

  for (const file of files) {
    const filePath = path.join(ROOT, 'data', file);
    const modelPacket = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const counts = {};
    if (modelPacket.status !== 'proposal-only' || modelPacket.requiresIndependentApproval !== true || modelPacket.make !== 'Kia') errors.push(`${file}: packet scope/safety mismatch`);
    for (const row of modelPacket.rows || []) {
      const frozen = frozenById.get(row.id);
      seen.set(row.id, (seen.get(row.id) || 0) + 1);
      counts[row.action] = (counts[row.action] || 0) + 1;
      actionCounts[row.action] = (actionCounts[row.action] || 0) + 1;
      if (!frozen) { errors.push(`${row.id}: extra ID`); continue; }
      const before = fullRecord(frozen);
      const identityPreserved = IDENTITY_FIELDS.every((field) => equal(row.before[field], row.proposal[field]));
      const statusPreserved = row.before.status === 'published' && row.proposal.status === 'published';
      decisions.push({ id: row.id, model: row.model, packetFile: `data/${file}`, action: row.action, beforeSha256: row.beforeSha256, proposalSha256: row.proposalSha256, changedFields: row.changedFields, identityPreserved, statusPreserved });
      if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before drift`);
      if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/change drift`);
      if (!APPLY_ACTIONS.has(row.action) && !NON_APPLY_ACTIONS.has(row.action)) errors.push(`${row.id}: unknown action ${row.action}`);
      if (!identityPreserved || !statusPreserved) errors.push(`${row.id}: identity/status drift`);
      if (!LEVEL_VALUES.has(row.proposal.severity) || !LEVEL_VALUES.has(row.proposal.confidence)) errors.push(`${row.id}: invalid severity/confidence enum`);
      if (row.action === 'keep_published_pending_source' && (!equal(row.before, row.proposal) || row.beforeSha256 !== row.proposalSha256 || row.changedFields.length !== 0)) errors.push(`${row.id}: changed hold`);
      if (APPLY_ACTIONS.has(row.action)) {
        if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact rewrite has no citation`);
        if ((row.proposal.fixParts || []).length || (row.proposal.communityRecommendations || []).some((item) => item?.affiliateUrl)) errors.push(`${row.id}: exact rewrite contains commerce`);
      }
    }
    expectedModelPackets.push({ model: modelPacket.model, file: `data/${file}`, sha256: normalizedFileHash(filePath), rowCount: modelPacket.rows?.length || 0, actionCounts: counts, applicationGate: modelPacket.applicationGate?.status || 'none' });
  }

  decisions.sort((left, right) => left.id.localeCompare(right.id));
  const applyAllowlist = decisions.filter((row) => APPLY_ACTIONS.has(row.action)).map((row) => row.id);
  const nonApplyIds = decisions.filter((row) => NON_APPLY_ACTIONS.has(row.action)).map((row) => row.id);
  const snapshotIds = [...frozenById.keys()].sort();
  const decisionIds = decisions.map((row) => row.id).sort();
  const duplicates = [...seen.entries()].filter(([, count]) => count !== 1);
  if (decisions.length !== 247 || !equal(decisionIds, snapshotIds) || duplicates.length) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.modelPackets, expectedModelPackets)) errors.push('model packet manifest mismatch');
  if (!equal(packet.decisions, decisions)) errors.push('decision union drift');
  if (!equal(packet.applyAllowlist, applyAllowlist) || applyAllowlist.length !== 53) errors.push('apply allowlist mismatch');
  if (!equal(packet.nonApplyIds, nonApplyIds) || nonApplyIds.length !== 194) errors.push('non-apply inventory mismatch');
  const expectedSummary = { models: 23, ...Object.fromEntries(Object.entries(actionCounts).sort(([left], [right]) => left.localeCompare(right))), applyRows: 53, nonApplyRows: 194, total: 247 };
  if (!equal(packet.summary, expectedSummary)) errors.push('aggregate summary mismatch');
  if (!equal(packet.safetyTotals, { archives: 0, redirects: 0, deletions: 0, identityChanges: 0, statusChanges: 0 })) errors.push('safety totals mismatch');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validateReconciliation(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.decisions?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { PACKET, SNAPSHOT, validateReconciliation };
