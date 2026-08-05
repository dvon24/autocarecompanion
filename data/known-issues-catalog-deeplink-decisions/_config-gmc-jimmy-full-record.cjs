const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
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

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=JIMMY&modelYear=${year}`;

const published = {
  'gmc-jimmy-ball-joint-failure-1995': replacement(
    {
      years: [1996, 1997],
      category: 'suspension',
      title: 'Corrosion-Related Upper Ball Joint Recall',
      description: 'NHTSA campaign 01V200 covers certain 1996-1997 GMC Jimmy vehicles originally sold in or currently registered in the campaign\'s listed corrosion states or the District of Columbia. Corrosion can cause an upper control-arm ball-joint assembly to fail, impairing steering or allowing the front suspension to collapse.',
      solution: 'Check the VIN and campaign eligibility with GMC or NHTSA. Dealers replace both upper ball joints free of charge under the recall.',
      symptoms: ['Steering may become impaired', 'Upper ball-joint failure can allow partial or complete front-suspension collapse'],
      affectedSystems: ['front upper control arms', 'upper ball-joint assemblies'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 01V200 - Jimmy Upper Ball Joints', url: recall(1996) }],
      summary: 'Corrected a seven-year lower-ball-joint narrative whose cited campaign actually covered upper ball joints in a defined 1996-1997 corrosion-state population.',
    },
    'The frozen card described premature lower-ball-joint wear across 1995-2001, but its strongest citation was an upper-ball-joint campaign and the remaining links were recall aggregators or complaint pages.',
  ),

  'gmc-jimmy-fuel-pressure-regulator-1996': replacement(
    {
      years: [1995, 1996],
      trims: ['Four-door four-wheel-drive or all-wheel-drive vehicles covered by the campaign'],
      category: 'fuel',
      title: 'Fuel-Tank Prop-Shaft Contact Recall',
      description: 'NHTSA campaign 96V234 covers certain 1995-1996 four-door, four-wheel-drive or all-wheel-drive GMC Jimmy vehicles. The prop shaft can contact the inboard side of the fuel tank and allow fuel leakage beyond the federal fuel-system-integrity limit.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers install additional fuel-tank shielding without removing or disassembling the fuel system under the recall. Stop driving and arrange professional service if fuel is leaking.',
      symptoms: ['Fuel may leak after prop-shaft contact with the tank'],
      affectedSystems: ['fuel tank', 'prop shaft', 'fuel-tank shielding'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 96V234 - Jimmy Fuel-Tank Shielding', url: recall(1996) }],
      summary: 'Replaced a multi-year regulator diagnosis sourced only to a fabricated YouTube URL with the exact fuel-tank safety campaign.',
    },
    'The frozen card cited a nonexistent placeholder video and asserted a fuel-pressure-regulator diaphragm failure, symptoms and vacuum-line test across six years without primary evidence.',
  ),

  'gmc-jimmy-intake-gasket-1996': replacement(
    {
      years: [1996],
      category: 'electrical',
      title: 'Windshield-Wiper Circuit-Board Recall',
      description: 'NHTSA campaign 03V159 covers certain 1996 GMC Jimmy vehicles with specified model-engine combinations. Cracked solder joints on the wiper-motor controller circuit board can make the windshield wipers operate intermittently or stop working.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the wiper-motor circuit board and cover free of charge under GM recall 03023.',
      symptoms: ['Windshield wipers may operate intermittently', 'Windshield wipers may stop working'],
      affectedSystems: ['windshield-wiper motor', 'controller circuit board'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 03V159 - Jimmy Wiper Controller', url: recall(1996) }],
      summary: 'Replaced an intake-gasket generalization sourced only to a forum homepage with the exact model-year wiper-controller recall.',
    },
    'The frozen card cited only the S10Forum homepage and asserted coolant, oil, vacuum-leak, torque, sealant and repair-cost claims across six years without a traceable GM document.',
  ),

  'gmc-jimmy-transfer-case-encoder-1998': replacement(
    {
      years: [2000, 2001],
      category: 'electrical',
      title: 'Stop-Lamp and Rear-Hazard Switch Recall',
      description: 'NHTSA campaign 08V231 covers certain 2000-2001 GMC Jimmy vehicles. An open circuit in the multifunction switch can disable the stop lamps and rear hazard lamps, although the center high-mounted stop lamp and turn signals remain functional.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the hazard-switch carrier free of charge under GM recall 01073.',
      symptoms: ['Stop lamps may not illuminate', 'Rear hazard lamps may not illuminate'],
      affectedSystems: ['multifunction switch', 'stop lamps', 'rear hazard lamps'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 08V231 - Jimmy Stop Lamps and Hazards', url: recall(2000) }],
      summary: 'Replaced an uncited AutoTrac encoder-motor narrative with the exact stop-lamp and rear-hazard expansion recall.',
    },
    'The frozen card had no citation and combined encoder-motor, switch, wiring, module, fluid, tire-size and transfer-case claims across four years without a defined GM issue population.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Jimmy',
  make: 'GMC',
  model: 'Jimmy',
  slug: 'gmc-jimmy',
  batchId: 'gmc-jimmy-full-record-cohort-153-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd2c3899b633e872a0935a2317192cd8955e2f41abb717a007aa370259c64a182',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-jimmy/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcjimmy_blind:manual-primary-source-gate',
    edge: 'gmcjimmy_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
