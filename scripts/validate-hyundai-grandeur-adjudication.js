/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, hashValue, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { IDS, KEEP_REASONS, OFFICIAL_REGISTRY, SOURCES, fullRecord, rewriteTheta } = require('./build-hyundai-grandeur-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-grandeur-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Grandeur');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Hyundai' || packet.model !== 'Grandeur') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.grandeurRecordCount !== 6 || modelRows.length !== 6 || packet.rows?.length !== 6) errors.push('Grandeur row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 6) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing Grandeur ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown Grandeur ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    const isTheta = row.id === IDS.theta;
    const expected = isTheta ? rewriteTheta(before) : before;
    const expectedAction = isTheta ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction || (!isTheta && !KEEP_REASONS[row.id])) errors.push(`${row.id}: action/reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, expected)) errors.push(`${row.id}: proposal content drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(expected) || !equal(row.changedFields, diffFields(before, expected))) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Hyundai' || row.proposal.model !== 'Grandeur' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (isTheta) {
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported commerce/mileage retained`);
      if (row.proposal.trims?.length || row.proposal.engines?.length || row.proposal.fixParts?.length || row.proposal.communityRecommendations?.length || row.proposal.dtcCodes?.length) errors.push(`${row.id}: rewrite must be applicability/commerce/DTC empty`);
      if (!row.evidence?.length || !row.proposal.citations?.length) errors.push(`${row.id}: official evidence missing`);
      if (row.proposal.citations?.some((item) => !Object.values(SOURCES).includes(item.url))) errors.push(`${row.id}: non-approved public citation`);
      if (row.proposal.humanApproved !== false || row.proposal.source !== 'manual') errors.push(`${row.id}: approval/source mismatch`);
    } else if (row.beforeSha256 !== row.proposalSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hold changed`);
  }
  if (packet.summary?.rewrite_same_identity !== 1 || packet.summary?.keep_published_pending_source !== 5 || packet.summary?.total !== 6) errors.push('summary mismatch');
  if (packet.officialRegistry?.stall?.recordId !== OFFICIAL_REGISTRY.stall.recordId || packet.officialRegistry?.brakeRollback?.recordId !== OFFICIAL_REGISTRY.brakeRollback.recordId) errors.push('registry identity drift');
  for (const code of ['two-exact-post-only-campaigns-frozen', 'five-campaign-bundle-not-collapsed', 'mdps-generation-mismatch-rejected', 'theta-secondary-claims-removed', 'owner-only-oil-leak-row-frozen']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const proposedPublicUrls = (packet.rows || []).flatMap((row) => row.proposal?.citations || []).map((item) => item.url);
  if (proposedPublicUrls.some((url) => /car\.go\.kr\/ri\/(?:stat|grts)\/list\.do/.test(url))) errors.push('POST-only registry list leaked into public citations');
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
