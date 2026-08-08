/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, DEFERRED_CAMPAIGNS, IDS, MAPPED_CAMPAIGNS, OUTPUT: PACKET, PDF_SOURCES, PRESSROOM_URL, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor, evidenceFor, proposalFor } = require('./build-lexus-ls-adjudication');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status'];
const OBSERVATION_COVERAGE = {
  'ls-recall-scopes-corrected': [IDS.airbag, IDS.lamps].sort(),
  'ls-touchscreen-timeline-corrected': [IDS.infotainment],
  'ls-prior-generation-source-gaps': [IDS.airSuspension, IDS.headlight].sort(),
  'ls-no-unverified-commerce': BLOCKER_IDS,
  'ls-thirteen-campaign-identities-deferred': [],
  'all-ls-pages-preserved': BLOCKER_IDS,
};
const EXPECTED_SUMMARY = { remove_false_citation_and_targeted_safety_cleanup_pending_source: 3, replace_incomplete_citation_and_targeted_safety_cleanup_pending_source: 2, total: 5 };
const UNSAFE_PATTERNS = {
  [IDS.airSuspension]: /(?:convert|install|replace|order)[^.!?]{0,90}(?:coil|conversion|compressor|air strut|Arnott|Suncore|Strutmasters|BC Racing|SM-LS460)/i,
  [IDS.headlight]: /(?:replace|order|install)[^.!?]{0,70}(?:height|level|headlight)[^.!?]{0,50}sensor/i,
  [IDS.lamps]: /(?:buy|install|replace)[^.!?]{0,70}(?:Bosch|generic bulb)/i,
  [IDS.airbag]: /(?:replace|buy|install)[^.!?]{0,70}(?:battery|inflator)/i,
  [IDS.infotainment]: /(?:retrofit|install|replace|upgrade)[^.!?]{0,80}(?:touchscreen|head unit|display)|2022[^.!?]{0,60}touchscreen/i,
};
const MARKERS = {
  [IDS.airSuspension]: 'This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
  [IDS.headlight]: 'This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
  [IDS.lamps]: 'This is an equipment-specific recall remedy; no universal retail part is asserted.',
  [IDS.airbag]: 'This is a VIN-and-airbag-serial-specific dealer recall remedy; no universal retail part is asserted.',
  [IDS.infotainment]: 'This is a VIN/head-unit-specific dealer software remedy; no universal retail part is asserted.',
};

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }
function hasUnsafePrescription(id, solution) { return String(solution || '').split(/(?<=[.!?])\s+/).some((sentence) => UNSAFE_PATTERNS[id]?.test(sentence) && !/\b(?:do not|does not|no universal|only when|only where)\b/i.test(sentence)); }
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LS').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'LS') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 5 || modelRows.length !== 5 || !equal(ids, BLOCKER_IDS)) errors.push('LS frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources()) || /localPath|C:\\\\tmp|file:\/\//i.test(JSON.stringify(packet.pdfSources))) errors.push('PDF source boundary mismatch');
  if (packet.pressroomSource?.url !== PRESSROOM_URL || packet.pressroomSource?.pdfUrl !== PDF_SOURCES.pressKit2021.url || !/2021/.test(packet.pressroomSource?.assertedBoundary || '')) errors.push('pressroom source boundary mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 704) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 679 || !equal(packet.mappedCampaigns, MAPPED_CAMPAIGNS) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS) || CAMPAIGNS.length !== 15) errors.push('recall partition mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: not in frozen LS scope`); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== actionFor(row.id) || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const changedFields = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, changedFields) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length !== 3) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    const expectedConfidence = [IDS.lamps, IDS.airbag, IDS.infotainment].includes(row.id) ? 'high' : 'low';
    if (!['high','medium','low'].includes(row.proposal.severity) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== expectedConfidence) errors.push(`${row.id}: publication/source/severity drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow,row.proposal.estimatedCostHigh,row.proposal.typicalMileageLow,row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citation boundary mismatch`);
    if (!String(row.proposal.solution).includes(MARKERS[row.id])) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (hasUnsafePrescription(row.id, row.proposal.solution)) errors.push(`${row.id}: unsupported parts prescription survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce survived`);
  }
  for (const [code, expectedIds] of Object.entries(OBSERVATION_COVERAGE)) { const observation = packet.observations?.find((item) => item.code === code); if (!observation) errors.push(`missing observation ${code}`); else if (!equal(observation.recordIds, expectedIds)) errors.push(`${code}: record coverage mismatch`); }
  if (!equal(packet, buildPacket(snapshot))) errors.push('packet differs from deterministic rebuild');
  return errors;
}

if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { MARKERS, OBSERVATION_COVERAGE, PACKET, SNAPSHOT, validatePacket };
