/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-m-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  conductor: 'mercedes-benz-m-class-722-9-7g-tronic-conductor-plate-failure-limp-mode',
  booster: 'mercedes-benz-m-class-brake-booster-integrated-brake-light-switch-causing-esp-crui',
  controlArm: 'mercedes-benz-m-class-front-control-arm-bushing-ball-joint-wear',
  m276: 'mercedes-benz-m-class-m276-v6-timing-chain-tensioner-rattle-cold-start',
  swirl: 'mercedes-benz-m-class-om642-diesel-intake-swirl-flap-linkage-failure',
  tailLamp: 'mercedes-benz-m-class-rear-tail-lamp-seal-water-intrusion-destroying-rear-sam-lift',
  airmatic: 'mercedes-m-class-air-suspension-failure-2006',
  balanceShaft: 'mercedes-m-class-m272-balance-shaft-2006',
  oilCooler: 'mercedes-m-class-om642-oil-cooler-leak-2006',
  transferCase: 'mercedes-m-class-transfer-case-chain-wear-2006',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.oilCooler]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([
  IDS.airmatic, IDS.balanceShaft, IDS.oilCooler, IDS.transferCase,
].sort());
const MODEL_ALIASES = Object.freeze([
  'M-CLASS', 'M CLASS', 'ML250', 'ML 250', 'ML280', 'ML 280', 'ML300', 'ML 300',
  'ML320', 'ML 320', 'ML350', 'ML 350', 'ML400', 'ML 400', 'ML450', 'ML 450',
  'ML500', 'ML 500', 'ML550', 'ML 550', 'ML63 AMG', 'ML 63 AMG', 'AMG ML63', 'AMG ML 63',
]);
const SEARCH_TERMS = Object.freeze([
  '722.9', '7G', 'conductor plate', 'speed sensor', 'limp', 'brake booster',
  'brake light switch', 'ESP', 'cruise', 'control arm', 'bushing', 'ball joint',
  'wheel bearing', 'side shaft', 'steering knuckle',
  'M276', 'timing chain', 'tensioner', 'rattle', 'OM642', 'swirl', 'intake',
  'tail lamp', 'tail light', 'water intrusion', 'rear SAM', 'liftgate', 'AIRMATIC',
  'air suspension', 'compressor', 'M272', 'balance shaft', 'sprocket', 'oil cooler',
  'oil leak', 'transfer case', 'chain', 'whine',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10019823', '10020182', '10022893', '10023072', '10023372', '10024724',
  '10028024', '10028025', '10028625', '10032727', '10038024', '10050862',
  '10166980', '10167546', '11010455', '11010818', '11013298', '11020872',
  '11025100', '11028270', '11031629',
]);
const CAMPAIGNS = Object.freeze([
  '00V203000', '00V352000', '01V061000', '01V290000', '02V058000', '02V203000',
  '03V121000', '05V224000', '06V495000', '08V303000', '08V465000', '08V682000',
  '09V076000', '11V208000', '12E028000', '14V762000', '15V351000', '16V081000',
  '16V442000', '16V900000', '17V177000', '18V272000', '19V787000', '22V315000',
  '22V955000', '24V298000', '98V090000', '99V328000',
]);
const PDF_SOURCES = Object.freeze({
  m276Bulletin: {
    title: 'Mercedes XENTRY LI05.10-P-056435: rattling after engine start',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10170532-9999.pdf',
    localPath: 'C:/tmp/mclass-m276.pdf', pages: 9,
    visualPages: Array.from({ length: 9 }, (_, index) => index + 1), bytes: 1364540,
    sha256: '9725eef08bd05dc1fc3be20acc29158caa070ad1e1efb7488884f79d553d401a',
  },
  oilCoolerBulletin: {
    title: 'Mercedes XENTRY LI18.30-P-055434: OM642 oil-cooler seal leak',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10166980-9999.pdf',
    localPath: 'C:/tmp/mclass-om642-oil-cooler.pdf', pages: 3,
    visualPages: [1, 2, 3], bytes: 308432,
    sha256: 'd30ba8905d3e2a8226657e5523c36c623f1bfd00a020c2f4e5cc557f4b29713e',
  },
  brakeRecall: {
    title: 'Mercedes recall launch 24V298: inspect and replace brake booster',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCMN-24V298-8548.pdf',
    localPath: 'C:/tmp/mclass-brake-booster.pdf', pages: 14,
    visualPages: Array.from({ length: 14 }, (_, index) => index + 1), bytes: 1521142,
    sha256: '020024e7d55ae4fe4a7d28a6c0bf19639c6bcc1b95d3144e24d26da3b7034dba',
  },
  tailLampRecall: {
    title: 'Mercedes Part 573 report 09V076: 2009 M-Class rear tail-lamp seal',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2009/RCDNN-09V076-6404.pdf',
    localPath: 'C:/tmp/mclass-tail-lamp.pdf', pages: 3,
    visualPages: [1, 2, 3], bytes: 115020,
    sha256: 'de73502a924d5633736f43a74446bb7f719b1e3935f4406417508ec71a8ff347',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 33, '2000-2004': 25, '2005-2009': 136, '2010-2014': 543,
    '2015-2019': 149, '2020-2024': 299, '2025-2026': 272,
  },
  totalRows: 1457, relevantRowCount: 294, uniqueRelevantCommunications: 76,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 30, post: 349 },
  totalRows: 379, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.conductor]: {
    sources: ['datasets'],
    description: 'The reviewed M-Class corpus does not establish one 722.9 conductor-plate speed-sensor failure across the frozen 2006-2015 gasoline and diesel population. Communications 10167546, 11010818 and 11020872 describe other VGS or 7G-Tronic paths: a torque-converter lockup condition explicitly separate from rpm-sensor faults, loss of VGS communication requiring connector and pin checks, and hardware-dependent commissioning. They do not prove the stored P0715/P0717/P0720 set, heat-and-vibration cause or a plug-and-play repair.',
    solution: 'Preserve the complete VGS and engine fault record, transmission hardware number and freeze-frame data. Test power, ground, connector pins, internal speed signals and torque-converter behavior as separate paths under the VIN-specific Mercedes procedure. Replacement VGS or electrohydraulic hardware may require commissioning; do not buy a conductor plate, adapter plug or valve body from this page because the failed component and fitment are unresolved.',
    symptoms: ['complete VGS fault record preserved', 'power, ground and connector pins tested', 'speed-signal and torque-converter paths separated'],
    affectedSystems: ['722.9 transmission electronics', 'VGS control and commissioning', 'internal speed-signal circuit'],
    conflict: 'Exact records do not establish the frozen universal conductor-plate identity and directly contradict the plug-and-play claim.',
    evidence: ['10167546 states its torque-converter complaint is not connected to the rpm-sensor fault.', '11010818 requires communication, connector and pin checks before EHS replacement.', '11020872 shows replacement commissioning depends on installed hardware and A-code.'],
    summary: 'Held the overbroad conductor-plate identity and removed the unsafe plug-and-play assertion.',
  },
  [IDS.booster]: {
    sources: ['brakeRecall', 'datasets'],
    description: 'The reviewed evidence does not establish a brake-booster-integrated brake-light switch causing ESP, cruise-control and no-start faults. Recall 24V298 instead covers certain 2006-2011 ML-Class vehicles whose brake-booster housing can corrode under a rubber sleeve after prolonged water exposure. That condition can reduce brake assist or, rarely, cause loss of pedal braking. It is not evidence for the frozen switch/sensor mechanism.',
    solution: 'Check the VIN for open recall 24V298 before driving. Mercedes instructs affected owners to stop driving until an authorized dealer inspects the booster; towing or mobile inspection may be available. A booster is replaced only if the recall inspection fails. Diagnose ESP, cruise, brake-light or no-start complaints separately and do not buy a booster or switch from this page; recall coverage and the frozen electrical identity are unresolved.',
    symptoms: ['VIN recall status checked', 'brake-pedal feel and hissing documented', 'ESP and brake-light faults diagnosed separately'],
    affectedSystems: ['brake-booster housing', 'vacuum brake assist', 'ESP and brake-light signal paths'],
    conflict: 'The exact safety recall concerns corrosion of the booster housing, not an integrated brake-light switch or the frozen warning/no-start cluster.',
    evidence: ['24V298 identifies corrosion under the booster rubber sleeve after prolonged water exposure.', 'The recall warns of reduced assist and rare loss of pedal braking and uses a stop-drive instruction.', 'No exact reviewed communication establishes the integrated-switch identity.'],
    summary: 'Held the unsupported switch identity while surfacing the exact VIN-specific brake-booster stop-drive recall.',
  },
  [IDS.controlArm]: {
    sources: ['datasets'],
    description: 'The reviewed M-Class communications do not establish generalized control-arm bushing and ball-joint wear across model years 2006-2015. Communication 10019823 describes a plate installed at an upper control arm for steering noise or vibration under off-road or washboard use. Later clunk communications identify side-shaft, wheel-bearing or steering-knuckle interfaces. They do not prove cracked bushings, loose ball joints, inspection failure or replacement of complete arms in axle pairs.',
    solution: 'Document the noise, steering behavior and road input, then measure play at each joint and localize the noise with chassis ears. Inspect control-arm bushings and ball joints, wheel bearings, steering knuckles and halfshaft interfaces separately. Do not buy control arms, bushings or ball joints from this page; the failed component and fitment are unresolved.',
    symptoms: ['noise and road input documented', 'joint play measured', 'control-arm, bearing, knuckle and halfshaft paths separated'],
    affectedSystems: ['front control arms and bushings', 'front ball joints', 'wheel-bearing and halfshaft interfaces'],
    conflict: 'Exact M-Class records identify narrower plate, bearing, knuckle or halfshaft noise paths, not frozen generation-wide bushing and ball-joint wear.',
    evidence: ['10019823 concerns an upper-control-arm plate for a specific noise/vibration condition.', '11013298 identifies side-shaft-to-wheel-bearing micromovement.', 'No exact source supports the stored wear mechanism or complete-arm pair replacement.'],
    summary: 'Held the generalized control-arm identity and separated measured joint wear from exact alternative noise paths.',
  },
  [IDS.m276]: {
    sources: ['m276Bulletin', 'datasets'],
    description: 'Mercedes LI05.10-P-056435 confirms that certain M276 engines can rattle for several seconds after startup while oil pressure builds in the secondary chain tensioners. The bulletin says no consequential damage is expected and scopes the remedy by engine number, not by all model years 2012-2015. It does not establish stretched chains, worn guides or camshaft-adjuster failure as the cause of this exact complaint.',
    solution: 'Record the cold-start sound and verify the M276 engine number against LI05.10-P-056435. For an in-range engine, Mercedes specifies left and right secondary tensioners and/or oil-supply check valves according to the engine number and measured cylinder-head bore. Other startup noises require separate diagnosis. Do not buy tensioners, check valves, chains, guides or adjusters from this page; the engine-number and bore-specific fitment are unresolved.',
    symptoms: ['cold-start sound recorded', 'engine number checked against the bulletin', 'other startup-noise causes ruled out'],
    affectedSystems: ['M276 secondary timing chains', 'secondary chain tensioners', 'cylinder-head oil-supply check valves'],
    conflict: 'The exact bulletin is engine-number limited and says no consequential damage is expected; the frozen 2012-2015 scope and chain/guide/adjuster damage narrative are overbroad.',
    evidence: ['LI05.10-P-056435 identifies secondary-tensioner rattle until oil pressure builds.', 'The remedy varies by M276 engine number and measured oil-bore diameter.', 'The bulletin states that no consequential damage is expected and that other causes are possible.'],
    summary: 'Held the overbroad M276 scope while preserving the exact engine-number-limited tensioner and check-valve procedure.',
  },
  [IDS.swirl]: {
    sources: ['datasets'],
    description: 'The reviewed M-Class corpus contains no exact Mercedes communication establishing brittle OM642 swirl rods, carbon-stuck flaps and oil-damaged swirl motors across model years 2006-2015. The exact OM642 communications found concern charge-air hoses, diagnostic assistance and other systems. They do not prove the stored linkage mechanism, DTC set or metal-rod repair. The proposed resistor bypass would conceal diagnosis and does not restore emissions-system function.',
    solution: 'Preserve all intake and emissions faults and commanded-versus-actual actuator data. Inspect the intake runners, linkage, actuator, wiring and turbo-inlet oil path under the VIN-specific Mercedes procedure before selecting a repair. Do not install a resistor or otherwise bypass the swirl-motor circuit. Do not buy rods, manifolds or a motor from this page; the failed component and fitment are unresolved.',
    symptoms: ['intake and emissions faults preserved', 'actuator command and response tested', 'linkage, manifold, wiring and oil paths separated'],
    affectedSystems: ['OM642 intake runner system', 'swirl actuator and linkage', 'engine emissions diagnostics'],
    conflict: 'No exact reviewed primary source supports the frozen failure mechanism, and the stored resistor bypass is not an acceptable repair.',
    evidence: ['10023072 concerns OM642 charge-air hoses, not swirl linkage.', '10024724 is diagnostic-assistance material, not proof of linkage failure.', 'No exact source supports a resistor bypass or universal metal-rod fitment.'],
    summary: 'Held the unsupported swirl-linkage identity and removed the emissions-defeating resistor shortcut.',
  },
  [IDS.tailLamp]: {
    sources: ['tailLampRecall', 'datasets'],
    description: 'Recall 09V076 confirms a faulty rear tail-lamp seal on certain model-year 2009 M-Class W164 vehicles equipped with the optional power liftgate. Water can reach the liftgate control unit near the spare-tire compartment, disable the motor and, in the worst case, create a short-circuit fire risk. It does not cover every 2006-2011 trim or establish damage to the rear SAM, rear fuse box, hydraulic pump or a cracked lift-arm boot.',
    solution: 'Check the VIN for recall 09V076. On an affected vehicle, the dealer remedy is a thicker tail-lamp seal and relocation of the liftgate control unit. For other water entry, trace the leak before replacing electronics and inspect each wet module and connector separately. Do not buy a SAM, fuse box, liftgate module, pump, boot or seal from this page; recall coverage and non-recall leak paths are unresolved.',
    symptoms: ['VIN recall status checked', 'water source traced before module replacement', 'liftgate controller separated from rear SAM and fuse-box faults'],
    affectedSystems: ['rear tail-lamp seal', 'power-liftgate control unit', 'rear electrical compartment'],
    conflict: 'The exact recall is limited to certain 2009 power-liftgate vehicles and one controller; the frozen years and multi-module identity are overbroad.',
    evidence: ['09V076 covers model-year 2009 M-Class W164 vehicles built July 2008 through March 9, 2009.', 'The affected vehicles have the optional power liftgate.', 'The remedy is a thicker tail-lamp seal plus relocation of the liftgate control unit.'],
    summary: 'Held the overbroad multi-module identity while preserving the exact 2009 tail-lamp-seal recall and fire-risk boundary.',
  },
  [IDS.airmatic]: {
    sources: ['datasets'],
    description: 'Mercedes communications support several distinct M-Class AIRMATIC faults: inadequate compressor output, a damaged compressor pressure disk, drain-valve wiring faults and a leaking 2012 front strut. They do not establish one air-spring-and-compressor failure across every frozen 2006-2015 trim and engine, nor do they support replacing all four springs or converting the vehicle to coils as a universal remedy.',
    solution: 'Document ride height, leak-down, compressor duty cycle and every AIRMATIC fault. Test individual springs or struts, lines, valve block, compressor pressure output, relay, wiring and control software separately under the VIN-specific procedure. Do not buy air springs, struts, a compressor or a coil-conversion kit from this page; the failed path and fitment are unresolved.',
    symptoms: ['ride height and leak-down documented', 'compressor pressure and duty cycle measured', 'pneumatic, electrical and software paths separated'],
    affectedSystems: ['AIRMATIC struts and air springs', 'compressor and drain valve', 'AIRMATIC wiring and control'],
    conflict: 'Exact records show multiple year- and component-specific AIRMATIC paths, not the frozen generation-wide combined failure.',
    evidence: ['10020182/10028024 support specific compressor-output and pressure-disk paths.', '10032727/10038024 identify drain-valve wiring faults.', '10050862 identifies a possible 2012 front-strut leak.'],
    summary: 'Held the combined AIRMATIC identity and replaced universal replacement advice with component-level diagnosis.',
  },
  [IDS.balanceShaft]: {
    sources: ['datasets'],
    description: 'Mercedes communication 11031629 confirms a settlement covering diagnosis and replacement of confirmed worn sintered-steel balance-shaft sprockets or idler gears in certain, but not all, 2005-2007 vehicles with M272 or M273 engines under LI03.30-P-050027. The frozen M-Class page extends through 2011 and describes all ML350 M272 vehicles as affected, which the exact source does not support.',
    solution: 'Verify the engine and production range by VIN and follow LI03.30-P-050027 before diagnosing a covered sprocket or idler gear. Preserve camshaft-correlation faults and mechanical timing measurements. Do not buy a balance shaft, idler gear or timing kit from this page; only certain early engines are covered and exact parts require VIN/EPC confirmation.',
    symptoms: ['engine and production range verified', 'camshaft-correlation faults preserved', 'mechanical timing measured before teardown'],
    affectedSystems: ['M272 balance-shaft sprocket', 'M273 idler gear', 'timing-chain drive'],
    conflict: 'The exact source covers certain 2005-2007 engines, not every frozen 2006-2011 ML350.',
    evidence: ['11031629 explicitly says certain, but not all, 2005-2007 M272/M273 vehicles.', 'Coverage is limited to diagnosis and repairs in LI03.30-P-050027.', 'No exact source supports the stored 1,400-owner total or universal 2006-2011 applicability.'],
    summary: 'Held the overbroad balance-shaft scope and preserved the exact early-engine and confirmed-wear boundary.',
  },
  [IDS.oilCooler]: {
    sources: ['oilCoolerBulletin', 'datasets'],
    description: 'Mercedes LI18.30-P-055434 applies to passenger cars and light trucks with engine 642 and confirms external oil traces in the oil-cooler inner-V area or at its drain points. The source identifies leaking seals between the engine block and oil cooler, potentially from incorrect installation. It does not say engine oil contaminates coolant, damages hoses or head gaskets, and it explicitly says the oil cooler itself is not the cause and must not be replaced.',
    solution: 'Confirm that the leak originates at the oil-cooler-to-crankcase seals rather than another source, then replace the two seals while following the Mercedes installation procedure. The 2014 bulletin lists gasket A 642 188 04 80 and marks A 642 188 01 80 as obsolete; verify the current supersession and exact VIN in EPC before ordering. Do not replace the oil cooler unless separate diagnosis proves it faulty.',
    symptoms: ['external oil traces in the inner V', 'oil visible at inner-V drain points', 'source confirmed before intake removal'],
    affectedSystems: ['OM642 oil cooler seals', 'engine block oil-cooler interface', 'engine lubrication system'],
    conflict: null,
    evidence: ['LI18.30-P-055434 applies to passenger-car and light-truck engine 642 variants.', 'It identifies seals between the block and oil cooler and specifies two A 642 188 04 80 gaskets.', 'It explicitly says the oil cooler is not the cause and must not be replaced.'],
    summary: 'Retained the exact OM642 seal-leak identity and removed false coolant-contamination and oil-cooler-replacement claims.',
  },
  [IDS.transferCase]: {
    sources: ['datasets'],
    description: 'The exact M-Class transfer-case communications identify light-load vibration or jolting caused by modified oil quality in vehicles with a variable transfer case. They prescribe fault checks, an isolation drive, a fluid change and calibration when indicated. They do not establish stretched chains, speed-dependent whine, imprecise torque distribution or a universal chain, sprocket and bearing rebuild across model years 2006-2015.',
    solution: 'Record whether the complaint is vibration, jolting or whine and its load, speed and temperature. Confirm the transfer-case type, process drivetrain faults and follow the Mercedes isolation, oil-change and calibration procedure when applicable. If noise persists, diagnose bearings, gears, chain and adjacent driveline separately. Do not buy a chain, bearing kit, transfer case or fluid kit from this page; the frozen hardware identity and fitment are unresolved.',
    symptoms: ['complaint type and operating state documented', 'variable transfer-case hardware confirmed', 'oil-quality and mechanical paths separated'],
    affectedSystems: ['variable transfer case', 'transfer-case oil and clutch control', 'chain, bearings and adjacent driveline'],
    conflict: 'Exact communications support an oil-quality vibration path, not frozen chain wear and whining across the entire generation.',
    evidence: ['11010455/11025100/11028270 identify modified transfer-case oil quality.', 'The exact complaint is light-load vibration or jolting that may resemble a harsh shift.', 'No exact source supports the stored 780-owner total or universal chain rebuild.'],
    summary: 'Held the unsupported chain-wear identity and bounded the exact oil-quality vibration procedure.',
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) {
  return CONTENT[id].sources.map((key) => {
    const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title };
  });
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source); delete value.localPath; return [key, value];
  }));
}
function commerceDecisionFor(id) {
  const values = {
    [IDS.conductor]: 'transmission electronics failure and hardware fitment are unresolved; no universal retail part',
    [IDS.booster]: 'recall coverage and electrical fault identity are VIN-specific or unresolved; no universal retail part',
    [IDS.controlArm]: 'front-suspension noise path and component fitment are unresolved; no universal retail part',
    [IDS.m276]: 'tensioner and check-valve fitment is engine-number and bore-specific; no universal retail part',
    [IDS.swirl]: 'OM642 intake failure path and component fitment are unresolved; no universal retail part',
    [IDS.tailLamp]: 'recall coverage and rear-electrical leak path are VIN-specific or unresolved; no universal retail part',
    [IDS.airmatic]: 'AIRMATIC failure path and component fitment are unresolved; no universal retail part',
    [IDS.balanceShaft]: 'balance-shaft coverage and timing-part fitment are VIN-specific; no universal retail part',
    [IDS.oilCooler]: '2014 bulletin part A 642 188 04 80 requires current VIN/EPC supersession verification; no universal retail link',
    [IDS.transferCase]: 'transfer-case failure path and hardware fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution,
    confidence: before.id === IDS.oilCooler ? 'high' : 'low',
    symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems),
    dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(before.id),
    communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(before.id) ? 0 : before.reportCount,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'M-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 10 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen M-Class coverage does not match the 10-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record); const proposal = proposalFor({ id: record.id, ...before });
    const retain = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retain ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retain, identityConflict: CONTENT[record.id].conflict,
      reason: retain ? 'Exact Mercedes primary evidence supports the frozen identity and engine applicability.' : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'M-Class',
    completionStatement: 'All 10 frozen M-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Nine identities or frozen applicability sets materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 10 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 2,100-, 1,400-, 1,600- and 780-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was parsed, rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part, VIN-specific or EPC-verification boundary.',
      'The unsafe OM642 resistor bypass is removed and explicitly prohibited.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'm-class-om642-oil-cooler-retained', severity: 'bulletin-backed', recordIds: [IDS.oilCooler], detail: 'LI18.30-P-055434 exactly supports the OM642 oil-cooler seal leak while rejecting cooler replacement and coolant-contamination claims.' },
      { code: 'm-class-safety-recalls-bounded', severity: 'scope-conflict', recordIds: [IDS.booster, IDS.tailLamp], detail: 'Exact booster and tail-lamp recalls exist, but neither supports the frozen page identity and applicability as written.' },
      { code: 'm-class-unsafe-shortcuts-removed', severity: 'safety-correction', recordIds: [IDS.conductor, IDS.swirl], detail: 'The plug-and-play VGS claim and OM642 resistor bypass are removed from the proposals.' },
      { code: 'm-class-hardware-identities-held', severity: 'identity-hold', recordIds: [IDS.conductor, IDS.controlArm, IDS.m276, IDS.swirl, IDS.airmatic, IDS.balanceShaft, IDS.transferCase], detail: 'Exact sources support narrower diagnostic, engine-number, year or component paths than the frozen identities.' },
      { code: 'm-class-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Four positive owner totals lack reviewed owner-report sources and are proposal-only zero corrections.' },
      { code: 'all-m-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No M-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 4, total: 10 },
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
