/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  valveCotter: 'renault-clio-1-2-petrol-valve-cotter-defect-engine-destruction',
  egr: 'renault-clio-1-5-dci-egr-valve-sticking-clogging',
  fuelInjection: 'renault-clio-1-5-dci-fuel-injector-injection-pump-failure',
  edc: 'renault-clio-edc-dual-clutch-gearbox-judder-tcu-faults-clutch-failure',
  eps: 'renault-clio-electric-power-steering-column-failure',
  gearboxBearing: 'renault-clio-gearbox-bearing',
  ignitionCoil: 'renault-clio-ignition-coil-failure',
  keycard: 'renault-clio-keycard-not-detected-card-reader-failure',
  turboCoolant: 'renault-clio-tce-turbo-coolant-leak',
  timingBelt: 'renault-clio-timing-belt-tensioner',
});

const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.gearboxBearing, ids.ignitionCoil, ids.turboCoolant, ids.timingBelt].sort());

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
  [ids.valveCotter]: held({
    description: 'UK recall aggregators identify DVSA campaign R/2011/118 for a bounded Clio valve-cotter condition, but the frozen page indexes both 2010 and 2011 model years while asserting exact September-November 2010 production dates, 3,308 affected UK cars, no warning and inevitable engine destruction. The exact DVSA row was not recovered in the reviewed primary files, and a recall publication year is not proof of a 2011 vehicle population.',
    solution: 'Treat sudden internal engine noise, stalling or compression loss as a stop-driving condition and arrange recovery. Check the registration and VIN through DVSA and Renault, and have Renault confirm whether R/2011/118 or another campaign applies before any engine work. Do not buy valve cotters, cylinder-head parts or a replacement engine from this page; campaign eligibility, engine damage and VIN-specific remedy must be confirmed first.',
    symptoms: ['VIN and registration recall status checked', 'engine stopped after sudden internal noise or stall', 'compression and valve-train damage assessed before repair'],
    systems: ['valve cotters and valve train', 'cylinder head and combustion chamber', 'engine recall eligibility'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'DVSA and Renault provide official recall-check paths.', 'The exact frozen build range, population count and 2011 indexed year were not verified from a retrieved primary campaign row.'],
    conflict: 'The indexed identity embeds an additional model year and precise campaign facts beyond the recovered primary evidence.',
    summary: 'Held the valve-cotter recall identity and required DVSA/Renault VIN confirmation without repeating unverified population or inevitability claims.',
  }),
  [ids.egr]: held({
    description: 'A component-maker guide and owner discussions describe individual Clio 1.5 dCi EGR faults, but the frozen page promotes them into a 2005-2012 population, a common soot mechanism, a P2413 expectation and a causal link from a stuck-closed EGR valve to turbo-bearing failure. No exact Renault communication or regulator record reviewed here proves that combined identity or recurrence.',
    solution: 'Capture DTCs and freeze-frame data, compare commanded and measured EGR/airflow, inspect wiring, vacuum control where fitted, intake restriction and boost operation, and remove the valve only under engine-code-specific procedures. Cleaning is appropriate only after the fault path and component condition are established. Do not buy an EGR valve, housing, sensor or turbocharger from this page; diagnosis, emissions generation and VIN fitment must be established first.',
    symptoms: ['EGR command and airflow data compared', 'wiring, vacuum and intake paths checked', 'boost and exhaust symptoms diagnosed separately'],
    systems: ['EGR valve and position feedback', 'airflow, intake and vacuum control', 'turbocharger and emissions management'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'Secondary repair guidance does not establish an eight-year defect population.', 'The frozen turbo-damage link and recurrence claim lack exact Renault evidence.'],
    conflict: 'The indexed identity turns repair guidance and anecdotes into a broad defect and consequential-failure mechanism.',
    summary: 'Held the EGR identity and replaced population and turbo-causation certainty with code- and airflow-led diagnosis.',
  }),
  [ids.fuelInjection]: held({
    description: 'The frozen page extrapolates one reported 2007 pump-debris case and forum no-start discussions into a 2005-2012 K9K injector-and-pump defect in which pump wear or contamination typically requires replacement of the pump, rail and all four injectors. Those are distinct failure paths; no exact Renault primary source reviewed here proves the population, sequence, quoted cost or universal system replacement.',
    solution: 'Use clean-sample and pressure-control testing to separate low-pressure supply, filter restriction, rail-pressure sensing/control, injector leak-off and high-pressure pump wear. If metallic contamination is confirmed, document its extent and follow engine- and fuel-system-specific Renault decontamination procedures; code replacement injectors only where required. Do not buy injectors, a pump, rail or filter from this page; contamination, failed component and VIN fitment must be established first.',
    symptoms: ['rail-pressure target and actual recorded', 'injector leak-off and low-pressure supply tested', 'fuel sample checked for water and metallic debris'],
    systems: ['common-rail injectors', 'high-pressure pump and rail control', 'tank supply, filtration and fuel contamination'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'A single reported pump-debris case does not prove an eight-year model population.', 'Forum repairs do not establish universal pump, rail and four-injector replacement.'],
    conflict: 'The indexed identity combines injector, pump and contamination failures and treats one expensive repair path as typical.',
    summary: 'Held the combined K9K fuel-system identity and separated pressure, injector and contamination diagnosis before system replacement.',
  }),
  [ids.edc]: held({
    description: 'Secondary gearbox-repair and forum cases describe Clio IV EDC symptoms, but the frozen page combines judder, shift quality, overheating, TCU software/module faults, actuator delay and clutch wear into one 2013-2019 defect. Comparisons to unrelated DSG/PowerShift applications, a single quoted clutch price and assertions about Renault goodwill do not establish a manufacturer-defined population or one repair sequence.',
    solution: 'Identify the exact EDC gearbox and software by VIN, preserve faults and adaptation values, reproduce the complaint, and inspect battery voltage, mounts, clutch condition, actuator/mechatronic operation and cooling limits using Renault procedures. Apply software or adaptation work only when specified for that unit. Do not buy a clutch pack, TCU, actuator or mechatronic unit from this page; failed path, calibration and VIN fitment must be established first.',
    symptoms: ['gearbox and software identity recorded', 'faults and adaptation values preserved', 'clutch, actuator, control and mount paths separated'],
    systems: ['EDC dry-clutch assembly', 'transmission control and actuators', 'driveline mounts and thermal protection'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'Repair-shop and forum cases do not establish a seven-year defect population.', 'The frozen goodwill, price and cross-brand family claims are not exact Renault evidence.'],
    conflict: 'The indexed identity merges several diagnostic paths and secondary cost/policy claims under one defect.',
    summary: 'Held the broad Clio IV EDC identity and removed cross-brand, price and goodwill certainty while preserving gearbox-specific diagnosis.',
  }),
  [ids.eps]: held({
    description: 'The frozen page combines Clio III 2005-2012 steering complaints with a separate Clio V 2019-build recall and indexes 2019-2020 as though both generations share one EPS-column failure. It further asserts common ground faults, internal motor/controller failure, C1608, one-direction behavior and repair prices. No exact primary source reviewed here supports that combined population or mechanism.',
    solution: 'Treat sudden loss of assistance as safety-critical, reduce speed smoothly and stop when safe. Record warnings and DTCs, verify battery voltage, EPS power, grounds, connectors and network communication, then test torque/position sensing and motor control under the exact steering-column procedure. Check Clio V recall status by VIN. Do not buy or code an EPS column, motor or control unit from this page; generation, failed path and VIN fitment must be established first.',
    symptoms: ['steering warning and DTCs recorded', 'power, grounds and network checked', 'Clio III diagnosis separated from Clio V recall status'],
    systems: ['electric steering column and motor', 'torque sensing and EPS controller', 'power supply, grounds and vehicle network'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'Secondary specialist material does not prove a Clio III model-wide rate.', 'The Clio V recall is a separate bounded identity and cannot prove Clio III failures.'],
    conflict: 'The indexed identity joins two generations and a bounded recall into one ten-year steering-column defect.',
    summary: 'Held the cross-generation EPS identity and separated Clio III diagnosis from Clio V VIN recall verification.',
  }),
  [ids.gearboxBearing]: held({
    description: 'The frozen page applies differential-bearing failure from inadequate lubrication to JH3 and JR5 manual gearboxes across 2005-2019 and assigns 1.2 D4F, 1.5 dCi, 1.6 K4M and RS fitment. It cites only a forum home page, supplies an unsupported 85-owner total and recommends generic GL-5 75W-80 oil even though lubricant specification is gearbox-specific and must not be inferred from viscosity alone.',
    solution: 'Identify the gearbox code, road-test noise by gear, load and coast condition, inspect wheel bearings and final-drive play, and examine drained oil for debris before opening the transmission. Use only the exact Renault-approved lubricant and level for that gearbox. Do not buy differential bearings, gears or oil from this page; noise source, gearbox code, internal damage and VIN fitment must be established first.',
    symptoms: ['gearbox code and lubricant specification verified', 'wheel-bearing and driveline noise excluded', 'oil debris and differential play assessed'],
    systems: ['manual gearbox bearings', 'differential and final drive', 'wheel bearings, lubricant and driveline'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'A forum home page does not prove the fifteen-year population or inadequate-lubrication cause.', 'The 85-owner total and generic GL-5 recommendation lack traceable evidence.'],
    conflict: 'The indexed identity spans multiple gearboxes and engines with unsupported social proof, mechanism and lubricant advice.',
    summary: 'Held the broad gearbox-bearing identity, removed generic GL-5 advice and reduced the unsupported 85-owner total to unknown.',
  }),
  [ids.ignitionCoil]: held({
    description: 'The frozen page assigns heat-cycle and moisture-driven premature coil failure to three petrol engine families across 2000-2012, cites only a forum home page and claims 130 owner reports. It recommends replacing every coil with Sagem units without exact engine architecture, diagnostic evidence or a Renault source; some applications use different coil arrangements, and misfire has fuel, compression, wiring and contamination causes.',
    solution: 'Record DTCs and misfire counters, inspect plugs, boots and wells, test coil power/ground and command, and separate spark, injector and compression faults before replacement. Stop if a severe misfire risks catalyst overheating. Do not buy one coil, a full set or spark plugs from this page; engine architecture, failed cylinder path and VIN fitment must be established first.',
    symptoms: ['misfire counters and operating conditions recorded', 'plug, coil, fuel and compression paths separated', 'catalyst-overheat risk assessed'],
    systems: ['ignition coils and spark plugs', 'injectors and engine wiring', 'compression and catalyst protection'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'A forum home page does not prove thirteen years or three engine populations.', 'The 130-owner total, all-coil replacement and Sagem recommendation lack exact evidence.'],
    conflict: 'The indexed identity combines different ignition architectures with unsupported social proof and brand advice.',
    summary: 'Held the ignition-coil identity, removed Sagem/all-coil advice and reduced the unsupported 130-owner total to unknown.',
  }),
  [ids.keycard]: held({
    description: 'Locksmith and forum pages describe individual Clio keycard cases, but the frozen page applies a 2005-2019 identity to Clio III and IV while combining battery, bent-card chip, card-reader and antenna faults. It also asserts common 3- and 4-button chip failure and dealer pricing. Those paths require separate diagnosis and no exact Renault communication reviewed here establishes the population or mechanism.',
    solution: 'Try the approved spare card, verify the correct card battery and contacts, record immobilizer/body-controller DTCs and live card-detection status, and test receiver, reader, antennas, vehicle battery and network before programming parts. Preserve every working key during coding. Do not buy a keycard, reader or antenna from this page; failed path, region, security coding and VIN fitment must be established first.',
    symptoms: ['approved spare card compared', 'card detection and immobilizer data recorded', 'reader, antenna, vehicle power and network paths separated'],
    systems: ['keycard and transponder', 'reader, antennas and receiver', 'immobilizer and body-control network'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'Locksmith marketing and forum cases do not prove a fifteen-year defect population.', 'The frozen chip-failure, pricing and component-frequency claims lack Renault primary support.'],
    conflict: 'The indexed identity merges several security-system faults and generations into a common failure claim.',
    summary: 'Held the keycard/reader identity and replaced parts-first and price claims with security-system diagnosis and coding safeguards.',
  }),
  [ids.turboCoolant]: held({
    description: 'The frozen page attributes coolant leakage from turbocharger lines and thermostat housings to brittle plastic connectors across 0.9, 1.0 and 1.3 TCe engines from 2012-2026. Those engines, cooling layouts and fittings differ; the only citation is a forum home page, and the 60-owner total, updated-metal-fitting remedy and universal root cause have no traceable primary evidence.',
    solution: 'Stop for overheating or rapid coolant loss. Pressure-test the cold system, inspect reservoir, cap, hoses, water pump, thermostat housing, turbocharger cooling circuits where fitted, heater and radiator, and identify the exact leak before repair. Refill and bleed only to the engine-specific procedure. Do not buy turbo coolant lines, fittings or a thermostat housing from this page; leak source, engine code and VIN fitment must be established first.',
    symptoms: ['cooling system pressure-tested cold', 'all external leak paths inspected separately', 'engine-specific refill and bleed procedure identified'],
    systems: ['engine cooling circuit', 'thermostat housing and hose connections', 'turbocharger cooling where equipped'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'The frozen engines do not share one universal cooling layout.', 'The forum home page does not support the fifteen-year scope, 60-owner total or metal-fitting claim.'],
    conflict: 'The indexed identity combines three engine families, several leak paths and unsupported social proof.',
    summary: 'Held the all-generation coolant-leak identity and reduced the unsupported 60-owner total to unknown while requiring leak localization.',
  }),
  [ids.timingBelt]: held({
    description: 'The frozen page applies premature tensioner and water-pump failure to D4F, K4J and K4M engines across 2000-2015, cites only a forum home page and claims 100 owner reports. It presents 72,000 miles or five years and mandatory water-pump replacement as one universal Renault interval, although service intervals, belt drives and pump relationships vary by engine, market and production date.',
    solution: 'Verify the engine code, belt history and current Renault interval, then inspect noise, leakage and belt-path condition without removing guards while running unless the procedure permits it. Stop for belt damage, coolant contamination or abnormal tensioner/pump noise. When service or diagnosis requires replacement, follow the exact engine timing, fastener and bleeding procedure. Do not buy a belt kit, tensioner, idler or water pump from this page; interval, architecture and VIN fitment must be established first.',
    symptoms: ['engine code and official interval verified', 'belt-path noise and leakage localized safely', 'timing and cooling procedures identified before service'],
    systems: ['timing belt and tensioner', 'idler and engine timing', 'water pump and cooling circuit where belt-driven'],
    evidence: ['The complete NHTSA corpus contains zero Renault Clio rows.', 'A forum home page does not prove a sixteen-year premature-failure population.', 'The 100-owner total and one 72,000-mile/five-year interval lack engine-specific evidence.'],
    conflict: 'The indexed identity combines three engines and sixteen years under unsupported failure, interval and social-proof claims.',
    summary: 'Held the timing-belt/tensioner identity, removed the universal interval and reduced the unsupported 100-owner total to unknown.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  dvsaRecallCheck: { title: 'DVSA Vehicle Safety Recall Checker', type: 'regulator', url: 'https://www.check-vehicle-recalls.service.gov.uk/', contains: 'Vehicle safety recalls' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault',
  model: 'Clio',
  slug: 'clio',
  reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-clio-adjudication-2026-08-11.json',
  ids,
  allIds,
  retainedIds,
  reportCountCleanupIds,
  sourceMakes: ['RENAULT'],
  modelAliases: ['CLIO'],
  searchTerms: ['valve cotter', 'EGR', 'injector', 'injection pump', 'EDC', 'steering', 'gearbox bearing', 'ignition coil', 'keycard', 'coolant', 'timing belt'],
  relevantDocumentIds: [],
  campaigns: [],
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0,
    relevantRowCount: 0,
    uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT CLIO rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT CLIO rows; owners must use DVSA and Renault recall checkers for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.valveCotter, field: 'description', patterns: ['R/2011/118', '2011 model years'] },
    { id: ids.eps, field: 'description', patterns: ['Clio III', 'Clio V'] },
    { id: ids.gearboxBearing, field: 'description', patterns: ['GL-5 75W-80', '85-owner total'] },
    { id: ids.ignitionCoil, field: 'description', patterns: ['Sagem units', '130 owner reports'] },
    { id: ids.timingBelt, field: 'description', patterns: ['72,000 miles or five years', '100 owner reports'] },
  ],
  observations: [
    { code: 'all-ten-held', severity: 'identity-safety', recordIds: allIds, detail: 'All ten Clio pages remain published but exceed exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT CLIO rows; the geographic limitation is explicit.' },
    { code: 'recall-year-scope-held', severity: 'source-integrity', recordIds: [ids.valveCotter], detail: 'A recall publication reference does not prove the frozen 2011 vehicle year.' },
    { code: 'cross-generation-eps-split', severity: 'identity-safety', recordIds: [ids.eps], detail: 'Clio III failure claims and the separate bounded Clio V recall remain distinct.' },
    { code: 'gearbox-lubricant-advice-removed', severity: 'technical-accuracy', recordIds: [ids.gearboxBearing], detail: 'Generic GL-5 75W-80 advice is removed in favor of gearbox-specific Renault specification.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 85, 130, 60 and 100 owner totals are reduced to unknown.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
