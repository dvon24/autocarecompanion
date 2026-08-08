/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  FULL_RECORD_FIELDS,
  fullRecord,
  hashValue,
  normalizedFileHash,
  stableValue,
} = require('./land-rover-adjudication-utils');
const {
  AIR_SUSPENSION_ID,
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  DEFERRED_CAMPAIGNS,
  DIFF_BREATHER_ID,
  MAPPED_CAMPAIGNS,
  OUTPUT: PACKET,
  PDF_SOURCES,
  PIVI_ID,
  PIVI_RECALL,
  REAR_GLASS_ID,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  actionFor,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
} = require('./build-land-rover-defender-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 43, total: 44 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = [
  'defender-one-exact-pivi-identity-bounded',
  'defender-wading-source-does-not-support-differential-breather',
  'defender-rear-glass-source-contradicts-spontaneous-claim',
  'defender-air-spring-source-bounded',
  'defender-emissions-delete-advice-removed',
  'defender-unverified-dtc-part-fluid-torque-and-conversion-claims-removed',
  'defender-near-duplicate-classic-pages-preserved',
  'defender-nineteen-new-campaign-identities-deferred',
  'all-defender-pages-preserved',
];

function equal(a, b) {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Defender').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = modelRows.filter((row) => row.id !== PIVI_ID).map((row) => row.id);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Defender') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 44 || modelRows.length !== 44 || ids.length !== 44 || new Set(ids).size !== 44 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Defender frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.piviRecall, PIVI_RECALL)) errors.push('primary source map mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (BULLETIN_INVENTORY.rawDefenderRows !== 983 || RECALL_INVENTORY.rawDefenderRows !== 294 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 49 || ALL_CAMPAIGNS.length !== 20 || MAPPED_CAMPAIGNS.length !== 1 || DEFERRED_CAMPAIGNS.length !== 19) errors.push('source inventory totals mismatch');
  if (Object.values(PDF_SOURCES).reduce((total, source) => total + source.pages, 0) !== 14 || Object.values(PDF_SOURCES).some((source) => !/all |single page/.test(source.visualInspection) || source.sha256.length !== 64)) errors.push('PDF visual/hash evidence mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) {
      errors.push(`${row.id}: unknown ID`);
      continue;
    }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length < 2) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: publication/source drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: DTC/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if ((row.proposal.citations || []).some((item) => !/^https:\/\/(?:api|static)\.nhtsa\.gov\//.test(item.url || '') || /[?&](?:k|q|query)=/i.test(item.url || ''))) errors.push(`${row.id}: non-primary or search citation survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  const pivi = byId.get(PIVI_ID);
  if (pivi?.action !== 'rewrite_same_identity' || blockers.includes(PIVI_ID) || pivi?.proposal?.citations?.length !== 3 || !/N795/.test(pivi?.proposal?.description || '') || !/OS4\.4\.0/.test(pivi?.proposal?.description || '') || !/25V016\/N972/.test(pivi?.proposal?.description || '') || !/wired TCU\/GWM\/Pivi recovery/.test(pivi?.proposal?.solution || '')) errors.push('Pivi bounded rewrite mismatch');
  for (const id of blockers) if (byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source') errors.push(`${id}: blocker action mismatch`);

  const air = byId.get(AIR_SUSPENSION_ID);
  const airText = `${air?.proposal?.description || ''} ${air?.proposal?.solution || ''}`;
  if (!/SSM 75281/.test(airText) || !/does not attribute the leak to off-road use/.test(airText) || /mud around height sensors|valve-block contamination|rock punctures/.test(air?.proposal?.solution || '') || air?.proposal?.dtcCodes?.length) errors.push('air-suspension correction mismatch');

  const diff = byId.get(DIFF_BREATHER_ID);
  if (!/does not discuss differential-breather blockage/.test(diff?.proposal?.description || '') || /Install extended breather|relocate the breathers higher/i.test(diff?.proposal?.solution || '') || diff?.proposal?.communityRecommendations?.length) errors.push('differential-breather correction mismatch');

  const glass = byId.get(REAR_GLASS_ID);
  if (!/tailgate glass, not rear quarter glass/.test(glass?.proposal?.description || '') || !/almost always due to impact damage/.test(glass?.proposal?.description || '') || /updated the glass specification|under JLR warranty|adhesive process on later/i.test(glass?.proposal?.solution || '')) errors.push('rear-glass correction mismatch');

  const emissions = [...byId.values()].find((row) => row.id.includes('dpf-egr-vnt'));
  if (/delete plate|EGR blanking|Italian-tune-up|forced regen|WSS-M2C913/i.test(JSON.stringify(emissions?.proposal || {})) || emissions?.proposal?.dtcCodes?.length) errors.push('emissions-delete cleanup mismatch');

  const prohibitedPrescriptions = /STC4096|AMR6103|DA3167|FTC5044|MTF94|Loctite\s*(?:243|270)|160-165 steps|36,000 miles|72k|top-hat cylinder|one-shot grease|electric fan conversion|permanently rust-proof|never rots again/i;
  for (const row of packet.rows || []) if (row.id !== PIVI_ID && prohibitedPrescriptions.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: unsupported prescription survived`);

  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPreserved = packet.observations?.find((item) => item.code === 'all-defender-pages-preserved');
  if (!equal(allPreserved?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'defender-nineteen-new-campaign-identities-deferred');
  if (!equal(deferred?.campaignNumbers, DEFERRED_CAMPAIGNS)) errors.push('deferred-campaign observation mismatch');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({
    passed: errors.length === 0,
    packetSha256: normalizedFileHash(PACKET),
    decisionCount: packet.rows?.length || 0,
    applicationGate: packet.applicationGate,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_SUMMARY, PACKET, REQUIRED_OBSERVATIONS, SNAPSHOT, validatePacket };
