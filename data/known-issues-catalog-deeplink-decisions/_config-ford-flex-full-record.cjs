const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines,
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
  'ford-flex-power-steering-2009': replacement(
    {
      years: [2011, 2012, 2013],
      trims: ['Certain vehicles identified by VIN; 2011-2012 engine scope differs from 2013'],
      engines: ['2011-2012: 3.5L GTDI', '2013: any available engine in the recall population'],
      category: 'steering',
      title: 'Recall 15S18: Steering Motor Sensor Fault Can Disable Power Assist',
      description:
        'NHTSA campaign 15V340 covers certain 2011-2013 Ford Flex vehicles. A steering-motor sensor fault can shut down the electric power steering assist. Manual steering remains, but substantially more effort may be required, especially at low speed.',
      solution:
        'Check the VIN for Ford recall 15S18. A Ford dealer checks the Power Steering Control Module for loss-of-assist DTCs. If covered DTCs are present, the steering gear is replaced; if none are found, the PSCM software is updated. Recall work is free of charge.',
      severity: 'high',
      symptoms: ['Sudden loss of electric power steering assist', 'Much heavier steering effort, especially at low speed'],
      affectedSystems: ['electric power steering', 'steering motor sensor', 'Power Steering Control Module', 'steering gear'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V340 / Ford Recall 15S18', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Flex&modelYear=2011' }],
      summary:
        'Narrowed the frozen 2009-2013 complaint-based card to the exact 2011-2013 safety recall population, steering-motor sensor fault, DTC gate, and software-or-steering-gear remedy.',
    },
    'Retain the exact NHTSA 15V340 safety recall and remove prices, rebuilt-unit suggestions, module-overheat claims, and the unsupported 2009-2010 population.',
  ),
};

const reasons = {
  'ford-flex-water-pump-timing-chain-2009':
    'The frozen card uses a secondary article to label the internal water-pump architecture a universal critical design flaw, asserts no external warning and inevitable catastrophic damage, and prescribes preventive replacement mileage, prices, coolant choice, and warranty purchasing without a Ford-defined defect population.',
  'ford-flex-brake-booster-2009':
    'The only citation is a fabricated-looking placeholder YouTube URL. The frozen card combines check-valve, grommet, vacuum, booster-diaphragm, hard-pedal, and hissing conditions across every 2009-2019 Flex without a Ford primary source.',
  'ford-flex-door-ajar-sensor-2009':
    'The frozen card relies on a placeholder-style YouTube URL and applies one corroded/sticking latch-switch diagnosis, contact-cleaner workaround, and latch replacement to every 2009-2019 Flex without an exact Ford bulletin.',
  'ford-flex-ptu-failure-2009':
    'The frozen card has no citations and combines seal leaks, fluid loss, heat, metal contamination, gear failure, AWD faults, maintenance intervals, inspection frequency, flushes, and prices across all AWD Flex vehicles without an exact Ford service population and remedy.',
};

module.exports = buildConfig({
  label: 'Ford Flex',
  make: 'Ford',
  model: 'Flex',
  slug: 'ford-flex',
  batchId: 'ford-flex-full-record-cohort-121-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c4e34643294e6d24543594edcdea2409787324b5098f6353ec68e18a388d0875',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-flex/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordflex_blind:manual-primary-source-gate',
    edge: 'fordflex_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
