/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./land-rover-adjudication-utils');
const {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  DOCUMENTS,
  IDS,
  OUTPUT: PACKET,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  REWRITE_IDS,
  SNAPSHOT,
  actionFor,
  evidenceFor,
  proposalFor,
} = require('./build-land-rover-range-rover-evoque-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 2, targeted_safety_cleanup_pending_source: 2, total: 4 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = [
  'evoque-fuel-pump-cross-generation-association-removed',
  'evoque-haldex-identity-bounded',
  'evoque-incontrol-identity-bounded',
  'evoque-thermostat-cross-generation-association-removed',
  'evoque-no-unverified-commerce',
  'evoque-twenty-six-campaign-identities-deferred',
  'all-evoque-pages-preserved',
];

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Range Rover Evoque').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Range Rover Evoque') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || ids.length !== 4 || new Set(ids).size !== 4 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Evoque frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY) || !equal(packet.documentIds, DOCUMENTS) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, []) || !equal(packet.deferredCampaigns, CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (BULLETIN_INVENTORY.totalRows !== 1861 || Object.values(BULLETIN_INVENTORY.periodCounts).reduce((sum, count) => sum + count, 0) !== 1861) errors.push('manufacturer-communication total mismatch');
  if (!equal(BULLETIN_INVENTORY.relevantDocumentCounts, { fuel: 20, haldex: 10, incontrol: 128, thermostat: 11 })) errors.push('relevant-source counts mismatch');
  if (RECALL_INVENTORY.totalRows !== 68 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 37 || CAMPAIGNS.length !== 26) errors.push('recall inventory total mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.commerceDecision !== 'diagnostic-or-software-remedy-no-universal-retail-part') errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const changedFields = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, changedFields) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length !== 3) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    const confidence = REWRITE_IDS.includes(row.id) ? 'high' : 'low';
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== confidence) errors.push(`${row.id}: publication/source drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    const citations = row.proposal.citations || [];
    if (row.id === IDS.haldex) {
      if (citations.length !== 2 || citations[0].url !== PDF_SOURCES.activeDriveline.url || citations[1].url !== BULLETIN_INVENTORY.source) errors.push(`${row.id}: primary citation mismatch`);
    } else if (citations.length !== 1 || citations[0].url !== BULLETIN_INVENTORY.source || citations[0].type !== 'nhtsa') errors.push(`${row.id}: primary citation mismatch`);
    if (!/\bno\b[^.]{0,100}\bretail part\b|do not identify one verified retail part/i.test(row.proposal.solution)) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row.proposal]));
  if (/replace the high-pressure fuel pump and cam follower with the updated design|clear adaptation values after replacement|ask the dealer about the updated part/i.test(byId.get(IDS.fuel)?.solution || '')) errors.push('fuel correction mismatch');
  if (/replace the Haldex filter and fluid every|new electronic controller or complete coupling replacement|use only Haldex-approved fluid/i.test(byId.get(IDS.haldex)?.solution || '')) errors.push('Haldex correction mismatch');
  if (/perform a master reset|reduce the number of stored Bluetooth devices|after replacing the SSD media unit|consider an aftermarket CarPlay retrofit/i.test(byId.get(IDS.incontrol)?.solution || '')) errors.push('InControl correction mismatch');
  if (/replace the thermostat housing assembly with the updated design|offer aluminum replacements|replace the thermostat at the same time/i.test(byId.get(IDS.thermostat)?.solution || '')) errors.push('thermostat correction mismatch');
  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPages = packet.observations?.find((item) => item.code === 'all-evoque-pages-preserved');
  if (!equal(allPages?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'evoque-twenty-six-campaign-identities-deferred');
  if (!equal(deferred?.campaignNumbers, CAMPAIGNS)) errors.push('deferred-campaign observation mismatch');
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
