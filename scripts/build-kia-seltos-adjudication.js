/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-seltos-adjudication-2026-08-08.json');

const IDS = {
  dct: 'kia-seltos-1-6l-turbo-7-speed-dry-dct-overheating-shudder-hesitation',
  ivt: 'kia-seltos-cvt-hesitation',
  cluster: 'kia-seltos-instrument-cluster-blank',
  isgPump: 'kia-seltos-isg-oil-pump-overheat',
  lamps: 'kia-seltos-led-headlight-drl-fog-lamp-internal-condensation',
  theft: 'kia-seltos-missing-engine-immobilizer-kia-boys-usb-theft-vulnerability',
  piston: 'kia-seltos-piston-ring-oil-consumption',
  airbag: 'kia-seltos-side-curtain-airbag-inadvertent-deployment',
  postRemedy: 'kia-seltos-stalling-fire-hazard-unrepaired-still-symptomatic-2021-2023',
};
const CLEANUP_IDS = [IDS.dct, IDS.ivt, IDS.cluster, IDS.lamps];
const REWRITE_IDS = [IDS.isgPump, IDS.theft, IDS.piston, IDS.airbag, IDS.postRemedy];
const ALL_IDS = [...CLEANUP_IDS, ...REWRITE_IDS];

const CAMPAIGN_SOURCES = {
  earlierPistonRing: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V259000',
  isgPump: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V531000',
  airbag: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V830000',
  pistonRing: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V099000',
};
const EXPECTED_CAMPAIGNS = {
  earlierPistonRing: { years: [2021], markers: ['piston oil rings', 'if necessary, replace the engine', 'SC209'] },
  isgPump: { years: [2023, 2024], markers: ['Idle Stop & Go oil pump', 'park outside and away from structures', 'SC275'] },
  airbag: { years: [2024], markers: ['side curtain air bags may deploy unexpectedly', 'replace both side curtain air bag modules', 'SC289'] },
  pistonRing: { years: [2021, 2022, 2023], markers: ['piston oil rings', 'piston-ring noise sensing system', 'SC336'] },
};

const KIA_HTML_SOURCES = {
  modelYear2024Powertrain: {
    url: 'https://www.kiamedia.com/us/en/media/pressreleases/20285/kia-america-announces-2024-seltos-pricing',
    markers: ['2024 Seltos', '8-speed automatic transmission', 'replaces the outgoing 7-speed dual-clutch transmission'],
  },
  modelYear2025Powertrain: {
    url: 'https://www.kiamedia.com/us/en/models/seltos/2025/specifications',
    markers: ['2025 Seltos', '8-Speed Automatic Transmission (8AT)'],
  },
};

const PDF_SOURCES = {
  earlierPistonRecall: {
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V259-6845.PDF',
    sha256: '07fe80a4f7665738819b0028ca0e3ea59f5af718342aea5bdea5a3aad89b8b92', pageCount: 4,
    visuallyInspectedPages: [1, 2, 3, 4],
    markers: ['21V-259', '2021-2021 Kia Seltos', 'excessive oil ring hardness', 'Piston-ring Noise Sensing System'],
  },
  isgPumpRecall: {
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V531-3358.PDF',
    sha256: '40cf8b9ede8e3e9f9a148c7db2f85ce4df335d1b923734a6c9aff7730987382b', pageCount: 4,
    visuallyInspectedPages: [1, 2, 3, 4],
    markers: ['23V-531', '2023-2024 Kia Seltos', 'Multi-Layer Ceramic Capacitor', 'park their vehicles outdoors'],
  },
  airbagRecall: {
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V830-3081.PDF',
    sha256: '9a338d2e0680f556adfbf8c6bb7a828fc446b873dcfa962c07c6a23052fd17e0', pageCount: 3,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['23V-830', '2024-2024 Kia Seltos', 'welding error', 'inspect both side curtain airbag modules'],
  },
  pistonRecall: {
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V099-7174.PDF',
    sha256: 'fd1ad0da63d88876249e1c5b95ff4dda18cf20eb0afe11b2f3d2e531cc15686a', pageCount: 4,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['25V-099', '2021-2023 Kia Seltos', 'quality deviation', 'Piston-ring Noise Sensing System'],
  },
  dctServiceAction: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10185037-0001.pdf',
    sha256: '6400b6fe2fc15c28a3657b1eb6122093f004c435ecf811aae984123a736d8537', pageCount: 8,
    visuallyInspectedPages: [1, 3, 8],
    markers: ['SA454', '2021MY Seltos', 'DTC P060194', 'November 20, 2019 to October 14, 2020'],
  },
  ivtCampaign: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238222-0001.pdf',
    sha256: '508191b216bcdac905da6dbd7b1ff9ca4fd3fb449af3305cdd1e44dd51f33b8b', pageCount: 13,
    visuallyInspectedPages: [1, 2, 12],
    markers: ['SC199', '2021 Seltos', 'lack of acceleration or delay in accelerating', 'P0730', 'P0731', 'P0741', 'P0867'],
  },
  headlamp: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201529-0001.pdf',
    sha256: '692a4d7795da66719f1f82d7be4c5bc8a76a3426de1d610d74f85db7e471b72c', pageCount: 4,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['BOD055', 'All Models', 'normal condensation', 'Water Intrusion'],
  },
  theftSoftware: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239718-0001.pdf',
    sha256: 'e24ed74fbc5cbfd34e310c4b98070f8c239d9e5329dc97a846b73bea4d261acb', pageCount: 10,
    visuallyInspectedPages: [1, 3, 10],
    markers: ['CS2309', '2021-2022MY Seltos', 'may not be equipped with an immobilizer', 'November 21, 2019 through February 28, 2022'],
  },
  theftProtector: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034003-0001.pdf',
    sha256: 'bd77a17fe4d003dac7fd81aff7a6ab705ab7401b699558fb5fec44d343c5fc20', pageCount: 23,
    visuallyInspectedPages: [1, 20, 21, 23],
    markers: ['CS2312', 'Seltos (SP2)', 'Theft Deterrent Ignition Cylinder Protector', '81921 D9000QQK'],
  },
  pnssInspection: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017169-0001.pdf',
    sha256: '17a7d0d7dea9c5597439edfb10ec0e8a6f4c411de40bf6ed94ae4e30badfe803', pageCount: 7,
    visuallyInspectedPages: [1, 4, 6],
    markers: ['SST082', 'PISTON NOISE SENSING SYSTEM', 'P132700', 'SC209Y/SC336'],
  },
  transmissionFluid: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017172-0001.pdf',
    sha256: '956fce7de8ac125135c8364519dd186363d22bf45c8cd6c53bde338f0d663d01', pageCount: 8,
    visuallyInspectedPages: [1, 5, 8],
    markers: ['TRA046', '21-25MY Seltos', '21-23MY Seltos', '24-25MY Seltos', 'A flush is required ONLY when a transmission is replaced'],
  },
  auditQuery: {
    url: 'https://static.nhtsa.gov/odi/inv/2025/INOA-AQ25001-17394.pdf',
    sha256: 'a647ca29c356e45a7f5a0ab23d6b206761b3d7c9b227bf8b678e7fa71fb2d5e5', pageCount: 1,
    visuallyInspectedPages: [1],
    markers: ['AQ25001', 'Recall Effectiveness', 'review of 47 complaints', 'ineffective recall remedy'],
  },
  pistonOwnerLetter: {
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCONL-25V099-1235.pdf',
    sha256: '43a64638fcdb18f8cdc024604d19631986c0db03052dbc8a35b1b16a990b9bc3', pageCount: 3,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['IMPORTANT SAFETY RECALL', '2021-2023 MY Seltos', 'P1327', 'pull over to a safe location', 'do not drive your vehicle'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedSeltosRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedSeltosRows: 0 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedSeltosRows: 0 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedSeltosRows: 0 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedSeltosRows: 0 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedSeltosRows: 143 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedSeltosRows: 26 },
  },
  totalExpectedSeltosRows: 169,
  requiredDocumentIds: ['10185037', '10201529', '10238222', '10239718', '11017169', '11017172', '11034003'],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedSeltosRows: 0 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedSeltosRows: 11 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '21V259000': [2021], '23V531000': [2023, 2024], '23V830000': [2024], '25V099000': [2021, 2022, 2023],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = { ...EXPECTED_FLAT_RECALL_INVENTORY };
const DEFERRED_CAMPAIGNS = [];

