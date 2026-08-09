/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS,
  FABRICATED_REPORT_COUNT_IDS,
  IDENTITY_REVIEW_IDS,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  SNAPSHOT,
  citationsFor,
  identityConflictFor,
} = require('./build-mazda-cx-90-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'relatedIssueIds',
];
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
  const expected = snapshot.records
    .filter((row) => row.make === 'Mazda' && row.model === 'CX-90')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const identityReview = new Set(IDENTITY_REVIEW_IDS);
  const fabricatedCounts = new Set(FABRICATED_REPORT_COUNT_IDS);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-90') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('Mazda CX-90 coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-90 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, {
    retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 3,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 6,
    fabricated_report_counts_proposed_zero: 4,
    total: 9,
  })) errors.push('summary drifted');
  if (!/All 9 frozen Mazda CX-90 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');
  if (!packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('no-write safety contract missing');

  const exactSourceUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    }
    for (const field of Object.keys(row.proposal || {})) {
      if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    }
    for (const field of IMMUTABLE_FIELDS) {
      if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    }
    for (const field of row.changedFields) {
      if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    }

    const held = identityReview.has(row.id);
    const expectedAction = held
      ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
      : 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source';
    if (row.action !== expectedAction || row.identityReviewRequired !== held) errors.push(`${row.id}: action/identity hold drifted`);
    if (row.identityConflict !== identityConflictFor(row.id)) errors.push(`${row.id}: identity conflict drifted`);
    if (held && !row.identityConflict) errors.push(`${row.id}: identity hold lacks conflict explanation`);
    if (!held && row.identityConflict !== null) errors.push(`${row.id}: unexpected identity conflict`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);

    if (fabricatedCounts.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) {
      errors.push(`${row.id}: report count drifted`);
    }

    const combined = prose(row.proposal);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(combined)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(?:no required parts|no user-selected retail part|no hardware selected|no steering gear|no fuel pump|not a universal retail recommendation|no universal retail part|no fluid)/i.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) {
      if (!exactSourceUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    }
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (!Array.isArray(row.proposal.affectedSystems) || row.proposal.affectedSystems.length !== 0) errors.push(`${row.id}: unsupported affectedSystems retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const battery = byId.get(IDS.battery);
  if (!battery || !/safe to drive/.test(battery.description) || !/improper PCM and M Hybrid Boost\/BECM software/.test(battery.description) || !/lists no required parts/.test(battery.solution) || /replace (?:the )?(?:48-volt )?battery/i.test(battery.solution)) errors.push('battery software/no-parts boundary drifted');

  const dash = byId.get(IDS.dashEsu);
  if (!dash || !/24V814/.test(dash.description) || !/70,974/.test(dash.description) || !/windshield defroster/.test(dash.description) || !/360-degree view monitor/.test(dash.description) || !/reprogram the Dash ESU/.test(dash.solution)) errors.push('Dash-ESU recall boundary drifted');

  const gauge = byId.get(IDS.fuelGauge);
  if (!gauge || !/88,798/.test(gauge.description) || !/PHEV vehicles are outside this recall/.test(gauge.description) || !/ethanol-containing fuel/i.test(gauge.description) || !/body control module/.test(gauge.solution)) errors.push('fuel-gauge recall boundary drifted');

  const infotainment = byId.get(IDS.infotainment);
  if (!infotainment || !/16-003\/25/.test(infotainment.description) || !/camera images remain available/.test(infotainment.description) || !/10020 or later/.test(infotainment.solution) || !/not available as an over-the-air update/.test(infotainment.solution) || /backup camera (?:is|becomes) (?:disabled|unavailable)/i.test(infotainment.solution)) errors.push('infotainment camera/software boundary drifted');

  const steering = byId.get(IDS.steering);
  if (!steering || !/model-year 2024 CX-90/.test(steering.description) || !/RQ26002/.test(steering.description) || !/26 complaints/.test(steering.description) || !/open query is an investigation/.test(steering.description) || !/not a final finding/.test(steering.description) || /model-year 2025/i.test(steering.solution)) errors.push('steering recall-query boundary drifted');

  const engine = byId.get(IDS.engineStalling);
  if (!engine || !/23V719/.test(engine.description) || !/24V815/.test(engine.description) || !/24V816/.test(engine.description) || !/24V817/.test(engine.description) || !/dealer software updates/.test(engine.solution) || /24V-?014|24V-?228|replace (?:the )?(?:fuel pump|turbocharger)/i.test(engine.solution)) errors.push('engine recall boundary drifted');

  const roof = byId.get(IDS.roof);
  if (!roof || !/09-010\/24/.test(roof.description) || !/09-045\/24/.test(roof.description) || !/early model-year 2024/.test(roof.description) || !/modified headliner fastener/.test(roof.solution) || /seals? (?:settle|settling)/i.test(roof.solution)) errors.push('roof bulletin boundary drifted');

  const charging = byId.get(IDS.charging);
  if (!charging || !/selector not being in Park/.test(charging.description) || !/high-voltage battery/.test(charging.description) || !/depleted 12-volt battery/.test(charging.description) || !/amber charging-system indicator/.test(charging.solution) || !/red indicator calls for inspection/.test(charging.solution) || /replace (?:the )?onboard charger/i.test(charging.solution)) errors.push('charging manual/diagnosis boundary drifted');

  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/05-004\/24/.test(transmission.description) || !/cold 1-2 shift shock/.test(transmission.description) || !/05-007\/24/.test(transmission.description) || !/early 2024 MHEV/.test(transmission.description) || !/TCM initial learning/.test(transmission.solution) || /valve.body replacement|30,000 miles|500\+? miles|model-year 2025/i.test(transmission.solution)) errors.push('transmission exact-bulletin boundary drifted');

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  const pdfPageCount = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0);
  const visualPageCount = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pdfPageCount !== 38 || visualPageCount !== 38) errors.push('all 38 PDF pages must remain visually reviewed');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('owner-manual source metadata drifted');
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
