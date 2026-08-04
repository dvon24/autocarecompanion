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

const steeringDamper = {
  years: [2017, 2018, 2019],
  trims: ['F-250 four-wheel-drive vehicles covered by the Ford program'],
  category: 'steering',
  title: 'Sustained Steering-Wheel Oscillation From Steering-Damper Lag or Lash',
  description:
    'Ford service information and the later steering-linkage-damper program cover certain 2017-2019 F-250 four-wheel-drive trucks. A sustained steering-wheel oscillation can begin after the truck hits rough pavement or an expansion joint, typically above 45 mph. Ford identifies excessive lag or lash in the steering linkage damper as the documented condition for this population.',
  solution:
    'Have a Ford dealer verify the VIN, four-wheel-drive configuration, exact trigger and current program eligibility. Ford directs replacement of the steering linkage damper for the covered condition. If oscillation returns, the later service message directs technicians to the Workshop Manual steering-linkage diagnostic procedure rather than automatically adding aftermarket dampers or replacing unrelated front-end parts.',
  severity: 'high',
  symptoms: ['Sustained steering-wheel oscillation after rough pavement or an expansion joint above about 45 mph'],
  affectedSystems: ['steering linkage damper', 'steering linkage'],
  sources: [
    { type: 'tsb', title: 'Ford TSB 19-2268 - 2017-2019 F-250/F-350 Steering Oscillation', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10165703-0001.pdf' },
    { type: 'tsb', title: 'Ford Steering Linkage Damper Program - Updated Terms', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237442-0001.pdf' },
  ],
  summary:
    'Narrowed the frozen 1999-2025 steering-damper aggregation to Ford\'s exact 2017-2019 4WD population, road-triggered sustained oscillation, damper lag/lash cause, and Ford diagnostic path.',
};

const published = {
  'ford-f250-steering-damper-1999': replacement(
    steeringDamper,
    'Retain only the exact Ford-defined steering-damper population and remedy; remove the universal mileage claim, branded upgrades, dual-damper recommendation, and placeholder citation.',
  ),
};

const reasons = {
  'ford-f250-egr-cooler-failure-2003':
    'The frozen card uses only a placeholder-style YouTube URL, combines EGR-cooler and oil-cooler failures, promotes named aftermarket products and an emissions-system delete, and supplies universal prices across five model years without an exact Ford primary source.',
  'ford-f250-exhaust-manifold-stud-2011':
    'The frozen card has no citations and applies one thermal-fatigue diagnosis, side prevalence claim, extraction method, branded stud upgrade, and price range to every 2011-2022 6.7L truck without a Ford-defined population.',
  'ford-superduty-67-cp4-hpfp-failure-2011':
    'The frozen card relies on an owner forum and unrelated aftermarket turbo material, alleges incompatibility with North American diesel fuel, and prescribes additives or a CP3 conversion. No exact Ford bulletin, investigation, or recall reviewed supports that combined cause and remedy.',
  'ford-superduty-67-def-scr-failure-2015':
    'The frozen card combines several distinct causes of P207F and P20EE, multiple sensors, DEF quality, injector and catalyst failures, and parts-price advice using forum and commercial sources. Those DTCs require diagnosis and are not one Ford-defined defect.',
  'ford-superduty-67-egr-cooler-failure-2011':
    'The frozen card relies on aftermarket sources, presents broad soot and use-pattern claims as a universal defect, asserts historical extended coverage without an exact program document, and recommends additives, scheduled cleaning, and aftermarket kits across nine years.',
  'ford-superduty-67-turbo-failure-2011':
    'The frozen card relies on aftermarket articles, attributes all 2011-2014 failures to ceramic bearings or a sticking actuator, promotes retrofit hardware, prices, and a fixed cooldown practice, and has no exact Ford bulletin defining one failure population and remedy.',
};

module.exports = buildConfig({
  label: 'Ford F-250 Super Duty',
  make: 'Ford',
  model: 'F-250 Super Duty',
  slug: 'ford-f-250-super-duty',
  batchId: 'ford-f-250-super-duty-full-record-cohort-117-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '658908d5a02ba525bcb68543594631b98445a2f1e952752c768ae90655ffbae3',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-250-super-duty/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf250superduty_blind:manual-primary-source-gate',
    edge: 'fordf250superduty_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
