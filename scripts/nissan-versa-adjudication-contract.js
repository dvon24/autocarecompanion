/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  catalytic: 'nissan-versa-catalytic-converter-2012',
  coilSpring: 'nissan-versa-coil-spring-2012',
  cvt: 'nissan-versa-cvt-failure-2012',
  fuelPump: 'nissan-versa-fuel-pump-2020',
  ignitionCoil: 'nissan-versa-ignition-coil-2007',
  maf: 'nissan-versa-maf-sensor-2007',
  strutMount: 'nissan-versa-strut-mount-bearing-2012',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.coilSpring, ids.cvt, ids.fuelPump].sort());
const relevantDocumentIds = Object.freeze([
  '10020595', '10024119', '10024163', '10024201', '10024689', '10025522',
  '10030165', '10032504', '10032506', '10033307', '10033709', '10035684',
  '10042754', '10042847', '10043346', '10044445', '10047580', '10047941',
  '10053954', '10058388', '10090653', '10091418', '10091504', '10109114',
  '10109123', '10117397', '10118694', '10118696', '10118698', '10118717',
  '10119271', '10119282', '10120553', '10120556', '10120557', '10120558',
  '10120575', '10120586', '10123345', '10123347', '10123352', '10126257',
  '10126438', '10128641', '10130489', '10130492', '10138223', '10143812',
  '10143820', '10144489', '10144504', '10144506', '10144508', '10144509',
  '10144511', '10144513', '10144514', '10145043', '10152011', '10152512',
  '10152514', '10152524', '10152977', '10152998', '10153007', '10154686',
  '10154720', '10158431', '10158433', '10162639', '10162641', '10165781',
  '10167363', '10167370', '10167372', '10167410', '10167413', '10170010',
  '10170011', '10170017', '10172234', '10172261', '10173603', '10173617',
  '10176202', '10176203', '10176204', '10176249', '10176250', '10177216',
  '10183974', '10183981', '10185483', '10186854', '10188339', '10188376',
  '10188377', '10190124', '10190200', '10191942', '10191954', '10191975',
  '10191987', '10192060', '10192064', '10192067', '10192075', '10192145',
  '10192158', '10192166', '10192192', '10192216', '10192217', '10192234',
  '10192266', '10192293', '10192324', '10192354', '10192374', '10192421',
  '10192422', '10192468', '10192474', '10192478', '10192508', '10192513',
  '10192520', '10192527', '10192556', '10192605', '10192625', '10192626',
  '10192627', '10192628', '10192648', '10192661', '10192727', '10192744',
  '10192777', '10192813', '10192814', '10199172', '10204177', '10204188',
  '10206391', '10207860', '10211994', '10212012', '10213684', '10213690',
  '10218745', '10218747', '10218941', '10227268', '10229597', '10232652',
  '10235707', '10235709', '10235777', '10236629', '10237836', '10243708',
  '10246457', '11004962', '11006973', '11031703',
]);
const campaigns = Object.freeze([
  '06V348000', '07V094000', '10V401000', '12V032000', '12V055000',
  '15V418000', '15V507000', '15V573000', '16V349000', '16V724000',
  '17V028000', '17V144000', '17V275000', '17V449000', '17V637000',
  '18V044000', '18V401000', '18V452000', '18V551000', '19V654000',
  '20V008000', '20V112000', '21V471000', '22E066000', '22V693000',
  '23V496000', '24V154000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.catalytic]: held({
    description: 'The complete Versa manufacturer and recall corpus does not establish premature catalytic-converter substrate failure and theft as one 2012-2022 defect identity. P0420 identifies catalyst-system efficiency, not theft or the root cause of converter damage. The frozen mileage, low-ground-clearance theft rationale and claim that Versa is a frequent theft target come from a non-verifiable forum URL rather than exact Nissan primary evidence.',
    solution: 'Confirm the converter is present and undamaged, inspect for exhaust leaks, preserve fuel-trim and misfire data, evaluate oil or coolant entry, and test catalyst efficiency through the correct service procedure before replacement. Treat theft prevention as a separate security decision. Do not buy a converter, shield, cage, oxygen sensor or engine part from this page; failure mode, emissions specification and exact VIN fitment must be established first.',
    symptoms: ['missing converter separated from catalyst-efficiency failure', 'exhaust leaks and engine causes tested before replacement', 'P0420 treated as a system code, not proof of theft or substrate failure'],
    systems: ['catalytic converter and exhaust sealing', 'oxygen-sensor and catalyst-efficiency monitoring', 'fuel, ignition and oil-consumption contributors'],
    evidence: ['No exact communication supports one 2012-2022 failure-and-theft population.', 'P0420 does not identify theft or a failed converter by itself.', 'No primary source supports the frozen mileage, prices or frequent-target claim.'],
    conflict: 'The indexed page combines criminal removal and an emissions-performance condition into one eleven-year mechanical defect identity.',
    summary: 'Held the conflated converter-failure/theft identity and removed unsupported frequency, mileage, price and universal shield/converter advice.',
  }),
  [ids.coilSpring]: held({
    description: 'The frozen rear-spring title and 2012-2019 range conflict with the exact safety record. Recalls 15V-573 and 17V-637 cover front coil-spring salt corrosion on 2007-2012 Versa vehicles in specified jurisdictions; 17V-637 is limited to certain 2012 hatchbacks and expands 15V-573. A separate 2021 dealer-inventory action inspected 564 vehicles for a rear-spring indentation, not corrosion fracture across 2012-2019. The frozen 680-owner total is unsupported.',
    solution: 'Check the VIN for the front-spring recalls, inspect the identified axle and both spring seats for fracture or tire-contact risk, and keep any 2021 rear-spring inventory action separate. Do not buy rear springs, front springs, struts or rust treatment from this page; axle, campaign eligibility, spring specification and VIN fitment must be established first.',
    symptoms: ['front and rear spring conditions kept separate', 'salt-region recall population preserved', '2021 inventory indentation not converted into a corrosion defect'],
    systems: ['front coil springs and tire clearance', 'separate rear coil springs', 'spring seats and related suspension hardware'],
    evidence: ['17V-637 exactly says front coil springs and 2012 Versa Hatchback.', '15V-573 covers front springs on 2007-2012 vehicles in specified jurisdictions.', 'The 2021 rear action is a bounded inventory inspection for indentation.'],
    conflict: 'The indexed page reverses the recalled axle and expands bounded front-spring campaigns into a rear-spring defect across eight model years.',
    summary: 'Held the wrong-axle coil-spring identity and removed the fabricated 680-owner total, false R1713/17V-633 detail and universal rear-spring part advice.',
    citations: ['coilSpringRecall17V637', 'coilSpringApi15V573', 'datasets'],
  }),
  [ids.cvt]: held({
    description: 'Versa CVT evidence is split by model year, DTC and condition. Nissan extended 2012-2017 Versa Sedan CVT coverage from 60 months/60,000 miles to 84 months/84,000 miles, not the frozen 10 years/120,000 miles. Separate 2018-2019 coverage is also 84 months/84,000 miles, while 2020-2021 bulletins route specific DTCs and hesitation/reduced-power complaints to different procedures. These records do not establish one JF015E belt, valve-body and bearing failure identity from 2012 through 2021. The frozen 3,500-owner total is unsupported.',
    solution: 'Confirm the transmission and VIN coverage, preserve TCM codes and freeze-frame data, verify fluid level/specification and separate judder, pressure-control, torque-converter, clutch, programming and internal mechanical branches using the exact year-specific procedure. Do not buy CVT fluid, a valve body, belt/pulley kit, torque converter or transmission from this page; diagnostic branch and exact fitment must be established first.',
    symptoms: ['judder, hesitation, slip and reduced power separated', '2012-2017, 2018-2019 and 2020-2021 evidence kept bounded', 'DTC-specific procedures preserved'],
    systems: ['CVT assembly and internal components', 'control valve body and TCM calibration', 'torque converter, fluid and pressure controls'],
    evidence: ['The 2012-2017 warranty extension is exactly 84 months/84,000 miles.', 'The 2020-2021 bulletin lists DTC-specific branches and is superseded.', 'No primary source supports 3,500 reports, a universal 30,000-mile interval or one full-generation failure mechanism.'],
    conflict: 'The indexed page expands bounded programs into ten years of generic complete CVT failure and states the wrong warranty term.',
    summary: 'Held the overbroad Versa CVT identity and removed the fabricated 3,500-owner total, wrong warranty term and universal fluid/valve-body/transmission advice.',
    citations: ['cvtWarranty2012To2017', 'cvtBulletin2020To2021', 'datasets'],
  }),
  [ids.fuelPump]: held({
    description: 'The frozen citation is false: NHTSA 21V-560 is a General Motors Chevrolet Bolt EV high-voltage-battery fire recall, not a Nissan Versa fuel-pump campaign. The exact 2020-2021 Versa record for B12A3-72 concerns an IPDM internal short or open fuse in the fuel-pump-relay monitor circuit, and a separate 2020 recall covers fuel-tank wall thickness. Neither establishes a deforming fuel-pump impeller or 2020-2023 pump-stall population. The frozen 620-owner total is unsupported.',
    solution: 'Preserve stall/no-start data, verify fuel pressure and pump power/ground, test the applicable fuse, relay-monitor circuit and IPDM branch, and check VIN-specific campaigns before condemning the pump. Keep a fuel-tank leak separate from loss of pump operation. Do not buy a fuel pump, control module, IPDM, relay or tank from this page; failed circuit, campaign and exact VIN fitment must be established first.',
    symptoms: ['pump delivery separated from relay-monitor and IPDM faults', 'fuel-tank leakage separated from loss of pump operation', 'stall and no-start verified with pressure and electrical tests'],
    systems: ['fuel pump and delivery circuit', 'IPDM, fuse and relay-monitor circuit', 'separate fuel tank and engine-control inputs'],
    evidence: ['21V-560 applies to Chevrolet Bolt EV traction batteries.', 'The Versa B12A3-72 bulletin directs fuse/IPDM diagnosis.', 'No Versa recall in the 224-row corpus supports a deforming pump impeller.'],
    conflict: 'The indexed page imports another manufacturer\'s electric-vehicle recall into a four-year Versa fuel-pump identity.',
    summary: 'Held the false fuel-pump recall identity and removed the fabricated 620-owner total, unrelated 21V-560 citation and universal pump replacement.',
    citations: ['falseFuelRecall21V560', 'fuelRelayBulletin', 'datasets'],
  }),
  [ids.ignitionCoil]: held({
    description: 'The sanctioned Versa corpus does not establish ignition-coil degradation from heat as a 2007-2019 HR16DE defect population or a 60,000-100,000-mile pattern. The exact 2012 Versa bulletin for P0300-P0304 applies when there are no drivability issues and directs ECM reprogramming after calibration confirmation; it does not prescribe coil replacement. The frozen NTB17-100A URL is not the exact primary record for this identity.',
    solution: 'Capture cylinder-specific misfire counts and operating conditions, inspect plugs and boots, swap or scope-test the suspected coil only where the service procedure allows, and exclude injector, compression, vacuum, fuel and calibration causes. Do not buy one coil, four coils, plugs or a converter from this page; failed cylinder, calibration branch and exact engine/VIN fitment must be established first.',
    symptoms: ['mechanical, fuel, calibration and ignition misfires separated', 'single-cylinder evidence required before coil replacement', '2012 no-drivability calibration branch preserved'],
    systems: ['ignition coils, boots and spark plugs', 'ECM calibration and misfire monitoring', 'injectors, compression and intake sealing'],
    evidence: ['NTB12-096 covers 2012 Versa Sedan with CVT and no drivability symptoms.', 'Its action is ECM reprogramming, not ignition-coil replacement.', 'No primary source supports all-four replacement, mileage or heat-soak frequency across 2007-2019.'],
    conflict: 'The indexed page converts generic misfire diagnosis and one calibration bulletin into a thirteen-year ignition-coil defect.',
    summary: 'Held the unsupported ignition-coil identity and removed the false bulletin implication, mileage, price and replace-all-four advice.',
    citations: ['misfireCalibration2012', 'datasets'],
  }),
  [ids.maf]: held({
    description: 'The exact Versa P0101 bulletin applies only to 2012 Versa Sedan with matching ECM part numbers, requires no drivability concerns and directs ECM reprogramming. It does not establish MAF hot-wire contamination from PCV vapors or dirt, sensor failure across 2007-2019, or a cleaning/replacement remedy. A separate 2020-2021 P0101/P0507 record begins with 12-volt battery testing and idle-air-volume learning rather than automatic MAF replacement.',
    solution: 'Preserve DTC and freeze-frame data, inspect intake sealing and filter installation, verify battery condition and wiring, compare MAF data with the service specification, and check exact ECM calibration applicability before cleaning or replacement. Do not buy cleaner, a MAF sensor, air filter or ECM from this page; root cause, calibration and exact VIN fitment must be established first.',
    symptoms: ['sensor circuit separated from intake leaks and calibration', '2012 no-drivability P0101 branch preserved', '2020-2021 battery and idle-learning branch kept distinct'],
    systems: ['mass-air-flow sensing and wiring', 'intake duct, filter and unmetered-air paths', 'ECM calibration, battery and idle-air learning'],
    evidence: ['NTB12-051J is limited to 2012 Versa Sedan and matching ECM part numbers.', 'Its action is ECM reprogramming.', 'No primary source supports a 2007-2019 contamination/failure population or universal cleaning.'],
    conflict: 'The indexed page turns two bounded P0101 diagnostic branches into thirteen years of physical MAF-sensor failure.',
    summary: 'Held the overbroad MAF identity and replaced universal cleaner/sensor advice with intake, electrical and calibration diagnosis.',
    citations: ['mafCalibration2012', 'datasets'],
  }),
  [ids.strutMount]: held({
    description: 'The exact 2012-2016 Versa suspension-noise bulletin identifies stabilizer bushings as the source of a low-speed squeak over bumps and directs replacement of both bushings after a disconnect test. The broader strut/shock guidance explains how to distinguish normal seepage from rod resistance or noise. Neither establishes front strut-mount-bearing wear, turning noise, road-salt causation or a 2012-2022 defect population.',
    solution: 'Reproduce the sound while turning and over bumps, inspect spring seating and steering joints, isolate stabilizer bushings through the exact test, and evaluate strut rod resistance, mount rotation and bearing play before disassembly. Do not buy mount bearings, quick struts, stabilizer bushings or a spring compressor from this page; noise source, side and exact VIN fitment must be established first.',
    symptoms: ['turning noise separated from bump-induced stabilizer squeak', 'spring seat, steering joint and mount rotation checked', 'normal strut seepage distinguished from replacement conditions'],
    systems: ['front strut mounts and bearings', 'stabilizer bar bushings and links', 'struts, springs and steering joints'],
    evidence: ['10120558 exactly identifies stabilizer-bushing squeak on 2012-2016 vehicles.', 'Strut guidance is diagnostic and not a model-wide mount-bearing defect.', 'No primary source supports 2012-2022 mount wear, road-salt cause or quick-strut replacement.'],
    conflict: 'The indexed page assigns a specific mount-bearing cause to a broad turning-noise identity while the exact model bulletin identifies a different component and symptom.',
    summary: 'Held the unsupported strut-mount-bearing identity and preserved the exact stabilizer-bushing and strut-diagnosis branches.',
  }),
});

