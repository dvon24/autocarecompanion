/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, identityConflictFor } = require('./build-mazda-mpv-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot); const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'MPV').sort((a, b) => a.id.localeCompare(b.id)); const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id); const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS); const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 5 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'MPV') errors.push('wrong make/model');
  if (expected.length !== 5 || rows.length !== 5 || new Set(ids).size !== 5) errors.push('MPV coverage must be 5/5 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen MPV snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /Every selected PDF page/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || row.identityConflict !== identityConflictFor(row.id)) errors.push(`${row.id}: identity hold drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`); } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|mazdaproblems|carcomplaints|carproblemzoo|abcd1234efg/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: fabricated or secondary citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const alternator = byId.get(IDS.alternator); if (!alternator || !/226-row/.test(alternator.description) || !/no usable citation/.test(alternator.description) || !/140-owner total/.test(alternator.description) || /install (?:an )?exhaust heat shield/i.test(prose(alternator))) errors.push('alternator boundary drifted');
  const spring = byId.get(IDS.spring); if (!spring || !/fabricated video identifier/.test(spring.description) || !/other vehicles, not the MPV/.test(spring.description) || /MOOG CC855|Monroe 904984|apply undercoating annually|replace both rear springs(?: as a pair)?/i.test(prose(spring))) errors.push('spring boundary drifted');
  const sliding = byId.get(IDS.sliding); if (!sliding || !/upper roller/.test(sliding.description) || !/2002-2005/.test(sliding.description) || !/2002-2006/.test(sliding.description) || !/160-owner total/.test(sliding.description) || /cable replacement is (?:the )?most common/i.test(prose(sliding))) errors.push('sliding-door boundary drifted');
  const transmission = byId.get(IDS.transmission); if (!transmission || !/MSP03 \/ communication 10023158/.test(transmission.description) || !/April 1, 2003 through January 26, 2004/.test(transmission.description) || !/TCM software calibration/.test(transmission.description) || !/180-owner total/.test(transmission.description) || /flush the transmission as routine maintenance/i.test(prose(transmission))) errors.push('transmission boundary drifted');
  const slip = byId.get(IDS.transmissionSlip); if (!slip || !/does not establish a uniform 5-speed/.test(slip.description) || !/80,000-120,000-mile/.test(slip.description) || !/10206002/.test(slip.description) || !/not routine preventive flushing/.test(slip.description) || /Change transmission fluid and filter every|Jasper|\$[1-9][0-9,]*/i.test(prose(slip))) errors.push('transmission-slip boundary drifted');
  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) { const publicSource = packet.pdfSources?.[key]; if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`); }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0); const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0); if (pages !== 4 || visual !== 4) errors.push('all 4 PDF pages must remain visually reviewed'); if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted'); return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main(); module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
