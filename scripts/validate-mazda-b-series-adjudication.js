/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, SNAPSHOT, citationsFor } = require('./build-mazda-b-series-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:api\.nhtsa\.gov|www\.nhtsa\.gov)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'B-Series').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'B-Series') errors.push('wrong make/model');
  if (expected.length !== 5 || rows.length !== 5 || new Set(ids).size !== 5) errors.push('Mazda B-Series coverage must be 5/5 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda B-Series snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 5 || packet.summary?.total !== 5) errors.push('summary drifted');
  if (!/All 5 frozen Mazda B-Series pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!Array.isArray(packet.safetyContract) || !packet.safetyContract.some((line) => /owner social proof/.test(line))) errors.push('owner-count safety contract missing');

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
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/No universal retail part/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!primary(citation.url)) errors.push(`${row.id}: non-primary citation ${citation.url}`);
    }
  }
  if (Object.keys(packet.pdfSources || {}).length !== 0) errors.push('B-Series packet must not invent PDF evidence');

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  const ball = byId.get(IDS.ballJoint);
  if (!ball || !/individual 1998 and 2000/.test(ball.description) || !/tie rods.*must not be counted as ball-joint evidence/.test(ball.description) || !/2WD\/4WD/.test(ball.solution) || !/Do not buy a ball joint/.test(ball.solution) || /Moog K80026.*lasts longer|replace upper and lower ball joints/i.test(combined(IDS.ballJoint))) errors.push('ball-joint evidence boundary drifted');
  const frame = byId.get(IDS.frameRust);
  if (!frame || !/frame perforation or cracking/.test(frame.description) || !/do not prove.*C-channel design/.test(frame.description) || !/must not conceal scale, perforation/.test(frame.solution) || !/Do not buy coating or weld-in plates/.test(frame.solution) || /every truck fails within 10-15 years|best prevention|all Ranger frame repair tips apply/i.test(combined(IDS.frameRust))) errors.push('frame-rust evidence boundary drifted');
  const head = byId.get(IDS.headGasket);
  if (!head || !/does not establish recurring 3\.0-liter Vulcan/.test(head.description) || !/B4000.*4\.0-liter/.test(head.description) || !/cannot validate this 3\.0-liter page/.test(head.description) || !/Do not buy Fel-Pro gaskets/.test(head.solution) || /every 3\.0L head gasket fails|rear head gasket particularly prone|always do both/i.test(combined(IDS.headGasket))) errors.push('head-gasket evidence boundary drifted');
  const leaf = byId.get(IDS.leafSpring);
  if (!leaf || !/hangers and shackles separating after frame corrosion/.test(leaf.description) || !/do not establish model-wide leaf-pack sag/.test(leaf.description) || !/Do not buy a Ranger spring pack/.test(leaf.solution) || /Ford Ranger leaf springs are interchangeable|add helper springs/i.test(combined(IDS.leafSpring))) errors.push('leaf-spring evidence boundary drifted');
  const chain = byId.get(IDS.timingChain);
  if (!chain || !/did not establish a recurring timing-chain guide or tensioner defect/.test(chain.description) || !/timing architectures.*not interchangeable/.test(chain.description) || !/must not be applied automatically to a 3\.0-liter Vulcan/.test(chain.description) || !/Do not buy a Ranger timing set/.test(chain.solution) || /Same issue as Ford Ranger|plastic guides break apart/i.test(combined(IDS.timingChain))) errors.push('timing-chain evidence boundary drifted');
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
