/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  ac: 'renault-kwid-air-conditioning-failure-refrigerant-hose-leak-early-compres',
  brakeJudder: 'renault-kwid-brake-judder-fade-from-undersized-solid-front-discs',
  clutch: 'renault-kwid-heavy-squeaky-clutch-reverse-gear-grinding',
  launchRecall: 'renault-kwid-launch-era-recall-brake-component-cracks-fuel-line-perforati',
  rearAxleRecall: 'renault-kwid-rear-axle-support-cracking-2025-safety-recall',
  steeringBracket: 'renault-kwid-steering-column-support-bracket-breakage',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.rearAxleRecall]);
const reportCountCleanupIds = Object.freeze([]);

function row({ description, solution, symptoms, systems, evidence, conflict, summary, citations, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: citations || ['datasets', 'renaultBrazilRecall', 'renaultRecallCheck'],
    commerceDecision: commerceDecision || 'failure path, component, market and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.ac]: row({
    description: 'Brazilian complaint and repair pages describe individual Kwid air-conditioning cases, but the frozen 2017-2023 page combines a low-routed hose pinhole, an alleged 2018 concentration, repeated recharge misdiagnosis, early compressor failure, high-RPM cooling and vibration into one recurring defect. No exact Renault campaign or technical record reviewed here establishes that population, common mechanism, warranty outcome or prevalence.',
    solution: 'Have a qualified refrigerant technician identify the system and charge specification, recover refrigerant safely, leak-test the complete circuit, and compare static/running pressures, compressor command and airflow before replacement. A recharge without finding the leak is not a repair. Do not buy a hose, compressor, condenser or refrigerant from this page; leak location, failed path, market specification and VIN fitment must be established first.',
    symptoms: ['refrigerant circuit leak-tested', 'system pressures and compressor command recorded', 'airflow and cooling performance separated from refrigerant loss'],
    systems: ['air-conditioning refrigerant circuit', 'compressor and control', 'condenser, evaporator, hoses and cabin airflow'],
    evidence: ['The complete NHTSA corpus contains zero Renault Kwid rows.', 'Complaint sites and repair articles do not establish a seven-year defect population.', 'The 2018 concentration, 20,000 km example and warranty assertions are not exact Renault evidence.'],
    conflict: 'The indexed identity merges hose leakage and compressor faults and treats complaint clusters as a recurring manufacturer defect.',
    summary: 'Held the combined A/C identity and replaced repeat-recharge and parts-first advice with refrigerant-safe leak and pressure diagnosis.',
  }),
  [ids.brakeJudder]: row({
    description: 'Secondary technical and product pages describe a change from 215 mm solid to 238 mm ventilated front discs, but the frozen 2017-2020 page attributes brake fade, disc warping, severe judder and metallic noise to undersized original discs and implies the production change proves a defect. It also discusses non-interchangeable and conversion parts without an exact Renault campaign or engineering record defining an affected population.',
    solution: 'Treat reduced braking, pulling, overheating or grinding as safety-critical. Measure disc thickness and lateral runout, hub runout, pad condition, caliper movement, wheel-bearing play and brake-fluid condition on both sides; identify the original brake package by VIN before replacing axle-paired components. Do not buy solid discs, ventilated discs, conversion kits or pads from this page; brake package, fault, dimensions and VIN fitment must be established first.',
    symptoms: ['disc and hub runout measured', 'pad, caliper, bearing and fluid condition inspected', 'original brake package verified by VIN'],
    systems: ['front brake discs and pads', 'calipers, hubs and wheel bearings', 'brake fluid and thermal performance'],
    evidence: ['The complete NHTSA corpus contains zero Renault Kwid rows.', 'A later brake-package change does not prove every earlier disc was defective.', 'Secondary and product pages do not establish the frozen fade/warping population or conversion safety.'],
    conflict: 'The indexed identity turns a brake-package change into a four-year defect and invites cross-package parts selection.',
    summary: 'Held the brake-disc identity and replaced undersizing/warping certainty with measured brake and hub diagnosis plus VIN fitment.',
  }),
  [ids.clutch]: row({
    description: 'Brazilian press, complaint and repair pages describe heavy pedals, squeaks and reverse engagement cases, but the frozen 2017-2024 page labels the condition chronic across all years and combines cable binding, release-fork deformation, pressure-plate weakness and complete gearbox failure. Reports under 5,000 km, a dealership quote and parts-first clutch-kit claims do not establish one manufacturer-defined identity.',
    solution: 'Verify pedal free play and travel, cable routing and friction, release-fork movement, clutch release and gearbox oil specification, then distinguish normal unsynchronized reverse behavior from incomplete clutch disengagement or internal gearbox damage. Follow the owner-manual engagement procedure while stationary. Do not buy a cable, clutch kit, fork or gearbox from this page; failed path, gearbox identity and VIN fitment must be established first.',
    symptoms: ['pedal travel and cable friction measured', 'clutch release verified before gearbox diagnosis', 'reverse engagement tested stationary under owner-manual procedure'],
    systems: ['clutch cable and pedal', 'release fork, bearing, disc and pressure plate', 'manual gearbox engagement'],
    evidence: ['The complete NHTSA corpus contains zero Renault Kwid rows.', 'Complaint and repair pages do not prove an all-year chronic defect.', 'The frozen cable, fork, pressure-plate and gearbox mechanisms are distinct paths.'],
    conflict: 'The indexed identity merges pedal noise, incomplete release and gearbox failure across eight years.',
    summary: 'Held the broad clutch/reverse identity and replaced universal kit replacement with measured release-system diagnosis.',
  }),
  [ids.launchRecall]: row({
    description: 'Renault Brazil’s official page confirms separate brake-system and fuel-tube recalls for Kwids manufactured in 2016-2017, with chassis ranges and no-cost inspection/replacement. The frozen page indexes 2017-2018 and combines both recalls in one title while adding a 21,802-vehicle count, routing/chafe mechanism and a separate engine-cradle campaign. The primary page does not establish the frozen 2018 scope or all of those added details.',
    solution: 'Treat reduced braking, wheel lock, fuel odor or visible leakage as stop-driving conditions and arrange recovery. Check the chassis directly on Renault Brazil’s recall page or with a Renault dealer and have every applicable brake, fuel-tube and cradle campaign recorded as completed. Do not buy brake parts, a fuel tube or cradle components from this page; campaign, chassis eligibility and Renault’s prescribed remedy must be confirmed first.',
    symptoms: ['Renault Brazil chassis recall status checked', 'brake and fuel-leak warnings treated as stop-driving conditions', 'each applicable campaign completion documented separately'],
    systems: ['brake system recall', 'fuel supply tube recall', 'engine-cradle campaign eligibility'],
    evidence: ['Renault Brazil confirms the brake recall for 2016-2017 manufacture and chassis HJ524902-JJ999218.', 'Renault Brazil confirms the fuel-tube recall for 2016-2017 manufacture and the same listed chassis range.', 'The official page does not verify the frozen 2018 indexed scope or 21,802 total.'],
    conflict: 'The indexed identity combines separate campaigns and an unsupported 2018 scope and population count.',
    summary: 'Held the combined launch-recall identity while preserving exact Renault Brazil chassis verification and stop-driving guidance.',
  }),
  [ids.rearAxleRecall]: row({
    description: 'Renault Brazil states that Kwids manufactured from 5 May 2021 through 12 June 2023, within the listed non-sequential chassis range J000006-J986154, may experience rear-axle-support impact under specific conditions that can generate cracks and alter original handling characteristics. In extreme cases Renault identifies increased accident and injury or property-damage risk. Service began 5 June 2025.',
    solution: 'Check the chassis directly with Renault Brazil and schedule the no-cost campaign. Renault specifies inspection and replacement of components when necessary, with an estimated service time from 30 minutes to eight hours. If handling changes, rear noise or visible damage occurs before inspection, stop driving and arrange qualified assessment. Do not buy an axle support or related suspension parts from this page; chassis eligibility and Renault’s VIN-specific campaign action must be confirmed first.',
    symptoms: ['Renault Brazil chassis campaign status checked', 'handling change or rear-structure noise treated as urgent', 'inspection and campaign completion documented'],
    systems: ['rear axle support', 'rear suspension mounting structure', 'vehicle handling and recall eligibility'],
    evidence: ['Renault Brazil identifies model Kwid and manufacture dates 05/05/2021-12/06/2023.', 'Renault Brazil lists chassis J000006-J986154 as non-sequential and service from 05/06/2025.', 'Renault Brazil specifies cracks, handling change, accident risk, no-cost inspection and replacement when necessary.'],
    conflict: null,
    summary: 'Retained the rear-axle-support recall identity with exact Renault Brazil dates, chassis boundary, risk and no-cost remedy.',
    citations: ['datasets', 'renaultBrazilRecall'],
    commerceDecision: 'This is a VIN/chassis-specific Renault safety campaign with no universal retail part; do not self-source the axle support',
  }),
  [ids.steeringBracket]: row({
    description: 'Brazilian news, roundup and complaint pages describe early Kwid steering-column-support cases, including severe wheel-drop allegations, but the frozen 2017-2019 page calls the condition one of the most serious and widely reported chronic defects, asserts a concentration through 2019, no Renault recall, R$3,000-R$5,800 pricing and goodwill behavior. No exact manufacturer or regulator record reviewed here establishes that population or common weld/bracket mechanism.',
    solution: 'Treat looseness, clunking, column movement or any change in steering control as a stop-driving condition and arrange recovery. Have the column mount, bracket/weld area, fasteners, EPS assembly and surrounding structure inspected before deciding the repair, and document the condition for Renault Brazil. Do not buy a support, steering column or EPS assembly from this page; failed structure, repair method, coding and VIN fitment must be established first.',
    symptoms: ['column movement checked without driving', 'bracket, weld, fasteners and EPS assembly inspected separately', 'condition documented for Renault before repair'],
    systems: ['steering-column support structure', 'electric power-steering column', 'mounting fasteners and instrument-panel structure'],
    evidence: ['The complete NHTSA corpus contains zero Renault Kwid rows.', 'News and complaint pages do not establish a 2017-2019 manufacturer-defined population.', 'The frozen superlative, price range, no-recall and goodwill claims are not exact primary evidence.'],
    conflict: 'The indexed identity converts severe individual allegations into a three-year chronic structural defect and policy claim.',
    summary: 'Held the steering-support identity and preserved stop-driving guidance while removing prevalence, pricing and goodwill certainty.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultBrazilRecall: { title: 'Renault Brazil Official Kwid Recall Campaigns', type: 'manufacturer', url: 'https://www.renault.com.br/recall/recall-kwid.html', contains: 'Suporte do eixo traseiro' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Kwid', slug: 'kwid', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-kwid-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['KWID'],
  searchTerms: ['air conditioning', 'brake', 'clutch', 'fuel tube', 'rear axle support', 'steering column'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT KWID rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT KWID rows; Renault Brazil is the exact manufacturer source for Brazilian Kwid campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.rearAxleRecall, field: 'description', patterns: ['5 May 2021 through 12 June 2023', 'J000006-J986154', 'Service began 5 June 2025'] },
    { id: ids.launchRecall, field: 'description', patterns: ['manufactured in 2016-2017', 'does not establish the frozen 2018 scope'] },
    { id: ids.brakeJudder, field: 'solution', patterns: ['Measure disc thickness and lateral runout', 'Do not buy solid discs'] },
    { id: ids.steeringBracket, field: 'solution', patterns: ['stop-driving condition', 'Do not buy a support'] },
  ],
  observations: [
    { code: 'exact-kwid-coverage', severity: 'identity-safety', recordIds: allIds, detail: 'All six Kwid pages remain published with frozen indexed identity.' },
    { code: 'rear-axle-recall-primary-supported', severity: 'source-integrity', recordIds: retainedIds, detail: 'Renault Brazil exactly supports the 2021-2023 rear-axle-support campaign identity and 2025 service start.' },
    { code: 'launch-recall-year-scope-held', severity: 'identity-safety', recordIds: [ids.launchRecall], detail: 'Official 2016-2017 manufacture data does not prove the frozen 2018 indexed year or combined population count.' },
    { code: 'brake-conversion-commerce-blocked', severity: 'safety-accuracy', recordIds: [ids.brakeJudder], detail: 'No solid-to-ventilated conversion or cross-package parts advice is authorized.' },
    { code: 'steering-stop-drive-boundary', severity: 'safety-accuracy', recordIds: [ids.steeringBracket], detail: 'Column movement is treated as a stop-driving condition without asserting a model-wide mechanism.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT KWID rows; the geographic limitation is explicit and Renault Brazil is used for exact campaigns.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
