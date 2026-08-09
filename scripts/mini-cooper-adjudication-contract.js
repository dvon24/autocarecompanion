/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  expansionTank: 'mini-all-coolant-leak-expansion-2007',
  epsRack: 'mini-cooper-eps-rack-2014',
  oilVanos: 'mini-cooper-oil-leak-vanos-2007',
  thermostatPump: 'mini-cooper-thermostat-2007',
  timingChain: 'mini-cooper-timing-chain-2007',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10000481', '10002144', '10032985', '10040741', '10049421', '10049422',
  '10054635', '10055137', '10057380', '10057573', '10076071', '10076072',
  '10076073', '10076074', '10076075', '10076076', '10076078', '10076095',
  '10076096', '10076097', '10135056', '10136747', '10146728', '10146752',
  '10146796', '10146799', '10146925', '10146979', '10147576', '10147641',
  '10147906', '10148058', '10148149', '10148150', '10148358', '10148393',
  '10149266', '10149505', '10149621', '10149622', '10151232', '10171512',
  '10176384', '10216752', '10216753', '10216754',
]);
const campaigns = Object.freeze([
  '02V201000', '03V086000', '04V348000', '05V470000', '08E050000', '09E025000',
  '09V474000', '14V422000', '14V619000', '14V721000', '14V789000', '15V034000',
  '15V205000', '15V450000', '15V628000', '15V660000', '15V739000', '16V747000',
  '16V914000', '17V222000', '18V465000', '19V601000', '19V634000', '20V283000',
  '21V554000', '23V337000', '24V104000', '24V697000', '25V616000',
]);
const pdfSources = Object.freeze({
  epsStartup: {
    title: 'MINI SIM 32 01 14 - Power-assisted Steering Intermittently Not Available at Engine Start-up',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10171512-9999.pdf',
    sha256: 'c3b8e7440797dccc0656e3942819df462e6893e9f220603dcbed62b3d1a59f5b',
    pageCount: 3,
    visuallyReviewedPages: [1],
  },
  mechanicalWaterPump: {
    title: 'MINI SI M01 12 16 - Engine Mechanical Water Pump Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10146799-9999.pdf',
    sha256: '1c1c7902c2b9e415dac2bbf8feb541119602032a3561574ef77764dae8a2ff8c',
    pageCount: 6,
    visuallyReviewedPages: [1],
  },
  n18Thermostat: {
    title: 'MINI SI M01 02 18 - N18 Thermostat with Thermostat Housing Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10135056-9999.pdf',
    sha256: 'e949b074d5c7e5c2b519b209a6c3117d1ce3ccb0844f796a8ae687c5d2aaf11a',
    pageCount: 8,
    visuallyReviewedPages: [1],
  },
  n14TimingAction: {
    title: 'MINI SI M11 04 13 - N14 Engine Check Timing Chain Tensioner and Timing Chain',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10054635-2047.pdf',
    sha256: 'ba7a8c1e8fbd049b24f3d6193c0b10053dac343bdf9d122cb2bef43e43f69c49',
    pageCount: 8,
    visuallyReviewedPages: [1],
  },
  tensionerSeal: {
    title: 'MINI SI M11 03 11 - Timing Chain Tensioner Resealing or Replacement Procedures',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10044037-8778.pdf',
    sha256: '07d0b9a08fe376f3648317e392026af08c6b2e6a50a8b10acb35462d6cb2afca',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.expansionTank]: {
    description: 'The reviewed MINI manufacturer-communication and recall corpus does not establish a recurring coolant-expansion-tank cracking identity across R56, R60 and F56 platforms or the frozen 2007-2020 year range. The corpus contains separate mechanical-water-pump, thermostat, sensor and cooling-fan conditions, but those records cannot be converted into proof that one plastic tank becomes brittle or cracks at a common rate.',
    solution: 'Pressure-test the cold cooling system and cap to the manufacturer specification, then inspect the expansion tank seams and neck, cap seal, hose connections, thermostat housing, mechanical water pump, radiator and heater circuit to find the exact source. Record the chassis, engine and installed tank before ordering. Do not buy expansion tank 17137823626, cap 17117639020, coolant 82141467704, a Gates hose or Prestone coolant from this page; the leaking component, coolant specification and VIN fitment must be proven first.',
    symptoms: ['chassis and engine recorded before diagnosis', 'cold-system and cap pressure tests documented', 'tank, cap, hose, thermostat, pump and radiator sources separated'],
    affectedSystems: ['coolant expansion tank and pressure cap', 'thermostat housing, pump and hoses', 'radiator and heater coolant circuits'],
    evidence: ['No matching expansion-tank cracking communication appears in the exact Cooper corpus.', 'The reviewed cooling communications describe different components and bounded chassis or engine populations.', 'The frozen 2,200-owner count, common-all-platform claim and five-year preventive replacement interval have no auditable source.'],
    conflict: 'The indexed all-platform expansion-tank identity and frequency exceed exact primary evidence.',
    summary: 'Held the expansion-tank identity, removed invented social proof and required pressure-tested leak localization before parts.',
    citations: ['datasets'],
  },
  [ids.epsRack]: {
    description: 'MINI SIM 32 01 14 documents intermittent loss of electric steering assistance at startup on F56 and related chassis in a bounded 2013-2016 production window. Its current correction is fault-guided diagnosis and programming, with parts not required. It does not establish recurring rack-motor or rack-control-module hardware failure through 2025 or sudden in-motion failure across the frozen population.',
    solution: 'Treat any steering-assist loss as a safety fault and reduce speed or stop where safe. Record whether it occurs only at startup or while moving, test battery voltage and power supply, scan EPS, DSC and network faults with MINI-capable equipment, and follow the exact ISTA test module before programming or mechanical inspection. Do not buy rack 32106889527, a remanufactured rack, tie rods, Moog or Cardone parts from this page; software, communication, power-supply and mechanical rack causes require different repairs and VIN fitment.',
    symptoms: ['startup-only versus in-motion assist loss recorded', 'battery, EPS communication and stored faults tested', 'software path separated from mechanical steering and rack faults'],
    affectedSystems: ['electric power steering control and communication', '12-volt supply and vehicle network', 'steering rack, angle sensing and linkage'],
    evidence: ['SIM 32 01 14 applies to a bounded F56 production period and directs ISTA diagnosis.', 'The 2020 revision states programming to the latest level and parts not required.', 'The frozen 1,200-owner count and generic C1Axx fault list have no auditable MINI source.'],
    conflict: 'The indexed rack-failure identity converts a bounded startup EPS condition into a recurring hardware-rack claim across 2014-2025.',
    summary: 'Held the rack-failure identity, removed invented social proof and required EPS fault-guided diagnosis before any rack.',
    citations: ['epsStartup', 'datasets'],
  },
  [ids.oilVanos]: {
    description: 'The reviewed Cooper corpus does not establish one combined valve-cover-gasket and VANOS-solenoid-seal leak identity across N12, N16 and N18 engines or 2007-2016. MINI communications identify other bounded oil paths, including a cylinder-head sealing plug and timing-chain-tensioner seal; those cannot prove the frozen exhaust-manifold, VANOS-pooling or misfire mechanism.',
    solution: 'Clean the engine and use dye or tracing powder to identify the highest fresh-oil point. Record the engine code and inspect the valve-cover perimeter, integrated crankcase-ventilation system, cylinder-head sealing plug, timing-chain tensioner seal, VANOS connectors and adjacent vacuum-pump or oil-filter-housing areas separately. Do not buy valve cover 11128645888, Victor Reinz 15-33677-01, VANOS seals, Mobil 1 oil or a Wix filter from this page; leak source, engine configuration and part fitment must be proven first.',
    symptoms: ['engine code and highest fresh-oil point documented', 'valve-cover, PCV, sealing-plug and tensioner paths separated', 'VANOS connector oil distinguished from an actuator or control fault'],
    affectedSystems: ['valve cover and crankcase ventilation', 'VANOS solenoids and connectors', 'cylinder-head, tensioner and nearby oil seals'],
    evidence: ['No exact communication in the reviewed corpus supports the combined frozen valve-cover and VANOS identity.', 'Separate primary records identify other oil-leak paths that require localization.', 'The frozen 2,500-owner count, integrated-cover statement and listed part numbers have no audited fitment source.'],
    conflict: 'The indexed page combines two leak mechanisms across three engine families without exact source or fitment support.',
    summary: 'Held the combined oil-leak identity, removed invented social proof and blocked unverified valve-cover and VANOS parts.',
    citations: ['tensionerSeal', 'datasets'],
  },
  [ids.thermostatPump]: {
    description: 'MINI SI M01 12 16 supports a mechanical water-pump warranty extension for eligible R56 Cooper N12/N16 vehicles within bounded production dates. SI M01 02 18 covers an N18 thermostat housing on specific Cooper S and JCW variants, not the base Cooper. These sources do not support the frozen combined "electric thermostat and water pump" identity across R56 and early F56 or its mixed mechanical/electric mechanism.',
    solution: 'Record the chassis and engine, pressure-test the cooling system, scan manufacturer thermostat and temperature faults, verify temperature-sensor plausibility, and distinguish the mechanical pump, friction wheel, thermostat housing, sensor, fan and coolant leak. Do not replace components together merely to save labor. Do not buy thermostat 11537534521, Mahle TI25297, pump 11517648827, Gates 41193E, a GMB pump, Stant thermostat, hose or generic coolant from this page; the failed component and exact engine fitment must be proven first.',
    symptoms: ['chassis, engine and production date recorded', 'pressure, temperature plausibility and manufacturer faults checked', 'mechanical pump, friction wheel, thermostat and sensor paths separated'],
    affectedSystems: ['engine mechanical water pump and friction wheel', 'thermostat housing and temperature sensing', 'cooling fan, hoses and coolant circuit'],
    evidence: ['SI M01 12 16 covers an engine mechanical water pump and explicitly excludes an electric pump.', 'SI M01 02 18 applies to bounded N18 S/JCW variants, not the frozen base-Cooper range.', 'The frozen 2,800-owner count and replace-together advice have no auditable source.'],
    conflict: 'The indexed title and body combine different pump architectures, thermostat populations and generations under one failure identity.',
    summary: 'Held the combined thermostat/pump identity, removed invented social proof and separated exact engine and component paths.',
    citations: ['mechanicalWaterPump', 'n18Thermostat', 'datasets'],
  },
  [ids.timingChain]: {
    description: 'MINI SI M11 04 13 establishes a timing-chain-tensioner service action for N14 engines, not the frozen N12/N16 base-Cooper identity. SI M11 03 11 includes N12 and N16 only for a timing-chain-tensioner seal leak or a separate rattle procedure and explicitly says not to replace the tensioner for the seal leak. The reviewed evidence therefore does not establish premature N12/N16 guide deterioration or the frozen 2007-2013 mechanism.',
    solution: 'Verify the engine code before any timing work. Record cold-start and hot-idle noise, oil level and pressure, correlate crankshaft and camshaft timing with MINI-capable diagnostics, and inspect the tensioner seal and source of any oil leak. Use the manufacturer chain measurement and timing procedures before teardown. Do not buy a BGA TC0380FK, Cloyes timing kit, tensioner, guide set, water pump, thermostat or Castrol oil from this page; N14 evidence cannot be transferred to N12/N16 and the failed part must be measured.',
    symptoms: ['engine code verified before applying a timing bulletin', 'cold-start noise, oil pressure and cam/crank correlation documented', 'tensioner seal leak separated from chain elongation or guide damage'],
    affectedSystems: ['timing chain, tensioner and guide rails', 'camshaft and crankshaft timing correlation', 'tensioner seal and engine lubrication'],
    evidence: ['SI M11 04 13 is explicitly N14 and cannot prove an N12/N16 service-action population.', 'SI M11 03 11 covers N12/N16 tensioner resealing and says not to replace the tensioner for the seal leak.', 'The frozen 3,200-owner count, broad DTC list and catastrophic-guide mechanism have no exact audited source.'],
    conflict: 'The indexed N12/N16 tensioner-failure identity appears to transfer an N14 action to different engines.',
    summary: 'Held the N12/N16 timing identity, removed invented social proof and prevented an N14-to-N12/N16 evidence transfer.',
    citations: ['n14TimingAction', 'tensionerSeal', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Cooper', slug: 'cooper', reviewDate: '2026-08-09',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-cooper-adjudication-2026-08-09.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds: allIds,
  modelAliases: ['COOPER', 'MINI COOPER', 'COOPER HARDTOP', 'HARDTOP', 'R56 COOPER', 'F56 COOPER'],
  searchTerms: ['expansion tank', 'coolant tank', 'steering rack', 'electric power steering', 'EPS', 'valve cover', 'VANOS solenoid', 'thermostat', 'water pump', 'timing chain', 'chain tensioner', 'guide rail'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 1, '2000-2004': 20, '2005-2009': 20, '2010-2014': 55, '2015-2019': 549, '2020-2024': 178, '2025-2026': 62 },
    totalRows: 885, relevantRowCount: 46, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 13, post: 52 }, totalRows: 65, campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twenty-nine federal campaigns exist in the Cooper alias set, but none establishes one of the five frozen model-wide identities.',
  },
  content,
  requiredProse: [
    { id: ids.epsRack, field: 'description', patterns: ['parts not required', 'does not establish recurring rack'] },
    { id: ids.thermostatPump, field: 'description', patterns: ['mechanical water-pump', 'do not support the frozen combined'] },
    { id: ids.timingChain, field: 'description', patterns: ['N14 engines, not the frozen N12/N16', 'not to replace the tensioner'] },
  ],
  observations: [
    { code: 'all-cooper-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All five identities overstate frequency, mechanism, engine or chassis applicability.' },
    { code: 'eps-hardware-transfer-blocked', severity: 'safety', recordIds: [ids.epsRack], detail: 'Current F56 startup-assist guidance is diagnostic/programming-first and does not prove a recurring rack hardware failure.' },
    { code: 'n14-timing-transfer-blocked', severity: 'engine-scope', recordIds: [ids.timingChain], detail: 'An N14 service action is not used as proof of an N12/N16 failure identity.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'All five nonzero owner totals lack auditable reports and are proposed as unknown zero.' },
    { code: 'all-cooper-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Cooper page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
