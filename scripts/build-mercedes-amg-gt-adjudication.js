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
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-amg-gt-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['AMG GT', 'AMG GT43', 'AMG GT53', 'AMG GT53E', 'AMG GT55', 'AMG GT63', 'AMG GT63 S', 'AMG GT63 S E', 'AMG GTS']);

const IDS = Object.freeze({
  mount: 'mercedes-amg-gt-transmission-mount-failure-2016',
  battery: 'mercedes-benz-amggt-12v-battery-drain-and-2024',
  cluster: 'mercedes-benz-amggt-mbux-instrument-cluster-2024',
  steering: 'mercedes-benz-amggt-rear-axle-steering-driver-2024',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.cluster]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.mount]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10144129', '10151972', '10191277', '10248182', '11010970']);
const CAMPAIGNS = Object.freeze([
  '17V818000', '17V826000', '18V208000', '18V724000', '19V457000', '19V540000',
  '19V787000', '19V788000', '20V047000', '20V048000', '20V068000', '20V227000',
  '20V328000', '20V395000', '20V775000', '20V800000', '21V058000', '21V072000',
  '21V217000', '21V230000', '21V354000', '21V478000', '21V483000', '21V527000',
  '21V961000', '22V042000', '22V189000', '22V365000', '22V533000', '22V938000',
  '23V445000', '23V574000', '23V880000', '24V100000', '24V445000', '25V129000',
  '26V281000',
]);

