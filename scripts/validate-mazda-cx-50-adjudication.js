/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-mazda-cx-50-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:api\.nhtsa\.gov|www\.nhtsa\.gov|static\.nhtsa\.gov|news\.mazdausa\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-50').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-50') errors.push('wrong make/model');
  if (expected.length !== 10 || rows.length !== 10 || new Set(ids).size !== 10) errors.push('Mazda CX-50 coverage must be 10/10 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-50 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 10 || packet.summary?.total !== 10) errors.push('summary drifted');
  if (!/All 10 frozen Mazda CX-50 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!Array.isArray(packet.safetyContract) || !packet.safetyContract.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');

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
    const prose = `${row.proposal.description} ${row.proposal.solution}`;
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/No universal retail part/i.test(row.commerceDecision || '')) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const cite of row.proposal.citations || []) {
      if (!/^https:\/\//.test(cite.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(cite.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(cite.url)) errors.push(`${row.id}: non-primary citation ${cite.url}`);
    }
  }

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  const abs = byId.get(IDS.abs);
  if (!abs || !/nine 2023 CX-50/.test(abs.description) || !/2,410/.test(abs.description) || !/inspect.*replace.*as necessary/i.test(abs.solution) || /VAY0437A0A/i.test(combined(IDS.abs))) errors.push('ABS recall boundary drifted');
  const hitch = byId.get(IDS.hitch);
  if (!hitch || !/approximately 63/.test(hitch.description) || !/requires no replacement part/.test(hitch.solution) || /replace (?:the )?hitch/i.test(combined(IDS.hitch))) errors.push('hitch recall boundary drifted');
  const cylinder = byId.get(IDS.cylinder);
  if (!cylinder || !/complaint 11641443/.test(cylinder.description) || !/not a Mazda finding/.test(cylinder.description) || !/not.*proof.*2023-2024/i.test(cylinder.description) || !equal(cylinder.dtcCodes, ['P3400']) || /replace (?:both )?solenoids|replace.*cylinder head/i.test(cylinder.solution)) errors.push('cylinder complaint boundary drifted');
  const camera = byId.get(IDS.camera);
  if (!camera || !/two gasoline-powered 2025 CX-50/.test(camera.description) || !/flat data labels.*CX-50 HYBRID/.test(camera.description) || !/VIN eligibility controls/.test(camera.description) || /all 2025/i.test(combined(IDS.camera))) errors.push('camera source-conflict boundary drifted');
  const hybrid = byId.get(IDS.hybrid);
  if (!hybrid || !/124732/.test(hybrid.description) || !/SSPE0/.test(combined(IDS.hybrid)) || !equal(hybrid.dtcCodes, ['P2530:12']) || /replace.*battery/i.test(combined(IDS.hybrid))) errors.push('hybrid PT-GWU boundary drifted');
  const info = byId.get(IDS.infotainment);
  if (!info || !/applies to the 2023 CX-50/.test(info.description) || !/does not establish an underpowered processor/.test(info.description) || !/7000C0A-NA05_11022/.test(info.solution) || /clear.*cache|replace.*CMU/i.test(combined(IDS.infotainment))) errors.push('infotainment software boundary drifted');
  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/applies to the 2023 CX-50/.test(transmission.description) || !/shock at low speed/.test(transmission.description) || transmission.dtcCodes.length !== 0 || /Sport mode|fluid change|0000-FW/i.test(combined(IDS.transmission))) errors.push('transmission TCM boundary drifted');
  const wastegate = byId.get(IDS.wastegate);
  if (!wastegate || !/certain 2024 CX-50/.test(wastegate.description) || !/244889/.test(wastegate.description) || !/wave washer/.test(wastegate.solution) || !/does not direct tightening the actuator arm or automatically replacing the turbocharger/.test(wastegate.solution)) errors.push('wastegate bulletin boundary drifted');
  const wind = byId.get(IDS.wind);
  if (!wind || !/2023 CX-50/.test(wind.description) || !/crossbars, not the fixed roof rails/.test(wind.description) || !/ONP09/.test(combined(IDS.wind)) || !/Do not add unapproved foam, tape or deflectors/.test(wind.solution)) errors.push('crossbar ONP09 boundary drifted');
  const windshield = byId.get(IDS.windshield);
  if (!windshield || !/owner reports, not a defect determination/.test(windshield.description) || !/distortion.*does not establish cracking/.test(windshield.description) || !/applies only to verified distortion, not cracking/.test(windshield.solution)) errors.push('windshield report/distortion boundary drifted');
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
