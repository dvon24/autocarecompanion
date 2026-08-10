/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records.filter((row) => row.make === 'RAM' && row.model === '2500').sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));
const ids = Object.freeze({
  waterPump: 'ram-2500-6-7l-cummins-water-pump-coolant-leak',
  cp4: 'ram-2500-cp4-fuel-pump-failure-2019',
  deathWobble: 'ram-2500-front-end-death-wobble-2003',
});
const campaignEvidenceRequirements = Object.freeze({
  [ids.waterPump]: [{ campaign: '17V562000', patterns: ['water pumps may leak coolant', 'engine compartment fire', 'replace the water pumps'] }],
  [ids.cp4]: [{ campaign: '21V880000', patterns: ['High Pressure Fuel Pump', 'sudden engine stall', 'replace the HPFP'] }],
  [ids.deathWobble]: [{ campaign: '19V021000', patterns: ['jam nut may loosen', 'drag link to separate', 'steering linkage jam nut'] }],
});

const diagnosticByCategory = Object.freeze({
  body: 'water-test one seam at a time and separate lamp, window, seam, seal, fastener and body-joint paths',
  drivetrain: 'reproduce under the same speed and load, then inspect lubricant, leaks, bearings, joints, shafts, actuators and control faults separately',
  electrical: 'measure battery state and key-off draw, scan all modules and separate software, network, power, ground, connector and hardware paths',
  emissions: 'preserve freeze-frame and inducement data and separate DEF quality, tank, heater, pump, injector, NOx sensor, wiring, software and SCR paths',
  engine: 'preserve oil-pressure, compression, leak-down, misfire and timing data and localize valvetrain, lubrication, fuel, air, cooling and control paths',
  exhaust: 'inspect cold and hot and separate manifold crack, gasket, fastener, turbo, aftertreatment and internal-engine noise paths',
  fuel: 'preserve rail-pressure and contamination evidence and separate tank, lift-pump, high-pressure-pump, injector, wiring and control paths',
  hvac: 'measure airflow and temperature and separate doors, actuators, linkage, sensors, wiring, module and calibration paths',
  interior: 'document the exact panel, crack origin, heat exposure, prior repair and attachment before choosing a repair',
  steering: 'record speed, road input and steering angle, then inspect tires, wheels, alignment, track bar, drag link, tie rods, ball joints, damper, gear and fasteners under load',
  suspension: 'inspect loaded joints, ball studs, bushings, bearings, alignment, tires, wheels and steering linkages before attributing one component',
  transmission: 'preserve faults and adaptation data, verify fluid and temperature and separate software, valve-body, converter, clutch, cooler and internal paths',
});

function genericIssue(row) {
  const diagnostic = diagnosticByCategory[row.category] || 'record and reproduce the exact condition, preserve fault data and isolate the failed system before replacement';
  return {
    description: `The complete RAM/Dodge 2500 source pass (2,900 exact manufacturer-communication rows, 434 downloaded recall rows and 65 current live-API campaigns for modern RAM 2500 years) did not establish the full indexed identity “${row.title}” across every frozen year. Available records describe bounded campaigns, engine or axle configurations, software levels and symptom-specific procedures rather than one universal mechanism or owner-frequency claim. This page remains published as an identity hold; its title, routing and vehicle metadata are unchanged.`,
    solution: `Start with the exact build, engine, axle and symptom instead of assuming the title mechanism: ${diagnostic}. Check the VIN for open campaigns and preserve pre-repair measurements. Stop driving for loss of steering, braking or propulsion, a severe driveline vibration, fuel/coolant leak, overheating, smoke or fire risk. Do not buy a repair part from this page; the failed path, current part number, supersession, programming requirements and VIN fitment must be established first.`,
    symptoms: ['exact build, engine, axle and operating condition recorded', 'complete module and pre-repair data preserved', 'campaign, software and mechanical paths separated', 'failed component and VIN applicability established before parts'],
    affectedSystems: [`${row.category} system`, 'vehicle power, network and control paths where applicable', 'engine-, axle-, option- and VIN-specific hardware'],
    evidence: ['Every exact local RAM/Dodge 2500 communication alias and downloaded recall row was included.', 'The live NHTSA vehicle-year API was reconciled for every frozen 2011-2025 RAM 2500 year.', 'No communication or campaign is converted into an owner total, recurrence rate or all-year mechanism.'],
    conflict: 'The frozen title and year scope exceed one exact manufacturer or regulator source; identity, years and routing require separate policy review.',
    summary: 'Held the overbroad or unresolved RAM 2500 identity, removed unsupported social proof and commerce, and restored symptom-led diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'failure path, current component and part number, supersession, programming requirements and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, genericIssue(row)]));

