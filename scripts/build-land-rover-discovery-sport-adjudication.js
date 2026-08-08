/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-discovery-sport-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const TRANSMISSION_ID = 'land-rover-discovery-sport-9-speed-trans-2015';
const COUPLING_ID = 'land-rover-discovery-sport-haldex-coupling-2015';
const ROOF_ID = 'land-rover-discovery-sport-panoramic-roof-leak-2015';
const TAILGATE_ID = 'land-rover-discovery-sport-tailgate-wiring-2015';
const THERMOSTAT_ID = 'land-rover-discovery-sport-thermostat-housing-2015';

const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';

const PDF_SOURCES = {
  transmissionConcerns: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200772-0001.pdf',
    nhtsaDocumentId: '10200772',
    jlrReference: 'Technical Topics - Transmission Concerns',
    pages: 1,
    sha256: '647c266ccd0861fa22781b3a47d6abfb53e3c9254a1dbcb573b89e9f23c9b989',
    visualInspection: 'the single page rendered and inspected',
  },
  transmissionWarranty: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10173519-0001.pdf',
    nhtsaDocumentId: '10173519',
    jlrReference: 'NAS20.03.002 - 9HP Transmission Extended Warranty USA',
    pages: 5,
    sha256: '743ef4ca49910f2341725d62e66a71101a09bd5ee20a0c7adb144a96158c0bba',
    visualInspection: 'all 5 pages rendered and inspected',
  },
  activeDrivelineDiagnostics: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10105743-9340.pdf',
    nhtsaDocumentId: '10105743',
    jlrReference: 'LTB00911NAS1',
    pages: 2,
    sha256: '2d6d72d1fd93e9b69fa722d71bf74bdc737d254a14e26d0f3ce542f02ab9492c',
    visualInspection: 'both pages rendered and inspected',
  },
  activeDrivelineJudder: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10180878-0001.pdf',
    nhtsaDocumentId: '10180878',
    jlrReference: 'FRED Submission Tips - Active Driveline Diagnosis',
    pages: 1,
    sha256: 'f245c6d7da2e5cde443bf706c41c21c3a60da7c2a9a90f8af710eb8d9c5402a7',
    visualInspection: 'the single page rendered and inspected',
  },
  aPillarWater: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10142561-9999.pdf',
    nhtsaDocumentId: '10142561',
    jlrReference: 'LTB01176NAS1',
    pages: 12,
    sha256: '28427b1756afdf5d42e5e7767aaad0d8188bb848b87767e35ec2c9e46a95b30e',
    visualInspection: 'all 12 pages rendered and inspected',
  },
  tailgateEarth: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10117009-9999.pdf',
    nhtsaDocumentId: '10117009',
    jlrReference: 'SSM72441',
    pages: 1,
    sha256: '0a4b227f4dfaa36a4687ba60987c890a93e8d63ad88ef29bf3dc49c2db2241e1',
    visualInspection: 'the single page rendered and inspected',
  },
  thermostatP0128: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10232633-0001.pdf',
    nhtsaDocumentId: '10232633',
    jlrReference: 'Technical Topics - SSM75918 / SSM75919',
    pages: 1,
    sha256: '3f450569193db0d74cfadde0ee9300366041fae9c23a1f7a18be3799f7aaf616',
    visualInspection: 'the single page rendered and inspected',
  },
  thermostatLeak: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11015332-0001.pdf',
    nhtsaDocumentId: '11015332',
    jlrReference: 'SSM76249',
    pages: 2,
    sha256: '0423ca8245319b014a557d793d7070ca0475b9842dfdf4cec990d7ad2efa7db5',
    visualInspection: 'both pages rendered and inspected',
  },
};

