const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
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

const plenumGasketBulletin = {
  years: [1994, 1995, 1996, 1997, 1998, 1999],
  trims: ['AB-platform Ram Van covered by TSB 09-05-00'],
  engines: ['3.9L gasoline V6', '5.2L gasoline V8', '5.9L gasoline V8'],
  category: 'engine',
  title: 'Intake Plenum Pan Gasket Leak Can Cause Spark Knock and Oil Consumption (TSB 09-05-00)',
  description:
    'DaimlerChrysler TSB 09-05-00 covers 1994-1999 AB-platform Ram Vans with 3.9L, 5.2L, or 5.9L gasoline engines. An internal intake-manifold plenum-pan gasket oil leak may create an additional vacuum path that draws crankcase gases and oil vapor into the intake. The bulletin identifies spark knock during acceleration and increased engine-oil consumption as possible complaints; an external oil leak is not expected.',
  solution:
    'Follow TSB 09-05-00 rather than assuming the gasket is the cause. Verify the related ignition-wire routing bulletin, inspect the PCV valve, perform the bulletin’s plenum-leak test, and replace the intake-manifold plenum-pan gasket only when leakage is confirmed. Use the bulletin’s listed parts, cleaning steps, and torque procedure.',
  severity: 'medium',
  symptoms: ['Spark knock during acceleration', 'Increased engine-oil consumption', 'Internal intake oil leakage without visible external engine-oil leakage'],
  affectedSystems: ['intake manifold', 'plenum pan gasket', 'positive crankcase ventilation path'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'DaimlerChrysler TSB 09-05-00 - Spark Knock and Oil Consumption Due to Intake Manifold Pan Gasket Oil Leak', url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bc0972.pdf' }],
  summary:
    'Narrowed the one-line video-backed write-up to DaimlerChrysler TSB 09-05-00\'s exact 1994-1999 AB Ram Van scope, symptoms, diagnostic gate, and factory gasket-replacement procedure.',
};

const published = {
  'dodge-ram-van-plenum-gasket-1994': replacement(
    plenumGasketBulletin,
    'Replace the generic 1994-2003 plenum-gasket claim with TSB 09-05-00\'s exact 1994-1999 AB Ram Van gasoline-engine scope, diagnosis, and factory procedure.',
  ),
};

const reasons = {
  'dodge-ram-van-idle-surge-1990':
    'The frozen card combines fourteen model years, two engines, plenum leaks, IAC valves, throttle deposits, hoses, engine-bay heat, and an asserted most-common cause while providing only an empty citation and no Dodge primary source.',
  'dodge-ram-van-overdrive-failure-1990':
    'The frozen card combines three transmission names, fourteen model years, clutch packs, solenoids, towing, aerodynamics, heat, and cooler-airflow theories from a transmission seller, repair guide, and forum without a Dodge primary source.',
  'dodge-ram-van-rear-ac-leak-1994':
    'The frozen card attributes ten model years of rear refrigerant-line corrosion to salt and debris from a placeholder video URL and no Chrysler primary source defining the population or repair.',
  'dodge-ram-van-rear-axle-seal-1999':
    'The frozen card combines axle-shaft and pinion seals, driveshaft runout, age, brake contamination, and five model years from a general enthusiast site without a Dodge or Dana primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Ram Van',
  make: 'Dodge',
  model: 'Ram Van',
  slug: 'dodge-ram-van',
  batchId: 'dodge-ram-van-full-record-cohort-83-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '6c122bb7d0103096b7cd244d2a19b14cd16f408af58dbc650be0e5ca99075ffd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-ram-van/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeramvan_blind:manual-primary-source-gate',
    edge: 'dodgeramvan_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
