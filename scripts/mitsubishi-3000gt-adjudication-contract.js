/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  activeExhaust: 'mitsubishi-3000gt-active-exhaust-valve-seizure-cable-rot',
  transferCase: 'mitsubishi-3000gt-awd-transfer-case-oil-leak-leading-to-bearing-failure-drivel',
  ecuCapacitors: 'mitsubishi-3000gt-ecu-electrolytic-capacitor-leakage-causing-stalling-no-start',
  brakeHose: 'mitsubishi-3000gt-front-brake-hose-cracking-full-steering-lock',
  manualSynchro: 'mitsubishi-3000gt-getrag-awd-manual-transmission-synchro-wear-gear-grind',
  lashAdjuster: 'mitsubishi-3000gt-hydraulic-lash-adjuster-lifter-tick-6g72-v6',
  popUpHeadlight: 'mitsubishi-3000gt-pop-up-headlight-motor-etacs-failures',
  timingBelt: 'mitsubishi-3000gt-timing-belt-hydraulic-tensioner-failure-destroying-interfere',
  rearSteering: 'mitsubishi-3000gt-vr-4-4ws-rear-steering-pump-hard-line-leaks',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.transferCase, ids.brakeHose].sort());
const relevantDocumentIds = Object.freeze([
  '10003757', '10152870', '52060', '52608', '54302', '6088726',
  '6088731', '615976', '634695',
]);
const campaigns = Object.freeze([
  '02V143001', '04V428000', '93V033000', '95V103004', '96V143001', '96V143002',
]);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  transferRecall1993: {
    title: 'NHTSA Recall 93V033000 - 1991 3000GT AWD Transfer Case',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=93V033000',
    contains: '93V033000',
  },
  transferRecall2002: {
    title: 'NHTSA Recall 02V143001 - 1991-1999 3000GT Transfer Case',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V143001',
    contains: '02V143001',
  },
  brakeRecall1996: {
    title: 'NHTSA Recall 96V143001 - 1991-1994 3000GT Front Brake Hoses',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=96V143001',
    contains: '96V143001',
  },
});

