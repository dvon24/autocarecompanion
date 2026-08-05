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
      severity: 'medium',
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
  'genesis-gv80-coupe-harsh-ride-impact-harshness-22-inch-wheels': replacement(
    {
      years: [2025],
      category: 'electrical',
      title: 'Ignition-Off Battery Drain and CCU Software Update',
      description: 'Genesis bulletin 11006122 covers specified 2025 GV80 and GV80 Coupe vehicles that can experience battery drain while the ignition is off. The documented correction changes Central Communication Unit software logic.',
      solution: 'Have a Genesis dealer confirm bulletin applicability and update the Central Communication Unit through the Genesis diagnostic system and Ethernet connection.',
      symptoms: ['Battery can drain while the ignition is off'],
      affectedSystems: ['Central Communication Unit', 'ignition-off power management'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11006122 - GV80 Coupe Battery Drain', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006122-0001.pdf' }],
      summary: 'Replaced a subjective ride-review card with the model-specific Genesis ignition-off battery-drain condition and software remedy.',
    },
    'The frozen card treated wheel-size ride preference as a known defect, used review and forum anecdotes, contained encoding damage, calculated sidewall dimensions without primary support and recommended wheel replacement.',
  ),
};

module.exports = buildConfig({
  label: 'Genesis GV80 Coupe',
  make: 'Genesis',
  model: 'GV80 Coupe',
  slug: 'genesis-gv80-coupe',
  batchId: 'genesis-gv80-coupe-full-record-cohort-144-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd0f4938073d53673f9229f0c0433f5ae6b3f5a6c7b3c0c2ae99ad925d4bb779a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-gv80-coupe/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisgv80coupe_blind:manual-primary-source-gate',
    edge: 'genesisgv80coupe_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
