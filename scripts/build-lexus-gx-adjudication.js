/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-gx-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const IDS = Object.freeze({
  kdss: 'lexus-gx-ahc-suspension-leak-2010',
  centerDifferential: 'lexus-gx-center-diff-actuator-2003',
  secondaryAir: 'lexus-gx-secondary-air-pump-2003',
});
const MODEL_ALIASES = Object.freeze(['GX', 'GX 460', 'GX460', 'GX 470', 'GX470', 'GX 550', 'GX550']);
const CAMPAIGNS = Object.freeze(['03V031000','03V088000','09V234000','10V159000','16V065000','16V340000','16V937000','17V006000','17V831000','18V024000','19V005000','19V741000','20V012000','20V682000','25V744000','25V767000','26V179000','26V341000']);
const PDF_SOURCES = Object.freeze({
  kdssLean: {
    title: 'L-SB-0015-21 Rev1 — Vehicle Equipped With KDSS Leans to the Right',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10220210-9999.pdf',
    localPath: 'C:/tmp/MC-10220210-9999.pdf',
    nhtsaDocumentId: '10220210',
    pages: 3,
    bytes: 329544,
    sha256: '49bc62e92d2b8c33f5319d99415d52cbd852be1418d2b269da75107843d6c1ca',
  },
  secondaryAirProgram: {
    title: 'POL17-01 — Warranty Enhancement Program ZLH',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10143917-9999.pdf',
    localPath: 'C:/tmp/MC-10143917-9999.pdf',
    nhtsaDocumentId: '10143917',
    pages: 3,
    bytes: 43316,
    sha256: '396730366c2bfd22a2b1dc5d8d17d3a97e090189aab25dd0b61b2e9b488c2593',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 41, '2005-2009': 47, '2010-2014': 25, '2015-2019': 495, '2020-2024': 324, '2025-2026': 63 },
  totalRows: 995,
  exactKdssDocumentIds: ['10109568','10150000','10174926','10201347','10220210'],
  exactCenterDifferentialDocumentIds: [],
  exactGx470SecondaryAirDocumentIds: [],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 3, post: 197 },
  totalRows: 200,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

function citationsFor(id) {
  if (id === IDS.kdss) return [
    { type: 'tsb', title: PDF_SOURCES.kdssLean.title, url: PDF_SOURCES.kdssLean.url },
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
  ];
  if (id === IDS.secondaryAir) return [
    { type: 'program', title: PDF_SOURCES.secondaryAirProgram.title, url: PDF_SOURCES.secondaryAirProgram.url },
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
  ];
  return [{ type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }];
}

function contentFor(id) {
  if (id === IDS.kdss) return {
    description: 'The page title identifies Adaptive Height Control (AHC), while its body describes the separate Kinetic Dynamic Suspension System (KDSS). Lexus L-SB-0015-21 Rev1 applies to 2010-2023 KDSS-equipped GX 460 vehicles that lean more than 20 mm from left to right and specifies a front-left coil-spring repair. It does not establish recurring KDSS actuator or hydraulic-line leaks, C1435/C1436, front-actuator prevalence, pump damage, or an inoperative-system/body-roll pattern.',
    solution: 'Do not refill or bleed KDSS, replace hydraulic actuators or lines, disconnect KDSS, or install conventional sway bars from this page. Measure any left-to-right lean on level ground and have a qualified Lexus technician identify the installed suspension system and follow current VIN-specific service information. L-SB-0015-21 must not be generalized from its lean condition to a hydraulic leak. This is a VIN-specific dealer/service remedy; no universal retail part is asserted.',
    summary: 'Documented the AHC/KDSS identity conflict, bounded the only exact Lexus bulletin to a right-side lean and front-left coil-spring repair, and removed unsupported leak, DTC, pump-damage, actuator and system-delete advice.',
  };
  if (id === IDS.centerDifferential) return {
    description: 'The complete federal communication inventory for GX 470 contains no exact record establishing a recurring center-differential lock actuator motor/contact failure, moisture or debris mechanism, flashing-indicator pattern, or monthly exercise remedy for the frozen 2003-2009 scope. The current page relies only on an unlinked owner-forum citation and supplies no verifiable OEM document or part identity.',
    solution: 'Do not order an actuator or attempt under-vehicle replacement from this page. Record the warning indicators and whether high/low range or the differential lock actually engages, then have the transfer case and four-wheel-drive controls diagnosed under the exact model-year Lexus procedure before any part is replaced. Do not exercise the lock on a schedule as a corrosion-prevention treatment without model-specific Lexus guidance. This is a VIN-specific diagnostic/service remedy; no universal retail part is asserted.',
    summary: 'Removed the unsupported actuator mechanism, replacement and monthly-exercise advice; held the indexed identity because the complete GX 470 federal inventory contains no exact primary source.',
  };
  if (id === IDS.secondaryAir) return {
    description: 'Lexus Warranty Enhancement Program ZLH documents moisture or water in air-injection pumps and/or air-switching valves on certain 2010-2013 GX 460 vehicles. It does not apply to the frozen 2003-2009 GX 470 scope. The complete GX 470 communication inventory contains no exact source establishing this page’s moisture/corrosion mechanism, P2440/P2441/P2442 set, mileage range, failure rate, or replace-every-component recommendation.',
    solution: 'Do not bypass or disable the emissions system with a tune, and do not order a pump, switching valves or check valves from this page. Record all diagnostic codes and cold-start symptoms, verify the exact model-year emissions configuration, and diagnose it under current Lexus service information before replacing parts. Program ZLH must not be used to promise coverage for a GX 470. This is a VIN-specific dealer/emissions-service remedy; no universal retail part is asserted.',
    summary: 'Removed the wrong-generation ZLH implication, unsupported DTC/mileage/parts claims and emissions-bypass advice; held the GX 470 identity for exact primary evidence.',
  };
  throw new Error(`Unexpected GX record ${id}`);
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = 'low';
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
  proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact GX-family manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.kdss]: [common, 'Visual review of L-SB-0015-21 Rev1 shows a 2010-2023 GX 460 right-side lean condition and a front-left coil-spring repair, not an AHC/KDSS hydraulic leak.', 'No exact communication supports actuator/line leakage, C1435/C1436, front-actuator prevalence, pump damage, bleeding or KDSS removal across the frozen scope.'],
    [IDS.centerDifferential]: [common, 'No exact GX 470 communication matches center differential, differential-lock actuator, transfer-case actuator or the claimed failure mechanism.', 'The sole citation is an unlinked owner-forum label and cannot establish replacement, exposure or monthly-exercise advice.'],
    [IDS.secondaryAir]: [common, 'Visual review of Program ZLH limits its air-pump/air-switching-valve moisture condition to certain 2010-2013 GX 460 vehicles.', 'No exact GX 470 communication supports the frozen 2003-2009 identity, and the proposed copy explicitly removes the emissions-bypass instruction.'],
  }[row.id];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'GX').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'remove_false_citation_and_targeted_safety_cleanup_pending_source',
      commerceDecision: 'blocked-no-exact-fitment-no-retail-part',
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
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'GX',
    completionStatement: 'All three frozen GX pages retain their indexed identities, but each receives a corrective hold because exact Lexus evidence conflicts with or does not establish the current system, model-year or repair claims.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'One page conflates AHC and KDSS, one lacks exact primary evidence, and one imports a GX 460 program into a GX 470 identity. Independent review is required before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All three IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.',
      'An official bulletin for a right-side lean cannot establish a hydraulic leak, and an official GX 460 program cannot establish the same identity on GX 470.',
      'No hydraulic-system opening, transfer-case actuator replacement, emissions bypass or retail part is approved without exact VIN/application support.',
      'All 995 exact manufacturer-communication rows and 200 exact recall rows / 18 campaigns were replayed; separate recall identities remain deferred.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'gx-ahc-kdss-identity-conflict', severity: 'critical-correction', recordIds: [IDS.kdss], detail: 'The title says AHC, the body says KDSS, and the exact Lexus bulletin supports only a right-side lean corrected with a front-left coil spring.' },
      { code: 'gx-center-differential-source-gap', severity: 'critical-correction', recordIds: [IDS.centerDifferential], detail: 'The complete GX 470 federal inventory contains no exact actuator-failure record; the unlinked forum label cannot support the repair advice.' },
      { code: 'gx-secondary-air-generation-conflict', severity: 'critical-correction', recordIds: [IDS.secondaryAir], detail: 'Program ZLH applies to certain 2010-2013 GX 460 vehicles, not the frozen 2003-2009 GX 470 page.' },
      { code: 'gx-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'No guessed actuator, pump, valve, sway-bar or search-style commerce link is introduced; every proposal carries an explicit VIN-specific service/no-retail marker.' },
      { code: 'gx-eighteen-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Eighteen separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-gx-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every GX ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remains preserved.' },
    ],
    pdfSources: Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: [],
    deferredCampaigns: CAMPAIGNS,
    summary: { remove_false_citation_and_targeted_safety_cleanup_pending_source: 3, total: 3 },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor };
