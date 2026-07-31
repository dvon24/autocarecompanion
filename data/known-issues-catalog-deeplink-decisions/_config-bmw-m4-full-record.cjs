const {
  buildConfig,
} = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: 'BMW M4',
  model: 'M4',
  slug: 'bmw-m4',
  batchId: 'bmw-m4-full-record-cohort-20-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '90a76664e72e97495ca8014bf37509641d9b8d63a44161197002325fccb728e9',
  sourceSnapshotFileHash:
    '5a3230b669ffcb3c57a69e5b0ca2f3101f7a1e68b6d3baaa31f82d18e0cf316c',
  packetFileHash:
    'eb856dd2819bcbd4848c7973b04e401d213cfe09d698564f8e0edd694550e82a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m4/90a76664e72e/all-0001.json',
  reviewTokens: {
    blind: 'bmwm4_blind:self-no-blocker',
    edge: 'bmwm4_edge:self-no-blocker',
  },
  reasons: {
    'bmw-m4-rear-subframe-crack-2015':
      'The clicked reinforcement link belongs to a track-use cracking claim that conflates F82/F83 and G82/G83 structures. NHTSA 16V-653 instead concerns VIN-specific reused rear-subframe bolts after a prior differential service action, not population-wide cracking, welding or gusset reinforcement.',
    'bmw-m4-charge-pipe-blowoff-2015':
      'No cited BMW bulletin or regulator record establishes the six-year F82/F83 charge-pipe failure population, a boost threshold or automatic aftermarket aluminum-pipe remedy.',
    'bmw-m4-convertible-top-2015':
      'A complaint and forum index do not establish one F83 hydraulic-pump, leak or microswitch failure mechanism, production boundary or universal pump replacement.',
    'bmw-m4-cooling-track-2015':
      'Track temperature observations do not establish a street-vehicle defect or a universal radiator, oil-cooler and heat-exchanger replacement package.',
    'bmw-m4-crank-hub-bolt-2015':
      'The frozen card has no primary citation and presents an aftermarket keyed or pinned hub modification as mandatory without a BMW campaign, production population or diagnosis.',
    'bmw-m4-dct-clutch-2015':
      'A complaint and forum discussion do not establish clutch-pack wear as the common cause of shudder, a 30,000-mile DCT service interval or a universal clutch replacement.',
    'bmw-m4-s55-crank-hub-2015':
      'This duplicates the crank-hub-bolt aggregation and relies on a generic vehicle page plus fabricated or unavailable social/video URLs rather than a BMW defect/remedy document.',
    'bmw-m4-s55-injector-2015':
      'The broad 2015-2020 injector card is not equivalent to NHTSA 20V-666, which is VIN-specific to certain 2020 M4 Coupes with a missing damping component. The existing ID cannot be silently converted into that narrower recall.',
    'bmw-m4-s55-rod-bearing-2015':
      'Forum and used-oil-analysis discussion do not establish a six-year defect population, a preventive replacement interval or the frozen aftermarket bearing-and-bolt package.',
  },
  proposalCampaigns: [
    '15V782000',
    '16V653000',
    '18V713000',
    '24V288000',
    '17V115000',
    '16V914000',
    '17V507000',
    '19V352000',
    '20V666000',
    '21V554000',
    '21V062000',
    '25V643000',
  ],
});
