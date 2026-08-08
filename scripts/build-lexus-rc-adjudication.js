/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-rc-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const MODEL_ALIASES = Object.freeze(['RC', 'RC 200T', 'RC200T', 'RC 300', 'RC300', 'RC 350', 'RC350', 'RC F', 'RCF']);
const IDS = Object.freeze({
  battery: 'lexus-rc-battery-discharge-and-no-start-2023',
  brakes: 'lexus-rc-brake-pedal-vibration-or-2023',
  carbon: 'lexus-rc-carbon-buildup-turbo-2016',
  infotainment: 'lexus-rc-infotainment-screen-freezing-carplayandroid-2023',
  rattle: 'lexus-rc-interior-rattle-and-buzzing-2023',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze(['18V107000', '20V012000', '20V682000', '22V615000', '26V222000']);

const PDF_SOURCES = Object.freeze({
  dcmFaq: {
    title: 'Special Service Campaign 22LC01 FAQ - DCM Reprogramming',
    type: 'oem',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10220152-9999.pdf',
    localPath: 'C:/tmp/MC-10220152-9999.pdf',
    nhtsaDocumentId: '10220152',
    pages: 11,
    bytes: 269915,
    sha256: '05b7365d5dfcf5379ee5e6b81e6307f0b7a96226e22d800642b200657d098021',
  },
  injectionTip: {
    title: 'L-TT-0193-15 - Fuel Injection Active Test Remedy (2GR-FKS and 8AR-FTS)',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10152276-9999.pdf',
    localPath: 'C:/tmp/MC-10152276-9999.pdf',
    nhtsaDocumentId: '10152276',
    pages: 4,
    bytes: 608350,
    sha256: '5255691f4ed2e45fa45c62675000f78331a7522e2cae29ac1d062762985f511f',
  },
  multimediaRecorder: {
    title: 'L-TT-0341-25 - Multimedia Recorder (MMR) Download Instructions',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11018326-0001.pdf',
    localPath: 'C:/tmp/MC-11018326-0001.pdf',
    nhtsaDocumentId: '11018326',
    pages: 5,
    bytes: 999884,
    sha256: 'f830d6f780b1f897cdc0384f48f1e28b1c3784bb3848b16e3ba10b0188cff087',
  },
});

const SECONDARY_SOURCES = Object.freeze({
  batteryReport: {
    title: 'RC350 loses power after parking - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/rc-1st-gen-2015-present/1025663-rc350-is-loosing-power-after-a-park-it.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A recent RC350 owner reported a no-power/no-start event after parking despite a recently dated battery; the discussion does not establish the vehicle model year, a DCM cause or a recurring defect.',
  },
  brakeReport: {
    title: 'RC F brake pedal and steering-wheel shake - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/rc-f-2015-present/991738-oem-brakes-question.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'One RC F owner reported brake-pedal and steering-wheel shake; replies discuss possible heat and rotor conditions, but the thread does not prove rotor thickness variation or the frozen 2023-2025 applicability.',
  },
  currentRattleDiscussion: {
    title: 'RC interior creaks and rattles discussion - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/rc-1st-gen-2015-present/1047003-interior-creaks-and-rattles.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 2025 discussion asks RC owners about creaks and rattles and includes individual console-lid experience; it is not a prevalence study and does not establish every location or current-model-year coverage.',
  },
  rearRattleReport: {
    title: 'RC rear parcel-shelf rattle owner report - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/rc-1st-gen-2015-present/990782-terrible-rattle.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 2022 RC owner reported a loud rear-area rattle and participants suggested the rear speaker grille or parcel shelf; the exact source was not proven in the captured report.',
  },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 908, '2020-2024': 573, '2025-2026': 23 },
  totalRows: 1504,
  exactSourceDocumentIds: ['10152276', '10220152', '11018326'],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 42 },
  totalRows: 42,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { type: source.type, title: source.title, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.battery) return [citation(PDF_SOURCES.dcmFaq), citation(SECONDARY_SOURCES.batteryReport)];
  if (id === IDS.brakes) return [citation(SECONDARY_SOURCES.brakeReport)];
  if (id === IDS.carbon) return [citation(PDF_SOURCES.injectionTip)];
  if (id === IDS.infotainment) return [citation(PDF_SOURCES.multimediaRecorder)];
  if (id === IDS.rattle) return [citation(SECONDARY_SOURCES.currentRattleDiscussion), citation(SECONDARY_SOURCES.rearRattleReport)];
  throw new Error(`Unexpected RC record ${id}`);
}
function contentFor(id) {
  const content = {
    [IDS.battery]: {
      description: 'The exact Lexus DCM campaign found for RC vehicles, 22LC01, covered certain 2021 RC300, RC350 and RC F vehicles and addressed loss of voice communication during a Safety Connect call. It did not identify battery discharge, a module that stays awake, or 2023-2025 RC vehicles. A recent direct RC350 report documents one no-power/no-start event after parking, but it does not identify the vehicle model year or prove a DCM cause. The complete RC communication inventory therefore does not substantiate the frozen DCM-causation or multiple-owner claims for 2023-2025.',
      solution: 'Test battery state of health and charging output first, then measure key-off current only after the vehicle has completed its specified sleep period. If draw remains excessive, isolate the circuit and inspect recent accessories, key proximity, wiring and the modules on that circuit under the exact repair procedure. Apply a DCM campaign or replace a DCM only when the VIN, calibration and diagnosis support it; 22LC01 is not a battery-drain bulletin. This is vehicle-specific electrical diagnosis; no universal battery, DCM or retail part is asserted.',
      confidence: 'low',
      summary: 'Disclosed that 22LC01 addressed 2021 Safety Connect audio rather than 2023-2025 battery drain and removed unsupported DCM, prevalence, cost and replacement certainty.',
    },
    [IDS.brakes]: {
      description: 'A direct RC F report confirms that an owner can experience brake-pedal and steering-wheel shake, but the discussion does not establish rotor thickness variation as the cause or tie the report to the frozen 2023-2025 range. No exact Lexus communication in the complete RC inventory documents current-model RC pedal pulsation, low-mileage prevalence, pad transfer or heat-cycle causation. The indexed identity is retained, but its cause and generation-wide framing remain unverified.',
      solution: 'Have a qualified brake technician reproduce the symptom and inspect tires, wheel mounting and hub cleanliness before measuring disc lateral runout and thickness variation and checking caliper operation. Resurface or replace a disc, pad or related component only when measurements and the exact model-year limits support that repair. Do not prescribe a pad-and-rotor set, a bed-in cycle or upgraded parts from the symptom alone. This is condition- and vehicle-specific brake diagnosis; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Retained the direct brake-shake report while removing unverified 2023-2025 prevalence, rotor-thickness, pad-transfer, heat-cycle and automatic parts prescriptions.',
    },
    [IDS.carbon]: {
      description: 'Lexus tech tip L-TT-0193-15 lists the 2016 RC200t with the 8AR-FTS and instructs technicians when switching the engine active test from direct injection to port injection. That primary document directly contradicts the existing statement that this engine has no port injection to wash the valves. The complete RC communication inventory and direct-source search did not establish a 40,000-mile onset, a model-wide deposit pattern, or the claimed RC300 service interval. The frozen carbon-buildup identity is retained, but its mechanism and prevalence are unverified.',
      solution: 'For rough idle, hesitation or misfire codes, diagnose ignition, fuel delivery, air leaks, compression and injector operation before attributing the symptom to intake deposits. Inspect the intake valves only when testing supports that path, and use a cleaning procedure only if deposits are actually confirmed and the exact service information permits it. No source here supports scheduled walnut blasting, an oil catch can or a specific aftermarket part for every 8AR-FTS RC. This is engine-specific diagnosis; no universal cleaning service or retail part is asserted.',
      confidence: 'low',
      summary: 'Corrected the false no-port-injection mechanism and removed unsupported mileage, walnut-blasting interval, fuel, catch-can and part-number recommendations.',
    },
    [IDS.infotainment]: {
      description: 'Lexus tech tip L-TT-0341-25 applies to 2018-2025 RC300, RC350 and RC F vehicles and directs technicians to preserve and retrieve Multimedia Recorder data for Apple CarPlay, Android Auto and Bluetooth concerns and for rebooting, screen, connectivity and related events. The document calls MMR a quality-investigation tool rather than a case-by-case diagnostic tool. It supports recording these concern categories, but it does not say every 2023-2025 RC is affected, that the issue is usually software, or that a cable, USB port or head unit is the default cause.',
      solution: 'Record the date, time, connection type, phone and exact symptom. If dealer assistance is needed, avoid restarting the head unit solely as a workaround before the event is captured because L-TT-0341-25 says a restart can erase MMR data; a qualified technician can retrieve the logs when requested and then follow the exact diagnostic path. Verify phone, cable and available vehicle software without assuming any one cause, and replace hardware only after diagnosis. This is event- and equipment-specific multimedia diagnosis; no universal cable, port or head unit is asserted.',
      confidence: 'medium',
      summary: 'Bound the page to Lexus MMR capture guidance and removed prevalence, default-software-cause, climate-integration, cable and routine head-unit replacement claims.',
    },
    [IDS.rattle]: {
      description: 'Direct RC discussions document individual center-console, dashboard and rear-area rattles, including a rear parcel-shelf report. The reports do not establish one shared cause, and the complete Lexus communication inventory contains no exact bulletin for the frozen 2023-2025 door-panel, dashboard and rear-trim identity. This evidence supports retaining a bounded owner-reported rattle page, but not calling it a recurring current-model defect or attributing it generally to the coupe body, tires or suspension.',
      solution: 'Remove loose cabin and trunk items, then reproduce and record the noise with road speed, temperature and surface noted. A qualified trim technician can use non-damaging pressure and inspection to isolate the exact panel, fastener, speaker grille or contact point before removing trim. Add the model-appropriate isolator, clip or fastener only after the source is confirmed, and take care around curtain-airbag and restraint trim. This is location-specific trim diagnosis; no universal felt, foam, clip or retail part is asserted.',
      confidence: 'low',
      summary: 'Retained bounded RC rattle reports while removing unsupported 2023-2025 prevalence, chassis causation, universal locations and generic felt/clip prescriptions.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected RC record ${id}`);
  return content;
}
function commerceDecisionFor(id) {
  if (!BLOCKER_IDS.includes(id)) throw new Error(`Unexpected RC record ${id}`);
  return 'diagnosis-or-campaign-specific-no-universal-retail-part';
}
function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = content.confidence;
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor(row.id);
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.summary;
  return proposal;
}
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact RC communication rows plus ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.battery]: [common, 'Visual review of the 22LC01 FAQ confirms certain 2021 RC applicability and a Safety Connect voice-communication condition, not battery drain.', 'A recent direct RC350 report supports one no-start event but does not prove model year, recurrence or DCM causation.', 'No exact source supports the frozen 2023-2025 DCM-stays-awake claim, module replacement or owner-count framing.'],
    [IDS.brakes]: [common, 'One direct RC F report confirms pedal and steering-wheel shake while braking.', 'The report does not prove rotor thickness variation, and no exact Lexus communication supports the frozen 2023-2025 applicability or prevalence.', 'The body therefore preserves the symptom identity but requires measurement before any disc or pad prescription.'],
    [IDS.carbon]: [common, 'Visual review of L-TT-0193-15 confirms that the 2016 RC200t 8AR-FTS diagnostic active test switches between direct and port injection.', 'That directly contradicts the frozen explanation that the engine lacks port injection.', 'No exact source supports a 40,000-mile onset, 40,000-60,000-mile walnut schedule, JLT-3012P catch can or universal cleaning requirement.'],
    [IDS.infotainment]: [common, 'Visual review of L-TT-0341-25 confirms 2018-2025 RC applicability and MMR capture for CarPlay, Android Auto, Bluetooth, rebooting, screen and connectivity concerns.', 'The tech tip says MMR is a quality-investigation tool, not a case-by-case diagnostic tool, and warns that restarting the head unit can erase data.', 'It does not establish prevalence, a default software/cable cause or routine head-unit replacement.'],
    [IDS.rattle]: [common, 'Direct RC discussions document individual center-console, dashboard and rear-area rattles.', 'The reports do not establish one shared source, prevalence or the frozen 2023-2025 coverage, and the complete inventory contains no exact rattle bulletin.', 'Any felt, foam, clip or fastener remains location- and diagnosis-specific rather than a universal commerce recommendation.'],
  }[row.id];
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'RC').sort((left, right) => left.id.localeCompare(right.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-and-direct-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'RC',
    completionStatement: 'All five frozen RC pages retain their indexed identities while exact Lexus documents and bounded owner reports disclose unsupported causes, years, prevalence and repair prescriptions.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Five material evidence corrections require independent review before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All five RC IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, allowed severities and publication states remain unchanged.',
      'The 22LC01 DCM campaign is not represented as a battery-drain campaign or extended beyond its exact applicability.',
      'The 8AR-FTS is not described as direct-injection-only when Lexus documents both direct and port injection operation.',
      'No battery, DCM, brake, cleaning service, catch can, cable, head unit, felt, foam or clip is approved without exact diagnosis and fitment.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'rc-dcm-condition-mismatch-disclosed', severity: 'critical-correction', recordIds: [IDS.battery], detail: '22LC01 covered Safety Connect voice communication on earlier RCs, not a 2023-2025 battery-drain identity.' },
      { code: 'rc-port-injection-correction', severity: 'critical-correction', recordIds: [IDS.carbon], detail: 'Lexus documentation proves 8AR-FTS direct and port injection operation, invalidating the frozen no-port-injection mechanism.' },
      { code: 'rc-owner-reports-bounded', severity: 'accuracy-safety', recordIds: [IDS.battery, IDS.brakes, IDS.rattle], detail: 'Direct reports preserve bounded symptoms without converting individual experiences into prevalence or universal causes.' },
      { code: 'rc-multimedia-diagnostics-bounded', severity: 'source-safety', recordIds: [IDS.infotainment], detail: 'Lexus MMR guidance supports event capture, not a default software, cable, port or head-unit diagnosis.' },
      { code: 'rc-unsupported-prescriptions-removed', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Every repair remains campaign-, measurement-, event- or location-specific; no guessed commerce is proposed.' },
      { code: 'all-rc-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'All five indexed RC identities and internal related links remain preserved.' },
    ],
    pdfSources: publicPdfSources(),
    secondarySourceReview: SECONDARY_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SECONDARY_SOURCES, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor, publicPdfSources };
