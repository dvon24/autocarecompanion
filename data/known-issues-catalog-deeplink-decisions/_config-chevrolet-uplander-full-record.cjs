const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
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

const coolantSource = source(
  'tsb',
  'GM Service Bulletin 07-06-02-006E - Coolant Crossover Pipe Gasket Leak',
  'https://static.nhtsa.gov/odi/tsbs/2012/SB-10025683-2634.pdf',
);

const coolant = {
  years: [2006, 2007],
  engines: ['3.5L or 3.9L engine with bulletin-listed RPO/VIN'],
  category: 'cooling',
  title: 'Coolant Crossover Pipe Gasket Can Leak at the Rear Cylinder Head (07-06-02-006E)',
  description: 'GM bulletin 07-06-02-006E applies to 2006-2007 Uplander vehicles with specified 3.5L or 3.9L engines. The gasket between the coolant crossover pipe and the front face of the right/rear cylinder head may leak. This is not an intake-manifold-gasket condition and does not support the frozen 2005-2008 scope.',
  solution: 'Confirm the engine RPO and trace the leak to the coolant crossover-to-cylinder-head joint. For the defined condition, replace the coolant crossover-pipe gaskets with the updated service replacements, selecting the correct gasket for the crossover design. Pressure-test and diagnose other coolant sources separately.',
  severity: 'medium',
  symptoms: ['Visible coolant leak from the engine', 'Leak traced to the coolant crossover pipe at the right/rear cylinder head', 'Low coolant level after a confirmed crossover-gasket leak'],
  affectedSystems: ['coolant crossover pipe', 'crossover-to-cylinder-head gaskets', 'engine cooling system'],
  sources: [coolantSource],
  summary: 'Corrected the wrong component and four-year scope to bulletin 07-06-02-006E\'s exact 2006-2007 3.5L/3.9L coolant-crossover gasket leak and updated-gasket repair.',
};

const published = {
  'chevrolet-uplander-intake-gasket-3500': replacement(
    coolant,
    'Replace the owner-reported 2005-2008 intake-manifold-gasket claim with bulletin 07-06-02-006E\'s exact 2006-2007 coolant-crossover gasket condition and component-specific repair.',
  ),
};

const reasons = {
  'chevrolet-uplander-power-steering': 'The Uplander uses hydraulic rather than electric power steering, so the frozen title and mechanism are materially wrong. Complaint pages do not establish a four-year pump, rack or electrical defect or a universal repair.',
  'chevrolet-uplander-rear-ac': 'The frozen card has no citations and does not identify the exact rear refrigerant line, corrosion location, production population, leak test or manufacturer remedy.',
  'chevy-uplander-power-steering-lines-2005': 'A video cannot establish a five-year pressure-line defect or distinguish hose, fitting, seal, pump and steering-gear leaks. The generic GM hydraulic-leak diagnostic bulletin is not a model-specific Uplander defect campaign.',
  'chevy-uplander-rear-ac-lines-2005': 'This duplicates the uncited rear-A/C card and relies only on a video; it does not establish a five-year population, exact leak point or manufacturer remedy.',
};

module.exports = buildConfig({
  label: 'Chevrolet Uplander',
  make: 'Chevrolet',
  model: 'Uplander',
  slug: 'chevrolet-uplander',
  batchId: 'chevrolet-uplander-full-record-cohort-45-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '94554a9c7d12ddb7c9936146f227a477583b2a046719a8d8f882c927728dbe4f',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-uplander/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletuplander_blind:manual-primary-source-gate',
    edge: 'chevroletuplander_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
