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
  trims: ['BR/BE Ram Truck covered by TSB 09-05-00'],
  engines: ['3.9L gasoline V6', '5.2L gasoline V8', '5.9L gasoline V8'],
  category: 'engine',
  title: 'Intake Plenum Pan Gasket Leak Can Cause Spark Knock and Oil Consumption (TSB 09-05-00)',
  description:
    'DaimlerChrysler TSB 09-05-00 covers 1994-1999 BR/BE Ram Trucks with 3.9L, 5.2L, or 5.9L gasoline engines. An internal intake-manifold plenum-pan gasket oil leak may create an additional vacuum path that draws crankcase gases and oil vapor into the intake. The bulletin identifies spark knock during acceleration and increased engine-oil consumption as the two possible operator complaints; an external oil leak is not expected.',
  solution:
    'Follow TSB 09-05-00 rather than assuming the gasket is the cause. Verify the related ignition-wire routing bulletin, inspect the PCV valve, perform the bulletin’s plenum-leak diagnosis, and replace the intake-manifold plenum-pan gasket only when the test confirms leakage. Use the bulletin’s listed gaskets, bolts, cleaning steps, and torque procedure.',
  severity: 'medium',
  symptoms: ['Spark knock during acceleration', 'Increased engine-oil consumption', 'Internal intake oil leakage without visible external engine-oil leakage'],
  affectedSystems: ['intake manifold', 'plenum pan gasket', 'positive crankcase ventilation path'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'DaimlerChrysler TSB 09-05-00 - Spark Knock and Oil Consumption Due to Intake Manifold Pan Gasket Oil Leak', url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bc0972.pdf' }],
  summary:
    'Narrowed the forum and aftermarket-fix write-up to DaimlerChrysler TSB 09-05-00\'s exact 1994-1999 BR/BE scope, symptoms, diagnostic gate, and factory gasket-replacement procedure.',
};

const published = {
  'dodge-ram1500-plenum-gasket-1994': replacement(
    plenumGasketBulletin,
    'Replace the forum-based 1994-2003 design-flaw and aftermarket-plate claim with TSB 09-05-00\'s exact 1994-1999 gasoline-engine scope, diagnosis, and factory service procedure.',
  ),
};

const reasons = {
  'dodge-ram-1500-dashboard-crack-1994':
    'The frozen card asserts seven model years of UV-driven dashboard cracking with location and climate claims from a placeholder video URL and no Dodge primary source.',
  'dodge-ram-1500-exhaust-manifold-bolt-1994':
    'The frozen card combines 5.7L HEMI and 5.9L Magnum engines across fifteen model years, attributes fastener breakage to heat cycling, and supplies a cold-tick diagnosis from a placeholder video without a Chrysler bulletin covering that population.',
  'dodge-ram1500-46re-47re-trans-failure-1996':
    'The frozen card combines two transmissions, thirteen model years, overdrive, governor, torque-converter, towing, and overheating claims from discussion forums without a Dodge primary source defining one failure mechanism and remedy.',
  'dodge-ram1500-dashboard-cracking-1994':
    'This duplicate dashboard card adds nine model years, material chemistry, climate, airbag, lawsuit, and safety claims while providing only an empty citation and no Chrysler primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Ram 1500',
  make: 'Dodge',
  model: 'Ram 1500',
  slug: 'dodge-ram-1500',
  batchId: 'dodge-ram-1500-full-record-cohort-80-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '324a8deb782672a1010d92b64a16d0ca74196f6d5aece15353dc8ea9e0bb49aa',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-ram-1500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeram1500_blind:manual-primary-source-gate',
    edge: 'dodgeram1500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '01V153000', '03V077000', '03V078000', '03V503000', '03V504000', '04V221000',
    '05V461000', '06E024000', '06V038000', '06V353000', '06V354000', '07E104000',
    '07V038000', '10E013000', '10E040000', '11V350000', '13V528000', '13V529000',
    '14V770000', '14V795000', '14V796000', '15V312000', '15V313000', '16V352000',
  ],
});
