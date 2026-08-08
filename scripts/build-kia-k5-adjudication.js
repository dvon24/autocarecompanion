/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-k5-adjudication-2026-08-08.json');

const REWRITE_IDS = {
  judder: 'kia-k5-dct-hesitation-2021',
  oilPump: 'kia-k5-dct-oil-pump-failure',
  fuelTank: 'kia-k5-fuel-tank-expansion',
};

const CITATION_REMOVAL_IDS = {
  infotainment: 'kia-k5-infotainment-blackout-2021',
  sunroof: 'kia-k5-panoramic-sunroof-rattle-2021',
  trunk: 'kia-k5-trunk-latch-sticking-2021',
};

const HOLD_IDS = {
  adas: 'kia-k5-adas-calibration-fault-2021',
  battery: 'kia-k5-battery-drain-no-start-after-sitting-telematics-module-sleep-issue',
  brakeBooster: 'kia-k5-brake-booster-vacuum-pump-noise-and-reduced-brake-assist-1-6t',
  doorLatch: 'kia-k5-door-handle-lock-actuator-failure-door-won-t-open-or-won-t-lock-unlock',
  epb: 'kia-k5-electronic-parking-brake-epb-warning-auto-hold-malfunction',
  phantomBraking: 'kia-k5-forward-collision-avoidance-assist-fca-phantom-braking-events',
  strutMount: 'kia-k5-front-suspension-strut-mount-bearing-noise-creak-pop-while-turning',
  heatedSeat: 'kia-k5-heated-and-ventilated-seat-malfunction-element-failure-or-fan-noise',
  blower: 'kia-k5-hvac-blower-motor-noise-failure-squeal-rattle-intermittent-fan',
  paint: 'kia-k5-paint-chipping-and-clear-coat-peeling-hood-and-roof-panel',
  wheelBearing: 'kia-k5-rear-wheel-bearing-premature-failure-and-humming-noise',
  oilConsumption: 'kia-k5-smartstream-g2-5-gdi-engine-piston-ring-oil-consumption-issue',
  steeringShaft: 'kia-k5-steering-column-intermediate-shaft-clunk-or-knock-low-speed-turns',
  knockSensor: 'kia-k5-theta-ii-knock-sensor-2021',
  tcu: 'kia-k5-transmission-control-unit-tcu-software-fault-causing-harsh-upshifts-or-limp-mode-8-speed-at',
  turboLeak: 'kia-k5-turbocharger-oil-feed-return-leak-1-6t-causing-burning-oil-smell-smoke',
  windshieldBracket: 'kia-k5-windshield-optical-rain-sensor-bracket-detachment-adas-auto-wipers-inoperative',
  wirelessCharger: 'kia-k5-wireless-phone-charging-pad-overheating-and-device-damage',
};

const CAMPAIGNS = {
  oilPump: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V760000',
  fuelTank: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V794000',
};

const EXPECTED_CAMPAIGNS = {
  oilPump: ['K5|2021', 'K5|2022', 'K5|2023'],
  fuelTank: ['K5|2021', 'K5|2022', 'K5|2023', 'K5|2024'],
};

