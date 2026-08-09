/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, IDS, OTHER_SOURCES, OUTPUT, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor } = require('./build-mercedes-v-class-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot); const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'V-Class').sort((a, b) => a.id.localeCompare(b.id)); const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'V-Class') errors.push('wrong make/model');
  if (expected.length !== 8 || rows.length !== 8 || new Set(ids).size !== 8 || !equal([...ids].sort(), ALL_IDS)) errors.push('V-Class coverage must exactly match 8/8 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8, report_counts_preserved_zero: 8, total: 8 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /report counts are already zero/.test(line)) || !packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /No PDF is selected/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== actionFor(row.id) || row.identityReviewRequired !== true || !row.identityConflict) errors.push(`${row.id}: hold verdict drifted`);
    if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0 || row.changedFields.includes('reportCount')) errors.push(`${row.id}: zero report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|0\+ owners/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: owner social proof forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor()) || row.proposal.citations.some((citation) => citation.url !== OTHER_SOURCES.datasets.url || searchStyle(citation.url))) errors.push(`${row.id}: citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/11023982/.test(byId.get(IDS.transmission)?.description || '')) errors.push('transmission evidence drifted');
  if (!/17V651000/.test(byId.get(IDS.wheelBearing)?.description || '')) errors.push('wheel-bearing evidence drifted');
  if (!/Do not install an emissions delete/.test(byId.get(IDS.adblue)?.solution || '')) errors.push('emissions-delete prohibition missing');
  if (!/Do not force a regeneration/.test(byId.get(IDS.dpf)?.solution || '')) errors.push('regeneration prohibition missing');
  if (!equal(packet.pdfSources, {}) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source manifest drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main(); module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
