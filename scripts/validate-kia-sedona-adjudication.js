/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  CAMPAIGN_SOURCES, CLEANUP_CARDS, CLEANUP_IDS, COMMERCE_BOUNDARY_SOURCES, DEFERRED_CAMPAIGNS,
  EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY,
  FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, PDF_SOURCES, SNAPSHOT,
  actionFor, cleanupProposal, evidenceFor, reasonFor,
} = require('./build-kia-sedona-adjudication');

const EXPECTED_SUMMARY = { targeted_safety_cleanup_pending_source: 5, total: 5 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Sedona');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = CLEANUP_IDS.slice().sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Sedona') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 5 || modelRows.length !== 5 || ids.length !== 5 || new Set(ids).size !== 5) errors.push('Sedona row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.commerceBoundarySources, COMMERCE_BOUNDARY_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('official source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('local source map mismatch');
  if (!equal(packet.expectedPre2010RecallInventory, EXPECTED_PRE_2010_RECALL_INVENTORY) || !equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.expectedCompleteRecallInventory, EXPECTED_COMPLETE_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const expectedProposal = cleanupProposal(frozen);
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
  const battery = byId.get(IDS.battery);
  if (!/Neither bulletin identifies the power sliding-door module/i.test(battery?.proposal?.description || '') || !/Do not pull a generic fuse/i.test(battery?.proposal?.solution || '') || battery?.proposal?.citations?.length !== 2) errors.push('battery attribution correction mismatch');
  const cable = byId.get(IDS.cable);
  if (!/liftgate-glass hinge for 2008-2012 Jeep Liberty/i.test(cable?.proposal?.description || '') || /924-554/.test(JSON.stringify(cable?.proposal?.communityRecommendations || [])) || !/Do not order Dorman 924-554/i.test(cable?.proposal?.solution || '')) errors.push('cable false-fitment correction mismatch');
  const transmission = byId.get(IDS.transmission);
  if (!/conflates two transmissions/i.test(transmission?.proposal?.description || '') || !/only when a transmission is replaced/i.test(transmission?.proposal?.solution || '') || !/Do not perform a routine 30,000-mile flush/i.test(transmission?.proposal?.solution || '') || !equal(transmission?.proposal?.dtcCodes, ['P0741'])) errors.push('transmission safety correction mismatch');
  const latch = byId.get(IDS.latch);
  if (!/different sliding-door concerns by Sedona generation/i.test(latch?.proposal?.description || '') || !/WTY018/.test(latch?.proposal?.solution || '') || latch?.proposal?.citations?.length !== 1) errors.push('latch boundary mismatch');
  const alternator = byId.get(IDS.alternator);
  if (!/does not establish that every 2002-2014 Sedona/i.test(alternator?.proposal?.description || '') || !/Do not add improvised heat shielding/i.test(alternator?.proposal?.solution || '')) errors.push('alternator boundary mismatch');
  for (const id of CLEANUP_IDS) if (!CLEANUP_CARDS[id] || byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source' || !blockers.includes(id)) errors.push(`${id}: blocker coverage mismatch`);
  for (const code of ['sedona-battery-module-attribution-corrected', 'sedona-false-dorman-fitment-removed', 'sedona-transmission-flush-advice-removed', 'sedona-six-eight-speed-conflation-separated', 'sedona-door-generations-bounded', 'sedona-23-new-recall-identities-deferred', 'all-sedona-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
