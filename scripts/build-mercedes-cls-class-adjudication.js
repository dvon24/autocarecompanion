/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-cls-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CLS', 'CLS-CLASS', 'CLS CLASS', 'CLS350', 'CLS 350', 'CLS400', 'CLS 400', 'CLS450', 'CLS 450', 'CLS500', 'CLS 500', 'CLS550', 'CLS 550', 'CLS53 AMG', 'CLS 53 AMG', 'AMG CLS53', 'AMG CLS 53', 'CLS63 AMG', 'CLS 63 AMG', 'AMG CLS63', 'AMG CLS 63']);
const SEARCH_TERMS = Object.freeze(['48V', '48 volt', 'starter-generator', 'ISG', 'DC/DC', 'brake squeal', 'brake noise', 'rotor', 'MBUX', 'instrument cluster', 'display black', 'rearview camera', 'panoramic roof', 'sunroof', 'creak', 'popping', 'binding', 'valve body', 'conductor plate', '722.9', 'air suspension', 'AIRMATIC', 'air strut', 'crankshaft position', 'headlamp', 'headlight', 'LED', 'ballast', 'balance shaft', 'M272', 'M273']);
const IDS = Object.freeze({
  hybrid48v: 'mercedes-benz-cls-class-48-volt-integrated-starter-generator-2019',
  brakes: 'mercedes-benz-cls-class-front-brake-squeal-and-2019',
  mbux: 'mercedes-benz-cls-class-mbux-instrument-cluster-2019',
  sunroof: 'mercedes-benz-cls-class-panoramic-sunroof-creaking-popping-2019',
  valveBody: 'mercedes-cls-class-7g-tronic-valve-body-2005',
  airmatic: 'mercedes-cls-class-air-suspension-failure-2012',
  crankSensor: 'mercedes-cls-class-crankshaft-position-sensor-2012',
  headlight: 'mercedes-cls-class-led-headlight-ballast-2012',
  balanceShaft: 'mercedes-cls-class-m272-balance-shaft-2005',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.valveBody, IDS.airmatic, IDS.crankSensor, IDS.headlight, IDS.balanceShaft].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10043810', '10189404', '10208671', '11010818', '11012904', '11031629']);
const CAMPAIGNS = Object.freeze(['05V133000', '08V303000', '12V533000', '15V088000', '15V137000', '15V505000', '17V177000', '18V515000', '18V761000', '18V850000', '18V911000', '19V540000', '19V605000', '19V787000', '19V788000', '19V918000', '20V068000', '20V449000', '21V058000', '21V072000', '21V196000', '21V230000', '21V354000', '21V483000', '21V527000', '22V189000', '22V232000', '22V365000', '22V533000', '22V733000', '22V954000', '23V445000', '23V574000', '24V100000', '24V445000', '24V874000']);

const PDF_SOURCES = Object.freeze({
  hybrid48vBulletin: {
    title: 'Mercedes-Benz XENTRY LI54.10-P-069698: functional impairment of the 48V system on model series 257 and related platforms',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10189404-9999.pdf',
    localPath: 'C:/tmp/mercedes-cls-sources/10189404.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 49427,
    sha256: '14a5007ddd810ccb9e99b549b9f209d5c6d1781fd5dd09262b7d2ebf0df424c2',
  },
  mbuxCampaign: {
    title: 'Mercedes-Benz campaign 2022010008: 2021-2022 platform-257 MBUX navigation software update',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10208671-0001.pdf',
    localPath: 'C:/tmp/mercedes-cls-sources/10208671.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 401048,
    sha256: 'ccc94be7fae84c8725fd805b7d730b9448ee067aaaa159ab356f395bd10e206d',
  },
  balanceShaftWarranty: {
    title: 'Mercedes-Benz balance-shaft and idle-gear warranty extension: qualifying 2005-2007 M272/M273 vehicles',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031629-0001.pdf',
    localPath: 'C:/tmp/mercedes-cls-sources/11031629.pdf', pages: 2, visualPages: [1, 2], bytes: 179319,
    sha256: '0b90bafb76f147b9d89be9693d97dfe68dbafd0e9b88f1f47595207299b97670',
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 52, '2010-2014': 233, '2015-2019': 190, '2020-2024': 453, '2025-2026': 375 },
  totalRows: 1303, relevantRowCount: 495, uniqueRelevantCommunications: 153, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 2, post: 1830 }, totalRows: 1832,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.hybrid48v]: {
    description: 'XENTRY LI54.10-P-069698 directly includes model series 257 with code B01, but it describes several distinct 48V conditions: software-related intermittent or permanent no-starts, a 48V-system short, battery disconnection after an abnormality, connector or cable faults and cause-specific component testing. It does not establish one recurring integrated-starter-generator/DC-DC hardware failure across every 2019-2024 CLS 450 and AMG CLS 53 or validate the frozen generic fault-code list.',
    solution: 'Preserve the exact warning sequence and complete 12V/48V fault data, identify the applicable cause in LI54.10-P-069698 and complete the specified software, cable, connection and component tests before replacement. Do not buy an ISG, DC/DC converter, 48V battery or cable from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['exact 48V warning and no-start sequence recorded', 'complete 12V and 48V quick-test data preserved', 'software, cables and connections checked before hardware replacement'], affectedSystems: ['48V electrical system', 'energy management'],
    conflict: 'The exact bulletin proves multiple cause-specific 48V conditions, not the frozen single ISG/DC-DC hardware-failure identity and full scope.', evidence: ['All five rendered pages of LI54.10-P-069698 list model series 257 and separate software, battery, short-circuit and connection causes.', 'The bulletin requires cause-matched remedies and testing rather than universal ISG or converter replacement.'], summary: 'Separated exact 48V conditions from the unsupported universal ISG/DC-DC hardware identity.', sources: ['hybrid48vBulletin', 'datasets'],
  },
  [IDS.brakes]: {
    description: 'Mercedes AMG brake communications describe service-brake noise and squeal as frictional vibration that can vary with speed, brake pressure, driving style, temperature and humidity. They direct technicians to reproduce the complaint and inspect wear or damage. They do not establish premature rotor/pad wear across 2019-2024 CLS 450 AMG Line and AMG CLS 53 vehicles or prove updated shims, anti-squeal compound and pad/rotor replacement as universal remedies.',
    solution: 'Reproduce the noise safely, identify the axle and brake package, measure pad thickness, rotor thickness and runout, and inspect surfaces, hardware and caliper movement using the VIN-specific procedure. Do not buy pads, rotors, shims or calipers from this page; measured condition and exact fitment are unresolved.',
    symptoms: ['noise conditions reproduced safely', 'brake package identified by VIN', 'pad and rotor measurements documented before parts selection'], affectedSystems: ['service brakes', 'front brake package'],
    conflict: 'Exact AMG evidence supports condition-specific frictional noise, not the title’s premature-wear identity or full CLS scope.', evidence: ['Communication 11012904 attributes AMG brake noise to frictional vibration and requires inspection.', 'The exact communication does not establish premature wear on the non-AMG frozen trim.'], summary: 'Separated supported AMG brake noise from unsupported premature-wear and broad-trim claims.', sources: ['datasets'],
  },
  [IDS.mbux]: {
    description: 'Mercedes campaign 2022010008 directly includes 2021-2022 CLS platform 257, but its issue is narrowly that MBUX navigation may be unavailable because control-unit software is not at the latest production configuration. Its remedy is a software update. It does not establish the frozen 2019-2024 bundle of instrument-cluster freezes, black screens, reboot loops, audio failures and backup-camera malfunctions or hardware replacement.',
    solution: 'Preserve the exact display, cluster, audio, navigation and camera symptom separately, record fault logs and software versions, and check the VIN for applicable software campaigns. Follow the symptom-specific XENTRY procedure before hardware decisions. Do not buy a display, MBUX unit, cluster, camera or video cable from this page; the failed path and VIN fitment are unresolved.',
    symptoms: ['affected display or camera path identified', 'fault logs and software versions preserved', 'VIN campaign status checked before hardware replacement'], affectedSystems: ['MBUX infotainment', 'instrument cluster and display network', 'rearview display path'],
    conflict: 'The exact campaign supports only a 2021-2022 navigation-software condition, not the frozen cross-system 2019-2024 identity.', evidence: ['All four rendered pages of campaign 2022010008 identify navigation availability and MBUX software update.', 'The campaign does not identify black screens, cluster freezing or backup-camera failure.'], summary: 'Narrowed exact MBUX evidence to navigation software and held the broader cluster/camera identity.', sources: ['mbuxCampaign', 'datasets'],
  },
  [IDS.sunroof]: {
    description: 'The frozen page has no citation and attributes panoramic-roof creaking, popping and binding to seal friction, panel adjustment or frame movement across every 2019-2024 CLS. The reviewed 1,303-row manufacturer corpus does not establish that combined platform-257 mechanism or universal lubrication and alignment remedy. Roof-area noise can also originate in trim, guides, fasteners, seals, glass adjustment or body movement.',
    solution: 'Reproduce the noise with the shade and roof in controlled positions, inspect for visible damage or binding, and follow the VIN-specific roof-noise diagnostic and adjustment procedure. Do not buy a seal, guide, fastener or roof cassette from this page; the noise source and fitment are unresolved.',
    symptoms: ['roof-area noise reproduced and localized', 'shade and panel positions documented', 'visible damage and binding checked before adjustment'], affectedSystems: ['panoramic roof', 'roof trim and guides'],
    conflict: 'No exact reviewed primary record supports the frozen seal/friction/frame mechanism or full year scope.', evidence: ['No exact panoramic-roof creak, pop or binding record appears in the reviewed CLS manufacturer corpus.'], summary: 'Removed the assumed roof mechanism and parts-first implications pending exact diagnosis.', sources: ['datasets'],
  },
  [IDS.valveBody]: {
    description: 'The frozen page converts varied 722.9 shift and communication symptoms into a universal valve-body/conductor-plate failure. Mercedes communications 11010818 and 11023193 instead require electrical, connector and communication checks before component replacement when the VGS is absent from the quick test; only after those checks may an electrohydraulic controller be considered. They do not establish the frozen 2005-2014 CLS population, frequency claim or simultaneous conductor-plate, solenoid and valve-body failure.',
    solution: 'Confirm the installed transmission, preserve the quick test, VGS data and EEPROM where available, inspect power, wiring, connectors and fluid condition, and follow the exact XENTRY diagnostic path. Do not buy a conductor plate, valve body, solenoid or transmission kit from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['installed transmission confirmed by VIN', 'quick test and VGS data preserved', 'power, wiring and connectors checked before replacement'], affectedSystems: ['722.9 transmission controls', 'electrohydraulic controller'],
    conflict: 'Exact Mercedes records are narrow no-communication diagnostics, not proof of the frozen universal valve-body identity.', evidence: ['Communications 11010818 and 11023193 require checks before replacing any 722.9 component.', 'Communication 10021381 concerns software updates and does not prove valve-body failure.'], summary: 'Replaced the universal valve-body claim with exact diagnostic boundaries and proposed the 1,800-owner total as zero.', sources: ['datasets'],
  },
  [IDS.airmatic]: {
    description: 'Mercedes communications do establish that an AIRMATIC malfunction can result from a leaking system rather than a faulty compressor, and separately identify cable and rear-level-sensor conditions. They do not establish the frozen 2012-2018 C218 pattern of front-strut and rear-spring bladder cracking, compressor burnout or the claim that all four units should be replaced together. The stored Arnott AS-3226 recommendation has no reviewed CLS VIN-level fitment evidence.',
    solution: 'Measure ride height and pressure loss, isolate the leaking corner or circuit, test compressor output and duty cycle, and inspect lines, valve block, sensors, wiring and relay before selecting a repair. Do not buy an air strut, spring, compressor, relay or valve block from this page; the failed component and exact fitment are unresolved.',
    symptoms: ['ride-height loss measured by corner', 'leak isolated before compressor replacement', 'sensor, wiring and compressor operation tested'], affectedSystems: ['AIRMATIC suspension', 'air supply and ride-height control'],
    conflict: 'Exact communications support multiple AIRMATIC causes, not the frozen universal strut/bladder failure identity or AS-3226 fitment.', evidence: ['Communication 10043810 explicitly distinguishes a leaking AIRMATIC system from a faulty compressor.', 'Communications 10038024 and 10044180 identify different cable and sensor conditions.'], summary: 'Separated exact AIRMATIC diagnostic causes, removed unverified AS-3226 commerce and proposed the 680-owner total as zero.', sources: ['datasets'],
  },
  [IDS.crankSensor]: {
    description: 'The frozen page relies on an uncited forum title and asserts heat-driven crankshaft-position-sensor failure without warning across 2012-2018 CLS400 and CLS550 vehicles with M276 and M278 engines. The reviewed manufacturer corpus does not establish that pattern, the proactive 80,000-100,000-mile replacement claim, the instruction to carry a spare or a universal Bosch sensor fitment. Stall and no-start complaints require fault and signal diagnosis before selecting a sensor.',
    solution: 'Preserve stall/no-start fault data, verify engine speed and crank/cam synchronization while cranking, and test sensor power, ground, signal and wiring using the engine- and VIN-specific procedure. Do not buy or proactively replace a crankshaft-position sensor from this page; failure and fitment are not established.',
    symptoms: ['stall or no-start event documented', 'engine-speed and synchronization data checked', 'sensor circuit and wiring tested before replacement'], affectedSystems: ['engine position sensing', 'engine management'],
    conflict: 'No exact reviewed primary record supports the frozen heat-cycle mechanism, full scope or proactive sensor replacement.', evidence: ['No exact crankshaft-position-sensor failure record appears in the reviewed CLS manufacturer corpus.'], summary: 'Removed unsupported proactive replacement and proposed the 560-owner total as zero.', sources: ['datasets'],
  },
  [IDS.headlight]: {
    description: 'The frozen page relies on an uncited forum title and combines a ballast, LED driver module, individual LED-segment failure and mandatory full Multibeam assembly replacement across 2012-2018 C218 vehicles. The reviewed CLS manufacturer corpus contains exact headlamp fogging and diagnostic records but no primary record establishing this combined failure identity, full year scope, repairability claim or specialist price range.',
    solution: 'Record the exact failed lighting function and fault codes, identify the installed headlamp option by VIN, and test power, ground, connectors, control modules and the lamp assembly using the exact wiring diagram. Do not buy a ballast, LED driver or complete headlamp from this page; the lighting system, failed component and fitment are unresolved.',
    symptoms: ['installed headlamp option identified by VIN', 'failed lighting function and fault codes recorded', 'power, ground and communication tested before replacement'], affectedSystems: ['exterior lighting', 'headlamp controls'],
    conflict: 'No exact reviewed primary record supports the frozen ballast/LED-driver/assembly identity or universal replacement claim.', evidence: ['Reviewed CLS headlamp communications address fogging and leak diagnosis, not the frozen ballast and LED-segment failure bundle.'], summary: 'Removed unsupported headlamp-module and replacement claims and proposed the 420-owner total as zero.', sources: ['datasets'],
  },
  [IDS.balanceShaft]: {
    description: 'Mercedes extended coverage for confirmed worn sintered-steel M272 balance-shaft sprockets or M273 idle gears only on qualifying 2005-2007 vehicles within exact engine-serial limits. The rendered document lists CLS550, not a universal 2005-2010 CLS350/CLS500 population. The frozen title is M272-specific while its engine field also includes M273, and the body incorrectly treats both engines as the same balance-shaft component and predicts catastrophic tooth stripping without exact support.',
    solution: 'Confirm the engine designation and serial number, preserve cam/crank correlation faults, and diagnose under LI03.30-P-050027 before deciding whether a balance-shaft sprocket, idle gear or another timing component is involved. Check VMI for any applicable coverage. Do not buy a balance shaft, idle gear, timing chain or kit from this page; component identity and VIN/engine-serial eligibility are unresolved.',
    symptoms: ['engine and serial number confirmed', 'cam/crank correlation data preserved', 'covered component diagnosed under the exact Mercedes procedure'], affectedSystems: ['engine timing drive', 'balance-shaft or idle-gear system'],
    conflict: 'The title, engine field, trims and 2005-2010 years exceed the exact 2005-2007 engine-serial-limited M272/M273 coverage.', evidence: ['Both rendered warranty pages limit coverage to qualifying 2005-2007 M272/M273 serial ranges.', 'The document distinguishes M272 balance-shaft sprockets from M273 idle gears and lists CLS550 among commercial nameplates.'], summary: 'Corrected the M272-versus-M273 component and scope boundaries and proposed the 2,500-owner total as zero.', sources: ['balanceShaftWarranty', 'datasets'],
  },
});

