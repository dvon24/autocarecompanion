/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-sprinter-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  transmission: 'mercedes-benz-sprinter-722-6-automatic-transmission-conductor-plate-failure-limp-mo',
  dpf: 'mercedes-benz-sprinter-diesel-particulate-filter-clogging-from-short-trip-urban-use',
  egr: 'mercedes-benz-sprinter-egr-valve-egr-cooler-carbon-clogging',
  swirl: 'mercedes-benz-sprinter-intake-manifold-swirl-flap-linkage-breakage',
  balancer: 'mercedes-benz-sprinter-om642-harmonic-balancer-crankshaft-pulley-rubber-failure',
  oilCooler: 'mercedes-benz-sprinter-om642-v6-oil-cooler-seal-leak',
  corrosion: 'mercedes-benz-sprinter-rear-wheel-arch-body-seam-corrosion',
  turboActuator: 'mercedes-benz-sprinter-turbocharger-vnt-actuator-failure',
  def: 'mercedes-sprinter-def-adblue-system-2014',
  injector: 'mercedes-sprinter-diesel-injector-failure-2010',
  glowPlug: 'mercedes-sprinter-glow-plug-failure-2007',
  slidingDoor: 'mercedes-sprinter-sliding-door-roller-2007',
  resonator: 'mercedes-sprinter-turbo-resonator-crack-2007',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.def]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const MODEL_ALIASES = Object.freeze(['SPRINTER', 'SPRINTER 1500', 'SPRINTER 2500', 'SPRINTER 3500', 'SPRINTER 4500']);
const SEARCH_TERMS = Object.freeze(['722.6', 'NAG1', 'conductor plate', 'limp', 'DPF', 'particulate', 'regeneration', 'EGR', 'swirl flap', 'P2015', 'harmonic balancer', 'crankshaft pulley', 'oil cooler', 'seal leak', 'corrosion', 'wheel arch', 'body seam', 'turbo actuator', 'VNT', 'DEF', 'AdBlue', 'SCR', 'NOx', 'injector', 'black death', 'glow plug', 'sliding door', 'roller', 'track', 'turbo resonator', 'boost leak']);
const REQUIRED_COMMUNICATION_IDS = Object.freeze('10030226,10033548,10033644,10121927,10135641,10135712,10160626,10186131,11008717,11017567,11018922,11019973,11021173,11023982,11028113,11028120,11034406,11034417,11035563'.split(','));
const CAMPAIGNS = Object.freeze('07V246000,07V299000,07V325000,07V594000,08V109000,08V110000,08V339000,08V347000,08V352000,08V524000,08V526000,08V568000,08V569000,08V651000,08V652000,08V662000,08V663000,08V687000,09V039000,09V295000,09V296000,09V418000,09V456000,10V294000,10V642000,10V655000,11V210000,11V410000,14V677000,14V706000,14V764000,15V082000,15V261000,16V077000,16V093000,16V261000,16V351000,16V670000,16V833000,16V853000,17V092000,17V093000,17V094000,17V149000,17V272000,17V364000,17V478000,17V479000,17V480000,17V592000,17V650000,17V742000,17V786000,17V804000,18V032000,18V113000,18V288000,18V743000,19V003000,19V004000,19V140000,19V222000,19V238000,19V284000,19V309000,19V507000,19V591000,19V665000,19V693000,19V695000,19V716000,19V798000,19V800000,19V908000,20V078000,20V079000,20V109000,20V110000,20V155000,20V156000,20V157000,20V180000,20V181000,20V595000,20V631000,20V663000,20V756000,20V772000,20V802000,21V042000,21V055000,21V077000,21V152000,21V153000,21V235000,21V241000,21V359000,21V410000,21V411000,21V513000,21V779000,21V933000,21V934000,21V972000,22V073000,22V131000,22V281000,22V360000,22V491000,22V796000,23V101000,23V204000,23V444000,23V806000,23V849000,23V874000,23V875000,23V876000,24V166000,24V225000,24V517000,24V930000,25V135000,25V609000,25V712000,25V725000'.split(','));
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS, periodCounts: { '1995-1999': 0, '2000-2004': 5, '2005-2009': 25, '2010-2014': 69, '2015-2019': 533, '2020-2024': 1148, '2025-2026': 605 }, totalRows: 2385, relevantRowCount: 614, uniqueRelevantCommunications: 110, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 85, post: 2289 }, totalRows: 2374, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

