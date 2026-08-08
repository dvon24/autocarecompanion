/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-lc-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const ID = 'lexus-lc-infotainment-lag-2018';
const MODEL_ALIASES = Object.freeze(['LC','LC HYBRID']);
const CAMPAIGNS = Object.freeze(['20V012000','20V682000','24V124000','25V744000']);
const PDF_SOURCES = Object.freeze({
  update2018: { title: 'L-SB-0172-17 Rev1 — Navigation System Software Update (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10145755-9999.pdf', localPath: 'C:/tmp/MC-10145755-9999.pdf', nhtsaDocumentId: '10145755', pages: 5, bytes: 540051, sha256: '013687ec8e7351970f1e32d944f46a9ad45de9ecf1ceec8505178a68e22fbaf7' },
  carPlay2018: { title: 'L-SB-0028-19 — Multimedia System Enhancements Phase 3 (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10161514-9999.pdf', localPath: 'C:/tmp/MC-10161514-9999.pdf', nhtsaDocumentId: '10161514', pages: 5, bytes: 479055, sha256: '38b955cb7e7ce590e0a7199515d3990374e0d0ad4db2169b8be57db4733227f8' },
  update2019: { title: 'L-SB-0022-19 — Navigation Update Phase 3 (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159733-9999.pdf', localPath: 'C:/tmp/MC-10159733-9999.pdf', nhtsaDocumentId: '10159733', pages: 6, bytes: 660188, sha256: 'a46de3365a4feaca764c3cef381f429357860e48b52636d7618d1670a254ae83' },
  update2021to2022: { title: 'L-SB-0007-23 — Navigation System Software Update (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10235224-9999.pdf', localPath: 'C:/tmp/MC-10235224-9999.pdf', nhtsaDocumentId: '10235224', pages: 8, bytes: 568190, sha256: '26385e1d74d23151d9ac9b3644ebd171c994004288b9fbb815dbdb254d0a9143' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 58, '2020-2024': 235, '2025-2026': 71 }, totalRows: 364, exactInfotainmentDocumentIds: ['10145755','10159733','10161514','10235224'], sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: RECALL_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 306 }, totalRows: 306, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, mappedCampaigns: [], deferredCampaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citationsFor() { return [...Object.values(PDF_SOURCES).map((source) => ({ type: 'tsb', title: source.title, url: source.url })), { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }]; }
function contentFor() { return {
  description: 'Exact Lexus bulletins support specific Panasonic navigation/multimedia conditions rather than a universal “laggy touchpad” defect: 2018 LC 500/LC 500h software addressed resets, freezes, voice/Bluetooth and navigation errors; a separate 2018 enhancement added Apple CarPlay and Amazon Alexa; 2019 software addressed defined CarPlay, display, volume and Bluetooth faults; and 2021-2022 software addressed defined Panasonic-version faults. The sources do not establish imprecise touchpad hardware as a defect, a 2022 touchscreen conversion, or a dealer retrofit of later touchscreen hardware into 2018-2021 vehicles.',
  solution: 'Identify the model year, Panasonic audio/navigation version and reproducible symptom, then use the exact applicable Lexus bulletin to determine whether a software update is available. Do not promise a touchscreen upgrade or retrofit, and do not apply an update intended for another head-unit version. Apple CarPlay is available only where the verified enhancement and installed hardware support it. This is a VIN/head-unit-specific dealer software remedy; no universal retail part is asserted.',
  summary: 'Replaced subjective review/forum claims with four visually verified Lexus software boundaries, corrected Apple CarPlay availability, and removed the false 2022-touchscreen/2018-2021-retrofit advice.',
}; }
function proposalFor(row) { const proposal = clone(fullRecord(row)); const content = contentFor(); proposal.description = content.description; proposal.solution = content.solution; proposal.confidence = 'high'; proposal.symptoms = []; proposal.affectedSystems = []; proposal.dtcCodes = []; proposal.estimatedCostLow = null; proposal.estimatedCostHigh = null; proposal.typicalMileageLow = null; proposal.typicalMileageHigh = null; proposal.citations = citationsFor(); proposal.communityRecommendations = []; proposal.fixParts = []; proposal.humanApproved = false; proposal.reportCount = 0; proposal.source = 'manual'; proposal.lastReportedByOwners = ''; proposal.reviewedOn = REVIEW_DATE; proposal.contentUpdatedOn = REVIEW_DATE; proposal.contentUpdateSummary = content.summary; proposal.relatedIssueIds = []; return proposal; }
function evidenceFor() { return [`Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact LC-family manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`, 'Visual review of the 2018, 2019 and 2021-2022 Panasonic bulletins establishes specific software/version symptoms, not a universal touchpad-hardware defect.', 'Visual review of L-SB-0028-19 supports a software enhancement adding CarPlay/Alexa to applicable 2018 LC vehicles and warns that an incorrect update can damage the head unit; no source supports the claimed touchscreen retrofit.']; }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LC').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: 'remove_false_citation_and_targeted_safety_cleanup_pending_source', commerceDecision: 'dealer-software-version-specific-no-retail-part', evidence: evidenceFor(), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'LC',
    completionStatement: 'The single frozen LC page retains its indexed identity and is rewritten around exact Lexus software conditions while the unsupported touchpad, 2022 touchscreen and retrofit claims remain blocked.',
    applicationGate: { status: 'blocked', blockerRecordIds: [ID], reason: 'The page’s broad title is preserved for SEO, but its prior body mixed subjective criticism with a false touchscreen timeline and unsupported retrofit advice. Independent review is required before body-copy application.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.','The LC ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remain unchanged.','Only exact model-year/head-unit/version software conditions are retained; no touchscreen hardware upgrade or retrofit is promised.','No head-unit part, USB media or consumer commerce link is approved; the remedy is dealer software/version verification.','All 364 exact manufacturer-communication rows and 306 exact recall rows / 4 campaigns were replayed; separate recall identities remain deferred.'],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'lc-software-conditions-bounded', severity: 'critical-correction', recordIds: [ID], detail: 'Four exact Lexus bulletins replace the page’s generalized lag/touchpad claim with defined software-version conditions.' },
      { code: 'lc-touchscreen-retrofit-removed', severity: 'critical-correction', recordIds: [ID], detail: 'No exact source supports a 2022 touchscreen change or retrofitting later touchscreen hardware into 2018-2021 LC vehicles.' },
      { code: 'lc-no-unverified-commerce', severity: 'commerce-safety', recordIds: [ID], detail: 'No head unit, display, USB tool or search link is introduced; the proposal carries an explicit version-specific dealer/no-retail marker.' },
      { code: 'lc-four-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Four separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-lc-pages-preserved', severity: 'seo-safety', recordIds: [ID], detail: 'The LC ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remain preserved.' },
    ],
    pdfSources: Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: [],
    deferredCampaigns: CAMPAIGNS,
    summary: { remove_false_citation_and_targeted_safety_cleanup_pending_source: 1, total: 1 },
    rows: decisions,
  };
}

if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BULLETIN_INVENTORY, CAMPAIGNS, ID, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor };
