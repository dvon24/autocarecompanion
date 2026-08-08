/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./lexus-adjudication-utils');
const { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, OUTPUT: PACKET, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, evidenceFor, proposalFor } = require('./build-lexus-gx-adjudication');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status'];
const OBSERVATION_COVERAGE = {
  'gx-ahc-kdss-identity-conflict': [IDS.kdss],
  'gx-center-differential-source-gap': [IDS.centerDifferential],
  'gx-secondary-air-generation-conflict': [IDS.secondaryAir],
  'gx-no-unverified-commerce': Object.values(IDS).sort(),
  'gx-eighteen-campaign-identities-deferred': [],
  'all-gx-pages-preserved': Object.values(IDS).sort(),
};
const UNSAFE_SOLUTION = /\b(?:refill|bleed|replace|install|disconnect|bypass|disable|exercise)\b[^.!?]{0,100}\b(?:KDSS|actuator|hydraulic|sway bars?|air pumps?|switching valves?|check valves?|emissions system|differential lock)\b/i;

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function hasUnsafePrescription(solution) {
  return String(solution || '').split(/(?<=[.!?])\s+/).some((sentence) => UNSAFE_SOLUTION.test(sentence) && !/\b(?:do not|must not|cannot|no universal|before any part is replaced)\b/i.test(sentence));
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'GX').sort((a, b) => a.id.localeCompare(b.id));
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.auditStage !== 'model-primary-source-adjudication') errors.push('packet safety status mismatch');
  if (packet.make !== 'Lexus' || packet.model !== 'GX') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, BLOCKER_IDS)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 3 || modelRows.length !== 3 || ids.length !== 3 || new Set(ids).size !== 3 || !equal(ids, modelRows.map((row) => row.id))) errors.push('GX frozen-row coverage mismatch');
  if (!equal(packet.summary, { remove_false_citation_and_targeted_safety_cleanup_pending_source: 3, total: 3 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, publicPdfSources())) errors.push('PDF source boundary mismatch');
  if (!equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || BULLETIN_INVENTORY.totalRows !== 995) errors.push('communication inventory mismatch');
  if (!equal(packet.recallInventory, RECALL_INVENTORY) || RECALL_INVENTORY.totalRows !== 200 || !equal(packet.deferredCampaigns, CAMPAIGNS) || !equal(packet.mappedCampaigns, [])) errors.push('recall partition mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen);
    if (row.action !== 'remove_false_citation_and_targeted_safety_cleanup_pending_source' || row.commerceDecision !== 'blocked-no-exact-fitment-no-retail-part') errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const changedFields = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, changedFields) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || row.evidence.length !== 3) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (!['high','medium','low'].includes(row.proposal.severity) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title) || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.confidence !== 'low') errors.push(`${row.id}: publication/source/severity drift`);
    if (row.proposal.reviewedOn !== REVIEW_DATE || row.proposal.contentUpdatedOn !== REVIEW_DATE || !row.proposal.contentUpdateSummary) errors.push(`${row.id}: review metadata drift`);
    if (!equal(row.proposal.symptoms, []) || !equal(row.proposal.affectedSystems, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, []) || !equal(row.proposal.relatedIssueIds, [])) errors.push(`${row.id}: derived-data/commerce/relation drift`);
    if ([row.proposal.estimatedCostLow,row.proposal.estimatedCostHigh,row.proposal.typicalMileageLow,row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: cost/mileage remains`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citation boundary mismatch`);
    if (!/This is a VIN-specific .* remedy; no universal retail part is asserted\./.test(row.proposal.solution)) errors.push(`${row.id}: explicit dealer/no-commerce marker missing`);
    if (hasUnsafePrescription(row.proposal.solution)) errors.push(`${row.id}: unsupported prescription survived`);
    if (/amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search commerce survived`);
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

module.exports = { OBSERVATION_COVERAGE, PACKET, SNAPSHOT, validatePacket };
