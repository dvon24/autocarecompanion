/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-gla-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  battery: 'mercedes-benz-gla-12v-battery-parasitic-drain-no-start-after-sitting',
  dct: 'mercedes-benz-gla-7g-dct-dual-clutch-transmission-shudder-mechatronics-failure',
  diesel: 'mercedes-benz-gla-diesel-egr-dpf-clogging-adblue-system-faults',
  timing: 'mercedes-benz-gla-m270-m274-timing-chain-stretch-tensioner-wear',
  infotainment: 'mercedes-benz-gla-mbux-comand-infotainment-black-screen-reboot',
  roof: 'mercedes-benz-gla-panoramic-sunroof-spontaneous-shattering-front-roof-panel-de',
  differential: 'mercedes-benz-gla-rear-differential-carrier-whine-clunk-4matic-models',
  transfer: 'mercedes-gla-transfer-case-noise-awd-2015',
  turboCoolant: 'mercedes-gla-turbo-coolant-line-leak-2015',
  waterPump: 'mercedes-gla-water-pump-failure-2015',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.battery]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.transfer, IDS.turboCoolant, IDS.waterPump].sort());
const MODEL_ALIASES = Object.freeze([
  'GLA-CLASS', 'GLA CLASS', 'GLA250', 'GLA 250', 'GLA35 AMG', 'GLA 35 AMG',
  'AMG GLA35', 'AMG GLA 35', 'GLA45 AMG', 'GLA 45 AMG', 'AMG GLA45', 'AMG GLA 45',
  'GLA 180', 'GLA180', 'GLA 200', 'GLA200', 'GLA 220', 'GLA220', 'GLA 220 CDI',
  'GLA 220D', 'GLA 200D',
]);
const SEARCH_TERMS = Object.freeze([
  '12V', 'battery', 'parasitic', 'no start', '7G-DCT', '724.0', 'transmission', 'shudder',
  'mechatronic', 'EGR', 'DPF', 'AdBlue', 'SCR', 'NOx', 'M270', 'M274', 'timing chain',
  'camshaft', 'MBUX', 'COMAND', 'black screen', 'reboot', 'rearview camera', 'sunroof',
  'roof panel', 'panoramic', 'differential', 'rear axle', 'transfer case', 'power take-off',
  'turbo coolant', 'coolant line', 'water pump', 'coolant pump', 'overheat',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10135663', '10135679', '10135682', '10136102', '10151943', '10157073', '10157076',
  '10157086', '10158199', '10158370', '10199660', '10217159', '10225807', '11018206',
  '11019636', '11026832', '11027781',
]);
const CAMPAIGNS = Object.freeze([
  '15V662000', '17V080000', '17V114000', '17V627000', '17V653000', '18V405000',
  '18V912000', '19V132000', '19V585000', '19V787000', '20V672000', '21V033000',
  '21V058000', '21V072000', '21V102000', '21V197000', '21V229000', '21V354000',
  '21V961000', '22V125000', '22V232000', '22V365000', '23V662000', '23V732000',
  '23V854000', '25V511000', '26V134000', '26V481000',
]);
const PDF_SOURCES = Object.freeze({
  mbuxRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-354: MBUX black display/reboot and rearview image',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V354-4001.PDF',
    localPath: 'C:/tmp/mercedes-a-class-sources/21V354.pdf',
    pages: 18,
    visualPages: [9, 10, 14, 17],
    bytes: 239852,
    sha256: '3edd6ec964310c55d20799bd698c9ad71a57b99c9404e9000b2e5f1da08c6dc7',
  },
  roofRecall: {
    title: 'Mercedes-Benz owner notice / NHTSA 21V-197: front stationary panoramic-roof panel detachment',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RIONL-21V197-4284.pdf',
    localPath: 'C:/tmp/mercedes-cla-sources/21V197.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 134964,
    sha256: 'd150d56ef9e063da3a78053fd4cb9d2d1d122f87f0e9c1caca8d141f71ca659d',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 4, '2015-2019': 118, '2020-2024': 358, '2025-2026': 521 },
  totalRows: 1001,
  relevantRowCount: 426,
  uniqueRelevantCommunications: 156,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 2340 },
  totalRows: 2340,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.battery]: {
    description: 'Mercedes communications directly support discharged 12V starter batteries and no-start conditions on both GLA generations. Communications 10157073, 10157076, 10158199 and 10158370 cover discharged batteries, no-start complaints and excessive quiescent current on earlier GLA vehicles. Communication 10217159 identifies a later bus-keepawake path in the headlamp, ALC, instrument cluster, SAM, PTCU or ESP control units, with U116000 and a software-first remedy. Communication 11018206 warns that a discharged battery does not automatically require replacement and requires onboard-data analysis to identify the cause. These records do not establish one universal relay, charging-strategy or 48V-battery cause for every 2015-2023 GLA.',
    solution: 'Preserve the initial quick test and onboard electrical data before charging or disconnecting the battery. Measure quiescent current, identify any bus-keepawake control unit and follow its VIN-specific software or circuit path; separately test battery health after charging. Do not buy a battery, relay, SAM, headlamp module or 48V component from this page; the discharge cause and fitment must be established first.',
    symptoms: ['12V state of charge and no-start condition documented', 'quiescent current or bus-keepawake path identified', 'battery health tested after controlled charging'],
    affectedSystems: ['12V starter battery', 'vehicle bus and control units', 'charging and power management'],
    conflict: null,
    evidence: ['10157073/10157076/10158199/10158370 support discharged-battery and no-start conditions on earlier GLA vehicles.', '10217159 supports a later bus-keepawake condition and software-first diagnosis.', '11018206 requires charging and onboard-data analysis rather than automatic battery replacement.'],
    summary: 'Retained the exact 12V drain/no-start identity while replacing universal relay, charging and 48V claims with generation-specific diagnosis.',
    sources: ['datasets'],
  },
  [IDS.dct]: {
    description: 'The reviewed GLA communications do not establish the frozen combined 7G-DCT shudder, clutch-slip and mechatronics-failure identity. Communications 10136102, 10151943 and 10157086 address a cold scratching noise when shifting from drive to reverse, while 10135679 and 10135682 concern specific stored faults or voltage fluctuation. Communication 11026832 says oil residue in a 724.0/724.1 connector is non-conductive production-test oil, causes no technical impairment and requires no parts. None supports the stored 40,000-75,000-mile onset, fluid-service interval, rapid no-drive progression or universal clutch-pack/mechatronics replacement.',
    solution: 'Record the exact shift, temperature, load, fault codes and whether the complaint is scratching, shudder, slip or delayed engagement. Follow the VIN- and transmission-specific XENTRY path and separate voltage, software, clutch, hydraulic and mechanical causes. Do not buy a clutch pack, mechatronics unit, valve body, transmission or fluid kit from this page; no failed component or universal retail fitment is established.',
    symptoms: ['exact shift and temperature reproduced', 'fault codes and voltage history preserved', 'clutch, hydraulic and electrical paths separated'],
    affectedSystems: ['724-series dual-clutch transmission', 'transmission control', 'onboard electrical supply'],
    conflict: 'Exact communications support narrower cold D-to-R noise and fault-code conditions, not the frozen combined shudder/mechatronics-failure identity.',
    evidence: ['10136102/10151943/10157086 concern cold D-to-R scratching noise.', '10135679/10135682 do not prove clutch or mechatronics failure.', '11026832 explicitly says production-test oil residue causes no impairment and requires no replacement.'],
    summary: 'Separated exact cold-shift and electrical records from unsupported shudder, wear, service-interval and mechatronics claims.',
    sources: ['datasets'],
  },
  [IDS.diesel]: {
    description: 'The frozen GLA diesel page combines EGR fouling, DPF restriction, AdBlue crystallization, SCR pressure, NOx-sensor faults and OM651 timing-chain claims across OM651 and OM654 vehicles sold principally outside the United States. The reviewed U.S. NHTSA GLA corpus does not provide an exact Mercedes communication establishing that bundled identity, its 2015-2023 applicability, the stored DTC set or the proposed cleaning and parts-replacement ladder. Absence from the U.S. corpus is not evidence that an EU-market condition does not exist; exact market-specific Mercedes or authority documentation is still required.',
    solution: 'Confirm the VIN, market, engine code, emissions configuration and stored fault codes before diagnosis. Measure soot loading, differential pressure, regeneration history, EGR operation, AdBlue pressure/quality and NOx-sensor behavior as separate systems using market-specific Mercedes procedures. Do not buy an EGR valve, DPF, AdBlue pump, injector, heater, NOx sensor or SCR component from this page; the failed path, legal remedy and fitment are not established.',
    symptoms: ['market and engine code confirmed', 'stored emissions faults and freeze-frame data preserved', 'EGR, DPF and SCR paths tested separately'],
    affectedSystems: ['diesel EGR', 'diesel particulate filter', 'AdBlue/SCR emissions system'],
    conflict: 'No exact reviewed market-specific primary source supports the frozen multi-system diesel identity or full applicability.',
    evidence: ['The U.S. GLA communication inventory does not cover the listed EU diesel trims as an exact bundled condition.', 'The page merges distinct emissions systems and an unrelated timing-chain claim.', 'Exact EU Mercedes or authority evidence is required before approving applicability or a remedy.'],
    summary: 'Held the bundled EU diesel identity and replaced unsupported prevalence, DTC and repair claims with system-by-system diagnosis.',
    sources: ['datasets'],
  },
  [IDS.timing]: {
    description: 'The reviewed GLA corpus does not establish M270/M274 timing-chain stretch and tensioner wear across the frozen engines and years. Communication 10225807 documents a cold chirp or tap caused by timing-drive harmonics on M260-equipped later vehicles, prescribes tensioner A2600502000 and explicitly says the noise causes no engine damage. Recall 15V662 concerns an out-of-specification camshaft weld on certain 2015-2016 GLA vehicles, not chain elongation. Other exact records address M139 valve springs or M270/M274 crankcase-vent contacts. None supports the stored M270/M274/M133 chain-stretch mechanism, mileage range, tone-ring claim or engine-damage progression.',
    solution: 'Record cold-start sound duration and preserve timing-correlation faults before disassembly. Confirm the exact engine code and diagnose chain timing, camshaft adjustment, welded-cam recall eligibility, accessory drive and other noise sources separately. Do not buy a timing chain, tensioner, guide set, camshaft adjuster or engine from this page; the failed component and engine-specific fitment are not established.',
    symptoms: ['engine code and cold-start sound documented', 'timing faults and actual values preserved', 'chain, camshaft and accessory-drive paths separated'],
    affectedSystems: ['engine timing drive', 'camshaft adjustment', 'cold-start noise diagnosis'],
    conflict: 'The only exact timing-drive noise communication is for M260 and explicitly denies engine damage; it does not support the frozen M270/M274/M133 identity.',
    evidence: ['10225807 applies to a narrower M260 timing-drive harmonic and part A2600502000.', '15V662 is a camshaft-weld recall, not timing-chain stretch.', 'No exact record supports the stored mileage, tone-ring mechanism or universal engine-damage warning.'],
    summary: 'Separated M260 harmonics and the camshaft-weld recall from unsupported M270/M274/M133 chain-stretch claims.',
    sources: ['datasets'],
  },
  [IDS.infotainment]: {
    description: 'NHTSA recall 21V354 directly covers model-year 2021 GLA250, GLA35 AMG and GLA45 AMG vehicles whose MBUX software may fail to initialize or reboot about 50 seconds after startup, interrupting the rearview-camera image. The population tables list 22,659 GLA250, 989 GLA35 AMG and 456 GLA45 AMG vehicles; those are recall populations, not owner reports. The recall does not cover 2015-2020 X156 COMAND/Audio 20 systems or establish a continuous 2015-2023 black-screen defect, weak-battery/heat causation, climate-control lockout or Tegra hardware replacement. Because the frozen title joins MBUX and COMAND under the recall identity, it exceeds the exact evidence.',
    solution: 'Check the VIN for recall 21V354 when the vehicle is a 2021 MBUX-equipped GLA and apply the dealer or over-the-air software remedy when eligible. For other screen or reboot complaints, document the system generation, software version, voltage state and exact failed function before following the applicable XENTRY path. Do not buy a head unit, display, Tegra module or battery from this page; recall eligibility and hardware fitment are VIN-specific.',
    symptoms: ['system generation and software version recorded', 'VIN checked for recall 21V354', 'black display, reboot and camera interruption distinguished'],
    affectedSystems: ['MBUX multimedia software', 'rearview camera display', 'COMAND/Audio 20 infotainment'],
    conflict: '21V354 supports a 2021 MBUX camera/display condition, not the frozen MBUX/COMAND identity across 2015-2023.',
    evidence: ['Rendered pages 9-10 list the three 2021 GLA populations.', 'Rendered page 14 establishes black display or reboot after about 50 seconds and interrupted rearview image.', 'Rendered page 17 prescribes dealer or OTA software update; it does not establish COMAND hardware failure.'],
    summary: 'Bounded recall 21V354 to the exact 2021 MBUX populations and held the frozen MBUX/COMAND multi-generation identity.',
    sources: ['mbuxRecall'],
  },
  [IDS.roof]: {
    description: 'The rendered 21V197 owner notice directly covers certain model-year 2014-2020 GLA vehicles with a panoramic sunroof whose stationary front roof panel may not have been bonded correctly during a prior repair. Adhesion can deteriorate and the panel can partly or fully detach, and the dealer remedy is replacement with the approved primer, cleaner and adhesive. That record does not establish spontaneous shattering of the panoramic glass, a glass-strength defect, sunroof-drain leakage or curtain-airbag-contact corrosion. The frozen title combines the supported detached stationary panel with a separate unsupported glass-shattering identity.',
    solution: 'Check the VIN for recall 21V197 and have an authorized Mercedes-Benz dealer complete the free stationary front roof-panel remedy when eligible. Treat a loose front panel as a road-hazard concern. Diagnose cracked panoramic glass and water ingress separately; document impact evidence, crack origin and leak path. Do not buy glass, a roof panel, adhesive or drain parts from this page; recall eligibility and the affected component are VIN-specific.',
    symptoms: ['VIN checked for recall 21V197', 'stationary front panel and panoramic glass distinguished', 'crack origin or water path documented separately'],
    affectedSystems: ['stationary front roof panel', 'panoramic sunroof glazing', 'roof sealing and drainage'],
    conflict: '21V197 supports prior-repair roof-panel detachment, not the frozen combined spontaneous-glass-shattering identity.',
    evidence: ['Rendered page 1 names 2014-2020 GLA-Class vehicles with panoramic sunroofs.', 'It states the stationary panel may have been bonded incorrectly during a prior repair and can detach.', 'The recall notice contains no spontaneous-glass-shattering or drain-corrosion finding.'],
    summary: 'Preserved the exact roof-panel recall evidence while holding the unsupported combined shattering/detachment identity.',
    sources: ['roofRecall'],
  },
  [IDS.differential]: {
    description: 'Mercedes communications support narrower rear-differential conditions but not the frozen all-4MATIC whine/clunk carrier-failure identity. Communication 10135663 records chattering while turning on 2015-2018 AMG GLA45. Communications 11019636 and 11027781 cover slow-cornering noise on 2020-2023 AMG GLA45 caused by a small amount of water entering the left and right multi-plate clutch oil, with an oil-service or vent-hose path. Separate 11000596/11005288/11024632 records concern 4MATIC-inoperative faults and VIN/part-number-specific coupling wear. None establishes broad 2015-2023 GLA250, diesel and AMG whine/clunk from low oil volume, marginal bearings or a universal carrier replacement.',
    solution: 'Reproduce the noise at the exact speed, load and steering angle; isolate tire, wheel, brake, transfer and rear-axle sources. Preserve AWD faults and read the installed differential part number before following the applicable oil, vent, coupling-kit or assembly path. Do not buy a differential, bearing, coupling kit, vent hose or oil from this page; the condition, part number and fitment are not universal.',
    symptoms: ['speed, load and steering angle documented', 'rear differential isolated from tire and transfer noise', 'AWD faults and installed part number preserved'],
    affectedSystems: ['rear axle differential', 'multi-plate AWD clutches', '4MATIC control'],
    conflict: 'Exact records cover distinct AMG cornering-noise and part-number-specific coupling conditions, not the frozen broad carrier-failure identity.',
    evidence: ['10135663 supports AMG GLA45 chattering while turning.', '11019636/11027781 support water in clutch oil and a narrow AMG cornering-noise remedy.', '11000596/11005288/11024632 require installed-part-number checks for separate 4MATIC faults.'],
    summary: 'Separated exact AMG cornering-noise and coupling conditions from unsupported all-model carrier, bearing and fluid claims.',
    sources: ['datasets'],
  },
  [IDS.transfer]: {
    description: 'The reviewed GLA corpus does not establish the frozen 2015-2023 transfer-case-noise identity. Communications 10186133 and 10186134 concern electrical faults or communication errors in the all-wheel-drive transfer-case control unit, while later 4MATIC-inoperative records identify rear-differential coupling adaptation or wear. Exact noise records in this corpus point to the rear axle differential, particularly on AMG GLA45, and cannot be relabeled as transfer-case whine. No primary record supports the stored all-model howling/grinding mechanism, fluid-service remedy, 500-owner count or failure progression.',
    solution: 'Record the speed, load, steering angle, temperature and exact noise location. Preserve AWD faults and isolate tires, wheel bearings, transmission, rear differential and the all-wheel-drive control/coupling path before identifying a transfer component. Do not buy a transfer case, PTU, bearing, coupling or fluid from this page; no transfer-case noise cause or universal fitment is established.',
    symptoms: ['noise operating conditions documented', 'AWD faults preserved', 'rear differential and transfer paths isolated'],
    affectedSystems: ['all-wheel-drive control', 'drivetrain noise', 'rear axle and transfer path'],
    conflict: 'No exact primary source supports transfer-case noise; reviewed noise records identify a different rear-axle path.',
    evidence: ['10186133/10186134 are electrical/communication fault records, not noise findings.', 'Rear-differential communications cannot support a transfer-case title.', 'The stored source has no URL and the 500-owner total is unsupported.'],
    summary: 'Removed unsupported transfer-case noise, fluid, failure-progression and owner-count claims pending identity review.',
    sources: ['datasets'],
  },
  [IDS.turboCoolant]: {
    description: 'Communication 10199660 records a 2020 GLA coolant warning and leak in a coolant line, but its summary does not identify a turbocharger coolant line, the frozen GLA250/M270 application or the cited LI05.20-P-056890 procedure. The reviewed corpus therefore does not establish a 2015-2020 turbo-coolant-line defect, heat-cycling connector mechanism, exact leak location, replacement connector or 1,100-owner count. A generic coolant-line record cannot be promoted into a turbo-specific identity.',
    solution: 'Pressure-test the cooling system cold and hot, trace residue and confirm the exact leak source before selecting a repair. Verify the engine code, VIN and line routing in the Mercedes workshop and parts systems. Do not buy a turbo coolant line, connector, clamp, O-ring or turbocharger from this page; the failed line and fitment are not established.',
    symptoms: ['coolant warning and level documented', 'leak source traced under pressure', 'engine code and line routing confirmed'],
    affectedSystems: ['engine cooling system', 'coolant lines', 'turbocharger cooling path'],
    conflict: 'The only exact communication says coolant-line leak but does not identify the turbo circuit or frozen applicability.',
    evidence: ['10199660 is limited to a 2020 coolant warning and coolant-line leak.', 'The cited LI05.20-P-056890 title and connector remedy were not verified in the exact GLA corpus.', 'No source supports the stored year range, mechanism or owner total.'],
    summary: 'Separated a generic coolant-line communication from unsupported turbo-specific, fitment and owner-count claims.',
    sources: ['datasets'],
  },
  [IDS.waterPump]: {
    description: 'The reviewed GLA manufacturer-communication and recall corpus does not establish a 2015-2020 M270 water-pump-failure identity. Exact cooling records found in the model inventory concern a generic 2020 coolant-line leak or later M139 thermostat/debris procedures, not the frozen GLA250 M270 water pump. No primary record supports the stored bearing/seal mechanism, overheating progression, 45,000-80,000-mile range, replacement ladder, repair price or 800-owner count.',
    solution: 'Pressure-test the cooling system, inspect for external leakage and verify coolant circulation, thermostat control, fan operation and temperature-sensor data before condemning the pump. Confirm the exact engine and VIN in Mercedes workshop and parts systems. Do not buy a water pump, thermostat, belt, tensioner or coolant kit from this page; the failed component and fitment are not established.',
    symptoms: ['coolant loss and leak location documented', 'temperature and circulation data checked', 'pump, thermostat, fan and sensor paths separated'],
    affectedSystems: ['engine cooling system', 'coolant circulation', 'temperature control'],
    conflict: 'No exact reviewed primary source supports the frozen M270 water-pump-failure identity or its 2015-2020 scope.',
    evidence: ['The exact GLA corpus contains no M270 water-pump failure communication.', 'Later M139 thermostat/debris records are a different engine and condition.', 'Forum reports cannot establish the stored population, mileage or universal parts remedy.'],
    summary: 'Removed unsupported M270 water-pump mechanism, mileage, repair and owner-count claims pending identity review.',
    sources: ['datasets'],
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title }; }); }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function commerceDecisionFor(id) {
  return {
    [IDS.battery]: 'discharge cause and component fitment require diagnosis; no universal retail part',
    [IDS.dct]: 'transmission failure path and fitment are unresolved; no universal retail part',
    [IDS.diesel]: 'market-specific emissions fault and legal remedy are unresolved; no universal retail part',
    [IDS.timing]: 'engine timing failure path and fitment are unresolved; no universal retail part',
    [IDS.infotainment]: 'recall eligibility, system generation and hardware fitment are VIN-specific; no universal retail part',
    [IDS.roof]: 'recall eligibility and affected roof component are VIN-specific; no universal retail part',
    [IDS.differential]: 'rear-axle condition, installed part number and fitment are unresolved; no universal retail part',
    [IDS.transfer]: 'transfer-case noise cause and fitment are unresolved; no universal retail part',
    [IDS.turboCoolant]: 'coolant leak source and line fitment are unresolved; no universal retail part',
    [IDS.waterPump]: 'cooling-system failure path and pump fitment are unresolved; no universal retail part',
  }[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before);
  delete frozen.id;
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
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLA').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 10 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen GLA coverage does not match the 10-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[record.id].conflict,
      reason: retained ? 'Exact Mercedes communications support the frozen title while narrower root-cause and replacement boundaries replace unsupported generalizations.' : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLA',
    completionStatement: 'All 10 frozen GLA pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Nine identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 10 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 500-, 1,100- and 800-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'gla-battery-identity-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact early- and later-generation communications support discharged-battery/no-start conditions while requiring distinct diagnostic paths.' },
      { code: 'gla-nine-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Nine titles or frozen applicability sets merge distinct conditions or exceed exact primary evidence.' },
      { code: 'gla-mbux-recall-bounded', severity: 'scope-conflict', recordIds: [IDS.infotainment], detail: '21V354 covers 2021 GLA MBUX populations, not COMAND or every frozen year.' },
      { code: 'gla-roof-recall-bounded', severity: 'identity-conflict', recordIds: [IDS.roof], detail: '21V197 supports prior-repair stationary-panel detachment, not spontaneous panoramic-glass shattering.' },
      { code: 'gla-drivetrain-identities-separated', severity: 'accuracy-cleanup', recordIds: [IDS.dct, IDS.differential, IDS.transfer], detail: 'Cold D-to-R noise, rear-differential cornering noise, coupling faults and transfer-control faults remain distinct.' },
      { code: 'gla-eu-diesel-source-gap', severity: 'manual-source-review', recordIds: [IDS.diesel], detail: 'Exact market-specific Mercedes or authority evidence is required; U.S. NHTSA absence is not treated as disproof.' },
      { code: 'gla-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 500-, 1,100- and 800-owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-gla-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLA page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 3, total: 10 },
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
