/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./infiniti-adjudication-utils');
const { IDS, KEEP_REASONS, RECALL_QUERIES, evidenceFor } = require('./build-infiniti-g35-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-infiniti-g35-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'G35');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Infiniti' || packet.model !== 'G35') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.g35RecordCount !== 3 || modelRows.length !== 3 || packet.rows?.length !== 3) errors.push('G35 row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 3) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing G35 ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown G35 ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: action/reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: frozen content changed`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Infiniti' || row.proposal.model !== 'G35' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id))) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (packet.summary?.rewrite_same_identity !== 0 || packet.summary?.keep_published_pending_source !== 3 || packet.summary?.deferred_new_issue_candidates !== 1 || packet.summary?.total !== 3) errors.push('summary mismatch');
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES })) errors.push('recall query map mismatch');
  for (const code of ['three-g35-identities-frozen', 'deferred-new-sensor-issue-candidate', 'three-g35-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const deferred = packet.observations?.find((item) => item.code === 'deferred-new-sensor-issue-candidate');
  if (deferred?.campaignNumber !== '03V455000' || deferred?.recordIds?.length !== 0) errors.push('deferred candidate contract mismatch');
  return errors;
}
if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { validatePacket };
