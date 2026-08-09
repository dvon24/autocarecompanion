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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazda3-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDA3']);

const IDS = Object.freeze({
  carbon: 'mazda-mazda3-carbon-buildup-di-2012',
  manualShift: 'mazda-mazda3-clutch-judder-2014',
  dashboard: 'mazda-mazda3-dashboard-melting-2004',
  infotainment: 'mazda-mazda3-infotainment-crash-2014',
  purge: 'mazda-mazda3-purge-valve-2014',
  parkingBrake: 'mazda-mazda3-rear-brake-seizing-2010',
  rearShock: 'mazda-mazda3-rear-shock-mount-2004',
  torsionBeam: 'mazda-mazda3-torsion-beam-bushing-2014',
  windshield: 'mazda-mazda3-windshield-stress-crack-2019',
});

const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const IDENTITY_REVIEW_IDS = Object.freeze([IDS.rearShock, IDS.torsionBeam, IDS.windshield].sort());
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10097278', '10105463', '10118483', '10129576', '10162013', '10237206', '10240424',
]);
const CAMPAIGNS = Object.freeze([
  '04V468000', '04V559000', '09E011000', '09V126000', '09V187000', '10V374000',
  '11V329000', '14V173000', '15V621000', '16V644000', '16V684000', '16V685000',
  '17V082000', '17V393000', '17V745000', '19V272000', '19V363000', '19V425000',
  '19V497000', '19V514000', '19V558000', '19V907000', '20V346000', '21V101000',
  '21V494000', '21V875000', '23V487000', '23V718000', '24V649000', '25V357000',
]);

