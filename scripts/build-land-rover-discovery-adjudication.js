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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-discovery-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';

const AIR_COMPRESSOR_ID = 'land-rover-discovery-air-suspension-compressor-2005';
const DPF_ID = 'land-rover-discovery-dpf-regen-2010';
const EGR_ID = 'land-rover-discovery-egr-cooler-2010';
const HEIGHT_SENSOR_ID = 'land-rover-discovery-l462-air-suspension-2017';
const WATER_INGRESS_ID = 'land-rover-discovery-sunroof-drain-2005';
const TERRAIN_RESPONSE_ID = 'land-rover-discovery-terrain-response-fault-2005';

const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';

const PDF_SOURCES = {
  airCompressor: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10102127-9340.pdf',
    nhtsaDocumentId: '10102127',
    jlrReference: 'LTB00420NAS3',
    pages: 21,
    sha256: '87dbe34363530e9a11f926ea556ee0a9db78a46c70ccb4c7b869bbe9eb51e213',
    visualInspection: 'all 21 pages rendered and inspected',
  },
  dpfP2002: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158993-9999.pdf',
    nhtsaDocumentId: '10158993',
    jlrReference: 'P2002-00 DPF diagnostic communication',
    pages: 1,
    sha256: '503cf8c1cb5498c627421ffe546b23ae082a79827c775cbccf85204dbdabcb49',
    visualInspection: 'the single page rendered and inspected',
  },
  heightSensor: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10106023-9340.pdf',
    nhtsaDocumentId: '10106023',
    jlrReference: 'SSM 45714',
    pages: 1,
    sha256: 'a183c2f5b071780a30b00c0b7b237b989c99464a4c6bb4a65bc13a60dfd9689d',
    visualInspection: 'the single page rendered and inspected',
  },
  expansionChamber: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10125265-9999.pdf',
    nhtsaDocumentId: '10125265',
    jlrReference: 'SSM 73563',
    pages: 1,
    sha256: '61c51e088ad5a5bba9d6dc0c24cb8547c452d3adbdc343e76c10774d97a5a7e4',
    visualInspection: 'the single page rendered and inspected',
  },
  ltb00498Correction: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10214051-9999.pdf',
    nhtsaDocumentId: '10214051',
    jlrReference: 'LTB00498NAS1',
    pages: 2,
    sha256: 'f79f5575b28fb23c07881f3e24d0f34f684467dc4cd6ba98ea6907ba0bd95df5',
    visualInspection: 'both pages rendered and inspected',
  },
  terrainResponseAuto: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10127509-9999.pdf',
    nhtsaDocumentId: '10127509',
    jlrReference: 'LTB01185NAS1',
    pages: 7,
    sha256: '8aaf1e81a3df888bd17ac9bca3d0f1c10481411ea296eb12daebdd64c7f3421d',
    visualInspection: 'all 7 pages rendered and inspected',
  },
};

