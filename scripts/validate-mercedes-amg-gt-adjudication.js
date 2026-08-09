/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS,
  BLOCKER_IDS,
  FABRICATED_REPORT_COUNT_IDS,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  RETAIN_IDS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
} = require('./build-mercedes-amg-gt-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);

function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'AMG GT').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const retained = new Set(RETAIN_IDS);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 1, total: 4 };

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'AMG GT') errors.push('wrong make/model');
  if (expected.length !== 4 || rows.length !== 4 || new Set(ids).size !== 4) errors.push('AMG GT coverage must be 4/4 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen AMG GT snapshot');
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
    if (fabricated.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/no universal retail part|VIN-controlled software/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/code retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const mount = byId.get(IDS.mount);
  if (!mount || !/platform 290/.test(mount.description) || !/platform-192/.test(mount.description) || !/not platform 190/.test(mount.description) || /solid mounts|inspect.*15,000 miles/i.test(prose(mount))) errors.push('mount generation boundary drifted');
  const battery = byId.get(IDS.battery);
  if (!battery || !/explicitly states that no AMG GT-specific bulletin/.test(battery.description) || !/not battery drain/.test(battery.description) || /same root cause applies|telemetics.*polling/i.test(prose(battery))) errors.push('battery extrapolation boundary drifted');
  const cluster = byId.get(IDS.cluster);
  if (!cluster || !/26V-281/.test(cluster.description) || !/2024-2026 platform-192/.test(cluster.description) || !/144,049 vehicles across all included/.test(cluster.description) || !/campaign 2026050004/.test(cluster.solution) || /module resets; persistent failures may require replacement/i.test(prose(cluster))) errors.push('cluster recall boundary drifted');
  const steering = byId.get(IDS.steering);
  if (!steering || !/LI46\.80-P-068102/.test(steering.description) || !/platform-190/.test(steering.description) || !/does not establish the frozen 2024-2025 platform-192/.test(steering.description) || /owners report warnings after/i.test(prose(steering))) errors.push('steering generation boundary drifted');

  const publicPdfs = Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = { ...source }; delete value.localPath; return [key, value]; }));
  if (!equal(packet.pdfSources, publicPdfs) || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0) !== 29 || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0) !== 10) errors.push('PDF evidence manifest drifted');
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
