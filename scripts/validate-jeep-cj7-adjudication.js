/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
const { EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, WEB_SOURCES, evidenceFor } = require('./build-jeep-cj7-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-cj7-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'CJ-7');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jeep' || packet.model !== 'CJ-7') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 6 || modelRows.length !== 6 || ids.length !== 6 || new Set(ids).size !== 6) errors.push('CJ-7 row count or duplicate mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: proposal drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Jeep' || row.proposal.model !== 'CJ-7' || row.proposal.status !== 'published' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 })) errors.push('summary mismatch');
  if (!equal(packet.webSources, WEB_SOURCES) || !equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('source map mismatch');
  for (const code of ['cj7-axle-commerce-partial-year-fitment', 'cj7-steering-source-year-and-tubing-mismatch', 'cj7-emissions-delete-guidance-needs-manual-review', 'all-cj7-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { PACKET, SNAPSHOT, validatePacket };
