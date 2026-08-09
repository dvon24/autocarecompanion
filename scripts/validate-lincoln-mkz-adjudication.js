/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-mkz-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|www\.fordservicecontent\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'MKZ').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'MKZ') errors.push('wrong make/model');
  if (expected.length !== 10 || rows.length !== 10 || new Set(ids).size !== 10) errors.push('MKZ coverage must be 10/10 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen MKZ snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 10 || packet.summary?.total !== 10) errors.push('summary drifted');

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push(`${row.id}: wrong action`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page may not be archived`);
    if (row.proposal.reportCount !== 0 || /\b0\+?\s+owners?\b|owners? have reported/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: fake owner social proof`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/(?:VIN-|dealer recall|no universal retail part|no universal water-pump)/i.test(row.proposal.solution)) errors.push(`${row.id}: missing commerce boundary`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(citation.url)) errors.push(`${row.id}: non-primary citation ${citation.url}`);
    }
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const coolant = byId.get(IDS.coolant);
  if (!coolant || !/2017-2019/.test(coolant.description) || !/April 8, 2019/.test(coolant.description) || !/five hours/.test(coolant.solution) || !/borescope/.test(coolant.solution) || /class-action reimbursement|\$5,000|\$15,000|head-gasket-only repair is recommended/i.test(coolant.description + coolant.solution)) errors.push('coolant correction lost exact TSB boundary');
  const water = byId.get(IDS.waterPump);
  if (!water || !/complete 466-document/.test(water.description) || !/1 quart or 1 liter/.test(water.description) || !/never remove the coolant cap/i.test(water.solution) || /100,000|\$1,500|\$3,500|replace proactively/i.test(water.description + water.solution)) errors.push('water-pump correction retained unsupported claims');
  const latch = byId.get(IDS.doorLatch);
  if (!latch || !/23V775/.test(latch.description) || !/certain 2016/.test(latch.description) || !/20V331/.test(latch.description) || !/certain 2013-2014/.test(latch.description) || /all 2013-2018.*recall/i.test(latch.description)) errors.push('door-latch campaign boundaries drifted');
  const steering = byId.get(IDS.steering);
  if (!steering || !/high-corrosion jurisdictions/.test(steering.description) || !/Manual steering remains/.test(steering.description) || !/bolts and applies wax sealer/.test(steering.solution)) errors.push('steering recall boundary drifted');
  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/January 1, 2014 through December 31, 2015/.test(transmission.description) || !/Shift Solenoid B/.test(transmission.description + transmission.solution) || /modif(?:y|ies) the valve body separator plate|remov(?:e|ing) the affected check ball|fluid service can help/i.test(transmission.description + transmission.solution)) errors.push('transmission SSM boundary drifted');
  const hybrid = byId.get(IDS.hybridSteering);
  if (!hybrid || !/2011-2012 MKZ Hybrid/.test(hybrid.description) || !/software update when none are present/.test(hybrid.solution) || hybrid.dtcCodes.length) errors.push('hybrid steering recall boundary drifted');
  const apim = byId.get(IDS.apim);
  if (!apim || !/certain 2013 MKZ/.test(apim.description) || !/six years/.test(apim.description) || !/Workshop Manual diagnosis before APIM replacement/.test(apim.description) || /class-action settlement|5 years regardless/i.test(apim.description + apim.solution)) errors.push('APIM program boundary drifted');
  const roof = byId.get(IDS.roof);
  if (!roof || !/ODI 11592151/.test(roof.description) || !/ODI 11055208/.test(roof.description) || !/allegations, not causation/.test(roof.description) || /glass was too thin|lawsuit remedy|replace worn seals|clear and flush/i.test(roof.solution)) errors.push('roof allegation boundary drifted');
  const brakes = byId.get(IDS.brakes);
  if (!brakes || !/after an ABS activation/i.test(brakes.description) || !/DOT 4 brake-fluid flush/.test(brakes.solution) || !/vehicles that fail receive HCU replacement/i.test(brakes.solution) || /quality pads and rotors|premature pad/i.test(brakes.solution)) errors.push('brake recall boundary drifted');
  const airbag = byId.get(IDS.airbag);
  if (!airbag || !/21V158/.test(airbag.description) || !/16V384, 17V024, 18V046 or 19V001/.test(airbag.description) || !/must not be inferred from 21V158 alone/.test(airbag.description) || !/do not drive it until/.test(airbag.solution)) errors.push('airbag campaign boundary drifted');
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