content[ids.waterPump] = {
  description: 'NHTSA 17V562 / FCA T51 establishes a leaking Concentric-brand water pump without a vent hole on affected 2013-2017 RAM 2500 trucks with the 6.7L Cummins. Coolant leakage can increase engine-compartment fire risk and the recall replaces the pump free of charge. The frozen page also indexes 2018, which the campaign does not cover, so the page remains published as an identity hold rather than being labeled an exact retain.',
  solution: 'Check the VIN for 17V562 / T51 and have the dealer replace the affected water pump free of charge when open. If coolant leakage, overheating, steam, smoke or a burning odor occurs, stop safely, shut down and arrange service; call emergency services for fire. Outside the campaign, pressure-test and inspect the pump, vent-hole design, hoses and surrounding leak paths. Do not buy a water pump, gasket or coolant kit from this page; campaign eligibility, pump design, completed remedy, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 17V562 / T51', 'coolant leak location and pump design documented', 'overheat, steam, smoke or odor recorded', 'campaign population separated from frozen 2018 scope'],
  affectedSystems: ['6.7L Cummins water pump', 'engine cooling circuit', 'engine-compartment fire safety'],
  evidence: ['17V562 covers affected 2013-2017 RAM 2500 trucks with specified Concentric pumps.', 'The campaign identifies coolant leakage and increased fire risk.', 'The frozen 2018 indexed year is outside the campaign.'],
  conflict: 'The recall identity is exact for VIN-selected 2013-2017 trucks, but the frozen page includes unsupported 2018 scope; no year edit is authorized in this content pass.',
  summary: 'Held the T51 water-pump page because its frozen year scope exceeds the campaign, while preserving the exact leak, fire-risk and free-recall remedy.',
  citations: ['live2017', 'datasets'],
  commerceDecision: 'campaign eligibility, pump design, completed remedy, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.cp4] = {
  description: 'NHTSA 21V880 / FCA Y78 covers affected 2019-2020 RAM 2500 trucks with the 6.7L Cummins and identifies high-pressure fuel-pump failure with possible sudden engine stall. Stellantis TSB 14-008-22 calls the original unit a “CP4 style” pump and the recall replacement a CP3.3; it does not use the frozen “CP4.2” identity. The frozen page extends through 2025, beyond both sources, so it remains published as an identity hold.',
  solution: 'Check the VIN for 21V880 / Y78 before any PCM programming or fuel-pump purchase. The campaign replaces the HPFP, updates PCM software and inspects or replaces additional fuel-system components as necessary, free of charge. If the engine stalls, use hazards, steer and brake to a safe location and arrange service. Preserve rail-pressure and contamination evidence. Do not buy a CP4, CP3.3, injector, rail or fuel-system kit from this page; pump design, campaign eligibility, contamination extent, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for 21V880 / Y78', 'installed CP4-style versus CP3.3 pump identified', 'stall, rail pressure and contamination evidence preserved', '2019-2020 campaign scope separated from later indexed years'],
  affectedSystems: ['6.7L Cummins high-pressure fuel pump', 'fuel rails, injectors and delivery system', 'PCM calibration'],
  evidence: ['21V880 covers affected 2019-2020 RAM 2500 trucks and identifies HPFP failure and sudden stall.', 'TSB 14-008-22 distinguishes CP4-style and CP3.3 pumps installed under Y78.', 'Neither source supports the frozen CP4.2 wording or 2021-2025 scope.'],
  conflict: 'The frozen title says CP4.2 and indexes 2019-2025, while exact official sources say CP4 style and cover 2019-2020; no title or year edit is authorized.',
  summary: 'Held the overbroad CP4.2 page, preserved the Y78 stall and remedy facts and separated 2019-2020 evidence from later indexed years.',
  citations: ['cp4Bulletin', 'live2019', 'datasets'],
  commerceDecision: 'pump design, campaign eligibility, contamination extent, PCM calibration, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.deathWobble] = {
  description: 'NHTSA 19V021 / FCA V06 proves a bounded steering-linkage defect on affected 2014-2018 RAM 2500 trucks: an outboard jam nut may loosen and allow drag-link separation, risking loss of steering control. It does not establish the frozen 2003-2025 “death wobble” oscillation identity or attribute every oscillation to that condition. The page remains published as an identity hold and the unsupported 5,500-owner total becomes unknown.',
  solution: 'Check the VIN for V06 / 19V021 and confirm the campaign remedy and current steering-linkage state. For any oscillation, safely slow without abrupt steering or braking, stop and inspect tires, wheels, alignment, track bar, drag link, tie rods, ball joints, damper, gear and fasteners under load. Do not assume a damper masks a loose or damaged joint. Do not buy a drag link, track bar, damper, ball joint or steering gear from this page; the loose or worn component, campaign status, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for V06 / 19V021', 'speed, road input and steering angle recorded', 'loaded steering and suspension joints inspected', 'drag-link recall condition separated from general oscillation'],
  affectedSystems: ['drag link and steering linkage', 'track bar, tie rods and ball joints', 'tires, wheels, alignment, damper and steering gear'],
  evidence: ['19V021 identifies a loosened outboard steering-linkage jam nut and possible drag-link separation.', 'The campaign covers a bounded 2014-2018 RAM 2500 population.', 'The campaign does not prove a 2003-2025 universal death-wobble mechanism or owner total.'],
  conflict: 'The frozen identity converts a bounded drag-link campaign and many possible oscillation sources into one all-year mechanism and invented prevalence claim.',
  summary: 'Held the overbroad death-wobble identity, removed invented social proof and separated V06 drag-link risk from full chassis diagnosis.',
  citations: ['live2018', 'datasets'],
  commerceDecision: 'oscillation source, campaign status, joint or steering component, current part number and VIN fitment remain unresolved; no universal retail part',
};

