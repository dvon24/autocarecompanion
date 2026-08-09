/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-gle-adjudication');
const {
  FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue,
} = require('./known-issue-adjudication-utils');

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
  [IDS.suspension]: 1800, [IDS.mbux]: 1300, [IDS.dpf]: 1000,
  [IDS.differential]: 600, [IDS.transferCase]: 700,
});
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfs() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = JSON.parse(JSON.stringify(source)); delete value.localPath; return [key, value];
  }));
}

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLE')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true
    || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'GLE') errors.push('wrong make/model');
  if (expected.length !== 24 || rows.length !== 24 || new Set(ids).size !== 24
    || !equal([...ids].sort(), ALL_IDS)
    || !equal([...ids].sort(), expected.map((row) => row.id).sort())) {
    errors.push('GLE coverage must exactly match 24/24 frozen rows');
  }
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, {
      retain_indexed_identity_and_accuracy_cleanup: 2,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 22,
      fabricated_report_counts_proposed_zero: 5,
      total: 24,
    })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /1,800-, 1,300-, 1,000-, 600- and 700-owner totals/.test(line))
    || !packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /not converted into owner-report totals/.test(line))
    || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) {
    errors.push('safety contract incomplete');
  }
  const exactUrls = new Set([...Object.values(OTHER_SOURCES), ...Object.values(PDF_SOURCES)]
    .map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) {
      errors.push(`${row.id}: before state drifted`);
    }
    if (row.proposalSha256 !== hashValue(row.proposal)
      || !equal(row.changedFields, diffFields(row.before, row.proposal))) {
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
    const retained = RETAIN_IDS.includes(row.id);
    if (retained) {
      if (row.action !== 'retain_indexed_identity_and_accuracy_cleanup'
        || row.identityReviewRequired !== false || row.identityConflict !== null) {
        errors.push(`${row.id}: retain verdict drifted`);
      }
    } else if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
      || row.identityReviewRequired !== true || !row.identityConflict) {
      errors.push(`${row.id}: hold verdict drifted`);
    }
    const positiveCount = EXPECTED_POSITIVE_COUNTS[row.id];
    if (positiveCount !== undefined) {
      if (row.before.reportCount !== positiveCount || row.proposal.reportCount !== 0
        || !FABRICATED_REPORT_COUNT_IDS.includes(row.id)) {
        errors.push(`${row.id}: proposal-only zero-count correction drifted`);
      }
    } else if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0
      || FABRICATED_REPORT_COUNT_IDS.includes(row.id)) {
      errors.push(`${row.id}: zero-count preservation drifted`);
    }
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) {
      errors.push(`${row.id}: owner social proof is forbidden`);
    }
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length
      || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution)
      || !/no universal retail part/i.test(row.commerceDecision || '')
      || row.commerceDecision !== commerceDecisionFor(row.id)) {
      errors.push(`${row.id}: commerce boundary missing`);
    }
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) {
      if (!exactUrls.has(citation.url) || searchStyle(citation.url)) {
        errors.push(`${row.id}: citation is not an approved exact primary source`);
      }
    }
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/do not establish the frozen combined ISG/.test(byId.get(IDS.hybrid)?.description || '')) {
    errors.push('48V evidence boundary drifted');
  }
  if (!/not frozen valve-body wear/.test(byId.get(IDS.transmission)?.description || '')) {
    errors.push('transmission evidence boundary drifted');
  }
  if (!/discharged battery does not necessarily require replacement/.test(byId.get(IDS.auxiliaryBattery)?.description || '')) {
    errors.push('auxiliary-battery evidence boundary drifted');
  }
  if (!/4,325 GLE 350, 1,045 GLE 450, three GLE 580 and one 2021 AMG GLE 53/.test(byId.get(IDS.drain)?.description || '')) {
    errors.push('drain recall boundary drifted');
  }
  if (!/exact market-specific evidence is required/.test(byId.get(IDS.adblue)?.description || '')) {
    errors.push('diesel market boundary drifted');
  }
  if (!/model-year 2021-2023 AMG GLE 53/.test(byId.get(IDS.steering)?.description || '')) {
    errors.push('steering evidence boundary drifted');
  }
  if (!/37,383 GLE 350 and 4,451 GLE 450/.test(byId.get(IDS.esp)?.description || '')) {
    errors.push('ESP recall boundary drifted');
  }
  if (!/upper transverse control arms/.test(byId.get(IDS.controlArm)?.description || '')) {
    errors.push('control-arm evidence boundary drifted');
  }
  if (!/brief power-supply interruption/.test(byId.get(IDS.radar)?.description || '')) {
    errors.push('radar evidence boundary drifted');
  }
  if (!/does not establish frozen hydraulic engine/.test(byId.get(IDS.mounts)?.description || '')) {
    errors.push('mount evidence boundary drifted');
  }
  if (!/Neither establishes oil-filter-housing or oil-cooler leakage/.test(byId.get(IDS.m256Cooling)?.description || '')) {
    errors.push('M256 evidence boundary drifted');
  }
  if (!/does not establish frozen M264 timing-chain/.test(byId.get(IDS.m264Chain)?.description || '')) {
    errors.push('M264 evidence boundary drifted');
  }
  if (!/does not establish frozen M276/.test(byId.get(IDS.m276Cam)?.description || '')) {
    errors.push('M276 evidence boundary drifted');
  }
  if (!/does not establish frozen M278/.test(byId.get(IDS.m278Cam)?.description || '')) {
    errors.push('M278 evidence boundary drifted');
  }
  if (!/fogging can be a natural climatic phenomenon/.test(byId.get(IDS.headlight)?.description || '')) {
    errors.push('headlamp guidance boundary drifted');
  }
  if (!/no exact Mercedes communication establishing that combined identity/.test(byId.get(IDS.dieselTurbo)?.description || '')) {
    errors.push('diesel turbo evidence boundary drifted');
  }
  if (!/concerns a creak or tick/.test(byId.get(IDS.sunroof)?.description || '')) {
    errors.push('sunroof evidence boundary drifted');
  }
  if (!/not one frozen charging-interruption identity/.test(byId.get(IDS.phev)?.description || '')) {
    errors.push('PHEV evidence boundary drifted');
  }
  if (!/different symptoms and causes/.test(byId.get(IDS.liftgate)?.description || '')) {
    errors.push('liftgate evidence boundary drifted');
  }
  if (!/replacing the CAIRS unit does not remedy it/.test(byId.get(IDS.suspension)?.description || '')) {
    errors.push('AIRMATIC evidence boundary drifted');
  }
  if (!/combines COMAND and MBUX generations/.test(byId.get(IDS.mbux)?.description || '')) {
    errors.push('multimedia evidence boundary drifted');
  }
  if (!/does not establish frozen DPF regeneration failure/.test(byId.get(IDS.dpf)?.description || '')) {
    errors.push('DPF evidence boundary drifted');
  }
  if (!/breather on certain AMG GLE 53/.test(byId.get(IDS.differential)?.description || '')) {
    errors.push('differential evidence boundary drifted');
  }
  if (!/modified oil quality over time/.test(byId.get(IDS.transferCase)?.description || '')) {
    errors.push('transfer-case evidence boundary drifted');
  }
  if (!equal(packet.pdfSources, publicPdfs()) || !equal(packet.otherSources, OTHER_SOURCES)
    || !equal(packet.pdfSources?.drainRecall?.visualPages, [1, 2, 3, 4])
    || !equal(packet.pdfSources?.espRecall?.visualPages, [1, 2, 3, 4])) {
    errors.push('PDF evidence manifest drifted');
  }
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({
    passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length,
    applicationGate: packet.applicationGate, errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
