/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT,
  PDF_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, identityConflictFor,
} = require('./build-mazda-mazdaspeed3-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

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
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazdaspeed3').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const fabricatedCounts = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 4, fabricated_report_counts_proposed_zero: 2, total: 4 };

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Mazdaspeed3') errors.push('wrong make/model');
  if (expected.length !== 4 || rows.length !== 4 || new Set(ids).size !== 4) errors.push('Mazdaspeed3 coverage must be 4/4 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazdaspeed3 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, expectedSummary)) errors.push('summary drifted');
  if (!/All 4 frozen Mazdaspeed3 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');
  if (!packet.safetyContract?.some((line) => /Every selected PDF page/.test(line))) errors.push('visual-review safety contract missing');
  if (!packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('no-write safety contract missing');

  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || row.identityConflict !== identityConflictFor(row.id)) errors.push(`${row.id}: identity hold drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricatedCounts.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|mazdas247\.com\/forum|abcd1234efg|mazdaspeedforums/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: fabricated, forum or video citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(No universal retail part|Dealer-only or VIN-specific remedy)/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported systems or codes retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const mount = byId.get(IDS.mount);
  if (!mount || !/07V295/.test(mount.description) || !/No\. 4 left-side/.test(mount.description) || !/June 28, 2006 through May 19, 2007/.test(mount.description) || !/does not establish a passenger-side/.test(mount.description) || !/free of charge/.test(mount.solution) || /aftermarket performance mount|Damond|CP-E|JBRMFG/i.test(`${mount.description} ${mount.solution}`)) errors.push('engine-mount recall/identity boundary drifted');
  const seal = byId.get(IDS.turboSeal);
  if (!seal || !/SSP86/.test(seal.description) || !/Federal-emissions 2007-2008/.test(seal.description) || !/heavy white exhaust smoke/.test(seal.description) || !/does not establish the frozen 2009-2013 scope/.test(seal.description) || /delete.*banjo|braided stainless|BNR S3|BNR S4/i.test(`${seal.description} ${seal.solution}`)) errors.push('SSP86 turbo-seal boundary drifted');
  const broad = byId.get(IDS.turboBroad);
  if (!broad || !/complete reviewed 45-row/.test(broad.description) || !/did not establish a model-wide K04/.test(broad.description) || !/narrow condition cannot validate/.test(broad.description) || !/diagnose low boost, exhaust smoke, oil leakage and abnormal turbo noise as separate paths/.test(broad.solution) || /30% or more|install (?:a )?turbo timer/i.test(`${broad.description} ${broad.solution}`)) errors.push('broad K04/boost-leak boundary drifted');
  const vvt = byId.get(IDS.vvt);
  if (!vvt || !/SSP87/.test(vvt.description) || !/2007-2010 Mazdaspeed3/.test(vvt.description) || !/VVT-rotor lock-pin hole/.test(vvt.description) || !/separate warm knock or rattle below 2,000 rpm/.test(vvt.description) || !/does not establish the frozen 2011-2013 years/.test(vvt.description) || /every 60,000 miles|prevent catastrophic engine failure/i.test(`${vvt.description} ${vvt.solution}`)) errors.push('SSP87 VVT/timing-chain boundary drifted');

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0);
  const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pages !== 20 || visual !== 20) errors.push('all 20 PDF pages must remain visually reviewed');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
