/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-corsair-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CORSAIR']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  egr: 'lincoln-corsair-egr-valve-failure-causing-sudden-loss-drive-power',
  belt: 'lincoln-corsair-rear-seat-belt-retractor-bolts-not-properly-tightened',
  lamp: 'lincoln-corsair-rear-tail-light-water-intrusion',
  glass: 'lincoln-corsair-windshield-air-bubbles-obscure-driver-visibility',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  egr: { title: 'NHTSA Part 573 Report 26V122 / Ford 26S10: Corsair EGR Valve', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V122-5530.pdf', localPath: 'C:/tmp/lincoln-corsair-egr.pdf', pages: 8, bytes: 714096, sha256: '19d6b8a909fb627549ac169f7458aa619238373b58a482f92620db4651ead90c' },
  belt: { title: 'NHTSA Recall Acknowledgment 25V862 / Ford 25C68: Rear Seat-Belt Retractors', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V862-1028.pdf', localPath: 'C:/tmp/lincoln-corsair-belt.pdf', pages: 2, bytes: 120127, sha256: '56d8bd21ddf59bfe7e00373e70a45fed6d0e28ca7e04ee07814ecc5585937a24' },
  lamp: { title: 'NHTSA Part 573 Report 25V688 / Ford 25C53: Rear Combination Lamps', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V688-4136.pdf', localPath: 'C:/tmp/lincoln-corsair-lamp.pdf', pages: 4, bytes: 389127, sha256: '9a1d7b3e96e3774835ccd7d64fc7864efcd3ee48b2c684849dac57a2495198b2' },
  glass: { title: 'NHTSA Part 573 Report 25V730 / Ford 25C60: Windshield Air Bubbles', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V730-0685.pdf', localPath: 'C:/tmp/lincoln-corsair-glass.pdf', pages: 6, bytes: 576846, sha256: 'ef3dc20658dd60afd2912670338591ab91ed23c3e91d85e014d75550d1ef0afa' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 1, '2020-2024': 259, '2025-2026': 101 }, totalRows: 361, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 269 }, totalRows: 269, campaignCount: 36, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) { const source = Object.entries(IDS).find(([, value]) => value === id)?.[0]; if (!source) throw new Error(`Unexpected Corsair correction ${id}`); return [citation(PDF_SOURCES[source]), { url: 'https://www.nhtsa.gov/recalls', type: 'nhtsa', title: 'NHTSA VIN-Specific Recall Lookup' }]; }

function contentFor(id) {
  const content = {
    [IDS.egr]: {
      confidence: 'high',
      description: 'Ford safety recall 26S10/NHTSA 26V122 covers 1,200 certain 2025 Corsairs built November 14, 2024 through April 2, 2025 with suspect EGR valves installed in 2.0-liter engines. Inconsistent laser-weld penetration can allow the EGR-valve poppet head to detach, causing excessive EGR flow and possible loss of motive power, most likely at 20 km/h (about 12 mph) or below. Initial warnings may include weak acceleration, engine vibration, a no-start condition or a check-engine light. The frozen 2.3-liter engine metadata on this page is outside the cited Corsair population.',
      solution: 'Check the VIN for 26S10/26V122. In the March 3, 2026 Part 573 filing, Ford stated that the remedy was still under development, the free dealer service would follow when available, and interim owner letters were planned for March 16-20; the filing does not promise a September remedy date, a loaner or mobile diagnosis. If weak acceleration or loss of power occurs, move out of traffic as safely as possible and contact Lincoln or roadside assistance. Do not buy an EGR valve or other part from this page because recall eligibility and remedy are VIN-scoped and dealer-administered.',
      summary: 'Corrected the campaign number, exact 2.0-liter Corsair scope, defect, warnings and remedy status; removed the invented September date and loaner promise.',
    },
    [IDS.belt]: {
      confidence: 'high',
      description: 'Ford safety recall 25C68/NHTSA 25V862 covers certain 2025-2026 Corsair and Escape vehicles. The left and right rear-passenger seat-belt retractors may not be securely fastened, so an affected retractor may not restrain an occupant as intended and can increase injury risk in a crash. The official acknowledgment does not state that owners should expect rattles, binding or failure to retract, and it does not issue a child-seat or do-not-use advisory.',
      solution: 'Check the VIN for 25C68/25V862. The free dealer remedy is to inspect the rear retractor bolts and secure or replace those bolts as necessary. The official source does not prescribe replacing the entire retractor or avoiding an otherwise functioning seat before inspection. Do not buy retractor bolts, a retractor or another restraint part from this page because this is a VIN-scoped no-charge safety-recall remedy.',
      summary: 'Replaced unsupported rattle, binding, child-seat and whole-retractor claims with the exact 25V862 defect and bolt remedy.',
    },
    [IDS.lamp]: {
      confidence: 'high',
      description: 'Ford safety recall 25C53/NHTSA 25V688 covers 84 certain 2024-2025 Corsairs built December 15, 2023 through August 15, 2025. Rear combination lamps may have been damaged during an internal plant repair; the resulting leak path can admit water and cause an internal short circuit. Backup, stop, tail or rear turn-signal functions may become inoperative, reducing visibility and increasing crash risk. A failed rear turn signal can produce a fast-flashing turn indicator. Ford estimated that 20 percent of the 84-vehicle population had the defect.',
      solution: 'Check the VIN for 25C53/25V688. The free dealer remedy inspects both rear combination lamps and replaces a lamp if necessary; when a lamp is replaced, the center-applique lamp is replaced as well. Treat a fast turn-indicator flash or an inoperative rear lamp as a service prompt. Do not buy a rear lamp, center-applique lamp or other part from this page because the remedy and part selection are VIN- and inspection-specific.',
      summary: 'Bound the lamp page to the 84-vehicle recall population, exact failure modes, warning and free inspect/replace remedy.',
    },
    [IDS.glass]: {
      confidence: 'high',
      description: 'Ford safety recall 25C60/NHTSA 25V730 covers 5,255 certain 2025-2026 Corsairs built July 7 through September 5, 2025. Excess residual air trapped during windshield lamination can form visible bubbles. Depending on their position and size, the bubbles can violate FMVSS 205 luminous-transmittance and defect-location requirements, impair driver visibility and increase crash risk. This replaces the former description, which was an editing instruction rather than consumer-facing issue content.',
      solution: 'Check the VIN for 25C60/25V730. The free dealer remedy visually inspects the windshield and replaces it under the Workshop Manual procedure when the air-bubble condition is present. The Part 573 report says parts were available and lists November 7, 2025 as the planned remedy-owner-notification date. Do not buy a windshield, molding, sensor or other part from this page because glass configuration and the no-charge remedy are VIN- and inspection-specific.',
      summary: 'Replaced an accidental editing instruction and pushy advice with the exact defect, population, safety boundary and inspect/replace recall remedy.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Corsair correction ${id}`);
  return content[id];
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row)); const content = contentFor(row.id);
  Object.assign(proposal, { description: content.description, solution: content.solution, confidence: content.confidence, symptoms: [], affectedSystems: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(row.id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', lastReportedByOwners: '', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary });
  return proposal;
}
function evidenceFor(row) {
  const inventory = `Complete model inventory: ${BULLETIN_INVENTORY.totalRows} exact Corsair communications and ${RECALL_INVENTORY.totalRows} exact recall rows across ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  const details = {
    [IDS.egr]: ['Visual review of 26V122 proves 1,200 Corsairs, the exact build dates, 2.0-liter-only scope, low-speed risk, warnings and under-development remedy.', 'The frozen 2.3-liter metadata is explicitly excluded; the former September remedy date and loaner/mobile promises are absent from the filing.'],
    [IDS.belt]: ['Visual review of 25V862 proves insecure rear retractors and a free inspect/secure-or-replace-bolts remedy.', 'The source does not state rattle, binding, non-retraction, a child-seat advisory or whole-retractor replacement.'],
    [IDS.lamp]: ['Visual review of 25V688 proves the 84-vehicle/20-percent population, plant-repair damage, water path, lamp functions, warning and remedy.', 'No search-style commerce is needed for a no-charge VIN-scoped inspection.'],
    [IDS.glass]: ['Visual review of 25V730 proves 5,255 Corsairs, residual lamination air, visibility/FMVS 205 risk, parts availability and free inspect/replace remedy.', 'The previous description was an editing note and not valid page content.'],
  };
  return [inventory, ...details[row.id], 'No universal retail part or search-style commerce link is introduced.'];
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Corsair').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: 'free-vin-scoped-recall-remedy-no-retail-part', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-recall-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Lincoln', model: 'Corsair', completionStatement: 'All four frozen Corsair pages are accounted for and receive bounded recall-source corrections without changing indexed identity.', applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All four rows contain material source or content defects and require independent review before any catalog write.' }, safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.', 'All four IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, canonical severities and publication states remain unchanged.', 'The 2.3-liter EGR metadata conflict is exposed but not silently altered; body copy excludes it from 26V122.', 'Every recall remains VIN-scoped and every remedy is stated only as the official filing describes it.', 'Every row has an explicit free-recall/no-retail-commerce boundary.', 'Unknown owner totals remain zero and the production UI hides them rather than presenting fake social proof.'], source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length }, observations: [{ code: 'corsair-egr-engine-metadata-conflict', severity: 'metadata-hold', recordIds: [IDS.egr], detail: 'The frozen row includes 2.3L, while 26V122 limits the Corsair population to suspect valves on 2.0L engines.' }, { code: 'corsair-egr-remedy-date-invented', severity: 'critical-correction', recordIds: [IDS.egr], detail: 'The filing says remedy under development and does not state September 2026 or promise loaner/mobile diagnosis.' }, { code: 'corsair-seat-belt-advice-overstated', severity: 'safety-correction', recordIds: [IDS.belt], detail: 'The official acknowledgment does not support rattle/binding symptoms, a child-seat warning or whole-retractor replacement.' }, { code: 'corsair-windshield-description-was-editor-note', severity: 'content-critical', recordIds: [IDS.glass], detail: 'The live description was an internal date-change instruction, not issue content.' }, { code: 'all-corsair-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Corsair page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' }], pdfSources: publicPdfSources(), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY, summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions };
}
if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor, publicPdfSources };
