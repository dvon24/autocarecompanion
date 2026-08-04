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

const ignitionSwitch = {
  years: [2008, 2009, 2010],
  trims: ['Town & Country vehicles included in recall R03 / 14V-373 or its earlier P25 / 11V-139 population; verify by VIN'],
  category: 'electrical',
  title: 'Ignition Switch Can Move Out of Run and Shut Off the Engine (Recall 14V-373)',
  description: 'Chrysler recall R03 / NHTSA 14V-373 covers certain 2008-2010 Town & Country vehicles and expands the earlier P25 / 11V-139 action. Road inputs or another jarring event can move the ignition switch out of Run, shutting off the engine. This can also affect power steering, power braking, and air-bag operation. The campaigns do not establish the frozen card\'s broad SKREEM-module failure claim.',
  solution: 'Until the recall is completed, remove every item from the key ring and use only the ignition key; remove the key fob from the ring as well. Check the VIN for recall R03 and any earlier P25 status. An authorized Chrysler dealer replaces the ignition switch and key fobs at no charge. A no-start or security-system symptom that does not match this condition still requires diagnosis.',
  severity: 'high',
  symptoms: ['Ignition switch moves out of Run after a jarring event', 'Engine shuts off while driving', 'Possible loss of power assist and air-bag availability'],
  affectedSystems: ['ignition switch', 'engine electrical power', 'air-bag and power-assist availability'],
  sources: [
    { type: 'recall', title: 'NHTSA Campaign 14V-373 - Town & Country Ignition Switch', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V373000' },
    { type: 'recall', title: 'NHTSA Campaign 11V-139 - Earlier Town & Country Ignition Action', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=11V139000' },
  ],
  summary: 'Replaced the nine-year ignition/SKREEM aggregation with recalls 14V-373 and 11V-139\'s exact 2008-2010 switch condition, interim key-ring instruction, and free remedy.',
};

const published = {
  'chrysler-town-country-ignition-2008': replacement(ignitionSwitch, 'Replace the broad ignition/SKREEM card with the exact switch condition documented by recall 14V-373 and its earlier 11V-139 population.'),
};

const reasons = {
  'chrysler-town-country-62te-trans-2008': 'The frozen nine-year 62TE card treats shift symptoms as proof of solenoid-pack failure and combines control, hydraulic, wiring, and internal causes without one Chrysler/NHTSA defect population and remedy.',
  'chrysler-town-country-cooling-2001': 'The frozen ten-year cooling card explicitly merges radiator, fan, relay, thermostat, pump, hose, leak, and head-gasket possibilities across two engine families without one primary-source condition.',
  'chrysler-town-country-sliding-door-2008': 'The frozen sliding-door card combines cables, motors, latches, tracks, switches, wiring, and modules across nine years without a manufacturer-defined failure population and universal repair.',
  'chrysler-town-country-tipm-2008': 'The frozen TIPM card groups unrelated no-start, fuel-pump, lighting, wiper, lock, battery-drain, and communication symptoms without one Chrysler/NHTSA mechanism supporting module replacement.',
};

module.exports = buildConfig({
  label: 'Chrysler Town & Country',
  make: 'Chrysler',
  model: 'Town & Country',
  slug: 'chrysler-town-country',
  batchId: 'chrysler-town-country-full-record-cohort-63-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'a71aa950476b2454673acb0892ee41801e166fb6e5628afccb091cf2d161290a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-town-country/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslertowncountry_blind:manual-primary-source-gate',
    edge: 'chryslertowncountry_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '01I003000',
    '01V152000',
    '01V310000',
    '02V274000',
    '04V047000',
    '04V386000',
    '04V531000',
    '05V134000',
    '06V067000',
    '07V192000',
    '09V046000',
    '10V008000',
    '10V611000',
    '11V315000',
    '11V394000',
    '11V487000',
    '12V141000',
    '12V191000',
    '13V283000',
    '13V291000',
    '14V234000',
    '14V632000',
    '15V595000',
    '16V044000',
    '16V047000',
    '16V300000',
    '16V461000',
    '17V824000',
    '20V396000',
  ],
});
