const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
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
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

const published = {
  'ford-freestar-torque-converter-2004': replacement(
    {
      years: [2004, 2005],
      trims: ['Certain vehicles identified by VIN'],
      category: 'transmission',
      title: 'Recall 12V006: Torque-Converter Output Shaft Can Fail',
      description:
        'NHTSA campaign 12V006 covers certain 2004-2005 Ford Freestar vehicles. The torque-converter output shaft can fail, causing a sudden loss of motive power without warning and increasing crash risk.',
      solution:
        'Check the VIN for the Ford/NHTSA torque-converter recall. A Ford dealer replaces the torque converter free of charge. This campaign does not establish the frozen card\'s shudder, clutch-lining contamination, valve-body, solenoid, flush, or complete-transmission-rebuild claims.',
      severity: 'high',
      symptoms: ['Sudden loss of motive power without warning'],
      affectedSystems: ['torque converter output shaft', 'automatic transmission'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 12V006 - Freestar Torque-Converter Output Shaft', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Freestar&modelYear=2004' }],
      summary:
        'Replaced the four-year shudder/failure aggregation with the exact 2004-2005 output-shaft safety recall and free torque-converter replacement.',
    },
    'Retain the exact NHTSA 12V006 safety recall and remove unrelated transmission repair paths.',
  ),
};

const reasons = {
  'ford-freestar-rear-axle-2004':
    'The frozen card has no citations and applies one trailing-arm-bushing deterioration diagnosis, axle movement, alignment, tire wear, highway wandering, polyurethane upgrade, and alignment instruction to every 2004-2007 Freestar without a Ford-defined condition.',
  'ford-freestar-blend-door-2004':
    'The only citation is a placeholder-style YouTube URL, and the frozen card assumes one actuator causes every hot/cold or clicking symptom across four model years without identifying the actuator, HVAC configuration, DTC, or Ford service procedure.',
  'ford-freestar-ignition-coil-2004':
    'The frozen card has no citations, incorrectly describes the engine as using six separate coil-on-plug units, and recommends replacing every coil and spark plug after one misfire without a Ford primary-source diagnosis.',
  'ford-freestar-torque-converter-shudder-2004':
    'This duplicates the retained torque-converter recall card but adds unsupported shudder, forward-clutch burn-up, inherited Windstar behavior, and complete-transmission failure from a placeholder-style YouTube citation.',
};

module.exports = buildConfig({
  label: 'Ford Freestar',
  make: 'Ford',
  model: 'Freestar',
  slug: 'ford-freestar',
  batchId: 'ford-freestar-full-record-cohort-123-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '5c06f8ed3f1d5855ab52fcf96c6f35ae999a3777dc24f052481d7264f0757efd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-freestar/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfreestar_blind:manual-primary-source-gate',
    edge: 'fordfreestar_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