const PDF_SOURCES = Object.freeze({
  engineMount192Campaign: {
    title: 'Mercedes-Benz service campaign 2023110010: electric engine-mount control-unit software (platform 192)',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10248182-0001.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-sources/10248182.pdf',
    pages: 4,
    visualPages: [1, 2, 3, 4],
    bytes: 354774,
    sha256: '034677b7ef5257bc29beece218f4fa8a0724a99758184a2702ceb68d390c0aca',
  },
  activeMount290Bulletin: {
    title: 'Mercedes-Benz XENTRY TIPS LI22.10-P-071055: active engine-mount faults (platform 290 and listed variants)',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10191277-9999.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-sources/10191277.pdf',
    pages: 1,
    visualPages: [1],
    bytes: 38999,
    sha256: '524660c9c74b34bb60d01199cc6e23786ae92640ffe7d6d76140609649427032',
  },
  steering190Bulletin: {
    title: 'Mercedes-Benz XENTRY TIPS LI46.80-P-068102: rear-axle-steering warning (platform 190)',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10158400-9999.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-sources/10158400.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 40937,
    sha256: '4c57175c9a596a582b875c7b74236bcb3416aab66baf700fd28bc459aa2375ee',
  },
  clusterRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 26V-281: instrument-cluster interruption during infotainment reset',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V281-1694.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-sources/26V281.pdf',
    pages: 22,
    visualPages: [19, 20, 21],
    bytes: 1808324,
    sha256: '40f7c95a2f26eb2e4e7521f3acf437dca002ff28ca1e66a57c5c85b1af2ea280',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 9, '2015-2019': 45, '2020-2024': 574, '2025-2026': 768 },
  totalRows: 1396,
  relevantRowCount: 609,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 1822 },
  totalRows: 1822,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.mount]: {
    description: 'The reviewed official records do not establish a 2016-2022 platform-190 AMG GT transaxle-mount connector-corrosion pattern. XENTRY TIPS LI22.10-P-071055 concerns active engine-mount acceleration sensors on platform 290 and other listed vehicles, not platform 190. Service campaign 2023110010 concerns electric engine-mount control-unit software on certain 2022-2024 platform-192 AMG GT vehicles. Neither document supports the frozen three-transaxle-mount mechanism, universal replacement instruction, track-use claim, or stored 210-owner total.',
    solution: 'Preserve the exact warning and fault codes, then have a Mercedes-qualified technician isolate wiring, connectors, acceleration sensors, engine mounts, transaxle mounts, torque tube and driveline sources using the VIN-specific XENTRY procedure. Do not buy a mount, sensor, harness or torque-tube part from this page; the failed component, platform and fitment have not been established.',
    symptoms: ['mount or drivetrain warning requiring platform-specific diagnosis', 'vibration or clunk reproduced and isolated before parts selection', 'wiring, sensor or mount fault confirmed by XENTRY data'],
    affectedSystems: ['engine/transaxle mounts', 'mount control electronics', 'driveline'],
    conflict: 'The frozen platform-190 identity and replacement advice are not established by the generation-specific official mount documents.',
    evidence: ['LI22.10-P-071055 is expressly limited to platform 290 and listed variants.', 'Campaign 2023110010 expressly covers certain 2022-2024 platform-192 vehicles and only a control-unit software update.'],
    summary: 'Proposed the unsupported 210-owner total as zero and bounded two different official mount documents without transferring either mechanism to the frozen platform-190 page.',
    sources: ['engineMount192Campaign', 'activeMount290Bulletin', 'datasets'],
  },
  [IDS.battery]: {
    description: 'The frozen body explicitly states that no AMG GT-specific bulletin supports this claim and transfers a supposed telematics sleep-mode cause from other Mercedes platforms. The reviewed 1,396-communication and 1,822-recall-row AMG GT corpus does not establish a 2024-2025 platform-192 12V-drain defect caused by mbrace polling. Recall 26V-281 concerns infotainment resets and brief instrument-cluster interruption, not battery drain.',
    solution: 'If a battery discharges, test battery condition and charging performance, measure parasitic draw only after the vehicle reaches its specified sleep state, and use XENTRY wake-up history to identify the actual circuit or control unit. Check VIN-specific campaigns before any software work. Do not buy a battery, telematics module or maintainer from this page; no universal failed component or retail fitment has been established.',
    symptoms: ['12V battery discharge requiring measured diagnosis', 'sleep-current draw confirmed after timeout', 'specific wake-up source identified in diagnostic data'],
    affectedSystems: ['12V battery', 'charging system', 'vehicle network'],
    conflict: 'The title may describe a symptom, but the stored telematics cause is an unsupported cross-platform extrapolation.',
    evidence: ['No exact reviewed AMG GT communication or recall establishes the stored telematics polling mechanism.', '26V-281 establishes a display-reset safety condition, not parasitic battery drain.'],
    summary: 'Removed the admitted cross-platform root-cause assertion and retained only a measurement-first diagnostic boundary pending exact platform-192 evidence.',
    sources: ['datasets', 'clusterRecall'],
  },
  [IDS.cluster]: {
    description: 'NHTSA recall 26V-281 covers certain 2024-2026 platform-192 AMG GT vehicles whose infotainment-control-unit software may trigger increased system resets. During a reset, the instrument cluster may briefly stop displaying driving-related information, increasing crash risk. The report lists 144,049 vehicles across all included Mercedes model lines; that total is not an AMG GT owner-report count.',
    solution: 'Check the VIN for open Mercedes campaign 2026050004. An authorized Mercedes-Benz dealer updates the infotainment control-unit software on affected vehicles. Do not buy a display, battery or control unit from this page; the official remedy is VIN-controlled software unless separate diagnosis establishes an unrelated hardware fault.',
    symptoms: ['brief interruption of driving information in the instrument cluster', 'infotainment system reset under the recalled software condition', 'VIN identified in campaign 2026050004'],
    affectedSystems: ['infotainment control unit software', 'instrument-cluster display'],
    conflict: '',
    evidence: ['The rendered 26V-281 Part 573 report directly establishes 2024-2026 platform-192 AMG GT scope, the reset mechanism, crash risk and dealer software remedy.'],
    summary: 'Replaced the uncited broad MBUX repair path with exact 26V-281 scope, mechanism and VIN-controlled software remedy.',
    sources: ['clusterRecall'],
    confidence: 'high',
  },
  [IDS.steering]: {
    description: 'XENTRY TIPS LI46.80-P-068102 establishes a rear-axle-steering software condition only for platform-190 AMG GT vehicles: steering and ESP warnings at startup can result when parked wheels are read as out of position, stuck or blocked. It does not establish the frozen 2024-2025 platform-192 chassis-calibration pattern, an alignment or low-battery cause, or the broad driver-assistance bundle.',
    solution: 'Record the exact warning and fault codes, verify battery voltage and alignment history, and follow the VIN- and platform-specific XENTRY test plan before recalibration or hardware replacement. Do not buy a sensor, steering rack or rear-steer actuator from this page; the frozen platform-192 mechanism and failed component have not been established.',
    symptoms: ['rear-axle-steering warning requiring platform-specific diagnosis', 'ESP or steering faults preserved before clearing', 'calibration or actuator fault confirmed by the applicable XENTRY test'],
    affectedSystems: ['rear-axle steering', 'ESP', 'chassis control electronics'],
    conflict: 'The exact official rear-steering bulletin applies to the prior platform 190, so it cannot support the frozen 2024-2025 platform-192 identity.',
    evidence: ['LI46.80-P-068102 explicitly lists platform 190 with rear-axle-steering option codes and its own software remedy.', 'No exact reviewed platform-192 record establishes the frozen combined cause and scope.'],
    summary: 'Separated the exact platform-190 steering bulletin from the unsupported platform-192 claim and replaced parts-first language with a VIN-specific diagnostic boundary.',
    sources: ['steering190Bulletin', 'datasets'],
  },
});

