/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  fullRecord,
  hashValue,
  normalizedFileHash,
  stableValue,
} = require('./infiniti-adjudication-utils');
const { MODELS, OUTPUT_FILE, SNAPSHOT_FILE, packetFile } = require('./build-infiniti-make-reconciliation');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PACKET = path.join(DATA, OUTPUT_FILE);
const SNAPSHOT = path.join(DATA, SNAPSHOT_FILE);
const EXPECTED_MODELS = MODELS;
const EXPECTED_REWRITE_IDS = [
  'infiniti-fx35-brake-rotor-warping-front-brake-vibration',
  'infiniti-fx50-brake-rotor-warping-brake-judder',
  'infiniti-m35-brake-rotor-warping-and-front-brake-vibration',
  'infiniti-m37-brake-rotor-warping-front-brake-vibration',
  'infiniti-qx55-engine-cooling-fan-runs-full-speed-loud-roaring-jet-engine-n',
  'infiniti-qx55-front-passenger-door-latch-may-not-lock',
];

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function validateReconciliation(packet, snapshot) {
  const errors = [];
  const frozenById = new Map(snapshot.records.map((row) => [row.id, row]));
  const seen = new Map();
  const decisions = [];
  const modelPackets = [];

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Infiniti' || packet.auditStage !== 'make-wide-reconciliation') errors.push('packet scope mismatch');
  if (!equal(packet.models, EXPECTED_MODELS)) errors.push('model list mismatch');
  if (packet.source?.snapshotSha256 !== normalizedFileHash(SNAPSHOT) || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.snapshotRecordCount !== 73 || snapshot.records.length !== 73) errors.push('snapshot count mismatch');

  for (const model of EXPECTED_MODELS) {
    const file = packetFile(model);
    const filePath = path.join(DATA, file);
    const modelPacket = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rows = modelPacket.rows || [];
    const rewrites = rows.filter((row) => row.action === 'rewrite_same_identity').length;
    const holds = rows.filter((row) => row.action === 'keep_published_pending_source').length;
    modelPackets.push({ model, file: `data/${file}`, sha256: normalizedFileHash(filePath), rowCount: rows.length, rewrites, holds });

    if (modelPacket.status !== 'proposal-only' || modelPacket.requiresIndependentApproval !== true || modelPacket.make !== 'Infiniti' || modelPacket.model !== model) errors.push(`${model}: packet scope/safety mismatch`);
    if (modelPacket.source?.snapshotSha256 !== normalizedFileHash(SNAPSHOT) || modelPacket.source?.snapshotHash !== snapshot.snapshotHash) errors.push(`${model}: snapshot binding mismatch`);

    for (const row of rows) {
      seen.set(row.id, (seen.get(row.id) || 0) + 1);
      decisions.push({ id: row.id, model: row.model, action: row.action, beforeSha256: row.beforeSha256, proposalSha256: row.proposalSha256, changedFields: row.changedFields });
      const frozen = frozenById.get(row.id);
      if (!frozen) {
        errors.push(`${row.id}: extra ID`);
        continue;
      }
      const before = fullRecord(frozen);
      if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before drift`);
      if (row.action !== 'rewrite_same_identity' && row.action !== 'keep_published_pending_source') errors.push(`${row.id}: prohibited action`);
      if (row.proposal.make !== before.make || row.proposal.model !== before.model || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years)) errors.push(`${row.id}: identity drift`);
      if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: status drift`);
      if (row.action === 'keep_published_pending_source' && (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields.length !== 0)) errors.push(`${row.id}: changed hold`);
    }
  }

  const ids = decisions.map((row) => row.id);
  const missingIds = [...frozenById.keys()].filter((id) => !seen.has(id));
  const extraIds = [...seen.keys()].filter((id) => !frozenById.has(id));
  const duplicateIds = [...seen.entries()].filter(([, count]) => count !== 1).map(([id]) => id);
  const rewriteIds = decisions.filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort();
  decisions.sort((left, right) => left.id.localeCompare(right.id));

  if (ids.length !== 73 || missingIds.length || extraIds.length || duplicateIds.length) errors.push('catalog coverage mismatch');
  if (!equal(rewriteIds, EXPECTED_REWRITE_IDS)) errors.push('rewrite allowlist mismatch');
  if (!equal(packet.rewriteIds, EXPECTED_REWRITE_IDS)) errors.push('packet rewrite list mismatch');
  if (!equal(packet.modelPackets, modelPackets)) errors.push('model packet manifest mismatch');
  if (!equal(packet.decisions, decisions)) errors.push('decision manifest mismatch');
  if (!equal(packet.summary, { rewrite_same_identity: 6, keep_published_pending_source: 67, total: 73 })) errors.push('summary mismatch');
  if (!equal(packet.invariants, { missingIds: 0, extraIds: 0, duplicateIds: 0, identityDrift: 0, statusDrift: 0, changedHolds: 0, archiveDeleteRedirectOrNewIssue: 0 })) errors.push('invariant summary mismatch');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validateReconciliation(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), modelCount: packet.models?.length || 0, decisionCount: packet.decisions?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_MODELS, EXPECTED_REWRITE_IDS, PACKET, SNAPSHOT, validateReconciliation };
