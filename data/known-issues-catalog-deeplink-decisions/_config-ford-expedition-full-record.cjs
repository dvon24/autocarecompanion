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
      dtcCodes: card.dtcCodes,
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

const coldStartVct = {
  years: [2018, 2019, 2020],
  trims: ['Vehicles built on or before November 30, 2019'],
  engines: ['3.5L EcoBoost'],
  category: 'engine',
  title: 'Worn VCT Units Can Cause a Brief Cold-Start Rattle',
  description:
    'Ford TSB 23-2143 covers some 2018-2020 Expedition vehicles with the 3.5L EcoBoost engine built on or before November 30, 2019. A worn variable camshaft timing unit can cause ticking, tapping, or rattling from the upper front-cover area for two to five seconds after a cold soak of at least six hours. Some vehicles may also fail to auto-restart during auto-start-stop operation, with or without P164C.',
  solution:
    'Have a Ford dealer or qualified engine technician confirm the exact cold-start symptom and build date. Ford directs replacement of all four VCT units. The bulletin says not to replace additional VCT or engine-timing components that are not in its parts list.',
  severity: 'medium',
  symptoms: ['Two-to-five-second ticking, tapping, or rattle after a cold soak', 'Intermittent failure to auto-restart during auto-start-stop operation'],
  affectedSystems: ['variable camshaft timing units', 'engine front-cover area', 'auto-start-stop operation'],
  dtcCodes: ['P164C'],
  sources: [{ type: 'tsb', title: 'Ford TSB 23-2143 - 3.5L EcoBoost Cold-Start VCT Rattle', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10236037-0001.pdf' }],
  summary:
    'Narrowed the frozen 2018-2022 card to Ford TSB 23-2143\'s exact 2018-2020 build population, cold-soak symptom, possible P164C/no-restart condition, worn-VCT diagnosis, and four-unit repair.',
};

const published = {
  'ford-expedition-35-ecoboost-vct-phaser-2018': replacement(coldStartVct, 'Retain only Ford TSB 23-2143\'s exact 2018-2020 3.5L EcoBoost cold-start VCT condition and repair.'),
};

const reasons = {
  'ford-expedition-54-cam-phaser-timing-2004':
    'The frozen card relies on aftermarket articles and an owner forum to apply cam-phaser, timing-chain, tensioner, guide, oil-pressure, and oil-passage failure to every 2004-2014 5.4L Expedition. A Ford communication reviewed mentions an intermittent low-RPM rattle but does not substantiate this combined failure diagnosis and remedy.',
  'ford-expedition-54-spark-plug-blowout-2004':
    'The frozen card relies on one aftermarket article and combines spark-plug seizure during removal with plug blowout across 2004-2010 5.4L three-valve engines. Those are distinct conditions, and no exact Ford primary source reviewed supports this seven-year combined defect and repair.',
  'ford-expedition-air-suspension-compressor-2003':
    'The frozen card relies on a placeholder-style YouTube URL and applies compressor failure, rear sag, warning messages, extended running, noise, and ride-height faults to every 2003-2017 Expedition without an exact Ford bulletin, investigation, or recall.',
  'ford-expedition-air-suspension-failure-2003':
    'The frozen card has no citations and duplicates the separate compressor/sag card while extending the claim through 2025. It does not identify which Expedition years or configurations use the alleged system, nor a Ford-defined defect and remedy.',
  'ford-expedition-blend-door-actuator-2003':
    'The frozen card relies on a placeholder-style YouTube URL and applies clicking, incorrect temperature, stuck airflow, and intermittent HVAC behavior to every 2003-2017 Expedition without an exact Ford bulletin, investigation, or recall defining one actuator condition.',
  'ford-expedition-rear-hatch-leak-2018':
    'The only citation is a fabricated-looking placeholder YouTube URL ending in abcd1234efg. No Ford bulletin, investigation, or recall reviewed defines rear-liftgate, quarter-panel, cargo-area, trim, odor, and electrical water damage across every 2018-2025 Expedition.',
  'ford-expedition-spark-plug-blowout-1997':
    'The frozen card has no citations and applies a two-valve cylinder-head thread/blowout condition through 2008 even though later model years use a different 5.4L architecture. No exact Ford primary source reviewed supports the 12-year population, symptoms, and repair choices.',
  'ford-expedition-torque-converter-shudder-2018':
    'The frozen card has no citations and applies shudder, vibration, harsh shifts, delayed engagement, slipping, warning lamps, and complete transmission failure to every 2018-2025 Expedition. No Ford bulletin, investigation, or recall reviewed defines one 10R80 torque-converter defect and remedy across that population.',
};

module.exports = buildConfig({
  label: 'Ford Expedition',
  make: 'Ford',
  model: 'Expedition',
  slug: 'ford-expedition',
  batchId: 'ford-expedition-full-record-cohort-110-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd07bbaf74c836d9dddc2f37fc391f1312bd491f400148bbd86bd1160debbb953',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-expedition/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordexpedition_blind:manual-primary-source-gate',
    edge: 'fordexpedition_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
