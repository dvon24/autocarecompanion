/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  dpf: 'renault-koleos-2-0-dci-diesel-particulate-filter-blockage',
  petrolEngine: 'renault-koleos-2-5-petrol-timing-chain-stretch-oil-consumption',
  awd: 'renault-koleos-awd-rear-differential-transfer-case-internal-failure',
  cvtJudder: 'renault-koleos-cvt-judder',
  suspensionArm: 'renault-koleos-front-lower-suspension-arm-fracture',
  infotainment: 'renault-koleos-infotainment-freeze',
  cvtFailure: 'renault-koleos-x-tronic-cvt-transmission-failure',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.cvtJudder, ids.infotainment].sort());

function held({ description, solution, symptoms, systems, evidence, conflict, summary, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets', 'dvsaRecallCheck', 'renaultRecallCheck'],
    commerceDecision: commerceDecision || 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.dpf]: held({
    description: 'The frozen page applies one DPF-blockage identity to 2.0 dCi variants across first- and second-generation Koleos vehicles from 2008-2020, omitting 2016 while combining soot loading, pressure/temperature sensors, short-trip use, smoke and an alleged filter-destroying dealer regeneration. Forum, advice and app-community pages do not establish one manufacturer-defined population, cause, mileage or repair price.',
    solution: 'Capture DTCs, soot and ash estimates, differential pressure, exhaust temperatures and regeneration history, then test pressure pipes/sensors, EGR, intake/boost, fueling and oil dilution before cleaning or forced regeneration. Do not force regeneration until filter load, oil level, sensor validity and exhaust-temperature safety are confirmed. Do not buy a DPF, sensor or pipe from this page; emissions generation, root cause and VIN fitment must be established first.',
    symptoms: ['soot, ash and differential pressure recorded', 'temperature and regeneration history validated', 'sensor, EGR, air and fuel paths separated'],
    systems: ['diesel particulate filter', 'differential-pressure and temperature sensing', 'engine air, fuel and regeneration control'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'Secondary sources do not establish a cross-generation 2.0 dCi population.', 'The dealer-damage anecdote, prices and motorway routine are not exact Renault evidence.'],
    conflict: 'The indexed identity turns a multi-cause regeneration state into a twelve-year defect across different vehicle generations.',
    summary: 'Held the cross-generation DPF identity and replaced price and driving-rule claims with measured regeneration safety gates.',
  }),
  [ids.petrolEngine]: held({
    description: 'The frozen page assigns both timing-chain stretch and piston-ring oil consumption to the first-generation 2.5 petrol Koleos from 2008-2015, labels the engine QR25DE/2TR, gives a 100,000-150,000 km onset and attributes acceleration to oil interval or viscosity. The cited engine-summary and paid-answer pages do not establish a Renault-defined Koleos defect population, common mechanism or mileage range.',
    solution: 'Confirm the exact engine code, document oil consumption against distance and inspect leaks, crankcase ventilation, compression/leak-down, plugs and exhaust condition. For cold-start noise, verify oil pressure, localize the source and check cam/crank timing under engine-specific Renault procedures before disturbing the drive. Do not buy piston rings, a chain kit, tensioner or guides from this page; failed path, engine identity and VIN fitment must be established first.',
    symptoms: ['engine code and oil-consumption log recorded', 'external, ventilation and sealing paths separated', 'cold-start noise and timing measured'],
    systems: ['engine lubrication and cylinder sealing', 'timing chain, guides and tensioner', 'crankcase ventilation and exhaust aftertreatment'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'The frozen sources are not Renault campaign or technical records.', 'No exact source verifies the 100,000-150,000 km onset or combined chain/ring identity.'],
    conflict: 'The indexed identity joins two distinct engine conditions and unsupported mileage/cause claims across eight years.',
    summary: 'Held the combined 2.5 petrol identity and separated measured oil consumption from timing-chain diagnosis.',
  }),
  [ids.awd]: held({
    description: 'The frozen page combines rear-differential, coupling and transfer-case failure across 2008-2015 and 2017-2020 2.0 dCi AWD Koleos generations, asserting cracked housings, halfshaft leaks, 1-5 mm metal fragments, 80,000-100,000 km onset, recurrence and low-oil/overheating/coupling stress. Forum and repair-summary pages do not prove a common cross-generation component or mechanism.',
    solution: 'Identify the exact AWD architecture and complaint location, inspect leaks, tire-size equality and driveline binding, then sample the specified unit fluids and measure backlash, bearing noise and metal contamination before disassembly. Stop if severe noise, binding, leakage or loss of drive is present. Do not buy a differential, coupling, transfer unit or fluid from this page; failed unit, damage extent, lubricant specification and VIN fitment must be established first.',
    symptoms: ['AWD architecture and noise location identified', 'tire mismatch, leaks and binding assessed', 'each unit fluid and metal contamination inspected separately'],
    systems: ['rear final drive', 'AWD coupling and control', 'transfer unit, propeller shafts and halfshafts'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'The frozen years span two generations with different driveline applications.', 'A forum case cannot establish the mileage, fragment size, recurrence or shared root cause.'],
    conflict: 'The indexed identity merges three driveline units and two vehicle generations into one failure mechanism.',
    summary: 'Held the combined AWD identity and separated rear-drive, coupling and transfer-unit diagnosis by architecture.',
  }),
  [ids.cvtJudder]: held({
    description: 'The frozen page spans 2008-2024, multiple Koleos generations, 2.0 dCi and 2.5 petrol applications and three trims under a generic Jatco CVT judder/slip identity. It cites only a forum home page, claims belt/pulley wear and accelerated fluid degradation, assigns 45 owner reports and prescribes NS-2 or NS-3 fluid plus belt/pulley replacement without identifying the transmission code.',
    solution: 'Identify the exact transmission and fluid specification by VIN, preserve DTCs and freeze-frame data, record primary/secondary speed, pressure and temperature data, and exclude engine, mount, axle and tire causes. Follow the Renault/Jatco level and service procedure for that unit; a generic flush can worsen a damaged or incorrectly filled CVT. Do not buy fluid, a valve body, belt, pulley or transmission from this page; transmission code, diagnosis and VIN fitment must be established first.',
    symptoms: ['transmission code and fluid specification verified', 'pressure, ratio and temperature data recorded', 'engine, mount, axle and tire causes excluded'],
    systems: ['CVT hydraulic and ratio control', 'belt/pulley or chain drive where fitted', 'transmission cooling and electronic control'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'A forum home page does not prove a seventeen-year cross-generation population.', 'The 45-owner total and generic NS-2/NS-3 service/replacement advice lack exact evidence.'],
    conflict: 'The indexed identity spans incompatible transmissions and applications with unsupported social proof and universal service advice.',
    summary: 'Held the broad CVT-judder identity and reduced the unsupported 45-owner total to unknown while requiring transmission-specific data.',
  }),
  [ids.suspensionArm]: held({
    description: 'Secondary recall indexes describe a bounded Koleos lower-arm campaign, but the frozen page asserts January-November 2011 production, right-hand forward arm fracture under braking, sudden rightward veer, wheel jamming and a 2013 free replacement without an exact DVSA or Renault campaign row captured in the packet. A model-year page cannot establish VIN eligibility.',
    solution: 'If there is suspension movement, impact noise, steering pull or wheel interference, stop driving and arrange inspection or recovery. Check the registration and VIN through DVSA and Renault, and have the dealer confirm the campaign and completed remedy before relying on model year alone. Do not buy a lower arm, ball joint or fasteners from this page; campaign eligibility, side, component identity and VIN-specific remedy must be confirmed first.',
    symptoms: ['DVSA and Renault campaign status checked', 'wheel and arm movement inspected before driving', 'campaign completion documented by VIN'],
    systems: ['front lower suspension arm', 'wheel location and steering control', 'vehicle recall eligibility'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'DVSA and Renault provide official recall-check routes.', 'The exact frozen build window, side, failure behavior and remedy were not verified from a captured primary campaign row.'],
    conflict: 'The indexed identity embeds precise campaign facts from secondary recall indexes without a retrieved primary record.',
    summary: 'Held the lower-arm recall identity and preserved stop-driving/VIN-verification guidance without restating unverified campaign detail.',
  }),
  [ids.infotainment]: held({
    description: 'The frozen page attributes freezing, spontaneous reboot and phone-connectivity loss after Android Auto or Apple CarPlay to Koleos II R-Link 2 from 2017-2024, restricts trims to Dynamique and Initiale Paris, cites only a forum home page and claims 40 owner reports. Hardware, software, phone, cable, network and update conditions are distinct and no exact Renault source establishes the population.',
    solution: 'Record the head-unit version, software build, connected phone, cable and failure conditions, test without accessories, and follow Renault’s unit- and VIN-specific reset/update instructions. Verify vehicle battery, power, network and peripheral behavior before replacing hardware. Do not buy a head unit, display, cable or update service from this page; unit identity, diagnosis, coding and VIN fitment must be established first.',
    symptoms: ['head-unit and software identity recorded', 'phone, cable and accessory effects isolated', 'vehicle power and network checked before replacement'],
    systems: ['R-Link 2 head unit and display', 'phone projection and connectivity', 'vehicle power, network and software'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'A forum home page does not prove the eight-year or trim-specific population.', 'The 40-owner total and post-phone-session mechanism lack traceable evidence.'],
    conflict: 'The indexed identity merges several infotainment and connectivity paths under unsupported trim scope and social proof.',
    summary: 'Held the R-Link 2 identity and reduced the unsupported 40-owner total to unknown while requiring unit-specific diagnosis.',
  }),
  [ids.cvtFailure]: held({
    description: 'The frozen X-Tronic page overlaps the separate CVT-judder page and applies slipping, shuddering, high engine speed, hydraulic-pressure loss, belt damage and coolant-to-fluid contamination across 2009-2020. It calls the CVT the single most reported failure, asserts a 100,000 km onset, 60,000-80,000 km NS-3 interval and common replacement, but its advice, forum and paid-answer sources do not establish those claims or one transmission application.',
    solution: 'Identify the transmission and fluid by VIN, preserve DTCs, and record ratio, pressure and temperature data. Inspect fluid level/condition by the exact procedure and test the heat exchanger only if the installed unit uses the alleged coolant interface; separate engine flare, clutch/lock-up, valve-body, pump and internal ratio-device faults. Do not buy NS-3 fluid, a cooler, valve body or CVT from this page; transmission code, contamination path, diagnosis and VIN fitment must be established first.',
    symptoms: ['transmission code and installed cooler identified', 'ratio, pressure and temperature data recorded', 'coolant contamination tested rather than assumed'],
    systems: ['X-Tronic CVT ratio and hydraulic control', 'transmission heat exchanger where fitted', 'valve body, pump and electronic control'],
    evidence: ['The complete NHTSA corpus contains zero Renault Koleos rows.', 'The page duplicates the frozen CVT-judder symptom and vehicle family.', 'No exact Renault source supports the superlative, mileage, interval, NS-3 or cooler-contamination scope.'],
    conflict: 'The indexed identity duplicates another CVT page and adds universal contamination, interval and failure-frequency claims.',
    summary: 'Held the overlapping X-Tronic identity and replaced superlative, interval and cooler assumptions with transmission-specific diagnosis.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  dvsaRecallCheck: { title: 'DVSA Vehicle Safety Recall Checker', type: 'regulator', url: 'https://www.check-vehicle-recalls.service.gov.uk/', contains: 'Vehicle safety recalls' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Koleos', slug: 'koleos', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-koleos-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['KOLEOS'],
  searchTerms: ['DPF', 'timing chain', 'oil consumption', 'rear differential', 'transfer case', 'CVT', 'suspension arm', 'infotainment'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT KOLEOS rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT KOLEOS rows; owners must use DVSA and Renault recall checkers for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.cvtJudder, field: 'description', patterns: ['2008-2024', '45 owner reports'] },
    { id: ids.cvtFailure, field: 'description', patterns: ['overlaps the separate CVT-judder page', 'single most reported failure'] },
    { id: ids.awd, field: 'description', patterns: ['2008-2015 and 2017-2020', 'rear-differential, coupling and transfer-case'] },
    { id: ids.suspensionArm, field: 'description', patterns: ['Secondary recall indexes', 'model-year page cannot establish VIN eligibility'] },
  ],
  observations: [
    { code: 'all-seven-held', severity: 'identity-safety', recordIds: allIds, detail: 'All seven Koleos pages remain published but exceed exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT KOLEOS rows; the geographic limitation is explicit.' },
    { code: 'cvt-duplicate-identity-held', severity: 'identity-safety', recordIds: [ids.cvtJudder, ids.cvtFailure], detail: 'Two overlapping CVT pages remain live holds; no archive or redirect is proposed.' },
    { code: 'cross-generation-awd-scope-held', severity: 'technical-accuracy', recordIds: [ids.awd], detail: 'Rear differential, coupling and transfer paths across two generations are separated.' },
    { code: 'regeneration-and-fluid-advice-bounded', severity: 'safety-accuracy', recordIds: [ids.dpf, ids.cvtJudder, ids.cvtFailure], detail: 'Generic forced regeneration, flush and NS-2/NS-3 advice are replaced with unit-specific gates.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 45 and 40 owner totals are reduced to unknown.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
