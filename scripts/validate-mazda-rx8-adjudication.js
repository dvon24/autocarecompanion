/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  ALL_IDS,
  BLOCKER_IDS,
  FABRICATED_REPORT_COUNT_IDS,
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  RETAIN_IDS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
} = require('./build-mazda-rx8-adjudication');
const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
  stableValue,
} = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'lastReportedByOwners', 'relatedIssueIds',
]);
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount',
  'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);

function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${(row?.symptoms || []).join(' ')}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === 'Mazda' && row.model === 'RX-8')
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const retained = new Set(RETAIN_IDS);
  const fabricated = new Set(FABRICATED_REPORT_COUNT_IDS);
  const expectedSummary = {
    retain_indexed_identity_and_accuracy_cleanup: 1,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8,
    fabricated_report_counts_proposed_zero: 4,
    total: 9,
  };

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'RX-8') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('RX-8 coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), ALL_IDS) || !equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen RX-8 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS) || !equal(packet.summary, expectedSummary)) errors.push('blocker IDs or summary drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line))
    || !packet.safetyContract?.some((line) => /PE09-045/.test(line))
    || !packet.safetyContract?.some((line) => /rendered and visually inspected/.test(line))
    || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');

  const exactUrls = new Set([...Object.values(PDF_SOURCES), ...Object.values(OTHER_SOURCES)].map((source) => source.url));
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of Object.keys(row.proposal || {})) if (!FULL_RECORD_FIELDS.includes(field)) errors.push(`${row.id}: unauthorized proposal field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const shouldRetain = retained.has(row.id);
    const expectedAction = shouldRetain ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy';
    if (row.action !== expectedAction
      || row.identityReviewRequired !== !shouldRetain
      || row.identityConflict !== contentFor(row.id).identityConflict) errors.push(`${row.id}: identity verdict drifted`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: published status drifted`);
    if (fabricated.has(row.id)) {
      if (row.proposal.reportCount !== 0 || !(row.before.reportCount > 0)) errors.push(`${row.id}: fabricated report count must remain proposal-only zero`);
    } else if (row.proposal.reportCount !== row.before.reportCount) errors.push(`${row.id}: report count drifted`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b|\breported by \d[\d,.]* owners?\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (/youtube\.com|rx8club|repairpal|8020automotive|mazdaforum|ifixit|engineerine|denlorstools|australiancar\.reviews/i.test(JSON.stringify(row.proposal.citations))) errors.push(`${row.id}: secondary, commerce or fabricated citation survived`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/Do not buy/.test(row.proposal.solution)
      || !/No universal retail part/i.test(row.commerceDecision || '')
      || row.commerceDecision !== commerceDecisionFor(row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(row.id))) errors.push(`${row.id}: exact citations drifted`);
    for (const citation of row.proposal.citations) if (!exactUrls.has(citation.url) || searchStyle(citation.url)) errors.push(`${row.id}: citation is not an approved exact primary source`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null
      || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null
      || row.proposal.affectedSystems.length || row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported cost/mileage/system/code retained`);
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const clutch = byId.get(IDS.clutch);
  if (!clutch || !/PE09-045/.test(clutch.description) || !/2004-2006/.test(clutch.description)
    || !/2004-2009/.test(clutch.description) || !/without a recall/.test(clutch.description)
    || !/without identifying a safety-related defect trend/.test(clutch.description)
    || /reimbursement|updated pedal bracket|NHTSA issued a recall|was recalled/i.test(prose(clutch))) errors.push('clutch investigation boundary drifted');
  const ignition = byId.get(IDS.ignition);
  if (!ignition || !/10021572/.test(ignition.description) || !/10006385/.test(ignition.description)
    || /replace[^.]{0,50}as a set|use[^.]{0,50}30,000-mile interval|P0303\/P0304 (?:is|are) supported/i.test(prose(ignition))) errors.push('ignition boundary drifted');
  const ssv = byId.get(IDS.ssv);
  if (!ssv || !/10024868/.test(ssv.description) || !/2004-2007/.test(ssv.description)
    || !/does not establish carbon buildup/.test(ssv.description)
    || /preventively[^.]{0,80}higher RPM|install[^.]{0,50}(?:a )?stronger updated actuator|carbon is always/i.test(prose(ssv))) errors.push('SSV boundary drifted');
  const battery = byId.get(IDS.battery);
  if (!battery || !/10009427/.test(battery.description) || !/10213333/.test(battery.description)
    || /fit a 640 CCA|305 CCA battery is undersized|sit for a week.*flat/i.test(prose(battery))) errors.push('battery boundary drifted');
  const starter = byId.get(IDS.starter);
  if (!starter || !/10007575/.test(starter.description) || !/10024622/.test(starter.description) || !/10008057/.test(starter.description)
    || /replace[^.]{0,50}(?:with )?(?:the )?updated higher-RPM starter|pedal to the floor[^.]{0,40}crank/i.test(prose(starter))) errors.push('starter boundary drifted');
  const apex = byId.get(IDS.apex);
  if (!apex || !/8,000-owner total/.test(apex.description) || /rebuild is needed below 6\.5|premix 2-stroke|redline regularly/i.test(prose(apex))) errors.push('apex boundary drifted');
  const catalyst = byId.get(IDS.catalyst);
  if (!catalyst || !/10100708/.test(catalyst.description) || !/minimize unnecessary/.test(catalyst.description)
    || /use (?:a )?high-flow aftermarket|install[^.]{0,50}test pipe|replace O2 sensors at the same time/i.test(prose(catalyst))) errors.push('catalyst boundary drifted');
  const flooding = byId.get(IDS.flooding);
  if (!flooding || !/10007575/.test(flooding.description) || !/10008057/.test(flooding.description)
    || /hold accelerator to the floor|10-15 seconds|every 15,000-20,000/i.test(prose(flooding))) errors.push('flooding boundary drifted');
  const omp = byId.get(IDS.omp);
  if (!omp || !/274-communication/.test(omp.description) || !/42-recall-row/.test(omp.description)
    || /Replace OMP every|replace[^.]{0,60}60,000-80,000/i.test(prose(omp))) errors.push('OMP boundary drifted');
  const publicPdfs = Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = { ...source };
    delete value.localPath;
    return [key, value];
  }));
  if (!equal(packet.pdfSources, publicPdfs)
    || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.pages, 0) !== 2
    || Object.values(packet.pdfSources || {}).reduce((sum, source) => sum + source.visualPages.length, 0) !== 2) errors.push('PDF evidence manifest drifted');
  if (!equal(packet.otherSources, OTHER_SOURCES)) errors.push('other primary source metadata drifted');
  return errors;
}

function main() {
  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({
    passed: errors.length === 0,
    packetSha256: hashValue(packet),
    decisionCount: packet.rows.length,
    applicationGate: packet.applicationGate,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
