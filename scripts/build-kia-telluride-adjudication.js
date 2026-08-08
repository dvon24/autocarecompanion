/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-telluride-adjudication-2026-08-08.json');
const IDS = {
  transmission: 'kia-telluride-8-speed-automatic-torque-converter-shudder-re-acceleration-h',
  ac: 'kia-telluride-c-compressor-failure-no-cold-air',
  molding: 'kia-telluride-door-belt-molding-delamination-detachment',
  driveshaft: 'kia-telluride-driveshaft-rollaway',
  valve: 'kia-telluride-engine-valve-spring-fracture-loss-motive-power',
  headliner: 'kia-telluride-headliner-sag-2020',
  spare: 'kia-telluride-incorrect-spare-tire-impairing-abs-traction-control',
  infotainment: 'kia-telluride-infotainment-uvo-touchscreen-freezing-random-reboot',
  oil: 'kia-telluride-oil-dilution-2020',
  paint: 'kia-telluride-paint-bubbling-2020',
  seat: 'kia-telluride-seat-motor-fire',
  thirdRow: 'kia-telluride-third-row-latch-2020',
  tow: 'kia-telluride-tow-hitch-harness-fire',
  windshield: 'kia-telluride-windshield-cracking',
};
const REWRITE_IDS = [IDS.molding, IDS.driveshaft, IDS.valve, IDS.spare, IDS.seat, IDS.tow];
const CLEANUP_IDS = [IDS.transmission, IDS.ac, IDS.headliner, IDS.infotainment, IDS.oil, IDS.paint, IDS.thirdRow, IDS.windshield];
const ALL_IDS = [...REWRITE_IDS, ...CLEANUP_IDS];

const CAMPAIGN_SOURCES = {
  molding: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V494000',
  driveshaft: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V214000',
  valve: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V077000',
  spare: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V745000',
  seat: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V430000',
  tow: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V626000',
};
const EXPECTED_CAMPAIGNS = {
  molding: { years: [2023, 2024, 2025], rows: 3, markers: ['door belt molding trim can delaminate and detach', 'road hazard', 'inspect and replace', 'SC347'] },
  driveshaft: { years: [2020, 2021, 2022, 2023, 2024], rows: 5, markers: ['intermediate shaft and right front driveshaft', 'roll away while in PARK', 'manually engage the emergency parking brake', 'SC303'] },
  valve: { years: [2024], rows: 1, markers: ['engine valve springs may break', 'loss of drive power', 'replace the engine sub-assembly', 'SC296'] },
  spare: { years: [2025], rows: 1, markers: ['incorrect spare tire', 'anti-lock braking system', 'replace the spare wheel and tire assembly', 'SC355'] },
  seat: { years: [2020, 2021, 2022, 2023, 2024], rows: 5, markers: ['improper recall 24V407 repair', 'park outside and away from structures', 'electronic fuse assembly', 'SC374'] },
  tow: { years: [2020, 2021, 2022], rows: 3, markers: ['Genuine Kia 4-pin tow hitch harness', 'park outside and away from structures', 'new fuse and a wiring harness extension', 'SC247'] },
};
const CAMPAIGN_TITLES = {
  molding: 'NHTSA Campaign 25V494000 - Telluride Door Belt Molding Detachment',
  driveshaft: 'NHTSA Campaign 24V214000 - Telluride Driveshaft Disengagement and Rollaway',
  valve: 'NHTSA Campaign 24V077000 - Telluride Valve-Spring Fracture',
  spare: 'NHTSA Campaign 25V745000 - Telluride Incorrect Spare Tire',
  seat: 'NHTSA Campaign 26V430000 - Telluride Power-Seat Motor Fire Risk',
  tow: 'NHTSA Campaign 22V626000 - Telluride Tow-Hitch Harness Fire Risk',
};
const PDF_SOURCES = {
  windshieldInitiative: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10168561-0001.pdf',
    sha256: '91447559d43621519c2c212dbbfe00417f37f0fafe2181173bde3d197828d83b',
    bytes: 153839, pages: 1, citationType: 'manufacturer-communication',
    title: 'Kia Telluride Windshield Customer Satisfaction Initiative - November 2019',
    markers: ['Customer Satisfaction Initiative', 'all Telluride customers on 11/1/2019', 'windshield chipping followed by extensive cracking', 'this is not a campaign'],
    visuallyInspectedPages: [1],
  },
  sa428: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10177835-0001.pdf',
    sha256: 'b0345408c43161c676bf75e44655cf58f4c56684927f890c1bc153e175b87eba',
    bytes: 368866, pages: 3,
    title: 'Kia TSB TRA090 / SA428 - Telluride Automatic Transmission Replacement',
    markers: ['2020MY Telluride (ON)', 'May 18, 2020 through May 20, 2020', 'lower than 1,500 rpm', 'VIN List (19)'],
    visuallyInspectedPages: [1, 2, 3],
  },
  sa490: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10205429-0001.pdf',
    sha256: 'c900f96e1cce44ac81f0a8f7534ce4528ddd3208a09a59ae8079b7288510369d',
    bytes: 648634, pages: 9,
    title: 'Kia TSB ENG232 / SA490 - Telluride Acceleration Logic Improvement',
    markers: ['2022MY', 'rough shift and hesitation during acceleration', 'June 8, 2021 to November 4, 2021', 'Upgrade Event #585'],
    visuallyInspectedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  ele320: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10247556-0001.pdf',
    sha256: 'a9093765e9948a13140d1a7fd72c4f7a29710999b4c3a7ab118087cb236dceb8',
    bytes: 581411, pages: 5,
    title: 'Kia TSB ELE320 - AVN 5.0 Wide Screen Freezing or Map Delay',
    markers: ['AVN 5.0 WIDE SCREEN FREEZING', 'wired Apple CarPlay', 'Telluride (ON)', '2020-2022MY'],
    visuallyInspectedPages: [1, 2, 3, 4, 5],
  },
  tra089: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017171-0001.pdf',
    sha256: 'a8bcecf2cb7f208d6f98c3b6b7176125f34d78f4d7ab4478056a9803800a63e6',
    bytes: 531809, pages: 5,
    title: 'Kia TSB TRA089 - Telluride P074100 TCM Logic Improvement',
    markers: ['2020MY Telluride (ON)', 'P074100', 'February 6, 2019, through December 9, 2019', 'Upgrade Event #484'],
    visuallyInspectedPages: [1, 2, 3, 4, 5],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedTellurideRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedTellurideRows: 0 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedTellurideRows: 0 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedTellurideRows: 0 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedTellurideRows: 18 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedTellurideRows: 158 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedTellurideRows: 39 },
  },
  totalExpectedTellurideRows: 215,
  modelNameCounts: { TELLURIDE: 215 },
  modelMatchRule: 'KIA rows whose Model field equals TELLURIDE',
  requiredDocumentIds: ['10168561', '10177835', '10205429', '10247556', '11017171'],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedTellurideRows: 0 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedTellurideRows: 86 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '19V594000': [2020], '20V436000': [2020], '21V164000': [2021], '21V577000': [2022],
  '22V344000': [2022], '22V509000': [2022], '22V626000': [2020, 2021, 2022],
  '23V035000': [2023], '23V298000': [2023], '24V077000': [2024], '24V148000': [2020],
  '24V214000': [2020, 2021, 2022, 2023, 2024], '24V407000': [2020, 2021, 2022, 2023, 2024],
  '25V494000': [2023, 2024, 2025], '25V745000': [2025], '26V105000': [2025],
  '26V135000': [2027], '26V356000': [2027], '26V430000': [2020, 2021, 2022, 2023, 2024],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = { ...EXPECTED_FLAT_RECALL_INVENTORY };
const MAPPED_CAMPAIGNS = ['22V626000', '24V077000', '24V214000', '24V407000', '25V494000', '25V745000', '26V430000'];
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY)
  .filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign)).sort()
  .map((campaignNumber) => ({ campaignNumber, reason: 'Separate Telluride issue identity not represented by a frozen page; proposal-only collection remains deferred until the remaining-make audit is complete.' }));

const CARDS = {
  [IDS.molding]: {
    action: 'rewrite_same_identity',
    campaign: 'molding',
    citations: ['molding'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: '25V494/SC347 exactly supports the frozen 2023-2025 door-belt-molding detachment identity. Unsupported production dates, supplier-adhesive mechanics and mechanical-retention claims are removed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Door belt molding trim appears loose, lifted or delaminated', 'Door belt molding trim detaches from the vehicle'],
    systems: ['door belt molding trim assemblies'],
    description: 'NHTSA recall 25V494000 (Kia SC347) covers certain 2023-2025 Telluride vehicles. The door belt molding trim can delaminate and detach from the vehicle, creating a road hazard for other traffic.',
    solution: 'Check the VIN for recall 25V494000/SC347. A Kia dealer inspects the belt molding trim assemblies and replaces them as necessary free of charge. Do not glue, tape or buy generic trim from this page in place of the VIN-specific recall remedy.',
  },
  [IDS.driveshaft]: {
    action: 'rewrite_same_identity',
    campaign: 'driveshaft',
    citations: ['driveshaft'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: '24V214/SC303 exactly supports the frozen 2020-2024 intermediate-shaft/right-front-driveshaft disengagement and rollaway identity. Unsupported warning, noise, cost and unrelated driveline commerce are removed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle rolls after being placed in Park if the driveline disengages'],
    systems: ['intermediate shaft, right front driveshaft and electronic parking-brake logic'],
    description: 'NHTSA recall 24V214000 (Kia SC303) covers certain 2020-2024 Telluride vehicles. The intermediate shaft and right front driveshaft may not be fully engaged, which can allow the vehicle to roll away while in Park.',
    solution: 'Check the VIN for recall 24V214000/SC303. Until repaired, manually engage the emergency parking brake before exiting. A Kia dealer updates the electronic parking-brake software and replaces a damaged intermediate shaft as necessary free of charge. Generic U-joints or carrier bearings are not this recall remedy.',
  },
  [IDS.valve]: {
    action: 'rewrite_same_identity',
    campaign: 'valve',
    citations: ['valve'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: '24V077/SC296 exactly supports the frozen 2024 valve-spring fracture identity, loss-of-power/fire consequences and engine-subassembly remedy. Unverified supplier mechanism, field-report language and generic misfire DTCs are removed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Loss of drive power while driving', 'Smoke or fire if a fractured spring leads to a hole in the engine block'],
    systems: ['engine valve springs and engine sub-assembly'],
    description: 'NHTSA recall 24V077000 (Kia SC296) covers certain 2024 Telluride vehicles. An engine valve spring may break while driving, causing loss of drive power and potentially creating a hole in the engine block; the latter also increases fire risk.',
    solution: 'Check the VIN for recall 24V077000/SC296. If drive power is lost or smoke or fire appears, stop safely, shut the vehicle down and seek emergency assistance as appropriate. A Kia dealer replaces the engine sub-assembly free of charge. Do not infer generic P0300-series codes or a smaller retail repair from the recall.',
  },
  [IDS.spare]: {
    action: 'rewrite_same_identity',
    campaign: 'spare',
    citations: ['spare'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: 'The frozen page cites the wrong campaign number. NHTSA 25V745/SC355, not 25V722, exactly supports the 2025 Telluride incorrect-spare identity and dealer replacement of the wheel-and-tire assembly.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Incorrect spare tire identified by the VIN-specific recall', 'ABS or traction-control performance may be impaired while the incorrect spare is installed'],
    systems: ['temporary spare wheel and tire, anti-lock braking and traction control'],
    description: 'NHTSA recall 25V745000 (Kia SC355) covers certain 2025 Telluride vehicles equipped with an incorrect spare tire. If installed, the tire can impair anti-lock braking and traction control, and the vehicle does not comply with FMVSS 110.',
    solution: 'Check the VIN for recall 25V745000/SC355 before relying on the spare. A Kia dealer replaces the spare wheel-and-tire assembly free of charge. The correct campaign is 25V745000, not the previously cited 25V722.',
  },
  [IDS.seat]: {
    action: 'rewrite_same_identity',
    campaign: 'seat',
    citations: ['seat'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: 'Current NHTSA recall 26V430/SC374 supersedes 24V407 and replaces its bracket/knob remedy with an electronic fuse assembly; previously repaired vehicles need the new remedy. False engine DTCs and stale advice are removed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Power-seat slide knob is stuck', 'Burning odor, smoke or fire near a front power seat'],
    systems: ['front power-seat slide switch, motor circuit and electronic fuse protection'],
    description: 'NHTSA recall 26V430000 (Kia SC374) covers certain 2020-2024 Telluride vehicles. A front power-seat motor may overheat because of a stuck slide knob or an improper earlier 24V407 repair, causing a fire while parked or driving. This recall replaces 24V407.',
    solution: 'Check the VIN for recall 26V430000/SC374 and park outside and away from structures until the repair is complete. A Kia dealer installs an electronic fuse assembly free of charge. Vehicles already repaired under 24V407/SC316 still need the new remedy. P0217 and P0128 are unrelated engine codes and are not part of this seat recall.',
  },
  [IDS.tow]: {
    action: 'rewrite_same_identity',
    campaign: 'tow',
    citations: ['tow'],
    commerce: 'dealer-only-no-retail-part-safety-recall',
    reason: '22V626/SC247 exactly supports the frozen 2020-2022 Genuine Kia four-pin tow-harness fire-risk identity, park-outside warning and dealer remedy. Generic wiring, tape, relay and diagnostic-tool commerce are removed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Burning odor, smoke or fire near the tow-hitch harness module', 'Tow-hitch harness electrical malfunction requiring immediate inspection'],
    systems: ['Genuine Kia four-pin tow-hitch harness module, fuse and wiring extension'],
    description: 'NHTSA recall 22V626000 (Kia SC247) covers certain 2020-2022 Telluride vehicles potentially equipped with a Genuine Kia four-pin tow-hitch harness. Debris and moisture on the harness-module circuit board can cause an electrical short and a fire while parked or driving.',
    solution: 'Check the VIN and whether the Kia four-pin harness was installed. Until recall 22V626000/SC247 is completed, park outside and away from structures. A Kia dealer installs a new fuse and wiring-harness extension and inspects and replaces the tow-hitch harness assembly as necessary free of charge. Do not attempt generic wiring repairs from this page.',
  },
  [IDS.transmission]: {
    action: 'targeted_safety_cleanup_pending_source',
    pdfs: ['tra089', 'sa428', 'sa490'],
    citations: ['tra089', 'sa428', 'sa490'],
    commerce: 'dealer-only-no-retail-part-pending-vin-production-and-symptom-match',
    reason: 'The frozen page merges three narrow programs into one all-2020-2022 shudder identity: TRA089 covers a 2020 P074100 logic condition, SA428 covers 19 May 2020-built vehicles below 1,500 rpm, and SA490 covers certain 2022 vehicles with rough shift/hesitation. None supports a generic reflash-first-then-replace rule.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['MIL with P074100 and affected shift smoothness on an eligible 2020 vehicle', 'Noise or vibration below 1,500 rpm on one of 19 SA428-listed vehicles', 'Rough shift or hesitation during acceleration on an SA490-eligible 2022 vehicle'],
    systems: ['eight-speed automatic transmission, torque-converter damper clutch, TCM, ECU and TCU software'],
    description: 'The complete Kia inventory identifies three separate, narrow Telluride transmission programs rather than one 2020-2022 shudder defect. TRA089 applies to some 2020 vehicles built February 6-December 9, 2019 with MIL/P074100 and damper-clutch non-engagement. SA428 applies to 19 listed 2020 vehicles built May 18-20, 2020 with noise or vibration below 1,500 rpm. SA490 applies to some 2022 vehicles built June 8-November 4, 2021 with rough shift and hesitation during acceleration.',
    solution: 'Record the exact symptom and DTCs, then have a Kia dealer verify VIN, production date, calibration and campaign eligibility. TRA089 calls for TCM Event 484; SA428 calls for transmission replacement only for its 19 listed VINs; SA490 calls for both ECU and TCU updates on eligible vehicles. Do not apply a universal reflash-first or transmission-replacement sequence to every vehicle covered by this broad page.',
  },
  [IDS.ac]: {
    action: 'targeted_safety_cleanup_pending_source',
    citations: [],
    commerce: 'no-commerce-pending-refrigerant-and-component-diagnosis',
    reason: 'No exact Telluride manufacturer communication or campaign among 215 communications and 19 campaigns establishes a 2020-2024 compressor-failure population, repeat remanufactured-compressor pattern or warranty replacement rule.',
    severity: 'medium',
    confidence: 'low',
    symptoms: ['Air conditioning blows warm or cools intermittently', 'Abnormal compressor noise or refrigerant loss requiring diagnosis'],
    systems: ['refrigerant circuit, compressor, condenser, evaporator, controls, sensors and drive belt'],
    description: 'The frozen page assigns warm-air complaints across 2020-2024 Tellurides to repeat A/C-compressor failure, but the complete official inventory reviewed here contains no exact Kia package establishing that population, remanufactured-unit pattern or warranty result. Warm or intermittent air can also result from refrigerant loss, electrical controls, sensors, airflow, belt drive or other HVAC components.',
    solution: 'Have a qualified technician measure vent temperature and refrigerant pressures, leak-test the system and test compressor command and electrical operation before replacing parts. Verify warranty or goodwill eligibility against the VIN and current Kia policy. Do not order a compressor or promise replacement coverage from this page without a confirmed diagnosis and exact fitment.',
  },
  [IDS.headliner]: {
    action: 'targeted_safety_cleanup_pending_source',
    citations: [],
    commerce: 'no-commerce-pending-exact-headliner-condition-and-safe-disassembly-plan',
    reason: 'No exact Telluride Kia package establishes the frozen 2020-2024 heat-cycle adhesive failure, glass-removal repair or five-year warranty promise. The cited YouTube ID is a placeholder, and generic adhesive/trim-tool advice risks damaging roof, airbag or shade components.',
    severity: 'low',
    confidence: 'low',
    symptoms: ['Headliner fabric appears loose, wrinkled or sagging near the panoramic roof', 'Headliner or trim interferes with sunshade movement'],
    systems: ['headliner fabric and backing, panoramic-roof opening, sunshade and adjacent restraint trim'],
    description: 'The frozen page attributes all 2020-2024 panoramic-roof headliner sagging to heat-cycle adhesive failure, but no exact Kia package in the complete official inventory establishes that mechanism, scope or repair. The original citation uses a placeholder video identifier and cannot verify the claim.',
    solution: 'Photograph the condition and avoid operating the sunshade if loose material interferes with it. Have a Kia dealer or qualified trim specialist identify whether the fabric, backing board, retainers or roof hardware is affected and verify current warranty eligibility. Do not spray adhesive or remove roof, glass or airbag-adjacent trim from this page.',
  },
  [IDS.infotainment]: {
    action: 'targeted_safety_cleanup_pending_source',
    pdfs: ['ele320'],
    citations: ['ele320'],
    commerce: 'dealer-or-official-software-only-pending-avn-version-and-symptom-match',
    reason: 'ELE320 supports only certain 2020-2022 Tellurides with AVN 5.0 Wide freezing, inaccurate map location or wired-CarPlay map delay. It does not establish the frozen 2020-2023 random-reboot, phantom-touch, black-screen, backup-camera-loss or head-unit-replacement aggregation.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['AVN 5.0 Wide screen freezes', 'Map location is inaccurate or Google Maps/Waze is delayed through wired Apple CarPlay', 'Other display, reboot or camera symptoms requiring separate diagnosis'],
    systems: ['AVN 5.0 Wide software, display, USB connection, head unit and rear-camera display path'],
    description: 'Kia TSB ELE320 applies to certain 2020-2022 Telluride vehicles with the fifth-generation AVN wide unit and addresses an inaccurate map location, a freezing AVN screen, or Google Maps/Waze delay through wired Apple CarPlay. It does not establish a 2020-2023 hardware defect causing random reboot loops, phantom touch, black screens or backup-camera loss.',
    solution: 'Identify the exact AVN unit and software version. For an ELE320-eligible symptom, follow Kia service information or the official Navigation Updater path and do not interrupt power during the update. Treat recurring reboot, touch, black-screen or rear-camera faults as separate diagnostic conditions; do not promise head-unit replacement from ELE320.',
  },
  [IDS.oil]: {
    action: 'targeted_safety_cleanup_pending_source',
    citations: [],
    commerce: 'no-commerce-pending-oil-level-fuel-system-and-engine-diagnosis',
    reason: 'No exact Telluride Kia package establishes a 2020-2025 3.8L oil-dilution defect, 3-5 percent threshold, universal 3,000-4,000-mile interval, highway-drive remedy, 5W-30 prescription or P0172/P0175 certainty. Search commerce and unrelated cross-model relations are removed.',
    severity: 'high',
    confidence: 'low',
    symptoms: ['Oil level rises above the full mark', 'Strong fuel odor in engine oil', 'Abnormal engine operation requiring prompt diagnosis'],
    systems: ['engine lubrication, fuel injection, crankcase ventilation, ignition and combustion'],
    description: 'The frozen page assigns one short-trip fuel-dilution defect to every 2020-2025 Telluride 3.8L engine, but the complete official inventory reviewed here contains no exact Kia package establishing that population, contamination percentage, mileage interval or P0172/P0175 pattern. A rising oil level or fuel odor can indicate several fuel, ignition, combustion or crankcase faults.',
    solution: 'If the oil level is above full, smells strongly of fuel or the engine runs abnormally, avoid unnecessary driving and have the vehicle inspected for fuel, ignition, compression and crankcase causes. Follow the viscosity and severe-service interval in the current owner literature for the VIN. Do not attempt to evaporate fuel with a highway drive or prescribe a shorter interval, laboratory threshold, oil brand or filter from this page.',
  },
  [IDS.paint]: {
    action: 'targeted_safety_cleanup_pending_source',
    citations: [],
    commerce: 'no-commerce-pending-body-finish-and-corrosion-diagnosis',
    reason: 'No exact Telluride Kia package establishes the frozen 2020-2025 e-coat seam defect, climate/color pattern, warranty entitlement or DIY rust-converter/paint remedy. The cited Reddit ID is a placeholder and unrelated liftgate-strut commerce is removed.',
    severity: 'low',
    confidence: 'low',
    symptoms: ['Paint bubbles, peels or flakes near a body seam', 'Discoloration or corrosion appears beneath damaged paint'],
    systems: ['exterior paint, primer, seam sealer, body panels and corrosion protection'],
    description: 'The frozen page attributes paint bubbling across 2020-2025 Tellurides to insufficient e-coat at welded seams, but the complete official inventory contains no exact Kia package establishing that mechanism, scope, color or climate pattern. The original Reddit citation uses a placeholder identifier and cannot verify the claim.',
    solution: 'Photograph the location before disturbing it and have a Kia dealer or qualified body shop determine whether the condition is impact damage, contamination, adhesion failure, seam-sealer failure or corrosion. Verify warranty eligibility against the VIN and current policy. Do not sand, apply rust converter, respray, or buy unrelated liftgate parts from this page before the finish and corrosion layers are assessed.',
  },
  [IDS.thirdRow]: {
    action: 'targeted_safety_cleanup_pending_source',
    citations: [],
    commerce: 'no-commerce-pending-seat-latch-and-restraint-inspection',
    reason: 'No exact Telluride Kia package supports the frozen 2020-2025 stretched-cable/latch-striker mechanism, maintenance interval, mileage range, warranty promise or latch replacement. The sole forum citation and unrelated power-seat-motor commerce cannot support pliers or lubricant advice on a passenger-seat latch.',
    severity: 'high',
    confidence: 'low',
    symptoms: ['Third-row seat will not fold or return to position', 'Seatback does not latch securely in the upright position', 'Release handle or latch does not operate normally'],
    systems: ['third-row seatback latch, release cable, striker and passenger-restraint structure'],
    description: 'The frozen page assigns third-row folding or latching complaints across 2020-2025 Tellurides to a stretched cable and bent striker, but the complete official inventory contains no exact Kia package establishing that cause, mileage range or repair. A seatback that does not latch is a passenger-safety condition, not a generic lubrication task.',
    solution: 'Do not carry a passenger in a seating position whose seatback will not latch securely. Remove cargo load from the seat, avoid bending the striker with tools, and have a Kia dealer or qualified seat/restraint technician inspect the latch, cable, release handle and striker. Do not apply lubricant or order a power-seat motor from this page.',
  },
  [IDS.windshield]: {
    action: 'targeted_safety_cleanup_pending_source',
    pdfs: ['windshieldInitiative'],
    citations: ['windshieldInitiative'],
    commerce: 'no-commerce-pending-current-glass-inspection-and-vin-policy',
    reason: 'Kia issued a November 2019 customer-satisfaction initiative after reports of windshield chipping followed by extensive cracking and offered inspection-based goodwill replacement. It was explicitly not a campaign and does not support the frozen 2021-2025 scope, 46-percent statistic, corner pattern, glass-specification cause, insurance promise or aftermarket-film advice.',
    severity: 'medium',
    confidence: 'low',
    symptoms: ['Road-debris chip is followed by extensive cracking before the chip can be repaired', 'Windshield crack affects the driver view or continues spreading'],
    systems: ['windshield glass, mounting and driver visibility'],
    description: 'A November 2019 Kia customer-satisfaction initiative reported that some early Telluride customers experienced a road-debris chip followed by extensive cracking within a short period, preventing chip repair. Kia asked dealers to inspect affected windshields and offered goodwill support while investigating. The notice explicitly says it was not a campaign; it does not establish the frozen 2021-2025 scope, a 46-percent rate, a lower-corner pattern or a glass-thickness/tempering cause.',
    solution: 'If a crack obstructs vision or is spreading, limit use and arrange prompt professional inspection. Ask a Kia dealer whether the original goodwill initiative or any current assistance applies to the VIN, and document the chip and crack before replacement. Do not assume insurance terms, aftermarket-glass durability or protective-film effectiveness from this page.',
  },
};

function actionFor(id) { return CARDS[id].action; }
function reasonFor(id) { return CARDS[id].reason; }
function commerceDecisionFor(id) { return CARDS[id].commerce; }
function citationFor(key) {
  if (CAMPAIGN_SOURCES[key]) return { type: 'recall', title: CAMPAIGN_TITLES[key], url: CAMPAIGN_SOURCES[key] };
  return { type: PDF_SOURCES[key].citationType || 'tsb', title: PDF_SOURCES[key].title, url: PDF_SOURCES[key].url };
}
function proposalFor(row) {
  const card = CARDS[row.id];
  const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: card.description,
    solution: card.solution,
    severity: card.severity,
    confidence: card.confidence,
    symptoms: clone(card.symptoms),
    affectedSystems: clone(card.systems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: card.citations.map(citationFor),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    reviewedOn: '2026-08-08',
    contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: (card.action === 'rewrite_same_identity' ? 'Official-source same-identity rewrite: ' : 'Targeted accuracy and safety cleanup: ') + card.reason,
    relatedIssueIds: [],
  });
  return proposal;
}
function evidenceFor(row) {
  const card = CARDS[row.id];
  const evidence = [{
    kind: 'complete-official-inventory',
    manufacturerCommunicationCount: 215,
    recallRowCount: 86,
    campaignCount: 19,
    verifiedOn: '2026-08-08',
    observation: 'The frozen, hash-bound Telluride manufacturer-communication and recall inventories were scanned completely before adjudication.',
  }];
  if (card.campaign) evidence.push({
    kind: 'official-nhtsa-campaign',
    key: card.campaign,
    url: CAMPAIGN_SOURCES[card.campaign],
    expected: EXPECTED_CAMPAIGNS[card.campaign],
    verifiedOn: '2026-08-08',
    observation: card.reason,
  });
  if (card.pdfs?.length) evidence.push({
    kind: 'official-pdf-review',
    documentKeys: card.pdfs,
    sources: Object.fromEntries(card.pdfs.map((key) => [key, PDF_SOURCES[key]])),
    allPagesRenderedAndVisuallyInspected: true,
    verifiedOn: '2026-08-08',
    observation: card.reason,
  });
  evidence.push({
    kind: 'citation-commerce-relation-review',
    removedCitationCount: row.citations?.length || 0,
    removedCommerceCount: row.communityRecommendations?.length || 0,
    removedFixPartCount: row.fixParts?.length || 0,
    removedRelatedIssueCount: row.relatedIssueIds?.length || 0,
    verifiedOn: '2026-08-08',
    observation: 'Secondary, placeholder, missing-URL and search-style material is not carried into the proposal. Exact official sources remain only where vehicle and remedy scope match; no retail link is invented without an exact part number and fitment proof.',
  });
  return evidence;
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Telluride');
  if (modelRows.length !== 14) throw new Error('expected 14 Telluride rows, found ' + modelRows.length);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS.slice().sort())) throw new Error('frozen Telluride ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const proposal = proposalFor(current);
    return {
      id: current.id,
      model: current.model,
      action: actionFor(current.id),
      reason: reasonFor(current.id),
      identityRule: 'Preserve every indexed Telluride ID, title, category, year set, trim set, engine set and publication state while correcting false source scope, false campaign numbers, superseded remedies, false DTCs, unsafe advice and unsupported replacement or commerce claims.',
      commerceDecision: commerceDecisionFor(current.id),
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-08',
    make: 'Kia',
    model: 'Telluride',
    completionStatement: 'All 14 frozen Telluride records receive primary-source adjudication. Six exact recall identities receive bounded rewrites and eight contradicted, overbroad or unsupported identities receive targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: CLEANUP_IDS.slice().sort(),
      reason: 'Eight Telluride identities retain an immutable title or year scope broader than the exact primary evidence, or lack an exact Kia package. Independent review is required before any application.',
    },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All 14 Telluride IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A blocker cannot conceal a false campaign number, superseded remedy, false DTC, unsafe instruction, placeholder citation, secondary-only claim, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.',
      'All 215 manufacturer communications and all 86 recall rows/19 campaigns in the complete frozen Telluride inventories are accounted for; 12 separate campaign identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 14,
    },
    observations: [
      { code: 'telluride-six-exact-recall-identities-bounded', severity: 'critical', recordIds: REWRITE_IDS.slice().sort(), detail: '22V626, 24V077, 24V214, 25V494, 25V745 and 26V430 directly support six same-identity rewrites and VIN-specific dealer remedies.' },
      { code: 'telluride-spare-campaign-number-corrected', severity: 'critical-correction', recordIds: [IDS.spare], detail: 'The official incorrect-spare campaign is 25V745/SC355, not the frozen 25V722 reference.' },
      { code: 'telluride-seat-recall-supersession-corrected', severity: 'critical-correction', recordIds: [IDS.seat], detail: '26V430/SC374 replaces 24V407 and requires an electronic fuse assembly even for vehicles repaired under the earlier bracket/knob remedy.' },
      { code: 'telluride-three-transmission-programs-not-conflated', severity: 'critical', recordIds: [IDS.transmission], detail: 'TRA089, SA428 and SA490 describe three different production scopes, symptoms and remedies; the proposal does not stretch them into a universal 2020-2022 shudder repair sequence.' },
      { code: 'telluride-unsupported-diy-and-commerce-removed', severity: 'critical-correction', recordIds: [IDS.ac, IDS.headliner, IDS.oil, IDS.paint, IDS.thirdRow], detail: 'Unsupported compressor replacement, adhesive, highway-drive, oil-service, paint/rust and seat-latch DIY instructions and unverified commerce are removed pending exact evidence and fitment.' },
      { code: 'telluride-infotainment-and-windshield-scope-bounded', severity: 'critical', recordIds: [IDS.infotainment, IDS.windshield], detail: 'ELE320 is limited to exact AVN 5.0 symptoms and model years, while the windshield document is explicitly a 2019 customer-satisfaction initiative rather than a recall or all-year defect finding.' },
      { code: 'telluride-twelve-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS.map((item) => item.campaignNumber), detail: 'Twelve distinct campaigns not represented by frozen Telluride pages remain proposal-deferred until the remaining-make audit is complete.' },
      { code: 'all-telluride-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS.slice().sort(), detail: 'Every Telluride ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES,
    expectedCampaigns: EXPECTED_CAMPAIGNS,
    pdfSources: PDF_SOURCES,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE,
    flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY,
    expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 6, targeted_safety_cleanup_pending_source: 8, total: 14 },
    rows,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = {
  ALL_IDS, CAMPAIGN_SOURCES, CAMPAIGN_TITLES, CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS,
  EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY,
  EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MAPPED_CAMPAIGNS,
  MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_IDS, SNAPSHOT,
  actionFor, commerceDecisionFor, evidenceFor, proposalFor, reasonFor,
};
