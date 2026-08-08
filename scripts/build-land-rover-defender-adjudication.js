/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-defender-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const PIVI_ID = 'land-rover-defender-pivi-pro-issues-2020';
const AIR_SUSPENSION_ID = 'land-rover-defender-air-suspension-2020';
const DIFF_BREATHER_ID = 'land-rover-defender-diff-breather-2020';
const REAR_GLASS_ID = 'land-rover-defender-rear-window-crack-2020';

const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';

const PDF_SOURCES = {
  airSpring: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10188074-0001.pdf',
    nhtsaDocumentId: '10188074',
    jlrReference: 'SSM 75281',
    pages: 2,
    sha256: '20636c507bc8c18fe8c1b9307df5738eb944296ec24a85cc0a1e15cdc55d3e1a',
    visualInspection: 'all 2 pages rendered and inspected',
  },
  wading: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10183946-0001.pdf',
    nhtsaDocumentId: '10183946',
    jlrReference: 'SSM 75160',
    pages: 2,
    sha256: '99c15530bae84c319d550b496007e8180b8f826372d1879b4afede8b278108f9',
    visualInspection: 'all 2 pages rendered and inspected',
  },
  rearGlass: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239020-0001.pdf',
    nhtsaDocumentId: '10239020',
    jlrReference: 'JLR Technical Update - rear tailgate glass impact damage',
    pages: 4,
    sha256: '33ca271a40a09bc209626d8b4bfd50451590996fcf6cee23ed8962ef14a68537',
    visualInspection: 'all 4 pages rendered and inspected',
  },
  piviConnectivity: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11028600-0001.pdf',
    nhtsaDocumentId: '11028600',
    jlrReference: 'January 2026 Pivi Wireless CarPlay / Android Auto Connectivity',
    pages: 1,
    sha256: '056afdeef96bb99a8d8c42b5084ad3da1ce857add113e21e6d8d29937d53d3d9',
    visualInspection: 'the single page rendered and inspected',
  },
  piviN795: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239026-0001.pdf',
    nhtsaDocumentId: '10239026',
    jlrReference: 'Global Service Action N795',
    pages: 5,
    sha256: '787baa39566a6ee6d2a6848c9611758ab399f7580dba3167077dd5afe87d9bbd',
    visualInspection: 'all 5 pages rendered and inspected',
  },
};

const PIVI_RECALL = {
  campaign: '25V016000',
  manufacturerCampaign: 'N972',
  url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V016000',
  defenderYears: [2023, 2024],
  expectedMarkers: ['touchscreen in the center console may go blank', 'rearview camera', 'update the touchscreen software'],
  liveVerifiedOn: REVIEW_DATE,
};

const BULLETIN_INVENTORY = {
  source: NHTSA_DATASET_URL,
  rawDefenderRows: 983,
  periodCounts: {
    '1995-1999': 24,
    '2000-2004': 12,
    '2005-2009': 0,
    '2010-2014': 1,
    '2015-2019': 37,
    '2020-2024': 648,
    '2025-2026': 261,
  },
  sourceFiles: [
    { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', length: 3443097, sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db' },
    { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', length: 8952754, sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264' },
    { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', length: 5457880, sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b' },
    { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', length: 17332775, sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387' },
    { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', length: 144450847, sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e' },
    { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', length: 125521629, sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf' },
    { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', length: 77786229, sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c' },
  ],
  legacyCandidateRows: {
    '14cux': ['50659', '52189', '601617', '605043'],
    swivelSeal: ['52221', '602375'],
    rearMainCrucifix: ['10001056'],
  },
};

