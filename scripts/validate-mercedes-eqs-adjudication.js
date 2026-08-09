/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-eqs-adjudication');
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
  [IDS.battery12v]: 750,
  [IDS.coldRange]: 1200,
  [IDS.rearSteering]: 310,
});

function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfs() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = JSON.parse(JSON.stringify(source));
    delete value.localPath;
    return [key, value];
  }));
}

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'EQS')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'EQS') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9
    || !equal([...ids].sort(), ALL_IDS)
    || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('EQS coverage must exactly match 9/9 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, {
      retain_indexed_identity_and_accuracy_cleanup: 1,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8,
      fabricated_report_counts_proposed_zero: 3,
      total: 9,
    })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /750-, 1,200- and 310-owner totals/.test(line))
    || !packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /not converted into owner-report totals/.test(line))
    || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');

  const exactUrls = new Set([...Object.values(OTHER_SOURCES), ...Object.values(PDF_SOURCES)].map((source) => source.url));
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

    const retained = RETAIN_IDS.includes(row.id);
    if (retained) {
      if (row.action !== 'retain_indexed_identity_and_accuracy_cleanup' || row.identityReviewRequired !== false || row.identityConflict !== null) errors.push(`${row.id}: retain verdict drifted`);
    } else if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
      || row.identityReviewRequired !== true || !row.identityConflict) errors.push(`${row.id}: hold verdict drifted`);

    const positiveCount = EXPECTED_POSITIVE_COUNTS[row.id];
    if (positiveCount !== undefined) {
      if (row.before.reportCount !== positiveCount || row.proposal.reportCount !== 0 || !FABRICATED_REPORT_COUNT_IDS.includes(row.id)) errors.push(`${row.id}: proposal-only zero-count correction drifted`);
    } else if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0 || FABRICATED_REPORT_COUNT_IDS.includes(row.id)) errors.push(`${row.id}: zero-count preservation drifted`);

    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    const explicitNoPurchase = /Do not buy/.test(row.proposal.solution)
      || /Do not disconnect[^.]*\. Do not buy/.test(row.proposal.solution)
      || /Do not disconnect[^;]*or replace[^;]*based only on this page/.test(row.proposal.solution);
    if (!explicitNoPurchase || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const bms = byId.get(IDS.bms);
  if (!bms || !/model year 2024/.test(bms.description) || !/14,912 vehicles across multiple EQ models/.test(bms.description) || !/VIN-specific/.test(bms.solution)) errors.push('BMS recall scope boundary drifted');
  const drivetrain = byId.get(IDS.drivetrain);
  if (!drivetrain || !/2022-2023 EQS 450, EQS 580 and AMG EQS/.test(drivetrain.description) || !/recall 23V405/.test(drivetrain.solution)) errors.push('drivetrain recall evidence drifted');
  const airmatic = byId.get(IDS.airmatic);
  if (!airmatic || !/do not establish AIRMATIC clunks/.test(airmatic.description) || !/EQS SUV claim/.test(airmatic.description)) errors.push('AIRMATIC transfer boundary drifted');
  const handles = byId.get(IDS.doorHandles);
  if (!handles || !/11029090/.test(handles.description) || !/do not establish widespread owner lockout/.test(handles.description)) errors.push('door-handle scope boundary drifted');
  const mbux = byId.get(IDS.mbux);
  if (!mbux || !/normal operation is unaffected/.test(mbux.description) || !/do not establish frequent full-Hyperscreen freezes/.test(mbux.description)) errors.push('MBUX evidence boundary drifted');
  const batteryWarning = byId.get(IDS.batteryWarning);
  if (!batteryWarning || !/These are distinct conditions/.test(batteryWarning.description) || !/No reviewed primary record supports/.test(batteryWarning.description)) errors.push('battery-warning evidence boundary drifted');
  const battery12v = byId.get(IDS.battery12v);
  if (!battery12v || !/below 45% state of charge/.test(battery12v.description) || !/does not establish parasitic drain in 7-10 days/.test(battery12v.description)) errors.push('12V evidence boundary drifted');
  const coldRange = byId.get(IDS.coldRange);
  if (!coldRange || !/does not identify a defective heat pump/.test(coldRange.description) || !/does not establish a 30-40%/.test(coldRange.description)) errors.push('cold-range evidence boundary drifted');
  const steering = byId.get(IDS.rearSteering);
  if (!steering || !/designed safe mode/.test(steering.description) || !/None establishes calibration drift/.test(steering.description)) errors.push('rear-steering evidence boundary drifted');

  if (!equal(packet.pdfSources, publicPdfs()) || !equal(packet.otherSources, OTHER_SOURCES)
    || !equal(packet.pdfSources?.drivetrainRecall?.visualPages, [1, 2, 3, 4])
    || !equal(packet.pdfSources?.bmsRecall?.visualPages, [1, 3, 4, 5, 8])) errors.push('PDF evidence manifest drifted');
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
