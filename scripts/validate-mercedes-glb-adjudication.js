/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-glb-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const EXPECTED_POSITIVE_COUNTS = Object.freeze({ [IDS.dct]: 800, [IDS.mbux]: 600, [IDS.roof]: 400 });
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfs() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = JSON.parse(JSON.stringify(source)); delete value.localPath; return [key, value]; })); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLB').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'GLB') errors.push('wrong make/model');
  if (expected.length !== 10 || rows.length !== 10 || new Set(ids).size !== 10 || !equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('GLB coverage must exactly match 10/10 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)
    || !equal(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 5, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 10 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /800-, 600- and 400-owner totals/.test(line))
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
  if (!/does not establish the frozen carbon-buildup/.test(byId.get(IDS.carbon)?.description || '')) errors.push('carbon evidence boundary drifted');
  if (!/945 model-year 2020-2021 GLB 250/.test(byId.get(IDS.ecall)?.description || '') || !/model-year 2022 applicability/.test(byId.get(IDS.ecall)?.description || '')) errors.push('eCall scope boundary drifted');
  if (!/four model-year 2021 GLB 250/.test(byId.get(IDS.esp)?.description || '') || !/mechanically damaged during logistics/.test(byId.get(IDS.esp)?.description || '')) errors.push('ESP evidence boundary drifted');
  if (!/21,219 model-year 2020 GLB 250/.test(byId.get(IDS.carrier)?.description || '') || !/no field complaints/.test(byId.get(IDS.carrier)?.description || '')) errors.push('carrier evidence boundary drifted');
  if (!/15 years or 150,000 miles/.test(byId.get(IDS.valve)?.description || '') || !/11028267/.test(byId.get(IDS.valve)?.description || '')) errors.push('valve evidence boundary drifted');
  if (!/15,787 model-year 2020-2021 GLB 250/.test(byId.get(IDS.camera)?.description || '') || !/does not deactivate or freeze/.test(byId.get(IDS.camera)?.description || '')) errors.push('camera evidence boundary drifted');
  if (!/26 model-year 2020 GLB 250/.test(byId.get(IDS.water)?.description || '') || !/body seam in the wheel-well/.test(byId.get(IDS.water)?.description || '')) errors.push('water evidence boundary drifted');
  if (!/engine label says M282/.test(byId.get(IDS.dct)?.description || '') || !/does not identify shudder/.test(byId.get(IDS.dct)?.description || '')) errors.push('DCT evidence boundary drifted');
  if (!/not the frozen generic MBUX-freeze/.test(byId.get(IDS.mbux)?.description || '') || !/not a frozen image/.test(byId.get(IDS.mbux)?.description || '')) errors.push('MBUX evidence boundary drifted');
  if (!/does not establish the frozen 2020-2025 panoramic-sunroof-creak/.test(byId.get(IDS.roof)?.description || '')) errors.push('roof evidence boundary drifted');
  if (!equal(packet.pdfSources, publicPdfs()) || !equal(packet.otherSources, OTHER_SOURCES)
    || !equal(packet.pdfSources?.ecallRecall?.visualPages, [13, 19, 28])
    || !equal(packet.pdfSources?.espRecall?.visualPages, [1, 2, 3])
    || !equal(packet.pdfSources?.carrierRecall?.visualPages, [1, 2, 3])
    || !equal(packet.pdfSources?.cameraRecall?.visualPages, [11, 13, 15])
    || !equal(packet.pdfSources?.waterRecall?.visualPages, [1, 2, 3])
    || !equal(packet.pdfSources?.valveWarranty?.visualPages, [1, 2])) errors.push('PDF evidence manifest drifted');
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
