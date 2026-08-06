/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { IDS, KEEP_REASONS, MISMATCH_SOURCES, fullRecord } = require('./build-hyundai-azera-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-azera-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Azera');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Hyundai' || packet.model !== 'Azera') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.azeraRecordCount !== 5 || modelRows.length !== 5 || packet.rows?.length !== 5) errors.push('Azera row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 5) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing Azera ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id); if (!frozen) { errors.push(`unknown Azera ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || !KEEP_REASONS[row.id]) errors.push(`${row.id}: action/reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: frozen content changed`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Hyundai' || row.proposal.model !== 'Azera' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (packet.summary?.rewrite_same_identity !== 0 || packet.summary?.keep_published_pending_source !== 5 || packet.summary?.total !== 5) errors.push('summary mismatch');
  if (!equal(packet.mismatchSources, MISMATCH_SOURCES)) errors.push('mismatch source map mismatch');
  for (const code of ['hydraulic-versus-mdps-identity-mismatch', 'inhibitor-switch-not-starter', 'transmission-bulletin-narrower-identity', 'unverified-timing-chain-claims-frozen']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  for (const id of [IDS.steeringLeak, IDS.strutBearing, IDS.starter, IDS.transmission]) if (!packet.rows?.find((row) => row.id === id)?.evidence?.length) errors.push(`${id}: mismatch evidence missing`);
  return errors;
}
if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2)); if (errors.length) process.exitCode = 1;
}
module.exports = { validatePacket };
