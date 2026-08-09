/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-lincoln-town-car-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Town Car').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Town Car') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('Town Car coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Town Car snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 9 || packet.summary?.total !== 9) errors.push('summary drifted');
  if (!/All 9 frozen Lincoln Town Car pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
  const air = byId.get(IDS.air);
  if (!air || !/ODI 11033099/.test(air.description) || !/do not establish universal/.test(air.description) || !/test power, ground/.test(air.solution) || /Strutmasters|\$|convert to coil|C1727|C1965|compressor burnout is common/i.test(combined(IDS.air))) errors.push('air-suspension evidence boundary drifted');
  const blend = byId.get(IDS.blend);
  if (!blend || !/outside this page's preserved 2003-2011 indexed range/.test(blend.description) || !/do not establish a common actuator gear failure/.test(blend.description) || !/before replacing anything/.test(blend.solution) || /Dorman|Motorcraft|replacement is the only fix|B1342|B2477/i.test(combined(IDS.blend))) errors.push('blend-door evidence boundary drifted');
  const coil = byId.get(IDS.coil);
  if (!coil || !/1998-2002/.test(coil.description) || !/2000-2005/.test(coil.description) || !/do not prove.*coverage through 2011/.test(coil.description) || !/before selecting a repair/.test(coil.solution) || /most common|replace failed coils and boots|replace high-mileage spark plugs/i.test(combined(IDS.coil))) errors.push('ignition-coil evidence boundary drifted');
  const fuel = byId.get(IDS.fuel);
  if (!fuel || !/rare, extremely high-speed rear impacts/.test(fuel.description) || !/historical upgrade-kit offering/.test(fuel.description) || !/Do not buy a shield kit or grind a bracket/.test(fuel.solution) || /have killed occupants|wrongful-death|costs roughly|free shield today/i.test(combined(IDS.fuel))) errors.push('fuel-tank historical-program boundary drifted');
  const lcm = byId.get(IDS.lcm);
  if (!lcm || !/only 2003-2005 Crown Victoria and Grand Marquis/.test(lcm.description) || !/does not include the Town Car/.test(lcm.description) || !/15S39 does not cover the Town Car/.test(lcm.solution) || /same (?:headlamp|solder|LCM) defect|install.*bypass|rebuild service.*\$/i.test(combined(IDS.lcm))) errors.push('LCM sister-recall boundary drifted');
  const intake = byId.get(IDS.intake);
  if (!intake || !/1998-2001 Town Cars/.test(intake.description) || !/seven-year, unlimited-mile coverage/.test(intake.description) || !/expired/.test(combined(IDS.intake)) || !/pressure-tested/.test(intake.solution) || /reimburses owners today|Dorman|DuPont|\$735/i.test(combined(IDS.intake))) errors.push('intake-manifold evidence boundary drifted');
  const rack = byId.get(IDS.rack);
  if (!rack || !/no exact manufacturer communication establishing a common/.test(rack.description) || !/one 2003 stretch limousine/.test(rack.description) || !/locate any leak/.test(rack.solution) || /frequent leak points|normally replaced with a remanufactured|flush old fluid/i.test(combined(IDS.rack))) errors.push('power-steering evidence boundary drifted');
  const window = byId.get(IDS.window);
  if (!window || !/1999-2000/.test(window.description) || !/do not establish routine regulator failure/.test(window.description) || !/switch input.*power and ground/.test(window.solution) || /fail routinely|plastic balls|one-hour job|replace the regulator assembly/i.test(combined(IDS.window))) errors.push('power-window evidence boundary drifted');
  const shaft = byId.get(IDS.shaft);
  if (!shaft || !/originally sold or currently registered in specified corrosion states/.test(shaft.description) || !/not Town Car-only totals/.test(shaft.description) || !/VIN-specific/.test(shaft.description) || !/replaces the lower intermediate shaft/.test(shaft.solution) || /all 2005-2011 Town Cars are recalled|every indexed vehicle/i.test(combined(IDS.shaft))) errors.push('steering-recall scope drifted');
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