const pdfSources = Object.freeze({
  coilSpringRecall17V637: {
    title: 'NHTSA Recall Acknowledgment 17V-637 - 2012 Versa Front Coil Springs',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCAK-17V637-4418.pdf',
    sha256: '8263d99854c35d87b5ee690c2e8b47dc837a50b3737f5b4d9252b490046cf621',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
  cvtWarranty2012To2017: {
    title: 'Nissan CVT Warranty Extension - 2012-2017 Versa Sedan',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10176204-0001.pdf',
    sha256: 'edc64ee5472d25341365bb35dd231671adb142d61d7c03b9f2104402ffdfc646',
    pageCount: 8,
    visuallyReviewedPages: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  cvtBulletin2020To2021: {
    title: 'Nissan NTB19-040H - 2020-2021 Versa CVT DTC Branches',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10211994-0001.pdf',
    sha256: 'ab85c001932de326c04f00141f6b21aaf253c2e8c1d0dc95ee2d811f1bfee460',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
  fuelRelayBulletin: {
    title: 'Nissan NTB21-009 - Versa Fuel-Pump-Relay Monitor DTC',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10186854-0001.pdf',
    sha256: 'ac493677a994bea0d0d4011440270cd54ca65e18e9b8eda4694dbe3b0e2a171c',
    pageCount: 5,
    visuallyReviewedPages: [1, 4],
  },
  mafCalibration2012: {
    title: 'Nissan NTB12-051J - 2012 Versa P0101 ECM Reprogramming',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192520-9999.pdf',
    sha256: '276507507999f072d5eefe58bdde34330f43d302e26e48556d1447daa619c647',
    pageCount: 12,
    visuallyReviewedPages: [1],
  },
  misfireCalibration2012: {
    title: 'Nissan NTB12-096 - 2012 Versa P0300-P0304 ECM Reprogramming',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/MC-10192060-9999.pdf',
    sha256: '3adce6ebb3a2cd7a091a981a9c58a975f1f41dc6d3e93b59037c7fb492b8cf76',
    pageCount: 9,
    visuallyReviewedPages: [1],
  },
});

function recallApi(campaign, title, contains = campaign) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  coilSpringApi15V573: recallApi('15V573000', 'NHTSA Recall 15V573000 - Versa Front Coil Springs'),
  falseFuelRecall21V560: recallApi('21V560000', 'NHTSA Recall 21V560000 - Chevrolet Bolt EV Battery', 'CHEVROLET'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Versa', slug: 'versa', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-versa-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['VERSA'],
  searchTerms: ['catalytic', 'converter', 'theft', 'coil spring', 'spring', 'CVT', 'transmission', 'fuel pump', 'sender', 'ignition coil', 'misfire', 'mass air', 'MAF', 'strut', 'suspension', 'stall', 'no start', 'air condition', 'engine', 'brake', 'steering', 'air bag', 'fire', 'wiring'],
  relevantDocumentIds,
  campaigns,
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 16, '2010-2014': 36, '2015-2019': 168, '2020-2024': 174, '2025-2026': 5 },
    totalRows: 399,
    relevantRowCount: 166,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 2, post: 222 },
    totalRows: 224,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete 224-row Versa recall corpus proves that 15V-573/17V-637 concern front springs on bounded 2007-2012 populations and that no Versa fuel-pump-impeller campaign exists. The frozen 21V-560 citation belongs to Chevrolet Bolt EV traction batteries.',
  },
  content,
  requiredProse: [
    { id: ids.coilSpring, field: 'description', patterns: ['rear-spring title', 'front coil-spring', '680-owner total'] },
    { id: ids.cvt, field: 'description', patterns: ['84 months/84,000 miles', 'not the frozen 10 years/120,000 miles', '3,500-owner total'] },
    { id: ids.fuelPump, field: 'description', patterns: ['21V-560 is a General Motors', 'B12A3-72', '620-owner total'] },
    { id: ids.ignitionCoil, field: 'description', patterns: ['no drivability issues', 'ECM reprogramming', 'does not prescribe coil replacement'] },
    { id: ids.maf, field: 'description', patterns: ['only to 2012 Versa Sedan', 'ECM reprogramming', 'does not establish MAF'] },
    { id: ids.strutMount, field: 'description', patterns: ['stabilizer bushings', 'Neither establishes front strut-mount-bearing'] },
  ],
  observations: [
    { code: 'all-seven-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every Versa frozen title or year range materially exceeds the exact evidence; all seven pages remain published but held.' },
    { code: 'spring-axle-reversed', severity: 'safety-accuracy', recordIds: [ids.coilSpring], detail: 'The frozen rear-spring identity conflicts with front-spring recalls 15V-573 and 17V-637.' },
    { code: 'false-fuel-recall', severity: 'safety-accuracy', recordIds: [ids.fuelPump], detail: '21V-560 is a Chevrolet Bolt EV traction-battery recall, not a Nissan fuel-pump campaign.' },
    { code: 'cvt-warranty-overstated', severity: 'technical-accuracy', recordIds: [ids.cvt], detail: 'The exact extension is 84 months/84,000 miles, not 10 years/120,000 miles.' },
    { code: 'calibration-not-coil-failure', severity: 'technical-accuracy', recordIds: [ids.ignitionCoil], detail: 'The exact P0300-P0304 record directs ECM reprogramming for a no-drivability condition, not coil replacement.' },
    { code: 'calibration-not-maf-failure', severity: 'technical-accuracy', recordIds: [ids.maf], detail: 'The exact P0101 record is a 2012 ECM calibration branch and not a 2007-2019 sensor-failure population.' },
    { code: 'stabilizer-not-strut-mount', severity: 'technical-accuracy', recordIds: [ids.strutMount], detail: 'The exact suspension-noise bulletin identifies stabilizer bushings rather than strut-mount bearings.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 4,800 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-versa-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Versa page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
