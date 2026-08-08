/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-corsair-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./lincoln-adjudication-utils');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const ALLOWED_SEVERITIES = new Set(['high', 'medium', 'low']);
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(packet, snapshot) {
  const errors = []; const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Corsair').sort((a, b) => a.id.localeCompare(b.id)); const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Corsair') errors.push('wrong make/model');
  if (expected.length !== 4 || rows.length !== 4 || new Set(ids).size !== 4) errors.push('Corsair coverage must be 4/4 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match the frozen Corsair snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 4 || packet.summary?.total !== 4) errors.push('summary drifted');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    if (!ALLOWED_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: invalid severity`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page may not be archived`);
    if (row.proposal.reportCount !== 0 || /\b0\+?\s+owners?\b|owners? have reported/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: fake owner social proof`);
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push(`${row.id}: wrong correction action`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution)) errors.push(`${row.id}: missing no-commerce boundary`);
    for (const citation of row.proposal.citations || []) { if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`); if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`); }
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const egr = byId.get(BLOCKER_IDS.find((id) => id.includes('egr-valve'))); if (!egr || !/1,200 certain 2025 Corsairs/.test(egr.description) || !/2\.0-liter engines/.test(egr.description) || !/2\.3-liter engine metadata .* outside/i.test(egr.description) || !/remedy was still under development/i.test(egr.solution) || /September 2026 expected|loaner\/mobile diagnosis/i.test(egr.description + egr.solution)) errors.push('EGR correction lost exact engine/remedy boundaries');
  const belt = byId.get(BLOCKER_IDS.find((id) => id.includes('seat-belt'))); if (!belt || !/25C68\/NHTSA 25V862/.test(belt.description) || !/secure or replace those bolts/i.test(belt.solution) || /(?:expect|watch for) (?:a )?(?:rattle|binding)|avoid (?:the )?(?:rear )?seat|replace (?:the )?entire retractor/i.test(belt.solution)) errors.push('seat-belt correction lost exact defect/remedy boundaries');
  const lamp = byId.get(BLOCKER_IDS.find((id) => id.includes('tail-light'))); if (!lamp || !/84 certain 2024-2025 Corsairs/.test(lamp.description) || !/20 percent/.test(lamp.description) || !/inspects both rear combination lamps/i.test(lamp.solution)) errors.push('lamp correction lost exact population/remedy boundaries');
  const glass = byId.get(BLOCKER_IDS.find((id) => id.includes('windshield'))); if (!glass || !/5,255 certain 2025-2026 Corsairs/.test(glass.description) || !/Excess residual air/.test(glass.description) || /Change ['"]Owner letters|Don't accept/i.test(glass.description + glass.solution)) errors.push('windshield correction lost exact content boundary');
  return errors;
}
function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
