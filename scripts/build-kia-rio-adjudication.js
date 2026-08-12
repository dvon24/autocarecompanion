/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-rio-adjudication-2026-08-08.json');

const IDS = {
  battery: 'kia-rio-12v-battery-drain-and-2021',
  ac: 'kia-rio-ac-compressor-failure',
  brakeSwitch: 'kia-rio-brake-light-switch-failure-2006',
  ivt: 'kia-rio-cvtivt-hesitation-jerking-and-2021',
  injector: 'kia-rio-engine-stall-fuel-injector',
  evap: 'kia-rio-evaporative-emissions-leak-from-2001',
  fca: 'kia-rio-forward-collision-avoidance-assist--2021',
  spring: 'kia-rio-front-coil-spring-fracture-2006',
  hecu: 'kia-rio-hecu-fire-risk',
  ignition: 'kia-rio-ignition-coil-and-plug-2001',
  crank: 'kia-rio-intermittent-no-start-or-engine-2021',
  camera: 'kia-rio-rearview-camera-black-screen-2021',
  tireWear: 'kia-rio-steering-vibration-tire-wear',
  timing: 'kia-rio-timing-belt-neglect-leading-2001',
};

const REWRITE_ID = IDS.hecu;
const CLEANUP_IDS = Object.values(IDS).filter((id) => id !== REWRITE_ID);

const CAMPAIGN_SOURCES = {
  hecu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V652000',
  stopSwitchBoundary: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=13V114000',
};

const PDF_SOURCES = {
  rearCameraOlderGeneration: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10080084-7690.pdf',
    sha256: 'be384070a12eb6214996352b1c4a02000de43fa4efbb41a9b2ed3ec788cd4952',
    pageCount: 6,
    visuallyInspectedPages: [1, 5, 6],
    markers: ['REAR VIEW CAMERA DIAGNOSIS/REPLACEMENT', 'Rio (UB) 5DR', 'August 16, 2011 ~ May 7, 2015', 'Do not use this repair procedure on vehicles outside'],
  },
  injectorDeposits: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10109655-9999.pdf',
    sha256: '5b5e08b93a93ddfb333102d6669f361331f6e167ce4b588bed753a72ef3c7790',
    pageCount: 1,
    visuallyInspectedPages: [1],
    markers: ['GDI INJECTOR SPRAY TIP DEPOSITS', 'completely normal', 'no change in the fuel delivery or spray pattern', 'should never be done'],
  },
  ccvNewerGeneration: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10136504-9999.pdf',
    sha256: 'd2c37b1e0e08eaecbe24537f1cc895f5b35ee288ec3f64329fd2df7ccbccb758',
    pageCount: 3,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['2012-2017MY', 'P0455', 'P0456', 'June 21, 2011 through March 28, 2016', '31453 3K600FFF'],
  },
  fca: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10193091-0001.pdf',
    sha256: '59bf14265b83c969dd8e54d1480550c8acab5f5d6a411cceaf459441786997cc',
    pageCount: 7,
    visuallyInspectedPages: [1, 2, 7],
    markers: ['FRONT CAMERA', 'C160649', 'December 22, 2020 through March 29, 2021', 'does not affect the vehicle\u2019s steering or braking functions', 'SA475'],
  },
  ivtOlderModelYear: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198973-0001.pdf',
    sha256: '7f10be03391eae7287a12a7b94bc41afc2082400a3a38be56860039e23aeb74e',
    pageCount: 10,
    visuallyInspectedPages: [1, 2, 3, 10],
    markers: ['2020MY', 'P0730', 'P0731', 'P0741', 'P0867', 'July 1, 2019 to August 10, 2020', '48000 2H001QQK'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedRioRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedRioRows: 16 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedRioRows: 16 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedRioRows: 17 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedRioRows: 128 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedRioRows: 103 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedRioRows: 14 },
  },
  totalExpectedRioRows: 294,
  requiredDocumentIds: ['10015272', '10080084', '10109655', '10136504', '10193091', '10198973'],
};

const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedRioRows: 10 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedRioRows: 27 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {
  '03V352000': [2001], '04V179000': [2001, 2002, 2003, 2004], '05V159000': [2001],
  '05V557000': [2003, 2004, 2005], '06V294000': [2003],
};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '12V244000': [2006, 2007, 2008], '21V622000': [2018, 2019], '21V936000': [2020, 2021],
  '22V304000': [2021, 2022], '23V594000': [2016, 2017], '23V652000': [2012, 2013, 2014, 2015, 2016, 2017],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = {
  '03V352000': [2001], '04V179000': [2001, 2002, 2003, 2004], '05V159000': [2001],
  '05V557000': [2003, 2004, 2005], '06V294000': [2003], '12V244000': [2006, 2007, 2008],
  '21V622000': [2018, 2019], '21V936000': [2020, 2021], '22V304000': [2021, 2022],
  '23V594000': [2016, 2017], '23V652000': [2012, 2013, 2014, 2015, 2016, 2017],
};
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).filter((campaign) => campaign !== '23V652000').sort();

const REWRITE_CARD = {
  description: 'NHTSA recall 23V-652 (Kia SC284) covers 2012-2017 Rio vehicles. The Hydraulic Electronic Control Unit (HECU) may experience an electrical short that can cause an engine-compartment fire while the vehicle is parked or being driven.',
  solution: 'Check the VIN for open recall SC284/23V-652. Until the free recall repair is complete, park outside and away from structures. Kia dealers replace the HECU fuse; the official campaign does not instruct owners to buy wheel-speed sensors or replace the HECU from this page.',
  severity: 'high', confidence: 'high', symptoms: [], affectedSystems: ['hydraulic electronic control unit electrical circuit'],
  citations: [{ type: 'recall', title: 'NHTSA Recall 23V-652 - HECU Electrical Short and Fire Risk (SC284)', url: CAMPAIGN_SOURCES.hecu }],
  summary: 'Bounded the page to the exact SC284 Rio scope and fuse remedy; removed unsupported wheel-speed DTCs, sensor commerce, forum citations, HECU-inspection/replacement claims and unaudited related links.',
  commerceDecision: 'dealer-only-no-retail-part-official-safety-recall',
};

