/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-nautilus-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['NAUTILUS']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  egr: 'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',
  vct: 'lincoln-nautilus-2-7l-ecoboost-cold-start-vct-rattle',
  transmission: 'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',
  startStop: 'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart',
  displays: 'lincoln-nautilus-both-panoramic-center-displays-go-blank-while-driving',
  blockHeater: 'lincoln-nautilus-engine-block-heater-overheats-while-plugged-fire-risk',
  brakes: 'lincoln-nautilus-front-brake-groan-grunt-noise-stopping',
  injector: 'lincoln-nautilus-hybrid-2-0l-ecoboost-direct-fuel-injector-failure-broken-tip',
  pedestrian: 'lincoln-nautilus-hybrid-pedestrian-warning-sound-fails-low-speed',
  ipma: 'lincoln-nautilus-image-processing-module-resets-loss-rearview-camera-adas',
  shocks: 'lincoln-nautilus-incorrectly-manufactured-rear-shock-absorbers-damage-rear-br',
  led: 'lincoln-nautilus-led-headlight-tail-light-driver-modules-fail-due-to-burnt-sc',
  roof: 'lincoln-nautilus-panoramic-vista-roof-water-leaks-from-clogged-sunroof-drains',
  battery: 'lincoln-nautilus-parasitic-12v-battery-drain-dead-battery-after-short-ownersh',
  liftgate: 'lincoln-nautilus-power-liftgate-inoperative-opens-closes-its-own',
  window: 'lincoln-nautilus-power-window-auto-reverse-fails-to-retract-pinch-hazard',
  camera: 'lincoln-nautilus-rearview-backup-camera-blank-distorted-image',
  sync: 'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  egr: { title: 'Ford TSB 20-2234: 2.0L EcoBoost EGR Cooler Coolant Loss', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10177867-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-egr.pdf', pages: 3, visualPages: [1,2,3], bytes: 116328, sha256: '4de5e691e7750a51bf20d3a8f9e16751ba1aa406efee97ed48e3a87a1a28ca30' },
  vct: { title: 'Ford TSB 23-2356: 2.7L EcoBoost Cold-Start VCT Rattle', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251455-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-vct.pdf', pages: 4, visualPages: [1,2,3,4], bytes: 82703, sha256: 'dd084157620a30210f1558d98be1f5227a6b60269b0caa0e09123dda5f0465d3' },
  transmission: { title: 'Ford TSB 21-2389: 8F35 Low-Speed Shudder/Buck/Jerk', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203649-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-8f35.pdf', pages: 3, visualPages: [1,2,3], bytes: 296637, sha256: 'a600600d25074fb11d617652bf9fdaaaa9d4079d5258e2acb2818e6971d605ff' },
  displays: { title: 'NHTSA Part 573 Report 25V337 / Ford 25C21: Nautilus Display Reboots', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V337-7886.pdf', localPath: 'C:/tmp/lincoln-nautilus-display.pdf', pages: 4, visualPages: [1,2,3,4], bytes: 388784, sha256: '6f7037f9d8c7f21c24d67a51e6ba8dc75510aa1e97b8029937e348eeecc3eb1f' },
  blockHeater: { title: 'NHTSA Part 573 Report 25V343 / Ford 25S52: Engine Block Heater', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V343-3534.pdf', localPath: 'C:/tmp/lincoln-nautilus-block.pdf', pages: 6, visualPages: [1,2,3,4,5,6], bytes: 535476, sha256: '0f3abfd2b855021da4c59b655f8a07ae4fe0a100fd06e363fbb7a9704cdc2da1' },
  brakes: { title: 'Ford SSM 53329: 2024-2025 Nautilus Initial Brake Grunt', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11013143-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-brake.pdf', pages: 1, visualPages: [1], bytes: 70214, sha256: 'b15294546b7a1e355dc5d0d85d8b3b6b85b2f2b2f1ac85eb4b286a9012f26e16' },
  injectorProgram: { title: 'Ford CSP 24B23 Supplement: 2024 Nautilus Hybrid Fuel Injectors', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012211-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-injector.pdf', pages: 10, visualPages: [1,2,3,4,5,6,7,8,9,10], bytes: 554488, sha256: 'd76869462689039210403425cb6156a5a24d452fbf99f3585c7a9c25f8032f93' },
  injectorService: { title: 'Ford CSP 24B23 Service Procedure: Replace Four Direct Injectors', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001146-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-injector-service.pdf', pages: 15, visualPages: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], bytes: 509886, sha256: 'bd5964d202063225010bf23b4e3420bda3def2f5fa70d03131fb0eb266f0ce85' },
  pedestrian: { title: 'NHTSA Part 573 Report 26V415 / Ford 26S51: Pedestrian Alert Sound', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V415-3570.pdf', localPath: 'C:/tmp/lincoln-nautilus-pedestrian.pdf', pages: 5, visualPages: [1,2,3,4,5], bytes: 471041, sha256: '429c2977a022f7f585e466221f90eb597521858daaa9c2697e9cfb638d7e10d9' },
  ipma: { title: 'NHTSA Part 573 Report 26V165 / Ford 26S21: IPMA Resets', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V165-1064.pdf', localPath: 'C:/tmp/lincoln-nautilus-ipma.pdf', pages: 5, visualPages: [1,2,3,4,5], bytes: 487808, sha256: '7b0ce0cfb12bd8eba09cb8868e80c99cf8f6712fbd75b858ac4879a512c333cc' },
  shocks: { title: 'NHTSA Part 573 Report 23V439 / Ford 23S32: Rear Shock Absorbers', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V439-3442.PDF', localPath: 'C:/tmp/lincoln-nautilus-shocks.pdf', pages: 3, visualPages: [1,2,3], bytes: 214290, sha256: 'e21b4925ab54ea8bf81ee79872f354abea5519da1a07edb1e6c1c0beaed79894' },
  led: { title: 'NHTSA Part 573 Report 25V519 / Ford 25C39: LED Driver Modules', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V519-1620.pdf', localPath: 'C:/tmp/lincoln-nautilus-led.pdf', pages: 6, visualPages: [1,2,3,4,5,6], bytes: 551702, sha256: '4292cb66150b9a6c8aba48d0dd6f20ccebc752519785a089ed2ac7e4c96301a4' },
  battery: { title: 'Ford CSP 24P22: Nautilus ABS-Module Battery Drain', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11007078-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-battery.pdf', pages: 9, visualPages: [1,2,3,4,5,6,7,8,9], bytes: 328851, sha256: 'c44c0c44aa6a465f0645082362e9dcb4f01a255cfb241ff2d124de4f8bb4f4dc' },
  liftgate2021: { title: 'Ford SSM 50071: Nautilus RGTM Software', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201053-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-liftgate.pdf', pages: 1, visualPages: [1], bytes: 29034, sha256: '50536aa16e8c034b51bb061dc7aa41c8b7cb2572a4b8d7216d54407cd860cfca' },
  liftgate2022: { title: 'Ford SSM 51248: 2019-2020 Nautilus RGTM Reprogramming', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10228866-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-liftgate-new.pdf', pages: 1, visualPages: [1], bytes: 101065, sha256: 'fd1b483b296313f49625c832c29fbacadf60a2ee195ab8ea29bc143b6135371b' },
  window: { title: 'NHTSA Part 573 Report 24V953 / Ford 24C43: Window Auto-Reversal', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V953-4031.PDF', localPath: 'C:/tmp/lincoln-nautilus-window.pdf', pages: 3, visualPages: [1,2,3], bytes: 214836, sha256: 'b1c737431f4faf5fc56f7542b9d71bed64d964a4ac3945e82c1dd22a5a6986c7' },
  windowFollowup: { title: 'NHTSA Part 573 Report 25V518 / Ford 25C36: Incorrect Prior Window Software', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V518-2663.pdf', localPath: 'C:/tmp/lincoln-nautilus-window-followup.pdf', pages: 4, visualPages: [1,2,3,4], bytes: 398799, sha256: '0d6c22c5e3e59bf1e304062cc25217b54a3e532544d3a98803cd0ac427325661' },
  camera: { title: 'NHTSA Part 573 Report 20V575 / Ford 20C19: Rearview Camera', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V575-6708.PDF', localPath: 'C:/tmp/lincoln-nautilus-camera.pdf', pages: 10, visualPages: [1,2,3,4,5,6,7,8,9,10], bytes: 225579, sha256: '00d735c604f84499e6b1e419a0bb3e2be464b58e8da5a8327ef65f940b0795c9' },
  sync: { title: 'Ford TSB 21-2411: SYNC 3 Software Symptoms', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203656-0001.pdf', localPath: 'C:/tmp/lincoln-nautilus-sync.pdf', pages: 3, visualPages: [1,2,3], bytes: 143281, sha256: '28b6ecd92b320c54b53ed38d6f324cac4b09652319371cb8d9d382c33830fb6f' },
});

const OTHER_SOURCES = Object.freeze({
  startStopOwner: { title: '2019 Lincoln Nautilus Owner Manual: Auto Start-Stop', type: 'owner-manual', url: 'https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G1959288&Uid=G1777187&buildtype=web&countryCode=USA&div=l&languageCode=en&userMarket=USA&vFilteringEnabled=False&variantid=6214' },
  roofComplaint: { title: 'NHTSA 2019 Lincoln Nautilus Complaints (ODI 11661446)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAUTILUS&modelYear=2019', odiNumber: '11661446' },
  recalls2024: { title: 'NHTSA Current 2024 Lincoln Nautilus Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=NAUTILUS&modelYear=2024' },
});

const CAMPAIGNS = Object.freeze(['18V806000','19V031000','19V076000','20V414000','20V550000','20V575000','21V011000','23V198000','23V439000','24V597000','24V635000','24V953000','25V237000','25V315000','25V337000','25V343000','25V442000','25V518000','25V519000','26V122000','26V165000','26V372000','26V377000']);
const CURRENT_DELTA_CAMPAIGNS = Object.freeze(['26V415000']);
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 21, '2020-2024': 270, '2025-2026': 138 }, totalRows: 429, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 118 }, totalRows: 118, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, currentDeltaCampaigns: CURRENT_DELTA_CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const sources = {
    [IDS.egr]: [PDF_SOURCES.egr], [IDS.vct]: [PDF_SOURCES.vct], [IDS.transmission]: [PDF_SOURCES.transmission],
    [IDS.startStop]: [OTHER_SOURCES.startStopOwner], [IDS.displays]: [PDF_SOURCES.displays, OTHER_SOURCES.recalls2024],
    [IDS.blockHeater]: [PDF_SOURCES.blockHeater, OTHER_SOURCES.recalls2024], [IDS.brakes]: [PDF_SOURCES.brakes],
    [IDS.injector]: [PDF_SOURCES.injectorProgram, PDF_SOURCES.injectorService], [IDS.pedestrian]: [PDF_SOURCES.pedestrian],
    [IDS.ipma]: [PDF_SOURCES.ipma, OTHER_SOURCES.recalls2024], [IDS.shocks]: [PDF_SOURCES.shocks], [IDS.led]: [PDF_SOURCES.led],
    [IDS.roof]: [OTHER_SOURCES.roofComplaint], [IDS.battery]: [PDF_SOURCES.battery],
    [IDS.liftgate]: [PDF_SOURCES.liftgate2021, PDF_SOURCES.liftgate2022],
    [IDS.window]: [PDF_SOURCES.window, PDF_SOURCES.windowFollowup], [IDS.camera]: [PDF_SOURCES.camera], [IDS.sync]: [PDF_SOURCES.sync],
  };
  if (!sources[id]) throw new Error(`Unexpected Nautilus row ${id}`);
  return sources[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.egr]: {
      confidence: 'high',
      description: 'Ford TSB 20-2234 applies to certain 2019-2020 Lincoln Nautilus vehicles with the 2.0L EcoBoost engine. It documents low coolant, white smoke, overheating, an external coolant leak at the EGR cooler and possible DTCs P0128, P0217, P044C, P1026, P1285, P1299, P139A or P2457. The bulletin does not diagnose cylinder intrusion, a head-gasket failure or a failed engine.',
      solution: 'Have a Ford or Lincoln technician confirm the engine, symptoms and DTCs, update the PCM calibration if required, pressure-test the cooling system and inspect the EGR cooler. TSB 20-2234 directs EGR-cooler and outlet-tube replacement only when leakage is confirmed. Do not buy an EGR cooler, outlet tube, head gasket, engine, spark plugs or coolant-flush kit from this page; this is a diagnosis-specific technician repair with no universal retail part.',
      symptoms: ['low coolant level', 'white exhaust smoke', 'engine overheating', 'external coolant leak at the EGR cooler'],
      dtcCodes: ['P0128','P0217','P044C','P1026','P1285','P1299','P139A','P2457'],
      summary: 'Bound the coolant page to TSB 20-2234 and removed cylinder-intrusion, class-action, engine, head-gasket and unrelated service claims.',
    },
    [IDS.vct]: {
      confidence: 'high',
      description: 'Ford TSB 23-2356 covers certain 2019-2023 Nautilus vehicles with the 2.7L EcoBoost engine. After a cold soak of at least six hours, a stuck internal component in a variable camshaft timing unit can produce a two-to-five-second tick, tap or rattle from the top front-cover area at startup.',
      solution: 'Have a technician reproduce the documented cold-start noise and confirm the 2.7L application. TSB 23-2356 directs replacement of all four VCT units and specifically says not to replace additional timing-drive or VCT parts outside its parts list. Do not buy phasers, chains, guides, tensioners or a timing kit from this page; the four-unit repair is VIN- and technician-specific with no verified universal retail fitment.',
      symptoms: ['two-to-five-second cold-start tick, tap or rattle', 'noise from the top front-cover area after a six-hour cold soak'],
      dtcCodes: [],
      summary: 'Replaced broad timing-system advice with the exact TSB 23-2356 cold-soak test and four-VCT-unit boundary.',
    },
    [IDS.transmission]: {
      confidence: 'high',
      description: 'Ford TSB 21-2389 applies to certain 2019-2021 Edge and Nautilus vehicles with an 8F35 transmission built on or before March 11, 2021. It documents a shudder, buck or jerk at 35 mph or below caused by PCM software. It does not identify the torque converter, clutches, fluid or internal transmission hardware as the cause.',
      solution: 'Have a technician confirm the 8F35 transmission, build date and low-speed symptom pattern. TSB 21-2389 directs PCM reprogramming followed by solenoid-body strategy identification; it does not direct a fluid service, torque-converter replacement, clutch replacement or transmission rebuild. Do not buy transmission hardware or fluid from this page; this is a software/strategy procedure with no retail part.',
      symptoms: ['shudder at 35 mph or below', 'buck or jerk at 35 mph or below'],
      dtcCodes: [],
      summary: 'Corrected the 8F35 cause and remedy to PCM software and solenoid strategy; removed unsupported hardware and fluid advice.',
    },
    [IDS.startStop]: {
      confidence: 'medium',
      description: 'The 2019 Nautilus owner manual lists multiple normal conditions that can keep Auto Start-Stop inactive and says a persistent fault after an ignition cycle should be checked by an authorized dealer. A message reading “Shift to P, Restart Engine” requires a manual restart. The manual does not establish a weak 12-volt battery as the universal cause for every 2019-2022 complaint represented by this indexed page.',
      solution: 'Read the cluster message, verify that the normal enabling conditions are satisfied and restart manually if directed. If the system remains inactive or repeatedly fails to restart after an ignition cycle, have the vehicle diagnosed rather than assuming the battery or bypassing the system. If a battery is found faulty, the manual requires the same specification; do not buy a battery, control module or start-stop eliminator from this page because diagnosis and fitment are VIN-specific.',
      symptoms: ['Auto Start-Stop unavailable despite enabling conditions', 'manual restart requested by cluster message', 'repeated failure to auto-restart requiring diagnosis'],
      dtcCodes: [],
      summary: 'Removed the universal weak-battery diagnosis, invented DTCs and bypass advice; retained owner-manual operating and diagnosis guidance.',
    },
    [IDS.displays]: {
      confidence: 'high',
      description: 'NHTSA 25V337/Ford 25C21 covers 30,679 model-year 2024 Nautilus vehicles. Certain infotainment software versions can make the panoramic and center displays reboot to a blank screen, removing gauges, telltales, transmission controls and the rearview-camera image and causing multiple federal safety-standard noncompliances.',
      solution: 'Check the VIN for 25C21/25V337. Ford provides Phoenix infotainment software version 1.1.3.2 or later through an over-the-air update or a dealer update, free of charge. If both displays go blank while driving, reduce distractions and stop safely if essential information is unavailable. Do not buy a display assembly or module from this page; the recall remedy is software and VIN-specific.',
      symptoms: ['panoramic display reboots or goes blank', 'center display reboots or goes blank', 'loss of gauges, telltales, controls or rearview-camera image'],
      dtcCodes: [],
      summary: 'Confirmed the exact 2024 population, software versions, safety functions and free software remedy for 25V337.',
    },
    [IDS.blockHeater]: {
      confidence: 'high',
      description: 'NHTSA 25V343/Ford 25S52 covers certain 2024-2025 Nautilus vehicles with a 2.0L MPC engine and an engine block heater. The heater can crack and leak coolant, then overheat while the parked vehicle is plugged in, creating an underhood fire risk. Possible warnings include a coolant leak, check-engine light, poor cabin heat or heat damage at the connector. The original Part 573 filing counted 11 Nautilus vehicles; broader campaign totals must not be represented as Nautilus totals.',
      solution: 'Do not plug in the block heater until the VIN is checked and the recall is completed. The current NHTSA remedy says dealers will replace the heater element and inspect and replace the cord if needed, free of charge; owners may instead choose a threaded blanking plug with removal of the electrical cord. Do not buy a heater, cord or plug from this page; the campaign remedy is VIN-scoped dealer work.',
      symptoms: ['coolant leak near the block heater', 'check-engine light or poor cabin heat', 'heat damage at the block-heater connector', 'underhood fire risk only while plugged in'],
      dtcCodes: [],
      summary: 'Updated the block-heater page to the current 25V343 remedy, retained plug-in-only risk and corrected the Nautilus population boundary.',
    },
    [IDS.brakes]: {
      confidence: 'high',
      description: 'Ford SSM 53329 covers 2024-2025 Nautilus vehicles with an initial front-brake grunt that goes away as the brakes warm. For vehicles built on or before June 13, 2024 with no prior brake repair, Ford attributes the condition to the original front rotors. For vehicles already repaired or built June 14, 2024 or later, Ford said engineering was still investigating and further service was not expected to affect the noise. The SSM does not support the indexed title’s 2022-2023 scope or a universal rotor-material defect.',
      solution: 'Have a technician confirm whether this is the initial cold grunt described by SSM 53329 and check the build date and repair history. The SSM directs both front rotors, part PZ1Z-1125-B, only for the early-build/no-prior-repair population; other brake noises follow normal diagnosis. Do not buy rotors from this page because the bulletin is build- and service-history-specific and no universal retail fitment has been verified.',
      symptoms: ['initial front-brake grunt or groan when stopping', 'noise diminishes as the brakes warm'],
      dtcCodes: [],
      summary: 'Limited the brake evidence to 2024-2025 SSM 53329 and its build/service-history rule; removed the unsupported 2022-2023 and universal-defect claims.',
    },
    [IDS.injector]: {
      confidence: 'high',
      description: 'Ford Customer Satisfaction Program 24B23 covered certain 2024 Nautilus hybrid vehicles built from October 7, 2023 through February 29, 2024. A direct-injector tip can crack or dislodge, causing excess fuel, poor combustion, vibration and a malfunction indicator. Continued operation can cause hydrolock, a “Stop Safely Now” message, temporary electric-only operation and eventual loss of motive power as the high-voltage battery depletes. The program identified 6,574 affected U.S. vehicles and expired May 31, 2025.',
      solution: 'If “Stop Safely Now” appears or the engine runs roughly, stop safely and arrange diagnosis. Check the VIN and current coverage rather than assuming the expired CSP remains free. The 24B23 procedure replaces all four direct injectors plus specified fuel-pipe fasteners and clips. Do not buy injectors, pipes or an engine from this page; the exact repair is VIN-scoped, high-pressure-fuel-system technician work with no universal retail part.',
      symptoms: ['rough running or vibration', 'malfunction indicator', 'Stop Safely Now message', 'temporary electric-only operation followed by loss of motive power'],
      dtcCodes: [],
      summary: 'Bound injector failure to CSP 24B23, corrected the failure progression and expiration, and removed any current free-repair or engine-replacement promise.',
    },
    [IDS.pedestrian]: {
      confidence: 'high',
      description: 'NHTSA 26V415/Ford 26S51 supersedes the earlier 25SA2 software remedy for certain 2024-2027 Nautilus hybrid vehicles. The pedestrian alert sound can randomly stop below 30 km/h during electric operation and may display “Pedestrian Sounder Fault. Service Now.” Ford states that the previous remedy did not fully correct the condition and vehicles repaired under the earlier action need the new remedy.',
      solution: 'Check the VIN for 26S51/26V415 even if the earlier 25SA2 repair was completed. Nautilus vehicles with the 28-speaker system receive a digital-signal-processing module replacement. For other affected Nautilus configurations, the Part 573 filing says the final non-DSP remedy is still under development. Do not buy a sounder, amplifier or module from this page; wait for the VIN-specific dealer remedy.',
      symptoms: ['pedestrian warning sound absent below 30 km/h in electric operation', 'Pedestrian Sounder Fault. Service Now message'],
      dtcCodes: [],
      summary: 'Replaced the superseded 25SA2 final-remedy claim with current 26V415 scope and configuration-dependent remedy status.',
    },
    [IDS.ipma]: {
      confidence: 'high',
      description: 'NHTSA 26V165/Ford 26S21 covers certain 2024-2025 Nautilus vehicles. High object-processing volume can overload Image Processing Module A and trigger repeated resets, causing loss of the rearview-camera image and functions including pre-collision assist, lane keeping and blind-spot monitoring. Warning messages can include Front Camera Fault, Pre-Collision Assist Not Available and Lane-Keeping System Off, with blind-spot indicators illuminated.',
      solution: 'Check the VIN for 26S21/26V165. Ford provides updated IPMA software through a dealer or over the air, free of charge. If the camera or driver-assistance functions disappear, use mirrors and direct observation, allow extra following distance and arrange the update. Do not buy a camera or IPMA from this page; the documented recall remedy is software and VIN-specific.',
      symptoms: ['rearview-camera image loss', 'pre-collision or lane-keeping unavailable warning', 'blind-spot indicators illuminated or monitoring unavailable'],
      dtcCodes: [],
      summary: 'Confirmed the 26V165 computational-overload condition, affected functions, warnings and software-only remedy without adding BlueCruise claims.',
    },
    [IDS.shocks]: {
      confidence: 'high',
      description: 'NHTSA 23V439/Ford 23S32 covers 366 model-year 2023 Nautilus vehicles built February 20 through March 9, 2023. A continuously controlled damping rear-shock rod stopper may not be properly crimped. Excess rebound travel can damage a rear brake hose, half shaft, wheel-speed sensor or stabilizer-bar end link. Warnings can include a brake-fluid leak, ABS or stability-control lights, noise or vibration.',
      solution: 'Check the VIN for 23S32/23V439. Dealers inspect both rear shocks, brake hoses, wheel-speed sensors and half shafts and replace affected components as required, free of charge. If brake fluid is leaking or braking changes, stop driving. Do not buy shocks, hoses, sensors or half shafts from this page; the recall remedy depends on VIN and inspection.',
      symptoms: ['rear brake-fluid leak', 'ABS or stability-control warning light', 'rear noise or vibration'],
      dtcCodes: [],
      summary: 'Restored the exact 366-vehicle build window, damage paths, warnings and inspection-dependent recall remedy.',
    },
    [IDS.led]: {
      confidence: 'high',
      description: 'NHTSA 25V519/Ford 25C39 covers 1,539 model-year 2025 Nautilus vehicles built March 9 through July 24, 2025. A Schottky diode in an LED driver module can burn, causing loss of same-side headlamp high and low beams, daytime running, position and turn-signal functions; Nautilus vehicles can also lose the corresponding rear tail, turn and position lamps. Warnings can include “Advanced Front Lighting Unavailable” and fast turn-signal flashing.',
      solution: 'Check the VIN for 25C39/25V519. Dealers inspect and replace the right and/or left LED driver module as required, free of charge. If required lighting fails, avoid night or low-visibility driving until repaired. Do not buy a lamp or driver module from this page; the recall remedy is VIN- and side-specific dealer work.',
      symptoms: ['same-side exterior lighting loss', 'Advanced Front Lighting Unavailable message', 'fast turn-signal flashing'],
      dtcCodes: [],
      summary: 'Confirmed the exact 2025 population, affected front/rear functions, warnings and side-specific recall remedy.',
    },
    [IDS.roof]: {
      confidence: 'low',
      description: 'The complete 429-document Nautilus manufacturer-communication inventory reviewed here does not establish a model-wide 2019-2020 clogged-drain defect. NHTSA complaint ODI 11661446 records one 2019 Nautilus owner allegation of water entering through the moonroof during rain; the complaint says a dealer diagnosed clogged drains, repaired the vehicle in April 2023 and later diagnosed recurrence in April 2025. This single complaint documents an allegation and reported diagnosis, not universal causation or incidence.',
      solution: 'Keep water away from electrical equipment and have a qualified technician trace the entry point before any repair. The source may be a drain, seal, glass bond, body seam or another path; blindly forcing wire or compressed air through a drain can cause damage or disconnect a tube. Do not buy drains, seals, glass or a roof assembly from this page; the source and roof option require vehicle-specific diagnosis and there is no universal retail part.',
      symptoms: ['water entering near the moonroof during rain', 'wet headliner or interior requiring source diagnosis'],
      dtcCodes: [],
      summary: 'Replaced a universal clogged-drain claim with one bounded NHTSA allegation, the complete negative bulletin inventory and diagnosis-first guidance.',
    },
    [IDS.battery]: {
      confidence: 'high',
      description: 'Ford Customer Satisfaction Program 24P22 covered certain 2024 Nautilus vehicles built September 4, 2022 through July 8, 2024. An ABS module can remain awake and keep other network modules awake, draining the 12-volt battery and causing a no-start. The program identified 27,256 U.S. vehicles and expired August 31, 2025. It does not support the former 46% poll, 24P14/24P08 attribution, amplifier diagnosis or automatic battery-replacement claim.',
      solution: 'Check the VIN and current coverage, then have a technician test the battery and network sleep state. CSP 24P22 directs reprogramming the ABS module with current FDRS software and lists no replacement part. Do not buy a battery, amplifier or ABS module from this page; the documented correction is VIN-specific software, and the historical free-service period has expired.',
      symptoms: ['12-volt battery discharges while parked', 'no-start after the vehicle sits', 'network modules remain awake'],
      dtcCodes: [],
      summary: 'Corrected the campaign to 24P22, ABS-module wake state, exact build range and expired software-only remedy; removed poll and unrelated campaign claims.',
    },
    [IDS.liftgate]: {
      confidence: 'high',
      description: 'Ford SSM 50071 covers certain 2019-2021 Nautilus vehicles whose liftgate is inoperative from both the interior and exterior switches, with or without DTC U3000:49. Ford attributes that condition to rear-gate-trunk-module software. SSM 51248 later describes the same software remedy for certain 2019-2020 Nautilus vehicles. Neither source supports the indexed title’s opening/closing-on-its-own, motor, strut or latch claims or every 2022-2023 vehicle represented by the page.',
      solution: 'Have a technician confirm that both switches are inoperative, scan the rear gate/trunk module and check current software. The two SSMs direct RGTM reprogramming, not motor, strut or latch replacement. Do not buy a liftgate motor, strut, latch or module from this page; the documented condition is software-specific and broader symptoms require diagnosis.',
      symptoms: ['power liftgate inoperative from both interior and exterior switches', 'possible U3000:49 stored in the rear gate/trunk module'],
      dtcCodes: ['U3000:49'],
      summary: 'Limited the liftgate evidence to the documented 2019-2021 inoperative/software condition and removed unsupported autonomous movement and hardware claims.',
    },
    [IDS.window]: {
      confidence: 'high',
      description: 'NHTSA 24V953/Ford 24C43 covers certain 2024-2025 Nautilus vehicles whose window auto-reversal calibration may allow excessive pinch force or insufficient reversal. NHTSA 25V518/Ford 25C36 separately covers 102 vehicles recorded as repaired under 24C43 that may have received incorrect software. These are VIN-scoped populations, not every vehicle in the indexed years.',
      solution: 'Check the VIN for both 24C43/24V953 and 25C36/25V518. Dealers update the driver- and passenger-door modules and, for the follow-up population, validate the software part numbers, free of charge. Keep hands and objects clear until repaired. Do not buy a regulator, motor or switch from this page; the documented remedy is module software and VIN-specific.',
      symptoms: ['window does not reverse enough after detecting an obstruction', 'excessive pinch force during auto-up operation'],
      dtcCodes: [],
      summary: 'Separated the original window calibration recall from the 102-vehicle incorrect-prior-software follow-up and retained the software-only remedy.',
    },
    [IDS.camera]: {
      confidence: 'high',
      description: 'NHTSA 20V575/Ford 20C19 covers 7,318 model-year 2020 Nautilus vehicles built November 21, 2019 through May 26, 2020. Rearview-camera connector terminals can lose contact after being stretched beyond their yield point, producing a blank or distorted image without advance warning.',
      solution: 'Check the VIN for 20C19/20V575. Dealers replace the rearview camera, free of charge. Continue using mirrors and direct observation and do not rely on a blank or distorted image. The filing identifies Nautilus camera component K2GT-19G490-BB, but do not buy a camera from this page; the recall remedy and exact replacement are VIN-scoped dealer work.',
      symptoms: ['blank rearview-camera image', 'distorted rearview-camera image', 'no advance warning before image failure'],
      dtcCodes: [],
      summary: 'Confirmed the exact 2020 population, connector-terminal cause, symptom boundary and free camera-replacement recall remedy.',
    },
    [IDS.sync]: {
      confidence: 'high',
      description: 'Ford TSB 21-2411 covers certain 2019-2020 Nautilus vehicles with SYNC 3 and lists software-related symptoms including a frozen or blank screen and unexpected reboots. It does not establish an APIM hardware failure for every 2019-2023 vehicle represented by this indexed page.',
      solution: 'Record the exact symptom and have the current SYNC software level checked. TSB 21-2411 directs an APIM software update using the current Ford/Lincoln USB process; hardware should not be replaced unless separate diagnosis proves it faulty. Do not buy an APIM, display or module from this page because programming and hardware fitment are VIN-specific.',
      symptoms: ['SYNC 3 screen freezes', 'SYNC 3 screen goes blank', 'SYNC 3 reboots unexpectedly'],
      dtcCodes: [],
      summary: 'Limited the source-backed condition to 2019-2020 SYNC 3 software and removed blanket APIM replacement, hardware, cost and broader-year claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Nautilus row ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  const labels = {
    [IDS.egr]: 'diagnosis-specific EGR cooler procedure; no universal retail part',
    [IDS.vct]: 'technician-only four-VCT-unit procedure; no verified universal retail fitment',
    [IDS.transmission]: 'software and solenoid-strategy procedure; no retail part',
    [IDS.startStop]: 'diagnosis and battery specification are VIN-specific; no universal retail part',
    [IDS.displays]: 'free VIN-scoped software recall remedy',
    [IDS.blockHeater]: 'free VIN-scoped dealer recall remedy with two remedy options',
    [IDS.brakes]: 'build- and repair-history-specific technician bulletin; no universal retail part',
    [IDS.injector]: 'expired VIN-scoped CSP and high-pressure-fuel procedure; no universal retail part',
    [IDS.pedestrian]: 'configuration- and VIN-specific dealer recall remedy',
    [IDS.ipma]: 'free VIN-scoped software recall remedy',
    [IDS.shocks]: 'free VIN- and inspection-scoped dealer recall remedy',
    [IDS.led]: 'free VIN- and side-specific dealer recall remedy',
    [IDS.roof]: 'leak source and roof option require diagnosis; no universal retail part',
    [IDS.battery]: 'expired VIN-scoped software CSP; no replacement part specified',
    [IDS.liftgate]: 'software-specific technician procedure; no universal retail part',
    [IDS.window]: 'free VIN-scoped software recall remedy',
    [IDS.camera]: 'free VIN-scoped camera recall remedy',
    [IDS.sync]: 'software-first VIN-specific procedure; no universal retail part',
  };
  return labels[id];
}

function proposalFor(row) {
  const content = contentFor(row.id);
  return {
    ...clone(fullRecord(row)), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: content.symptoms, dtcCodes: content.dtcCodes, estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(row.id), communityRecommendations: [], fixParts: [],
    humanApproved: false, source: 'primary-source-audit', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function evidenceFor(row) {
  const notes = {
    [IDS.egr]: ['TSB 20-2234 supports an EGR-cooler diagnostic path, not cylinder intrusion or engine replacement.'],
    [IDS.vct]: ['TSB 23-2356 requires the cold-soak symptom and all four VCT units, with no extra timing parts.'],
    [IDS.transmission]: ['TSB 21-2389 identifies PCM software, not torque-converter, clutch, fluid or rebuild work.'],
    [IDS.startStop]: ['The owner manual documents enabling conditions and manual restart; it does not prove a universal weak-battery cause.'],
    [IDS.displays]: ['25V337 covers 30,679 model-year 2024 vehicles and a free software remedy.'],
    [IDS.blockHeater]: ['25V343 applies only while plugged in; the current API adds a blanking-plug/cord-removal option.'],
    [IDS.brakes]: ['SSM 53329 covers 2024-2025 and limits rotor replacement by build date and repair history.'],
    [IDS.injector]: ['24B23 is an expired 2024 hybrid CSP with an exact four-injector service procedure.'],
    [IDS.pedestrian]: ['26V415 supersedes the incomplete 25SA2 remedy and leaves some configurations pending.'],
    [IDS.ipma]: ['26V165 documents computational overload, specified ADAS losses and a software remedy.'],
    [IDS.shocks]: ['23V439 covers 366 vehicles and an inspection-dependent rear-component remedy.'],
    [IDS.led]: ['25V519 covers 1,539 vehicles and side-specific LED-driver-module inspection/replacement.'],
    [IDS.roof]: ['No exact defect bulletin was found in 429 communications; one complaint remains one allegation.'],
    [IDS.battery]: ['24P22 identifies the ABS module and software remedy; the program has expired.'],
    [IDS.liftgate]: ['The exact SSMs support inoperative liftgate/RGTM software only, not autonomous movement or hardware.'],
    [IDS.window]: ['24V953 and 25V518 are separate VIN-scoped software populations.'],
    [IDS.camera]: ['20V575 covers 7,318 2020 vehicles and free camera replacement.'],
    [IDS.sync]: ['TSB 21-2411 supports 2019-2020 software symptoms, not universal APIM hardware failure.'],
  };
  return [
    `The frozen snapshot keeps ${row.id} published with its exact title, URL identity, indexed years, trims, engines, category, severity and related links.`,
    ...notes[row.id], `Commerce boundary: ${commerceDecisionFor(row.id)}.`,
  ];
}

function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Nautilus').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 18 || !BLOCKER_IDS.every((id) => rows.some((row) => row.id === id))) throw new Error('Lincoln Nautilus frozen coverage drifted');
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(row);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Lincoln', model: 'Nautilus',
    completionStatement: 'All 18 frozen Lincoln Nautilus pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 18 rows contain material source, safety, population or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 18 pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Broader indexed year ranges remain for SEO continuity while the copy explicitly limits each source to its supported population.',
      'Recall and historical customer-program remedies are campaign-, VIN-, date- and configuration-scoped.',
      'Every named replaceable part is covered by an explicit dealer-only, technician-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as “0+ owners” social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'nautilus-pedestrian-remedy-superseded', severity: 'safety-correction', recordIds: [IDS.pedestrian], detail: '26V415 says the former 25SA2 remedy did not fully correct the condition and some final remedies remain under development.' },
      { code: 'nautilus-brake-years-overstated', severity: 'critical-correction', recordIds: [IDS.brakes], detail: 'SSM 53329 supports only 2024-2025 and restricts rotor replacement by build date and prior repair.' },
      { code: 'nautilus-roof-causation-unproven', severity: 'critical-correction', recordIds: [IDS.roof], detail: 'One complaint and zero exact defect bulletins do not prove a model-wide clogged-drain condition.' },
      { code: 'nautilus-battery-campaign-wrong', severity: 'critical-correction', recordIds: [IDS.battery], detail: 'The source-backed program is 24P22 for ABS-module software, not 24P14/24P08 or automatic battery replacement.' },
      { code: 'nautilus-liftgate-hardware-unsupported', severity: 'critical-correction', recordIds: [IDS.liftgate], detail: 'The exact SSMs support inoperative liftgate/RGTM software only, not autonomous movement, motor, strut or latch failure.' },
      { code: 'all-nautilus-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Nautilus page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CURRENT_DELTA_CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
