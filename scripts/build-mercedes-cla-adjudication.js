/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-cla-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CLA', 'CLA-CLASS', 'CLA CLASS', 'CLA180', 'CLA 180', 'CLA200', 'CLA 200', 'CLA220', 'CLA 220', 'CLA250', 'CLA 250', 'CLA250 4MATIC', 'CLA 250 4MATIC', 'CLA35 AMG', 'CLA 35 AMG', 'AMG CLA35', 'AMG CLA 35', 'CLA45 AMG', 'CLA 45 AMG', 'AMG CLA45', 'AMG CLA 45', 'CLA45', 'CLA 45']);
const SEARCH_TERMS = Object.freeze(['7G-DCT', '724.0', 'shudder', 'mechatronics', 'auxiliary battery', 'backup battery', 'camshaft', 'roof panel', 'panoramic', 'brake wear', 'caliper', 'water leak', 'trunk', 'footwell', 'COMAND', 'Audio 20', 'infotainment', 'strut', 'suspension noise', 'turbo oil', 'oil leak']);
const IDS = Object.freeze({
  dct: 'mercedes-benz-cla-7g-dct-dual-clutch-transmission-shudder-mechatronics-failure',
  auxiliaryBattery: 'mercedes-benz-cla-auxiliary-battery-malfunction-warning',
  camshaft: 'mercedes-benz-cla-m270-m274-camshaft-breakage-from-defective-weld-safety-recal',
  roof: 'mercedes-benz-cla-panoramic-roof-front-panel-detachment-safety-recall',
  rearBrakes: 'mercedes-benz-cla-premature-rear-brake-wear-caliper-piston-sticking',
  waterLeak: 'mercedes-benz-cla-water-leaks-into-trunk-rear-footwell',
  comand: 'mercedes-cla-comand-freeze-2014',
  strut: 'mercedes-cla-front-strut-noise-2014',
  turboOil: 'mercedes-cla-m270-turbo-oil-leak-2014',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.comand, IDS.roof].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.comand, IDS.strut, IDS.turboOil].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10151943', '10205154', '10205234', '10205237', '11012904', '11021107', '11029964']);
const CAMPAIGNS = Object.freeze(['15V426000', '15V662000', '16V335000', '16V901000', '17V080000', '17V114000', '17V177000', '17V627000', '18V514000', '19V131000', '19V219000', '19V685000', '19V787000', '19V892000', '20V089000', '21V034000', '21V058000', '21V072000', '21V124000', '21V197000', '21V229000', '21V354000', '21V961000', '21V989000', '22V125000', '22V232000', '22V365000', '23V232000', '23V732000', '23V854000', '26V481000']);