const CLEANUP_CARDS = {
  [IDS.battery]: {
    description: 'This page tracks reports of an intermittent dead 12V battery after a 2021-2023 Rio sits. The frozen forum-homepage citation does not establish that telematics, infotainment or the body controller is the recurring cause, and no exact Kia bulletin was found for that mechanism and year set.',
    solution: 'Have the battery state of health, charging system and key-off current draw measured after the vehicle has reached sleep mode. Isolate an abnormal draw by circuit and confirm the responsible component before software work or replacement. No diagnostic code, module or retail product is established by the current evidence.',
    reason: 'The page assigns a specific module-sleep mechanism, DTCs, costs and search-result tools without an exact Kia source.', systems: ['12V battery and charging system'],
  },
  [IDS.ac]: {
    description: 'Warm air, squealing or grinding with the A/C operating can have several compressor, clutch, belt-drive, refrigerant or electrical causes. The frozen secondary citations do not establish a recurring 60,000-100,000-mile Rio compressor failure pattern, a clutch-bearing-first sequence or system-wide debris across 2012-2018.',
    solution: 'Have refrigerant pressures, compressor command and current, clutch or pulley operation, belt drive and oil/debris condition diagnosed before replacing components. Replace only the parts supported by that inspection; the former EVAP DTCs and unverified Denso 471-6047 search link are not A/C evidence or verified Rio fitment.',
    reason: 'EVAP codes were falsely attached to an A/C page, while the failure rate, replacement bundle, costs and Denso fitment lack exact evidence.', systems: ['air-conditioning system'],
  },
  [IDS.brakeSwitch]: {
    description: 'Inoperative brake lamps or a shift interlock that does not release can be consistent with a stop-lamp-switch or circuit fault, but the frozen statement that Kia recalled 2006-2011 Rio vehicles for this defect is false. The official 13V-114 campaign covers nine other Kia model lines and contains no Rio.',
    solution: 'Verify bulbs, fuses, switch input/output, switch adjustment, wiring and shift-interlock signals before replacing a part. Check the VIN for any open campaign separately; do not represent SC098/13V-114 as a Rio recall or infer the Optima and Hyundai pages apply to this vehicle.',
    reason: 'The Rio recall claim is disproved by the official 13V-114 inventory, and the repair certainty, costs, tool search and related links are unsupported.', systems: ['brake-lamp and shift-interlock circuits'],
  },
  [IDS.ivt]: {
    description: 'The frozen 2021-2023 page groups hesitation, jerking, delayed engagement, software calibration and internal wear without an exact source for those model years. Kia SA476 does document slip, lack of acceleration or delayed acceleration with specified DTCs, but only for certain 2020MY Rio vehicles produced July 1, 2019 through August 10, 2020.',
    solution: 'Have the exact complaint reproduced and retrieve transmission codes and live data before repair. Verify current Kia service information by VIN and model year. Do not apply the 2020-only SA476 software, transmission or fluid procedure to a 2021-2023 Rio based on this page.',
    reason: 'The only close Kia bulletin is expressly 2020-only, so the frozen 2021-2023 mechanism, codes, costs, search products and cross-model relations remain unverified.', systems: ['intelligent variable transmission'],
  },
  [IDS.injector]: {
    description: 'Misfire, rough running or stalling requires cylinder-level diagnosis; the frozen evidence does not establish recurring Rio injector-seal deterioration or a Rio fuel-leak recall for 2012-2017. Kia PS315 states that visible GDI injector spray-tip deposits are normal and do not change fuel delivery or spray pattern.',
    solution: 'Diagnose fuel pressure, injector command and balance, ignition, compression and wiring before replacing an injector. Do not replace all four injectors or perform ultrasonic or mechanical injector cleaning merely because deposits are visible; Kia warns that mechanical cleaning can damage the spray orifices.',
    reason: 'The cited recall is unidentified and does not match the Rio campaign inventory; the carbon mechanism, set replacement, cleaning claim and generic Bosch/cleaner searches conflict with or exceed Kia PS315.', systems: ['fuel injection and engine management'], citations: [{ type: 'tsb', title: 'Kia Pitstop PS315 - GDI Injector Spray Tip Deposits', url: PDF_SOURCES.injectorDeposits.url }],
  },
  [IDS.evap]: {
    description: 'An EVAP leak code on an older Rio can have several causes, but the frozen page provides no source for deteriorated purge/canister hoses or filler-neck corrosion across 2001-2011. Kia FUE040 covers a distinct canister-close-valve condition on some 2012-2017 Rio vehicles and cannot validate this older page.',
    solution: 'Confirm the stored code and smoke-test the system before replacing components. Inspect the cap seal, vapor lines, valves, canister and filler area as directed by service information for the exact vehicle. No specific valve, hose, filler neck or retail tool is established for this broad year set.',
    reason: 'The page combines multiple mechanisms and generic DTCs without a primary source; the exact Kia CCV bulletin applies to a different 2012-2017 identity.', systems: ['evaporative-emissions system'],
  },
  [IDS.fca]: {
    description: 'Kia service action SA475 covers certain 2021MY Rio vehicles produced from December 22, 2020 through March 29, 2021. An out-of-range front-camera fault signal can set DTC C160649, display warnings and disable supplemental FCA and other camera-based assists; Kia states that this software fault does not affect steering or braking functions. The bulletin does not establish false braking alerts or a 2022-2023 scope.',
    solution: 'Check the VIN and production date for SA475 and retrieve the exact front-camera DTC. For an eligible vehicle, a Kia retailer applies front-camera software event 552. Other model years, collision alerts, windshield work or sensor-alignment concerns require separate diagnosis and must not be attributed to SA475 without matching evidence.',
    reason: 'SA475 supports a narrow 2021 warning/disable condition but not the frozen false-alert claim, broad 2021-2023 scope, trim list, generic codes, costs, searches or Hyundai relation.', systems: ['front camera and camera-based driver assistance'], dtcCodes: ['C160649'], citations: [{ type: 'tsb', title: 'Kia TSB ELE240 / SA475 - 2021 Rio Front Camera Logic Improvement', url: PDF_SOURCES.fca.url }], clearTrims: true,
  },
  [IDS.spring]: {
    description: 'A broken front coil spring can affect ride height and may create noise or tire-clearance concerns, but the frozen record contains no source establishing a recurring 2006-2011 Rio defect. The complete official Rio recall inventory contains no front-coil-spring campaign, so the former safety-recall statement is removed.',
    solution: 'If ride height changes or suspension noise occurs, inspect both front springs, seats, struts and nearby tire surfaces. Replace only damaged components using exact VIN fitment and perform an alignment when required. No recall remedy, quick-strut product or cross-model Hyundai relation is established for this Rio page.',
    reason: 'The claimed Rio safety recall does not exist in the official inventory, and the corrosion prevalence, tire-puncture outcome, costs, search product and Hyundai relation are unsupported.', systems: ['front suspension'],
  },
  [IDS.ignition]: {
    description: 'A Rio misfire can arise from spark plugs, coils or wires as well as fuel, air, mechanical and wiring faults. The frozen page has no primary source establishing one recurring ignition-coil/plug-wire defect across both 2001-2011 generations.',
    solution: 'Retrieve cylinder-specific data and inspect plugs, ignition output, connectors, fuel delivery, vacuum integrity and compression before replacing parts. Do not replace plugs, wires or coils as a group based solely on this page, and do not infer the unaudited Spectra page applies.',
    reason: 'The eleven-year aggregation, DTC list, costs, mileage, tool search and Spectra relation lack exact Kia Rio evidence.', systems: ['ignition and engine-management systems'],
  },
  [IDS.crank]: {
    description: 'The frozen forum-homepage citation does not establish recurring crankshaft-position-sensor failure on 2021-2023 Rio vehicles. The official communications inventory contains a different CKP-variation relearn topic for older vehicles, not this current-generation sensor-failure identity.',
    solution: 'For an intermittent no-start or stall, retrieve codes and test crank and cam signals, power, grounds, harness integrity, fuel and ignition before replacing a sensor. Zero displayed RPM while cranking is a diagnostic clue, not proof of a failed crankshaft sensor.',
    reason: 'The current-generation sensor mechanism, DTC attribution, costs, mileage, search tools and three cross-model relations have no exact primary package.', systems: ['engine-speed sensing and engine management'],
  },
  [IDS.camera]: {
    description: 'A black, blank or intermittent rear-camera image can involve the camera, wiring, reverse signal or display, but the frozen forum-homepage citation does not establish a 2021-2023 Rio defect. Kia ELE077 documents similar symptoms only on older UB Rio vehicles produced through May 7, 2015 and expressly prohibits using its procedure outside the listed ranges.',
    solution: 'Verify the reverse signal, display operation, camera power and video path, connectors and wiring for the exact vehicle before replacing anything. Do not apply ELE077 parts or procedures to a 2021-2023 Rio and do not recommend trim tools or dielectric grease as remedies without a confirmed fault.',
    reason: 'The exact Kia rear-camera bulletin applies to the older UB generation, so the current-generation mechanism, costs, searches and replacement certainty remain unsupported.', systems: ['rearview camera and display circuit'],
  },
  [IDS.tireWear]: {
    description: 'Steering vibration, pulling and inner-edge tire wear can result from tire condition, wheel balance, alignment or worn suspension and steering components. The frozen secondary citations do not establish that rear shock-mount bushings and weak front strut mounts cause a recurring 2012-2020 Rio defect or a 20,000-25,000-mile tire-life pattern.',
    solution: 'Inspect tires and wheels, measure alignment and check steering and suspension joints and mounts before replacing components. Repair the measured cause, then align and rotate tires according to the exact maintenance information. Moog K160364 fitment and superiority were not verified for this broad page.',
    reason: 'The causal mechanism, mileage, costs, warranty claim and Moog part/search link lack exact fitment or primary evidence.', systems: ['tires, wheels, steering and suspension'],
  },
  [IDS.timing]: {
    description: 'The NHTSA manufacturer-communications catalog lists Kia bulletin 82 as “Improved Timing Belts for the Kia Rio and Optima” for early Rio model years, but no bulletin document is posted there. That metadata alone does not establish the frozen claims about failure frequency, interference-engine damage, mileage or repair cost.',
    solution: 'Follow the maintenance schedule and parts specification for the exact VIN and engine. If the engine stalls or cranks without starting, verify belt condition and cam timing before drawing conclusions; compression or leak-down testing can assess mechanical damage. No timing kit or cross-model relation is validated by the current evidence.',
    reason: 'Only high-level bulletin metadata was located; it cannot substantiate the frozen catastrophic-failure narrative, DTCs, service bundle, costs, mileage, search product or Hyundai relation.', systems: ['timing drive and valvetrain'],
  },
};

