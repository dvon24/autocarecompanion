/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS,
  BLOCKER_IDS,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  RETAIN_IDS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
} = require('./build-mercury-cougar-adjudication');
const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
  stableValue,
} = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'lastReportedByOwners', 'relatedIssueIds',
]);
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source',
  'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
const EXPECTED_DTCS = Object.freeze({
  [IDS.cd4e]: ['P0731', 'P0732', 'P0734', 'P0740', 'P0741', 'P0758'],
  [IDS.imrc]: ['P1518', 'P1519'],
});

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mercury' && row.model === 'Cougar')
    .sort((left, right) => left.id.localeCompare(right.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') {
    errors.push('packet must remain blocked proposal-only');
  }
  if (packet.make !== 'Mercury' || packet.model !== 'Cougar') errors.push('wrong make/model');
  if (expected.length !== 8 || rows.length !== 8 || new Set(ids).size !== 8 || !equal([...ids].sort(), ALL_IDS)) {
    errors.push('Cougar coverage must exactly match 8/8 frozen rows');
  }
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (!equal(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 1,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 7,
    report_counts_preserved_zero: 8,
    total: 8,
  })) errors.push('summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /04V421000/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) {
    errors.push('safety contract incomplete');
  }

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) {
      errors.push(`${row.id}: proposal hash/diff drifted`);
    }
    for (const field of FULL_RECORD_FIELDS) {
      if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    }
    for (const field of IMMUTABLE_FIELDS) {
      if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    }
    for (const field of row.changedFields) {
      if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    }
    const retained = RETAIN_IDS.includes(row.id);
    const expectedAction = retained
      ? 'retain_indexed_identity_and_accuracy_cleanup'
      : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy';
    if (row.action !== expectedAction || row.identityReviewRequired !== !retained) errors.push(`${row.id}: verdict drifted`);
    if (retained ? row.identityConflict !== null : !row.identityConflict) errors.push(`${row.id}: identity conflict drifted`);
    if (row.before.reportCount !== 0 || row.proposal.reportCount !== 0) errors.push(`${row.id}: zero report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) {
      errors.push(`${row.id}: owner social proof is forbidden`);
    }
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) {
      errors.push(`${row.id}: must remain unapproved and commerce-free`);
    }
    if (!/do not buy/i.test(row.proposal.solution)
      || !/no universal retail part/i.test(row.commerceDecision || '')
      || row.commerceDecision !== commerceDecisionFor(row.id)) {
      errors.push(`${row.id}: commerce boundary missing`);
    }
    if (!equal(row.proposal.citations, citationsFor(row.id))
      || !row.proposal.citations.length
      || row.proposal.citations.some((citation) => !/^https:\/\//.test(citation.url) || searchStyle(citation.url))) {
      errors.push(`${row.id}: exact primary citation drifted`);
    }
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) {
      errors.push(`${row.id}: unsupported cost or mileage retained`);
    }
    const expectedDtcs = EXPECTED_DTCS[row.id] || [];
    if (!equal(row.proposal.dtcCodes, expectedDtcs)) errors.push(`${row.id}: DTC scope drifted`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  if (!/613868/.test(byId.get(IDS.headGasket)?.description || '') || !/1994-1995/.test(byId.get(IDS.headGasket)?.description || '')) errors.push('head-gasket evidence boundary drifted');
  if (!/AODE\/4R70W/.test(byId.get(IDS.aod)?.description || '') || !/transmission by tag/.test(byId.get(IDS.aod)?.solution || '')) errors.push('AOD identity boundary drifted');
  if (!/605229/.test(byId.get(IDS.cd4e)?.description || '') || !/619324/.test(byId.get(IDS.cd4e)?.description || '')) errors.push('CD4E evidence boundary drifted');
  if (!/not conducted under the Safety Act/i.test(byId.get(IDS.fuelModule)?.description || '') || !/ten-year remedy window has expired/i.test(byId.get(IDS.fuelModule)?.solution || '')) errors.push('fuel-module campaign boundary drifted');
  if (!/613315/.test(byId.get(IDS.imrc)?.description || '') || !/P1518/.test(byId.get(IDS.imrc)?.description || '')) errors.push('IMRC evidence boundary drifted');
  if (!/1996 power-window pop noise/.test(byId.get(IDS.window)?.description || '')) errors.push('window-generation boundary drifted');
  if (!/01V031000/.test(byId.get(IDS.alternator)?.description || '') || !/battery-to-alternator cable/.test(byId.get(IDS.alternator)?.description || '')) errors.push('alternator/cable boundary drifted');
  if (!/does not establish rapid ball-joint/.test(byId.get(IDS.suspension)?.description || '')) errors.push('suspension evidence boundary drifted');
  if (!equal(packet.pdfSources, {}) || !equal(packet.otherSources, OTHER_SOURCES)) errors.push('source evidence manifest drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({
    passed: !errors.length,
    packetSha256: hashValue(packet),
    decisionCount: packet.rows.length,
    applicationGate: packet.applicationGate,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, EXPECTED_DTCS, IMMUTABLE_FIELDS, validatePacket };
