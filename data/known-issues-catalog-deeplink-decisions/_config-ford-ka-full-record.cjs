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
      dtcCodes: [],
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

const published = {
  'ford-ka-recall-cracked-driver-airbag-module-mounting-hook-steering-w': replacement(
    {
      years: [2019],
      trims: [
        'Brazil-market Ka Hatch and Sedan built 11-Feb-2019 through 19-Feb-2019',
        'Chassis range K8293090 through K8327710',
      ],
      category: 'safety',
      title: 'Brazil Recall: Driver-Airbag Mounting Hook May Be Cracked',
      description:
        'Procon-SP records Ford Brazil\'s recall of certain 2019 Ka Hatch and Sedan vehicles built from 11 through 19 February 2019. A steering-wheel-frame production issue may have cracked one of the hooks that secures the driver-airbag module. In a frontal collision with airbag deployment, the module may detach from the steering wheel and fail to protect occupants correctly.',
      solution:
        'Check the chassis number with Ford Brazil. A Ford dealer inspects the steering wheel and replaces it when necessary, free of charge. Model year alone does not establish inclusion; the campaign is limited to the stated production dates and chassis range.',
      severity: 'high',
      symptoms: ['No reliable driver-visible symptom before a crash'],
      affectedSystems: ['steering-wheel frame', 'driver-airbag module mounting hooks'],
      sources: [{ type: 'recall', title: 'Procon-SP - Ford Ka Driver-Airbag Mounting Recall', url: 'https://www.procon.sp.gov.br/recall-ford-ka/' }],
      summary:
        'Retained the Brazilian safety recall with exact body styles, production dates, chassis range, risk, and free inspect-or-replace remedy.',
    },
    'Retain the exact government-recorded recall while removing secondary reporting and requiring chassis and build-date verification.',
  ),

  'ford-ka-recall-front-seat-recliner-assembled-without-internal-lock': replacement(
    {
      years: [2019, 2020],
      trims: ['Brazil-market Ka Hatch and Sedan in the Ford-published chassis and production ranges'],
      category: 'safety',
      title: 'Brazil Recall: Front-Seat Recliner May Be Missing an Internal Lock',
      description:
        'Ford Brazil recalled certain 2019-2020 Ka Hatch and Sedan vehicles because a front-seat manual recliner may have been assembled without one of its three internal locks. During a collision, the reduced seatback locking strength may fail to restrain an occupant correctly and increase injury risk.',
      solution:
        'Confirm the chassis number with Ford Brazil or a Ford dealer. Dealers inspect the front-seat recliner mechanism and, when necessary, replace the affected seatback structure free of charge. Inclusion depends on Ford\'s published chassis and production ranges, not model year alone.',
      severity: 'high',
      symptoms: ['No reliable occupant-visible symptom before a collision'],
      affectedSystems: ['front-seat manual recliner', 'seatback structure', 'recliner internal locks'],
      sources: [{ type: 'recall', title: 'Ford Brazil - 2019-2020 EcoSport and Ka Seat-Recliner Recall', url: 'https://www.ford.com.br/servico-ao-cliente/recall/2019/ford-ecosport-e-ka-versoes-hatch-e-sedan-modelos-2019-e-2020/' }],
      summary:
        'Corrected the frozen Hatch-only scope to Ford\'s exact Hatch-and-Sedan campaign and preserved its chassis gate, collision risk, and free conditional seatback replacement.',
    },
    'Retain the exact Ford Brazil recall while removing secondary articles and correcting the omitted Sedan population.',
  ),
};

const reasons = {
  'ford-ka-electric-power-steering-failure-direcao-eletrica-avariada-wa':
    'The frozen card converts Brazilian complaint posts and a UK steering-rebuilder article into one 2015-2021 rack, column, motor, sensor, wiring, battery, charging-system, water-intrusion, recall, repair-price, and firmware narrative without an exact Ford campaign or service bulletin defining the affected population.',
  'ford-ka-oil-bathed-timing-belt-degradation-causing-oil-starvation':
    'The frozen card relies on a forum and trade-media articles to prescribe one wet-belt degradation mechanism, oil specification, inspection method, shortened replacement interval, oil-pump damage path, engine-rebuild risk, and repair price across seven model years without a Ford primary service communication defining the condition and remedy.',
};

module.exports = buildConfig({
  label: 'Ford Ka',
  make: 'Ford',
  model: 'Ka',
  slug: 'ford-ka',
  batchId: 'ford-ka-full-record-cohort-126-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '5c681565f2f151b4e5397a09224af0a45b3ec257e45387f75fce5651eae077ed',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-ka/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordka_blind:manual-primary-source-gate',
    edge: 'fordka_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
