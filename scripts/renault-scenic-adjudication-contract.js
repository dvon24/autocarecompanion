/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  injectorSeal: 'renault-scenic-injector-leak-diesel',
  parkingBrake: 'renault-scenic-parking-brake-failure',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze(allIds);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets', 'dvsaRecallCheck', 'renaultRecallCheck'],
    commerceDecision: commerceDecision || 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.injectorSeal]: held({
    description: 'The frozen page applies copper-washer leakage to Scenic II/III/IV diesels from 2003-2022, names K9K and M9R while its frozen engine metadata lists 1.5 dCi and 1.7 Blue dCi, and assigns 75 owner reports. The 1.7 Blue dCi is not the M9R identity stated in the prose, and a forum home page does not prove a twenty-year common failure, €2-5 price or inevitable cylinder-head damage.',
    solution: 'Identify the engine and injector system, clean and inspect the area, and distinguish combustion-gas blow-by at the seat from injector-body, return-line, high-pressure connection, rocker-cover and other leaks. Follow injector removal, seat inspection, seal selection, hold-down replacement and torque/angle procedures for the exact engine; high-pressure diesel work requires proper safety controls. Do not buy washers, injectors or seat-cutting tools from this page; leak path, engine code and VIN fitment must be established first.',
    symptoms: ['engine and injector system identified', 'combustion, fuel and oil leak paths separated', 'injector seat and hold-down condition inspected safely'],
    systems: ['diesel injector sealing', 'fuel return and high-pressure connections', 'cylinder head, cover and combustion sealing'],
    evidence: ['The complete NHTSA corpus contains zero Renault Scenic variants.', 'The frozen prose names M9R while metadata names 1.7 Blue dCi.', 'A forum home page does not support twenty years, the price or 75-owner total.'],
    conflict: 'The indexed identity spans three generations and mismatched engine families under unsupported social proof.',
    summary: 'Held the diesel injector-seal identity, surfaced the engine mismatch and reduced the unsupported 75-owner total to unknown.',
  }),
  [ids.parkingBrake]: held({
    description: 'The frozen page applies one electric-parking-brake failure identity to Scenic vehicles from 2003-2024 and claims motor-on-caliper seizure or module communication loss, unexpected application, release failure and 100 owner reports. Scenic generations use different parking-brake architectures, including actuator/cable arrangements rather than one universal motor-on-caliper design; a forum home page cannot support the twenty-two-year scope.',
    solution: 'If the brake will not hold or release, secure the vehicle against movement and do not drive with a binding or overheated brake. Identify the installed parking-brake architecture, preserve DTCs, and inspect battery voltage, fuses, switch, module/network, actuator or caliper motors, cables, rear calipers and manual-release status under Renault procedures. Do not buy a motor, actuator, module, cable or caliper from this page; architecture, failed path, coding and VIN fitment must be established first.',
    symptoms: ['vehicle secured before diagnosis', 'parking-brake architecture identified', 'power, network, actuator, cable and caliper paths separated'],
    systems: ['electric parking-brake control', 'central actuator/cables or caliper motors where fitted', 'rear calipers, vehicle power and network'],
    evidence: ['The complete NHTSA corpus contains zero Renault Scenic variants.', 'Scenic generations do not share one universal motor-on-caliper architecture.', 'The forum home page does not support the twenty-two-year scope or 100-owner total.'],
    conflict: 'The indexed identity merges incompatible parking-brake architectures and generations under unsupported social proof.',
    summary: 'Held the electric-parking-brake identity and reduced the unsupported 100-owner total to unknown while requiring architecture-specific safety diagnosis.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  dvsaRecallCheck: { title: 'DVSA Vehicle Safety Recall Checker', type: 'regulator', url: 'https://www.check-vehicle-recalls.service.gov.uk/', contains: 'Vehicle safety recalls' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Scenic', slug: 'scenic', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-scenic-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['SCENIC', 'GRAND SCENIC', 'SCENIC II', 'SCENIC III', 'SCENIC IV'],
  searchTerms: ['injector seal', 'copper washer', 'parking brake', 'actuator'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT SCENIC variants; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT SCENIC variants; owners must use DVSA and Renault recall checkers for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.injectorSeal, field: 'description', patterns: ['1.7 Blue dCi is not the M9R', '75 owner reports'] },
    { id: ids.parkingBrake, field: 'description', patterns: ['different parking-brake architectures', '100 owner reports'] },
  ],
  observations: [
    { code: 'both-pages-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both Scenic pages remain published but exceed exact primary evidence.' },
    { code: 'injector-engine-mismatch', severity: 'identity-safety', recordIds: [ids.injectorSeal], detail: 'M9R prose conflicts with frozen 1.7 Blue dCi metadata.' },
    { code: 'parking-brake-architectures-conflated', severity: 'technical-accuracy', recordIds: [ids.parkingBrake], detail: 'Central actuator/cable and motor-on-caliper paths are not treated as one system.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: allIds, detail: 'The unsupported 75 and 100 owner totals are reduced to unknown.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT SCENIC rows; the geographic limitation is explicit.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
