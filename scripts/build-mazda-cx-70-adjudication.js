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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-70-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CX-70', 'CX70']);

const IDS = Object.freeze({
  battery: 'mazda-cx-70-12v-battery-drain-dead-battery-while-parked',
  transmission: 'mazda-cx-70-8-speed-transmission-clunky-jerky-low-speed-shifting-hesitat',
  bsm: 'mazda-cx-70-blind-spot-monitoring-false-phantom-rear-corner-warnings',
  dashEsu: 'mazda-cx-70-dash-electrical-supply-unit-malfunction-defroster-seat-belt',
  p0531: 'mazda-cx-70-engine-malfunction-have-engine-inspected-warning-from-c-refr',
  hybridWarning: 'mazda-cx-70-hybrid-system-malfunction-warning-engine-stall-power-loss',
  fuelGauge: 'mazda-cx-70-inaccurate-fuel-gauge-reading',
  fuelDoor: 'mazda-cx-70-interior-rattles-from-cargo-area-subwoofer-panel-fuel-door',
  inverterRecall: 'mazda-cx-70-loss-drive-power-ev-mode-from-faulty-inverter-software',
  phantomBraking: 'mazda-cx-70-phantom-braking-false-smart-brake-support-activation',
  chargeFault: 'mazda-cx-70-phev-fails-to-charge-charger-shows-service-fault',
  suddenAcceleration: 'mazda-cx-70-sudden-unintended-low-speed-acceleration-forward-lurch',
  heatTrim: 'mazda-cx-70-sun-heat-induced-melting-warping-plastic-trim',
  water: 'mazda-cx-70-water-intrusion-into-cabin-cargo-area',
  infotainmentLag: 'mazda-cx70-infotainment-lag-2025',
  infotainmentUpdates: 'mazda-cx70-infotainment-updates-2025',
  mapLight: 'mazda-cx70-panoramic-roof-creak-2025',
  phevSoftware: 'mazda-cx70-phev-software-glitches-2025',
  liftgateSpoiler: 'mazda-cx70-rear-suspension-noise-2025',
});

const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const IDENTITY_REVIEW_IDS = Object.freeze([IDS.fuelGauge, IDS.phevSoftware, IDS.water].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '11009648', '11009650', '11016222', '11017477', '11017484',
  '11020035', '11024838', '11024995', '11024997', '11033118',
]);
const CAMPAIGNS = Object.freeze(['24V814000', '24V815000', '24V817000', '25V568000']);

const PDF_SOURCES = Object.freeze({
  transmissionGrunt: {
    title: 'Mazda SA-074/24: 2025 CX-70 PHEV 1-2 Shift Grunt Is Operating as Designed',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009648-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11009648-0001.pdf',
    pages: 1, visualPages: [1], bytes: 111668,
    sha256: '784fb610b774a38a112f825e68918f859bab4dc69a14b22ef97de647515294bd',
  },
  coldEvMode: {
    title: 'Mazda SA-076/24: Low Temperature Can Suspend CX-70 PHEV EV Mode',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009650-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11009650-0001.pdf',
    pages: 2, visualPages: [1, 2], bytes: 170455,
    sha256: 'f5cdd5778d3ee1e8c3bf5b2043bad7d20c1349df343e70973ff9e0b6c7395d16',
  },
  mapLight: {
    title: 'Mazda TSB 09-015/25: Early CX-70 Front Map-Light Rattle',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016222-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11016222-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 239494,
    sha256: '6d8e2da3a14f4eb9425f70bc76e3a3ec5f210bf3ccc7e1373f56f37aa7a7e6d6',
  },
  p0531: {
    title: 'Mazda TSB 07-001/25: CX-70 PHEV Check-Engine Light with DTC P0531:00',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017477-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11017477-0001.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 234922,
    sha256: '187bc93020ed3ae538e7f2ede076381827a4454d8ca4782c9105c25fda51f4d9',
  },
  liftgateSpoiler: {
    title: 'Mazda TSB 09-020/25: Early CX-70 Liftgate Side-Spoiler Rattle',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017484-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11017484-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 273551,
    sha256: 'aec702902b09f5d1102338231572e8080e84b5289e97bf8af496460de4d3ce9a',
  },
  batteryTest: {
    title: 'Mazda SA-007/25: CX-70 12-Volt Battery Test Procedure and Ratings',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11020035-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11020035-0001.pdf',
    pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 1510969,
    sha256: '5093148707821a59653ca76938a8271e39d661b8edcb11a337a2e5c9ae93e13a',
  },
  infotainment: {
    title: 'Mazda TSB 16-004/25: CX-70 Mazda Connect Software Version 10026',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024838-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11024838-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 204763,
    sha256: 'fc093d33d0f56508c26d9fe496b0a9c4b983e4e244993ba90f400a79b40b805a',
  },
  fuelDoor: {
    title: 'Mazda SA-011/25: 2025-2026 CX-70 Inline-6 Fuel Door Stuck Closed',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024995-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11024995-0001.pdf',
    pages: 2, visualPages: [1, 2], bytes: 153361,
    sha256: '380e9b08cfdb17fcb67852cf77093b1051009a7353e02907c442c2a2d8891c82',
  },
  batteryMaintenance: {
    title: 'Mazda SA-029/25: CX-70 Dealer Battery Maintenance and Discharge Diagnosis',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024997-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11024997-0001.pdf',
    pages: 10, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], bytes: 615686,
    sha256: 'd61a5b45908e5b34f2114191e85bf27fab7507ddeed0c90855e4a9d5ee2cd88b',
  },
  bsm: {
    title: 'Mazda TSB 15-001/26: CX-70 BSM Warning with No Vehicle Behind',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11033118-0001.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/MC-11033118-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 211998,
    sha256: 'e9fa7046f5ff1319c3c2434696c472c9b67abc69dbc1c2d4e237b7f140075bf6',
  },
  dashRecall: {
    title: 'NHTSA Part 573 Report 24V-814: CX-70 Dash-ESU Startup Software',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V814-5848.PDF',
    localPath: 'C:/tmp/mazda-cx70-sources/RCLRPT-24V814-5848.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 219225,
    sha256: '06936412f3572aa7be6cb49aecc3fd578778301780de9a6b20cf3ff72107680f',
  },
  pcmRecall: {
    title: 'NHTSA Recall 24V-815: CX-70 PCM/ECM Software and Loss of Drive Power',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V815-6161.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/RCAK-24V815-6161.pdf',
    pages: 2, visualPages: [1, 2], bytes: 645438,
    sha256: '2b9efda57c8fd97093ab6d1102baf8b7e2600eb333659b39d7aeb6163fe23199',
  },
  inverterRecall: {
    title: 'NHTSA Part 573 Report 24V-817: CX-70 PHEV Inverter Software',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V817-6186.PDF',
    localPath: 'C:/tmp/mazda-cx70-sources/RCLRPT-24V817-6186.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 216385,
    sha256: 'ac7128f136084063d3830d44e301808da02a5e1cc27a1abb53f2f46665ff169c',
  },
  fuelGaugeRecall: {
    title: 'NHTSA Part 573 Report 25V-568: 2025 CX-70 MHEV Inaccurate Fuel Gauge',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V568-9748.pdf',
    localPath: 'C:/tmp/mazda-cx70-sources/RCLRPT-25V568-9748.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 472397,
    sha256: '912657ae0cf09f1f1ed30b169cb948061fc2bdd7f2c6948ea6f299e4ac92e844',
  },
});