const pdfSources = Object.freeze({
  cp4Bulletin: { title: 'Stellantis TSB 14-008-22 - CP4 and CP3.3 Pump Identification', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10214632-9999.pdf', contains: ['CP4 style', 'CP3.3 style', '2019 - 2020', 'Y78 recall'] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  live2017: { title: 'NHTSA Live RAM 2500 2017 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=2500&modelYear=2017' },
  live2018: { title: 'NHTSA Live RAM 2500 2018 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=2500&modelYear=2018' },
  live2019: { title: 'NHTSA Live RAM 2500 2019 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=2500&modelYear=2019' },
});

module.exports = Object.freeze({
  make: 'RAM', frozenMakeValues: ['RAM'], model: '2500', slug: '2500', reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json', snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623', snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-2500-live-recalls-2026-08-11.json', outputFile: 'data/known-issue-ram-2500-adjudication-2026-08-11.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds, campaignEvidenceRequirements, duplicateGroups: [], sourceMakes: ['RAM', 'DODGE'], modelAliases: ['2500', 'RAM 2500', 'BR2500'],
  searchTerms: ['valvetrain', 'lifter', 'camshaft', 'EGR cooler', 'grid heater', 'turbo actuator', 'water pump', '68RFE', 'torque converter', 'water leak', 'CP4', 'high pressure fuel pump', 'DEF', 'death wobble', 'drag link', 'steering gear', 'TIPM', 'transfer case', 'Uconnect'],
  relevantDocumentIds: ['10214632'], campaigns: ['17V562000', '19V021000', '21V880000'], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 6, '2005-2009': 53, '2010-2014': 41, '2015-2019': 1060, '2020-2024': 1308, '2025-2026': 432 }, totalRows: 2900, broadTermMatchedRows: 425, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 2,900 exact RAM/Dodge 2500 communication rows were searched. Exact sources narrow water-pump, CP4-style HPFP and drag-link conditions, while every frozen identity exceeds full title or year scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 42, post: 392 }, totalRows: 434, downloadedCampaignCount: 93, liveModernCampaignCount: 65, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 434 downloaded exact-alias recall rows were reconciled with 65 current campaigns returned by the live RAM 2500 API for 2011-2025. No frozen identity meets exact full title and year scope.' },
  content,
  requiredProse: [
    ...allIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN fitment'] })),
    { id: ids.waterPump, field: 'description', patterns: ['17V562', '2013-2017', 'frozen page also indexes 2018'] },
    { id: ids.cp4, field: 'description', patterns: ['21V880', 'CP4 style', 'extends through 2025'] },
    { id: ids.deathWobble, field: 'description', patterns: ['19V021', 'drag-link separation', 'does not establish.*death wobble'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All twenty frozen RAM 2500 rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All pages remain published holds; none is archived, redirected or relabeled.' },
    { code: 'water-pump-scope-conflict', severity: 'technical-accuracy', recordIds: [ids.waterPump], detail: '17V562 proves 2013-2017, while the frozen page also indexes 2018.' },
    { code: 'cp4-scope-conflict', severity: 'technical-accuracy', recordIds: [ids.cp4], detail: 'Y78 proves CP4-style HPFP risk for 2019-2020, not CP4.2 across 2019-2025.' },
    { code: 'death-wobble-scope-conflict', severity: 'technical-accuracy', recordIds: [ids.deathWobble], detail: 'V06 proves a bounded drag-link jam-nut defect, not a universal 2003-2025 oscillation mechanism.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Four unsupported owner totals are proposed unknown and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