const BULLETIN_INVENTORY = {
  source: NHTSA_DATASET_URL,
  modelAliases: ['DISCOVERY SPORT'],
  rawDiscoverySportRows: 1231,
  periodCounts: {
    '1995-1999': 0,
    '2000-2004': 0,
    '2005-2009': 0,
    '2010-2014': 0,
    '2015-2019': 595,
    '2020-2024': 504,
    '2025-2026': 132,
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
  relevantDocumentCounts: { transmission: 34, activeDriveline: 9, roofOrWater: 30, tailgateOrWiring: 51, cooling: 32 },
};

const ALL_CAMPAIGNS = [
  '16V274000', '16V614000', '16V889000', '16V942000', '18V087000', '20V683000',
  '20V751000', '21V668000', '22V523000', '24V163000', '24V678000', '25V016000',
  '25V705000', '26V248000',
];
const MAPPED_CAMPAIGNS = [];
const DEFERRED_CAMPAIGNS = [...ALL_CAMPAIGNS];
const RECALL_INVENTORY = {
  source: RECALL_DATASET_URL,
  modelAliases: BULLETIN_INVENTORY.modelAliases,
  rawDiscoverySportRows: 281,
  uniqueCampaignYearModelRows: 18,
  campaignCount: 14,
  campaigns: ALL_CAMPAIGNS,
  mappedCampaigns: MAPPED_CAMPAIGNS,
  deferredCampaigns: DEFERRED_CAMPAIGNS,
  sourceFiles: [
    { name: 'FLAT_RCL_PRE_2010.txt', discoverySportRows: 0, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
    { name: 'FLAT_RCL_POST_2010.txt', discoverySportRows: 281, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
  ],
};

function boundedContentFor(id) {
  if (id === TRANSMISSION_ID) {
    return {
      description: 'JLR documented transmission-related complaints on 2015 Discovery Sport vehicles including rough, delayed or sudden shifting, grinding during shifts, harsh engagement and reduced power when a gear engages. JLR also published a 2016-2022 diagnostic topic for harsh shifts or a transmission warning on ZF-equipped vehicles. These sources support the indexed symptom identity, but they do not establish one universal calibration defect, cold-shift cause, generic DTC attribution or valve-body failure across every vehicle.',
      solution: 'Record the exact shift behavior, temperature, warning and stored DTCs, then use the current VIN-applicable JLR/ZF diagnostic workflow. JLR asks technicians to include the ZF analysis form, adaptation printouts and evidence of fluid condition when escalating a case. Do not prescribe a fluid change, valve-body replacement or software update from this page without the diagnostic result. The historical 2015 U.S. warranty extension has expired and must not be presented as current coverage.',
      citations: [
        { type: 'manufacturer-program', title: 'JLR NAS20.03.002 - 2015 Discovery Sport 9HP Transmission Extended Warranty (historical)', url: PDF_SOURCES.transmissionWarranty.url },
        { type: 'tsb', title: 'JLR Technical Topics - Harsh Shift / Transmission Warning Diagnostic Evidence', url: PDF_SOURCES.transmissionConcerns.url },
      ],
      contentUpdateSummary: 'Bounded the 9HP harsh-shift identity to exact JLR evidence and removed unsupported universal calibration, DTC, fluid-service and valve-body prescriptions.',
    };
  }
  if (id === COUPLING_ID) {
    return {
      description: 'JLR LTB00911NAS1 covers specified 2015-2016 Discovery Sport vehicles fitted with Active Driveline that display a two-wheel-drive-only warning. It states that multiple root causes can restrict the system and lists no parts for its module-configuration procedure. Later JLR guidance for low-speed noise or judder directs tire checks and the TOPIx rear-drive diagnostic workflow. Neither source identifies a universal Haldex oil-starvation condition or a 30,000-40,000-mile fluid interval.',
      solution: 'Confirm that the vehicle has Active Driveline, record the exact warning and DTCs, and verify that all four tires are the correct matching specification before following the current TOPIx pinpoint test. Do not replace an electronic controller, coupling or fluid on an assumed maintenance interval from this page; the documented conditions have multiple possible causes and diagnosis-specific remedies.',
      citations: [
        { type: 'tsb', title: 'JLR LTB00911NAS1 - Active Driveline DTC Diagnostics / No Parts Required', url: PDF_SOURCES.activeDrivelineDiagnostics.url },
        { type: 'tsb', title: 'JLR Active Driveline Low-Speed Noise or Judder Diagnostic Guidance', url: PDF_SOURCES.activeDrivelineJudder.url },
      ],
      contentUpdateSummary: 'Removed the unsupported Haldex oil-starvation, service-interval and controller-replacement claims and bounded the page to JLR Active Driveline diagnostics.',
    };
  }
  if (id === ROOF_ID) {
    return {
      description: 'JLR LTB01176NAS1 documents a 2015-2017 Discovery Sport A-pillar water-ingress condition caused by body-panel or body-seal placement. The bulletin expressly applies to vehicles without a roof-opening panel, so it cannot support the frozen panoramic-roof drain-blockage or seal-deterioration diagnosis across 2015-2022 vehicles.',
      solution: 'Identify the exact entry path with controlled leak testing before disturbing the roof, trim or drains. For a VIN within LTB01176NAS1 that has no roof-opening panel and leaks through the upper A-pillar, a trained body technician can follow the JLR inspection and seam-sealing procedure. Do not clear panoramic drains with compressed air or apply generic silicone from this page.',
      citations: [{ type: 'tsb-correction', title: 'JLR LTB01176NAS1 - A-Pillar Water Ingress on Vehicles Without a Roof-Opening Panel', url: PDF_SOURCES.aPillarWater.url }],
      contentUpdateSummary: 'Corrected the roof-opening-panel mismatch and removed unsupported panoramic-drain, maintenance-interval, seal and generic silicone prescriptions.',
    };
  }
  if (id === TAILGATE_ID) {
    return {
      description: 'JLR SSM72441 documents intermittent rear-wiper operation on Discovery Sport and directs technicians to inspect and clean tailgate earth studs G4D480B and G4D481A before considering a wiper motor. It does not establish hinge-area harness chafing, broken wires, a deteriorated grommet or a universal 2015-2022 cause for all of the frozen tailgate symptoms.',
      solution: 'Diagnose the exact failed tailgate circuit and inspect its power, ground, connectors and wiring using the VIN-applicable diagram. For the SSM72441 rear-wiper symptom, a trained technician should test the specified earth points and retest before replacing a motor. Do not order a harness, grommet, camera or other tailgate component from this generic page.',
      citations: [{ type: 'tsb', title: 'JLR SSM72441 - Discovery Sport Rear-Screen Wiper / Tailgate Earth Inspection', url: PDF_SOURCES.tailgateEarth.url }],
      contentUpdateSummary: 'Removed the unsupported hinge-harness chafing and grommet cause and bounded the surviving evidence to JLR rear-wiper earth diagnosis.',
    };
  }
  if (id === THERMOSTAT_ID) {
    return {
      description: 'JLR documents two narrower Ingenium I4 2.0L petrol conditions. A technical topic covers 2018-2023 vehicles with P0128-00 and poor cabin heating and directs thermostat-housing replacement after symptom confirmation. SSM76249 covers 2020-2024 coolant leakage at the housing area and says the root cause remains under investigation. Neither source proves thermal-cycle cracking, sudden leakage, both frozen engine families or the full 2015-2019 scope.',
      solution: 'If coolant is leaking, the warning illuminates or the engine overheats, stop when safe and have the exact leak source and engine derivative diagnosed before further driving. For a matching 2018-2019 Ingenium petrol vehicle with P0128-00 and poor heat, follow the current TOPIx housing procedure. Do not install an aftermarket aluminum housing or replace parts prophylactically from this page.',
      citations: [
        { type: 'tsb', title: 'JLR Technical Topics - P0128-00 / Poor Cabin Heating / Ingenium Thermostat Housing', url: PDF_SOURCES.thermostatP0128.url },
        { type: 'tsb-correction', title: 'JLR SSM76249 - 2020-2024 Thermostat-Housing Leak Investigation (outside frozen years)', url: PDF_SOURCES.thermostatLeak.url },
      ],
      contentUpdateSummary: 'Bounded thermostat evidence to exact Ingenium conditions and removed unsupported thermal-cycling, all-engine, aluminum-upgrade and universal replacement claims.',
    };
  }
  throw new Error(`Unexpected Discovery Sport record ${id}`);
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = boundedContentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = row.id === TRANSMISSION_ID ? 'high' : 'low';
  proposal.symptoms = [];
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
  return proposal;
}

function actionFor(id) {
  return id === TRANSMISSION_ID ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source';
}

function commerceDecisionFor(id) {
  if (id === TRANSMISSION_ID) return 'diagnostic-software-or-transmission-specific-dealer-remedy-no-retail-part';
  if (id === COUPLING_ID) return 'diagnostic-or-software-remedy-no-universal-retail-part';
  if (id === ROOF_ID) return 'body-diagnosis-and-seam-sealing-procedure-no-universal-retail-part';
  if (id === TAILGATE_ID) return 'circuit-and-earth-diagnosis-before-any-vin-specific-part';
  if (id === THERMOSTAT_ID) return 'dealer-only-engine-and-symptom-specific-housing-no-retail-link';
  throw new Error(`Unexpected Discovery Sport record ${id}`);
}

function evidenceFor(row) {
  const base = [
    { type: 'frozen-record', snapshotHash: '3f13700b582e6864d62580851752656db123b4bdb6b24a30e3ffbb9deaa4b9c8', id: row.id },
    { type: 'complete-official-inventory', manufacturerCommunicationRows: 1231, recallRows: 281, uniqueRecallRows: 18, campaigns: 14, finding: row.id === TRANSMISSION_ID ? 'Exact same-identity JLR evidence located for a bounded rewrite.' : 'No exact public primary package proves the full frozen title/year diagnosis and repair scope.' },
  ];
  if (row.id === TRANSMISSION_ID) return [...base, PDF_SOURCES.transmissionWarranty, PDF_SOURCES.transmissionConcerns];
  if (row.id === COUPLING_ID) return [...base, { ...PDF_SOURCES.activeDrivelineDiagnostics, finding: 'Multiple root causes and no parts required for the bounded procedure.' }, { ...PDF_SOURCES.activeDrivelineJudder, finding: 'Requires tire and pinpoint diagnosis rather than a universal fluid interval.' }];
  if (row.id === ROOF_ID) return [...base, { ...PDF_SOURCES.aPillarWater, finding: 'Explicitly applies to vehicles without a roof-opening panel, contradicting the panoramic-roof attribution.' }];
  if (row.id === TAILGATE_ID) return [...base, { ...PDF_SOURCES.tailgateEarth, finding: 'Supports a rear-wiper earth-point check, not a universal chafed harness.' }];
  if (row.id === THERMOSTAT_ID) return [...base, { ...PDF_SOURCES.thermostatP0128, finding: 'Supports a bounded 2018-2023 Ingenium P0128/poor-heat condition.' }, { ...PDF_SOURCES.thermostatLeak, finding: 'Supports a later 2020-2024 leak investigation outside the frozen years.' }];
  throw new Error(`Unexpected Discovery Sport record ${row.id}`);
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Discovery Sport').sort((a, b) => a.id.localeCompare(b.id));
  const blockerRecordIds = rows.filter((row) => row.id !== TRANSMISSION_ID).map((row) => row.id);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: actionFor(row.id),
      reason: row.id === TRANSMISSION_ID
        ? 'Exact JLR documents support a bounded same-identity transmission rewrite while unsupported universal causes and prescriptions are removed.'
        : 'The complete official inventory does not prove the full frozen claim; contradicted or unverified causes and prescriptions are removed while the indexed identity remains intact.',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
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
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Land Rover',
    model: 'Discovery Sport',
    completionStatement: 'All five frozen Discovery Sport records receive primary-source adjudication. One exact transmission identity receives a bounded rewrite and four contradicted or overbroad identities receive targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds,
      reason: 'Four Discovery Sport identities lack an exact public primary package for their full frozen title/year scope or are contradicted by retrieved JLR material. Independent review is required before any application.',
    },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All five Discovery Sport IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A blocker cannot conceal a false source association, false DTC, unsafe instruction, unsupported part or service specification, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.',
      'All 1,231 Discovery Sport manufacturer-communication rows and all 281 recall rows / 18 unique campaign-year-model rows / 14 campaigns in the complete frozen inventories are accounted for; all separate campaign identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: 'discovery-sport-one-transmission-identity-bounded', severity: 'critical', recordIds: [TRANSMISSION_ID], detail: 'JLR evidence supports 2015 transmission-related shift complaints and later harsh-shift diagnostics without proving a universal calibration or valve-body defect.' },
      { code: 'discovery-sport-false-ltb00523-transmission-association-removed', severity: 'critical-correction', recordIds: [TRANSMISSION_ID], detail: 'The former LTB00523 transmission citation is not used; the bounded rewrite cites exact NHTSA-hosted JLR transmission material.' },
      { code: 'discovery-sport-active-driveline-not-universal-haldex-oil-starvation', severity: 'critical-correction', recordIds: [COUPLING_ID], detail: 'JLR documents multiple Active Driveline causes, software/configuration work and tire/pinpoint diagnosis, not a universal Haldex fluid interval or controller failure.' },
      { code: 'discovery-sport-water-source-excludes-roof-opening-panel', severity: 'critical-correction', recordIds: [ROOF_ID], detail: 'LTB01176NAS1 applies to vehicles without a roof-opening panel and therefore cannot validate the panoramic-drain claim.' },
      { code: 'discovery-sport-tailgate-harness-cause-not-supported', severity: 'critical-correction', recordIds: [TAILGATE_ID], detail: 'SSM72441 supports a rear-wiper earth-point diagnostic path, not a universal hinge-harness chafing and grommet failure.' },
      { code: 'discovery-sport-thermostat-scope-bounded', severity: 'critical-correction', recordIds: [THERMOSTAT_ID], detail: 'JLR supports narrower Ingenium P0128 and later leak conditions but not the frozen all-engine thermal-cycling and aluminum-upgrade claims.' },
      { code: 'discovery-sport-unsafe-diy-and-unverified-parts-removed', severity: 'safety-correction', recordIds: blockerRecordIds, detail: 'Generic compressed-air, silicone, service-interval, controller, harness, grommet and aluminum-housing prescriptions do not survive the proposal.' },
      { code: 'discovery-sport-fourteen-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Fourteen recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-discovery-sport-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Discovery Sport ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 4, total: 5 },
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
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  COUPLING_ID,
  DEFERRED_CAMPAIGNS,
  MAPPED_CAMPAIGNS,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  ROOF_ID,
  SNAPSHOT,
  TAILGATE_ID,
  THERMOSTAT_ID,
  TRANSMISSION_ID,
  actionFor,
  buildPacket,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
};
