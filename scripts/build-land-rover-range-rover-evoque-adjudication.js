/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-range-rover-evoque-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const IDS = Object.freeze({
  fuel: 'land-rover-range-rover-evoque-fuel-pump-2020',
  haldex: 'land-rover-range-rover-evoque-haldex-clutch-2012',
  incontrol: 'land-rover-range-rover-evoque-incontrol-freeze-2016',
  thermostat: 'land-rover-range-rover-evoque-thermostat-housing-2012',
});
const REWRITE_IDS = Object.freeze([IDS.haldex, IDS.incontrol]);
const BLOCKER_IDS = Object.freeze([IDS.fuel, IDS.thermostat].sort());
const PDF_SOURCES = Object.freeze({
  activeDriveline: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10105743-9340.pdf',
    nhtsaDocumentId: '10105743',
    jlrReference: 'LTB00911NAS1',
    pages: 2,
    sha256: '2d6d72d1fd93e9b69fa722d71bf74bdc737d254a14e26d0f3ce542f02ab9492c',
    visualInspection: 'both pages rendered and inspected during the Discovery Sport cross-model source pass',
  },
});
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
  modelAliases: ['RANGE ROVER EVOQUE'],
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 31, '2015-2019': 980, '2020-2024': 712, '2025-2026': 138 },
  totalRows: 1861,
  relevantDocumentCounts: { fuel: 20, haldex: 10, incontrol: 128, thermostat: 11 },
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});
const CAMPAIGNS = Object.freeze([
  '12V563000', '14V155000', '14V395000', '16V614000', '16V889000', '16V941000', '18V087000',
  '18V088000', '19V421000', '19V840000', '20E017000', '20V517000', '20V683000', '20V751000',
  '20V793000', '20V794000', '21V168000', '22V080000', '24V678000', '25V016000', '25V088000',
  '25V089000', '25V454000', '25V645000', '25V705000', '26V248000',
]);
const RECALL_FILES = Object.freeze([
  { period: 'pre', path: 'C:/tmp/nhtsa-flat-rcl-pre-2010/FLAT_RCL_PRE_2010.txt', rows: 0, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', rows: 68, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: BULLETIN_INVENTORY.modelAliases,
  totalRows: 68,
  uniqueCampaignYearModelRows: 37,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source),
});
const DOCUMENTS = Object.freeze({
  fuel: ['10056423', '10056427', '10101521', '10101563', '10101565', '10103601', '10105424', '10144541', '10155592', '10156841', '11010268'],
  haldex: ['10105587', '10105743', '10105847', '10105911', '10105966', '10106133', '10106161', '10142757', '10180878', '10206606'],
  incontrol: ['10097298', '10101244', '10101702', '10174488', '10175608', '10190012', '10191303', '10191861', '10191867', '11015249', '11015276', '11015311', '11015312', '11016644', '11016645'],
  thermostat: ['10103941', '10218903', '10225904', '10249844', '10249854', '11011023', '11015273', '11015332', '11015333', '11015334', '11015335'],
});

function datasetCitation(title) { return { type: 'nhtsa', title, url: NHTSA_DATASET_URL }; }
function contentFor(id) {
  if (id === IDS.fuel) return {
    description: 'The complete JLR inventory does not support a 2020-2025 Ingenium high-pressure fuel-pump and cam-follower failure. The exact high-pressure-pump metering-valve evidence applies to older 2012-2014 Evoque vehicles, while the 2020-2024 communication identifies a fuel-pump driver module condition. Those are different components, and the frozen P0087/P0191/P0088 aggregation cannot be carried across generations or onto the 1.5L PHEV.',
    solution: 'Record the exact engine, symptom, DTCs and low- and high-side fuel-pressure measurements, then use the current VIN-specific JLR diagnostic path. Do not replace a high-pressure pump, cam follower or low-pressure pump from this page; the retrieved primary records do not identify one verified retail part for the frozen 2020-2025 identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Evoque fuel records 10105424 and 11010268 (generation/component correction)')],
    summary: 'Removed the false cross-generation high-pressure-pump/cam-follower association, generic DTCs and updated-part prescription.',
  };
  if (id === IDS.haldex) return {
    description: 'JLR communications document loss of AWD or a two-wheel-drive-only warning on specified 2012-2016 Evoque vehicles from coupling-oil-pump brush faults, control-module configuration damage or other Active Driveline causes. Later guidance addresses low-speed noise or judder. The records support the coupling-failure identity, but not a universal fluid interval, degraded-fluid cause, controller failure, seizure or the frozen U0300/C1A54 attribution.',
    solution: 'Record the exact warning and DTCs, confirm whether the vehicle has Efficient Driveline or Active Driveline, verify matching tires and follow the current VIN-specific JLR pinpoint test. Do not replace a controller, pump or complete coupling or prescribe fluid service from this page; the documented causes differ and there is no universal retail part for the frozen scope.',
    citations: [
      { type: 'tsb', title: 'JLR LTB00911NAS1 — Active Driveline DTC diagnostics', url: PDF_SOURCES.activeDriveline.url },
      datasetCitation('NHTSA Manufacturer Communications — Evoque coupling records 10105587, 10105847, 10105966 and 10180878'),
    ],
    summary: 'Bounded the coupling identity to exact JLR drivetrain conditions and removed the invented service interval, controller, seizure and DTC claims.',
  };
  if (id === IDS.incontrol) return {
    description: 'JLR communications directly document InControl Touch or Touch Pro symptoms across the frozen 2016-2019 Evoque scope, including reboot loops, navigation initialization freezes, audio or media faults and software-update conditions. Later JLR programs provided a wired IMC update and time-limited IMC warranty support. The evidence supports the infotainment identity but not the claim that aging hardware universally causes it or that Bluetooth storage explains the failures.',
    solution: 'Record the exact symptom and installed software level, then follow the current VIN-specific JLR infotainment workflow. Apply a wired or over-the-air update only when directed, and diagnose the IMC before replacement. This is primarily a software/diagnostic remedy; no SSD, CarPlay retrofit or universal retail part is linked.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Evoque InControl records 10097298, 10101244, 10191303, 11015249, 11015311 and 11016645')],
    summary: 'Bounded InControl freezing/lag to exact JLR software evidence and removed master-reset, Bluetooth, SSD and aftermarket-retrofit prescriptions.',
  };
  if (id === IDS.thermostat) return {
    description: 'The complete JLR inventory does not establish a cracked plastic thermostat housing on the frozen 2012-2019 2.0L Si4 scope. It documents a 2012-2015 coolant-pump weep, replacement-thermostat concerns, and a separate 2020-2024 thermostat-housing coolant leak on the later-generation Evoque. The later housing record cannot validate the first-generation heat-cycle, pressure or sudden-leak claims.',
    solution: 'Pressure-test the cooling system and identify the exact leak source before replacing a thermostat, housing or pump. Do not install an aluminum housing or generic updated assembly from this page; the primary evidence separates pump, replacement-thermostat and later-generation housing conditions and identifies no verified retail part for the frozen identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Evoque cooling records 10103941, 10249844, 10249854 and 11015332-11015335 (generation correction)')],
    summary: 'Removed the false later-generation thermostat-housing association, unproven crack cause and aluminum-upgrade prescription.',
  };
  throw new Error(`Unexpected Evoque record ${id}`);
}
function actionFor(id) { return REWRITE_IDS.includes(id) ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source'; }
function proposalFor(row) {
  const proposal = clone(fullRecord(row)); const content = contentFor(row.id);
  proposal.description = content.description; proposal.solution = content.solution; proposal.confidence = REWRITE_IDS.includes(row.id) ? 'high' : 'low';
  proposal.symptoms = []; proposal.affectedSystems = []; proposal.dtcCodes = []; proposal.estimatedCostLow = null; proposal.estimatedCostHigh = null; proposal.typicalMileageLow = null; proposal.typicalMileageHigh = null;
  proposal.citations = content.citations; proposal.communityRecommendations = []; proposal.fixParts = []; proposal.humanApproved = false; proposal.reportCount = 0; proposal.source = 'manual'; proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE; proposal.contentUpdatedOn = REVIEW_DATE; proposal.contentUpdateSummary = content.summary; proposal.relatedIssueIds = [];
  return proposal;
}
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} Evoque manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} recall rows were searched.`;
  return {
    [IDS.fuel]: [common, `Nineteen fuel matches were reviewed; representative exact documents are ${DOCUMENTS.fuel.join(', ')}.`, 'The high-pressure-pump record belongs to older vehicles and the 2020-2024 record names a driver module, not the frozen pump/cam-follower identity.'],
    [IDS.haldex]: [common, `Ten coupling/driveline matches were reviewed: ${DOCUMENTS.haldex.join(', ')}.`, 'The records support exact AWD/coupling-pump conditions but not the frozen service interval, universal controller failure or DTC pair.'],
    [IDS.incontrol]: [common, `One hundred thirty-two infotainment matches were reviewed; exact frozen-scope records include ${DOCUMENTS.incontrol.join(', ')}.`, 'Reboot, freeze, update and IMC support records allow a bounded same-identity rewrite without aftermarket hardware claims.'],
    [IDS.thermostat]: [common, `Eleven cooling/thermostat matches were reviewed: ${DOCUMENTS.thermostat.join(', ')}.`, 'The exact housing-leak records are for 2020-2024 vehicles and cannot validate the frozen first-generation Si4 housing claim.'],
  }[row.id];
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Range Rover Evoque').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: actionFor(row.id), commerceDecision: 'diagnostic-or-software-remedy-no-universal-retail-part', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Land Rover', model: 'Range Rover Evoque',
    completionStatement: 'All four frozen Evoque records receive complete primary-inventory adjudication: two exact identities receive bounded rewrites and two cross-generation identities receive corrective holds while every indexed page identity remains published and unchanged.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'The fuel-pump and thermostat-housing titles rely on cross-generation component associations. Independent review is required for both exact rewrites and both held cleanups before application.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.',
      'All four IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'No part or retrofit is linked without exact component and generation fitment; every proposal explicitly states why no universal retail part is offered.',
      'All 1,861 manufacturer-communication rows and all 68 recall rows / 26 campaigns are accounted for; separate recall identities remain deferred.',
    ],
    source: { snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'evoque-fuel-pump-cross-generation-association-removed', severity: 'critical-correction', recordIds: [IDS.fuel], detail: 'Older high-pressure-pump evidence and a later driver-module record do not validate the frozen 2020-2025 identity.' },
      { code: 'evoque-haldex-identity-bounded', severity: 'exact-rewrite', recordIds: [IDS.haldex], detail: 'JLR supports exact coupling-pump and driveline faults without the invented maintenance/controller claims.' },
      { code: 'evoque-incontrol-identity-bounded', severity: 'exact-rewrite', recordIds: [IDS.incontrol], detail: 'JLR directly supports frozen-scope InControl reboot, freeze and update conditions.' },
      { code: 'evoque-thermostat-cross-generation-association-removed', severity: 'critical-correction', recordIds: [IDS.thermostat], detail: 'The exact housing-leak evidence applies to 2020-2024 vehicles, not the frozen 2012-2019 Si4 identity.' },
      { code: 'evoque-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'All guessed components and aftermarket upgrade recommendations are removed; no search or guessed deep link is introduced.' },
      { code: 'evoque-twenty-six-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Twenty-six separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-evoque-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Evoque ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES, manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY, documentIds: DOCUMENTS, mappedCampaigns: [], deferredCampaigns: CAMPAIGNS,
    summary: { rewrite_same_identity: 2, targeted_safety_cleanup_pending_source: 2, total: 4 }, rows: decisions,
  };
}
if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, DOCUMENTS, IDS, OUTPUT, PDF_SOURCES, RECALL_FILES, RECALL_INVENTORY, REVIEW_DATE, REWRITE_IDS, SNAPSHOT, SOURCE_FILES, actionFor, buildPacket, evidenceFor, proposalFor };