const CONTENT = Object.freeze({
  [IDS.transmission]: {
    description: 'The reviewed Sprinter corpus does not establish universal 722.6 conductor-plate failure across 2007-2018 vans. Communication 10121927 concerns a 2007 NAG1 valve-body assembly for warranty claims, while 11023982 concerns a different 722.9 VGS communication path. Neither proves the frozen conductor-plate weak-point mechanism or replacement rule.',
    solution: 'Preserve transmission faults, freeze-frame and adaptation data. Verify the installed transmission by VIN, then test fluid level and condition, power, grounds, connector pins, speed signals, solenoids, valve body and TCM communication under the exact procedure. Do not buy a conductor plate, valve body, connector sleeve, filter or fluid kit from this page; the failed path and fitment are unresolved.',
    symptoms: ['transmission family verified by VIN', 'fault and adaptation data preserved', 'electrical, sensor, hydraulic and control-unit paths separated'],
    systems: ['722.6 NAG1 transmission', 'speed-sensor and solenoid circuits', 'valve body, TCM and wiring'],
    conflict: 'No exact primary record establishes the frozen 722.6 conductor-plate identity across 2007-2018 Sprinters.',
    evidence: ['10121927 identifies a 2007 NAG1 valve-body assembly for warranty claims, not a failure population.', '11023982 concerns a different 722.9 VGS communication path.', 'No reviewed record validates universal conductor-plate replacement.'],
    summary: 'Held the unsupported conductor-plate identity and separated transmission diagnostic paths.',
  },
  [IDS.dpf]: {
    description: 'Mercedes communication 11028120 establishes excessive DPF soot fill and regeneration lockout after frequent short trips, extended idling, infrequent highway driving or incomplete regeneration cycles on 2023-2025 Sprinters. The frozen page extends that exact mechanism back to 2007 and prescribes a highway drive or forced regeneration without first excluding damage, sensor, EGR or exhaust-leak paths.',
    solution: 'Preserve DPF, EGR, pressure-sensor and temperature-sensor faults and regeneration history. Follow the Mercedes guided tests to identify soot loading, ash loading, sensor plausibility, leaks and DPF damage before any regeneration. Do not force a regeneration. Do not buy a DPF, pressure sensor, temperature sensor or cleaner from this page; fault state, safe regeneration eligibility and VIN fitment are unresolved.',
    symptoms: ['DPF fill values and regeneration history documented', 'related EGR and sensor faults preserved', 'exhaust leaks and physical DPF damage excluded'],
    systems: ['diesel particulate filter', 'exhaust pressure and temperature sensing', 'EGR and regeneration control'],
    conflict: 'Exact short-trip regeneration-lockout evidence is bounded to 2023-2025 and does not validate the frozen 2007-2022 scope or generic drive-to-regenerate instruction.',
    evidence: ['11028120 identifies short trips, extended idling and incomplete regeneration cycles as triggers for excessive DPF fill on 2023-2025 vehicles.', '11011228 and 11033165 require guided diagnosis for DPF-efficiency faults.', '11011223 says not to perform manual regeneration unless instructed.'],
    summary: 'Held the partly supported DPF identity and removed unsafe universal regeneration advice.',
  },
  [IDS.egr]: {
    description: 'Mercedes communications 11017567, 11028113 and 11034410 establish soot deposits that increase EGR-valve friction and require diagnosis and cleaning on OM642 Sprinter 906/907 vehicles. The frozen page also asserts the same mechanism and replacement rule for OM651 vehicles through 2020, including that coolers frequently cannot be cleaned; the reviewed evidence does not establish those broader claims.',
    solution: 'Preserve all EGR, air-mass, boost and charge-air faults. Follow the engine-specific Mercedes guided tests to distinguish mechanical soot restriction from electrical faults, vacuum faults, charge-air leaks, EGR-cooler restriction and other air-path causes. Use the approved cleaning procedure only when its prerequisites are met. Do not buy an EGR valve, cooler, actuator, gasket or cleaner from this page; engine, failed component and VIN fitment are unresolved.',
    symptoms: ['engine and EGR fault path documented', 'mechanical and electrical EGR faults separated', 'charge-air and cooler paths inspected before replacement'],
    systems: ['EGR valve and actuator', 'EGR cooler and bypass controls', 'charge-air, vacuum and engine control'],
    conflict: 'Exact soot-cleaning evidence is OM642-specific and does not validate the frozen OM651 scope or universal cooler-replacement claim.',
    evidence: ['11017567 identifies EGR blade friction and soot deposits on OM642 Sprinter 906/907.', '11028113 adds EGR cooler inspection and cleaning under the exact procedure.', 'The reviewed records do not establish that an OM651 cooler usually requires replacement.'],
    summary: 'Held the overbroad EGR identity while retaining the exact OM642 soot-diagnosis path.',
  },
  [IDS.swirl]: {
    description: 'The targeted Sprinter corpus returned no exact communication establishing OM642 swirl-flap linkage breakage or P2015 across 2007-2018 vans. EGR communications mention checking intake and bypass components, but they do not prove the frozen plastic-linkage mechanism. The live resistor-bypass instruction defeats emissions-control diagnosis and is not an approved repair.',
    solution: 'Preserve intake-runner, EGR, boost and air-mass faults and command the runner system with the correct Mercedes diagnostic procedure. Inspect wiring, actuator motion, linkage, manifold deposits and oil contamination before deciding on repair. Do not install a resistor bypass or emissions defeat. Do not buy a linkage kit, actuator, resistor or intake manifold from this page; the failed component and VIN fitment are unresolved.',
    symptoms: ['fault and commanded runner position documented', 'wiring, actuator, linkage and deposit paths separated', 'emissions-control operation preserved'],
    systems: ['intake runner and swirl controls', 'actuator, linkage and wiring', 'EGR and boost control'],
    conflict: 'No exact primary source establishes the frozen linkage-failure identity, and the stored resistor bypass is prohibited.',
    evidence: ['The targeted search returned zero exact swirl-flap or P2015 communications.', 'EGR records identify diagnostic paths but not the frozen linkage mechanism.', 'No reviewed source authorizes a resistor bypass.'],
    summary: 'Held the unsupported swirl-flap identity and explicitly prohibited the resistor bypass.',
  },
  [IDS.balancer]: {
    description: 'The targeted Sprinter corpus returned no exact communication establishing bonded-rubber harmonic-balancer separation, crankshaft damage or bolt failure on OM642 Sprinters from 2007-2022. The frozen page combines several mechanisms and asserts a torque-to-yield replacement rule without an exact model-scoped source.',
    solution: 'Stop the engine if the crank pulley visibly wobbles or the belt is misaligned. Verify the noise and runout source, inspect the belt drive and obtain the engine- and VIN-specific Mercedes fastener and torque procedure before repair. Do not buy a harmonic balancer, crank bolt, belt, tensioner or seal from this page; the failed component, fastener rule and fitment are unresolved.',
    symptoms: ['pulley runout and vibration source documented', 'belt alignment and accessory drive inspected', 'engine-specific fastener procedure verified'],
    systems: ['crankshaft pulley and torsional damper', 'accessory belt drive', 'front crankshaft and fastener'],
    conflict: 'No exact primary record establishes the frozen multi-mechanism identity or full population.',
    evidence: ['The targeted corpus returned zero exact harmonic-balancer or crankshaft-pulley communications.', 'No reviewed record validates the stored crankshaft-damage claim.', 'No reviewed record validates a universal fastener replacement instruction.'],
    summary: 'Held the unsupported harmonic-balancer identity pending exact model-scoped evidence.',
  },
  [IDS.oilCooler]: {
    description: 'Mercedes communication 10135712 identifies traces of oil at the OM642 oil cooler in the engine valley on 2007-2017 Sprinters. It supports the core leak location but does not establish the frozen 2018-2021 scope, orange-to-purple seal history, coolant migration, universal cooler replacement or eight-to-ten-hour labor claim.',
    solution: 'Clean the area and confirm the source before disassembly; distinguish oil-cooler sealing from turbo, intake, crankcase-ventilation, rear-engine and transmission leaks. Use VIN-specific Mercedes parts and procedures only after the leak is verified. Do not buy cooler seals, a cooler, intake gaskets or turbo hardware from this page; the source, later-year coverage and repair kit fitment are unresolved.',
    symptoms: ['oil source in the engine valley verified', 'adjacent engine and transmission leak paths excluded', 'VIN-specific sealing parts confirmed'],
    systems: ['OM642 oil cooler and seals', 'engine-valley oil drainage', 'adjacent turbo and intake systems'],
    conflict: 'Exact evidence ends with 2017 and does not validate several stored mechanisms and repair assertions.',
    evidence: ['10135712 identifies traces of oil in the oil-cooler area on engine 642 for 2007-2017 Sprinters.', 'The record does not identify coolant migration or universal cooler replacement.', 'The frozen 2018-2021 portion remains unsupported.'],
    summary: 'Held the partly supported oil-cooler identity and bounded the exact evidence to 2007-2017.',
  },
  [IDS.corrosion]: {
    description: 'The targeted Sprinter corpus does not establish widespread rear-wheel-arch, lower-door, hinge and pinch-weld corrosion across 2007-2018 W906 vans. Communication 10057718 concerns inadequate corrosion protection at a B-pillar wedge screw on 2015 vehicles, which is a different location and mechanism.',
    solution: 'Photograph the exact corrosion location and inspect both sides of the panel, seams, drains and structural attachment points. Check corrosion-warranty and body-repair eligibility by VIN before cutting or coating. Do not buy rust converters, weld-in arches, seam sealer or cavity wax from this page; corrosion extent, repair method and panel fitment are unresolved.',
    symptoms: ['exact corrosion location and depth documented', 'drainage and structural areas inspected', 'VIN and corrosion-warranty eligibility checked'],
    systems: ['rear body panels and wheel arches', 'door seams, drains and hinges', 'body corrosion protection'],
    conflict: 'No exact primary record establishes the frozen multi-location corrosion identity or full W906 population.',
    evidence: ['10057718 concerns a 2015 B-pillar wedge screw with inadequate corrosion protection.', 'That record does not establish wheel-arch or rear-door seam corrosion.', 'No reviewed record validates the stored first-year or VS30 comparison claims.'],
    summary: 'Held the unsupported multi-location corrosion identity pending exact body-panel evidence.',
  },
  [IDS.turboActuator]: {
    description: 'The targeted Sprinter corpus returned no exact communication establishing electronic VNT-actuator wear across OM642 and OM651 vehicles from 2007-2022. Reviewed boost records require leak, sensor, EGR, vacuum and turbocharger diagnosis; they do not validate the frozen programming claim or actuator replacement as the common remedy.',
    solution: 'Preserve underboost, overboost, air-mass, EGR and actuator faults and compare commanded versus actual boost. Smoke-test the charge-air path and test sensors, wiring, vacuum controls and vane movement before condemning the actuator or turbocharger. Do not buy an actuator, turbocharger, vacuum transducer or hose from this page; the failed path, calibration need and VIN fitment are unresolved.',
    symptoms: ['commanded and actual boost documented', 'charge-air leaks and sensor paths excluded', 'actuator, vane and turbocharger paths separated'],
    systems: ['turbocharger vane control', 'charge-air and vacuum systems', 'boost sensing and engine control'],
    conflict: 'No exact primary source establishes the frozen actuator-failure identity or cross-engine programming claim.',
    evidence: ['The targeted search returned zero exact turbo-actuator or VNT communications.', 'Reviewed boost records require diagnosis of multiple air-path causes.', 'No reviewed record validates universal actuator programming or replacement.'],
    summary: 'Held the unsupported turbo-actuator identity and required complete boost-path diagnosis.',
  },
  [IDS.def]: {
    description: 'Mercedes communications across the stored model years establish multiple DEF/AdBlue and SCR fault paths, including dosing-line leaks, injector faults, air pockets, NOx-sensor plausibility, catalyst-efficiency faults and software influences. A warning or derate does not identify the failed component, and several exact procedures explicitly prohibit replacement until guided diagnosis is complete.',
    solution: 'Preserve every CDI and SCR fault, warning stage and countdown state, then run the applicable XENTRY guided tests. Verify DEF quality, leaks, line routing, injector pressure, sensor plausibility, wiring, software level, DPF/SCR condition and VIN campaigns before replacement. Do not buy a NOx sensor, DEF tank, pump, heater, injector, line or catalyst from this page; the failed path and VIN fitment are unresolved.',
    symptoms: ['complete CDI and SCR fault set preserved', 'warning and countdown state documented', 'fluid, leak, sensor, software and catalyst paths separated'],
    systems: ['DEF tank, pump, heater and lines', 'AdBlue injectors and SCR catalyst', 'NOx sensors, wiring and control software'],
    conflict: '',
    evidence: ['10135641 identifies SCR/AdBlue warning-strategy faults on 2007-2017 Sprinters.', '10186131 identifies an AdBlue warning condition on 2020-2021 vehicles.', '11008717, 11017567, 11018922, 11019973 and 11021173 require multi-path guided diagnosis and often prohibit uninstructed component replacement.'],
    summary: 'Retained the DEF/SCR fault identity while removing owner-count and parts-cannon claims.',
  },
  [IDS.injector]: {
    description: 'The frozen page combines injector failure and combustion-gas blow-by across OM651, OM654 and OM642 vehicles from 2010-2025. Communication 11034406 establishes a fractured injector hold-down and combustion-gas leakage on 2023-2025 Sprinters, while other injector fault records identify different causes. This does not establish the stored population, “most common” claim or replace-all-washers remedy.',
    solution: 'Preserve injector, rail-pressure and misfire faults. Inspect for combustion-gas leakage, perform leak-back and fuel-pressure tests, and identify the failed injector, sealing interface, hold-down or supply component before repair. Follow the engine-specific bore-cleaning and torque procedure. Do not buy injectors, washers, hold-downs, lines or extraction tools from this page; the mechanism, affected cylinders and VIN fitment are unresolved.',
    symptoms: ['combustion leakage and deposits documented', 'injector leak-back and rail pressure tested', 'seal, hold-down, injector and supply paths separated'],
    systems: ['diesel injectors and sealing interfaces', 'injector hold-down hardware', 'high- and low-pressure fuel systems'],
    conflict: 'Exact blow-by evidence is bounded to a 2023-2025 hold-down failure and does not validate the frozen combined identity across all engines and years.',
    evidence: ['11034406 identifies injector hold-down fracture and combustion-gas leakage on 2023-2025 Sprinters.', '10177550 and 10232322 show injector-related faults can arise from a different EGR-condensation path.', 'No reviewed record supports replacing every injector washer simultaneously.'],
    summary: 'Held the overbroad injector/Black Death identity and separated distinct fuel-system causes.',
  },
  [IDS.glowPlug]: {
    description: 'The targeted Sprinter corpus returned no exact communication establishing glow-plug failure, seizure or broken-plug extraction risk across OM642, OM651 and OM654 vehicles from 2007-2025. The frozen page prescribes replacement of every plug and anti-seize without an engine-specific Mercedes procedure.',
    solution: 'Preserve glow-system faults and verify battery voltage, coolant temperature, glow-control output, wiring and individual plug resistance under the engine-specific procedure. Obtain the exact removal temperature, torque and thread-treatment instructions before service. Do not buy glow plugs, a controller or extraction kit from this page; the failed circuit, service procedure and VIN fitment are unresolved.',
    symptoms: ['glow-system faults and cold-start conditions documented', 'controller, wiring and individual plug paths tested', 'engine-specific removal procedure verified'],
    systems: ['glow plugs and cylinder head threads', 'glow control module and wiring', 'battery and cold-start control'],
    conflict: 'No exact primary source establishes the frozen failure identity, replacement-as-a-set rule or anti-seize instruction.',
    evidence: ['The targeted corpus returned zero exact glow-plug communications.', 'No reviewed source validates universal replacement of all plugs.', 'No reviewed source validates a universal anti-seize or extraction procedure.'],
    summary: 'Held the unsupported glow-plug identity pending exact engine-specific service evidence.',
  },
  [IDS.slidingDoor]: {
    description: 'Mercedes records establish several distinct sliding-door paths: a lower arrester that does not engage (10033548), debris-induced cable-track cracking (10033644), a carriage leaving the lower guide rail (10160626), and contact-plate faults (11034417). They do not establish universal upper/center roller wear, 50,000-mile onset or replacement of all three rollers across 2007-2025.',
    solution: 'Identify where the door binds or loses alignment and inspect the arrester, cable track, guide rail, carriages, rollers, contact plates and adjustment before replacement. Remove debris and follow the exact door-alignment procedure. Do not buy a roller set, track, cable carrier or contact plate from this page; the failed assembly, door configuration and VIN fitment are unresolved.',
    symptoms: ['binding location and door alignment documented', 'arrester, carriage, roller and cable-track paths separated', 'contact and latch faults checked independently'],
    systems: ['sliding-door carriages and guide rails', 'roller, arrester and cable track', 'door contacts, latch and alignment'],
    conflict: 'Exact evidence describes distinct components and bounded years, not the frozen universal roller-wear identity and replace-all remedy.',
    evidence: ['10033548 identifies an inoperative lower sliding-door arrester.', '10033644 identifies cable-track cracking from cargo debris.', '10160626 and 11034417 identify separate carriage and contact-plate paths.'],
    summary: 'Held the combined roller identity and separated the documented door mechanisms.',
  },
  [IDS.resonator]: {
    description: 'The targeted Sprinter corpus returned no exact communication establishing a plastic turbo-resonator crack across 2007-2018 OM642 vans. The frozen page asserts a common 60,000-100,000-mile failure and says the OEM part will crack again while directing every owner to an aluminum aftermarket part; none of those claims is supported by the reviewed primary corpus.',
    solution: 'Preserve boost and air-mass faults and smoke-test the complete charge-air system under load-equivalent pressure. Inspect hoses, seals, joints, charge-air cooler, resonator or charge pipe, sensors and turbo control before replacement. Do not buy an aluminum resonator, OEM resonator, hose or seal from this page; the leak location, installed design and VIN fitment are unresolved.',
    symptoms: ['boost fault and operating condition documented', 'complete charge-air path smoke-tested', 'resonator, hose, seal, cooler and control paths separated'],
    systems: ['turbo resonator or charge pipe', 'charge-air hoses and cooler', 'boost sensing and turbo control'],
    conflict: 'No exact primary source establishes the frozen resonator identity, mileage claim or aftermarket-only remedy.',
    evidence: ['The targeted corpus returned zero exact turbo-resonator or boost-leak communications.', 'No reviewed record validates the stored mileage range.', 'No reviewed record supports the claim that every OEM replacement will fail again.'],
    summary: 'Held the unsupported turbo-resonator identity and removed the aftermarket-only direction.',
  },
});

