/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./infiniti-adjudication-utils');
const { IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, brakeEvidence, recallEvidence, rewriteBrake } = require('./build-infiniti-m37-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-infiniti-m37-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = []; const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'M37'); const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Infiniti' || packet.model !== 'M37') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.m37RecordCount !== 6 || modelRows.length !== 6 || packet.rows?.length !== 6) errors.push('M37 row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || []; if (new Set(ids).size !== 6) errors.push('duplicate or missing IDs'); for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing M37 ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id); if (!frozen) { errors.push(`unknown M37 ID: ${row.id}`); continue; }
    const before = fullRecord(frozen); const isBrake = row.id === IDS.brake; const expectedProposal = isBrake ? rewriteBrake(before) : before;
    if (row.action !== (isBrake ? 'rewrite_same_identity' : 'keep_published_pending_source')) errors.push(`${row.id}: action mismatch`);
    if (!isBrake && row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, expectedProposal)) errors.push(`${row.id}: proposal drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(expectedProposal) || !equal(row.changedFields, diffFields(before, expectedProposal))) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Infiniti' || row.proposal.model !== 'M37' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, isBrake ? brakeEvidence() : recallEvidence(row.id))) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (!isBrake && !equal(row.proposal, row.before)) errors.push(`${row.id}: hold changed`);
    if (isBrake) { for (const field of ['trims', 'engines', 'dtcCodes', 'communityRecommendations', 'fixParts']) if (row.proposal[field]?.length !== 0) errors.push(`${row.id}: ${field} must be empty`); for (const field of ['estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh']) if (row.proposal[field] !== null) errors.push(`${row.id}: ${field} must be null`); if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: approval/source contract mismatch`); }
  }
  if (packet.summary?.rewrite_same_identity !== 1 || packet.summary?.keep_published_pending_source !== 5 || packet.summary?.total !== 6) errors.push('summary mismatch');
  if (!equal(packet.primarySources, { brake: SOURCES.brake }) || !equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES })) errors.push('source map mismatch');
  for (const code of ['brake-judder-exact-source-rewrite', 'five-m37-identities-frozen', 'm37-recall-inventory-empty', 'all-m37-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  if (packet.observations?.find((item) => item.code === 'm37-recall-inventory-empty')?.campaignCount !== 0) errors.push('empty recall contract mismatch');
  return errors;
}
if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { validatePacket };