const PDF_SOURCES = Object.freeze({
  comandBulletin: {
    title: 'Mercedes-Benz XENTRY LI82.85-P-055695: COMAND does not start or display remains dark on model 117',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10205237-9999.pdf',
    localPath: 'C:/tmp/mercedes-cla-sources/10205237.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 42155,
    sha256: '1ef55a29178823f18d6c0b1c3d2843787884ba646e8c7b07ac709b91d3e6ad50',
  },
  camshaftRecall: {
    title: 'Mercedes-Benz recall 2015100006 / NHTSA 15V-662: 2015-2016 CLA, GLA and SLK camshaft weld defect',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCMN-15V662-2488.pdf',
    localPath: 'C:/tmp/mercedes-cla-sources/15V662.pdf', pages: 1, visualPages: [1], bytes: 83497,
    sha256: '7275cad032b61a5669249bdae2228828279b436ca164abd6f4b4075b8e9dd885',
  },
  roofRecall2021: {
    title: 'Mercedes-Benz owner notice / NHTSA 21V-197: front stationary panoramic-roof panel detachment',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RIONL-21V197-4284.pdf',
    localPath: 'C:/tmp/mercedes-cla-sources/21V197.pdf', pages: 2, visualPages: [1, 2], bytes: 134964,
    sha256: 'd150d56ef9e063da3a78053fd4cb9d2d1d122f87f0e9c1caca8d141f71ca659d',
  },
  roofRecall2023: {
    title: 'Mercedes-Benz recall campaign 2024010012 / NHTSA 23V-854: replace front stationary roof panel',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCMN-23V854-3714.pdf',
    localPath: 'C:/tmp/mercedes-cla-sources/23V854.pdf', pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 880645,
    sha256: '5200779c185f8f98ad4b1b7444b1fa0fb2669d6ad6044badf0902b82907c45fb',
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 47, '2015-2019': 104, '2020-2024': 492, '2025-2026': 508 },
  totalRows: 1151, relevantRowCount: 115, uniqueRelevantCommunications: 41, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 2661 }, totalRows: 2661,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.dct]: {
    description: 'Mercedes communication 10151943 documents only a scratching noise when changing from D to R while a 7G-DCT is cold. It does not establish the frozen 2014-2020 CLA pattern of low-speed shudder, clutch-pack wear, mechatronics failure or universal transmission replacement. Those symptoms can arise from software, adaptation, clutch, hydraulic, electrical or internal mechanical conditions that require exact fault data.',
    solution: 'Confirm the installed transmission by VIN, preserve transmission fault data and adaptations, reproduce the symptom under controlled conditions and follow the exact XENTRY diagnostic path. Do not buy a clutch, mechatronics unit, valve body or transmission from this page; the failure and VIN-level fitment are not established.',
    symptoms: ['installed transmission confirmed by VIN', 'exact speed, temperature and shift event recorded', 'fault data and adaptations preserved before parts selection'], affectedSystems: ['7G-DCT transmission', 'transmission controls'],
    conflict: 'The exact reviewed communication is a cold D-to-R scratching-noise condition, not the frozen shudder/mechatronics identity.', evidence: ['Communication 10151943 is limited to scratching noise while changing D to R with a cold 7G-DCT.', 'No exact reviewed primary record proves the frozen clutch-wear and mechatronics-failure aggregation.'], summary: 'Separated the exact cold D-to-R noise communication from the unsupported shudder/mechatronics identity.', sources: ['datasets'],
  },
  [IDS.auxiliaryBattery]: {
    description: 'The frozen page relies on secondary and forum sources and assumes every auxiliary-battery warning is failure of a small secondary 12V battery with a four-to-six-year life. The reviewed CLA manufacturer corpus does not establish that universal component, lifespan, part number or remedy across 2014-2023. Depending on model and equipment, the message can require different low-voltage, converter, capacitor, wiring or software diagnostics.',
    solution: 'Preserve the exact warning and fault codes, identify the vehicle electrical architecture by VIN, test the main low-voltage battery and the specified backup supply, and follow the exact XENTRY path before replacement. Do not buy an auxiliary battery, capacitor, voltage converter or wiring part from this page; the component and fitment are unresolved.',
    symptoms: ['exact warning and fault codes preserved', 'electrical architecture confirmed by VIN', 'main and specified backup supply tested before replacement'], affectedSystems: ['low-voltage electrical system', 'backup power supply'],
    conflict: 'No exact reviewed primary record supports one auxiliary-battery component, lifespan or replacement across the frozen scope.', evidence: ['The reviewed 1,151-row CLA manufacturer corpus does not establish the frozen universal backup-battery identity.'], summary: 'Removed the assumed component, lifespan and parts-first remedy pending electrical-architecture review.', sources: ['datasets'],
  },
  [IDS.camshaft]: {
    description: 'Recall 15V-662 confirms that certain 2015-2016 CLA, GLA and SLK vehicles could have camshafts whose welds were outside specification, allowing a camshaft to break and potentially stall the engine. The rendered dealer notice does not assign both M270 and M274 engines to the CLA population. Because the frozen CLA page immutably lists both engines, the exact CLA engine scope and VIN population must be resolved before this identity can be retained.',
    solution: 'Check the VIN for recall 15V-662 and have an authorized Mercedes-Benz dealer perform the recall remedy if applicable. Do not buy a camshaft, timing component or cylinder head from this page; recall eligibility and exact CLA engine fitment are VIN-controlled dealer work.',
    symptoms: ['VIN checked for recall 15V-662', 'engine operation stopped and inspected if severe mechanical noise or stalling occurs', 'recall remedy confirmed through an authorized dealer'], affectedSystems: ['engine camshafts', 'valvetrain'],
    conflict: 'The recall proves a weld defect but does not support the frozen CLA engine field that includes both M270 and M274.', evidence: ['The rendered 15V-662 dealer notice names 2015-2016 CLA, GLA and SLK and describes an out-of-specification camshaft weld.', 'The notice does not establish both frozen engine codes as CLA applications.'], summary: 'Retained the exact recall facts while holding the unresolved M270/M274 CLA engine-scope identity.', sources: ['camshaftRecall', 'datasets'],
  },
  [IDS.roof]: {
    description: 'Mercedes recalls 21V-197 and 23V-854 establish that the bonded front stationary panel on certain 2014-2020 CLA panoramic roofs may not have been installed correctly during prior repair. Bonding adhesion can deteriorate, allowing partial or complete panel detachment and increasing crash or injury risk. The campaigns are VIN-specific and do not establish that every vehicle in the frozen year range is affected.',
    solution: 'Check the VIN for open Mercedes-Benz roof-panel recall campaigns. An authorized Mercedes-Benz dealer must inspect the stationary panel and, when required, remove and replace it using the approved repair process at no charge under the recall. Do not buy or self-install a roof panel or adhesive from this page; eligibility, panel construction and remedy are VIN-controlled dealer recall work.',
    symptoms: ['VIN recall status checked', 'front stationary panoramic-roof panel inspected by an authorized dealer', 'vehicle use discussed with the dealer if panel movement or separation is visible'], affectedSystems: ['panoramic roof', 'front stationary roof panel'],
    conflict: 'No material title conflict: exact primary recalls support the indexed detachment identity when narrowed to VIN-specific affected vehicles.', evidence: ['The rendered 21V-197 owner notice names 2014-2020 CLA-Class vehicles and describes bond deterioration and panel detachment.', 'The rendered 23V-854 campaign bulletin includes platform 117 and prescribes dealer replacement of the front stationary roof panel.'], summary: 'Narrowed the supported roof-panel detachment recall to VIN-specific affected vehicles and dealer-only remedy.', sources: ['roofRecall2021', 'roofRecall2023'],
  },
  [IDS.rearBrakes]: {
    description: 'Reviewed Mercedes AMG brake communications describe friction-induced noise and direct technicians to reproduce the complaint, inspect wear and damage and use condition-specific procedures. They do not establish the frozen 2014-2023 CLA pattern of premature rear-pad wear caused by sticking caliper pistons or universal caliper replacement. Wear can also reflect driving conditions, brake package, hardware, parking-brake operation or other faults.',
    solution: 'Measure inner and outer pad thickness, rotor thickness and runout, inspect hardware and caliper movement, verify parking-brake operation and identify the exact brake package by VIN before selecting a remedy. Do not buy pads, rotors or a caliper from this page; the mechanism and fitment are not established.',
    symptoms: ['inner and outer rear-pad thickness measured', 'rotor and caliper condition documented', 'brake package confirmed by VIN before parts selection'], affectedSystems: ['rear service brakes', 'rear calipers'],
    conflict: 'Exact brake communications support diagnostic inspection of noise and wear, not the frozen caliper-piston-sticking identity.', evidence: ['Communication 11012904 attributes AMG brake noise to frictional vibration and requires inspection rather than assuming caliper failure.'], summary: 'Removed the unsupported caliper-piston mechanism and retained a measurement-first brake boundary.', sources: ['datasets'],
  },
  [IDS.waterLeak]: {
    description: 'The frozen page combines trunk vent flaps, body seams, tail-lamp seals and rear-footwell water entry using secondary and forum reports. The reviewed CLA manufacturer corpus does not establish that combined 2014-2023 identity or a universal resealing remedy. Water can enter through multiple body, roof, glazing, drain or repair-related paths and must be traced before parts are selected.',
    solution: 'Reproduce the leak with controlled low-volume water, trace the path from the highest dry point, inspect body openings and prior repairs, then dry and test any wetted electrical area. Do not buy a vent flap, tail-lamp seal, body plug or trim part from this page; the leak source and VIN-level fitment are unresolved.',
    symptoms: ['water entry reproduced and traced', 'body openings and previous repairs inspected', 'wetted electrical areas documented and tested'], affectedSystems: ['body water management', 'trunk and rear footwell'],
    conflict: 'No exact reviewed primary record supports the frozen multi-path water-leak aggregation or full year scope.', evidence: ['The reviewed 1,151-row CLA communication corpus contains no exact record proving this vent-flap/seam/tail-lamp bundle.'], summary: 'Replaced assumed leak paths with controlled tracing and a no-universal-part boundary.', sources: ['datasets'],
  },
  [IDS.comand]: {
    description: 'Mercedes XENTRY LI82.85-P-055695 directly includes model 117 and documents a COMAND unit that does not start, cannot be operated or leaves the display dark. The condition may clear after more than six hours or a brief power interruption; the identified cause is the COMAND software release. The bulletin does not establish Bluetooth-specific failure, rear-camera failure or a need to replace the head unit.',
    solution: 'Preserve the exact symptom and software version. For an applicable model-117 vehicle, follow LI82.85-P-055695: a brief circuit-30 interruption is only a temporary recovery step, followed by the specified COMAND software update. Do not buy a head unit, display, camera or amplifier from this page; the bulletin expressly says not to replace the COMAND unit for this condition.',
    symptoms: ['COMAND does not start or cannot be operated', 'display remains dark', 'condition may clear after a long idle period or brief power interruption'], affectedSystems: ['COMAND infotainment control unit', 'central display'],
    conflict: 'No material title conflict: the exact model-117 bulletin supports a software-related COMAND non-start/dark-display condition.', evidence: ['All three rendered pages of LI82.85-P-055695 include model 117 and specify software as the cause.', 'The rendered remedy says the COMAND control unit must not be replaced for this complaint.'], summary: 'Narrowed the COMAND freeze identity to the exact model-117 software condition and proposed the unsupported 1,000-owner total as zero.', sources: ['comandBulletin'],
  },
  [IDS.strut]: {
    description: 'Mercedes communications 11021107 and 11029964 document a narrower condition on certain 2021-and-later CLA vehicles: creaking during steering at low speed can occur when the front axle level is too low and an end-stop buffer contacts the damper tube. They do not establish the frozen 2014-2023 strut-mount-bearing identity, the full trim scope or universal strut replacement.',
    solution: 'Record the noise while steering and over bumps, measure front axle level and inspect springs, end-stop buffers, damper tubes, mounts and adjacent joints using the VIN-specific procedure. Do not buy a strut, mount or bearing from this page; the frozen component identity and full-year fitment are not established.',
    symptoms: ['noise condition reproduced and recorded', 'front axle level measured', 'spring, buffer, damper and mount inspected before replacement'], affectedSystems: ['front suspension', 'strut and spring assembly'],
    conflict: 'The exact 2021-and-later low-axle-level condition does not support the frozen 2014-2023 strut-mount-bearing identity.', evidence: ['Communications 11021107 and 11029964 identify end-stop-buffer contact after an axle-level check, not universal strut-mount failure.'], summary: 'Separated the exact later-model axle-level condition from the unsupported cross-generation strut identity and proposed the 700-owner total as zero.', sources: ['datasets'],
  },
  [IDS.turboOil]: {
    description: 'The frozen page attributes 2014-2019 CLA250 M270 oil leakage to turbocharger feed or return line gaskets and O-rings using secondary and forum sources. Communication 10205154 states only that a gasket may settle and cause a slight oil leak; it does not identify the frozen turbo circuit, establish the full CLA population or validate universal line and seal replacement.',
    solution: 'Clean the area, trace the highest fresh oil source, inspect the valve cover, turbocharger oil connections and nearby oil paths, and confirm the exact engine and turbo by VIN before selecting a repair. Do not buy an oil line, gasket, O-ring or turbocharger from this page; the leak source and fitment are unresolved.',
    symptoms: ['oil source traced after cleaning', 'burning odor or smoke investigated before parts selection', 'engine and turbo configuration confirmed by VIN'], affectedSystems: ['engine lubrication', 'turbocharger oil circuit'],
    conflict: 'The reviewed gasket communication does not establish the frozen M270 turbo-feed/return-line identity or full year scope.', evidence: ['Communication 10205154 says only that a gasket may settle and produce a slight oil leak.', 'No exact reviewed primary record identifies the frozen turbo oil line or seal.'], summary: 'Removed the unsupported turbo-line mechanism and proposed the 900-owner total as zero.', sources: ['datasets'],
  },
});

