/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-9-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CX-9', 'CX9']);
const IDS = Object.freeze({
  acEvaporator: 'mazda-cx9-ac-evaporator-leak-2007',
  liftgate: 'mazda-cx9-power-liftgate-2016',
  rearDifferential: 'mazda-cx9-rear-diff-coupling-2007',
  timingV6: 'mazda-cx9-timing-chain-stretch-2007',
  timingTurbo: 'mazda-cx9-timing-chain-stretch-2016',
  transferLeak: 'mazda-cx9-transfer-case-leak-2007',
  turboCoolant: 'mazda-cx9-turbo-coolant-leak-2016',
  waterPump: 'mazda-cx9-water-pump-leak-2007',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10092344', '10097334', '10105516', '10210867', '10225777', '11009658']);
const CAMPAIGNS = Object.freeze(['09E011000', '09V066000', '10V051000', '15V451000', '16V203000', '17V429000', '17V457000', '18V018000', '18V717000', '19V403000', '19V770000', '19V782000', '21V750000', '21V875000']);

const PDF_SOURCES = Object.freeze({
  liftgateLowVoltage: { title: 'Mazda 2016 CX-9 Power Liftgate Inoperative with DTC U3003:16', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10092344-6903.pdf', localPath: 'C:/tmp/mazda-cx9-sources/MC-10092344-6903.pdf', pages: 1, visualPages: [1], bytes: 402923, sha256: '77bd8468cda01f660ef6b5537bf19c4e719002d13958aa6395562d6e3c8831bc' },
  timingChainAlignment: { title: 'Mazda SA-018/22 Timing Chain and Crankshaft Sprocket Alignment Guidance', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10210867-0001.pdf', localPath: 'C:/tmp/mazda-cx9-sources/MC-10210867-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 285325, sha256: '351f3fce21a99f170eb63891e0a41017de3e902903a16f80b24849355682d2e7' },
  modernAcLeak: { title: 'Mazda TSB 07-003/22 CX-9 Condenser or Low-Temperature Outlet Pipe Refrigerant Leak', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225777-0001.pdf', localPath: 'C:/tmp/mazda-cx9-sources/MC-10225777-0001.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 244724, sha256: 'f4259579cc60da50e9412ae813e825eba164586967e797e53fe022b437205368' },
  cylinderHeadCoolantProgram: { title: 'Mazda CSP11 2.5T Cylinder-Head Coolant Leak Warranty Extension', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009658-0001.pdf', localPath: 'C:/tmp/mazda-cx9-sources/MC-11009658-0001.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 79451, sha256: '99c5f96b86181e98a0a257a4935ba9d1dbbc7b41fc35ed4d3574b4440a574cbb' },
  transferOilSeals: { title: 'Mazda TSB 03-002/13 CX-9 Right-Side Transfer Oil Seal Procedure', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10097334-2532.pdf', localPath: 'C:/tmp/mazda-cx9-sources/SB-10097334-2532.pdf', pages: 9, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9], bytes: 784920, sha256: '8af55f6b57405f41f0caa980c7c42abfc4fe2ec5f0f994ee2fc9cda1315fb903' },
  rearDifferentialMount: { title: 'Mazda TSB 03-007/15 CX-9 Rear Differential Mount Noise', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10105516-2532.pdf', localPath: 'C:/tmp/mazda-cx9-sources/SB-10105516-2532.pdf', pages: 2, visualPages: [1, 2], bytes: 511634, sha256: 'b69bb4e15cc79c7b916d2aff5eda03f45bd2171b85b2a24425c0d20cc0bce1ea' },
});
const OTHER_SOURCES = Object.freeze({
  complaints2008: { title: 'NHTSA 2008 Mazda CX-9 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-9&modelYear=2008' },
  complaints2010: { title: 'NHTSA 2010 Mazda CX-9 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-9&modelYear=2010' },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 15, '2010-2014': 25, '2015-2019': 545, '2020-2024': 553, '2025-2026': 86 },
  totalRows: 1224, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { pre: 6, post: 54 }, totalRows: 60, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { title: source.title, type: source.type, url: source.url }; }
function citationsFor(id) {
  const map = {
    [IDS.acEvaporator]: [OTHER_SOURCES.complaints2008, PDF_SOURCES.modernAcLeak],
    [IDS.liftgate]: [PDF_SOURCES.liftgateLowVoltage],
    [IDS.rearDifferential]: [PDF_SOURCES.rearDifferentialMount],
    [IDS.timingV6]: [OTHER_SOURCES.complaints2010],
    [IDS.timingTurbo]: [PDF_SOURCES.timingChainAlignment],
    [IDS.transferLeak]: [PDF_SOURCES.transferOilSeals],
    [IDS.turboCoolant]: [PDF_SOURCES.cylinderHeadCoolantProgram],
    [IDS.waterPump]: [OTHER_SOURCES.complaints2010],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-9 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.acEvaporator]: {
      confidence: 'low',
      description: 'The 2008 NHTSA complaint file contains one report, ODI 10546477, in which an owner described white material from the vents and said a Mazda dealer recommended replacing the evaporator coil. One owner report does not establish refrigerant loss, pinhole corrosion, a model-wide defect or the full frozen 2007-2015 scope. Mazda TSB 07-003/22 documents different A/C leak locations on 2016-2022 CX-9 vehicles—the condenser and low-temperature outlet pipe—and therefore cannot substantiate this first-generation evaporator title.',
      solution: 'For weak cooling or suspected refrigerant loss, have a qualified A/C technician measure system performance, recover refrigerant with approved equipment, and locate the leak using the applicable Mazda procedure and suitable detection equipment. Confirm whether the source is the evaporator, condenser, a pipe, a seal or another component before authorizing dashboard removal. Repeatedly adding refrigerant without locating and repairing a leak is not a diagnosis. Do not buy an evaporator core, receiver/drier, expansion valve or refrigerant from this page; the leak location and exact vehicle application must be verified first.',
      symptoms: ['A/C cooling performance is weak or intermittent', 'refrigerant loss is suspected and requires leak testing', 'material or odor from the vents requires inspection'],
      summary: 'Demoted the evaporator mechanism to one bounded owner report, excluded an inapplicable second-generation A/C bulletin and removed automatic dashboard/parts replacement.',
    },
    [IDS.liftgate]: {
      confidence: 'high',
      description: 'Mazda service guidance for a 2016 CX-9 describes a power liftgate that is inoperative with stored DTC U3003:16 because the power-liftgate control-module supply voltage is low, which may be caused by low battery voltage. That source does not establish worn strut motors, a latch defect, harness damage or cold-weather gas-pressure loss, and it does not establish the same cause across the frozen 2017-2023 years.',
      solution: 'Check battery state, charging-system performance and power-liftgate codes before replacing liftgate hardware. For the exact 2016 U3003:16 condition, Mazda directed technicians to recharge the battery, reset keep-alive memory with the liftgate closed, verify operation and clear the code. Other years or symptoms require their applicable Mazda diagnostic procedure, including obstruction, latch, switch, wiring and module checks. Do not buy powered struts, a latch or a control module from this page; confirm the year, code, voltage condition and failed component first.',
      symptoms: ['power liftgate does not operate', 'DTC U3003:16 is stored on a 2016 vehicle', 'low battery voltage or charging performance requires testing'],
      dtcCodes: ['U3003:16'],
      summary: 'Replaced unsupported motor/latch/harness causes with Mazda’s exact 2016 low-voltage U3003:16 procedure and preserved later years as diagnosis-only scope.',
    },
    [IDS.rearDifferential]: {
      confidence: 'medium',
      description: 'Mazda TSB 03-007/15 applies to certain 2007-2015 CX-9 AWD vehicles and documents vibration during acceleration or noise from the rear when rear-differential mounting rubber becomes hardened and cracked. The bulletin does not identify an electronically controlled coupling, clutch-pack wear, overheating, towing, fluid neglect, AWD disengagement, P1889 or C1288 as the cause. The frozen page title is retained for indexed identity, but its coupling-failure mechanism is not supported by this primary source.',
      solution: 'Reproduce the acceleration vibration or rear noise and inspect both rear-differential side mounting rubbers for cracks. Mazda’s bulletin says it does not apply if neither mount is cracked and directs replacement of only the affected mounting rubber; the differential and propeller shaft do not need to be removed for that repair. Other AWD warnings, turn-related binding or loss of engagement require separate diagnosis. Do not buy a coupling, complete differential, mounting rubber or fluid from this page; verify the symptom, VIN/build range and failed component first.',
      symptoms: ['vibration during acceleration', 'noise from the rear of an AWD vehicle', 'rear differential mounting rubber is visibly cracked'],
      summary: 'Corrected a coupling-failure narrative to Mazda’s exact 2007-2015 rear-differential mounting-rubber bulletin and removed unsupported DTC, fluid and replacement claims.',
    },
    [IDS.timingV6]: {
      confidence: 'low',
      description: 'The 2010 NHTSA complaint file contains an individual report, ODI 11082334, describing a loss of power and a repair diagnosis involving timing-chain failure. A complaint records what an owner reported; it does not establish a Mazda defect determination, an 80,000-120,000-mile pattern, chain stretch across all 2007-2015 vehicles, guide or tensioner wear, or the frozen P0011/P0012/P0014/P0016/P0017 list. The reviewed Mazda communication inventory did not identify a matching first-generation CX-9 timing-chain failure bulletin.',
      solution: 'If the engine rattles, loses power, runs poorly or stores cam/crank-correlation codes, limit driving and have a technician record the codes and freeze-frame data, verify oil level and condition, localize the noise, and test cam/crank timing using the applicable service information. Mechanical timing must be confirmed before disassembly, and an overheating or coolant-in-oil condition requires a separate water-pump and cooling-system diagnosis. Do not buy a timing-chain kit, guides, tensioners, cam phasers, water pump or thermostat from this page; verify the failed system and exact engine first.',
      symptoms: ['engine loses power or runs poorly', 'timing-area rattle or cam/crank correlation requires diagnosis', 'mechanical timing may require inspection'],
      summary: 'Replaced fixed-mileage and complete-kit certainty with one identified complaint, no Mazda failure bulletin and an explicit timing-versus-cooling diagnosis boundary.',
    },
    [IDS.timingTurbo]: {
      confidence: 'low',
      description: 'Mazda service alert SA-018/22 applies to 2016-2022 CX-9 vehicles and explains how technicians identify and align Type A, B and C crankshaft-sprocket/timing-chain combinations during installation. It is a workshop-procedure correction, not evidence that the chain stretches, rattles or fails. It does not support a non-synthetic-oil cause, a 5,000-mile interval, a software remedy, the frozen DTC list or official coverage of the frozen 2023-2025 years.',
      solution: 'For a startup rattle, whine or cam/crank-correlation concern, record when and how long the noise occurs, inspect oil level and condition, read codes and freeze-frame data, and have a Mazda-qualified technician localize the source before opening the engine. If timing work is independently justified on a 2016-2022 vehicle, SA-018/22 is an installation guardrail for matching the sprocket and chain type; it is not authorization to replace parts. Do not buy a timing chain, tensioner, guides, sprocket or oil service from this page; verify the failure and applicable Mazda procedure first.',
      symptoms: ['startup rattle or whine requires localization', 'cam/crank timing concern requires code and mechanical checks', 'timing-component type must be identified during an authorized repair'],
      summary: 'Reclassified SA-018/22 as installation guidance rather than failure proof and removed unsupported oil, interval, software, DTC and 2023-2025 scope claims.',
    },
    [IDS.transferLeak]: {
      confidence: 'high',
      description: 'Mazda TSB 03-002/13 applies specifically to 2010-2013 CX-9 AWD vehicles and provides a procedure for the right-side transfer oil seal and transfer dust seal. Mazda says transfer gear oil can be tan, brown or black with a pungent odor; a red leak is ATF from a transaxle seal and is outside this bulletin. The source does not establish case-half leakage, a 2007-2023 failure pattern, a 30,000-mile preventive interval, Mazda FE-LS ATF as transfer fluid or inevitable transfer-case failure.',
      solution: 'Identify the fluid color, odor and exact leak location before choosing a repair. For a 2010-2013 AWD vehicle with a verified right-side transfer gear-oil leak, Mazda directs replacement of the oil seal, dust seal and deflector through the right wheel opening; the transfer assembly does not need to be removed. A red ATF leak follows a different transaxle-seal procedure, and other years or locations require their own diagnosis. Do not buy a seal kit, transfer assembly, ATF or gear oil from this page; confirm the year, drivetrain, fluid and leak source first.',
      symptoms: ['fluid is visible near the right side of the transfer unit', 'tan, brown or black pungent transfer gear oil must be distinguished from red ATF', 'transfer vent and surrounding area require inspection'],
      summary: 'Narrowed the leak to Mazda’s 2010-2013 right-side seal procedure, preserved the red-ATF exclusion and removed incorrect fluid, interval and whole-unit claims.',
    },
    [IDS.turboCoolant]: {
      confidence: 'high',
      description: 'Mazda Customer Service Program CSP11 covers certain 2016-2020 CX-9 vehicles with the PYT SKYACTIV 2.5T engine for coolant leakage at the cylinder head around the exhaust manifold when the condition matches TSB 01-002/23. It extends limited powertrain coverage to 10 years or 120,000 miles from the in-service date, whichever occurs first, subject to Mazda inspection and eligibility. The program does not identify a turbocharger coolant supply/return-line defect, revised hose material, P0128/P2181, or the frozen 2021-2023 years.',
      solution: 'If coolant is low, a leak is visible or the engine overheats, stop driving when safe and have the cooling system inspected before further operation. Ask a Mazda dealer to check the VIN and CSP11 eligibility and to confirm whether leakage is at the cylinder head around the exhaust manifold and matches TSB 01-002/23. Other leak locations and 2021-2023 vehicles require separate diagnosis. Do not buy turbo coolant hoses, a turbocharger or cylinder-head parts from this page; the leak location and program eligibility must be confirmed first.',
      symptoms: ['coolant level drops or leakage is visible', 'coolant leak is found at the cylinder head around the exhaust manifold', 'overheating requires immediate cooling-system diagnosis'],
      summary: 'Corrected the unsupported turbo-line mechanism to Mazda CSP11’s exact 2016-2020 cylinder-head leak program and removed DTC, hose and later-year claims.',
    },
    [IDS.waterPump]: {
      confidence: 'medium',
      description: 'The 2010 NHTSA complaint file contains multiple owner reports that attribute coolant loss, coolant in engine oil, overheating, loss of power or engine damage to an internal water-pump failure. These reports establish that owners described serious events, not that NHTSA or Mazda determined a model-wide defect, a common crossover-pipe-gasket failure or the same mechanism across every frozen 2007-2015 year. The reviewed primary sources do not support automatically replacing a timing set or coolant crossover parts with every suspected pump concern.',
      solution: 'Stop driving if the engine overheats, loses coolant rapidly, loses power or shows milky oil. After it cools, have a technician pressure-test the cooling system, inspect the oil and coolant for cross-contamination, check external leak paths, and distinguish a water-pump leak from a crossover connection, head-gasket or other cooling-system fault before disassembly. If internal coolant contamination is confirmed, assess engine condition before authorizing repair. Do not buy a water pump, timing set, thermostat, crossover gaskets or engine from this page; verify the leak path, damage and exact application first.',
      symptoms: ['coolant level drops, engine overheats or coolant pressure is lost', 'milky oil or coolant/oil cross-contamination requires immediate inspection', 'loss of power or engine damage may follow severe coolant loss'],
      summary: 'Bounded the page to multiple owner reports, removed unsupported crossover and automatic timing-set claims, and added immediate stop-driving and engine-condition safeguards.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-9 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.acEvaporator]: ['NHTSA complaint ODI 10546477 records one owner/dealer evaporator account.', 'Mazda TSB 07-003/22 is a second-generation condenser/outlet-pipe bulletin and is retained only as an explicit applicability exclusion.'],
    [IDS.liftgate]: ['Mazda’s one-page 2016 guidance directly ties U3003:16 to low PLG-module supply voltage and gives a battery/KAM reset procedure.', 'It does not establish powered-strut, latch, harness or module replacement.'],
    [IDS.rearDifferential]: ['Mazda TSB 03-007/15 directly covers 2007-2015 AWD rear noise/vibration caused by cracked mounting rubber.', 'The source does not establish rear coupling or clutch-pack failure.'],
    [IDS.timingV6]: ['NHTSA complaint ODI 11082334 is one owner report involving loss of power and a timing-chain repair diagnosis.', 'No matching Mazda failure bulletin was found in the complete communication inventory.'],
    [IDS.timingTurbo]: ['SA-018/22 is a two-page installation/alignment correction for 2016-2022 timing-component combinations.', 'It does not establish stretch, rattle prevalence, oil causation or a replacement remedy.'],
    [IDS.transferLeak]: ['Mazda TSB 03-002/13 directly covers 2010-2013 AWD right-side transfer oil/dust seals.', 'The bulletin distinguishes transfer gear oil from red ATF and says the transfer assembly need not be removed.'],
    [IDS.turboCoolant]: ['CSP11 directly covers eligible 2016-2020 PYT 2.5T vehicles with cylinder-head coolant leakage around the exhaust manifold.', 'It does not establish turbo coolant-line failure or 2021-2023 program scope.'],
    [IDS.waterPump]: ['Multiple 2010 NHTSA complaints report internal water-pump leakage, coolant/oil mixing, overheating or engine damage.', 'Complaint evidence does not establish prevalence, every model year, crossover-pipe failure or an automatic repair bundle.'],
  };
  return { primaryEvidence: notes[id], limitations: 'Complaint evidence is report-level, bulletin scope is exact to the cited document, and no owner-frequency rate, failed component, retail fitment or warranty eligibility is inferred.' };
}
function commerceDecisionFor(id) {
  const map = {
    [IDS.acEvaporator]: 'No universal retail part; the refrigerant leak location and exact A/C application must be diagnosed.',
    [IDS.liftgate]: 'No universal retail part; battery/charging condition, code, year and failed liftgate component must be verified.',
    [IDS.rearDifferential]: 'No universal retail part; mount damage must be distinguished from coupling, differential and other AWD faults.',
    [IDS.timingV6]: 'No universal retail part; mechanical timing and cooling-system causes must be diagnosed before engine parts are selected.',
    [IDS.timingTurbo]: 'No universal retail part; SA-018/22 is an installation guardrail, not proof that any timing component should be replaced.',
    [IDS.transferLeak]: 'No universal retail part; year, drivetrain, fluid identity and exact seal or alternate leak source must be verified.',
    [IDS.turboCoolant]: 'VIN-scoped dealer program or diagnosis; CSP11 eligibility and cylinder-head leak location must be confirmed.',
    [IDS.waterPump]: 'No universal retail part; leak path, coolant/oil contamination, engine damage and exact application require diagnosis.',
  };
  return map[id];
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: clone(content.dtcCodes || []),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-9').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 8) throw new Error(`Expected 8 Mazda CX-9 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: content.summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-9', completionStatement: 'All 8 frozen Mazda CX-9 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 8 rows contain material source, scope, diagnosis or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'All 8 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records prove only that an owner report exists; they are not converted into defect prevalence, universal causation or model-year coverage.',
      'Frozen titles that overstate or misidentify a mechanism remain indexed identities, while proposal prose explicitly states the primary-source limitation.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'Every named replaceable part has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'cx9-frozen-title-mechanisms-held', severity: 'identity-hold', recordIds: [IDS.acEvaporator, IDS.rearDifferential, IDS.turboCoolant, IDS.waterPump], detail: 'Indexed titles remain unchanged while prose states that the primary sources do not establish evaporator corrosion, coupling failure, turbo coolant-line failure or crossover-pipe failure.' },
      { code: 'cx9-generation-and-year-boundaries', severity: 'scope-correction', recordIds: [IDS.acEvaporator, IDS.liftgate, IDS.timingTurbo, IDS.transferLeak, IDS.turboCoolant], detail: 'Exact 2016, 2016-2022, 2010-2013 and 2016-2020 source scopes are distinguished from broader frozen SEO years.' },
      { code: 'cx9-complaints-not-defect-determinations', severity: 'evidence-boundary', recordIds: [IDS.acEvaporator, IDS.timingV6, IDS.waterPump], detail: 'NHTSA complaint records are treated as owner reports, never as agency or manufacturer defect findings.' },
      { code: 'cx9-repair-bundles-removed', severity: 'safety-correction', recordIds: [IDS.acEvaporator, IDS.liftgate, IDS.rearDifferential, IDS.timingV6, IDS.timingTurbo, IDS.transferLeak, IDS.turboCoolant, IDS.waterPump], detail: 'Automatic replacement bundles, invented intervals, unsupported fluids, fixed costs and unverified retail fitment are removed.' },
      { code: 'all-cx9-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazda CX-9 page is removed, merged, redirected or allowed to lose indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 8, total: 8 }, rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
