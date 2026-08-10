/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  valveCover: 'renault-sandero-1-0-sce-valve-cover-oil-leak-soaking-spark-plug-wells-coils',
  headGasket: 'renault-sandero-1-6-8v-k7m-head-gasket-failure-excessive-oil-consumption',
  easyR: 'renault-sandero-easy-r-automated-manual-gearbox-clutch-actuator-failures',
  steeringRecalls: 'renault-sandero-official-steering-safety-recalls-ball-joints-steering-box-hy',
  columnBearing: 'renault-sandero-steering-column-bearing-wear-causing-play-knocking-steering',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.steeringRecalls]);
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
  [ids.valveCover]: row({
    description: 'Brazilian complaint and advice pages describe individual 1.0 SCe oil leaks, but the frozen 2017-2023 page labels valve-cover sealing a chronic design defect, asserts 20,000-30,000 km onset, plug-well/coil damage, recurrence and a secondary timing-cover leak. It also folds in a separate Renault oil-feed-orifice recall for 2019-2020 manufacture, which does not prove the valve-cover identity.',
    solution: 'Document oil level and leakage, clean the engine safely, and trace valve-cover, timing-cover, crankcase-ventilation and other sealing paths before disturbing ignition parts. Inspect plug wells, plugs and coils only for measured contamination or misfire damage. Separately check the chassis/engine number on Renault Brazil’s recall page for the oil-feed-orifice campaign. Do not buy a cover, gasket, sealant, plugs or coils from this page; leak source, engine code, recall status and VIN fitment must be established first.',
    symptoms: ['oil leak path traced after cleaning', 'plug-well contamination and misfire measured', 'oil-feed recall status checked separately by chassis/engine'],
    systems: ['valve cover and engine sealing', 'spark plugs and ignition coils', 'engine lubrication recall eligibility'],
    evidence: ['The complete NHTSA corpus contains zero Renault/Dacia Sandero rows.', 'Complaint pages do not establish a seven-year valve-cover defect population.', 'Renault Brazil’s oil-feed-orifice recall is a separate bounded identity and does not prove valve-cover leakage.'],
    conflict: 'The indexed identity merges complaint-derived valve-cover leakage with a separate engine-oil-feed safety campaign.',
    summary: 'Held the SCe valve-cover identity and separated leak diagnosis from Renault’s exact oil-feed-orifice recall.',
  }),
  [ids.headGasket]: row({
    description: 'The frozen page applies head-gasket failure and excessive oil consumption to K7M 1.6 8V Sanderos from 2008-2019, asserting abnormal consumption, combustion-chamber oil entry, external joint leakage and a chronic/disposable-engine pattern. Repair and complaint roundups do not establish one twelve-year manufacturer-defined defect, and smoke or oil loss can arise from leaks, ventilation, rings, valve seals or cooling-related head sealing.',
    solution: 'Measure oil use against distance, inspect external leakage and crankcase ventilation, and use cooling-system pressure, combustion-gas, compression and leak-down testing to separate head-gasket, ring and valve-seal paths. Stop for low oil pressure or overheating. Use only the engine-specific oil specification rather than choosing a thicker grade to mask consumption. Do not buy a gasket set, cylinder head, rings or valve seals from this page; failed path, engine condition and VIN fitment must be established first.',
    symptoms: ['measured oil-consumption log', 'external, ventilation, ring and valve-seal paths separated', 'cooling and combustion leakage tested'],
    systems: ['cylinder-head sealing', 'pistons, rings and valve seals', 'lubrication, crankcase ventilation and cooling'],
    evidence: ['The complete NHTSA corpus contains zero Renault/Dacia Sandero rows.', 'Complaint and repair roundups do not prove a twelve-year K7M defect population.', 'The frozen head-gasket cause, 0.5 L threshold and viscosity advice lack exact Renault evidence.'],
    conflict: 'The indexed identity merges several oil-loss mechanisms and a head-gasket claim into one long-window defect.',
    summary: 'Held the K7M head-gasket/oil-consumption identity and removed threshold, viscosity and chronic-disposal certainty.',
  }),
  [ids.easyR]: row({
    description: 'Complaint, press and trade pages describe Easy-R symptoms and architecture, but the frozen 2015-2019 page labels the ZF-supplied unit one of Renault’s most complained-about components and combines clutch wear, actuator failure, harsh shifts, unintended reverse, highway downshifts, discontinuation, no-recall and R$ price claims. Individual reports do not establish one population, onset or universal repair path.',
    solution: 'Identify the Easy-R transmission and calibration, preserve DTCs and adaptation data, measure clutch release/engagement and actuator travel, and inspect battery voltage, clutch hardware, shift mechanism and gearbox condition before recalibration or replacement. After verified component work, perform only the Renault-specified teach-in procedure. Do not buy a clutch kit, actuator or gearbox from this page; failed path, calibration and VIN fitment must be established first.',
    symptoms: ['transmission identity and calibration recorded', 'faults, actuator travel and clutch values preserved', 'clutch, actuator, power and internal gearbox paths separated'],
    systems: ['Easy-R clutch and manual gearbox', 'clutch and shift actuators', 'transmission control and power supply'],
    evidence: ['The complete NHTSA corpus contains zero Renault/Dacia Sandero rows.', 'Complaint and press sources do not establish a five-year defect population.', 'The frozen onset, dangerous-behavior, price, no-recall and shortened-life claims lack exact Renault evidence.'],
    conflict: 'The indexed identity combines multiple mechanical/electronic paths and extreme anecdotes under one prevalence claim.',
    summary: 'Held the Easy-R identity and removed prevalence, price and dangerous-behavior certainty while preserving transmission-specific diagnosis.',
  }),
  [ids.steeringRecalls]: row({
    description: 'Renault Brazil lists several Sandero steering-related safety campaigns. A 2012 hydraulic steering-box lot could malfunction or, in extreme cases, lock; Renault specified inspection and replacement when necessary. Axial joints on vehicles manufactured 4 November-4 December 2015 could break because of nonconforming raw material, causing loss of control; service began 22 January 2016. A low-pressure hydraulic-steering hose on vehicles manufactured 29 July-24 August 2016 could rupture, leak fluid and harden or remove assistance; service began 21 November 2017. Renault also lists a 2016 fastener-torque campaign affecting rear-axle and front-cradle bolts that could alter handling.',
    solution: 'Check the chassis directly on Renault Brazil’s recall page and have every applicable campaign completed at no cost. Renault specifies steering-box inspection/replacement, steering-box inspection with axial-joint replacement when necessary, low-pressure-hose inspection/replacement, and fastener inspection/replacement according to the matching chassis campaign. Treat sudden stiffness, fluid loss, play or steering-control change as urgent. Do not buy a steering box, axial joint, hose or fasteners from this page; chassis eligibility and Renault’s campaign action must be confirmed first.',
    symptoms: ['Renault Brazil chassis recall status checked', 'stiffness, fluid loss or play treated as urgent', 'each campaign completion documented separately'],
    systems: ['hydraulic steering box', 'axial steering joints', 'low-pressure hydraulic hose and related chassis fasteners'],
    evidence: ['Renault Brazil identifies the 2012 steering-box lot and exact chassis range.', 'Renault Brazil identifies 2015 axial-joint manufacture, chassis range, breakage risk and up-to-2.5-hour remedy.', 'Renault Brazil identifies 2016 low-pressure-hose manufacture, chassis ranges, assistance-loss risk and up-to-90-minute remedy.', 'Renault Brazil separately identifies the 2016 rear-axle/front-cradle fastener campaign.'],
    conflict: null,
    summary: 'Retained the combined official steering-recall identity with exact Renault Brazil date, chassis, risk and remedy boundaries.',
    citations: ['datasets', 'renaultBrazilRecall'],
    commerceDecision: 'These are chassis-specific Renault safety campaigns with no universal retail part; do not self-source steering components',
  }),
  [ids.columnBearing]: row({
    description: 'Mechanic videos and parts sellers describe individual steering-column play cases, but the frozen page calls upper-bearing wear a chronic 2008-2022 Sandero/Logan platform defect, asserts recent cross-generation examples, dealer whole-column replacement behavior and accident risk, and says a cheap bearing is the typical root cause. No exact Renault campaign or technical record reviewed here establishes that fifteen-year identity.',
    solution: 'Treat free play or steering response loss as safety-critical. With the vehicle secured, localize movement through the wheel, column joints/supports, EPS or hydraulic system, rack, tie rods, ball joints and wheel bearings; check Renault recall status before deciding the cause. Column disassembly may involve restraint-system and steering-angle procedures. Do not buy a bearing, bushing or complete column from this page; movement source, steering architecture and VIN fitment must be established first.',
    symptoms: ['steering play localized through the complete linkage', 'recall-covered joints and steering box checked', 'restraint and steering-angle procedures identified before column work'],
    systems: ['steering column bearings and joints', 'steering box/rack and tie rods', 'ball joints, wheel bearings and recall eligibility'],
    evidence: ['The complete NHTSA corpus contains zero Renault/Dacia Sandero rows.', 'Videos and sellers do not establish a fifteen-year cross-generation population.', 'The frozen chronic label, typical-bearing diagnosis and whole-column/dealer claims lack exact evidence.'],
    conflict: 'The indexed identity converts seller/mechanic examples into a platform-wide bearing defect and typical repair claim.',
    summary: 'Held the steering-bearing identity and replaced bearing-first diagnosis with full steering-path localization and recall checks.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultBrazilRecall: { title: 'Renault Brazil Official Sandero Recall Campaigns', type: 'manufacturer', url: 'https://www.renault.com.br/recall/recall-sandero.html', contains: 'Caixa de direção Hidráulica' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Sandero', slug: 'sandero', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-sandero-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT', 'DACIA'], modelAliases: ['SANDERO', 'SANDERO II', 'SANDERO III'],
  searchTerms: ['valve cover', 'oil consumption', 'head gasket', 'Easy-R', 'steering box', 'axial joint', 'hydraulic hose', 'column bearing'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT/DACIA SANDERO variants; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT/DACIA SANDERO variants; Renault Brazil is the exact manufacturer source for Brazilian Sandero campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.steeringRecalls, field: 'description', patterns: ['2012 hydraulic steering-box lot', '4 November-4 December 2015', '29 July-24 August 2016'] },
    { id: ids.valveCover, field: 'description', patterns: ['separate Renault oil-feed-orifice recall', 'does not prove the valve-cover identity'] },
    { id: ids.easyR, field: 'description', patterns: ['R$ price claims', 'Individual reports do not establish'] },
    { id: ids.columnBearing, field: 'solution', patterns: ['localize movement through the wheel', 'Do not buy a bearing'] },
  ],
  observations: [
    { code: 'exact-sandero-coverage', severity: 'identity-safety', recordIds: allIds, detail: 'All five Sandero pages remain published with frozen indexed identity.' },
    { code: 'steering-recalls-primary-supported', severity: 'source-integrity', recordIds: retainedIds, detail: 'Renault Brazil exactly supports the steering-box, axial-joint and low-pressure-hose campaigns plus related fasteners.' },
    { code: 'oil-recall-separated-from-leak', severity: 'identity-safety', recordIds: [ids.valveCover], detail: 'The exact oil-feed-orifice recall does not prove the frozen valve-cover-leak identity.' },
    { code: 'easy-r-extreme-claims-held', severity: 'technical-accuracy', recordIds: [ids.easyR], detail: 'Extreme shift anecdotes, prices and prevalence are not promoted into a model-wide mechanism.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT/DACIA SANDERO rows; the geographic limitation is explicit and Renault Brazil is used for exact campaigns.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