const ALL_CAMPAIGNS = [
  '06E043000', '21V424000', '21V435000', '21V499000', '21V584000', '21V668000',
  '22V523000', '23V044000', '23V137000', '23V789000', '24E102000', '24V450000',
  '24V678000', '25V016000', '26V163000', '26V248000', '26V263000', '26V389000',
  '95V099000', '96V108000',
];
const MAPPED_CAMPAIGNS = ['25V016000'];
const DEFERRED_CAMPAIGNS = ALL_CAMPAIGNS.filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign));
const RECALL_INVENTORY = {
  source: RECALL_DATASET_URL,
  rawDefenderRows: 294,
  uniqueCampaignYearModelRows: 49,
  campaignCount: 20,
  campaigns: ALL_CAMPAIGNS,
  mappedCampaigns: MAPPED_CAMPAIGNS,
  deferredCampaigns: DEFERRED_CAMPAIGNS,
  sourceFiles: [
    { name: 'FLAT_RCL_PRE_2010.txt', defenderRows: 7, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
    { name: 'FLAT_RCL_POST_2010.txt', defenderRows: 287, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
  ],
};

function yearRange(row) {
  const years = row.years || [];
  if (!years.length) return 'the indexed model years';
  return years.length === 1 ? String(years[0]) : `${years[0]}-${years[years.length - 1]}`;
}

function categorySafetyInstruction(row) {
  if (row.category === 'brakes') {
    return 'If brake assist changes, the pedal becomes unusually hard, or braking performance is reduced, do not drive the vehicle; arrange a tow and have the exact vacuum, hydraulic and mechanical fault diagnosed from the VIN and engine configuration.';
  }
  if (row.category === 'engine' || row.category === 'cooling') {
    return 'If there is low oil pressure, uncontrolled engine speed, overheating, heavy knock, smoke, or sudden power loss, shut the engine down when safe and arrange a tow. Use the factory procedure for the exact engine serial and market before opening the engine, selecting fluids, changing emissions hardware, or ordering parts.';
  }
  if (row.category === 'transmission' || row.category === 'drivetrain') {
    return 'If drive is lost, a shaft or gearbox is noisy, or shifting deteriorates, stop using the vehicle before secondary damage occurs. Identify the exact gearbox, transfer case and axle build codes and use the applicable factory diagnosis before ordering components, choosing lubricant, or applying torque and preload values.';
  }
  if (row.category === 'fuel') {
    return 'If fuel is leaking, shut the engine off, keep ignition sources away and arrange professional inspection. Do not replace pumps, sensors, injectors or hoses from a generic diagnosis; confirm fuel pressure, air ingress and the exact engine/fuel-system specification first.';
  }
  if (row.category === 'body') {
    return 'Have structural corrosion or damaged glass inspected in person by a qualified body, chassis or glass specialist before ordering panels or authorizing repair. Do not drill, weld, galvanize, seal or promise warranty coverage from a generic page; the safe repair depends on the exposed metal, attachment points and vehicle configuration.';
  }
  if (row.category === 'suspension' || row.category === 'steering') {
    return 'If ride height, steering, wheel containment or axle sealing is affected, limit use and obtain a component-level inspection. Use the factory procedure and current VIN-specific parts catalog before replacing springs, dampers, seals, bearings or housings.';
  }
  return 'Confirm the exact symptom, VIN/build configuration and fault data before replacing parts or applying a repair. Use the current factory diagnostic workflow for the specific vehicle; do not treat a generic article, DTC list, service interval or forum procedure as proof of cause.';
}

function genericCleanup(row) {
  return {
    description: `${row.title} can have more than one cause on ${yearRange(row)} Defender vehicles. The currently verified JLR/NHTSA material does not establish one universal cause, model-year scope or repair prescription for every vehicle represented by this indexed page. The page identity is preserved, but the former secondary-source diagnosis, DTC attribution, part claims, service intervals and permanence claims are not treated as verified.`,
    solution: categorySafetyInstruction(row),
    citations: [],
    contentUpdateSummary: 'Removed unsupported secondary-source diagnosis, DTCs, repair specifications, conversion advice and commerce pending an exact primary source and fitment proof.',
  };
}

function specialCleanup(row) {
  if (row.id === AIR_SUSPENSION_ID) {
    return {
      description: 'JLR SSM 75281 documents a narrower condition on 2020-2021 Defender vehicles: a front air-spring leak can leave the vehicle leaning after it has been parked. The document does not attribute the leak to off-road use, mud around height sensors, valve-block contamination or rock punctures, and it does not establish the frozen 2020-2025 all-year causation claim.',
      solution: 'For the SSM 75281 symptom, a trained technician should confirm a front-air-spring leak at off-road height with leak-detection spray. JLR directs replacement of a confirmed leaking shock-absorber/air-spring assembly, or an assembly with the specified 1 August through 20 November 2020 manufacturing date, using the latest VIN-applicable EPC part. If those checks do not match, continue TOPIx diagnosis; do not buy a universal air-suspension part from this page.',
      citations: [{ type: 'tsb', title: 'JLR SSM 75281 - Defender and Discovery Front Air Spring Air Leak', url: PDF_SOURCES.airSpring.url }],
      contentUpdateSummary: 'Bounded the page to JLR SSM 75281 and removed unsupported off-road causation, DTC, sensor, valve-block, rock-damage and universal-year claims.',
    };
  }
  if (row.id === DIFF_BREATHER_ID) {
    return {
      description: 'The JLR document previously associated with wading is SSM 75160. It addresses water entering the passenger compartment through body sealing, blanking plates, harness grommets, floor patches and mounting holes; it does not discuss differential-breather blockage. The complete Defender communications inventory did not provide an exact primary source for the frozen differential-breather claim.',
      solution: 'Do not install an extended breather kit or infer contaminated differential oil from this page alone. After wading, follow the owner and workshop information for the exact vehicle; if lubricant contamination, leakage, noise or driveline symptoms are suspected, have the axle and differential inspected and the fluid evaluated before further use.',
      citations: [{ type: 'tsb', title: 'JLR SSM 75160 - Water Ingress after Wading (body sealing, not differential breathers)', url: PDF_SOURCES.wading.url }],
      contentUpdateSummary: 'Corrected the false wading-source association and removed unsupported differential-breather, extended-kit and fluid-service claims.',
    };
  }
  if (row.id === REAR_GLASS_ID) {
    return {
      description: 'The retrieved JLR technical update concerns rear tailgate glass, not rear quarter glass. For 2020-2023 Defender vehicles it says tempered tailgate glass may remain in place after an impact until cabin pressure from closing a door makes it fall away, and that broken tailgate glass is almost always due to impact damage. It does not support the frozen spontaneous-quarter-window, updated-glass-specification, adhesive-process or automatic-warranty claims.',
      solution: 'Have the exact glass panel inspected for an impact point and stress lines using the JLR fixed-window-glass diagnostic guidance. Do not promise warranty replacement or attribute a quarter-window crack to a manufacturing change without VIN-specific JLR authorization and evidence for that panel.',
      citations: [{ type: 'tsb', title: 'JLR Technical Update - Defender Rear Tailgate Glass Shattered Due to Impact Damage', url: PDF_SOURCES.rearGlass.url }],
      contentUpdateSummary: 'Corrected rear-tailgate versus quarter-glass scope and removed unsupported spontaneous-cracking, warranty, revised-glass and adhesive claims.',
    };
  }
  return genericCleanup(row);
}

function piviRewrite() {
  return {
    description: 'JLR documents several bounded Pivi conditions rather than one universal hardware defect. Global Service Action N795 covers specific 2020-2022 Defender vehicles that cannot complete VDC/Pivi Software Over The Air updates and require a wired intervention. A January 2026 JLR update covers 20MY-on Defender wireless CarPlay/Android Auto disconnections near dense Wi-Fi or other RF sources and identifies OS4.4.0 as the software improvement. Separately, NHTSA campaign 25V016/N972 covers certain 2023-2024 Defender vehicles whose touchscreen may be blank at startup and therefore fail to display the rearview camera image.',
    solution: 'Match the repair to the symptom and VIN. For wireless projection loss, install the latest available SOTA software, including OS4.4.0 where applicable, and use the Pivi Infotainment Health Check workflow. Vehicles identified for N795 need the JLR wired TCU/GWM/Pivi recovery procedure rather than repeated SOTA attempts. For a blank startup screen or missing rearview image on a 2023-2024 vehicle, check the VIN for 25V016/N972; the dealer software update is free. Do not replace Pivi hardware or use device deletion/re-pairing as a universal repair without the applicable diagnostic result.',
    citations: [
      { type: 'service-action', title: 'JLR Global Service Action N795 - Pivi/VDC Software Updates', url: PDF_SOURCES.piviN795.url },
      { type: 'tsb', title: 'JLR January 2026 - Pivi Wireless CarPlay / Android Auto Connectivity', url: PDF_SOURCES.piviConnectivity.url },
      { type: 'recall', title: 'NHTSA 25V016 / JLR N972 - Blank Touchscreen and Missing Rearview Camera Image', url: PIVI_RECALL.url },
    ],
    symptoms: [
      'Pivi or VDC Software Over The Air update repeatedly fails',
      'Wireless Apple CarPlay or Android Auto disconnects near dense Wi-Fi or RF sources',
      'Touchscreen is blank at startup and the rearview camera image is unavailable on an affected 2023-2024 vehicle',
    ],
    contentUpdateSummary: 'Separated N795 wired-update failures, OS4.4.0 wireless-projection connectivity and safety recall 25V016/N972 without asserting a universal hardware defect.',
  };
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = row.id === PIVI_ID ? piviRewrite() : specialCleanup(row);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.symptoms = content.symptoms || [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = content.citations;
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.contentUpdateSummary;
  proposal.relatedIssueIds = [];
  if (row.id !== PIVI_ID) proposal.confidence = 'low';
  return proposal;
}

function actionFor(id) {
  return id === PIVI_ID ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source';
}

function commerceDecisionFor(id) {
  if (id === PIVI_ID) return 'software-or-vin-specific-dealer-remedy-no-retail-part';
  if (id === AIR_SUSPENSION_ID) return 'dealer-only-vin-and-strut-date-specific-air-spring-no-retail-link';
  if (id === REAR_GLASS_ID) return 'panel-and-vin-specific-glass-diagnosis-no-retail-link';
  return 'no-part-until-primary-source-and-fitment-are-verified';
}

function partialEvidenceFor(id) {
  if (/14cux/.test(id)) return [{ type: 'official-bulk-summary', documentIds: BULLETIN_INVENTORY.legacyCandidateRows['14cux'], finding: 'Land Rover communications cover coil connections, cold-start enhancement and ignition leads, not the frozen stepper/airflow-meter cause or complete DTC/repair prescription.' }];
  if (/swivel-ball|swivel-ball-housing/.test(id)) return [{ type: 'official-bulk-summary', documentIds: BULLETIN_INVENTORY.legacyCandidateRows.swivelSeal, finding: 'Land Rover communications support bounded swivel-seal replacement/grease-fill work for 1994-1997 applications, not every frozen year, pitting cause, raised-breather conversion or one-shot-grease claim.' }];
  if (/rear-main|crucifix|cruciform/.test(id)) return [{ type: 'official-bulk-summary', documentIds: BULLETIN_INVENTORY.legacyCandidateRows.rearMainCrucifix, finding: 'The official bulk summary documents new crucifix seals for rear-main-bearing oil leakage but no publicly retrievable bulletin proves the frozen procedure, interchange or permanence claims.' }];
  return [];
}

function evidenceFor(row) {
  const base = [
    { type: 'frozen-record', snapshotHash: '3f13700b582e6864d62580851752656db123b4bdb6b24a30e3ffbb9deaa4b9c8', id: row.id },
    { type: 'complete-official-inventory', manufacturerCommunicationRows: 983, recallRows: 294, uniqueRecallRows: 49, campaigns: 20, finding: row.id === PIVI_ID ? 'Exact same-identity JLR/NHTSA sources located.' : 'No exact public primary package proves the full frozen claim and repair scope.' },
  ];
  if (row.id === PIVI_ID) return [...base, PDF_SOURCES.piviN795, PDF_SOURCES.piviConnectivity, PIVI_RECALL];
  if (row.id === AIR_SUSPENSION_ID) return [...base, { ...PDF_SOURCES.airSpring, finding: 'Supports a 2020-2021 front-air-spring leak, but contradicts the frozen off-road-causation and all-year scope.' }];
  if (row.id === DIFF_BREATHER_ID) return [...base, { ...PDF_SOURCES.wading, finding: 'Addresses body sealing and cabin water ingress, not differential breathers.' }];
  if (row.id === REAR_GLASS_ID) return [...base, { ...PDF_SOURCES.rearGlass, finding: 'Addresses tailgate impact damage, not spontaneous quarter-window cracking.' }];
  return [...base, ...partialEvidenceFor(row.id)];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Defender').sort((a, b) => a.id.localeCompare(b.id));
  const blockerRecordIds = rows.filter((row) => row.id !== PIVI_ID).map((row) => row.id);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: actionFor(row.id),
      reason: row.id === PIVI_ID
        ? 'Exact JLR/NHTSA documents support a bounded same-identity rewrite across SOTA, wireless projection and recall-specific blank-screen conditions.'
        : 'The complete official inventory does not prove the full frozen claim; secondary citations and unsafe or unverified prescriptions are removed while the indexed identity remains intact.',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  const identityIds = (fragment) => rows.filter((row) => row.id.includes(fragment)).map((row) => row.id);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Land Rover',
    model: 'Defender',
    completionStatement: 'All 44 frozen Defender records receive primary-source adjudication. One exact Pivi identity receives a bounded rewrite and 43 contradicted, overbroad or unsupported identities receive targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds,
      reason: 'Forty-three Defender identities lack an exact public primary package for their full frozen title/year scope or are contradicted by retrieved JLR material. Independent review is required before any application.',
    },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All 44 Defender IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A blocker cannot conceal a false source association, false DTC, emissions-delete advice, unsafe instruction, unsupported part or service specification, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.',
      'All 983 Defender manufacturer-communication rows and all 294 recall rows / 49 unique campaign-year-model rows / 20 campaigns in the complete frozen inventories are accounted for; 19 separate campaign identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: 'defender-one-exact-pivi-identity-bounded', severity: 'critical', recordIds: [PIVI_ID], detail: 'N795, the January 2026 Pivi connectivity update and 25V016/N972 support separate bounded remedies without asserting a universal hardware defect.' },
      { code: 'defender-wading-source-does-not-support-differential-breather', severity: 'critical-correction', recordIds: [DIFF_BREATHER_ID], detail: 'SSM 75160 addresses body sealing, grommets and cabin water entry after wading; it contains no differential-breather diagnosis or extension-kit instruction.' },
      { code: 'defender-rear-glass-source-contradicts-spontaneous-claim', severity: 'critical-correction', recordIds: [REAR_GLASS_ID], detail: 'The JLR update addresses tailgate glass and says apparent shattering is almost always prior impact damage; it does not support spontaneous quarter-window cracking or automatic warranty coverage.' },
      { code: 'defender-air-spring-source-bounded', severity: 'critical-correction', recordIds: [AIR_SUSPENSION_ID], detail: 'SSM 75281 supports a 2020-2021 front-air-spring leak/lean condition but not off-road causation, rock punctures, sensor debris, valve-block contamination or the full 2020-2025 scope.' },
      { code: 'defender-emissions-delete-advice-removed', severity: 'safety-correction', recordIds: identityIds('dpf-egr-vnt'), detail: 'The proposal removes EGR delete/blanking, forced-regen and Italian-tune-up advice that lacked an exact public JLR source and could violate emissions law or damage the vehicle.' },
      { code: 'defender-unverified-dtc-part-fluid-torque-and-conversion-claims-removed', severity: 'critical-correction', recordIds: blockerRecordIds, detail: 'Unsupported DTCs, part numbers, engine/gearbox conversions, fluid specifications, intervals, torque/preload procedures, welding instructions and permanence claims do not survive the proposal.' },
      { code: 'defender-near-duplicate-classic-pages-preserved', severity: 'seo-safety', recordIds: [...identityIds('bulkhead'), ...identityIds('chassis'), ...identityIds('crossmember'), ...identityIds('swivel-ball'), ...identityIds('rear-main'), ...identityIds('crucifix')].filter((value, index, array) => array.indexOf(value) === index).sort(), detail: 'Near-duplicate classic Defender identities are neither archived nor redirected; each indexed page remains published pending later identity review.' },
      { code: 'defender-nineteen-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Nineteen recall/equipment identities not represented by the bounded Pivi rewrite remain deferred until the remaining-make audit is complete.' },
      { code: 'all-defender-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Defender ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES,
    piviRecall: PIVI_RECALL,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 43, total: 44 },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  AIR_SUSPENSION_ID,
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  DEFERRED_CAMPAIGNS,
  DIFF_BREATHER_ID,
  MAPPED_CAMPAIGNS,
  OUTPUT,
  PDF_SOURCES,
  PIVI_ID,
  PIVI_RECALL,
  REAR_GLASS_ID,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  actionFor,
  buildPacket,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
};
