/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-mazda-cx-5-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:api\.nhtsa\.gov|www\.nhtsa\.gov|static\.nhtsa\.gov)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-5').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-5') errors.push('wrong make/model');
  if (expected.length !== 18 || rows.length !== 18 || new Set(ids).size !== 18) errors.push('Mazda CX-5 coverage must be 18/18 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-5 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 18 || packet.summary?.total !== 18) errors.push('summary drifted');
  if (!/All 18 frozen Mazda CX-5 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/No universal retail part/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
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
  const turboOil = byId.get(IDS.turboOil);
  if (!turboOil || !/certain 2021 CX-5/.test(turboOil.description) || !/exhaust-valve seals/.test(turboOil.description) || !/7-year\/84,000-mile/.test(turboOil.solution) || !equal(turboOil.dtcCodes, ['P250F'])) errors.push('turbo-oil SSPD5 boundary drifted');
  const ac = byId.get(IDS.ac);
  if (!ac || !/2013-2016/.test(ac.description) || !/evaporator/.test(ac.description) || !/does not establish.*compressor defect/.test(ac.description) || /replace (?:the )?compressor/i.test(ac.solution)) errors.push('A/C evidence boundary drifted');
  const brakes = byId.get(IDS.brakes);
  if (!brakes || !/certain 2016 CX-5/.test(brakes.description) || !/replace only the affected caliper/.test(brakes.solution) || /replace both|ceramic pads/i.test(combined(IDS.brakes))) errors.push('brake-caliper boundary drifted');
  const carbon = byId.get(IDS.carbon);
  if (!carbon || !/SA-060\/17/.test(carbon.description) || !/does not establish.*intake-valve carbon defect/.test(carbon.description) || !equal(carbon.dtcCodes, ['P0101', 'P061B']) || /perform (?:a )?walnut blast|add fuel additive|every 15,000/i.test(combined(IDS.carbon))) errors.push('carbon/software boundary drifted');
  const cmu = byId.get(IDS.cmu);
  if (!cmu || !/2016-2020 CX-5/.test(cmu.description) || !/DRAM/.test(cmu.description) || !/replace a CMU only/.test(cmu.solution) || /hold.*(?:nav|mute)/i.test(combined(IDS.cmu))) errors.push('CMU scope drifted');
  const cd = byId.get(IDS.cylinderDeactivation);
  if (!cd || !/19V497000/.test(cd.description) || !/(?:PCM|powertrain-control-module) software error/.test(cd.description) || !/does not establish a dislodged rocker arm/.test(cd.description) || /replace.*(?:rocker|lash adjuster|camshaft|cylinder head)/i.test(combined(IDS.cylinderDeactivation))) errors.push('19V497 mechanism drifted');
  const drl = byId.get(IDS.drl);
  if (!drl || !/20V063000/.test(drl.description) || !/no charge/.test(drl.solution)) errors.push('DRL recall boundary drifted');
  const epb = byId.get(IDS.epb);
  if (!epb || !/certain 2016 CX-5/.test(epb.description) || !/does not establish.*actuator-connector/.test(epb.description) || epb.dtcCodes.length !== 0) errors.push('EPB boundary drifted');
  const exhaust = byId.get(IDS.exhaust);
  if (!exhaust || !/do not establish a recurring 2013-2016/.test(exhaust.description) || !/distinguish manifold, gasket, flex joint/.test(exhaust.solution)) errors.push('exhaust evidence boundary drifted');
  const fuel = byId.get(IDS.fuelPump);
  if (!fuel || !/21V875000/.test(fuel.description) || !/2018-2019/.test(fuel.description) || !/does not cover.*2020-2021/.test(fuel.description) || /keep the tank|Delphi|Bosch/i.test(combined(IDS.fuelPump))) errors.push('fuel-pump recall boundary drifted');
  const battery = byId.get(IDS.istopBattery);
  if (!battery || !/do not prove one recurring 2017-2023/.test(battery.description) || !/measure key-off current/.test(battery.solution) || /480.?CCA|600.?CCA|ten-day|10-day|Group 35/i.test(combined(IDS.istopBattery))) errors.push('i-stop battery boundary drifted');
  const maf = byId.get(IDS.maf);
  if (!maf || !/does not establish a recurring 2013-2018/.test(maf.description) || !/not proof the MAF sensor failed/.test(maf.description) || maf.dtcCodes.length !== 0 || /CRC|P040[1-4]/i.test(combined(IDS.maf))) errors.push('MAF evidence boundary drifted');
  const oil = byId.get(IDS.oil);
  if (!oil || !/only for certain 2021 CX-5 2.5T/.test(oil.description) || !/does not establish.*2013, 2014 or 2022/.test(oil.description) || !equal(oil.dtcCodes, ['P250F'])) errors.push('generic oil boundary drifted');
  const rust = byId.get(IDS.rust);
  if (!rust || !/2017-2021 CX-5/.test(rust.description) || !/mud or sand/.test(rust.description) || /thin Soul Red|Machine Gr(?:a|e)y/i.test(combined(IDS.rust))) errors.push('rust TSB boundary drifted');
  const head = byId.get(IDS.cylinderHead);
  if (!head || !/2019-2020 CX-5/.test(head.description) || !/10 years\/120,000 miles/.test(head.description) || /class action|\$[\d,]+/.test(combined(IDS.cylinderHead))) errors.push('CSP11 boundary drifted');
  const suspension = byId.get(IDS.suspension);
  if (!suspension || !/2013-2016 CX-5/.test(suspension.description) || !/does not establish.*2017-2020/.test(suspension.description) || !/16V203000/.test(suspension.solution) || /grease every|15 ft-lb/i.test(combined(IDS.suspension))) errors.push('suspension boundary drifted');
  const cover = byId.get(IDS.coverPump);
  if (!cover || !/2018-2023 CX-5/.test(cover.description) || !/small dry green deposit.*normal/.test(cover.description) || !/not to replace it for small dry residue/.test(cover.solution) || /\$35/.test(combined(IDS.coverPump))) errors.push('front-cover/water-pump boundary drifted');
  const wheel = byId.get(IDS.wheelBearing);
  if (!wheel || !/SA-020\/25/.test(wheel.description) || !/chassis-ear/i.test(wheel.description) || !/Do not replace both sides automatically/.test(wheel.solution) || /replace both sides automatically\.(?! Do not)/i.test(wheel.solution.replace('Do not replace both sides automatically.', '')) || /36,000-mile/i.test(combined(IDS.wheelBearing))) errors.push('wheel-bearing diagnostic boundary drifted');
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
