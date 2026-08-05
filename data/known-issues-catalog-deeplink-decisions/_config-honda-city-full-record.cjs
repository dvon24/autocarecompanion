const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card) {
  const citations = card.sources.map((source) => ({
    type: 'recall',
    title: source.title,
    url: source.url,
  }));
  return {
    disposition: 'replace',
    decision: `The frozen ${card.frozenClaim} card relied on complaint, forum, article or aftermarket material that did not establish one complete Honda City population, mechanism and remedy. Replace it with the directly documented Brazil-market Honda recall below.`,
    evidence: citations.map((source) => ({
      type: source.type,
      label: source.title,
      url: source.url,
    })),
    after: {
      years: card.years,
      trims: [],
      engines: [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations,
      source: 'manual',
      summary: `Replaced the unsupported ${card.frozenClaim} aggregation with an exact, primary-source Brazil-market Honda recall.`,
    },
  };
}

const cards = [
  {
    id: 'honda-city-high-pressure-fuel-pump-failure-sudden-power-loss-p0087',
    frozenClaim: 'high-pressure fuel-pump failure/P0087',
    years: [2011, 2012, 2013, 2014, 2015],
    category: 'fuel',
    title: 'Fuel-Level Sensor Recall (2011-2015 Brazil-Market City)',
    description: 'Honda recalled specified 2011-2015 Brazil-market City vehicles because the fuel-level sensor could report the amount of fuel in the tank incorrectly. The inaccurate indication could let the vehicle run out of fuel and stall.',
    solution: 'Check the chassis or plate with Honda Brazil before relying on model year alone. Honda dealers replace the affected fuel-level sensor free of charge. Until the recall is completed, Honda advised keeping the tank above half full.',
    severity: 'high',
    symptoms: [
      'Fuel gauge can indicate an incorrect fuel level',
      'Vehicle can run out of fuel unexpectedly',
      'Engine can stall from fuel starvation',
    ],
    affectedSystems: ['fuel-level sensor', 'fuel gauge', 'fuel tank'],
    sources: [
      {
        title: 'PROCON-SP Honda Fuel-Level Sensor Recall Notice',
        url: 'https://www.procon.sp.gov.br/wp-content/uploads/files/Recall%20Honda%2015.05.pdf',
      },
      {
        title: 'Honda Brazil Recall Lookup',
        url: 'https://www.honda.com.br/automoveis/recall',
      },
    ],
  },
  {
    id: 'honda-city-starter-motor-brush-holder-failure',
    frozenClaim: 'starter-motor brush-holder failure',
    years: [2012, 2013, 2014],
    category: 'safety',
    title: 'Driver Airbag Inflator Rupture Recall (2012-2014)',
    description: 'Brazilian federal recall records cover specified 2012-2014 City vehicles whose Takata driver-airbag inflator can deploy with excessive pressure, rupture and project metal fragments into the cabin.',
    solution: 'Check the chassis or plate with Honda Brazil. An authorized Honda dealer replaces the affected driver-airbag inflator free of charge; do not use a retail airbag component as a substitute for the recall remedy.',
    severity: 'high',
    symptoms: [
      'No reliable warning before airbag deployment',
      'Inflator can rupture if the driver airbag deploys',
      'Metal fragments can enter the cabin',
    ],
    affectedSystems: ['driver airbag inflator', 'supplemental restraint system'],
    sources: [
      {
        title: 'Brazilian SENACON Honda City Driver-Airbag Recall',
        url: 'https://www.gov.br/mj/pt-br/assuntos/noticias/senacon-alerta-para-recall-de-veiculos-honda-e-chevrolet',
      },
      {
        title: 'Honda Brazil Recall Lookup',
        url: 'https://www.honda.com.br/automoveis/recall',
      },
    ],
  },
  {
    id: 'honda-city-takata-airbag-inflator-recall-metal-fragment-risk',
    frozenClaim: 'generic 2010-2014 Takata inflator aggregation',
    years: [2010, 2011, 2012, 2013, 2014],
    category: 'safety',
    title: 'Passenger Airbag Inflator Rupture Recalls (2010-2014)',
    description: 'Brazilian federal and state recall records cover specified 2010-2014 City populations whose Takata passenger-airbag inflator can deteriorate, deploy with excessive pressure, rupture and project metal fragments into the cabin.',
    solution: 'Check the chassis or plate with Honda Brazil because separate campaign populations apply by model year. An authorized Honda dealer replaces the affected passenger-airbag inflator free of charge.',
    severity: 'high',
    symptoms: [
      'No reliable warning before airbag deployment',
      'Inflator can rupture if the passenger airbag deploys',
      'Metal fragments can enter the cabin',
    ],
    affectedSystems: ['passenger airbag inflator', 'supplemental restraint system'],
    sources: [
      {
        title: 'Brazilian SENACON 2010-2011 Honda City Passenger-Airbag Recall',
        url: 'https://www.gov.br/mj/pt-br/assuntos/noticias/senacon-alerta-para-recall-de-mais-de-300-mil-veiculos',
      },
      {
        title: 'PROCON Goiás 2012 Honda City Passenger-Airbag Recall',
        url: 'https://goias.gov.br/procon/recall-honda-civic-2001-a-2002-fit-2012-city-2012-accord-2012-falha-no-insuflador-do-airbag-lado-do-passageiro/',
      },
      {
        title: 'PROCON Goiás 2011-2014 Honda City Recall Record',
        url: 'https://goias.gov.br/procon/recall-no-08012-0018042015-93-2/',
      },
      {
        title: 'Honda Brazil Recall Lookup',
        url: 'https://www.honda.com.br/automoveis/recall',
      },
    ],
  },
];

const published = Object.fromEntries(
  cards.map((card) => [card.id, replacement(card)]),
);

const reasons = {
  'honda-city-cvt-judder-premature-transmission-failure':
    'The cited complaint, forum and SEO pages do not establish one bounded City production population, one CVT failure mechanism or a Honda repair campaign. They cannot support a universal diagnosis or transmission-replacement recommendation.',
  'honda-city-premature-hood-rust-paint-blistering':
    'The cited complaint, blog and SEO pages do not establish one bounded City production population, one manufacturing defect or an authoritative Honda repair. The fixed repaint guidance and costs are not primary-source supported.',
  'honda-city-steering-rack-noise-play':
    'The cited forums, complaints and aftermarket-parts page combine 2009-2014 and 2022-2023 generations without one verified steering-rack mechanism, affected population or Honda remedy. A universal bushing or rack replacement is not defensible.',
};

module.exports = buildConfig({
  label: 'Honda City',
  make: 'Honda',
  model: 'City',
  slug: 'honda-city',
  batchId: 'honda-city-full-record-cohort-165-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '9aab19c7fd9bcb25c37a3f882ce7f614074a08579cae6cf72041cf8954063304',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/honda-city/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'hondacity_blind:manual-primary-source-gate',
    edge: 'hondacity_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
