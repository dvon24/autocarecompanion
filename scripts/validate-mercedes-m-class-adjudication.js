/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-m-class-adjudication');
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
const EXPECTED_POSITIVE_COUNTS = Object.freeze({
  [IDS.airmatic]: 2100, [IDS.balanceShaft]: 1400, [IDS.oilCooler]: 1600, [IDS.transferCase]: 780,
});
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = JSON.parse(JSON.stringify(source)); delete value.localPath; return [key, value];
  }));
}

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'M-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true
    || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'M-Class') errors.push('wrong make/model');
  if (expected.length !== 10 || rows.length !== 10 || new Set(ids).size !== 10
    || !equal([...ids].sort(), ALL_IDS)
    || !equal([...ids].sort(), expected.map((row) => row.id).sort())) {
    errors.push('M-Class coverage must exactly match 10/10 frozen rows');
  }
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, {
      retain_indexed_identity_and_accuracy_cleanup: 1,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9,
      fabricated_report_counts_proposed_zero: 4, total: 10,
    })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /2,100-, 1,400-, 1,600- and 780-owner totals/.test(line))
    || !packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /parsed, rendered and visually inspected/.test(line))
    || !packet.safetyContract?.some((line) => /resistor bypass/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) {
    errors.push('safety contract incomplete');
  }
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) {
      errors.push(`${row.id}: proposal hash/diff drifted`);
    }
    for (const field of FULL_RECORD_FIELDS) {
      if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    }
    for (const field of Object.keys(row.proposal || {})) {
      if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    }
    for (const field of IMMUTABLE_FIELDS) {
      if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    }
    for (const field of row.changedFields) {
      if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    }
    const retain = RETAIN_IDS.includes(row.id);
    const expectedAction = retain ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy';
    if (row.action !== expectedAction || row.identityReviewRequired !== !retain
      || (retain ? row.identityConflict !== null : !row.identityConflict)) errors.push(`${row.id}: verdict drifted`);
    if (FABRICATED_REPORT_COUNT_IDS.includes(row.id)) {
      if (row.before.reportCount !== EXPECTED_POSITIVE_COUNTS[row.id] || row.proposal.reportCount !== 0) errors.push(`${row.id}: proposal-only zero-count correction drifted`);
    } else if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0) errors.push(`${row.id}: unexpected owner count`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) && row.id !== IDS.oilCooler) errors.push(`${row.id}: commerce boundary missing from solution`);
    if (!/no universal retail/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce decision drifted`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.some((citation) => searchStyle(citation.url))) errors.push(`${row.id}: exact citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/separate from rpm-sensor faults/.test(byId.get(IDS.conductor)?.description || '')
    || !/may require commissioning/.test(byId.get(IDS.conductor)?.solution || '')) errors.push('conductor-plate boundary drifted');
  if (!/stop driving until/.test(byId.get(IDS.booster)?.solution || '')
    || !/corrode under a rubber sleeve/.test(byId.get(IDS.booster)?.description || '')) errors.push('brake-booster recall boundary drifted');
  if (!/no consequential damage is expected/.test(byId.get(IDS.m276)?.description || '')
    || !/engine number/.test(byId.get(IDS.m276)?.solution || '')) errors.push('M276 bulletin boundary drifted');
  if (!/Do not install a resistor/.test(byId.get(IDS.swirl)?.solution || '')) errors.push('unsafe swirl bypass returned');
  if (!/model-year 2009/.test(byId.get(IDS.tailLamp)?.description || '')
    || !/optional power liftgate/.test(byId.get(IDS.tailLamp)?.description || '')) errors.push('tail-lamp recall boundary drifted');
  if (!/oil cooler itself is not the cause/.test(byId.get(IDS.oilCooler)?.description || '')
    || !/A 642 188 04 80/.test(byId.get(IDS.oilCooler)?.solution || '')
    || !/Do not replace the oil cooler/.test(byId.get(IDS.oilCooler)?.solution || '')) errors.push('OM642 oil-cooler evidence drifted');
  if (!equal(packet.pdfSources, publicPdfSources()) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source evidence manifest drifted');
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
