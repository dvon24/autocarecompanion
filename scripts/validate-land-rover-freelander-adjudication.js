/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./land-rover-adjudication-utils');
const {
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  DOCUMENTS,
  IDS,
  OUTPUT: PACKET,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  evidenceFor,
  proposalFor,
} = require('./build-land-rover-freelander-adjudication');

const EXPECTED_SUMMARY = { targeted_safety_cleanup_pending_source: 6, total: 6 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = [
  'freelander-fuel-conditions-not-one-module-failure',
  'freelander-rear-differential-noise-not-seal-leak',
  'freelander-head-gasket-primary-source-gap',
  'freelander-ird-source-is-coolant-hose-not-bearing-failure',
  'freelander-window-symptom-not-regulator-cause',
  'freelander-no-unverified-commerce',
  'freelander-ten-new-campaign-identities-deferred',
  'all-freelander-pages-preserved',
];

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Freelander').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Freelander') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, modelRows.map((row) => row.id))) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 6 || modelRows.length !== 6 || ids.length !== 6 || new Set(ids).size !== 6 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Freelander frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY) || !equal(packet.documentIds, DOCUMENTS)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, []) || !equal(packet.deferredCampaigns, CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (Object.values(BULLETIN_INVENTORY.periodCounts).reduce((sum, count) => sum + count, 0) !== 470 || BULLETIN_INVENTORY.totalRows !== 470) errors.push('manufacturer-communication total mismatch');
  if (BULLETIN_INVENTORY.relevantDocumentCounts.headGasket !== 0 || BULLETIN_INVENTORY.relevantDocumentCounts.fuel !== 16 || BULLETIN_INVENTORY.relevantDocumentCounts.rearDifferential !== 9 || BULLETIN_INVENTORY.relevantDocumentCounts.irdOrVcu !== 3 || BULLETIN_INVENTORY.relevantDocumentCounts.window !== 3) errors.push('relevant-source counts mismatch');
  if (RECALL_INVENTORY.totalRows !== 24 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 24 || CAMPAIGNS.length !== 10) errors.push('recall inventory total mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) {
      errors.push(`${row.id}: unknown ID`);
      continue;
    }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== 'targeted_safety_cleanup_pending_source' || row.commerceDecision !== 'diagnostic-hold-no-verified-retail-part') errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const changedFields = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, changedFields) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length !== 3) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== 'low') errors.push(`${row.id}: publication/source drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if ((row.proposal.citations || []).some((item) => item.url !== BULLETIN_INVENTORY.source || item.type !== 'nhtsa')) errors.push(`${row.id}: non-primary or ambiguous citation survived`);
    if (!/do not (?:order|buy)/i.test(row.proposal.solution) || !/(?:no verified retail part|not one verified retail part|do(?:es)? not identify one (?:verified )?retail part)/i.test(row.proposal.solution)) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row.proposal]));
  if (/fuel pump relay under|diesel models can experience fuel starvation during cornering|30%/i.test(JSON.stringify(byId.get(IDS.fuel) || {}))) errors.push('fuel correction mismatch');
  if (/top off|every 10,000|propshaft universal|Haldex coupling fluid level/i.test(`${byId.get(IDS.rearDiff)?.description || ''} ${byId.get(IDS.rearDiff)?.solution || ''}`)) errors.push('rear-differential correction mismatch');
  if (/rear bank|notorious|aluminum radiator|both head gaskets|P030[0-3]|\$2,000/i.test(JSON.stringify(byId.get(IDS.kv6Head) || {}))) errors.push('KV6 correction mismatch');
  if (/change the IRD fluid every|jack(?:ing)? up one rear wheel|cannot turn it by hand|bearings fail due to inadequate lubrication|unit has no separate drain plug/i.test(JSON.stringify(byId.get(IDS.ird) || {}))) errors.push('IRD correction mismatch');
  if (/50%|80,000|will fail|mandatory upgrade|Payen/i.test(JSON.stringify(byId.get(IDS.kSeriesHead) || {}))) errors.push('K-Series correction mismatch');
  if (/every 6 months|upgrade to the Freelander 2 regulator|eBay|both fronts|driver.?s window is the most/i.test(JSON.stringify(byId.get(IDS.window) || {}))) errors.push('window correction mismatch');

  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPages = packet.observations?.find((item) => item.code === 'all-freelander-pages-preserved');
  if (!equal(allPages?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'freelander-ten-new-campaign-identities-deferred');
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
