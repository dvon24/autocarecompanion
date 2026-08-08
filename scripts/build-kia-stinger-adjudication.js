/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-stinger-adjudication-2026-08-08.json');
const IDS = {
  hecu: 'kia-stinger-abs-hydraulic-electronic-control-unit-engine-bay-fire-risk',
  carbon: 'kia-stinger-carbon-buildup-gdi',
  transmission: 'kia-stinger-dct-shift-harshness',
  brakes: 'kia-stinger-front-brake-rotor-pulsation-premature-brake-wear',
  harness: 'kia-stinger-front-wiring-harness-chafe-short-circuit-fire-risk',
  gauge: 'kia-stinger-inaccurate-fuel-gauge-from-instrument-cluster-software-error',
  rattles: 'kia-stinger-interior-rattles',
  oilPressure: 'kia-stinger-oil-pressure-switch-leak-oil-pressure-warning-light',
  sunroof: 'kia-stinger-panoramic-sunroof-popping-creaking-rattle',
  turbo: 'kia-stinger-turbo-oil-feed-pipe-leak',
};
const REWRITE_IDS = [IDS.hecu, IDS.harness, IDS.gauge, IDS.turbo];
const CLEANUP_IDS = [IDS.carbon, IDS.transmission, IDS.brakes, IDS.rattles, IDS.oilPressure, IDS.sunroof];
const ALL_IDS = [...REWRITE_IDS, ...CLEANUP_IDS];

