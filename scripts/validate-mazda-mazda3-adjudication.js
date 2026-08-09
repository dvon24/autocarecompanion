/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS, IDENTITY_REVIEW_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  SNAPSHOT, citationsFor, identityConflictFor,
} = require('./build-mazda-mazda3-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source',
  'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda3').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const identityReview = new Set(IDENTITY_REVIEW_IDS);
  const expectedSummary = { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 6, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 0, total: 9 };

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Mazda3') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('Mazda3 coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda3 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, expectedSummary)) errors.push('summary drifted');
  if (!/All 9 frozen Mazda3 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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

    const held = identityReview.has(row.id);
    const expectedAction = held ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' : 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source';
    if (row.action !== expectedAction || row.identityReviewRequired !== held) errors.push(`${row.id}: action/identity hold drifted`);
    if (row.identityConflict !== identityConflictFor(row.id)) errors.push(`${row.id}: identity conflict drifted`);
    if (held && !row.identityConflict) errors.push(`${row.id}: identity hold lacks conflict explanation`);
    if (!held && row.identityConflict !== null) errors.push(`${row.id}: unexpected identity conflict`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);

    const combined = prose(row.proposal);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(combined)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(?:Dealer-only|No universal retail part|Free VIN-specific dealer remedy)/i.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (row.proposal.affectedSystems.length) errors.push(`${row.id}: unsupported affectedSystems retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const carbon = byId.get(IDS.carbon);
  if (!carbon || !/01-020\/15/.test(carbon.description) || !/replace the engine oil and filter/.test(carbon.solution) || !/catch can/.test(carbon.solution)) errors.push('carbon procedure/oil boundary drifted');
  const manualShift = byId.get(IDS.manualShift);
  if (!manualShift || !/05-005\/19/.test(manualShift.description) || !/synchronizer assemblies/.test(manualShift.description) || !/not the friction clutch/.test(manualShift.description) || /replace (?:the )?(?:clutch disc|pressure plate|flywheel)/i.test(manualShift.solution)) errors.push('manual-transaxle identity boundary drifted');
  const dashboard = byId.get(IDS.dashboard);
  if (!dashboard || !/SSP99/.test(dashboard.description) || !/BBM4-60-400H-02/.test(dashboard.description) || !/not lifetime coverage/.test(dashboard.solution) || !/do not promise a free repair/.test(dashboard.solution)) errors.push('dashboard scope/coverage boundary drifted');
  const infotainment = byId.get(IDS.infotainment);
  if (!infotainment || !/16-008\/23/.test(infotainment.description) || !/16-003\/23/.test(infotainment.description) || !/part and serial numbers/.test(infotainment.description) || /16-001\/23|16-004\/23/.test(infotainment.solution)) errors.push('infotainment bulletin/hardware boundary drifted');
  const purge = byId.get(IDS.purge);
  if (!purge || !/01-002\/18/.test(purge.description) || !/filler-cap leak can store P0441/.test(purge.description) || !/KOER purge-flow self-test/.test(purge.solution) || /replace (?:the )?purge (?:valve|solenoid) from the code/i.test(purge.solution)) errors.push('EVAP test-first boundary drifted');
  const parking = byId.get(IDS.parkingBrake);
  if (!parking || !/17V393/.test(parking.description) || !/Mexico-built/.test(parking.description) || !/free remedy/.test(parking.solution) || !/corroded shaft requires rear-caliper replacement/.test(parking.solution)) errors.push('parking-brake recall boundary drifted');
  const shock = byId.get(IDS.rearShock);
  if (!shock || !/did not establish recurring rear-shock upper-mount/.test(shock.description) || !/2010-2011/.test(shock.description) || !/pair replacement is not automatically necessary/.test(shock.description) || /replace.*as a set/i.test(shock.solution)) errors.push('rear-shock identity hold drifted');
  const torsion = byId.get(IDS.torsionBeam);
  if (!torsion || !/independent E-type multi-link/.test(torsion.description) || !/redesigned Mazda3 uses a torsion-beam/.test(torsion.description) || !/component does not exist/.test(torsion.solution) || /press.*bushing/i.test(torsion.solution)) errors.push('torsion-beam architecture hold drifted');
  const windshield = byId.get(IDS.windshield);
  if (!windshield || !/ODI 11300179/.test(windshield.description) || !/ODI 11390068/.test(windshield.description) || !/do not establish an unusually high rate/.test(windshield.description) || !/do not assume insurance or goodwill coverage/.test(windshield.solution) || /body flex|rake angle|bonding tolerances? (?:cause|causes)/i.test(windshield.solution)) errors.push('windshield evidence/coverage hold drifted');

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0);
  const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pages !== 75 || visual !== 75) errors.push('all 75 PDF pages must remain visually reviewed');
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
