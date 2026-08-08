/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { CAMPAIGN_SOURCES, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, SNAPSHOT, YOUTUBE_CITATION_CHECKS, actionFor, evidenceFor, proposalFor, reasonFor } = require('./build-kia-sephia-adjudication');

const EXPECTED_SUMMARY = { targeted_safety_cleanup_pending_source: 4, total: 4 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Sephia');
  const frozenById = new Map(modelRows.map((row) => [row.id, row])); const ids = packet.rows?.map((row) => row.id) || []; const blockers = CLEANUP_IDS.slice().sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Sephia') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || ids.length !== 4 || new Set(ids).size !== 4 || !equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('Sephia frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.expectedCampaigns, EXPECTED_CAMPAIGNS) || !equal(packet.youtubeCitationChecks, YOUTUBE_CITATION_CHECKS)) errors.push('live source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('frozen source map mismatch');
  if (!equal(packet.expectedPre2010RecallInventory, EXPECTED_PRE_2010_RECALL_INVENTORY) || !equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.expectedCompleteRecallInventory, EXPECTED_COMPLETE_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id); if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.reason !== reasonFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence?.length !== 2) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (!row.changedFields.length || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: approval/source drift`);
    if (!equal(row.proposal.citations, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, []) || !equal(row.proposal.dtcCodes, [])) errors.push(`${row.id}: citation/commerce/code/relation cleanup drift`);
  }
  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  if (!/complete Kia Sephia manufacturer-communication and recall inventories/i.test(byId.get(IDS.clutch)?.proposal?.description || '') || !/Do not replace the master cylinder, slave cylinder and clutch as a bundle/i.test(byId.get(IDS.clutch)?.proposal?.solution || '')) errors.push('clutch cleanup mismatch');
  if (!/thermal-expansion mechanism/i.test(byId.get(IDS.headGasket)?.proposal?.description || '') || !/Do not automatically order a timing kit/i.test(byId.get(IDS.headGasket)?.proposal?.solution || '')) errors.push('head-gasket cleanup mismatch');
  if (!/no exact primary package establishing premature failure, a 60,000-mile threshold/i.test(byId.get(IDS.wheelBearing)?.proposal?.description || '') || !/do not assume both sides or a generic hub assembly/i.test(byId.get(IDS.wheelBearing)?.proposal?.solution || '')) errors.push('wheel-bearing cleanup mismatch');
  if (!/does not source P0016 or P0017/i.test(byId.get(IDS.timingBelt)?.proposal?.description || '') || !/Do not infer valve damage/i.test(byId.get(IDS.timingBelt)?.proposal?.solution || '')) errors.push('timing-belt cleanup mismatch');
  for (const id of CLEANUP_IDS) if (byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source' || !blockers.includes(id)) errors.push(`${id}: blocker coverage mismatch`);
  for (const code of ['sephia-four-false-video-citations-removed', 'sephia-search-commerce-removed', 'sephia-timing-codes-and-interval-removed', 'sephia-cross-model-relation-removed', 'sephia-eight-new-recall-identities-deferred', 'all-sephia-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}
if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
