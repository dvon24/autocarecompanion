/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  transmission: 'mini-hardtop-4door-clutch-actuator-2015',
  hatchWiring: 'mini-hardtop-4door-rear-hatch-wiring-2015',
  timing: 'mini-hardtop-4door-timing-chain-2015',
  waterLeak: 'mini-hardtop-4door-water-leak-2015',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10025844', '10032984', '10054635', '10057380', '10076078', '10136748',
  '10138416', '10145310', '10146871', '10146874', '10146926', '10147227',
  '10147573', '10147574', '10147583', '10147799', '10147957', '10149272',
  '10149394', '10150202', '10151230', '10152338', '10153719', '10163062',
  '10172512', '10182629', '10182928', '10190869', '10190870', '10216780',
  '11015837', '11031881', '11032745',
]);
const campaigns = Object.freeze([
  '02V201000', '03V086000', '04V348000', '05V470000', '08E050000',
  '08V657000', '09E025000', '09V474000', '12V008000', '14V422000',
  '14V619000', '14V721000', '14V789000', '15V034000', '15V205000',
  '15V450000', '15V628000', '15V660000', '15V739000', '16V747000',
  '16V914000', '17V222000', '18V248000', '18V465000', '19V601000',
  '19V634000', '20V283000', '21V554000', '23V337000', '24V104000',
  '24V697000', '25V616000', '26V422000',
]);
const pdfSources = Object.freeze({
  f55Technical: {
    title: 'BMW Group U.S. Technical Specifications - MY 2021 MINI Hardtop 4 Door',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0324990EN_US/471009',
    sha256: '0e85eb163ec3484c638a7e29d7f69bdceb3453a1d9738670709076f3fe2a18d2',
    pageCount: 9,
    visuallyReviewedPages: [1, 4, 7],
  },
  aisinReplacement: {
    title: 'MINI SI M24 01 19 - EGS Faults Stored after AISIN Transmission Replacement',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163062-9999.pdf',
    sha256: '727d98fdd50bd678a0b7feb921ec3b18a3487e41b8f04783846432f841f8ea44',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  rearHatchLeak: {
    title: 'MINI SI M51 05 16 - Water Leak in Rear Hatch',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10138416-9999.pdf',
    sha256: '90973dc426e3d45d8c5e2ca2b6ba3580fb89880f0fedddd55430a87da69adc3d',
    pageCount: 5,
    visuallyReviewedPages: [1, 3],
  },
  tailgateSeam: {
    title: 'MINI SIM 41 01 21 - Reworking the PVC Seam on the Tailgate Water Channel',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10227577-9999.pdf',
    sha256: 'd8b19ddf5f2ce446bac07da1a4f7c4617f5f0147917e209e6926d223a5cf4bff',
    pageCount: 5,
    visuallyReviewedPages: [1],
  },
  n14Timing: {
    title: 'MINI SI M11 04 13 - N14 Engine Check Timing Chain Tensioner and Timing Chain',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10054635-2047.pdf',
    sha256: 'ba7a8c1e8fbd049b24f3d6193c0b10053dac343bdf9d122cb2bef43e43f69c49',
    pageCount: 8,
    visuallyReviewedPages: [1, 4],
  },
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.transmission]: {
    description: `The indexed page combines several incompatible F55 transmissions and conditions. MINI SI M24 01 19 names AISIN GA6F21AW or GA8F22AW units only in the context of software incompatibility after a transmission replacement; it does not establish recurring mechatronic, valve-body, harsh-shift or torque-converter failure. BMW Group's exact MY 2021 F55 sheet documents six-speed manual and seven-speed DCT configurations, not a universal 2019-and-later eight-speed automatic or DCT limited to Cooper S.`,
    solution: `Decode the VIN and read the installed transmission identifier before diagnosis. Reproduce the shift complaint while recording temperature, selected and actual gear, clutch or converter slip and manufacturer EGS faults; check software level, adaptation history, wiring, mounts and verified fluid condition under the transmission-specific MINI procedure. Do not buy a valve body, mechatronic unit, clutch actuator, complete transmission or generic ATF from this page; the installed gearbox, failed subsystem, fluid specification and VIN fitment must be proven first.`,
    symptoms: ['VIN and installed transmission identifier recorded', 'shift complaint and EGS data captured', 'software, adaptation, fluid and mechanical paths separated'],
    affectedSystems: ['F55 manual, DCT or AISIN transmission by VIN', 'electronic transmission control and software', 'clutches or converter, hydraulic control and mounts'],
    evidence: ['SI M24 01 19 addresses post-replacement software incompatibility, not recurring valve-body failure.', 'The exact F55 technical sheet documents manual and seven-speed DCT variants for MY 2021.', 'The frozen TF-80SC, 2019-plus eight-speed, 40,000-mile fluid interval and generic-fluid damage claims are not established.'],
    conflict: 'The indexed identity mixes multiple transmissions, repair paths and model years into one recurring AISIN mechatronic defect.',
    summary: 'Held the mixed-transmission identity and required exact gearbox, EGS and fluid diagnosis before parts or service.',
    citations: ['f55Technical', 'aisinReplacement', 'datasets'],
  },
  [ids.hatchWiring]: {
    description: `The reviewed F55 manufacturer and federal corpus does not establish recurring rear-hatch harness fatigue or a heavier-hatch/tighter-bend mechanism. Exact F55 rear-area communications instead document several water paths at the hatch seal, body sealer, rear lights, ventilation and a bounded tailgate-channel seam. Those conditions can affect rear systems but do not prove internally broken conductors inside the upper-left boot across 2015-2025.`,
    solution: `Record every failed rear function and whether it changes with hatch position or water exposure. Verify fuses, grounds, module communication and power at the load, inspect connectors for moisture or corrosion, and continuity-test each suspect conductor through the flex area while flexing the harness. Do not buy a hatch harness, camera, wiper motor, release switch or repair wire from this page; the open or shorted circuit, connector condition, approved splice location and VIN fitment must be proven first.`,
    symptoms: ['failed rear functions and hatch-position relationship recorded', 'power, ground, network and module checks completed', 'wire continuity and connector moisture tested'],
    affectedSystems: ['rear hatch wiring and flex passage', 'rear wiper, camera, lamps, defroster and release circuits', 'rear connectors, grounds and control modules'],
    evidence: ['No exact F55 communication in the reviewed corpus establishes hatch-harness fatigue.', 'Exact F55 rear-area bulletins identify water-entry paths rather than a universal broken-wire mechanism.', 'The frozen heavier-hatch and tighter-bend causation has no auditable source.'],
    conflict: 'The indexed page asserts a recurring F55 harness-fatigue identity without exact manufacturer, federal or report evidence.',
    summary: 'Held the rear-hatch wiring identity and required circuit-level proof while separating water intrusion from conductor failure.',
    citations: ['f55Technical', 'rearHatchLeak', 'tailgateSeam', 'datasets'],
  },
  [ids.timing]: {
    description: `BMW Group's U.S. F55 technical sheet identifies B36A15M1 and B46A20M1 engines for the reviewed MY 2021 variants, while the frozen page assigns a broad B38/B48 timing-chain defect to 2015-2019. The detailed MINI timing action in the corpus is limited to N14 R55/R56/R57 vehicles produced from November 2006 through May 2009. It does not include F55 or establish early-production chain stretch, three-cylinder vibration causation, updated chain links or the cited SI 11 09 17 claim.`,
    solution: `Identify the exact F55 engine and production date, then record cold and hot noise, oil level and pressure, manufacturer camshaft/crankshaft faults and measured timing values. Inspect accessory, VANOS, tensioner, guide and lubrication paths under the engine-specific MINI procedure before opening the timing drive. Do not buy a timing chain, tensioner, guide kit, 0W-20 oil or a preventive six-to-eight-hour repair from this page; an out-of-spec condition, oil specification and VIN-specific repair scope must be proven first.`,
    symptoms: ['exact F55 engine and production date verified', 'cold and hot noise plus oil pressure documented', 'cam/crank correlation and mechanical timing measured'],
    affectedSystems: ['engine-specific timing chain and tensioner', 'guides, sprockets and VANOS', 'engine lubrication and accessory drives'],
    evidence: ['The exact U.S. F55 sheet identifies B36/B46 variants for MY 2021 rather than proving the frozen all-year B38/B48 identity.', 'SI M11 04 13 applies only to N14 R55/R56/R57 vehicles produced through May 2009.', 'No reviewed F55 communication supports the frozen updated-chain, vibration-causation or 5,000-mile oil claims.'],
    conflict: 'The indexed page transfers an older N14 timing history into a broad F55 B38/B48 chain-stretch identity without exact evidence.',
    summary: 'Held the F55 timing identity and blocked cross-generation N14 evidence and unsupported preventive repair advice.',
    citations: ['f55Technical', 'n14Timing', 'datasets'],
  },
  [ids.waterLeak]: {
    description: `Exact MINI F55 evidence supports rear-area water ingress, but not the indexed rear-door-weatherstrip identity. SI M51 05 16 identifies the rear hatch seal, excess body sealer, gaps around rear lights and rear ventilation on vehicles produced through December 2017. SIM 41 01 21 identifies a bounded September-November 2020 upper-left tailgate-water-channel seam. Neither source establishes uneven lower rear-door seals across 2015-2020 or the frozen hinge-adjustment and adhesive remedy.`,
    solution: `Use a controlled sectional water test and trace the highest wet point before removing trim. Test rear doors and membranes separately from the hatch seal, hatch body seams, rear-light openings, rear ventilation, roof and A/C paths; inspect wiring only after the entry route is documented. Do not buy rear-door weatherstrips, hatch seal 51767379602, 3M adhesive, seam sealer or a door membrane from this page; the exact leak path, production scope, approved material and VIN fitment must be proven first.`,
    symptoms: ['controlled sectional water test completed', 'highest wet point and production date documented', 'rear-door, hatch, body-seam, light and ventilation paths separated'],
    affectedSystems: ['rear doors, membranes and weatherstrips', 'rear hatch seal and body seams', 'rear lights, ventilation and adjacent wiring'],
    evidence: ['SI M51 05 16 establishes multiple rear-hatch paths and an F55 hatch seal, not rear-door weatherstrips.', 'SIM 41 01 21 is limited to a narrow 2020 tailgate-water-channel seam population.', 'The frozen rear-door mechanism, 80-owner total, hinge adjustment and adhesive advice exceed exact evidence.'],
    conflict: 'The indexed rear-door title conflicts with exact F55 evidence pointing to hatch, body-seam, light and ventilation paths.',
    summary: 'Held the rear-door water-leak identity and replaced a one-part remedy with controlled path-specific diagnosis.',
    citations: ['rearHatchLeak', 'tailgateSeam', 'f55Technical', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Hardtop 4 Door', slug: 'hardtop-4-door', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-hardtop-4-door-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [],
  reportCountCleanupIds: [ids.transmission, ids.timing, ids.waterLeak].sort(),
  modelAliases: ['COOPER', 'COOPER S', 'COOPER US', 'COOPER S US'],
  searchTerms: ['mechatronic', 'clutch actuator', 'harsh shift', 'shift quality', 'transmission replacement', 'tailgate wiring', 'rear wiper', 'rear camera', 'license plate light', 'rear window defroster', 'timing chain', 'chain tensioner', 'water leak', 'water ingress', 'rear door', 'weatherstrip', 'footwell'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 1, '2000-2004': 29, '2005-2009': 40, '2010-2014': 113, '2015-2019': 1236, '2020-2024': 322, '2025-2026': 83 },
    totalRows: 1824,
    relevantRowCount: 63,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 18, post: 115 },
    totalRows: 133,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The broad Cooper/Cooper S aliases contain thirty-three campaigns across several chassis and generations; none establishes one of the four frozen F55 identities or an owner-frequency rate.',
  },
  content,
  requiredProse: [
    { id: ids.transmission, field: 'description', patterns: ['software incompatibility after a transmission replacement', 'six-speed manual and seven-speed DCT'] },
    { id: ids.hatchWiring, field: 'description', patterns: ['does not establish recurring rear-hatch harness fatigue', 'do not prove internally broken conductors'] },
    { id: ids.timing, field: 'description', patterns: ['limited to N14 R55/R56/R57', 'does not include F55'] },
    { id: ids.waterLeak, field: 'description', patterns: ['not the indexed rear-door-weatherstrip identity', 'rear hatch seal'] },
  ],
  observations: [
    { code: 'all-hardtop-4-door-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All four identities exceed exact F55 transmission, circuit, engine or water-path evidence.' },
    { code: 'mixed-transmission-identity-blocked', severity: 'technical-accuracy', recordIds: [ids.transmission], detail: 'Post-replacement AISIN software evidence and MY 2021 manual/DCT specifications do not establish one 2015-2026 mechatronic identity.' },
    { code: 'old-n14-timing-evidence-not-transferred', severity: 'generation-scope', recordIds: [ids.timing], detail: 'The N14 R55/R56/R57 service action is not transferred to F55 B36/B46 or frozen B38/B48 engines.' },
    { code: 'rear-door-water-mechanism-blocked', severity: 'technical-accuracy', recordIds: [ids.waterLeak], detail: 'Exact F55 bulletins identify hatch seals, body seams, rear lights and ventilation rather than the frozen rear-door mechanism.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [ids.transmission, ids.timing, ids.waterLeak].sort(), detail: 'Three nonzero owner totals lack auditable reports and are proposed as unknown zero.' },
    { code: 'all-hardtop-4-door-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Hardtop 4 Door page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
