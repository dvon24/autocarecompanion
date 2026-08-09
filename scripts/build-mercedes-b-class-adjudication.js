/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-b-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['B-CLASS', 'B CLASS', 'B-CLASS ELECTRIC', 'B242', 'B246', 'B 160', 'B 180', 'B 200', 'B 220', 'B 250E', 'B160', 'B180', 'B200', 'B220', 'B250', 'B250E', 'B ELECTRIC DRIVE']);
const IDS = Object.freeze({
  dct: 'mercedes-b-class-dct-shudder-2013',
  electricDrive: 'mercedes-b-class-electric-drive-motor-noise-2014',
  turboOil: 'mercedes-b-class-turbo-oil-leak-2013',
  parkingBrake: 'mercedes-benz-b-class-electronic-parking-brake-actuator-malfunction',
  timingChain: 'mercedes-benz-b-class-m270-timing-chain-stretch-cold-start-rattle',
  diesel: 'mercedes-benz-b-class-om651-diesel-dpf-egr-clogging',
  sunroof: 'mercedes-benz-b-class-panoramic-sunroof-drain-clog-water-leak',
  thermostat: 'mercedes-benz-b-class-plastic-thermostat-housing-coolant-leak',
  tailgate: 'mercedes-benz-b-class-tailgate-boot-lock-actuator-electrical-failure',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.dct, IDS.electricDrive, IDS.turboOil].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10135837', '10151943', '10166987', '10231032']);
const CAMPAIGNS = Object.freeze(['15V655000', '17V627000', '19V787000', '21V058000', '21V229000']);

const PDF_SOURCES = Object.freeze({
  dctBulletin: {
    title: 'Mercedes-Benz XENTRY LI27.60-P-058317: high-gear jolt with FC 092177/092100 on 7G-DCT',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10135521-9999.pdf',
    localPath: 'C:/tmp/mercedes-b-class-sources/10135521.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 42221,
    sha256: 'f7efd0d044fb37daba0f2e2ee601fc871add899e8dc8e1be2de0b766721830d0',
  },
  parkingBrakeBulletin: {
    title: 'Mercedes-Benz XENTRY LI42.20-P-061327: electric parking brake inoperative from rear-axle connector engagement',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10135837-9999.pdf',
    localPath: 'C:/tmp/mercedes-b-class-sources/10135837.pdf',
    pages: 5,
    visualPages: [1, 2, 3, 4, 5],
    bytes: 50747,
    sha256: 'ca415b7bdd71006839955cc34bff168943b6edc3d5e9347a7af42e0b7d1056b2',
  },
  electricDriveRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 15V-655: B-Class Electric Drive gateway software and loss of propulsion',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCLRPT-15V655-6796.PDF',
    localPath: 'C:/tmp/mercedes-b-class-sources/15V655.pdf',
    pages: 3,
    visualPages: [1, 2, 3],
    bytes: 30742,
    sha256: '6cd9d685f6f6e04fda8b5da9ad7609f9b53495ae26c065118e8f3cbe5ceBDEC2'.toLowerCase(),
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 94, '2015-2019': 139, '2020-2024': 154, '2025-2026': 57 },
  totalRows: 444,
  relevantRowCount: 70,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 107 },
  totalRows: 107,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.dct]: {
    description: 'XENTRY LI27.60-P-058317 applies to model series 246 with the 7G-DCT, but it documents intermittent high-gear jolting with FC 092177 or 092100 after incorrect 7th-gear learned values. Its remedy is software, normalization and adaptation. It does not establish the frozen low-speed clutch-pack-wear mechanism, revised-friction-material claim or universal clutch replacement. The frozen B250e trim is also incompatible with this DCT identity: the official applicability table lists electric model 242.890 with no conventional transmission.',
    solution: 'Preserve the exact complaint and fault codes. For FC 092177/092100 on a 7G-DCT vehicle, follow the VIN-specific XENTRY software and adaptation procedure; diagnose an unrelated low-speed shudder independently before condemning a clutch. Do not buy a clutch, control unit or transmission part from this page; the frozen symptom, affected drivetrain and retail fitment are not established.',
    symptoms: ['transmission symptom reproduced on a confirmed 7G-DCT vehicle', 'FC 092177 or 092100 preserved when applicable', 'electric B-Class excluded from DCT parts selection'],
    affectedSystems: ['7G-DCT transmission', 'transmission control software'],
    conflict: 'The title/mechanism is not established and the frozen trim scope incorrectly includes the electric B250e.',
    evidence: ['LI27.60-P-058317 documents a high-gear software/adaptation condition, not low-speed clutch wear.', 'LI42.20-P-061327 lists 242.890 with engine 780.990 and transmission 000.000, confirming the electric variant is not a 7G-DCT application.'],
    summary: 'Separated the exact high-gear DCT software condition from the unsupported low-speed clutch-wear identity, flagged the B250e applicability conflict and proposed the 680-owner total as zero.',
    sources: ['dctBulletin', 'parkingBrakeBulletin', 'datasets'],
  },
  [IDS.electricDrive]: {
    description: 'NHTSA recall 15V-655 establishes a different B-Class Electric Drive defect: certain 2014-2015 platform-242 vehicles could lose propulsion because the powertrain gateway sent an incorrect high-voltage-contactor-status signal. The official remedy was gateway software. Neither that recall nor the reviewed 444-communication corpus establishes a recurring electric-motor-bearing or reduction-gear whine, the stated Tesla parts shortage, or universal drive-unit replacement across 2014-2017.',
    solution: 'Identify whether the noise follows motor speed, wheel speed or side-shaft load, preserve electric-drive fault data and check the VIN for completed recall 15V-655 before selecting hardware. High-voltage drive-unit work belongs with an EV-qualified Mercedes repairer. Do not buy a motor bearing, reduction gear or drive unit from this page; no universal failed component or retail fitment is established.',
    symptoms: ['speed-dependent noise isolated before parts selection', 'electric-drive fault data preserved', 'VIN recall status checked separately from mechanical-noise diagnosis'],
    affectedSystems: ['electric drive system', 'powertrain gateway', 'high-voltage propulsion'],
    conflict: 'The exact B-Class Electric Drive recall is a gateway-software shutdown condition, not the frozen bearing/gear-noise identity.',
    evidence: ['The rendered 15V-655 report identifies platform 242.890, the gateway signal mechanism and dealer software remedy.', 'The 2,618-vehicle recall population is not an owner-report count and is not transferred to this page.'],
    summary: 'Distinguished the exact 15V-655 software recall from the unsupported motor-bearing claim and proposed the 150-owner total as zero.',
    sources: ['electricDriveRecall', 'datasets'],
  },
  [IDS.turboOil]: {
    description: 'The frozen page relies only on a forum citation. The reviewed 444 manufacturer communications and 107 recall rows do not establish a 2013-2019 B250/M270 pattern in which the turbocharger oil-feed line leaks at the upper banjo connection, drips onto the exhaust and requires universal line-and-washer replacement. No exact part number or VIN-level applicability is documented.',
    solution: 'Confirm the leak source after cleaning the area, then inspect the oil-feed and return connections, turbocharger, valve cover and nearby oil paths using the VIN-specific workshop procedure. Do not buy an oil line, banjo bolt, washer or turbocharger from this page; the failed connection and fitment have not been established.',
    symptoms: ['oil source traced after cleaning', 'burning smell or smoke investigated before parts selection', 'turbocharger condition checked only after leak origin is confirmed'],
    affectedSystems: ['engine lubrication', 'turbocharger oil circuit'],
    conflict: 'No exact reviewed primary record supports the frozen mechanism, full year scope or parts-first remedy.',
    evidence: ['No exact turbo-oil-feed-line record appears in the reviewed B-Class communication or recall corpus.'],
    summary: 'Removed the unsupported banjo-line mechanism and universal replacement instruction and proposed the 290-owner total as zero.',
    sources: ['datasets'],
  },
  [IDS.parkingBrake]: {
    description: 'XENTRY LI42.20-P-061327 includes B model series 242 and 246, but only for MFA vehicles produced approximately May through September 2014. It documents an inoperative electric parking brake with warning lamps caused by rear-axle connectors X62/32 or X62/33 not being fully engaged; the remedy is to engage the connector correctly. It does not establish the frozen 2013-2019 actuator-motor failure identity, corroded-cable pattern or broad software remedy.',
    solution: 'Preserve the warning and EPB fault codes. On an in-scope 2014 vehicle, inspect connector engagement exactly as LI42.20-P-061327 directs; otherwise follow the VIN-specific XENTRY test before replacing a caliper, actuator, cable or control unit. Do not buy an EPB actuator or brake component from this page; the failed part and applicability are not established.',
    symptoms: ['parking-brake warning with exact fault codes preserved', 'yellow EPB lamp with red EPB lamp flashing on the documented condition', 'rear-axle connector engagement checked before hardware replacement'],
    affectedSystems: ['electric parking brake', 'rear-axle electrical connectors'],
    conflict: 'The exact bulletin supports a narrow connector condition rather than the title’s actuator-malfunction identity.',
    evidence: ['LI42.20-P-061327 directly lists B (242, 246) and limits the production window.', 'The rendered bulletin identifies X62/32 and X62/33 connector engagement as cause and remedy.'],
    summary: 'Replaced the broad actuator/corrosion/software bundle with the exact 2014 connector condition while holding the overstated identity.',
    sources: ['parkingBrakeBulletin'],
  },
  [IDS.timingChain]: {
    description: 'The frozen page relies on forums and a general engine article. The reviewed B-Class manufacturer corpus does not establish a 2013-2019 M270 timing-chain-stretch pattern, a 70,000-80,000 km threshold, short-trip causation, two-stage-chain wording or universal timing-kit replacement. The body also inaccurately calls M270/M274 naturally aspirated and mixes M274 into an M270-titled identity.',
    solution: 'Record a true cold-start event, oil level/specification, fault codes and cam/crank correlation data, then have a Mercedes-qualified technician inspect the tensioner, guides, chain and cam adjusters using the engine- and VIN-specific procedure. Do not buy a tensioner, chain kit or cam phaser from this page; diagnosis and exact engine fitment are unresolved.',
    symptoms: ['cold-start noise recorded before repair', 'cam/crank correlation checked with exact fault data', 'engine code and VIN confirmed before parts selection'],
    affectedSystems: ['timing drive', 'camshaft adjustment'],
    conflict: 'No exact reviewed primary record establishes the title’s scope or the body’s mileage and mechanism claims.',
    evidence: ['No exact M270 timing-chain record appears in the reviewed B-Class communication or recall corpus.', 'The frozen body contains an internal engine-description conflict and unsupported mileage thresholds.'],
    summary: 'Removed unsupported mileage, mechanism and engine-description claims and retained a measurement-first diagnostic boundary.',
    sources: ['datasets'],
  },
  [IDS.diesel]: {
    description: 'The frozen page aggregates DPF loading, EGR fouling, intake carbon, glow plugs, injectors, a differential-pressure sensor and an unrelated timing-chain claim under one identity. The reviewed B-Class manufacturer corpus does not establish that bundle or its full 2013-2019 B180/B200/B220 CDI scope. Short-trip use can impede regeneration generally, but it does not prove which component has failed on a particular vehicle.',
    solution: 'Read soot load, ash load, differential pressure, exhaust temperatures, regeneration history and EGR commands before choosing a remedy. Correct the actual upstream fault and use the VIN-specific Mercedes procedure; do not force regeneration when safety limits are not met. Do not buy a DPF, EGR valve, pressure sensor, injector or glow plug from this page; no universal failed component or fitment is established.',
    symptoms: ['diesel fault codes and live data preserved', 'soot and differential-pressure readings checked', 'upstream cause identified before cleaning or replacement'],
    affectedSystems: ['diesel emissions controls', 'DPF', 'EGR'],
    conflict: 'The frozen identity combines multiple independent conditions without exact model-specific primary evidence.',
    evidence: ['No exact DPF/EGR record supporting the stored bundle appears in the reviewed B-Class corpus.'],
    summary: 'Separated diagnosis from the unsupported multi-failure aggregation and removed illegal or parts-first implications.',
    sources: ['datasets'],
  },
  [IDS.sunroof]: {
    description: 'The frozen page relies only on forum discussions. The reviewed B-Class manufacturer corpus does not establish a 2013-2019 W246 panoramic-roof drain-clog pattern, a worn perimeter-seal mechanism, four-drain layout or risk to under-carpet modules. Those possible leak paths require water tracing rather than assumption.',
    solution: 'Reproduce the leak with controlled low-volume water, trace each accessible drain and roof opening, inspect seals and body seams, and dry/test any wetted electrical area. Do not use high-pressure air that can separate a drain connection. Do not buy a seal, drain tube or module from this page; the leak source and VIN-specific part are unresolved.',
    symptoms: ['water entry reproduced and traced', 'drain outlet flow checked gently', 'wet electrical areas inspected before parts selection'],
    affectedSystems: ['panoramic roof', 'body water management'],
    conflict: 'No exact reviewed primary record supports the frozen drain/seal mechanism or full scope.',
    evidence: ['No exact panoramic-roof leak record appears in the reviewed B-Class communication or recall corpus.'],
    summary: 'Replaced the assumed drain/seal diagnosis with controlled leak tracing and a no-universal-part boundary.',
    sources: ['datasets'],
  },
  [IDS.thermostat]: {
    description: 'The frozen page relies on a forum and general engine articles. The reviewed B-Class manufacturer corpus does not establish a 2013-2019 M270/M274 thermostat-housing crack/warp pattern, the stated warm-up threshold, dealer preference or aftermarket repeat-failure claim. The title is M270-specific while the frozen engine field also includes M274, creating an unresolved applicability conflict.',
    solution: 'Pressure-test the cooling system cold and hot, trace residue and confirm thermostat performance with live temperature data before selecting a repair. Verify the exact engine and VIN in the Mercedes parts catalog. Do not buy a thermostat housing, water pump or coolant part from this page; the source and fitment are not established.',
    symptoms: ['coolant loss pressure-tested before repair', 'leak residue traced to its source', 'thermostat behavior confirmed with live temperature data'],
    affectedSystems: ['engine cooling', 'thermostat'],
    conflict: 'No exact reviewed primary record supports the frozen failure pattern, and the title/engine applicability conflicts.',
    evidence: ['No exact thermostat-housing record appears in the reviewed B-Class communication or recall corpus.'],
    summary: 'Removed unsupported failure-rate, temperature and part-quality claims and flagged the title/engine applicability conflict.',
    sources: ['datasets'],
  },
  [IDS.tailgate]: {
    description: 'The frozen page relies on forum and aftermarket-blog citations and makes unsupported frequency, corrosion, washer-hose and 30,000 km maintenance claims. The exact reviewed B-Class communication 10231032 concerns a 2019 tailgate opening unintentionally from key-button activation, not a W246 lock-actuator failure. It cannot support the frozen 2013-2019 actuator identity or replacement/re-teach advice.',
    solution: 'Confirm whether the tailgate fails to unlatch, fails to lock or opens unintentionally; then test the latch switch, wiring, power, grounds and water entry using the VIN-specific diagram. Do not buy a latch actuator, release switch, wiring kit or washer hose from this page; the failure mode and fitment are not established.',
    symptoms: ['exact lock or opening behavior reproduced', 'latch power, ground and switch data tested', 'water entry traced before electrical parts are replaced'],
    affectedSystems: ['tailgate latch', 'body electrical system'],
    conflict: 'The only exact reviewed B-Class tailgate communication describes a different unintentional-opening condition.',
    evidence: ['Communication 10231032 documents unintended opening from key activation on 2019 B180/B200/B220 vehicles.', 'No exact reviewed record supports the stored actuator/corrosion/washer-hose bundle.'],
    summary: 'Separated the exact unintended-opening communication from the unsupported lock-actuator identity and removed invented maintenance/repair claims.',
    sources: ['datasets'],
  },
});

