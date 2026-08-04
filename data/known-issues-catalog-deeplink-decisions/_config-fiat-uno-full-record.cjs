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

const selectorRecall = {
  years: [2017, 2018],
  trims: ['Uno 1.3 with automated transmission; final six chassis digits 796635-835113'],
  engines: ['1.3'],
  category: 'transmission',
  title: 'Gear-Selection Sensor Failure Can Shift the Transmission to Neutral (Brazil Recall)',
  description:
    'Fiat\'s September 2018 Brazilian recall covers 916 model-year 2017-2018 Uno 1.3 vehicles with an automated transmission within the listed non-sequential chassis range. A gear-selection sensor failure while driving can unexpectedly shift the transmission to neutral, causing loss of engine drive, reduced controllability, and increased collision risk.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s recall remedy is a free inspection and, if necessary, replacement of the gear-selection sensor. The official notice estimates approximately one hour for the service.',
  severity: 'high',
  symptoms: ['Unexpected shift to neutral while driving', 'Loss of engine drive while the vehicle is moving'],
  affectedSystems: ['gear-selection sensor', 'automated transmission'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Fiat/Stellantis - September 2018 Gear-Selection Sensor Recall', url: 'https://www.media.stellantis.com/br-pt/fiat/press/fca-faz-recall-de-sensor-de-selecao-de-marchas' }],
  source: 'manual',
  summary:
    'Narrowed the nine-year chronic Dualogic/GSR aggregation to Fiat\'s exact 916-vehicle 2017-2018 Uno 1.3 recall, removing unrelated actuators, hydraulics, DTCs, clutch wear, calibration advice, and repair-cost claims.',
};

const fuelPumpRecall = {
  years: [2016, 2017],
  trims: ['Uno Firefly within chassis range 9BD195A4NH0722618-9BD195A4NH0785160'],
  engines: ['1.0 Firefly', '1.3 Firefly'],
  category: 'fuel',
  title: 'Fuel-Pump Control Fault Can Stop the Engine (Brazil Recall)',
  description:
    'Brazil\'s Ministry of Justice reported Fiat\'s recall for 5,089 model-year 2016-2017 Uno Firefly vehicles within the listed non-sequential chassis range. During deceleration, the fuel pump may fail to pressurize the fuel line, interrupting fuel delivery and stopping the engine. On 1.3 Firefly vehicles with Start&Stop, the engine may also fail to restart automatically after a stop, increasing collision risk.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. The campaign provides a free engine-control-module software update for every affected vehicle. Affected 1.3 Firefly versions equipped with Start&Stop also receive a fuel-pump replacement.',
  severity: 'high',
  symptoms: ['Engine may stop during deceleration', 'Engine may not restart automatically on affected 1.3 Start&Stop versions'],
  affectedSystems: ['fuel pump', 'engine control module', 'fuel delivery system'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Brazil Ministry of Justice - 2016-2017 Fiat Uno Firefly Fuel-Pump Recall', url: 'https://www.gov.br/mj/pt-br/assuntos/noticias/mjc-alerta-para-recall-de-veiculos-uno-firefly-e-strada-2016-2017' }],
  source: 'manual',
  summary:
    'Rewrote the card from the Brazilian regulator notice: exact Uno count, engine and chassis scope, deceleration and Start&Stop failure modes, and model-specific remedies, removing generalized owner complaints and electrical diagnostic advice.',
};

const airbagRecall = {
  years: [2013, 2014],
  trims: ['All versions within chassis range 441221-451692 (last six digits, non-sequential)'],
  engines: [],
  category: 'safety',
  title: 'Airbag Inflator Can Rupture and Disperse Metal Fragments (Brazil Recall)',
  description:
    'Fiat\'s July 2019 Brazilian recall covers 39,588 model-year 2013-2014 Uno vehicles within the listed non-sequential chassis range. Long-term exposure to high temperature variation and absolute humidity can degrade an airbag inflator. If the airbag deploys in a collision, excessive internal pressure can rupture the inflator and disperse metal fragments, risking serious or fatal occupant injury.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s campaign provides free analysis and verification and, if necessary, replacement of the driver-side and/or passenger-side airbag modules. The official notice estimates approximately two hours for the service.',
  severity: 'high',
  symptoms: ['Latent inflator defect may only become apparent during airbag deployment'],
  affectedSystems: ['driver airbag module', 'passenger airbag module', 'occupant restraint system'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Fiat/Stellantis - July 2019 Airbag Module Recall', url: 'https://www.media.stellantis.com/br-pt/corporate/press/fca-faz-recall-de-airbag-1562912100' }],
  source: 'manual',
  summary:
    'Rewrote the airbag card directly from Fiat\'s 2019 notice, adding the exact Uno count and chassis scope and correcting the remedy to analysis, verification, and conditional module replacement rather than automatic inflator replacement.',
};

const published = {
  'fiat-uno-dualogic-gsr-automated-manual-transmission-faults-neutral-dr': replacement(
    selectorRecall,
    'Retain only Fiat\'s exact 2017-2018 Uno 1.3 gear-selection-sensor recall and archive the frozen nine-year chronic transmission aggregation, DTC list, costs, and generalized repair guidance.',
  ),
  'fiat-uno-fuel-pump-malfunction-causing-engine-stalling-official-recal': replacement(
    fuelPumpRecall,
    'Retain the safety recall using the Brazilian regulator notice, limited to its exact Firefly population, failure conditions, software update, and conditional fuel-pump replacement.',
  ),
  'fiat-uno-takata-airbag-inflator-rupture-recall': replacement(
    airbagRecall,
    'Retain the 2019 airbag campaign using Fiat\'s primary notice, limited to its exact Uno population, hazard, and inspection/conditional-replacement remedy.',
  ),
};

const reasons = {
  'fiat-uno-front-suspension-knocks-squeaks-widespread-interior-rattles':
    'The frozen card combines suspension knocks, stabilizer links, bushings, squeaks, and unrelated interior rattles across eleven model years from two owner complaints, a video, a blog, and owner-opinion pages without a Fiat bulletin defining a common population or repair.',
  'fiat-uno-plastic-thermostat-housing-cracks-coolant-leak':
    'The frozen card turns a blog, an aftermarket aluminum-housing listing, and advice for a different Fiat model into a seven-year Uno Fire Evo plastic-housing defect, overheat progression, and replacement recommendation without a Fiat primary publication.',
  'fiat-uno-start-stop-unavailable-warning-efb-battery-degradation':
    'The frozen card extrapolates a blog, a repair article about the Fiat Argo, and general battery-manufacturer guidance into a five-model-year Uno Firefly EFB-battery defect, state-of-charge threshold, calibration process, and replacement remedy without a Fiat Uno bulletin.',
};

module.exports = buildConfig({
  label: 'Fiat Uno',
  make: 'Fiat',
  model: 'Uno',
  slug: 'fiat-uno',
  batchId: 'fiat-uno-full-record-cohort-97-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'deb8f22d0de68c465393d3d2a206d701f93f3fd6810e0a3e865535b7d630a850',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-uno/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiatuno_blind:manual-primary-source-gate',
    edge: 'fiatuno_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
