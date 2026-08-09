/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { ALL_IDS, BLOCKER_IDS, FABRICATED_REPORT_COUNT_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, identityConflictFor } = require('./build-mazda-mazdaspeed6-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'lastReportedByOwners', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = []; const deterministic = buildPacket(snapshot);
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazdaspeed6').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  const fabricatedCounts = new Set(FABRICATED_REPORT_COUNT_IDS); const retained = new Set(RETAIN_IDS);
  const expectedSummary = { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 11, fabricated_report_counts_proposed_zero: 3, total: 13 };
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'Mazdaspeed6') errors.push('wrong make/model');
  if (expected.length !== 13 || rows.length !== 13 || new Set(ids).size !== 13) errors.push('Mazdaspeed6 coverage must be 13/13 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazdaspeed6 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /Every selected PDF page/.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const conflict = identityConflictFor(row.id); const shouldRetain = retained.has(row.id);
    if (row.identityReviewRequired !== Boolean(conflict) || row.identityConflict !== conflict) errors.push(`${row.id}: identity-review state drifted`);
    if (shouldRetain && row.action !== 'retain_indexed_identity_and_accuracy_cleanup') errors.push(`${row.id}: retained action drifted`);
    if (!shouldRetain && row.action !== 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy') errors.push(`${row.id}: hold action drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricatedCounts.has(row.id)) { if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`); }
    else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|mazdas247\.com\/forum|mazda6club|corksport|cobbtuning|grassrootsmotorsports|mazdaproblems|mazdaspeeds\.org/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: secondary/forum citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(No universal retail part|Dealer-only or VIN-specific remedy)/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const fuel = byId.get(IDS.fuelRing); if (!fuel || !/21V744/.test(fuel.description) || !/improper installation/i.test(fuel.description) || !/fire risk/.test(fuel.description) || !/free of charge/.test(fuel.solution)) errors.push('fuel-ring recall boundary drifted');
  const takata = byId.get(IDS.takata); if (!takata || !/17V474/.test(takata.description) || !/18V402/.test(takata.description) || !/Do Not Drive/.test(takata.description) || !/Do Not Drive warning/.test(takata.solution) || !/free dealer repair/.test(takata.solution)) errors.push('Takata recall boundary drifted');
  const hpfp = byId.get(IDS.hpfp); if (!hpfp || !/did not establish recurring high-pressure/.test(hpfp.description) || !/10041267/.test(hpfp.description) || /upgraded internal kits|Accessport/i.test(hpfp.solution)) errors.push('HPFP evidence boundary drifted');
  const carbon = byId.get(IDS.carbon); if (!carbon || !/electronic throttle body/.test(carbon.description) || !/different component/.test(carbon.description) || /walnut-blast.*every 40,000/i.test(carbon.solution)) errors.push('carbon component boundary drifted');
  const clutch = byId.get(IDS.clutch); if (!clutch || !/10021571/.test(clutch.description) || !/difficult-to-operate clutch pedal/.test(clutch.description) || !/separate pedal effort/.test(clutch.solution)) errors.push('clutch identity boundary drifted');
  const pcv = byId.get(IDS.pcv); if (!pcv || !/SSP86/.test(pcv.description) || !/Federal-emissions 2006-2007/.test(pcv.description) || !/does not establish generic PCV-valve failure/.test(pcv.description) || /install.*catch can/i.test(pcv.solution)) errors.push('PCV/SSP86 boundary drifted');
  const fluid = byId.get(IDS.rearFluid); if (!fluid || !/10186693/.test(fluid.description) || !/outside factory schedules are not recommended/.test(fluid.description) || /every 30,000 miles/i.test(fluid.solution)) errors.push('rear-fluid schedule boundary drifted');
  const starvation = byId.get(IDS.turboStarvation); if (!starvation || !/did not establish Mazdaspeed6 turbocharger oil starvation/.test(starvation.description) || !/distinct white-smoke condition/.test(starvation.description) || /delete.*screen/i.test(starvation.solution)) errors.push('turbo-starvation boundary drifted');
  const vvt = byId.get(IDS.vvt); if (!vvt || !/SSP87/.test(vvt.description) || !/separate warm knock or rattle below 2,000 rpm/.test(vvt.description) || !/distinguish the cold-start VVT tick/.test(vvt.solution)) errors.push('VVT/timing-chain boundary drifted');
  const diff = byId.get(IDS.diffMount); if (!diff || !/did not establish a weak rear-differential mount/.test(diff.description) || /lasting fix is an aftermarket/i.test(diff.solution)) errors.push('differential-mount boundary drifted');
  const rod = byId.get(IDS.rod); if (!rod || !/did not establish recurring connecting-rod failure/.test(rod.description) || !/No reviewed primary source supports the 120-owner total/.test(rod.description) || /always downshift/i.test(rod.solution)) errors.push('connecting-rod boundary drifted');
  const transfer = byId.get(IDS.transfer); if (!transfer || !/no Mazdaspeed6 transfer-case seal/.test(transfer.description) || !/no such campaign/.test(identityConflictFor(IDS.transfer)) || /magnetic drain plug/i.test(transfer.solution)) errors.push('transfer-case boundary drifted');
  const turboOil = byId.get(IDS.turboOil); if (!turboOil || !/did not establish recurring Mazdaspeed6 turbo oil-feed-line O-ring leakage/.test(turboOil.description) || !/does not identify an oil-feed-line O-ring/.test(turboOil.description) || /proactively at 50,000/i.test(turboOil.solution)) errors.push('turbo-feed-line boundary drifted');
  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) { const publicSource = packet.pdfSources?.[key]; if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`); }
  const pages = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + Number(source.pages || 0), 0); const visual = Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + (source.visualPages?.length || 0), 0);
  if (pages !== 30 || visual !== 30) errors.push('all 30 PDF pages must remain visually reviewed');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
