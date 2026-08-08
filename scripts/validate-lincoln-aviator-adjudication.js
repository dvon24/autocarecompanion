/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-aviator-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const ALLOWED_SEVERITIES = new Set(['high', 'medium', 'low']);
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Aviator').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Aviator') errors.push('wrong make/model');
  if (expected.length !== 28 || rows.length !== 28 || new Set(ids).size !== 28) errors.push('Aviator coverage must be 28/28 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match the frozen Aviator snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.keep_published_no_change !== 23 || packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 5 || packet.summary?.total !== 28) errors.push('summary drifted');

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash drifted`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    if (!ALLOWED_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: invalid severity`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page may not be archived`);
    if (row.proposal.reportCount !== 0 || /\b0\+?\s+owners?\b|owners? have reported/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${row.id}: fake owner social proof`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
    }
    for (const part of row.proposal.fixParts || []) for (const link of part.buyLinks || []) if (searchStyle(link.url)) errors.push(`${row.id}: search-style commerce`);

    const changed = BLOCKER_IDS.includes(row.id);
    if (changed) {
      if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push(`${row.id}: wrong correction action`);
      for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
      if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
      if (!/no universal|do not (?:buy|purchase)|no purchasable|no .* retail part/i.test(row.proposal.solution)) errors.push(`${row.id}: missing no-commerce boundary`);
    } else {
      if (row.action !== 'keep_published_no_change' || row.changedFields.length !== 0 || !equal(row.before, row.proposal)) errors.push(`${row.id}: keep row is not byte-identical`);
    }
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const early = byId.get(BLOCKER_IDS.find((id) => id.includes('2020-multiple-recalls')));
  if (!early || !/20V693/.test(early.description) || !/19V633/.test(early.description) || !/20V497/.test(early.description) || !/do not support this page’s former brake-hose, battery-fastener/i.test(early.description)) errors.push('early-recall correction lost its exact source boundary');
  const cable = byId.get(BLOCKER_IDS.find((id) => id.includes('high-voltage-battery')));
  if (!cable || !/is not a high-voltage traction-battery-cable campaign/i.test(cable.description) || !/3\.0-liter gas engines/i.test(cable.description) || !/PHEV engine .* outside the cited campaign/i.test(cable.description)) errors.push('battery-cable correction lost the gas/high-voltage boundary');
  const sunroof = byId.get(BLOCKER_IDS.find((id) => id.includes('drain-clog')));
  if (!sunroof || !/not a panoramic-roof drain bulletin/i.test(sunroof.description) || !/Do not force compressed air/i.test(sunroof.solution) || /flush all four|covered under|preventively blow|mold remediation may be required/i.test(sunroof.solution)) errors.push('sunroof correction lost its leak-path safety boundary');
  const rearAir = byId.get(BLOCKER_IDS.find((id) => id.endsWith('rear-air-suspension')));
  if (!rearAir || !/Neither source establishes rear-first air-bag leaks/i.test(rearAir.description) || /Replace compressor dryer|\$[0-9]|FORScan to confirm/i.test(rearAir.solution)) errors.push('air-suspension correction reintroduced unsupported parts or costs');
  const adas = byId.get(BLOCKER_IDS.find((id) => id.includes('unexpected-acceleration')));
  for (const odi of ['11644108', '11554066', '11623452', '11734097', '11677763']) if (!adas || !adas.description.includes(odi)) errors.push(`ADAS correction missing ODI ${odi}`);
  if (!adas || !/no matching 2024 complaint/i.test(adas.description) || /overpass shadows|crack in the driveway|latest software/i.test(adas.description + adas.solution)) errors.push('ADAS correction lost complaint boundaries');
  return errors;
}

function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
