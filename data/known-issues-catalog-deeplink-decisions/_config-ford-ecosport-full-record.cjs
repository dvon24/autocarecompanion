const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const acPerformance = {
  years: [2018, 2019],
  trims: ['Vehicles equipped with an EVDC air-conditioning compressor'],
  engines: [],
  category: 'hvac',
  title: 'Poor A/C Performance May Require EVDC Compressor Control-Valve Testing',
  description:
    'Ford service information covers affected EcoSport vehicles equipped with an electronically variable displacement control (EVDC) air-conditioning compressor that exhibit poor A/C performance or improper climate function. Ford introduced a dedicated EVDC control-valve test to distinguish a control concern from a compressor that actually requires replacement.',
  solution:
    'Have a Ford dealer or qualified A/C technician first verify that the refrigerant charge is correct, then test the EVDC compressor with the specified control-valve tester and document the result. Do not replace the compressor solely from warm air, clutch behavior, noise, or an assumed leak; the bulletin is intended to prevent unnecessary compressor replacement and does not establish premature compressor failure.',
  severity: 'low',
  symptoms: ['Poor air-conditioning performance', 'Improper climate-system function'],
  affectedSystems: ['EVDC air-conditioning compressor', 'EVDC compressor control valve', 'refrigerant charge'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford SSM - EVDC A/C Compressor Control-Valve Testing', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164596-0001.pdf' }],
  source: 'manual',
  summary:
    'Replaced a Reddit-based premature-compressor-failure claim with Ford\'s exact EVDC diagnostic condition and test-before-replacement guidance, narrowing the years and removing unsupported noise, clutch, and leak symptoms.',
};

const oilPumpRecall = {
  years: [2018, 2019, 2020, 2021, 2022],
  trims: ['Vehicles included in Ford recall 23S64 / NHTSA 23V905'],
  engines: ['1.0L EcoBoost engine when included by VIN'],
  category: 'engine',
  title: 'Oil-Pump Drive Belt or Tensioner Can Fail and Cause Loss of Oil Pressure (Recall)',
  description:
    'NHTSA campaign 23V905, Ford recall 23S64, covers certain 2018-2022 EcoSport vehicles. The oil-pump drive belt or its tensioner may fail, causing loss of engine oil pressure. The engine can stall and power-brake assist can be lost, increasing crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers replace the oil-pump tensioner assembly and oil-pump drive belt free of charge. If engine failure occurred because of a damaged belt or tensioner, Ford authorized free engine replacement. The recall does not establish rattling, knocking, squealing, a no-restart condition, or generic oil-pressure fault codes as universal warnings.',
  severity: 'high',
  symptoms: ['Loss of engine oil pressure', 'Engine stall', 'Loss of power-brake assist after engine stall'],
  affectedSystems: ['oil-pump drive belt', 'oil-pump drive-belt tensioner', 'engine lubrication system'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - Ford EcoSport (Campaign 23V905000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=EcoSport&modelYear=2018' }],
  source: 'manual',
  summary:
    'Replaced secondary review-site evidence with the current NHTSA 23V905 recall, preserving its exact five-year scope, belt/tensioner failure, oil-pressure and brake-assist consequences, and free belt, tensioner, or engine remedy.',
};

const published = {
  'ford-ecosport-ac-compressor-2018': replacement(acPerformance, 'Retain only Ford\'s exact EVDC poor-performance diagnostic guidance and remove the unsupported premature compressor-failure diagnosis.'),
  'ford-ecosport-oil-pump-belt-2018': replacement(oilPumpRecall, 'Retain the oil-pump belt/tensioner issue under Ford 23S64/NHTSA 23V905 and replace secondary evidence with the current recall record.'),
};

const reasons = {
  'ford-ecosport-exhaust-flex-pipe-2018':
    'The frozen card relies on one secondary vehicle-review article to apply flex-pipe cracking, cold-start ticking, acceleration noise, cabin exhaust odor, catalyst or oxygen-sensor codes, and corrosion to every 2018-2022 EcoSport. No Ford bulletin, investigation, or recall reviewed defines that five-year condition.',
  'ford-ecosport-transmission-jerk-2018':
    'The frozen card combines a forum and secondary common-problems article into a five-year automatic-transmission defect spanning jerks, delays, harsh downshifts, a specific RPM shudder band, slipping, and cold sensitivity without an exact Ford bulletin, transmission, build range, cause, or remedy.',
  'ford-ecosport-water-leak-tailgate-2018':
    'The frozen card relies on a placeholder YouTube URL and applies tailgate-seal leakage, wet cargo carpet, musty odor, pooled water, and visible seal gaps to every 2018-2022 EcoSport without a Ford bulletin, investigation, or recall defining the condition.',
};

module.exports = buildConfig({
  label: 'Ford EcoSport',
  make: 'Ford',
  model: 'EcoSport',
  slug: 'ford-ecosport',
  batchId: 'ford-ecosport-full-record-cohort-105-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '81a241549da386029b290dfc141cb69502ad3e7b4a11dcc4ba680e6eab1a3486',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-ecosport/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordecosport_blind:manual-primary-source-gate',
    edge: 'fordecosport_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
