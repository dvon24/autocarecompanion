/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lucid-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lucid-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lucid-gravity-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  doorHandles: 'lucid-gravity-electric-door-handles-fail-to-retract-present-latch-properly',
  hvac: 'lucid-gravity-hvac-auto-mode-buggy-screeching-passenger-vent-fan-blasts-se',
  airbag: 'lucid-gravity-incorrect-front-seat-backrest-covers-may-block-side-airbag-d',
  keyFob: 'lucid-gravity-key-fob-not-detected-key-not-detected-alerts-since-launch',
  navigation: 'lucid-gravity-navigation-routes-wrong-false-turns-missed-addresses-gps-sen',
  camera: 'lucid-gravity-rearview-camera-blank-screen-reverse',
  seatBelt: 'lucid-gravity-second-row-seat-belt-anchor-bracket-weld-failure',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['11023953', '11023970', '11025216', '11027486', '11030860', '11034927', '11034929']);
const CAMPAIGNS = Object.freeze(['25V855000', '26V018000', '26V192000']);

const PDF_SOURCES = Object.freeze({
  ota331: { title: 'Lucid Gravity OTA 3.3.1', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11023953-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-3.3.1.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 2079195, sha256: '605d5bc34cb0f00f8c54fc199f304b65dfaad50e29d777063d1a417d8d768050' },
  ota332: { title: 'Lucid Gravity OTA 3.3.2', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11023970-0001.pdf', localPath: 'C:/tmp/lucid-gravity-access-reliability.pdf', pages: 1, visualPages: [1], bytes: 71719, sha256: 'eb9058e83a6bf04b41bffffb23f184ff220d75f0fbcc0e0390203a1d81a2c2f3' },
  ota335: { title: 'Lucid Gravity OTA 3.3.5', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11025216-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-3.3.5.pdf', pages: 1, visualPages: [1], bytes: 224924, sha256: '830dd70c814c07d975a6add5b08a1f8fb515fd7c2f046a4d0a6197a369120dc1' },
  ota3320: { title: 'Lucid Gravity OTA 3.3.20', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11027486-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-3.3.20.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 366531, sha256: '294f56b9291734ac918a296554254e91f65ae57c695a98a7beecb2e78e190968' },
  ota351: { title: 'Lucid Gravity OTA 3.5.1', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11030860-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-3.5.1.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 1510849, sha256: 'ed6e8557860aa3fb6b4ccd7cfe8f5fb4f993e65042429d389c596c94a75ef34b' },
  ota360: { title: 'Lucid Gravity OTA 3.6.0', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034927-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-new-features.pdf', pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 1443266, sha256: '0693fd24e9e0dac5439c784a4413da55cb92bf19fd96ce5bd950ed87f36cbef7' },
  ota362: { title: 'Lucid Gravity OTA 3.6.2', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034929-0001.pdf', localPath: 'C:/tmp/lucid-gravity-ota-reliability.pdf', pages: 1, visualPages: [1], bytes: 168864, sha256: '941be2cda4ba754473b61ffdf95b874539a9cef399608ca475290f5abefe474c' },
  recall25V855: { title: 'NHTSA Part 573 Safety Recall Report 25V855', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V855-9165.pdf', localPath: 'C:/tmp/lucid-gravity-recall-25v855.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 464049, sha256: 'ddd738a56a5bbc93d03d5436b1133be25cf314e111f1f600f77f73d90b567ddf' },
  recall26V018: { title: 'NHTSA Part 573 Safety Recall Report 26V018', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V018-6626.pdf', localPath: 'C:/tmp/lucid-gravity-recall-26v018.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 397257, sha256: 'd8a832df77e70752d8985d76d1e7fcfa56c766d116c0abc258048ca941fc1307' },
  recall26V192: { title: 'NHTSA Part 573 Safety Recall Report 26V192', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V192-7208.pdf', localPath: 'C:/tmp/lucid-gravity-recall-26v192.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 393827, sha256: 'c56b3af2e78cf1d6bca664ee3f8c5a22685904e0acdd1fcae66427ccb652b241' },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2025: { title: 'NHTSA 2025 Lucid Gravity Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=GRAVITY&modelYear=2025' },
  complaints2026: { title: 'NHTSA 2026 Lucid Gravity Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=GRAVITY&modelYear=2026' },
  recalls2025: { title: 'NHTSA Current 2025 Lucid Gravity Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LUCID&model=GRAVITY&modelYear=2025' },
  recalls2026: { title: 'NHTSA Current 2026 Lucid Gravity Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LUCID&model=GRAVITY&modelYear=2026' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, model: 'GRAVITY', periodCounts: { '2020-2024': 0, '2025-2026': 22 }, totalRows: 22, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, model: 'GRAVITY', periodCounts: { post: 8 }, totalRows: 8, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.doorHandles]: [PDF_SOURCES.ota351, PDF_SOURCES.ota360, PDF_SOURCES.ota362],
    [IDS.hvac]: [PDF_SOURCES.ota3320, PDF_SOURCES.ota351, PDF_SOURCES.ota362],
    [IDS.airbag]: [PDF_SOURCES.recall25V855, OTHER_SOURCES.recalls2026],
    [IDS.keyFob]: [PDF_SOURCES.ota331, PDF_SOURCES.ota335, PDF_SOURCES.ota3320, PDF_SOURCES.ota362],
    [IDS.navigation]: [PDF_SOURCES.ota3320, PDF_SOURCES.ota351, PDF_SOURCES.ota360],
    [IDS.camera]: [PDF_SOURCES.recall26V018, OTHER_SOURCES.recalls2025],
    [IDS.seatBelt]: [PDF_SOURCES.recall26V192, OTHER_SOURCES.recalls2025],
  };
  if (!map[id]) throw new Error(`Unexpected Lucid Gravity row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.doorHandles]: {
      confidence: 'medium',
      description: 'Lucid OTA 3.5.1 documents changes to prevent unintended repeated exterior-handle movements and improve door-opening response from inside and outside. OTA 3.6.0 makes approach detection present the handles earlier, and OTA 3.6.2 further improves door-control response. These manufacturer notices support software-related handle behavior, but they do not establish a recurring latch or actuator hardware defect, a warranty replacement rule, or the claim that Lucid abandoned this design because it is unreliable.',
      solution: 'Install the latest Lucid Gravity software and confirm the vehicle and key fob are current. If a handle still will not present, retract, open or allow a door to latch securely, stop relying on repeated handle commands and contact Lucid service for access-control, latch, wiring and actuator diagnosis. Do not buy a handle actuator or latch from this page; the manufacturer documents software corrections, and the failed component must be identified first.',
      symptoms: ['exterior handle repeats an unintended movement', 'door-opening response is delayed', 'handle presentation, retraction or latching concern requires diagnosis'],
      summary: 'Kept the indexed handle identity but removed unsupported hardware, warranty and future-product inferences; anchored the page to Lucid OTA 3.5.1, 3.6.0 and 3.6.2.',
    },
    [IDS.hvac]: {
      confidence: 'medium',
      description: 'Lucid OTA 3.3.20 reduced climate-system noise and excessive fan speed at startup and aligned HVAC fan speed with the infotainment command. OTA 3.5.1 improved windshield airflow distribution and active-grille-shutter startup reliability. OTA 3.6.2 improved rear-cabin climate activation and made its power state persist across drives. Those releases support software-related climate behavior, but they do not establish the published passenger-vent blower or actuator failure, the claimed temperature comparison, or a universal hardware remedy.',
      solution: 'Install current Gravity software, then record the affected zone, set temperature, fan mode, startup state, weather and any noise. If windshield clearing is inadequate, visibility is affected, or a screech persists, use extra caution and arrange Lucid service to diagnose software, airflow doors, blower hardware, sensors and thermal systems. Do not buy a blower motor, vent actuator or grille-shutter part from this page; the exact source of the symptom must be confirmed.',
      symptoms: ['excessive or unexpected HVAC fan speed', 'climate setting or rear-zone state does not behave as expected', 'airflow, windshield clearing or vent noise requires diagnosis'],
      summary: 'Replaced secondary-source and speculative blower claims with exact Lucid climate corrections and a diagnosis-first boundary.',
    },
    [IDS.airbag]: {
      confidence: 'high',
      description: 'Lucid recall SR-25-05-0/NHTSA 25V855 covers 66 model-year 2026 Gravity vehicles produced with suspect front-seat backrest covers. A supplier mislabeled some left and right covers, allowing an incorrect cover to be assembled on a seat; that cover can prevent the front-seat side airbag from deploying correctly and increase injury risk. The Part 573 filing estimated 39.4% of the recall population had the defect and states there is no warning.',
      solution: 'Check the VIN for open recall SR-25-05-0/25V855 and arrange Lucid service if it is open. Lucid inspects the front seats and replaces any incorrect backrest cover free of charge. Do not buy a cover, seat or airbag component from this page; this is a VIN-scoped safety recall with manufacturer inspection and replacement.',
      symptoms: ['no advance warning; VIN-based recall', 'incorrect front-seat backrest cover may interfere with side-airbag deployment'],
      summary: 'Corrected the notification and remedy language while preserving the exact 2026 recall identity and no-warning safety boundary.',
    },
    [IDS.keyFob]: {
      confidence: 'high',
      description: 'Lucid release notes document a sequence of Gravity access corrections. OTA 3.3.1 improved key-fob connection and required a brief in-person Lucid service step. OTA 3.3.5 reduced false "Key Not Detected" alerts and offered a separate fob software update through Lucid service. OTA 3.3.20 enhanced vehicle-side detection. OTA 3.6.2 added more reliable recovery and identifies key-fob firmware 2.35.13 as an update delivered through the Lucid mobile app. This record does not establish the published delivery-date range, complaint persistence rate or forecasted Mobile Key launch date.',
      solution: 'Install current vehicle software and use the Lucid mobile app to update the key fob to the current manufacturer-specified firmware when offered. OTA 3.6.2 says an unresponsive fob can be reset by holding its lock button for five seconds. Keep the key card available, and contact Lucid service if recognition, unlocking or drive authorization remains unreliable; earlier fob updates required service. Do not buy a replacement fob from this page until firmware, battery, pairing and vehicle-side detection are diagnosed.',
      symptoms: ['false "Key Not Detected" alert', 'key fob is intermittently unresponsive', 'unlocking or drive authorization fails'],
      summary: 'Corrected the chronology and separated vehicle OTA, service-installed fob software and the later mobile-app firmware tool.',
    },
    [IDS.navigation]: {
      confidence: 'medium',
      description: 'Lucid OTA 3.3.20 documents navigation-engine reliability changes, route-line display corrections, widget flicker fixes and stabilization of vehicle location during rare stationary map drift. OTA 3.5.1 improved guidance synchronization, trip dismissal and route-deviation handling. OTA 3.6.0 moved place search to the Google Maps Places API. These manufacturer records support specific navigation corrections, but the current NHTSA complaint API contains no 2025 or 2026 Gravity complaints and does not establish the broader owner-frequency claims formerly attached to this page.',
      solution: 'Install the latest Gravity software, verify network connectivity and re-enter the destination. If routing or vehicle position remains wrong, record the software version, destination, route and location and send the reproducible case to Lucid Customer Care. CarPlay and Android Auto became available in OTA 3.5.1 and can provide an alternate map interface when safely configured. Do not buy a GPS antenna, display or infotainment module from this page; software, map data, connectivity and positioning must be isolated first.',
      symptoms: ['route line disappears or stops updating', 'guidance is out of sync across displays', 'route deviation or vehicle position is handled incorrectly'],
      summary: 'Removed the editorial placeholder and unsupported forum metrics; rebuilt the page from Lucid navigation release notes and zero current NHTSA complaint results.',
    },
    [IDS.camera]: {
      confidence: 'high',
      description: 'Lucid recall SR-26-02-0/NHTSA 26V018 covers 3,900 model-year 2025-2026 Gravity vehicles running software earlier than 3.3.20. Intermittent delivery of power-state or view signals and lower-level camera-pipeline error handling can leave the rearview image blank or show a warning in Reverse, creating an FMVSS 111 noncompliance and increasing crash risk. At the filing, Lucid reported 3,462 vehicles already updated and 438 still below the remedy version.',
      solution: 'Install Lucid software 3.3.20 or later; the recall OTA is free. If the rearview image is blank or "Camera Unavailable" appears, use extra caution, conduct a walkaround, use mirrors and look over your shoulder before and while reversing, then contact Lucid if the issue persists or the update cannot be installed. Do not buy a camera or display from this page; the recall remedy is software.',
      symptoms: ['rearview image is blank after shifting to Reverse', 'blank screen or "Camera Unavailable" warning in Reverse'],
      summary: 'Replaced secondary recall coverage with the exact 26V018 defect, driver caution, filing counts and OTA 3.3.20 remedy.',
    },
    [IDS.seatBelt]: {
      confidence: 'high',
      description: 'Lucid recall SR-26-04-00/NHTSA 26V192 covers 4,476 model-year 2025-2026 Gravity vehicles. The outboard second-row lap-belt anchor bracket weld can be too short or misplaced after an unapproved supplier process change, so the bracket may not meet FMVSS 207 and 210 and can increase injury risk in a crash. The Part 573 filing estimated 97% of the recall population had the defect and states there is no advance warning.',
      solution: 'Check the VIN for open recall SR-26-04-00/26V192 and arrange Lucid service if it is open. Lucid inspects the second-row seat: a repairable nonconforming weld receives a bracket and adhesive, while a seat that cannot be repaired with the bracket is replaced. Inspection, repair or replacement is free. Do not buy a seat frame, bracket or belt part from this page; this is a VIN-scoped manufacturer recall.',
      symptoms: ['no advance warning; VIN-based recall', 'second-row lap-belt anchor bracket may not hold as required in a crash'],
      summary: 'Replaced the stale editorial note with the exact 26V192 defect, no-warning risk and inspect/repair/replace remedy.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Lucid Gravity row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.doorHandles]: ['OTA 3.5.1 directly documents repeated-handle-movement and response-time corrections.', 'OTA 3.6.0 and 3.6.2 document later presentation and door-control changes without proving an actuator population.'],
    [IDS.hvac]: ['OTA 3.3.20, 3.5.1 and 3.6.2 document bounded fan, airflow and rear-climate corrections.', 'No reviewed primary source establishes the published passenger-vent blower or actuator diagnosis.'],
    [IDS.airbag]: ['25V855 directly establishes 66 affected 2026 vehicles, incorrect covers, side-airbag risk and inspect/replace remedy.', 'All five Part 573 pages were rendered and visually inspected; the current API supplies the updated mailing date.'],
    [IDS.keyFob]: ['Lucid documents vehicle, fob and access-control changes across 3.3.1, 3.3.5, 3.3.20 and 3.6.2.', 'The documents distinguish service-installed fob software from the later mobile-app firmware update.'],
    [IDS.navigation]: ['Lucid documents map drift, route display, guidance synchronization, deviation handling and place-search changes.', 'The current NHTSA complaint API returns zero 2025 and zero 2026 Gravity complaints.'],
    [IDS.camera]: ['26V018 directly establishes the software versions, 3,900 population, filing-time update counts, driver caution and OTA remedy.', 'All four Part 573 pages were rendered and visually inspected.'],
    [IDS.seatBelt]: ['26V192 directly establishes the weld defect, 4,476 population, 97% estimate and inspect/repair/replace remedy.', 'All four Part 573 pages were rendered and visually inspected.'],
  };
  return { primaryEvidence: notes[id], limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.' };
}
function commerceDecisionFor(id) {
  const map = {
    [IDS.doorHandles]: 'No universal retail part; software, access control, latch, wiring and actuator diagnosis must precede replacement.',
    [IDS.hvac]: 'No universal retail part; software, airflow doors, blower, sensors and thermal systems require diagnosis.',
    [IDS.airbag]: 'VIN-scoped dealer recall; Lucid inspection and replacement, not retail commerce.',
    [IDS.keyFob]: 'No universal retail part; firmware, battery, pairing and vehicle-side detection require diagnosis before replacement.',
    [IDS.navigation]: 'No universal retail part; software, maps, connectivity and positioning require diagnosis.',
    [IDS.camera]: 'VIN-scoped software recall; the remedy is OTA 3.3.20 or later, not a retail camera.',
    [IDS.seatBelt]: 'VIN-scoped dealer recall; Lucid inspection determines bracket repair or seat replacement.',
  };
  return map[id];
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [],
    humanApproved: false, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const rest = clone(source);
    delete rest.localPath;
    return [key, rest];
  }));
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lucid' && row.model === 'Gravity').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 7) throw new Error(`Expected 7 Lucid Gravity rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Lucid', model: 'Gravity',
    completionStatement: 'All 7 frozen Lucid Gravity pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 7 rows contain material source, safety, chronology or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 7 pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Recall remedies are campaign- and VIN-scoped; manufacturer release notes are not converted into owner-frequency or hardware-failure rates.',
      'Every named replaceable part is covered by an explicit dealer-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_lucid-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'lucid-gravity-key-chronology-corrected', severity: 'accuracy-correction', recordIds: [IDS.keyFob], detail: 'The later 3.6.2 app-delivered fob firmware must not be backdated to the earlier service-installed fob updates.' },
      { code: 'lucid-gravity-camera-recall-corrected', severity: 'safety-correction', recordIds: [IDS.camera], detail: '26V018 is a pre-3.3.20 rearview-software recall with explicit walkaround and reverse-caution guidance.' },
      { code: 'lucid-gravity-seat-remedies-corrected', severity: 'safety-correction', recordIds: [IDS.airbag, IDS.seatBelt], detail: 'Both seat-related pages now state their exact VIN-scoped inspect, repair or replacement remedies.' },
      { code: 'all-lucid-gravity-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Lucid Gravity page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
