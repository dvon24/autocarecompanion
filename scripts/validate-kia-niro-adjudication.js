/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  CAMPAIGN_SOURCES, CLEANUP_IDS, CLEANUP_REASONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY,
  FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET,
  PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal,
} = require('./build-kia-niro-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 3, targeted_safety_cleanup_pending_source: 4, keep_published_pending_source: 3, total: 10 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Niro');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const expectedBlockers = [...CLEANUP_IDS, ...HOLD_IDS].sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Niro') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, expectedBlockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 10 || modelRows.length !== 10 || ids.length !== 10 || new Set(ids).size !== 10) errors.push('Niro row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('official source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('dataset source map mismatch');
  if (!equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const expectedAction = actionFor(row.id);
    const expectedProposal = REWRITE_IDS.includes(row.id) ? rewriteProposal(frozen) : CLEANUP_IDS.includes(row.id) ? cleanupProposal(frozen) : before;
    if (row.action !== expectedAction || row.reason !== reasonFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (REWRITE_IDS.includes(row.id)) {
      if (!row.changedFields.length || row.commerceDecision !== REWRITE_CARDS[row.id].commerceDecision) errors.push(`${row.id}: rewrite disposition mismatch`);
      if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.dtcCodes, [])) errors.push(`${row.id}: rewrite unsafe fields remain`);
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: rewrite approval/source drift`);
    } else if (CLEANUP_IDS.includes(row.id)) {
      if (!row.changedFields.length || !row.changedFields.includes('humanApproved') || row.proposal.humanApproved !== false) errors.push(`${row.id}: cleanup approval drift`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: search commerce remains`);
    } else if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  for (const id of [IDS.braking, IDS.obc]) if (!equal(byId.get(id)?.proposal?.dtcCodes, [])) errors.push(`${id}: false EGR codes remain`);
  if (!equal(byId.get(IDS.dct)?.proposal?.relatedIssueIds, [])) errors.push('DCT inaccurate related links remain');
  if (!/22V-836\/SC256/i.test(byId.get(IDS.pra)?.proposal?.solution || '') || /SC256, NHTSA 18V-666/i.test(byId.get(IDS.pra)?.proposal?.solution || '')) errors.push('PRA campaign correction mismatch');
  if (!/diagnostic check/i.test(byId.get(IDS.ehrs)?.proposal?.solution || '') || /owner-installed bypass/i.test(byId.get(IDS.ehrs)?.proposal?.solution || '') === false) errors.push('EHRS bounded diagnostic wording mismatch');
  if (!/different-capacity HCA fuse/i.test(byId.get(IDS.hca)?.proposal?.solution || '')) errors.push('HCA remedy mismatch');
  const packetJson = JSON.stringify(packet);
  if (packetJson.match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/) && CLEANUP_IDS.every((id) => !JSON.stringify(byId.get(id)?.proposal).match(/amazon\.com\/s\?k=/))) {
    // Frozen before blocks retain evidence of the defect by design; proposals are checked above.
  }
  for (const code of ['niro-ehrs-ps709-bounded', 'niro-hca-sc276-bounded', 'niro-pra-campaign-number-corrected', 'niro-false-egr-dtcs-removed', 'niro-search-commerce-and-unsafe-fluid-advice-removed', 'niro-inexact-related-links-removed', 'niro-three-broad-aggregations-held', 'niro-nine-new-recall-identities-deferred', 'all-niro-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