function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = PDF_SOURCES[key] || OTHER_SOURCES[key]; return { url: source.url, type: source.type, title: source.title }; }); }
function commerceDecisionFor(id) {
  return {
    [IDS.dct]: 'symptom, drivetrain and fitment are unresolved; no universal retail part',
    [IDS.electricDrive]: 'high-voltage diagnosis and drive-unit fitment are unresolved; no universal retail part',
    [IDS.turboOil]: 'leak source and oil-line fitment are unresolved; no universal retail part',
    [IDS.parkingBrake]: 'VIN/production scope and failed EPB component are unresolved; no universal retail part',
    [IDS.timingChain]: 'engine diagnosis and timing-part fitment are unresolved; no universal retail part',
    [IDS.diesel]: 'multiple possible emissions causes; no universal retail part',
    [IDS.sunroof]: 'water-entry source and roof part are unresolved; no universal retail part',
    [IDS.thermostat]: 'coolant-leak source and engine fitment are unresolved; no universal retail part',
    [IDS.tailgate]: 'failure mode and latch/wiring fitment are unresolved; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  return { ...clone(before), description: content.description, solution: content.solution, confidence: 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'B-Class').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen B-Class coverage does not match the 9-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mercedes-Benz',
    model: 'B-Class',
    completionStatement: 'All 9 frozen B-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All nine identities materially exceed exact evidence or contain applicability conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 680-, 150- and 290-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'b-class-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen B-Class identity exceeds exact primary evidence or contains a scope/applicability conflict; all remain indexed pending review.' },
      { code: 'b-class-dct-electric-applicability-conflict', severity: 'identity-conflict', recordIds: [IDS.dct], detail: 'The DCT page includes B250e although official applicability shows electric 242.890 without a conventional transmission.' },
      { code: 'b-class-epb-connector-not-actuator', severity: 'identity-conflict', recordIds: [IDS.parkingBrake], detail: 'The exact B 242/246 EPB bulletin is a narrow 2014 connector-engagement condition, not an actuator-failure pattern.' },
      { code: 'b-class-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'The stored 680, 150 and 290 owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'all-b-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No B-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 3, total: 9 },
    rows,
  };
}

if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