const CARDS = {
  [IDS.dct]: {
    action: 'targeted_safety_cleanup_pending_source',
    reason: 'Kia SA454 proves only a VIN-bound 2021 1.6T/7DCT P060194 limited-shifting condition. Kia states the refreshed 2024 turbo changed to an 8-speed automatic, so the frozen 2021-2025 DCT aggregation, overheat mechanism, unsupported DTCs and clutch-replacement advice cannot pass as written.',
    commerceDecision: 'dealer-only-no-retail-part-pending-exact-vin-and-transmission-diagnosis',
    description: 'Kia SA454 applies only to some 2021 Seltos vehicles with the 1.6L turbo and 7-speed DCT, produced from November 20, 2019 through October 14, 2020. It addresses a check-engine light and limp-home operation with DTC P060194 caused by limited gear shifting, using a transmission-control logic update. It does not establish this page\'s overheating, heat-stressed clutch or broad 2021-2025 shudder claims. Kia states that the 2024 turbo powertrain replaced the outgoing 7-speed DCT with an 8-speed automatic, and the 2025 specification also lists an 8-speed automatic.',
    solution: 'Identify the installed transmission and retrieve exact fault codes before repair. For a VIN eligible for SA454, a Kia dealer can apply the specified 7DCT logic update. Do not use SA454 to diagnose a 2024-2025 vehicle, recommend clutch-pack replacement, or assign P0868, P17BF or P0741 without vehicle-specific evidence. No retail part is recommended while the indexed year span conflicts with the official powertrain boundary.',
    severity: 'medium', confidence: 'medium', symptoms: ['Check-engine light with limited gear shifting or limp-home operation on an eligible 2021 vehicle'], systems: ['7-speed dual-clutch transmission control system'], dtcCodes: ['P060194'],
    citations: [
      { type: 'tsb', title: 'Kia SA454 - 2021 Seltos 7DCT P060194 Logic Improvement', url: PDF_SOURCES.dctServiceAction.url },
      { type: 'manufacturer', title: 'Kia America Announces 2024 Seltos Pricing and 8-Speed Automatic', url: KIA_HTML_SOURCES.modelYear2024Powertrain.url },
      { type: 'manufacturer', title: '2025 Kia Seltos Specifications', url: KIA_HTML_SOURCES.modelYear2025Powertrain.url },
      { type: 'tsb', title: 'Kia TRA046 - Transmission Fluid Application Guide', url: PDF_SOURCES.transmissionFluid.url },
    ],
  },
  [IDS.ivt]: {
    action: 'targeted_safety_cleanup_pending_source',
    reason: 'SC199 supports only certain 2021 Seltos vehicles with four exact DTCs and acceleration delay from slippage. It does not support a universal 2021-2025 under-load defect, routine fluid service, Sport-mode workaround, blanket warranty statement or the frozen search commerce.',
    commerceDecision: 'dealer-only-no-retail-part-pending-vin-dtc-and-ivt-diagnosis',
    description: 'Kia SC199 applies to certain 2021 Seltos vehicles produced from November 20, 2019 through April 10, 2020. Eligible vehicles may illuminate the malfunction indicator with P0730, P0731, P0741 or P0867 and may have a lack of acceleration or delayed acceleration due to IVT slippage. The campaign uses a TCM logic update and, only when the documented diagnostic path requires it, IVT replacement. It does not establish the same condition across every 2021-2025 Seltos.',
    solution: 'Retrieve codes, confirm the installed IVT and check the VIN for SC199 before repair. The Kia procedure updates TCM logic, resets and relearns adaptive values, and replaces the IVT only when its specified DTC and learning criteria are met. Do not prescribe Sport mode, routine fluid replacement, a generic filter or aftermarket CVT fluid from this page. Kia TRA046 identifies SP-CVT1 for the Seltos IVT and says cooler flushing is only part of a transmission-replacement procedure when the cooler is transferred.',
    severity: 'medium', confidence: 'medium', symptoms: ['Malfunction indicator light', 'Lack of acceleration', 'Delay in accelerating due to IVT slippage'], systems: ['intelligent variable transmission', 'transmission control module'], dtcCodes: ['P0730', 'P0731', 'P0741', 'P0867'],
    citations: [
      { type: 'tsb', title: 'Kia SC199 - IVT Logic Improvement and/or IVT Replacement', url: PDF_SOURCES.ivtCampaign.url },
      { type: 'tsb', title: 'Kia TRA046 - Transmission Fluid Application Guide', url: PDF_SOURCES.transmissionFluid.url },
    ],
  },
  [IDS.cluster]: {
    action: 'targeted_safety_cleanup_pending_source',
    reason: 'The complete 169-row Seltos manufacturer-communication inventory contains no exact blank-cluster bulletin. The frozen software update, replacement cost, 30-second workaround and generic scanner/relay commerce therefore lack a primary package.',
    commerceDecision: 'no-commerce-pending-exact-cluster-diagnosis-and-primary-source',
    description: 'The frozen page describes owner-reported blank instrument-cluster behavior, but the complete NHTSA manufacturer-communication inventory reviewed for Seltos contains no exact Kia bulletin establishing this 2021-2024 condition or a software remedy. The cause, affected population and recurrence pattern are not proven by the cited title-only complaint and forum references.',
    solution: 'Do not drive when speed, warning or fuel information is unavailable. Photograph the condition and arrange Kia dealer diagnosis of the cluster, power supply, grounds, connectors and stored body-network faults for the exact VIN. Do not promise a software update, prescribe a 30-second restart workaround, quote a cluster-replacement price or buy a generic relay or scan tool from this page without an exact diagnosis.',
    severity: 'medium', confidence: 'low', symptoms: ['Instrument cluster may be reported blank at startup', 'Speed and warning information may be unavailable'], systems: ['instrument cluster and its power/network inputs'], dtcCodes: [], citations: [],
  },
  [IDS.isgPump]: {
    action: 'rewrite_same_identity',
    reason: 'The page has the correct ISG electric-oil-pump identity but cites the wrong campaign number, gives unsupported DTCs and disabling advice, and recommends unrelated radiator/coolant search commerce. Recall 23V531/SC275 supplies the exact population, risk, warnings and dealer remedy.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recall',
    description: 'NHTSA recall 23V531000 (Kia SC275) covers certain 2023-2024 Seltos vehicles equipped with an IVT and produced from November 9, 2022 through May 29, 2023. A supplier-damaged capacitor in the controller of the transmission\'s Idle Stop & Go electric oil pump can short while driving and cause thermal damage at the pump, increasing fire risk. Warning signs can include several driver-assistance or chassis warning lamps, an inoperative ISG system, limp-home mode, inability to turn off the engine, or smoke from the engine compartment.',
    solution: 'Check the VIN for recall 23V531000. Until repaired, Kia recommends parking outdoors and away from other vehicles or structures. A Kia dealer inspects the electric oil pump assembly and, if necessary, replaces the electric oil pump controller free of charge. Do not substitute recall 23V578, disable ISG as a claimed remedy, or purchase radiator/coolant products for this electrical controller defect.',
    severity: 'high', confidence: 'high', symptoms: ['Multiple chassis or driver-assistance warning lamps', 'ISG becomes inoperative', 'Limp-home mode', 'Engine cannot be turned off', 'Smoke from engine compartment'], systems: ['transmission ISG electric oil pump controller and wiring'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 23V531000 - Seltos ISG Electric Oil Pump Fire Risk', url: CAMPAIGN_SOURCES.isgPump },
      { type: 'recall', title: 'Part 573 Safety Recall Report 23V531', url: PDF_SOURCES.isgPumpRecall.url },
    ],
  },
  [IDS.lamps]: {
    action: 'targeted_safety_cleanup_pending_source',
    reason: 'Kia BOD055 supports headlamp condensation guidance but not a uniform 2021-2025 Seltos defect spanning LED headlamps, DRLs and fog lamps, reduced output or automatic assembly replacement. The page must remain blocked at its broader indexed identity.',
    commerceDecision: 'dealer-only-no-retail-part-pending-moisture-diagnosis',
    description: 'Kia BOD055 explains that light fogging or condensation inside a headlamp is generally normal and often clears with the headlamps on during idling or normal driving. Pooled water, droplets that remain after the documented drying procedure, blocked vents, an over-saturated desiccant bag, damaged seals or cracks require diagnosis. The bulletin does not prove a single 2021-2025 Seltos defect across LED headlamp, DRL and fog-lamp assemblies or state that all moisture reduces light output.',
    solution: 'Photograph the condition and distinguish normal fogging from pooled water or persistent droplets. A Kia retailer can follow BOD055, inspect vents, desiccant, seals, gaskets, cracks, external damage and modifications, and document an actual water leak before repair or replacement. Do not promise full assembly replacement or apply the headlamp bulletin automatically to separate DRL or fog-lamp units.',
    severity: 'low', confidence: 'medium', symptoms: ['Fogging or condensation inside a headlamp', 'Pooled water or persistent droplets indicating possible intrusion'], systems: ['headlamp ventilation, seals and housing'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Kia BOD055 - Information for Headlamp Condensation and Moisture', url: PDF_SOURCES.headlamp.url }],
  },
  [IDS.theft]: {
    action: 'rewrite_same_identity',
    reason: 'Kia CS2309 and CS2312 support a VIN- and production-bound anti-theft software and ignition-cylinder-protector program. The frozen settlement amounts, blanket push-button boundary, steering-wheel-lock promise and standard-from-2022 claim are not needed and were removed.',
    commerceDecision: 'dealer-only-no-retail-part-customer-satisfaction-campaigns',
    description: 'Kia CS2309 applies to certain 2021-2022 Seltos vehicles produced from November 21, 2019 through February 28, 2022 that may not be equipped with an immobilizer. The dealer software upgrade adds anti-theft ignition-start logic that activates when the vehicle is locked. For eligible vehicles whose body-control module received the software upgrade, CS2312 adds a permanently affixed ignition-cylinder protector and anti-theft decals.',
    solution: 'Ask a Kia dealer to check the VIN for CS2309 software eligibility and the later CS2312 ignition-cylinder-protector program. These are dealer campaigns with exact control-module and production requirements; do not buy a retail protector kit from this page or assume every 2021-2022 Seltos has the same equipment. The proposal does not make settlement, reimbursement, insurance or steering-wheel-lock promises.',
    severity: 'high', confidence: 'high', symptoms: [], systems: ['key-start ignition cylinder', 'integrated body control unit or body control module'], dtcCodes: [],
    citations: [
      { type: 'tsb', title: 'Kia CS2309 - Seltos Anti-Theft Software Logic Upgrade', url: PDF_SOURCES.theftSoftware.url },
      { type: 'tsb', title: 'Kia CS2312 - Theft Deterrent Ignition Cylinder Protector', url: PDF_SOURCES.theftProtector.url },
    ],
  },
  [IDS.piston]: {
    action: 'rewrite_same_identity',
    reason: 'Recall 25V099/SC336 exactly matches the retained 2021-2023 2.0L Seltos identity but describes a supplier quality deviation, not the earlier 21V259 heat-treatment mechanism. The proposal removes false DTCs, search commerce and unsupported maintenance thresholds while retaining the official warning and free remedy.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recall',
    description: 'NHTSA recall 25V099000 (Kia SC336) covers 53,635 certain 2021-2023 Seltos vehicles equipped with 2.0L Nu MPI engines and produced from July 2, 2020 through July 1, 2022. A supplier quality deviation can allow the piston oil ring to damage the cylinder wall, increasing oil consumption and eventually causing abnormal engine noise or an oil-pressure warning. Continued operation can lead to engine damage or seizure, loss of motive power and, in limited cases, fire if a hole in the engine block lets oil reach a hot exhaust component.',
    solution: 'Check the VIN for recall 25V099000. A Kia dealer inspects the engine, replaces it when necessary and installs PNSS software free of charge. If PNSS later sets P1327, the engine is replaced under the campaign. Kia\'s owner notice says that abnormal engine noise, the oil-pressure warning light or loss of drive power requires pulling over safely, not driving the vehicle and requesting a tow to a Kia dealer.',
    severity: 'high', confidence: 'high', symptoms: ['Increased oil consumption', 'Abnormal engine noise', 'Oil-pressure warning light', 'Loss of drive power'], systems: ['2.0L Nu MPI piston oil rings, cylinder wall and engine'], dtcCodes: ['P1327'],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 25V099000 - Seltos Piston Oil Ring', url: CAMPAIGN_SOURCES.pistonRing },
      { type: 'recall', title: 'Part 573 Safety Recall Report 25V099', url: PDF_SOURCES.pistonRecall.url },
      { type: 'recall', title: 'Kia Seltos Owner Notice for Recall 25V099 / SC336', url: PDF_SOURCES.pistonOwnerLetter.url },
      { type: 'tsb', title: 'Kia SST082 - PNSS Inspection', url: PDF_SOURCES.pnssInspection.url },
    ],
  },
  [IDS.airbag]: {
    action: 'rewrite_same_identity',
    reason: 'Recall 23V830/SC289 exactly matches the retained 2024 Seltos identity. The proposal removes secondary citations and the unsupported warning-light symptom because Kia states there is no advance warning.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recall',
    description: 'NHTSA recall 23V830000 (Kia SC289) covers 1,367 certain 2024 Seltos vehicles produced from April 3 through May 8, 2023. A supplier welding setup error can break the diffuser disk in a side-curtain-airbag hybrid inflator, release stored gas and inflate the airbag without a deployment command. Inadvertent inflation can injure an occupant or distract the driver and increase crash risk. Kia identifies no advance warning.',
    solution: 'Check the VIN for recall 23V830000. A Kia dealer inspects both side-curtain-airbag modules and replaces an affected module when necessary, free of charge. This is a VIN-specific dealer safety remedy; do not purchase an airbag module from this page.',
    severity: 'high', confidence: 'high', symptoms: [], systems: ['left and right side-curtain-airbag modules and hybrid inflators'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 23V830000 - Seltos Side Curtain Airbag', url: CAMPAIGN_SOURCES.airbag },
      { type: 'recall', title: 'Part 573 Safety Recall Report 23V830', url: PDF_SOURCES.airbagRecall.url },
    ],
  },
  [IDS.postRemedy]: {
    action: 'rewrite_same_identity',
    reason: 'NHTSA AQ25001 supports a separate recall-effectiveness concern but reviewed 47 remedy complaints, not 400-plus stalling complaints, and does not establish four fires. The proposal replaces those figures and unsupported universal park-away/lemon-law advice with the exact recall warnings and complaint path.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recall-and-remedy-review',
    description: 'NHTSA opened Audit Query AQ25001 on August 6, 2025 to evaluate Kia\'s remedy for recall 25V099 after reviewing 47 complaints submitted from April 29 through June 27, 2025. Those complaints alleged an ineffective remedy, inconsistent engine-inspection results or unavailable remedies. The opening resume does not document 400-plus stalling complaints or four fires. Recall 25V099 itself says the piston-ring condition can cause increased oil consumption, abnormal engine noise or an oil-pressure warning and, if operation continues, engine seizure, loss of motive power or a limited fire risk.',
    solution: 'Check the VIN and arrange recall 25V099/SC336 service. If abnormal engine noise, the oil-pressure warning light or loss of drive power occurs, Kia\'s owner notice says to pull over safely, not drive and request towing to an authorized Kia dealer. If symptoms continue after service, inspection results conflict or the free remedy is unavailable, document the visits, contact Kia Customer Care and submit a complaint to NHTSA. The reviewed official documents do not direct every owner to park outside or make a lemon-law eligibility determination.',
    severity: 'high', confidence: 'high', symptoms: ['Abnormal engine noise', 'Oil-pressure warning light', 'Loss of drive power', 'Ongoing symptoms or inconsistent inspection results after recall service'], systems: ['2.0L Nu MPI engine and recall 25V099 remedy process'], dtcCodes: ['P1327'],
    citations: [
      { type: 'investigation', title: 'NHTSA Audit Query AQ25001 - Recall 25V099 Remedy Effectiveness', url: PDF_SOURCES.auditQuery.url },
      { type: 'recall', title: 'Kia Seltos Owner Notice for Recall 25V099 / SC336', url: PDF_SOURCES.pistonOwnerLetter.url },
      { type: 'recall', title: 'NHTSA Campaign 25V099000', url: CAMPAIGN_SOURCES.pistonRing },
    ],
  },
};

