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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-a-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['A-CLASS', 'A CLASS', 'A220', 'A 220', 'AMG A35', 'A35 AMG']);

const IDS = Object.freeze({
  dct: 'mercedes-a-class-dct-transmission-shudder-2019',
  mbux: 'mercedes-a-class-mbux-software-bugs-2019',
  strut: 'mercedes-a-class-suspension-strut-noise-2019',
  drain: 'mercedes-benz-a-class-c-drain-hose-water-ingress-into-footwell',
  dpf: 'mercedes-benz-a-class-diesel-particulate-filter-blockage-limp-mode-short-trips',
  carrier: 'mercedes-benz-a-class-front-axle-integral-carrier-corrosion',
  carbon: 'mercedes-benz-a-class-m282-1-3l-intake-valve-carbon-buildup',
  thermostat: 'mercedes-benz-a-class-m282-thermostat-housing-coolant-leak',
  camera: 'mercedes-benz-a-class-rearview-camera-blank-no-image',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.camera]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.dct, IDS.mbux, IDS.strut].sort());

const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10155150', '10170545', '10171647', '10177563', '10177565', '10177569',
  '10179961', '10189407', '10199660', '10206067', '10208671', '10208745',
  '10222481', '10222486', '10238424', '10248203', '10251118', '10253703',
  '11006700', '11007972', '11008093', '11011544', '11011767', '11013187',
  '11013339', '11017516', '11018204', '11019750', '11021107', '11021150',
  '11022045', '11028640', '11029964', '11032789', '11032875', '11035120',
]);
const CAMPAIGNS = Object.freeze([
  '19V314000', '19V685000', '20V046000', '20V416000', '20V753000', '21V034000',
  '21V058000', '21V354000', '21V509000', '21V961000', '21V990000', '22V232000',
  '22V365000', '23V662000', '23V732000', '26V481000',
]);

const PDF_SOURCES = Object.freeze({
  brochure: {
    title: '2021 Mercedes-Benz A-Class brochure',
    type: 'manufacturer',
    url: 'https://www.mbusa.com/content/dam/mb-nafta/us/brochures/pdf/MY21_A-Class_28_WebPDF_102020.pdf',
    localPath: 'C:/tmp/mercedes-a-class-sources/MY21-A-Class-brochure.pdf',
    pages: 26,
    visualPages: [9, 20],
    bytes: 8661443,
    sha256: 'f4d4e468aa47a8f4d51b7f460d8b85a6611e5435a20741ad49f07dedb70c58f4',
  },
  mbuxBulletin: {
    title: 'Mercedes-Benz XENTRY TIPS LI82.85-P-070544: MBUX navigation, black display and delayed operation',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10175216-9999.pdf',
    localPath: 'C:/tmp/mercedes-a-class-sources/MC-10175216.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 137671,
    sha256: '92787dfc5bf2f2390e0981921edea00aa42983f27df29e802f670c354ab1f7ab',
  },
  drainRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 20V-416: A/C drain hose',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V416-7182.PDF',
    localPath: 'C:/tmp/mercedes-a-class-sources/20V416.pdf',
    pages: 3,
    visualPages: [1, 2, 3],
    bytes: 214432,
    sha256: 'e6b6fb1807f28fde8cb3b2a4e71558d63a1650b5800b955d163d68f9cede7938',
  },
  carrierRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-990: front-axle integral carrier corrosion',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V990-1911.PDF',
    localPath: 'C:/tmp/mercedes-a-class-sources/21V990.pdf',
    pages: 4,
    visualPages: [1, 2, 3],
    bytes: 216081,
    sha256: '49c53101fe087b3e0870eebdfaa103d36694f12b69d6c62f21cb1e6331be15cb',
  },
  mbuxCameraRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-354: MBUX black display/reboot and rearview image',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V354-4001.PDF',
    localPath: 'C:/tmp/mercedes-a-class-sources/21V354.pdf',
    pages: 18,
    visualPages: [5, 14, 17],
    bytes: 239852,
    sha256: '3edd6ec964310c55d20799bd698c9ad71a57b99c9404e9000b2e5f1da08c6dc7',
  },
  cameraRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 22V-232: rearview-camera software',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V232-5291.PDF',
    localPath: 'C:/tmp/mercedes-a-class-sources/22V232.pdf',
    pages: 15,
    visualPages: [7, 13, 15],
    bytes: 237416,
    sha256: '5a0d4a1784a906cfa249c42dd63888f0ceef7bf54f484dd43917832c7f93c7eb',
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
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 16, '2020-2024': 272, '2025-2026': 238 },
  totalRows: 526,
  relevantRowCount: 68,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 1121 },
  totalRows: 1121,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function claim(description, solution, symptoms, identityConflict, evidence, summary, sources = ['datasets'], confidence = 'low') {
  return { description, solution, symptoms, identityConflict, evidence, summary, sources, confidence };
}

const CONTENT = Object.freeze({
  [IDS.dct]: claim(
    'The 2021 Mercedes-Benz USA A-Class brochure identifies a 7G-DCT seven-speed dual-clutch transmission for A220 and a seven-speed AMG SPEEDSHIFT DCT for A35. It does not support the stored 8G-DCT statement. The reviewed A-Class NHTSA corpus does not establish model-wide clutch-pack overheating, a rumble-strip shudder mechanism, the 2019-2023 scope, or the stored 1,200-owner total.',
    'Confirm the exact transmission by VIN, preserve fault and adaptation data, and have a Mercedes-qualified technician test software level, clutch adaptation, mounts, driveline and engine operation before selecting a repair. Do not buy a clutch assembly, mount or transmission part from this page; the failed component and fitment have not been established.',
    ['low-speed vibration requiring drivetrain diagnosis', 'shift or clutch adaptation fault confirmed by scan data', 'mount, engine or transmission source isolated by testing'],
    'The title may describe a real symptom, but the frozen body names the wrong transmission generation and presents an unsupported universal clutch-overheat cause and owner count.',
    ['The official brochure establishes seven-speed A220/A35 specifications; no exact reviewed NHTSA communication or campaign establishes the frozen shudder mechanism or frequency.'],
    'Proposed the unsupported 1,200-owner total as zero and replaced the wrong 8G-DCT/mechanism claims with a VIN-specific diagnostic boundary.',
    ['brochure', 'datasets']
  ),
  [IDS.mbux]: claim(
    'Mercedes-Benz XENTRY TIPS LI82.85-P-070544 covers platform 177 MBUX complaints including a black central display, navigation that cannot activate and severely delayed operation, with hard-drive diagnosis as one possible path. Recall 21V-354 separately covers a narrow safety condition in which MBUX may remain black or reboot and interrupt the rearview image. These records do not support treating every lag, voice, Bluetooth or navigation complaint through 2025 as one defect or the stored 1,500-owner total.',
    'Preserve the exact symptom, software version and control-unit log. Check applicable recall/campaign status first. Follow XENTRY diagnosis for the specific complaint; update software only when the applicable procedure calls for it, and test hard-drive values before replacing the head unit. Do not buy a display, hard drive or head unit from this page; the exact fault path and fitment must be confirmed.',
    ['central display black or delayed', 'navigation cannot activate', 'MBUX reboot or rearview-image interruption under an applicable campaign'],
    'The broad title and 2019-2025 scope combine multiple distinct software, phone-compatibility and hardware conditions that have different remedies.',
    ['LI82.85-P-070544 directly establishes platform-177 display/navigation/delay complaints and HDD testing; 21V-354 establishes only its safety-camera software condition.'],
    'Proposed the unsupported 1,500-owner total as zero and separated exact MBUX diagnostic and recall paths from the broad frozen bundle.',
    ['mbuxBulletin', 'mbuxCameraRecall']
  ),
  [IDS.strut]: claim(
    'The official 2021 A-Class brochure confirms independent suspension and distinguishes standard, AMG Sport and AMG RIDE CONTROL configurations. The reviewed 526-communication and 1,121-recall-row A-Class corpus does not establish premature front strut-mount-bearing wear, internal valving noise, greater AMG prevalence, or the stored 600-owner total.',
    'Reproduce the noise and inspect fasteners, wheel/tire, brake, stabilizer-link, ball-joint, mount and damper paths before replacing parts. Do not buy a mount bearing or strut assembly from this page; the noise source, suspension option and fitment have not been established.',
    ['front-end noise over bumps requiring chassis diagnosis', 'play or damage confirmed at a suspension joint or mount', 'damper fault confirmed after adjacent causes are excluded'],
    'The indexed title is more specific than the reviewed evidence, and the frozen solution jumps to part replacement without an exact Mercedes procedure.',
    ['The official brochure establishes multiple suspension configurations; no exact reviewed primary record establishes the frozen failure mechanism or frequency.'],
    'Proposed the unsupported 600-owner total as zero and replaced the parts-first prescription with an option- and cause-specific inspection boundary.',
    ['brochure', 'datasets']
  ),
  [IDS.drain]: claim(
    'NHTSA recall 20V-416 applies to certain 2019 A220 vehicles. An incorrectly installed air-conditioning drain hose may admit condensate into the front footwells or center tunnel, creating corrosion or short-circuit risk for nearby electrical components. The report identifies wet front carpets or fogged windows as possible warning and lists no component part number.',
    'Check the VIN for open campaign 2020070013. An authorized Mercedes-Benz dealer inspects the drain-hose installation and corrects it if necessary, free of charge. For a wet vehicle, preserve fault codes and inspect/dry affected areas under the Mercedes procedure. Do not buy hose A1678323600, a drain plug or control module from this page; the recall report does not identify those parts and campaign repair is VIN-controlled.',
    ['wet front carpets', 'fogged windows', 'electrical or SRS faults after confirmed water ingress'],
    'The title is recall-aligned, but the frozen 2020 scope, drain-plug/fuel-pump replacement language and A1678323600 part claim exceed the exact 20V-416 report.',
    ['The three-page Part 573 report establishes 2019 A220 scope, assembly deviation, warning, safety consequences, no listed part number and inspect/correct remedy.'],
    'Replaced secondary citations and unsupported part/remedy extensions with the exact 20V-416 population, warning and dealer remedy.',
    ['drainRecall'],
    'high'
  ),
  [IDS.dpf]: claim(
    'The frozen row concerns European diesel A180d/A200d/A220d variants. The U.S. NHTSA A-Class corpus cannot validate that market-specific scope, the claimed prevalence, a universal short-trip mechanism, or a single regeneration remedy. No exact Mercedes or European authority document was resolved in this pass.',
    'Preserve warning messages, codes, soot-load and differential-pressure data and follow the market-specific Mercedes owner/workshop procedure. Do not command a forced regeneration. Do not buy a DPF, pressure sensor, EGR component or injector from this page; temperature, loading, sensor and upstream causes must be diagnosed first.',
    ['DPF warning requiring market-specific diagnosis', 'measured soot load or differential pressure outside specification', 'limp mode with preserved fault data'],
    'This EU-only diesel identity is not adjudicable from the U.S. primary corpus and the frozen advice presents an unsourced universal highway/forced-regeneration path.',
    ['The NHTSA dataset scope is documented as a limitation, not proof that the EU condition does not exist.'],
    'Removed the universal regeneration prescription and recorded the need for an exact market-specific Mercedes source.',
    ['datasets']
  ),
  [IDS.carrier]: claim(
    'NHTSA recall 21V-990 covers certain 2019-2020 A220 vehicles. Insufficient corrosion protection on the front-axle integral carrier may permit corrosion after several years and could affect steering. The report lists integral-carrier part A1776207101 and states that no field complaints worldwide had been reported when Mercedes initiated the recall out of caution.',
    'Check the VIN for open campaign 2022070009. An authorized Mercedes-Benz dealer inspects the integral carrier and replaces it if necessary, free of charge. Do not buy A1776207101 or a subframe from this page; the recall repair is inspection- and VIN-controlled.',
    ['no advance warning identified by the recall', 'corrosion found during campaign inspection', 'integral-carrier replacement directed by the dealer campaign'],
    'The recall identity and frozen years are supported, but the frozen engine field calls the A220 engine “M282 2.0L,” which conflicts with official A220 specifications and cannot be silently changed under this audit.',
    ['The visually reviewed Part 573 report establishes A220 population, corrosion mechanism, steering risk, component number, no-warning statement and inspect/replace remedy.'],
    'Replaced secondary recall summaries with the exact 21V-990 report and removed unsupported out-of-recall retail replacement advice.',
    ['carrierRecall'],
    'high'
  ),
  [IDS.carbon]: claim(
    'The frozen row concerns European A180/A200 M282 1.3L variants. The U.S. NHTSA A-Class corpus does not establish a model-wide intake-valve carbon defect, onset near 60,000 miles, or a fixed 50,000-60,000-mile walnut-blasting interval. No exact Mercedes primary document was resolved for those claims.',
    'Diagnose rough running or hesitation with preserved codes, fuel trims, ignition and compression data before inspecting intake deposits. Choose cleaning or repair only after the deposit and cause are confirmed. Do not buy an intake-cleaning kit, separator or valve service from this page; the condition and fitment have not been established.',
    ['rough running requiring measured diagnosis', 'hesitation with ignition and fueling causes excluded', 'intake deposits confirmed by inspection'],
    'The title asserts a specific mechanism and the body supplies fixed mileage intervals without exact primary support.',
    ['The NHTSA dataset scope is documented as a limitation, not proof that the EU condition does not exist.'],
    'Removed fixed carbon-cleaning intervals and unsourced prevention claims and recorded the primary-source gap.',
    ['datasets']
  ),
  [IDS.thermostat]: claim(
    'A-Class communication 10199660 records a coolant warning associated with a coolant-line leak on A220/A35 vehicles. It does not establish an M282 thermostat-housing defect, a 55,000-70,000-mile pattern, or the frozen combined A180/A200/A250 engine scope. The current title and body also conflict because the title names M282 while the frozen applicability includes M260.',
    'Pressure-test the cooling system cold and identify the exact leak before replacing anything. Check the VIN-specific Mercedes procedure and verify whether the source is a line, connection, pump, thermostat housing or another component. Do not buy a thermostat housing, water pump or hose from this page; the failed component and fitment have not been established.',
    ['coolant warning requiring leak localization', 'visible coolant loss confirmed by pressure testing', 'temperature-control fault confirmed separately from leakage'],
    'The indexed title and frozen applicability assert an M282 thermostat-housing identity while the exact communication only establishes a coolant-line complaint on A220/A35.',
    ['Communication 10199660 is the only exact reviewed A-Class coolant-line record; it does not prove the frozen thermostat-housing mechanism.'],
    'Bounded the exact coolant-line communication and removed unsupported thermostat, pump, mileage and combined-engine claims.',
    ['datasets']
  ),
  [IDS.camera]: claim(
    'NHTSA recall 21V-354 covers 2019-2021 A220 and 2020-2021 A35 AMG vehicles whose MBUX display may remain black or reboot, interrupting the rearview image. Recall 22V-232 covers 2019-2020 A220 and 2020 AMG A35 vehicles whose rearview-camera software may fail to display the image within the FMVSS 111 requirement. These are distinct software conditions under the same accurate indexed camera identity.',
    'Check the VIN for open campaigns 2021050012 and 2022060007. The 21V-354 remedy is a dealer or OTA MBUX software update; the 22V-232 remedy is inspection and, if necessary, update of rearview-camera software. Do not buy a camera or head unit from this page; both remedies are software/VIN controlled unless separate diagnosis proves hardware failure.',
    ['black or rebooting MBUX display with rearview-image interruption', 'rearview image absent after reverse is selected', 'camera-software update directed by an open campaign'],
    '',
    ['The rendered Part 573 reports directly establish A220/A35 populations, FMVSS 111 risks, software causes and software remedies.'],
    'Replaced secondary citations with exact 21V-354 and 22V-232 Part 573 reports and separated their software conditions and remedies.',
    ['mbuxCameraRecall', 'cameraRecall'],
    'high'
  ),
});

