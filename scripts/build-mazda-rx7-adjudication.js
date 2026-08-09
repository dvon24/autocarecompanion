/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES,
  RECALL_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-rx7-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['RX-7', 'RX7']);
const SEARCH_TERMS = Object.freeze([
  'apex seal', 'compression', 'coolant', 'overheat', 'turbo', 'vacuum', 'boost',
  'oil metering', 'injector', 'hot start', 'fuel leak', 'pulsation', 'ignition',
  'coil', 'ground', 'hesitation', 'intake port', 'suspension', 'toe', 'wastegate',
  'catalytic',
]);

const IDS = Object.freeze({
  intakePorts: 'mazda-rx-7-5th-6th-auxiliary-intake-port-sleeve-actuator-seizure',
  apexFd: 'mazda-rx-7-apex-seal-failure-loss-compression',
  catalytic: 'mazda-rx-7-clogged-catalytic-converter-raising-exhaust-gas-temps-killin',
  grounds: 'mazda-rx-7-degraded-chassis-engine-grounds-3-800-rpm-hesitation',
  dtss: 'mazda-rx-7-dtss-rear-toe-control-bushing-wear-vague-self-steering-rear',
  fpd: 'mazda-rx-7-fuel-pulsation-damper-failure-fuel-leak-fire-lean-risk',
  hotStart: 'mazda-rx-7-hot-start-flooding-from-leaking-fuel-injectors',
  coils: 'mazda-rx-7-ignition-coil-coil-harness-failure',
  ompFc: 'mazda-rx-7-oil-metering-pump-neglect-brittle-injection-lines-apex-seal',
  ompFd: 'mazda-rx-7-oil-metering-pump-o-ring-line-failure-starving-apex-seals',
  overheatingFd: 'mazda-rx-7-overheating-coolant-seal-failure',
  turboSystem: 'mazda-rx-7-sequential-twin-turbo-system-failure',
  turboVacuum: 'mazda-rx-7-sequential-twin-turbo-vacuum-hose-failure',
  trailingIgnition: 'mazda-rx-7-trailing-ignition-drop-out',
  wastegate: 'mazda-rx-7-turbo-ii-wastegate-flapper-undersizing-boost-creep-overboost',
  apexBroad: 'mazda-rx7-apex-seal-failure-1993',
  coolingBroad: 'mazda-rx7-cooling',
  turboFailure: 'mazda-rx7-turbo-failure',
  vacuumBroad: 'mazda-rx7-vacuum-hose-rot-1993',
});

const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const RETAIN_IDS = Object.freeze([]);
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.coolingBroad, IDS.turboFailure].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['52457']);
const CAMPAIGNS = Object.freeze([
  '00E069000', '85V108000', '87V160000', '90E043002', '94V094000',
  '95V069000', '96V149000', '96V173000',
]);

const PDF_SOURCES = Object.freeze({});
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: NHTSA_DATASET_URL,
  },
  coolingCampaign: {
    title: 'NHTSA Campaign 94V094000: 1993-1994 RX-7 radiator-cap pressure and coolant leakage',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V094000',
  },
  fuelHoseCampaign: {
    title: 'NHTSA Campaign 95V069000: 1993-1994 RX-7 residual-heat fuel-hose deterioration',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=95V069000',
  },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: {
    '1995-1999': 26,
    '2000-2004': 2,
    '2005-2009': 0,
    '2010-2014': 0,
    '2015-2019': 6,
    '2020-2024': 8,
    '2025-2026': 0,
  },
  totalRows: 42,
  searchTerms: SEARCH_TERMS,
  relevantRowCount: 1,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 22, post: 0 },
  totalRows: 22,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function claim(description, solution, symptoms, identityConflict, evidence, summary, sources = ['datasets']) {
  return { description, solution, symptoms, identityConflict, evidence, summary, sources };
}

