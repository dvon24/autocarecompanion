/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-mazda-cx-9-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const EXPECTED_REPORT_COUNTS = Object.freeze({
  [IDS.acEvaporator]: 0, [IDS.liftgate]: 750, [IDS.rearDifferential]: 0, [IDS.timingV6]: 2400,
  [IDS.timingTurbo]: 0, [IDS.transferLeak]: 1600, [IDS.turboCoolant]: 900, [IDS.waterPump]: 0,
});
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function combined(row) { return `${row?.description || ''} ${row?.solution || ''}`; }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-9').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-9') errors.push('wrong make/model');
  if (expected.length !== 8 || rows.length !== 8 || new Set(ids).size !== 8) errors.push('Mazda CX-9 coverage must be 8/8 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-9 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 8 || packet.summary?.total !== 8) errors.push('summary drifted');
  if (!/All 8 frozen Mazda CX-9 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');

  const exactSourceUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const prose = combined(row.proposal);
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source' || row.proposal.status !== 'published') errors.push(`${row.id}: wrong action/status`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution) || !/(?:No universal retail part|VIN-scoped dealer program)/.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id)) || row.proposal.citations.length === 0) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactSourceUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an exact approved primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (!Array.isArray(row.proposal.affectedSystems) || row.proposal.affectedSystems.length !== 0) errors.push(`${row.id}: unsupported affectedSystems retained`);
    if (row.before.reportCount !== EXPECTED_REPORT_COUNTS[row.id] || row.proposal.reportCount !== EXPECTED_REPORT_COUNTS[row.id]) errors.push(`${row.id}: report count drifted`);
    if (EXPECTED_REPORT_COUNTS[row.id] > 0 && new RegExp(`\\b${EXPECTED_REPORT_COUNTS[row.id]}\\b`).test(prose)) errors.push(`${row.id}: frozen report count leaked into prose`);
    if (row.id === IDS.liftgate) { if (!equal(row.proposal.dtcCodes, ['U3003:16'])) errors.push(`${row.id}: exact liftgate DTC drifted`); }
    else if (row.proposal.dtcCodes.length !== 0) errors.push(`${row.id}: unsupported DTCs retained`);
  }

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('complaint source metadata drifted');

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const ac = byId.get(IDS.acEvaporator);
  if (!ac || !/ODI 10546477/.test(ac.description) || !/One owner report does not establish/.test(ac.description) || !/different A\/C leak locations on 2016-2022/.test(ac.description) || /pinhole leaks|annual recharges|dashboard removal \(8-12/i.test(combined(ac))) errors.push('A/C complaint and generation boundary drifted');
  const liftgate = byId.get(IDS.liftgate);
  if (!liftgate || !/2016 CX-9/.test(liftgate.description) || !/U3003:16/.test(combined(liftgate)) || !/low battery voltage/.test(liftgate.description) || /Replace power liftgate strut motors/i.test(combined(liftgate))) errors.push('liftgate low-voltage boundary drifted');
  const diff = byId.get(IDS.rearDifferential);
  if (!diff || !/mounting rubber becomes hardened and cracked/.test(diff.description) || !/does not identify an electronically controlled coupling/.test(diff.description) || !/replacement of only the affected mounting rubber/.test(diff.solution) || /change (?:the )?(?:rear differential )?coupling fluid every 30,000 miles|reset the coupling adaptation/i.test(combined(diff))) errors.push('rear differential mount/coupling boundary drifted');
  const timingV6 = byId.get(IDS.timingV6);
  if (!timingV6 || !/ODI 11082334/.test(timingV6.description) || !/does not establish a Mazda defect determination/.test(timingV6.description) || !/did not identify a matching first-generation CX-9 timing-chain failure bulletin/.test(timingV6.description) || /typically between 80,000-120,000|replace .* as a complete kit/i.test(combined(timingV6))) errors.push('first-generation timing complaint boundary drifted');
  const timingTurbo = byId.get(IDS.timingTurbo);
  if (!timingTurbo || !/workshop-procedure correction/.test(timingTurbo.description) || !/not evidence that the chain stretches/.test(timingTurbo.description) || !/does not support.*2023-2025 years/.test(timingTurbo.description) || /change at 5,000-mile intervals|Mazda .*software update.*cold-start rattle/i.test(combined(timingTurbo))) errors.push('second-generation timing installation boundary drifted');
  const transfer = byId.get(IDS.transferLeak);
  if (!transfer || !/2010-2013 CX-9 AWD/.test(transfer.description) || !/red leak is ATF/.test(transfer.description) || !/does not need to be removed/.test(transfer.solution) || /refill with Mazda FE-LS|proactive fluid changes every 30,000 miles/i.test(combined(transfer))) errors.push('transfer seal/fluid boundary drifted');
  const turbo = byId.get(IDS.turboCoolant);
  if (!turbo || !/2016-2020 CX-9/.test(turbo.description) || !/cylinder head around the exhaust manifold/.test(turbo.description) || !/does not identify a turbocharger coolant supply\/return-line defect/.test(turbo.description) || /revised the hose material/i.test(combined(turbo))) errors.push('CSP11 cylinder-head/turbo-line boundary drifted');
  const water = byId.get(IDS.waterPump);
  if (!water || !/multiple owner reports/.test(water.description) || !/not that NHTSA or Mazda determined a model-wide defect/.test(water.description) || !/do not support automatically replacing a timing set/.test(water.description) || /10-15 hours|\$2,000|complete job/i.test(combined(water))) errors.push('water-pump complaint and repair-bundle boundary drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, EXPECTED_REPORT_COUNTS, IMMUTABLE_FIELDS, validatePacket };
