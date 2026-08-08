/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-range-rover-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';

const IDS = Object.freeze({
  airSpring: 'land-rover-range-rover-air-spring-leak-2003',
  compressor: 'land-rover-range-rover-air-suspension-compressor-2003',
  battery: 'land-rover-range-rover-battery-drain-2013',
  pivi: 'land-rover-range-rover-pivi-pro-bugs-2022',
  roof: 'land-rover-range-rover-sunroof-drain-2003',
  supercharger: 'land-rover-range-rover-supercharger-nose-cone-2010',
  timing: 'land-rover-range-rover-timing-chain-tensioner-2010',
});
const REWRITE_IDS = Object.freeze([IDS.compressor, IDS.battery]);
const BLOCKER_IDS = Object.freeze([IDS.airSpring, IDS.pivi, IDS.roof, IDS.supercharger, IDS.timing].sort());

const SOURCE_FILES = Object.freeze([
  { period: '1995-1999', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/1995-1999/MFR_COMMS_RECEIVED_1995-1999.csv', length: 3443097, sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db' },
  { period: '2000-2004', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/2000-2004/MFR_COMMS_RECEIVED_2000-2004.csv', length: 8952754, sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264' },
  { period: '2005-2009', path: 'C:/tmp/nhtsa-mfr-2005-2009/MFR_COMMS_RECEIVED_2005-2009.csv', length: 5457880, sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b' },
  { period: '2010-2014', path: 'C:/tmp/MFR_COMMS_RECEIVED_2010-2014/MFR_COMMS_RECEIVED_2010-2014.csv', length: 17332775, sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387' },
  { period: '2015-2019', path: 'C:/tmp/MFR_COMMS_RECEIVED_2015-2019/MFR_COMMS_RECEIVED_2015-2019.csv', length: 144450847, sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e' },
  { period: '2020-2024', path: 'C:/tmp/MFR_COMMS_RECEIVED_2020-2024/MFR_COMMS_RECEIVED_2020-2024.csv', length: 125521629, sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf' },
  { period: '2025-2026', path: 'C:/tmp/MFR_COMMS_RECEIVED_2025-2026/MFR_COMMS_RECEIVED_2025-2026.csv', length: 77786229, sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c' },
]);
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: ['RANGE ROVER', 'NEW RANGE ROVER', 'RANGE ROVER L322', 'RANGE ROVER PHEV'],
  aliasCounts: { 'RANGE ROVER': 3780, 'NEW RANGE ROVER': 57, 'RANGE ROVER L322': 16, 'RANGE ROVER PHEV': 103 },
  periodCounts: { '1995-1999': 73, '2000-2004': 98, '2005-2009': 33, '2010-2014': 69, '2015-2019': 1789, '2020-2024': 1476, '2025-2026': 418 },
  totalRows: 3956,
  relevantDocumentCounts: { airSpring: 76, compressor: 13, battery: 26, piviOrInfotainment: 196, roofOrWater: 41, supercharger: 18, timing: 7 },
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});

const CAMPAIGNS = Object.freeze([
  '00V142001', '00V187000', '00V328000', '00V329000', '00V377000', '04V554000', '05V502000', '08V635000',
  '09V261000', '09V467000', '12V485000', '13V607000', '14V163000', '14V618000', '15V039000', '15V042000',
  '15V092000', '15V093000', '15V385000', '15V600000', '16V374000', '16V941000', '16V942000', '17V015000',
  '17V154000', '17V490000', '17V679000', '18V011000', '18V015000', '18V337000', '18V625000', '19V040000',
  '19V350000', '19V390000', '19V392000', '19V603000', '20V325000', '20V387000', '21V117000', '21V668000',
  '22V219000', '22V320000', '23V031000', '23V044000', '23V221000', '23V222000', '23V252000', '23V324000',
  '23V394000', '23V568000', '23V790000', '23V872000', '24V023000', '24V380000', '24V450000', '24V678000',
  '24V840000', '24V947000', '25V155000', '25V514000', '26V097000', '26V248000', '26V297000', '26V389000',
  '87V146000', '88V034000', '88V116000', '88V195000', '89V012000', '91V069000', '91V222000', '95V123000',
  '95V155000', '95V157000', '96V050000', '98V040000', '98V149000', '99V007000',
]);
const RECALL_FILES = Object.freeze([
  { period: 'pre', path: 'C:/tmp/nhtsa-flat-rcl-pre-2010/FLAT_RCL_PRE_2010.txt', rows: 51, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', rows: 453, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: BULLETIN_INVENTORY.modelAliases,
  totalRows: 504,
  uniqueCampaignYearModelRows: 168,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source),
});

const DOCUMENTS = Object.freeze({
  airSpring: ['10100929', '10100983', '10101186', '10101223', '10101423', '10102143', '10106202', '10204765', '10204766', '10204767', '10204768'],
  compressor: ['10034985', '10034986', '10037628', '10043560', '10057587', '10105736', '10160439', '10162652', '10164543', '10206483', '10206484', '10206485', '10206493'],
  battery: ['10145949', '10146389', '10154053', '10154054', '10155612', '10155613', '10155617', '10157141', '10157142', '10157146', '10158975', '10158990', '10168875'],
  pivi: ['11015252', '11015288', '11015359', '11017945', '11027470', '11027546', '11028600'],
  roof: ['10019760', '10100936', '10101185', '10104962', '10105041', '10106082', '10204761', '10204762', '10229591', '10229592', '10231451', '10231452', '10231453'],
  supercharger: ['10242162', '10100974', '10102561', '10116172', '10116979', '10214044', '10214045', '10224522', '10224523'],
  timing: ['10056266', '10057691', '10101762', '10103562', '10104461', '10171156', '10202830'],
});

function citation(title) {
  return [{ type: 'nhtsa', title, url: NHTSA_DATASET_URL }];
}

function contentFor(id) {
  if (id === IDS.airSpring) return {
    description: 'JLR communications document front air-spring replacement availability on 2003-2012 Range Rover vehicles and narrower hydraulic damper-chamber leaks or installation damage on later L405 vehicles. They do not establish rubber-bladder cracking from UV, salt or ozone across every frozen 2003-2021 vehicle, nor do they prove that overnight sag and compressor failure share one universal cause.',
    solution: 'Leak-test the exact corner, lines, fittings, valve blocks, reservoir and compressor before replacing a component. Do not replace all four springs or buy the frozen Arnott part from this page: axle, chassis generation, damper design and VIN determine the correct repair, and the primary inventory does not identify one verified retail part for the frozen bladder-crack claim.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover air-spring records including 10100929, 10101223, 10106202 and 10204765-10204768 (scope correction)'),
    summary: 'Removed the unsupported universal bladder-aging cause, all-four replacement rule, C1A20 attribution and unverified Arnott fitment.',
  };
  if (id === IDS.compressor) return {
    description: 'JLR communications support multiple Range Rover air-suspension compressor conditions: exhaust or delivery-valve faults, drier repair, relay replacement, installation/configuration faults and unnecessary replacement prompted by symptom-free DTCs. The evidence supports the compressor-failure identity, but it does not support one Hitachi-only failure chain, a universal thermal-fuse cause or the claim that leaking springs usually destroy the compressor.',
    solution: 'Confirm the warning, ride-height behavior, pressure build, leaks, wiring, relay, exhaust/delivery valve and VIN-applicable DTC workflow before replacing the compressor. Follow the current JLR procedure for the diagnosed generation and replace a relay or configure software only when that procedure requires it. No retail compressor is linked because chassis generation, supplier and VIN determine fitment.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover compressor records 10034985, 10037628, 10105736, 10162652 and 10164543'),
    summary: 'Bounded compressor failure to exact JLR conditions and removed the universal spring-cause, thermal-fuse and aftermarket-brand prescriptions.',
  };
  if (id === IDS.battery) return {
    description: 'JLR communications document repeated flat-battery complaints on 2013-2019 Range Rover vehicles, including cases with no measurable quiescent drain, a 2016-2020 TCU-related quiescent drain and a 2018 audio-system condition associated with startup-battery discharge. These sources support a module-related battery-drain identity, but not the frozen Bluetooth claim, a three-to-five-day interval or the assertion that any of more than 70 modules is equally likely.',
    solution: 'Test battery state and capacity, charging performance and stabilized quiescent current, then use the current VIN-specific JLR workflow to identify any wake-up source or module condition. Apply software or replace a module only when the diagnostic result and current bulletin require it. This is a diagnostic/software remedy, so no universal retail part or charger is linked.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover flat-battery/module records 10145949, 10155617, 10158990, 10158975 and 10168875'),
    summary: 'Bounded the battery-drain identity to exact JLR module evidence and removed the Bluetooth, module-count, time-to-discharge and generic charger claims.',
  };
  if (id === IDS.pivi) return {
    description: 'The complete JLR communication inventory contains exact Pivi records for failed over-the-air updates on 2022-2023 vehicles and later satellite-radio, login and wireless phone-integration concerns. Those records do not establish frequent system freezing, crashing, spontaneous reboots, loss of climate controls or persistent black screens across every frozen 2022-2025 Range Rover.',
    solution: 'Record the software version and exact failed function, then use the current VIN-specific JLR/Pivi diagnostic and update path. Do not perform an invented hard reset, clear user data or replace an infotainment module from this page. The retrieved evidence points to software or account-specific remedies and identifies no universal retail part.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover Pivi records 11015288, 11017945, 11027470, 11027546 and 11028600 (identity correction)'),
    summary: 'Removed unsupported freezing, crashing, climate-loss, reset and module-replacement claims; retained only exact Pivi evidence limits.',
  };
  if (id === IDS.roof) return {
    description: 'The complete JLR inventory documents several distinct Range Rover water-entry paths, including a mislocated climate-control drain tube, tailgate or body-seam leakage, blind-spot-module water ingress, roof-rail attachment leakage and other cabin sealing conditions. It does not establish blocked panoramic-sunroof drains as the universal cause across the frozen 2003-2021 span.',
    solution: 'Use controlled leak testing to identify the exact entry path before disturbing trim, drains or electronics. Do not blow compressed air, insert a rod, install drain extensions or apply dielectric grease from this page; those actions are not supported for the frozen identity, and the primary inventory identifies no universal retail part.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover water-ingress records including 10019760, 10100936, 10106082, 10204761 and 10204762 (cause correction)'),
    summary: 'Removed the unsupported sunroof-drain diagnosis, compressed-air/rod procedure, preventive interval and drain-extension prescription.',
  };
  if (id === IDS.supercharger) return {
    description: 'JLR communications document 5.0L supercharger clatter, knock or rattle on specified 2010-2015 Range Rover vehicles. The stated causes include torsional-isolator spring or support-shaft wear, excessive drive backlash and bearing contamination. They do not establish a nose-cone bearing and coupler failure across the frozen 2010-2022 span, reduced boost, rotor destruction or a universal oil-service interval.',
    solution: 'Confirm that the noise disappears with the supercharger drive isolated and follow the current VIN-specific JLR procedure for the diagnosed condition. Do not install a generic nose-cone bearing, coupler or rebuild kit from this page; the retrieved records describe different internal causes and do not identify one verified retail part for the frozen title.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover supercharger records 10242162, 10100974, 10102561, 10214045 and 10224523 (component correction)'),
    summary: 'Replaced the unsupported nose-cone/coupler aggregation with exact JLR isolator, backlash and bearing-contamination evidence limits.',
  };
  if (id === IDS.timing) return {
    description: 'JLR communications support front-engine rattle or click on specified 2010-2012 5.0L Range Rover vehicles caused by timing-chain lever wear and reduced chain tension. Follow-up material says repeat noise can result when the complete bulletin repair set is not installed. The inventory does not establish the frozen 2013-2022 scope, loss of hydraulic pressure, universal chain stretch, jumped timing or catastrophic failure as one condition.',
    solution: 'Confirm the engine, noise source, timing correlation and current VIN-applicable JLR procedure before disassembly. Do not order four tensioners, chains, guides or the frozen part number from this page; the retrieved primary evidence is limited to narrower model years and does not identify one verified retail kit for the full indexed scope.',
    citations: citation('NHTSA Manufacturer Communications — Range Rover timing records 10056266, 10101762, 10103562 and 10104461 (year and cause correction)'),
    summary: 'Bounded timing evidence to documented 2010-2012 chain-lever/tension conditions and removed later-year, hydraulic-pressure, catastrophe, labor and part-number claims.',
  };
  throw new Error(`Unexpected Range Rover record ${id}`);
}