const PDF_SOURCES = Object.freeze({
  carbon: {
    title: 'Mazda TSB 01-020/15: 2012-2013 Mazda3 SKYACTIV Cold-Start Misfire',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10105463-2532.pdf',
    localPath: 'C:/tmp/mazda3-sources/SB-10105463-2532.pdf',
    pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 1826769,
    sha256: '45a02f62f95ef3ed5884360130ff37ad5b48c8862d97d94a8514d6fcae36335e',
  },
  manualShift: {
    title: 'Mazda TSB 05-005/19: Mazda3 Manual-Transaxle Hard Shifting',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10162013-0001.pdf',
    localPath: 'C:/tmp/mazda3-sources/MC-10162013-0001.pdf',
    pages: 11, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], bytes: 553480,
    sha256: '2e7c5f1db2aeb8e8c2abc9c6d0c5970cae1c3604732c51f23a30bfc06537dca5',
  },
  dashboard: {
    title: 'Mazda SSP99: 2010 Mazda3 Dashboard Upper-Panel Sticky Surface',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10118483-9999.pdf',
    localPath: 'C:/tmp/mazda3-sources/MC-10118483-9999.pdf',
    pages: 13, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], bytes: 440630,
    sha256: '94b1dd543a7df09475eb392da1be87de60be0a365e385a96d84de175826bc7ce',
  },
  connectSoftware: {
    title: 'Mazda TSB 16-008/23: Mazda Connect Software Update',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10240424-0001.pdf',
    localPath: 'C:/tmp/mazda3-sources/MC-10240424-0001.pdf',
    pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 355016,
    sha256: 'c92ef3c59ea9e9031188f89a41e77e8504ffbd5eaa488185c00702a8cd961265',
  },
  connectDram: {
    title: 'Mazda TSB 16-003/23: Mazda Connect Screen May Not Start',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237206-0001.pdf',
    localPath: 'C:/tmp/mazda3-sources/MC-10237206-0001.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 1016402,
    sha256: '54961e64a2d5ad4ed74bc90be104143cb3a27e6c134c2877eaf5edde91aa926e',
  },
  evap: {
    title: 'Mazda TSB 01-002/18: Determining EVAP Leak Location',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129576-9999.pdf',
    localPath: 'C:/tmp/mazda3-sources/MC-10129576-9999.pdf',
    pages: 12, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], bytes: 745326,
    sha256: 'c8a880cccbc20769db34d80e5ce6ceaf627691e9ca602775a2ef3009b9ee9447',
  },
  parkingBrakeRecall: {
    title: 'NHTSA Part 573 Report 17V393: Mazda Parking-Brake Caliper Corrosion',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V393-3791.PDF',
    localPath: 'C:/tmp/mazda3-sources/RCLRPT-17V393-3791.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 216040,
    sha256: '8b4e42f5a916f53cf812f6acac7a74481b67225e074ce20b1ebcbbd0814f3af4',
  },
  rearShockDifferentScope: {
    title: 'Mazda TSB 02-002/13: 2010-2011 Mazda3 Rear-Shock Fluid Leak or Clunk',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10097278-2532.pdf',
    localPath: 'C:/tmp/mazda3-sources/SB-10097278-2532.pdf',
    pages: 2, visualPages: [1, 2], bytes: 19670,
    sha256: 'ae1c8169a016289c999c1043076effd38d24beae90255bb413d49ad547fb2aba',
  },
  spec2014: {
    title: 'Mazda 2014 Mazda3 Specification Deck',
    type: 'manufacturer',
    url: 'https://news.mazdausa.com/download/MAZDA3-14MY-SpecDeck-082613-v2014.6-for-press.pdf',
    localPath: 'C:/tmp/mazda3-sources/MAZDA3-14MY-SpecDeck.pdf',
    pages: 14, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], bytes: 1719911,
    sha256: '8cc58ee5ef8e04fe8dae6d0a7325b2aa3b098a014ccc390f3053872e5b3dc966',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  dashboardStatement: { title: 'Mazda USA: Mazda3 Dashboard Warranty Extension Statement', type: 'manufacturer', url: 'https://news.mazdausa.com/2016-08-05-Mazda3-and-Mazda6-Warranty-Extension-Statement' },
  torsionIntroduction: { title: 'Mazda USA: All-New Mazda3 Suspension Architecture', type: 'manufacturer', url: 'https://news.mazdausa.com/news-releases?item=123183' },
  windshieldComplaintA: { title: 'NHTSA Complaint ODI 11300179: 2019 Mazda3 Windshield', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11300179' },
  windshieldComplaintB: { title: 'NHTSA Complaint ODI 11390068: 2019 Mazda3 Windshield', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11390068' },
  windshieldManual: { title: 'Mazda3 Owner Manual: Forward Sensing Camera and Windscreen Repair', type: 'manufacturer', url: 'https://owners-manual.mazda.com/gen/en/mazda3/mazda3_8hc8ee19b/contents/05282101.html' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 40, '2005-2009': 55, '2010-2014': 26, '2015-2019': 946, '2020-2024': 898, '2025-2026': 172 },
  totalRows: 2137,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 10, post: 54 },
  totalRows: 64,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.carbon]: [PDF_SOURCES.carbon],
    [IDS.manualShift]: [PDF_SOURCES.manualShift],
    [IDS.dashboard]: [PDF_SOURCES.dashboard, OTHER_SOURCES.dashboardStatement],
    [IDS.infotainment]: [PDF_SOURCES.connectSoftware, PDF_SOURCES.connectDram],
    [IDS.purge]: [PDF_SOURCES.evap],
    [IDS.parkingBrake]: [PDF_SOURCES.parkingBrakeRecall],
    [IDS.rearShock]: [OTHER_SOURCES.datasets, PDF_SOURCES.rearShockDifferentScope],
    [IDS.torsionBeam]: [PDF_SOURCES.spec2014, OTHER_SOURCES.torsionIntroduction],
    [IDS.windshield]: [OTHER_SOURCES.datasets, OTHER_SOURCES.windshieldComplaintA, OTHER_SOURCES.windshieldComplaintB, OTHER_SOURCES.windshieldManual],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda3 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.carbon]: {
      confidence: 'high',
      dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
      description: 'Mazda TSB 01-020/15 covers specified 2012-2013 Mazda3 SKYACTIV vehicles that store P0300-P0304 during accelerated warm-up. Mazda ties the condition to intake-valve carbon only when freeze-frame data matches its narrow cold-start pattern: calculated load above 70 percent, coolant below 100 degrees Fahrenheit, engine speed above 1,300 rpm, vehicle speed zero, ignition timing from minus 21 to minus 8 degrees, and run time under 45 seconds. The bulletin does not establish routine intake cleaning for every Mazda3 misfire.',
      solution: 'Preserve freeze-frame data and compare it with TSB 01-020/15 before attributing the misfire to deposits. If the exact pattern matches, Mazda directs a controlled dealer procedure: remove the intake manifold and spark plugs, visually confirm deposits, clean each intake valve with the specified equipment and method, reassemble, update the PCM when applicable, then replace the engine oil and filter. If the pattern does not match, perform normal ignition, fuel, compression and air-leak diagnosis. Do not buy a catch can, retail intake spray or cleaning kit from this page; the verified procedure is technician-controlled and requires an oil and filter change.',
      symptoms: ['Check-engine light during accelerated warm-up', 'Cold-start unstable combustion or misfire', 'P0300-P0304 with the bulletin freeze-frame pattern'],
      summary: 'Kept the exact TSB identity and added the visually verified oil/filter step plus a firm boundary against retail cleaning products.',
    },
    [IDS.manualShift]: {
      confidence: 'high', dtcCodes: [],
      description: 'Mazda TSB 05-005/19 covers specified early-production 2012-2016 Mazda3 vehicles with the C66M-R six-speed manual transaxle. The documented conditions are hard shifting into 3rd, 4th, 5th or 6th; jumping out of 3rd over a road bump while accelerating after deceleration; and shift-lever vibration in 3rd or 4th. Mazda identifies internal 3-4 or 5-6 clutch hubs, gears and synchronizer rings. These clutch hubs are synchronizer assemblies inside the transaxle, not the friction clutch disc, pressure plate or flywheel.',
      solution: 'Verify the exact symptom, VIN/build cutoff and transaxle number against TSB 05-005/19. The transaxle must be removed and the technician must use Mazda’s symptom, modification and gear-ratio tables plus the current EPC to select internal parts; some configurations require a complete transaxle. Do not buy a friction-clutch kit, flywheel, synchronizer or used transmission from this page; there is no universal part set across the frozen years.',
      symptoms: ['Hard shifting into 3rd, 4th, 5th or 6th', 'Shifter jumps out of 3rd under the bulletin driving condition', 'Shift lever vibrates in 3rd or 4th'],
      summary: 'Preserved the indexed title while making explicit that Mazda documents internal transaxle synchronizer hardware, not clutch-friction judder.',
    },
    [IDS.dashboard]: {
      confidence: 'high', dtcCodes: [],
      description: 'Mazda SSP99 covered certain 2010 Mazda3 vehicles produced from October 7, 2008 through April 28, 2010 whose dashboard upper surface became sticky after prolonged exposure to high heat and humidity. SSP99 applied only to the verified sticky-surface condition; discoloration, warping, splitting and other damage were outside the extension. The program specified dashboard replacement and listed BBM4-60-400H-02 at the time, but that historical number is not proof of current supersession, color, fitment or availability.',
      solution: 'Confirm the VIN/build range and distinguish the sticky surface described by SSP99 from cracking, warping, splitting, contamination or another failure. SSP99 was a ten-year extension from the original warranty start date, not lifetime coverage; in 2026, do not promise a free repair, and ask Mazda to verify the individual vehicle’s program history and any case-specific assistance. Do not buy a dashboard, overlay, mat, wrap or protectant from this page; a dealer must confirm the current supersession and exact finish before any replacement is ordered.',
      symptoms: ['Dashboard upper surface becomes sticky or tacky', 'Condition follows prolonged high heat and humidity exposure'],
      summary: 'Retained exact SSP99 scope, removed the unsourced commerce record and prevented both an expired free-repair promise and use of a historical part number as current fitment.',
    },
    [IDS.infotainment]: {
      confidence: 'high', dtcCodes: ['U3000:49'],
      description: 'Mazda TSB 16-008/23 covers defined software symptoms on specified non-turbo 2019-2022 Mazda3 VIN ranges, including black or frozen displays, reboots, audio/control faults and certain Bluetooth, USB, CarPlay, Android Auto, camera and navigation behavior. TSB 16-003/23 covers a narrower blank-screen or slow-restart condition on specified 2019-2022 vehicles whose CMU part and serial numbers fall in listed DRAM ranges. The frozen citations mislabeled those bulletins as 16-001/23 and 16-004/23; neither source establishes that every freeze is failed storage or that one CMU fits every vehicle.',
      solution: 'Record the exact symptom, installed software and any infotainment DTC. Have a Mazda technician verify VIN, build plant/date, turbo applicability, CMU part number and CMU serial number. Apply the Mazda-authorized software update when TSB 16-008/23 matches. Replace the CMU under TSB 16-003/23 only when the part and serial range match the affected DRAM population. Do not buy a used or generic CMU from this page; most listed symptoms follow a software path and hardware eligibility is serial-specific.',
      symptoms: ['Center display freezes, turns black or reboots', 'Mazda Connect is blank or slow to restart after startup', 'Listed audio, phone, navigation or camera-display behavior'],
      summary: 'Corrected both bulletin numbers and retained separate software versus serial-specific CMU paths without introducing retail hardware.',
    },
    [IDS.purge]: {
      confidence: 'high', dtcCodes: ['P0441', 'P0442', 'P0455', 'P0456'],
      description: 'Mazda TSB 01-002/18 gives a diagnostic workflow for 2004-2010 Mazda3 vehicles with P0441, P0442, P0455 or P0456. The same code family can result from a loose, damaged, rusty or leaking filler cap or neck, another EVAP-system leak, or a purge solenoid that fails the specified sealing or flow tests. Mazda explicitly notes that a filler-cap leak can store P0441. The bulletin is not evidence that a purge valve is the default repair.',
      solution: 'Preserve all stored DTCs and follow TSB 01-002/18: check related fuel-system codes, run the KOEO EVAP test, inspect and leak-test the filler cap/neck, locate other leaks with the specified detector or smoke-test process, and test purge-valve gas tightness. For P0441, run Mazda’s KOER purge-flow self-test. Replace the purge solenoid only after it fails the applicable test, then repeat the EVAP test. Do not buy a purge valve, cap, canister or leak kit from this page; identify the failed component and verify its VIN application first.',
      symptoms: ['Check-engine light with an applicable EVAP code', 'P0441 incorrect purge flow', 'P0442, P0455 or P0456 EVAP leak code'],
      summary: 'Kept Mazda’s complete test-first EVAP workflow and blocked code-only purge-valve replacement.',
    },
    [IDS.parkingBrake]: {
      confidence: 'high', dtcCodes: [],
      description: 'Mazda recall 1217F / NHTSA 17V393 covers specified 2014-2016 Mexico-built Mazda3 vehicles equipped with a hand-operated parking-brake lever. In cold conditions, water may enter through inadequate rear-caliper protective-boot sealing, corroding the parking-brake actuator shaft. The shaft can stick and cause brake drag or reduced parking-brake holding force; on a slope, reduced holding force can allow an unattended vehicle to move. Eligibility is VIN-specific.',
      solution: 'Check the VIN in the NHTSA or Mazda recall lookup. If 1217F is open, arrange the free remedy with an authorized Mazda dealer. Mazda directs inspection of the left and right actuator shafts: a corroded shaft requires rear-caliper replacement, while a non-corroded shaft receives the improved protective-boot remedy. Do not buy a caliper, cable, boot kit or lubricant from this page; campaign eligibility and the dealer inspection determine the no-charge repair.',
      symptoms: ['Rear brake drags while driving', 'Hand-operated parking brake does not hold securely', 'Vehicle may move after being parked on a slope'],
      summary: 'Reduced the remedy to the exact Part 573 inspection boundary and free VIN-specific dealer repair without unsupported retail procedure detail.',
    },
    [IDS.rearShock]: {
      confidence: 'low', dtcCodes: [],
      description: 'The complete reviewed Mazda3 manufacturer-communication inventory did not establish recurring rear-shock upper-mount, rubber-bushing or bearing failure for the frozen 2004-2009 scope. Mazda TSB 02-002/13 describes a different condition on 2010-2011 Mazda3 vehicles: rear-shock fluid leakage and sometimes a clunk caused by damage to the shock absorber’s inner seal. It says one leaking shock may be replaced and pair replacement is not automatically necessary. That bulletin does not support the frozen years or an upper-mount mechanism.',
      solution: 'For a rear knock, bounce or visible fluid, inspect the actual shock body, fasteners, upper and lower attachment points, springs, bushings and nearby trim before selecting a repair. A 2010-2011 vehicle with the exact leaking-shock condition should be evaluated against TSB 02-002/13, not expanded backward to 2004-2009. Do not buy shocks or upper mounts from this page; the frozen identity remains held because the reviewed primary evidence does not establish its component, years or pair-replacement advice.',
      symptoms: ['Rear knock or clunk over bumps', 'Excessive rear bounce', 'Visible shock fluid or attachment damage requires inspection'],
      summary: 'Held an unsupported 2004-2009 upper-mount identity and removed universal pair replacement; the only exact Mazda shock bulletin is a different 2010-2011 inner-seal condition.',
    },
    [IDS.torsionBeam]: {
      confidence: 'low', dtcCodes: [],
      description: 'Mazda’s official 2014 specification identifies an independent E-type multi-link rear suspension on every 2014 Mazda3 configuration. Mazda’s official all-new-generation release states that the redesigned Mazda3 uses a torsion-beam rear setup. Therefore the frozen 2014-2018 identity cannot describe a torsion-beam bushing on the vehicle generation named by the page, and the reviewed record does not support its salt, UV, alignment or tire-wear mechanism.',
      solution: 'For rear clunks, wandering or tire wear on a 2014-2018 Mazda3, inspect the vehicle’s actual independent multi-link suspension, wheel/tire condition and alignment rather than ordering a torsion-beam bushing. The frozen component does not exist in the stated vehicle architecture; a later redesigned Mazda3 must not be used to infer a defect on the frozen years. Do not buy torsion-beam bushings, a used beam or polyurethane upgrades from this page; this indexed identity requires an approved title/slug/year decision.',
      symptoms: ['Rear clunk, wander or tire wear requires inspection', 'Frozen component does not exist in the stated 2014-2018 architecture'],
      summary: 'Held a physically impossible 2014-2018 torsion-beam identity using Mazda’s own multi-link specification and later torsion-beam introduction statement.',
    },
    [IDS.windshield]: {
      confidence: 'low', dtcCodes: [],
      description: 'Two individual NHTSA complaints describe 2019 Mazda3 windshield cracking. ODI 11300179 reports one small crack without an obvious impact and also a prior full-width crack after a slight impact; ODI 11390068 says a very small rock chip led to a full crack. These owner reports do not establish an unusually high rate, a spontaneous-stress defect across 2019-2025 vehicles, or the frozen body-flex, rake-angle and bonding-tolerance causes. The complete reviewed communication inventory did not identify a Mazda3 bulletin establishing that broad defect identity.',
      solution: 'Have a qualified glass technician inspect the crack origin for an impact point, edge damage, installation stress and body-opening damage before assigning a cause. Mazda’s owner manual says the Forward Sensing Camera is mounted to the windscreen and recommends expert repair/replacement around it; camera, rain-sensor and display requirements vary by equipment and must be verified. Do not buy windshield glass from this page; confirm the exact glass, sensors and required calibration for the VIN, and do not assume insurance or goodwill coverage.',
      symptoms: ['Windshield crack with no obvious impact reported in one complaint', 'Small rock chip followed by a spreading crack reported in another complaint', 'Glass and camera installation require vehicle-specific inspection'],
      summary: 'Held the broad spontaneous-stress identity, bounded two individual 2019 complaints, and removed unsupported prevalence, mechanism and coverage claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda3 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.carbon]: ['TSB 01-020/15 establishes a narrow freeze-frame pattern and controlled intake-valve cleaning procedure.', 'The visually reviewed final step requires engine-oil and filter replacement.'],
    [IDS.manualShift]: ['TSB 05-005/19 establishes internal hubs, gears and synchronizer rings by symptom and production modification.', 'The bulletin does not identify the friction clutch as the cause.'],
    [IDS.dashboard]: ['SSP99 establishes certain 2010 VIN/build scope, sticky-surface-only coverage and a ten-year extension.', 'The historical dashboard number requires current supersession and finish verification.'],
    [IDS.infotainment]: ['TSB 16-008/23 is the software path and excludes 2.5T vehicles.', 'TSB 16-003/23 requires exact CMU part and serial-range matching before hardware replacement.'],
    [IDS.purge]: ['TSB 01-002/18 requires cap/neck, other-leak and purge-valve testing before replacement.', 'P0441 may be stored by a filler-cap leak.'],
    [IDS.parkingBrake]: ['Part 573 report 17V393 establishes exact Mexico-built hand-lever scope, corrosion risk and free dealer remedy.', 'The inspected actuator-shaft condition determines boot repair versus caliper replacement.'],
    [IDS.rearShock]: ['No exact 2004-2009 upper-mount bulletin was found in the complete inventory.', 'TSB 02-002/13 is explicitly 2010-2011 and covers shock inner-seal leakage, not the frozen upper-mount mechanism.'],
    [IDS.torsionBeam]: ['Mazda’s 2014 specification states independent multi-link rear suspension.', 'Mazda’s later all-new-generation release identifies the torsion-beam setup, contradicting the frozen 2014-2018 component identity.'],
    [IDS.windshield]: ['Two exact 2019 ODI complaints are individual owner reports, one involving a small rock chip and one mixing no-obvious-impact and slight-impact events.', 'No reviewed Mazda communication establishes broad 2019-2025 prevalence or the frozen mechanism.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.carbon]: 'Dealer-only controlled cleaning procedure; no universal retail cleaning product.',
    [IDS.manualShift]: 'No universal retail part; internal transaxle parts vary by symptom, VIN, transaxle number and gear ratio.',
    [IDS.dashboard]: 'No universal retail part; the historical dashboard number needs dealer supersession, color and VIN verification.',
    [IDS.infotainment]: 'No universal retail part; software applicability and CMU part/serial range must be verified first.',
    [IDS.purge]: 'No universal retail part; the actual cap, leak location or failed purge valve must be identified first.',
    [IDS.parkingBrake]: 'Free VIN-specific dealer remedy; no user-selected retail part.',
    [IDS.rearShock]: 'No universal retail part; actual shock, mount or suspension failure must be inspected first.',
    [IDS.torsionBeam]: 'No universal retail part; the frozen component is absent from the stated vehicle architecture.',
    [IDS.windshield]: 'No universal retail part; glass, sensors and calibration requirements are VIN/equipment-specific.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.rearShock]: 'The frozen title asserts rear-shock upper-mount failure for 2004-2009, while the complete inventory found only a different 2010-2011 shock inner-seal bulletin.',
    [IDS.torsionBeam]: 'The frozen title asserts a torsion-beam bushing on 2014-2018 vehicles that Mazda specifies have independent multi-link rear suspension.',
    [IDS.windshield]: 'The frozen title and 2019-2025 scope assert a spontaneous-stress defect, while the evidence is limited to two individual 2019 complaints and no defect-finding bulletin.',
  };
  return map[id] || null;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: clone(content.symptoms),
    affectedSystems: [],
    dtcCodes: clone(content.dtcCodes),
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: before.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source); delete value.localPath; return [key, value];
  }));
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda3').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9) throw new Error(`Expected 9 frozen Mazda3 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    const identityReviewRequired = IDENTITY_REVIEW_IDS.includes(row.id);
    return {
      id: row.id,
      action: identityReviewRequired ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' : 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      identityReviewRequired,
      identityConflict: identityConflictFor(row.id),
      reason: content.summary,
      evidence: evidenceFor(row.id),
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
    model: 'Mazda3',
    completionStatement: 'All 9 frozen Mazda3 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 9 rows contain material source, diagnosis, remedy or commerce corrections; three also require an approved indexed-identity decision before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Individual complaints are owner reports, not prevalence estimates or defect findings.',
      'Frozen identities contradicted or unsupported by primary evidence remain explicit holds rather than silent rewrites.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazda3-bulletin-numbers-corrected', severity: 'source-correction', recordIds: [IDS.infotainment], detail: 'The exact PDFs are Mazda TSB 16-008/23 and 16-003/23, not the bulletin numbers frozen in the current prose.' },
      { code: 'mazda3-identity-holds', severity: 'identity-hold', recordIds: IDENTITY_REVIEW_IDS, detail: 'The rear-shock scope is unsupported, the torsion-beam component is absent from 2014-2018 cars, and the windshield evidence does not establish the frozen broad defect.' },
      { code: 'mazda3-commerce-removed', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Historical part numbers, generic kits and fitment-free repairs are not published as buy links.' },
      { code: 'all-mazda3-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazda3 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 6, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 0, total: 9 },
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
  BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDENTITY_REVIEW_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket,
  citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor,
};
