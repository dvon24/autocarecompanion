/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-mkx-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const ALLOWED_SEVERITIES = new Set(['high', 'medium', 'low']);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function officialSource(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|www\.fordservicecontent\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'MKX').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'MKX') errors.push('wrong make/model');
  if (expected.length !== 9 || rows.length !== 9 || new Set(ids).size !== 9) errors.push('MKX coverage must be 9/9 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match the frozen MKX snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 9 || packet.summary?.total !== 9) errors.push('summary drifted');

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
    if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push(`${row.id}: wrong correction action`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push(`${row.id}: correction must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/(?:VIN-specific|VIN- and|no universal retail part|dealer\/technician|dealer recall remedy)/i.test(row.proposal.solution)) errors.push(`${row.id}: missing dealer-only or no-universal-retail-part boundary`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length === 0) errors.push(`${row.id}: missing primary citation`);
    for (const citation of row.proposal.citations || []) {
      if (!/^https:\/\//.test(citation.url || '')) errors.push(`${row.id}: non-HTTPS citation`);
      if (searchStyle(citation.url)) errors.push(`${row.id}: search-style citation`);
      if (!officialSource(citation.url)) errors.push(`${row.id}: non-primary citation ${citation.url}`);
    }
  }

  const byId = new Map(rows.map((row) => [row.id, row.proposal]));
  const oil = byId.get(IDS.oil);
  if (!oil || !/April 1, 2016 through January 1, 2017/.test(oil.description) || !/P0300-P0306/.test(oil.description) || !oil.dtcCodes.includes('P0316') || /typically spark plugs|\$4,000|\$8,000/i.test(oil.description + oil.solution)) errors.push('oil correction lost TSB scope or retained unsupported claims');
  const waterRows = [byId.get(IDS.water37), byId.get(IDS.waterFirst)];
  if (waterRows.some((row) => !row || !/complete 447-document MKX manufacturer-communication inventory/i.test(row.description) || !/Never (?:remove|open)/i.test(row.solution) || /\$1,500|\$2,500|20-30 hours|100,000|Replace timing chain set proactively/i.test(row.description + row.solution))) errors.push('water-pump correction lost source/safety boundaries');
  const battery = byId.get(IDS.battery);
  if (!battery || !/54,411 certain 2016-2017/.test(battery.description) || !/three 3\.7L MKX underhood-fire reports/.test(battery.description) || !/had not identified a source/i.test(battery.description) || battery.estimatedCostLow !== 0 || battery.estimatedCostHigh !== 0) errors.push('battery recall correction lost exact population or qualified chronology');
  const sync = byId.get(IDS.sync);
  if (!sync || !/TSB 13-8-2/.test(sync.description) || !/12M01/.test(sync.description) || !/only when Workshop Manual diagnosis identified the APIM as the causal part/i.test(sync.description) || /temporarily restore|disconnecting the battery.*restores/i.test(sync.description + sync.solution)) errors.push('SYNC correction lost software/APIM diagnostic boundary');
  const roof = byId.get(IDS.roof);
  if (!roof || !/single 2013 MKX owner's allegation/.test(roof.description) || !/not proof of cause or a model-wide defect/i.test(roof.description) || /thinner|ceramic-tempered|class-action coverage where applicable/i.test(roof.description + roof.solution)) errors.push('roof correction retained unsupported design or litigation claims');
  const ptu = byId.get(IDS.ptu);
  if (!ptu || !/SSM 47230/.test(ptu.description) || !/SSM 46522/.test(ptu.description) || /30,000-mile|seize the unit or damage the transmission/.test(ptu.solution) || /TSB 19-2017/.test(ptu.description + ptu.solution)) errors.push('PTU correction lost exact SSM boundaries');
  const brake = byId.get(IDS.brake);
  if (!brake || !/free remedy is available through the dealer/i.test(brake.solution) || !/inspect both rear jounce hoses/i.test(brake.solution) || /once the remedy is available|anticipated in 2026/i.test(brake.description + brake.solution) || brake.estimatedCostLow !== 0 || brake.estimatedCostHigh !== 0) errors.push('brake correction retained stale remedy language');
  const airbag = byId.get(IDS.airbag);
  if (!airbag || !/21V158/.test(airbag.description) || !/21V081/.test(airbag.description) || !/16V384, 17V024, 18V046 and 19V001/.test(airbag.description) || !/should not be inferred from 21V158 or 21V081 alone/i.test(airbag.description) || !/If the VIN has an open recall.*Do Not Drive group, do not drive/i.test(airbag.solution)) errors.push('airbag correction lost campaign-specific Do Not Drive boundary');
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
