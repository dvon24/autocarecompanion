/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES,
  RECALL_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-rx8-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['RX-8', 'RX8']);
const SEARCH_TERMS = Object.freeze([
  'P0300-0302',
  'IGNITION COIL INSPECTION',
  'P2070 (SSV STUCK OPEN)',
  'BATTERY TEST PROCEDURE REQUIREMENTS',
  'BATTERY REPLACEMENT - SERVICE TIP',
  'BATTERY REPLACEMENT SERVICE TIP',
  'ENGINE CRANKS NO START',
  'POWERTRAIN CONTROL MODULE (PCM) REFLASH',
  'CATALYST CONVERTER/EXHAUST PIPE',
]);

const IDS = Object.freeze({
  clutch: 'mazda-rx-8-clutch-pedal-bracket-failure',
  ignition: 'mazda-rx-8-ignition-coil-spark-plug-rapid-wear-causing-misfires',
  ssv: 'mazda-rx-8-secondary-shutter-valve-carbon-buildup-hesitation',
  battery: 'mazda-rx-8-undersized-factory-battery-parasitic-drain',
  starter: 'mazda-rx-8-weak-starter-motor-hard-cold-starting',
  apex: 'mazda-rx8-apex-seal-failure-2004',
  catalyst: 'mazda-rx8-catalytic-converter-clog-2004',
  flooding: 'mazda-rx8-flooding-cold-start-2004',
  omp: 'mazda-rx8-oil-metering-pump-2004',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.clutch]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.apex, IDS.catalyst, IDS.flooding, IDS.omp].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10006385', '10007575', '10008057', '10009427', '10015472', '10016729',
  '10021572', '10024622', '10024868', '10100708', '10213333',
]);
const CAMPAIGNS = Object.freeze([
  '04V074000', '04V075000', '05V317000', '05V325000', '16V793000',
  '17V354000', '17V355000', '17V474000', '18V402000', '18V403000',
  '18V404000', '19V488000', '19V781000', '21V744000',
]);

