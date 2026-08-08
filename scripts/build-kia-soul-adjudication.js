/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-soul-adjudication-2026-08-08.json');
const IDS = {
  dct: 'kia-soul-7-speed-dual-clutch-judder-premature-clutch-failure',
  hecu: 'kia-soul-abs-hecu-module-brake-fluid-leak-causing-engine-compartment',
  catalytic: 'kia-soul-catalytic-converter-engine-damage',
  evMotor: 'kia-soul-electric-motor-bearing-ev',
  mdps: 'kia-soul-motor-driven-power-steering-flexible-coupling-noise',
  sunroof: 'kia-soul-panoramic-sunroof-spontaneous-shattering',
  piston: 'kia-soul-piston-ring-oil-consumption',
  pinion: 'kia-soul-steering-pinion-separation',
};
const REWRITE_IDS = [IDS.catalytic, IDS.mdps, IDS.piston, IDS.pinion];
const CLEANUP_IDS = [IDS.dct, IDS.hecu, IDS.evMotor, IDS.sunroof];
const ALL_IDS = [...REWRITE_IDS, ...CLEANUP_IDS];

const CAMPAIGN_SOURCES = {
  hecu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V652000',
  catalytic: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=19V120000',
  piston: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V259000',
  pinion: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=17V608000',
};
const EXPECTED_CAMPAIGNS = {
  hecu: { years: [2011, 2012, 2013], rows: 3, markers: ['electrical short', 'park outside and away from structures', 'replace the HECU fuse', 'SC284'] },
  catalytic: { years: [2012, 2013, 2014, 2015, 2016], rows: 5, markers: ['1.6L Gasoline Direct Injection', 'catalytic converter', 'Catalytic Overheating Protection', 'SC176'] },
  piston: { years: [2020, 2021], rows: 2, markers: ['piston oil rings may not have been properly heat-treated', 'Piston Ring Noise Sensing System', 'SC209'] },
  pinion: { years: [2014, 2015, 2016], rows: 3, markers: ['pinion plug', 'steering gear assembly', 'SC155'] },
};
const CAMPAIGN_TITLES = {
  hecu: 'NHTSA Campaign 23V652000 - Soul HECU Fire Risk',
  catalytic: 'NHTSA Campaign 19V120000 - Soul Catalytic-Converter Overheating',
  piston: 'NHTSA Campaign 21V259000 - Soul Piston Oil Rings',
  pinion: 'NHTSA Campaign 17V608000 - Soul Steering Pinion Plug',
};

const PDF_SOURCES = {
  tra083: { url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10185033-0001.pdf', sha256: '2e798351791d71efc2361f2a3950d5da517ca1df04599b15d0fd026c19416cfa', pages: 11, title: 'Kia TSB TRA083 - 7-Speed DCT Judder Inspection and Dual-Clutch Replacement', markers: ['Soul 1.6L T-GDI (PS)', 'Soul 1.6L T-GDI (SK3)', 'Dual Clutch Assembly must be replaced'] },
  tra098OptimaOnly: { url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200552-0001.pdf', sha256: 'a6127e90c3de68cb708083b3a8400b1bdc1ba9770451be51a74cf3fe336e0f21', pages: 8, title: 'Kia TSB TRA098 - Optima-Only DCT Anti-Judder Logic', markers: ['Optima (JFa)', 'Upgrade Event #541'] },
  hecu573: { url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V652-3815.PDF', sha256: 'a9538466fbfe576dfa188c07207d2fea2213db30be7a05dd5e162c9bfa86f206', pages: 7, title: 'Part 573 Safety Recall Report 23V652', markers: ['2011-2013 Kia Soul', '349,309 units', 'exact cause of the electrical short circuit remains unknown'] },
  sc176y: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009076-0001.pdf', sha256: '2e378aba602fd8e3790f4c0d03a5bf66d6083b5ff0faec058a4c542432f6b434', pages: 7, title: 'Kia SC176Y - Soul Catalytic-Converter and Engine Inspection', markers: ['2012-2016MY Soul', 'P0420', 'verify that the vehicle is included in the list of affected VINs'] },
  cha074: { url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159268-0001.pdf', sha256: '7b6e08f301bb325332ece13041d777d2a859de3c20bc868a4621dee9bdda63cd', pages: 15, title: 'Kia TSB CHA074 - Soul MDPS Flexible Coupling Replacement', markers: ['Soul (AM) / 2010~2013', 'premature wear of the flexible coupling', '56315 2K000FFF'] },
  wty013: { url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159272-0001.pdf', sha256: 'a922588925a7ffbf57dbad0faf1cbaba02680358afdfb9ed7205fff8b8fe5860', pages: 2, title: 'Kia WTY013 - 2012-2013 Soul MDPS Warranty Extension', markers: ['2012-2013 MY Soul', '10 years', 'unlimited mileage'] },
  sst082: { url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017169-0001.pdf', sha256: '17a7d0d7dea9c5597439edfb10ec0e8a6f4c411de40bf6ed94ae4e30badfe803', pages: 7, title: 'Kia TSB SST082 - Piston Noise Sensing System Inspection', markers: ['piston oil ring(s)', 'increased oil consumption', 'P132700'] },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedSoulRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedSoulRows: 0 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedSoulRows: 2 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedSoulRows: 14 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedSoulRows: 223 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedSoulRows: 212 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedSoulRows: 43 },
  },
  totalExpectedSoulRows: 494,
  requiredDocumentIds: ['10159268', '10159270', '10159271', '10159272', '10159443', '10159445', '10162049', '10168852', '10185033', '10200551', '10209424', '10210219', '11001836', '11009076', '11017169', '11022844'],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedSoulRows: 0 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedSoulRows: 66 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '10V388000': [2010], '13V114000': [2010, 2011], '14V822000': [2010, 2011, 2012, 2013], '15V123000': [2014, 2015],
  '17V608000': [2014, 2015, 2016], '19V120000': [2012, 2013, 2014, 2015, 2016], '20V750000': [2014, 2015],
  '21V259000': [2020, 2021], '22V031000': [2017, 2018, 2019], '22V096000': [2014], '23V298000': [2023],
  '23V531000': [2023], '23V652000': [2011, 2012, 2013], '23V830000': [2023], '25V099000': [2021, 2022, 2023],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = { ...EXPECTED_FLAT_RECALL_INVENTORY };
const MAPPED_CAMPAIGNS = ['17V608000', '19V120000', '21V259000', '23V652000'];
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign)).sort().map((campaignNumber) => ({ campaignNumber, reason: 'Separate issue identity not represented by a frozen Soul page; proposal-only collection remains deferred until the remaining-make audit is complete.' }));

const CARDS = {
  [IDS.dct]: { action: 'targeted_safety_cleanup_pending_source', pdfs: ['tra083', 'tra098OptimaOnly'], citations: ['tra083'], commerce: 'dealer-only-no-retail-part-pending-production-date-and-kds-test', reason: 'TRA083 supports only listed Soul production ranges, while the cited TRA098 anti-judder update is Optima-only. The complete inventory does not establish one 2017-2020 glazed-clutch population or P0810 identity.', severity: 'medium', confidence: 'medium', dtcCodes: [], symptoms: ['Body vibration or judder while accelerating from a stop requires production-date and KDS verification'], systems: ['7-speed DCT dual-clutch assembly, synchronizer hardware and TCU logic'], description: 'Kia TSB TRA083 documents clutch judder on limited 1.6L turbo Soul populations: PS vehicles built August 8-October 27, 2016 and SK3 vehicles built November 24, 2018-April 2, 2020. It defines judder through a KDS creep-driving measurement. The frozen page overgeneralizes that evidence to every indexed 2017-2020 vehicle and cites TRA098, an Optima-only anti-judder update.', solution: 'Verify the VIN, production date, transmission hardware and symptom before repair. For a TRA083-eligible vehicle, a Kia dealer or qualified DCT technician performs the KDS judder measurement and replaces the dual-clutch assembly with the bulletin-required TCU procedure only when indicated. Do not apply Optima Event 541, diagnose P0810 or assume every 2017-2020 Soul shares one failure cause from this page.' },
  [IDS.hecu]: { action: 'targeted_safety_cleanup_pending_source', campaign: 'hecu', pdfs: ['hecu573'], citations: ['hecu', 'hecu573'], commerce: 'dealer-only-no-retail-part-safety-recall', reason: '23V652/SC284 exactly covers 2011-2013 Soul HECU fire risk, but Kia’s Part 573 report says the short-circuit cause remains unknown; the immutable title’s brake-fluid causal claim is more definite than the filing.', severity: 'high', confidence: 'medium', dtcCodes: [], symptoms: ['MIL or ABS warning light', 'Burning or melting odor', 'Smoke from the engine compartment'], systems: ['Hydraulic Electronic Control Unit electrical circuit and fuse'], description: 'NHTSA recall 23V652000 (Kia SC284) covers 349,309 certain 2011-2013 Soul vehicles equipped with Electronic Stability Control. The HECU may experience an electrical short and cause an engine-compartment fire while parked or driving. Kia’s Part 573 report states that the exact cause of the short remains unknown, so the frozen title’s brake-fluid causal wording is not treated as established fact.', solution: 'Check the VIN for recall 23V652000. Until repaired, park outside and away from structures. A Kia dealer installs lower-amperage HECU fuse protection free of charge. Do not buy an ABS module or infer a brake-fluid repair from this page; the recall filing does not establish the exact short-circuit cause.' },
  [IDS.catalytic]: { action: 'rewrite_same_identity', campaign: 'catalytic', pdfs: ['sc176y'], citations: ['catalytic', 'sc176y'], commerce: 'dealer-only-no-retail-part-safety-recall-and-vin-bound-follow-up', reason: '19V120/SC176 exactly supports the 2012-2016 1.6L GDI identity, and SC176Y supplies the later VIN-bound P0420 inspection path. P0430 and unrelated radiator/coolant commerce are removed.', severity: 'high', confidence: 'high', dtcCodes: ['P0420'], symptoms: ['Malfunction indicator lamp with P0420', 'Loss of power, abnormal combustion or engine damage'], systems: ['1.6L GDI catalytic converter, ECU protection logic and engine'], description: 'NHTSA recall 19V120000 (Kia SC176) covers 2012-2016 Soul vehicles with the 1.6L GDI engine. Excessive exhaust-gas temperature can damage the catalytic converter, leading to abnormal combustion, piston damage, connecting-rod failure, stall or fire. Kia’s later SC176Y bulletin addresses certain previously repaired vehicles with P0420, with or without a P030X misfire code.', solution: 'Check the VIN and campaign history with Kia. SC176 calls for the Catalytic Overheating Protection ECU update and replacement of a damaged converter or engine as necessary, free of charge. For an eligible SC176Y vehicle with P0420, the dealer follows Kia’s compression-test flow before choosing converter or engine replacement. Do not infer P0430 or purchase radiator, coolant or generic exhaust parts from this page.' },
  [IDS.evMotor]: { action: 'targeted_safety_cleanup_pending_source', citations: [], commerce: 'no-commerce-pending-exact-ev-drivetrain-diagnosis', reason: 'No exact Kia communication among 494 rows or campaign among 15 establishes a 2015-2020 front-motor-bearing defect, cold-climate cause, bearing-only aftermarket repair or price range.', severity: 'medium', confidence: 'low', dtcCodes: [], symptoms: ['Whine or grinding that changes with vehicle speed requires EV drivetrain diagnosis'], systems: ['Soul EV drive motor, reduction gear, shafts and wheel bearings'], description: 'The frozen page labels a 2015-2020 Soul EV whine as premature front-motor-bearing wear, but the complete official Soul inventories reviewed here contain no exact Kia package establishing that all-year defect or a cold-climate cause. Similar noise can originate in the drive motor, reduction gear, shafts, tires or wheel bearings.', solution: 'Record when the noise occurs and whether it changes with vehicle speed, motor torque, regeneration or steering, then have an EV-qualified technician isolate the source with the exact VIN and service information. Do not add gear oil, open the high-voltage drive unit, press in generic bearings or buy a drivetrain gasket kit from this page.' },
  [IDS.mdps]: { action: 'rewrite_same_identity', pdfs: ['cha074', 'wty013'], citations: ['cha074', 'wty013'], commerce: 'dealer-only-no-retail-part-steering-fitment-and-calibration', reason: 'CHA074 exactly supports 2010-2013 Soul coupling wear and replacement. WTY013 extends only 2012-2013 coverage, so the warranty boundary is made explicit and the whole-column fallback is removed.', severity: 'medium', confidence: 'high', dtcCodes: [], symptoms: ['Clicking or knocking from the MDPS while turning the steering wheel at a stop'], systems: ['column-mounted MDPS motor flexible coupling'], description: 'Kia TSB CHA074 covers 2010-2013 Soul vehicles in its listed production range and attributes a knock or click while turning at a stop to premature wear of the MDPS motor’s flexible coupling. Kia WTY013 separately extended flexible-coupling coverage to 10 years/unlimited mileage for 2012-2013 Soul vehicles; it does not extend every other MDPS component or the 2010-2011 vehicles.', solution: 'Have the noise diagnosed against CHA074 and the exact VIN. If premature coupling wear is confirmed, follow Kia’s Soul-specific procedure to replace only the improved flexible coupling. Check WTY013 eligibility for a 2012-2013 vehicle. Do not order a generic coupler or replace the full MDPS column without the current Kia parts catalog, fitment and steering-service procedure.' },
  [IDS.sunroof]: { action: 'targeted_safety_cleanup_pending_source', citations: [], commerce: 'no-commerce-pending-exact-glass-cause-and-fitment', reason: 'No exact Soul communication or campaign in the complete inventories supports the frozen all-year spontaneous-defect, investigation-outcome, lawsuit-outcome or ceramic-film claims; all citations are secondary.', severity: 'medium', confidence: 'low', dtcCodes: [], symptoms: ['Cracked or shattered roof glass', 'A loud bang or falling tempered-glass fragments'], systems: ['panoramic roof glass, frame and installation'], description: 'The frozen page asserts one spontaneous panoramic-roof defect across 2014-2020 Soul vehicles and adds NHTSA-investigation and lawsuit conclusions, but no exact Soul primary package appears in the 494 manufacturer communications or 15 recall campaigns reviewed here. The three frozen citations are secondary and do not establish one all-year failure mechanism.', solution: 'Stop using the roof if the glass is cracked or unstable, keep occupants away from loose fragments and arrange glass or dealer inspection. Document the VIN, glass markings, impact evidence and failure conditions for an insurance or manufacturer claim. Do not apply aftermarket film or assume a manufacturing defect, road-debris cause or recall eligibility from this page alone.' },
  [IDS.piston]: { action: 'rewrite_same_identity', campaign: 'piston', pdfs: ['sst082'], citations: ['piston', 'sst082'], commerce: 'dealer-only-no-retail-part-engine-safety-and-vin-bound-coverage', reason: '21V259/SC209 supports 2020-2021 recall coverage, while NHTSA communication 11017169/SST082 supports a VIN-driven PNSS inspection identity through 2023. The frozen 2022-2023 recall promise, one-quart threshold and unrelated DTCs are removed.', severity: 'high', confidence: 'high', dtcCodes: ['P1327'], symptoms: ['Increasing oil consumption', 'Abnormal engine noise or P1327', 'Oil-pressure warning light'], systems: ['2.0L Nu MPI piston oil rings, cylinder walls and PNSS diagnostics'], description: 'NHTSA recall 21V259000 (Kia SC209) covers certain 2020-2021 Soul vehicles with 2.0L Nu MPI engines whose piston oil rings may not have been properly heat-treated. Kia communication 11017169/SST082 indexes a later PNSS vibration-inspection process to certain 2020-2023 Soul vehicles and describes ring-related cylinder-wall damage, increased oil consumption, abnormal noise, oil-pressure warning and P1327. That later bulletin does not make every 2022-2023 vehicle part of recall 21V259.', solution: 'Check the VIN for SC209 or the current Kia PNSS program and monitor the oil level using the owner-manual procedure. A Kia dealer uses the VIN-driven KDS inspection; eligible recall vehicles receive inspection, PNSS software and engine replacement when necessary. Do not promise a one-quart-per-1,000-mile threshold, apply recall coverage to every 2022-2023 Soul, infer P0420/P0171/P0174 or buy oil and filters as a remedy for damaged rings.' },
  [IDS.pinion]: { action: 'rewrite_same_identity', campaign: 'pinion', citations: ['pinion'], commerce: 'dealer-only-no-retail-part-critical-steering-recall', reason: '17V608/SC155 exactly supports the 2014-2016 Soul pinion-plug identity and superseding remedy. Tie-rod and remanufactured-rack search commerce are not the recall repair.', severity: 'high', confidence: 'high', dtcCodes: [], symptoms: ['Increased steering play or loss of steering control may occur'], systems: ['steering-gear pinion plug and pinion gear'], description: 'NHTSA recall 17V608000 (Kia SC155) covers 2014-2016 Soul vehicles. The pinion plug may allow the pinion gear to separate from the steering-gear assembly, causing loss of steering and increasing crash risk. The campaign supersedes 14V332 and 15V736, including vehicles previously repaired under those campaigns.', solution: 'Check the VIN for recall 17V608000 and arrange prompt Kia dealer service. The dealer inspects and secures the pinion plug or replaces the steering-gear assembly as necessary, free of charge. If steering control changes, stop safely and arrange towing. Do not buy tie-rod ends or a remanufactured rack as a substitute for the recall remedy.' },
};

function actionFor(id) { return CARDS[id].action; }
function reasonFor(id) { return CARDS[id].reason; }
function commerceDecisionFor(id) { return CARDS[id].commerce; }
function citationFor(key) {
  if (CAMPAIGN_SOURCES[key]) return { type: 'recall', title: CAMPAIGN_TITLES[key], url: CAMPAIGN_SOURCES[key] };
  return { type: 'tsb', title: PDF_SOURCES[key].title, url: PDF_SOURCES[key].url };
}
function proposalFor(row) {
  const card = CARDS[row.id];
  const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: card.description, solution: card.solution, severity: card.severity, confidence: card.confidence,
    symptoms: clone(card.symptoms), affectedSystems: clone(card.systems), dtcCodes: clone(card.dtcCodes),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: card.citations.map(citationFor), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: `${card.action === 'rewrite_same_identity' ? 'Official-source same-identity rewrite' : 'Targeted accuracy and safety cleanup'}: ${card.reason}`,
    relatedIssueIds: [],
  });
  return proposal;
}
function evidenceFor(row) {
  const card = CARDS[row.id];
  const evidence = [{ kind: 'complete-official-inventory', manufacturerCommunicationCount: 494, recallRowCount: 66, campaignCount: 15, verifiedOn: '2026-08-08', observation: 'The frozen, hash-bound Soul manufacturer-communication and recall inventories were scanned completely before adjudication.' }];
  if (card.campaign) evidence.push({ kind: 'official-nhtsa-campaign', key: card.campaign, url: CAMPAIGN_SOURCES[card.campaign], expected: EXPECTED_CAMPAIGNS[card.campaign], verifiedOn: '2026-08-08', observation: card.reason });
  if (card.pdfs?.length) evidence.push({ kind: 'official-pdf-review', documentKeys: card.pdfs, sources: Object.fromEntries(card.pdfs.map((key) => [key, PDF_SOURCES[key]])), allPagesRenderedAndVisuallyInspected: true, verifiedOn: '2026-08-08', observation: card.reason });
  evidence.push({ kind: 'citation-commerce-relation-review', removedCitationCount: row.citations?.length || 0, removedCommerceCount: row.communityRecommendations?.length || 0, removedRelatedIssueCount: row.relatedIssueIds?.length || 0, verifiedOn: '2026-08-08', observation: 'Secondary, missing-URL, wrong-model and search-style material is not carried into the proposal. Exact official sources are retained only where their vehicle and remedy scope matches.' });
  return evidence;
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Soul');
  if (modelRows.length !== 8) throw new Error(`expected 8 Soul rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS.slice().sort())) throw new Error('frozen Soul ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const proposal = proposalFor(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'Preserve every indexed Soul ID, title, category, year set, trim set, engine set and publication state while correcting false source scope, false DTCs, unsafe advice and unsupported replacement claims.', commerceDecision: commerceDecisionFor(current.id), changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Soul',
    completionStatement: 'All eight frozen Soul records receive primary-source adjudication. Four exact identities receive bounded rewrites and four conflicted or unsupported identities receive targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: { status: 'blocked', blockerRecordIds: CLEANUP_IDS.slice().sort(), reason: 'Four Soul identities retain an immutable scope or title broader than the exact primary evidence, or lack an exact Kia package. Independent review is required before any application.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.', 'All eight Soul IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.', 'A blocker cannot conceal a false campaign, false DTC, unsafe instruction, wrong-model citation, secondary-only claim, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.', 'All 494 manufacturer communications and all 66 recall rows/15 campaigns in the complete frozen Soul inventories are accounted for; 11 separate campaign identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 8 },
    observations: [
      { code: 'soul-dct-optima-only-citation-removed', severity: 'critical', recordIds: [IDS.dct], detail: 'The cited TRA098 anti-judder PDF is Optima-only. TRA083 is bounded to listed Soul production ranges, and P0810 plus universal glazed-clutch claims are removed.' },
      { code: 'soul-hecu-cause-bounded', severity: 'critical', recordIds: [IDS.hecu], detail: '23V652/SC284 exactly covers 2011-2013 Soul, but the Part 573 report states that the exact electrical-short cause remains unknown; the title’s fluid-cause wording is not repeated as fact.' },
      { code: 'soul-catalytic-campaign-and-dtc-bounded', severity: 'critical', recordIds: [IDS.catalytic], detail: '19V120/SC176 and SC176Y support the exact 1.6L identity and P0420 path; P0430 plus radiator/coolant commerce are removed.' },
      { code: 'soul-piston-recall-boundary-corrected', severity: 'critical', recordIds: [IDS.piston], detail: '21V259 recall coverage is limited to 2020-2021 Soul. SST082 supports VIN-driven PNSS inspection through 2023 without making every 2022-2023 vehicle recall-eligible.' },
      { code: 'soul-mdps-warranty-boundary-corrected', severity: 'critical', recordIds: [IDS.mdps], detail: 'CHA074 covers 2010-2013 coupling repair, but WTY013 warranty extension is limited to 2012-2013 vehicles.' },
      { code: 'soul-unsupported-ev-and-sunroof-claims-removed', severity: 'critical', recordIds: [IDS.evMotor, IDS.sunroof], detail: 'Unsupported bearing mechanism, repair costs, investigation/lawsuit conclusions, film advice and generic commerce are removed while both pages remain published.' },
      { code: 'soul-11-new-campaign-identities-deferred', severity: 'methodology', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS.map((item) => item.campaignNumber), detail: 'Complete-inventory campaigns not represented by a frozen page remain proposal-deferred until the remaining-make audit is complete.' },
      { code: 'all-soul-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS.slice().sort(), detail: 'Every Soul ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, expectedCampaigns: EXPECTED_CAMPAIGNS, pdfSources: PDF_SOURCES,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, mappedCampaigns: MAPPED_CAMPAIGNS, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 4, targeted_safety_cleanup_pending_source: 4, total: 8 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { ALL_IDS, CAMPAIGN_SOURCES, CAMPAIGN_TITLES, CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MAPPED_CAMPAIGNS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_IDS, SNAPSHOT, actionFor, commerceDecisionFor, evidenceFor, proposalFor, reasonFor };
