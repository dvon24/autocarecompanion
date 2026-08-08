/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const {
  BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, RECALL_INVENTORY, REVIEW_DATE,
  SECONDARY_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor,
  evidenceFor, proposalFor, publicPdfSources,
} = require('./build-lexus-rc-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-rc-adjudication-2026-08-09.json');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const EXPECTED_SUMMARY = Object.freeze({ retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 5, total: 5 });
const OBSERVATION_COVERAGE = Object.freeze({
  'rc-dcm-condition-mismatch-disclosed': [IDS.battery],
  'rc-port-injection-correction': [IDS.carbon],
  'rc-owner-reports-bounded': [IDS.battery, IDS.brakes, IDS.rattle],
  'rc-multimedia-diagnostics-bounded': [IDS.infotainment],
  'rc-unsupported-prescriptions-removed': BLOCKER_IDS,
  'all-rc-pages-preserved': BLOCKER_IDS,
});
const MARKERS = Object.freeze({
  [IDS.battery]: 'This is vehicle-specific electrical diagnosis; no universal battery, DCM or retail part is asserted.',
  [IDS.brakes]: 'This is condition- and vehicle-specific brake diagnosis; no universal retail part is asserted.',
  [IDS.carbon]: 'This is engine-specific diagnosis; no universal cleaning service or retail part is asserted.',
  [IDS.infotainment]: 'This is event- and equipment-specific multimedia diagnosis; no universal cable, port or head unit is asserted.',
  [IDS.rattle]: 'This is location-specific trim diagnosis; no universal felt, foam, clip or retail part is asserted.',
});
const UNSAFE_PATTERNS = Object.freeze({
  [IDS.battery]: /multiple[^.!?]{0,35}owners|DCM[^.!?]{0,45}(?:staying awake|parasitic draw)|dealers typically[^.!?]{0,50}(?:replace|software)|battery replacement[^.!?]{0,45}temporary/i,
  [IDS.brakes]: /current RC models[^.!?]{0,40}report|underlying issue is rotor thickness|pad material transfer|heat cycles|aggressive driving|replace rotors and pads as a set|proper bed-in/i,
  [IDS.carbon]: /without port injection|identically to the IS|40,?000(?:-60,?000)? miles|walnut shell blasting|oil catch can|JLT-3012P|top-tier fuel[^.!?]{0,35}(?:deposit|valve)/i,
  [IDS.infotainment]: /especially frustrating|climate[^.!?]{0,35}integrated|usually software-related|USB cable\/port sensitivity|dealers typically[^.!?]{0,45}(?:replace|update)|certified cable[^.!?]{0,35}(?:reduce|fix)/i,
  [IDS.rattle]: /recurring owner complaint|coupe body style|low-profile tires|firm suspension tuning|well documented|apply felt tape, foam isolators, or revised clips/i,
});

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function hasUnsafePositiveClaim(id, text) {
  return String(text || '').split(/(?<=[.!?])\s+/).some((sentence) => {
    if (!UNSAFE_PATTERNS[id]?.test(sentence)) return false;
    return !/(?:do not|does not|did not|not support|not establish|cannot|unverified|unsupported|rather than|remove|removed|no exact|no source|no verified|not a|invalidat|contradict)/i.test(sentence);
  });
}
function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'RC').sort((left, right) => left.id.localeCompare(right.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-and-direct-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'RC') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 5 || modelRows.length !== 5 || !equal(ids, BLOCKER_IDS)) errors.push('RC frozen-row coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources()) || /localPath|C:\\tmp|file:\/\//i.test(JSON.stringify(packet.pdfSources))) errors.push('PDF source boundary mismatch');
  if (!equal(packet.secondarySourceReview, SECONDARY_SOURCES)) errors.push('secondary-source review drift');
  for (const source of Object.values(packet.secondarySourceReview || {})) {
    if (!/^https:\/\//.test(source.url || '') || /google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com/i.test(source.url || '')) errors.push(`secondary source is not a direct URL: ${source.url || '<missing>'}`);
    if (!['reachable-200', 'protected-403-direct-url-reviewed'].includes(source.liveAccess) || !source.assertedBoundary) errors.push(`secondary source boundary missing: ${source.url || '<missing>'}`);
  }
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 1504) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 42 || CAMPAIGNS.length !== 5 || RECALL_INVENTORY.mappedCampaigns.length !== 0) errors.push('recall inventory mismatch');
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: not in frozen RC scope`); continue; }
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
  const battery = packet.rows?.find((row) => row.id === IDS.battery)?.proposal;
  if (!/22LC01 is not a battery-drain bulletin/i.test(battery?.solution || '')) errors.push('RC DCM mismatch disclosure missing');
  const carbon = packet.rows?.find((row) => row.id === IDS.carbon)?.proposal;
  if (!/switching the engine active test from direct injection to port injection/i.test(carbon?.description || '')) errors.push('RC port-injection correction missing');
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
