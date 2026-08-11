/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  turbo: 'renault-megane-1-5-dci-turbocharger-failure-from-oil-starvation',
  edc: 'renault-megane-edc-dual-clutch-gearbox-judder-clutch-pack-wear-mechatronic',
  fuelRecall: 'renault-megane-fuel-supply-hose-leak-official-uk-recall-r-2020-189',
  injectionWarning: 'renault-megane-injection-fault',
  keycardUch: 'renault-megane-keycard-card-not-detected-uch-body-control-module-failures',
  rearCaliper: 'renault-megane-rear-caliper-handbrake-mechanism-seizure-handbrake-won-t-hol',
  timingBelt: 'renault-megane-timing-belt',
  windowRegulator: 'renault-megane-window-regulator',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.injectionWarning, ids.timingBelt, ids.windowRegulator].sort());

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
  [ids.turbo]: held({
    description: 'The frozen page applies a single oil-starvation turbocharger-failure identity to K9K-powered Mégane II and III vehicles from 2003-2015. It asserts blocked feed pipes and sump pickup from long oil intervals, an EGR-to-bearing-failure path, debris ingestion and a mandatory replacement bundle plus 10,000 km oil interval. Forum, repair and advice pages do not establish that thirteen-year population or one common root cause.',
    solution: 'Stop for runaway, heavy smoke, low oil pressure or sudden power loss. Verify oil level/pressure and engine condition, inspect intake and exhaust oil, boost control, crankcase ventilation and turbo shaft condition, and determine whether any compressor debris entered the engine. If a turbo failed, identify and correct its measured lubrication, contamination or control cause under engine-specific Renault instructions. Do not buy a turbocharger, feed pipe or oil kit from this page; failure cause, engine damage and VIN fitment must be established first.',
    symptoms: ['oil pressure and level verified', 'boost, smoke and shaft condition diagnosed', 'engine ingestion and lubrication cause assessed'],
    systems: ['turbocharger and boost control', 'engine lubrication supply and return', 'intake, crankcase ventilation and exhaust'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'Secondary cases do not establish one K9K failure mechanism over thirteen years.', 'The EGR causation, mandatory parts bundle and 10,000 km interval lack exact Renault evidence.'],
    conflict: 'The indexed identity turns varied turbo failures into one long-window oil-starvation mechanism and universal repair package.',
    summary: 'Held the K9K turbo identity and replaced universal root-cause, interval and replacement claims with measured lubrication and ingestion diagnosis.',
  }),
  [ids.edc]: held({
    description: 'The frozen page combines six- and seven-speed EDC units across Mégane III and IV from 2011-2022, then assigns dry-clutch wear, mechatronic restriction, TCU faults, 50,000-75,000-mile onset, dealer acknowledgement, goodwill and repair prices to one population. Later EDC applications can use a different clutch architecture, so the frozen dry-clutch mechanism cannot be extrapolated across all listed vehicles.',
    solution: 'Identify the gearbox and clutch architecture by VIN, preserve DTCs and adaptation values, reproduce the complaint, and test battery voltage, mounts, clutch state, actuators/mechatronics, temperature protection and software under the exact Renault procedure. Apply adaptation, fluid or software work only when specified for that unit. Do not buy a clutch pack, TCU, mechatronic unit or fluid from this page; gearbox identity, failed path and VIN fitment must be established first.',
    symptoms: ['gearbox and clutch architecture identified', 'faults and adaptation values preserved', 'clutch, control, mechatronic and mount paths separated'],
    systems: ['EDC clutch and ratio hardware', 'mechatronic actuators and TCU', 'driveline mounts and thermal protection'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'The frozen years cover distinct EDC units and clutch architectures.', 'Secondary cases do not establish the mileage, goodwill, acknowledgement or price claims.'],
    conflict: 'The indexed identity merges incompatible EDC architectures and generations under one dry-clutch mechanism.',
    summary: 'Held the cross-generation EDC identity and replaced dry-clutch, mileage, goodwill and price certainty with gearbox-specific diagnosis.',
  }),
  [ids.fuelRecall]: held({
    description: 'Secondary UK recall indexes identify R/2020/189 for a bounded Mégane IV fuel-supply-hose condition, but the exact DVSA campaign row was not captured in the reviewed packet. The frozen page asserts September 2018-May 2019 production, internal hose degradation, hot-exhaust and roadway risks and universal pipe replacement. Model year alone cannot establish VIN eligibility or every frozen mechanism detail.',
    solution: 'Treat fuel odor, staining or leakage as a stop-driving condition; shut down away from ignition sources and arrange recovery. Check the registration/VIN with DVSA and Renault and have the dealer confirm R/2020/189 eligibility and the prescribed repair. Do not buy or fit a fuel hose from this page; campaign status, engine/fuel system, leak source and VIN-specific remedy must be confirmed first.',
    symptoms: ['DVSA and Renault recall status checked', 'fuel odor or leakage treated as stop-driving', 'leak source and campaign repair confirmed by VIN'],
    systems: ['fuel supply hose and connections', 'engine-bay fire safety', 'vehicle recall eligibility'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'DVSA and Renault provide official recall-check routes.', 'The exact R/2020/189 primary row and frozen build-window detail were not captured for this packet.'],
    conflict: 'The indexed identity embeds precise campaign scope and mechanism from secondary indexes without a retrieved primary row.',
    summary: 'Held the R/2020/189 identity and preserved fuel-leak stop-driving and VIN-verification guidance without restating unverified detail.',
  }),
  [ids.injectionWarning]: held({
    description: '“Injection Fault” is a generic Renault warning rather than a component diagnosis. The frozen page applies it across 2003-2023, 1.5 dCi and 1.6 K4M engines and three trims, assigns 110 owner reports, and names crankshaft sensor, throttle body and fuel-pressure regulator as common causes using only a forum home page. The engines, fuel systems and warning logic differ materially.',
    solution: 'Record the exact warning, DTCs, freeze-frame and starting/running conditions, then follow engine-specific testing of power/grounds, crank/cam signals, air/throttle control, low- and high-pressure fuel systems, injectors, ignition and compression. Do not clear codes before capture or replace a component from the warning alone. Do not buy a crankshaft sensor, throttle body, regulator or injector from this page; failed path, engine code and VIN fitment must be established first.',
    symptoms: ['exact warning, DTCs and freeze-frame captured', 'diesel and petrol fuel paths kept separate', 'signals, air, fuel, ignition and compression tested by engine'],
    systems: ['engine management and power supply', 'fuel pressure and injection', 'air/throttle, ignition and engine position sensing'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'A generic warning does not identify a failed component.', 'The forum home page does not support twenty-one years, the cause list or 110-owner total.'],
    conflict: 'The indexed identity converts a warning message into a cross-engine defect and parts list under unsupported social proof.',
    summary: 'Held the generic injection-warning identity and reduced the unsupported 110-owner total to unknown while requiring code-led diagnosis.',
  }),
  [ids.keycardUch]: held({
    description: 'The frozen Mégane II page combines keycard transponder-coil damage, reader contacts, UCH relays and solder joints into one notorious 2003-2009 identity, then attributes starting, locking, wiper, indicator and lighting faults to those paths and gives mail-order repair prices. Forum, locksmith and repair-service pages do not establish one manufacturer-defined population or mechanism.',
    solution: 'Compare a known-good registered card, verify card and vehicle battery condition, record immobilizer/UCH DTCs and live card-detection data, and test reader, antennas, power, grounds, water ingress and vehicle network before programming or opening modules. Preserve every working key and configuration. Do not buy or repair a keycard, reader or UCH from this page; failed path, region, security coding and VIN fitment must be established first.',
    symptoms: ['registered spare card compared', 'card detection and UCH data recorded', 'reader, network, power and water paths separated'],
    systems: ['keycard and reader', 'UCH body controller and relays', 'immobilizer, network, locking, wipers and lighting'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'Locksmith and repair-service pages do not prove a seven-year defect population.', 'Keycard, reader, power/network and UCH failures are distinct identities.'],
    conflict: 'The indexed identity combines security and multi-system body-electrical faults into one component narrative.',
    summary: 'Held the keycard/UCH identity and replaced solder/relay and price certainty with secure power, network and card-path diagnosis.',
  }),
  [ids.rearCaliper]: held({
    description: 'Owner discussions describe individual Mégane II parking-brake and rear-caliper cases, but the frozen 2003-2009 page asserts a recurring caliper-lever and internal-mechanism seizure caused by coating and water ingress, a common UK MOT failure and rollaway risk. Cable, lever, caliper piston, slider, pad/disc and adjustment faults are separate paths, and no exact Renault source establishes the population or mechanism.',
    solution: 'Do not rely on a parking brake that will not hold or drive with a binding/hot rear brake. Chock or secure the vehicle safely, compare brake force and temperature side-to-side, and inspect cables, lever return, caliper piston, sliders, pads/discs and adjustment under the exact brake system procedure. Do not buy cables, calipers or pad/disc parts from this page; failed path, side, brake package and VIN fitment must be established first.',
    symptoms: ['parking-hold force and imbalance measured', 'binding temperature compared side-to-side', 'cable, lever, caliper and friction paths inspected separately'],
    systems: ['parking-brake cables and levers', 'rear calipers, pistons and sliders', 'rear pads, discs and vehicle securing'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'Forum cases do not prove a seven-year recurring defect.', 'The coating, water-ingress and MOT-frequency claims lack exact Renault evidence.'],
    conflict: 'The indexed identity merges several rear-brake paths and a prevalence claim into one caliper defect.',
    summary: 'Held the rear-caliper identity and replaced free-off/replace certainty with parking safety and measured path diagnosis.',
  }),
  [ids.timingBelt]: held({
    description: 'The frozen title identifies a K9K 1.5 dCi fuel-pump-pulley timing-belt condition, but the frozen engine metadata also includes K4M 1.6 and F4R 2.0 petrol engines. It spans 2003-2016, cites only a forum home page, claims TSB 04-040, a revised pulley, €400-€8,000 costs, 60,000-mile interval and 90 owner reports. No retrieved Renault document supports that scope or bulletin identity.',
    solution: 'Verify the engine code, belt architecture, official Renault interval and service history, then inspect belt tracking, pulley alignment, tensioner/idler condition, oil/coolant contamination and abnormal noise under the exact engine procedure. Stop for belt damage or tracking loss. Do not buy a belt, pulley, tensioner, seal or water pump from this page; engine identity, measured defect, interval and VIN fitment must be established first.',
    symptoms: ['engine code and belt architecture verified', 'belt tracking and pulley alignment inspected', 'oil/coolant contamination and official interval checked'],
    systems: ['timing belt and pulley alignment', 'tensioner, idlers and engine timing', 'seals and water pump where applicable'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'The frozen engine metadata conflicts with the K9K-only title.', 'TSB 04-040, costs, 60,000-mile interval and 90-owner total lack a retrieved exact source.'],
    conflict: 'The indexed identity claims one K9K mechanism while its frozen engine list includes unrelated petrol engines.',
    summary: 'Held the timing-belt identity, surfaced the title/engine conflict and reduced the unsupported 90-owner total to unknown.',
  }),
  [ids.windowRegulator]: held({
    description: 'The frozen page labels Mégane II and III regulator failure notorious across 2003-2016, claims cable/pulley snapping or motor burnout, front-driver concentration, 140 owner reports and improved aftermarket routing, while citing only a forum home page. Door, body style, regulator design, motor/module and anti-pinch systems vary across the two generations.',
    solution: 'Secure unsupported glass and keep hands clear. Verify the exact door/body, switch command, fuse, power/ground, wiring and anti-pinch initialization, then inspect cable, guides, glass alignment and motor separately under side-airbag precautions. Do not buy an aftermarket regulator, motor or cable kit from this page; failed component, door configuration, connector and VIN fitment must be established first.',
    symptoms: ['glass secured before diagnosis', 'switch, power, wiring and initialization tested', 'cable, guides, alignment and motor inspected separately'],
    systems: ['window regulator and guides', 'motor, switch and door wiring', 'glass, anti-pinch and side-airbag area'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane rows.', 'A forum home page does not prove a fourteen-year two-generation population.', 'The 140-owner total, driver-door concentration and improved-aftermarket claim lack evidence.'],
    conflict: 'The indexed identity combines two generations and multiple window paths under unsupported social proof and product advice.',
    summary: 'Held the regulator identity and reduced the unsupported 140-owner total to unknown while removing aftermarket-quality assumptions.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  dvsaRecallCheck: { title: 'DVSA Vehicle Safety Recall Checker', type: 'regulator', url: 'https://www.check-vehicle-recalls.service.gov.uk/', contains: 'Vehicle safety recalls' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Megane', slug: 'megane', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-megane-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['MEGANE', 'MEGANE II', 'MEGANE III', 'MEGANE IV'],
  searchTerms: ['turbo', 'oil starvation', 'EDC', 'fuel hose', 'injection fault', 'keycard', 'UCH', 'rear caliper', 'timing belt', 'window regulator'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT MEGANE variants; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT MEGANE variants; owners must use DVSA and Renault recall checkers for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.edc, field: 'description', patterns: ['six- and seven-speed EDC units', 'different clutch architecture'] },
    { id: ids.timingBelt, field: 'description', patterns: ['engine metadata also includes K4M 1.6 and F4R 2.0', 'TSB 04-040'] },
    { id: ids.injectionWarning, field: 'description', patterns: ['generic Renault warning', '110 owner reports'] },
    { id: ids.windowRegulator, field: 'description', patterns: ['140 owner reports', 'improved aftermarket routing'] },
  ],
  observations: [
    { code: 'all-eight-held', severity: 'identity-safety', recordIds: allIds, detail: 'All eight Megane pages remain published but exceed exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT MEGANE variant rows; the geographic limitation is explicit.' },
    { code: 'edc-architecture-conflation', severity: 'technical-accuracy', recordIds: [ids.edc], detail: 'Six- and seven-speed EDC applications are not treated as one dry-clutch mechanism.' },
    { code: 'timing-title-engine-conflict', severity: 'identity-safety', recordIds: [ids.timingBelt], detail: 'The K9K title conflicts with frozen K4M/F4R petrol engine metadata; identity remains held.' },
    { code: 'generic-warning-not-part', severity: 'technical-accuracy', recordIds: [ids.injectionWarning], detail: 'Injection Fault is a warning, not a component diagnosis.' },
    { code: 'fuel-recall-primary-row-gap', severity: 'source-integrity', recordIds: [ids.fuelRecall], detail: 'R/2020/189 remains held until an exact DVSA/Renault campaign row is captured.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 110, 90 and 140 owner totals are reduced to unknown.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