const BULLETIN_INVENTORY = {
  source: NHTSA_DATASET_URL,
  modelAliases: ['DISCOVERY', 'DISCOVERY I', 'DISCOVERY II', 'LR3', 'LR4'],
  rawDiscoveryRows: 2741,
  periodCounts: {
    '1995-1999': 115,
    '2000-2004': 115,
    '2005-2009': 25,
    '2010-2014': 74,
    '2015-2019': 1380,
    '2020-2024': 825,
    '2025-2026': 207,
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
  exactFindings: {
    airCompressor: 'LTB00420NAS3 supports a bounded LR3/LR4 compressor condition and procedure, not the full frozen cause and year scope.',
    dpf: 'The complete inventory contains no LTB00445 DPF-regeneration bulletin; LTB00445 concerns low turbocharger boost pressure.',
    egr: 'LTB00498NAS1 concerns transfer-case whine and chain replacement, not an EGR cooler.',
    waterIngress: 'The inventory contains model/VIN-specific water-ingress material, but no public source proves the frozen 2005-2024 universal diagnosis and repair package.',
  },
};

const ALL_CAMPAIGNS = [
  '00V036000', '00V142000', '00V142001', '00V377000', '00V423000',
  '01V229001', '02V022000', '02V028000', '03V133000', '04V005000',
  '04V006000', '04V203000', '05V376000', '05V501000', '05V502000',
  '06V131000', '07E047000', '07V011000', '08V248000', '12E010000',
  '14V618000', '15V069000', '15V092000', '15V214000', '15V386000',
  '16V444000', '18V337000', '18V625000', '19V040000', '20V053000',
  '20V143000', '20V694000', '21V117000', '21V457000', '21V635000',
  '21V668000', '22V523000', '23V044000', '23V393000', '24V450000',
  '26V248000', '26V389000', '26V458000', '95V099000', '96V247000',
  '98V040000', '99V237000',
];
const MAPPED_CAMPAIGNS = [];
const DEFERRED_CAMPAIGNS = [...ALL_CAMPAIGNS];
const RECALL_INVENTORY = {
  source: RECALL_DATASET_URL,
  modelAliases: BULLETIN_INVENTORY.modelAliases,
  rawDiscoveryRows: 465,
  uniqueCampaignYearModelRows: 122,
  campaignCount: 47,
  campaigns: ALL_CAMPAIGNS,
  mappedCampaigns: MAPPED_CAMPAIGNS,
  deferredCampaigns: DEFERRED_CAMPAIGNS,
  sourceFiles: [
    { name: 'FLAT_RCL_PRE_2010.txt', discoveryRows: 61, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
    { name: 'FLAT_RCL_POST_2010.txt', discoveryRows: 404, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
  ],
};

function boundedContentFor(id) {
  if (id === AIR_COMPRESSOR_ID) {
    return {
      description: 'JLR LTB00420NAS3 documents a narrower condition on specified 2005-2009 LR3 and 2010-2012 LR4 vehicles: the suspension warning may appear, the vehicle may not raise, C1A20-64 may be stored, and the installed Hitachi or earlier AMK compressor determines the applicable procedure. The bulletin does not establish one universal cause or repair for every 2005-2016 Discovery represented by this indexed page.',
      solution: 'A trained technician should confirm the VIN, compressor design and stored fault before following the applicable JLR procedure and current parts catalog. Do not replace every air spring, relocate intake hardware or order an aftermarket compressor from this generic page; leaks and other suspension faults require their own diagnosis.',
      citations: [{ type: 'tsb', title: 'JLR LTB00420NAS3 - Air Suspension Warning / Vehicle Will Not Raise / C1A20-64', url: PDF_SOURCES.airCompressor.url }],
      contentUpdateSummary: 'Bounded the compressor condition to LTB00420NAS3 and removed unsupported universal causation, all-year scope, related-component replacement and unverified commerce.',
    };
  }
  if (id === DPF_ID) {
    return {
      description: 'The former LTB00445 citation does not document a DPF regeneration strategy; that bulletin concerns low turbocharger boost pressure. A separate JLR communication covers P2002-00 on specified 2017-2019 All New Discovery 3.0 TDV6 vehicles and says the condition is usually not paired with the red or amber unsuccessful-regeneration warnings. That narrower evidence does not prove the frozen 2010-2020 TDV6/SDV6 diagnosis.',
      solution: 'Have the exact fault codes, exhaust system and related symptoms diagnosed using the VIN-applicable TOPIx workflow. Do not initiate a forced regeneration, chemical treatment or highway-driving regimen from this page; the retrieved JLR document calls for diagnosis while JLR investigates the P2002-00 condition.',
      citations: [{ type: 'tsb', title: 'JLR P2002-00 Diagnostic Communication - 2017-2019 All New Discovery 3.0 TDV6', url: PDF_SOURCES.dpfP2002.url }],
      contentUpdateSummary: 'Removed the false LTB00445 DPF association and unsupported forced-regeneration, chemical-cleaning and generic driving prescriptions.',
    };
  }
  if (id === EGR_ID) {
    return {
      description: 'JLR LTB00498NAS1 is a transfer-case whine bulletin for specified 2011-2012 LR4 vehicles; it does not concern an EGR cooler. The complete official communications inventory did not provide an exact public primary source that proves the frozen 2010-2018 EGR-cooler cause, code set or repair scope.',
      solution: 'If coolant is being lost, exhaust smoke appears, the engine misfires or overheating is possible, stop when safe and arrange professional cooling, exhaust and engine diagnosis. Do not modify emissions equipment or order an EGR cooler from this page until the exact failed component and VIN-specific fitment are verified.',
      citations: [{ type: 'tsb-correction', title: 'JLR LTB00498NAS1 - Whine Noise From Transfer Case at High Speeds (not an EGR-cooler bulletin)', url: PDF_SOURCES.ltb00498Correction.url }],
      contentUpdateSummary: 'Corrected the false LTB00498 EGR association and removed unsupported DTCs, labor estimate, emissions modification and unverified part prescription.',
    };
  }
  if (id === HEIGHT_SENSOR_ID) {
    return {
      description: 'The retrieved JLR documents do not establish one universal 2017-2025 Discovery height-sensor failure. SSM 45714 warns against replacing a height sensor when no height-sensor DTC is present, while SSM 73563 attributes a specified 2017 Discovery normal-height-only condition with C1A20-64/C1131-92 to an air-supply-unit expansion-chamber leak.',
      solution: 'Use the stored DTCs, ride-height behavior and VIN-applicable JLR workflow to identify the actual fault. Do not replace height sensors, linkage pieces or other suspension parts before confirming the root cause and current VIN-specific part number.',
      citations: [
        { type: 'tsb', title: 'JLR SSM 45714 - Avoid Unnecessary Height-Sensor Replacement', url: PDF_SOURCES.heightSensor.url },
        { type: 'tsb', title: 'JLR SSM 73563 - Normal Height Only / Air-Supply Expansion-Chamber Leak', url: PDF_SOURCES.expansionChamber.url },
      ],
      contentUpdateSummary: 'Removed the universal height-sensor diagnosis and unverified replacement-link advice; added JLR evidence showing diagnosis-dependent alternate causes.',
    };
  }
  if (id === WATER_INGRESS_ID) {
    return {
      description: 'Land Rover communications document multiple model-, build- and location-specific water-ingress conditions, but the complete official inventory did not provide one public primary source proving that every 2005-2024 Discovery leak represented by this page originates at the sunroof drains or A-pillars.',
      solution: 'Have the entry point traced with controlled leak testing before disturbing trim, drains, glass or electrical modules. Avoid indiscriminate high-pressure drain clearing, drilling, generic drain extensions or improvised electronic-module covers; use the VIN- and leak-location-specific body repair procedure.',
      citations: [],
      contentUpdateSummary: 'Removed the universal sunroof/A-pillar diagnosis and unsupported drain-clearing, sealant, extension and module-waterproofing prescriptions pending an exact source.',
    };
  }
  if (id === TERRAIN_RESPONSE_ID) {
    return {
      description: 'A retrieved JLR bulletin documents a software-related Terrain Response Auto-mode condition on specified 2017 Discovery vehicles and says no parts are required. That vehicle year is outside this page\'s frozen 2005-2016 scope, and the document does not prove universal selector, shift-motor, connector-corrosion or control-module causes for the indexed identity.',
      solution: 'Record the exact warning, selected mode and stored DTCs, then use the VIN-applicable JLR diagnostic workflow. Do not order a selector, transfer-case motor or control module from this page; some Terrain Response conditions require software or diagnosis rather than parts.',
      citations: [{ type: 'tsb-correction', title: 'JLR LTB01185NAS1 - 2017 Discovery Terrain Response Auto Mode Software Condition', url: PDF_SOURCES.terrainResponseAuto.url }],
      contentUpdateSummary: 'Removed unsupported failure-rate, DTC and parts prescriptions and separated an out-of-scope 2017 software condition from the frozen 2005-2016 page.',
    };
  }
  throw new Error(`Unexpected Discovery record ${id}`);
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = boundedContentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = 'low';
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

function commerceDecisionFor(id) {
  if (id === AIR_COMPRESSOR_ID) return 'dealer-only-vin-and-compressor-design-specific-no-retail-link';
  if (id === DPF_ID) return 'dealer-only-diagnostic-remedy-no-retail-part';
  if (id === EGR_ID) return 'no-part-until-exact-primary-source-and-fitment-are-verified';
  if (id === HEIGHT_SENSOR_ID) return 'no-height-sensor-link-until-dtc-and-root-cause-are-verified';
  if (id === WATER_INGRESS_ID) return 'diagnostic-or-body-sealing-procedure-no-universal-retail-part';
  if (id === TERRAIN_RESPONSE_ID) return 'software-or-diagnostic-remedy-no-retail-part';
  throw new Error(`Unexpected Discovery record ${id}`);
}

function evidenceFor(row) {
  const base = [
    { type: 'frozen-record', snapshotHash: '3f13700b582e6864d62580851752656db123b4bdb6b24a30e3ffbb9deaa4b9c8', id: row.id },
    { type: 'complete-official-inventory', manufacturerCommunicationRows: 2741, recallRows: 465, uniqueRecallRows: 122, campaigns: 47, finding: 'No exact public primary package proves the full frozen title/year diagnosis and repair scope.' },
  ];
  if (row.id === AIR_COMPRESSOR_ID) return [...base, { ...PDF_SOURCES.airCompressor, finding: 'Supports a bounded LR3/LR4 compressor condition but not the full frozen cause and year scope.' }];
  if (row.id === DPF_ID) return [...base, { ...PDF_SOURCES.dpfP2002, finding: 'Supports a narrower 2017-2019 P2002-00 diagnostic condition, not the former LTB00445 association or generic regeneration prescription.' }];
  if (row.id === EGR_ID) return [...base, { ...PDF_SOURCES.ltb00498Correction, finding: 'Proves LTB00498NAS1 concerns transfer-case whine rather than an EGR cooler.' }];
  if (row.id === HEIGHT_SENSOR_ID) return [...base, { ...PDF_SOURCES.heightSensor, finding: 'Warns against unnecessary height-sensor replacement.' }, { ...PDF_SOURCES.expansionChamber, finding: 'Documents an alternate expansion-chamber leak cause on a specified 2017 Discovery condition.' }];
  if (row.id === TERRAIN_RESPONSE_ID) return [...base, { ...PDF_SOURCES.terrainResponseAuto, finding: 'Documents a software condition on 2017 Discovery, outside the frozen 2005-2016 scope, with no parts required.' }];
  return base;
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Discovery').sort((a, b) => a.id.localeCompare(b.id));
  const blockerRecordIds = rows.map((row) => row.id);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'targeted_safety_cleanup_pending_source',
      reason: 'The complete official inventory does not prove the full frozen claim; false source associations and unsafe or unverified prescriptions are removed while the indexed identity remains intact.',
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
    model: 'Discovery',
    completionStatement: 'All six frozen Discovery records receive primary-source adjudication and targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds,
      reason: 'All six Discovery identities are overbroad, unsupported or contradicted by retrieved JLR material for part of their frozen title/year scope. Independent review is required before any application.',
    },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All six Discovery IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A blocker cannot conceal a false source association, false DTC, unsafe instruction, unsupported part or service specification, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.',
      'All 2,741 Discovery-alias manufacturer-communication rows and all 465 recall rows / 122 unique campaign-year-model rows / 47 campaigns in the complete frozen inventories are accounted for; all separate campaign identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: 'discovery-two-false-jlr-bulletin-associations-removed', severity: 'critical-correction', recordIds: [DPF_ID, EGR_ID], detail: 'LTB00445 concerns low turbocharger boost rather than DPF regeneration, and LTB00498NAS1 concerns transfer-case whine rather than an EGR cooler.' },
      { code: 'discovery-air-compressor-scope-bounded', severity: 'critical-correction', recordIds: [AIR_COMPRESSOR_ID], detail: 'LTB00420NAS3 supports a specified LR3/LR4 compressor condition but not the frozen universal cause, 2005-2016 scope or related-component replacement package.' },
      { code: 'discovery-dpf-regeneration-prescriptions-removed', severity: 'safety-correction', recordIds: [DPF_ID], detail: 'Forced regeneration, chemical cleaning and generic highway-driving advice are removed because the retrieved exact source does not prescribe them.' },
      { code: 'discovery-egr-emissions-modification-advice-removed', severity: 'safety-correction', recordIds: [EGR_ID], detail: 'Unsupported emissions-system modification advice, DTC attribution and labor estimates are removed.' },
      { code: 'discovery-height-sensor-replacement-contradicted', severity: 'critical-correction', recordIds: [HEIGHT_SENSOR_ID], detail: 'JLR warns against sensor replacement without a confirming sensor DTC and documents an expansion-chamber leak as an alternate cause for a specified 2017 condition.' },
      { code: 'discovery-water-ingress-universal-diy-advice-removed', severity: 'safety-correction', recordIds: [WATER_INGRESS_ID], detail: 'The universal sunroof-drain diagnosis and indiscriminate clearing, drilling, extension and module-cover prescriptions are removed.' },
      { code: 'discovery-terrain-response-parts-not-proven', severity: 'critical-correction', recordIds: [TERRAIN_RESPONSE_ID], detail: 'The retrieved 2017 software bulletin is outside the page years and requires no parts, so it cannot support selector, transfer-motor or controller replacement on the frozen page.' },
      { code: 'discovery-forty-seven-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Forty-seven recall/equipment identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-discovery-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Discovery ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { targeted_safety_cleanup_pending_source: 6, total: 6 },
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
  AIR_COMPRESSOR_ID,
  ALL_CAMPAIGNS,
  BULLETIN_INVENTORY,
  DEFERRED_CAMPAIGNS,
  DPF_ID,
  EGR_ID,
  HEIGHT_SENSOR_ID,
  MAPPED_CAMPAIGNS,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  TERRAIN_RESPONSE_ID,
  WATER_INGRESS_ID,
  buildPacket,
  commerceDecisionFor,
  evidenceFor,
  proposalFor,
};
