/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  transmission: 'mitsubishi-montero-automatic-transmission-torque-converter-lockup-shudder-slipp',
  crankSensor: 'mitsubishi-montero-crankshaft-position-sensor-distributor-pickup-failure',
  fourWheelDrive: 'mitsubishi-montero-super-select-4wd-vacuum-actuator-free-wheel-engagement-failu',
  timingBelt: 'mitsubishi-montero-timing-belt-failure-interference-engine-causes-bent-valves',
  valveStemSeals: 'mitsubishi-montero-valve-stem-seal-wear-high-oil-consumption-high-mileage-v6s',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10000438', '10004448', '10014377', '53048', '601488', '601990',
  '6088731', '609774', '614018',
]);
const campaigns = Object.freeze([
  '00V123002', '00V226001', '00V311001', '01V254001', '04V067000',
  '04V095000', '04V319000', '04V428000', '20V035000', '84V098000',
  '89V030000', '93E023000', '95V103004', '96V143001', '96V143002',
  '98V205000', '98V220000',
]);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  crankPulleyRecall: {
    title: 'NHTSA Recall 00V311001 - Montero Crankshaft Pulley Bolt',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=00V311001',
    contains: '00V311001',
  },
});

const content = Object.freeze({
  [ids.transmission]: {
    description: `Communication 10004448 documents torque-converter shudder, surge or vibration at 35-50 mph on 2001-2003 Montero vehicles, outside the frozen 1994-1999 population. Communication 6088731 supplies maintenance information, while 53048, 601488 and 609774 address a bounded P1715 and sluggish-acceleration condition rather than clutch-pack wear or complete transmission failure. The exact corpus does not establish one V4AW2/V4AW3 age-related failure mechanism, towing or off-road causation, delayed engagement and slipping progression, or the frozen full population.`,
    solution: `Identify the installed transmission, model year, build date and fluid requirement, preserve codes and reproduce the vibration, slipping or engagement complaint. Separate engine misfire, driveline vibration and transfer-case noise from torque-converter clutch behavior; inspect fluid level, condition and specification, cooler flow and leakage, electrical inputs and measured hydraulic or speed data under the applicable service procedure. Do not buy fluid, a friction modifier, cooler, torque converter, clutch pack or rebuilt transmission from this page; the exact population, fluid specification and failed control, hydraulic or mechanical path must be proven first.`,
    symptoms: ['installed transmission and fluid specification verified', 'engine, driveline and converter vibration paths separated', 'codes, speed data, pressure, fluid and cooler findings documented'],
    affectedSystems: ['automatic transmission and torque converter', 'transmission fluid and cooler circuit', 'transmission control inputs and hydraulic pressure'],
    evidence: ['10004448 supports a 2001-2003 Montero torque-converter condition, not the frozen 1994-1999 population.', '6088731 is maintenance information and does not prove recurring failure.', 'The P1715 records describe a separate bounded control condition rather than clutch-pack wear or universal slipping.'],
    conflict: 'The indexed 1994-1999 transmission identity imports a later bulletin and adds unsupported wear, use-causation and complete-failure claims.',
    summary: 'Held the overbroad transmission identity and separated later converter shudder, P1715 control and mechanical diagnosis.',
    citations: ['datasets'],
  },
  [ids.crankSensor]: {
    description: `Communication 601990 reports long cold starts, warm-up sag and stalling on 1992-1998 Montero vehicles but does not identify a crankshaft sensor or distributor pickup as the cause. Recall 00V311001 separately addresses a loose crankshaft-pulley bolt on certain 1992-1996 3.0-liter vehicles and loss of power-steering assist, not recurring sensor failure or a stripped reluctor ring. The exact corpus does not prove the frozen early-distributor and later-sensor split, heat-related recovery, aftermarket-part failure claim or one 1990-1999 component identity.`,
    solution: `Preserve codes and freeze-frame data and verify cranking rpm, spark, injector command and fuel pressure during the actual no-start or stall. Check sensor power, ground, wiring and connectors and compare crank and cam waveforms with the applicable service procedure; separately inspect mechanical timing and recall 00V311001 completion where applicable. Do not buy an OEM or aftermarket crank sensor, distributor, ignition module, crank sprocket or reluctor from this page; the installed system and failed signal, ignition, fuel, wiring or mechanical path must be proven first.`,
    symptoms: ['engine, year and installed ignition/sensor system verified', 'cranking rpm, spark, injector and fuel results captured during failure', 'signal, wiring, ignition, fuel and mechanical-timing paths separated'],
    affectedSystems: ['crank and cam position signals', 'distributor, ignition and engine control', 'crankshaft pulley, sprocket and mechanical timing'],
    evidence: ['601990 records start and stall symptoms without assigning a crank sensor or distributor pickup.', '00V311001 concerns a loose crankshaft-pulley bolt, not the frozen sensor mechanism.', 'No exact communication supports the aftermarket-versus-OEM reliability claim or the full 1990-1999 identity.'],
    conflict: 'The indexed component identity and decade-long population are inferred from non-specific symptoms and a separate crank-pulley recall.',
    summary: 'Held the inferred crank-sensor identity and required captured signal, ignition, fuel and mechanical-timing proof.',
    citations: ['crankPulleyRecall', 'datasets'],
  },
  [ids.fourWheelDrive]: {
    description: `The exact corpus contains a 2001 freewheel-engage-switch oil-leak communication, a 2001-2002 flashing 4WD-lamp and DTC 33 communication, and a later blinking RWD/4WD-lamp record. Those populations are outside the frozen 1992-1999 page and do not establish recurring dual-solenoid, hose, reservoir or front-axle vacuum-actuator failure in that earlier generation. A flashing lamp, grinding complaint or inability to change modes does not by itself identify the failed switch, vacuum, electrical, transfer-case or axle component.`,
    solution: `Identify the exact Super Select generation and installed front-axle and transfer-case control system. Preserve codes, verify commanded modes and switch states, and check power, grounds, fuses, wiring, connectors, vacuum supply, hoses, reservoir, solenoids, actuator travel and hold, front-differential engagement and transfer-case operation under the generation-specific procedure. Do not buy a solenoid pack, vacuum hose kit, reservoir, actuator, differential switch or transfer-case switch from this page; the exact population and failed electrical, vacuum or mechanical path must be proven first.`,
    symptoms: ['Super Select generation and installed control system verified', 'codes, commanded modes and switch states captured', 'vacuum, electrical, axle and transfer-case paths separated'],
    affectedSystems: ['Super Select 4WD control and indicators', 'vacuum supply, solenoids and front-axle actuator', 'front differential and transfer-case switches'],
    evidence: ['614018 addresses a 2001 freewheel-switch oil leak, outside the frozen population.', '10000438 covers 2001-2002 4WD-lamp flashing and DTC 33, not a 1992-1999 vacuum-actuator identity.', 'No exact communication proves the frozen solenoid, hose, reservoir and seized-actuator recurrence claim.'],
    conflict: 'The indexed 1992-1999 vacuum-actuator identity is supported only by later, component-distinct communications.',
    summary: 'Held the overbroad Super Select identity and required generation-specific vacuum, switch, control and mechanical diagnosis.',
    citations: ['datasets'],
  },
  [ids.timingBelt]: {
    description: `The reviewed 234-row exact Montero manufacturer-communication corpus and 47-row recall corpus contain no record establishing recurring timing-belt breakage, oil-contamination failure or one 1990-1999 bent-valve population for both frozen engine labels. Recall 00V311001 concerns a crankshaft-pulley bolt and does not prove timing-belt condition, maintenance interval or valve damage. The frozen interference-design assertion, approximately 60,000-mile or seven-year interval and claim that this is the platform's single most consequential neglected item are not established by the reviewed exact primary evidence.`,
    solution: `Identify the installed engine and obtain its exact manufacturer maintenance schedule and timing procedure by VIN. If belt history is unknown, inspect and service only to that schedule; if the engine stops, do not keep cranking it. Verify mechanical timing, tensioner and idler condition, water-pump and seal leakage, then perform compression, leak-down or borescope checks as the applicable procedure requires before assigning valve damage. Do not buy a belt kit, tensioner, idler, water pump, seal set, cylinder head or valves from this page; engine fitment, service interval and actual damage must be proven first.`,
    symptoms: ['engine identity and manufacturer schedule verified by VIN', 'belt history, timing alignment and leakage documented', 'compression, leak-down or borescope evidence obtained before assigning valve damage'],
    affectedSystems: ['timing belt, tensioner and idlers', 'water pump and cam/crank seals', 'valvetrain, pistons and cylinder heads'],
    evidence: ['No exact communication or recall establishes a recurring Montero timing-belt failure identity.', '00V311001 addresses the crankshaft-pulley bolt rather than belt condition or valve damage.', 'The frozen interval and interference conclusions require engine-specific primary documentation not present in the packet.'],
    conflict: 'The indexed timing-belt identity, dual-engine scope and maintenance interval lack exact primary-source support.',
    summary: 'Held the timing-belt identity and made VIN-specific schedule, timing and measured engine-damage evidence mandatory.',
    citations: ['crankPulleyRecall', 'datasets'],
  },
  [ids.valveStemSeals]: {
    description: `The reviewed exact manufacturer-communication and recall corpora contain no record establishing recurring valve-stem-seal hardening, worn valve guides, piston-ring wear, a quart-per-1,000-to-1,500-mile pattern or one 1990-1999 Montero V6 population. Smoke timing and oil consumption can help structure diagnosis but do not by themselves distinguish external leakage, PCV ingestion, valve seals and guides, cylinder wear or piston rings. The statement that Mitsubishi treats approximately one quart per 1,000 miles as normal is not supported by an exact primary source in this audit.`,
    solution: `Measure oil consumption over a controlled interval with the oil filled and checked consistently, and inspect external leaks and the PCV and intake paths first. Document plug deposits, smoke conditions, compression, leak-down and borescope findings, then measure valve-guide clearance or cylinder and ring condition as the applicable service procedure requires. Do not buy valve-stem seals, guides, a PCV valve, piston rings, cylinder heads or an engine rebuild kit from this page; the exact oil path, wear measurement and engine fitment must be proven first.`,
    symptoms: ['controlled oil-consumption measurement completed', 'external leak and PCV/intake paths inspected', 'seal, guide, cylinder and ring evidence separated'],
    affectedSystems: ['valve-stem seals and valve guides', 'piston rings and cylinder walls', 'PCV, intake and external oil-leak paths'],
    evidence: ['No exact communication establishes a valve-stem-seal or guide failure population.', 'No exact primary source supports the frozen consumption rate or normal-use threshold.', 'Smoke timing alone cannot identify seals, guides or rings without measured diagnosis.'],
    conflict: 'The indexed high-oil-consumption identity combines multiple unproven wear paths and unsupported frequency and consumption claims.',
    summary: 'Held the oil-consumption identity and required controlled measurement and separation of leak, PCV, valve and ring paths.',
    citations: ['datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Montero', slug: 'montero', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-montero-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['MONTERO'],
  searchTerms: ['automatic transmission / transaxle maintenance', 'P1715', 'torque converter shudder', 'long cold start times', 'freewheel engage switch', '4WD indicator lamp flashing', 'RWD/4WD LIGHT BLINKS', 'timing belt', 'valve stem', 'oil consumption', 'crankshaft position sensor', 'distributor pickup'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 52, '2000-2004': 128, '2005-2009': 24, '2010-2014': 1, '2015-2019': 8, '2020-2024': 21, '2025-2026': 0 },
    totalRows: 234,
    relevantRowCount: 9,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 44, post: 3 },
    totalRows: 47,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Seventeen exact Montero campaign identities exist. Only 00V311001 intersects the reviewed engine narratives, and it supports a crankshaft-pulley-bolt defect rather than sensor, timing-belt or valve-stem-seal failure.',
  },
  content,
  requiredProse: [
    { id: ids.transmission, field: 'description', patterns: ['2001-2003 Montero vehicles', 'does not establish one V4AW2/V4AW3'] },
    { id: ids.transmission, field: 'solution', patterns: ['Do not buy fluid, a friction modifier', 'must be proven first'] },
    { id: ids.crankSensor, field: 'description', patterns: ['does not identify a crankshaft sensor', 'Recall 00V311001'] },
    { id: ids.fourWheelDrive, field: 'description', patterns: ['outside the frozen 1992-1999 page', 'does not by itself identify'] },
    { id: ids.timingBelt, field: 'description', patterns: ['contain no record establishing recurring timing-belt breakage', 'not established by the reviewed exact primary evidence'] },
    { id: ids.valveStemSeals, field: 'description', patterns: ['contain no record establishing recurring valve-stem-seal', 'not supported by an exact primary source'] },
    { id: ids.valveStemSeals, field: 'solution', patterns: ['Measure oil consumption over a controlled interval', 'Do not buy valve-stem seals'] },
  ],
  observations: [
    { code: 'five-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All five frozen identities materially exceed exact primary evidence and remain published pending identity policy.' },
    { code: 'later-transmission-bulletin-not-backfilled', severity: 'population-safety', recordIds: [ids.transmission], detail: 'A 2001-2003 converter bulletin is not used to prove the frozen 1994-1999 transmission population.' },
    { code: 'symptom-not-converted-to-sensor', severity: 'technical-accuracy', recordIds: [ids.crankSensor], detail: 'Cold-start and stall symptoms are not converted into proof of crank-sensor or distributor-pickup failure.' },
    { code: 'later-4wd-components-not-backfilled', severity: 'population-safety', recordIds: [ids.fourWheelDrive], detail: 'Later switch and freewheel records are not converted into an earlier vacuum-actuator failure identity.' },
    { code: 'maintenance-and-wear-claims-held', severity: 'source-safety', recordIds: [ids.timingBelt, ids.valveStemSeals], detail: 'Intervals, interference consequences, oil-consumption thresholds and wear mechanisms remain held without exact primary documentation.' },
    { code: 'all-montero-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Montero page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
