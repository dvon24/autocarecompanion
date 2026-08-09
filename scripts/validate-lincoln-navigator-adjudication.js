/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-lincoln-navigator-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|www\.fordservicecontent\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Navigator').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Navigator') errors.push('wrong make/model');
  if (expected.length !== 16 || rows.length !== 16 || new Set(ids).size !== 16) errors.push('Navigator coverage must be 16/16 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Navigator snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 16 || packet.summary?.total !== 16) errors.push('summary drifted');
  if (!/All 16 frozen Lincoln Navigator pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (row.proposal.reportCount !== 0 || /\b0\+\s*owners?\b|\bowners? have reported\b/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: fake owner social proof`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/(?:VIN|dealer|technician|diagnosis|software|no universal|no retail|no replacement part)/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(citation.url)) errors.push(`${row.id}: non-primary citation ${citation.url}`);
    }
  }

  if (Object.keys(packet.pdfSources || {}).length !== Object.keys(PDF_SOURCES).length) errors.push('PDF source inventory drifted');
  for (const source of Object.values(packet.pdfSources || {})) {
    if (!source.sha256 || !source.bytes || !source.pages || !equal(source.visualPages, Array.from({ length: source.pages }, (_, index) => index + 1))) errors.push(`PDF visual/hash metadata incomplete: ${source.title || 'unknown'}`);
    if ('localPath' in source) errors.push(`local source path leaked into packet: ${source.title}`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  for (const id of [IDS.tenR80Torque, IDS.tenR80Shudder]) {
    const row = byId.get(id);
    if (!row || !/TSB 25-2476/.test(row.description) || !/CDF clutch-cylinder sleeve/.test(row.description) || !/does not identify torque-converter shudder as a universal/.test(row.description) || !/hydraulic circuit leak/.test(row.solution) || /class action|lawsuit|fluid change (?:will|fixes)|replace the torque converter/i.test(combined(id))) errors.push(`${id}: 10R80 correction drifted`);
  }
  for (const id of [IDS.camCsp, IDS.camTiming]) {
    const row = byId.get(id);
    if (!row || !/2018-2020/.test(row.description) || !/expired January 1, 2023/.test(row.description) || !/all four VCT units/.test(row.solution) || /replace (?:the )?(?:timing )?(?:chain|guide|tensioner)|oil-change schedule|free of charge today/i.test(combined(id))) errors.push(`${id}: cam-phaser correction drifted`);
  }
  const timing = byId.get(IDS.timingChain);
  if (!timing || !/debris causing a VCT solenoid to stick/.test(timing.description) || !/cycle the affected VCT solenoid ten times/.test(timing.solution) || !/do not prove timing-chain stretch/.test(timing.solution) || /replace (?:the )?(?:timing chain|engine|water pump)|timing-chain stretch is confirmed|miles.*chain/i.test(combined(IDS.timingChain))) errors.push('timing-chain evidence boundary drifted');
  for (const id of [IDS.sparkSeize, IDS.sparkTwoPiece, IDS.sparkBreakage]) {
    const row = byId.get(id);
    if (!row || !/2005-2008/.test(row.description) || !/before October 9, 2007/.test(row.description) || !/requires the engine to be at room temperature/.test(row.solution) || !/15-minute soak/.test(row.solution) || !/Do not buy aftermarket extractors/.test(row.solution) || /PB Blaster|Seafoam|proactive.*60,?000|class action|service the engine while (?:warm|hot)/i.test(combined(id))) errors.push(`${id}: spark-plug safety correction drifted`);
  }
  for (const id of [IDS.airCompressor, IDS.airFailure]) {
    const row = byId.get(id);
    if (!row || !/alleg/i.test(row.description) || !/diagnos/i.test(row.solution) || /all Navigator|pinhole|crimp failure|Arnott|Dorman|conversion kit is recommended|8-12 years/i.test(combined(id))) errors.push(`${id}: air-suspension evidence boundary drifted`);
  }
  const brakes = byId.get(IDS.brakes);
  if (!brakes || !/25V236\/Ford 25S37/.test(brakes.description) || !/2017-2018/.test(brakes.description) || !/free of charge/.test(brakes.solution) || !/if the master cylinder is leaking.*brake booster/.test(brakes.solution) || /all 2017-2018.*recalled/i.test(combined(IDS.brakes))) errors.push('brake recall boundary drifted');
  for (const id of [IDS.runningMotor, IDS.runningStick]) {
    const row = byId.get(id);
    if (!row || !/SSM 50154/.test(row.description) || !/low-(?:battery|voltage)/i.test(combined(id)) || !/U3003:16/.test(combined(id)) || /Dorman|Mopar|replace (?:the )?(?:running-board )?motor|lubrication kit|WD-40|white lithium/i.test(combined(id))) errors.push(`${id}: running-board evidence boundary drifted`);
  }
  const hvac = byId.get(IDS.hvac);
  if (!hvac || !/1,314 Navigator manufacturer-communication records/.test(hvac.description) || !/did not identify an exact bulletin/.test(hvac.description) || !/diagnosed/.test(hvac.solution) || /replace the blend-door actuator first|common failure|all.*actuator/i.test(combined(IDS.hvac))) errors.push('HVAC unsupported-causation boundary drifted');
  const liftgate = byId.get(IDS.liftgate);
  if (!liftgate || !/ODI 11187451/.test(liftgate.description) || !/one stationary 2018/.test(liftgate.description) || !/inoperative power liftgate/.test(liftgate.description) || !/does not establish the cause of uncommanded opening/.test(liftgate.description) || /kick sensor (?:is|causes)|replace (?:the )?(?:latch|strut|motor|module)/i.test(combined(IDS.liftgate))) errors.push('liftgate evidence separation drifted');
  const sync = byId.get(IDS.sync);
  if (!sync || !/2020-2021/.test(sync.description) || !/2022-2024/.test(sync.description) || !/do not establish a blanket APIM hardware failure/.test(sync.description) || !/SYNC 3 APIM software update/.test(sync.solution) || !/OTA history/.test(sync.solution) || /replace the APIM first|class action/i.test(combined(IDS.sync))) errors.push('SYNC evidence boundary drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
