/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazdaspeed3-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDASPEED3', 'MAZDASPEED 3', 'MAZDA SPEED3', 'MAZDA SPEED 3']);

const IDS = Object.freeze({
  mount: 'mazda-mazdaspeed3-motor-mount-failure-2007',
  turboSeal: 'mazda-mazdaspeed3-turbo-seal-failure-2007',
  turboBroad: 'mazda-speed3-turbo-failure-2007',
  vvt: 'mazda-speed3-vvt-timing-chain-2007',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const IDENTITY_REVIEW_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.turboBroad, IDS.vvt].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10034634', '10039110', '10039250', '10039251', '10043874', '10043875', '10044209',
]);
const CAMPAIGNS = Object.freeze(['07V052000', '07V295000', '11V329000', '16V644000', '17V082000']);

const PDF_SOURCES = Object.freeze({
  engineMountRecall: {
    title: 'Mazda Part 573 and Owner Notice: Recall 4607F / NHTSA 07V295',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2007/RCDNN-07V295-2625.pdf',
    localPath: 'C:/tmp/mazda-mazdaspeed3-sources/RCDNN-07V295-2625.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 694793,
    sha256: '98e6fd9687b935a85a53d9c6b8174ed577b85b4b857c3b9e45a03b56e654bbf2',
  },
  ssp86: {
    title: 'Mazda SSP86: Heavy White Exhaust Smoke Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10043874-3140.pdf',
    localPath: 'C:/tmp/mazda-mazdaspeed3-sources/SB-10043874-3140.pdf',
    pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 89100,
    sha256: 'c9ca053d62ecdb92254e4583d864563eea24a86d1c296a9ce37a32d47f764de6',
  },
  ssp87: {
    title: 'Mazda SSP87: VVT and Timing-Chain Noise Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10043875-3697.pdf',
    localPath: 'C:/tmp/mazda-mazdaspeed3-sources/SB-10043875-3697.pdf',
    pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 93082,
    sha256: 'c49f0e28b55db4dd5fda14ab31e8ead69b1028d44fed689d967abad35fa83cb8',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 7, '2010-2014': 11, '2015-2019': 13, '2020-2024': 14, '2025-2026': 0 },
  totalRows: 45,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 2, post: 8 },
  totalRows: 10,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.mount]: [PDF_SOURCES.engineMountRecall],
    [IDS.turboSeal]: [PDF_SOURCES.ssp86],
    [IDS.turboBroad]: [OTHER_SOURCES.datasets, PDF_SOURCES.ssp86],
    [IDS.vvt]: [PDF_SOURCES.ssp87],
  };
  if (!map[id]) throw new Error(`Unexpected Mazdaspeed3 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.mount]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda recall 4607F / NHTSA 07V295 covered certain 2007 Mazdaspeed3 vehicles produced from June 28, 2006 through May 19, 2007. The No. 4 left-side engine-mount bolt could loosen after repeated sudden or rapid acceleration, then pull out or break. The transmission could move out of position and, in an extreme case, the driveshaft could detach and the vehicle could lose power. The recall does not establish a passenger-side rear-mount rubber failure, wheel-hop mechanism or recurring 2007-2013 defect.',
      solution: 'Check the VIN for recall 4607F. Mazda directed dealers to inspect and replace the No. 4 engine-mount bolt with a modified bolt and, only when necessary, replace the No. 4 mount rubber and bracket free of charge. If the engine or transmission has shifted, the vehicle loses drive, or abnormal movement is visible, stop driving and arrange service. Do not buy an aftermarket rear motor mount, rubber insert, bolt or bracket from this page; confirm recall eligibility, mount location and current Mazda remedy first.',
      symptoms: ['abnormal engine or transmission movement after hard acceleration', 'loss of drive if the driveshaft detaches in an extreme case'],
      summary: 'Bounded the page to the exact 2007 left-side No. 4 mount-bolt recall and removed unsupported passenger-side, wheel-hop, mileage and aftermarket-mount claims.',
    },
    [IDS.turboSeal]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda SSP86 covered certain Federal-emissions 2007-2008 Mazdaspeed3 vehicles built from June 28, 2006 through June 30, 2008. It documents heavy white exhaust smoke after a long idle or slow driving in heavy traffic. Mazda states that excessive engine oil lubricating the turbocharger bearing can leak into the exhaust side of the turbine, where heated accumulated oil produces the smoke; the program also describes insufficient crankcase ventilation. SSP86 does not establish the frozen 2009-2013 scope, blue smoke under boost, P0299, a clogged banjo-bolt screen, a mandatory braided feed line or universal K04 failure.',
      solution: 'Verify the VIN, build date, Federal-emissions application and exact white-smoke condition before selecting a repair. SSP86 directed dealer inspection and, depending on the model and damage found, installation of the applicable crankcase-ventilation set or turbocharger replacement. Its seven-year/70,000-mile warranty extension was historical and may be expired. Do not buy a turbocharger, ventilation set, oil-feed line, banjo bolt, gasket kit or oil product from this page; applicability and the failed cause must be confirmed first.',
      symptoms: ['heavy white exhaust smoke after a long idle', 'heavy white exhaust smoke while driving slowly in heavy traffic'],
      summary: 'Replaced fabricated forum/video evidence and generic turbo advice with SSP86\'s exact 2007-2008 Federal-emissions white-smoke condition and inspection-led remedy.',
    },
    [IDS.turboBroad]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed 45-row Mazdaspeed3 manufacturer-communication inventory did not establish a model-wide K04 turbocharger failure rate, universal boost-leak defect, turbine-fragment engine damage, oil-feed-line O-ring fire hazard or recurring bearing starvation across 2007-2013 vehicles. The closest exact Mazda program is SSP86, limited to certain Federal-emissions 2007-2008 vehicles with heavy white smoke after long idle or slow traffic from oil entering the exhaust side of the turbine. That narrow condition cannot validate the frozen broad K04-failure and boost-leak identity.',
      solution: 'Preserve stored codes and operating conditions, then diagnose low boost, exhaust smoke, oil leakage and abnormal turbo noise as separate paths. Inspect charge-air plumbing, vacuum controls, crankcase ventilation, oil supply and return, and turbocharger condition only as the evidence directs. Apply SSP86 only to its exact VIN/build/emissions population and white-smoke condition. Do not buy a K04, upgraded turbo, turbo timer, oil-feed O-ring, boost gauge or gasket kit from this page; no universal failure or retail fitment has been established.',
      symptoms: ['low boost or sluggish acceleration requires pressure and control-system diagnosis', 'exhaust smoke or oil leakage requires source localization', 'abnormal turbocharger noise requires inspection'],
      summary: 'Proposed the unsupported 200-owner count as zero and held the broad K04/boost-leak identity against SSP86 and the complete communication inventory.',
    },
    [IDS.vvt]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda SSP87 covered certain 2007-2010 Mazdaspeed3 vehicles with the L3T engine and defined VIN/build ranges. Mazda describes a loud cold-start tick from wear at the VVT-rotor lock-pin hole or VVT-case breakage, and a separate warm knock or rattle below 2,000 rpm from excessive timing-chain stretch. The program does not establish the frozen 2011-2013 years, a 60,000-100,000-mile failure interval, oil-starvation causation, loss of compression or the listed P0011/P0012/P0016 codes.',
      solution: 'Have Mazda reproduce and localize the noise, verify the L3T engine, VIN/build date and maintenance history, and distinguish the cold-start VVT tick from the warm sub-2,000-rpm timing-chain rattle. SSP87 directed replacement of the VVT actuator, or the actuator plus timing chain, only after inspection verified the cause. Its seven-year/70,000-mile warranty extension was historical and may be expired. Do not buy a VVT actuator, timing chain, tensioner, guide set or oil product from this page; program applicability and the failed component must be confirmed first.',
      symptoms: ['loud ticking from the VVT area immediately after a cold start', 'warm knock or rattle below 2,000 rpm from the timing-cover or cylinder-head-cover area'],
      summary: 'Proposed the unsupported 320-owner count as zero and bounded VVT/timing-chain advice to SSP87\'s exact 2007-2010 L3T population and two diagnosed noise paths.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazdaspeed3 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.mount]: ['The Part 573 report and owner notice identify certain 2007 vehicles, the No. 4 left-side mount bolt, the defined build range and the free inspection/replacement remedy.', 'Neither document identifies a passenger-side rear mount, wheel hop or a 2007-2013 recurring rubber-mount failure.'],
    [IDS.turboSeal]: ['SSP86 defines a 2007-2008 Federal-emissions Mazdaspeed3 VIN/build population and a heavy-white-smoke condition after long idle or slow traffic.', 'The dealer package requires inspection and separates a ventilation-set repair from turbocharger replacement; it does not support the frozen 2009-2013 years or banjo-screen narrative.'],
    [IDS.turboBroad]: ['All 45 relevant manufacturer-communication rows were reviewed; no record establishes the frozen model-wide K04 failure rate or combined boost-leak identity.', 'SSP86 is the nearest exact turbo record but is limited to a specific 2007-2008 white-smoke condition.'],
    [IDS.vvt]: ['SSP87 defines 2007-2010 L3T Mazdaspeed3 VIN/build ranges and separates cold-start VVT noise from warm timing-chain rattle.', 'The source does not establish the frozen 2011-2013 years, DTC list, mileage interval or generalized loss-of-compression narrative.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, current warranty eligibility or failed component is inferred beyond the exact primary source.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.mount]: 'Dealer-only or VIN-specific remedy; recall 4607F requires VIN verification and exact No. 4 mount inspection.',
    [IDS.turboSeal]: 'No universal retail part; SSP86 applicability, emissions class and diagnosed smoke cause must be verified first.',
    [IDS.turboBroad]: 'No universal retail part; low boost, smoke, oil leakage and abnormal noise require separate diagnosis before replacement.',
    [IDS.vvt]: 'No universal retail part; L3T/VIN/build applicability and the VVT-versus-chain noise source must be verified first.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.mount]: 'The frozen title asserts passenger-side mount failure causing wheel hop across 2007-2013, while recall 4607F identifies a left-side No. 4 mount-bolt defect on certain 2007 builds.',
    [IDS.turboSeal]: 'The frozen title and years imply generic turbo-seal/oil-burning failure across 2007-2013, while SSP86 is a 2007-2008 Federal-emissions white-smoke program with a defined diagnostic path.',
    [IDS.turboBroad]: 'The frozen title combines K04 failure and boost leaks across 2007-2013, while the full communication inventory supports only a narrower SSP86 white-smoke condition.',
    [IDS.vvt]: 'The frozen title aligns with two SSP87 mechanisms, but the indexed 2007-2013 scope materially exceeds SSP87\'s defined 2007-2010 L3T population.',
  };
  return map[id];
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
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
    reportCount: content.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source); delete value.localPath; return [key, value];
  }));
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazdaspeed3').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 4) throw new Error(`Expected 4 frozen Mazdaspeed3 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    return {
      id: row.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true,
      identityConflict: identityConflictFor(row.id),
      reason: content.summary,
      evidence: evidenceFor(row.id),
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
    model: 'Mazdaspeed3',
    completionStatement: 'All 4 frozen Mazdaspeed3 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All four frozen pages contain material identity or indexed-year conflicts with the exact primary evidence; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 4 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The two fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'A recall or service program is not expanded beyond its exact VIN, build, emissions, engine, component and symptom boundary.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazdaspeed3-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen page materially exceeds or combines conditions beyond the exact primary-source identity or year boundary.' },
      { code: 'mazdaspeed3-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 200- and 320-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'mazdaspeed3-mount-recall-bounded', severity: 'safety-correction', recordIds: [IDS.mount], detail: 'Recall 4607F concerns the No. 4 left-side mount bolt on certain 2007 builds, not passenger-side rubber-mount wheel hop across 2007-2013.' },
      { code: 'mazdaspeed3-turbo-program-bounded', severity: 'accuracy-correction', recordIds: [IDS.turboSeal, IDS.turboBroad], detail: 'SSP86 is limited to a defined 2007-2008 Federal-emissions white-smoke condition and does not establish universal K04 or boost-leak failure.' },
      { code: 'mazdaspeed3-vvt-program-bounded', severity: 'accuracy-correction', recordIds: [IDS.vvt], detail: 'SSP87 supports defined 2007-2010 L3T VVT/timing-chain noise conditions, not the frozen 2011-2013 scope.' },
      { code: 'all-mazdaspeed3-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazdaspeed3 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 4, fabricated_report_counts_proposed_zero: 2, total: 4 },
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
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDENTITY_REVIEW_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket,
  citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor,
};
