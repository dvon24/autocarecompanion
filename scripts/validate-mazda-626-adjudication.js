/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS,
  IDS,
  OUTPUT,
  PDF_SOURCES,
  SNAPSHOT,
  citationsFor,
} = require('./build-mazda-626-adjudication');
const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
  stableValue,
} = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);

function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === '626').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== '626') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('Mazda 626 coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda 626 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 9 || packet.summary?.total !== 9) errors.push('summary drifted');
  if (!/All 9 frozen Mazda 626 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!Array.isArray(packet.safetyContract) || !packet.safetyContract.some((line) => /0\+ owners/.test(line))) errors.push('0+ owners safety contract missing');

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
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push(`${row.id}: wrong action`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page may not be archived`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/(?:VIN|dealer|diagnosis|no universal|no retail|recall)/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const sourceCitation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(sourceCitation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(sourceCitation.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(sourceCitation.url)) errors.push(`${row.id}: non-primary citation ${sourceCitation.url}`);
    }
  }

  if (Object.keys(packet.pdfSources || {}).length !== Object.keys(PDF_SOURCES).length) errors.push('PDF source inventory drifted');
  for (const source of Object.values(packet.pdfSources || {})) {
    if (!source.sha256 || !source.bytes || !source.pages || !equal(source.visualPages, Array.from({ length: source.pages }, (_, index) => index + 1))) errors.push(`PDF visual/hash metadata incomplete: ${source.title || 'unknown'}`);
    if ('localPath' in source) errors.push(`local source path leaked into packet: ${source.title}`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;

  const earlyTransmission = byId.get(IDS.transmissionEarly);
  if (!earlyTransmission || !/do not prove a universal CD4E failure rate/.test(earlyTransmission.description) || !/applies only to the 1997 portion/.test(earlyTransmission.description) || !/power-flush the cooler and lines/.test(earlyTransmission.solution) || /60,?000|100,?000|undersized clutches|fragile valve body|30,?000 miles|manual.*reliable/i.test(combined(IDS.transmissionEarly))) errors.push('early transmission evidence boundary drifted');

  const distributor = byId.get(IDS.distributor);
  if (!distributor || !/communication record 54216/.test(distributor.description) || !/do not establish.*80,000-120,000-mile pattern/.test(distributor.description) || !/Do not buy a complete distributor/.test(distributor.solution) || /Cardone|EricTheCarGuy|heat is the common cause|heat always destroys/i.test(combined(IDS.distributor))) errors.push('distributor evidence boundary drifted');

  const egr = byId.get(IDS.egr);
  if (!egr || !/did not produce a 626 bulletin/.test(egr.description) || !/diagnostic possibility/.test(egr.description) || !/Do not buy an EGR valve/.test(egr.solution) || /every 60k|preventive maintenance/i.test(combined(IDS.egr))) errors.push('EGR evidence boundary drifted');

  const headGasket = byId.get(IDS.headGasket);
  if (!headGasket || !/individual report/.test(headGasket.description) || !/not proof of a chronic defect/.test(headGasket.description) || !/block heater/.test(headGasket.description) || !/Do not buy a head-gasket set/.test(headGasket.solution)) errors.push('head-gasket evidence boundary drifted');

  const ignition = byId.get(IDS.ignitionSwitch);
  if (!ignition || !/15V674/.test(ignition.description) || !/1993-1998 Mazda 626/.test(ignition.description) || !/carbonize/.test(ignition.description) || !/free replacement/.test(ignition.solution) || /independent aftermarket/i.test(ignition.solution)) errors.push('ignition recall boundary drifted');

  const v6Seal = byId.get(IDS.v6DistributorSeal);
  if (!v6Seal || !/do not establish an internal distributor oil-seal/.test(v6Seal.description) || !/does not document this oil-leak mechanism/.test(v6Seal.description) || !/Do not buy a seal kit/.test(v6Seal.solution) || /RTV|sealer around the housing/i.test(combined(IDS.v6DistributorSeal))) errors.push('V6 distributor-seal evidence boundary drifted');

  const idle = byId.get(IDS.roughIdle);
  if (!idle || !/P0300-P0306/.test(idle.description) || !/do not establish the idle-air-control valve/.test(idle.description) || !/do not spray flammable cleaner/.test(idle.solution) || !/Do not buy an idle valve/.test(idle.solution)) errors.push('rough-idle evidence boundary drifted');

  const tensioner = byId.get(IDS.timingTensioner);
  if (!tensioner || !/00V134/.test(tensioner.description) || !/2\.0-liter engine/.test(tensioner.description) || !/98V206.*1997/.test(tensioner.description) || !/dealer inspection and replacement/.test(tensioner.solution) || /non-interference|recommended interval|engine damage/i.test(combined(IDS.timingTensioner))) errors.push('timing-tensioner recall boundary drifted');

  const lateTransmission = byId.get(IDS.transmissionLate);
  if (!lateTransmission || !/TSB 05-002\/21/.test(lateTransmission.description) || !/Neither source establishes a fixed 60,000-100,000-mile failure window/.test(lateTransmission.description) || !/different from an unspecific retail fluid-exchange kit/.test(lateTransmission.solution) || /Mercon V|manual swap|never flush|30,?000 miles/i.test(combined(IDS.transmissionLate))) errors.push('late transmission evidence boundary drifted');

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
