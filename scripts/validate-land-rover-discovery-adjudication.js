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
  AIR_COMPRESSOR_ID,
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  DEFERRED_CAMPAIGNS,
  DPF_ID,
  EGR_ID,
  HEIGHT_SENSOR_ID,
  MAPPED_CAMPAIGNS,
  OUTPUT: PACKET,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  TERRAIN_RESPONSE_ID,
  WATER_INGRESS_ID,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
} = require('./build-land-rover-discovery-adjudication');

const EXPECTED_SUMMARY = { targeted_safety_cleanup_pending_source: 6, total: 6 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = [
  'discovery-two-false-jlr-bulletin-associations-removed',
  'discovery-air-compressor-scope-bounded',
  'discovery-dpf-regeneration-prescriptions-removed',
  'discovery-egr-emissions-modification-advice-removed',
  'discovery-height-sensor-replacement-contradicted',
  'discovery-water-ingress-universal-diy-advice-removed',
  'discovery-terrain-response-parts-not-proven',
  'discovery-forty-seven-new-campaign-identities-deferred',
  'all-discovery-pages-preserved',
];

function equal(a, b) {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Discovery').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = modelRows.map((row) => row.id);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Discovery') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 6 || modelRows.length !== 6 || ids.length !== 6 || new Set(ids).size !== 6 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Discovery frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('primary source map mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (BULLETIN_INVENTORY.rawDiscoveryRows !== 2741 || Object.values(BULLETIN_INVENTORY.periodCounts).reduce((sum, value) => sum + value, 0) !== 2741) errors.push('manufacturer-communication totals mismatch');
  if (RECALL_INVENTORY.rawDiscoveryRows !== 465 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 122 || ALL_CAMPAIGNS.length !== 47 || MAPPED_CAMPAIGNS.length !== 0 || DEFERRED_CAMPAIGNS.length !== 47) errors.push('recall inventory totals mismatch');
  if (Object.values(PDF_SOURCES).reduce((total, source) => total + source.pages, 0) !== 33 || Object.values(PDF_SOURCES).some((source) => !/rendered and inspected/.test(source.visualInspection) || source.sha256.length !== 64)) errors.push('PDF visual/hash evidence mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) {
      errors.push(`${row.id}: unknown ID`);
      continue;
    }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== 'targeted_safety_cleanup_pending_source' || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length < 2) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== 'low') errors.push(`${row.id}: publication/source drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if ((row.proposal.citations || []).some((item) => !/^https:\/\/static\.nhtsa\.gov\/odi\/tsbs\/[^?]+\.pdf$/i.test(item.url || ''))) errors.push(`${row.id}: non-primary, non-PDF or search citation survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|fordpartsgiant|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce, unrelated retailer or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  const air = byId.get(AIR_COMPRESSOR_ID);
  if (!/LTB00420NAS3/.test(air?.proposal?.description || '') || !/2005-2009 LR3 and 2010-2012 LR4/.test(air?.proposal?.description || '') || /Arnott|P-2618|road spray|thermal fuse|most common/i.test(JSON.stringify(air?.proposal || {}))) errors.push('air-compressor correction mismatch');

  const dpf = byId.get(DPF_ID);
  if (!/LTB00445 citation does not document a DPF regeneration strategy/.test(dpf?.proposal?.description || '') || !/low turbocharger boost pressure/.test(dpf?.proposal?.description || '') || /perform a forced regeneration|use a DPF cleaner|drive (?:the vehicle )?(?:at|on) highway/i.test(dpf?.proposal?.solution || '')) errors.push('DPF correction mismatch');

  const egr = byId.get(EGR_ID);
  if (!/LTB00498NAS1 is a transfer-case whine bulletin/.test(egr?.proposal?.description || '') || !/does not concern an EGR cooler/.test(egr?.proposal?.description || '') || /delete kit|off-road use only|8-12 hours/i.test(JSON.stringify(egr?.proposal || {}))) errors.push('EGR correction mismatch');

  const height = byId.get(HEIGHT_SENSOR_ID);
  if (!/SSM 45714 warns against replacing a height sensor/.test(height?.proposal?.description || '') || !/SSM 73563 attributes/.test(height?.proposal?.description || '') || height?.proposal?.citations?.length !== 2 || /keep a spare|plastic link|C1A23/i.test(JSON.stringify(height?.proposal || {}))) errors.push('height-sensor correction mismatch');

  const water = byId.get(WATER_INGRESS_ID);
  if (water?.proposal?.citations?.length !== 0 || !/did not provide one public primary source/.test(water?.proposal?.description || '') || /clear all four drains|compressed air from the top|waterproof cover over (?:the )?BECM/i.test(JSON.stringify(water?.proposal || {}))) errors.push('water-ingress correction mismatch');

  const terrain = byId.get(TERRAIN_RESPONSE_ID);
  if (!/outside this page's frozen 2005-2016 scope/.test(terrain?.proposal?.description || '') || !/no parts are required/.test(terrain?.proposal?.description || '') || /70%|P1889|U0102|C1A00/i.test(JSON.stringify(terrain?.proposal || {}))) errors.push('terrain-response correction mismatch');

  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPreserved = packet.observations?.find((item) => item.code === 'all-discovery-pages-preserved');
  if (!equal(allPreserved?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'discovery-forty-seven-new-campaign-identities-deferred');
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
