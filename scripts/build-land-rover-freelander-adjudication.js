/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-freelander-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';

const IDS = Object.freeze({
  fuel: 'land-rover-freelander-2-fuel-pump-2007',
  rearDiff: 'land-rover-freelander-2-rear-diff-leak-2007',
  kv6Head: 'land-rover-freelander-head-gasket-2002',
  ird: 'land-rover-freelander-ird-failure-2001',
  kSeriesHead: 'land-rover-freelander-k-series-head-gasket-1997',
  window: 'land-rover-freelander-window-regulator-1997',
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
  modelAliases: ['FREELANDER', 'FREELANDER 1', 'FREELANDER 2', 'LR2'],
  aliasCounts: { FREELANDER: 80, LR2: 390 },
  periodCounts: { '1995-1999': 0, '2000-2004': 27, '2005-2009': 19, '2010-2014': 41, '2015-2019': 255, '2020-2024': 128, '2025-2026': 0 },
  totalRows: 470,
  relevantDocumentCounts: { fuel: 16, rearDifferential: 9, headGasket: 0, irdOrVcu: 3, window: 3 },
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});

const CAMPAIGNS = Object.freeze([
  '04V207000', '04V347000', '04V489000', '04V510000', '05V300000',
  '07V041000', '08V055000', '10V581000', '12V563000', '14V395000',
]);
const RECALL_FILES = Object.freeze([
  { period: 'pre', path: 'C:/tmp/nhtsa-flat-rcl-pre-2010/FLAT_RCL_PRE_2010.txt', rows: 15, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', rows: 9, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: BULLETIN_INVENTORY.modelAliases,
  totalRows: 24,
  uniqueCampaignYearModelRows: 24,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source),
});

const DOCUMENTS = Object.freeze({
  fuel: ['10023793', '10028527', '10030392', '10056423', '10056427', '10057588', '10100981', '10101482', '10101521', '10101563', '10101565', '10102562', '10105424', '10203425', '10204862', '10212852'],
  rearDiff: ['10037557', '10053924', '10097338', '10100824', '10100848', '10103481', '10105587', '10105847', '10206606'],
  irdVcu: ['629455', '10001057', '10105966'],
  window: ['634141', '10000386', '10002153'],
});

function datasetCitation(title) {
  return [{ type: 'nhtsa', title, url: NHTSA_DATASET_URL }];
}

function contentFor(id) {
  if (id === IDS.fuel) return {
    description: 'The complete NHTSA manufacturer-communication inventory supports several narrower LR2 fuel conditions, not one universal pump-module failure across every frozen year and engine. Those conditions include 2008-2012 fuel-sender harness corrosion, a 2013 in-tank pump relief-valve condition associated with P0089-29, a VIN-bounded 2013-2014 P0089-29 action, and a separate 2013-2014 high-pressure-pump metering-valve fault. The inventory does not support the frozen relay failure rate, diesel cornering-starvation claim, or P0230/P0087 attribution as one defect.',
    solution: 'Record the model year, engine, exact symptoms, fuel-gauge behavior, fuel-pressure measurements and stored DTCs, then follow the current VIN-specific JLR diagnostic path. Do not order a pump module or relay from this generic page: the official records describe different causes and do not identify one retail part for the full frozen scope.',
    citations: datasetCitation('NHTSA Manufacturer Communications — LR2 fuel records including 10101521, 10101563, 10101565 and 10105424 (scope correction)'),
    summary: 'Separated the official LR2 fuel conditions and removed the unsupported universal module, relay-rate, diesel-cornering and generic-DTC claims.',
  };
  if (id === IDS.rearDiff) return {
    description: 'JLR communications in the NHTSA inventory document rear differential hum, rumble or whine from a worn pinion tail bearing on specified LR2 vehicles and separate Active On-Demand Coupling faults. They do not establish a pinion-seal and output-flange leak identity across all frozen 2007-2014 vehicles, nor do they prove that Haldex seal leakage belongs to the same defect.',
    solution: 'Identify the fluid source and drivetrain component before service, and use the VIN-specific JLR procedure and fluid specification. Do not order a seal or add fluid from this page: the retrieved primary records support different noise, bearing and coupling conditions but not one verified retail part for the frozen leak identity.',
    citations: datasetCitation('NHTSA Manufacturer Communications — LR2 rear differential records including 10100824, 10100848, 10103481 and 10105587 (identity correction)'),
    summary: 'Removed the unsupported universal pinion/output-seal and Haldex-leak aggregation while preserving the indexed page for further sourcing.',
  };
  if (id === IDS.kv6Head) return {
    description: 'The complete NHTSA Freelander/LR2 manufacturer-communication inventory returned no head-gasket, cylinder-head, coolant-in-oil, oil-in-coolant or overheating communication that validates this frozen KV6 identity. The existing specialist and forum links do not establish the claimed failure prevalence, rear-bank pattern, universal cause, DTC list, mileage or cost range. This audit does not conclude that owner failures never occur; it concludes that the current aggregation lacks an exact public primary source.',
    solution: 'If overheating, coolant loss, cross-contamination or misfire is present, stop driving when safe and diagnose the leak source and engine condition before disassembly. Do not order a head-gasket kit or automatically replace both gaskets, the thermostat, water pump or radiator from this page; no verified retail part is linked while the exact identity remains pending primary-source review.',
    citations: [],
    summary: 'Removed unsupported prevalence, cause, DTC, cost and parts prescriptions; the KV6 identity remains held for an exact public primary source.',
  };
  if (id === IDS.ird) return {
    description: 'The complete NHTSA inventory contains a Freelander driveline-knock communication and a separate IRD coolant-hose service action. It does not establish IRD bearing failure from inadequate lubrication, the claimed drain-plug design, a universal VCU cause, or the frozen one-wheel test. The retrieved LR2 driveline communication concerns a different rear control-module procedure.',
    solution: 'Have the exact source of whine, vibration, binding or leakage diagnosed across the tires, VCU, IRD, final drive, shafts and transmission before replacing an assembly. Do not use the one-wheel hand test or a generic 30,000-mile fluid rule from this page, and do not order an IRD or VCU: the primary inventory does not identify one verified retail part for the frozen claim.',
    citations: datasetCitation('NHTSA Manufacturer Communications — Freelander records 629455 and 10001057 (scope correction)'),
    summary: 'Removed the unsupported lubrication cause, service interval, one-wheel test and automatic IRD/VCU replacement advice.',
  };
  if (id === IDS.kSeriesHead) return {
    description: 'The complete NHTSA Freelander/LR2 manufacturer-communication inventory returned no head-gasket, cylinder-head, coolant-in-oil, oil-in-coolant or overheating communication that validates this frozen 1.8L K-Series identity. The current page’s percentage, mileage, inevitability and cross-model claims are not supported by a retrieved public primary source. This audit does not conclude that owner failures never occur; it identifies the evidence limit of the published aggregation.',
    solution: 'If overheating, coolant loss, cross-contamination or rough running is present, stop driving when safe and confirm the fault with cooling-system, combustion-gas and engine-condition tests before choosing a repair. Do not order a gasket kit, bolts or cooling parts from this page; no verified retail part is linked while the exact identity remains pending primary-source review.',
    citations: [],
    summary: 'Removed the unsupported failure-rate, mileage, inevitability and mandatory-kit claims; the K-Series identity remains held for primary evidence.',
  };
  if (id === IDS.window) return {
    description: 'Three Land Rover communications in the complete NHTSA inventory document inoperative Freelander electric windows and unintended lowering of the tail-door glass. Those records support a window-system concern, but they do not identify a cable regulator as the universal cause, establish the driver door as most common, validate the full 1997-2006 scope, or support fitting a Freelander 2 regulator.',
    solution: 'Identify the affected glass and test the switch, power, ground, control logic, motor, guides and regulator before ordering parts. Do not buy a generic regulator from this page: body style, door position and diagnosed failure determine fitment, and the retrieved primary records do not identify one retail part for the frozen scope.',
    citations: datasetCitation('NHTSA Manufacturer Communications — Freelander electric-window records 634141, 10000386 and 10002153 (cause correction)'),
    summary: 'Bounded the page to documented electric-window symptoms and removed the unverified regulator cause, maintenance interval and cross-generation upgrade.',
  };
  throw new Error(`Unexpected Freelander record ${id}`);
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
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
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} Land Rover Freelander/LR2 manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} recall rows were searched.`;
  const evidence = {
    [IDS.fuel]: [common, `Sixteen fuel matches were reviewed: ${DOCUMENTS.fuel.join(', ')}.`, 'The records separate sender-harness, in-tank relief-valve, VIN-bounded P0089-29 and high-pressure-pump conditions; none proves the frozen all-year/all-engine aggregation.'],
    [IDS.rearDiff]: [common, `Nine rear-drive matches were reviewed: ${DOCUMENTS.rearDiff.join(', ')}.`, 'The exact official rear-differential record proves pinion tail-bearing noise, not the frozen pinion/output-seal leak identity.'],
    [IDS.kv6Head]: [common, 'Zero communication rows matched head gasket, cylinder head, coolant/oil cross-contamination or overheating for any Freelander/LR2 alias.', 'The remaining sources are specialist/forum material and cannot support the frozen prevalence, cause, costs or repair bundle as primary evidence.'],
    [IDS.ird]: [common, `Three IRD/VCU/driveline matches were reviewed: ${DOCUMENTS.irdVcu.join(', ')}.`, 'The Freelander IRD record concerns coolant-hose damage, not the frozen bearing/lubrication/VCU-test identity.'],
    [IDS.kSeriesHead]: [common, 'Zero communication rows matched head gasket, cylinder head, coolant/oil cross-contamination or overheating for any Freelander/LR2 alias.', 'No primary record supports the frozen 50-percent/80,000-mile or inevitable-failure claims.'],
    [IDS.window]: [common, `Three electric-window matches were reviewed: ${DOCUMENTS.window.join(', ')}.`, 'They document inoperative windows or tail-door glass movement but do not identify a universal regulator cause or cross-generation replacement.'],
  };
  return evidence[row.id];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Freelander').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'targeted_safety_cleanup_pending_source',
      commerceDecision: 'diagnostic-hold-no-verified-retail-part',
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
    model: 'Freelander',
    completionStatement: 'All six frozen Freelander records receive complete primary-inventory adjudication and bounded safety-cleanup proposals while every indexed page identity remains published and unchanged.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: rows.map((row) => row.id),
      reason: 'No frozen Freelander title has a retrieved public primary package supporting its full title/year/engine scope. Independent review is required before any body-copy cleanup is applied.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.',
      'All six IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'No part is linked or prescribed when the primary inventory does not establish an exact component and fitment; every proposal carries an explicit diagnostic/no-retail-part marker.',
      'All 470 manufacturer-communication rows and all 24 recall rows / 10 campaigns are accounted for; separate recall identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: 'freelander-fuel-conditions-not-one-module-failure', severity: 'critical-correction', recordIds: [IDS.fuel], detail: 'Official records describe multiple distinct LR2 fuel conditions and do not support the frozen relay/diesel/DTC aggregation.' },
      { code: 'freelander-rear-differential-noise-not-seal-leak', severity: 'critical-correction', recordIds: [IDS.rearDiff], detail: 'The exact rear-differential communication supports pinion tail-bearing noise, not a universal pinion/output-seal leak.' },
      { code: 'freelander-head-gasket-primary-source-gap', severity: 'critical-correction', recordIds: [IDS.kv6Head, IDS.kSeriesHead], detail: 'No head-gasket communication matched any Freelander/LR2 alias; prevalence and inevitability claims are removed from the proposals.' },
      { code: 'freelander-ird-source-is-coolant-hose-not-bearing-failure', severity: 'safety-correction', recordIds: [IDS.ird], detail: 'The retrieved IRD communication concerns coolant-hose damage and cannot validate the one-wheel test, lubrication claim or mandatory dual replacement.' },
      { code: 'freelander-window-symptom-not-regulator-cause', severity: 'critical-correction', recordIds: [IDS.window], detail: 'Official communications prove window symptoms but not a universal cable-regulator cause or Freelander 2 regulator upgrade.' },
      { code: 'freelander-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'Every proposed solution explicitly withholds a retail part until exact diagnosis and fitment exist; no search or guessed link is introduced.' },
      { code: 'freelander-ten-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Ten recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-freelander-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Freelander ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    documentIds: DOCUMENTS,
    mappedCampaigns: [],
    deferredCampaigns: CAMPAIGNS,
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
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  DOCUMENTS,
  IDS,
  OUTPUT,
  RECALL_FILES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SNAPSHOT,
  SOURCE_FILES,
  buildPacket,
  contentFor,
  evidenceFor,
  proposalFor,
};
