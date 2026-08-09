/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor } = require('./build-mercedes-cla-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'CLA').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const retained = new Set(RETAIN_IDS);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 7, fabricated_report_counts_proposed_zero: 3, total: 9 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'CLA') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('CLA coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen CLA snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /not converted into owner-report totals/.test(line)) || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
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
    const shouldRetain = retained.has(row.id);
    const expectedAction = shouldRetain ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy';
    if (row.action !== expectedAction || row.identityReviewRequired !== !shouldRetain) errors.push(`${row.id}: identity verdict drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`); }
    else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const comand = byId.get(IDS.comand);
  if (!comand || !/LI82\.85-P-055695/.test(comand.description) || !/model 117/.test(comand.description) || !/not to replace the COMAND unit/.test(comand.solution) || !/does not establish Bluetooth-specific failure, rear-camera failure/.test(comand.description)) errors.push('COMAND evidence boundary drifted');
  const roof = byId.get(IDS.roof);
  if (!roof || !/21V-197/.test(roof.description) || !/23V-854/.test(roof.description) || !/VIN-specific/.test(roof.description) || !/authorized Mercedes-Benz dealer/.test(roof.solution)) errors.push('roof recall boundary drifted');
  const cam = byId.get(IDS.camshaft);
  if (!cam || !/15V-662/.test(cam.description) || !/does not assign both M270 and M274/.test(cam.description) || !/engine field that includes both M270 and M274/.test(rows.find((row) => row.id === IDS.camshaft)?.identityConflict || '')) errors.push('camshaft engine-scope boundary drifted');
  const brakes = byId.get(IDS.rearBrakes);
  if (!brakes || !/friction-induced noise/.test(brakes.description) || !/do not establish.*sticking caliper pistons/i.test(brakes.description)) errors.push('rear-brake evidence boundary drifted');
  const strut = byId.get(IDS.strut);
  if (!strut || !/2021-and-later/.test(strut.description) || !/end-stop buffer contacts the damper tube/.test(strut.description) || !/does not support the frozen 2014-2023/.test(rows.find((row) => row.id === IDS.strut)?.identityConflict || '')) errors.push('strut generation boundary drifted');
  const turboOil = byId.get(IDS.turboOil);
  if (!turboOil || !/10205154/.test(turboOil.description) || !/does not identify the frozen turbo circuit/.test(turboOil.description)) errors.push('turbo-oil evidence boundary drifted');
  const publicPdfs = Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = { ...source }; delete value.localPath; return [key, value]; }));
  if (!equal(packet.pdfSources, publicPdfs) || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0) !== 13 || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0) !== 13) errors.push('PDF evidence manifest drifted');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