const PDF_SOURCES = {
  judder: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10206957-0001.pdf',
    sha256: 'b896bd8c870ce6777bab22509d867c5dd8cfa2c49f1d6d1d23640b28a21674bd',
    visuallyInspectedPages: [1, 4],
    markers: ['2021MY~', 'K5 GT (DL3a)', '2.5L T-GDI', 'Dual Clutch Assembly'],
  },
  oilPump: {
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V760-3227.PDF',
    sha256: '64d2bb0ec43010f9e5ac1312234790c9d119ffe0ad2668f1198791f19aabea5b',
    visuallyInspectedPages: [2, 3],
    markers: ['2021-2023 Kia K5', 'electric oil pump', '46220-2N510', 'replace the transmission'],
  },
  fuelTank: {
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V794-5581.pdf',
    sha256: 'bdede1d800da52e44b44af01f11406693bde297e952ba709c5d319a05ef4e325',
    visuallyInspectedPages: [1, 2, 3],
    markers: ['2021-2024 KIA K5', '1.6L Turbocharged Gasoline Direct Injection', '59133-2H000', 'replace the check valve'],
  },
  radarAlignment: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200525-0001.pdf',
    sha256: 'dca820340f62a52e8d41257eee2d6b7105c5d6664bcfe0aeab1c235b514fdff7',
    visuallyInspectedPages: [1],
    markers: ['PS704', 'FRONT RADAR SENSOR MOUNTING', 'collision or other outside impact', 'Front Radar Sensor Alignment'],
  },
  hecu: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230494-0001.pdf',
    sha256: '354b0e3c428a3833ca8b5d5e518c982e8ee8779cc08f98390843baeb8cbfc075',
    visuallyInspectedPages: [1],
    markers: ['SC252', '22-23MY', 'K5 (DL3a)', 'internal brake fluid leak'],
  },
  sunroof: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10196858-0001.pdf',
    sha256: '5355e936db04c867b0375a02024fc3d18f0297636a4d170349b708ae8659dedf',
    visuallyInspectedPages: [1],
    markers: ['SA481', '2021MY', 'March 16, 2021 through April 22, 2021', 'left front bolt'],
  },
  blower: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006548-0001.pdf',
    sha256: 'a15d0313a7238b3b080ac019d258496f6c890ef5357540dcab1c2c54583ac5b4',
    visuallyInspectedPages: [1],
    markers: ['SC307', '2021-2022MY', '7 high-heat states', '40-ampere fuse'],
  },
  heatedSeat: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10180655-0001.pdf',
    sha256: 'e5795e444cb6977133b97c4cd5ba26cfcd1ce1d775154f3cc6a9287efd8cf388',
    visuallyInspectedPages: [1],
    markers: ['SA434', '2021MY', 'front passenger seat harness', 'March 27, 2020 through June 19, 2020'],
  },
  oilConsumption: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017109-0001.pdf',
    sha256: 'dc3cebacc706a0ed2ac45d8a40bc947c14d0bc94d2efdac915a84ac1c541c305',
    visuallyInspectedPages: [1, 9],
    markers: ['ENG 222', 'EXCESSIVE OIL CONSUMPTION', 'K5 (DL3a)', '2022'],
  },
  steeringBearing: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202227-0001.pdf',
    sha256: 'b019ad71ed57fff0d03a9d7ad50c17114de2de758dcb0165b29394f9b0ead28c',
    visuallyInspectedPages: [1],
    markers: ['CHA 111', 'K5', 'DL3a', '2021', 'worm shaft small bearing'],
  },
  smartKeyBattery: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10222115-0001.pdf',
    sha256: 'fc418284055c9a7ca00441509987653ac585f55e2de75ad5c406e44af44d0ff0',
    visuallyInspectedPages: [1],
    markers: ['SMART KEY BATTERY DRAIN', '2022MY', 'replace the batteries on both', 'key fobs'],
  },
  dctSoftware: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10232939-0001.pdf',
    sha256: '1ed9baf463ab9eef50e112b0e883abfc0f90128b36144d47bb75b84f6e90b4aa',
    visuallyInspectedPages: [1],
    markers: ['SA526', '2022-2023MY', '8-Speed DCT', 'P086800'],
  },
  eopLogic: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11010699-0001.pdf',
    sha256: '7c4a43c0aa4fcc378c7459acfa74307eb0a3876d9afeebdafad049c41a389c78',
    visuallyInspectedPages: [1, 3],
    markers: ['TRA 111', '2021-2023 MY', 'Theta III', 'P1C2D03'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedK5Rows: 143 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedK5Rows: 54 },
  },
  totalExpectedK5Rows: 197,
  requiredDocumentIds: ['10180655', '10196858', '10200525', '10202227', '10206957', '10222115', '10230494', '10232939', '11006548', '11010699', '11014912', '11017109'],
};

const FLAT_RECALL_SOURCE = {
  url: 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip',
  retrievedOn: '2026-08-07',
  archiveSha256: '59f15be5de0bde8768606fb03b1135e7fca5bc2c56041c7cfdac9b0d137e6a0f',
  extractedFile: 'FLAT_RCL_POST_2010.txt',
  extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70',
};

const EXPECTED_FLAT_RECALL_INVENTORY = {
  2021: ['21V164000', '21V447000', '21V519000', '22V760000', '23V149000', '25V794000'],
  2022: ['21V447000', '21V519000', '22V760000', '23V149000', '25V794000'],
  2023: ['22V760000', '23V149000', '25V493000', '25V794000'],
  2024: ['25V493000', '25V794000'],
  2025: ['25V351000', '25V493000'],
  2026: ['26V046000'],
};

