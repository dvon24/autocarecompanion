/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-gls-adjudication');
const { FULL_RECORD_FIELDS, clone, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');
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
const EXPECTED_POSITIVE_COUNTS = Object.freeze({ [IDS.battery]: 450, [IDS.harshShift]: 1100, [IDS.airmatic]: 1500, [IDS.sunroof]: 500 });
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; }));
}
function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLS')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'GLS') errors.push('wrong make/model');
  if (expected.length !== 11 || rows.length !== 11 || new Set(ids).size !== 11
    || !equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) {
    errors.push('GLS coverage must exactly match 11/11 frozen rows');
  }
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 10, fabricated_report_counts_proposed_zero: 4, total: 11 })) {
    errors.push('blocker IDs or summary drifted');
  }
  if (!packet.safetyContract?.some((line) => /450-, 1,100-, 1,500- and 500-owner totals/.test(line))
    || !packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /Every selected PDF page/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const retain = RETAIN_IDS.includes(row.id);
    if (retain && (row.action !== 'retain_indexed_identity_and_accuracy_cleanup' || row.identityReviewRequired !== false || row.identityConflict !== null)) errors.push(`${row.id}: retain verdict drifted`);
    if (!retain && (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || !row.identityConflict)) errors.push(`${row.id}: hold verdict drifted`);
    if (FABRICATED_REPORT_COUNT_IDS.includes(row.id)) {
      if (row.before.reportCount !== EXPECTED_POSITIVE_COUNTS[row.id] || row.proposal.reportCount !== 0) errors.push(`${row.id}: proposal-only zero-count correction drifted`);
    } else if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0) errors.push(`${row.id}: zero count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.some((citation) => searchStyle(citation.url))) errors.push(`${row.id}: exact citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/2019-2023 GLS 450, 2020-2023 GLS 580/.test(byId.get(IDS.ground)?.description || '') || !/extends through 2024/.test(byId.get(IDS.ground)?.description || '')) errors.push('ground-recall scope boundary drifted');
  if (!/2020-2023 GLS 450/.test(byId.get(IDS.stall)?.description || '') || !/7th-to-6th downshift/.test(byId.get(IDS.stall)?.description || '') || !/105,071 total is the combined/.test(byId.get(IDS.stall)?.description || '')) errors.push('stall-recall evidence boundary drifted');
  if (!/2020-2021 GLS 450 and GLS 580/.test(byId.get(IDS.mbux)?.description || '') || !/reboot about 50 seconds/.test(byId.get(IDS.mbux)?.description || '')) errors.push('MBUX recall boundary drifted');
  if (!/modified oil quality/.test(byId.get(IDS.transfer)?.description || '') || !/do not establish bearing wear/.test(byId.get(IDS.transfer)?.description || '')) errors.push('transfer-case evidence boundary drifted');
  if (!/no exact Mercedes communication or recall establishing M256 piston-ring/.test(byId.get(IDS.oil)?.description || '')) errors.push('M256 evidence boundary drifted');
  if (!/no exact record establishing Bosch CP4/.test(byId.get(IDS.fuelPump)?.description || '')) errors.push('OM656 fuel evidence boundary drifted');
  if (!/does not establish one combined EGR, DPF, AdBlue\/SCR/.test(byId.get(IDS.emissions)?.description || '')) errors.push('OM656 emissions boundary drifted');
  if (!/do not establish the frozen claim that parked vehicles fail to enter sleep mode/.test(byId.get(IDS.battery)?.description || '')) errors.push('48V battery evidence boundary drifted');
  if (!/model-year 2024 GLS 450/.test(byId.get(IDS.harshShift)?.description || '') || !/outside the frozen years/.test(byId.get(IDS.harshShift)?.description || '')) errors.push('harsh-shift evidence boundary drifted');
  if (!/replacing the CAIRS unit does not remedy it/.test(byId.get(IDS.airmatic)?.description || '')) errors.push('AIRMATIC evidence boundary drifted');
  if (!/only targeted sunroof records concern gesture-control operation/.test(byId.get(IDS.sunroof)?.description || '')) errors.push('sunroof evidence boundary drifted');
  if (!equal(packet.pdfSources, publicPdfSources()) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source evidence manifest drifted');
  const expectedPages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0);
  const reviewedPages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0);
  if (expectedPages !== 28 || reviewedPages !== 28) errors.push('PDF visual-review coverage must be 28/28 pages');
  return errors;
}
function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
