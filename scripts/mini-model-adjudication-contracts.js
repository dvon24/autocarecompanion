/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const cooperContract = require('./mini-cooper-adjudication-contract');
const cooperSContract = require('./mini-cooper-s-adjudication-contract');
const countrymanContract = require('./mini-countryman-adjudication-contract');
const coupeContract = require('./mini-coupe-adjudication-contract');
const gpContract = require('./mini-gp-adjudication-contract');
const hardtop4DoorContract = require('./mini-hardtop-4-door-adjudication-contract');
const johnCooperWorksContract = require('./mini-john-cooper-works-adjudication-contract');
const pacemanContract = require('./mini-paceman-adjudication-contract');

const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const REVIEW_DATE = '2026-08-09';

const convertibleIds = Object.freeze({
  drainClog: 'mini-convertible-drain-clog-2005',
  drainTubeClog: 'mini-convertible-drain-tube-clog-2005',
  topDrainClog: 'mini-convertible-top-drain-clog-2005',
  topHydraulic: 'mini-convertible-top-hydraulic-2005',
  topHydraulicLeak: 'mini-convertible-top-hydraulic-leak-2005',
});
const convertibleAllIds = Object.freeze(Object.values(convertibleIds).sort());
const convertibleRelevantIds = Object.freeze([
  '10030669', '10032765', '10034867', '10052614', '10055137', '10057710',
  '10136007', '10138416', '10145370', '10145371', '10146617', '10146618',
  '10146619', '10146666', '10146870', '10146871', '10146874', '10146926',
  '10146929', '10147801', '10148391', '10148439', '10148441', '10149272',
  '10149505', '10149553', '10150044', '10150086', '10150190', '10150198',
  '10150207', '10150396', '10151055', '10151056', '10151057', '10151152',
  '10151153', '10151154', '10151229', '10151230', '10152360', '10154763',
  '10161585', '10162441', '10166398', '10166399', '10172511', '10172512',
  '10190869', '10242535', '11028292',
]);
const convertibleCampaigns = Object.freeze([
  '07V533000', '09V143000', '12V008000', '15V205000', '15V887000',
  '16V747000', '17V222000', '18V248000', '20V283000', '25V616000',
]);
const convertiblePdfSources = Object.freeze({
  acCondensateDrain: {
    title: 'MINI SIM 64 01 16 - Water Ingress in Footwell Area from A/C Condensate Drain',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10172512-9999.pdf',
    sha256: '195e97608a1cfeade6af19745559c9790c357d232be0fdfb3c900622127d4af3',
    pageCount: 6,
    visuallyReviewedPages: [1],
  },
  topStow: {
    title: 'MINI SIM 54 03 17 - Convertible Top Will Not Completely Stow',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10172511-9999.pdf',
    sha256: 'e681a6b86402399749daf501642152bafdd47223eda09b0f827cd12d1d485303',
    pageCount: 5,
    visuallyReviewedPages: [1],
  },
});
const datasetsSource = Object.freeze({
  title: 'NHTSA Manufacturer Communications and Recall Datasets',
  type: 'nhtsa',
  url: NHTSA_DATASET_URL,
});

const drainDescription = 'The reviewed MINI manufacturer-communication corpus does not establish a model-wide convertible-top drain-tube clog identity across the frozen year range. The exact F57 drain bulletin addresses an A/C condensate hose blocked by a heat shield, detached from the housing or damaged during installation; that is not a folding-top drain, and other water bulletins identify separate hatch, seam and seal paths.';
const drainSolution = 'Water-test the vehicle in controlled sections and trace the highest wet point before opening trim. Identify the chassis generation and separate soft-top fabric channels and seals, body seams, hatch or luggage-area seals, cowl paths, door membranes and the A/C condensate drain. Do not force compressed air or wire through an unidentified tube because it can disconnect or puncture a drain. Do not buy a weatherstrip, adhesive, trim tool, body filler, drain tube or electronic module from this page; the exact leak path and VIN-specific component must be proven first.';
const drainSymptoms = ['chassis generation and exact water entry area recorded', 'controlled water test traces the highest wet point', 'soft-top, body-seam, hatch, cowl and A/C paths separated'];
const drainSystems = ['soft-top channels and seals', 'body, hatch, cowl and door water-management paths', 'A/C condensate drain and nearby electrical connectors'];
const hydraulicDescription = 'The reviewed MINI manufacturer-communication corpus does not establish recurring convertible-top hydraulic cylinder, line or pump leakage across the frozen year range. The exact F57 bulletin for a top that will not stow identifies a gripper hook, storage-spacer adjustment bolt or felt pad—not a hydraulic leak—so slow or interrupted operation cannot be assigned to rams, lines, fluid or pump without chassis-specific diagnosis.';
const hydraulicSolution = 'Record the chassis generation, production date, roof position and warning messages, then scan the roof-control system and test switches, latches, loading-aid position, mechanical binding and motor or pump operation in the manufacturer sequence. Inspect for an actual fluid trail and identify the installed actuation system before opening any circuit. Do not buy hydraulic rams 54347196123 or 54347196124, lines, a pump, CHF 11S fluid, a latch, handle, weatherstrip or complete top assembly from this page; system architecture, failed component, fluid specification and VIN fitment must be proven first.';
const hydraulicSymptoms = ['chassis generation, roof position and warning message recorded', 'switch, latch, loading-aid and mechanical paths tested', 'actual actuation system and fluid leak verified before parts selection'];
const hydraulicSystems = ['convertible-top control and position inputs', 'latches, gripper hook and storage adjustment', 'generation-specific motor, pump, lines or actuators'];

