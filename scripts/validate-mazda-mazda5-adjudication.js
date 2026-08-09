/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  SNAPSHOT, citationsFor, identityConflictFor,
} = require('./build-mazda-mazda5-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount',
  'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda5').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const fabricatedCounts = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 5 };

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Mazda5') errors.push('wrong make/model');
  if (expected.length !== 5 || rows.length !== 5 || new Set(ids).size !== 5) errors.push('Mazda5 coverage must be 5/5 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda5 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, expectedSummary)) errors.push('summary drifted');
  if (!/All 5 frozen Mazda5 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    const combined = prose(row.proposal);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(combined)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|mazdas247\.com\/forum|abcd1234efg/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: fabricated, forum or video citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported systems or codes retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const evaporator = byId.get(IDS.evaporator);
  if (!evaporator || !/did not establish an evaporator refrigerant leak/.test(evaporator.description) || !/07-001\/21/.test(evaporator.description) || !/different condition/.test(evaporator.description) || !/Separate odor from loss of cooling/.test(evaporator.solution) || /replace (?:the )?evaporator/i.test(evaporator.solution)) errors.push('evaporator odor/leak boundary drifted');
  const egr = byId.get(IDS.egr);
  if (!egr || !/did not establish recurring EGR-valve/.test(egr.description) || !/electronic throttle body/.test(egr.description) || !/P0441, P0442, P0455 and P0456/.test(egr.description) || /Italian tune-up|wire brush|carb cleaner \(\$0/i.test(egr.solution)) errors.push('EGR source/diagnosis boundary drifted');
  const cable = byId.get(IDS.cable);
  if (!cable || !/did not establish recurring sliding-door cable fatigue/.test(cable.description) || !/disassembly steps/.test(cable.description) || !/does not identify cable breakage/.test(cable.description) || /Replace sliding door cable assembly/i.test(cable.solution)) errors.push('sliding-door cable evidence boundary drifted');
  const latch = byId.get(IDS.latch);
  if (!latch || !/06V463/.test(latch.description) || !/April 12, 2005 through February 1, 2006/.test(latch.description) || !/do not drive the vehicle/.test(latch.solution) || !/free recall remedy/.test(latch.solution) || /child-slamming causation/.test(latch.solution)) errors.push('sliding-door latch recall boundary drifted');
  const mount = byId.get(IDS.mount);
  if (!mount || !/2006 summary/.test(mount.description) || !/01-013\/13/.test(mount.description) || !/does not establish a collapsed upper transmission mount/.test(mount.description) || /replace all mounts as a set/i.test(mount.solution)) errors.push('mount identity/diagnosis boundary drifted');

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0);
  const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pages !== 90 || visual !== 90) errors.push('all 90 PDF pages must remain visually reviewed');
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