const CONTENT = Object.freeze({
  [IDS.intakePorts]: claim(
    'The complete reviewed 42-row RX-7 manufacturer-communication inventory and 22-row recall inventory do not establish recurring seizure of the naturally aspirated FC auxiliary-intake sleeves or actuators, a roughly 3,800-rpm engagement point, or a 25-horsepower loss. The frozen sources are an enthusiast procedure, retail listing and forum discussions rather than exact Mazda defect evidence.',
    'Confirm the installed induction system, reproduce the high-rpm loss, and test actuator movement, control pressure or vacuum, hoses, linkage and port deposits before disassembly. Do not force a seized shaft or infer that routine high-rpm driving is preventive maintenance. Do not buy an actuator kit, hose, solvent or intake parts from this page; the failed component and fitment have not been established.',
    ['high-rpm power loss requiring induction diagnosis', 'auxiliary-port actuator movement outside specification', 'control hose, linkage or port restriction found during inspection'],
    'The title asserts a six-port sleeve/actuator seizure mechanism without exact Mazda evidence for the condition, scope or performance effect.',
    ['No matching communication or campaign was found in the complete official RX-7 inventory.'],
    'Removed unsupported engagement, horsepower, prevalence and prevention claims and held the six-port seizure identity.'
  ),
  [IDS.apexFd]: claim(
    'The official RX-7 communication and recall inventories do not establish apex-seal failure as the single most common 13B-REW engine failure, a universal failure before 60,000 miles, survival beyond 100,000 miles, or the frozen causal chain. Low compression is a measured engine condition; it does not identify which combustion seal, housing or operating event caused it.',
    'Use a rotary-appropriate compression test corrected for cranking speed and compare all rotor faces, then diagnose ignition, fueling, lubrication, cooling and exhaust conditions before authorizing teardown. A rebuild scope can only be chosen after measurement and inspection. Do not buy seals, housings, a catalytic converter or a rebuild from this page; the failure, damage and exact parts have not been established.',
    ['hard starting or loss of power requiring compression testing', 'uneven rotary compression readings', 'engine damage requiring teardown-based scope'],
    'The title identifies apex-seal failure while the frozen body adds unsupported prevalence, mileage and universal-causation claims.',
    ['No exact Mazda communication or campaign establishes this broad 1993-1995 apex-seal identity.'],
    'Removed unsupported prevalence, mileage, compression threshold and universal rebuild claims and held the apex-seal identity.'
  ),
  [IDS.catalytic]: claim(
    'The official corpus does not establish a recurring 1993-1995 main-catalyst restriction that raises exhaust temperature and kills the engine, nor does it support deleting the catalyst. Power loss, heat or boost concerns do not identify catalyst restriction without pressure, temperature and emissions diagnosis.',
    'Check codes and fuel control, then measure exhaust restriction and inspect the catalyst and upstream oil, ignition and fueling conditions using the exact service procedure. Emissions equipment must remain legal for the vehicle and location. Do not buy or remove a catalytic converter, test pipe or exhaust parts from this page; restriction, cause, legality and fitment have not been established.',
    ['loss of power requiring exhaust and engine diagnosis', 'measured exhaust restriction', 'catalyst damage confirmed by inspection'],
    'The title asserts a catalyst-to-engine-failure mechanism without exact primary evidence for the RX-7 population or scope.',
    ['No matching communication or campaign establishes catalyst restriction or the frozen engine-damage chain.'],
    'Removed unsupported catalyst prevalence, engine-killing mechanism and deletion advice and held the identity.'
  ),
  [IDS.grounds]: claim(
    'Communication 52457 records hesitation, jerking or bucking only for 1993-1995 RX-7 vehicles. It does not apply to the frozen 1986-1991 years and does not identify chassis grounds, secondary injectors, auxiliary ports, a 3,800-rpm threshold, or a 90-percent repair rate.',
    'Reproduce the hesitation and preserve any codes, then test power supply, voltage drop, grounds, ignition, fueling, airflow and induction controls under the actual fault conditions. Do not add heavy ground straps from this page. Do not buy injectors, ground straps or electrical parts from this page; the year, circuit, root cause and fitment have not been established.',
    ['hesitation or bucking requiring diagnosis', 'voltage drop outside specification', 'power, ground, ignition or fueling fault confirmed by testing'],
    'The only matching official communication is for 1993-1995, while this identity attributes a 1986-1991 3,800-rpm condition specifically to degraded grounds.',
    ['Communication 52457 says only “hesitation (jerking/bucking) while driving” for 1993-1995 RX-7.'],
    'Bounded the wrong-year communication and removed the ground-causation, threshold and 90-percent claims.'
  ),
  [IDS.dtss]: claim(
    'The official inventory does not establish recurring deterioration of the FC Dynamic Tracking Suspension System rear-hub bushings, a one-degree toe change, or the frozen self-steering failure identity. Rear instability can originate in tires, alignment, wheel bearings, links, bushings, dampers, fasteners or structural damage.',
    'Inspect tires and wheels first, measure four-wheel alignment, and load-check every rear suspension joint and attachment before choosing a repair. Replacing compliant geometry with an eliminator changes the designed suspension behavior and is not a universal repair. Do not buy toe eliminators, bushings or alignment service from this page; the failed joint and fitment have not been established.',
    ['rear instability or twitchiness requiring immediate inspection', 'alignment that changes under measured load', 'excess movement at a rear joint or bushing'],
    'The title asserts a DTSS bushing-wear mechanism and handling effect without exact Mazda evidence.',
    ['No matching communication or campaign was found for the frozen DTSS identity.'],
    'Removed unsupported geometry, wear and universal eliminator advice and held the DTSS identity.'
  ),
  [IDS.fpd]: claim(
    'Campaign 95V069000 establishes residual-heat deterioration and leakage of fuel hoses on 1993-1994 RX-7 vehicles, with revised hoses and an added post-shutdown fan control. It does not identify the fuel pulsation damper, a 60,000-mile failure point, front-rotor lean-out or an FPD-elimination remedy.',
    'Treat any fuel odor or wetness as a fire risk: stop driving, avoid ignition sources and have the complete pressurized fuel system inspected. Check the VIN for campaign 95V069000 and verify completion. Do not buy a damper, block-off kit, injector seals or rail parts from this page; the leaking component and fitment have not been established.',
    ['fuel odor or visible leakage requiring immediate shutdown', 'loss of fuel pressure requiring leak testing', 'open or incomplete campaign 95V069000 identified by VIN'],
    'The title identifies a fuel-pulsation-damper failure, while the exact RX-7 fuel-fire recall concerns deteriorated fuel hoses instead.',
    ['Campaign 95V069000 covers 1993-1994 residual-heat fuel-hose deterioration, engine-compartment fire risk, revised hoses and an added cooling-fan control.'],
    'Separated the exact fuel-hose recall from the unsupported FPD identity and removed mileage and elimination advice.',
    ['datasets', 'fuelHoseCampaign']
  ),
  [IDS.hotStart]: claim(
    'The official corpus does not establish leaking injectors as a widespread 1993-2002 RX-7 hot-soak starting defect, that a rotary cannot purge excess fuel, or that repeated flooding accelerates apex-seal wear. Hard hot starting can involve compression, ignition, fueling, sensors, electrical supply and starting speed.',
    'Preserve the conditions and test cranking speed, compression, spark, fuel pressure decay, injector leakage and sensor inputs before attempting a model-specific deflood procedure. Follow the exact owner/workshop instructions for disabling fuel. Do not buy injectors, fuses, spark plugs or fuel-system parts from this page; the root cause and market-specific fitment have not been established.',
    ['hard starting after a hot soak', 'fuel-pressure decay requiring leak isolation', 'injector leakage confirmed by testing'],
    'The title attributes hot-start flooding to leaking injectors across ten model years without exact Mazda evidence.',
    ['No matching communication or campaign establishes the frozen hot-start/injector identity.'],
    'Removed unsupported prevalence, causal and deflood-part claims and held the hot-start identity.'
  ),
  [IDS.coils]: claim(
    'The official inventory does not establish recurring four-coil or coil-harness heat failure across 1993-2002, or the frozen leading-versus-trailing symptom rules. Misfire and rough running require circuit-level diagnosis and can involve plugs, leads, coils, igniters, wiring, grounds, compression and fueling.',
    'Preserve codes and test primary and secondary ignition under the fault, using exact workshop specifications for the installed market and ignition system. Repair only the failed circuit and protect wiring from verified heat or abrasion sources. Do not buy coils, an adapter harness, igniter, plugs or conversion parts from this page; the failed circuit and fitment have not been established.',
    ['misfire or rough running requiring diagnosis', 'loss of leading or trailing spark confirmed by testing', 'open, shorted or heat-damaged ignition wiring found during inspection'],
    'The title asserts coil and harness failure across ten years without exact Mazda evidence or market-specific ignition coverage.',
    ['No matching communication or campaign establishes the frozen ignition-coil/harness identity.'],
    'Removed unsupported prevalence, symptom mapping, resistance and conversion advice and held the ignition identity.'
  ),
  [IDS.ompFc]: claim(
    'The official corpus does not establish recurring 1986-1991 oil-metering-pump, linkage or injection-line failure as a defined apex-seal-starvation issue. The frozen text combines multiple systems and generations without an exact Mazda defect record.',
    'Inspect the installed metering system for leaks, line condition, linkage or electronic actuation and measured delivery using the exact workshop procedure. Do not infer adequate or inadequate seal lubrication from line color alone. Do not buy a pump, rebuild kit, injection lines or premix from this page; the fault, lubrication strategy and fitment have not been established.',
    ['oil-metering warning or delivery concern requiring diagnosis', 'leaking or damaged metering line found during inspection', 'pump or actuator operation outside specification'],
    'The title asserts OMP neglect and brittle-line seal starvation without exact Mazda evidence for the combined identity.',
    ['No matching communication or campaign establishes the frozen FC metering-system identity.'],
    'Removed unsupported failure chain and universal rebuild/premix advice and held the FC OMP identity.'
  ),
  [IDS.ompFd]: claim(
    'The official inventory does not establish recurring 1993-1995 oil-metering-pump O-ring, drive or line failure as a defined apex-seal-starvation defect. The statement that the engine relies 100 percent on this pump and the line-color test are not established by the reviewed primary corpus.',
    'Inspect for external leakage and verify metering-pump command, mechanical operation and delivery using the exact workshop procedure before changing the lubrication strategy. Do not buy O-rings, a pump, lines or premix from this page; the failed component, correct oil and fitment have not been established.',
    ['metering-system leak or warning requiring diagnosis', 'delivery outside specification', 'line or connector damage confirmed during inspection'],
    'The title asserts O-ring/line failure starving apex seals without exact Mazda evidence for that population or mechanism.',
    ['No matching communication or campaign establishes the frozen FD metering-system identity.'],
    'Removed unsupported 100-percent, line-color, starvation and premix claims and held the FD OMP identity.'
  ),
  [IDS.overheatingFd]: claim(
    'Campaign 94V094000 establishes a specific 1993-1994 condition: radiator-cap relief pressure was set too high, coolant could exceed component thermal limits and leak onto the exhaust manifold, creating a fire risk. It does not establish the frozen 1993-1995 broad overheating/coolant-seal identity, fan-clutch and underbelly causes, rotor-housing warpage, or combustion-seal diagnosis.',
    'Stop for overheating, coolant loss, steam or leakage and allow the vehicle to cool safely. Check the VIN for campaign 94V094000 and verify completion, then pressure-test and diagnose the exact cooling-system fault. Do not buy a radiator cap, fan, radiator, thermostat, pump, hoses or an engine rebuild from this page; campaign status, fault and fitment have not been established.',
    ['overtemperature or coolant warning requiring shutdown', 'coolant leakage requiring pressure testing', 'open or incomplete campaign 94V094000 identified by VIN'],
    'The exact campaign is a 1993-1994 radiator-cap/coolant-leak condition, not the title’s broad overheating and coolant-seal-failure mechanism.',
    ['Campaign 94V094000 covers high radiator-cap relief pressure, coolant-system deterioration/leakage and fire risk on 1993-1994 RX-7 vehicles.'],
    'Bounded the exact radiator-cap recall and removed unsupported generic causes, seal diagnosis and blanket parts advice.',
    ['datasets', 'coolingCampaign']
  ),
  [IDS.turboSystem]: claim(
    'The official corpus does not establish a recurring 1993-2002 sequential-turbo system failure involving eight-plus solenoids, dozens of hoses, 4,500-rpm transition, 200-degree post-shutdown temperature, stuck actuators and cracked housings as one defect identity. The frozen range also extends beyond the U.S. recall rows and requires market-specific verification.',
    'Record boost behavior and codes, then pressure- and vacuum-test the installed control system and verify each hose, check valve, solenoid, actuator and turbocharger against the exact market workshop diagram. Do not convert to a single turbo from this page. Do not buy hoses, valves, solenoids, actuators or turbochargers from this page; the failed element, legality and fitment have not been established.',
    ['abnormal boost or transition requiring controlled diagnosis', 'vacuum or pressure leak confirmed by testing', 'control component or turbocharger fault confirmed against specification'],
    'The title combines many possible sequential-control faults across ten years without exact Mazda evidence or market scope.',
    ['No matching communication or campaign establishes the frozen broad sequential-turbo identity.'],
    'Removed unsupported counts, temperatures, mechanisms and conversion advice and held the broad turbo-system identity.'
  ),
  [IDS.turboVacuum]: claim(
    'The official inventory does not establish simultaneous end-of-life failure of every 1993-1995 sequential-turbo hose, that one hose explains five boost problems, or a universal whole-system refresh. Vacuum, pressure, electrical, actuator and turbocharger faults must be isolated.',
    'Use the exact workshop routing and controlled pressure/vacuum tests to identify leaking hoses, failed check valves, solenoids or actuators before repair. Labeling and routing are safety-critical. Do not buy a silicone hose kit, valves, solenoids or conversion parts from this page; the leak, material specification and fitment have not been established.',
    ['abnormal turbo transition requiring diagnosis', 'vacuum or pressure leak confirmed by testing', 'damaged hose or control component found against the exact routing diagram'],
    'The title asserts sequential-turbo vacuum-hose failure without exact Mazda evidence for the universal age-based mechanism.',
    ['No matching communication or campaign establishes the frozen hose-failure identity.'],
    'Removed universal hose-deterioration and whole-system replacement claims and held the vacuum identity.'
  ),
  [IDS.trailingIgnition]: claim(
    'The official corpus does not establish recurring 1986-1991 trailing-coil, igniter, ground or crank-angle-sensor failure as one defined condition. The frozen description makes component-specific drivability and emissions predictions without an exact Mazda communication.',
    'Confirm which leading or trailing circuit loses spark and test power, ground, trigger, igniter, coils, wiring and crank-angle signals using exact specifications. A running engine does not prove the trailing system is healthy. Do not buy coils, an igniter, crank-angle sensor or connectors from this page; the failed circuit and fitment have not been established.',
    ['rough running or power loss requiring ignition diagnosis', 'trailing spark absent during controlled testing', 'coil, igniter, wiring or trigger fault confirmed against specification'],
    'The title asserts a combined trailing-ignition dropout mechanism without exact Mazda evidence for prevalence or component scope.',
    ['No matching communication or campaign establishes the frozen trailing-ignition identity.'],
    'Removed unsupported architecture consequences and parts advice and held the trailing-ignition identity.'
  ),
  [IDS.wastegate]: claim(
    'The official inventory does not establish a roughly 16-mm HT-18 wastegate port, a universal undersizing defect, boost creep on stock vehicles, or different 1987-1988 versus 1989-1991 severity. Modification-sensitive boost behavior requires configuration-specific measurement.',
    'Verify the turbocharger, exhaust, intake, control hardware, calibration and accurate boost readings before inspecting wastegate travel and bypass capacity. Porting and welding alter safety-critical turbo hardware and require engineered validation. Do not buy or modify a flapper, turbocharger, exhaust or boost-control part from this page; the condition and configuration have not been established.',
    ['boost above target under controlled testing', 'wastegate travel or control fault confirmed by measurement', 'configuration-dependent boost creep requiring engineered diagnosis'],
    'The title asserts wastegate-flapper undersizing and overboost without exact Mazda evidence for dimensions, stock prevalence or year split.',
    ['No matching communication or campaign establishes the frozen wastegate identity.'],
    'Removed unsupported dimensions, stock-vehicle and preventive-porting claims and held the wastegate identity.'
  ),
  [IDS.apexBroad]: claim(
    'The official RX-7 corpus does not establish inherent apex-seal failure across 1993-2002, an 80,000-120,000-mile rebuild interval, or the claim that even well-maintained engines typically require rebuilding. The frozen video is secondary evidence and does not establish a model-wide defect or prevalence rate.',
    'Measure rotary compression correctly and diagnose ignition, fueling, lubrication, cooling and exhaust conditions before teardown. Warm-up and shutdown practices must follow exact owner/workshop guidance, not a universal page rule. Do not buy premix, seals or a $3,000-$6,000 rebuild from this page; failure, operating guidance, scope and cost have not been established.',
    ['hard starting or loss of power requiring compression testing', 'uneven compression readings', 'internal damage requiring teardown-based scope'],
    'The title identifies apex-seal failure while the body asserts inherent failure, universal mileage and rebuild cost without exact primary evidence.',
    ['No matching communication or campaign establishes the frozen broad apex-seal identity.'],
    'Removed inherent-failure, mileage, premix, shutdown, price and rebuilder claims and held the broad apex identity.'
  ),
  [IDS.coolingBroad]: claim(
    'Campaign 94V094000 establishes high radiator-cap relief pressure and resulting coolant-system deterioration/leakage only on 1993-1994 RX-7 vehicles. It does not support the frozen 1990-1995 range, a barely adequate cooling system, radiator/thermostat/pump prevalence, immediate apex-seal damage, or the stored 280-owner total.',
    'Stop for overheating or coolant loss and check the VIN for campaign 94V094000. Pressure-test and diagnose the exact cooling fault before repair; an upgrade is not automatically a repair. Do not buy an aluminum radiator, thermostat, pump, cap or engine parts from this page; campaign status, cause and fitment have not been established.',
    ['overtemperature or coolant warning requiring shutdown', 'coolant leakage requiring pressure testing', 'open or incomplete campaign 94V094000 identified by VIN'],
    'The title spans 1990-1995 and generic cooling weakness while exact evidence is a specific 1993-1994 radiator-cap recall.',
    ['Campaign 94V094000 is limited to 1993-1994 radiator-cap pressure and coolant leakage/fire risk.'],
    'Proposed the unsupported 280-owner total as zero, bounded the recall and removed blanket upgrade advice.',
    ['datasets', 'coolingCampaign']
  ),
  [IDS.turboFailure]: claim(
    'The official inventory does not establish recurring failure of sequential-turbo pre-control, charge-control and wastegate solenoids or the stored 320-owner total for 1993-1995. Rough transition and boost loss do not identify vacuum hoses, valves, solenoids, actuators or turbo bearings without testing.',
    'Record codes and boost behavior and test the installed vacuum, pressure, electrical and mechanical controls against the exact workshop sequence. Do not replace every hose or solenoid and do not convert the turbo system without configuration-specific engineering. Do not buy hoses, solenoids or turbochargers from this page; the failed element and fitment have not been established.',
    ['rough or missing turbo transition', 'boost control outside specification', 'vacuum, electrical or mechanical control fault confirmed by testing'],
    'The title asserts sequential-turbo failure and the body names components and prevalence without exact Mazda evidence.',
    ['No matching communication or campaign establishes the frozen turbo-system failure or 320-owner total.'],
    'Proposed the unsupported 320-owner total as zero and removed assumed components and conversion advice.'
  ),
  [IDS.vacuumBroad]: claim(
    'The official corpus does not establish that virtually every 1993-2002 sequential-turbo hose is cracked or hardened, that a single failed hose universally disables operation, or that all hoses require mandatory replacement. The page has no frozen citations and spans market years that require separate verification.',
    'Use the exact market workshop routing and pressure/vacuum tests to locate the actual leak or control fault. Replace only correctly specified hose and failed components, preserving routing and check-valve direction. Do not buy a $60-$100 hose kit or a $1,500-$3,000 conversion from this page; the fault, specification, market and fitment have not been established.',
    ['abnormal boost transition requiring diagnosis', 'vacuum or pressure leak confirmed by testing', 'hose or control fault found against the correct routing diagram'],
    'The title asserts universal age-based vacuum-system deterioration across ten years without citations or exact Mazda evidence.',
    ['No matching communication or campaign establishes the frozen broad vacuum-hose identity.'],
    'Removed universal deterioration, mandatory replacement, price and conversion claims and held the broad vacuum identity.'
  ),
});

