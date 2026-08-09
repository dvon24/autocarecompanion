/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor } = require('./build-mazda-tribute-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Tribute').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 5 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Tribute') errors.push('wrong make/model');
  if (expected.length !== 5 || rows.length !== 5 || new Set(ids).size !== 5) errors.push('Tribute coverage must be 5/5 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Tribute snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /14V174000/.test(line)) || !packet.safetyContract?.some((line) => /15V677000/.test(line)) || !packet.safetyContract?.some((line) => /selects no PDFs/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || row.identityConflict !== contentFor(row.id).identityConflict) errors.push(`${row.id}: identity hold drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`); } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|escape-city|transmissionrepaircostguide|owner forums|Ford\/Mazda TSB/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: secondary or fabricated citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const coil = byId.get(IDS.coil);
  if (!coil || !/10009915/.test(coil.description) || !/2001-2006/.test(coil.description) || /replace all coils proactively|replace every coil/i.test(prose(coil))) errors.push('coil boundary drifted');
  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/10025755/.test(transmission.description) || !/10034065/.test(transmission.description) || !/10206002/.test(prose(transmission)) || !/15V677000/.test(prose(transmission)) || !/only four 2008/.test(transmission.description) || /fluid changes every 30k|use updated servo bore kit/i.test(prose(transmission))) errors.push('transmission boundary drifted');
  const differential = byId.get(IDS.differential);
  if (!differential || !/614102/.test(differential.description) || !/conflates the front power-transfer unit with the rear differential/.test(differential.description) || /Fluid change every 30k prevents/i.test(prose(differential))) errors.push('differential boundary drifted');
  const corrosion = byId.get(IDS.corrosion);
  if (!corrosion || !/14V174000/.test(prose(corrosion)) || !/2001-2004/.test(corrosion.description) || !/forward attachment of the lower control arm/.test(corrosion.description) || !/reinforcement cross-brace/.test(corrosion.description) || /use recall 14V-440|campaign is 14V-440|replace the subframe at no cost|\$200-\$400/i.test(prose(corrosion))) errors.push('corrosion boundary drifted');
  const transfer = byId.get(IDS.transferSeal);
  if (!transfer || !/281-communication/.test(transfer.description) || !/65-recall-row/.test(transfer.description) || /XY-75W140-QL or equivalent|\$15-\$30|\$600-\$1,000/i.test(prose(transfer))) errors.push('transfer-seal boundary drifted');
  if (!equal(packet.pdfSources, {}) || Object.keys(PDF_SOURCES).length !== 0) errors.push('Tribute packet must select zero PDFs');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
