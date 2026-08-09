/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-glc-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  hybrid: 'mercedes-benz-glc-48v-mild-hybrid-integrated-starter-generator-failure',
  cam: 'mercedes-benz-glc-cold-start-camshaft-adjuster-rattle',
  pcv: 'mercedes-benz-glc-crankcase-vent-valve-failure-engine-harness-oil-contaminatio',
  diesel: 'mercedes-benz-glc-diesel-timing-chain-tensioner-seal-oil-leak-chain-stretch',
  fuel: 'mercedes-benz-glc-fuel-pump-shutdown-causing-loss-drive-power',
  brake: 'mercedes-benz-glc-rear-brake-squeal-premature-rear-pad-wear',
  steering: 'mercedes-benz-glc-steering-coupling-bolt-loosening-loss-steering-control',
  transmission: 'mercedes-glc-9g-tronic-harsh-shifting-2016',
  suspension: 'mercedes-glc-air-suspension-compressor-2020',
  mbux: 'mercedes-glc-mbux-infotainment-freeze-2020',
  roof: 'mercedes-glc-panoramic-sunroof-creak-2016',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.fuel, IDS.steering].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.transmission, IDS.suspension, IDS.mbux, IDS.roof].sort());
const MODEL_ALIASES = Object.freeze([
  'GLC-CLASS', 'GLC CLASS', 'GLC300', 'GLC 300', 'GLC350E', 'GLC 350E',
  'GLC43 AMG', 'GLC 43 AMG', 'AMG GLC43', 'AMG GLC 43', 'GLC63 AMG',
  'GLC 63 AMG', 'AMG GLC63', 'AMG GLC 63', 'GLC220D', 'GLC 220D', 'GLC250D', 'GLC 250D',
]);
const SEARCH_TERMS = Object.freeze([
  '48V', 'starter generator', 'ISG', 'on-board electrical', 'camshaft', 'adjuster',
  'rattle', 'crankcase', 'ventilation', 'PCV', 'oil contamination', 'timing chain',
  'tensioner', 'fuel pump', 'impeller', 'brake', 'squeal', 'pad wear', 'steering coupling',
  'steering bolt', '9G-Tronic', '725.0', 'harsh shift', 'jerk', 'AIRMATIC',
  'air suspension', 'compressor', 'MBUX', 'infotainment', 'freeze', 'reboot',
  'sunroof', 'panoramic', 'creak',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10135720', '10231024', '10241531', '10243306', '10244745', '11005276',
  '11013091', '11013336', '11014593', '11018530', '11018714', '11023194',
  '11024405', '11025560', '11028270',
]);
const CAMPAIGNS = Object.freeze([
  '16V146000', '16V603000', '17V114000', '17V177000', '17V251000', '17V574000',
  '17V627000', '17V715000', '17V819000', '18V177000', '18V208000', '18V610000',
  '18V683000', '18V838000', '18V840000', '18V905000', '19V540000', '19V685000',
  '19V787000', '19V788000', '19V822000', '19V914000', '20V068000', '20V328000',
  '20V364000', '20V395000', '20V651000', '20V776000', '21V058000', '21V072000',
  '21V197000', '21V230000', '21V354000', '21V527000', '21V961000', '22V232000',
  '22V261000', '22V365000', '23V445000', '23V629000', '23V741000', '23V854000',
  '23V878000', '23V880000', '24V070000', '24V115000', '24V520000', '24V658000',
  '24V808000', '24V862000', '25V255000', '25V365000', '25V379000', '25V533000',
  '26V172000', '26V281000', '26V481000',
]);
const PDF_SOURCES = Object.freeze({
  fuelRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 23V-445: fuel-pump shutdown',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V445-5736.PDF',
    localPath: 'C:/tmp/mercedes-glc-sources/23V445.pdf', pages: 14,
    visualPages: [3, 10, 11, 14], bytes: 233226,
    sha256: '3a8005e683e44f9fa37e5205b4fe47910b644cd5d1bbd1a24ba8458497c14516',
  },
  steeringRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 25V-533: steering-coupling bolt',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V533-9341.pdf',
    localPath: 'C:/tmp/mercedes-glc-sources/25V533.pdf', pages: 8,
    visualPages: [2, 3, 5, 7], bytes: 730311,
    sha256: 'c59dca007aa8bc45cb4a6deae6db49429765c60d8fda5b2753dff87d876a8b9e',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 2, '2015-2019': 181, '2020-2024': 742, '2025-2026': 765 },
  totalRows: 1690, relevantRowCount: 520, uniqueRelevantCommunications: 186,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 3087 },
  totalRows: 3087, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.hybrid]: {
    description: 'The reviewed GLC records support several narrower 48-volt battery and software conditions, but they do not establish the frozen integrated starter-generator failure identity. Communication 11023194 concerns a fault caused by a software-update anomaly in the 48V battery on model-year 2020-2022 GLC 300 vehicles. Communications 10243306 and 11000615 concern a 12V warning, bus activity and charging/software steps on 2023-2024 vehicles. None identifies an ISG failure, transmission removal, a loose or overheating 48V ground, stalling, fire risk or a shared 2020-2023 root cause. The title therefore exceeds the exact evidence.',
    solution: 'Preserve all 12V and 48V fault codes, software versions and onboard electrical data. Test both batteries and follow the VIN- and code-specific Mercedes procedure before identifying a failed component. Do not buy an integrated starter-generator, 48V battery, ground cable or charging component from this page; the failed path and fitment are not established.',
    symptoms: ['12V and 48V messages documented separately', 'software and fault-code state preserved', 'battery, wiring and power-electronics paths tested'],
    affectedSystems: ['48V onboard electrical system', '12V battery and vehicle bus', 'powertrain software'],
    conflict: 'Exact records describe battery/software conditions, not the frozen ISG-failure identity or its combined safety claims.',
    evidence: ['11023194 is a 48V battery software-update anomaly, not ISG failure.', '10243306/11000615 prescribe 12V/48V charging and software checks.', 'No exact record supports transmission removal, stalling, fire or a universal failed part.'],
    summary: 'Held the unsupported ISG-failure identity and separated exact battery/software records from inferred hardware and safety claims.', sources: ['datasets'],
  },
  [IDS.cam]: {
    description: 'The reviewed GLC manufacturer-communication and recall corpus does not establish the frozen M274/M264 cold-start camshaft-adjuster rattle identity across model years 2016-2023. Exact camshaft-related records found in the corpus concern different conditions, including valve-seat leakage on 2019-2023 GLC 300 vehicles and a later central-valve/filter-screen issue on 2026 vehicles. Neither proves a worn locking pin, a two-to-four-second cold rattle, oil migration from a solenoid, the stored DTC bundle or universal adjuster replacement.',
    solution: 'Record the cold-start sound and duration and preserve camshaft-correlation, oil-pressure and mixture faults. Confirm the engine code, then separate camshaft adjustment, chain timing, valve-seat leakage, accessory drive and oil-pressure causes using the applicable Mercedes procedure. Do not buy an adjuster, magnet, solenoid, chain or engine part from this page; the identity and fitment are not established.',
    symptoms: ['cold-start sound recorded', 'engine and fault codes confirmed', 'timing, valve and accessory paths separated'],
    affectedSystems: ['camshaft adjustment', 'engine timing', 'oil-pressure control'],
    conflict: 'No exact reviewed primary source supports the frozen two-engine cold-start adjuster-rattle identity.',
    evidence: ['The exact GLC corpus contains no matching M274/M264 cold-start locking-pin bulletin.', '11028267/11030302 concern valve-seat leakage, a different mechanism.', 'No source supports the stored duration, DTC set or universal replacement.'],
    summary: 'Held the unsupported cold-start adjuster identity and replaced universal parts advice with engine-specific diagnosis.', sources: ['datasets'],
  },
  [IDS.pcv]: {
    description: 'Mercedes communications directly support a partial-load crankcase-ventilation valve malfunction and P052E71 on certain earlier GLC 300 vehicles, with a 15-year/150,000-mile intake-line-assembly warranty extension. Communications 11005276 and 11018530 support model-year 2016-2018 GLC 300 coverage and guided testing before intake-line replacement. The frozen page also includes model year 2019, which the exact GLC 300 applicability reviewed here does not establish. It further claims oil wicks through the harness and may require harness replacement, while 11018530 states that finding oil at the electrical connection does not by itself justify replacing the engine harness or control unit.',
    solution: 'Preserve P052E71 and other fault data, follow the guided test and check the VIN for extended-warranty coverage. Replace the intake-line assembly only when the Mercedes test directs it. Oil at the connector alone is not authorization to replace the engine harness or control unit. Do not buy an intake line, PCV valve, harness or control unit from this page; eligibility and parts are VIN- and test-specific.',
    symptoms: ['P052E71 and related faults preserved', 'guided test completed', 'VIN checked for warranty coverage'],
    affectedSystems: ['partial-load crankcase ventilation', 'intake line assembly', 'engine electrical connection'],
    conflict: 'Exact evidence supports a narrower 2016-2018 intake-line condition and contradicts automatic harness replacement; frozen model year 2019 is unsupported.',
    evidence: ['10241531 documents the 15-year/150,000-mile intake-line warranty extension.', '11005276 supports 2016-2018 GLC 300 guided testing.', '11018530 says oil at the connection alone does not require harness or control-unit replacement.'],
    summary: 'Bounded the PCV condition to exact guided-test and warranty evidence while holding the overbroad year and harness claims.', sources: ['datasets'],
  },
  [IDS.diesel]: {
    description: 'The frozen page combines an OM651 timing-chain-tensioner seal leak, chain stretch and multiple unrelated diesel-system conditions on EU-market GLC 220d/250d vehicles. The reviewed U.S. NHTSA GLC corpus does not contain an exact Mercedes communication establishing that bundled identity, its 2016-2019 applicability or the claimed German recall population. Absence from the U.S. corpus is not proof that a European condition does not exist; exact market-specific Mercedes or authority evidence is required before approving the identity or remedy.',
    solution: 'Confirm the VIN, market and engine code, document the leak location and measure chain timing before selecting a repair. Diagnose injector, swirl-flap, EGR, DPF and oil-cooler concerns as separate systems. Do not buy a tensioner, seal, chain, injector, EGR, DPF or oil-cooler part from this page; market coverage, failed component and fitment are not established.',
    symptoms: ['market and engine code confirmed', 'oil leak source identified', 'chain timing and diesel subsystems tested separately'],
    affectedSystems: ['OM651 timing drive', 'engine oil sealing', 'diesel emissions and induction'],
    conflict: 'No exact market-specific primary source supports the frozen multi-system diesel identity or cited recall claim.',
    evidence: ['The U.S. corpus does not cover the frozen EU diesel trims as one condition.', 'The page merges timing, injector, swirl-flap, EGR/DPF and oil-cooler claims.', 'Market-specific Mercedes or authority documentation is required.'],
    summary: 'Held the bundled EU diesel identity and separated unrelated systems pending market-specific evidence.', sources: ['datasets'],
  },
  [IDS.fuel]: {
    description: 'Recall 23V445 directly covers 43,257 model-year 2021-2023 GLC 300 vehicles with fuel-pump impellers that may not meet material specifications. An affected impeller may deform, contact the pump housing and create mechanical resistance; in some instances the fuel pump can shut down and the vehicle can lose propulsion, increasing crash risk. A warning message or rough running may occur before shutdown. The 43,257-vehicle population is not an owner-report count.',
    solution: 'Check the VIN for recall 23V445 and have an authorized Mercedes-Benz dealer replace the fuel-delivery module when eligible. Do not buy a fuel pump or delivery module from this page; recall eligibility and the correct module are VIN-specific.',
    symptoms: ['VIN checked for recall 23V445', 'warning message and rough running documented', 'loss-of-propulsion risk treated as safety-critical'],
    affectedSystems: ['fuel delivery module', 'fuel-pump impeller', 'engine fuel supply'],
    conflict: null,
    evidence: ['Rendered page 3 lists 43,257 model-year 2021-2023 GLC 300 vehicles.', 'Rendered pages 10-11 identify the impeller material deviation, shutdown and propulsion-loss risk.', 'Rendered page 14 prescribes dealer replacement of the fuel-delivery module.'],
    summary: 'Retained the exact 23V445 fuel-pump shutdown identity with VIN-specific recall and parts boundaries.', sources: ['fuelRecall'],
  },
  [IDS.brake]: {
    description: 'The reviewed GLC communications do not establish the frozen combined rear-brake squeal and premature rear-pad-wear identity. Communication 10135720 supports front-axle squeal at low temperatures on early GLC 300 vehicles, not rear brakes. Later communications describe AMG service-brake noise as frictional vibration or low-speed groan as normal behavior, and 11024405 says replacing brake components will not rectify that normal condition. No exact record supports moisture in drilled rotors, parking-brake actuation as the cause of rear-pad wear, a 2020 pad redesign or universal aftermarket-pad replacement.',
    solution: 'Measure all pad and rotor thicknesses, identify the axle and reproduce the sound under documented temperature, speed and brake-pressure conditions. Distinguish normal friction noise from wear, contamination, hardware, caliper and parking-brake faults. Do not buy pads, rotors, calipers or parking-brake parts from this page; the frozen rear-wear identity and fitment are not established.',
    symptoms: ['noise axle and conditions documented', 'pad and rotor thickness measured', 'wear and normal friction noise separated'],
    affectedSystems: ['service brakes', 'rear brake wear', 'electronic parking brake'],
    conflict: 'Exact records support front-axle or other narrower brake-noise conditions, not the frozen rear squeal/premature-wear identity.',
    evidence: ['10135720 identifies front-axle low-temperature squeal.', '11024405 says a low-pressure groan can be normal and parts replacement will not rectify it.', 'No record supports the stored rear-wear mechanism or 2020 redesign.'],
    summary: 'Held the combined rear-brake identity and separated exact brake-noise records from unsupported wear and parts claims.', sources: ['datasets'],
  },
  [IDS.steering]: {
    description: 'Recall 25V533 directly covers model-year 2023-2026 GLC 300 and GLC 300 4MATIC vehicles whose steering-coupling bolt may not have been torqued to production specifications. The connection can loosen over time, potentially causing loss of steering control and increasing crash risk. The report lists 1,686 GLC 300 4MATIC and 677 GLC 300 vehicles; those are recall populations, not owner-report totals.',
    solution: 'Check the VIN for recall 25V533 and have an authorized Mercedes-Benz dealer rework the steering-coupling bolt connection when eligible. Do not buy a bolt, nut, coupling or steering rack from this page; recall eligibility and the prescribed rework are VIN-specific.',
    symptoms: ['VIN checked for recall 25V533', 'steering noise or looseness documented', 'recall rework completed by an authorized dealer'],
    affectedSystems: ['steering coupling', 'steering rack connection', 'steering control'],
    conflict: null,
    evidence: ['Rendered pages 2-3 list exact 2023-2026 GLC 300 4MATIC and GLC 300 populations.', 'Rendered page 5 identifies the undertorqued bolt and steering-control risk.', 'Rendered page 7 prescribes dealer rework of the bolt connection.'],
    summary: 'Retained the exact 25V533 steering-coupling identity with correct populations and VIN-specific dealer remedy.', sources: ['steeringRecall'],
  },
  [IDS.transmission]: {
    description: 'Mercedes communications support narrower 9G-Tronic and drivetrain complaints but not the frozen all-year, two-trim harsh-shifting identity. Communication 11025560 covers an uncomfortable 1-2 shift under light load on a specific M264/725.0 software set. Communication 11028270 identifies light-load vibration from a variable transfer case and warns that it may be mistaken for a harsh shift. Other records require Intelligent Predictive Repair data before parts replacement. None supports one 2016-2022 GLC 300/AMG GLC 43 mechanism, the stored 2-1 bundle, parking-lot explanation, adaptation-reset guarantee, valve-body fallback, mileage range, repair price or 2,000-owner count.',
    solution: 'Record the exact gear, load, temperature and drive mode and preserve EEPROM, VGS, engine and transfer-case faults. Confirm the transmission and software version and separate transmission shift quality from transfer-case vibration and engine-running concerns. Do not buy a valve body, control unit, transmission or fluid kit from this page; the condition and fitment are not universal.',
    symptoms: ['gear and operating conditions documented', 'VGS and drivetrain data preserved', 'transmission and transfer-case paths separated'],
    affectedSystems: ['725-series automatic transmission', 'transmission software and adaptation', 'variable transfer case'],
    conflict: 'Exact records cover narrower software-specific shifts and transfer-case vibration, not the frozen broad identity.',
    evidence: ['11025560 covers a narrower M264/725.0 uncomfortable 1-2 shift.', '11028270 says transfer-case vibration may be mistaken for a harsh shift.', 'No source supports the stored 2,000-owner total or universal valve-body remedy.'],
    summary: 'Held the broad 9G-Tronic identity and separated exact software and transfer-case conditions from unsupported claims.', sources: ['datasets'],
  },
  [IDS.suspension]: {
    description: 'Communication 10231024 supports a narrow AIRMATIC compressor condition on model-year 2017-2022 AMG GLC 43 vehicles: moisture can freeze below zero, block the compressor, trigger the 40A fuse and prevent correct level adjustment. The frozen page instead spans 2020-2025 GLC 300 4MATIC, AMG GLC 43 and AMG GLC 63 vehicles and claims compressor overheating from air-spring leaks. The exact record does not establish those additional trims/years, that mechanism, all-four-spring inspection, the Arnott P-3508 fitment, mileage range, repair price or 400-owner count.',
    solution: 'Document ambient temperature, vehicle level, compressor operation, fuse state and stored AIRMATIC faults. Leak-test the system and follow the VIN-specific Mercedes procedure before identifying a compressor or another component. Do not buy a compressor, relay, fuse, air spring or Arnott P-3508 from this page; the frozen scope and fitment are not established.',
    symptoms: ['ambient temperature and vehicle level documented', 'compressor, fuse and relay tested', 'air leaks and control faults checked'],
    affectedSystems: ['AIRMATIC compressor', 'air-suspension pressure supply', 'vehicle level control'],
    conflict: 'The exact cold-weather AMG GLC 43 record is narrower than the frozen multi-trim 2020-2025 compressor-failure identity.',
    evidence: ['10231024 identifies frozen moisture, a 40A fuse and a specific AMG GLC 43 remedy.', 'It does not establish compressor overheating from air-spring leaks.', 'No source supports Arnott P-3508 fitment or the stored 400-owner total.'],
    summary: 'Bounded the exact cold-weather compressor record and held the overbroad trim, year, mechanism and aftermarket-part claims.', sources: ['datasets'],
  },
  [IDS.mbux]: {
    description: 'Mercedes communications support distinct MBUX conditions but not the frozen generic 2020-2025 freeze identity. Communications 11014593, 11015813 and 11016159 cover a red-box system-inoperative condition and software updates. Communication 11018714 documents CarPlay interruptions with multiple possible hardware, software and environmental causes. Other exact records cover navigation, Bluetooth, hard-drive and display symptoms separately. None establishes one freeze/reboot/black-screen/CarPlay/voice-assistant mechanism, the stored reboot-button procedure, automatic head-unit replacement, mileage range, repair price or 700-owner count.',
    solution: 'Document the exact failed function, screen state, software version, voltage history and fault codes. Follow the symptom- and VIN-specific Mercedes software, logging, wiring, display or storage path. Do not buy a head unit, display, hard drive, control module or battery from this page; the failed path and fitment are not established.',
    symptoms: ['exact multimedia symptom documented', 'software and voltage state preserved', 'connectivity, display and storage paths separated'],
    affectedSystems: ['MBUX multimedia system', 'central display', 'phone connectivity and software'],
    conflict: 'Exact records cover multiple distinct conditions, not one generic 2020-2025 MBUX-freeze identity.',
    evidence: ['11014593/11015813/11016159 cover a red-box system-inoperative condition.', '11018714 lists multiple causes for CarPlay interruption.', 'No source supports the stored 700-owner total or universal head-unit replacement.'],
    summary: 'Held the bundled MBUX identity and replaced universal reboot/replacement advice with symptom-specific diagnosis.', sources: ['datasets'],
  },
  [IDS.roof]: {
    description: 'The reviewed GLC communications do not establish the frozen 2016-2023 panoramic-sunroof creak and rattle identity. Communications 10244745 and 11013336 concern a panoramic panel reversing during closure because of sensitive parameterization or mechanism tolerances, not creaking over bumps or in cold weather. No exact record supports the stored glass-versus-frame expansion mechanism, silicone lubricant, felt tape, twice-yearly service, mileage range, repair price or 1,100-owner count. A reversal condition cannot be relabeled as a roof-noise defect.',
    solution: 'Reproduce and locate the sound at the glass, shade, rails, seals, headliner or body structure and document temperature and road inputs. Diagnose closing reversal separately with the panoramic-roof control-unit procedure. Do not buy lubricant, felt tape, seals, glass, rails or a roof cassette from this page; the creak identity and fitment are not established.',
    symptoms: ['noise location isolated', 'temperature and road inputs documented', 'noise and closing-reversal conditions separated'],
    affectedSystems: ['panoramic roof', 'roof seals and rails', 'roof control unit'],
    conflict: 'Exact records concern closing reversal, not the frozen creak/rattle identity or its mechanism.',
    evidence: ['10244745 and 11013336 identify panoramic-panel reversal during closure.', 'Neither supports creaking, lubricant or felt-tape remedies.', 'No source supports the stored 1,100-owner total.'],
    summary: 'Held the unsupported panoramic-roof noise identity and separated it from exact closing-reversal records.', sources: ['datasets'],
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title }; }); }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function commerceDecisionFor(id) {
  const values = {
    [IDS.hybrid]: '48V failure path and fitment are unresolved; no universal retail part',
    [IDS.cam]: 'camshaft-noise identity and engine-specific fitment are unresolved; no universal retail part',
    [IDS.pcv]: 'warranty eligibility, guided-test result and parts are VIN-specific; no universal retail part',
    [IDS.diesel]: 'market coverage, failed diesel path and fitment are unresolved; no universal retail part',
    [IDS.fuel]: 'recall eligibility and fuel-delivery module are VIN-specific; no universal retail part',
    [IDS.brake]: 'rear-brake wear identity and fitment are unresolved; no universal retail part',
    [IDS.steering]: 'recall eligibility and steering-coupling rework are VIN-specific; no universal retail part',
    [IDS.transmission]: 'shift condition and transmission fitment are unresolved; no universal retail part',
    [IDS.suspension]: 'AIRMATIC condition and compressor fitment are unresolved; no universal retail part',
    [IDS.mbux]: 'multimedia failure path and hardware fitment are unresolved; no universal retail part',
    [IDS.roof]: 'roof-noise source and component fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution,
    confidence: RETAIN_IDS.includes(before.id) ? 'high' : 'low', symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null,
    estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(before.id), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(before.id) ? 0 : before.reportCount,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLC').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 11 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen GLC coverage does not match the 11-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained, identityConflict: CONTENT[record.id].conflict,
      reason: retained ? 'Exact primary evidence supports the frozen identity while narrower population and remedy boundaries replace unsupported generalizations.' : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLC',
    completionStatement: 'All 11 frozen GLC pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Nine identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 11 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 2,000-, 400-, 700- and 1,100-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'glc-two-recall-identities-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact Part 573 evidence supports the fuel-pump and steering-coupling identities with VIN-specific remedies.' },
      { code: 'glc-nine-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Nine titles or frozen applicability sets exceed exact primary evidence.' },
      { code: 'glc-pcv-harness-claim-conflict', severity: 'scope-conflict', recordIds: [IDS.pcv], detail: 'Mercedes says connector oil alone does not justify harness/control-unit replacement; exact GLC 300 coverage reviewed is 2016-2018, not frozen 2019.' },
      { code: 'glc-drivetrain-conditions-separated', severity: 'accuracy-cleanup', recordIds: [IDS.hybrid, IDS.cam, IDS.transmission], detail: 'Battery/software, valve, transmission and transfer-case evidence remains distinct from frozen combined identities.' },
      { code: 'glc-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 2,000-, 400-, 700- and 1,100-owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-glc-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLC page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 4, total: 11 },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor,
  commerceDecisionFor, proposalFor,
};
