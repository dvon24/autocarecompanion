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

const suspensionRecall = {
  years: [2024, 2025],
  trims: ['Toro within chassis range RKF61847-SKF86888'],
  engines: [],
  category: 'suspension',
  title: 'Front Suspension Fasteners May Be Improperly Tightened (Brazil Recall)',
  description:
    'Fiat\'s October 2024 Brazilian recall covers 2024-2025 Toro vehicles within the listed non-sequential chassis range. The front-suspension fixing bolts and nuts may not have been tightened correctly, creating a risk that the front wheels can move out of position and cause a crash with serious or fatal injury.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s recall remedy is free application of the correct tightening torque to the front-suspension fixing bolts and nuts. The official notice estimates approximately one hour for the service.',
  severity: 'high',
  symptoms: ['Latent fastener-torque defect may exist without a driver warning'],
  affectedSystems: ['front suspension fasteners', 'front wheel retention'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Stellantis Brazil - October 2024 Fiat Toro Front Suspension Recall', url: 'https://www.media.stellantis.com/br-pt/corporate-communications/press/comunicado-de-recall-fiat-toro' }],
  source: 'manual',
  summary:
    'Rewrote the recall directly from Fiat\'s notice, adding the omitted 2025 model year and removing unsupported knocks, steering symptoms, visible gaps, stop-driving advice, and inspection language.',
};

const fuelPumpRecall = {
  years: [2022, 2023],
  trims: ['Toro within chassis range NKD97699-PKE96432'],
  engines: [],
  category: 'fuel',
  title: 'High-Pressure Fuel-Pump Bolt Can Break and Leak Fuel (Brazil Recall)',
  description:
    'Fiat\'s November 2022 Brazilian recall covers 316 model-year 2022-2023 Toro vehicles within the listed non-sequential chassis range. The bolt securing the high-pressure fuel pump to the engine can break and, in an extreme case, allow fuel to leak, creating a fire risk and the potential for serious or fatal injury.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s campaign provides a free inspection and, if necessary, replacement of the high-pressure fuel-pump assembly. The official notice estimates approximately two hours for the service.',
  severity: 'high',
  symptoms: ['Fuel leakage may occur if the pump mounting bolt breaks'],
  affectedSystems: ['high-pressure fuel pump', 'fuel system'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Fiat/Stellantis - November 2022 High-Pressure Fuel-Pump Recall', url: 'https://www.media.stellantis.com/br-pt/fiat/press/fca-faz-recall-de-bomba-de-alta-pressao-de-combustivel' }],
  source: 'manual',
  summary:
    'Rewrote the recall from Fiat\'s primary notice, retaining its exact Toro count, years, chassis scope, hazard, and remedy while removing unsupported engine identification, powertrain history, fuel smell, misfire, and stalling claims.',
};

const published = {
  'fiat-toro-recall-front-suspension-fastener-bolts-nuts-may-be-improperl': replacement(
    suspensionRecall,
    'Retain the safety recall using Fiat\'s primary notice, corrected to include both 2024 and 2025 and limited to its exact chassis, hazard, and tightening remedy.',
  ),
  'fiat-toro-recall-high-pressure-fuel-pump-mounting-bolt-may-break-fuel': replacement(
    fuelPumpRecall,
    'Retain the safety recall using Fiat\'s primary notice, removing engine and symptom claims that the notice does not establish while preserving its exact years, chassis scope, hazard, and remedy.',
  ),
};

const reasons = {
  'fiat-toro-2-4-tigershark-multiair-engine-excessive-oil-consumption-sta':
    'The frozen card extrapolates US litigation and individual Brazilian complaints into a four-model-year Toro 2.4 population, oil-consumption threshold, stall mechanism, monitoring interval, software path, and engine-repair remedy without a Fiat Brazil bulletin or recall defining that scope.',
  'fiat-toro-at9-9-speed-automatic-harsh-shifting-clunks-limp-mode-diesel':
    'The frozen card combines nine model years, unspecified diesel configurations, owner complaints, a buying guide, and a consumer-agency article into one ZF AT9 defect and software-or-hardware remedy without a Fiat service publication defining an affected population.',
  'fiat-toro-electrical-system-faults-infotainment-freezes-rapid-battery':
    'The frozen card merges infotainment freezes, warning lights, rapid battery discharge, start-stop behavior, voltage sensitivity, module shutdowns, and general electrical failures across nine model years using owner reports, blogs, a repair forum, and iFixit rather than an exact Fiat bulletin.',
  'fiat-toro-transmission-heat-exchanger-failure-causing-coolant-transmis':
    'The frozen card applies one coolant-and-transmission-fluid cross-contamination narrative and replacement procedure to eight Toro model years from aftermarket repair articles and secondary reporting; no Fiat bulletin or recall establishes that population or remedy.',
};

module.exports = buildConfig({
  label: 'Fiat Toro',
  make: 'Fiat',
  model: 'Toro',
  slug: 'fiat-toro',
  batchId: 'fiat-toro-full-record-cohort-96-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '8c7ed65a40c97bdc4ffab406649ed73f8a79cc70bc38f2f2a12de1950af60002',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-toro/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiattoro_blind:manual-primary-source-gate',
    edge: 'fiattoro_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
