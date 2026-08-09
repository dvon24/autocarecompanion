/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-mazda-cx-7-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-7').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-7') errors.push('wrong make/model');
  if (expected.length !== 2 || rows.length !== 2 || new Set(ids).size !== 2) errors.push('Mazda CX-7 coverage must be 2/2 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-7 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 2 || packet.summary?.total !== 2) errors.push('summary drifted');
  if (!/Both frozen Mazda CX-7 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const prose = `${row.proposal.description} ${row.proposal.solution}`;
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source' || row.proposal.status !== 'published') errors.push(`${row.id}: wrong action/status`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    if (row.proposal.dtcCodes.length !== 0) errors.push(`${row.id}: unsupported DTCs retained`);
    for (const citation of row.proposal.citations) if (!/^https:\/\/static\.nhtsa\.gov\/odi\/tsbs\//.test(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact NHTSA-hosted PDF`);
  }
  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) { const publicSource = packet.pdfSources?.[key]; if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`); }
  const byId = new Map(rows.map((row) => [row.id, row.proposal])); const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  const combinedRow = byId.get(IDS.combined);
  if (!combinedRow || !/two separate L3T-engine programs/.test(combinedRow.description) || !/SSP87 covered certain 2007-2010/.test(combinedRow.description) || !/SSP86 covered certain Federal-emissions 2007-2009/.test(combinedRow.description) || /5W-20|walnut blasting|change every 5,000|L3K9-13-70X/i.test(combined(IDS.combined))) errors.push('combined SSP86/SSP87 boundary drifted');
  const vvt = byId.get(IDS.vvt);
  if (!vvt || !/February 14, 2006 through February 26, 2010/.test(vvt.description) || !/does not support the frozen 2011-2012 years/.test(vvt.description) || !/VVT actuator, or the actuator plus timing chain/.test(vvt.solution) || /VVT solenoid restores/i.test(combined(IDS.vvt))) errors.push('VVT SSP87 boundary drifted');
  const report = rows.find((row) => row.id === IDS.combined); if (!report || report.before.reportCount !== 250 || report.proposal.reportCount !== 250 || /\b250\b/.test(combined(IDS.combined))) errors.push('frozen CX-7 report count leaked or drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
