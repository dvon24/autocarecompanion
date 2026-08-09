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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-90-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CX-90']);

const IDS = Object.freeze({
  battery: 'mazda-cx-90-48v-mhev-battery-cell-imbalance-engine-malfunction-light-los',
  dashEsu: 'mazda-cx-90-dash-electrical-supply-unit-software-fault-inoperative-defro',
  fuelGauge: 'mazda-cx-90-inaccurate-fuel-gauge-causing-unexpected-stalling-recall-782',
  infotainment: 'mazda-cx-90-infotainment-display-freezing-wireless-carplay-android-auto',
  steering: 'mazda-cx-90-sudden-increase-steering-effort-recall-24v022-failed-remedy',
  engineStalling: 'mazda-cx90-engine-stalling-recall-2024',
  roof: 'mazda-cx90-panoramic-roof-creak-2024',
  charging: 'mazda-cx90-phev-charging-failure-2024',
  transmission: 'mazda-cx90-transmission-jerkiness-2024',
});

const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const IDENTITY_REVIEW_IDS = Object.freeze([
  IDS.battery,
  IDS.charging,
  IDS.engineStalling,
  IDS.roof,
  IDS.steering,
  IDS.transmission,
].sort());
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([
  IDS.charging,
  IDS.engineStalling,
  IDS.roof,
  IDS.transmission,
].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '11003221', '11009631', '11009633', '11009638', '11024837', '11032105',
]);
const CAMPAIGNS = Object.freeze([
  '23V429000', '23V553000', '23V718000', '23V719000', '24V022000', '24V349000',
  '24V814000', '24V815000', '24V816000', '24V817000', '25V568000',
]);

const PDF_SOURCES = Object.freeze({
  batteryProgram: {
    title: 'Mazda MSP66: CX-90 Engine Warning Light with DTC P0DAB',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032105-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11032105-0001.pdf',
    pages: 2, visualPages: [1, 2], bytes: 100933,
    sha256: 'd4d11fda6729381472ed64204648579dfc698bfad7ce7d58fa7599f340ee9134',
  },
  dashEsuRecall: {
    title: 'NHTSA Part 573 Report 24V814: Mazda Dash ESU Software',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V814-5848.PDF',
    localPath: 'C:/tmp/mazda-cx90-sources/RCLRPT-24V814-5848.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 219225,
    sha256: '06936412f3572aa7be6cb49aecc3fd578778301780de9a6b20cf3ff72107680f',
  },
  fuelGaugeRecall: {
    title: 'NHTSA Part 573 Report 25V568: Mazda MHEV Inaccurate Fuel Gauge',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V568-9748.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/RCLRPT-25V568-9748.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 472397,
    sha256: '912657ae0cf09f1f1ed30b169cb948061fc2bdd7f2c6948ea6f299e4ac92e844',
  },
  infotainment: {
    title: 'Mazda TSB 16-003/25: CX-90 Mazda Connect Software 10020',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024837-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11024837-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 209395,
    sha256: '1239b22c4b060651c6639be9bfeaf4b0ec2be49a50c231c349a9e3fd40bf036a',
  },
  steeringRecall: {
    title: 'NHTSA Part 573 Report 24V022: CX-90 Steering Effort Increase',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V022-8691.PDF',
    localPath: 'C:/tmp/mazda-cx90-sources/RCLRPT-24V022-8691.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 215328,
    sha256: '58ca1d09dba621ad498e167feb43f5c90487e35334d259503642e82052672780',
  },
  steeringInvestigation: {
    title: 'NHTSA ODI Opening Resume RQ26002: Post-Remedy Steering Effort Reports',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/inv/2026/INOA-RQ26002-10003.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/INOA-RQ26002-10003.pdf',
    pages: 2, visualPages: [1, 2], bytes: 76604,
    sha256: '59426b54c2173d864987452d30fc5347c60ef5b78cacd9521ac5170cbe1d1715',
  },
  phevPowerLossRecall: {
    title: 'NHTSA Part 573 Report 23V719: 2024 CX-90 PHEV Power Loss',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V719-7656.PDF',
    localPath: 'C:/tmp/mazda-cx90-sources/RCLRPT-23V719-7656.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 215019,
    sha256: '6b13e39fa900dc1a80e99d285cd14695fffe1efe716e8732e7785833489860c2',
  },
  multiEcuRecallLetter: {
    title: 'Mazda Recall 7024J Owner Letter: NHTSA 24V815, 24V816 and 24V817',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCONL-24V817-3657.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/RCONL-24V817-3657.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 228016,
    sha256: '73afd63ada922b74e2de83a987a7b48e0fc3a90266d2713cd5ad05043fe67210',
  },
  roofCenter: {
    title: 'Mazda TSB 09-010/24: Center Panorama Sunroof Rattle',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009633-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11009633-0001.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 422730,
    sha256: '10c95e057c2d20844cf23d6ce53f2a9dfc38e9d159f67bb7b8132e6b61ee5ed7',
  },
  roofRear: {
    title: 'Mazda TSB 09-045/24: Rear Panorama Sunroof Rattle',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009638-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11009638-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 190750,
    sha256: 'a9b72ff33dea55a9b872fb934795614daa41b00d8b5e0319db136d20535b1692',
  },
  coldShift: {
    title: 'Mazda TSB 05-004/24: CX-90 Cold 1-2 Shift Shock',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11003221-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11003221-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 194938,
    sha256: 'dad367354e9639ea140871e53014cc9a105dae7928057a0d89968190548ffa92',
  },
  delayedResponse: {
    title: 'Mazda TSB 05-007/24: CX-90 MHEV Delayed Re-Acceleration',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009631-0001.pdf',
    localPath: 'C:/tmp/mazda-cx90-sources/MC-11009631-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 188410,
    sha256: '4111c58e9ad1b3e088a01240d68a435c430b05c1258eda6dadd3551a4be57b2a',
  },
});