function contentFor(id) {
  const content = CONTENT[id];
  if (!content) throw new Error(`Unexpected A-Class row ${id}`);
  return content;
}
function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  return contentFor(id).sources.map((key) => citation(PDF_SOURCES[key] || OTHER_SOURCES[key]));
}
function commerceDecisionFor(id) {
  const boundary = {
    [IDS.dct]: 'confirm the transmission, failure and VIN fitment first',
    [IDS.mbux]: 'follow the complaint-specific XENTRY or recall path first',
    [IDS.strut]: 'isolate the chassis noise and suspension option first',
    [IDS.drain]: 'VIN-controlled recall inspection; the report lists no retail component part number',
    [IDS.dpf]: 'market-specific diagnosis and Mercedes procedure required first',
    [IDS.carrier]: 'VIN-controlled recall inspection and dealer replacement if necessary',
    [IDS.carbon]: 'confirm deposits and their cause before any cleaning service',
    [IDS.thermostat]: 'pressure-test and localize the exact cooling-system leak first',
    [IDS.camera]: 'VIN-controlled software remedy; no retail camera or head unit indicated',
  };
  return `No universal retail part; ${boundary[id]}.`;
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
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'A-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9) throw new Error(`Expected 9 frozen A-Class rows, found ${frozenRows.length}`);
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
    make: 'Mercedes-Benz',
    model: 'A-Class',
    completionStatement: 'All 9 frozen A-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Eight identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 1,200-, 1,500- and 600-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall and campaign population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'a-class-camera-identity-retained', severity: 'accuracy-correction', recordIds: [IDS.camera], detail: '21V-354 and 22V-232 directly support the frozen rearview-camera identity while requiring distinct software/population wording.' },
      { code: 'a-class-eight-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Eight titles or frozen applicability fields exceed exact evidence; every indexed page remains published pending review.' },
      { code: 'a-class-transmission-spec-conflict', severity: 'identity-conflict', recordIds: [IDS.dct], detail: 'The official 2021 brochure specifies seven-speed A220/A35 DCTs, contradicting the stored 8G-DCT claim.' },
      { code: 'a-class-drain-scope-overstated', severity: 'scope-conflict', recordIds: [IDS.drain], detail: '20V-416 covers certain 2019 A220 vehicles and lists no component part number; frozen 2020/retail-part extensions are held.' },
      { code: 'a-class-carrier-engine-conflict', severity: 'scope-conflict', recordIds: [IDS.carrier], detail: '21V-990 supports the recall identity and 2019-2020 A220 scope, but the frozen engine label conflicts with official A220 specifications.' },
      { code: 'a-class-eu-source-gap', severity: 'manual-source-review', recordIds: [IDS.dpf, IDS.carbon], detail: 'EU diesel/M282 rows require exact market-specific Mercedes or authority evidence; U.S. NHTSA absence is not treated as disproof.' },
      { code: 'a-class-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 1,200-, 1,500- and 600-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'all-a-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No A-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: 1,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 8,
      fabricated_report_counts_proposed_zero: 3,
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
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  proposalFor,
};