const convertibleContent = Object.freeze({
  [convertibleIds.drainClog]: {
    description: drainDescription,
    solution: drainSolution,
    symptoms: drainSymptoms,
    affectedSystems: drainSystems,
    evidence: ['SIM 64 01 16 identifies an A/C condensate drain condition on F57, not a convertible-top drain.', 'The reviewed corpus contains multiple distinct water paths rather than one top-drain mechanism.', 'The frozen 1,800-owner count, four-tube layout and annual compressed-air interval have no auditable primary source.'],
    conflict: 'The indexed identity asserts one top-drain mechanism across three generations, while exact primary evidence identifies other subsystem-specific water paths.',
    summary: 'Held the broad top-drain identity, removed invented social proof and required leak-path proof before service or parts.',
    citations: ['acCondensateDrain', 'datasets'],
  },
  [convertibleIds.drainTubeClog]: {
    description: drainDescription,
    solution: drainSolution,
    symptoms: drainSymptoms,
    affectedSystems: drainSystems,
    evidence: ['SIM 64 01 16 applies to the F57 A/C condensate drain and does not establish four soft-top drains.', 'The frozen page duplicates two other indexed drain identities with overlapping years.', 'No reviewed primary source supports six-month wire or compressed-air cleaning, silicone treatment or the stated module location.'],
    conflict: 'This is one of three overlapping top-drain identities, and its four-tube mechanism and 2005-2025 scope are not established by exact evidence.',
    summary: 'Held the duplicate top-drain identity and removed unsupported maintenance, damage-cost and commerce claims.',
    citations: ['acCondensateDrain', 'datasets'],
  },
  [convertibleIds.topDrainClog]: {
    description: drainDescription,
    solution: drainSolution,
    symptoms: drainSymptoms,
    affectedSystems: drainSystems,
    evidence: ['SIM 64 01 16 distinguishes a specific A/C condensate drain condition from the frozen top-drain claim.', 'The frozen page duplicates two other indexed drain identities.', 'No exact primary source establishes the frozen 2005-2015 top-drain frequency or mechanism.'],
    conflict: 'This duplicate indexed identity is broader than exact water-path evidence and cannot be merged or redirected without approved identity policy.',
    summary: 'Held the duplicate top-drain identity and supplied controlled leak-path diagnosis without changing its URL.',
    citations: ['acCondensateDrain', 'datasets'],
  },
  [convertibleIds.topHydraulic]: {
    description: hydraulicDescription,
    solution: hydraulicSolution,
    symptoms: hydraulicSymptoms,
    affectedSystems: hydraulicSystems,
    evidence: ['SIM 54 03 17 attributes one F57 stow failure to a gripper hook, adjustment bolt or felt pad.', 'No matching manufacturer communication in the reviewed corpus establishes cylinder, line or pump leakage across 2005-2015.', 'The frozen 900-owner count, CHF 11S instruction and ram part numbers have no auditable owner, fluid or fitment source.'],
    conflict: 'The indexed hydraulic-system-failure identity and component list exceed the exact chassis-specific evidence.',
    summary: 'Held the hydraulic-failure identity, removed invented social proof and blocked unverified fluid and ram advice.',
    citations: ['topStow', 'datasets'],
  },
  [convertibleIds.topHydraulicLeak]: {
    description: hydraulicDescription,
    solution: hydraulicSolution,
    symptoms: hydraulicSymptoms,
    affectedSystems: hydraulicSystems,
    evidence: ['SIM 54 03 17 establishes a non-hydraulic F57 stow condition and a measured hook/adjustment path.', 'The frozen page duplicates the other indexed hydraulic identity while extending it through 2025.', 'No reviewed primary source establishes cold-weather seal cracking, over-pressure from a microswitch or CHF 11S for every frozen generation.'],
    conflict: 'This duplicate hydraulic identity spans multiple roof architectures without exact evidence for the stated cylinders, lines, fluid or failure mechanism.',
    summary: 'Held the duplicate hydraulic-leak identity and required architecture-specific roof diagnosis before any fluid or part.',
    citations: ['topStow', 'datasets'],
  },
});

