/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jaguar-adjudication-utils');
const { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor } = require('./build-jaguar-i-pace-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jaguar-i-pace-adjudication-2026-08-06.json'); const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = []; const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'I-PACE'); const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jaguar' || packet.model !== 'I-PACE') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || packet.rows?.length !== 4) errors.push('I-PACE row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || []; if (new Set(ids).size !== 4) errors.push('duplicate or missing IDs'); for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing I-PACE ID: ${id}`);
  for (const row of packet.rows || []) { const frozen = frozenById.get(row.id); if (!frozen) { errors.push(`unknown I-PACE ID: ${row.id}`); continue; } const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before)) errors.push(`${row.id}: proposal drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Jaguar' || row.proposal.model !== 'I-PACE' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id))) errors.push(`${row.id}: evidence drift`); for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 })) errors.push('summary mismatch');
  if (!equal(packet.reviewSources, SOURCES) || !equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.sourceArtifactSha256, PDF_SHA256) || !equal(packet.visuallyInspectedPages, VISUALLY_INSPECTED_PAGES)) errors.push('review source map mismatch');
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('mismatch source map mismatch');
  for (const code of ['i-pace-12v-vin-year-remedy-scope', 'i-pace-cold-weather-outcome-scope-mismatch', 'i-pace-contactor-primary-source-gap', 'i-pace-ota-year-module-remedy-scope', 'i-pace-existing-citations-missing-urls', 'all-i-pace-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  if (!equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('ID constant mismatch'); if (modelRows.some((row) => row.citations.some((citation) => citation.url))) errors.push('frozen citation URL assumption mismatch'); return errors;
}
if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { PACKET, SNAPSHOT, validatePacket };
