/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, rewriteProposal } = require('./build-hyundai-creta-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-creta-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Creta');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Hyundai' || packet.model !== 'Creta') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.cretaRecordCount !== 6 || modelRows.length !== 6 || packet.rows?.length !== 6) errors.push('Creta row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 6) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing Creta ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown Creta ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    const card = REWRITE_CARDS[row.id];
    const expected = card ? rewriteProposal(before, card) : before;
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction || (!card && !KEEP_REASONS[row.id])) errors.push(`${row.id}: action/reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, expected)) errors.push(`${row.id}: proposal content drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(expected) || !equal(row.changedFields, require('./hyundai-adjudication-utils').diffFields(before, expected))) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Hyundai' || row.proposal.model !== 'Creta' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (card) {
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported commerce/mileage retained`);
      if (row.proposal.trims?.length || row.proposal.engines?.length || row.proposal.fixParts?.length || row.proposal.communityRecommendations?.length) errors.push(`${row.id}: rewrite must be applicability/commerce empty`);
      if (row.proposal.citations?.some((citation) => !Object.values(SOURCES).includes(citation.url))) errors.push(`${row.id}: non-approved citation`);
    } else if (row.beforeSha256 !== row.proposalSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hold changed`);
  }
  if (packet.summary?.rewrite_same_identity !== 2 || packet.summary?.keep_published_pending_source !== 4 || packet.summary?.total !== 6) errors.push('summary mismatch');
  for (const code of ['brazil-brake-booster-scope-narrowed', 'india-oil-pump-unsupported-effects-removed', 'multi-failure-narratives-frozen']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  for (const id of [IDS.brakeBooster, IDS.oilPump]) if (!packet.rows?.find((row) => row.id === id)?.evidence?.length) errors.push(`${id}: official evidence missing`);
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
