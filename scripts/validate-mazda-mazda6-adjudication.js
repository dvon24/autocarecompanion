/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./mazda-adjudication-utils');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, identityConflictFor,
} = require('./build-mazda-mazda6-adjudication');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function prose(proposal) { return [proposal.title, proposal.description, proposal.solution, ...(proposal.symptoms || []), proposal.contentUpdateSummary].join(' '); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(url); }

function validatePacket(packet, snapshot) {
  const errors = []; const expected = buildPacket(snapshot); const rows = packet.rows || [];
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda6').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(frozenRows.map((row) => [row.id, row])); const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  if (!equal(packet, expected)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('proposal/application gate drifted');
  if (!equal(rows.map((row) => row.id), ALL_IDS) || !equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('row or blocker IDs drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line)) || !packet.safetyContract?.some((line) => /Every selected PDF page/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const conflict = identityConflictFor(row.id); const retained = RETAIN_IDS.includes(row.id);
    if (row.identityReviewRequired !== Boolean(conflict) || row.identityConflict !== conflict) errors.push(`${row.id}: identity review drifted`);
    if (retained && row.action !== 'retain_indexed_identity_and_accuracy_cleanup') errors.push(`${row.id}: supported identity action drifted`);
    if (!retained && row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy') errors.push(`${row.id}: hold action drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated count not proposed zero`); }
    else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/i.test(row.proposal.solution) || !/(No universal retail part|Dealer-only or VIN-specific remedy)/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url) || /youtube|reddit|forum|powernation|go-parts/i.test(citation.url)) errors.push(`${row.id}: citation not exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost/mileage retained`);
    if (row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported systems/codes retained`);
  }
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence drifted`);
  }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0);
  const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pages !== 59 || visual !== 59) errors.push('all 59 PDF pages must remain visually reviewed');
  return errors;
}
function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
