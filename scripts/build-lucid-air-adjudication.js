/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lucid-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lucid-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lucid-air-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const LUCID_CHARGING_URL = 'https://lucidmotors.com/knowledge/vehicles/air/lucid-air-in-depth/charging-your-lucid-air';
const IDS = Object.freeze({
  battery: 'lucid-air-12v-drain',
  chargeLed: 'lucid-air-charging-led-indicator',
  heatPump: 'lucid-air-heat-pump-fault',
  hvch: 'lucid-air-hv-harness-recall',
  infotainment: 'lucid-air-infotainment-freezes',
  paint: 'lucid-air-paint-quality-early-production',
  roof: 'lucid-air-panoramic-roof',
  rearMount: 'lucid-air-rear-motor-mount',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10206428', '10206430', '10239070']);
const CAMPAIGNS = Object.freeze(['22V090000','22V351000','22V727000','23V110000','23V520000','23V521000','23V523000','23V708000','24V011000','24V076000','24V495000','24V497000','24V836000','25V669000','25V670000','26V017000','26V193000','26V309000']);

const PDF_SOURCES = Object.freeze({
  hvchRecall: {
    title: 'Lucid SR-24-04-0 / NHTSA 24V495 Owner Recall Notice', type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCONL-24V495-6419.pdf', localPath: 'C:/tmp/lucid-air-hvch-recall.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 308030, sha256: '6e64147296bfbd82c3fd095ef6a93e0d178560215aaa2c72fccd7cfae831d9ad',
  },
  infotainmentOta: {
    title: 'Lucid Air OTA 2.1.2 Infotainment System Enhancements', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239070-0001.pdf', localPath: 'C:/tmp/lucid-air-infotainment-ota.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 878808, sha256: 'f22843ed6a35ba1bce6c5408b3962f9cf96c0e97194e24de1d875622a6bf9c5e',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  lucidCharging: { title: 'Lucid: Charging Your Lucid Air', type: 'manufacturer', url: LUCID_CHARGING_URL },
  complaints2022: { title: 'NHTSA 2022 Lucid Air Complaints (ODI 11484559)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=AIR&modelYear=2022', odiNumber: '11484559' },
  complaints2023Heat: { title: 'NHTSA 2023 Lucid Air Complaints (ODI 11560244)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=AIR&modelYear=2023', odiNumber: '11560244' },
  complaints2024Wake: { title: 'NHTSA 2024 Lucid Air Complaints (ODI 11672457)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=AIR&modelYear=2024', odiNumber: '11672457' },
  complaints2024Screen: { title: 'NHTSA 2024 Lucid Air Complaints (ODI 11627594)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LUCID&model=AIR&modelYear=2024', odiNumber: '11627594' },
  recalls2022: { title: 'NHTSA Current 2022 Lucid Air Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LUCID&model=AIR&modelYear=2022' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, model: 'AIR', periodCounts: { '2020-2024': 67, '2025-2026': 19 }, totalRows: 86, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, model: 'AIR', periodCounts: { post: 82 }, totalRows: 82, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.battery]: [OTHER_SOURCES.lucidCharging, OTHER_SOURCES.complaints2024Wake, OTHER_SOURCES.complaints2022, OTHER_SOURCES.datasets],
    [IDS.chargeLed]: [OTHER_SOURCES.lucidCharging, OTHER_SOURCES.datasets],
    [IDS.heatPump]: [PDF_SOURCES.hvchRecall, OTHER_SOURCES.complaints2023Heat, OTHER_SOURCES.recalls2022],
    [IDS.hvch]: [PDF_SOURCES.hvchRecall, OTHER_SOURCES.recalls2022],
    [IDS.infotainment]: [PDF_SOURCES.infotainmentOta, OTHER_SOURCES.complaints2024Screen, OTHER_SOURCES.datasets],
    [IDS.paint]: [OTHER_SOURCES.datasets],
    [IDS.roof]: [OTHER_SOURCES.datasets],
    [IDS.rearMount]: [OTHER_SOURCES.datasets],
  };
  if (!map[id]) throw new Error(`Unexpected Lucid Air row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.battery]: {
      confidence: 'low',
      description: 'Lucid currently recommends leaving an Air plugged into AC power during extended inactivity so secondary systems can draw external energy. NHTSA complaint ODI 11672457 alleges that one 2024 Air sometimes took about 30 seconds to unlock or wake, while ODI 11484559 speculates that a separate 2022 drive-system failure might involve the main or 12V battery. Lucid communication 10206428 documents 12V harness clearance near the steering shaft on some 2022 vehicles, not parasitic battery drain. These sources do not establish a recurring auxiliary-battery defect caused by Surveillance Mode, remote access, or a particular parking duration.',
      solution: 'For extended parking, follow Lucid’s current guidance to leave the vehicle plugged in with an appropriate charge limit and monitor its state in the app. If the vehicle is slow to wake, will not unlock, or shows a low-voltage warning, contact Lucid service or roadside assistance and have the low-voltage battery, DC-DC support, charging state, software and wiring diagnosed. Do not buy an AGM battery or connect a generic maintainer from this page; the battery specification, cause and approved service procedure must be confirmed first.',
      symptoms: ['slow or failed vehicle wake-up', 'unlock or access delay requiring diagnosis', 'low-voltage or electrical warning'],
      summary: 'Removed the unsupported Surveillance Mode, parasitic-drain, storage-duration, maintainer, warranty and cost claims; retained only Lucid parking guidance and bounded complaints.',
    },
    [IDS.chargeLed]: {
      confidence: 'low',
      description: 'Lucid documents the Air charge-port light states: solid white is ready, pulsing white is pending, pulsing green is charging, solid green is complete, and solid red indicates a charging error. Lucid also directs owners to compare the light with the Glass Cockpit or app and troubleshoot the connection or station. The 86 NHTSA manufacturer communications reviewed for the Air do not establish a recurring LED-ring hardware failure, an assembly-module defect, or a standard replacement-cost pattern.',
      solution: 'Compare the charge-port light with the charging screen and Lucid mobile app. For a red or unexpected indication, follow Lucid’s current guidance: stop the session safely, unplug, wait for the station to reset, reconnect fully, check for connector or port debris or damage, and try another station if it reports an error. Contact Lucid Customer Care if the indication remains wrong or charging status is unclear. Do not buy a charge-port, LED ring or control module from this page; charging operation and the failed component must be diagnosed first.',
      symptoms: ['charge-port light disagrees with the charging screen or app', 'unexpected solid red charging-error light', 'charge-status indication is absent or unclear'],
      summary: 'Replaced the unsupported recurring LED-module failure and cost claims with Lucid’s exact indicator meanings and diagnosis boundary.',
    },
    [IDS.heatPump]: {
      confidence: 'low',
      description: 'NHTSA complaint ODI 11560244 alleges that the heater became inoperative on one 2023 Air at 316 miles. Separately, recall SR-24-04-0/NHTSA 24V495 covers certain 2022-2024 Air vehicles whose high-voltage coolant heater can fail and leave windshield defrost unavailable. That HVCH recall does not itself establish a heat-pump compressor defect, refrigerant leak, generic cold-weather fault-code pattern, longer charge-port preconditioning, or hardware failures across every indexed trim and year.',
      solution: 'If heat or windshield defrost is unavailable, check the VIN for open recall SR-24-04-0/24V495 and confirm the vehicle has current Lucid software. A “Defrost Unavailable” warning or inability to clear the windshield requires prompt Lucid service; use extra caution in weather that requires defrost. Other cabin-heating or preconditioning concerns need software, HVCH, heat-pump, refrigerant and thermal-management diagnosis. Do not buy a compressor, coolant heater or refrigerant part from this page; recall eligibility and the failed subsystem must be confirmed first.',
      symptoms: ['cabin heat is reduced or unavailable', '“Defrost Unavailable” warning', 'windshield will not clear', 'preconditioning or thermal-management concern requiring diagnosis'],
      summary: 'Separated the exact HVCH defrost recall from unsupported heat-pump, refrigerant, fault-code and cold-range claims.',
    },
    [IDS.hvch]: {
      confidence: 'high',
      description: 'Lucid recall SR-24-04-0/NHTSA 24V495 covers certain 2022-2024 Air vehicles built with affected high-voltage coolant heaters. An internal HVCH failure can make windshield defrost unavailable, restrict the driver’s view and increase crash risk. The remedy is software version 2.1.52 or later to warn the driver when defrost is unavailable, with replacement of a failed HVCH at no cost. The recall source does not describe a wiring-harness defect or link this HVCH condition to sudden loss of drive.',
      solution: 'Check the VIN for SR-24-04-0/24V495 and install current Lucid software. If “Defrost Unavailable” appears or the windshield will not clear, use extra caution in conditions requiring defrost and contact Lucid service. Lucid replaces a failed HVCH under the recall; the software update and recall repair are free. Do not buy a Webasto heater, wiring harness or coolant component from this page; this is a VIN-scoped dealer recall with a software-first, test-directed remedy.',
      symptoms: ['“Defrost Unavailable” warning', 'loss of windshield defrost capability', 'cabin heat unavailable because the HVCH failed'],
      summary: 'Corrected SR-24-04-0 to its exact defrost-only defect and software/test-directed remedy; removed false harness and loss-of-drive claims.',
    },
    [IDS.infotainment]: {
      confidence: 'medium',
      description: 'Lucid’s OTA 2.1.2 communication for 2022-2023 Air vehicles introduced infotainment enhancements and an in-system reset procedure. NHTSA complaint ODI 11627594 alleges repeated black screens and calls dropping after software 2.5.0 on one 2024 vehicle. These sources support software and display troubleshooting, but they do not establish a frequent early-production compute-stack defect, universal CarPlay or Pilot Panel failure, or a replacement-only remedy across every indexed year.',
      solution: 'Record the software version, affected display and unavailable functions, and follow the reset method in the current Lucid owner guidance for that software version. OTA 2.1.2 specifically described holding the Air logo in Settings for at least 10 seconds; do not assume the older method applies unchanged to later releases. If a display stays black, critical driving information or camera views are unavailable, or resets repeat, arrange Lucid service. Do not buy a display, Pilot Panel or compute module from this page; software state and the failed component must be diagnosed first.',
      symptoms: ['display freezes, goes black or becomes unavailable', 'infotainment or audio connection drops', 'Pilot Panel or camera view is unresponsive'],
      summary: 'Replaced the unsupported steering-wheel reset and compute-stack replacement prescription with version-specific Lucid guidance and bounded complaint evidence.',
    },
    [IDS.paint]: {
      confidence: 'low',
      description: 'The complete NHTSA manufacturer-communication inventory reviewed for the Lucid Air contains no exact communication establishing an orange-peel, dust-inclusion or panel color-match defect population. It also does not substantiate the published Casa Grande ramp-up cause, improvement across 2023, or a pattern of manufacturer-funded repaint remedies. The indexed page is preserved while those population and remedy claims remain unverified.',
      solution: 'Photograph any paint concern in consistent lighting before polishing, coating or repair, record the affected panels and delivery condition, and ask Lucid service or a qualified paint professional to inspect paint thickness, finish contamination, color match and prior repair evidence. Coverage and repair method depend on inspection and the applicable warranty. Do not buy polishing compounds, touch-up paint, PPF or refinishing materials from this page; the finish condition and remedy must be confirmed first.',
      symptoms: ['visible orange-peel texture requiring inspection', 'surface inclusion or finish contamination', 'panel-to-panel color mismatch'],
      summary: 'Removed unsupported production-cause, frequency, 2023-improvement, repaint and PPF claims while preserving the indexed paint-quality identity.',
    },
    [IDS.roof]: {
      confidence: 'low',
      description: 'The complete NHTSA manufacturer-communication inventory reviewed for the Lucid Air contains no exact communication establishing a recurring panoramic-roof seal defect, single-piece-glass tolerance problem, early-production pattern or cross-year water-ingress population. The indexed page is preserved, but the prior defect mechanism, warranty promise and fixed reseal-cost estimate are not supported by the primary-source inventory.',
      solution: 'Document when and where wind noise or moisture appears, including vehicle speed, weather, wash conditions and the exact roof or glass area. Have Lucid service inspect glass alignment, seals, drains, adjacent trim and other water paths before choosing a repair; protect the interior from active water entry and address electrical wetness promptly. Do not buy seals, adhesive or a glass assembly from this page; the leak or noise path and service procedure must be confirmed first.',
      symptoms: ['wind noise near panoramic glass requiring source isolation', 'moisture or water entry near the roof', 'roof, glass or seal concern requiring inspection'],
      summary: 'Removed unsupported roof-tolerance, production-pattern, warranty and reseal-cost claims; retained diagnosis-first owner guidance.',
    },
    [IDS.rearMount]: {
      confidence: 'low',
      description: 'Lucid communication 10206430 documents a clacking or ticking noise from the front drive-unit area on some 2022 Air vehicles caused by a hose clip touching the FDU boot; its correction involves the clip and no parts. It does not support the published rear drive-unit mount or subframe-bushing tolerance theory. No exact Air communication in the reviewed inventory establishes a recurring rear-mount defect, a regen-related mechanism, the stated powertrain-warranty coverage or a standard replacement-cost estimate.',
      solution: 'Record the noise with vehicle speed, acceleration, lift-off, regeneration setting, road surface and location, then have Lucid service reproduce it and inspect the relevant drive unit, half-shafts, mounts, subframe, suspension, fasteners and nearby hoses or clips. Do not buy a drive-unit mount, bushing or subframe part from this page; the published rear-mount theory is unverified and the exact noise source must be identified first.',
      symptoms: ['clack, tick, clunk or thud requiring source isolation', 'noise during acceleration, lift-off or regenerative deceleration', 'driveline, suspension or nearby-component contact concern'],
      summary: 'Corrected the false rear-mount bulletin implication and removed the unverified mechanism, warranty and replacement-cost claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Lucid Air row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.battery]: ['Lucid parking guidance supports plugging in during extended inactivity, not a specific auxiliary-battery defect.', 'ODI 11672457 is one delayed-wake allegation; ODI 11484559 only speculates about a battery cause.'],
    [IDS.chargeLed]: ['Lucid defines exact light meanings and troubleshooting steps.', 'No reviewed Lucid communication establishes a recurring LED-ring or charge-port assembly defect.'],
    [IDS.heatPump]: ['ODI 11560244 is one heating allegation.', '24V495 concerns HVCH defrost loss and cannot be generalized to all heat-pump or refrigerant faults.'],
    [IDS.hvch]: ['SR-24-04-0/24V495 directly establishes affected years, defrost risk, warning software and replacement of a failed HVCH.', 'All four English/Spanish recall-notice pages were rendered and visually inspected.'],
    [IDS.infotainment]: ['OTA 2.1.2 directly documents infotainment changes and its then-current reset method.', 'ODI 11627594 is a single complaint and does not prove universal compute hardware failure.'],
    [IDS.paint]: ['No exact paint-quality communication exists in the 86-row Air manufacturer inventory.', 'Plant cause, year-over-year improvement and repaint practice remain unsupported.'],
    [IDS.roof]: ['No exact panoramic-roof seal communication exists in the 86-row Air manufacturer inventory.', 'Noise and moisture require vehicle-specific path isolation.'],
    [IDS.rearMount]: ['Communication 10206430 is front-drive-unit hose-clip contact, not a rear mount or bushing bulletin.', 'No exact rear-mount defect communication was found in the complete Air inventory.'],
  };
  return { primaryEvidence: notes[id], limitations: 'No population frequency, retail fitment, warranty eligibility, current repair or component identity is inferred beyond the cited primary source.' };
}
function commerceDecisionFor(id) {
  const map = {
    [IDS.battery]: 'No universal retail part; low-voltage battery specification, DC-DC support and electrical cause require Lucid diagnosis.',
    [IDS.chargeLed]: 'No universal retail part; the port light, station, connector, charging state and control module require diagnosis.',
    [IDS.heatPump]: 'VIN-scoped recall or technician diagnosis; HVCH, heat-pump, refrigerant and software causes must not be collapsed.',
    [IDS.hvch]: 'VIN-scoped dealer recall; failed HVCH replacement follows Lucid testing and is not retail commerce.',
    [IDS.infotainment]: 'No universal retail part; software version, display and compute fault require Lucid diagnosis.',
    [IDS.paint]: 'No universal retail product; diagnosis and finish inspection must precede polishing, coating or refinishing.',
    [IDS.roof]: 'No universal retail part; glass, seal, drain, trim and water-path diagnosis is required.',
    [IDS.rearMount]: 'No universal retail part; the rear-mount theory is unverified and the exact noise source requires diagnosis.',
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
  const rows = snapshot.records.filter((row) => row.make === 'Lucid' && row.model === 'Air').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 8) throw new Error(`Expected 8 Lucid Air rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Lucid', model: 'Air',
    completionStatement: 'All 8 frozen Lucid Air pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 8 rows contain material source, safety, scope or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 8 pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Broader or narrower frozen filters remain unchanged for SEO and fitment continuity; copy states exact source boundaries without silently remapping an indexed page.',
      'Recall remedies are campaign- and VIN-scoped; complaints remain allegations and are never converted into population rates.',
      'Every named replaceable part is covered by an explicit dealer-only, technician-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_lucid-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'lucid-hvch-recall-corrected', severity: 'safety-correction', recordIds: [IDS.heatPump, IDS.hvch], detail: '24V495 is an HVCH defrost-availability recall; it does not establish a wiring-harness defect, sudden loss of drive or every heat-pump/refrigerant claim.' },
      { code: 'lucid-body-populations-unsupported', severity: 'accuracy-correction', recordIds: [IDS.paint, IDS.roof], detail: 'The full Air communication inventory does not establish the published paint or panoramic-roof defect populations and mechanisms.' },
      { code: 'lucid-rear-mount-bulletin-unsupported', severity: 'accuracy-correction', recordIds: [IDS.rearMount], detail: 'The only exact 2022 drive-unit noise communication found is front hose-clip contact, not a rear mount or subframe bushing defect.' },
      { code: 'all-lucid-air-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Lucid Air page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
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