const CONTRACTS = Object.freeze({
  Convertible: Object.freeze({
    make: 'MINI',
    model: 'Convertible',
    slug: 'convertible',
    reviewDate: REVIEW_DATE,
    snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
    outputFile: 'data/known-issue-mini-convertible-adjudication-2026-08-09.json',
    ids: convertibleIds,
    allIds: convertibleAllIds,
    retainedIds: [],
    reportCountCleanupIds: [convertibleIds.drainClog, convertibleIds.topHydraulic].sort(),
    modelAliases: ['CONVERTIBLE', 'COOPER CONVERTIBLE', 'COOPER S CONVERTIBLE', 'JCW CONVERTIBLE', 'R52 CONVERTIBLE', 'R57 CONVERTIBLE', 'F57 CONVERTIBLE'],
    searchTerms: ['convertible top', 'soft top', 'drain', 'water leak', 'water intrusion', 'hydraulic', 'cylinder', 'line leak', 'top operation', 'roof'],
    relevantDocumentIds: convertibleRelevantIds,
    campaigns: convertibleCampaigns,
    pdfSources: convertiblePdfSources,
    otherSources: { datasets: datasetsSource },
    bulletinInventory: {
      source: NHTSA_DATASET_URL,
      periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 6, '2010-2014': 52, '2015-2019': 529, '2020-2024': 82, '2025-2026': 34 },
      totalRows: 703,
      relevantRowCount: 69,
      uniqueRelevantCommunications: convertibleRelevantIds.length,
      sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    },
    recallInventory: {
      source: NHTSA_DATASET_URL,
      periodCounts: { pre: 3, post: 29 },
      totalRows: 32,
      campaignCount: convertibleCampaigns.length,
      sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
      scopeFinding: 'Ten federal campaigns exist in the Convertible alias set, but none establishes one of the frozen top-drain or hydraulic identities.',
    },
    content: convertibleContent,
    requiredProse: [
      { id: convertibleIds.drainClog, field: 'description', patterns: ['does not establish a model-wide convertible-top drain-tube clog', 'A/C condensate hose'] },
      { id: convertibleIds.topHydraulic, field: 'description', patterns: ['does not establish recurring convertible-top hydraulic', 'gripper hook'] },
      { id: convertibleIds.topHydraulicLeak, field: 'solution', patterns: ['Do not buy hydraulic rams', 'system architecture'] },
    ],
    observations: [
      { code: 'duplicate-drain-identities-held', severity: 'identity-hold', recordIds: [convertibleIds.drainClog, convertibleIds.drainTubeClog, convertibleIds.topDrainClog], detail: 'Three overlapping drain pages remain indexed and unmerged pending identity policy.' },
      { code: 'duplicate-hydraulic-identities-held', severity: 'identity-hold', recordIds: [convertibleIds.topHydraulic, convertibleIds.topHydraulicLeak], detail: 'Two overlapping hydraulic pages remain indexed and unmerged pending identity policy.' },
      { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [convertibleIds.drainClog, convertibleIds.topHydraulic], detail: 'The 1,800 and 900 owner totals have no auditable source and are proposed as unknown zero.' },
      { code: 'all-convertible-pages-preserved', severity: 'seo-safety', recordIds: convertibleAllIds, detail: 'No Convertible page is removed, merged, redirected or allowed to lose its indexed identity.' },
    ],
  }),
  Cooper: cooperContract,
  'Cooper S': cooperSContract,
  Countryman: countrymanContract,
  Coupe: coupeContract,
  GP: gpContract,
  'Hardtop 4 Door': hardtop4DoorContract,
  'John Cooper Works': johnCooperWorksContract,
  Paceman: pacemanContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unknown MINI model contract: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, NHTSA_DATASET_URL, REVIEW_DATE, getContract };
