/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  transmission: 'nissan-titan-9-speed-automatic-transmission-harsh-2020',
  battery: 'nissan-titan-battery-drain-and-no-start-2020',
  blindSpot: 'nissan-titan-blind-spot-warning--2020',
  caliper: 'nissan-titan-brake-caliper-seize-2004',
  exhaust: 'nissan-titan-exhaust-manifold-2004',
  fuelSender: 'nissan-titan-fuel-sending-unit-2004',
  parkingPawl: 'nissan-titan-parking-pawl-rollaway-recall-2020',
  radiatorHose: 'nissan-titan-radiator-upper-hose-2004',
  axleSeal: 'nissan-titan-rear-axle-seal-2004',
  differential: 'nissan-titan-rear-diff-whine-2004',
  tailgate: 'nissan-titan-tailgate-opening-or-unlocking-2020',
  timingChain: 'nissan-titan-timing-chain-2004',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.parkingPawl]);
const reportCountCleanupIds = Object.freeze([ids.exhaust, ids.axleSeal, ids.timingChain].sort());
const relevantDocumentIds = Object.freeze([
  '10016853', '10017410', '10019030', '10022515', '10024689', '10032306',
  '10032628', '10032991', '10043886', '10053417', '10054527', '10075212',
  '10075213', '10075214', '10075215', '10075220', '10091081', '10091501',
  '10091509', '10091521', '10091546', '10091547', '10091590', '10109108',
  '10109114', '10109116', '10109126', '10109128', '10109131', '10109132',
  '10109140', '10109151', '10109182', '10109215', '10109258', '10109259',
  '10109260', '10109261', '10109262', '10116283', '10116285', '10116288',
  '10116289', '10116290', '10116294', '10116295', '10118702', '10119178',
  '10119194', '10119196', '10119198', '10119199', '10119200', '10119247',
  '10120562', '10120574', '10120590', '10120593', '10120598', '10123356',
  '10126256', '10127452', '10127459', '10127472', '10128642', '10130491',
  '10130495', '10130501', '10130690', '10133207', '10133212', '10138223',
  '10141387', '10143137', '10143273', '10143278', '10143484', '10143489',
  '10143815', '10143817', '10145552', '10149044', '10150731', '10152975',
  '10152984', '10152998', '10153007', '10153028', '10153032', '10153035',
  '10154687', '10154724', '10155160', '10163709', '10163945', '10165784',
  '10172247', '10172260', '10174416', '10174723', '10174724', '10174754',
  '10176251', '10176256', '10177223', '10177224', '10177598', '10177599',
  '10178230', '10178250', '10180994', '10180999', '10181001', '10182360',
  '10182361', '10182367', '10183979', '10185470', '10185482', '10186841',
  '10188373', '10192127', '10192155', '10192178', '10192216', '10192229',
  '10192354', '10192415', '10192474', '10192508', '10192561', '10192638',
  '10192661', '10192679', '10192711', '10192727', '10192738', '10192797',
  '10192810', '10192821', '10192827', '10192832', '10192850', '10194196',
  '10199148', '10202269', '10213684', '10218758', '10218760', '10218938',
  '10218974', '10218979', '10220253', '10222714', '10222870', '10226135',
  '10227268', '10231526', '10231532', '10232657', '10233904', '10234085',
  '10235777', '10249928', '11006969', '11006973', '11006999', '11014070',
  '11014071', '11014072', '11014074', '11014077', '11014078', '11014471',
  '11014472', '11014473', '11031699',
]);
const campaigns = Object.freeze([
  '04V345000', '04V408000', '06V064000', '06V459000', '07E046000',
  '07V150000', '08V045000', '08V187000', '08V284000', '10E019000',
  '10V072000', '10V074000', '10V208000', '10V517000', '12V102000',
  '12V143000', '13V094000', '13V451000', '13V645000', '16V847000',
  '17V268000', '18V240000', '19V495000', '19V654000', '20V188000',
  '20V556000', '20V759000', '21V169000', '21V471000', '22V457000',
  '22V527000', '22V671000', '22V772000', '23V067000', '23V273000',
  '24V154000', '24V580000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary, citations,
    commerceDecision: 'recall campaign, production population and VIN eligibility govern the remedy; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.transmission]: held({
    description: 'The Titan manufacturer corpus contains multiple narrow 9-speed branches, including 2020 P288B park-lock-solenoid programming, 2020-2021 U0101 TCM communication/no-start, 2020 delayed acceleration without TCM DTCs, 2020-2021 valve-body replacement procedure and bounded warning-light conditions. It does not establish harsh shifts, delayed engagement, shudder, towing heat and limp mode as one 2020-2024 defect or validate the frozen mixed DTC set.',
    solution: 'Preserve DTCs and freeze-frame data, record gear, temperature and load, verify fluid level/specification and apply only the exact model-year/DTC service branch. Separate calibration, communication, park-lock, valve-body, ratio and internal mechanical conditions. Do not buy fluid, a valve body, control module or transmission from this page; branch, production date and VIN fitment must be established first.',
    symptoms: ['shift flare, delay, shudder and limp mode separated', 'DTC and no-DTC branches preserved', '2020-2021 procedures not extended through 2024'],
    systems: ['9-speed automatic transmission', 'control valve and TCM communication', 'fluid, park-lock and internal gear elements'],
    evidence: ['Exact communications are model-year and condition gated.', 'No single source supports the frozen 2020-2024 symptom package.', 'P17F0 is not established as part of the 9-speed Titan identity.'],
    conflict: 'The indexed page combines several service branches and four symptoms into one five-year 9-speed failure identity.',
    summary: 'Held the conflated 9-speed transmission identity and replaced universal calibration/valve-body/replacement advice with exact branch diagnosis.',
  }),
  [ids.battery]: held({
    description: 'Titan communications cover general battery testing, telematics reset after collision notification, a telematics internal-battery DTC, infotainment-unit replacement and 2020-2021 TCM communication no-start. They do not establish the telematics or audio control unit remaining awake as a 2020-2024 parasitic-draw defect, and U1000/B2601 do not prove that mechanism.',
    solution: 'Charge and test the 12-volt battery, measure key-off draw only after the network sleep period, identify the current path by voltage-drop/fuse or approved scan methods, and verify charging, accessories, TCM communication and exact module software. Do not buy a battery, maintainer, TCU, AV unit or body module from this page; abnormal draw source and VIN fitment must be established first.',
    symptoms: ['battery state and charging verified', 'sleep-current path measured after timeout', 'TCU, AV, TCM and accessory branches separated'],
    systems: ['12-volt battery and charging', 'telematics and infotainment modules', 'CAN network sleep and accessory circuits'],
    evidence: ['No exact communication states that a TCU/AV unit stays awake and drains the battery.', 'B2E01-96 concerns the telematics unit internal battery.', 'U1000/B2601 do not prove the frozen parasitic-draw mechanism.'],
    conflict: 'The indexed page assigns one module-awake cause to a multi-cause battery/no-start complaint across five years.',
    summary: 'Held the unsupported battery-drain identity and separated parasitic draw, battery health, charging and TCM communication.',
  }),
  [ids.blindSpot]: held({
    description: 'The complete Titan communication and recall corpus does not establish rear blind-spot or cross-traffic radar false warnings/inoperative sensors as one 2020-2024 defect. The frozen page combines alignment, water intrusion, impact damage, calibration and connector corrosion and lists C1A16-C1A18 without an exact Titan rear-radar service branch.',
    solution: 'Document the warning and operating condition, inspect bumper shape, sensor mounting, accessories, contamination and wiring, preserve DTCs, and follow the VIN-specific aiming/calibration procedure before replacement. Do not buy a radar sensor, bracket or harness from this page; side, DTC branch, damage and VIN fitment must be established first.',
    symptoms: ['false alert separated from unavailable warning', 'left and right rear radar branches identified', 'bumper/accessory interference and calibration checked'],
    systems: ['rear side radar sensors', 'bumper brackets and harness', 'blind-spot/rear-cross-traffic control logic'],
    evidence: ['No exact 2020-2024 Titan BSW/RCTA communication appears in the corpus.', 'The listed DTCs do not prove one rear-sensor failure.', 'No source supports all alleged causes as one identity.'],
    conflict: 'The indexed page turns a multi-cause ADAS warning into a five-year sensor-defect identity without exact primary evidence.',
    summary: 'Held the unsupported Titan blind-spot/RCTA identity and replaced sensor presumption with damage, wiring and calibration diagnosis.',
  }),
  [ids.caliper]: held({
    description: 'The complete 983-row manufacturer corpus contains no Titan front-caliper or slide-pin seizure defect communication spanning 2004-2019. Uneven pad wear, heat and pull can result from slide hardware, piston, hose, bearing, pad fit or hydraulic causes, and a forum homepage does not establish the frozen sixteen-year population.',
    solution: 'Measure wheel drag and rotor temperature, compare inner/outer pad wear, inspect slides, boots, piston return, hose restriction and bearing play, and repair only the confirmed brake fault on both sides as service data requires. Do not buy calipers, brackets, pads, rotors or grease from this page; failed component, brake package and VIN fitment must be established first.',
    symptoms: ['drag, pull and heat compared side to side', 'slide, piston and hose causes tested separately', 'pad and rotor damage measured'],
    systems: ['front caliper piston and slides', 'brake hose and hydraulic pressure', 'pads, rotors and wheel bearings'],
    evidence: ['No exact Titan caliper communication establishes the identity.', 'Forum popularity is not a model-wide defect rate.', 'No universal maintenance interval or parts bundle is supported.'],
    conflict: 'The indexed page labels several brake-drag paths as one sixteen-year caliper-seizure defect.',
    summary: 'Held the unsupported caliper-seizure identity and removed universal slide service and brake-parts replacement advice.',
  }),
  [ids.exhaust]: held({
    description: 'The exact Titan corpus does not establish exhaust-manifold bolt fracture and warpage as one 2004-2015 VK56DE defect. The only term-matched exhaust-manifold communications concern aftermarket manifold/catalyst SKUs losing CARB certification and explicitly say parts already on vehicles are not affected. P0420/P0430 do not prove a broken manifold bolt. The frozen 920-owner total is unsupported.',
    solution: 'Localize the leak cold and warm, inspect manifold joints, fasteners, cracks, catalysts and oxygen-sensor data, and determine whether the head threads or manifold surface are damaged before repair. Do not buy studs, manifolds, gaskets, headers or catalysts from this page; bank, leak source, emissions certification and VIN fitment must be established first.',
    symptoms: ['exhaust tick localized by bank and temperature', 'bolt, gasket, crack and catalyst paths separated', 'P0420/P0430 not treated as bolt proof'],
    systems: ['exhaust manifolds and fasteners', 'manifold gaskets and cylinder-head threads', 'catalysts and oxygen sensing'],
    evidence: ['No exact bolt-failure bulletin appears in the 983-row corpus.', 'Matched CARB notices say installed vehicles are not affected.', 'No primary source supports 920 reports or a driver-side prevalence.'],
    conflict: 'The indexed page converts generic ticking and catalyst codes into a twelve-year bolt/warpage defect.',
    summary: 'Held the unsupported exhaust-manifold identity and removed the fabricated 920-owner total, universal studs and header advice.',
  }),
  [ids.fuelSender]: held({
    description: 'NHTSA 10V-074 exactly covers 2005-2009 Titan fuel-sender cards that can show roughly one-quarter tank when empty; earlier communications also cover bounded 2004-2005 gauge conditions. This evidence does not support the frozen 2004-2015 identity, two sending units failing together, all stated gauge behaviors or replacing both units as a pair.',
    solution: 'Check the VIN for 10V-074, compare displayed level with measured fuel and sender data, preserve P0460-family diagnostics where applicable, and test the main/sub sender circuits for the exact tank configuration. Do not buy a sender, pump module or fuel tank from this page; recall eligibility, failed circuit and VIN fitment must be established first.',
    symptoms: ['gauge behavior and actual fuel level compared', '2005-2009 recall population separated from other years', 'main and sub sender circuits tested individually'],
    systems: ['fuel level sender card', 'instrument-panel fuel gauge', 'fuel tank wiring and pump-module circuits'],
    evidence: ['10V074 is limited to 2005-2009 Titan.', 'The recall remedy replaces the improved sender card, not a universal two-unit pair.', 'No exact source supports the 2010-2015 expansion.'],
    conflict: 'The indexed page expands a bounded recall into twelve years and asserts two-unit failure and replacement.',
    summary: 'Held the overbroad fuel-sender identity and preserved the exact 2005-2009 recall population and remedy.',
    citations: ['fuelSenderRecall10V074', 'datasets'],
  }),
  [ids.parkingPawl]: retained({
    description: 'NHTSA 22V-457 and 22V-671 together establish rollaway risk for certain 2020-2023 Titan trucks equipped with 9-speed transmissions when the parking pawl does not engage after shifting to Park. The campaigns address different internal conditions: 22V-457 covers reduced clearance/contact at the parking pawl and transmission-case boss for 2020-2022; 22V-671 covers resistance between the parking rod and wedge for 2020-2023. Neither condition has a preceding warning.',
    solution: 'Check the VIN for both campaigns and apply the parking brake every time until all open remedies are completed. A Nissan dealer replaces the parking-pawl pin for eligible 22V-457 vehicles; for 22V-671, dealers reprogram TCM and ECM on 2020-2022 Titan and reprogram TCM on 2023 Titan, free of charge. Do not buy a parking-pawl pin, transmission or control module from this page; campaign and VIN eligibility govern the remedy.',
    symptoms: ['vehicle movement after Park selected', 'no preceding warning', '22V-457 and 22V-671 populations checked separately'],
    systems: ['9-speed transmission parking pawl', 'parking rod, wedge and transmission case', 'TCM/ECM calibration'],
    evidence: ['22V457 exactly covers 2020-2022 Titan and a parking-pawl pin remedy.', '22V671 exactly covers 2020-2023 Titan and model-year-specific reprogramming.', 'Both Part 573 reports describe possible movement after Park with no preceding warning.'],
    summary: 'Retained the exact 2020-2023 Titan parking-pawl rollaway identity and separated the two recall causes and remedies.',
    citations: ['parkingRecall22V457', 'parkingRecall22V671', 'parkingApi22V457', 'parkingApi22V671'],
  }),
  [ids.radiatorHose]: held({
    description: 'The frozen citation 20V-123 is false: that campaign concerns Lion school-bus steering bolts, not Nissan Titan cooling. Titan communications identify a 2010-2013 transmission-to-radiator cooler hose service part, not an upper engine-coolant hose. No exact source supports 2004-2015 internal hose delamination, a check-valve effect, the mileage interval or universal cooling-system replacement.',
    solution: 'Pressure-test the cooling system, inspect hose condition hot and cold, verify thermostat operation, radiator flow, cap, water pump and combustion-gas evidence, and distinguish engine-coolant hoses from transmission cooler hoses. Do not buy hoses, a thermostat, radiator, coolant or water pump from this page; failed circuit, engine and VIN fitment must be established first.',
    symptoms: ['coolant loss, restriction and overheat paths separated', 'engine hose distinguished from transmission cooler hose', 'P0217 treated as overtemperature evidence, not hose proof'],
    systems: ['engine cooling hoses and radiator', 'thermostat, cap and water pump', 'separate transmission cooler circuit'],
    evidence: ['20V123 is a Lion school-bus steering recall.', 'The exact Titan hose communication is for a transmission cooler hose.', 'No primary source supports upper-hose delamination across 2004-2015.'],
    conflict: 'The indexed page cites an unrelated recall and converts a different cooler-hose bulletin into a twelve-year upper-radiator-hose defect.',
    summary: 'Held the false radiator-hose identity and removed the unrelated 20V-123 citation, interval and universal cooling-parts advice.',
    citations: ['falseRecall20V123', 'datasets'],
  }),
  [ids.axleSeal]: held({
    description: 'The frozen 2004-2015 rear-axle-seal page is not supported by an exact primary communication. Nissan communication 10249928 covers diagnosing rear final-drive leaks on 2016-2024 Titan and says to identify and repair leak sources before assembly replacement; it does not establish earlier inner-axle-seal heat deterioration or bilateral failure. The frozen 540-owner total is unsupported.',
    solution: 'Identify the highest fresh leak source, check venting and fluid level, inspect axle-seal, pinion, cover and housing paths, and assess bearing play and brake contamination before repair. Replace friction material when service limits require it. Do not buy axle seals, brakes, gear oil, a CV axle or differential parts from this page; leak source, axle type and VIN fitment must be established first.',
    symptoms: ['seal, pinion and cover leaks separated', 'bearing play and venting checked', 'brake contamination measured before parts choice'],
    systems: ['rear axle seals and shafts', 'rear final-drive housing and vent', 'rear brakes and wheel-end bearings'],
    evidence: ['No exact 2004-2015 seal-defect communication appears in the corpus.', '10249928 applies to later 2016-2024 vehicles.', 'No primary source supports 540 reports or both-sides replacement.'],
    conflict: 'The indexed page imports a later leak-diagnosis bulletin into an earlier twelve-year heat-failure identity.',
    summary: 'Held the unsupported rear-axle-seal identity and removed the fabricated 540-owner total, wrong later-year inference and universal parts list.',
  }),
  [ids.differential]: held({
    description: 'The complete Titan manufacturer corpus does not establish rear pinion-bearing/ring-and-pinion wear as a 2004-2015 defect population or an 80,000-120,000-mile pattern. The exact differential communications in the term inventory concern later front-actuator leaks and later rear-final-drive leak diagnosis, not first-generation rear whine or sudden lockup.',
    solution: 'Document whether noise changes on drive, coast or turns, inspect tire and wheel-bearing causes, measure fluid level/condition, backlash and bearing preload through the service procedure, and localize the axle before teardown. Do not buy gear oil, friction modifier, bearings, gears or a differential assembly from this page; axle, failure source and VIN fitment must be established first.',
    symptoms: ['drive/coast/turn noise behavior documented', 'tire and wheel-bearing noise excluded', 'gear, pinion and carrier conditions measured'],
    systems: ['rear ring and pinion', 'pinion and carrier bearings', 'rear axle fluid, tires and wheel bearings'],
    evidence: ['No exact 2004-2015 rear-whine communication establishes the identity.', 'Later leak bulletins do not prove earlier bearing wear.', 'No primary source supports mileage, lockup risk or a 30,000-mile interval.'],
    conflict: 'The indexed page turns a multi-cause road-speed noise into a twelve-year bearing/gear defect with unsupported failure consequences.',
    summary: 'Held the unsupported rear-differential identity and removed mileage, lockup, fluid-interval and rebuild-price claims.',
  }),
  [ids.tailgate]: held({
    description: 'Titan communications document bounded 2016 tailgates that will not open/unlock and 2016/2020 campaigns to install or service electronic tailgate locks. They do not establish unexpected unlatching or opening while driving across 2020-2024. The frozen page combines latch alignment, switch, actuator, harness, accessories and cargo-loss risk without an exact primary condition record.',
    solution: 'Verify both latches fully engage, inspect striker alignment, release-switch command, actuator, harness and accessory preload, and keep cargo secured until the tailgate remains latched under the exact service test. Do not buy latches, strikers, a switch, actuator or harness from this page; failure mode and VIN fitment must be established first.',
    symptoms: ['failure to latch separated from failure to open/unlock', 'left/right latch engagement verified', 'switch, actuator, harness and accessory paths tested'],
    systems: ['tailgate latches and strikers', 'release switch and lock actuator', 'tailgate harness and bed accessories'],
    evidence: ['Exact communications concern will-not-open/unlock conditions.', '2020 PC772 installs an electronic lock on specific vehicles; it does not prove opening while driving.', 'No source supports a 2020-2024 unexpected-opening population.'],
    conflict: 'The indexed page reverses the documented symptom and expands specific lock campaigns into a five-year unexpected-opening identity.',
    summary: 'Held the unsupported tailgate-opening identity and preserved the distinction between failure to open/unlock and failure to remain latched.',
  }),
  [ids.timingChain]: held({
    description: 'The complete Titan manufacturer corpus does not establish premature VK56DE timing-chain-guide failure across 2004-2015. A generic variable-valve-timing bulletin and a connecting-rod-cap-bolt service-part bulletin do not prove cracked guides, a chain-jump population or catastrophic damage. The frozen comparison to Frontier VQ40DE, 80,000-150,000-mile range, warranty claim, part numbers and 1,600-owner total are unsupported.',
    solution: 'Confirm the engine, preserve cam/crank and oil-pressure data, localize cold and warm noise, verify valve timing and tensioner/oil supply, and inspect chain/guide condition only through the exact engine procedure. Do not buy chains, guides, tensioners, oil or an engine kit from this page; the failure path and exact fitment must be established first.',
    symptoms: ['noise localized before timing teardown', 'cam/crank correlation and oil supply tested', 'guide damage separated from VVT and other engine noise'],
    systems: ['VK56DE timing chains and guides', 'hydraulic tensioners and lubrication', 'cam/crank timing control'],
    evidence: ['No exact 2004-2015 guide-defect communication appears in the corpus.', 'VQ40DE comparison does not prove VK56DE failure.', 'No primary source supports 1,600 reports, warranty extension or the listed kit.'],
    conflict: 'The indexed page transfers another engine family\'s reputation into a twelve-year VK56DE defect and universal parts package.',
    summary: 'Held the unsupported VK56DE timing-chain identity and removed the fabricated 1,600-owner total, warranty and parts claims.',
  }),
});

const pdfSources = Object.freeze({
  parkingRecall22V457: {
    title: 'NHTSA Part 573 22V-457 - 2020-2022 Titan Parking Pawl',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V457-3780.PDF',
    sha256: '444030aeafe68068fe80da41b806dad713e7bf4c520753481eae43a9c750106d',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  parkingRecall22V671: {
    title: 'NHTSA Part 573 22V-671 - 2020-2023 Titan Parking Pawl',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V671-2230.PDF',
    sha256: '1373fd3d2155fc19b778ec6989ebc5307b0b70c90f5100fe9c7928b1297f5a83',
    pageCount: 4,
    visuallyReviewedPages: [1, 2, 3, 4],
  },
});
function recallApi(campaign, title, contains = campaign) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  parkingApi22V457: recallApi('22V457000', 'NHTSA Recall 22V457000 - Titan Parking Pawl Pin'),
  parkingApi22V671: recallApi('22V671000', 'NHTSA Recall 22V671000 - Titan Parking Rod/Wedge'),
  fuelSenderRecall10V074: recallApi('10V074000', 'NHTSA Recall 10V074000 - Titan Fuel Sender'),
  falseRecall20V123: recallApi('20V123000', 'NHTSA Recall 20V123000 - Lion School-Bus Steering', 'Lion Electric Company'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Titan', slug: 'titan', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-titan-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['TITAN', 'TITAN XD'],
  searchTerms: ['catalytic', 'exhaust manifold', 'manifold crack', 'rear axle', 'differential', 'fuel pump', 'fuel gauge', 'sender', 'IPDM', 'ECM relay', 'brake booster', 'brake fluid', 'parking brake', 'diesel', 'Cummins', 'turbo', 'DEF', 'SCR', 'transmission', 'radiator', 'coolant', 'wheel bearing', 'hub', 'tailgate', 'door handle', 'air condition', 'compressor', 'crankshaft', 'bearing', 'engine knock', 'fire', 'wiring'],
  relevantDocumentIds,
  campaigns,
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 18, '2005-2009': 45, '2010-2014': 32, '2015-2019': 443, '2020-2024': 424, '2025-2026': 21 },
    totalRows: 983,
    relevantRowCount: 259,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 14, post: 214 },
    totalRows: 228,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete 228-row Titan/Titan XD recall corpus exactly supports the combined 2020-2023 parking-pawl rollaway title through 22V-457 and 22V-671. Other similar records have narrower years, components or symptoms than the held pages.',
  },
  content,
  requiredProse: [
    { id: ids.transmission, field: 'description', patterns: ['multiple narrow 9-speed branches', 'does not establish', '2020-2024'] },
    { id: ids.fuelSender, field: 'description', patterns: ['10V-074 exactly covers 2005-2009', 'does not support the frozen 2004-2015'] },
    { id: ids.parkingPawl, field: 'description', patterns: ['22V-457 and 22V-671 together', '2020-2023 Titan', 'different internal conditions'] },
    { id: ids.radiatorHose, field: 'description', patterns: ['20V-123 is false', 'Lion school-bus steering', 'transmission-to-radiator cooler hose'] },
    { id: ids.tailgate, field: 'description', patterns: ['will not open/unlock', 'do not establish unexpected unlatching'] },
    { id: ids.timingChain, field: 'description', patterns: ['does not establish premature VK56DE', '1,600-owner total'] },
  ],
  observations: [
    { code: 'one-identity-retained-eleven-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only the exact combined 2020-2023 parking-pawl recall identity clears the title/year/mechanism gate; eleven Titan pages remain published but held.' },
    { code: 'two-parking-pawl-campaigns-separated', severity: 'safety-accuracy', recordIds: [ids.parkingPawl], detail: '22V-457 and 22V-671 have different internal causes and remedies and are preserved as separate VIN checks under the one accurate title.' },
    { code: 'false-recall-20v123', severity: 'safety-accuracy', recordIds: [ids.radiatorHose], detail: '20V-123 is a Lion school-bus steering recall, not a Titan radiator-hose campaign.' },
    { code: 'tailgate-symptom-reversed', severity: 'technical-accuracy', recordIds: [ids.tailgate], detail: 'Exact communications describe tailgates that will not open/unlock or missing locks, not unexpected opening while driving.' },
    { code: 'bounded-fuel-sender-recall', severity: 'technical-accuracy', recordIds: [ids.fuelSender], detail: '10V-074 supports 2005-2009 only and does not establish the frozen 2004-2015 two-sender replacement identity.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 3,060 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-titan-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Titan page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
