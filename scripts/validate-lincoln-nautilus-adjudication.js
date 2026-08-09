/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { BLOCKER_IDS, IDS, OUTPUT, PDF_SOURCES, SNAPSHOT, citationsFor } = require('./build-lincoln-nautilus-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./lincoln-adjudication-utils');

const IMMUTABLE_FIELDS = ['make','model','years','trims','engines','category','title','severity','status','relatedIssueIds','reportCount'];
const ALLOWED_CHANGED_FIELDS = new Set(['description','solution','confidence','symptoms','affectedSystems','dtcCodes','estimatedCostLow','estimatedCostHigh','typicalMileageLow','typicalMileageHigh','citations','communityRecommendations','fixParts','humanApproved','source','reviewedOn','contentUpdatedOn','contentUpdateSummary']);
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function primary(url) { return /^https:\/\/(?:static\.nhtsa\.gov|api\.nhtsa\.gov|www\.nhtsa\.gov|www\.fordservicecontent\.com)\//i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Nautilus').sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'Nautilus') errors.push('wrong make/model');
  if (expected.length !== 18 || rows.length !== 18 || new Set(ids).size !== 18) errors.push('Nautilus coverage must be 18/18 unique rows');
  if (!equal([...ids].sort(), expected.map((row) => row.id).sort())) errors.push('packet IDs do not exactly match frozen Nautilus snapshot');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], BLOCKER_IDS)) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 18 || packet.summary?.total !== 18) errors.push('summary drifted');
  if (!/All 18 frozen Lincoln Nautilus pages/.test(packet.completionStatement || '')) errors.push('completion statement drifted');
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
    if (!/do not buy/i.test(row.proposal.solution) || !row.commerceDecision || !/(?:VIN|dealer|technician|software|no universal|no retail|no replacement part)/i.test(row.commerceDecision)) errors.push(`${row.id}: missing commerce boundary`);
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
  const egr = byId.get(IDS.egr);
  if (!egr || !/TSB 20-2234/.test(combined(IDS.egr)) || !/pressure-test/.test(egr.solution) || !/EGR-cooler and outlet-tube replacement only when leakage is confirmed/.test(egr.solution) || /class-action reimbursement|replace (?:the )?(?:long block|engine|head gasket|spark plugs)|perform a coolant flush/i.test(combined(IDS.egr))) errors.push('EGR correction lost exact diagnostic and remedy boundary');
  const vct = byId.get(IDS.vct);
  if (!vct || !/six hours/.test(vct.description) || !/two-to-five-second/.test(vct.description) || !/all four VCT units/.test(vct.solution) || /replace (?:the )?(?:timing )?(?:chain|guide|tensioner)/i.test(vct.solution)) errors.push('VCT correction drifted');
  const transmission = byId.get(IDS.transmission);
  if (!transmission || !/March 11, 2021/.test(transmission.description) || !/PCM reprogramming/.test(transmission.solution) || !/solenoid-body strategy/.test(transmission.solution) || /replace (?:the )?(?:torque converter|clutches)|rebuild the transmission|perform a fluid service/i.test(combined(IDS.transmission))) errors.push('8F35 correction drifted');
  const startStop = byId.get(IDS.startStop);
  if (!startStop || !/multiple normal conditions/.test(startStop.description) || !/Shift to P, Restart Engine/.test(startStop.description) || /P0A7F|B1676|start-stop eliminator is recommended|weak 12-volt battery is the (?:cause|universal)/i.test(combined(IDS.startStop))) errors.push('Auto Start-Stop boundary drifted');
  const displays = byId.get(IDS.displays);
  if (!displays || !/30,679/.test(displays.description) || !/1\.1\.3\.2 or later/.test(displays.solution) || !/over-the-air update or a dealer update/.test(displays.solution)) errors.push('display recall boundary drifted');
  const block = byId.get(IDS.blockHeater);
  if (!block || !/original Part 573 filing counted 11 Nautilus/.test(block.description) || !/Do not plug in/.test(block.solution) || !/threaded blanking plug/.test(block.solution) || /6,781.*Nautilus/i.test(combined(IDS.blockHeater))) errors.push('block-heater current remedy or population drifted');
  const brakes = byId.get(IDS.brakes);
  if (!brakes || !/2024-2025/.test(brakes.description) || !/June 13, 2024/.test(brakes.description) || !/PZ1Z-1125-B/.test(brakes.solution) || /2022-2023.*supported|replace both front rotors on every/i.test(combined(IDS.brakes))) errors.push('brake SSM boundary drifted');
  const injector = byId.get(IDS.injector);
  if (!injector || !/expired May 31, 2025/.test(injector.description) || !/all four direct injectors/.test(injector.solution) || /free of charge today|replace the engine/i.test(combined(IDS.injector))) errors.push('injector CSP boundary drifted');
  const pedestrian = byId.get(IDS.pedestrian);
  if (!pedestrian || !/26V415/.test(pedestrian.description) || !/supersedes the earlier 25SA2/.test(pedestrian.description) || !/did not fully correct/.test(pedestrian.description) || !/final non-DSP remedy is still under development/.test(pedestrian.solution) || /25SA2.*final remedy|OTA update fixes every/i.test(combined(IDS.pedestrian))) errors.push('pedestrian recall supersession drifted');
  const ipma = byId.get(IDS.ipma);
  if (!ipma || !/High object-processing volume/.test(ipma.description) || !/updated IPMA software/.test(ipma.solution) || /BlueCruise/i.test(combined(IDS.ipma))) errors.push('IPMA recall boundary drifted');
  const shocks = byId.get(IDS.shocks);
  if (!shocks || !/366 model-year 2023/.test(shocks.description) || !/inspect both rear shocks/.test(shocks.solution) || /replace.*stabilizer-bar end link/i.test(shocks.solution)) errors.push('rear-shock recall boundary drifted');
  const led = byId.get(IDS.led);
  if (!led || !/1,539/.test(led.description) || !/Schottky diode/.test(led.description) || !/right and\/or left LED driver module/.test(led.solution)) errors.push('LED module recall boundary drifted');
  const roof = byId.get(IDS.roof);
  if (!roof || !/complete 429-document/.test(roof.description) || !/ODI 11661446/.test(roof.description) || !/single complaint.*not universal causation or incidence/.test(roof.description) || /all.*drains are clogged|clear every drain|use (?:wire or )?compressed air/i.test(roof.solution)) errors.push('roof allegation boundary drifted');
  const battery = byId.get(IDS.battery);
  if (!battery || !/24P22/.test(battery.description) || !/expired August 31, 2025/.test(battery.description) || !/reprogramming the ABS module/.test(battery.solution) || /46% of owners|campaign (?:24P14|24P08)|replace the battery as the remedy|amplifier is the cause/i.test(combined(IDS.battery))) errors.push('battery CSP boundary drifted');
  const liftgate = byId.get(IDS.liftgate);
  if (!liftgate || !/both the interior and exterior switches/.test(liftgate.description) || !/RGTM reprogramming/.test(liftgate.solution) || /opens or closes on its own is documented|replace (?:the )?(?:liftgate )?(?:motor|strut|latch)/i.test(combined(IDS.liftgate))) errors.push('liftgate SSM boundary drifted');
  const window = byId.get(IDS.window);
  if (!window || !/102 vehicles/.test(window.description) || !/both 24C43\/24V953 and 25C36\/25V518/.test(window.solution) || !/driver- and passenger-door modules/.test(window.solution)) errors.push('window recall boundary drifted');
  const camera = byId.get(IDS.camera);
  if (!camera || !/7,318/.test(camera.description) || !/K2GT-19G490-BB/.test(camera.solution) || !/free of charge/.test(camera.solution)) errors.push('camera recall boundary drifted');
  const sync = byId.get(IDS.sync);
  if (!sync || !/certain 2019-2020/.test(sync.description) || !/APIM software update/.test(sync.solution) || /replace the APIM first|every 2019-2023 vehicle has an APIM hardware failure/i.test(combined(IDS.sync))) errors.push('SYNC software boundary drifted');
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