function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = PDF_SOURCES[key] || OTHER_SOURCES[key]; return { url: source.url, type: source.type, title: source.title }; }); }
function commerceDecisionFor(id) {
  return {
    [IDS.dct]: 'transmission cause and VIN fitment are unresolved; no universal retail part',
    [IDS.auxiliaryBattery]: 'electrical architecture and backup component are unresolved; no universal retail part',
    [IDS.camshaft]: 'recall eligibility and exact engine fitment are VIN-controlled dealer work; no universal retail part',
    [IDS.roof]: 'recall eligibility, panel construction and remedy are VIN-controlled dealer work; no universal retail part',
    [IDS.rearBrakes]: 'brake mechanism, package and fitment are unresolved; no universal retail part',
    [IDS.waterLeak]: 'water-entry source and body fitment are unresolved; no universal retail part',
    [IDS.comand]: 'the exact remedy is VIN-specific software and the bulletin forbids unit replacement; no universal retail part',
    [IDS.strut]: 'noise source, generation scope and suspension fitment are unresolved; no universal retail part',
    [IDS.turboOil]: 'oil-leak source and turbo fitment are unresolved; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  return { ...clone(before), description: content.description, solution: content.solution, confidence: RETAIN_IDS.includes(id) ? 'high' : 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'CLA').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen CLA coverage does not match the 9-row adjudication contract');
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const retained = RETAIN_IDS.includes(row.id);
    return { id: row.id, action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: !retained, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'CLA',
    completionStatement: 'All 9 frozen CLA pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Seven identities materially exceed exact evidence or contain applicability conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 1,000-, 700- and 900-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'cla-roof-recall-retained', severity: 'accuracy-correction', recordIds: [IDS.roof], detail: '21V-197 and 23V-854 directly support a VIN-specific front stationary panoramic-roof panel detachment identity and dealer remedy.' },
      { code: 'cla-comand-software-condition-retained', severity: 'accuracy-correction', recordIds: [IDS.comand], detail: 'LI82.85-P-055695 directly includes model 117 and supports a COMAND non-start/dark-display software condition without unit replacement.' },
      { code: 'cla-seven-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Seven frozen identities exceed exact evidence or contain generation, engine or component conflicts; every indexed page remains published pending review.' },
      { code: 'cla-camshaft-engine-scope-conflict', severity: 'identity-conflict', recordIds: [IDS.camshaft], detail: '15V-662 supports the weld defect but does not validate both frozen CLA engine codes, so the identity remains held.' },
      { code: 'cla-strut-generation-conflict', severity: 'identity-conflict', recordIds: [IDS.strut], detail: 'Exact 2021-and-later axle-level/buffer evidence does not support the frozen 2014-2023 strut-mount-bearing identity.' },
      { code: 'cla-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'The stored 1,000, 700 and 900 owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-cla-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No CLA page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 7, fabricated_report_counts_proposed_zero: 3, total: 9 }, rows,
  };
}

if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
