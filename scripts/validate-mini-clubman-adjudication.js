/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS,
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
} = require('./build-mini-clubman-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'relatedIssueIds',
]);
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount',
  'source', 'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'MINI' && row.model === 'Clubman').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'MINI' || packet.model !== 'Clubman') errors.push('wrong make/model');
  if (expected.length !== 4 || rows.length !== 4 || new Set(ids).size !== 4 || !equal([...ids].sort(), ALL_IDS)) errors.push('Clubman coverage must exactly match 4/4 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 4, fabricated_report_counts_proposed_zero: 3, pages_preserved_published: 4, total: 4 })) errors.push('summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /cross-chassis proof/i.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || !row.identityConflict) errors.push(`${row.id}: hold verdict drifted`);
    if (!CANONICAL_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: noncanonical severity`);
    if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') errors.push(`${row.id}: owner data not reduced to unknown`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || !row.proposal.citations.length || row.proposal.citations.some((citation) => !/^https:\/\//.test(citation.url) || searchStyle(citation.url))) errors.push(`${row.id}: exact primary citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported DTC retained or introduced`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/requires measured rotational free play/i.test(byId.get(IDS.clutch)?.description || '') || !/three ring-gear tooth gaps/.test(byId.get(IDS.clutch)?.solution || '')) errors.push('clutch threshold boundary drifted');
  if (!/2014 F55\/F56/.test(byId.get(IDS.oilHousing)?.description || '') || !/not an oil gasket leak on the F54/.test(byId.get(IDS.oilHousing)?.description || '')) errors.push('oil-housing chassis boundary drifted');
  if (!/record 10026766/.test(byId.get(IDS.rearDoor)?.description || '') || !/moisture-corroded handle wiring connectors/.test(byId.get(IDS.rearDoor)?.description || '')) errors.push('rear-door source boundary drifted');
  if (!/February 28, 2010 through May 4, 2012/.test(byId.get(IDS.window)?.description || '') || !/footwell module can disable power windows/.test(byId.get(IDS.window)?.description || '')) errors.push('window subsystem boundary drifted');
  if (!equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.otherSources, OTHER_SOURCES) || !equal(packet.manufacturerCommunications, BULLETIN_INVENTORY) || !equal(packet.recallInventory, RECALL_INVENTORY)) errors.push('source evidence manifest drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
