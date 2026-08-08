/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, RECALL_INVENTORY, REVIEW_DATE, SECONDARY_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor, publicPdfSources } = require('./build-lexus-rx-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-rx-adjudication-2026-08-09.json');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const EXPECTED_SUMMARY = Object.freeze({ retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 13, total: 13 });
const OBSERVATION_COVERAGE = Object.freeze({
  'rx-critical-citation-mismatches-corrected': [IDS.oil, IDS.shudder],
  'rx-current-generation-claims-bounded': [IDS.battery, IDS.brakes, IDS.adas, IDS.infotainment],
  'rx-program-and-fitment-scope-corrected': [IDS.dashboard, IDS.earlyTransmission, IDS.waterPump],
  'rx-mechanical-diagnosis-bounded': [IDS.evaporator, IDS.powerSteering, IDS.rearMain, IDS.steeringShaft],
  'rx-unsupported-commerce-removed': BLOCKER_IDS,
  'all-rx-pages-preserved': BLOCKER_IDS,
});
const MARKERS = Object.freeze({
  [IDS.battery]: 'no universal battery, DCM or retail part is asserted.',
  [IDS.evaporator]: 'no universal evaporator or adjacent retail part is asserted.',
  [IDS.brakes]: 'no universal software update, actuator or retail part is asserted.',
  [IDS.dashboard]: 'no universal dashboard, coating or retail part is asserted.',
  [IDS.adas]: 'no universal camera, radar, calibration service or retail part is asserted.',
  [IDS.infotainment]: 'no universal phone, cable, USB hub, display or head unit is asserted.',
  [IDS.oil]: 'no universal PCV valve, piston set, oil viscosity or retail part is asserted.',
  [IDS.powerSteering]: 'no universal hose, pump, rack kit or retail part is asserted.',
  [IDS.rearMain]: 'no universal seal kit, reseal package or retail part is asserted.',
  [IDS.steeringShaft]: 'no universal shaft or retail part is asserted.',
  [IDS.shudder]: 'no universal fluid service, converter or retail part is asserted.',
  [IDS.earlyTransmission]: 'no universal rebuild kit, cooler or retail part is asserted.',
  [IDS.waterPump]: 'no universal pump, thermostat, belt, tensioner or retail part is asserted.',
});
const UNSAFE_PATTERNS = Object.freeze({
  [IDS.battery]: /multiple 2023-2025 RX owners|DCM\)?\/telematics[^.!?]{0,80}(?:not entering sleep|parasitic draw)|dealers typically check[^.!?]{0,80}DCM/i,
  [IDS.evaporator]: /develops pinhole leaks from internal corrosion|replace the AC evaporator core and receiver\/drier|8-12 hours|replacing the expansion valve[^.!?]{0,30}recommended/i,
  [IDS.brakes]: /harsh ABS event[^.!?]{0,70}rough pavement|sensation of reduced braking|software reprogramming is the most common/i,
  [IDS.dashboard]: /highest-volume model affected|3,500\+ complaints|6,000|under Lexus Customer Support Program ZE7|free of charge/i,
  [IDS.adas]: /commonly related to camera\/radar obstruction|calibration drift|dealers may apply software updates or replace/i,
  [IDS.infotainment]: /widely reported|pattern suggests a mix of software bugs|dealers may replace the display\/audio ECU/i,
  [IDS.oil]: /quart every 1,500-3,000|piston ring design allows oil|Toyota TSB 0094-14|piston ring replacement is the definitive fix/i,
  [IDS.powerSteering]: /both RX300 and RX330 generations commonly develop|especially from the high-pressure hose/i,
  [IDS.rearMain]: /owners frequently report persistent engine oil leaks[^.!?]{0,80}(?:rear main|timing cover)/i,
  [IDS.steeringShaft]: /commonly develop a clunk|condition is usually caused by wear or lash|replacement of the intermediate steering shaft is the usual fix/i,
  [IDS.shudder]: /torque converter clutch material wearing|drain-and-fill[^.!?]{0,50}resolves|do not flush|30,000-40,000 miles|L-SB-0162-19/i,
  [IDS.earlyTransmission]: /U140E\/U151E[^.!?]{0,50}2000|runs hot and is heavily stressed|add an auxiliary transmission cooler after replacement/i,
  [IDS.waterPump]: /fails prematurely|60,000-100,000 miles|WPT-190|replace the water pump and thermostat|replace the drive belt and tensioner/i,
});

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function hasUnsafePositiveClaim(id, text) {
  return String(text || '').split(/(?<=[.!?])\s+/).some((sentence) => {
    if (!UNSAFE_PATTERNS[id]?.test(sentence)) return false;
    return !/(?:do not|does not|did not|not support|not establish|cannot|unverified|unsupported|rather than|remove|removed|no exact|no source|no verified|not a|invalidat|contradict|exceed|mismatch|instead|without assuming)/i.test(sentence);
  });
}
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'RX').sort((left, right) => left.id.localeCompare(right.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-and-direct-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'RX') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 13 || modelRows.length !== 13 || !equal(ids, BLOCKER_IDS)) errors.push('RX frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources()) || /localPath|C:\\tmp|file:\/\//i.test(JSON.stringify(packet.pdfSources))) errors.push('PDF source boundary mismatch');
  if (!equal(packet.secondarySourceReview, SECONDARY_SOURCES)) errors.push('secondary-source review drift');
  for (const source of Object.values(packet.secondarySourceReview || {})) {
    if (!/^https:\/\//.test(source.url || '') || /google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com/i.test(source.url || '')) errors.push(`secondary source is not a direct URL: ${source.url || '<missing>'}`);
    if (!['reachable-200', 'protected-403-direct-url-reviewed'].includes(source.liveAccess) || !source.assertedBoundary) errors.push(`secondary source boundary missing: ${source.url || '<missing>'}`);
  }
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 1695) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 518 || CAMPAIGNS.length !== 33 || RECALL_INVENTORY.mappedCampaigns.length !== 0) errors.push('recall inventory mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: not in frozen RX scope`); continue; }
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
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: derived-data/commerce drift`);
    if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citation boundary mismatch`);
    if (!String(row.proposal.solution).includes(MARKERS[row.id])) errors.push(`${row.id}: explicit no-commerce marker missing`);
    if (hasUnsafePositiveClaim(row.id, `${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: unsupported positive claim survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|google\.[^/]+\/search|bing\.com\/search/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search-style commerce/source survived`);
    if (/\b0\+ owners have reported this issue\b/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: zero-owner social proof survived`);
  }
  const oil = packet.rows?.find((row) => row.id === IDS.oil)?.proposal;
  if (!/T-SB-0094-11, not 0094-14/i.test(oil?.description || '') || !/2AZ-FE four-cylinder/i.test(oil?.description || '')) errors.push('RX oil-bulletin mismatch disclosure missing');
  const shudder = packet.rows?.find((row) => row.id === IDS.shudder)?.proposal;
  if (!/modified ECM logic/i.test(shudder?.description || '') || !/does not diagnose worn torque-converter clutch material/i.test(shudder?.description || '')) errors.push('RX transmission remedy correction missing');
  const early = packet.rows?.find((row) => row.id === IDS.earlyTransmission)?.proposal;
  if (!/U151E[^.]+later RX330/i.test(early?.description || '')) errors.push('RX U151E scope disclosure missing');
  for (const [code, expectedIds] of Object.entries(OBSERVATION_COVERAGE)) { const observation = packet.observations?.find((item) => item.code === code); if (!observation) errors.push(`missing observation ${code}`); else if (!equal(observation.recordIds, expectedIds)) errors.push(`${code}: record coverage mismatch`); }
  if (!equal(packet, buildPacket(snapshot))) errors.push('packet differs from deterministic rebuild');
  return errors;
}

if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { MARKERS, OBSERVATION_COVERAGE, PACKET, SNAPSHOT, UNSAFE_PATTERNS, hasUnsafePositiveClaim, validatePacket };
