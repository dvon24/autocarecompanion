/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
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
} = require('./build-lexus-lx-adjudication');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status'];
const EXPECTED_SUMMARY = { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 7, total: 7 };
const OBSERVATION_COVERAGE = Object.freeze({
  'lx-primary-records-bounded': [IDS.infotainment, IDS.brakes, IDS.occupant, IDS.engine],
  'lx-direct-reports-bounded': [IDS.ahc, IDS.centerDiff, IDS.tailgate],
  'lx-unsupported-prescriptions-removed': BLOCKER_IDS,
  'lx-evidence-mismatch-disclosed': [IDS.brakes],
  'all-lx-pages-preserved': BLOCKER_IDS,
});
const MARKERS = Object.freeze({
  [IDS.infotainment]: 'These are bulletin- and VIN-specific dealer software remedies; no universal retail part is asserted.',
  [IDS.ahc]: 'This is vehicle-specific hydraulic diagnosis; no universal retail part is asserted.',
  [IDS.brakes]: 'This is condition- and vehicle-specific brake diagnosis; no universal retail part is asserted.',
  [IDS.centerDiff]: 'This is vehicle-specific four-wheel-drive diagnosis; no universal retail part is asserted.',
  [IDS.occupant]: 'This is a VIN-specific safety-recall remedy; no retail part is asserted.',
  [IDS.tailgate]: 'This is vehicle-specific power-back-door diagnosis; no universal retail part is asserted.',
  [IDS.engine]: 'This is a VIN-specific safety-recall remedy; no retail part is asserted.',
});
const UNSAFE_PATTERNS = Object.freeze({
  [IDS.infotainment]: /2024-2025|replace[^.!?]{0,50}(?:display|head unit)[^.!?]{0,30}(?:typically|usually)|navigation, camera, and climate/i,
  [IDS.ahc]: /complete AHC overhaul|\$3,?000[^.!?]{0,30}\$6,?000|convert to a conventional spring|actuators, accumulator, (?:and|or) hydraulic lines[^.!?]{0,40}(?:fail|develop)/i,
  [IDS.brakes]: /known pattern|urban driving|towing|upgraded pad|higher-quality replacement rotor|heat-related rotor distortion/i,
  [IDS.centerDiff]: /internal motor degradation|moisture intrusion|replace the center differential lock actuator motor assembly/i,
  [IDS.occupant]: /multiple[^.!?]{0,50}owners|persistent SRS|repeated dealer visits|connector tension/i,
  [IDS.tailgate]: /battery-drain|water intrusion|security[^.!?]{0,30}concern|replace the latch assembly or powered support/i,
  [IDS.engine]: /oil filter inspection|short-block|low oil pressure|misfire\/limp|every V35A/i,
});

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function hasUnsafePositiveClaim(id, text) {
  return String(text || '').split(/(?<=[.!?])\s+/).some((sentence) => {
    if (!UNSAFE_PATTERNS[id]?.test(sentence)) return false;
    return !/(?:do not|does not|did not|not establish|not support|cannot|unverified|unsupported|rather than|remove|removed|no exact)/i.test(sentence);
  });
}
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LX').sort((left, right) => left.id.localeCompare(right.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-and-direct-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'LX') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 7 || modelRows.length !== 7 || !equal(ids, BLOCKER_IDS)) errors.push('LX frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources()) || /localPath|C:\\tmp|file:\/\//i.test(JSON.stringify(packet.pdfSources))) errors.push('PDF source boundary mismatch');
  if (!equal(packet.secondarySourceReview, SECONDARY_SOURCES)) errors.push('secondary-source review drift');
  for (const source of Object.values(packet.secondarySourceReview || {})) {
    if (!/^https:\/\//.test(source.url || '') || /google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com/i.test(source.url || '')) errors.push(`secondary source is not a direct URL: ${source.url || '<missing>'}`);
    if (!['reachable-200', 'protected-403-direct-url-reviewed'].includes(source.liveAccess) || !source.assertedBoundary) errors.push(`secondary source boundary missing: ${source.url || '<missing>'}`);
  }
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 335) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 363 || CAMPAIGNS.length !== 7) errors.push('recall inventory mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: not in frozen LX scope`); continue; }
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
    if (!['high', 'medium', 'low'].includes(row.proposal.severity) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== contentFor(row.id).confidence) errors.push(`${row.id}: publication/source/severity/confidence drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citation boundary mismatch`);
    if (!String(row.proposal.solution).includes(MARKERS[row.id])) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (hasUnsafePositiveClaim(row.id, `${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: unsupported positive claim survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|google\.[^/]+\/search|bing\.com\/search/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search-style commerce/source survived`);
  }
  for (const [code, expectedIds] of Object.entries(OBSERVATION_COVERAGE)) {
    const observation = packet.observations?.find((item) => item.code === code);
    if (!observation) errors.push(`missing observation ${code}`);
    else if (!equal(observation.recordIds, expectedIds)) errors.push(`${code}: record coverage mismatch`);
  }
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
