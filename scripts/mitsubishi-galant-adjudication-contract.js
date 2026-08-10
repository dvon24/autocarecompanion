/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  condenser: 'mitsubishi-galant-ac-compressor',
  radiatorTank: 'mitsubishi-galant-cracked-plastic-radiator-end-tank-overheating',
  crankSensor: 'mitsubishi-galant-crankshaft-position-sensor-failure-causes-stalling-no-start',
  earlyTransmission: 'mitsubishi-galant-premature-automatic-transmission-failure',
  timingBelts: 'mitsubishi-galant-timing-belt-balance-shaft-belt-failure-destroys-interference',
  lateTransmission: 'mitsubishi-galant-transmission-failure',
  oilLeaks: 'mitsubishi-galant-valve-cover-gasket-valve-stem-seal-oil-leaks',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10001035', '10001721', '10002270', '10002363', '10004448', '10005271',
  '10007525', '10013756', '10014179', '10014392', '10018799', '10020043',
  '45005', '50606', '50613', '52610', '52634', '600327', '600571', '601842',
  '601990', '6088721', '6088726', '6088731', '610544', '610545', '615979',
  '616802', '618196', '618217', '618234', '622421', '622423', '625970',
  '628973', '634434', '634624', '635119', '636967',
]);
const campaigns = Object.freeze([
  '00V225001', '00V237000', '00V299001', '00V320001', '00V339000',
  '00V421001', '01V005001', '01V011001', '01V069000', '01V295001',
  '02V147000', '03V442000', '04V428000', '05V409000', '07E055000',
  '08V276000', '08V454000', '09E025000', '10V066000', '88E023000',
  '95V103004', '98V168000', '98V212000', '99V066001', '99V066002',
  '99V305001', '99V333001',
]);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