function proposalFor(row) {
  const card = CARDS[row.id];
  const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: card.description, solution: card.solution, severity: card.severity, confidence: card.confidence,
    symptoms: clone(card.symptoms), affectedSystems: clone(card.systems), dtcCodes: clone(card.dtcCodes),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: clone(card.citations), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: `${card.action === 'rewrite_same_identity' ? 'Official-source same-identity rewrite' : 'Targeted accuracy and safety cleanup'}: ${card.reason}`,
    relatedIssueIds: [],
  });
  return proposal;
}
function actionFor(id) { return CARDS[id].action; }
function reasonFor(id) { return CARDS[id].reason; }
function commerceDecisionFor(id) { return CARDS[id].commerceDecision; }

function evidenceFor(row) {
  const map = {
    [IDS.dct]: [
      { kind: 'official-kia-service-action-visually-inspected', ...PDF_SOURCES.dctServiceAction, verifiedOn: '2026-08-08', observation: 'SA454 is a narrow 2021 P060194 limited-shifting action, not a 2021-2025 overheating/shudder campaign.' },
      { kind: 'official-kia-powertrain-boundary', urls: [KIA_HTML_SOURCES.modelYear2024Powertrain.url, KIA_HTML_SOURCES.modelYear2025Powertrain.url, PDF_SOURCES.transmissionFluid.url], verifiedOn: '2026-08-08', observation: 'Kia documents the 2024 switch from the outgoing 7DCT to an 8-speed automatic and retains that powertrain for 2025.' },
    ],
    [IDS.ivt]: [{ kind: 'official-kia-emissions-campaign-visually-inspected', ...PDF_SOURCES.ivtCampaign, verifiedOn: '2026-08-08', observation: 'SC199 covers only a VIN-bound 2021 Seltos population and four exact DTCs with lack or delay of acceleration due to slippage.' }, { kind: 'official-kia-fluid-guide-visually-inspected', ...PDF_SOURCES.transmissionFluid, verifiedOn: '2026-08-08', observation: 'TRA046 identifies SP-CVT1 and limits flushing to transmission-replacement circumstances.' }],
    [IDS.cluster]: [{ kind: 'complete-manufacturer-communication-inventory-no-exact-package', documentCount: 169, verifiedOn: '2026-08-08', observation: 'No exact Seltos blank-cluster bulletin or software remedy appears in the complete frozen NHTSA manufacturer-communication inventory.' }],
    [IDS.isgPump]: [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGN_SOURCES.isgPump, PDF_SOURCES.isgPumpRecall.url], sha256: PDF_SOURCES.isgPumpRecall.sha256, visuallyInspectedPages: PDF_SOURCES.isgPumpRecall.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: '23V531/SC275 establishes the IVT ISG electric-oil-pump-controller fire risk, warning signs, park-outside instruction and dealer remedy; 23V578 is incorrect.' }],
    [IDS.lamps]: [{ kind: 'official-kia-headlamp-guidance-visually-inspected', ...PDF_SOURCES.headlamp, verifiedOn: '2026-08-08', observation: 'BOD055 separates normal headlamp condensation from water intrusion but does not prove a combined Seltos LED/DRL/fog-lamp defect across 2021-2025.' }],
    [IDS.theft]: [{ kind: 'official-kia-customer-satisfaction-programs-visually-inspected', urls: [PDF_SOURCES.theftSoftware.url, PDF_SOURCES.theftProtector.url], sha256: [PDF_SOURCES.theftSoftware.sha256, PDF_SOURCES.theftProtector.sha256], visuallyInspectedPages: { CS2309: PDF_SOURCES.theftSoftware.visuallyInspectedPages, CS2312: PDF_SOURCES.theftProtector.visuallyInspectedPages }, verifiedOn: '2026-08-08', observation: 'CS2309 and CS2312 establish the exact production boundary, software logic and dealer-installed ignition-cylinder protector without the frozen settlement and equipment generalizations.' }],
    [IDS.piston]: [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGN_SOURCES.pistonRing, PDF_SOURCES.pistonRecall.url, PDF_SOURCES.pistonOwnerLetter.url, PDF_SOURCES.pnssInspection.url], sha256: [PDF_SOURCES.pistonRecall.sha256, PDF_SOURCES.pistonOwnerLetter.sha256, PDF_SOURCES.pnssInspection.sha256], verifiedOn: '2026-08-08', observation: '25V099/SC336 establishes the 2021-2023 2.0L identity, quality-deviation mechanism, warnings, free inspection/PNSS/engine remedy and P1327; the frozen heat-treatment wording belonged to earlier 21V259.' }, { kind: 'official-earlier-recall-boundary-visually-inspected', ...PDF_SOURCES.earlierPistonRecall, verifiedOn: '2026-08-08', observation: '21V259 was a narrower 2021 Seltos heat-treatment recall and must not be substituted for the later 25V099 population.' }],
    [IDS.airbag]: [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGN_SOURCES.airbag, PDF_SOURCES.airbagRecall.url], sha256: PDF_SOURCES.airbagRecall.sha256, visuallyInspectedPages: PDF_SOURCES.airbagRecall.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: '23V830/SC289 exactly supports the 2024 side-curtain-airbag identity and states there is no advance warning.' }],
    [IDS.postRemedy]: [{ kind: 'official-nhtsa-audit-query-visually-inspected', urls: [PDF_SOURCES.auditQuery.url, PDF_SOURCES.pistonOwnerLetter.url, CAMPAIGN_SOURCES.pistonRing], sha256: [PDF_SOURCES.auditQuery.sha256, PDF_SOURCES.pistonOwnerLetter.sha256], verifiedOn: '2026-08-08', observation: 'AQ25001 reviewed 47 remedy complaints, not 400-plus stall complaints, and the Kia owner letter supplies the exact stop-driving/tow instruction.' }],
  };
  return map[row.id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Seltos');
  if (modelRows.length !== 9) throw new Error(`expected 9 Seltos rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS.slice().sort())) throw new Error('frozen Seltos ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const proposal = proposalFor(current);
    return {
      id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id),
      identityRule: 'Preserve every indexed Seltos ID, title, category, year set, trim set, engine set and publication state while correcting false campaign numbers, unsupported DTCs, unsafe advice and year-stretched source claims.',
      commerceDecision: commerceDecisionFor(current.id), changedFields: diffFields(before, proposal), evidence: evidenceFor(current),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Seltos',
    completionStatement: 'All nine frozen Kia Seltos records receive official-source adjudication. Five exact identities receive bounded rewrites; four broader indexed identities receive targeted safety cleanup and remain application blockers. Every page identity and publication state is preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: CLEANUP_IDS.slice().sort(), reason: 'Four Seltos titles/year spans remain broader than the exact primary packages. Their false claims are removed in the proposal, but independent identity review is required before any application.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All nine Seltos IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A blocker cannot conceal a false campaign number, false DTC, unsafe instruction, wrong transmission generation or unverified commerce; targeted cleanup removes those claims while preserving the page.',
      'Every cited official PDF was downloaded, SHA-256 hashed, read in full, rendered and visually inspected; the live verifier must reproduce each hash.',
      'All four campaigns in the complete Seltos recall inventory are mapped to existing identities; no new issue is added before the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 9 },
    observations: [
      { code: 'seltos-wrong-isg-campaign-number-corrected', severity: 'critical', recordIds: [IDS.isgPump], detail: 'The page said 23V578; the exact Seltos ISG electric-oil-pump recall is 23V531/SC275.' },
      { code: 'seltos-2024-2025-dct-mismatch-exposed', severity: 'critical', recordIds: [IDS.dct], detail: 'Kia says the 2024 turbo replaced the outgoing 7DCT with an 8-speed automatic, and the 2025 specification also lists 8AT.' },
      { code: 'seltos-ivt-scope-bounded', severity: 'critical', recordIds: [IDS.ivt], detail: 'SC199 is limited to certain 2021 vehicles, four exact DTCs and acceleration delay from slippage; routine fluid and Sport-mode advice was removed.' },
      { code: 'seltos-cluster-software-claim-removed', severity: 'critical', recordIds: [IDS.cluster], detail: 'No exact blank-cluster bulletin or software remedy exists in the complete 169-row Seltos manufacturer-communication inventory.' },
      { code: 'seltos-headlamp-drl-fog-aggregation-bounded', severity: 'critical', recordIds: [IDS.lamps], detail: 'BOD055 is headlamp moisture guidance, not proof of one LED headlamp/DRL/fog-lamp defect across 2021-2025.' },
      { code: 'seltos-audit-query-count-corrected', severity: 'critical', recordIds: [IDS.postRemedy], detail: 'AQ25001 reviewed 47 remedy complaints, not 400-plus stalling complaints, and does not document four fires.' },
      { code: 'seltos-false-dtcs-and-search-commerce-removed', severity: 'critical', recordIds: ALL_IDS.slice().sort(), detail: 'Only source-bound DTCs remain; all generic search URLs, unverified parts and unsupported related-issue links are removed from every proposal.' },
      { code: 'seltos-complete-recall-inventory-mapped', severity: 'methodology', recordIds: [IDS.piston, IDS.isgPump, IDS.airbag], campaignNumbers: Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY), detail: 'The complete frozen recall inventory contains four campaigns and every campaign is accounted for within an existing page identity.' },
      { code: 'all-seltos-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS.slice().sort(), detail: 'Every Seltos ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, expectedCampaigns: EXPECTED_CAMPAIGNS, kiaHtmlSources: KIA_HTML_SOURCES, pdfSources: PDF_SOURCES,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 5, targeted_safety_cleanup_pending_source: 4, total: 9 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { ALL_IDS, CAMPAIGN_SOURCES, CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, KIA_HTML_SOURCES, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_IDS, SNAPSHOT, actionFor, commerceDecisionFor, evidenceFor, proposalFor, reasonFor };
