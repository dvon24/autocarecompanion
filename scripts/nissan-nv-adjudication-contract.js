/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  fuelGauge: 'nissan-nv-fuel-sending-unit-failure-2012',
  radiator: 'nissan-nv-radiator-crack-2012',
  rearDoor: 'nissan-nv-rear-door-hinge-2012',
  transmission: 'nissan-nv-transmission-cooler-2012',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.radiator, ids.rearDoor, ids.transmission].sort());
const relevantDocumentIds = Object.freeze([
  '10050179', '10109114', '10152526', '10153552', '10192083', '10192086',
  '10192092', '10213684',
]);
const campaigns = Object.freeze([
  '11V408000', '11V592000', '13V094000', '13V095000', '14V419000',
  '18V551000', '19V654000', '20V188000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.fuelGauge]: held({
    description: `Nissan NTB22-026 applies broadly to 2016-2022 Nissan vehicles only after a fuel-level sensor is diagnosed as sending an incorrect signal and P0460, P0461, P0462 or P0463 is stored. It says the sensor can be replaced separately and says do not replace the entire fuel-pump assembly. It does not establish the frozen 2012-2021 NV population, rheostat wear from fuel slosh or a universal sending-unit failure without those DTC and diagnostic gates.`,
    solution: `Record the gauge behavior, actual fuel quantity and all ECM DTCs, then inspect sensor signal, wiring, connector, ground and instrument display before identifying the failed component. Apply NTB22-026 only after the sensor signal is diagnosed and a listed DTC is stored. Do not buy a sending unit, float arm, fuel pump assembly or secondary gauge from this page; DTC path, circuit diagnosis, tank configuration and VIN fitment must be established first.`,
    symptoms: ['gauge error compared with actual fuel quantity', 'P0460-P0463 and circuit data preserved', 'sensor, wiring, display and pump-assembly paths separated'],
    systems: ['fuel-level sensor and float mechanism', 'fuel-pump assembly and tank wiring', 'ECM and instrument-cluster display'],
    evidence: ['NTB22-026 is limited to 2016-2022 Nissan vehicles with a diagnosed sensor signal and listed DTC.', 'It explicitly warns against replacing the whole pump assembly.', 'No primary source supports the frozen 2012-2021 NV wear mechanism.'],
    conflict: 'The indexed page turns a DTC-gated anti-overrepair bulletin into a ten-year NV sending-unit failure identity.',
    summary: 'Held the overbroad fuel-sending-unit identity and preserved Nissan’s separate-sensor/no-pump-replacement boundary.',
    citations: ['fuelGaugeBulletin', 'datasets'],
  }),
  [ids.radiator]: held({
    description: `Nissan campaign PC664 applies only to certain 2018 NV1500/2500/3500 vehicles and addresses a supplier condition in which the radiator cap may not fully seat on the filler neck. The repair is to inspect the filler neck and replace the radiator only when the campaign inspection requires it. It does not establish plastic end-tank cracking, crimp-joint failure, V8 heat susceptibility or a 2012-2021 population. The frozen 110-owner total is unsupported.`,
    solution: `Check the VIN for PC664, pressure-test the cooling system, inspect the cap and filler neck, radiator seams and tanks, hoses and other leak points, and diagnose overheating before selecting a repair. Follow the campaign inspection for eligible 2018 vehicles. Do not buy a radiator, cap, hoses, thermostat, coolant or overflow bottle from this page; leak source, campaign eligibility, engine, cooling specification and VIN fitment must be established first.`,
    symptoms: ['coolant loss and overheating documented separately', 'cap, filler neck, tanks, seams and hoses pressure-tested', 'campaign eligibility and engine configuration confirmed'],
    systems: ['radiator filler neck and cap', 'radiator tanks, core and seams', 'cooling hoses, thermostat and coolant circuit'],
    evidence: ['PC664 covers certain 2018 NV vehicles only.', 'It identifies cap seating at the radiator filler neck, not plastic end-tank cracking.', 'No primary source supports the frozen ten-year pattern or 110-owner total.'],
    conflict: 'The indexed page expands a VIN-bounded 2018 filler-neck campaign into a 2012-2021 end-tank-cracking identity.',
    summary: 'Held the overbroad radiator-cracking identity and removed the fabricated 110-owner total.',
    citations: ['radiatorCampaign', 'datasets'],
  }),
  [ids.rearDoor]: held({
    description: `Nissan campaign PC176 covers certain 2012 NV vehicles whose rear cargo-door check links may fail to re-engage after being released for wide opening. Nissan says the condition does not affect the door lock or latch, does not cause the doors to open unintentionally and is not a safety issue. It does not establish hinge-pin wear, ovalized hinge plates, door sagging or a 2012-2021 population. The frozen 95-owner total is unsupported.`,
    solution: `Separate a check link that fails to re-engage from door sag, hinge play, latch alignment, body contact and weatherstrip leakage. Check VIN eligibility for PC176 and measure the source of movement before repair. Do not buy hinge pins, bushings, a hinge assembly, check links or a repair kit from this page; failed mechanism, door configuration, campaign status and VIN fitment must be established first.`,
    symptoms: ['check-link re-engagement and hinge sag tested separately', 'hinge play, latch alignment and body contact measured', 'campaign eligibility and rear-door configuration confirmed'],
    systems: ['rear cargo-door check links', 'hinge pins, plates and door alignment', 'latches, weatherstrips and body openings'],
    evidence: ['PC176 is limited to certain 2012 NV vehicles.', 'It concerns check-link re-engagement and expressly excludes lock/latch and unintended opening.', 'No primary source supports the frozen hinge-wear identity or 95-owner total.'],
    conflict: 'The indexed page converts a one-year check-link campaign into a ten-year hinge-pin and door-sag identity.',
    summary: 'Held the unsupported rear-door hinge identity and removed the fabricated 95-owner total.',
    citations: ['rearDoorCampaign', 'datasets'],
  }),
  [ids.transmission]: held({
    description: `The complete exact NV manufacturer-communication and recall corpus does not establish RE5R05A transmission overheating under load across 2012-2021, an undersized factory cooler, greater susceptibility in a fully loaded NV3500 passenger van, a 30,000-mile fluid interval or an auxiliary-cooler remedy. The frozen P0710, P0218 and P0741 list does not by itself prove one shared cause, and the 105-owner total is unsupported.`,
    solution: `Preserve every DTC and freeze-frame record, verify fluid level and specification, reproduce the condition while monitoring transmission temperature and load, and inspect cooler flow, lines, radiator heat exchange, torque-converter operation and internal pressure using the service manual. Do not buy an auxiliary cooler, thermostat, ATF, torque converter or transmission from this page; DTC branch, measured temperature, cooling fault, duty cycle and VIN fitment must be established first.`,
    symptoms: ['measured transmission temperature and load recorded', 'DTCs and fluid condition preserved', 'cooler, converter, hydraulic and internal mechanical paths separated'],
    systems: ['RE5R05A automatic transmission', 'transmission cooler, lines and radiator heat exchanger', 'torque converter, valve body and fluid circuit'],
    evidence: ['No exact primary communication supports the frozen 2012-2021 overheating identity.', 'No manufacturer evidence establishes an undersized cooler or aftermarket modification.', 'The frozen DTC combination, fluid interval and 105-owner total are unsupported.'],
    conflict: 'The indexed page turns forum modification advice into a ten-year transmission-overheating identity.',
    summary: 'Held the unsupported transmission-overheating identity and removed the fabricated 105-owner total.',
    citations: ['datasets'],
  }),
});

const pdfSources = Object.freeze({
  fuelGaugeBulletin: { title: 'Nissan NTB22-026 - Fuel Gauge Inaccurate with P0460-P0463', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10213684-0001.pdf', sha256: '9016bcf15a9fa46bfbf07f4cab29f69a3d37913c8973ebe462f68cf4e13928e6', pageCount: 1, visuallyReviewedPages: [1] },
  radiatorCampaign: { title: 'Nissan NTB18-078 / PC664 - Certain 2018 NV Radiator Inspection', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152522-9999.pdf', sha256: '16c28293d133455de9103366d18865d2b82e751428a41a1d1e69b09626b96aa9', pageCount: 4, visuallyReviewedPages: [1, 4] },
  rearDoorCampaign: { title: 'Nissan NTB12-113a / PC176 - 2012 NV Rear Door Check Links', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2012/MC-10192086-9999.pdf', sha256: '277e90bfb7e7245fdb9dd94373b562d88b508239a6eeab732d036575e95d769e', pageCount: 6, visuallyReviewedPages: [1, 6] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'NV', slug: 'nv', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-nv-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['NV'],
  searchTerms: ['fuel gauge', 'fuel level', 'sending unit', 'radiator', 'coolant leak', 'overheat', 'rear door', 'cargo door', 'hinge', 'transmission overheat', 'transmission cooler', 'P0710', 'P0218', 'P0741'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 10, '2015-2019': 102, '2020-2024': 68, '2025-2026': 2 },
    totalRows: 182,
    relevantRowCount: 8,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 33 },
    totalRows: 33,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Eight exact NV campaigns cover bounded airbag, fuel, electrical and visibility populations. None establishes the four frozen cross-year mechanisms; PC664 and PC176 are voluntary service campaigns represented in the communication corpus rather than these Part 573 recall rows.',
  },
  content,
  requiredProse: [
    { id: ids.fuelGauge, field: 'description', patterns: ['NTB22-026', '2016-2022', 'do not replace the entire fuel-pump assembly'] },
    { id: ids.radiator, field: 'description', patterns: ['PC664', 'certain 2018', 'does not establish plastic end-tank cracking', '110-owner total'] },
    { id: ids.rearDoor, field: 'description', patterns: ['PC176', 'does not affect the door lock or latch', '95-owner total'] },
    { id: ids.transmission, field: 'description', patterns: ['does not establish RE5R05A', '105-owner total'] },
  ],
  observations: [
    { code: 'four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All four frozen NV identities exceed exact manufacturer evidence and remain indexed but blocked pending identity policy.' },
    { code: 'campaigns-not-expanded', severity: 'technical-accuracy', recordIds: [ids.radiator, ids.rearDoor], detail: 'PC664 is a VIN-bounded 2018 filler-neck inspection and PC176 is a 2012 check-link campaign; neither supports the frozen ten-year mechanism.' },
    { code: 'anti-overrepair-guidance-preserved', severity: 'overrepair-safety', recordIds: [ids.fuelGauge], detail: 'NTB22-026 allows separate sensor replacement after diagnosis and listed DTCs and warns against replacing the whole pump assembly.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 310 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-nv-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No NV page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
