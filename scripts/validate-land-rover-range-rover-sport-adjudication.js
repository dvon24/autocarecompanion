/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./land-rover-adjudication-utils');
const {
  BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, CANDIDATE_DOCUMENT_COUNTS, DEFERRED_CAMPAIGNS, DOCUMENTS, IDS, MAPPED_CAMPAIGNS,
  OUTPUT: PACKET, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, REWRITE_IDS, SNAPSHOT,
  actionFor, evidenceFor, proposalFor,
} = require('./build-land-rover-range-rover-sport-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 4, targeted_safety_cleanup_pending_source: 7, total: 11 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status'];
const REQUIRED_OBSERVATIONS = ['sport-four-identities-bounded','sport-seven-identities-held','sport-dpf-regeneration-claim-corrected','sport-two-campaign-identities-mapped','sport-fifty-campaign-identities-deferred','sport-no-unverified-commerce','all-range-rover-sport-pages-preserved'];
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Range Rover Sport').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Land Rover' || packet.model !== 'Range Rover Sport') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 11 || modelRows.length !== 11 || ids.length !== 11 || new Set(ids).size !== 11 || !equal(ids, modelRows.map((row) => row.id))) errors.push('Range Rover Sport frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY) || !equal(packet.documentIds, DOCUMENTS) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('complete source inventory mismatch');
  if (!equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('campaign partition mismatch');
  if (BULLETIN_INVENTORY.totalRows !== 3273 || Object.values(BULLETIN_INVENTORY.periodCounts).reduce((sum, count) => sum + count, 0) !== 3273 || !equal(BULLETIN_INVENTORY.candidateDocumentCounts, CANDIDATE_DOCUMENT_COUNTS)) errors.push('manufacturer-communication inventory mismatch');
  if (RECALL_INVENTORY.totalRows !== 550 || RECALL_INVENTORY.uniqueCampaignYearModelRows !== 98 || CAMPAIGNS.length !== 52 || MAPPED_CAMPAIGNS.length !== 2 || DEFERRED_CAMPAIGNS.length !== 50) errors.push('recall inventory total mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.commerceDecision !== 'diagnostic-or-recall-remedy-no-universal-retail-part') errors.push(`${row.id}: decision mismatch`);
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
    if (!(row.proposal.citations || []).length || row.proposal.citations.some((citation) => !/^https:\/\/(?:www\.nhtsa\.gov|static\.nhtsa\.gov|api\.nhtsa\.gov)\//i.test(citation.url || ''))) errors.push(`${row.id}: primary citation mismatch`);
    if (!/\bno\b[^.]{0,120}\bretail part\b|do(?:es)? not identify (?:one )?(?:verified|universal) retail part/i.test(row.proposal.solution)) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce or placeholder survived`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row.proposal]));
  const oldSolutionPatterns = {
    [IDS.air]: /consider an AMK compressor upgrade|convert to coil springs/i,
    [IDS.crank]: /replace the crankshaft position sensor with a genuine JLR or Bosch|sensor is located on the lower front/i,
    [IDS.dpf]: /30\+ minute highway drive weekly|consider fuel additives/i,
    [IDS.epb]: /one per rear caliper|apply anti-seize and dielectric grease/i,
    [IDS.rearDiff]: /refill with the correct differential fluid \(75W-90|inspect the driveshaft center bearing/i,
    [IDS.transfer]: /replace the transfer case actuator motor|Use Genuine JLR fluid \(IYK500010\)|replace every 60,000 miles/i,
    [IDS.transmission]: /replace or rebuild the valve body|ZF Lifeguard 8|upgraded solenoids/i,
    [IDS.hybrid]: /repairs reported include replacing the 48V battery pack, DC-DC converter/i,
    [IDS.pivi]: /repeated hard resets do not resolve/i,
    [IDS.camera]: /inspect camera connectors, tailgate harness routing/i,
    [IDS.water]: /checking tailgate weatherstrips|replacing distorted seals/i,
  };
  for (const [id, pattern] of Object.entries(oldSolutionPatterns)) if (pattern.test(byId.get(id)?.solution || '')) errors.push(`${id}: frozen unsafe advice survived`);
  for (const code of REQUIRED_OBSERVATIONS) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  const allPages = packet.observations?.find((item) => item.code === 'all-range-rover-sport-pages-preserved');
  if (!equal(allPages?.recordIds, modelRows.map((row) => row.id))) errors.push('all-pages preservation observation mismatch');
  const mapped = packet.observations?.find((item) => item.code === 'sport-two-campaign-identities-mapped');
  if (!equal(mapped?.campaignNumbers, MAPPED_CAMPAIGNS.map((item) => item.campaignNumber))) errors.push('mapped-campaign observation mismatch');
  const deferred = packet.observations?.find((item) => item.code === 'sport-fifty-campaign-identities-deferred');
  if (!equal(deferred?.campaignNumbers, DEFERRED_CAMPAIGNS)) errors.push('deferred-campaign observation mismatch');
  return errors;
}
if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { EXPECTED_SUMMARY, PACKET, REQUIRED_OBSERVATIONS, SNAPSHOT, validatePacket };
