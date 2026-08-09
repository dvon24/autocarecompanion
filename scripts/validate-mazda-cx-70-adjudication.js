/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS,
  IDENTITY_REVIEW_IDS,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  SNAPSHOT,
  citationsFor,
} = require('./build-mazda-cx-70-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'relatedIssueIds', 'reportCount',
];
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source',
  'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);

function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records
    .filter((row) => row.make === 'Mazda' && ['CX-70', 'CX70'].includes(row.model))
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const identityReview = new Set(IDENTITY_REVIEW_IDS);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-70') errors.push('wrong make/model');
  if (expected.length !== 19 || rows.length !== 19 || new Set(ids).size !== 19) errors.push('Mazda CX-70 coverage must be 19/19 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-70 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, {
    retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 16,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3,
    total: 19,
  })) errors.push('summary drifted');
  if (!/All 19 frozen Mazda CX-70 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');
  if (!packet.safetyContract?.some((line) => /Every selected PDF page was rendered/.test(line))) errors.push('PDF visual-review contract missing');

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
    if (held && !row.identityConflict) errors.push(`${row.id}: identity hold lacks conflict explanation`);
    if (!held && row.identityConflict !== null) errors.push(`${row.id}: unexpected identity conflict`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);

    const combined = prose(row.proposal);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\bmultiple (?:cx-70 )?owners?\b/i.test(combined)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/\btypically\b|\bcommon(?:ly)?\b|\bwidespread\b/i.test(combined) && /complaint/i.test(combined)) errors.push(`${row.id}: complaint prevalence language is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(?:No universal retail part|no universal consumer-retail part|no retail part|no universal retail part|no DIY)/i.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) {
      if (!exactSourceUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    }
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (!Array.isArray(row.proposal.affectedSystems) || row.proposal.affectedSystems.length !== 0) errors.push(`${row.id}: unsupported affectedSystems retained`);
    if (row.before.reportCount !== row.proposal.reportCount) errors.push(`${row.id}: report count drifted`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const battery = byId.get(IDS.battery);
  if (!battery || !/do not establish a universal parked-current defect/i.test(battery.description) || !/fully charge and test/i.test(battery.solution) || /PE1X-18-520A|Group 35 AGM/i.test(prose(battery))) errors.push('battery diagnostic boundary drifted');
  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/2025 CX-70 PHEV/.test(transmission.description) || !/does not affect durability or reliability/.test(transmission.description) || !/does not substantiate every low-speed/i.test(transmission.description) || /design paper/i.test(prose(transmission))) errors.push('transmission normal-operation boundary drifted');
  const bsm = byId.get(IDS.bsm);
  if (!bsm || !/electrical noise/.test(bsm.description) || !/insufficient fastening/.test(bsm.description) || !/radar aiming/.test(bsm.solution) || /most commonly report|definitive Mazda software remedy was still pending/i.test(prose(bsm))) errors.push('BSM bulletin boundary drifted');
  const dash = byId.get(IDS.dashEsu);
  if (!dash || !/24V-814/.test(prose(dash)) || !/windshield defroster/.test(dash.description) || !/free of charge/.test(dash.solution)) errors.push('Dash-ESU recall boundary drifted');
  const p0531 = byId.get(IDS.p0531);
  if (!p0531 || !/last issued April 4, 2025/.test(p0531.description) || !/before March 1, 2025/.test(p0531.description) || !equal(p0531.dtcCodes, ['P0531:00']) || /temporarily suspended/i.test(prose(p0531))) errors.push('P0531 latest-bulletin boundary drifted');
  const hybrid = byId.get(IDS.hybridWarning);
  if (!hybrid || !/not one universal cause/.test(hybrid.description) || !/ODI|complaint 11740990/i.test(hybrid.description) || !/do not prove that the same component/.test(hybrid.description) || /battery-energy-control-module|electrical leakage/i.test(prose(hybrid))) errors.push('hybrid warning evidence boundary drifted');
  const gauge = byId.get(IDS.fuelGauge);
  const gaugeDecision = rows.find((row) => row.id === IDS.fuelGauge);
  if (!gauge || !/mild-hybrid vehicles, not the PHEV/.test(gauge.description) || !/ethanol-containing fuel/i.test(gauge.description) || !/body control module/.test(gauge.solution) || gaugeDecision?.identityReviewRequired !== true) errors.push('fuel-gauge scope hold drifted');
  const fuelDoor = byId.get(IDS.fuelDoor);
  if (!fuelDoor || !/explicitly excludes the CX-70 PHEV/.test(fuelDoor.description) || !/without prying/.test(fuelDoor.solution) || /KD45-68-865/.test(prose(fuelDoor))) errors.push('fuel-door exact-scope boundary drifted');
  const inverter = byId.get(IDS.inverterRecall);
  if (!inverter || !/24V-817/.test(prose(inverter)) || !/fail-safe mode/.test(inverter.description) || !/does not direct inverter replacement/.test(inverter.description)) errors.push('inverter recall boundary drifted');
  const phantom = byId.get(IDS.phantomBraking);
  if (!phantom || !/11736754/.test(phantom.description) || !/not an NHTSA or Mazda defect determination/.test(phantom.description) || /Mazda was aware|known issue for multiple/i.test(prose(phantom))) errors.push('phantom-braking complaint boundary drifted');
  const charge = byId.get(IDS.chargeFault);
  if (!charge || !/selector not being in Park/.test(charge.description) || !/persistent red vehicle charge indicator/.test(charge.description) || /replace.*on-board charger/i.test(prose(charge))) errors.push('charging manual boundary drifted');
  const sudden = byId.get(IDS.suddenAcceleration);
  if (!sudden || !/11631266/.test(sudden.description) || !/two occasions with different drivers/.test(sudden.description) || !/does not establish a Mazda defect finding/.test(sudden.description) || /suspected contributor|Diagnosis and reprogramming are covered/i.test(prose(sudden))) errors.push('sudden-acceleration complaint boundary drifted');
  const trim = byId.get(IDS.heatTrim);
  if (!trim || !/11671136/.test(trim.description) || !/window-pillar trim and an Inline-6 emblem/.test(trim.description) || !/does not identify a universal retail part/.test(trim.solution)) errors.push('heat-trim complaint boundary drifted');
  const water = byId.get(IDS.water);
  if (!water || !/11632568/.test(water.description) || !/261-row CX-70 manufacturer-communication inventory/.test(water.description) || !/does not establish liftgate grommets/.test(water.description) || /Mazda has issued TSBs covering/i.test(prose(water))) errors.push('water-intrusion hold drifted');
  for (const infotainmentId of [IDS.infotainmentLag, IDS.infotainmentUpdates]) {
    const item = byId.get(infotainmentId);
    if (!item || !/16-004\/25/.test(item.description) || !/10026 or later/.test(item.solution) || /typical first-model-year|regular software updates|hard reset/i.test(prose(item))) errors.push(`${infotainmentId}: infotainment exact-version boundary drifted`);
  }
  const mapLight = byId.get(IDS.mapLight);
  if (!mapLight || !/09-015\/25/.test(mapLight.description) || !/before March 19, 2024/.test(mapLight.solution) || /silicone|weatherstrip adhesive/i.test(prose(mapLight))) errors.push('map-light exact repair boundary drifted');
  const phev = byId.get(IDS.phevSoftware);
  if (!phev || !/calls that exact behavior normal operation/.test(phev.description) || !/do not establish a broad category/.test(phev.description) || /Multiple updates have been released|Use EV mode in city/i.test(prose(phev))) errors.push('PHEV normal-versus-recall identity hold drifted');
  const spoiler = byId.get(IDS.liftgateSpoiler);
  if (!spoiler || !/09-020\/25/.test(spoiler.description) || !/before January 7, 2025/.test(spoiler.solution) || /replace.*stabilizer|replace.*damper/i.test(prose(spoiler))) errors.push('liftgate-spoiler exact repair boundary drifted');

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
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