function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = PDF_SOURCES[key] || OTHER_SOURCES[key]; return { url: source.url, type: source.type, title: source.title }; }); }
function commerceDecisionFor(id) {
  return {
    [IDS.hybrid48v]: 'multiple 48V causes and VIN fitment are unresolved; no universal retail part',
    [IDS.brakes]: 'measured brake condition and package fitment are unresolved; no universal retail part',
    [IDS.mbux]: 'display path, symptom and software scope are unresolved; no universal retail part',
    [IDS.sunroof]: 'roof-noise source and fitment are unresolved; no universal retail part',
    [IDS.valveBody]: 'transmission diagnosis and VIN fitment are unresolved; no universal retail part',
    [IDS.airmatic]: 'leak source, failed component and AS-3226 fitment are unresolved; no universal retail part',
    [IDS.crankSensor]: 'sensor failure and engine/VIN fitment are unresolved; no universal retail part',
    [IDS.headlight]: 'lighting system, failed component and fitment are unresolved; no universal retail part',
    [IDS.balanceShaft]: 'component identity and engine-serial eligibility are unresolved; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  return { ...clone(before), description: content.description, solution: content.solution, confidence: 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'CLS-Class').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 9 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen CLS-Class coverage does not match the 9-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'CLS-Class',
    completionStatement: 'All 9 frozen CLS-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All nine identities materially exceed exact evidence or contain scope, mechanism or fitment conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 1,800-, 680-, 560-, 420- and 2,500-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'cls-class-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen CLS-Class identity exceeds exact primary evidence or contains a scope, mechanism or fitment conflict; all remain indexed pending review.' },
      { code: 'cls-class-48v-multiple-causes', severity: 'identity-conflict', recordIds: [IDS.hybrid48v], detail: 'LI54.10-P-069698 supports multiple cause-specific 48V conditions, not one universal ISG/DC-DC hardware failure.' },
      { code: 'cls-class-mbux-navigation-only', severity: 'identity-conflict', recordIds: [IDS.mbux], detail: 'Campaign 2022010008 supports 2021-2022 navigation unavailability, not the frozen 2019-2024 cluster/black-screen/camera bundle.' },
      { code: 'cls-class-balance-shaft-scope-conflict', severity: 'identity-conflict', recordIds: [IDS.balanceShaft], detail: 'Official coverage is engine-serial-limited 2005-2007 M272 balance-shaft sprockets or M273 idle gears; frozen identity extends through 2010 and conflates components.' },
      { code: 'cls-class-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Five positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-cls-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No CLS-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 5, total: 9 }, rows,
  };
}
if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
