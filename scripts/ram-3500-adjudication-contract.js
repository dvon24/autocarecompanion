/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records.filter((row) => row.make === 'RAM' && row.model === '3500').sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));
const ids = Object.freeze({
  aisin: 'ram-3500-aisin-as69rc-issues-2013',
  fifthWheel: 'ram-3500-fifth-wheel-wiring-2013',
  frontAxle: 'ram-3500-front-axle-seal-leak-2013',
  gridHeater: 'ram-3500-grid-heater-relay-2010',
});
const campaignEvidenceRequirements = Object.freeze({
  [ids.gridHeater]: [
    { campaign: '21V163000', patterns: ['Solid State Intake Heater Grid Relay', 'vehicle fire', 'inspect and.*replace'] },
    { campaign: '23V060000', patterns: ['heater grid relay', 'engine compartment fire', 'replace the relay'] },
  ],
});

const diagnosticByCategory = Object.freeze({
  drivetrain: 'reproduce under the same speed and load, then inspect lubricant, leaks, bearings, joints, shafts, axle identity and control faults separately',
  electrical: 'measure power, ground and loaded voltage drop, scan all modules and separate connector, harness, relay, module, trailer and hardware paths',
  engine: 'preserve boost, actuator-command, exhaust-brake and fault data and separate software, wiring, actuator, vane, turbo and exhaust paths',
  exhaust: 'inspect cold and hot and separate manifold crack, gasket, fastener, turbo, aftertreatment and internal-engine noise paths',
  suspension: 'inspect loaded bearings, joints, fasteners, tires, wheels, alignment and axle hardware before attributing one component',
  transmission: 'preserve faults and adaptation data, verify fluid identity and temperature and separate software, valve-body, converter, clutch, cooler and internal paths',
});

function genericIssue(row) {
  const diagnostic = diagnosticByCategory[row.category] || 'record and reproduce the exact condition, preserve fault data and isolate the failed system before replacement';
  return {
    description: `The complete RAM/Dodge 3500 source pass (3,115 exact manufacturer-communication rows, 453 downloaded recall rows and 68 current live-API campaigns for modern RAM 3500 years) did not establish the full indexed identity "${row.title}" across every frozen year. Available records describe bounded build dates, powertrains, axle or transmission configurations, software levels and symptom-specific procedures rather than one universal mechanism or owner-frequency claim. This page remains published as an identity hold; its title, routing and vehicle metadata are unchanged.`,
    solution: `Start with the exact build, engine, transmission, axle, body configuration and symptom instead of assuming the title mechanism: ${diagnostic}. Check the VIN for open campaigns and preserve pre-repair measurements. Stop driving for loss of steering, braking or propulsion, severe vibration, a fluid leak reaching brakes or hot surfaces, overheating, smoke or fire risk. Do not buy a repair part from this page; the failed path, current part number, supersession, programming requirements and VIN fitment must be established first.`,
    symptoms: ['exact build and operating condition recorded', 'complete module and pre-repair data preserved', 'campaign, software and mechanical paths separated', 'failed component and VIN applicability established before parts'],
    affectedSystems: [`${row.category} system`, 'vehicle power, network and control paths where applicable', 'engine-, transmission-, axle-, body- and VIN-specific hardware'],
    evidence: ['Every exact local RAM/Dodge 3500 communication alias and downloaded recall row was included.', 'The live NHTSA vehicle-year API was reconciled for every frozen 2010-2025 RAM 3500 year.', 'No communication or campaign is converted into an owner total, recurrence rate or all-year mechanism.'],
    conflict: 'The frozen title and year scope exceed one exact manufacturer or regulator source; identity, years and routing require separate policy review.',
    summary: 'Held the overbroad or unresolved RAM 3500 identity, removed unsupported social proof and commerce, and restored symptom-led diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'failure path, current component and part number, supersession, programming requirements and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, genericIssue(row)]));

content[ids.aisin] = {
  ...genericIssue(rows.find((row) => row.id === ids.aisin)),
  description: 'The exact manufacturer-communication inventory contains bounded AS69RC conditions, including 2016 P2757 torque-converter lockup failure caused by a dislodged internal snap ring and limited build dates. It does not establish the frozen 2013-2025 identity of universal overheating, converter shudder and premature wear, nor the frozen TSB 21-013-19 claim. The page remains published as an identity hold and its 2,800-owner total becomes unknown.',
  solution: 'Preserve TCM faults, fluid identity and level, temperature, adaptation data and a repeatable road-test trace. Separate P2757 lockup, snap-ring, converter, solenoid, wiring, cooling, calibration and internal transmission paths before replacement. Use only the fluid and service procedure identified for the VIN and transmission tag. Do not buy fluid, a converter, cooler, solenoid or transmission from this page; the exact AS69RC build, failure path, current part number and VIN fitment must be established first.',
  evidence: ['Exact manufacturer communications establish specific AS69RC conditions rather than the frozen all-year failure identity.', 'The 2016 P2757 communication narrows one torque-converter condition to a dislodged snap ring and limited build dates.', 'No exact source in the complete pass substantiates TSB 21-013-19 as described on the frozen page.'],
  conflict: 'The frozen page combines several symptoms, all 2013-2025 trucks, a named bulletin and broad replacement advice that the exact source inventory does not support as one identity.',
  summary: 'Held the overbroad AS69RC identity, removed unsupported prevalence and separated the exact 2016 P2757 condition from other transmission diagnoses.',
  citations: ['datasets'],
  commerceDecision: 'transmission tag, fluid specification, exact failure path, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.fifthWheel] = {
  ...genericIssue(rows.find((row) => row.id === ids.fifthWheel)),
  description: 'Stellantis TSB 08-031-20 establishes one exact 2019 RAM 3500 condition: auxiliary fused wires were not populated in the rear chassis harness above the fifth wheel on certain optioned builds, remedied with a jumper harness. It does not establish the frozen 2013-2025 in-bed connector-corrosion identity, salt-belt prevalence or universal water-intrusion mechanism. The page remains published as an identity hold.',
  solution: 'Identify which trailer-light, brake-control, auxiliary-power or camera circuit fails, then load-test truck and trailer wiring separately. Inspect the in-bed socket, under-bed connectors, grounds, harness routing and option content for missing terminals, water entry, damage and corrosion. For applicable 2019 optioned builds, follow TSB 08-031-20 for missing auxiliary fused wires. Do not buy a socket, jumper harness, terminal kit or brake module from this page; the exact circuit, connector, option content, current part number and VIN fitment must be established first.',
  evidence: ['TSB 08-031-20 was text-extracted and visually inspected.', 'It covers certain 2019 RAM 3500 pickups with specific engines and auxiliary-switch/pickup-box options.', 'It proves missing auxiliary wires, not 2013-2025 connector corrosion.'],
  conflict: 'The exact bulletin describes a missing-wire build condition on bounded 2019 trucks, while the frozen identity asserts corrosion across 2013-2025.',
  summary: 'Held the connector-corrosion identity and separated it from the exact 2019 missing-upfitter-wiring bulletin.',
  citations: ['fifthWheelBulletin', 'datasets'],
  commerceDecision: 'failed circuit, connector identity, option content, corrosion extent, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.frontAxle] = {
  ...genericIssue(rows.find((row) => row.id === ids.frontAxle)),
  description: 'The frozen identity is internally inconsistent before source review: its title names AAM 11.5/11.8, while its own body describes an AAM 9.25 front axle and also combines inner seal leakage, brake contamination and axle-shaft U-joint wear across 2013-2025. The complete official-source pass did not establish that combined identity or TSB 03-004-18 as described. The page remains published as an identity hold and its 1,650-owner total becomes unknown.',
  solution: 'Confirm the axle tag and exact leak or joint location first. Clean and recheck the assembly, verify lubricant level, inspect inner seals, shafts, tubes, hubs, U-joints and brake surfaces, and replace friction material only when contamination or wear is confirmed. Do not infer front-axle fitment from the 11.5/11.8 title. Do not buy seals, U-joints, sleeves, pads or rotors from this page; axle identity, failed component, current part number and VIN fitment must be established first.',
  evidence: ['The frozen title and description name different axle families.', 'The exact source inventory does not establish TSB 03-004-18 as the asserted universal 2013-2025 condition.', 'Seal leakage, U-joint wear and brake contamination require separate inspection findings.'],
  conflict: 'The indexed identity combines conflicting axle names, multiple components and full-year scope without one exact source.',
  summary: 'Held the internally contradictory axle identity, removed unsupported prevalence and restored axle-tag-first diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'axle tag, leak or joint location, brake contamination, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.gridHeater] = {
  ...genericIssue(rows.find((row) => row.id === ids.gridHeater)),
  description: 'Official sources establish several bounded grid-heater identities, not the frozen 2010-2025 universal relay-failure page. A manufacturer communication covers 2012-2016 6.7L engines with P2609/P0542 and calls for diagnosing the grid, relay and cable together. NHTSA 21V163 and 23V060 establish electrical-short and fire risk only for affected 2021-2023 vehicles. The frozen page combines those populations with a cold-start open-relay mechanism across sixteen years, so it remains published as an identity hold.',
  solution: 'Check the VIN for open intake-heater relay campaigns before testing. If the vehicle is in an affected fire-risk population, follow the current park-outside instruction and dealer remedy. Otherwise preserve P2609/P0542 and loaded voltage/current evidence and inspect the relay, grid and cable for overheating, open circuits or a stuck-on condition. Do not buy a relay, heater grid or cable from this page; campaign status, electrical failure mode, current part number and VIN fitment must be established first.',
  symptoms: ['VIN checked for intake-heater relay campaigns', 'P2609/P0542 and loaded circuit data preserved', 'relay, grid and cable inspected as a system', 'fire-risk population separated from cold-start diagnosis'],
  affectedSystems: ['intake heater grid and relay', 'high-current cable and power distribution', 'engine-compartment fire safety'],
  evidence: ['The 2012-2016 communication covers grid/relay DTC diagnosis and cable inspection.', '21V163 covers affected 2021 vehicles and 23V060 covers affected 2021-2023 vehicles with relay-short fire risk.', 'No exact source supports one 2010-2025 relay mechanism or universal replacement part.'],
  conflict: 'The frozen title and body merge multiple bounded source identities and sixteen model years into one failure mechanism.',
  summary: 'Held the overbroad grid-heater relay identity and separated bounded DTC diagnosis from the 2021-2023 fire-risk campaigns.',
  citations: ['live2021', 'live2023', 'datasets'],
  commerceDecision: 'campaign status, open versus stuck relay mode, grid and cable condition, current part number and VIN fitment remain unresolved; no universal retail part',
};