const OTHER_SOURCES = Object.freeze({
  suddenAcceleration: { title: 'NHTSA Complaint 11631266: 2025 CX-70 Low-Speed Acceleration', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11631266' },
  heatTrim: { title: 'NHTSA Complaint 11671136: 2025 CX-70 Heat-Deformed Trim', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11671136' },
  water: { title: 'NHTSA Complaint 11632568: 2025 CX-70 Water from Forward Ceiling', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11632568' },
  phantomBraking: { title: 'NHTSA Complaint 11736754: 2025 CX-70 Unexpected Automatic Braking', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11736754' },
  hybridWarning: { title: 'NHTSA Complaint 11740990: 2025 CX-70 Hybrid-System Warning', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11740990' },
  hybridPowerLoss: { title: 'NHTSA Complaint 11698488: 2025 CX-70 Reported Power Loss After Recall Update', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11698488' },
  sbsManual: { title: '2025 CX-70 Owner Manual: Smart Brake Support Warnings and Cautions', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70/contents/65520200.html' },
  sbsOperation: { title: '2025 CX-70 Owner Manual: Smart Brake Support Operating Conditions', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70/contents/65520300.html' },
  radarManual: { title: '2025 CX-70 Owner Manual: Radar Sensor Care', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70/contents/65320100.html' },
  chargeManual: { title: '2025 CX-70 PHEV Owner Manual: Charging Is Not Possible', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70-phev/contents/68220100.html' },
  chargeProcedure: { title: '2025 CX-70 PHEV Owner Manual: Charging Procedure and Indicators', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70-phev/contents/65290300.html' },
  phevModes: { title: '2025 CX-70 PHEV Owner Manual: PHEV Modes and Engine Operation', type: 'manual', url: 'https://www.mazdausa.com/static/manuals/2025/cx-70-phev/contents/65030300.html' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 105, '2025-2026': 156 },
  totalRows: 261, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 10 }, totalRows: 10, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { title: source.title, type: source.type, url: source.url }; }
function citationsFor(id) {
  const map = {
    [IDS.battery]: [PDF_SOURCES.batteryTest, PDF_SOURCES.batteryMaintenance],
    [IDS.transmission]: [PDF_SOURCES.transmissionGrunt, PDF_SOURCES.pcmRecall],
    [IDS.bsm]: [PDF_SOURCES.bsm],
    [IDS.dashEsu]: [PDF_SOURCES.dashRecall],
    [IDS.p0531]: [PDF_SOURCES.p0531],
    [IDS.hybridWarning]: [PDF_SOURCES.inverterRecall, OTHER_SOURCES.hybridWarning, OTHER_SOURCES.hybridPowerLoss],
    [IDS.fuelGauge]: [PDF_SOURCES.fuelGaugeRecall],
    [IDS.fuelDoor]: [PDF_SOURCES.fuelDoor],
    [IDS.inverterRecall]: [PDF_SOURCES.inverterRecall],
    [IDS.phantomBraking]: [OTHER_SOURCES.phantomBraking, OTHER_SOURCES.sbsManual, OTHER_SOURCES.sbsOperation, OTHER_SOURCES.radarManual],
    [IDS.chargeFault]: [OTHER_SOURCES.chargeManual, OTHER_SOURCES.chargeProcedure],
    [IDS.suddenAcceleration]: [OTHER_SOURCES.suddenAcceleration],
    [IDS.heatTrim]: [OTHER_SOURCES.heatTrim],
    [IDS.water]: [OTHER_SOURCES.water],
    [IDS.infotainmentLag]: [PDF_SOURCES.infotainment],
    [IDS.infotainmentUpdates]: [PDF_SOURCES.infotainment],
    [IDS.mapLight]: [PDF_SOURCES.mapLight],
    [IDS.phevSoftware]: [PDF_SOURCES.coldEvMode, PDF_SOURCES.inverterRecall, OTHER_SOURCES.phevModes],
    [IDS.liftgateSpoiler]: [PDF_SOURCES.liftgateSpoiler],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-70 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.battery]: {
      confidence: 'high',
      description: 'Mazda service alerts for 2025-2026 CX-70 vehicles provide battery testing, charging, storage-maintenance and discharged-battery diagnostic procedures. They identify different 12-volt battery inputs for the Inline-6 and PHEV and list several possible causes of discharge, including repeated power-on use without activating the drive system, long storage, loose or corroded connections, charging-system faults, accessories, excessive key-off draw and battery condition. These sources do not establish a universal parked-current defect or prove that a low-voltage warning means the battery itself has failed.',
      solution: 'Identify the powertrain and installed battery rating, inspect the case, hold-down, terminals and grounds, then fully charge and test the battery using Mazda\'s specified procedure. Follow the tester result: return a good battery to service, charge and retest when instructed, and replace only after the required procedure confirms replacement. If a serviceable, fully charged battery discharges again, measure key-off draw after the vehicle reaches its specified sleep state and isolate the responsible circuit, connection or accessory. Do not buy a battery, maintainer or module from this page; there is no universal retail part until the battery specification and diagnosed cause are confirmed.',
      symptoms: ['Low 12-volt battery warning', 'Vehicle does not enter READY or start after sitting', 'Multiple low-voltage messages after battery discharge', 'Battery requires repeated recharging'],
      dtcCodes: [],
      summary: 'Kept the exact Mazda battery ratings and test flow while removing universal parked-draw and automatic replacement claims.',
    },
    [IDS.transmission]: {
      confidence: 'medium',
      description: 'Mazda SA-074/24 applies specifically to the 2025 CX-70 PHEV and describes a grunt or grind during the 1st-to-2nd shift under medium-to-aggressive throttle. Mazda says that exact noise occurs during second-gear engagement, does not affect durability or reliability, and is safe to drive. It does not substantiate every low-speed clunk, jerk, shudder or hesitation on Inline-6 vehicles or the frozen 2026 scope. Separately, recall 24V-815 covers certain 2025 CX-70 vehicles whose PCM/ECM software can illuminate malfunction lights and cause a loss of drive power.',
      solution: 'First distinguish the exact 2025 PHEV 1-to-2 grunt described by SA-074/24 from a warning-light, harsh-engagement or power-loss event. Check the VIN for recall 24V-815 and complete its free PCM/ECM reprogramming when open. For other shift-quality concerns, record the operating conditions, scan all powertrain modules before clearing codes, check for leaks and damage, and have Mazda verify calibration, adaptations and transmission operation. Do not buy fluid, a valve body, clutch, transmission or mount from this page; the exact symptom, recall status and failed system must be diagnosed first.',
      symptoms: ['Grunt or grind during a 2025 PHEV 1-to-2 shift', 'Low-speed clunk or harsh engagement requires diagnosis', 'Warning lights or loss of drive power may match recall 24V-815'],
      dtcCodes: [],
      summary: 'Separated Mazda\'s normal 2025 PHEV 1-to-2 grunt from broader shift complaints and the distinct 24V-815 power-loss recall.',
    },
    [IDS.bsm]: {
      confidence: 'high',
      description: 'Mazda TSB 15-001/26 applies to specified 2025-2026 CX-70 vehicles and documents a BSM warning that remains on while driving even though no vehicle is behind. Mazda identifies two possible contributors: electrical noise in the BSM control-module power supply and vibration or insufficient fastening at a rear side-radar mounting point. The bulletin does not limit the condition to rain, cold weather, barriers or sensor contamination, and it does not say that every false warning requires radar-module replacement.',
      solution: 'Have an authorised Mazda repairer verify the concern, confirm the VIN and installed BSM calibration, and perform the bulletin\'s ECU reprogramming. The bulletin also requires removal of the rear bumper to inspect the side-radar mounting condition; only an unacceptable mounting condition proceeds to the side-specific bracket, retainer and rivet repair followed by radar aiming. Do not buy a radar module or mounting hardware from this page; this is a VIN-, calibration- and side-specific dealer diagnosis with required calibration equipment.',
      symptoms: ['BSM warning remains on with no vehicle behind', 'False rear-corner warning while driving', 'One or both rear side-radar mounts require inspection'],
      dtcCodes: [],
      summary: 'Replaced weather and forum speculation with Mazda\'s exact electrical-noise, mounting and calibration procedure.',
    },
    [IDS.dashEsu]: {
      confidence: 'high',
      description: 'NHTSA recall 24V-814 and Mazda campaign 7124J cover certain 2025 CX-70 vehicles equipped with affected Dash Electrical Supply Unit software. An error during startup can display multiple warnings and prevent the windshield defroster, seat-belt warning or 360-degree view monitor from functioning correctly; PHEV high-voltage-battery cooling may also fail to operate as intended. Mazda\'s report identifies improper Dash-ESU software programming, not a failed hardware unit.',
      solution: 'Check the VIN for open recall 7124J/24V-814 and schedule an authorised Mazda dealer to reprogram the Dash-ESU with improved software free of charge. If the warning state makes a safety function unavailable, do not rely on that function while arranging recall service. Do not buy a Dash-ESU or related part from this page; the verified remedy is a VIN-scoped dealer software update.',
      symptoms: ['Multiple warning messages at startup', 'Windshield defroster does not function correctly', 'Seat-belt warning does not function correctly', '360-degree view monitor does not function correctly', 'PHEV battery cooling may not operate as intended'],
      dtcCodes: [],
      summary: 'Aligned the page to the exact 24V-814 startup-software defect, affected functions and free reprogramming remedy.',
    },
    [IDS.p0531]: {
      confidence: 'high',
      description: 'Mazda TSB 07-001/25, last issued April 4, 2025, applies to specified 2025 CX-70 PHEVs produced before March 1, 2025. It documents a check-engine light at startup with DTC P0531:00 caused by improper PCM and Dash-ESU control logic. The bulletin directs updated software; it does not establish an A/C refrigerant-pressure sensor or other HVAC hardware failure. Earlier temporary suspension language is superseded by this later bulletin and is not carried forward.',
      solution: 'Have the dealer confirm the VIN, check for open recalls first, read the stored code and compare the current PCM and Dash-ESU calibration files with TSB 07-001/25. When the bulletin applies, Mazda directs reprogramming of the PCM and Dash-ESU and verification that the warning does not return. If the calibration is already current or the code differs, diagnose it under the applicable service procedure. Do not buy a refrigerant-pressure sensor, PCM or Dash-ESU from this page; the verified repair is calibration-specific dealer programming.',
      symptoms: ['Check-engine light at engine startup', 'Engine-malfunction message at startup', 'DTC P0531:00 stored'],
      dtcCodes: ['P0531:00'],
      summary: 'Used the latest verified bulletin, removed stale suspension language and kept the fault to software logic rather than sensor replacement.',
    },
    [IDS.hybridWarning]: {
      confidence: 'medium',
      description: 'The verified primary sources support several bounded 2025 CX-70 PHEV events, not one universal cause. Recall 24V-817 covers a small production population in which improper inverter software can activate fail-safe mode and limit motor power in EV mode. NHTSA complaint 11740990 records a Hybrid System Malfunction warning while driving, while complaint 11698488 records an owner-reported loss of motive power and shutdown after a prior recall update. Complaint narratives do not prove that the same component caused each event, and these sources do not establish the frozen 2026 scope.',
      solution: 'Treat a hybrid warning, shutdown or power loss as a safety concern. Move to a safe location when possible, preserve the warning and event details, check the VIN for open recalls, and have Mazda read all hybrid and high-voltage codes before clearing them. Recall 24V-817 has a free inverter-software remedy when applicable; a warning or power loss outside that exact campaign requires separate diagnosis rather than assuming the inverter, battery or charging system failed. Do not buy high-voltage parts from this page; all inspection and repair are VIN-, code- and campaign-specific dealer work.',
      symptoms: ['Hybrid System Malfunction warning', 'Warning chime while driving', 'Reported loss of motive power or shutdown', 'EV-mode motor power may be limited under recall 24V-817'],
      dtcCodes: [],
      summary: 'Separated the exact inverter recall from two owner reports and removed unsupported universal module, leakage and 2026-cause claims.',
    },
    [IDS.fuelGauge]: {
      confidence: 'high',
      description: 'NHTSA recall 25V-568 and Mazda campaign 7825I cover 2025 CX-70 mild-hybrid vehicles, not the PHEV. Ethanol-containing fuel can react with material on the sub-tank sending-unit circuit board, creating buildup that interferes with the gauge and can make the cluster show fuel remaining when the tank is empty. Running out of fuel can stall the engine and increase crash risk. The frozen page metadata also lists PHEV trims and engine scope, which the recall report does not support; that scope conflict must be resolved before any catalog write.',
      solution: 'Check the VIN for open recall 7825I/25V-568. For an affected mild-hybrid CX-70, Mazda\'s remedy is dealer reprogramming of the body control module with improved fuel-gauge logic free of charge. Until repaired, refuel conservatively rather than relying on the displayed range. Do not buy a sending unit, fuel gauge or body control module from this page; the verified remedy is a VIN-scoped software recall and the frozen PHEV scope remains on hold.',
      symptoms: ['Fuel gauge shows fuel remaining when the tank may be empty', 'Displayed fuel level is inaccurate', 'Vehicle may run out of fuel and stall without a separate warning'],
      dtcCodes: [],
      summary: 'Corrected the recall to 2025 CX-70 MHEV only, its ethanol/circuit-board mechanism and BCM software remedy; held the unsupported frozen PHEV scope.',
      identityConflict: 'The frozen trims and engines include PHEV variants, but recall 25V-568 covers 2025 mild-hybrid CX-70 vehicles only.',
    },
    [IDS.fuelDoor]: {
      confidence: 'high',
      description: 'Mazda SA-011/25 documents a fuel-filler door stuck closed on 2025-2026 CX-70 Inline-6 vehicles and explicitly excludes the CX-70 PHEV. The fuel door locks with the vehicle and may use a configurable delay after the doors lock, while unlocking has no delay. The bulletin distinguishes an inoperative lock from pry damage or a door that was not unlocked; it does not establish cargo-panel, subwoofer, seat or generic interior-rattle defects.',
      solution: 'Unlock the vehicle normally and retry the fuel door without prying it. If it remains stuck, the dealer should inspect for pry marks, confirm the configured lock delay, verify that the lock engages, then unlock the vehicle and verify release. Warranty handling depends on that inspection and the exact lock condition. Do not buy a fuel door, actuator or trim part from this page; the failed mechanism and VIN-specific repair must be identified first.',
      symptoms: ['Fuel-filler door remains closed after unlocking the vehicle', 'Fuel-filler lock does not release', 'Fuel cap cannot be accessed for refuelling'],
      dtcCodes: [],
      summary: 'Kept the exact 2025-2026 Inline-6 fuel-door bulletin and removed unrelated cargo, subwoofer and generic rattle claims.',
    },
    [IDS.inverterRecall]: {
      confidence: 'high',
      description: 'NHTSA recall 24V-817 and Mazda campaign 7024J cover specified 2025 CX-70 PHEVs built with affected inverter software. Improper software can activate a fail-safe mode that limits motor power in EV mode; the malfunction indicator may illuminate and a warning chime may sound. Loss of motor power while driving increases crash risk. The recall report does not direct inverter replacement.',
      solution: 'Check the VIN for open recall 7024J/24V-817 and schedule an authorised Mazda dealer to reprogram the inverter with improved software free of charge. If power becomes limited while driving, maintain control and move to a safe location when possible, then arrange assistance. Do not buy an inverter or any high-voltage part from this page; the verified remedy is a VIN-scoped dealer software update.',
      symptoms: ['Malfunction indicator in EV mode', 'Warning chime', 'Motor power becomes limited', 'Loss of drive power'],
      dtcCodes: [],
      summary: 'Aligned the page to the exact 24V-817 fail-safe condition, small production scope and free inverter-software remedy.',
    },
    [IDS.phantomBraking]: {
      confidence: 'medium',
      description: 'NHTSA complaint 11736754 records unexpected automatic braking in a parking garage and at a four-way stop on a 2025 CX-70 when the owner reported no cross traffic or moving vehicle around the vehicle. The complaint records an owner report; it is not an NHTSA or Mazda defect determination and does not identify a failed camera, radar, sensor mount or software calibration. Mazda\'s owner manual separately describes Smart Brake Support operating limitations and sensor-care requirements.',
      solution: 'Record the exact location, direction, speed, weather, road geometry, surrounding objects and warning display for every repeat event. Have Mazda scan the driver-assistance modules before clearing data, verify the VIN\'s software and campaigns, and inspect the camera, radar, sensor mounts, windshield and emblem areas for contamination, damage or prior body work under the service procedure. Do not buy a radar, camera or control module from this page; there is no verified universal part or campaign for this complaint.',
      symptoms: ['Automatic braking without an apparent collision target', 'Unexpected braking in a parking structure', 'Unexpected braking at an intersection', 'False collision warning requires diagnosis'],
      dtcCodes: [],
      summary: 'Bounded the page to one identified NHTSA complaint plus manual limitations and removed unverified software, calibration and replacement certainty.',
    },
    [IDS.chargeFault]: {
      confidence: 'high',
      description: 'Mazda\'s CX-70 PHEV owner manual lists several reasons a charging session may not begin or may stop, including the selector not being in Park, a full or temperature-limited high-voltage battery, a depleted 12-volt battery, loss of outlet or GFCI power, an incompletely seated connector, or an active charge timer. Those indications do not by themselves prove failure of the on-board charger, inlet, cable or battery. A persistent red vehicle charge indicator requires Mazda inspection.',
      solution: 'Record the vehicle charge-indicator pattern and EVSE control-box indication. Confirm Park, battery state and temperature, 12-volt power, charge-timer status, outlet/GFCI power and fully seated connectors using the manual. If the manual\'s retry procedure does not restore charging, or the red indicator persists, have Mazda read charging-system faults and determine whether the condition follows the supply equipment or the vehicle. Do not buy an on-board charger, inlet, cable or battery from this page; high-voltage diagnosis is not a DIY or universal-part repair.',
      symptoms: ['Charging does not begin', 'Charging stops before the battery is full', 'EVSE control box indicates a fault', 'Vehicle charge indicator is amber or red'],
      dtcCodes: [],
      summary: 'Converted the page to Mazda\'s manual isolation flow and removed automatic on-board-charger, inlet, cable and battery replacement.',
    },
    [IDS.suddenAcceleration]: {
      confidence: 'low',
      description: 'NHTSA complaint 11631266 records a 2025 CX-70 owner\'s report of the engine revving and the vehicle lurching forward for a second or two at roughly 1-5 mph without accelerator input. The report says it happened on two occasions with different drivers and no warning or error lights. That complaint does not establish a Mazda defect finding, a clutch-creep calibration cause, a model-wide pattern or the frozen 2026 scope.',
      solution: 'Treat any repeat event as a safety concern. Preserve the exact date, speed, selector position, pedal inputs, grade, warning state and surroundings; report it to Mazda and NHTSA, and ask the dealer to retain event data and scan all powertrain and brake modules before clearing anything. Verify open recalls and installed software, but do not assume a calibration update is the remedy unless Mazda identifies one for the VIN and fault. Do not buy transmission, throttle or brake parts from this page; the cause has not been established.',
      symptoms: ['Engine reportedly revs at about 1-5 mph without accelerator input', 'Vehicle reportedly lurches forward at low speed', 'No warning light was reported during the event'],
      dtcCodes: [],
      summary: 'Replaced prevalence and suspected clutch-creep claims with the exact ODI 11631266 report and an explicit complaint-versus-defect boundary.',
    },
    [IDS.heatTrim]: {
      confidence: 'medium',
      description: 'NHTSA complaint 11671136 records a 2025 CX-70 owner\'s report that driver-side window-pillar trim and an Inline-6 emblem deformed when the outside temperature was about 90 degrees Fahrenheit. The report says a dealer replaced those pieces. It does not establish a Mazda material-defect determination, every exterior plastic piece, a universal part number or coverage beyond the reported 2025 vehicle.',
      solution: 'Photograph the exact location, side, finish, surrounding heat or reflection sources, temperature and progression before disturbing the piece. Ask a Mazda dealer to inspect and document the condition against the VIN and determine warranty handling. If replacement is authorised, the dealer must identify the exact side, finish and current part number from the vehicle catalog. Do not buy trim or an emblem from this page; the complaint does not identify a universal retail part.',
      symptoms: ['Window-pillar trim appears softened or deformed', 'Inline-6 emblem or adjacent trim appears deformed', 'Condition reportedly follows high ambient heat'],
      dtcCodes: [],
      summary: 'Kept the exact ODI 11671136 pieces and temperature while removing universal material, coverage and part-number claims.',
    },
    [IDS.water]: {
      confidence: 'low',
      description: 'NHTSA complaint 11632568 records water leaking from the forward ceiling near the interior light-control panel of a 2025 CX-70 after the vehicle was parked outside overnight. The owner described a stream for several seconds after moving slowly. The complete 261-row CX-70 manufacturer-communication inventory did not identify a matching Mazda water-intrusion bulletin. The source does not establish liftgate grommets, sunroof drains, roof rails, A-pillars, cargo-area leakage, mold or module corrosion, although those mechanisms remain embedded in the frozen indexed title.',
      solution: 'Photograph the wet area before drying it and have the dealer perform a controlled water test to locate the exact entry path before removing trim or applying sealant. Inspect and dry affected headliner or insulation only as needed, then repair the verified seal, drain, opening or body joint under the applicable Mazda procedure. Do not buy a grommet, drain tube, roof-rail seal, harness or trim part from this page; the leak source and repair are unverified, and the title/body identity conflict remains on hold.',
      symptoms: ['Water reported from the forward ceiling near the interior light controls', 'A short stream appeared after the parked vehicle began moving', 'Exact entry path requires a controlled water test'],
      dtcCodes: [],
      summary: 'Removed unsupported CX-90/forum mechanisms, reduced the evidence to ODI 11632568 and held the frozen mechanism-heavy title for identity policy.',
      identityConflict: 'The frozen title asserts liftgate-grommet, sunroof/roof-rail-drain and A-pillar mechanisms that neither the complaint nor the complete CX-70 communication inventory establishes.',
    },
    [IDS.infotainmentLag]: {
      confidence: 'high',
      description: 'Mazda TSB 16-004/25 applies to specified 2025-2026 CX-70 vehicles in the NA05 software family. Depending on the installed version, documented faults include rebooting at ignition-on, freezing on the disclaimer screen, a black SiriusXM display, voice-recognition failure, CarPlay connection failure and Android Auto connecting as Bluetooth only. The bulletin does not make every slow screen, camera delay, dropout or navigation complaint the same software fault.',
      solution: 'Record the exact symptom and installed Mazda Connect version. For an eligible VIN using the identified NA05 version family below 10026, Mazda directs an authorised repairer to install version 10026 or later by USB and verify the complaint; the bulletin says this is not an over-the-air update. If the VIN, version or symptom is outside the bulletin, isolate the phone, cable, USB port, registrations and native interface before replacing hardware. Do not buy a display, connectivity module or USB part from this page; the verified remedy is eligibility- and version-specific programming.',
      symptoms: ['Mazda Connect reboots at ignition-on', 'System freezes on the disclaimer screen', 'CarPlay or Android Auto connection fails', 'Voice recognition does not start', 'SiriusXM display turns black'],
      dtcCodes: [],
      summary: 'Scoped the page to the exact NA05 bugs, VIN/version gate and USB 10026-or-later update.',
    },
    [IDS.infotainmentUpdates]: {
      confidence: 'high',
      description: 'This frozen indexed page overlaps the separate CX-70 infotainment-fault page and is supported by the same Mazda TSB 16-004/25. The bulletin lists exact NA05 software defects and a version/VIN gate; it does not support generic first-model-year growing pains, every Bluetooth dropout, every slow response or a regular update schedule. The page remains separate only to preserve its existing indexed identity pending product policy.',
      solution: 'Have Mazda identify the exact symptom, VIN and installed NA05 software version. When TSB 16-004/25 applies, an authorised repairer should install version 10026 or later by USB and verify the original fault. If it does not apply, diagnose the phone, cable, USB, wireless registration and native system separately. Do not buy infotainment hardware from this page; no universal retail part or automatic reset is supported.',
      symptoms: ['Documented NA05 software fault requires version check', 'Eligible vehicle may require USB update 10026 or later', 'Connection or display symptom outside the bulletin requires separate diagnosis'],
      dtcCodes: [],
      summary: 'Removed generic update claims, tied the duplicate indexed page to the same exact TSB and preserved it without merging or redirecting.',
    },
    [IDS.mapLight]: {
      confidence: 'high',
      description: 'Mazda TSB 09-015/25 applies to specified early-production 2025 CX-70 vehicles with the panoramic sunroof. It documents a rattle or vibration from the front map-light surroundings on rough roads because heat or vibration can deform the fastener fixing the map light to its bracket and loosen the joint. It does not establish roof-glass expansion, seal failure, wind noise or water leakage.',
      solution: 'Reproduce the rough-road noise and confirm it comes from the front map-light area rather than the glass, sunroof mechanism, headliner edge or a leak. For an applicable VIN produced before March 19, 2024, Mazda directs the repairer to lower the headliner enough to access the bracket, add specified shop-supply fabric pads and verify the repair. Do not buy a map light, roof seal or noise kit from this page; the bulletin is VIN-specific dealer trim work and the material is a multi-vehicle shop supply.',
      symptoms: ['Rattle or vibration around the front map light', 'Noise is most apparent on rough roads', 'Noise follows body bounce near the overhead console'],
      dtcCodes: [],
      summary: 'Kept the exact early-VIN map-light bracket cause and shop-supply pad repair while excluding glass, seal and leak claims.',
    },
    [IDS.phevSoftware]: {
      confidence: 'low',
      description: 'Mazda SA-076/24 says that on a 2025 CX-70 PHEV, low ambient and battery temperature can suspend EV mode, start the gasoline engine and show a minimum EV range until the battery warms; Mazda calls that exact behavior normal operation. Separately, recall 24V-817 covers a small 2025 production population with inverter software that can limit motor power in EV mode. These sources do not establish a broad category of jerky transitions, hesitation, harsh restart, multiple calibration updates or the frozen title\'s generic PHEV software mechanism.',
      solution: 'If EV mode is unavailable only in low temperature with no malfunction warning, allow the battery to warm and compare the behavior with SA-076/24 and the owner manual. If a malfunction light, warning chime or power loss occurs, check the VIN for recall 24V-817 and obtain dealer diagnosis rather than treating it as normal cold operation. Do not buy powertrain or high-voltage parts from this page; one source is an operating boundary and the other is a VIN-scoped software recall. The broad frozen identity remains on hold.',
      symptoms: ['EV mode may be suspended at low battery temperature', 'Gasoline engine may start while EV mode is requested in cold conditions', 'Malfunction light or motor-power loss may match recall 24V-817'],
      dtcCodes: [],
      summary: 'Separated normal cold-temperature operation from the distinct inverter recall and held the unsupported broad calibration-issue title.',
      identityConflict: 'The frozen title asserts generic PHEV calibration issues, while the verified sources support one normal cold-temperature behavior and one narrowly scoped safety recall.',
    },
    [IDS.liftgateSpoiler]: {
      confidence: 'high',
      description: 'Mazda TSB 09-020/25 applies to specified early-production 2025 CX-70 vehicles and documents a rattle or vibration from the liftgate on rough roads. A gap at the attachment between a side-spoiler metal clip and the rear spoiler can allow vibration. Because rear-cabin body noise can be mistaken for suspension noise, the bulletin does not justify replacing suspension links, bushings, dampers or mounts.',
      solution: 'Reproduce the noise with the cargo area empty and confirm whether it comes from one liftgate side-spoiler attachment. For an applicable VIN produced before January 7, 2025, Mazda directs the repairer to remove the affected side spoiler, add specified shop-supply urethane and felt at the clip attachment and verify the repair. If the noise remains below the body, diagnose the suspension and underbody separately. Do not buy suspension parts, a spoiler or a noise kit from this page; the bulletin is VIN- and side-specific dealer body work using multi-vehicle shop supplies.',
      symptoms: ['Rattle or vibration from the liftgate area on rough roads', 'Noise localizes near one rear side-spoiler attachment', 'Rear-cabin noise can be mistaken for a suspension clunk'],
      dtcCodes: [],
      summary: 'Kept the exact side-spoiler gap and shop-supply repair while blocking automatic suspension-part replacement.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-70 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.battery]: ['SA-007/25 defines the battery test inputs and tester decision flow.', 'SA-029/25 describes maintenance and multiple discharge causes rather than a universal parked-draw defect.'],
    [IDS.transmission]: ['SA-074/24 covers only the 2025 PHEV 1-to-2 grunt and calls it safe, normal operation.', '24V-815 is a separate PCM/ECM software recall for malfunction lights and loss of drive power.'],
    [IDS.bsm]: ['TSB 15-001/26 directly identifies electrical noise and rear-radar mounting vibration/fastening.', 'It requires programming, mount inspection and calibration before any side-specific hardware repair.'],
    [IDS.dashEsu]: ['24V-814 directly identifies improper Dash-ESU startup software and affected safety functions.'],
    [IDS.p0531]: ['The April 4, 2025 revision supersedes earlier P0531 guidance and directs PCM/Dash-ESU reprogramming.'],
    [IDS.hybridWarning]: ['24V-817 is one exact EV-mode inverter fail-safe condition.', 'ODI 11740990 and 11698488 remain owner reports and are not merged into one proven cause.'],
    [IDS.fuelGauge]: ['25V-568 covers 2025 CX-70 MHEV vehicles only.', 'The frozen PHEV trims/engine metadata is unsupported and therefore held.'],
    [IDS.fuelDoor]: ['SA-011/25 directly covers 2025-2026 Inline-6 CX-70 and excludes PHEV.'],
    [IDS.inverterRecall]: ['24V-817 directly identifies improper inverter software, EV-mode motor-power limitation and free reprogramming.'],
    [IDS.phantomBraking]: ['ODI 11736754 is one owner report; the manuals provide operating and sensor-care boundaries only.'],
    [IDS.chargeFault]: ['The owner manual enumerates non-parts charging conditions and the persistent-red-indicator dealer boundary.'],
    [IDS.suddenAcceleration]: ['ODI 11631266 records two events in one vehicle with different drivers.', 'It does not establish prevalence, clutch-creep causation or 2026 scope.'],
    [IDS.heatTrim]: ['ODI 11671136 identifies two reported pieces and approximately 90-degree ambient conditions in one 2025 vehicle.'],
    [IDS.water]: ['ODI 11632568 identifies only forward-ceiling leakage.', 'No matching water bulletin was found in all 261 CX-70 manufacturer-communication rows.'],
    [IDS.infotainmentLag]: ['TSB 16-004/25 enumerates exact NA05 bugs and a VIN/version eligibility gate.'],
    [IDS.infotainmentUpdates]: ['The same TSB supports exact bugs, not generic update cadence or all connectivity complaints.'],
    [IDS.mapLight]: ['TSB 09-015/25 directly identifies the early-VIN map-light bracket fastener and fabric-pad repair.'],
    [IDS.phevSoftware]: ['SA-076/24 calls the exact low-temperature EV-mode behavior normal.', '24V-817 is distinct safety-recall evidence and does not prove generic calibration issues.'],
    [IDS.liftgateSpoiler]: ['TSB 09-020/25 directly identifies the early-VIN liftgate side-spoiler gap and shop-supply pad repair.'],
  };
  return notes[id] || [];
}

function commerceDecisionFor(id) {
  const dealerSoftware = new Set([IDS.dashEsu, IDS.p0531, IDS.fuelGauge, IDS.inverterRecall]);
  if (dealerSoftware.has(id)) return 'VIN-scoped dealer software remedy - no retail part is supported.';
  if (id === IDS.bsm || id === IDS.mapLight || id === IDS.liftgateSpoiler) return 'Dealer-only inspection/calibration or shop-supply procedure - no universal consumer-retail part.';
  if (id === IDS.phevSoftware || id === IDS.hybridWarning || id === IDS.chargeFault) return 'High-voltage or software diagnosis boundary - no universal retail part and no DIY high-voltage repair.';
  return 'No universal retail part - confirm the exact VIN, condition and failed component before any purchase.';
}

function proposalFor(row) {
  const content = contentFor(row.id);
  const proposal = fullRecord(row);
  Object.assign(proposal, {
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
    citations: citationsFor(row.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    source: 'mazda-primary-source-audit-2026-08-09',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  });
  return proposal;
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const publicSource = { ...source };
    delete publicSource.localPath;
    return [key, publicSource];
  }));
}

function buildPacket(snapshot) {
  const frozen = snapshot.records
    .filter((row) => row.make === 'Mazda' && MODEL_ALIASES.includes(row.model))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozen.length !== 19) throw new Error(`Expected 19 frozen Mazda CX-70 rows, found ${frozen.length}`);
  const expectedIds = [...BLOCKER_IDS];
  if (frozen.map((row) => row.id).sort().join('|') !== expectedIds.join('|')) throw new Error('Frozen Mazda CX-70 ID set drifted');

  const identityReview = new Set(IDENTITY_REVIEW_IDS);
  const rows = frozen.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    const content = contentFor(row.id);
    const identityReviewRequired = identityReview.has(row.id);
    return {
      id: row.id,
      action: identityReviewRequired
        ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
        : 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      identityReviewRequired,
      identityConflict: content.identityConflict || null,
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(row.id),
      commerceDecision: commerceDecisionFor(row.id),
    };
  });

  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: 'CX-70',
    completionStatement: 'All 19 frozen Mazda CX-70 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'All 19 rows contain material source, scope, diagnosis or remedy corrections and require independent review; three also require an explicit indexed-identity/scope decision before any catalog write.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'All 19 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records prove only that an owner report exists; they are not converted into defect prevalence, universal causation or model-year coverage.',
      'Frozen title or vehicle-scope conflicts are explicit holds, never silently contradicted or applied.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'Every named replaceable part has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
      'Every selected PDF page was rendered and visually reviewed before packet generation.',
    ],
    source: {
      snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozen.length,
    },
    observations: [
      { code: 'cx70-identity-scope-conflicts-held', severity: 'identity-hold', recordIds: IDENTITY_REVIEW_IDS, detail: 'Fuel-gauge PHEV scope, mechanism-heavy water title and generic PHEV-calibration identity require policy decisions before any write.' },
      { code: 'cx70-complaints-not-defect-determinations', severity: 'evidence-boundary', recordIds: [IDS.hybridWarning, IDS.phantomBraking, IDS.suddenAcceleration, IDS.heatTrim, IDS.water], detail: 'NHTSA complaint records remain bounded owner reports rather than prevalence, recall or universal-cause evidence.' },
      { code: 'cx70-normal-operation-separated-from-defect', severity: 'scope-correction', recordIds: [IDS.transmission, IDS.phevSoftware], detail: 'Mazda calls the exact PHEV 1-to-2 grunt and low-temperature EV suspension safe/normal; distinct recalls remain separately identified.' },
      { code: 'cx70-dealer-software-and-diagnosis-boundaries', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'No proposal introduces consumer buy links or automatic part replacement; recall, high-voltage, calibration and fitment boundaries are explicit.' },
      { code: 'all-cx70-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazda CX-70 page is removed, merged, redirected or allowed to lose indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.filter((row) => !row.identityReviewRequired).length,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: rows.filter((row) => row.identityReviewRequired).length,
      total: rows.length,
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
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  IDENTITY_REVIEW_IDS,
  IDS,
  MODEL_ALIASES,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REQUIRED_COMMUNICATION_IDS,
  REVIEW_DATE,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
};
