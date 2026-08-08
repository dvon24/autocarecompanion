/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  COMPLAINT_INVENTORY,
  IDS,
  OUTPUT: PACKET,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SECONDARY_SOURCES,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
  publicPdfSources,
} = require('./build-lexus-ls400-adjudication');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status'];
const EXPECTED_SUMMARY = { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 6, total: 6 };
const OBSERVATION_COVERAGE = Object.freeze({
  'ls400-direct-evidence-retains-identities': BLOCKER_IDS,
  'ls400-universal-claims-removed': BLOCKER_IDS,
  'ls400-parts-prescriptions-bounded': BLOCKER_IDS,
  'ls400-nhtsa-complaints-bounded': [IDS.powerSteering],
  'all-ls400-pages-preserved': BLOCKER_IDS,
});
const MARKERS = Object.freeze({
  [IDS.ecu]: 'This is unit-specific specialist electronics repair; no universal retail part is asserted.',
  [IDS.ballJoint]: 'This is vehicle-specific suspension service; no universal retail part is asserted.',
  [IDS.oilLeak]: 'This is vehicle-specific leak diagnosis and service; no universal retail part is asserted.',
  [IDS.starter]: 'This is VIN-specific starter service; no universal retail part is asserted.',
  [IDS.timing]: 'This is model-year-specific scheduled service; no universal retail kit is asserted.',
  [IDS.powerSteering]: 'This is vehicle-specific steering and charging-system diagnosis; no universal retail part is asserted.',
});
const UNSAFE_PATTERNS = Object.freeze({
  [IDS.ecu]: /essentially every|recap the ECU|baking soda|vinegar|Rubycon|Nichicon|Chemi-?Con/i,
  [IDS.ballJoint]: /15,?000|12[ -]month|replace[^.!?]{0,60}in pairs|OEM\/Aisin|Moog|\b555\b|integral[^.!?]{0,50}control arm/i,
  [IDS.oilLeak]: /replace all three|bundle[^.!?]{0,60}timing|multiple sources typically/i,
  [IDS.starter]: /100,?000[^.!?]{0,30}200,?000|heater[- ]control valve|\bDenso\b|replace[^.!?]{0,40}every hose/i,
  [IDS.timing]: /90,?000|7[ -]year|non-interference|\binterference\b|\bAisin\b|\bGates\b|whole kit/i,
  [IDS.powerSteering]: /worst[^.!?]{0,30}1991[^.!?]{0,20}1997|\bDenso\b|conventional (?:power steering|PS) fluid|replace[^.!?]{0,50}alternator/i,
});

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function hasUnsafePositiveClaim(id, text) {
  return String(text || '').split(/(?<=[.!?])\s+/).some((sentence) => {
    if (!UNSAFE_PATTERNS[id]?.test(sentence)) return false;
    return !/\b(?:do not|does not|did not|not establish|not support|cannot|unverified|unsupported|rather than|remove|removed)\b/i.test(sentence);
  });
}
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LS400').sort((left, right) => left.id.localeCompare(right.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-and-direct-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'LS400') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 6 || modelRows.length !== 6 || !equal(ids, BLOCKER_IDS)) errors.push('LS400 frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources()) || /localPath|C:\\tmp|file:\/\//i.test(JSON.stringify(packet.pdfSources))) errors.push('PDF source boundary mismatch');
  if (!equal(packet.secondarySourceReview, SECONDARY_SOURCES)) errors.push('secondary-source review drift');
  for (const source of Object.values(packet.secondarySourceReview || {})) {
    if (!/^https:\/\//.test(source.url || '') || /google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com/i.test(source.url || '')) errors.push(`secondary source is not a direct URL: ${source.url || '<missing>'}`);
    if (!['reachable-200','protected-403-direct-url-reviewed'].includes(source.liveAccess) || !source.assertedBoundary) errors.push(`secondary source boundary missing: ${source.url || '<missing>'}`);
  }
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 225 || BULLETIN_INVENTORY.overlapping1990To2000Rows !== 26) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 421 || CAMPAIGNS.length !== 9 || RECALL_INVENTORY.mappedCampaigns.length !== 0) errors.push('recall inventory mismatch');
  if (!equal(packet.complaintInventory, COMPLAINT_INVENTORY) || COMPLAINT_INVENTORY.totalRows !== 350 || !equal(COMPLAINT_INVENTORY.powerSteeringLeakReportIds, [10189177,10253002,10478319])) errors.push('complaint inventory mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: not in frozen LS400 scope`); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source' || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const changedFields = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, changedFields) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length !== 4) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (!['high','medium','low'].includes(row.proposal.severity) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== contentFor(row.id).confidence) errors.push(`${row.id}: publication/source/severity/confidence drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow,row.proposal.estimatedCostHigh,row.proposal.typicalMileageLow,row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citation boundary mismatch`);
    if (!String(row.proposal.solution).includes(MARKERS[row.id])) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (hasUnsafePositiveClaim(row.id, `${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: unsupported positive claim survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|google\.[^/]+\/search|bing\.com\/search/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search-style commerce/source survived`);
    if (row.id !== IDS.powerSteering && JSON.stringify(row.proposal.citations).includes(COMPLAINT_INVENTORY.source)) errors.push(`${row.id}: complaints citation leaked outside supported row`);
  }
  for (const [code, expectedIds] of Object.entries(OBSERVATION_COVERAGE)) {
    const observation = packet.observations?.find((item) => item.code === code);
    if (!observation) errors.push(`missing observation ${code}`);
    else if (!equal(observation.recordIds, expectedIds)) errors.push(`${code}: record coverage mismatch`);
  }
  const complaintObservation = packet.observations?.find((item) => item.code === 'ls400-nhtsa-complaints-bounded');
  if (!equal(complaintObservation?.complaintIds, COMPLAINT_INVENTORY.powerSteeringLeakReportIds)) errors.push('complaint observation ID mismatch');
  if (!equal(packet, buildPacket(snapshot))) errors.push('packet differs from deterministic rebuild');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { MARKERS, OBSERVATION_COVERAGE, PACKET, SNAPSHOT, UNSAFE_PATTERNS, hasUnsafePositiveClaim, validatePacket };
