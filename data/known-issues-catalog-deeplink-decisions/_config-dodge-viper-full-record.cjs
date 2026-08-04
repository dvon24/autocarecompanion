const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'dodge-viper-clutch-slave-1992':
    'The frozen card asserts one heat-driven concentric-slave-cylinder failure mechanism across every Viper generation, including track-use behavior and parts recommendations, from two forum labels without working deep links or a Dodge primary source defining that scope.',
  'dodge-viper-clutch-slave-cylinder-hydraulic-failure':
    'This duplicates the other clutch-hydraulic card and adds prevalence, seal-degradation, vibration, heat, bleeding, and transmission-removal claims for 1992-1999 from forums and a parts retailer rather than a Chrysler service publication.',
  'dodge-viper-coolant-crossover-2008':
    'The frozen card includes nonexistent Viper model years 2011 and 2012 and cites fabricated-looking forum and video URLs, so neither its Gen IV/V scope nor its Viton O-ring remedy is publishable.',
  'dodge-viper-door-hinge-wiring-fracture':
    'The frozen card turns several owner discussions and a repair-kit listing into a four-year model-wide wiring defect without a Chrysler bulletin defining the affected harness, diagnosis, or repair. NHTSA campaign 15V178 concerns a different 2013-2014 door-switch condition and cannot substantiate this card.',
  'dodge-viper-head-gasket-1992':
    'The frozen card claims an inadequate Gen I composite-gasket design and a permanent Gen II MLS conversion fix from forums and a parts listing, without an OEM bulletin establishing the failure mechanism, affected population, machining requirement, or compatibility.',
  'dodge-viper-oil-consumption-2003':
    'The frozen card spans 15 years, including nonexistent 2007, 2011, and 2012 Vipers, and supplies oil-consumption rates, catalyst consequences, service thresholds, and repair advice with no citation.',
  'dodge-viper-overheating-stop-go-traffic':
    'The frozen card combines two generations, fan airflow figures, ambient-temperature thresholds, relays, pumps, gaskets, gauge accuracy, rewiring, swaps, and aftermarket cooling remedies from community and secondary articles without one Chrysler source defining the condition.',
  'dodge-viper-power-steering-fluid-fire':
    'The frozen card makes catastrophic-frequency, service-causation, reservoir-location, ignition, and mandatory-upgrade claims for 1992-1999 from forums and a secondary project article; no Dodge recall or service bulletin in the reviewed record establishes that population and remedy.',
  'dodge-viper-rod-bearing-2003':
    'The frozen card attributes seven model years of catastrophic rod-bearing failure to track-use oil starvation and prescribes aftermarket oiling changes using only forum anecdotes, with no Chrysler primary source defining the failure or approved remedy.',
  'dodge-viper-side-exit-exhaust-sill-cockpit-heat':
    'The frozen card applies one side-exhaust heat narrative to both generations and recommends vents, wrap, covers, coatings, and exhaust conversion from secondary and forum sources without an OEM publication defining a model-specific repairable defect.',
};

module.exports = buildConfig({
  label: 'Dodge Viper',
  make: 'Dodge',
  model: 'Viper',
  slug: 'dodge-viper',
  batchId: 'dodge-viper-full-record-cohort-88-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f254d49dfcad032622e3487b447a0e780dbe1a836d1efac58acac614bc70cb90',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-viper/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeviper_blind:manual-primary-source-gate',
    edge: 'dodgeviper_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V366000', '01V120000', '01V312000', '01V313000', '03V292000', '03V388000',
    '06E022000', '13V040000', '15V046000', '15V178000', '15V461000', '19V885000',
    '97V080000',
  ],
});
