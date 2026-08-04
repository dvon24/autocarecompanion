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
  'ford-f350-death-wobble-1999': replacement(
    {
      years: [2017, 2018, 2019],
      trims: ['F-350 four-wheel-drive vehicles covered by the Ford program'],
      category: 'steering',
      title: 'Sustained Steering-Wheel Oscillation From Steering-Damper Lag or Lash',
      description:
        'Ford service information and the later steering-linkage-damper program cover certain 2017-2019 F-350 four-wheel-drive trucks. A sustained steering-wheel oscillation can begin after the truck hits rough pavement or an expansion joint, typically above 45 mph. Ford identifies excessive lag or lash in the steering linkage damper as the documented condition for this population.',
      solution:
        'Have a Ford dealer verify the VIN, four-wheel-drive configuration, exact trigger and current program eligibility. Ford directs replacement of the steering linkage damper for the covered condition. If oscillation returns, use the Workshop Manual steering-linkage diagnostic procedure rather than automatically replacing multiple front-end parts.',
      severity: 'high',
      symptoms: ['Sustained steering-wheel oscillation after rough pavement or an expansion joint above about 45 mph'],
      affectedSystems: ['steering linkage damper', 'steering linkage'],
      sources: [
        { type: 'tsb', title: 'Ford TSB 19-2268 - 2017-2019 F-250/F-350 Steering Oscillation', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10165703-0001.pdf' },
        { type: 'tsb', title: 'Ford Steering Linkage Damper Program - Updated Terms', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237442-0001.pdf' },
      ],
      summary:
        'Narrowed the frozen 1999-2025 symptom aggregation to Ford\'s exact 2017-2019 4WD population, road-triggered sustained oscillation, damper lag/lash cause, and Ford diagnostic path.',
    },
    'Replace the 27-year placeholder-cited death-wobble aggregation with the exact Ford-defined steering-damper condition and remedy.',
  ),
};

const reasons = {
  'ford-f350-73l-turbo-pedestal-leak-1994':
    'The frozen card has no citations and combines pedestal O-ring, base-gasket, exhaust, EBPV actuator, boost, up-pipe, and turbo-play conditions, then recommends emissions-related hardware changes and prices without an exact Ford source.',
  'ford-f350-cam-phaser-6-2-2011':
    'The frozen card has no citations and combines a cam-phaser startup rattle with exhaust-manifold stud breakage, then prescribes timing chains, phasers, solenoids, and stainless studs across six model years without a Ford-defined population.',
  'ford-f350-exhaust-manifold-bolt-1999':
    'The frozen card has no citations, merges two different diesel-engine families and twelve model years, and recommends extraction, updated hardware, anti-seize, and possible manifold replacement without a Ford bulletin defining one failure and repair.',
  'ford-f350-powerstroke-turbo-2011':
    'The frozen card has no citations and combines soot buildup, variable-vane sticking, actuator-motor failure, bearing failure, limp mode, driving pattern, cleaning, actuator replacement, and complete turbo replacement across nine model years.',
};

module.exports = buildConfig({
  label: 'Ford F-350',
  make: 'Ford',
  model: 'F-350',
  slug: 'ford-f-350',
  batchId: 'ford-f-350-full-record-cohort-118-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c01b71c02d410d5a5b6739ba08b659d8d6b3601ff85de6f31083dca9cefee052',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-350/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf350_blind:manual-primary-source-gate',
    edge: 'fordf350_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
