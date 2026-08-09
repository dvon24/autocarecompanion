/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-mazda-cx-30-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:api\.nhtsa\.gov|www\.nhtsa\.gov|static\.nhtsa\.gov)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-30').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-30') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('Mazda CX-30 coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-30 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 9 || packet.summary?.total !== 9) errors.push('summary drifted');
  if (!/All 9 frozen Mazda CX-30 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not (?:buy|disable)/i.test(row.proposal.solution) || !row.commerceDecision || !/No universal retail part/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(citation.url)) errors.push(`${row.id}: non-primary citation ${citation.url}`);
    }
  }

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  const valvetrain = byId.get(IDS.valvetrain);
  if (!valvetrain || !/2021-2023 CX-30/.test(valvetrain.description) || !/does not cover.*2020, 2024 or 2025/.test(valvetrain.description) || !/does not prescribe automatic HLA/.test(valvetrain.solution) || /revised service cylinder head|replace the switchable HLAs/i.test(combined(IDS.valvetrain))) errors.push('valvetrain source boundary drifted');
  const abs = byId.get(IDS.abs);
  if (!abs || !/23V275000/.test(abs.description) || !/no charge/.test(abs.solution) || !/Do not buy an ABS hydraulic unit/.test(abs.solution)) errors.push('ABS recall boundary drifted');
  const evap = byId.get(IDS.evap);
  if (!evap || !/20V347000/.test(evap.description) || !/all-wheel-drive/.test(evap.description) || !/Do not buy a hose/.test(evap.solution)) errors.push('EVAP recall boundary drifted');
  const oil = byId.get(IDS.oil);
  if (!oil || !/2021-2022/.test(oil.description) || !/exhaust-valve seals/.test(oil.description) || !/7-year\/84,000-mile/.test(oil.solution) || !/expired in October 2025/.test(oil.solution) || !equal(oil.dtcCodes, ['P250F'])) errors.push('oil SSPD5 boundary drifted');
  const aeb = byId.get(IDS.aeb);
  if (!aeb || !/SA-007\/24/.test(aeb.description) || !/Separately, recall 24V649000/.test(aeb.description) || !/do not disable safety systems/.test(aeb.solution) || /disable (?:the )?(?:AEB|SBS|system)/i.test(aeb.solution.replace(/do not disable safety systems/i, ''))) errors.push('AEB mechanism boundary drifted');
  const liftgate = byId.get(IDS.liftgate);
  if (!liftgate || !/21V086000/.test(liftgate.description) || !/software/.test(liftgate.solution) || !/drive-unit serial number/.test(liftgate.solution)) errors.push('liftgate recall boundary drifted');
  const ac = byId.get(IDS.ac);
  if (!ac || !/2020-2021/.test(ac.description) || !/evaporator leak/.test(ac.description) || !/does not establish.*condenser defect/.test(ac.description) || ac.dtcCodes.length !== 0 || !/both HFC-134a and HFO-1234yf/.test(ac.solution) || /Denso 477-0878|stone guard or grille screen|P040[1-4]/i.test(combined(IDS.ac))) errors.push('A/C evidence boundary drifted');
  const infotainment = byId.get(IDS.infotainment);
  if (!infotainment || !/non-turbo 2020-2022/.test(infotainment.description) || !/2.5T engine.*excluded/.test(infotainment.description) || !/Do not buy a CMU/.test(infotainment.solution) || /Anker Powerline|replace (?:the )?CMU/i.test(combined(IDS.infotainment))) errors.push('infotainment scope drifted');
  const windshield = byId.get(IDS.windshield);
  if (!windshield || !/distortion or a double image/.test(windshield.description) || !/does not establish.*spontaneous stress-cracking/.test(windshield.description) || !/distinguish an impact point from a non-impact failure/.test(windshield.solution) || /acoustic laminated glass is susceptible|thermal shock accelerates|frame flex causes|\$200-\$400/i.test(combined(IDS.windshield))) errors.push('windshield evidence boundary drifted');
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
