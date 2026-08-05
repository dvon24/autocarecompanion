const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
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
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Tempo&modelYear=${year}`;

const published = {
  'ford-tempo-automatic-transaxle-1990': replacement(
    {
      years: [1990],
      trims: ['Vehicles equipped with affected driver-airbag modules'],
      category: 'safety',
      title: 'Driver-Airbag Inflator Component Separation Recall',
      description:
        'NHTSA campaign 90E043001 covers certain 1990 Ford Tempo driver-airbag modules. Threaded inflator components may have been damaged during assembly and can separate during deployment, allowing hot combustion gases into the passenger compartment.',
      solution:
        'Check the VIN and airbag campaign-completion history with Ford. The recall remedy replaces airbag modules containing affected inflators. Airbag modules contain pyrotechnic components and require qualified service under the manufacturer procedure.',
      severity: 'high',
      symptoms: ['No reliable driver-observable warning is specified before airbag deployment'],
      affectedSystems: ['driver frontal airbag module', 'airbag inflator threaded components'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 90E043001 - Ford Tempo Airbag Inflator', url: recalls(1990) }],
      summary:
        'Replaced a Wikipedia and forum-based transaxle failure narrative with the exact 1990 Ford airbag inflator recall.',
    },
    'The frozen transaxle card combines clutch packs, bands, governor, differential, multiple transmissions, rebuild prices, a shift kit, fluid intervals, and a manual swap without Ford primary evidence.',
  ),

  'ford-tempo-coolant-leak-heater-1990': replacement(
    {
      years: [1992, 1993, 1994],
      trims: ['Vehicles in the cold-climate jurisdictions specified by NHTSA'],
      engines: ['3.0L (1992-1994 population)', '2.3L (1994 population)'],
      category: 'engine',
      title: 'Snow-Blocked Cooling-Fan Motor Fire Recall',
      description:
        'NHTSA campaign 97V019 covers specified 1992-1994 Tempo vehicles in Alaska, Iowa, Minnesota, Nebraska, North Dakota, and South Dakota. In high winds, heavy drifting snow, and low temperatures, snow can block or freeze the engine cooling fan, causing its motor, wiring, fan, or shroud to overheat, smoke, or burn.',
      solution:
        'Check the VIN, engine, location history, and recall completion with Ford. Dealers install an electrical jumper harness containing an automatic-resetting circuit breaker for the fan motor low-speed circuit. Smoke, melting, or burning odor at the fan requires immediate shutdown and professional service.',
      severity: 'high',
      symptoms: ['Cooling fan may be blocked or frozen by snow', 'Possible smoke or flame from the fan, shroud, wiring, or motor'],
      affectedSystems: ['engine cooling fan', 'fan motor low-speed circuit', 'protective circuit breaker harness'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 97V019 - Tempo Cooling-Fan Snow Intrusion', url: recalls(1994) }],
      summary:
        'Replaced a fabricated video-based heater-core leak card with the exact regional cooling-fan fire recall and circuit-breaker remedy.',
    },
    'The frozen card generalized heater-core leakage, dashboard work, system flushing, and hose replacement to every 1990-1994 Tempo from a placeholder-style video URL.',
  ),

  'ford-tempo-ignition-module-1990': replacement(
    {
      years: [1990, 1991, 1992, 1993, 1994],
      trims: ['Vehicles identified by VIN under the ignition-switch campaign'],
      category: 'electrical',
      title: 'Ignition-Switch Internal-Short Fire Recall',
      description:
        'NHTSA campaign 96V071 includes Ford Tempo vehicles whose ignition switch can develop an internal short circuit, causing overheating, smoke, and possibly a fire in the steering-column area.',
      solution:
        'Check the VIN and recall-completion history with Ford. Dealers replace the ignition switch. Heat, smoke, melting, or burning odor in the steering-column area requires immediate shutdown and keeping the vehicle away from structures until it is professionally inspected.',
      severity: 'high',
      symptoms: ['Possible overheating, smoke, or fire in the steering-column area'],
      affectedSystems: ['ignition switch', 'steering-column electrical system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 96V071 - Ford Tempo Ignition Switch', url: recalls(1992) }],
      summary:
        'Replaced a Reddit-based TFI relocation recommendation with the exact ignition-switch internal-short recall and replacement remedy.',
    },
    'The frozen card cited a single Reddit thread and prescribed remote-mount hardware and heat-sink compound without a Ford bulletin. Retain the actual ignition-related safety campaign instead.',
  ),
};

const reasons = {
  'ford-tempo-head-gasket-1990':
    'Two owner-forum threads do not establish one premature HSC head-gasket defect, failure location, mileage threshold, coolant-chemistry mechanism, MLS replacement, head resurfacing, bolt replacement, or bundled cooling-system repair for every 1990-1994 Tempo.',
  'ford-tempo-lower-control-arm-1990':
    'The frozen card has no citation and asserts rapid salt-related bushing deterioration, non-serviceable bushings, universal two-arm replacement, prices, bundled strut and sway-link replacement, and alignment for every 1990-1994 Tempo without Ford evidence.',
};

module.exports = buildConfig({
  label: 'Ford Tempo',
  make: 'Ford',
  model: 'Tempo',
  slug: 'ford-tempo',
  batchId: 'ford-tempo-full-record-cohort-133-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '8e9a13ea67f4691f45aca7cc4f09079ca8c054d2b9def94023a66e5daef1ca14',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-tempo/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordtempo_blind:manual-primary-source-gate',
    edge: 'fordtempo_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
