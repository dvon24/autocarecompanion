/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
const { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor } = require('./build-jeep-grand-cherokee-l-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-grand-cherokee-l-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee L');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jeep' || packet.model !== 'Grand Cherokee L') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 3 || modelRows.length !== 3 || ids.length !== 3 || new Set(ids).size !== 3) errors.push('Grand Cherokee L row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before) || row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
    if (row.proposal.make !== 'Jeep' || row.proposal.model !== 'Grand Cherokee L' || row.proposal.status !== 'published' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.recallInventory, { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('source map mismatch');
  for (const code of ['grand-cherokee-l-uconnect-tsb-is-2022-only', 'grand-cherokee-l-sunroof-source-is-wind-deflector-not-drains', 'grand-cherokee-l-etorque-commerce-is-unverified', 'all-grand-cherokee-l-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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
