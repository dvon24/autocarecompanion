/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, hashValue, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { IDS, KEEP_REASONS, SOURCES, fullRecord, rewriteBrakeBooster, rewriteOilPump } = require('./build-hyundai-hb20-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-hb20-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'HB20');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const rewriteIds = new Set([IDS.oilPumpRecall, IDS.brakeBoosterRecall]);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Hyundai' || packet.model !== 'HB20') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.hb20RecordCount !== 6 || modelRows.length !== 6 || packet.rows?.length !== 6) errors.push('HB20 row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 6) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing HB20 ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`unknown HB20 ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    const isOilPump = row.id === IDS.oilPumpRecall;
    const isBrakeBooster = row.id === IDS.brakeBoosterRecall;
    const isRewrite = rewriteIds.has(row.id);
    const expected = isOilPump ? rewriteOilPump(before) : isBrakeBooster ? rewriteBrakeBooster(before) : before;
    const expectedAction = isRewrite ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction || (!isRewrite && !KEEP_REASONS[row.id])) errors.push(`${row.id}: action/reason mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, expected)) errors.push(`${row.id}: proposal content drift`);
    if (row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(expected) || !equal(row.changedFields, diffFields(before, expected))) errors.push(`${row.id}: hash/change mismatch`);
    if (row.proposal.make !== 'Hyundai' || row.proposal.model !== 'HB20' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (row.proposal.title !== before.title || row.proposal.category !== before.category) errors.push(`${row.id}: title/category continuity drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (isRewrite) {
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported commerce/mileage retained`);
      if (row.proposal.trims?.length || row.proposal.engines?.length || row.proposal.fixParts?.length || row.proposal.communityRecommendations?.length || row.proposal.dtcCodes?.length) errors.push(`${row.id}: rewrite must be applicability/commerce/DTC empty`);
      if (!row.evidence?.length || !row.proposal.citations?.length) errors.push(`${row.id}: official evidence missing`);
      const allowed = isOilPump ? [SOURCES.oilPumpPdf] : [SOURCES.brakeBoosterPdf];
      if (row.proposal.citations?.some((item) => !allowed.includes(item.url))) errors.push(`${row.id}: non-approved public citation`);
      if (row.proposal.humanApproved !== false || row.proposal.source !== 'manual') errors.push(`${row.id}: approval/source mismatch`);
    } else if (row.beforeSha256 !== row.proposalSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hold changed`);
  }
  if (packet.summary?.rewrite_same_identity !== 2 || packet.summary?.keep_published_pending_source !== 4 || packet.summary?.total !== 6) errors.push('summary mismatch');
  for (const code of ['oil-pump-index-pdf-conflict-pdf-controls', 'four-broad-secondary-only-rows-frozen', 'oil-pump-warning-symptoms-removed', 'brake-booster-use-warning-preserved', 'dead-procon-link-removed']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const rewriteCitations = (packet.rows || []).filter((row) => rewriteIds.has(row.id)).flatMap((row) => row.proposal?.citations || []).map((item) => item.url);
  if (rewriteCitations.includes(SOURCES.recallIndex)) errors.push('conflicting recall index leaked into public citations');
  if (rewriteCitations.some((url) => !/^(?:https:\/\/www\.hyundai\.com\.br\/content\/dam\/hmb\/servicos\/recall\/pdf\/|https:\/\/www\.procon\.sp\.gov\.br\/recall-)/.test(url))) errors.push('non-official rewrite citation');
  const oilPump = packet.rows?.find((row) => row.id === IDS.oilPumpRecall);
  if (oilPump?.proposal?.symptoms?.length || /warning light|burning smell|no warning/i.test(JSON.stringify(oilPump?.proposal || {}))) errors.push('unsupported oil-pump warning symptom retained');
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
