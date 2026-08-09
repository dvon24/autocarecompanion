/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
} = require('./build-mercedes-g-class-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const EXPECTED_POSITIVE_COUNTS = Object.freeze({
  [IDS.infotainment]: 450,
  [IDS.doorHinge]: 280,
  [IDS.axleSeal]: 620,
  [IDS.steeringDamper]: 890,
  [IDS.transferLeak]: 340,
});
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function publicPdfs() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = JSON.parse(JSON.stringify(source)); delete value.localPath; return [key, value]; })); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'G-Class').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'G-Class') errors.push('wrong make/model');
  if (expected.length !== 13 || rows.length !== 13 || new Set(ids).size !== 13 || !equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('G-Class coverage must exactly match 13/13 frozen rows');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 3, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 10, fabricated_report_counts_proposed_zero: 5, total: 13 })) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /450-, 280-, 620-, 890- and 340-owner totals/.test(line))
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
  if (!/11007728/.test(byId.get(IDS.transmission)?.description || '') || !/11032887/.test(byId.get(IDS.transmission)?.description || '') || !/not a universal wet-clutch drift mechanism/.test(byId.get(IDS.transmission)?.description || '')) errors.push('transmission evidence boundary drifted');
  if (!/does not establish the frozen 2000-2018/.test(byId.get(IDS.corrosion)?.description || '')) errors.push('corrosion evidence boundary drifted');
  if (!/11,018 model-year 2019-2021 G 550/.test(byId.get(IDS.wiringRecall)?.description || '') || !/15,098 model-year 2019-2021 AMG G 63/.test(byId.get(IDS.wiringRecall)?.description || '') || !/recall 23V097/.test(byId.get(IDS.wiringRecall)?.solution || '')) errors.push('wiring recall evidence drifted');
  if (!/2021-2022 G 550/.test(byId.get(IDS.fuelRecall)?.description || '') || !/2021-2023 AMG G 63/.test(byId.get(IDS.fuelRecall)?.description || '') || !/143,551 figure is the total multi-model/.test(byId.get(IDS.fuelRecall)?.description || '')) errors.push('fuel recall evidence drifted');
  if (!/does not establish a combined M157/.test(byId.get(IDS.m157)?.description || '')) errors.push('M157 evidence boundary drifted');
  if (!/does not establish the frozen 2019-2025 M177/.test(byId.get(IDS.m177)?.description || '')) errors.push('M177 evidence boundary drifted');
  if (!/does not establish an OM642 oil-cooler-seal defect/.test(byId.get(IDS.om642Oil)?.description || '') || !/begins before the OM642/.test(byId.get(IDS.om642Oil)?.description || '')) errors.push('OM642 oil evidence boundary drifted');
  if (!/does not establish the frozen 2005-2018 OM642/.test(byId.get(IDS.om642Swirl)?.description || '')) errors.push('OM642 swirl evidence boundary drifted');
  if (!/10167563 and 10205237/.test(byId.get(IDS.infotainment)?.description || '') || !/do not establish one continuous 2013-2025/.test(byId.get(IDS.infotainment)?.description || '')) errors.push('infotainment evidence boundary drifted');
  if (!/11029045 covers 2025 A-pillar wind noise/.test(byId.get(IDS.doorHinge)?.description || '')) errors.push('door-hinge evidence boundary drifted');
  if (!/does not establish a universal 2000-2018 front differential/.test(byId.get(IDS.axleSeal)?.description || '')) errors.push('axle-seal evidence boundary drifted');
  if (!/does not establish a 2000-2018 steering-damper/.test(byId.get(IDS.steeringDamper)?.description || '')) errors.push('steering-damper evidence boundary drifted');
  if (!/modified transfer-case oil quality/.test(byId.get(IDS.transferLeak)?.description || '') || !/do not document an output-shaft seal leak/.test(byId.get(IDS.transferLeak)?.description || '')) errors.push('transfer-case evidence boundary drifted');
  if (!equal(packet.pdfSources, publicPdfs()) || !equal(packet.otherSources, OTHER_SOURCES)
    || !equal(packet.pdfSources?.wiringRecall?.visualPages, [1, 2, 3, 4])
    || !equal(packet.pdfSources?.fuelRecall?.visualPages, [2, 5, 10, 11, 13, 14])) errors.push('PDF evidence manifest drifted');
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
