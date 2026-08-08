/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  ALL_IDS, CAMPAIGN_SOURCES, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS,
  EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY,
  EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, KIA_HTML_SOURCES,
  MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, PDF_SOURCES, REWRITE_IDS, SNAPSHOT,
  actionFor, evidenceFor, proposalFor, reasonFor,
} = require('./build-kia-seltos-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 5, targeted_safety_cleanup_pending_source: 4, total: 9 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Seltos');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = CLEANUP_IDS.slice().sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Seltos') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 9 || modelRows.length !== 9 || ids.length !== 9 || new Set(ids).size !== 9) errors.push('Seltos row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal(ids.slice().sort(), ALL_IDS.slice().sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.expectedCampaigns, EXPECTED_CAMPAIGNS) || !equal(packet.kiaHtmlSources, KIA_HTML_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('official source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('local source map mismatch');
  if (!equal(packet.expectedPre2010RecallInventory, EXPECTED_PRE_2010_RECALL_INVENTORY) || !equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.expectedCompleteRecallInventory, EXPECTED_COMPLETE_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.reason !== reasonFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (!row.changedFields.length || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: proposal approval/source drift`);
    if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: commerce/relation drift`);
    if ((row.proposal.communityRecommendations || []).some((item) => /[?&](?:k|q|query)=/i.test(item.affiliateUrl || ''))) errors.push(`${row.id}: search commerce survived`);
    if ((row.proposal.citations || []).some((item) => /[?&](?:k|q|query)=/i.test(item.url || ''))) errors.push(`${row.id}: search citation survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  const dct = byId.get(IDS.dct);
  if (!/2024 turbo powertrain replaced the outgoing 7-speed DCT with an 8-speed automatic/i.test(dct?.proposal?.description || '') || !equal(dct?.proposal?.dtcCodes, ['P060194']) || !/Do not use SA454 to diagnose a 2024-2025 vehicle/i.test(dct?.proposal?.solution || '')) errors.push('DCT generation/scope correction mismatch');
  const ivt = byId.get(IDS.ivt);
  if (!/certain 2021 Seltos/i.test(ivt?.proposal?.description || '') || !equal(ivt?.proposal?.dtcCodes, ['P0730', 'P0731', 'P0741', 'P0867']) || !/Do not prescribe Sport mode/i.test(ivt?.proposal?.solution || '')) errors.push('IVT boundary correction mismatch');
  const cluster = byId.get(IDS.cluster);
  if (!/no exact Kia bulletin/i.test(cluster?.proposal?.description || '') || !/Do not promise a software update/i.test(cluster?.proposal?.solution || '') || cluster?.proposal?.citations?.length) errors.push('cluster unsupported-remedy cleanup mismatch');
  const isg = byId.get(IDS.isgPump);
  if (!/23V531000/.test(isg?.proposal?.description || '') || /23V578/.test(isg?.proposal?.description || '') || !/Do not substitute recall 23V578/i.test(isg?.proposal?.solution || '')) errors.push('ISG campaign-number correction mismatch');
  const lamps = byId.get(IDS.lamps);
  if (!/does not prove a single 2021-2025 Seltos defect/i.test(lamps?.proposal?.description || '') || !/Do not promise full assembly replacement/i.test(lamps?.proposal?.solution || '')) errors.push('lamp aggregation correction mismatch');
  const theft = byId.get(IDS.theft);
  if (!/November 21, 2019 through February 28, 2022/i.test(theft?.proposal?.description || '') || !/does not make settlement, reimbursement, insurance or steering-wheel-lock promises/i.test(theft?.proposal?.solution || '')) errors.push('theft boundary correction mismatch');
  const piston = byId.get(IDS.piston);
  if (!/supplier quality deviation/i.test(piston?.proposal?.description || '') || !equal(piston?.proposal?.dtcCodes, ['P1327']) || !/not driving the vehicle and requesting a tow/i.test(piston?.proposal?.solution || '')) errors.push('piston recall correction mismatch');
  const airbag = byId.get(IDS.airbag);
  if (!/no advance warning/i.test(airbag?.proposal?.description || '') || airbag?.proposal?.symptoms?.length) errors.push('airbag warning correction mismatch');
  const post = byId.get(IDS.postRemedy);
  if (!/reviewing 47 complaints/i.test(post?.proposal?.description || '') || !/400-plus stalling complaints or four fires/i.test(post?.proposal?.description || '') || !/do not direct every owner to park outside/i.test(post?.proposal?.solution || '')) errors.push('audit-query count/advice correction mismatch');
  for (const id of CLEANUP_IDS) if (byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source' || !blockers.includes(id)) errors.push(`${id}: blocker coverage mismatch`);
  for (const id of REWRITE_IDS) if (byId.get(id)?.action !== 'rewrite_same_identity' || blockers.includes(id)) errors.push(`${id}: rewrite coverage mismatch`);
  for (const code of ['seltos-wrong-isg-campaign-number-corrected', 'seltos-2024-2025-dct-mismatch-exposed', 'seltos-ivt-scope-bounded', 'seltos-cluster-software-claim-removed', 'seltos-headlamp-drl-fog-aggregation-bounded', 'seltos-audit-query-count-corrected', 'seltos-false-dtcs-and-search-commerce-removed', 'seltos-complete-recall-inventory-mapped', 'all-seltos-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
