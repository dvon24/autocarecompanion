/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  CAMPAIGN_SOURCES, CLEANUP_CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY,
  EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET,
  PDF_SOURCES, REWRITE_CARD, REWRITE_ID, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal,
} = require('./build-kia-rio-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 13, total: 14 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Rio');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = CLEANUP_IDS.slice().sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Rio') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 14 || modelRows.length !== 14 || ids.length !== 14 || new Set(ids).size !== 14) errors.push('Rio row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('official source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('local source map mismatch');
  if (!equal(packet.expectedPre2010RecallInventory, EXPECTED_PRE_2010_RECALL_INVENTORY) || !equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.expectedCompleteRecallInventory, EXPECTED_COMPLETE_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = row.id === REWRITE_ID ? rewriteProposal(frozen) : cleanupProposal(frozen);
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
    if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: commerce drift`);
    if ((row.proposal.communityRecommendations || []).some((item) => /[?&](?:k|q|query)=/i.test(item.affiliateUrl || ''))) errors.push(`${row.id}: search commerce survived`);
    if ((row.proposal.citations || []).some((item) => /[?&](?:k|q|query)=/i.test(item.url || ''))) errors.push(`${row.id}: search citation survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  const hecu = byId.get(REWRITE_ID);
  if (hecu?.action !== 'rewrite_same_identity' || !/23V-652/.test(hecu?.proposal?.description || '') || !/replace the HECU fuse/i.test(hecu?.proposal?.solution || '') || /wheel.speed sensor/i.test(JSON.stringify(hecu?.proposal?.communityRecommendations || []))) errors.push('HECU exact rewrite mismatch');
  if (!equal(hecu?.proposal?.years, [2012, 2013, 2014, 2015, 2016, 2017]) || !equal(hecu?.proposal?.dtcCodes, [])) errors.push('HECU scope/code drift');
  const brake = byId.get(IDS.brakeSwitch);
  if (!/contains no Rio/i.test(brake?.proposal?.description || '') || /Kia issued a recall covering/i.test(brake?.proposal?.description || '') || !equal(brake?.proposal?.relatedIssueIds, [])) errors.push('stop-switch correction mismatch');
  const spring = byId.get(IDS.spring);
  if (!/no front-coil-spring campaign/i.test(spring?.proposal?.description || '') || /issued a safety recall/i.test(spring?.proposal?.description || '')) errors.push('spring recall correction mismatch');
  const injector = byId.get(IDS.injector);
  if (!/normal/i.test(injector?.proposal?.description || '') || !/Do not replace all four injectors/i.test(injector?.proposal?.solution || '') || !/mechanical injector cleaning/i.test(injector?.proposal?.solution || '')) errors.push('injector corrective safety mismatch');
  const fca = byId.get(IDS.fca);
  if (!equal(fca?.proposal?.dtcCodes, ['C160649']) || !equal(fca?.proposal?.trims, []) || !/does not establish false braking alerts/i.test(fca?.proposal?.description || '')) errors.push('FCA boundary correction mismatch');
  const ivt = byId.get(IDS.ivt);
  if (!/2020MY/.test(ivt?.proposal?.description || '') || !/Do not apply the 2020-only SA476/i.test(ivt?.proposal?.solution || '') || !equal(ivt?.proposal?.dtcCodes, [])) errors.push('IVT year-boundary mismatch');
  const camera = byId.get(IDS.camera);
  if (!/through May 7, 2015/.test(camera?.proposal?.description || '') || !/Do not apply ELE077/.test(camera?.proposal?.solution || '')) errors.push('rear-camera generation boundary mismatch');
  const ac = byId.get(IDS.ac);
  if ((ac?.proposal?.dtcCodes || []).length || /471-6047/.test(JSON.stringify(ac?.proposal?.communityRecommendations || []))) errors.push('A/C false-code/commerce cleanup mismatch');
  for (const id of CLEANUP_IDS) if (!CLEANUP_CARDS[id] || byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source' || !blockers.includes(id)) errors.push(`${id}: blocker coverage mismatch`);
  for (const code of ['rio-hecu-exact-identity-bounded', 'rio-stop-switch-recall-claim-removed', 'rio-front-spring-recall-claim-removed', 'rio-injector-cleaning-claim-reversed', 'rio-near-match-bulletins-not-stretched', 'rio-thirteen-conflicted-pages-remain-blocked', 'rio-ten-new-recall-identities-deferred', 'all-rio-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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
