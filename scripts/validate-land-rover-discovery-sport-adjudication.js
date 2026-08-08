/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./land-rover-adjudication-utils');
const {
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  COUPLING_ID,
  DEFERRED_CAMPAIGNS,
  MAPPED_CAMPAIGNS,
  OUTPUT: PACKET,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  ROOF_ID,
  SNAPSHOT,
  TAILGATE_ID,
  THERMOSTAT_ID,
  TRANSMISSION_ID,
  actionFor,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
} = require('./build-land-rover-discovery-sport-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 4, total: 5 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = [
  'discovery-sport-one-transmission-identity-bounded',
  'discovery-sport-false-ltb00523-transmission-association-removed',
  'discovery-sport-active-driveline-not-universal-haldex-oil-starvation',
  'discovery-sport-water-source-excludes-roof-opening-panel',
  'discovery-sport-tailgate-harness-cause-not-supported',
  'discovery-sport-thermostat-scope-bounded',
  'discovery-sport-unsafe-diy-and-unverified-parts-removed',
  'discovery-sport-fourteen-new-campaign-identities-deferred',
  'all-discovery-sport-pages-preserved',
];

function equal(a, b) {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Discovery Sport').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const blockers = modelRows.filter((row) => row.id !== TRANSMISSION_ID).map((row) => row.id);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Discovery Sport') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, blockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 5 || modelRows.length !== 5 || ids.length !== 5 || new Set(ids).size !== 5 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Discovery Sport frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('primary source map mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (BULLETIN_INVENTORY.rawDiscoverySportRows !== 1231 || Object.values(BULLETIN_INVENTORY.periodCounts).reduce((sum, value) => sum + value, 0) !== 1231) errors.push('manufacturer-communication totals mismatch');
  if (RECALL_INVENTORY.rawDiscoverySportRows !== 281 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 18 || ALL_CAMPAIGNS.length !== 14 || MAPPED_CAMPAIGNS.length !== 0 || DEFERRED_CAMPAIGNS.length !== 14) errors.push('recall inventory totals mismatch');
  if (Object.keys(PDF_SOURCES).length !== 8 || Object.values(PDF_SOURCES).reduce((total, source) => total + source.pages, 0) !== 25 || Object.values(PDF_SOURCES).some((source) => !/rendered and inspected/.test(source.visualInspection) || source.sha256.length !== 64)) errors.push('PDF visual/hash evidence mismatch');

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
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length < 3) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    const expectedConfidence = row.id === TRANSMISSION_ID ? 'high' : 'low';
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== expectedConfidence) errors.push(`${row.id}: publication/source drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if ((row.proposal.citations || []).some((item) => !/^https:\/\/static\.nhtsa\.gov\/odi\/tsbs\/[^?]+\.pdf$/i.test(item.url || ''))) errors.push(`${row.id}: non-primary, non-PDF or search citation survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  const transmission = byId.get(TRANSMISSION_ID);
  if (transmission?.action !== 'rewrite_same_identity' || blockers.includes(TRANSMISSION_ID) || transmission?.proposal?.citations?.length !== 2 || !/rough, delayed or sudden shifting/.test(transmission?.proposal?.description || '') || !/historical 2015 U\.S\. warranty extension has expired/.test(transmission?.proposal?.solution || '') || /P0730|P0700|LTB00523/i.test(JSON.stringify(transmission?.proposal || {}))) errors.push('transmission bounded rewrite mismatch');

  const coupling = byId.get(COUPLING_ID);
  if (!/multiple root causes/.test(coupling?.proposal?.description || '') || !/lists no parts/.test(coupling?.proposal?.description || '') || /replace the electronic controller|30,000-40,000 miles|Haldex-approved fluid|U0300/i.test(coupling?.proposal?.solution || '')) errors.push('active-driveline correction mismatch');

  const roof = byId.get(ROOF_ID);
  if (!/without a roof-opening panel/.test(roof?.proposal?.description || '') || !/cannot support the frozen panoramic-roof/.test(roof?.proposal?.description || '') || /Clear all sunroof drain|every 6 months|every 3 months|thin bead of silicone/i.test(JSON.stringify(roof?.proposal || {}))) errors.push('roof-water correction mismatch');

  const tailgate = byId.get(TAILGATE_ID);
  if (!/SSM72441/.test(tailgate?.proposal?.description || '') || !/earth studs G4D480B and G4D481A/.test(tailgate?.proposal?.description || '') || /LTB00546|updated JLR part|additional protective sleeving/i.test(JSON.stringify(tailgate?.proposal || {}))) errors.push('tailgate correction mismatch');

  const thermostat = byId.get(THERMOSTAT_ID);
  if (!/P0128-00/.test(thermostat?.proposal?.description || '') || !/root cause remains under investigation/.test(thermostat?.proposal?.description || '') || /LTB00512|aftermarket aluminum unit|thermal cycling/i.test(thermostat?.proposal?.solution || '')) errors.push('thermostat correction mismatch');

  for (const id of blockers) if (byId.get(id)?.action !== 'targeted_safety_cleanup_pending_source') errors.push(`${id}: blocker action mismatch`);
  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPreserved = packet.observations?.find((item) => item.code === 'all-discovery-sport-pages-preserved');
  if (!equal(allPreserved?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'discovery-sport-fourteen-new-campaign-identities-deferred');
  if (!equal(deferred?.campaignNumbers, DEFERRED_CAMPAIGNS)) errors.push('deferred-campaign observation mismatch');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_SUMMARY, PACKET, REQUIRED_OBSERVATIONS, SNAPSHOT, validatePacket };