function citationsFor() { return [{ url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type, title: OTHER_SOURCES.datasets.title }]; }
function actionFor(id) { return RETAIN_IDS.includes(id) ? 'retain_indexed_identity_accuracy_cleanup_proposal' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; }
function commerceDecisionFor(id) {
  const labels = {
    [IDS.transmission]: 'transmission', [IDS.dpf]: 'DPF', [IDS.egr]: 'EGR', [IDS.swirl]: 'intake-runner', [IDS.balancer]: 'crank-pulley', [IDS.oilCooler]: 'oil-leak', [IDS.corrosion]: 'body-corrosion', [IDS.turboActuator]: 'boost-control', [IDS.def]: 'DEF/SCR', [IDS.injector]: 'injector', [IDS.glowPlug]: 'glow-system', [IDS.slidingDoor]: 'sliding-door', [IDS.resonator]: 'charge-air leak',
  };
  return `${labels[id]} path and VIN fitment are unresolved; no universal retail part`;
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return { ...frozen, description: content.description, solution: content.solution, confidence: RETAIN_IDS.includes(before.id) ? 'high' : 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.systems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'Sprinter').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 13 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen Sprinter coverage does not match the 13-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record); const proposal = proposalFor({ id: record.id, ...before }); const held = BLOCKER_IDS.includes(record.id);
    return { id: record.id, action: actionFor(record.id), identityReviewRequired: held, identityConflict: CONTENT[record.id].conflict || null, reason: held ? 'The frozen identity materially exceeds exact primary evidence and remains published pending review.' : 'Exact primary evidence supports the indexed issue identity after narrowing unsupported scope, owner-count and remedy claims.', evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, mileage threshold, universal mechanism or retail fitment is inferred.' }, commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'Sprinter', completionStatement: 'All thirteen frozen Sprinter pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Twelve frozen identities materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.', 'All thirteen pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.', 'Five positive report counts are proposed as zero and eight existing zero counts remain zero; no owner population is inferred.', 'Unknown owner totals are never rendered or written as "0+ owners" social proof.', 'Manufacturer-communication and recall populations are not converted into owner-report totals.', 'No PDF is selected because row-level NHTSA data is sufficient.', 'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.', 'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.', 'The resistor-bypass and aftermarket-only repair directions are explicitly prohibited or removed.'],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [{ code: 'sprinter-identity-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact manufacturer evidence supports the generic DEF/SCR fault identity with diagnosis-first boundaries.' }, { code: 'sprinter-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Twelve frozen identities materially exceed exact row-level evidence or immutable scope.' }, { code: 'sprinter-owner-counts-zeroed', severity: 'accuracy-cleanup', recordIds: frozenRows.filter((row) => row.reportCount > 0).map((row) => row.id), detail: 'Five unsupported positive owner-report counts are proposed as zero.' }, { code: 'sprinter-unsafe-remedies-removed', severity: 'safety', recordIds: [IDS.dpf, IDS.swirl, IDS.resonator], detail: 'Universal forced regeneration, resistor bypass and aftermarket-only replacement directions are removed.' }, { code: 'all-sprinter-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Sprinter page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' }],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_accuracy_cleanup_proposal: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 12, positive_report_counts_proposed_zero: 5, report_counts_preserved_zero: 8, total: 13 }, rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, CONTENT, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