const OTHER_SOURCES = Object.freeze({
  chargeFault: {
    title: '2025 Mazda CX-90 PHEV Owner Manual: Charging Is Not Possible',
    type: 'manufacturer',
    url: 'https://www.mazdausa.com/static/manuals/2025/cx-90-phev/contents/68220100.html',
  },
  chargeProcedure: {
    title: '2025 Mazda CX-90 PHEV Owner Manual: Charging Procedure and Indicators',
    type: 'manufacturer',
    url: 'https://www.mazdausa.com/static/manuals/2025/cx-90-phev/contents/65290300.html',
  },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis',
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 312, '2025-2026': 183 },
  totalRows: 495,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis',
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 35 },
  totalRows: 35,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { title: source.title, type: source.type, url: source.url }; }

function citationsFor(id) {
  const map = {
    [IDS.battery]: [PDF_SOURCES.batteryProgram],
    [IDS.dashEsu]: [PDF_SOURCES.dashEsuRecall],
    [IDS.fuelGauge]: [PDF_SOURCES.fuelGaugeRecall],
    [IDS.infotainment]: [PDF_SOURCES.infotainment],
    [IDS.steering]: [PDF_SOURCES.steeringRecall, PDF_SOURCES.steeringInvestigation],
    [IDS.engineStalling]: [PDF_SOURCES.phevPowerLossRecall, PDF_SOURCES.multiEcuRecallLetter],
    [IDS.roof]: [PDF_SOURCES.roofCenter, PDF_SOURCES.roofRear],
    [IDS.charging]: [OTHER_SOURCES.chargeFault, OTHER_SOURCES.chargeProcedure],
    [IDS.transmission]: [PDF_SOURCES.coldShift, PDF_SOURCES.delayedResponse],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-90 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.battery]: {
      confidence: 'high',
      reportCount: 0,
      description: 'Mazda Service Program MSP66 applies to specified 2024-2026 CX-90 H3T M Hybrid Boost vehicles produced through November 17, 2025. An engine warning may appear with DTC P0DAB, and fail-safe mode may limit the vehicle to engine-only operation while disabling motor assist, i-stop and motor regeneration. Mazda states that the vehicle is safe to drive and identifies improper PCM and M Hybrid Boost/BECM software as the causal factor. The current program does not require a battery or other part, so the frozen physical battery-cell-imbalance and automatic battery-replacement narrative is not carried forward.',
      solution: 'Have a Mazda dealer verify the VIN, warning and DTC P0DAB against MSP66. The program repair is PCM and M Hybrid Boost/BECM reprogramming; some 2024-2025 vehicles may also require TCM reprogramming and initial learning. Other warning combinations or a no-start condition require normal diagnosis rather than assuming this program applies. Do not buy a 48-volt battery from this page; MSP66 lists no required parts and is a dealer software procedure.',
      symptoms: ['engine warning light with DTC P0DAB', 'engine-only fail-safe operation', 'motor assist, i-stop or regenerative functions are disabled'],
      dtcCodes: ['P0DAB'],
      summary: 'Replaced an outdated automatic battery-replacement account with current MSP66 software causation, no-parts remedy and safe-to-drive wording; held the frozen physical battery title for identity review.',
    },
    [IDS.dashEsu]: {
      confidence: 'high', reportCount: 0,
      description: 'NHTSA recall 24V814 covers 70,974 model-year 2024-2025 CX-90 vehicles built from December 27, 2022 through August 7, 2024. Improper Dash Electrical Supply Unit software can cause startup errors and warning messages while the windshield defroster, seat-belt warning, 360-degree view monitor and, on PHEV vehicles, high-voltage battery cooling may not function as intended. NHTSA records a crash-risk consequence for the defroster, seat-belt warning and view-monitor failures; it does not say every listed system fails on every affected vehicle.',
      solution: 'Check the VIN for Mazda recall 7124J/NHTSA 24V814 and arrange the free dealer remedy. Mazda directs dealers to reprogram the Dash ESU with improved software. Do not buy or replace the Dash ESU from this page; complete the recall and have any remaining fault diagnosed.',
      symptoms: ['multiple startup warning messages', 'defroster, seat-belt warning or 360-degree view monitor is unavailable', 'PHEV high-voltage battery cooling may not function as intended'],
      summary: 'Replaced secondary citations and restart advice with the exact Part 573 scope, consequence and free Dash ESU reprogramming remedy.',
    },
    [IDS.fuelGauge]: {
      confidence: 'high', reportCount: 0,
      description: 'NHTSA recall 25V568 covers 88,798 model-year 2024-2025 CX-90 mild-hybrid vehicles built through April 25, 2025; PHEV vehicles are outside this recall. Ethanol-containing fuel can react with materials on the sub-tank sending-unit circuit board and create buildup that interferes with fuel-level measurement. The cluster may show fuel remaining when the tank is empty, allowing the engine to stall and preventing restart.',
      solution: 'Check the VIN for Mazda recall 7825I/NHTSA 25V568 and arrange the free dealer remedy. Mazda directs dealers to reprogram the body control module with improved fuel-gauge logic. Do not buy a sending unit or fuel pump from this page; the safety recall remedy is software, and a gauge concern after the recall requires diagnosis.',
      symptoms: ['fuel gauge shows fuel remaining when the tank may be empty', 'displayed fuel level or range appears inconsistent', 'engine stalls after the vehicle runs out of fuel'],
      summary: 'Bounded the issue to the exact 2024-2025 MHEV population and replaced interim speculation with the Part 573 BCM-software remedy.',
    },
    [IDS.infotainment]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda TSB 16-003/25 applies to specified 2024-2025 CX-90 vehicles with 7000C0A-NA11 software produced before June 20, 2025. Its release history documents a center display that can turn black while camera images remain available, a system reboot at ignition, a freeze on the disclaimer screen, a failed wireless CarPlay connection, an Android Auto screen that may not appear and other defined Mazda Connect bugs. The source does not support the frozen claim that a black center display necessarily disables the backup or 360-degree camera image.',
      solution: 'Record the symptom and current Mazda Connect version, then have a Mazda dealer confirm the VIN and NA11 software branch. TSB 16-003/25 directs an update to version 7000C0A-NA11_10020 or later using a USB memory stick; Mazda says this file is not available as an over-the-air update. Do not buy or replace the display, CMU or phone hardware from this page without diagnosis.',
      symptoms: ['center display turns black or freezes', 'Mazda Connect reboots when the ignition is turned on', 'wireless CarPlay or Android Auto connection/display fails'],
      summary: 'Replaced community and reset-button claims with Mazda TSB 16-003/25, including its camera-image boundary and exact USB software remedy.',
    },
    [IDS.steering]: {
      confidence: 'high', reportCount: 0,
      description: 'NHTSA recall 24V022 covers 43,752 model-year 2024 CX-90 vehicles, not the frozen 2025 scope. Excessive worm-gear friction can cause a sudden increase in steering effort without warning. NHTSA opened Recall Query RQ26002 on January 26, 2026 after receiving 26 complaints alleging brief steering-effort increases after the recall remedy; its opening resume lists two crash/fire incidents, zero injury incidents and no fatalities. The open query is an investigation of remedy adequacy, not a final finding that every recall repair failed.',
      solution: 'Check the VIN and recall-completion record for 24V022/Mazda 6524A. The recall remedy replaces the spring engaging the worm gear and reapplies grease. If increased steering effort occurs or recurs, slow down and stop safely, document the event, contact a Mazda dealer and submit a report to NHTSA. Do not buy a steering rack or gear from this page; RQ26002 remains open and does not prescribe automatic rack replacement.',
      symptoms: ['sudden or brief increase in steering effort while driving', 'steering effort concern occurs after the 24V022 remedy', 'no advance warning may be present'],
      summary: 'Corrected the recall-query status, incident counts and remedy while holding the frozen 2025 year scope and failed-remedy framing for identity review.',
    },
    [IDS.engineStalling]: {
      confidence: 'high', reportCount: 0,
      description: 'The verified CX-90 record is a group of specific software recalls, not the frozen fuel-pump, turbocharger and NHTSA 24V014/24V228 narrative. NHTSA 23V719 covered 4,252 model-year 2024 CX-90 PHEVs whose engine and electric motor could shut down when inverter temperature triggered improper PCM fail-safe logic. Mazda recall 7024J covers specified 2024-2025 CX-90 vehicles under 24V815 for loss of drive power from PCM/ECM software, 24V816 for failure to restart after i-stop, and 24V817 for loss of motor power in PHEV EV mode from inverter software. The frozen engine metadata includes a diesel powertrain that is not supported by these North American sources and therefore remains an explicit scope hold.',
      solution: 'Use the VIN to identify each open campaign and have a Mazda dealer perform the applicable free module reprogramming. If drive power is lost or the engine will not restart, move out of traffic if possible, stop safely and obtain assistance rather than continuing to drive. Do not buy a fuel pump, turbocharger, PCM, ECM, BECM or inverter from this page; the cited recall remedies are dealer software updates.',
      symptoms: ['loss or limitation of drive power with warning lights', 'engine does not restart after i-stop', 'PHEV loses motor power in EV mode'],
      summary: 'Removed false campaigns, fuel-pump/turbo replacement and fabricated count; replaced them with four exact software-recall conditions and held the invalid diesel metadata for scope review.',
    },
    [IDS.roof]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda issued two exact bulletins for early model-year 2024 CX-90 panorama-sunroof rattles. TSB 09-010/24 covers a center/front-panel rattle caused by small gaps at plastic grommets and between the drip rail and roof reinforcement. TSB 09-045/24 covers a rear-glass-panel rattle caused by a gap at a headliner-to-sunroof-frame fastener. Neither bulletin supports a general glass-flex defect, weatherstripping that must settle, or the frozen 2025 scope.',
      solution: 'First identify whether the rattle is at the center/front panel or the rear glass. For an eligible early 2024 vehicle, a Mazda dealer can apply the matching bulletin: the center procedure uses Mazda shop-supply felt at specified reinforcement and drip-rail locations; the rear procedure uses a modified headliner fastener. Do not buy sunroof hardware, apply lubricant or replace weatherstripping from this page without confirming the noise location, VIN range and bulletin.',
      symptoms: ['rattle from the center or front panorama-sunroof area', 'rattle from the rear glass-panel area while driving', 'noise varies with body vibration or outside temperature'],
      summary: 'Replaced fabricated prevalence and seal-flex claims with two location-specific early-2024 Mazda repairs; held the frozen 2025 scope.',
    },
    [IDS.charging]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete CX-90 communication and recall inventory reviewed for this audit did not identify a Mazda bulletin supporting the frozen broad defect, multiple charge-management updates or routine onboard-charger replacement. Mazda owner guidance instead lists multiple reasons charging may not begin, including the selector not being in Park, a full or extremely hot/cold high-voltage battery, a depleted 12-volt battery, loss of outlet power, or an incompletely connected plug or connector. That troubleshooting guidance does not establish a model-wide charging-system failure.',
      solution: 'Follow the owner-manual checks: place the selector in Park, confirm battery temperature and 12-volt power, verify outlet power and fully seat the plug and connector. For an amber charging-system indicator, Mazda says to wait a few minutes and reconnect the charge connector; a red indicator calls for inspection by an authorized Mazda dealer. Do not buy an EVSE, charge-port assembly or onboard charger from this page; isolate the supply, connector, vehicle state and fault first.',
      symptoms: ['normal charging does not begin or stops', 'amber or red charging-system indicator is shown', 'vehicle or external power-source checks are required'],
      summary: 'Removed fabricated count, unsupported 32-amp requirement, blanket software updates and onboard-charger replacement; retained only exact owner-manual diagnostics and held the unsupported defect identity.',
    },
    [IDS.transmission]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda TSB 05-004/24 covers specified early model-year 2024 3.3-liter CX-90 vehicles with a cold 1-2 shift shock caused by improper automatic-transmission hydraulic-pressure control. TSB 05-007/24 separately covers specified early 2024 MHEV inline-six vehicles with delayed re-acceleration after deceleration caused by idle restart just before stopping. Both use revised TCM control software. The sources do not support a 2-3 shift defect, the frozen PHEV and 2025 scope, a 500-mile adaptation rule, a 30,000-mile fluid change or valve-body replacement.',
      solution: 'Record whether the concern is a cold 1-2 shift shock or delayed re-acceleration after deceleration, then have a Mazda dealer verify the powertrain, VIN and calibration. The matching bulletins direct PCM/TCM reprogramming as applicable and TCM initial learning; temporary shift-feel changes can occur while the learned hydraulic-pressure settings stabilize. Do not buy fluid, a valve body or a transmission from this page without a separate diagnosis.',
      symptoms: ['cold 1-2 shift shock on an eligible early 2024 3.3-liter vehicle', 'delayed re-acceleration after deceleration on an eligible early 2024 MHEV', 'shift-feel concern requires VIN and calibration verification'],
      summary: 'Removed fabricated count, Aisin/2-3/adaptation/fluid/valve-body claims; retained two exact 2024 software conditions and held PHEV/2025 scope.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-90 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const primaryEvidence = {
    [IDS.battery]: ['MSP66 identifies improper control software, engine-only fail-safe behavior and no required parts.', 'The frozen physical battery-cell title and replacement remedy are not silently rewritten as established facts.'],
    [IDS.dashEsu]: ['Part 573 report 24V814 defines exact CX-90 years, population, affected functions and Dash ESU reprogramming.', 'No restart workaround or parts replacement is inferred.'],
    [IDS.fuelGauge]: ['Part 573 report 25V568 limits CX-90 coverage to 2024-2025 MHEV vehicles and gives a BCM-software remedy.', 'PHEV scope and sending-unit replacement are excluded.'],
    [IDS.infotainment]: ['TSB 16-003/25 directly documents black/frozen display, failed wireless CarPlay and Android Auto errors.', 'The bulletin says camera images remain available when the center display turns black.'],
    [IDS.steering]: ['Part 573 report 24V022 defines the 2024-only defect and spring/grease remedy.', 'RQ26002 is an open remedy-adequacy investigation with 26 complaints and two crash/fire incidents, not a completed failure finding.'],
    [IDS.engineStalling]: ['Part 573 report 23V719 and the consolidated 7024J letter identify four software conditions.', 'Frozen 24V014/24V228, fuel-pump, turbocharger and diesel claims are unsupported.'],
    [IDS.roof]: ['TSB 09-010/24 and 09-045/24 distinguish center/front and rear panorama-sunroof rattle mechanisms.', 'Both are early-2024 VIN-scoped repairs; neither establishes 2025 coverage or a settling-seal theory.'],
    [IDS.charging]: ['Mazda owner guidance supplies conditional troubleshooting and indicator actions.', 'The reviewed inventory does not establish the frozen broad defect or onboard-charger replacement.'],
    [IDS.transmission]: ['TSB 05-004/24 and 05-007/24 document two early-2024 software conditions.', 'They do not establish PHEV/2025 scope, 2-3 shock, a fluid interval or valve-body replacement.'],
  };
  return {
    primaryEvidence: primaryEvidence[id],
    limitations: 'Bulletin and recall applicability is exact to the cited document; no owner-frequency rate, unlisted year/powertrain, failed retail part or warranty eligibility is inferred.',
  };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.battery]: 'Dealer software program; MSP66 lists no required parts.',
    [IDS.dashEsu]: 'VIN-scoped safety recall; dealer Dash ESU reprogramming, no user-selected retail part.',
    [IDS.fuelGauge]: 'VIN-scoped safety recall; dealer BCM reprogramming, no user-selected retail part.',
    [IDS.infotainment]: 'Dealer/qualified Mazda Connect software update; no hardware selected without diagnosis.',
    [IDS.steering]: 'VIN-scoped safety recall and open investigation; no steering gear or rack selected from the page.',
    [IDS.engineStalling]: 'VIN-scoped dealer software recalls; no fuel pump, turbocharger or control module purchase.',
    [IDS.roof]: 'VIN- and location-scoped dealer procedure; shop-supply felt or modified fastener is not a universal retail recommendation.',
    [IDS.charging]: 'No universal retail part; external supply, connector, vehicle state and fault must be isolated first.',
    [IDS.transmission]: 'Dealer software and learning procedure; no fluid, valve body or transmission selected from the page.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.battery]: 'The frozen title asserts physical 48-volt battery-cell imbalance, while current Mazda MSP66 identifies a software cause and lists no battery replacement.',
    [IDS.steering]: 'The frozen years include 2025 and call the recall remedy failed; 24V022 covers model-year 2024 and RQ26002 is an open remedy-adequacy investigation, not a final failure finding.',
    [IDS.engineStalling]: 'The frozen identity combines unsupported campaigns, fuel-pump/turbocharger remedies and a diesel engine with several distinct CX-90 software recalls.',
    [IDS.roof]: 'The frozen years include 2025 and assert a broad panoramic-roof mechanism; the verified Mazda bulletins describe two location-specific early-2024 rattle repairs.',
    [IDS.charging]: 'The frozen identity asserts a broad PHEV charging-system failure, while the reviewed Mazda record supports only conditional owner-manual troubleshooting and no universal failed component.',
    [IDS.transmission]: 'The frozen years, PHEV scope and generic jerkiness identity are broader than the two verified early-2024 MHEV/3.3-liter software conditions.',
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
    dtcCodes: clone(content.dtcCodes || []),
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: content.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source);
    delete value.localPath;
    return [key, value];
  }));
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mazda' && MODEL_ALIASES.includes(row.model))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9) throw new Error(`Expected 9 frozen Mazda CX-90 rows, found ${frozenRows.length}`);

  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    const identityReviewRequired = IDENTITY_REVIEW_IDS.includes(row.id);
    const action = identityReviewRequired
      ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'
      : 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source';
    return {
      id: row.id,
      action,
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
    model: 'CX-90',
    completionStatement: 'All 9 frozen Mazda CX-90 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'All 9 rows contain material source, scope, diagnosis, remedy or report-count corrections; six also require an explicit indexed-identity/scope decision before any catalog write.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The four fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, investigation and owner-manual sources are not converted into defect prevalence or universal model-year coverage.',
      'Frozen titles or scopes that overstate the primary evidence remain explicit identity holds rather than silent rewrites.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
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
      { code: 'cx90-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 1,800/900/600/2,200 owner totals have no source in the reviewed record and are proposal-only zero corrections.' },
      { code: 'cx90-identity-and-scope-holds', severity: 'identity-hold', recordIds: IDENTITY_REVIEW_IDS, detail: 'Physical battery causation, charging-defect identity, diesel/recall mismatch, 2025 roof and transmission scope, and 2025 steering scope cannot be silently reconciled under frozen metadata.' },
      { code: 'cx90-secondary-and-fabricated-citations-removed', severity: 'source-correction', recordIds: BLOCKER_IDS, detail: 'Fabricated Reddit URLs, forums and secondary summaries are replaced by exact Mazda/NHTSA sources.' },
      { code: 'cx90-commerce-boundaries', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Every solution is dealer software, exact dealer procedure or diagnosis-only; no unverified retail fitment is introduced.' },
      { code: 'all-cx90-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No CX-90 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 3,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 6,
      fabricated_report_counts_proposed_zero: 4,
      total: 9,
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
  FABRICATED_REPORT_COUNT_IDS,
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
  identityConflictFor,
  proposalFor,
};
