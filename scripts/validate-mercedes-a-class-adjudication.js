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
  contentFor,
} = require('./build-mercedes-a-class-adjudication');
const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
  stableValue,
} = require('./known-issue-adjudication-utils');

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
  const expected = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'A-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const retained = new Set(RETAIN_IDS);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = {
    retain_indexed_identity_and_accuracy_cleanup: 1,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8,
    fabricated_report_counts_proposed_zero: 3,
    total: 9,
  };

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mercedes-Benz' || packet.model !== 'A-Class') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('A-Class coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen A-Class snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /Recall and campaign population figures/.test(line))
    || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');

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
    if (row.action !== expectedAction || row.identityReviewRequired !== !shouldRetain || row.identityConflict !== contentFor(row.id).identityConflict) errors.push(`${row.id}: identity verdict drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const dct = byId.get(IDS.dct);
  if (!dct || !/7G-DCT seven-speed/.test(dct.description) || !/does not support the stored 8G-DCT/.test(dct.description)
    || /avoid prolonged creeping|use Sport mode/i.test(prose(dct))) errors.push('DCT evidence boundary drifted');
  const mbux = byId.get(IDS.mbux);
  if (!mbux || !/LI82\.85-P-070544/.test(mbux.description) || !/21V-354/.test(mbux.description)
    || /Factory reset.*resolves|updates quarterly/i.test(prose(mbux))) errors.push('MBUX evidence boundary drifted');
  const strut = byId.get(IDS.strut);
  if (!strut || !/does not establish premature/.test(strut.description) || /replace the front strut mount bearings first/i.test(prose(strut))) errors.push('strut evidence boundary drifted');
  const drain = byId.get(IDS.drain);
  if (!drain || !/20V-416 applies to certain 2019 A220/.test(drain.description) || !/lists no component part number/.test(drain.description)
    || /installs a water drain plug|replaces the fuel pump control unit/i.test(prose(drain))) errors.push('drain recall boundary drifted');
  const dpf = byId.get(IDS.dpf);
  if (!dpf || !/U\.S\. NHTSA A-Class corpus cannot validate/.test(dpf.description) || /sustained highway run|forced\/static regeneration/i.test(prose(dpf))) errors.push('DPF source boundary drifted');
  const carrier = byId.get(IDS.carrier);
  if (!carrier || !/21V-990 covers certain 2019-2020 A220/.test(carrier.description) || !/A1776207101/.test(carrier.description)
    || !/no field complaints worldwide/.test(carrier.description) || /out-of-recall vehicles.*replacement/i.test(prose(carrier))) errors.push('carrier recall boundary drifted');
  const carbon = byId.get(IDS.carbon);
  if (!carbon || !/No exact Mercedes primary document/.test(carbon.description) || /every ~50,000|top-tier fuel/i.test(prose(carbon))) errors.push('carbon source boundary drifted');
  const thermostat = byId.get(IDS.thermostat);
  if (!thermostat || !/10199660/.test(thermostat.description) || !/does not establish an M282 thermostat-housing defect/.test(thermostat.description)
    || /Replace the complete OEM thermostat housing assembly/i.test(prose(thermostat))) errors.push('coolant evidence boundary drifted');
  const camera = byId.get(IDS.camera);
  if (!camera || !/21V-354/.test(camera.description) || !/22V-232/.test(camera.description)
    || !/software\/VIN controlled/.test(camera.solution) || /head unit replacement/i.test(prose(camera))) errors.push('camera recall boundary drifted');

  const publicPdfs = Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = { ...source };
    delete value.localPath;
    return [key, value];
  }));
  if (!equal(packet.pdfSources, publicPdfs)
    || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0) !== 68
    || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0) !== 16) errors.push('PDF evidence manifest drifted');
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
