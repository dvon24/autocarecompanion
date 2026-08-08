/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const path = require('node:path');
const {
  RECALL_FILES,
  SOURCE_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-nx-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const MODEL_ALIASES = Object.freeze(['NX', 'NX 200T', 'NX200T', 'NX 300', 'NX300', 'NX 300H', 'NX300H', 'NX 250', 'NX250', 'NX 350H', 'NX350H']);
const IDS = Object.freeze({
  cvt: 'lexus-nx-cvt-drone-2022',
  infotainment: 'lexus-nx-infotainment-lag-2015',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze([
  '18V085000', '20V012000', '20V682000', '22V238000', '22V239000', '22V661000',
  '23V480000', '24V482000', '24V911000', '25V028000', '25V040000', '25V059000',
  '25V744000', '26V162000',
]);

const PDF_SOURCES = Object.freeze({
  nxBrochure: {
    title: '2022 Lexus NX and NX Hybrid brochure - powertrain specifications',
    type: 'oem',
    url: 'https://www.lexus.com/content/dam/lexus/documents/brochures/models/2022/MY22-Lexus-NX-NXh-Brochure.pdf',
    localPath: 'C:/tmp/MY22-Lexus-NX-NXh-Brochure.pdf',
    nhtsaDocumentId: 'MY22-NX-BROCHURE',
    pages: 33,
    bytes: 12622378,
    sha256: '7cc1ed57c299991968ddf3f207b10d86f59fa1fdea56b282f111a6b621011fe1',
  },
  navigation2015: {
    title: 'L-SB-0035-15 Rev1 - Navigation System Firmware Update',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10132881-9999.pdf',
    localPath: 'C:/tmp/MC-10132881-9999.pdf',
    nhtsaDocumentId: '10132881',
    pages: 9,
    bytes: 590576,
    sha256: '14e915c0d39749c310ea5f4161d56062c957e5f9f488e0b21d7be1b940a99daa',
  },
  carPlay2019: {
    title: 'L-SB-0028-19 - Multimedia System Enhancements Phase 3 (Panasonic)',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10161514-9999.pdf',
    localPath: 'C:/tmp/MC-10161514-9999.pdf',
    nhtsaDocumentId: '10161514',
    pages: 5,
    bytes: 479055,
    sha256: '38b955cb7e7ce590e0a7199515d3990374e0d0ad4db2169b8be57db4733227f8',
  },
  navigation2020: {
    title: 'L-SB-0043-19 Rev2 - Navigation System Software Update (Panasonic)',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202451-9999.pdf',
    localPath: 'C:/tmp/MC-10202451-9999.pdf',
    nhtsaDocumentId: '10202451',
    pages: 7,
    bytes: 578739,
    sha256: 'd06b4fa035016ea563c3ecaf5c2e6bac84c888839c60839d47b79d6c7be49bed',
  },
});

const SECONDARY_SOURCES = Object.freeze({
  nx350hComparison: {
    title: 'NX 350 versus 350h owner comparison - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/nx-2nd-gen-2022-current/1014227-nx-350-versus-350h-which-one-main-question.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 2022 NX350h owner described consistent high engine speed and a perceived drone under stronger acceleration; the post is one owner report, not a defect or prevalence study.',
  },
  nx350hAcceleration: {
    title: 'NX350h acceleration-noise owner discussion - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/nx-2nd-gen-2022-current/1025727-noise-when-accelerating-from-eco-to-power-mode-o-need-advice.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'Owners of 2022 and 2025 NX350h vehicles described louder engine operation under heavier acceleration; replies generally characterized it as hybrid powertrain operation rather than a diagnosed transmission fault.',
  },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 282, '2020-2024': 403, '2025-2026': 76 },
  totalRows: 761,
  exactSourceDocumentIds: ['10132881', '10161514', '10202451'],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 398 },
  totalRows: 398,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { type: source.type, title: source.title, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.cvt) return [citation(PDF_SOURCES.nxBrochure), citation(SECONDARY_SOURCES.nx350hComparison), citation(SECONDARY_SOURCES.nx350hAcceleration)];
  if (id === IDS.infotainment) return [citation(PDF_SOURCES.navigation2015), citation(PDF_SOURCES.carPlay2019), citation(PDF_SOURCES.navigation2020)];
  throw new Error(`Unexpected NX record ${id}`);
}
function contentFor(id) {
  const content = {
    [IDS.cvt]: {
      description: 'The official 2022 Lexus NX brochure identifies two different transmissions within this frozen page\'s indexed fitment: the NX250 uses an electronically controlled eight-speed automatic, while the NX350h uses an electronically controlled continuously variable transmission (ECVT). Direct NX350h owner reports describe sustained higher engine speed or louder engine operation during stronger acceleration, and respondents generally characterize it as hybrid powertrain behavior rather than a diagnosed transmission fault. Current evidence does not support calling the NX250 an ECVT vehicle, a fleet-wide defect, or a Direct Shift CVT condition.',
      solution: 'First identify the powertrain: the NX250 has an eight-speed automatic, so CVT-specific advice does not apply to it. For an NX350h that becomes louder only under heavier acceleration without warning lamps, loss of power or a new vibration, compare the behavior with the owner-manual description and have a Lexus-capable technician evaluate it if it is new, worsening or accompanied by other symptoms. No verified source found here supports an ECU calibration, simulated shift-point update or Sport-mode cure for this identity. This is powertrain-specific operating-characteristic and diagnostic guidance; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Disclosed the frozen NX250/NX350h transmission mismatch, bounded the direct reports to NX350h acceleration noise and removed invented software, Sport-mode, prevalence and repair claims.',
    },
    [IDS.infotainment]: {
      description: 'Lexus bulletins document specific software conditions rather than a universal usability defect. L-SB-0035-15 Rev1 covers navigation-equipped 2015-2016 NX200t and NX300h vehicles below specified software versions and lists conditions including slow or frozen navigation, reboots, inoperative voice recognition and a nonworking HOME button. L-SB-0028-19 offers Apple CarPlay and Amazon Alexa to applicable 2018-2019 NX300 and NX300h Panasonic systems; it is an enhancement bulletin, not proof that every vehicle lagged. L-SB-0043-19 Rev2 covers specific 2020-2021 NX300 and NX300h Panasonic software versions and lists poor map-screen touch operation, touchpad-feedback, boot, reset, Bluetooth, CarPlay and Android Auto conditions.',
      solution: 'Record the exact symptom and current navigation and audio software versions, then have a Lexus-capable technician confirm the applicable bulletin and head-unit configuration before performing an update. The 2018-2019 CarPlay/Alexa enhancement applies only to listed Panasonic systems, and the bulletin warns that an incorrectly performed procedure may damage the head unit. Do not assume Android Auto was added to every first-generation NX or replace the touchpad or head unit without diagnosis. These are software-version- and equipment-specific dealer procedures; no universal retail part is asserted.',
      confidence: 'high',
      summary: 'Replaced subjective fleet-wide lag claims with three exact Lexus software boundaries and removed universal CarPlay, Android Auto, voice-command and usability assertions.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected NX record ${id}`);
  return content;
}
function commerceDecisionFor(id) {
  if (!BLOCKER_IDS.includes(id)) throw new Error(`Unexpected NX record ${id}`);
  return 'software-or-operating-characteristic-no-universal-retail-part';
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
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact NX communication rows plus ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.cvt]: [
      common,
      'Visual review of the official 2022 NX brochure confirms an eight-speed automatic for NX250 and an ECVT for NX350h, directly contradicting the frozen body copy that labels both as CVT vehicles.',
      'Two direct NX350h discussions support only bounded reports of louder or sustained-high-RPM acceleration behavior; they do not establish a transmission failure or prevalence count.',
      'No exact source supports the existing software-update, simulated-shift or Sport-mode prescriptions, and none of the 14 NX recall identities maps to this page.',
    ],
    [IDS.infotainment]: [
      common,
      'Visual review of L-SB-0035-15 Rev1 confirms exact 2015-2016 navigation software conditions and a software remedy for applicable NX200t/NX300h vehicles.',
      'Visual review of L-SB-0028-19 and L-SB-0043-19 Rev2 separates the 2018-2019 CarPlay/Alexa enhancement from specified 2020-2021 Panasonic touch, boot, reset and projection conditions.',
      'The bulletins do not substantiate universal poor usability, a 2020 Android Auto retrofit for every NX, or touchpad/head-unit replacement, and none of the 14 recall identities maps to this page.',
    ],
  }[row.id];
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'NX').sort((left, right) => left.id.localeCompare(right.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
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
    auditStage: 'model-primary-and-direct-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'NX',
    completionStatement: 'Both frozen NX pages retain their indexed identities while exact Lexus documents separate powertrains, software versions and documented conditions from unsupported prevalence and prescriptions.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'The transmission-fitment correction and infotainment rewrite require independent review before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'Both NX IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, allowed severities and publication states remain unchanged.',
      'The frozen CVT title is preserved for SEO, but the body must state that NX250 uses an eight-speed automatic and must not receive CVT-specific advice.',
      'Forum reports are bounded as individual observations and are not converted into prevalence, defect or owner-count claims.',
      'No software update, head unit, touchpad or transmission part is approved without exact equipment, software-version and diagnostic confirmation.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'nx-transmission-mismatch-disclosed', severity: 'critical-correction', recordIds: [IDS.cvt], detail: 'The indexed title stays intact, while the proposal explicitly distinguishes the NX250 eight-speed automatic from the NX350h ECVT.' },
      { code: 'nx-owner-reports-bounded', severity: 'accuracy-safety', recordIds: [IDS.cvt], detail: 'Two direct NX350h discussions are retained only as bounded acceleration-noise observations with no prevalence or defect inference.' },
      { code: 'nx-software-bulletins-bounded', severity: 'source-safety', recordIds: [IDS.infotainment], detail: 'Three Lexus bulletins are constrained to their exact model years, equipment, versions, conditions and procedures.' },
      { code: 'nx-unsupported-prescriptions-removed', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'No guessed software cure, operating-mode cure, retail part or search URL is proposed.' },
      { code: 'all-nx-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'Both IDs, titles, categories, indexed years, trims, engines, related issue links, severities and publication states remain preserved.' },
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

module.exports = {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  IDS,
  MODEL_ALIASES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SECONDARY_SOURCES,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
  publicPdfSources,
};
