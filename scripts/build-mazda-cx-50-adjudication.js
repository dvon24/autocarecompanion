/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-50-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CX-50', 'CX50', 'CX-50 HYBRID']);

const IDS = Object.freeze({
  abs: 'mazda-cx-50-abs-hydraulic-control-unit-internal-damage-reduces-braking-r',
  hitch: 'mazda-cx-50-accessory-trailer-hitch-bolts-under-torqued-hitch-can-detach',
  cylinder: 'mazda-cx-50-cylinder-deactivation-solenoid-failure-metal-shavings-oil',
  camera: 'mazda-cx-50-forward-sensing-camera-mode-setting-error-i-activsense-malfu',
  hybrid: 'mazda-cx-50-hybrid-system-failure-warning-no-start-powertrain-gateway-un',
  windshield: 'mazda-cx-50-windshield-cracking-radiating-from-driver-side-pillar-little',
  infotainment: 'mazda-cx50-infotainment-lag-2023',
  transmission: 'mazda-cx50-transmission-hesitation-2023',
  wastegate: 'mazda-cx50-turbo-wastegate-rattle-2023',
  wind: 'mazda-cx50-wind-noise-roof-rails-2023',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10230905', '10237198', '10252510', '11012338', '11019098', '11026098', '11030702']);
const CAMPAIGNS = Object.freeze(['23V135000', '23V275000', '24V649000', '25V167000', '25V413000', '25V418000', '25V737000']);

const PDF_SOURCES = Object.freeze({
  absRecall: { title: 'NHTSA Part 573 Report 23V-275 - ABS HCU', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V275-7889.PDF', localPath: 'C:/tmp/mazda-cx50-sources/RCLRPT-23V275-7889.PDF', pages: 3, visualPages: [1, 2, 3], bytes: 215966, sha256: '152a014d628acdf03e478da1c1eb75e7f51174f1e5683fa8f2948723e77e01f1' },
  hitchRecall: { title: 'Mazda Recall 7225C Parts and Warranty Information', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RMISC-25V167-6896.pdf', localPath: 'C:/tmp/mazda-cx50-sources/RMISC-25V167-6896.pdf', pages: 2, visualPages: [1, 2], bytes: 79083, sha256: '9d7505b04079d1f48c1a3f05fda3b7fa830ee651400c8f7a7cf8196582ef0bff' },
  cameraRecall: { title: 'NHTSA Part 573 Report 24V-649 - Forward Sensing Camera', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V649-7005.PDF', localPath: 'C:/tmp/mazda-cx50-sources/RCLRPT-24V649-7005.PDF', pages: 4, visualPages: [1, 2, 3, 4], bytes: 220610, sha256: 'f29d6fa1d0bf59db8244aa5e7cd2514e724b89052f4e8480b1302d3e8b4b6449' },
  hybridTsb: { title: 'Mazda TSB 30-001/25 - Hybrid System Failure', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019098-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-11019098-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 153117, sha256: 'a14ece04984854c693983ab071165a2d608dd1d729db4068e9bd098ebd7bde6b' },
  hybridSspe0: { title: 'Mazda SSPE0 - 2025 CX-50 Hybrid PT-GWU Reprogram', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11030702-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-11030702-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 88394, sha256: '0d1a525c3d5aaa1a3cca0c2ee2619a494268a61ce045054c748d8ef00e2affcc' },
  infotainment: { title: 'Mazda TSB 16-001/23 - CX-50 Mazda Connect Software', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230905-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-10230905-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 159866, sha256: 'b66184d8f478ec36335a70b2b1b4e6e671e5c6d9ebfd8e43e1bd448fafb7da8d' },
  transmission: { title: 'Mazda TSB 05-001/23 - CX-50 Shock at Low Speeds', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237198-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-10237198-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 120490, sha256: '864104895be0b4149d1398efbb8ed31f4c5738b8c91d63d8326a2b1da3f637ef' },
  wastegate: { title: 'Mazda TSB 01-013/24 - Turbo Wastegate Pivot Rattle', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012338-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-11012338-0001.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 231273, sha256: '95dad91d6210fe44b451a54da54e2fba46a9799e068501946d5cdf4fc971055a' },
  crossbars: { title: 'Mazda ONP09 - CX-50 Roof Rack Crossbar Aero-Infill', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252510-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-10252510-0001.pdf', pages: 9, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9], bytes: 1016009, sha256: 'cd28ba7f28fea7020afbba92f9ab2d3fb7bd5a8fd41bbbb956f660fa1d1d785a' },
  windshieldDistortion: { title: 'Mazda TSB 09-041/25 - Distorted Windshield', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11026098-0001.pdf', localPath: 'C:/tmp/mazda-cx50-sources/MC-11026098-0001.pdf', pages: 2, visualPages: [1, 2], bytes: 151052, sha256: '0fb8a831400849519de163877b2321859b8bfeb2ec24aee6fc19cf2720369d54' },
});

function complaints(year) { return { title: `NHTSA ${year} Mazda CX-50 Complaints`, type: 'nhtsa', url: `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-50&modelYear=${year}` }; }
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2023: complaints(2023), complaints2024: complaints(2024), complaints2025: complaints(2025),
  hitchStatement: { title: 'Mazda USA Statement on Safety Recall 7225C', type: 'manufacturer', url: 'https://news.mazdausa.com/2025-03-24-STATEMENT-ON-SAFETY-RECALL-7225C' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 294, '2025-2026': 203 },
  totalRows: 497, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 35 }, totalRows: 35,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.abs]: [PDF_SOURCES.absRecall],
    [IDS.hitch]: [PDF_SOURCES.hitchRecall, OTHER_SOURCES.hitchStatement],
    [IDS.cylinder]: [OTHER_SOURCES.complaints2025],
    [IDS.camera]: [PDF_SOURCES.cameraRecall],
    [IDS.hybrid]: [PDF_SOURCES.hybridTsb, PDF_SOURCES.hybridSspe0],
    [IDS.infotainment]: [PDF_SOURCES.infotainment],
    [IDS.transmission]: [PDF_SOURCES.transmission, OTHER_SOURCES.complaints2023, OTHER_SOURCES.complaints2025],
    [IDS.wastegate]: [PDF_SOURCES.wastegate],
    [IDS.wind]: [PDF_SOURCES.crossbars],
    [IDS.windshield]: [OTHER_SOURCES.complaints2024, OTHER_SOURCES.complaints2025, PDF_SOURCES.windshieldDistortion],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-50 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.abs]: { confidence: 'high', description: 'NHTSA recall 23V-275 covers nine 2023 CX-50 vehicles built December 3-7, 2022, inside a 2,410-vehicle CX-30/CX-50 population. Internal ABS hydraulic-control-unit damage can increase brake-pedal travel and reduce braking ability.', solution: 'Check the VIN for open Mazda campaign 5823D. An authorized Mazda dealer will inspect the ABS hydraulic control unit and replace it as necessary at no charge. Increased pedal travel or reduced braking needs prompt service. Do not buy an HCU from this page; VIN eligibility and the required recall remedy must be verified first.', symptoms: ['increased brake-pedal travel', 'reduced braking ability or longer stopping response'], summary: 'Bounded the ABS defect and remedy to the signed 23V-275 population without parts-first advice.' },
    [IDS.hitch]: { confidence: 'high', description: 'Mazda recall 7225C / NHTSA 25V-167 covers approximately 63 2024-2025 CX-50 vehicles with a Mazda Genuine Accessory trailer hitch whose assembly bolts were not tightened sufficiently. The hitch can loosen or detach during towing or normal driving.', solution: 'Do not tow until the VIN is checked for campaign 7225C. An authorized Mazda dealer will re-torque the trailer-hitch bolts at no charge; the campaign requires no replacement part. Do not buy hitch hardware from this page; VIN, installed accessory and campaign status must be verified first.', symptoms: ['abnormal noise from the rear while driving', 'movement or looseness at the accessory hitch'], summary: 'Anchored the hitch page to Mazda\'s exact 63-vehicle accessory campaign and no-parts remedy.' },
    [IDS.cylinder]: { confidence: 'low', description: 'NHTSA complaint 11641443 reports one 2025 CX-50 with P3400 at 600 miles, replacement of two PYFA-12-360A solenoids, metal found in oil-control valves and the oil filter, a repeated code, and a later cylinder-head recommendation. A complaint is an owner report, not a Mazda finding, prevalence estimate or proof that 2023-2024 vehicles share the condition.', solution: 'Treat P3400, repeat check-engine warnings or metal in the oil as a diagnosis and warranty-documentation issue. Preserve the oil-filter evidence and have Mazda verify the code, oil-control circuit, contamination source and covered repair before authorizing work. Do not buy solenoids, a cylinder head or a short block from this page; engine configuration and failure cause must be verified first.', symptoms: ['P3400 or a recurring check-engine warning', 'metal discovered during documented oil or filter inspection', 'rough running or mechanical noise requires separate diagnosis'], summary: 'Retained the single official complaint as a report while removing unsupported multi-year and automatic-parts conclusions.' },
    [IDS.camera]: { confidence: 'high', description: 'The signed Part 573 report for 24V-649 lists two gasoline-powered 2025 CX-50 vehicles built July 29, 2024. Incorrect forward-sensing-camera software mode can disable automatic emergency braking, lane-keep assist and automatic high-beam switching. NHTSA flat data labels the model CX-50 HYBRID, so VIN eligibility controls rather than the database label.', solution: 'Check the VIN for Mazda campaign 6824H. An authorized Mazda dealer will inspect the forward-sensing camera and replace it as necessary at no charge. Until repaired, do not rely on the affected driver-assistance functions. Do not buy a camera from this page; the VIN and campaign remedy must be verified first.', symptoms: ['automatic emergency braking may not function', 'lane-keep assist may not function', 'headlights may not switch automatically from high to low beam'], summary: 'Resolved the official source-label conflict and limited the recall to two VIN-confirmed 2025 vehicles.' },
    [IDS.hybrid]: { confidence: 'high', description: 'Mazda TSB 30-001/25 covers 2025 CX-50 Hybrid vehicles below VIN 7MMVA******124732 built before April 22, 2025. Improper Powertrain Gateway Unit logic can display a hybrid-system-failure warning and prevent engine start. Mazda later opened SSPE0 for a stated 7MMVA******100047-125005 VIN range and DTC P2530:12.', solution: 'Have a Mazda dealer check the VIN for open SSPE0 and verify P2530:12 and related codes. Mazda directs PT_GWU reprogramming with MDARS/M-MDS and completion of all required post-update checks. Do not buy a gateway module or battery from this page; VIN, campaign status, software level and code path must be verified first.', symptoms: ['Hybrid System Malfunction or failure message', 'master warning light', 'hybrid system does not activate or engine does not start', 'P2530:12 may be stored in the SSPE0 path'], summary: 'Replaced secondary sourcing and battery speculation with the exact TSB and superseding SSPE0 boundaries.' },
    [IDS.infotainment]: { confidence: 'medium', description: 'Mazda TSB 16-001/23 applies to the 2023 CX-50 and lists specific Mazda Connect software bugs, including control-scroll problems, missing SiriusXM data, delayed startup and CarPlay connection failures. It does not establish an underpowered processor, cache problem or universal 2023-2025 hardware failure.', solution: 'Document the exact symptom and current Mazda Connect version. For an applicable 2023 vehicle, Mazda directs updating to version 7000C0A-NA05_11022 or later through the current OTA or USB procedure and verifying the repair. Other years need their current VIN-specific Mazda software path. Do not buy a CMU, scanner, relay or electrical tool from this page; software version and failed component must be verified first.', symptoms: ['specific menu, scroll, startup or connection behavior may be corrected by software', 'symptom and installed software version must be documented before repair'], summary: 'Replaced a fake video and processor theory with Mazda\'s exact 2023 software bulletin.' },
    [IDS.transmission]: { confidence: 'medium', description: 'Mazda TSB 05-001/23 applies to the 2023 CX-50 and documents a shock at low speed when starting from a stop with slight accelerator input. Mazda attributes that bounded condition to improper TCM lock-up control software. Complaint records include broader drivability reports but do not prove one cause across all frozen years and engines.', solution: 'Have a Mazda dealer reproduce the exact low-speed launch shock and identify the installed TCM calibration. For the TSB condition, Mazda directs TCM reprogramming with MDARS and post-update checks. Other hesitation, gear-engagement or highway symptoms require code-led transmission and engine diagnosis. Do not buy fluid, a valve body or a transmission from this page; year, calibration and failure mode must be verified first.', symptoms: ['shock at low speed when starting from a stop with slight accelerator input', 'other hesitation or engagement complaints require separate diagnosis'], summary: 'Limited TCM reprogramming to Mazda\'s exact 2023 low-speed-shock condition and removed unsupported fluid and driving-mode advice.' },
    [IDS.wastegate]: { confidence: 'high', description: 'Mazda TSB 01-013/24 covers certain 2024 CX-50 2.5L Turbo vehicles below VIN 7MMVA******244889 built February 24-July 23, 2024. Play at the turbocharger wastegate pivot can cause a rattle while accelerating or idling. The bulletin does not establish a cold-start-only duration or the frozen 2023 and 2025 years.', solution: 'Have a Mazda dealer verify the VIN, engine and noise source. For the exact TSB condition, Mazda directs a technician to install the revised wastegate-pivot wave washer and related one-time-use hardware; it does not direct tightening the actuator arm or automatically replacing the turbocharger. Do not buy turbo or wastegate parts from this page; VIN and diagnosis must be verified first.', symptoms: ['rattle from the engine compartment while accelerating or idling', 'noise must be localized to wastegate-pivot play before repair'], summary: 'Corrected the scope and exact wave-washer repair while removing unsupported cold-start and turbo-replacement claims.' },
    [IDS.wind]: { confidence: 'high', description: 'Mazda ONP09 covers certain 2023 CX-50 vehicles equipped with genuine accessory roof-rack crossbars VA40V3840 or VA40S3840. Mazda identifies the crossbars, not the fixed roof rails, as the wind-noise source and provides an aero-infill kit. The reviewed source does not support the frozen 2024-2025 years.', solution: 'Verify that the vehicle has the covered Mazda accessory crossbars and check ONP09 status. Mazda says crossbars may be removed when not in use; covered customers can install or request installation of the aero-infill strips. Do not add unapproved foam, tape or deflectors, and do not buy a crossbar kit from this page; accessory part number and program eligibility must be verified first.', symptoms: ['wind noise is associated with installed accessory crossbars', 'noise may decrease when crossbars are removed or the official infill is installed'], summary: 'Corrected roof rails to accessory crossbars and replaced aftermarket advice with Mazda ONP09.' },
    [IDS.windshield]: { confidence: 'low', description: 'NHTSA complaints 11613144 and 11649960 report rapid cracking from the driver-side A-pillar area on one 2024 CX-50, and complaint 11687363 reports an interior-surface crack on a 2025 vehicle. These are owner reports, not a defect determination. Mazda TSB 09-041/25 separately covers optical distortion on VIN-bounded 2023-2025 vehicles; it does not establish cracking.', solution: 'Photograph the crack origin and both glass surfaces before replacement, record any impact point, and request an in-person warranty inspection. Use a qualified glass installer and follow current Mazda procedures for the exact VIN and driver-assistance equipment. TSB 09-041/25 applies only to verified distortion, not cracking. Do not buy a windshield from this page; VIN, glass specification, camera equipment and failure mode must be verified first.', symptoms: ['crack reported near the driver-side A-pillar', 'rapid propagation after a small chip has been reported', 'interior-surface cracking has been reported', 'optical distortion is a separate Mazda bulletin condition'], summary: 'Kept complaint evidence explicitly report-level and separated cracking from Mazda\'s distortion bulletin.' },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-50 row ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  const subjects = {
    [IDS.abs]: 'VIN eligibility and recall remedy', [IDS.hitch]: 'VIN, installed accessory and campaign status',
    [IDS.cylinder]: 'engine configuration, stored codes and contamination source', [IDS.camera]: 'VIN and campaign remedy',
    [IDS.hybrid]: 'VIN, campaign status, software level and DTC path', [IDS.infotainment]: 'software version and failed component',
    [IDS.transmission]: 'year, calibration and diagnosed failure mode', [IDS.wastegate]: 'VIN, turbo engine and confirmed pivot noise',
    [IDS.wind]: 'accessory part number and ONP09 eligibility', [IDS.windshield]: 'VIN, glass specification, camera equipment and failure mode',
  };
  return `No universal retail part; ${subjects[id]} must be verified before replacement.`;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  const dtcMap = { [IDS.cylinder]: ['P3400'], [IDS.hybrid]: ['P2530:12'] };
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: clone(dtcMap[id] || []),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-50').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 10) throw new Error(`Expected 10 Mazda CX-50 rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: content.summary, evidence: { primaryEvidence: citationsFor(row.id).map((source) => source.title), limitations: 'Complaint records are reports, not proof of prevalence, a universal cause or exact retail fitment. Recall and bulletin remedies remain VIN- and condition-scoped.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-50',
    completionStatement: 'All 10 frozen Mazda CX-50 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 10 rows contain material source, scope, diagnosis or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'All 10 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are symptom reports, not proof of a defect rate, universal cause or exact failed component.',
      'Manufacturer bulletin and recall remedies remain VIN-, model-year-, equipment- and condition-scoped.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'cx50-camera-source-label-conflict', severity: 'source-conflict', recordIds: [IDS.camera], detail: 'The Part 573 report lists two gasoline CX-50 vehicles while NHTSA flat data labels the row CX-50 HYBRID; prose requires VIN confirmation.' },
      { code: 'cx50-single-complaint-not-defect-proof', severity: 'accuracy-correction', recordIds: [IDS.cylinder], detail: 'The P3400/metal record is one owner complaint and is not expanded into a multi-year defect or automatic parts prescription.' },
      { code: 'cx50-official-scope-mismatches-held', severity: 'identity-hold', recordIds: [IDS.infotainment, IDS.transmission, IDS.wastegate, IDS.wind], detail: 'Frozen SEO years and identity remain unchanged while prose states the exact 2023 or 2024 official bulletin scope.' },
      { code: 'cx50-crossbars-not-fixed-rails', severity: 'accuracy-correction', recordIds: [IDS.wind], detail: 'Mazda ONP09 attributes wind noise to genuine accessory crossbars and provides an aero-infill remedy.' },
      { code: 'cx50-windshield-report-vs-bulletin-separated', severity: 'accuracy-correction', recordIds: [IDS.windshield], detail: 'Owner cracking reports remain report-level; Mazda 09-041/25 is explicitly limited to distortion.' },
      { code: 'all-cx50-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda CX-50 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, proposalFor };
