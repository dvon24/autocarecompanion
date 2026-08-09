/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-lucid-air-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lucid-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|lucidmotors\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lucid' && row.model === 'Air').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lucid' || packet.model !== 'Air') errors.push('wrong make/model');
  if (expected.length !== 8 || rows.length !== 8 || new Set(ids).size !== 8) errors.push('Lucid Air coverage must be 8/8 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Lucid Air snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 8 || packet.summary?.total !== 8) errors.push('summary drifted');
  if (!/All 8 frozen Lucid Air pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/(?:VIN|dealer|technician|diagnosis|no universal|no retail)/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
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
  const battery = byId.get(IDS.battery);
  if (!battery || !/ODI 11672457/.test(battery.description) || !/communication 10206428/.test(battery.description) || !/do not establish.*Surveillance Mode/i.test(battery.description) || !/Do not buy an AGM battery/.test(battery.solution) || /especially when Surveillance Mode|use a 12V battery maintainer|\$300-\$500/i.test(combined(IDS.battery))) errors.push('12V evidence boundary drifted');
  const led = byId.get(IDS.chargeLed);
  if (!led || !/solid white is ready/.test(led.description) || !/86 NHTSA manufacturer communications/.test(led.description) || !/do not establish a recurring LED-ring/.test(led.description) || !/Do not buy a charge-port/.test(led.solution) || /module replacement under warranty|\$250-\$500/i.test(combined(IDS.chargeLed))) errors.push('charge-light evidence boundary drifted');
  const heat = byId.get(IDS.heatPump);
  if (!heat || !/ODI 11560244/.test(heat.description) || !/24V495/.test(heat.description) || !/does not itself establish a heat-pump compressor defect/.test(heat.description) || !/Do not buy a compressor/.test(heat.solution) || /hardware faults.*covered|refrigerant leak.*covered/i.test(combined(IDS.heatPump))) errors.push('heat-pump evidence boundary drifted');
  const hvch = byId.get(IDS.hvch);
  if (!hvch || !/2\.1\.52 or later/.test(hvch.description) || !/does not describe a wiring-harness defect/.test(hvch.description) || !/does not.*loss of drive/.test(hvch.description) || !/VIN-scoped dealer recall/.test(hvch.solution) || /same component.*loss of drive|wiring harness.*failure/i.test(combined(IDS.hvch))) errors.push('HVCH recall boundary drifted');
  const info = byId.get(IDS.infotainment);
  if (!info || !/OTA 2\.1\.2/.test(info.description) || !/ODI 11627594/.test(info.description) || !/Air logo in Settings for at least 10 seconds/.test(info.solution) || !/Do not buy a display/.test(info.solution) || /both scroll wheels|compute-stack replacement/i.test(combined(IDS.infotainment))) errors.push('infotainment evidence boundary drifted');
  const paint = byId.get(IDS.paint);
  if (!paint || !/no exact communication establishing/.test(paint.description) || !/Casa Grande ramp-up cause/.test(paint.description) || !/Do not buy polishing compounds/.test(paint.solution) || /quality improved across 2023|goodwill repaints/i.test(combined(IDS.paint))) errors.push('paint evidence boundary drifted');
  const roof = byId.get(IDS.roof);
  if (!roof || !/no exact communication establishing/.test(roof.description) || !/single-piece-glass tolerance problem/.test(roof.description) || !/Do not buy seals/.test(roof.solution) || /tight tolerance challenge|\$300-\$600/i.test(combined(IDS.roof))) errors.push('roof evidence boundary drifted');
  const rear = byId.get(IDS.rearMount);
  if (!rear || !/communication 10206430/.test(rear.description) || !/front drive-unit/.test(rear.description) || !/does not support.*rear drive-unit mount/i.test(rear.description) || !/Do not buy a drive-unit mount/.test(rear.solution) || /issued service bulletins addressing several variants|8 yr \/ 100,000|\$400-\$900/i.test(combined(IDS.rearMount))) errors.push('rear-mount evidence boundary drifted');
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
