/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./international-adjudication-utils');
const { IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, evidenceFor } = require('./build-international-scout-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-international-scout-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_international-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'International' && row.model === 'Scout');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'International' || packet.model !== 'Scout') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.scoutRecordCount !== 7 || modelRows.length !== 7 || packet.rows?.length !== 7) errors.push('Scout row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 7) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing Scout ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown Scout ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source') errors.push(`${row.id}: action mismatch`);
    if (row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: proposal drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'International' || row.proposal.model !== 'Scout' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id))) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 7, total: 7 })) errors.push('summary mismatch');
  if (!equal(packet.reviewSources, SOURCES)) errors.push('review source map mismatch');
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES, expectedHttpStatus: 400 })) errors.push('mismatch source map mismatch');
  for (const code of ['all-existing-citations-live', 'product-pages-not-defect-proof', 'cooling-remedy-conflict-frozen', 'split-generation-fitment-frozen', 'nhtsa-vintage-model-api-unavailable', 'all-scout-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  if (!equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('ID constant mismatch');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { PACKET, SNAPSHOT, validatePacket };
