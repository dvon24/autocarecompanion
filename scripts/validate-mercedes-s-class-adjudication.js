/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, IDS, OTHER_SOURCES, OUTPUT, RETAIN_IDS, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor } = require('./build-mercedes-s-class-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const EXPECTED_POSITIVE_COUNTS = Object.freeze({ [IDS.battery48v]: 600, [IDS.abc]: 3000, [IDS.airmatic]: 2400, [IDS.comand]: 1400, [IDS.magicBody]: 500, [IDS.steering]: 1100, [IDS.seat]: 900 });
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot); const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'S-Class').sort((a, b) => a.id.localeCompare(b.id)); const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'S-Class') errors.push('wrong make/model');
  if (expected.length !== 7 || rows.length !== 7 || new Set(ids).size !== 7 || !equal([...ids].sort(), ALL_IDS)) errors.push('S-Class coverage must exactly match 7/7 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, { retain_indexed_identity_accuracy_cleanup_proposal: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 7, total: 7 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /600-, 3000-, 2400-, 1400-, 500-, 1100- and 900-owner totals/.test(line)) || !packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /No PDF is selected/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== actionFor(row.id)) errors.push(`${row.id}: verdict drifted`);
    if (BLOCKER_IDS.includes(row.id) && (row.identityReviewRequired !== true || !row.identityConflict)) errors.push(`${row.id}: hold evidence missing`);
    if (RETAIN_IDS.includes(row.id) && (row.identityReviewRequired !== false || row.identityConflict !== null)) errors.push(`${row.id}: retain evidence drifted`);
    if (row.before.reportCount !== EXPECTED_POSITIVE_COUNTS[row.id] || row.proposal.reportCount !== 0) errors.push(`${row.id}: proposal-only zero-count correction drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor()) || row.proposal.citations.some((citation) => citation.url !== OTHER_SOURCES.datasets.url || searchStyle(citation.url))) errors.push(`${row.id}: exact citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/11012782/.test(byId.get(IDS.battery48v)?.description || '') || !/not to replace parts/i.test(byId.get(IDS.battery48v)?.description || '')) errors.push('48V evidence boundary drifted');
  if (!/10009985/.test(byId.get(IDS.abc)?.description || '') || !/twelve-cylinder/i.test(byId.get(IDS.abc)?.description || '')) errors.push('ABC evidence boundary drifted');
  if (!/drain-valve wiring/i.test(byId.get(IDS.airmatic)?.description || '')) errors.push('AIRMATIC evidence boundary drifted');
  if (!/hard-drive and capacitor/i.test(byId.get(IDS.comand)?.description || '')) errors.push('COMAND evidence boundary drifted');
  if (!/normal road-surface-scan hydraulic-pump noise/i.test(byId.get(IDS.magicBody)?.description || '')) errors.push('Magic Body Control evidence boundary drifted');
  if (!/hydraulic-line-fitting leakage/i.test(byId.get(IDS.steering)?.description || '')) errors.push('steering evidence boundary drifted');
  if (!/software installation or coding/i.test(byId.get(IDS.seat)?.description || '')) errors.push('seat evidence boundary drifted');
  if (!equal(packet.pdfSources, {}) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source evidence manifest drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, EXPECTED_POSITIVE_COUNTS, IMMUTABLE_FIELDS, validatePacket };