const pdfSources = Object.freeze({
  fifthWheelBulletin: { title: 'Stellantis TSB 08-031-20 - Missing Upfitter Auxiliary Wiring', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174209-9999.pdf', contains: ['2019', 'RAM 3500 Pickup', 'Missing Upfitter Auxiliary Wiring', '68496399AA'] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  live2021: { title: 'NHTSA Live RAM 3500 2021 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=3500&modelYear=2021' },
  live2023: { title: 'NHTSA Live RAM 3500 2023 Recall Results', type: 'recall', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=RAM&model=3500&modelYear=2023' },
});

module.exports = Object.freeze({
  make: 'RAM', frozenMakeValues: ['RAM'], model: '3500', slug: '3500', reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json', snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623', snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-3500-live-recalls-2026-08-11.json', outputFile: 'data/known-issue-ram-3500-adjudication-2026-08-11.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds, campaignEvidenceRequirements, duplicateGroups: [], sourceMakes: ['RAM', 'DODGE'], modelAliases: ['3500', 'RAM 3500', 'BR3500'],
  searchTerms: ['68RFE', 'AS69RC', 'Aisin', 'torque converter', 'exhaust brake', 'turbo actuator', 'exhaust manifold', 'fifth wheel', 'gooseneck', 'trailer wiring', 'axle seal', 'u-joint', 'hub bearing', 'grid heater', 'relay'],
  relevantDocumentIds: ['10121724', '10121737', '10174209', '11022016'], campaigns: ['21V163000', '23V060000'], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 1, '2000-2004': 8, '2005-2009': 58, '2010-2014': 47, '2015-2019': 1138, '2020-2024': 1388, '2025-2026': 475 }, totalRows: 3115, broadTermMatchedRows: 254, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 3,115 exact RAM/Dodge 3500 communication rows were searched. Exact records narrow AS69RC, auxiliary-wiring and grid-heater conditions; none proves a frozen identity at full title and year scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 41, post: 412 }, totalRows: 453, downloadedCampaignCount: 93, liveModernCampaignCount: 68, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 453 downloaded exact-alias recall rows were reconciled with 68 current campaigns returned by the live RAM 3500 API for 2010-2025. Grid-heater fire campaigns are bounded to affected 2021-2023 vehicles.' },
  content,
  requiredProse: [
    ...allIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN fitment'] })),
    { id: ids.aisin, field: 'description', patterns: ['2016', 'P2757', 'dislodged internal snap ring'] },
    { id: ids.fifthWheel, field: 'description', patterns: ['08-031-20', '2019', 'auxiliary fused wires'] },
    { id: ids.frontAxle, field: 'description', patterns: ['internally inconsistent', '11\\.5/11\\.8', '9\\.25'] },
    { id: ids.gridHeater, field: 'description', patterns: ['2012-2016', '21V163', '23V060'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All eight frozen RAM 3500 rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All pages remain published holds; none is archived, redirected or relabeled.' },
    { code: 'aisin-scope-conflict', severity: 'technical-accuracy', recordIds: [ids.aisin], detail: 'Exact 2016 P2757 snap-ring evidence does not prove a 2013-2025 universal overheating/shudder identity.' },
    { code: 'fifth-wheel-identity-conflict', severity: 'technical-accuracy', recordIds: [ids.fifthWheel], detail: '08-031-20 proves missing auxiliary wires on bounded 2019 builds, not 2013-2025 connector corrosion.' },
    { code: 'front-axle-self-conflict', severity: 'technical-accuracy', recordIds: [ids.frontAxle], detail: 'The frozen title says AAM 11.5/11.8 while the body says AAM 9.25 front axle.' },
    { code: 'grid-heater-scope-conflict', severity: 'technical-accuracy', recordIds: [ids.gridHeater], detail: 'Bounded 2012-2016 diagnosis and 2021-2023 fire campaigns do not prove one 2010-2025 mechanism.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Four unsupported owner totals are proposed unknown and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
