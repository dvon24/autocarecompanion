/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-lucid-gravity-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lucid-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|lucidmotors\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lucid' && row.model === 'Gravity').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lucid' || packet.model !== 'Gravity') errors.push('wrong make/model');
  if (expected.length !== 7 || rows.length !== 7 || new Set(ids).size !== 7) errors.push('Lucid Gravity coverage must be 7/7 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Lucid Gravity snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 7 || packet.summary?.total !== 7) errors.push('summary drifted');
  if (!/All 7 frozen Lucid Gravity pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/(?:VIN|dealer|diagnosis|no universal|no retail|software recall)/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
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
  const door = byId.get(IDS.doorHandles);
  if (!door || !/OTA 3\.5\.1/.test(door.description) || !/unintended repeated exterior-handle movements/.test(door.description) || !/do not establish a recurring latch or actuator hardware defect/.test(door.description) || !/Do not buy a handle actuator/.test(door.solution) || /abandoning electric handles|reliability problems|4-year\/50,000-mile|replacement under warranty/i.test(combined(IDS.doorHandles))) errors.push('door-handle evidence boundary drifted');
  const hvac = byId.get(IDS.hvac);
  if (!hvac || !/OTA 3\.3\.20/.test(hvac.description) || !/OTA 3\.5\.1/.test(hvac.description) || !/OTA 3\.6\.2/.test(hvac.description) || !/do not establish the published passenger-vent blower or actuator failure/.test(hvac.description) || !/Do not buy a blower motor/.test(hvac.solution) || /Marc Winterhoff|72F feels chilly|blower-motor \/ vent actuator inspection under warranty/i.test(combined(IDS.hvac))) errors.push('HVAC evidence boundary drifted');
  const airbag = byId.get(IDS.airbag);
  if (!airbag || !/25V855/.test(airbag.description) || !/66 model-year 2026/.test(airbag.description) || !/39\.4%/.test(airbag.description) || !/there is no warning/.test(airbag.description) || !/VIN-scoped safety recall/.test(airbag.solution)) errors.push('airbag recall boundary drifted');
  const key = byId.get(IDS.keyFob);
  if (!key || !/OTA 3\.3\.1/.test(key.description) || !/OTA 3\.3\.5/.test(key.description) || !/OTA 3\.3\.20/.test(key.description) || !/firmware 2\.35\.13/.test(key.description) || !/holding its lock button for five seconds/.test(key.solution) || /October 2025|Mobile Key.*Q3 2026|request a fob exchange/i.test(combined(IDS.keyFob))) errors.push('key-fob chronology boundary drifted');
  const nav = byId.get(IDS.navigation);
  if (!nav || !/OTA 3\.3\.20/.test(nav.description) || !/OTA 3\.5\.1/.test(nav.description) || !/OTA 3\.6\.0/.test(nav.description) || !/zero 2025 and zero 2026 Gravity complaints/.test(nav.evidence || '') && !/current NHTSA complaint API contains no 2025 or 2026 Gravity complaints/.test(nav.description) || /Remove the unsupported claim|consider replacing|exceeding 300 replies/i.test(combined(IDS.navigation))) errors.push('navigation evidence boundary drifted');
  const camera = byId.get(IDS.camera);
  if (!camera || !/3,900/.test(camera.description) || !/3,462/.test(camera.description) || !/438/.test(camera.description) || !/software earlier than 3\.3\.20/.test(camera.description) || !/conduct a walkaround/.test(camera.solution) || !/recall remedy is software/.test(camera.solution)) errors.push('camera recall boundary drifted');
  const seat = byId.get(IDS.seatBelt);
  if (!seat || !/4,476/.test(seat.description) || !/97%/.test(seat.description) || !/bracket and adhesive/.test(seat.solution) || !/seat that cannot be repaired.*is replaced/.test(seat.solution) || /Consider updating|Owner notifications mailed May 2026/i.test(combined(IDS.seatBelt))) errors.push('seat-belt recall boundary drifted');
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
