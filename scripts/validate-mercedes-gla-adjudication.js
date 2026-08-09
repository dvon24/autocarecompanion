/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-gla-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const EXPECTED_POSITIVE_COUNTS = Object.freeze({ [IDS.transfer]: 500, [IDS.turboCoolant]: 1100, [IDS.waterPump]: 800 });
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfs() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = JSON.parse(JSON.stringify(source)); delete value.localPath; return [key, value]; })); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLA').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'GLA') errors.push('wrong make/model');
  if (expected.length !== 10 || rows.length !== 10 || new Set(ids).size !== 10 || !equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('GLA coverage must exactly match 10/10 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 3, total: 10 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /500-, 1,100- and 800-owner totals/.test(line))
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
    } else if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || !row.identityConflict) errors.push(`${row.id}: hold verdict drifted`);
    const positiveCount = EXPECTED_POSITIVE_COUNTS[row.id];
    if (positiveCount !== undefined) {
      if (row.before.reportCount !== positiveCount || row.proposal.reportCount !== 0 || !FABRICATED_REPORT_COUNT_IDS.includes(row.id)) errors.push(`${row.id}: proposal-only zero-count correction drifted`);
    } else if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0 || FABRICATED_REPORT_COUNT_IDS.includes(row.id)) errors.push(`${row.id}: zero-count preservation drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/10157073, 10157076, 10158199 and 10158370/.test(byId.get(IDS.battery)?.description || '') || !/10217159/.test(byId.get(IDS.battery)?.description || '') || !/does not automatically require replacement/.test(byId.get(IDS.battery)?.description || '')) errors.push('battery evidence boundary drifted');
  if (!/do not establish the frozen combined 7G-DCT/.test(byId.get(IDS.dct)?.description || '') || !/causes no technical impairment/.test(byId.get(IDS.dct)?.description || '')) errors.push('DCT evidence boundary drifted');
  if (!/Absence from the U.S. corpus is not evidence/.test(byId.get(IDS.diesel)?.description || '')) errors.push('diesel market boundary drifted');
  if (!/M260-equipped later vehicles/.test(byId.get(IDS.timing)?.description || '') || !/not chain elongation/.test(byId.get(IDS.timing)?.description || '')) errors.push('timing evidence boundary drifted');
  if (!/22,659 GLA250, 989 GLA35 AMG and 456 GLA45 AMG/.test(byId.get(IDS.infotainment)?.description || '') || !/does not cover 2015-2020 X156 COMAND/.test(byId.get(IDS.infotainment)?.description || '')) errors.push('MBUX evidence boundary drifted');
  if (!/during a prior repair/.test(byId.get(IDS.roof)?.description || '') || !/does not establish spontaneous shattering/.test(byId.get(IDS.roof)?.description || '')) errors.push('roof evidence boundary drifted');
  if (!/11019636 and 11027781/.test(byId.get(IDS.differential)?.description || '') || !/not the frozen all-4MATIC/.test(byId.get(IDS.differential)?.description || '')) errors.push('differential evidence boundary drifted');
  if (!/does not establish the frozen 2015-2023 transfer-case-noise/.test(byId.get(IDS.transfer)?.description || '')) errors.push('transfer evidence boundary drifted');
  if (!/generic coolant-line record cannot be promoted/.test(byId.get(IDS.turboCoolant)?.description || '')) errors.push('turbo coolant evidence boundary drifted');
  if (!/does not establish a 2015-2020 M270 water-pump-failure/.test(byId.get(IDS.waterPump)?.description || '')) errors.push('water pump evidence boundary drifted');
  if (!equal(packet.pdfSources, publicPdfs()) || !equal(packet.otherSources, OTHER_SOURCES)
    || !equal(packet.pdfSources?.mbuxRecall?.visualPages, [9, 10, 14, 17])
    || !equal(packet.pdfSources?.roofRecall?.visualPages, [1, 2])) errors.push('PDF evidence manifest drifted');
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
