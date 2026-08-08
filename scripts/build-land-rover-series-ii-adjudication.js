/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');
const { RECALL_FILES, SOURCE_FILES } = require('./build-land-rover-range-rover-velar-adjudication');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-series-ii-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const MANUAL_SOURCE = Object.freeze({
  title: 'The Rover Company Ltd. Technical Publication TP/214/D, Part No. 4220 - Land-Rover Series II Workshop Manual for Petrol and Diesel Models, 88 and 109, February 1961',
  url: 'https://military-vehicle.org/wp-content/uploads/2021/09/Land-Rover-Series-II-workshop-manual.pdf',
  localPath: 'C:/tmp/land-rover-series-ii-workshop-manual.pdf',
  pages: 371,
  bytes: 40051158,
  sha256: '64600906613490c937183d6ee730dc125824ffde2cfd20a3069d9e3f0bb8a247',
  technicalPublicationNumber: 'TP/214/D',
  partNumber: '4220',
  publicationDate: 'February 1961',
});
const MODEL_ALIASES = Object.freeze(['SERIES II', 'SERIES 2']);
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source) });
const RECALL_INVENTORY = Object.freeze({ source: RECALL_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 0 }, totalRows: 0, uniqueCampaignYearModelRows: 0, campaignCount: 0, campaigns: [], mappedCampaigns: [], deferredCampaigns: [], sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source) });
const MANUAL_SECTIONS = Object.freeze({
  A: { code: 'A/AA', title: 'Petrol and diesel engines' }, C: { code: 'C', title: 'Gearbox and transfer box' }, D: { code: 'D', title: 'Propeller shafts' }, E: { code: 'E', title: 'Rear axle' }, F: { code: 'F', title: 'Front axle' }, G: { code: 'G', title: 'Steering and linkage' }, H: { code: 'H', title: 'Brake system' }, J: { code: 'J', title: 'Suspension' }, L: { code: 'L', title: 'Cooling system' }, M: { code: 'M', title: 'Fuel system' }, P: { code: 'P', title: 'Electrical system' }, Q: { code: 'Q', title: 'Instruments and controls' }, R: { code: 'R', title: 'Body' }, T: { code: 'T', title: 'Extra equipment' },
});
function sectionFor(row) {
  const id = row.id;
  let key;
  if (row.category === 'engine' || /2-0-litre-diesel/.test(id)) key = 'A';
  else if (row.category === 'transmission' || /4wd-selector/.test(id)) key = 'C';
  else if (/propshaft/.test(id)) key = 'D';
  else if (/rear-half-shaft|differential/.test(id)) key = 'E';
  else if (/swivel/.test(id)) key = 'F';
  else if (row.category === 'steering') key = 'G';
  else if (row.category === 'brakes') key = 'H';
  else if (row.category === 'suspension') key = 'J';
  else if (row.category === 'cooling') key = 'L';
  else if (row.category === 'fuel') key = 'M';
  else if (/instrument-voltage-stabilizer/.test(id)) key = 'Q';
  else if (/heater/.test(id)) key = 'T';
  else if (row.category === 'electrical') key = 'P';
  else if (row.category === 'body') key = 'R';
  const section = MANUAL_SECTIONS[key];
  if (!section) throw new Error(`${row.id}: no factory-manual section mapping for ${row.category}`);
  return section;
}
function primaryCitations() { return [{ type: 'manual', title: MANUAL_SOURCE.title, url: MANUAL_SOURCE.url }, { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }, { type: 'nhtsa', title: 'NHTSA Recall datasets', url: RECALL_DATASET_URL }]; }
function contentFor(row) {
  const section = sectionFor(row);
  return {
    description: `This indexed Series II page remains under corrective review for a ${section.title.toLowerCase()} concern. The Rover Company workshop manual confirms the applicable factory system and service section, but it does not establish the existing prevalence, universal year or wheelbase coverage, modern upgrade claims or replacement-part fitment. The complete frozen NHTSA manufacturer-communication and recall inventories contain no exact classic Series II model row, so the existing secondary-source narrative is not promoted as verified fact.`,
    solution: `Do not select a replacement part, fluid, adjustment, conversion or repair procedure from this page. Identify the chassis number, 88- or 109-inch wheelbase, build year, engine and installed component, then diagnose against Rover workshop-manual section ${section.code} (${section.title}) and the matching factory parts catalogue. Safety-critical work requires inspection by a qualified classic Land Rover technician. No universal retail part or dealer-only remedy is asserted.`,
    summary: `Placed the secondary-source ${section.title.toLowerCase()} narrative on corrective hold, removed unverified repair/upgrade and commerce guidance, and bound the next review to Rover manual section ${section.code}.`,
  };
}
function proposalFor(row) {
  const proposal = clone(fullRecord(row)); const content = contentFor(row);
  proposal.description = content.description; proposal.solution = content.solution; proposal.confidence = 'low'; proposal.symptoms = []; proposal.affectedSystems = []; proposal.dtcCodes = []; proposal.estimatedCostLow = null; proposal.estimatedCostHigh = null; proposal.typicalMileageLow = null; proposal.typicalMileageHigh = null; proposal.citations = primaryCitations(); proposal.communityRecommendations = []; proposal.fixParts = []; proposal.humanApproved = false; proposal.reportCount = 0; proposal.source = 'manual'; proposal.lastReportedByOwners = ''; proposal.reviewedOn = REVIEW_DATE; proposal.contentUpdatedOn = REVIEW_DATE; proposal.contentUpdateSummary = content.summary; proposal.relatedIssueIds = [];
  return proposal;
}
function evidenceFor(row) { const section = sectionFor(row); return ['Complete federal inventory: zero exact classic Series II rows across all seven frozen NHTSA manufacturer-communication periods and both frozen recall periods.', `The 371-page Rover Company publication TP/214/D / Part No. 4220 confirms the applicable factory system in section ${section.code} (${section.title}); the downloaded PDF is bound by byte length and SHA-256.`, 'The frozen page cites only secondary/community/commercial sources and its fitment-sensitive remedy is not treated as primary-source proof; no part, fluid, conversion or procedure is approved.']; }
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Series II').sort((a, b) => a.id.localeCompare(b.id));
  const blockerIds = rows.map((row) => row.id);
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: 'targeted_safety_cleanup_pending_source', commerceDecision: 'blocked-no-exact-fitment-no-retail-part', manualSection: sectionFor(row), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  const sectionCounts = Object.fromEntries(Object.values(MANUAL_SECTIONS).map((section) => [section.code, rows.filter((row) => sectionFor(row).code === section.code).length]).filter(([, count]) => count));
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Land Rover', model: 'Series II',
    completionStatement: 'All 57 frozen Series II pages are preserved and receive a bounded corrective hold: the factory manual is available, but the current secondary-source prevalence, upgrade and fitment claims require record-by-record primary review before any application.',
    applicationGate: { status: 'blocked', blockerRecordIds: blockerIds, reason: 'Every current Series II remedy is fitment- or safety-sensitive and derived from secondary/community/commercial sources. Independent manual and parts-catalogue review is required per record.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.','All 57 IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.','No part, fluid, adjustment, conversion or repair procedure is approved without exact factory-document and vehicle-configuration support.','The full frozen NHTSA inventory was replayed; zero exact classic Series II manufacturer-communication or recall rows exist.','Rover Company workshop manual TP/214/D / Part No. 4220 is hash-bound as the primary technical source, but a repair manual is not evidence that a condition is common.'],
    source: { snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'series-ii-no-exact-federal-records', severity: 'source-gap', recordIds: blockerIds, detail: 'Zero exact classic Series II rows exist in the complete frozen NHTSA manufacturer-communication and recall inventories.' },
      { code: 'series-ii-factory-manual-bound', severity: 'primary-source', recordIds: blockerIds, detail: 'Rover Company publication TP/214/D / Part No. 4220 is visually inspected and bound by 371 pages, 40,051,158 bytes and SHA-256.' },
      { code: 'series-ii-secondary-citations-not-promoted', severity: 'accuracy-safety', recordIds: blockerIds, detail: 'All 57 frozen pages rely exclusively on secondary, community or commercial citations; none is treated as prevalence or fitment proof.' },
      { code: 'series-ii-prescriptive-guidance-held', severity: 'critical-correction', recordIds: blockerIds, detail: 'All 57 current remedies are fitment- or safety-sensitive; the proposals remove those instructions pending exact manual and parts-catalogue review.' },
      { code: 'series-ii-no-unverified-commerce', severity: 'commerce-safety', recordIds: blockerIds, detail: 'No guessed product, fluid, conversion kit or search-style deep link is introduced.' },
      { code: 'all-series-ii-pages-preserved', severity: 'seo-safety', recordIds: blockerIds, detail: 'Every Series II ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    factoryManual: Object.fromEntries(Object.entries(MANUAL_SOURCE).filter(([key]) => key !== 'localPath')), manualSectionCounts: sectionCounts, manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY, mappedCampaigns: [], deferredCampaigns: [], summary: { targeted_safety_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}
if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, manualSectionCounts: packet.manualSectionCounts, applicationGate: packet.applicationGate.status }, null, 2)); }
module.exports = { BULLETIN_INVENTORY, MANUAL_SECTIONS, MANUAL_SOURCE, MODEL_ALIASES, OUTPUT, RECALL_FILES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, SOURCE_FILES, buildPacket, contentFor, evidenceFor, primaryCitations, proposalFor, sectionFor };
