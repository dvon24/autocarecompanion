/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  egrCooler: 'opel-insignia-a-2.0-cdti-egr-cooler-crack',
  transmission: 'opel-insignia-a-aisin-af40-shift-quality',
  flexPipe: 'opel-insignia-a-flexpipe-exhaust-failure',
  timingBelt: 'opel-insignia-insignia-2-0-cdti-premature-timing-belt-water-pump-failure',
  awd: 'opel-insignia-insignia-4x4-haldex-coupling-rear-differential-failure',
  fuelRecall: 'opel-insignia-insignia-b-2-0-diesel-fuel-line-chafing-fire-risk',
  parkingBrake: 'opel-insignia-insignia-electric-parking-brake-actuator-control-module-fail',
  infotainment: 'opel-insignia-navi-900-intellilink-infotainment-display-failure',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze(['10078434', '10190503', '10201098']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: commerceDecision || 'failure path, production population, component and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.egrCooler]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes an internal EGR-cooler-crack population across 2008-2015 A20DT/A20DTH/A20DTR Insignia vehicles, the frozen 100,000-180,000-km range or progression to cylinder flooding. Cross-model use in Astra, Zafira and Cascada does not prove one Insignia mechanism.',
    solution: 'For coolant loss or white exhaust, stop if overheating or hydrolock is suspected, pressure-test the cooling system, and inspect the EGR cooler, intake, combustion chambers and other coolant paths under exact engine-code service information. Retain emissions equipment. Do not buy an EGR cooler or delete/remap kit from this page; the leak path, engine variant and VIN fitment must be established first.',
    symptoms: ['coolant loss verified by pressure testing', 'EGR cooler separated from other coolant paths', 'hydrolock risk assessed before cranking'],
    systems: ['2.0 CDTI cooling system', 'EGR cooler and intake', 'combustion chambers and emissions controls'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'No exact source supports the frozen mileage or three-engine population.', 'Cross-model engine use is not Insignia defect evidence.'],
    conflict: 'The indexed identity applies one crack mechanism and progression to three engines over eight years without exact primary evidence.',
    summary: 'Held the unsupported EGR-cooler identity and removed mileage, price and emissions-delete advice.',
  }),
  [ids.transmission]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication in the reviewed corpus establishes a 2008-2017 AF40 harsh-shift and shudder population, the frozen 100,000-160,000-km onset, degraded-fluid/solenoid root cause or a disputed lifetime-fill policy. The page spans several engines and combines harsh shifts, lock-up shudder and delayed engagement without separating hydraulic, software, fluid and mechanical paths. Its JWS3309/Dexron-VI compatibility claim is not verified by exact VIN service information.',
    solution: 'Record gear, temperature, speed, load and engagement delay, scan the transmission, and verify software, adaptation state, fluid level and the exact approved fluid/service procedure by VIN. Diagnose shift quality, lock-up shudder and delayed engagement separately. Do not buy fluid, solenoids, a valve body or torque converter from this page; the exact fault, specification and VIN fitment must be established first.',
    symptoms: ['condition recorded by gear and temperature', 'lock-up shudder separated from engagement delay', 'exact fluid specification verified by VIN'],
    systems: ['Aisin AF40 transmission', 'hydraulic control and solenoids', 'torque converter, fluid and software'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no AF40 defect bulletin; its term matches are manual-transmission characteristics and identification documents.', 'No exact source supports the mileage range or lifetime-fill dispute.', 'The frozen JWS3309/Dexron-VI compatibility claim is not verified.'],
    conflict: 'The indexed identity merges several transmission symptoms and prescribes unverified fluid compatibility across a ten-year multi-engine population.',
    summary: 'Held the broad AF40 identity and removed interval, fluid-compatibility, cost and parts-first claims.',
  }),
  [ids.flexPipe]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2008-2017 Insignia front-flex-pipe failure population, the frozen 80,000-150,000-km range or diesel predominance. The page also assumes oxygen-sensor placement and fault behavior across engines without exhaust-variant evidence.',
    solution: 'Treat exhaust fumes in the cabin as urgent: ventilate, stop safely and arrange inspection. With the exhaust cold, a qualified repairer should locate the leak and inspect flex section, joints, mounts, nearby wiring and sensor placement using exact engine/VIN information. Do not buy a weld-in flex section, front pipe or oxygen sensor from this page; leak location, legal repair method and fitment must be established first.',
    symptoms: ['cabin fumes treated as urgent', 'leak location confirmed on a cold exhaust', 'sensor placement verified for the exact engine'],
    systems: ['front exhaust flex section', 'exhaust joints and mounts', 'oxygen sensors and cabin sealing'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'No exact source supports the mileage range or diesel frequency.', 'Sensor position and weld-in repair suitability vary by exhaust configuration.'],
    conflict: 'The indexed identity turns an uncited exhaust symptom into a ten-year multi-engine defect and universal weld-in repair.',
    summary: 'Held the unsupported flex-pipe identity and replaced price/shop advice with fume-safe leak localization.',
  }),
  [ids.timingBelt]: held({
    description: 'The frozen page relies on owner forums and maintenance articles to claim premature 2.0 CDTI timing-belt failure across 2009-2017, a 120,000-150,000-km/ten-year factory interval, water-pump seizure as the common trigger and repeated engine destruction. No exact Opel/Vauxhall primary source in the packet establishes that population, interval, causal frequency or a universal early 90,000-100,000-km/six-year remedy.',
    solution: 'Verify the exact engine code and current timing-drive service interval from VIN-specific Opel/Vauxhall information. Investigate coolant loss or timing-area noise promptly and inspect the belt drive and water pump using the specified procedure. If timing is lost, stop cranking and assess valve-train and piston contact before repair. Do not buy a belt kit, water pump, cylinder head or engine from this page; interval, failure path and fitment must be established first.',
    symptoms: ['engine code and official interval verified', 'coolant loss and belt-drive noise investigated', 'engine not cranked after suspected timing loss'],
    systems: ['2.0 CDTI timing belt and tensioners', 'water pump and cooling circuit', 'valvetrain and pistons'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'The cited evidence is secondary owner and maintenance content.', 'No primary source supports the frozen early interval, common-trigger or total-loss frequency.'],
    conflict: 'The indexed identity converts anecdotes into a nine-year premature-failure population and universal shortened service interval.',
    summary: 'Held the overbroad timing-belt/water-pump identity and removed unsupported interval, price and guaranteed-damage claims.',
  }),
  [ids.awd]: held({
    description: 'The frozen page combines shaft-seal oil mixing, Haldex pump contamination, rear-differential wear, tight-turn judder, claimed lack of an Opel service interval and goodwill outcomes into one 2009-2017 AWD defect. Its evidence is forum discussion and a retail seal listing; no exact manufacturer source establishes the common mechanism, under-43,000-km onset, comparison with VW/Audi or universal preventive interval.',
    solution: 'Record whether noise or judder occurs by speed, steering angle, temperature and load; scan AWD/ABS systems and inspect coupling fluid, pump operation, seals, differential oil and mechanical backlash under exact VIN service information. Use only the specified service procedure and fluid. Do not buy a seal, pump, coupling or differential from this page; the failed unit, service interval and exact fitment must be established first.',
    symptoms: ['judder recorded by steering angle and load', 'coupling and differential fluids inspected separately', 'pump, seal and mechanical wear diagnosed independently'],
    systems: ['AWD coupling and hydraulic pump', 'rear differential and shaft seal', 'ABS/ESP and AWD controls'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'A retail seal listing is not defect or fitment evidence.', 'No exact source supports goodwill percentages, prices or a universal 40,000-60,000-km interval.'],
    conflict: 'The indexed identity merges coupling, seal and differential failures and converts forum maintenance opinion into a universal schedule.',
    summary: 'Held the conflated AWD identity and removed retail seal, interval, goodwill and price claims.',
  }),
  [ids.fuelRecall]: held({
    description: 'Secondary reports identify Opel campaign 20-C-012/E191905110 for a 2.0-diesel fuel-line routing or clamp condition, but the packet contains no exact manufacturer or regulator campaign document. The frozen indexed years include 2019 while its own body says vehicles were built through November 2018, and the 45,000-worldwide count, German count, exact chafing mechanism and 30-minute remedy remain unverified.',
    solution: 'Treat diesel odor, visible fuel or smoke as urgent: stop safely, switch off, keep ignition sources away and arrange recovery. Use the official Vauxhall VIN recall checker or an authorized Opel/Vauxhall repairer to confirm campaign 20-C-012 status and perform the exact campaign inspection and remedy. Do not buy a fuel line, clamp, spacer or sleeve from this page; campaign eligibility, damage and VIN fitment govern the repair.',
    symptoms: ['diesel odor or visible fuel treated as urgent', 'campaign eligibility verified by VIN', 'repair procedure taken from the exact campaign'],
    systems: ['2.0-diesel fuel lines', 'routing clamps and nearby hot components', 'campaign and VIN eligibility'],
    evidence: ['The 62-row NHTSA Insignia communication corpus and flat recall corpus contain no exact 20-C-012 campaign record.', 'The packet lacks an exact KBA or Opel campaign document.', 'The frozen indexed years conflict with its stated production end.'],
    conflict: 'The page may describe a real recall, but its 2019 indexed scope, counts, mechanism and remedy are unsupported by primary campaign evidence in the packet.',
    summary: 'Held the fuel-line recall identity because the frozen year scope conflicts with its own body and exact campaign evidence is missing.',
    citations: ['datasets', 'vauxhallRecallCheck'],
    commerceDecision: 'fuel-safety recall status and VIN eligibility govern all work; no universal retail part',
  }),
  [ids.parkingBrake]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed corpus establishes a 2009-2017 electric-parking-brake actuator/control-module failure population, a 48,000-km onset or repeated actuator failures. The frozen page groups switch, cable, actuator motor, control electronics and service-mode damage, then assigns GM part 13582928 and dealer prices without VIN applicability.',
    solution: 'If the parking brake will not hold or release, secure the vehicle and do not rely on the system. Record messages and DTCs and diagnose switch input, cables, rear brake hardware, power/grounds, actuator and control module separately. Use the exact service mode before rear brake work. Do not attempt roadside manual release without service guidance. Do not buy part 13582928, a switch, cable or actuator from this page; the failed path, coding and VIN fitment must be established first.',
    symptoms: ['hold and release failure distinguished', 'switch, cable and actuator paths tested separately', 'service mode verified before brake work'],
    systems: ['electric parking-brake switch and control', 'central actuator and cables', 'rear brake hardware'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'Forum cases do not establish a model-wide failure population.', 'The frozen part number, mileage and costs lack exact VIN evidence.'],
    conflict: 'The indexed identity groups several electrical, mechanical and service-induced paths and promotes an unverified part number.',
    summary: 'Held the conflated parking-brake identity and removed part-number, price and roadside-release advice.',
  }),
  [ids.infotainment]: held({
    description: 'No exact Opel/Vauxhall communication in the reviewed primary corpus establishes one 2012-2022 Navi 900/IntelliLink display-failure population across Insignia A and B. The frozen page groups freezing, black screen, reboot loops, U150F, touch-layer failure, camera-independent audio loss and connector faults, then uses third-party repair-shop offerings as evidence of defect volume.',
    solution: 'Record display, audio, controls, camera, software version, battery voltage and DTCs; distinguish temporary software behavior from display, touch, power, connector, network and head-unit hardware faults. Follow exact owner-manual restart and VIN-specific update guidance. Do not disconnect the battery or send the unit for board repair from this page. Do not buy a display or head unit here; generation, diagnosis, programming and theft/security requirements must be established first.',
    symptoms: ['Insignia A and B systems kept separate', 'display, touch, audio and network functions tested independently', 'software version, battery state and DTCs recorded'],
    systems: ['Navi 900/IntelliLink display and head unit', 'touch, audio and vehicle networks', 'power, connectors and programming'],
    evidence: ['The 62-row NHTSA Insignia communication corpus contains no record supporting this frozen identity.', 'Third-party repair services are commerce, not defect-volume evidence.', 'No exact source supports one eleven-year cross-generation population or universal board repair.'],
    conflict: 'The indexed identity merges two generations and multiple electronic failure paths and cites repair commerce as prevalence evidence.',
    summary: 'Held the cross-generation infotainment identity and removed battery-disconnect, repair-shop and price recommendations.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  vauxhallRecallCheck: { title: 'Vauxhall Official Vehicle Recall Check', type: 'manufacturer', url: 'https://www.vauxhall.co.uk/owners/maintenance-and-repair/vehicle-recall-check.html', contains: 'Check safety recall campaigns for MY vehicle' },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Insignia', slug: 'insignia', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-opel-insignia-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['INSIGNIA'],
  searchTerms: ['EGR cooler', 'coolant', 'AF40', 'transmission', 'flex pipe', 'timing belt', 'water pump', 'Haldex', 'differential', 'fuel line', '20-C-012', 'parking brake', 'Navi 900', 'IntelliLink'],
  relevantDocumentIds, campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 4, '2015-2019': 48, '2020-2024': 10, '2025-2026': 0 },
    totalRows: 62, relevantRowCount: 3, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communication corpus contains 62 OPEL INSIGNIA rows. The three term-matched documents concern manual-transmission operating characteristics and engine/transmission identification, not any frozen defect identity; no recall rows are present.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL INSIGNIA rows; secondary KBA recall reports remain held until exact campaign records are available.',
  },
  content,
  requiredProse: [
    { id: ids.egrCooler, field: 'solution', patterns: ['Retain emissions equipment', 'hydrolock is suspected'] },
    { id: ids.transmission, field: 'description', patterns: ['JWS3309/Dexron-VI compatibility claim', 'combines harsh shifts, lock-up shudder and delayed engagement'] },
    { id: ids.flexPipe, field: 'solution', patterns: ['exhaust fumes in the cabin as urgent', 'legal repair method'] },
    { id: ids.timingBelt, field: 'description', patterns: ['universal early 90,000-100,000-km/six-year remedy', 'water-pump seizure as the common trigger'] },
    { id: ids.awd, field: 'description', patterns: ['retail seal listing', 'goodwill outcomes'] },
    { id: ids.fuelRecall, field: 'description', patterns: ['indexed years include 2019', 'built through November 2018'] },
    { id: ids.parkingBrake, field: 'solution', patterns: ['Do not buy part 13582928', 'Do not attempt roadside manual release'] },
    { id: ids.infotainment, field: 'description', patterns: ['across Insignia A and B', 'repair-shop offerings as evidence'] },
  ],
  observations: [
    { code: 'all-eight-held', severity: 'identity-safety', recordIds: allIds, detail: 'All eight Insignia pages remain published, but every identity exceeds exact evidence or merges distinct paths.' },
    { code: 'three-false-positive-source-matches', severity: 'source-integrity', recordIds: [ids.transmission], detail: 'NHTSA has 62 OPEL INSIGNIA communications; three term matches are manual operating-characteristic or identification documents and do not support AF40 defect claims.' },
    { code: 'egr-cross-model-transfer', severity: 'technical-accuracy', recordIds: [ids.egrCooler], detail: 'Astra/Zafira/Cascada engine sharing does not establish one Insignia EGR-cooler defect.' },
    { code: 'af40-fluid-compatibility-unverified', severity: 'safety-accuracy', recordIds: [ids.transmission], detail: 'JWS3309/Dexron-VI compatibility and a universal 60,000-km service interval are not verified.' },
    { code: 'flexpipe-fume-safety', severity: 'safety-accuracy', recordIds: [ids.flexPipe], detail: 'Cabin fumes are treated as urgent and a weld-in section is not prescribed without legal/fitment review.' },
    { code: 'timing-belt-anecdote-overreach', severity: 'technical-accuracy', recordIds: [ids.timingBelt], detail: 'Forum failures do not establish universal premature failure, water-pump causation or shortened interval.' },
    { code: 'haldex-commerce-as-evidence', severity: 'source-integrity', recordIds: [ids.awd], detail: 'A retail seal listing and forum consensus cannot prove failure prevalence, fitment or maintenance interval.' },
    { code: 'fuel-recall-year-conflict', severity: 'identity-safety', recordIds: [ids.fuelRecall], detail: 'The frozen years include 2019 while the body says production ended in November 2018.' },
    { code: 'fuel-recall-primary-missing', severity: 'source-integrity', recordIds: [ids.fuelRecall], detail: '20-C-012 is not supported by an exact campaign document in the packet.' },
    { code: 'epb-part-number-unverified', severity: 'commerce-safety', recordIds: [ids.parkingBrake], detail: 'GM 13582928 is not proven across the indexed population and is removed as shopping advice.' },
    { code: 'infotainment-two-generations-merged', severity: 'technical-accuracy', recordIds: [ids.infotainment], detail: 'Insignia A and B systems and multiple failure paths are merged across eleven years.' },
    { code: 'repair-commerce-not-prevalence', severity: 'source-integrity', recordIds: [ids.infotainment], detail: 'Third-party board-repair offerings are not evidence that the issue is common.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: allIds, detail: 'Every solution has a do-not-buy boundary and no retail commerce is introduced.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'All counts are unknown zero and no 0+ owner language is introduced.' },
    { code: 'all-insignia-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Insignia URL, title, vehicle scope, category, severity or published status changes.' },
  ],
});