const DEFERRED_CAMPAIGNS = ['21V164000', '21V447000', '21V519000', '23V149000', '25V351000', '25V493000', '26V046000'];

const REWRITE_CARDS = {
  [REWRITE_IDS.judder]: {
    description: 'Kia bulletin TRA100 documents clutch judder on some 2021 model year and later K5 GT vehicles equipped with the 2.5L T-GDI engine and 8-speed wet dual-clutch transmission. Kia defines the condition as body vibration, without steering-wheel shudder, during a controlled creep-driving test below 5 mph. The bulletin does not establish a general software defect across all K5 trims or recommend a transmission-fluid flush.',
    solution: 'Have a Kia dealer or qualified transmission specialist confirm the vehicle is a K5 GT with the 2.5L T-GDI wet DCT and perform Kia\'s KDS 8 Wet Type DCT Judder Test. Kia\'s procedure repeats the creep measurement five times and replaces the dual-clutch assembly only when the test indicates replacement. This is a fitment- and diagnostic-dependent internal transmission repair, so no retail clutch kit or universal ATF is recommended.',
    trims: ['GT'], engines: ['2.5L T-GDI'], commerceDecision: 'dealer-only-no-retail-part-technical-bulletin', severity: 'medium', confidence: 'high',
    symptoms: ['Body vibration during low-speed creep', 'Judder below approximately 5 mph without steering-wheel shudder'], affectedSystems: ['8-speed wet dual-clutch transmission', 'dual-clutch assembly'],
    citations: [{ type: 'tsb', title: 'Kia TSB TRA100 - 8-Speed Wet DCT Judder Evaluation', url: PDF_SOURCES.judder.url }],
    summary: 'Bounded the same low-speed DCT-judder identity to Kia TRA100, corrected applicability to K5 GT with 2.5L T-GDI, and removed unsupported software, fluid-flush, universal-ATF and aftermarket-clutch claims.',
  },
  [REWRITE_IDS.oilPump]: {
    description: 'NHTSA recall 22V760000 (Kia SC250) covers certain 2021-2023 K5 vehicles equipped with the 2.5L T-GDI engine and 8-speed dual-clutch transmission. A supplier soldering defect can cause an internal electric oil-pump circuit-board fault. The vehicle may chime, display “stop safely immediately,” illuminate the malfunction indicator light and then lose motive power when the transmission disengages its drive gears.',
    solution: 'Check the VIN for open recall 22V760000/SC250 and follow Kia\'s stop-safely warning if it appears. A Kia dealer inspects the vehicle, replaces the transmission when necessary and updates the transmission-control-unit software, free of charge under the recall. Although the recall report identifies oil-pump assembly 46220-2N510, this is not a retail DIY remedy; the campaign repair is VIN-specific and dealer-installed.',
    trims: ['GT'], engines: ['2.5L T-GDI'], commerceDecision: 'dealer-only-no-retail-part-safety-recall', severity: 'critical', confidence: 'high',
    symptoms: ['Audible warning chimes', '“Stop safely immediately” cluster message', 'Malfunction indicator light', 'Loss of motive power'], affectedSystems: ['8-speed dual-clutch transmission', 'electric oil pump', 'transmission control unit'],
    relatedIssueIds: ['kia-sorento-dct-oil-pump-failure'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 22V760000 - K5 DCT Electric Oil Pump', url: CAMPAIGNS.oilPump }, { type: 'recall', title: 'Part 573 Safety Recall Report 22V760', url: PDF_SOURCES.oilPump.url }],
    summary: 'Corrected the same DCT oil-pump identity to recall 22V760/SC250, removed the incorrect GT-Line applicability and aftermarket clutch commerce, and stated the VIN-specific dealer remedy.',
  },
  [REWRITE_IDS.fuelTank]: {
    description: 'NHTSA recall 25V794000 (Kia SC356) covers 2021-2024 K5 vehicles equipped with the 1.6L T-GDI engine. A deteriorated purge-control-system check valve can allow pressurized intake air into the fuel tank. The tank can expand, contact hot exhaust components and locally melt, which can cause a fuel leak and increase fire risk. Warning signs can include a popping sound near the tank, a check-engine light or rough running.',
    solution: 'Check the VIN for recall 25V794000/SC356. A Kia dealer replaces the check valve with the improved design, inspects the fuel tank for damage, replaces the tank when necessary and confirms the latest ECU software, free of charge. Do not buy a generic fuel tank or check valve from this page; the recall repair is VIN-, engine- and inspection-specific.',
    trims: [], engines: ['1.6L T-GDI'], commerceDecision: 'dealer-only-no-retail-part-safety-recall', severity: 'critical', confidence: 'high',
    symptoms: ['Popping sound from fuel-tank area', 'Check-engine light', 'Rough running', 'Expanded or leaking fuel tank'], affectedSystems: ['purge-control-system check valve', 'fuel tank', 'engine control unit'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 25V794000 - K5 Fuel Tank May Leak', url: CAMPAIGNS.fuelTank }, { type: 'recall', title: 'Part 573 Safety Recall Report 25V794', url: PDF_SOURCES.fuelTank.url }],
    summary: 'Replaced secondary reporting and generic fuel-tank commerce with the exact SC356 safety-recall scope, warnings and VIN-specific dealer remedy while retaining the indexed page identity.',
  },
};

const CITATION_REMOVAL_REASONS = {
  [CITATION_REMOVAL_IDS.infotainment]: 'The cited YouTube ID “abcd1234efg” is a generic example placeholder, not the claimed EricTheCarGuy K5 repair video. The complete 197-row official K5 bulletin inventory contains narrower phone-projection, radio-icon and head-unit campaigns but no package establishing this 2021-2025 blackout/reboot aggregation. The false citation and search commerce are removed in the proposal, while the substantive page remains blocked pending an exact source.',
  [CITATION_REMOVAL_IDS.sunroof]: 'The Reddit URL contains the placeholder post ID “xyz123” and could not be verified. Rendered Kia SA481 covers only a narrow March-April 2021 production population with an incorrectly installed left-front tracking bolt and a creak; it does not establish this 2021-2025 rattle-and-water-leak aggregation or compressed-air/sealant advice. The false citation and search commerce are removed, but the page remains blocked.',
  [CITATION_REMOVAL_IDS.trunk]: 'The cited YouTube ID “abcd1234efg” is a generic example placeholder, not the claimed K5 trunk-latch repair video. The complete official K5 communication inventory contains no exact trunk-latch package for the retained 2021-2025 identity. The false citation and generic Dorman search commerce are removed, while the substantive page remains blocked pending an exact source.',
};

const HOLD_REASONS = {
  [HOLD_IDS.adas]: 'Rendered PS704 supports front-radar mounting inspection after a collision or outside impact and alignment when required. It does not establish the page\'s broad 2021-2025 frequency claims, windshield-replacement mechanism, camera contamination theory, costs or replacement recommendation. The secondary-only row remains frozen and blocks application.',
  [HOLD_IDS.battery]: 'The exact K5 battery bulletin is for excessive discharge of the smart-key batteries, not the vehicle\'s 12V battery. No official K5 package in the complete 197-row inventory establishes a telematics or infotainment module failing to sleep across 2021-2023. The CarComplaints-only mechanism remains frozen and blocks application.',
  [HOLD_IDS.brakeBooster]: 'No exact official K5 package was found for the retained 2021-2024 electric vacuum-pump/reduced-brake-assist identity. The page has no citation and names unverified part 59100-L2000 plus safety-critical costs and replacement advice. It remains frozen and blocks application.',
  [HOLD_IDS.doorLatch]: 'No exact official K5 package was found for the retained 2021-2024 door-handle/lock-actuator aggregation. The uncited actuator, latch, linkage and lubrication claims remain frozen and block application.',
  [HOLD_IDS.epb]: 'Rendered SC252 supports a narrow VIN-bound 2022-2023 K5 HECU population with an internal brake-fluid leak that can disable EPB and Auto-Hold. It does not support this page\'s 2021-2024 actuator, caliper-wiring and generic-software diagnosis. The year and failure-mechanism conflation remains frozen and blocks application.',
  [HOLD_IDS.phantomBraking]: 'The complete official K5 bulletin inventory contains no DAS-007 package or exact K5 phantom-braking campaign matching this 2021-2024 aggregation. The page\'s asserted software updates, environmental prevalence and recommendation to disable FCA are safety-critical and uncited, so the row remains frozen and blocks application.',
  [HOLD_IDS.strutMount]: 'No exact official K5 bulletin was found for a 2021-2024 upper-strut-mount/bearing defect. The page is uncited and asserts premature wear, moisture intrusion and a replacement/alignment remedy without primary evidence. It remains frozen and blocks application.',
  [HOLD_IDS.heatedSeat]: 'Rendered SA434 covers only some early-production 2021 K5 vehicles with an incorrect front-passenger ventilated-seat harness that can cause the ventilation feature to time out. It does not support the page\'s 2021-2024 front/rear heater-element and fan-failure aggregation or part numbers 88350-L3010/88360-L3010. The row remains frozen and blocks application.',
  [HOLD_IDS.blower]: 'Rendered SC307 covers only certain 2021-2022 K5 vehicles from a narrow production range in seven high-heat states and remedies damaged multi-fuse terminals by relocating a 40-amp blower fuse. It does not support the page\'s 2021-2024 squeal, bearing, debris, resistor and generic motor-replacement aggregation. The row remains frozen and blocks application.',
  [HOLD_IDS.paint]: 'No Kia/NHTSA primary package in the complete K5 inventory establishes insufficient paint-film thickness, platform-wide adhesion failure, color prevalence, warranty entitlement or the stated repair costs across 2021-2024. The uncited row remains frozen and blocks application.',
  [HOLD_IDS.wheelBearing]: 'No exact official K5 package was found for a 2021-2024 rear-wheel-bearing defect. The page is uncited and asserts press-fit tolerances, early mileage, broad FWD/AWD prevalence and part 52730-L1000 without fitment proof. It remains frozen and blocks application.',
  [HOLD_IDS.oilConsumption]: 'Rendered ENG222 lists K5 (DL3a) only for model year 2022, not the frozen 2021-2024 scope. It provides an oil-consumption diagnosis/cleaning flow and does not establish piston-ring sealing tolerances as the cause, blue-smoke prevalence, TSB ENG023 or the stated short-block prices. The row remains frozen and blocks application.',
  [HOLD_IDS.steeringShaft]: 'Rendered CHA111 covers only certain 2021 K5 vehicles and identifies scraping noise from foreign material in the C-MDPS worm-shaft small bearing; it does not establish a 2021-2023 intermediate-shaft/coupler clunk identity. The component and year mismatch remains frozen and blocks application.',
  [HOLD_IDS.knockSensor]: 'The page labels the K5 2.5L engine as “Theta II,” while rendered Kia transmission guidance identifies the 2.5L T-GDI K5 engine as Theta III. No exact K5 SA508 knock-sensor package was found, and the page adds unsupported extended-warranty and sensor-replacement claims. The incorrect engine metadata is safety-critical and remains frozen pending correction.',
  [HOLD_IDS.tcu]: 'Rendered TRA111 applies to 2021-2023 K5 vehicles with the 2.5L T-GDI Theta III engine and 8-speed DCT, with specific EOP DTCs; SA526 is limited to a narrow August 2022 production window. The page instead calls the unit a conventional 8AT paired with 2.5T, cites unverified TR-004, includes 2024 and adds valve-body claims. It remains frozen and blocks application.',
  [HOLD_IDS.turboLeak]: 'No exact official K5 package was found for a 2021-2024 1.6T turbo oil-feed/return-line defect. The page is uncited and prescribes line, banjo-bolt and seal replacement without verified part or fitment evidence. It remains frozen and blocks application.',
  [HOLD_IDS.windshieldBracket]: 'Rendered PS704 concerns the front bumper radar mounting bracket after outside impact, not a windshield optical/rain-sensor bracket detaching across 2021-2024. No exact K5 primary package supports the combined camera, ADAS and auto-wiper identity, so the row remains frozen and blocks application.',
  [HOLD_IDS.wirelessCharger]: 'The complete official K5 communication inventory contains no exact package for 2021-2023 wireless charging-pad overheating or device damage. The page\'s thermal-management mechanism, software-update claim and compensation advice are uncited and remain frozen pending primary evidence.',
};

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card, make: current.make, model: current.model, years: current.years,
    category: current.category, title: current.title, trims: card.trims, engines: card.engines,
    dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null,
    typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '',
    reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: card.summary, relatedIssueIds: card.relatedIssueIds || current.relatedIssueIds,
  });
}