function actionFor(id) {
  return REWRITE_IDS.includes(id) ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source';
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = REWRITE_IDS.includes(row.id) ? 'high' : 'low';
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
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} Range Rover manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} recall rows were searched.`;
  const evidence = {
    [IDS.airSpring]: [common, `Seventy-six air-suspension/spring matches were reviewed; the exact repair and investigation records include ${DOCUMENTS.airSpring.join(', ')}.`, 'They prove narrower front-spring repairs and hydraulic leaks, not rubber bladder cracking across the frozen generation span.'],
    [IDS.compressor]: [common, `Thirteen compressor matches were reviewed: ${DOCUMENTS.compressor.join(', ')}.`, 'Multiple JLR records directly support compressor/valve/relay failure and also warn against symptom-free replacement, allowing a bounded same-identity rewrite.'],
    [IDS.battery]: [common, `Twenty-six battery/quiescent-drain matches were reviewed; exact module-related records include ${DOCUMENTS.battery.join(', ')}.`, 'The TCU and audio records support the title while disproving the universal Bluetooth/module-count/time-to-discharge narrative.'],
    [IDS.pivi]: [common, `One hundred ninety-six Pivi/infotainment documents were reviewed; exact Pivi records include ${DOCUMENTS.pivi.join(', ')}.`, 'They support SOTA, login, radio and connectivity conditions, not the frozen freezing/crashing identity.'],
    [IDS.roof]: [common, `Forty-one roof/water-ingress documents were reviewed; representative exact records include ${DOCUMENTS.roof.join(', ')}.`, 'The records identify multiple non-sunroof-drain entry paths and do not support the frozen compressed-air maintenance advice.'],
    [IDS.supercharger]: [common, `Eighteen supercharger documents were reviewed; exact clatter/knock records include ${DOCUMENTS.supercharger.join(', ')}.`, 'They identify torsional-isolator/support wear and bearing contamination, not a universal nose-cone bearing/coupler identity.'],
    [IDS.timing]: [common, `Seven timing-chain documents were reviewed: ${DOCUMENTS.timing.join(', ')}.`, 'The exact 5.0L evidence covers specified 2010-2012 vehicles and does not support the frozen 2013-2022 expansion.'],
  };
  return evidence[row.id];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Range Rover').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: actionFor(row.id),
      commerceDecision: 'diagnostic-or-software-remedy-no-universal-retail-part',
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
    model: 'Range Rover',
    completionStatement: 'All seven frozen Range Rover records receive complete primary-inventory adjudication: two exact identities receive bounded rewrites and five overbroad identities receive corrective holds while every indexed page identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Five Range Rover titles lack public primary evidence for their full component/year scope. Independent review is required for the two bounded rewrites and every held cleanup before application.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.',
      'All seven IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'A named replaceable component receives no buy link unless exact component and generation fitment are proven; every proposal explicitly states why no universal retail part is offered.',
      'All 3,956 manufacturer-communication rows and all 504 recall rows / 78 campaigns are accounted for; separate recall identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: 'range-rover-compressor-identity-bounded', severity: 'exact-rewrite', recordIds: [IDS.compressor], detail: 'JLR records directly support compressor/valve/relay conditions and warn against symptom-free replacement.' },
      { code: 'range-rover-battery-module-identity-bounded', severity: 'exact-rewrite', recordIds: [IDS.battery], detail: 'JLR records support repeated flat battery and specific TCU/audio module conditions without the frozen generic claims.' },
      { code: 'range-rover-air-spring-bladder-cause-unproven', severity: 'critical-correction', recordIds: [IDS.airSpring], detail: 'Primary records support narrower front-spring repairs and hydraulic leaks, not universal rubber bladder aging.' },
      { code: 'range-rover-pivi-freeze-identity-unproven', severity: 'critical-correction', recordIds: [IDS.pivi], detail: 'Exact Pivi records concern SOTA, login, radio and connectivity, not the frozen freeze/crash aggregation.' },
      { code: 'range-rover-sunroof-drain-cause-unproven', severity: 'safety-correction', recordIds: [IDS.roof], detail: 'JLR documents multiple other ingress paths and does not support compressed-air sunroof-drain clearing for the frozen identity.' },
      { code: 'range-rover-supercharger-component-corrected', severity: 'critical-correction', recordIds: [IDS.supercharger], detail: 'JLR identifies torsional-isolator/support wear and bearing contamination, not a universal nose-cone bearing/coupler failure.' },
      { code: 'range-rover-timing-scope-limited-to-2010-2012', severity: 'critical-correction', recordIds: [IDS.timing], detail: 'Exact timing-chain lever/tension evidence is limited to specified 2010-2012 5.0L vehicles.' },
      { code: 'range-rover-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'All guessed part numbers, brands and generic product prescriptions are removed; no search or guessed deep link is introduced.' },
      { code: 'range-rover-seventy-eight-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Seventy-eight separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-range-rover-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Range Rover ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    documentIds: DOCUMENTS,
    mappedCampaigns: [],
    deferredCampaigns: CAMPAIGNS,
    summary: { rewrite_same_identity: 2, targeted_safety_cleanup_pending_source: 5, total: 7 },
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
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  DOCUMENTS,
  IDS,
  OUTPUT,
  RECALL_FILES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  REWRITE_IDS,
  SNAPSHOT,
  SOURCE_FILES,
  actionFor,
  buildPacket,
  contentFor,
  evidenceFor,
  proposalFor,
};
