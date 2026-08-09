/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const {
  BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor,
} = require('./build-mazda-cx-60-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./mazda-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds', 'reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function allowedHost(url) { return /^https:\/\/(?:www2\.mazda\.co\.jp|www\.mazda\.com|de\.mazda-press\.com|uk\.mazda-press\.com|mazda\.co\.za|static\.nhtsa\.gov|opendata\.rdw\.nl|www\.vehiclerecalls\.gov\.au|www\.check-vehicle-recalls\.service\.gov\.uk|www\.faq\.mazda\.com|www\.cx70forum\.com|mazdas247\.com|www\.cx5-forum\.de|www\.mazdaklan\.cz)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-60').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Mazda' || packet.model !== 'CX-60') errors.push('wrong make/model');
  if (expected.length !== 27 || rows.length !== 27 || new Set(ids).size !== 27) errors.push('Mazda CX-60 coverage must be 27/27 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Mazda CX-60 snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 27 || packet.summary?.total !== 27) errors.push('summary drifted');
  if (!/All 27 frozen Mazda CX-60 pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
  if (!Array.isArray(packet.safetyContract) || !packet.safetyContract.some((line) => /0\+ owners/.test(line))) errors.push('owner-count safety contract missing');
  if (packet.manufacturerCommunications?.totalRows !== 0 || packet.recallInventory?.totalRows !== 0 || !/not sold in the United States/i.test(packet.manufacturerCommunications?.jurisdictionNote || '')) errors.push('zero-NHTSA jurisdiction boundary drifted');

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
    if (!equal(row.proposal.citations, citationsFor(row.id, frozen))) errors.push(`${row.id}: citations drifted from exact source map`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing exact citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!allowedHost(citation.url)) errors.push(`${row.id}: unapproved source host ${citation.url}`);
    }
  }

  if (!equal(Object.keys(packet.pdfSources || {}).sort(), Object.keys(PDF_SOURCES).sort())) errors.push('exact PDF source set drifted');
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const publicSource = packet.pdfSources?.[key];
    if (!publicSource || publicSource.url !== source.url || publicSource.sha256 !== source.sha256 || publicSource.bytes !== source.bytes || publicSource.pages !== source.pages || !equal(publicSource.visualPages, source.visualPages) || 'localPath' in publicSource) errors.push(`${key}: PDF evidence metadata drifted`);
  }
  if (Object.values(PDF_SOURCES).reduce((sum, source) => sum + source.pages, 0) !== 28) errors.push('selected PDF page count drifted');

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const combined = (id) => `${byId.get(id)?.description || ''} ${byId.get(id)?.solution || ''}`;
  const battery = byId.get(IDS.batteryGeneric);
  if (!battery || !/one VIN-bounded cause, not a diagnosis for every parked discharge/.test(battery.description) || /6\.5\s*Ah|4\.8 hours.*proof/i.test(combined(IDS.batteryGeneric))) errors.push('generic battery versus campaign boundary drifted');
  const adblue = byId.get(IDS.adblue);
  if (!adblue || !/direct owner discussion/.test(adblue.description) || !/does not establish a 6\.7-litre limit/.test(adblue.description) || /1,?000\s*km|P20(?:4F|BA)|replace.*sensor/i.test(combined(IDS.adblue))) errors.push('AdBlue report boundary drifted');
  const dpf = byId.get(IDS.dpf);
  if (!dpf || !/about 15-20 minutes/.test(dpf.solution) || !/flashing warning/.test(dpf.solution) || /drive for 30-45|regenerate every two or three weeks|command a forced regeneration as the repair/i.test(combined(IDS.dpf))) errors.push('DPF manual boundary drifted');
  const vibration = byId.get(IDS.vibration);
  if (!vibration || !/Owner reports can establish.*symptom was experienced, but not/i.test(vibration.description) || /replace.*propeller shaft|known issue across/i.test(combined(IDS.vibration))) errors.push('vibration report boundary drifted');
  for (const id of [IDS.rideGeneric, IDS.rideRevision]) {
    const row = byId.get(id);
    if (!row || !/does not prove|not a universal defect/i.test(row.description) || !/Do not (?:promise|buy)/.test(row.solution) || /is guaranteed free|will be (?:a )?free upgrade|Koni|H&R|<cite/i.test(combined(id))) errors.push(`${id}: suspension revision boundary drifted`);
  }
  const arWrong = byId.get(IDS.hybridWrong);
  if (!arWrong || !/does not support.*engine-fails-to-restart/i.test(arWrong.description) || !/Dash Electronic Supply Unit|Dash-ESU/.test(arWrong.description) || /replace the (?:PCM|BECM|TCM)|AR058A remedy is.*(?:PCM|BECM|TCM)/i.test(combined(IDS.hybridWrong))) errors.push('AR058A false-mechanism correction drifted');
  const arExact = byId.get(IDS.ar058a);
  if (!arExact || !/Dash Electronic Supply Unit/.test(arExact.description) || !/not a blanket explanation.*engine no-restart/i.test(arExact.description)) errors.push('AR058A exact page drifted');
  const refuel = byId.get(IDS.refuel);
  if (!refuel || !/insert the nozzle fully/.test(refuel.description) || !/does not establish.*control-logic cause/.test(refuel.description) || /Mazda fixed this in July 2022|replace the ORVR/i.test(combined(IDS.refuel))) errors.push('refueling evidence boundary drifted');
  const shift = byId.get(IDS.shiftGeneric);
  if (!shift || !/architecture alone is not proof of a defect/.test(shift.description) || !/after braking is a safety concern/.test(shift.solution) || /architecture proves.*failure/i.test(combined(IDS.shiftGeneric))) errors.push('transmission architecture/recall boundary drifted');
  const startup = byId.get(IDS.startupClunk);
  if (!startup || !/does not identify this report as a defect/.test(startup.description) || !/forum report and architecture paper do not identify/.test(startup.solution)) errors.push('startup-clunk evidence boundary drifted');
  const keyless = byId.get(IDS.keyless);
  if (!keyless || !/Try the spare key/.test(keyless.solution) || /ebay|amazon|CR2032.*buy/i.test(combined(IDS.keyless))) errors.push('keyless diagnostic/commerce boundary drifted');
  const insulation = byId.get(IDS.insulation);
  if (!insulation || !/related North American application/.test(insulation.description) || !/market- and VIN-specific/.test(insulation.description) || !equal(insulation.dtcCodes, ['P0AA6:00'])) errors.push('AS007A jurisdiction/diagnostic boundary drifted');
  const counts = [[IDS.dieselCampaign, 140], [IDS.evRange, 100], [IDS.phevShift, 180]];
  for (const [id, count] of counts) {
    const row = rows.find((item) => item.id === id);
    if (!row || row.before.reportCount !== count || row.proposal.reportCount !== count || new RegExp(`\\b${count}\\b`).test(combined(id))) errors.push(`${id}: frozen report count leaked or drifted`);
  }
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