function citationRemovalProposal(current) {
  return fullRecord({
    ...current,
    citations: [],
    communityRecommendations: [],
    fixParts: [],
    commerceDecision: 'unresolved-no-retail-link-until-primary-source-correction',
    humanApproved: false,
    reviewedOn: '2026-08-08',
    contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: 'Removed an unverifiable placeholder citation and search-style commerce; substantive content remains blocked pending exact primary-source correction.',
  });
}

function evidenceFor(row) {
  if (row.id === REWRITE_IDS.judder) return [{ kind: 'official-tsb-exact-same-identity', url: PDF_SOURCES.judder.url, sha256: PDF_SOURCES.judder.sha256, visuallyInspectedPages: PDF_SOURCES.judder.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'TRA100 establishes 2021MY+ K5 GT 2.5L T-GDI wet-DCT creep judder, KDS evaluation and conditional dual-clutch replacement.' }];
  if (row.id === REWRITE_IDS.oilPump) return [{ kind: 'official-safety-recall-exact-same-identity', urls: [CAMPAIGNS.oilPump, PDF_SOURCES.oilPump.url], sha256: PDF_SOURCES.oilPump.sha256, visuallyInspectedPages: PDF_SOURCES.oilPump.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: '22V760/SC250 establishes the 2021-2023 K5 2.5T DCT oil-pump fault, warning sequence, loss-of-power risk and dealer remedy.' }];
  if (row.id === REWRITE_IDS.fuelTank) return [{ kind: 'official-safety-recall-exact-same-identity', urls: [CAMPAIGNS.fuelTank, PDF_SOURCES.fuelTank.url], sha256: PDF_SOURCES.fuelTank.sha256, visuallyInspectedPages: PDF_SOURCES.fuelTank.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: '25V794/SC356 establishes the 2021-2024 1.6T check-valve, tank-expansion, melting, leak/fire-risk and dealer remedy identity.' }];
  if (row.id === CITATION_REMOVAL_IDS.sunroof) return [{ kind: 'false-placeholder-citation-and-official-scope-conflict', url: PDF_SOURCES.sunroof.url, sha256: PDF_SOURCES.sunroof.sha256, visuallyInspectedPages: PDF_SOURCES.sunroof.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: CITATION_REMOVAL_REASONS[row.id] }];
  if (row.id === CITATION_REMOVAL_IDS.infotainment || row.id === CITATION_REMOVAL_IDS.trunk) return [{ kind: 'false-placeholder-citation', verifiedOn: '2026-08-08', observation: CITATION_REMOVAL_REASONS[row.id] }];
  const mapping = {
    [HOLD_IDS.adas]: PDF_SOURCES.radarAlignment,
    [HOLD_IDS.battery]: PDF_SOURCES.smartKeyBattery,
    [HOLD_IDS.epb]: PDF_SOURCES.hecu,
    [HOLD_IDS.heatedSeat]: PDF_SOURCES.heatedSeat,
    [HOLD_IDS.blower]: PDF_SOURCES.blower,
    [HOLD_IDS.oilConsumption]: PDF_SOURCES.oilConsumption,
    [HOLD_IDS.steeringShaft]: PDF_SOURCES.steeringBearing,
    [HOLD_IDS.knockSensor]: PDF_SOURCES.eopLogic,
    [HOLD_IDS.tcu]: PDF_SOURCES.eopLogic,
    [HOLD_IDS.windshieldBracket]: PDF_SOURCES.radarAlignment,
  };
  const source = mapping[row.id];
  if (source) return [{ kind: 'official-source-scope-or-component-conflict', url: source.url, sha256: source.sha256, visuallyInspectedPages: source.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  return [{ kind: 'complete-official-inventory-no-exact-package', datasetRowsReviewed: MFR_COMMUNICATIONS_SOURCE.totalExpectedK5Rows, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'K5');
  if (modelRows.length !== 24) throw new Error(`expected 24 K5 rows, found ${modelRows.length}`);
  for (const id of Object.values({ ...REWRITE_IDS, ...CITATION_REMOVAL_IDS, ...HOLD_IDS })) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen K5 ID ${id}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const citationReason = CITATION_REMOVAL_REASONS[current.id];
    const proposal = card ? rewriteProposal(current, card) : citationReason ? citationRemovalProposal(current) : before;
    const action = card ? 'rewrite_same_identity' : citationReason ? 'remove_false_citation_and_search_commerce_pending_source' : 'keep_published_pending_source';
    const reason = card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years or status.' : citationReason || HOLD_REASONS[current.id];
    return {
      id: current.id, model: current.model, action, reason,
      identityRule: 'No source may change an indexed page identity. A different model, component, year boundary or failure outcome requires a hold or a later separately approved identity change.',
      commerceDecision: card ? card.commerceDecision : citationReason ? 'unresolved-no-retail-link-until-primary-source-correction' : 'unchanged-commerce-pending-exact-source-and-fitment',
      changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const blockerRecordIds = [...Object.values(CITATION_REMOVAL_IDS), ...Object.values(HOLD_IDS)].sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'K5',
    completionStatement: 'All 24 frozen Kia K5 records are adjudicated against 197 official manufacturer communications and the complete recall inventory. Three exact identities receive bounded no-retail rewrites, three known placeholder citations/search-commerce sets receive explicit removal proposals, and eighteen unresolved rows remain byte-for-byte holds.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Twenty-one live K5 rows remain unsupported, scope-conflicted, component-conflicted or only partially corrected. Independent manual correction and approval are required before any K5 proposal is applied.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All 24 K5 IDs, titles, categories, indexed years and publication states remain unchanged.',
      'Only exact same-identity official sources may authorize a rewrite; all unresolved records block application.',
      'Known fabricated placeholder citations cannot remain hidden inside a byte-for-byte hold; their proposal explicitly removes the citation and search commerce while retaining the unresolved blocker.',
      'A rewrite that names a retail-replaceable part requires a verified direct product link with exact part-number and fitment evidence; recall and internal-transmission remedies carry an explicit dealer-only/no-retail disposition.',
      'New issue identities and the missing 2024 fuel-tank year expansion remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 24 },
    observations: [
      { code: 'k5-three-exact-identities-bounded', severity: 'content-correction', recordIds: Object.values(REWRITE_IDS), detail: 'TRA100, 22V760/SC250 and 25V794/SC356 exactly support the DCT judder, DCT oil-pump and fuel-tank identities without retail commerce.' },
      { code: 'k5-three-placeholder-citations-explicitly-removed', severity: 'critical-correction', recordIds: Object.values(CITATION_REMOVAL_IDS), detail: 'The two YouTube citations use the generic example ID abcd1234efg and the sunroof Reddit URL uses placeholder xyz123. Their proposals remove those citations and all search commerce, but remain blockers.' },
      { code: 'k5-adjacent-bulletins-not-stretched', severity: 'critical', recordIds: [HOLD_IDS.battery, HOLD_IDS.epb, HOLD_IDS.heatedSeat, HOLD_IDS.blower, HOLD_IDS.oilConsumption, HOLD_IDS.steeringShaft, HOLD_IDS.tcu], detail: 'Rendered primary packages cover different components, narrow VIN/build populations or narrower years; none is stretched to validate the broader live page.' },
      { code: 'k5-theta-and-transmission-metadata-conflicts', severity: 'critical', recordIds: [HOLD_IDS.knockSensor, HOLD_IDS.tcu], detail: 'Official Kia material identifies the 2.5T K5 engine as Theta III and its transmission as an 8-speed DCT, contradicting the live Theta II and conventional-8AT claims.' },
      { code: 'k5-oil-pump-unrelated-audi-link-removed', severity: 'deeplink-correction', recordIds: [REWRITE_IDS.oilPump], detail: 'The oil-pump page incorrectly related to an Audi Q5 mechatronic page. The proposal retains only the exact Sorento DCT oil-pump sibling.' },
      { code: 'k5-seven-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Seven distinct K5 recall identities are not represented by the 24 frozen pages. They are recorded for the later additions phase rather than introduced during this audit.' },
      { code: 'k5-fuel-tank-2024-expansion-deferred', severity: 'coverage-deferred', recordIds: [REWRITE_IDS.fuelTank], detail: 'Recall 25V794 includes 2024 K5, while the frozen indexed year set ends at 2023. The rewrite preserves indexed years; adding 2024 requires a separately approved later coverage expansion.' },
      { code: 'all-k5-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every frozen K5 ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    pdfSources: PDF_SOURCES,
    campaigns: { urls: CAMPAIGNS, expectedModelYears: EXPECTED_CAMPAIGNS },
    manufacturerCommunicationsDataset: MFR_COMMUNICATIONS_SOURCE,
    flatRecallDataset: { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY },
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 3, remove_false_citation_and_search_commerce_pending_source: 3, keep_published_pending_source: 18, total: 24 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGNS, CITATION_REMOVAL_IDS, CITATION_REMOVAL_REASONS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, MFR_COMMUNICATIONS_SOURCE, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, citationRemovalProposal, evidenceFor, rewriteProposal };
