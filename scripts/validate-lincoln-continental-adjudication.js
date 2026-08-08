/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, DUPLICATE_RECALL_IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-continental-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const ALLOWED_SEVERITIES = new Set(['high', 'medium', 'low']);
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Continental').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Continental') errors.push('wrong make/model');
  if (expected.length !== 6 || rows.length !== 6 || new Set(ids).size !== 6) errors.push('Continental coverage must be 6/6 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match the frozen Continental snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.keep_published_no_change !== 1 || packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 5 || packet.summary?.total !== 6) errors.push('summary drifted');
  const duplicateObservation = (packet.observations || []).find((item) => item.code === 'continental-door-recall-duplicate-identity-hold');
  if (!duplicateObservation || !equal([...duplicateObservation.recordIds].sort(), DUPLICATE_RECALL_IDS)) errors.push('duplicate recall identity hold drifted');

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
      if (!/no universal|do not buy|no .* retail part/i.test(row.proposal.solution)) errors.push(`${row.id}: missing no-commerce boundary`);
    } else if (row.action !== 'keep_published_no_change' || row.changedFields.length !== 0 || !equal(row.before, row.proposal)) errors.push(`${row.id}: keep row is not byte-identical`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const adaptive = byId.get(BLOCKER_IDS.find((id) => id.includes('adaptive-steering')));
  if (!adaptive || !/U3000:49/.test(adaptive.description) || !/explicitly says not to attempt repairs/i.test(adaptive.description) || !/does not establish .*\$1,200-\$5,000 repair range/i.test(adaptive.description) || /frequently .* replaced|\$1,200|\$5,000/i.test(adaptive.solution)) errors.push('adaptive-steering correction lost the no-repair boundary');
  const battery = byId.get(BLOCKER_IDS.find((id) => id.includes('parasitic-battery')));
  if (!battery || !/third-party phone applications/i.test(battery.description) || !/does not establish .* driver-seat module/i.test(battery.description) || /frequent culprit|replace the faulty module/i.test(battery.solution)) errors.push('battery correction reintroduced unsupported module claims');
  const softClose = byId.get(BLOCKER_IDS.find((id) => id.includes('soft-close-door')));
  if (!softClose || !/25 cycles/.test(softClose.description) || !/B147F and\/or B1483/.test(softClose.description) || !/built on or before March 7, 2017/i.test(softClose.description) || /frequently performed alongside/i.test(softClose.description + softClose.solution)) errors.push('soft-close correction lost its operating/code/build boundary');
  for (const id of DUPLICATE_RECALL_IDS) {
    const door = byId.get(id);
    if (!door || !/19S03\/NHTSA 19V077/.test(door.description) || !/VIN/.test(door.description + door.solution) || !/free dealer remedy/i.test(door.solution)) errors.push(`${id}: recall correction lost VIN/free-remedy boundary`);
  }
  const coachDoor = byId.get(DUPLICATE_RECALL_IDS.find((id) => id.includes('suicide-doors')));
  if (!coachDoor || !/does not grant eligibility by trim name/i.test(coachDoor.description)) errors.push('Coach Door page lost the trim-eligibility disclaimer');
  return errors;
}

function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
