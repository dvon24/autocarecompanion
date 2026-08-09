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
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
} = require('./build-mazda-rx7-adjudication');
const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
  stableValue,
} = require('./mazda-adjudication-utils');

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

function equal(a, b) {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function prose(row) {
  return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`;
}

function searchStyle(url) {
  return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url));
}

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mazda' && row.model === 'RX-7')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = {
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 19,
    fabricated_report_counts_proposed_zero: 2,
    total: 19,
  };

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'RX-7') errors.push('wrong make/model');
  if (expected.length !== 19 || rows.length !== 19 || new Set(ids).size !== 19) errors.push('RX-7 coverage must be 19/19 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen RX-7 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /94V094000/.test(line))
    || !packet.safetyContract?.some((line) => /95V069000/.test(line))
    || !packet.safetyContract?.some((line) => /selects no PDFs/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');

  const exactUrls = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) {
      errors.push(`${row.id}: unknown row`);
      continue;
    }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
      || row.identityReviewRequired !== true
      || row.identityConflict !== contentFor(row.id).identityConflict) errors.push(`${row.id}: identity hold drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|rx7club|nopistons|aaroncake|fd3s\.net|8020automotive|racingbeat|mazdatrix|atkinsrotary|jdmbuysell|motoiq|rotarywiki|topspeed|forum/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: secondary or commerce citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution)
      || !/No universal retail part/i.test(row.commerceDecision || '')
      || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const grounds = byId.get(IDS.grounds);
  if (!grounds || !/52457/.test(grounds.description) || !/1993-1995/.test(grounds.description)
    || !/does not apply to the frozen 1986-1991/.test(grounds.description)
    || /90%[^.]{0,60}cure|cures?[^.]{0,60}90%/i.test(prose(grounds))) errors.push('grounds boundary drifted');
  const fpd = byId.get(IDS.fpd);
  if (!fpd || !/95V069000/.test(prose(fpd)) || !/fuel hoses/.test(fpd.description)
    || !/does not identify the fuel pulsation damper/.test(fpd.description)
    || /recall proves[^.]{0,40}FPD|replace the FPD|install an FPD/i.test(prose(fpd))) errors.push('fuel-hose/FPD boundary drifted');
  for (const id of [IDS.overheatingFd, IDS.coolingBroad]) {
    const row = byId.get(id);
    if (!row || !/94V094000/.test(prose(row)) || !/1993-1994/.test(row.description)
      || !/radiator-cap/.test(row.description) || /recall proves[^.]{0,60}seal damage|upgrade to an? aluminum radiator/i.test(prose(row))) errors.push(`${id}: cooling-recall boundary drifted`);
  }
  const apex = byId.get(IDS.apexBroad);
  if (!apex || !/does not establish inherent apex-seal failure/.test(apex.description)
    || /Budget\s+\$3,000-\$6,000|use Idemitsu|well-maintained engines typically need/i.test(prose(apex))) errors.push('broad apex boundary drifted');
  for (const id of [IDS.turboSystem, IDS.turboVacuum, IDS.turboFailure, IDS.vacuumBroad]) {
    const row = byId.get(id);
    if (!row || !/Do not buy/.test(row.solution) || /convert to a single turbo for reliability|mandatory maintenance item/i.test(prose(row))) errors.push(`${id}: turbo/vacuum boundary drifted`);
  }
  if (!equal(packet.pdfSources, {}) || Object.keys(PDF_SOURCES).length !== 0) errors.push('RX-7 packet must select zero PDFs');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({
    passed: errors.length === 0,
    packetSha256: hashValue(packet),
    decisionCount: packet.rows.length,
    applicationGate: packet.applicationGate,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