const CAMPAIGN_SOURCES = {
  harness: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V754000',
  hecu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V518000',
  gauge: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V862000',
  turbo: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V169000',
};
const EXPECTED_CAMPAIGNS = {
  harness: { years: [2018], rows: 1, markers: ['front wiring harness', 'burr on the left fender', 'cover will be installed', 'SC170'] },
  hecu: { years: [2018, 2019, 2020, 2021], rows: 4, markers: ['engine compartment fire', 'new fuse kit', 'park outside and away from structures', 'SC196'] },
  gauge: { years: [2020, 2021], rows: 2, markers: ['software error in the instrument cluster', 'inaccurate fuel gauge', 'update the software', 'SC219'] },
  turbo: { years: [2018, 2019, 2020, 2021, 2022, 2023], rows: 6, markers: ['left turbocharger oil feed pipe and hose assembly', 'leak oil', 'replace the left turbocharger oil feed pipe', 'SC300'] },
};
const CAMPAIGN_TITLES = {
  harness: 'NHTSA Campaign 18V754000 - Stinger Front Wiring-Harness Chafe',
  hecu: 'NHTSA Campaign 20V518000 - Stinger HECU Fire Risk',
  gauge: 'NHTSA Campaign 21V862000 - Stinger Inaccurate Fuel Gauge',
  turbo: 'NHTSA Campaign 24V169000 - Stinger Left Turbo Oil-Feed Pipe Leak',
};
const PDF_SOURCES = {
  tra077: { url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10144236-9999.pdf', sha256: 'ab8a37b6fb2eab2ae8b0b99a3b1dea4a40e15c118387c73a4caa9fc0825b8e8f', bytes: 876455, pages: 7, title: 'Kia TSB TRA077 / SA341 - 2018 Stinger 8AT Static Shift Logic', markers: ['2018MY Stinger (CK)', '8AT', 'Upgrade Event #367', 'Upgrade Event #373'], visuallyInspectedPages: [1, 2, 3, 4, 5, 6, 7] },
  eng237WrongModel: { url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216912-0001.pdf', sha256: '50005402eaaf91aa843c48d843d7962f1d61418d4f7048f5c6779aa3de31ad53', bytes: 368866, pages: 4, title: 'Kia TSB ENG237 - Oil-Pressure Switch Replacement (Stinger Excluded)', markers: ['2014-2015MY Sorento', '2016-2018MY Sorento', '2014-2016MY Cadenza', '2015-2018MY Sedona'], forbiddenMarkers: ['Stinger (CK)'], visuallyInspectedPages: [1, 2, 3, 4] },
  bod309: { url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225558-0001.pdf', sha256: 'ef59414716b2a114d2f526b4bf4f038d5681631c75e342c10cbcdf6f9824906f', bytes: 1562898, pages: 8, title: 'Kia TSB BOD309 - Stinger Inoperative Sunroof From Rear-Sled Separation', markers: ['2018-2023MY Stinger (CK)', 'sunroof is inoperative', 'rear sled', 'guide and sled kit'], visuallyInspectedPages: [1, 2, 3, 4, 5, 6, 7, 8] },
  bod317: { url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237608-0001.pdf', sha256: 'fccc6b6c311d123c2faab0b490aae8d02a02076bc660caae2067ebd8224b4f72', bytes: 1307037, pages: 9, title: 'Kia TSB BOD317 - 2022 Stinger Headliner Noise', markers: ['2022MY Stinger (CK)', 'headliner noise', 'normal body flex', 'Tesa Tape'], visuallyInspectedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedStingerRows: 0 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedStingerRows: 0 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedStingerRows: 0 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedStingerRows: 0 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedStingerRows: 63 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedStingerRows: 66 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedStingerRows: 8 },
  },
  totalExpectedStingerRows: 137,
  modelNameCounts: { STINGER: 137 },
  modelMatchRule: 'KIA rows whose Model field equals STINGER',
  requiredDocumentIds: ['10144236', '10225558', '10237608'],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedStingerRows: 0 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedStingerRows: 30 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  '18V754000': [2018], '20V422000': [2020], '20V518000': [2018, 2019, 2020, 2021],
  '20V560000': [2020, 2021], '21V862000': [2020, 2021], '23V634000': [2018, 2019, 2020, 2021],
  '24V169000': [2018, 2019, 2020, 2021, 2022, 2023],
};
const EXPECTED_COMPLETE_RECALL_INVENTORY = { ...EXPECTED_FLAT_RECALL_INVENTORY };
const MAPPED_CAMPAIGNS = ['18V754000', '20V518000', '21V862000', '24V169000'];
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign)).sort().map((campaignNumber) => ({ campaignNumber, reason: 'Separate Stinger issue identity not represented by a frozen page; proposal-only collection remains deferred until the remaining-make audit is complete.' }));

const CARDS = {
  [IDS.hecu]: { action: 'rewrite_same_identity', campaign: 'hecu', citations: ['hecu'], commerce: 'dealer-only-no-retail-part-safety-recall', reason: '20V518/SC196 exactly supports the frozen 2018-2021 HECU fire-risk identity and dealer-installed fuse-kit remedy; secondary citations and unsupported warning-light claims are removed.', severity: 'high', confidence: 'high', symptoms: ['Burning or melting odor from the engine compartment', 'Smoke or fire while driving or parked'], systems: ['Hydraulic Electronic Control Unit electrical circuit and junction-box fuse protection'], description: 'NHTSA recall 20V518000 (Kia SC196) covers certain 2018-2021 Stinger vehicles. An electrical short within the Hydraulic Electronic Control Unit can cause excessive current and an engine-compartment fire while the vehicle is parked or driving.', solution: 'Check the VIN for recall 20V518000/SC196. Until repaired, park outside and away from structures. A Kia dealer installs a new fuse kit in the electrical junction box free of charge. This is a VIN-specific safety recall, not a retail ABS-module repair.' },
  [IDS.harness]: { action: 'rewrite_same_identity', campaign: 'harness', citations: ['harness'], commerce: 'dealer-only-no-retail-part-safety-recall', reason: '18V754/SC170 exactly supports the frozen 2018 front-harness chafe identity and its inspection, cover and conditional harness-replacement remedy.', severity: 'high', confidence: 'high', symptoms: ['Electrical short, smoke or burning odor', 'Engine- or passenger-compartment fire risk'], systems: ['front wiring harness and left-fender contact point'], description: 'NHTSA recall 18V754000 (Kia SC170) covers certain 2018 Stinger vehicles. The front wiring harness can contact a burr on the left fender, damage its insulation and short, increasing fire risk.', solution: 'Check the VIN for recall 18V754000/SC170. A Kia dealer inspects the front harness; if it is undamaged, the dealer installs a protective cover over the burr area, and if it is damaged, the dealer replaces the harness and installs the cover. The recall remedy is free and VIN-specific, so no retail harness is recommended.' },
  [IDS.gauge]: { action: 'rewrite_same_identity', campaign: 'gauge', citations: ['gauge'], commerce: 'dealer-only-no-retail-part-software-recall', reason: '21V862/SC219 exactly supports the frozen 2020-2021 inaccurate-fuel-gauge identity and instrument-cluster software update.', severity: 'high', confidence: 'high', symptoms: ['Fuel gauge indicates more fuel than is actually present', 'Unexpected fuel exhaustion and engine stall'], systems: ['instrument-cluster fuel-level software'], description: 'NHTSA recall 21V862000 (Kia SC219) covers certain 2020-2021 Stinger vehicles. A software error in the instrument cluster can display an inaccurate fuel level, allowing the vehicle to run out of fuel and stall unexpectedly.', solution: 'Check the VIN for recall 21V862000/SC219. Until repaired, monitor fuel use conservatively rather than relying only on the gauge. A Kia dealer updates the instrument-cluster software free of charge; the official remedy does not call for a retail fuel sender or cluster replacement.' },
  [IDS.turbo]: { action: 'rewrite_same_identity', campaign: 'turbo', citations: ['turbo'], commerce: 'dealer-only-no-retail-part-safety-recall', reason: '24V169/SC300 exactly supports the frozen 2018-2023 3.3T left-turbo oil-feed-pipe leak and dealer replacement. False boost DTCs, speculative turbo damage and generic gasket/gauge commerce are removed.', severity: 'high', confidence: 'high', symptoms: ['Burning-oil odor or smoke from the engine compartment', 'Visible oil leakage near the left turbocharger'], systems: ['left turbocharger oil-feed pipe and hose assembly'], description: 'NHTSA recall 24V169000 (Kia SC300) covers certain 2018-2023 Stinger vehicles with the 3.3L turbocharged engine. The left turbocharger oil-feed pipe and hose assembly can deteriorate and leak oil onto hot exhaust components, increasing fire risk.', solution: 'Check the VIN for recall 24V169000/SC300. If burning oil, smoke or active leakage appears, stop safely and arrange service. A Kia dealer replaces the left turbocharger oil-feed pipe and hose assembly free of charge. Do not infer P0234/P0299, turbocharger damage or a need for generic gaskets or a boost gauge from this recall.' },
  [IDS.carbon]: { action: 'targeted_safety_cleanup_pending_source', citations: [], commerce: 'no-commerce-pending-engine-specific-diagnosis-and-exact-fitment', reason: 'No exact Stinger primary package among 137 communications or seven campaigns establishes all-engine carbon buildup, a 40,000-80,000-mile onset, preventive walnut blasting, chemical treatment or catch-can fitment. Missing-URL forum citations and search commerce cannot support those prescriptions.', severity: 'medium', confidence: 'low', symptoms: ['Rough idle, hesitation, misfire or power loss requiring engine-specific diagnosis'], systems: ['air induction, fuel delivery, ignition, compression and intake valves'], description: 'The frozen page assigns one intake-valve carbon-buildup pattern to every Stinger turbo engine, but the complete official inventory reviewed here contains no exact Kia package establishing that all-engine population, mileage range or preventive-cleaning interval. Rough idle and misfire can also arise from ignition, fueling, air leaks, compression or control faults.', solution: 'Confirm the exact engine and retrieve codes and freeze-frame data, then test ignition, fuel delivery, intake leaks and compression before inspecting intake-valve deposits. Use an engine-specific Kia procedure if deposits are verified. Do not prescribe walnut blasting on a fixed interval, spray cleaner or a catch can from this page without exact evidence and fitment.' },
  [IDS.transmission]: { action: 'targeted_safety_cleanup_pending_source', pdfs: ['tra077'], citations: ['tra077'], commerce: 'dealer-only-no-retail-part-pending-8at-diagnosis-and-production-scope', reason: 'The frozen page falsely calls the Stinger transmission an 8-speed DCT. Kia TRA077 explicitly identifies an 8AT and covers only some 2018 vehicles with an improper static-shift engagement condition, not 2018-2023 harshness, clutch wear, a 30,000-mile DCT-fluid interval or the frozen DTC package.', severity: 'medium', confidence: 'medium', symptoms: ['Improper first-gear engagement during a rapid Park-to-Sport-mode shift on an eligible 2018 vehicle', 'Harsh, delayed or hunting shifts requiring exact 8AT diagnosis'], systems: ['eight-speed automatic transmission, shift-by-cable system and TCU logic'], description: 'The Stinger uses an eight-speed automatic transmission (8AT), not the wet dual-clutch transmission claimed by the frozen page. Kia TRA077/SA341 addresses only certain 2018 2.0T and 3.3T vehicles in listed production ranges that can improperly engage first gear when the shifter is moved rapidly from Park to Sport Mode. It does not establish one 2018-2023 harsh-shift or clutch-pack defect.', solution: 'Confirm the VIN, engine, production date, transmission hardware, fluid condition and exact shift event. For a TRA077-eligible vehicle, a Kia dealer applies TCU Event 367 for the 2.0T or Event 373 for the 3.3T. Diagnose other shift concerns separately. Do not disconnect the battery as a repair, invent a scheduled dual-clutch-fluid service, or buy generic solenoids, filters or clutch parts from this page.' },
  [IDS.brakes]: { action: 'targeted_safety_cleanup_pending_source', citations: [], commerce: 'no-commerce-pending-runout-thickness-and-chassis-diagnosis', reason: 'No exact Stinger Kia communication or campaign establishes one 2018-2023 pad-deposit defect, universal pads-and-rotors remedy, warranty entitlement or Hawk-pad fitment. Forum reports alone do not justify a parts prescription.', severity: 'medium', confidence: 'low', symptoms: ['Brake-pedal pulsation or steering-wheel vibration while braking', 'Abnormal brake wear requiring measurement'], systems: ['brake pads, rotors, hubs, calipers, tires and suspension'], description: 'The frozen page attributes Stinger brake pulsation to uneven pad-material transfer across all indexed years and trims, but the complete official inventory contains no exact Kia package establishing that cause or a universal repair. Similar vibration can result from rotor thickness variation, lateral runout, pad deposits, hub corrosion, caliper drag, tire or suspension conditions.', solution: 'Measure rotor thickness variation and lateral runout and inspect pads, calipers, hubs, tires and suspension before ordering parts. Correct the verified cause and use the current Kia parts catalog for the VIN. Do not promise warranty coverage or prescribe rotors, pads, Hawk products or a bedding procedure from this page alone.' },
  [IDS.rattles]: { action: 'targeted_safety_cleanup_pending_source', pdfs: ['bod317'], citations: ['bod317'], commerce: 'no-commerce-pending-location-and-production-date-diagnosis', reason: 'BOD317 supports only a narrow 2022 headliner-noise condition and tape procedure; it does not establish the frozen 2018-2023 dashboard, A-pillar, door and parcel-shelf aggregation or unrelated dashboard-cover commerce.', severity: 'low', confidence: 'medium', symptoms: ['Interior or headliner noise over uneven roads requiring source localization'], systems: ['headliner, assist-handle brackets, trim clips and adjacent body contact points'], description: 'Kia TSB BOD317 documents an intermittent headliner noise on certain 2022 Stinger vehicles equipped with a sunroof, caused by normal body flex on uneven roads. It provides a specific tape-and-clip procedure. That bulletin does not establish the frozen 2018-2023 dashboard, A-pillar, door-panel and rear-deck aggregation or prove that cold-weather clip tension is a shared cause.', solution: 'Have a passenger or technician localize the noise safely, then verify model year, production date and whether BOD317 applies before removing trim. Follow the exact Kia procedure for a confirmed headliner condition. Do not order dashboard covers or broadly add foam behind air-bag-adjacent A-pillar trim from this page.' },
  [IDS.oilPressure]: { action: 'targeted_safety_cleanup_pending_source', pdfs: ['eng237WrongModel'], citations: ['eng237WrongModel'], commerce: 'no-commerce-pending-mechanical-oil-pressure-and-leak-diagnosis', reason: 'The frozen official citation is false for Stinger: ENG237 lists Sorento, Cadenza and Sedona only. It does not support a 2018-2023 Stinger switch defect, P0521 certainty, intake-removal package or replacement advice.', severity: 'high', confidence: 'low', symptoms: ['Oil-pressure warning light', 'Burning-oil odor or oil leakage requiring immediate diagnosis'], systems: ['engine lubrication system, oil-pressure measurement circuit and leak sources'], description: 'Kia TSB ENG237 does not include the Stinger; its applicability table lists specified Sorento, Cadenza and Sedona vehicles. It therefore cannot support the frozen claim that 2018-2023 Stinger 3.3T vehicles share the bulletin’s oil-pressure-switch failure, P0521 pattern or repair package. An oil-pressure warning can also indicate dangerously low actual pressure.', solution: 'If the oil-pressure warning remains on, stop the engine as soon as it is safe and check the oil level without continuing to drive. A qualified technician should verify actual pressure with the appropriate mechanical test and locate any leak before replacing a switch or opening the intake. Do not assume the pump is healthy, infer P0521 or order switch, gasket or injector-seal parts from ENG237 for a Stinger.' },
  [IDS.sunroof]: { action: 'targeted_safety_cleanup_pending_source', pdfs: ['bod309', 'bod317'], citations: ['bod309', 'bod317'], commerce: 'no-commerce-pending-exact-roof-noise-mechanism-and-production-scope', reason: 'BOD309 covers an inoperative sunroof from rear-sled separation and BOD317 covers narrow 2022 headliner noise. Neither establishes the frozen 2018-2023 metal-on-metal rail protrusion, thermal-cycle mechanism or Krytox/felt repair.', severity: 'low', confidence: 'low', symptoms: ['Popping, creaking or rattling near the panoramic roof requiring source localization'], systems: ['panoramic roof assembly, guide and sled hardware, headliner and body contact points'], description: 'The complete official inventory contains two different Stinger roof-area packages: BOD309 addresses an inoperative sunroof caused by rear-sled separation, while BOD317 addresses intermittent headliner noise on certain 2022 vehicles. Neither bulletin establishes the frozen all-year rail-protrusion and thermal-expansion mechanism for popping or creaking.', solution: 'Document whether the roof operates normally and when the noise occurs, then have the roof assembly and headliner inspected against the VIN, production date and exact symptom. Use BOD309 only for confirmed inoperative-roof sled separation and BOD317 only for its eligible headliner condition. Do not insert felt, foam or lubricant into the roof assembly from this page.' },
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
    symptoms: clone(card.symptoms), affectedSystems: clone(card.systems), dtcCodes: [],
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
  const evidence = [{ kind: 'complete-official-inventory', manufacturerCommunicationCount: 137, recallRowCount: 30, campaignCount: 7, verifiedOn: '2026-08-08', observation: 'The frozen, hash-bound Stinger manufacturer-communication and recall inventories were scanned completely before adjudication.' }];
  if (card.campaign) evidence.push({ kind: 'official-nhtsa-campaign', key: card.campaign, url: CAMPAIGN_SOURCES[card.campaign], expected: EXPECTED_CAMPAIGNS[card.campaign], verifiedOn: '2026-08-08', observation: card.reason });
  if (card.pdfs?.length) evidence.push({ kind: 'official-pdf-review', documentKeys: card.pdfs, sources: Object.fromEntries(card.pdfs.map((key) => [key, PDF_SOURCES[key]])), allPagesRenderedAndVisuallyInspected: true, verifiedOn: '2026-08-08', observation: card.reason });
  evidence.push({ kind: 'citation-commerce-relation-review', removedCitationCount: row.citations?.length || 0, removedCommerceCount: row.communityRecommendations?.length || 0, removedRelatedIssueCount: row.relatedIssueIds?.length || 0, verifiedOn: '2026-08-08', observation: 'Secondary, missing-URL, wrong-model and search-style material is not carried into the proposal. Exact official sources are retained only where vehicle and remedy scope match; no retail link is invented without exact part-number and fitment proof.' });
  return evidence;
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Stinger');
  if (modelRows.length !== 10) throw new Error(`expected 10 Stinger rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS.slice().sort())) throw new Error('frozen Stinger ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const proposal = proposalFor(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'Preserve every indexed Stinger ID, title, category, year set, trim set, engine set and publication state while correcting false source scope, false transmission type, false DTCs, unsafe advice and unsupported replacement or commerce claims.', commerceDecision: commerceDecisionFor(current.id), changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Stinger',
    completionStatement: 'All ten frozen Stinger records receive primary-source adjudication. Four exact recall identities receive bounded rewrites and six contradicted, overbroad or unsupported identities receive targeted safety cleanup while every indexed identity remains published and unchanged.',
    applicationGate: { status: 'blocked', blockerRecordIds: CLEANUP_IDS.slice().sort(), reason: 'Six Stinger identities retain an immutable title or scope broader than the exact primary evidence, or lack an exact Kia package. Independent review is required before any application.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.', 'All ten Stinger IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.', 'A blocker cannot conceal a false transmission type, false campaign, false DTC, unsafe instruction, wrong-model citation, secondary-only claim, search commerce or unverified relation; targeted cleanup removes those claims while preserving the page.', 'All 137 manufacturer communications and all 30 recall rows/seven campaigns in the complete frozen Stinger inventories are accounted for; three separate campaign identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 10 },
    observations: [
      { code: 'stinger-four-exact-recall-identities-bounded', severity: 'critical', recordIds: REWRITE_IDS.slice().sort(), detail: '18V754, 20V518, 21V862 and 24V169 directly support the four same-identity recall rewrites and VIN-specific dealer remedies.' },
      { code: 'stinger-false-dct-identity-corrected', severity: 'critical-correction', recordIds: [IDS.transmission], detail: 'The Stinger uses an 8AT, not the claimed wet DCT. TRA077 supports only a narrow 2018 static-shift software condition; DCT fluid, clutch, DTC and generic parts claims are removed.' },
      { code: 'stinger-wrong-model-oil-pressure-citation-corrected', severity: 'critical-correction', recordIds: [IDS.oilPressure], detail: 'ENG237 excludes Stinger and lists only specified Sorento, Cadenza and Sedona vehicles. The false Stinger applicability, P0521 certainty and switch-replacement prescription are removed.' },
      { code: 'stinger-roof-and-rattle-bulletins-not-stretched', severity: 'critical', recordIds: [IDS.rattles, IDS.sunroof], detail: 'BOD309 and BOD317 describe different, narrow conditions and are not stretched into the frozen all-year interior and sunroof-noise aggregations.' },
      { code: 'stinger-unverified-carbon-and-brake-commerce-removed', severity: 'deeplink-correction', recordIds: [IDS.carbon, IDS.brakes], detail: 'Unverified chemical, catch-can, pad and rotor prescriptions are removed; no retail link is supplied without exact part-number and fitment proof.' },
      { code: 'stinger-three-new-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS.map((item) => item.campaignNumber), detail: 'MDPS, fuel-pump jet-nozzle and high-pressure-fuel-pump campaigns are separate issue identities and remain proposal-deferred until the remaining-make audit is complete.' },
      { code: 'all-stinger-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS.slice().sort(), detail: 'Every Stinger ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, expectedCampaigns: EXPECTED_CAMPAIGNS, pdfSources: PDF_SOURCES,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, mappedCampaigns: MAPPED_CAMPAIGNS, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 4, targeted_safety_cleanup_pending_source: 6, total: 10 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { ALL_IDS, CAMPAIGN_SOURCES, CAMPAIGN_TITLES, CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MAPPED_CAMPAIGNS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_IDS, SNAPSHOT, actionFor, commerceDecisionFor, evidenceFor, proposalFor, reasonFor };
