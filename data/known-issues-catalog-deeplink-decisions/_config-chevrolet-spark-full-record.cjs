const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
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
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  cvt: source(
    'tsb',
    'GM Preliminary Information PIP5581 - CVT7 Shudder on Launch or Low-Speed Acceleration',
    'https://static.nhtsa.gov/odi/tsbs/2018/MC-10143786-9999.pdf',
  ),
  airConditioning: source(
    'tsb',
    'GM Preliminary Information PI1079 - Insufficient A/C Cooling or Rapid Compressor Cycling',
    'https://static.nhtsa.gov/odi/tsbs/2013/SB-10073470-5448.pdf',
  ),
};

const cards = {
  cvt: {
    years: [2014, 2015, 2016, 2017, 2018, 2019],
    trims: ['CVT7 automatic transmission (RPO M4M or MR8)'],
    engines: ['1.0L (RPO LL0)', '1.4L (RPO LV7)'],
    category: 'transmission',
    title: 'Short-Duration CVT Shudder from Degraded Fluid (PIP5581)',
    description: 'GM preliminary information PIP5581 applies to 2014-2019 Spark vehicles with the listed CVT7 transmissions and engines. A short-duration shudder may occur on launch from a stop or during low-speed acceleration, sometimes after braking. GM attributes this condition to degraded CVT fluid changing friction during the transmission\'s high-to-low range shift. The bulletin does not establish belt or pulley damage, eventual complete failure, or coverage of 2020-2022 vehicles.',
    solution: 'Have a technician reproduce and log the condition, then follow PIP5581. GM directs removal of the transmission pan and inspection of the magnets before the fluid procedure. Normal magnetic sludge without metal chips that can be felt is not a reason to replace the transmission. If the observed condition matches the bulletin, complete its CVT-fluid replacement procedure and re-evaluate rather than assuming the complete unit has failed.',
    severity: 'medium',
    symptoms: [
      'Short-duration shudder when launching from a stop',
      'Shudder during low-speed acceleration',
      'Shudder during a low-speed acceleration or braking maneuver',
    ],
    affectedSystems: [
      'CVT7 transmission fluid friction characteristics',
      'CVT high-to-low range shift',
    ],
    sources: [sources.cvt],
    summary: 'Narrowed the 2016-2022 failure aggregation to PIP5581\'s exact 2014-2019 engine/transmission scope, short-duration shudder mechanism, inspection criteria and fluid procedure.',
  },
  airConditioning: {
    years: [2013, 2014],
    category: 'other',
    title: 'Incorrect Refrigerant Charge Can Cause Weak A/C or Rapid Compressor Cycling (PI1079)',
    description: 'GM preliminary information PI1079 applies to 2013-2014 Spark vehicles with insufficient A/C cooling, warm air from the vents or rapid compressor cycling. GM says the refrigerant charge may be above or below specification. The bulletin does not support the frozen card\'s 2013-2022 scope or its claim that an undersized condenser or compressor is an inherent design limitation.',
    solution: 'Recover and measure the refrigerant charge using proper A/C service equipment. If the system is overcharged or undercharged, PI1079 directs recharging it to 430 g (15 oz). If the recovered charge is already correct, continue normal service-manual diagnosis; do not assume that an aftermarket fan, condenser upgrade or compressor replacement is required.',
    severity: 'low',
    symptoms: [
      'Insufficient air-conditioning cooling',
      'Warm air from the vents with A/C selected',
      'Rapid A/C compressor cycling',
    ],
    affectedSystems: [
      'air-conditioning refrigerant charge',
      'A/C compressor cycling',
    ],
    sources: [sources.airConditioning],
    summary: 'Replaced the 2013-2022 design-limitation claim and upgrade advice with PI1079\'s exact 2013-2014 refrigerant-charge condition and measurement-based procedure.',
  },
};

const published = {
  'chevrolet-spark-cvt-failure-2013': replacement(
    cards.cvt,
    'Replace the broad 2016-2022 belt/pulley failure narrative, DTCs and parts advice with PIP5581\'s exact 2014-2019 CVT7 shudder condition and fluid/metal inspection procedure.',
  ),
  'chevy-spark-ac-weak-2013': replacement(
    cards.airConditioning,
    'Replace the 2013-2022 inherent-design claim and aftermarket-upgrade recommendations with PI1079\'s exact 2013-2014 refrigerant-charge diagnosis.',
  ),
};

const reasons = {
  'chevrolet-spark-ignition-coil-2013': 'The frozen card spans two Spark generations and different engines, cites a Spark EV forum for a gasoline-engine claim, and treats generic misfire codes as proof that coils and plugs fail together. Current GM/NHTSA primary-source research did not establish the asserted model-wide failure, affected population or universal replacement sequence.',
};

module.exports = buildConfig({
  label: 'Chevrolet Spark',
  make: 'Chevrolet',
  model: 'Spark',
  slug: 'chevrolet-spark',
  batchId: 'chevrolet-spark-full-record-cohort-37-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'a7b60f20fa8588c3b2ff9ac7ab41518c848c444af5a0698e7cc837fc407b7905',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-spark/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletspark_blind:manual-primary-source-gate',
    edge: 'chevroletspark_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
