/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor } = require('./build-mercedes-c-class-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'C-Class').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 15, fabricated_report_counts_proposed_zero: 7, false_citations_identified: 1, total: 15 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'C-Class') errors.push('wrong make/model');
  if (expected.length !== 15 || rows.length !== 15 || new Set(ids).size !== 15) errors.push('C-Class coverage must be 15/15 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen C-Class snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /not converted into owner-report totals/.test(line)) || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line)) || !packet.safetyContract?.some((line) => /false 24V-797/.test(line))) errors.push('safety contract incomplete');
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
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true) errors.push(`${row.id}: identity verdict drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`); }
    else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: zero report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const hybrid48v = byId.get(IDS.hybrid48v);
  if (!hybrid48v || !/2025050001/.test(hybrid48v.description) || !/Neither establishes universal ISG hardware failure/.test(hybrid48v.description) || /replace(?:ment)? of the integrated starter-generator/i.test(prose(hybrid48v))) errors.push('48V evidence boundary drifted');
  const adas = byId.get(IDS.adas);
  if (!adas || !/25P5496520/.test(adas.description) || !/does not establish sensor misalignment/.test(adas.description)) errors.push('ADAS coding boundary drifted');
  const mbux = byId.get(IDS.mbux);
  if (!mbux || !/General Motors/.test(mbux.description) || !/26V-281/.test(mbux.description) || mbux.citations.some((citation) => /24V797/.test(citation.url))) errors.push('MBUX false-citation boundary drifted');
  const cam = byId.get(IDS.camAdjuster);
  if (!cam || !/2012-2015 C250\/C250 Coupe/.test(cam.description) || !/M271/.test(cam.description) || !/not the frozen M274\/M276 solenoid identity/.test(rows.find((row) => row.id === IDS.camAdjuster)?.identityConflict || '')) errors.push('cam-adjuster identity boundary drifted');
  const subframe = byId.get(IDS.subframe);
  if (!subframe || !/corrosion has produced perforation/.test(subframe.description) || !/Do not buy or weld/.test(subframe.solution) || /Weld-repair minor cracks/i.test(prose(subframe))) errors.push('subframe corrosion/welding boundary drifted');
  const publicPdfs = Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = { ...source }; delete value.localPath; return [key, value]; }));
  if (!equal(packet.pdfSources, publicPdfs) || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0) !== 35 || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0) !== 35) errors.push('PDF evidence manifest drifted');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}

function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
