/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-60-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CX-60', 'CX60']);

const IDS = Object.freeze({
  batteryGeneric: 'mazda-cx-60-12v-battery-drains-goes-flat-when-parked',
  adblue: 'mazda-cx-60-adblue-overfull-false-warning-messages-diesel',
  dpf: 'mazda-cx-60-diesel-dpf-frequent-regeneration-poor-economy-short-trips',
  vibration: 'mazda-cx-60-driveline-vibration-speed',
  rideGeneric: 'mazda-cx-60-harsh-bouncy-ride-poorly-resolved-suspension-tuning',
  wind: 'mazda-cx-60-highway-wind-noise-from-pillar-door-seal-area',
  hybridWrong: 'mazda-cx-60-hybrid-system-malfunction-warning-engine-fails-to-restart-fr',
  infotainmentGeneric: 'mazda-cx-60-infotainment-freezing-carplay-android-auto-disconnects',
  bPillar: 'mazda-cx-60-interior-b-pillar-door-rattle-over-rough-roads',
  shiftGeneric: 'mazda-cx-60-jerky-low-speed-shifting-shift-shock',
  keyless: 'mazda-cx-60-keyless-entry-fails-to-unlock-door-re-locks-touch',
  refuel: 'mazda-cx-60-petrol-phev-refueling-nozzle-premature-click-off',
  frontCampaign: 'mazda-cx-60-rear-suspension-creaking-knocking-over-bumps',
  radarCampaign: 'mazda-cx-60-smart-brake-support-i-activsense-phantom-braking-false-warni',
  startupClunk: 'mazda-cx-60-transmission-clunk-bang-rocking-startup',
  qi: 'mazda-cx-60-wireless-qi-charger-overheating-won-t-fast-charge-phone',
  batteryCampaign: 'mazda-cx60-12v-battery-drain-warning',
  dieselCampaign: 'mazda-cx60-diesel-clunk-vibration-2022',
  doorCampaign: 'mazda-cx60-door-noise-insulation-tsb',
  rideRevision: 'mazda-cx60-harsh-rear-suspension-ride',
  infotainmentDiagnostic: 'mazda-cx60-infotainment-lag-2023',
  charging: 'mazda-cx60-phev-charging-fault-2023',
  evRange: 'mazda-cx60-phev-ev-range-accuracy-2022',
  insulation: 'mazda-cx60-phev-insulation-resistance-recall-as007a',
  phevShift: 'mazda-cx60-phev-transmission-jerk-2022',
  ar058a: 'mazda-cx60-software-warnings-recall-ar058a',
  steering: 'mazda-cx60-sticky-notchy-steering-rack',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const SAFE_CURRENT_IDS = new Set([
  IDS.frontCampaign, IDS.radarCampaign, IDS.qi, IDS.batteryCampaign, IDS.dieselCampaign,
  IDS.doorCampaign, IDS.infotainmentDiagnostic, IDS.charging, IDS.evRange, IDS.insulation,
  IDS.phevShift, IDS.ar058a, IDS.steering,
]);

const PDF_SOURCES = Object.freeze({
  ar054a: { title: 'Mazda Southern Africa CX-60 Front Suspension Campaign AR054A', type: 'manufacturer', url: 'https://mazda.co.za/hubfs/Dealer%20Portal%20Solution/Bulletins/Dealer%20Bulletins/CUSTOMER%20SERVICE_TECHNICAL_2025_04_CX-60%20Abnormal%20noise%20from%20front%20of%20vehicle.pdf', localPath: 'C:/tmp/mazda-cx60-sources/AR054A-front-suspension.pdf', pages: 13, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], bytes: 1512095, sha256: 'f00d7fcb19bc816e2ddd6c34dafad72b5f8716d367a5e9d3593f95e08c8d7cdb' },
  ar058a: { title: 'Mazda Germany/KBA Recall AR058A - Dash-ESU Software', type: 'manufacturer', url: 'https://de.mazda-press.com/api/assets/download/b45e4634-6dfc-40be-b121-dcc4a749dae8_Default?isDownload=false', localPath: 'C:/tmp/mazda-cx60-sources/AR058A.pdf', pages: 2, visualPages: [1, 2], bytes: 106586, sha256: '6beb19c4e6687c46a62fe354db773d66747a70bd1f9982788b5b86baa2176c3f' },
  phevArchitecture: { title: 'Mazda Technical Review 2022 No. 008 - e-SKYACTIV PHEV Architecture', type: 'manufacturer', url: 'https://www.mazda.com/content/dam/mazda/corporate/mazda-com/en/pdf/innovation/monozukuri/technology/tech-review/2022/2022_no008.pdf', localPath: 'C:/tmp/mazda-cx60-sources/Mazda-Tech-Review-2022-008.pdf', pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 1856394, sha256: 'c07a129afdd2889ba775aa63226aca2f231f306cb8141a4c74b975be232c1af1' },
  transmissionArchitecture: { title: 'Mazda Technical Review 2022 No. 009 - New Eight-Speed Automatic Transmission', type: 'manufacturer', url: 'https://www.mazda.com/content/dam/mazda/corporate/mazda-com/en/pdf/innovation/monozukuri/technology/tech-review/2022/2022_no009.pdf', localPath: 'C:/tmp/mazda-cx60-sources/Mazda-Tech-Review-2022-009.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 1080606, sha256: 'be6d0c7276d6c11e3604218c9eae1a87942711808f089eb10df8ea9f60dbc947' },
  as007aGuardrail: { title: 'Mazda AS007A North American Diagnostic Guardrail for Related CX-70/CX-90 PHEV', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016384-0001.pdf', localPath: 'C:/tmp/mazda-cx60-sources/MC-11016384-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 80723, sha256: 'fa3d5cb2e1a18b5302feb00d06a72cf05ca46fa8f26bd6b64b931efe56164eff' },
});

function cite(title, type, url) { return { title, type, url }; }
const SOURCES = Object.freeze({
  batteryForum: cite('CX-60 Battery Draining Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/cx-60-battery-draining-after-up-to-4-8-hours-in-parked-condition-updated.110/'),
  batteryForum2: cite('CX-60 Low Battery Risk Owner Discussion', 'owner-report', 'https://mazdas247.com/forum/t/cx-60-low-battery-risk-12v.123878540/'),
  batteryCampaign: cite('Mazda Japan CX-60 April 2023 Service Campaign', 'manufacturer', 'https://www2.mazda.co.jp/service/recall/sca/20230403001/'),
  batteryManual: cite('Mazda CX-60 12V Battery Specification Manual Page', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekro_202407/contents/70071800.html'),
  adblueForum: cite('CX-60 AdBlue Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/cx-60-and-adblue-issue.306/'),
  dpfForum: cite('CX-60 DPF Regeneration Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/dpf-regeneration-cycle.347/'),
  dpfManual: cite('Mazda CX-60 DPF Description', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekmi/contents/65690100.html'),
  dpfWarning: cite('Mazda CX-60 DPF Warning Instructions', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekro_202407/contents/68142800.html'),
  vibrationForum: cite('CX-60 Diesel Vibration Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/mazda-cx-60-3-3-diesel-vibration-problems.202/'),
  vibrationForum2: cite('CX-60 3.3 Diesel Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/mazda-cx-60-3-3-diesel.85/'),
  rideForum: cite('CX-60 Bumpy Suspension Owner Discussion', 'owner-report', 'https://mazdas247.com/forum/t/cx-60-phev-can-anything-be-done-about-the-bumpy-suspension.123879760/'),
  rideRevision: cite('Mazda UK 2025 CX-60 Chassis Revisions', 'manufacturer', 'https://uk.mazda-press.com/news/2024/crafted-in-japan--the-2025-mazda-cx-60/'),
  windForum: cite('CX-60 A-Pillar Wind Noise Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/fix-cx-60-wind-noise-from-a-pillar-at-highway-speed.95/'),
  ar058aRdw: cite('RDW Recall Record AR058A', 'government', 'https://opendata.rdw.nl/resource/j9yg-7rg9.json?%24where=referentiecode_producent%3D%27AR058A%27'),
  connectPhone: cite('Mazda Connect Smartphone Connection Manual', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/mazdaconnect/6g/mazdaconnect_s1/contents/34050100.html'),
  connectCx60: cite('Mazda CX-60 Mazda Connect Manual Page', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekki_202510/contents/4588675211.html'),
  connectWifi: cite('Mazda Connect Wi-Fi Client Mode Manual', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/mazdaconnect/7g/mazdaconnect_v1/contents/39010100.html'),
  bPillarForum: cite('CX-60 B-Pillar Rattle Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/b-pillar-on-drivers-side-rattles.349/'),
  doorRattleForum: cite('CX-60 Door Rattle Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/rattling-sound-from-doors-cx-60.460/'),
  ausTransmissionRecall: cite('Australian Recall REC-006046 - CX-60 TCM', 'government', 'https://www.vehiclerecalls.gov.au/recalls/rec-006046'),
  keylessManual: cite('Mazda CX-60 Advanced Keyless Entry Manual', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/eka_202407/contents/64020200.html'),
  keyBatteryManual: cite('Mazda CX-60 Key Battery Manual', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/eka_202407/contents/64010300.html'),
  keyWarningManual: cite('Mazda CX-60 Key Warning Manual', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekro_202407/contents/69070100.html'),
  refuelManual: cite('Mazda CX-60 Refueling Procedure', 'manufacturer', 'https://www2.mazda.co.jp/carlife/owner/manual/cx-60/kh/ekmi/contents/65280200.html'),
  refuelForum: cite('CX-60 Premature Fuel-Nozzle Click-Off Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/refueling-with-petrol-stops-frequently-when-fuel-tank-is-not-full.45/'),
  startupForum: cite('CX-60 Diesel Startup Clunk Owner Discussion', 'owner-report', 'https://www.cx70forum.com/threads/cx60-3-3d-inline-6-transmission-clunk-bang-rock-on-start-up-bad-news.214/'),
});

const OVERRIDE_CITATIONS = Object.freeze({
  [IDS.batteryGeneric]: [SOURCES.batteryForum, SOURCES.batteryForum2, SOURCES.batteryCampaign, SOURCES.batteryManual],
  [IDS.adblue]: [SOURCES.adblueForum],
  [IDS.dpf]: [SOURCES.dpfManual, SOURCES.dpfWarning, SOURCES.dpfForum],
  [IDS.vibration]: [SOURCES.vibrationForum, SOURCES.vibrationForum2],
  [IDS.rideGeneric]: [SOURCES.rideRevision, SOURCES.rideForum],
  [IDS.wind]: [SOURCES.windForum],
  [IDS.hybridWrong]: [PDF_SOURCES.ar058a, SOURCES.ar058aRdw],
  [IDS.infotainmentGeneric]: [SOURCES.connectPhone, SOURCES.connectCx60, SOURCES.connectWifi],
  [IDS.bPillar]: [SOURCES.bPillarForum, SOURCES.doorRattleForum],
  [IDS.shiftGeneric]: [PDF_SOURCES.transmissionArchitecture, SOURCES.ausTransmissionRecall],
  [IDS.keyless]: [SOURCES.keylessManual, SOURCES.keyBatteryManual, SOURCES.keyWarningManual],
  [IDS.refuel]: [SOURCES.refuelManual, SOURCES.refuelForum],
  [IDS.startupClunk]: [SOURCES.startupForum, PDF_SOURCES.transmissionArchitecture],
  [IDS.rideRevision]: [SOURCES.rideRevision, SOURCES.rideForum],
});

const CONTENT = Object.freeze({
  [IDS.batteryGeneric]: {
    confidence: 'medium',
    description: 'Owner discussions describe some CX-60 vehicles discharging the 12V battery while parked, but those reports do not establish one drain rate, one cause, or prevalence across the frozen 2022-2024 years. Mazda separately issued an early-production campaign for a body-control-module power-saving software condition after rapid push-button-start operation. That campaign is one VIN-bounded cause, not a diagnosis for every parked discharge.',
    solution: 'Check the VIN for every open Mazda campaign. Fully charge and test the installed 12V battery, then measure key-off current only after the vehicle has completed its sleep sequence and isolate any circuit that remains awake. Document accessories, charging behavior, parking duration and module activity. Replace the battery only if it fails the correct test and matches the exact powertrain specification. Do not buy a battery, maintainer or control module from this page; campaign status, battery condition and the actual draw must be verified first.',
    symptoms: ['12V battery is discharged after parking', 'low-battery or discharge-risk warning', 'no-start after an extended park'], dtcCodes: [], summary: 'Separated general owner-reported parked discharge from Mazda\'s exact early BCM campaign and removed invented drain-rate and battery-capacity claims.',
  },
  [IDS.adblue]: {
    confidence: 'low',
    description: 'A direct owner discussion reports an AdBlue warning after filling a CX-60 diesel. That report does not establish a 6.7-litre limit, a universal overfill mechanism, a sensor defect, a self-clearing distance, exact DTCs, or prevalence across 2022-2025 vehicles.',
    solution: 'Follow the exact market owner-manual and filler-label instructions, keep the filling receipt and quantity, and do not add more fluid solely to clear a persistent warning. If a no-restart countdown or SCR warning remains, have Mazda read the stored emissions faults and test fluid quality, level sensing and the SCR system before selecting a repair. Do not buy a level sensor, pump or AdBlue additive from this page; the warning, market procedure and failed component must be verified first.',
    symptoms: ['AdBlue or SCR warning remains after filling', 'displayed range or no-restart countdown appears inconsistent with the fill'], dtcCodes: [], summary: 'Demoted the row to a report-level warning and removed unsupported quantities, DTCs, self-clear mileage and parts prescriptions.',
  },
  [IDS.dpf]: {
    confidence: 'high',
    description: 'Mazda explains that the diesel particulate filter captures particulate matter and periodically burns accumulated soot. Mazda\'s CX-60 warning instructions say regeneration may not operate before the engine is warm, while idling, or at 5 km/h or less. Short-trip use can therefore interrupt regeneration, but the evidence does not support a fixed 30-45-minute cycle or a universal schedule every two or three weeks.',
    solution: 'If the soot warning is displayed steadily and conditions are safe, follow the exact market manual: warm the engine and drive for about 15-20 minutes so regeneration can operate. A flashing warning, limited output, or a warning that does not clear requires Mazda diagnosis; do not command a forced regeneration or replace injectors, sensors or the DPF from this page. Do not buy DPF cleaner, injectors or a filter from this page; warning state, soot load, stored faults and root cause must be verified first.',
    symptoms: ['DPF or soot warning', 'frequent regeneration behavior during repeated short trips', 'reduced output when the warning escalates'], dtcCodes: [], summary: 'Replaced unsupported fixed intervals and forced-regeneration advice with Mazda\'s exact warm-engine driving instructions and flashing-warning boundary.',
  },
  [IDS.vibration]: {
    confidence: 'low',
    description: 'Two owner discussions describe vibration in CX-60 3.3-litre diesel vehicles. Owner reports can establish that a symptom was experienced, but not whether tires, wheels, propeller shafts, mounts, transmission operation, engine-speed fluctuation, or another cause applies to a particular vehicle.',
    solution: 'Record speed, gear, engine rpm, load, temperature and whether the vibration follows road speed or engine speed. Have the vehicle inspected for tire and wheel balance and runout, alignment, hubs, driveline joints and shafts, mounts and relevant module data before authorizing work. Check the VIN for Mazda campaigns, including the separate early engine-control rattle campaign where applicable. Do not buy tires, mounts, a propeller shaft or transmission parts from this page; the vibration source must be reproduced and measured first.',
    symptoms: ['vibration at a repeatable road speed', 'vibration changes with engine rpm, gear or load', 'steering-wheel, seat or floor vibration'], dtcCodes: [], summary: 'Kept the direct owner reports but removed an asserted universal driveline cause and parts-first repair path.',
  },
  [IDS.rideGeneric]: {
    confidence: 'medium',
    description: 'Direct owner discussions describe early CX-60 ride quality as harsh or bouncy. Mazda\'s official 2025 model-year release documents later chassis changes including a softer rear spring and firmer shock-absorber settings, which confirms a later tuning revision but does not prove every earlier vehicle is defective or eligible for a free retrofit.',
    solution: 'Verify tire size, pressure and condition, inspect suspension and alignment for damage or wear, and road-test with the dealer on the same surface and load. Ask Mazda to check the VIN for market-specific service information or goodwill eligibility. Do not promise a free model-year retrofit or substitute aftermarket springs and dampers without engineering and fitment review. Do not buy shocks, springs or lowering parts from this page; vehicle condition, exact specification and Mazda eligibility must be verified first.',
    symptoms: ['harsh impact over sharp bumps', 'bouncy or poorly controlled vertical motion', 'ride concern varies with wheel, tire, load or road surface'], dtcCodes: [], summary: 'Anchored the later suspension revision to Mazda\'s release while removing universal-defect, guaranteed-free-retrofit and aftermarket prescriptions.',
  },
  [IDS.wind]: {
    confidence: 'low',
    description: 'A direct owner discussion describes highway wind noise around the CX-60 A-pillar or door-seal area. That report does not prove a universal seal defect, an exact production range, or a single repair across the frozen 2022-2025 years.',
    solution: 'Reproduce the noise at a documented speed and wind direction, inspect door and glass alignment, weatherstrips, mirror trim, roof accessories and prior body repairs, and compare both sides before altering a seal. Water-test only with a safe service procedure and have Mazda verify any applicable service information by VIN. Do not add tape, foam or a replacement seal from this page; the leak path and affected component must be localized first.',
    symptoms: ['wind hiss or whistle near the A-pillar at highway speed', 'noise changes with crosswind, door pressure or mirror area'], dtcCodes: [], summary: 'Retained the report-level wind-noise evidence while removing unsupported universal seal cause and DIY modification advice.',
  },
  [IDS.hybridWrong]: {
    confidence: 'high',
    description: 'Official recall AR058A covers specified CX-60 vehicles with incorrect Dash Electronic Supply Unit software. It can generate warning messages and impair the defroster, seat-belt warning and 360-degree monitor; PHEV battery cooling can also be affected. The official AR058A material does not support this frozen title\'s engine-fails-to-restart claim, an i-stop mechanism, or a faulty PCM, BECM or TCM.',
    solution: 'Check the VIN for AR058A and have Mazda reprogram the Dash-ESU if the recall is open. Diagnose any engine no-restart, stall, EV-drive loss or i-stop complaint separately using the warning state, stored faults and other applicable campaigns; do not represent PCM, BECM or TCM replacement or programming as the AR058A remedy. Do not buy any control module or battery from this page; VIN eligibility and the actual no-restart cause must be verified first.',
    symptoms: ['multiple warning messages at startup', 'defroster, seat-belt warning or 360-degree monitor may not operate as designed', 'PHEV battery cooling may be impaired', 'an engine no-restart complaint requires a separate diagnosis'], dtcCodes: [], summary: 'Corrected the page\'s false AR058A PCM/BECM/no-restart mechanism while preserving its indexed identity.',
  },
  [IDS.infotainmentGeneric]: {
    confidence: 'high',
    description: 'Mazda Connect freezing or smartphone-integration dropouts can arise from the phone, operating-system version, pairing state, connection mode, USB cable or port, Wi-Fi client setting, or vehicle software. The manuals support a structured connection check, not an underpowered-processor theory or a universal hardware failure across 2022-2025.',
    solution: 'Record the Mazda Connect version, phone and operating-system version, and whether the failure is wired, wireless or present in native Mazda screens. Remove and re-pair the phone, verify the selected connection mode, check whether Wi-Fi client mode forces USB-only CarPlay, and test a known-good approved data cable and another compatible phone. If native Mazda Connect also freezes, have Mazda check current software and module faults. Do not buy a CMU, USB hub or scanner from this page; the failing side and current software must be verified first.',
    symptoms: ['Mazda Connect freezes or responds slowly', 'Apple CarPlay or Android Auto disconnects', 'wired and wireless behavior differs'], dtcCodes: [], summary: 'Replaced unsupported processor, cache and undocumented-reset claims with Mazda\'s exact connection-isolation path.',
  },
  [IDS.bPillar]: {
    confidence: 'low',
    description: 'Direct owner discussions describe rattles near the driver-side B-pillar or doors over rough roads. Those reports do not identify one fastener, trim panel, seat-belt component or door mechanism as the cause and do not establish prevalence across 2022-2025.',
    solution: 'Reproduce the sound with a technician, note whether it changes with the seat belt, door pressure, glass position or temperature, and inspect trim attachment, seals, latch alignment and wiring without disabling a restraint component. Ask Mazda to verify current service information for the VIN. Do not wedge foam into the B-pillar or buy clips, seals or a seat-belt assembly from this page; the exact noise path and safety-system involvement must be established first.',
    symptoms: ['rattle near the B-pillar over rough roads', 'door-area rattle changes with pressure, temperature or glass position'], dtcCodes: [], summary: 'Kept the direct owner reports at low confidence and removed an invented single-cause trim repair.',
  },
  [IDS.shiftGeneric]: {
    confidence: 'medium',
    description: 'Mazda\'s technical review documents the CX-60\'s clutch-based eight-speed transmission architecture, but architecture alone is not proof of a defect. Australia recall REC-006046 is narrower: certain vehicles can have a TCM software condition in which clutch re-engagement after braking is inadequate and drive power may be lost. Broader low-speed jerk or shift shock requires separate diagnosis.',
    solution: 'Check the VIN for the Australian campaign or its market equivalent and every applicable Mazda software action. Record temperature, drive mode, gear, speed, braking event and EV-to-engine transition, then scan all powertrain modules and verify calibration levels. A failure to move after braking is a safety concern; other jerk or shift-shock symptoms require diagnosis before parts or fluid service. Do not buy transmission fluid, a filter, clutch or transmission from this page; VIN, calibration and failure mode must be verified first.',
    symptoms: ['low-speed jerk or shift shock', 'rough clutch take-up or engine-motor handoff', 'loss of drive power after braking is a distinct recall symptom'], dtcCodes: [], summary: 'Separated transmission architecture, a bounded TCM safety recall and generic shift-quality complaints without inventing a universal cause.',
  },
  [IDS.keyless]: {
    confidence: 'high',
    description: 'Mazda\'s manual shows that advanced keyless operation depends on key location, transmitter state, battery condition, vehicle settings and the exact warning displayed. A door that does not unlock or immediately re-locks does not by itself prove that a handle sensor, antenna, receiver or body module has failed.',
    solution: 'Try the spare key, move the transmitter away from phones or metal objects, verify the key is within the documented operating range, and read the exact instrument warning. Follow the market manual for key-battery replacement only when the battery warning or testing supports it, then retest all doors. If one handle alone fails or the behavior persists with both keys, have Mazda diagnose antennas, handle switches, latch state and BCM data by VIN. Do not buy a key, handle sensor, antenna or control module from this page; transmitter state and the failed circuit must be verified first.',
    symptoms: ['touch sensor does not unlock the door', 'door unlocks and immediately re-locks', 'key warning or intermittent transmitter detection'], dtcCodes: [], summary: 'Removed a retail CR2032 link and parts-first advice while preserving Mazda\'s exact key-location and warning-state checks.',
  },
  [IDS.refuel]: {
    confidence: 'medium',
    description: 'A direct owner discussion reports repeated fuel-nozzle click-off before the tank is full. Mazda\'s procedure says to insert the nozzle fully, but the available evidence does not establish a universal control-logic cause, an ORVR component failure, a July 2022 production change, or one repair across petrol and PHEV vehicles.',
    solution: 'Use the correct fuel grade and follow the exact market procedure, including fully inserting the nozzle. If safe, try a different pump at normal flow and document fuel level, pump, temperature and whether the problem repeats. Persistent premature shutoff requires inspection of the filler neck, venting and evaporative-emissions system under Mazda service information. Do not force fuel past repeated shutoff or buy an ORVR valve, filler neck or canister from this page; the restriction or venting fault must be verified first.',
    symptoms: ['fuel nozzle repeatedly clicks off before the tank is full', 'problem repeats at more than one pump'], dtcCodes: [], summary: 'Replaced unsupported software-date and ORVR-replacement claims with Mazda\'s exact nozzle procedure and a report-level diagnostic boundary.',
  },
  [IDS.startupClunk]: {
    confidence: 'low',
    description: 'A direct owner discussion reports a clunk, bang or vehicle rock around startup on a CX-60 diesel. Mazda\'s transmission technical review explains the clutch-based eight-speed design but does not identify this report as a defect or prove a failed clutch, mount, propeller shaft or transmission.',
    solution: 'Record whether the sound occurs when the engine starts, when Drive or Reverse is selected, or when load first reaches the driveline, including temperature, gear and brake state. Have Mazda reproduce it, check campaigns and calibration, inspect mounts and driveline lash, and review transmission data before authorizing work. Do not buy mounts, fluid, a clutch or transmission from this page; a forum report and architecture paper do not identify the failed component.',
    symptoms: ['single clunk or bang around startup', 'vehicle rocks when the driveline first loads', 'noise changes with temperature, gear or brake state'], dtcCodes: [], summary: 'Kept the report-level startup symptom while preventing the architecture paper from being misused as defect or parts proof.',
  },
  [IDS.rideRevision]: {
    confidence: 'medium',
    description: 'Direct owner discussions describe a harsh or bouncy rear ride on early CX-60 vehicles. Mazda\'s 2025 model-year release documents a softer rear spring and firmer shock-absorber settings for later production. That establishes a later chassis revision, not a universal defect finding, a guaranteed free retrofit, or proof that a particular early vehicle needs springs and dampers.',
    solution: 'Confirm tire specification and pressure, inspect suspension and alignment, and road-test the exact complaint with Mazda. Ask the dealer to check VIN-specific market service information and any goodwill or update eligibility. The later-production parts should not be assumed to fit or be free for every earlier CX-60. Do not buy aftermarket dampers, lowering springs or a model-year conversion from this page; exact fitment, vehicle condition and Mazda authorization must be verified first.',
    symptoms: ['harsh rear impact over bumps', 'bouncy or poorly controlled rear motion', 'ride concern varies with tire, load or road surface'], dtcCodes: [], summary: 'Removed citation artifacts, guaranteed-free-retrofit language and unsourced aftermarket recommendations while retaining Mazda\'s documented later revision.',
  },
});

function citationsFor(id, before) { return clone(OVERRIDE_CITATIONS[id] || before.citations); }
function contentFor(id, before) {
  if (CONTENT[id]) return CONTENT[id];
  if (!SAFE_CURRENT_IDS.has(id)) throw new Error(`Unexpected Mazda CX-60 row ${id}`);
  return {
    confidence: before.confidence,
    description: before.description,
    solution: before.solution,
    symptoms: clone(before.symptoms),
    dtcCodes: clone(before.dtcCodes),
    summary: `Revalidated the July 18 source-bounded technical explanation and removed recommendations and commerce activation pending independent approval.`,
  };
}
function commerceDecisionFor(id) { return `No universal retail part; VIN, market, warning state, exact configuration and diagnosed failure mode must be verified before replacement (${id}).`; }
function withBoundary(solution) {
  if (/do not buy/i.test(solution)) return solution;
  return `${solution} Do not buy any replacement part from this page; VIN, market, exact configuration and diagnosed failure mode must be verified first.`;
}
function proposalFor(before, id) {
  const content = contentFor(id, before);
  return {
    ...clone(before), description: content.description, solution: withBoundary(content.solution), confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: clone(content.dtcCodes),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id, before), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function sourceUrlSet(snapshot) {
  const frozen = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-60');
  return [...new Set([...frozen.flatMap((row) => (row.citations || []).map((citation) => citation.url)), ...Object.values(SOURCES).map((source) => source.url), ...Object.values(PDF_SOURCES).map((source) => source.url)])].sort();
}

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
  totalRows: 0, requiredCommunicationIds: [],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  jurisdictionNote: 'NHTSA contains no CX-60 communications because this model is not sold in the United States; Mazda and government sources from Japan, Europe, the United Kingdom, Australia and South Africa control this packet.',
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 0 }, totalRows: 0,
  campaignCount: 0, campaigns: [], sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  jurisdictionNote: BULLETIN_INVENTORY.jurisdictionNote,
});

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-60').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 27) throw new Error(`Expected 27 Mazda CX-60 rows, found ${frozenRows.length}`);
  const decisions = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id, before);
    return {
      id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: content.summary,
      evidence: { exactSources: citationsFor(row.id, before).map((source) => source.title), limitations: 'Owner discussions are report-level evidence only. Recall, campaign and manual evidence remains VIN-, market-, powertrain- and condition-scoped.' },
      commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal,
      proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-multi-jurisdiction-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-60',
    completionStatement: 'All 27 frozen Mazda CX-60 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 27 rows require independent review before any catalog write; 14 older rows contain material accuracy corrections and 13 July-curated rows have been revalidated and commerce-stripped.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'All 27 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Owner discussions are reports, not proof of prevalence, a universal cause or an exact failed component.',
      'Campaign, recall and manual remedies remain VIN-, market-, powertrain-, equipment- and condition-scoped.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'cx60-jurisdiction-shift', severity: 'source-boundary', recordIds: frozenRows.map((row) => row.id), detail: 'NHTSA has zero CX-60 rows; official Mazda and government evidence from the model\'s actual markets is used instead of treating the U.S. absence as evidence against the records.' },
      { code: 'cx60-ar058a-conflation-corrected', severity: 'accuracy-correction', recordIds: [IDS.hybridWrong, IDS.ar058a, IDS.phevShift], detail: 'AR058A is limited to Dash-ESU warning and visibility functions; it does not support PCM, BECM, TCM or engine-restart claims.' },
      { code: 'cx60-report-level-pages-demoted', severity: 'evidence-boundary', recordIds: [IDS.adblue, IDS.vibration, IDS.wind, IDS.bPillar, IDS.startupClunk], detail: 'Direct owner reports remain indexed but no longer assert a universal cause, prevalence or parts remedy.' },
      { code: 'cx60-dpf-manual-correction', severity: 'safety-correction', recordIds: [IDS.dpf], detail: 'Mazda\'s exact warning instructions replace unsupported 30-45-minute, every-two-to-three-weeks and automatic forced-regeneration advice.' },
      { code: 'cx60-suspension-revision-boundary', severity: 'accuracy-correction', recordIds: [IDS.rideGeneric, IDS.rideRevision], detail: 'Mazda\'s later chassis revision is not represented as a universal defect or guaranteed free retrofit.' },
      { code: 'all-cx60-pages-preserved', severity: 'seo-safety', recordIds: frozenRows.map((row) => row.id), detail: 'No Mazda CX-60 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    jurisdictionSources: sourceUrlSet(snapshot),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: frozenRows.length, total: frozenRows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CONTENT, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SAFE_CURRENT_IDS, SNAPSHOT, SOURCES, buildPacket, citationsFor, commerceDecisionFor, contentFor, proposalFor, sourceUrlSet };
