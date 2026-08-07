/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
const { CAMERA_WAGONEER_MODEL_YEARS, CAMPAIGN_URL, EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor, rewriteCamera } = require('./build-jeep-wagoneer-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-wagoneer-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Wagoneer');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jeep' || packet.model !== 'Wagoneer') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || ids.length !== 4 || new Set(ids).size !== 4) errors.push('Wagoneer row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const rewrite = row.id === IDS.camera;
    const expectedProposal = rewrite ? rewriteCamera(frozen) : before;
    const expectedAction = rewrite ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction) errors.push(`${row.id}: action mismatch`);
    if (!rewrite && row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: hold reason mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    if (!equal(row.changedFields, diffFields(before, expectedProposal))) errors.push(`${row.id}: changed fields drift`);
    if (!equal(row.evidence, evidenceFor(row.id)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    if (row.proposal.make !== 'Jeep' || row.proposal.model !== 'Wagoneer' || row.proposal.status !== 'published' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || !equal(row.proposal.relatedIssueIds, before.relatedIssueIds) || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (!rewrite && (!equal(row.proposal, row.before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, []))) errors.push(`${row.id}: hold drift`);
    if (rewrite) {
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || !equal(row.proposal.trims, []) || !equal(row.proposal.engines, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite safety fields mismatch`);
      if (!equal(row.proposal.citations.map((item) => item.url), [CAMPAIGN_URL])) errors.push(`${row.id}: rewrite citation mismatch`);
    }
  }
  if (!equal(packet.summary, { rewrite_same_identity: 1, keep_published_pending_source: 3, total: 4 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.recallCampaign, { url: CAMPAIGN_URL, expectedWagoneerModelYears: CAMERA_WAGONEER_MODEL_YEARS }) || !equal(packet.recallInventory, { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('official source map mismatch');
  for (const code of ['wagoneer-etorque-investigation-is-2022-only-and-root-cause-open', 'wagoneer-camera-recall-also-includes-2024', 'wagoneer-battery-citation-is-grand-wagoneer', 'wagoneer-air-commerce-unverified', 'all-wagoneer-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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