function contentFor(id) {
  const content = CONTENT[id];
  if (!content) throw new Error(`Unexpected RX-7 row ${id}`);
  return content;
}

function citation(source) {
  return { url: source.url, type: source.type, title: source.title };
}

function citationsFor(id) {
  return contentFor(id).sources.map((key) => citation(OTHER_SOURCES[key]));
}

function commerceDecisionFor(id) {
  const noun = {
    [IDS.intakePorts]: 'diagnose the installed six-port induction controls first',
    [IDS.apexFd]: 'measure compression and establish teardown scope first',
    [IDS.catalytic]: 'measure restriction and confirm emissions-compliant fitment first',
    [IDS.grounds]: 'isolate the electrical, ignition or fueling fault first',
    [IDS.dtss]: 'measure alignment and identify the failed rear joint first',
    [IDS.fpd]: 'locate the fuel leak and verify campaign status first',
    [IDS.hotStart]: 'test compression, spark, pressure decay and injector leakage first',
    [IDS.coils]: 'identify the failed ignition circuit first',
    [IDS.ompFc]: 'verify the installed metering system and delivery first',
    [IDS.ompFd]: 'verify the installed metering system and delivery first',
    [IDS.overheatingFd]: 'verify campaign status and pressure-test the cooling system first',
    [IDS.turboSystem]: 'isolate the exact turbo-control fault and configuration first',
    [IDS.turboVacuum]: 'locate the exact leak and verify routing first',
    [IDS.trailingIgnition]: 'identify the failed leading/trailing ignition circuit first',
    [IDS.wastegate]: 'measure boost control and verify the turbo configuration first',
    [IDS.apexBroad]: 'measure compression and establish teardown scope first',
    [IDS.coolingBroad]: 'verify campaign status and diagnose the cooling fault first',
    [IDS.turboFailure]: 'isolate the exact boost-control fault first',
    [IDS.vacuumBroad]: 'locate the exact leak and verify market-specific routing first',
  };
  return `No universal retail part; ${noun[id]}.`;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mazda' && row.model === 'RX-7')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 19) throw new Error(`Expected 19 frozen RX-7 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    return {
      id: row.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true,
      identityConflict: content.identityConflict,
      reason: content.summary,
      evidence: {
        primaryEvidence: content.evidence,
        limitations: 'No owner-frequency rate, universal failure mechanism, repair price or retail fitment is inferred beyond exact primary evidence.',
      },
      commerceDecision: commerceDecisionFor(row.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: 'RX-7',
    completionStatement: 'All 19 frozen RX-7 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'All 19 identities materially exceed exact primary evidence or overlap narrower official conditions; no catalog write is authorized.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 19 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 280- and 320-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Campaign 94V094000 is limited to its 1993-1994 radiator-cap/coolant-leak condition.',
      'Campaign 95V069000 is limited to its 1993-1994 residual-heat fuel-hose condition and is not relabeled as a pulsation-damper defect.',
      'Every selected PDF page was rendered and visually inspected; this RX-7 packet selects no PDFs.',
      'Every named replaceable item has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'rx7-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'All 19 pages exceed exact evidence, overlap narrower records or rely on secondary/community claims; every indexed page remains published.' },
      { code: 'rx7-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 280- and 320-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'rx7-cooling-recall-bounded', severity: 'accuracy-correction', recordIds: [IDS.overheatingFd, IDS.coolingBroad], detail: 'Campaign 94V094000 is a 1993-1994 radiator-cap pressure/coolant-leak condition, not proof of either broad frozen cooling identity.' },
      { code: 'rx7-fuel-hose-recall-not-fpd', severity: 'identity-conflict', recordIds: [IDS.fpd], detail: 'Campaign 95V069000 concerns residual-heat deterioration of fuel hoses, not the fuel pulsation damper.' },
      { code: 'rx7-hesitation-communication-wrong-years', severity: 'identity-conflict', recordIds: [IDS.grounds], detail: 'Communication 52457 covers 1993-1995 hesitation and cannot support the frozen 1986-1991 ground-specific page.' },
      { code: 'rx7-overlapping-identities-preserved', severity: 'seo-safety', recordIds: [IDS.apexFd, IDS.apexBroad, IDS.overheatingFd, IDS.coolingBroad, IDS.turboSystem, IDS.turboVacuum, IDS.turboFailure, IDS.vacuumBroad], detail: 'Overlapping pages are not merged, redirected or archived; identity policy and independent evidence review are required first.' },
      { code: 'all-rx7-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No RX-7 page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {},
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 19,
      fabricated_report_counts_proposed_zero: 2,
      total: 19,
    },
    rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS,
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  FABRICATED_REPORT_COUNT_IDS,
  IDS,
  MODEL_ALIASES,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS,
  REVIEW_DATE,
  SEARCH_TERMS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  proposalFor,
};