const content = Object.freeze({
  [ids.activeExhaust]: {
    description: `The reviewed 67-row 3000GT manufacturer-communication corpus contains no communication establishing recurring active-exhaust valve-shaft seizure, D-shaped shaft rounding or actuator-cable rot. It also does not establish that the system ended after the 1994 model year. The frozen page relies on community discussions for those mechanism and population claims, so the indexed identity remains unverified rather than being treated as a model-wide defect.`,
    solution: `First verify the vehicle is a VR-4 equipped with the factory active-exhaust hardware. Record whether the mode switch changes the commanded state, then test the fuse, switch input, actuator output, cable movement and valve movement as separate paths before disturbing the exhaust. Do not buy a cable, actuator, used valve assembly or aftermarket exhaust from this page; the installed system and failed mechanical or electrical path must be proven first.`,
    symptoms: ['factory active-exhaust equipment verified', 'switch command and actuator output tested', 'cable and exhaust-valve movement checked separately'],
    affectedSystems: ['factory active-exhaust mode control', 'actuator and cable path', 'rear exhaust valve assembly'],
    evidence: ['No exact 3000GT manufacturer communication in the reviewed corpus identifies active-exhaust seizure or cable rot.', 'The corpus does not establish the frozen shaft-rounding mechanism or phase-out year.', 'Community procedures are not converted into a universal repair instruction.'],
    conflict: 'The indexed failure mechanism and model-year population are supported only by community material, not exact manufacturer or federal evidence.',
    summary: 'Held the active-exhaust identity and required separate switch, actuator, cable and valve proof before repair or parts.',
    citations: ['datasets'],
  },
  [ids.transferCase]: {
    description: `NHTSA recalls 93V033000 and 02V143001 establish that certain AWD 3000GT transfer cases can leak oil. A low oil level can damage bearings and may result in drivetrain lockup, increasing crash risk. The 1993 campaign addressed certain 1991 VR-4 vehicles; the later campaign covered a broader 1991-1999 population. Coverage and completion must be checked by VIN rather than inferred from model year alone.`,
    solution: `Check the VIN for recall 02V143001 and any earlier transfer-case campaign history. If the recall is open, arrange the manufacturer remedy. Inspect the transfer case for leakage and damage; the federal remedy calls for resealing and refilling a leaking undamaged case, or replacing the case when damage is present. Do not buy seals, bearings, fluid or a replacement transfer case from this page; recall status, installed case identification and inspection findings determine the repair.`,
    symptoms: ['VIN recall status and campaign history checked', 'transfer-case leakage and fluid level documented', 'bearing or gear damage assessed before repair selection'],
    affectedSystems: ['AWD transfer case', 'transfer-case seals and lubricant', 'transfer-case bearings and driveline'],
    evidence: ['Recall 93V033000 establishes oil leakage, bearing damage and possible lockup on certain 1991 VR-4 vehicles.', 'Recall 02V143001 establishes the same safety condition across a broader 1991-1999 population.', 'The federal remedy is inspect, reseal/refill when leaking, or replace when damaged.'],
    conflict: null,
    summary: 'Retained the recall-backed transfer-case identity and made VIN status and damage inspection control the remedy.',
    citations: ['transferRecall1993', 'transferRecall2002', 'datasets'],
  },
  [ids.ecuCapacitors]: {
    description: `The reviewed exact 3000GT manufacturer-communication and recall corpus contains no record establishing 1991-1993 ECU electrolytic-capacitor leakage as a recurring cause of stalling or no-start. It does not substantiate the frozen corrosive-electrolyte mechanism, odor test, three-capacitor count or mandatory preventive recapping instruction. Stalling and no-start have multiple power, sensor, fuel, ignition and control causes that must be separated before assigning the ECU.`,
    solution: `Preserve any diagnostic codes and reproduce the failure while checking battery voltage, ECU powers and grounds, main relay output, crank and cam signals, injector command, ignition output and fuel pressure. If those inputs and outputs isolate the ECU, have the correct unit inspected by a qualified electronics specialist for visible leakage, corrosion and trace damage. Do not buy capacitors, a repair service or a replacement ECU from this page; the failed circuit, ECU part number and repairability must be proven first.`,
    symptoms: ['codes and failure conditions preserved', 'ECU powers, grounds and main-relay output verified', 'crank/cam, fuel and ignition paths tested before ECU assignment'],
    affectedSystems: ['engine control unit and circuit board', 'ECU power, ground and relay supply', 'engine-speed inputs, fuel and ignition outputs'],
    evidence: ['No exact manufacturer communication in the reviewed corpus establishes the frozen capacitor-leak identity.', 'The corpus does not support mandatory preventive recapping or the frozen odor and capacitor-count claims.', 'A control-unit verdict requires power, input and output testing first.'],
    conflict: 'The indexed ECU-capacitor mechanism and preventive remedy lack exact manufacturer or federal support.',
    summary: 'Held the ECU-capacitor identity and required electrical and engine-management isolation before board repair or replacement.',
    citations: ['datasets'],
  },
  [ids.brakeHose]: {
    description: `NHTSA recall 96V143001 establishes that on affected 1991-1994 3000GT vehicles, a front wheel-side brake hose can crack under full-lock steering and full suspension travel, causing brake-fluid leakage. The resulting warning lamp and reduced braking efficiency increase crash risk. Recall inclusion and completion are VIN-specific; vehicle age by itself does not prove the recalled hose remains installed or that all four hoses require replacement.`,
    solution: `Check the VIN for recall 96V143001 and confirm whether the revised front wheel-side hose assemblies were installed. If the campaign is open, arrange the manufacturer remedy. Independently inspect every flexible hose, hard line, fitting and caliper for the actual leak or age damage and restore the hydraulic system using the vehicle-specific service procedure. Do not buy stainless-braided lines or a four-hose kit from this page; recall status, the installed hose and inspection findings determine the repair.`,
    symptoms: ['VIN recall status and completion checked', 'front hoses inspected through steering and suspension travel', 'fluid leak source and hydraulic condition documented'],
    affectedSystems: ['front wheel-side brake hoses', 'brake-fluid hydraulic circuit', 'brake warning and stopping performance'],
    evidence: ['Recall 96V143001 identifies cracking during full-lock/full-travel conditions.', 'The recall consequence is fluid loss and reduced braking efficiency.', 'The manufacturer remedy replaces the left and right front wheel-side hoses with revised assemblies.'],
    conflict: null,
    summary: 'Retained the recall-backed brake-hose identity and made VIN status and direct hydraulic inspection control the repair.',
    citations: ['brakeRecall1996', 'datasets'],
  },
  [ids.manualSynchro]: {
    description: `NHTSA communication 6088726 records manufacturer manual-transmission and transaxle maintenance information for 1994-1999 3000GT vehicles. It does not establish recurring W5MG1 or W6MG1 synchronizer wear, undersized synchronizers, accelerated failure from spirited driving, or one 1991-1999 defect population. The reviewed corpus contains identification and maintenance communications, but no exact manufacturer finding for the frozen gear-grind mechanism.`,
    solution: `Identify the installed transaxle by tag and build data, then record which gear, temperature, engine speed and shift direction reproduce the complaint. Verify clutch release, hydraulic operation, linkage and mounts; inspect the specified lubricant level and condition and document debris before internal diagnosis. Do not buy a synchronizer kit, gears, sliders or a rebuilt transaxle from this page; the installed unit and failed clutch, control, lubricant or internal path must be proven first.`,
    symptoms: ['transaxle tag and build data verified', 'gear, temperature, speed and shift direction recorded', 'clutch, linkage, mount, lubricant and internal paths separated'],
    affectedSystems: ['manual transaxle and synchronizers', 'clutch release and hydraulic actuation', 'shift linkage, mounts and specified lubricant'],
    evidence: ['Communication 6088726 is maintenance information, not a recurring synchro-failure finding.', 'Communication 10003757 concerns five-speed transfer-case identification, not synchronizer wear.', 'No reviewed exact communication supports the frozen mechanism or nine-model-year recurrence claim.'],
    conflict: 'The indexed synchro-wear identity turns maintenance and identification records into a universal failure mechanism.',
    summary: 'Held the manual-synchro identity and required transaxle identification and clutch, control, lubricant and internal diagnosis.',
    citations: ['datasets'],
  },
  [ids.lashAdjuster]: {
    description: `NHTSA manufacturer communication 52060 records new valve-lash-adjuster noise checking and troubleshooting procedures for 1991-1997 3000GT vehicles. That exact record supports a lash-adjuster-noise identity, but it does not establish universal varnish buildup, accelerated cam or rocker damage, a model-wide frequency, or the frozen additive and replacement claims. Noise must be localized and evaluated under the manufacturer procedure before assigning an adjuster.`,
    solution: `Record whether the noise occurs cold, hot or continuously and whether it follows engine speed. Verify oil level, condition and the exact engine oil specification, measure oil pressure when indicated, and localize the noise before following the manufacturer lash-adjuster troubleshooting procedure. Do not buy an oil additive, 24 lash adjusters, big-bore replacements or a solid-lifter conversion from this page; the noise source, engine configuration and failed component must be proven first.`,
    symptoms: ['cold, hot and continuous noise conditions recorded', 'oil level, specification and pressure checked', 'valvetrain noise localized before component assignment'],
    affectedSystems: ['hydraulic valve lash adjusters', 'engine lubrication and oil pressure', 'rocker arms, camshafts and valvetrain'],
    evidence: ['Communication 52060 explicitly covers valve-lash-adjuster noise checking and troubleshooting.', 'The exact communication covers 1991-1997 rather than independently proving every frozen mechanism and remedy.', 'The corpus does not establish the frozen additive regimen, mandatory replacement or universal damage progression.'],
    conflict: 'The exact communication ends with 1997 vehicles, while the frozen indexed population continues through 1999.',
    summary: 'Held the overbroad lash-adjuster-noise identity while removing universal cause, additive and replacement claims.',
    citations: ['datasets'],
  },
  [ids.popUpHeadlight]: {
    description: `The reviewed exact corpus includes manufacturer communication 54302 for revised headlight-aim procedures, but no communication establishing recurring pop-up motor, internal position-switch, fuse, relay or ETACS failure on 1991-1993 3000GT vehicles. Headlight aiming is not evidence of the frozen electrical-failure mechanism, and community troubleshooting is not sufficient to identify which component has failed.`,
    solution: `Reproduce whether one or both lamps fail to raise, lower or illuminate. Using the vehicle wiring diagram, verify fuses, switch inputs, motor power and ground, connector condition, limit or position feedback and control-module output before removing a motor or controller. Use the manual raise provision only according to the owner or service instructions. Do not buy a motor, switch, relay, ETACS module or used assembly from this page; the failed circuit and exact part number must be proven first.`,
    symptoms: ['raise, lower and illumination functions tested separately', 'fuse, switch, power, ground and feedback checked', 'motor circuit separated from control-module output'],
    affectedSystems: ['pop-up headlamp motors and mechanisms', 'lighting switches, fuses and wiring', 'position feedback and body-control output'],
    evidence: ['Communication 54302 concerns headlight aim, not pop-up motor or ETACS failure.', 'No exact reviewed communication establishes the frozen multi-component failure identity.', 'The control path must be tested before assigning a motor or controller.'],
    conflict: 'The indexed page groups several possible lighting-circuit failures without exact defect evidence.',
    summary: 'Held the pop-up-headlight identity and required circuit-level switch, motor, feedback and controller diagnosis.',
    citations: ['datasets'],
  },
  [ids.timingBelt]: {
    description: `The reviewed exact 3000GT manufacturer-communication corpus contains no communication establishing recurring hydraulic-tensioner failure, a 17-valve damage pattern, or one 1991-1999 DOHC timing-belt defect. The frozen page also converts an asserted maintenance interval and community failure examples into a model-wide defect identity. Timing-belt maintenance and a confirmed abnormal timing condition must be distinguished.`,
    solution: `Identify the engine and obtain the applicable manufacturer maintenance schedule and service history. Before operation when history is unknown or symptoms are present, inspect belt condition, tension, timing alignment, hydraulic-tensioner state and oil or coolant contamination using the engine-specific procedure. If timing has slipped or the belt has failed, perform compression and leak-down testing before repair scope is chosen. Do not buy a belt kit, tensioner, water pump, seals or cylinder-head parts from this page; service due status, engine configuration and measured damage must be proven first.`,
    symptoms: ['engine and maintenance history verified', 'belt, tension, alignment and contamination inspected', 'compression and leak-down measured after timing loss'],
    affectedSystems: ['engine timing belt and pulleys', 'hydraulic belt tensioner', 'cam/crank sealing and cylinder-head valvetrain'],
    evidence: ['No exact reviewed communication establishes the frozen recurring tensioner-failure mechanism.', 'The NHTSA corpus does not prove the frozen damage count, cost or universal interval.', 'Maintenance due status is not itself evidence of a failed belt or tensioner.'],
    conflict: 'The indexed page merges maintenance risk, an unsupported recurring tensioner defect and anecdotal damage under one identity.',
    summary: 'Held the timing-belt/tensioner identity and separated maintenance status, timing inspection and post-failure damage testing.',
    citations: ['datasets'],
  },
  [ids.rearSteering]: {
    description: `The reviewed 3000GT corpus contains communication 52608 for a new power-steering hose on 1997 vehicles, outside the frozen 1991-1996 range. It does not establish recurring VR-4 rear-steering-pump seal failure, underbody hard-line corrosion, shared-reservoir loss of front assist, the frozen replacement cost or a universal 4WS-delete remedy. The frozen engine metadata also includes a naturally aspirated engine even though the title asserts VR-4 scope.`,
    solution: `Verify that the vehicle is equipped with four-wheel steering and identify the exact hydraulic layout. Clean the system and trace the highest fresh-fluid point while checking the reservoir, front and rear circuits, hard lines, flexible sections, fittings, rack and pump. Confirm whether a line is pressure or return side before specifying any repair. Do not buy hose, fittings, a rear pump, block-off plates or a delete kit from this page; the installed system, leak point, pressure duty and road-legal repair must be proven first.`,
    symptoms: ['factory four-wheel-steering equipment verified', 'highest fresh-fluid source traced after cleaning', 'front/rear and pressure/return paths identified'],
    affectedSystems: ['four-wheel-steering hydraulic circuit', 'rear steering pump, lines and fittings', 'power-steering reservoir and front/rear assist paths'],
    evidence: ['Communication 52608 concerns a 1997 power-steering hose and does not establish the frozen 1991-1996 rear-system identity.', 'No exact reviewed communication supports the pump, hard-line, shared-assist or delete claims.', 'The frozen engine metadata conflicts with the VR-4-only title and remains unchanged pending identity policy.'],
    conflict: 'The indexed VR-4 identity and frozen engine metadata conflict, while the proposed failure mechanism lacks exact primary support.',
    summary: 'Held the 4WS leak identity and required equipment, leak-point and pressure-duty proof before repair or deletion.',
    citations: ['datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: '3000GT', slug: '3000gt', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-3000gt-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['3000GT', '3000 GT'],
  searchTerms: ['active exhaust', 'exhaust valve', 'transfer case', 'oil leak', 'drive train', 'drivetrain', 'capacitor', 'ECU', 'electronic control unit', 'brake hose', 'synchro', 'transmission', 'gear grind', 'lash adjuster', 'lifter', 'valve noise', 'headlight', 'ETACS', 'timing belt', 'tensioner', 'water pump', 'rear steering', 'four wheel steering', '4WS', 'power steering'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 31, '2000-2004': 10, '2005-2009': 0, '2010-2014': 0, '2015-2019': 7, '2020-2024': 19, '2025-2026': 0 },
    totalRows: 67,
    relevantRowCount: 9,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 20, post: 0 },
    totalRows: 20,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Six exact 3000GT campaign identities exist; only the transfer-case and front-brake-hose campaigns support frozen issue identities in this model packet.',
  },
  content,
  requiredProse: [
    { id: ids.activeExhaust, field: 'description', patterns: ['contains no communication establishing recurring active-exhaust', 'community discussions'] },
    { id: ids.transferCase, field: 'description', patterns: ['93V033000 and 02V143001', 'checked by VIN'] },
    { id: ids.ecuCapacitors, field: 'description', patterns: ['contains no record establishing', 'mandatory preventive recapping'] },
    { id: ids.brakeHose, field: 'description', patterns: ['96V143001', 'full-lock steering and full suspension travel'] },
    { id: ids.manualSynchro, field: 'description', patterns: ['maintenance information', 'does not establish recurring'] },
    { id: ids.lashAdjuster, field: 'description', patterns: ['52060', 'does not establish universal varnish buildup'] },
    { id: ids.popUpHeadlight, field: 'description', patterns: ['headlight-aim procedures', 'no communication establishing recurring pop-up'] },
    { id: ids.timingBelt, field: 'description', patterns: ['contains no communication establishing recurring hydraulic-tensioner failure', 'must be distinguished'] },
    { id: ids.rearSteering, field: 'description', patterns: ['outside the frozen 1991-1996 range', 'naturally aspirated engine'] },
  ],
  observations: [
    { code: 'two-identities-retained-seven-held', severity: 'identity-safety', recordIds: allIds, detail: 'Transfer-case leakage and front brake-hose cracking have exact full-scope support; the other seven identities remain held without URL changes.' },
    { code: 'recall-remedies-bounded-by-vin', severity: 'recall-safety', recordIds: [ids.transferCase, ids.brakeHose].sort(), detail: 'Recall inclusion, completion and exact remedy are checked by VIN rather than inferred from model year.' },
    { code: 'community-repair-prescriptions-removed', severity: 'repair-safety', recordIds: [ids.activeExhaust, ids.ecuCapacitors, ids.manualSynchro, ids.popUpHeadlight, ids.timingBelt, ids.rearSteering].sort(), detail: 'Forum mechanisms, mandatory recapping, additive regimens, automatic rebuilds and delete kits are not treated as manufacturer-backed repairs.' },
    { code: 'no-owner-social-proof', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'All frozen counts are already unknown zero; no owner total or recurrence rate is introduced.' },
    { code: 'all-3000gt-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No 3000GT page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