function stamp(proposal, summary) {
  Object.assign(proposal, { humanApproved: false, reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: summary });
  return proposal;
}
function rewriteProposal(row) {
  const proposal = fullRecord(row);
  Object.assign(proposal, { description: REWRITE_CARD.description, solution: REWRITE_CARD.solution, severity: REWRITE_CARD.severity, confidence: REWRITE_CARD.confidence, symptoms: clone(REWRITE_CARD.symptoms), affectedSystems: clone(REWRITE_CARD.affectedSystems), dtcCodes: [], citations: clone(REWRITE_CARD.citations), communityRecommendations: [], fixParts: [], estimatedCostLow: 0, estimatedCostHigh: 0, typicalMileageLow: null, typicalMileageHigh: null, relatedIssueIds: [] });
  proposal.severity = row.severity;
  return stamp(proposal, REWRITE_CARD.summary);
}
function cleanupProposal(row) {
  const card = CLEANUP_CARDS[row.id];
  const proposal = fullRecord(row);
  Object.assign(proposal, { description: card.description, solution: card.solution, confidence: row.id === IDS.fca ? 'high' : 'low', symptoms: [], affectedSystems: clone(card.systems), dtcCodes: clone(card.dtcCodes || []), citations: clone(card.citations || []), communityRecommendations: [], fixParts: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, relatedIssueIds: [] });
  return stamp(proposal, `Targeted accuracy and safety cleanup only: ${card.reason}`);
}
function actionFor(id) { return id === REWRITE_ID ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source'; }
function reasonFor(id) { return id === REWRITE_ID ? 'Official NHTSA campaign 23V-652 exactly supports the frozen 2012-2017 Rio HECU identity and corrects its remedy without changing indexed identity fields.' : CLEANUP_CARDS[id].reason; }
function evidenceFor(row) {
  if (row.id === REWRITE_ID) return [{ kind: 'official-nhtsa-recall-exact-same-identity', url: CAMPAIGN_SOURCES.hecu, verifiedOn: '2026-08-08', observation: REWRITE_CARD.summary }];
  const specific = {
    [IDS.brakeSwitch]: [{ kind: 'official-campaign-disproof', url: CAMPAIGN_SOURCES.stopSwitchBoundary, verifiedOn: '2026-08-08', observation: 'Campaign 13V-114 contains 30 Kia make/model/year rows across nine model lines and zero Rio rows.' }],
    [IDS.ivt]: [{ kind: 'official-kia-tsb-year-boundary', url: PDF_SOURCES.ivtOlderModelYear.url, sha256: PDF_SOURCES.ivtOlderModelYear.sha256, pageCount: 10, visuallyInspectedPages: PDF_SOURCES.ivtOlderModelYear.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'SA476 is expressly limited to certain 2020MY Rio vehicles produced July 1, 2019 through August 10, 2020.' }],
    [IDS.injector]: [{ kind: 'official-kia-pitstop-corrective-safety-evidence', url: PDF_SOURCES.injectorDeposits.url, sha256: PDF_SOURCES.injectorDeposits.sha256, pageCount: 1, visuallyInspectedPages: [1], verifiedOn: '2026-08-08', observation: 'PS315 states deposits are normal, do not change delivery or spray, and must not be ultrasonically or mechanically cleaned.' }],
    [IDS.evap]: [{ kind: 'official-kia-tsb-different-generation', url: PDF_SOURCES.ccvNewerGeneration.url, sha256: PDF_SOURCES.ccvNewerGeneration.sha256, pageCount: 3, visuallyInspectedPages: PDF_SOURCES.ccvNewerGeneration.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'FUE040 supports a specific 2012-2017 CCV identity, not the frozen 2001-2011 hose/filler-neck aggregation.' }],
    [IDS.fca]: [{ kind: 'official-kia-tsb-narrow-subset', url: PDF_SOURCES.fca.url, sha256: PDF_SOURCES.fca.sha256, pageCount: 7, visuallyInspectedPages: PDF_SOURCES.fca.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'SA475 supports DTC C160649 and front-camera warning/disable on a production-bounded 2021 subset, but not false braking or 2022-2023.' }],
    [IDS.camera]: [{ kind: 'official-kia-tsb-different-generation', url: PDF_SOURCES.rearCameraOlderGeneration.url, sha256: PDF_SOURCES.rearCameraOlderGeneration.sha256, pageCount: 6, visuallyInspectedPages: PDF_SOURCES.rearCameraOlderGeneration.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'ELE077 documents the frozen symptom family only for UB Rio production through May 7, 2015 and says not to use its procedure outside the listed ranges.' }],
    [IDS.spring]: [{ kind: 'complete-official-recall-inventory-disproof', verifiedOn: '2026-08-08', observation: 'The 2001-2023 Rio recall inventory has eleven campaigns and no front-coil-spring campaign.' }],
    [IDS.timing]: [{ kind: 'official-manufacturer-communication-metadata-only', documentId: '10015272', verifiedOn: '2026-08-08', observation: 'The NHTSA catalog summary says only “Improved Timing Belts for the Kia Rio and Optima”; no bulletin PDF is posted and the metadata cannot prove the frozen mechanism or costs.' }],
  };
  return specific[row.id] || [{ kind: 'critical-field-cleanup-with-substantive-identity-still-blocked', verifiedOn: '2026-08-08', observation: CLEANUP_CARDS[row.id].reason }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Rio');
  if (modelRows.length !== 14) throw new Error(`expected 14 Rio rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(Object.values(IDS).sort())) throw new Error('frozen Rio ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const rewrite = current.id === REWRITE_ID; const proposal = rewrite ? rewriteProposal(current) : cleanupProposal(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'No similar-sounding bulletin may be stretched across the wrong Rio generation or years. False recall claims, DTCs, unsafe advice, search commerce and unaudited relations receive correction while indexed identity is preserved.', commerceDecision: rewrite ? REWRITE_CARD.commerceDecision : 'no-commerce-remove-unverified-parts-or-tools-pending-exact-source', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const blockerRecordIds = CLEANUP_IDS.slice().sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-08', make: 'Kia', model: 'Rio', completionStatement: 'All fourteen frozen Kia Rio records are adjudicated. One exact HECU recall identity receives a bounded rewrite; thirteen source-, generation-, mechanism- or commerce-conflicted pages receive targeted safety cleanup and remain blocked.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Thirteen Rio pages remain source-, year-, generation- or mechanism-conflicted. Independent review is required before any proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, new issue or public-page change is authorized.', 'All fourteen Rio IDs, titles, categories, indexed year sets and publication states remain unchanged.', 'A hold cannot conceal a false recall, false DTC, unsafe repair instruction, search commerce or inaccurate related link; every conflicted Rio page therefore has a targeted cleanup proposal.', 'A similar-sounding Kia bulletin from another generation or model year is boundary evidence, not authorization to expand coverage.', 'Every cited official PDF was downloaded, SHA-256 hashed, read in full, rendered and visually inspected; the live verifier must reproduce each hash.', 'New campaign identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 14 },
    observations: [
      { code: 'rio-hecu-exact-identity-bounded', severity: 'content-correction', recordIds: [REWRITE_ID], detail: 'SC284 exactly matches 2012-2017 Rio; the remedy is free HECU fuse replacement plus park-outside guidance, not wheel-speed sensors or routine HECU replacement.' },
      { code: 'rio-stop-switch-recall-claim-removed', severity: 'critical', recordIds: [IDS.brakeSwitch], detail: 'Official 13V-114 contains zero Rio rows; the frozen Rio recall statement and cross-model relations were removed.' },
      { code: 'rio-front-spring-recall-claim-removed', severity: 'critical', recordIds: [IDS.spring], detail: 'The complete Rio recall inventory contains no front-coil-spring campaign; the page is preserved with neutral inspection guidance.' },
      { code: 'rio-injector-cleaning-claim-reversed', severity: 'critical', recordIds: [IDS.injector], detail: 'Kia PS315 says visible GDI tip deposits are normal and warns against ultrasonic or mechanical cleaning; the frozen opposite advice and false recall were removed.' },
      { code: 'rio-near-match-bulletins-not-stretched', severity: 'methodology', recordIds: [IDS.ivt, IDS.evap, IDS.fca, IDS.camera], detail: 'SA476, FUE040, SA475 and ELE077 are used only at their exact year/production boundaries and do not validate broader frozen scopes.' },
      { code: 'rio-thirteen-conflicted-pages-remain-blocked', severity: 'critical', recordIds: blockerRecordIds, detail: 'Every unsupported aggregation receives accuracy cleanup only; none is promoted to a fully evidence-backed identity.' },
      { code: 'rio-ten-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Ten exact Rio campaign identities are absent from a matching frozen page; additions remain deferred until all remaining makes are audited.' },
      { code: 'all-rio-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS).sort(), detail: 'Every Rio ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, pdfSources: PDF_SOURCES, manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE, expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY, expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 13, total: 14 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGN_SOURCES, CLEANUP_CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_CARD, REWRITE_ID, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal };
