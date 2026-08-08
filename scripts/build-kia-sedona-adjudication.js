/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-sedona-adjudication-2026-08-08.json');

const IDS = {
  battery: 'kia-carnival-sedona-battery-drain',
  alternator: 'kia-sedona-alternator-overheating-2002',
  cable: 'kia-sedona-power-sliding-door-cable',
  latch: 'kia-sedona-sliding-door-latch-2002',
  transmission: 'kia-sedona-transmission-shudder',
};
const CLEANUP_IDS = Object.values(IDS);

const CAMPAIGN_SOURCES = {
  laterAlternatorBoundary: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V399000',
  differentSlidingDoorDefect: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V338000',
};
const COMMERCE_BOUNDARY_SOURCES = {
  dorman924554: 'https://www.dormanproducts.com/p-130265-924-554.aspx',
};
const PDF_SOURCES = {
  batteryCluster: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10109798-9999.pdf',
    sha256: '098cbda309436e86e1e36fa61e722ef14ced9584d1a8378df056cd007193fd86', pageCount: 5,
    visuallyInspectedPages: [1, 5],
    markers: ['INSTRUMENT CLUSTER', '2015MY Sedona (YP)', '200-250 milliamps', 'may not enter "sleep" mode', 'August 11, 2014 through November 8, 2014'],
  },
  batteryDoorModules: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10080079-7690.pdf',
    sha256: '2c57ebff3acd530fc6ca2b9f7a668056ec6292012f3ea5f44eebbdc50567b14c', pageCount: 6,
    visuallyInspectedPages: [1, 6],
    markers: ['DDM / ADM SYSTEM LOGIC IMPROVEMENT', '2015MY Sedona (YP)', 'excessive parasitic draw', 'Integrated Memory Seats', 'through February 12, 2015'],
  },
  slidingDoorWarranty: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10189295-0001.pdf',
    sha256: 'a56e002cbd029a468c4735e9457f9bd7e88793d12705fc67ccf76388c6ccabf6', pageCount: 3,
    visuallyInspectedPages: [1, 2, 3],
    markers: ['2011-2014MY Sedona (VQ)', 'may not completely latch', 'Do not replace the PSD drive unit/motor', 'Rear Door Latch Assembly', 'April 1, 2010 to April 4, 2014'],
  },
  transmissionSixSpeed: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10088981-5448.pdf',
    sha256: '56cffc5d82eee56b2cbab1829be065493c2e24db4baa3ea279d1df64cbb809cc', pageCount: 6,
    visuallyInspectedPages: [1, 3, 6],
    markers: ['TCM SHIFT LOGIC IMPROVEMENT', '2016MY Sedona (YP)', 'downshifting (3-2)', 'climbing hills (4-3)', '3.3 GDI A/T'],
  },
  transmissionEightSpeed: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163456-0001.pdf',
    sha256: '35953188474dca447eb07346e1f59312955a93d8a9313300aed1c5a9f785c5c2', pageCount: 8,
    visuallyInspectedPages: [1, 2, 8],
    markers: ['3.3L GDI 8AT TCU', '2019MY', 'DTC P0741', 'February 14, 2018 through October 15, 2018', 'verify that the vehicle is included'],
  },
  transmissionFluid: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017172-0001.pdf',
    sha256: '956fce7de8ac125135c8364519dd186363d22bf45c8cd6c53bde338f0d663d01', pageCount: 8,
    visuallyInspectedPages: [1, 5, 8],
    markers: ['A flush is required ONLY when a transmission is replaced', '15-18MY Sedona (YP)', '19-21MY Sedona (YP)', 'Kia ATF SP-IV', 'DO NOT use aftermarket transmission cooler flush products'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedSedonaRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedSedonaRows: 21 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedSedonaRows: 26 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedSedonaRows: 21 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedSedonaRows: 155 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedSedonaRows: 111 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedSedonaRows: 16 },
  },
  totalExpectedSedonaRows: 350,
  requiredDocumentIds: ['10001681', '10015268', '10020652', '10037416', '10080079', '10088981', '10109798', '10163456', '10189295'],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedSedonaRows: 15 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedSedonaRows: 103 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {
  '03V017000': [2002], '03V135000': [2002], '03V158000': [2003], '05V013000': [2002, 2003],
  '05V232000': [2003, 2004, 2005], '05V329000': [2003, 2004, 2005], '06V265000': [2006],
  '06V349000': [2006], '09V130000': [2006, 2007],
};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '13V114000': [2007, 2008, 2009, 2010, 2011], '13V550000': [2006, 2007, 2008, 2009, 2010, 2011, 2012],
  '16V387000': [2006, 2007, 2008, 2009, 2010, 2011, 2012], '16V389000': [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
  '18V338000': [2015, 2016, 2017, 2018], '18V363000': [2011, 2012], '19V109000': [2015, 2016, 2017, 2018],
  '19V207000': [2019], '20V088000': [2006, 2007, 2008, 2009, 2010], '20V101000': [2011, 2012],
  '20V399000': [2020], '21V725000': [2015, 2016, 2017], '22V031000': [2017, 2018, 2019], '22V612000': [2016],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = Object.fromEntries(Object.entries({ ...EXPECTED_PRE_2010_RECALL_INVENTORY, ...EXPECTED_FLAT_RECALL_INVENTORY }).sort());
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).sort();

const CLEANUP_CARDS = {
  [IDS.battery]: {
    description: 'Kia documented two distinct parasitic-draw conditions in narrowly defined 2015 Sedona populations. ELE086 applies to some SX/SXL vehicles with Integrated Memory Seats and attributes intermittent battery discharge to Driver Door and Assist Door module logic. SA176 applies to some L/LX vehicles and attributes a 200-250 mA draw to instrument-cluster logic. Neither bulletin identifies the power sliding-door module as the cause across 2015-2021.',
    solution: 'Check the VIN, trim, production date and calibration status for ELE086 or SA176, then measure battery condition, charging output and key-off current after the vehicle enters sleep mode. Isolate the responsible circuit before reprogramming or replacing anything. Do not pull a generic fuse, install a battery disconnect, replace a sliding-door module or treat an AGM battery as the repair without a confirmed diagnosis.',
    reason: 'The frozen title remains indexed, but its sliding-door-module attribution, 300-500 mA figure, full 2015-2021 scope, F27 test, replacement costs and battery commerce are not supported by the two exact Kia programs.',
    systems: ['12V battery, charging and key-off electrical systems'],
    citations: [
      { type: 'tsb', title: 'Kia TSB ELE086 - DDM/ADM Logic Improvement and Parasitic Draw Reduction', url: PDF_SOURCES.batteryDoorModules.url },
      { type: 'tsb', title: 'Kia SA176 - Instrument Cluster Logic Improvement', url: PDF_SOURCES.batteryCluster.url },
    ],
  },
  [IDS.alternator]: {
    description: 'NHTSA manufacturer-communication metadata records a Kia charging-system change for 2002-2003 Sedona vehicles to improve alternator output in high ambient temperatures and severe operating conditions. It does not establish that every 2002-2014 Sedona has an exhaust-manifold heat trap, regulator overheating or repeated alternator failure before 100,000 miles. The only Sedona alternator safety recall in the complete inventory is the unrelated 2020-only campaign 20V399.',
    solution: 'For a warning lamp, dimming, odor or charging complaint, test battery condition, alternator output under load, voltage drop, cables, grounds, belt drive and nearby heat damage before replacing parts. Use exact VIN and engine fitment. Do not add improvised heat shielding near the exhaust or install a brand-only alternator recommendation without a verified cause and application.',
    reason: 'Only narrow early-model bulletin metadata exists; the broad heat-trap mechanism, repeat-failure frequency, mileage, costs, heat-shield modification and generic commerce exceed that evidence.',
    systems: ['battery and charging system'], citations: [],
  },
  [IDS.cable]: {
    description: 'Kia service-campaign metadata supports a narrow 2006 Sedona condition: moisture in exterior sliding-door handle-release cables could cause binding, sticking handles or failure to return, and affected cables were replaced. It does not establish cable fraying or snapping as a uniform 2006-2014 defect. The former Dorman 924-554 recommendation is false fitment; Dorman identifies 924-554 as a liftgate-glass hinge for 2008-2012 Jeep Liberty vehicles.',
    solution: 'If a sliding door will not open, close or latch, disable power operation only as directed by the owner manual and have the handle cables, latch, remote controller, drive unit, tracks and alignment diagnosed for the exact door and build date. Check campaign completion for an eligible 2006 vehicle. Do not order Dorman 924-554 or a generic cable kit from this page.',
    reason: 'The page stretched a narrow 2006 moisture/binding campaign across 2006-2014, added fraying and snapping claims, and attached a demonstrably unrelated Jeep hinge part number.',
    systems: ['sliding-door handle, cable, latch and drive systems'], citations: [],
  },
  [IDS.latch]: {
    description: 'Kia communications describe different sliding-door concerns by Sedona generation: an improved center roller for 2002-2005, debris-related latch sticking on 2006-2010, and incomplete power-door latching on some 2011-2014 vehicles. WTY018 directs diagnosis of the two-stage latching system and says not to replace the drive motor when the confirmed cause is the rear-door latch or remote controller. These are separate conditions, not proof of one uniform roller-and-latch failure across every 2002-2014 Sedona.',
    solution: 'Confirm whether the symptom is difficult movement, failure to reach the second latch stage, an open-door warning, or failure of power operation. Inspect and diagnose the rollers, tracks, latch, striker, remote controller and drive system for the exact model year. For an eligible 2011-2014 power-door vehicle, ask a Kia retailer about WTY018 before buying parts. Replace only the component the diagnosis identifies.',
    reason: 'The original page combined multiple generations, asserted generic dirt and wear causes, and recommended unverified Dorman latch/handle searches; the cleanup preserves the page while separating the official conditions.',
    systems: ['sliding-door roller, latch, remote controller and drive systems'],
    citations: [{ type: 'tsb', title: 'Kia TSB ELE232 / WTY018 - Sedona Power Sliding Door Inspection and Repair', url: PDF_SOURCES.slidingDoorWarranty.url }],
  },
  [IDS.transmission]: {
    description: 'The frozen page conflates two transmissions and several symptoms. Kia SA208 covers some 2016 Sedona 6-speed vehicles and only a 3-2 downshift feel plus busy 4-3 hill shifting. Kia SA387 covers some 2019 Sedona 8-speed vehicles produced from February 14 through October 15, 2018 with a malfunction lamp and DTC P0741. Those programs do not establish premature torque-converter wear, stuck valve-body solenoids, delayed engagement or a common shudder defect across 2015-2021.',
    solution: 'Retrieve codes, reproduce the exact shift complaint and identify the installed transmission before repair. Check VIN and calibration eligibility for SA208 or SA387. Follow current Kia service information for fluid level and condition; Kia TRA046 says a cooler flush is required only when a transmission is replaced and its existing oil cooler is transferred. Do not perform a routine 30,000-mile flush, use aftermarket cooler-flush chemicals or replace a torque converter, valve body or transmission without diagnosis.',
    reason: 'The page falsely labels 2019-2021 vehicles as 6-speed, generalizes two narrow software actions, adds unsupported P0740/P0742 and hard-part failure claims, and recommends a routine flush contrary to Kia guidance.',
    systems: ['6-speed and 8-speed automatic transmission control and hydraulic systems'], dtcCodes: ['P0741'],
    citations: [
      { type: 'tsb', title: 'Kia SA208 - 2016 Sedona TCM Shift Logic Improvement', url: PDF_SOURCES.transmissionSixSpeed.url },
      { type: 'tsb', title: 'Kia SA387 - 2019 Sedona 8AT TCU Logic Improvement for P0741', url: PDF_SOURCES.transmissionEightSpeed.url },
      { type: 'tsb', title: 'Kia TRA046 - Transmission Fluid Application Guide', url: PDF_SOURCES.transmissionFluid.url },
    ],
  },
};

function cleanupProposal(row) {
  const card = CLEANUP_CARDS[row.id];
  const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: card.description, solution: card.solution, confidence: 'medium', symptoms: [], affectedSystems: clone(card.systems),
    dtcCodes: clone(card.dtcCodes || []), estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: clone(card.citations), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual',
    reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: `Targeted accuracy and safety cleanup: ${card.reason}`,
    relatedIssueIds: [],
  });
  return proposal;
}
function actionFor() { return 'targeted_safety_cleanup_pending_source'; }
function reasonFor(id) { return CLEANUP_CARDS[id].reason; }
function evidenceFor(row) {
  const specific = {
    [IDS.battery]: [
      { kind: 'official-kia-tsb-visually-inspected', ...PDF_SOURCES.batteryDoorModules, verifiedOn: '2026-08-08', observation: 'ELE086 identifies DDM/ADM logic only on a narrow 2015 SX/SXL IMS population, not a sliding-door module across 2015-2021.' },
      { kind: 'official-kia-service-action-visually-inspected', ...PDF_SOURCES.batteryCluster, verifiedOn: '2026-08-08', observation: 'SA176 identifies instrument-cluster logic only on a narrow 2015 L/LX production population.' },
    ],
    [IDS.alternator]: [
      { kind: 'official-manufacturer-communication-metadata-only', documentId: '10001681', verifiedOn: '2026-08-08', observation: 'The catalog states only a 2002-2003 charging-system change to improve alternator output in high ambient/severe operation.' },
      { kind: 'official-recall-different-model-year-boundary', url: CAMPAIGN_SOURCES.laterAlternatorBoundary, verifiedOn: '2026-08-08', observation: '20V399 is a 2020-only loose B+ terminal-nut campaign outside the frozen 2002-2014 page.' },
    ],
    [IDS.cable]: [
      { kind: 'official-manufacturer-communication-metadata-only', documentId: '10020652', verifiedOn: '2026-08-08', observation: 'The NHTSA catalog supports only a 2006 sticking-handle/cable-replacement condition, not 2006-2014 cable fraying or snapping.' },
      { kind: 'manufacturer-commerce-disproof', url: COMMERCE_BOUNDARY_SOURCES.dorman924554, verifiedOn: '2026-08-08', observation: 'Dorman identifies 924-554 as a Jeep Liberty liftgate-glass hinge, so the Sedona cable recommendation is false.' },
    ],
    [IDS.latch]: [
      { kind: 'official-kia-tsb-visually-inspected', ...PDF_SOURCES.slidingDoorWarranty, verifiedOn: '2026-08-08', observation: 'WTY018 covers incomplete latching on some 2011-2014 power-door vehicles and requires diagnosis before latch or controller replacement.' },
      { kind: 'official-manufacturer-communication-metadata-boundaries', documentIds: ['10015268', '10037416'], verifiedOn: '2026-08-08', observation: 'Catalog entries separately identify a 2002-2005 center-roller improvement and debris-related latch sticking on 2006-2010 vehicles.' },
    ],
    [IDS.transmission]: [
      { kind: 'official-kia-service-action-visually-inspected', ...PDF_SOURCES.transmissionSixSpeed, verifiedOn: '2026-08-08', observation: 'SA208 is limited to 2016 6-speed 3-2 and 4-3 shift-feel concerns.' },
      { kind: 'official-kia-service-action-visually-inspected', ...PDF_SOURCES.transmissionEightSpeed, verifiedOn: '2026-08-08', observation: 'SA387 is limited to certain 2019 8-speed vehicles with P0741.' },
      { kind: 'official-kia-fluid-guide-visually-inspected', ...PDF_SOURCES.transmissionFluid, verifiedOn: '2026-08-08', observation: 'TRA046 distinguishes 2015-2018 and 2019-2021 Sedona transmissions and restricts cooler flushing to transmission-replacement circumstances.' },
    ],
  };
  return specific[row.id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Sedona');
  if (modelRows.length !== 5) throw new Error(`expected 5 Sedona rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(CLEANUP_IDS.slice().sort())) throw new Error('frozen Sedona ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const proposal = cleanupProposal(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'Preserve every indexed Sedona identity while removing false part fitment, unsafe maintenance advice, unsupported mechanisms and year-stretched bulletin claims.', commerceDecision: 'no-commerce-remove-unverified-or-false-fitment-pending-exact-source', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Sedona',
    completionStatement: 'All five frozen Kia Sedona records receive targeted accuracy and safety cleanup. Every indexed identity is preserved and all five remain blocked pending independent review.',
    applicationGate: { status: 'blocked', blockerRecordIds: CLEANUP_IDS.slice().sort(), reason: 'All Sedona pages contain source, year, mechanism, maintenance or commerce conflicts; independent review is required before any proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, new issue or public-page change is authorized.', 'All five Sedona IDs, titles, categories, indexed year sets and publication states remain unchanged.', 'A hold cannot conceal false fitment, unsafe maintenance advice or stretched bulletin scope; every page receives a targeted cleanup proposal.', 'Every cited official PDF was downloaded, SHA-256 hashed, read in full, rendered and visually inspected; the live verifier must reproduce each hash.', 'New recall identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'sedona-battery-module-attribution-corrected', severity: 'critical', recordIds: [IDS.battery], detail: 'Official 2015 programs identify DDM/ADM or instrument-cluster logic in narrow populations, not a sliding-door module across 2015-2021.' },
      { code: 'sedona-false-dorman-fitment-removed', severity: 'critical', recordIds: [IDS.cable], detail: 'Dorman 924-554 is a Jeep Liberty liftgate-glass hinge, not a Sedona sliding-door cable kit.' },
      { code: 'sedona-transmission-flush-advice-removed', severity: 'critical', recordIds: [IDS.transmission], detail: 'The routine 30,000-mile flush and aftermarket-fluid advice conflict with Kia TRA046 and were removed.' },
      { code: 'sedona-six-eight-speed-conflation-separated', severity: 'critical', recordIds: [IDS.transmission], detail: 'SA208 is a 2016 6-speed shift-feel action; SA387 is a narrow 2019 8-speed P0741 action.' },
      { code: 'sedona-door-generations-bounded', severity: 'methodology', recordIds: [IDS.cable, IDS.latch], detail: '2006 cable binding, older roller/latch topics and 2011-2014 WTY018 are kept at their exact boundaries.' },
      { code: 'sedona-23-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'The complete Sedona inventory contains 23 campaigns; none is silently substituted into a different frozen identity.' },
      { code: 'all-sedona-pages-preserved', severity: 'seo-safety', recordIds: CLEANUP_IDS.slice().sort(), detail: 'Every Sedona ID, title, category, indexed year set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, commerceBoundarySources: COMMERCE_BOUNDARY_SOURCES, pdfSources: PDF_SOURCES,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { targeted_safety_cleanup_pending_source: 5, total: 5 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGN_SOURCES, CLEANUP_CARDS, CLEANUP_IDS, COMMERCE_BOUNDARY_SOURCES, DEFERRED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor };
