/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-sc-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const MODEL_ALIASES = Object.freeze(['SC', 'SC 300', 'SC300', 'SC 400', 'SC400', 'SC 430', 'SC430']);
const IDS = Object.freeze({
  ac: 'lexus-sc-ac-compressor-failure-2002',
  dashboard: 'lexus-sc-dashboard-melt-2002',
  timing: 'lexus-sc-timing-belt-service-2002',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze(['15V285000', '15V286000', '16V127000', '16V128000', '18V883000', '19V741000', '92V046000', '98V016000']);
const PDF_SOURCES = Object.freeze({
  acDiagnosis: { title: 'L-SB-0010-15 - A/C System Diagnosis After Component Failure', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10132575-9999.pdf', localPath: 'C:/tmp/MC-10132575-9999.pdf', nhtsaDocumentId: '10132575', pages: 2, bytes: 109296, sha256: '6cc698c4ae54ac5cc3e78897770814cdb7fbc590cb6c648fb060763af920c8e2' },
});
const SECONDARY_SOURCES = Object.freeze({
  acReport: { title: 'SC430 A/C compressor seizure report - ClubLexus', type: 'forum', url: 'https://www.clublexus.com/forums/sc430-2nd-gen-2001-2010/424057-ac-compressor-just-died-document-thread.html', liveAccess: 'protected-403-direct-url-reviewed', assertedBoundary: 'One 2006 SC430 owner reported a seizing compressor and engine-stall symptom near 40,000 miles; this does not prove a hot-climate pattern, clutch or bearing progression, or universal system contamination.' },
  dashboardReport: { title: 'SC430 faded dashboard report - ClubLexus', type: 'forum', url: 'https://www.clublexus.com/forums/sc430-2nd-gen-2001-2010/516966-restoring-fading-dashboard.html', liveAccess: 'protected-403-direct-url-reviewed', assertedBoundary: 'One 2006 SC430 owner described a faded, dry or chalky dashboard and reflected glare; the thread does not establish sticky or melting material, convertible causation, prevalence, or eligibility for a Lexus replacement program.' },
  timingOfficial: { title: 'SC 430 Launch Pack (July 2001) - Lexus Media Site', type: 'oem', url: 'https://media.lexus.co.uk/sc-430-launch-pack-july-2001/', liveAccess: 'reachable-200', assertedBoundary: 'Lexus UK launch material states a 90,000-mile timing-belt replacement interval; it is not a US model-year maintenance guide and states no universal time interval, interference-engine classification, or bundled water-pump and pulley replacement.' },
  timingDiscussion: { title: 'SC430 model-year maintenance schedule discussion - ClubLexus', type: 'forum', url: 'https://www.clublexus.com/forums/sc430-2nd-gen-2001-2010/511879-maintenance-schedule.html', liveAccess: 'protected-403-direct-url-reviewed', assertedBoundary: 'Owners comparing US maintenance guides reported 72 months/90,000 miles for 2002 and 108 months/90,000 miles for 2007, showing that one nine-year interval must not be applied to every frozen model year.' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 14, '2000-2004': 57, '2005-2009': 13, '2010-2014': 18, '2015-2019': 147, '2020-2024': 146, '2025-2026': 3 }, totalRows: 398, exactAcDocumentIds: ['10132575', '10134473'], sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: RECALL_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 3, post: 40 }, totalRows: 43, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, mappedCampaigns: [], deferredCampaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { type: source.type, title: source.title, url: source.url }; }
function citationsFor(id) {
  const map = {
    [IDS.ac]: [PDF_SOURCES.acDiagnosis, SECONDARY_SOURCES.acReport],
    [IDS.dashboard]: [SECONDARY_SOURCES.dashboardReport],
    [IDS.timing]: [SECONDARY_SOURCES.timingOfficial, SECONDARY_SOURCES.timingDiscussion],
  };
  if (!map[id]) throw new Error(`Unexpected SC record ${id}`);
  return map[id].map(citation);
}
function contentFor(id) {
  const content = {
    [IDS.ac]: { confidence: 'medium', description: 'A direct 2006 SC430 report documents one compressor seizure and an engine-stall symptom, but it does not establish a hot-climate pattern, a clutch-and-bearing progression, or generation-wide prevalence. Lexus bulletin L-SB-0010-15 applies to the SC430 and treats contamination after an A/C component failure as an inspection result, not an assumption: the required component group depends on where debris is actually found.', solution: 'Confirm clutch command, electrical supply, refrigerant pressures and the source of any noise before condemning the compressor. If compressor failure is verified, follow the vehicle repair manual and the staged debris inspection in L-SB-0010-15; replace only the component group required by those findings. Do not prescribe a blanket flush or automatic drier, expansion-valve, condenser and line replacement. This is diagnosis- and contamination-specific A/C work; no universal compressor, clutch, bearing, drier, valve, condenser or retail part is asserted.', summary: 'Bound the page to a direct compressor-seizure report and exact Lexus debris-inspection logic while removing prevalence, assumed failure progression and blanket system replacement.' },
    [IDS.dashboard]: { confidence: 'low', description: 'One direct 2006 SC430 report describes a dashboard that appeared faded, dry or chalky and created reflected glare. The complete exact SC-family manufacturer-communication inventory contains no SC430 sticky or melting dashboard program, and the Lexus dashboard programs cited for other models do not establish SC430 eligibility. No reviewed source supports the frozen 2002-2010 prevalence, convertible-sunlight mechanism, dangerous-glare characterization or ZE7 coverage.', solution: 'Inspect and photograph the surface, avoid unverified solvents or coatings on the dashboard or airbag cover, and obtain a Lexus dealer or qualified upholstery estimate for the exact condition. Ask Lexus to check the VIN for any applicable assistance, but do not represent ZE7 or another dashboard program as covering the SC430. This is material- and VIN-specific interior work; no universal dashboard, coating or retail part is asserted.', summary: 'Retained the indexed dashboard identity as a bounded fading/glare report while removing the unsupported sticky-melting mechanism, prevalence and false replacement-program promise.' },
    [IDS.timing]: { confidence: 'medium', description: 'Lexus UK launch material states that the SC430 timing belt requires replacement every 90,000 miles. Direct discussion of US maintenance guides reports different time limits by model year, including 72 months for 2002 and 108 months for 2007, so one nine-year interval cannot be applied to every 2002-2010 vehicle. The reviewed primary source does not classify the 3UZ-FE as an interference engine or support the frozen catastrophic-damage claim.', solution: 'Use the exact model-year and market maintenance guide plus documented service history to determine the mileage and time deadline; the primary Lexus source supports 90,000 miles but not one universal time limit. Have related tensioners, pulleys, seals and the water pump inspected and replace them only when the applicable repair procedure or their condition requires it. This is model-year- and condition-specific maintenance; no universal timing kit, water pump, pulley or retail part is asserted.', summary: 'Preserved the 90,000-mile primary-source interval while removing a false universal nine-year rule, an unverified interference-engine claim and automatic kit replacement.' },
  };
  if (!content[id]) throw new Error(`Unexpected SC record ${id}`);
  return content[id];
}
function proposalFor(row) { const proposal = clone(fullRecord(row)); const content = contentFor(row.id); Object.assign(proposal, { description: content.description, solution: content.solution, confidence: content.confidence, symptoms: [], affectedSystems: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(row.id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', lastReportedByOwners: '', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary }); return proposal; }
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact SC-family communication rows plus ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  const details = {
    [IDS.ac]: ['Visual review of L-SB-0010-15 confirms SC430 applicability and conditional Parts Groups A-D based on exact debris findings.', 'One direct owner report confirms an individual compressor seizure, not the frozen prevalence, clutch/bearing progression or universal contamination.'],
    [IDS.dashboard]: ['One direct report supports fading, dryness/chalkiness and glare on an individual SC430.', 'The exact inventory contains no SC430 sticky/melting dashboard program, so ZE7 coverage and convertible-driven prevalence remain unsupported.'],
    [IDS.timing]: ['Primary Lexus UK material supports 90,000 miles for timing-belt replacement.', 'The primary source supplies no time interval or interference classification, while direct US guide comparison shows the time interval varied by model year.'],
  };
  return [common, ...details[row.id], 'No universal retail part or search-style commerce link is introduced.'];
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'SC').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: 'diagnosis-or-maintenance-specific-no-universal-retail-part', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-and-direct-source-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Lexus', model: 'SC',
    completionStatement: 'All three frozen SC pages retain their indexed identities while exact Lexus material and bounded direct reports correct false program, maintenance, prevalence and universal-repair claims.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Three material evidence corrections require independent review before any body-copy write.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.', 'All three SC IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, allowed severities and publication states remain unchanged.', 'A direct owner report or general diagnostic bulletin is never expanded beyond its exact boundary.', 'No part is approved without exact diagnosis and fitment; every proposal contains an explicit no-universal-commerce marker.', 'Unknown or unsupported owner totals are reset to zero, which the production UI hides rather than presenting as social proof.'],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'sc-ac-remedy-bounded', severity: 'accuracy-safety', recordIds: [IDS.ac], detail: 'L-SB-0010-15 replaces blanket system flushing and parts replacement with a staged debris inspection and conditional component groups.' },
      { code: 'sc-false-dashboard-program-removed', severity: 'critical-correction', recordIds: [IDS.dashboard], detail: 'No exact SC-family source establishes sticky/melting material or SC430 dashboard-program eligibility; the page is bounded to one fading/glare report.' },
      { code: 'sc-maintenance-interval-corrected', severity: 'critical-correction', recordIds: [IDS.timing], detail: 'The 90,000-mile interval remains, while the universal nine-year, interference-engine and automatic full-kit claims are removed.' },
      { code: 'sc-no-unverified-commerce', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'No guessed A/C, dashboard or timing-system part or search link is introduced.' },
      { code: 'all-sc-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'Every SC ID, title, category, indexed vehicle scope, severity, relation and publication state remains preserved.' },
    ],
    pdfSources: publicPdfSources(), secondarySourceReview: SECONDARY_SOURCES, manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY, mappedCampaigns: [], deferredCampaigns: CAMPAIGNS,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SECONDARY_SOURCES, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor, publicPdfSources };