function citationsFor(id) {
  return CONTENT[id].sources.map((key) => {
    const source = PDF_SOURCES[key] || OTHER_SOURCES[key];
    return { url: source.url, type: source.type, title: source.title };
  });
}
function commerceDecisionFor(id) {
  const boundaries = {
    [IDS.mount]: 'platform and failed mount/sensor/harness are unresolved; no universal retail part',
    [IDS.battery]: 'measured diagnosis must identify the battery or wake-up source; no universal retail part',
    [IDS.cluster]: 'VIN-controlled software recall; no retail display or control unit indicated',
    [IDS.steering]: 'platform and failed sensor/actuator are unresolved; no universal retail part',
  };
  return boundaries[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  if (!content) throw new Error(`Missing content for ${id}`);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence || 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
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
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'AMG GT').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 4) throw new Error(`Expected 4 frozen AMG GT rows, found ${frozenRows.length}`);
  if (frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen AMG GT IDs do not match the adjudication contract');
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const retained = RETAIN_IDS.includes(row.id);
    return {
      id: row.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[row.id].conflict,
      reason: CONTENT[row.id].summary,
      evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' },
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
    make: 'Mercedes-Benz',
    model: 'AMG GT',
    completionStatement: 'All 4 frozen AMG GT pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Three identities materially exceed exact generation-specific evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 4 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 210-owner total is proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'amg-gt-cluster-recall-retained', severity: 'accuracy-correction', recordIds: [IDS.cluster], detail: '26V-281 directly supports the 2024-2026 platform-192 instrument-cluster interruption identity and software remedy.' },
      { code: 'amg-gt-three-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Three frozen identities lack exact generation-specific support; every indexed page remains published pending review.' },
      { code: 'amg-gt-platform-mount-conflict', severity: 'identity-conflict', recordIds: [IDS.mount], detail: 'Official mount records cover platforms 290 and 192, not the frozen 2016-2022 platform-190 transaxle-mount identity.' },
      { code: 'amg-gt-battery-cross-platform-extrapolation', severity: 'identity-conflict', recordIds: [IDS.battery], detail: 'The frozen body admits there is no AMG GT-specific bulletin and imports a root cause from other architectures.' },
      { code: 'amg-gt-steering-generation-conflict', severity: 'identity-conflict', recordIds: [IDS.steering], detail: 'The exact rear-steering bulletin applies to platform 190, not the frozen 2024-2025 platform-192 page.' },
      { code: 'amg-gt-owner-count-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'The stored 210-owner total has no reviewed source and is a proposal-only zero correction.' },
      { code: 'all-amg-gt-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No AMG GT page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 1, total: 4 },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
