/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  ALL_IDS, CAMPAIGN_SOURCES, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS,
  EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY,
  EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MAPPED_CAMPAIGNS,
  MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, PDF_SOURCES, REWRITE_IDS, SNAPSHOT,
  actionFor, evidenceFor, proposalFor, reasonFor,
} = require('./build-kia-telluride-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 6, targeted_safety_cleanup_pending_source: 8, total: 14 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Telluride');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = CLEANUP_IDS.slice().sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Telluride') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 14 || modelRows.length !== 14 || ids.length !== 14 || new Set(ids).size !== 14 || !equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal(ids.slice().sort(), ALL_IDS.slice().sort())) errors.push('Telluride frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.expectedCampaigns, EXPECTED_CAMPAIGNS) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('live source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('frozen source map mismatch');
  if (!equal(packet.expectedPre2010RecallInventory, EXPECTED_PRE_2010_RECALL_INVENTORY) || !equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.expectedCompleteRecallInventory, EXPECTED_COMPLETE_RECALL_INVENTORY) || !equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');
  if (Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).length !== 19 || MAPPED_CAMPAIGNS.length !== 7 || DEFERRED_CAMPAIGNS.length !== 12) errors.push('campaign partition mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(row.id + ': unknown ID'); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.reason !== reasonFor(row.id)) errors.push(row.id + ': decision mismatch');
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(row.id + ': before drift');
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(row.id + ': proposal drift');
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(row.id + ': changed-field drift');
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length < 2) errors.push(row.id + ': evidence drift');
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(row.id + ': immutable ' + field + ' drift');
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(row.id + ': missing ' + field);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || !row.changedFields.length || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(row.id + ': publication/source drift');
    if (row.proposal.reviewedOn !== '2026-08-08' || row.proposal.contentUpdatedOn !== '2026-08-08') errors.push(row.id + ': review date drift');
    if (!equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(row.id + ': DTC/commerce/relation drift');
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(row.id + ': cost/mileage remains');
    if ((row.proposal.citations || []).some((item) => !/^https:\/\/(?:api|static)\.nhtsa\.gov\//.test(item.url || '') || /[?&](?:k|q|query)=/i.test(item.url || ''))) errors.push(row.id + ': non-primary or search citation survived');
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(row.id + ': search commerce or placeholder survived');
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  for (const id of REWRITE_IDS) {
    const row = byId.get(id);
    if (row?.action !== 'rewrite_same_identity' || blockers.includes(id) || !/^dealer-only-no-retail-part-/.test(row?.commerceDecision || '') || row?.proposal?.citations?.length !== 1) errors.push(id + ': rewrite coverage mismatch');
  }
  for (const id of CLEANUP_IDS) {
    const row = byId.get(id);
    if (row?.action !== 'targeted_safety_cleanup_pending_source' || !blockers.includes(id)) errors.push(id + ': blocker coverage mismatch');
  }
  const spare = byId.get(IDS.spare);
  if (!/25V745000/.test(spare?.proposal?.description || '') || !/25V745000, not the previously cited 25V722/.test(spare?.proposal?.solution || '') || /25V-?722/.test(spare?.proposal?.description || '')) errors.push('spare campaign correction mismatch');
  const seat = byId.get(IDS.seat);
  if (!/26V430000/.test(seat?.proposal?.description || '') || !/replaces 24V407/i.test(seat?.proposal?.description || '') || !/electronic fuse assembly/i.test(seat?.proposal?.solution || '') || !/park outside and away from structures/i.test(seat?.proposal?.solution || '')) errors.push('seat supersession correction mismatch');
  const transmission = byId.get(IDS.transmission);
  if (!/TRA089/.test(transmission?.proposal?.description || '') || !/SA428/.test(transmission?.proposal?.description || '') || !/SA490/.test(transmission?.proposal?.description || '') || !/19 listed VINs/i.test(transmission?.proposal?.solution || '') || !/Do not apply a universal reflash-first/i.test(transmission?.proposal?.solution || '')) errors.push('transmission boundary mismatch');
  const windshield = byId.get(IDS.windshield);
  if (!/not a campaign/i.test(windshield?.proposal?.description || '') || /46%|ClearPlex|Safelite|glass thickness/i.test(JSON.stringify(windshield?.proposal || {}))) errors.push('windshield initiative boundary mismatch');
  const infotainment = byId.get(IDS.infotainment);
  if (!/2020-2022 Telluride/i.test(infotainment?.proposal?.description || '') || !/does not establish a 2020-2023 hardware defect/i.test(infotainment?.proposal?.description || '') || !/separate diagnostic conditions/i.test(infotainment?.proposal?.solution || '')) errors.push('infotainment boundary mismatch');
  const oil = byId.get(IDS.oil);
  if (!/Do not attempt to evaporate fuel with a highway drive/i.test(oil?.proposal?.solution || '') || !/current owner literature for the VIN/i.test(oil?.proposal?.solution || '') || oil?.proposal?.dtcCodes?.length || oil?.proposal?.communityRecommendations?.length) errors.push('oil safety cleanup mismatch');
  const thirdRow = byId.get(IDS.thirdRow);
  if (!/Do not carry a passenger/i.test(thirdRow?.proposal?.solution || '') || /pair of pliers|white lithium|Teflon lubricant/i.test(JSON.stringify(thirdRow?.proposal || {}))) errors.push('third-row safety cleanup mismatch');
  for (const code of ['telluride-six-exact-recall-identities-bounded', 'telluride-spare-campaign-number-corrected', 'telluride-seat-recall-supersession-corrected', 'telluride-three-transmission-programs-not-conflated', 'telluride-unsupported-diy-and-commerce-removed', 'telluride-infotainment-and-windshield-scope-bounded', 'telluride-twelve-new-campaign-identities-deferred', 'all-telluride-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push('missing observation ' + code);
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