const content = Object.freeze({
  [ids.condenser]: {
    description: `The reviewed 378-row Galant manufacturer-communication corpus contains 2004 A/C performance revisions, 2004-2005 pressure-sensor information, corrected refrigerant and circuit procedures, and earlier compressor relief-valve or magnetic-clutch service information. It contains no communication establishing recurring 2004-2012 condenser tube-wall failure, salt-driven pinhole corrosion, multiple condenser revisions through 2010, a model-wide failure rate, or the frozen $400-$800 repair range. The frozen title says condenser, while its remedy replaces a compressor and several unrelated circuit components without proving which part leaked.`,
    solution: `Recover and weigh the refrigerant as required, then identify the exact leak with pressure testing, electronic detection and approved dye or visual inspection. Separate condenser damage or corrosion from hose, fitting, compressor, relief-valve, evaporator and service-port leaks; confirm airflow, pressure-sensor data and charge specification before opening the circuit. Do not buy a condenser, compressor, receiver/drier, expansion valve or refrigerant kit from this page; the exact leak point, contamination state, vehicle configuration and service procedure must be proven first.`,
    symptoms: ['refrigerant charge and pressures documented', 'exact leak point positively identified', 'condenser, compressor, hose and evaporator paths separated'],
    affectedSystems: ['air-conditioning condenser and refrigerant circuit', 'compressor, relief valve and magnetic clutch', 'pressure sensing, airflow and service connections'],
    evidence: ['10007525, 10014179 and 10014392 are A/C performance records, not condenser-failure findings.', '10013756 concerns a pressure sensor; 10002363 concerns compressor relief-valve parts availability.', 'No exact communication establishes thin condenser walls, salt-belt recurrence or the frozen all-component remedy.'],
    conflict: 'The indexed condenser identity lacks exact defect evidence and its frozen remedy substitutes an unproven compressor-system replacement.',
    summary: 'Held the condenser-failure identity and required exact refrigerant leak, pressure and component diagnosis before parts.',
    citations: ['datasets'],
  },
  [ids.radiatorTank]: {
    description: `Galant communications 635119 and 636967 address overheating, low coolant, poor heater performance or gurgling on 1999-2001 vehicles caused by an incorrectly positioned coolant-reservoir-tank hose. They do not establish recurring cracked plastic radiator end tanks across 1990-1999, a top-tank frequency, turbo-specific head-gasket progression or an all-metal-radiator remedy. Other exact records revise coolant specifications or a radiator-sensor circuit, not the frozen end-tank mechanism.`,
    solution: `Pressure-test the cooling system cold and hot as the service procedure allows, then identify the highest fresh-coolant point. Inspect radiator tanks and seams, cap, hoses, reservoir routing, water pump, thermostat housing, heater circuit and engine sealing separately; if overheating occurred, test for combustion leakage and cylinder sealing before repair scope is chosen. Do not buy an aluminum radiator, hose set, water pump, thermostat or head-gasket kit from this page; the exact leak, routing fault, engine and overheat damage must be proven first.`,
    symptoms: ['cooling system pressure tested', 'highest fresh-coolant leak point identified', 'external leak, reservoir routing and engine-sealing paths separated'],
    affectedSystems: ['radiator tanks, seams and cap', 'coolant reservoir hose and circulation circuit', 'water pump, thermostat and engine sealing'],
    evidence: ['635119 and 636967 identify a reservoir-hose routing condition on 1999-2001 vehicles.', '10018799 is a radiator-sensor circuit revision rather than a cracked-tank finding.', 'No exact source supports the frozen 1990-1999 recurrence, all-metal upgrade or universal damage narrative.'],
    conflict: 'The indexed radiator-end-tank identity substitutes an age and community narrative for exact Galant evidence.',
    summary: 'Held the radiator-end-tank identity and separated exact leak location, hose routing and post-overheat engine testing.',
    citations: ['datasets'],
  },
  [ids.crankSensor]: {
    description: `Communication 601990 records long cold-start times, warm-up sag and stalling on 1994-1998 Galant vehicles, but its indexed summary does not identify a crankshaft-position-sensor failure. Communication 10020043 concerns incorrect PCM software parameters that can set crankshaft or camshaft circuit codes on 2006 vehicles, outside the frozen 1994-1998 population, and does not prove a failed sensor. The corpus therefore does not establish heat-aged Hall-effect sensor failure, hot-soak no-start or a one-hour universal replacement.`,
    solution: `Preserve codes and freeze-frame data and reproduce the stall or no-start. Verify timing-belt movement and mechanical timing, then capture crank and cam signals together with sensor power, ground, wiring integrity, ignition command, injector command and fuel pressure under the exact engine procedure. Do not buy a crank sensor, cam sensor, timing-belt part or PCM from this page; the failed signal, circuit, software or mechanical path and the exact vehicle configuration must be proven first.`,
    symptoms: ['stall or no-start condition reproduced', 'crank and cam signals captured with power and ground', 'timing, ignition, injection, fuel and software paths separated'],
    affectedSystems: ['crankshaft and camshaft position sensing', 'sensor wiring, power and ground', 'PCM synchronization, ignition, injection and mechanical timing'],
    evidence: ['601990 records symptoms without assigning the frozen crank-sensor mechanism.', '10020043 attributes circuit codes to software on 2006 vehicles outside the frozen range.', 'No exact communication establishes the frozen heat, Hall-effect and automatic replacement claims.'],
    conflict: 'The indexed page assigns a specific sensor failure to broader symptoms without exact 1994-1998 component evidence.',
    summary: 'Held the crank-sensor identity and required captured signal, circuit, software and mechanical-timing proof.',
    citations: ['datasets'],
  },
  [ids.earlyTransmission]: {
    description: `Communication 600571 documents an improved automatic-transaxle end clutch across 1989-1998 Galant vehicles, while 6088731 provides maintenance information and 622421/10004448 address a distinct 1999-2001 steady-throttle damper-clutch shudder related to SPII fluid breakdown. Those records do not establish universal premature complete failure, reverse loss, valve-body wear, low hydraulic pressure or every frozen 1994-1999 engine and trim as one defect population. They also do not establish a universal cooler, adaptive reset or rebuild remedy.`,
    solution: `Identify the installed transaxle and build data, then preserve codes and reproduce the exact slipping, shift, engagement or shudder condition. Check fluid specification, level and condition, input/output speeds, commanded gear, hydraulic pressure, end-clutch operation, torque-converter lockup, mounts and driveline paths under the unit-specific procedure. Do not buy a cooler, valve body, end clutch, torque converter, rebuild kit or remanufactured transaxle from this page; the installed unit and failed hydraulic, electrical or mechanical path must be proven first.`,
    symptoms: ['transaxle identity and build data verified', 'exact shift, slip, engagement or shudder reproduced', 'fluid, pressure, speed, clutch and driveline paths separated'],
    affectedSystems: ['automatic transaxle hydraulic and clutch circuits', 'end clutch and torque-converter damper clutch', 'transmission control, mounts and driveline'],
    evidence: ['600571 identifies an improved end clutch but does not establish every frozen failure claim.', '622421 and 10004448 cover a 1999-2001 fluid-related shudder condition.', 'No exact source supports the frozen universal mileage, cooler, valve-body and rebuild prescriptions.'],
    conflict: 'The indexed premature-failure identity combines distinct end-clutch, maintenance and later shudder records into one 1994-1999 mechanism.',
    summary: 'Held the early automatic-transmission identity and bounded diagnosis to the exact unit, shift event, pressure and clutch path.',
    citations: ['datasets'],
  },
  [ids.timingBelts]: {
    description: `The reviewed exact Galant communication and recall corpus contains no record establishing recurring timing-belt or balance-shaft-belt failure across the frozen 1990-1999 4G63, 4G63T and 4G64 population. It does not prove a universal 60,000-mile/7-year interval for every engine and market, a fixed valve or piston damage result, or mandatory water-pump and all-pulley replacement as one defect remedy. A maintenance requirement, unknown service history and a confirmed belt failure must remain distinct.`,
    solution: `Identify the exact engine and obtain its applicable manufacturer maintenance schedule and documented service history. Inspect timing and balance-shaft belts, tension, alignment, pulleys, hydraulic tensioner where fitted, water-pump leakage and oil or coolant contamination using the engine-specific procedure. If timing has slipped or a belt failed, measure compression and leak-down before selecting repair scope. Do not buy a belt kit, balance-shaft kit, tensioner, water pump or cylinder-head parts from this page; service due status, engine configuration and measured damage must be proven first.`,
    symptoms: ['engine and maintenance history verified', 'belt drives, tension, alignment and contamination inspected', 'compression and leak-down measured after timing loss'],
    affectedSystems: ['engine-specific timing-belt drive', 'balance-shaft belt, tensioners and pulleys', 'water pump and cylinder-head valvetrain'],
    evidence: ['No exact communication establishes the frozen recurring belt-failure identity.', 'The corpus does not support one interval or damage result across all frozen engines.', 'Maintenance status and a failed belt are separate states.'],
    conflict: 'The indexed page converts maintenance risk and community failure examples into a universal defect and catastrophic-damage identity.',
    summary: 'Held the timing/balance-belt identity and separated maintenance status, belt inspection and measured post-event damage.',
    citations: ['datasets'],
  },
  [ids.lateTransmission]: {
    description: `The reviewed 378-row exact Galant corpus contains no manufacturer communication establishing the frozen 2004-2012 F4A4/W5A51 failure patterns, 100,000-mile onset, 3rd-gear clutch-pack failure, solenoid recurrence or limited aftermarket support. The exact transmission records in the corpus concern earlier Galant generations and cannot be transferred into a ninth-generation defect identity. The frozen page also lists only a 3.8L V6 engine while its description asserts both 2.4L and V6 populations; that metadata conflict remains unchanged pending identity policy.`,
    solution: `Identify the engine, installed transaxle, build data and software or repair history. Preserve codes and freeze-frame data, reproduce the exact shift, slip or shudder, and compare commanded gear with input/output speeds, fluid specification and condition, line pressure, solenoid command, clutch application, cooling flow, mounts and driveline noise. Do not buy a cooler, solenoid, valve body, clutch pack, torque converter, rebuild kit or remanufactured transmission from this page; the population, unit and failed control, hydraulic or mechanical path must be proven first.`,
    symptoms: ['engine and installed transaxle identified', 'exact shift, slip or shudder reproduced', 'software, speed, pressure, solenoid and mechanical paths separated'],
    affectedSystems: ['four- or five-speed automatic transaxle', 'transmission control and solenoid circuits', 'hydraulic pressure, clutch application and cooling'],
    evidence: ['No exact 2004-2012 Galant communication establishes the frozen dual-transaxle failure identity.', 'Earlier-generation end-clutch and shudder records are not ninth-generation defect proof.', 'The frozen engine metadata conflicts with the description and remains held.'],
    conflict: 'The indexed page asserts two generation-specific transmission failures while its frozen engine metadata covers only one and exact source support is absent.',
    summary: 'Held the ninth-generation transmission identity and required exact engine, unit, control, pressure and mechanical proof.',
    citations: ['datasets'],
  },
  [ids.oilLeaks]: {
    description: `The reviewed exact Galant corpus contains no communication establishing recurring valve-cover-gasket and valve-stem-seal failure across 1990-1999 4G63, 4G63T and 4G64 vehicles. It does not prove oil in plug wells, exhaust-manifold leakage, start-up smoke or one head-on stem-seal repair as a shared model-wide identity. External leakage, crankcase ventilation, turbocharger oil paths, rings and valve guides or seals require separate evidence.`,
    solution: `Clean the engine and document the highest fresh-oil source after a controlled run. Inspect valve-cover perimeter and plug-tube seals, cam seals, crankcase ventilation and turbocharger oil paths where fitted. For smoke or consumption, measure use and record operating conditions, then use plug inspection, compression, leak-down and intake or turbo checks to separate valve guides/seals from rings, cylinders and forced-induction paths. Do not buy a gasket set, plug-tube seals, valve-stem seals, spring tool or head kit from this page; the exact engine, leak or smoke source and failed component must be proven first.`,
    symptoms: ['highest fresh external oil source documented', 'smoke timing and measured consumption recorded', 'gasket, ventilation, turbo, ring and valve paths separated'],
    affectedSystems: ['valve cover and spark-plug-tube sealing', 'valve guides and stem seals', 'crankcase ventilation, rings and turbocharger oil paths'],
    evidence: ['No exact communication establishes the frozen combined gasket/seal identity.', 'The corpus does not support one repair across three engines and ten model years.', 'External leakage and internal oil consumption require separate diagnosis.'],
    conflict: 'The indexed page combines external gasket leakage and internal valve-seal oil consumption without exact model-wide evidence.',
    summary: 'Held the combined oil-leak identity and separated external leak tracing from measured internal-consumption diagnosis.',
    citations: ['datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Galant', slug: 'galant', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-galant-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['GALANT'],
  searchTerms: ['A/C', 'air conditioner', 'air conditioning', 'condenser', 'refrigerant', 'compressor', 'radiator', 'coolant', 'cooling system', 'end tank', 'crankshaft position', 'crank sensor', 'stalling', 'no-start', 'no start', 'P0335', 'automatic transmission', 'automatic transaxle', 'transaxle', 'harsh shift', 'delayed shift', 'slipping', 'valve body', 'torque converter', 'gear whine', 'transmission fluid', 'timing belt', 'balance shaft', 'tensioner', 'water pump', 'valve cover', 'valve stem', 'oil consumption', 'blue smoke', 'burning oil'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 70, '2000-2004': 178, '2005-2009': 81, '2010-2014': 5, '2015-2019': 10, '2020-2024': 34, '2025-2026': 0 },
    totalRows: 378,
    relevantRowCount: 39,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 64, post: 1 },
    totalRows: 65,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twenty-seven exact Galant campaign identities exist; none establishes any of the seven frozen issue identities in this packet.',
  },
  content,
  requiredProse: [
    { id: ids.condenser, field: 'description', patterns: ['no communication establishing recurring 2004-2012 condenser', 'title says condenser'] },
    { id: ids.radiatorTank, field: 'description', patterns: ['635119 and 636967', 'do not establish recurring cracked plastic radiator'] },
    { id: ids.crankSensor, field: 'description', patterns: ['601990', '10020043'] },
    { id: ids.earlyTransmission, field: 'description', patterns: ['600571', '622421/10004448'] },
    { id: ids.timingBelts, field: 'description', patterns: ['contains no record establishing recurring timing-belt', 'must remain distinct'] },
    { id: ids.lateTransmission, field: 'description', patterns: ['no manufacturer communication establishing the frozen 2004-2012', 'metadata conflict'] },
    { id: ids.oilLeaks, field: 'description', patterns: ['contains no communication establishing recurring valve-cover', 'require separate evidence'] },
  ],
  observations: [
    { code: 'seven-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All seven frozen identities materially exceed exact primary evidence and remain published pending identity policy.' },
    { code: 'two-transmission-generations-kept-separate', severity: 'identity-hold', recordIds: [ids.earlyTransmission, ids.lateTransmission].sort(), detail: 'Early end-clutch and shudder communications are not transferred into the later generation, and neither indexed identity is merged or redirected.' },
    { code: 'maintenance-not-failure-proof', severity: 'technical-accuracy', recordIds: [ids.timingBelts, ids.earlyTransmission].sort(), detail: 'Maintenance schedules and service information are not converted into recurring failure or universal rebuild evidence.' },
    { code: 'cross-system-parts-blocked', severity: 'repair-safety', recordIds: [ids.condenser, ids.radiatorTank, ids.crankSensor, ids.oilLeaks].sort(), detail: 'A symptom page does not authorize multi-component replacement until exact leak, signal or consumption paths are proven.' },
    { code: 'all-galant-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Galant page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
