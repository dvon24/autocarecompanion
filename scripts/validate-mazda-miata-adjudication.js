/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS, BLOCKER_IDS, IDS, OTHER_SOURCES, OUTPUT, RETAIN_IDS, SNAPSHOT,
  buildPacket, citationsFor, commerceDecisionFor, identityConflictFor,
} = require('./build-mazda-miata-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Miata').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  const retained = new Set(RETAIN_IDS); const expectedSummary = { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 6, total: 6 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Miata') errors.push('wrong make/model');
  if (expected.length !== 6 || rows.length !== 6 || new Set(ids).size !== 6) errors.push('Miata coverage must be 6/6 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Miata snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /selects no PDFs/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source); const shouldRetain = retained.has(row.id); const conflict = identityConflictFor(row.id);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (shouldRetain) {
      if (row.action !== 'retain_indexed_identity_and_accuracy_cleanup' || row.identityReviewRequired !== false || conflict || row.identityConflict !== '') errors.push(`${row.id}: retained action drifted`);
    } else if (row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' || row.identityReviewRequired !== true || !conflict || row.identityConflict !== conflict) errors.push(`${row.id}: identity hold drifted`);
    if (row.proposal.status !== 'published' || row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: status or report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/repairpal|miata\.net|forum\.|diyauto|miataturbo|grassrootsmotorsports|robbinsautotop/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: secondary/forum citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const slave = byId.get(IDS.slave); if (!slave || !/did not establish a recurring 1990-2005/.test(slave.description) || !/shared reservoir/.test(slave.description) || /RepairPal|gravity-bleed|reverse-bleed/i.test(prose(slave))) errors.push('slave-cylinder boundary drifted');
  const top = byId.get(IDS.top); if (!top || !/boot hook/.test(top.description) || !/did not establish a model-wide/.test(top.description) || /virtually every|NA01-R1-250B/i.test(prose(top))) errors.push('convertible-top boundary drifted');
  const oil = byId.get(IDS.oil); if (!oil || !/did not establish a model-wide combined/.test(oil.description) || !/does not by itself identify/.test(oil.description) || /essentially every|Mazda Motorsports identifies/i.test(prose(oil))) errors.push('oil-leak boundary drifted');
  const thrust = byId.get(IDS.thrust); if (!thrust || !/did not establish the frozen claim/.test(thrust.description) || !/No\. 4 main-cap/.test(thrust.description) || /0\.008|2\.625|2\.75|2\.875/.test(prose(thrust))) errors.push('thrust-bearing boundary drifted');
  const shortNose = byId.get(IDS.shortNose); if (!shortNose || !/internally unsafe/.test(shortNose.description) || !/116 ft-lb/.test(shortNose.description) || /80-87 ft-lbs|Loctite repair/.test(prose(shortNose))) errors.push('short-nose boundary drifted');
  const rust = byId.get(IDS.rust); if (!rust || !/did not establish a universal 1990-2005/.test(rust.description) || !/structural inspection/.test(rust.solution) || /\$1,500|write-off-risk|every oil change/i.test(prose(rust))) errors.push('structural-rust boundary drifted');
  if (Object.keys(packet.pdfSources || {}).length !== 0) errors.push('Miata packet must not claim selected PDF evidence');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}

function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
