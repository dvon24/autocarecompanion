/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jaguar-adjudication-utils');
const { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, RECALL_QUERIES, SOURCES, evidenceFor } = require('./build-jaguar-e-pace-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jaguar-e-pace-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'E-PACE');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jaguar' || packet.model !== 'E-PACE') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || packet.rows?.length !== 4) errors.push('E-PACE row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 4) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing E-PACE ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown E-PACE ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source') errors.push(`${row.id}: action mismatch`);
    if (row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: proposal drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Jaguar' || row.proposal.model !== 'E-PACE' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id))) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 })) errors.push('summary mismatch');
  if (!equal(packet.reviewSources, SOURCES) || !equal(packet.sourceArtifactSha256, PDF_SHA256)) errors.push('review source map mismatch');
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('mismatch source map mismatch');
  for (const code of ['e-pace-transmission-partial-vin-year-scope', 'e-pace-infotainment-outcome-mismatch', 'e-pace-roof-outcome-mismatch', 'e-pace-coolant-component-mismatch', 'e-pace-existing-citations-missing-urls', 'all-e-pace-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  if (!equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('ID constant mismatch');
  if (modelRows.some((row) => row.citations.some((citation) => citation.url))) errors.push('frozen citation URL assumption mismatch');
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