const PDF_SOURCES = Object.freeze({
  clutchInvestigation: {
    title: 'NHTSA ODI Closing Resume PE09-045: RX-8 Clutch Pedal Bracket Failure',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/inv/2009/INCLA-PE09045-8182.PDF',
    localPath: 'C:/tmp/mazda-rx8-sources/INCLA-PE09045-8182.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 201756,
    sha256: '4d1374b1883b23c1357ab29e45387133a095575ea4602c3646cc98b3d3f3c44a',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: NHTSA_DATASET_URL,
  },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: {
    '1995-1999': 0,
    '2000-2004': 22,
    '2005-2009': 41,
    '2010-2014': 10,
    '2015-2019': 131,
    '2020-2024': 63,
    '2025-2026': 7,
  },
  totalRows: 274,
  searchTerms: SEARCH_TERMS,
  relevantRowCount: 11,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 5, post: 37 },
  totalRows: 42,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function claim(description, solution, symptoms, identityConflict, evidence, summary, sources = ['datasets']) {
  return { description, solution, symptoms, identityConflict, evidence, summary, sources };
}

const CONTENT = Object.freeze({
  [IDS.clutch]: claim(
    'NHTSA Preliminary Evaluation PE09-045 investigated clutch-pedal-bracket failures on manual-transmission 2004-2006 RX-8 vehicles. Mazda told ODI that an improper fastener attachment sequence could distort the bracket and create stress beyond its wear-out limit; warning could include noise and increasing difficulty shifting before fracture. Mazda extended clutch-pedal-assembly warranty coverage to 8 years/100,000 miles for 2004-2009 RX-8 vehicles. ODI closed the investigation without a recall and without identifying a safety-related defect trend.',
    'If the pedal shifts position, makes structural noise or no longer disengages the clutch, stop driving and inspect both bracket mounting points, attachment integrity and the complete pedal/hydraulic system. Check service history for the Mazda owner-notification repair. Do not buy a pedal assembly, bracket or reinforcement from this page; the exact failure, prior repair and fitment must be confirmed.',
    ['clutch-pedal structural noise or movement', 'increasing difficulty engaging a gear', 'bracket crack or mounting-point failure confirmed by inspection'],
    '',
    ['The two-page NHTSA closing resume directly establishes the subject, 2004-2006 investigation scope, Mazda mechanism statement, progressive warning, 2004-2009 warranty extension, closure and absence of a recall.'],
    'Replaced secondary citations and overstatement with the exact NHTSA investigation scope, mechanism statement, warning, warranty history and closure.',
    ['clutchInvestigation']
  ),
  [IDS.ignition]: claim(
    'Communication 10021572 provides an ignition-coil inspection for 2004-2007 RX-8 vehicles, and communication 10006385 addresses P0300-P0302 after engine replacement caused by retained eccentric-shaft-position learning. They do not establish rapid coil or spark-plug wear across 2004-2011, a 30,000-mile failure interval, P0303/P0304 coverage, or a chain from misfire to catalytic-converter clogging.',
    'Preserve codes and operating conditions, then inspect plugs, leads, coils, power, grounds, fueling and compression using the exact workshop procedure. For P0300-P0302 after engine replacement, check the eccentric-shaft-position learning condition before replacing ignition parts. Do not buy coils, plug wires, spark plugs or an upgrade kit from this page; the failed circuit and fitment have not been established.',
    ['misfire requiring code-guided diagnosis', 'ignition-coil output outside specification', 'P0300-P0302 after engine replacement requiring learned-value diagnosis'],
    'The title asserts rapid coil and plug wear causing misfires across eight years while exact communications establish inspection and a separate post-engine-replacement learned-value condition.',
    ['Communication 10021572 is an ignition-coil inspection for 2004-2007; communication 10006385 is a 2004-2005 post-engine-replacement P0300-P0302 condition.'],
    'Bounded the exact communications and removed unsupported rapid-wear, interval, code and converter-damage claims.'
  ),
  [IDS.ssv]: claim(
    'Communication 10024868 establishes that some 2004-2007 RX-8 vehicles may set P2070 with the secondary shutter valve stuck open. It does not establish carbon buildup as the cause, hesitation or rattle as universal symptoms, a stronger updated actuator, preventive high-rpm driving, or the frozen 2008 coverage.',
    'Preserve P2070 and freeze-frame data and test commanded SSV operation, actuator movement, linkage, wiring and the intake mechanism using the exact Mazda procedure. Do not assume carbon is the cause or remove the intake manifold without diagnosis. Do not buy an actuator, valve, gaskets or cleaner from this page; the cause and fitment have not been established.',
    ['P2070 with SSV operation outside specification', 'loss of power requiring intake-control diagnosis', 'actuator, linkage, electrical or mechanical fault confirmed by testing'],
    'The title attributes SSV sticking and hesitation to carbon buildup through 2008, while the exact communication only states P2070/SSV stuck open for 2004-2007.',
    ['Communication 10024868 establishes the narrow P2070/SSV-stuck-open condition for 2004-2007.'],
    'Bounded the P2070 communication and removed unsupported carbon, symptom, actuator and prevention claims.'
  ),
  [IDS.battery]: claim(
    'RX-8 communications 10009427, 10015472, 10016729 and 10213333 provide battery test or replacement procedures. They do not establish an undersized 305-CCA factory battery, abnormal key-off draw, a one-week discharge pattern, a required 640-CCA replacement, or a causal path to engine flooding across 2004-2011.',
    'Measure battery state of charge, capacity and cranking voltage with the correct rating entered, then measure key-off draw after modules sleep and test charging output. Inspect aftermarket devices before condemning factory systems. Do not buy a battery, tender or alternator from this page; the failed component, rating and fitment have not been established.',
    ['dead or weak battery requiring correct capacity testing', 'measured key-off draw above specification', 'charging-system output outside specification'],
    'The title asserts undersizing and parasitic drain while the exact communications concern correct battery testing/replacement, not a model-wide defect.',
    ['Four exact communications require correct battery test/replacement procedures but do not establish the frozen capacity or parasitic-draw claims.'],
    'Removed unsupported CCA, one-week drain, flooding and blanket replacement claims and held the battery identity.'
  ),
  [IDS.starter]: claim(
    'Communications 10007575 and 10024622 address an engine-cranks/no-start condition, while MSP04 communication 10008057 addresses a 2004 no-start/lack-of-power condition with specified DTCs and PCM reflash. None identifies a weak starter motor, hard cold starting, an updated higher-rpm starter or a 2004-2006 starter defect.',
    'Record whether the engine cranks and at what speed, preserve codes, and test battery state, voltage drop, starter current/speed, ignition, fueling and compression before choosing a repair. Use the exact Mazda deflood procedure only when its conditions are met. Do not buy a starter, battery or ignition parts from this page; the cause and fitment have not been established.',
    ['crank/no-start requiring measured diagnosis', 'cranking speed or starter current outside specification', 'specified MSP04 DTCs requiring calibration verification'],
    'The title identifies a weak starter and hard cold starting while exact communications establish no-start procedures and a narrow PCM-reflash program without naming starter failure.',
    ['Communications 10007575 and 10024622 are crank/no-start procedures; 10008057 is a 2004 PCM-reflash program with specified DTCs.'],
    'Separated exact no-start and PCM records from the unsupported starter-motor identity and removed the generic deflood prescription.'
  ),
  [IDS.apex]: claim(
    'The complete official RX-8 corpus does not establish apex-seal failure as the single most common issue, an exact 6.5-kg/cm² rebuild threshold across all cranking conditions, the stored 8,000-owner total, or the 2004-2012 scope. Low compression is a measured condition and does not by itself identify which combustion seal, housing or operating event caused it.',
    'Use the current rotary-engine compression procedure with cranking-speed correction and compare every rotor face, then diagnose ignition, fueling, lubrication, cooling and exhaust conditions. Choose rebuild parts only after teardown and measurement. Do not buy premix, seals, housings or a rebuild from this page; the failure, operating guidance and exact scope have not been established.',
    ['hard starting or power loss requiring compression testing', 'uneven rotary compression readings', 'internal damage requiring teardown-based scope'],
    'The title asserts apex-seal failure/compression loss across years including 2012 while no exact primary record supports its prevalence, threshold, owner total or universal cause.',
    ['No matching communication or campaign establishes the frozen broad apex-seal identity or 8,000-owner total.'],
    'Proposed the unsupported 8,000-owner total as zero and removed prevalence, threshold, premix and redline/shutdown advice.'
  ),
  [IDS.catalyst]: claim(
    'Communication 10100708 provides a procedure intended to minimize unnecessary catalyst-converter/exhaust-pipe replacement while removing oxygen or air-fuel-ratio sensors. It does not establish premature catalyst clogging, oil/fuel accumulation, engine destruction, apex-seal causation or the stored 4,500-owner total. Other Mazda communications note that sulfur odor alone is not a converter or engine defect.',
    'Preserve codes and fuel-control data and measure exhaust restriction before condemning the catalyst. Diagnose ignition, fueling, oil consumption and engine condition separately and retain emissions-compliant equipment. Do not buy a catalytic converter, oxygen sensors or a test pipe from this page; restriction, upstream cause, legality and fitment have not been established.',
    ['power loss requiring exhaust and engine diagnosis', 'measured exhaust restriction', 'catalyst damage confirmed by inspection'],
    'The title asserts catalytic-converter clogging across 2004-2012 while the exact communication is a sensor-removal procedure designed to avoid unnecessary converter replacement.',
    ['Communication 10100708 does not establish clogging; it explicitly aims to minimize unnecessary converter/exhaust-pipe replacement during sensor removal.'],
    'Proposed the unsupported 4,500-owner total as zero and removed clogging prevalence, engine-damage and test-pipe advice.'
  ),
  [IDS.flooding]: claim(
    'Communications 10007575 and 10024622 contain crank/no-start procedures for 2004-2008, and communication 10008057 is a narrow 2004 PCM-reflash program. They do not establish flooding on cold start as a universal 2004-2012 design characteristic, the stored 7,500-owner total, seal wash, or the frozen shutdown and plug-interval rules. The frozen video identifier is not primary Mazda evidence.',
    'Record the start/shutdown sequence and test cranking speed, battery voltage, spark, fuel delivery, compression and applicable calibration before diagnosing excess fuel. Follow the exact owner/workshop fuel-disable procedure rather than a generic pedal instruction. Do not buy spark plugs, ignition parts or fuel-system parts from this page; flooding, cause and fitment have not been established.',
    ['crank/no-start after a short run', 'wet plugs or excess fuel confirmed during diagnosis', 'calibration, ignition, cranking or compression issue found during testing'],
    'The title asserts cold-start flooding across 2004-2012 while exact records provide narrower no-start diagnostic and calibration paths without establishing the frozen mechanism or prevalence.',
    ['Communications 10007575 and 10024622 are crank/no-start procedures; 10008057 is a 2004 PCM-reflash program and does not prove universal flooding.'],
    'Proposed the unsupported 7,500-owner total as zero and removed universal-design, seal-wear, pedal-deflood and plug-interval claims.'
  ),
  [IDS.omp]: claim(
    'The reviewed 274-communication and 42-recall-row RX-8 corpus does not establish recurring oil-metering-pump or line clogging as a silent 2004-2012 apex-seal-starvation defect, a 60,000-80,000-mile replacement interval, or the stored 3,200-owner total.',
    'Inspect for leaks and verify pump command, operation and oil delivery using the exact workshop procedure before changing lubrication strategy. Do not assume a metering fault from compression loss alone. Do not buy a pump, metering lines or premix from this page; the failure, correct oil strategy and fitment have not been established.',
    ['oil-metering warning or delivery concern requiring diagnosis', 'leaking or damaged metering line found during inspection', 'pump command or delivery outside specification'],
    'The title asserts OMP failure across 2004-2012 while no exact primary record supports the recurrence, silent-failure mechanism, interval or owner total.',
    ['No matching communication or campaign establishes the frozen OMP identity or 3,200-owner total.'],
    'Proposed the unsupported 3,200-owner total as zero and removed silent-failure, interval, blanket replacement and premix claims.'
  ),
});

function contentFor(id) {
  const content = CONTENT[id];
  if (!content) throw new Error(`Unexpected RX-8 row ${id}`);
  return content;
}
function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  return contentFor(id).sources.map((key) => citation(PDF_SOURCES[key] || OTHER_SOURCES[key]));
}
function commerceDecisionFor(id) {
  const noun = {
    [IDS.clutch]: 'inspect the clutch-pedal bracket, attachment and prior repair first',
    [IDS.ignition]: 'identify the failed ignition or learned-value path first',
    [IDS.ssv]: 'test SSV command, linkage and cause first',
    [IDS.battery]: 'measure battery capacity, key-off draw and charging first',
    [IDS.starter]: 'measure cranking, electrical, ignition, fueling and compression first',
    [IDS.apex]: 'measure corrected rotary compression and teardown scope first',
    [IDS.catalyst]: 'measure restriction and establish emissions-compliant fitment first',
    [IDS.flooding]: 'confirm excess fuel and the actual no-start cause first',
    [IDS.omp]: 'verify metering-pump command and oil delivery first',
  };
  return `No universal retail part; ${noun[id]}.`;
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: id === IDS.clutch ? 'high' : 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source);
    delete value.localPath;
    return [key, value];
  }));
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mazda' && row.model === 'RX-8')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9) throw new Error(`Expected 9 frozen RX-8 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    const retained = RETAIN_IDS.includes(row.id);
    return {
      id: row.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: content.identityConflict,
      reason: content.summary,
      evidence: {
        primaryEvidence: content.evidence,
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.',
      },
      commerceDecision: commerceDecisionFor(row.id),
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
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: 'RX-8',
    completionStatement: 'All 9 frozen RX-8 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Eight identities materially exceed exact evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 8,000-, 4,500-, 7,500- and 3,200-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'NHTSA PE09-045 is not described as a recall and its closed-investigation limitations remain explicit.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'rx8-clutch-investigation-retained', severity: 'accuracy-correction', recordIds: [IDS.clutch], detail: 'PE09-045 directly supports the clutch-bracket identity while requiring closure/no-recall limitations.' },
      { code: 'rx8-eight-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Eight titles exceed exact evidence; all indexed pages remain published pending review.' },
      { code: 'rx8-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 8,000-, 4,500-, 7,500- and 3,200-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'rx8-ssv-record-bounded', severity: 'identity-conflict', recordIds: [IDS.ssv], detail: 'Communication 10024868 establishes P2070/SSV stuck open for 2004-2007, not carbon buildup/hesitation through 2008.' },
      { code: 'rx8-no-start-not-starter-proof', severity: 'identity-conflict', recordIds: [IDS.starter, IDS.flooding], detail: 'Exact no-start communications do not establish a weak starter or universal flooding identity.' },
      { code: 'all-rx8-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No RX-8 page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: 1,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8,
      fabricated_report_counts_proposed_zero: 4,
      total: 9,
    },
    rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS,
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  FABRICATED_REPORT_COUNT_IDS,
  IDS,
  MODEL_ALIASES,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS,
  REVIEW_DATE,
  SEARCH_TERMS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  proposalFor,
};
