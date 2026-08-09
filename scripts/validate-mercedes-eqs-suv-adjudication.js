/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, ID, OTHER_SOURCES, OUTPUT, SNAPSHOT, buildPacket, citationsFor } = require('./build-mercedes-eqs-suv-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'lastReportedByOwners', 'relatedIssueIds',
]);
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount',
  'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'EQS SUV');
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const item = rows[0];
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'EQS SUV') errors.push('wrong make/model');
  if (expected.length !== 1 || rows.length !== 1 || item?.id !== ID || !equal(ALL_IDS, [ID])) errors.push('EQS SUV coverage must exactly match 1/1 frozen row');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1, fabricated_report_counts_proposed_zero: 1, total: 1 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /220-owner total/.test(line))
    || !packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /No PDF is selected/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  if (!item || !expected[0]) return [...errors, 'missing frozen row'];

  const frozen = fullRecord(expected[0]);
  if (!equal(item.before, frozen) || item.beforeSha256 !== hashValue(frozen)) errors.push(`${ID}: before state drifted`);
  if (item.proposalSha256 !== hashValue(item.proposal) || !equal(item.changedFields, diffFields(item.before, item.proposal))) errors.push(`${ID}: proposal hash/diff drifted`);
  for (const field of FULL_RECORD_FIELDS) if (!(field in item.before) || !(field in item.proposal)) errors.push(`${ID}: missing field ${field}`);
  for (const field of Object.keys(item.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${ID}: unauthorized proposal field ${field}`);
  for (const field of IMMUTABLE_FIELDS) if (!equal(item.before[field], item.proposal[field])) errors.push(`${ID}: immutable ${field} changed`);
  for (const field of item.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${ID}: unauthorized changed field ${field}`);
  if (item.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || item.identityReviewRequired !== true || !item.identityConflict) errors.push(`${ID}: hold verdict drifted`);
  if (item.proposal.status !== 'published' || item.before.reportCount !== 220 || item.proposal.reportCount !== 0) errors.push(`${ID}: proposal-only zero-count correction drifted`);
  if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(item.proposal))) errors.push(`${ID}: owner social proof is forbidden`);
  if (item.proposal.humanApproved !== false || item.proposal.fixParts.length || item.proposal.communityRecommendations.length) errors.push(`${ID}: must remain unapproved and commerce-free`);
  if (!/Do not buy/.test(item.proposal.solution) || !/no universal retail part/i.test(item.commerceDecision)) errors.push(`${ID}: commerce boundary missing`);
  if (!equal(item.proposal.citations, citationsFor())) errors.push(`${ID}: exact citations drifted`);
  for (const citation of item.proposal.citations) if (citation.url !== OTHER_SOURCES.datasets.url || searchStyle(citation.url)) errors.push(`${ID}: citation is not an approved exact primary source`);
  if (item.proposal.estimatedCostLow !== null || item.proposal.estimatedCostHigh !== null
    || item.proposal.typicalMileageLow !== null || item.proposal.typicalMileageHigh !== null
    || item.proposal.dtcCodes.length) errors.push(`${ID}: unsupported cost/mileage/code retained`);
  if (!/Communication 11012135 is limited to a 2024 AIRMATIC/.test(item.proposal.description)
    || !/states no compressor-noise complaint/.test(item.proposal.description)
    || !/high-voltage climate-control compressor, not the AIRMATIC/.test(item.proposal.description)
    || !/does not support the frozen 2023-2025 noise identity/.test(item.proposal.description)) errors.push('compressor evidence boundary drifted');
  if (!equal(packet.pdfSources, {}) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source manifest drifted');
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
