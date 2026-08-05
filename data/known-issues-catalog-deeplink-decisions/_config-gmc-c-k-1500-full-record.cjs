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
      severity: card.severity || 'medium',
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
  'gmc-ck-1500-4l60e-trans-1993': replacement(
    {
      years: [1993],
      category: 'transmission',
      title: 'Automatic-Transmission Vent-Hose Recall',
      description: 'NHTSA campaign 93V016 covers certain 1993 GMC C1500 trucks. Unanticipated transmission heat can force automatic-transmission fluid out of the vent tube.',
      solution: 'Check the VIN and campaign applicability with GMC or NHTSA. The recall remedy installs a longer transmission vent hose routed to the left side of the engine compartment.',
      severity: 'high',
      symptoms: ['Transmission fluid may be expelled from the vent tube'],
      affectedSystems: ['automatic transmission', 'transmission vent tube and hose'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V016 - GMC C1500 Transmission Vent', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=C1500&modelYear=1993' }],
      summary: 'Replaced a one-line YouTube-sourced 4L60E failure generalization with the model-year-specific NHTSA transmission vent recall.',
    },
    'The frozen card merely said it had the same problems as Chevrolet, named three internal failure modes without evidence and linked only to a video.',
  ),
};

const reasons = {
  'gmc-ck-1500-brake-line-corrosion-1990': 'The frozen card cites only a video and generalizes road-salt corrosion, circuit loss and replacement-material advice across nine model years; current GMC/NHTSA primary-source research does not establish this as one defined C/K 1500 issue population.',
  'gmc-ck-1500-oil-pressure-sender-1988': 'The frozen card relies on a forum homepage and uncited diagnostic, location, part-quality, labor and price claims; current GMC/NHTSA primary sources do not establish one 1988-1998 C/K 1500 sender defect or remedy population.',
  'gmc-ck-1500-spider-injector-1996': 'The frozen card cites a third-party diagnostic site, a DIY article and a forum, asserts a universal poppet and line failure, and gives part and price guidance that current GMC/NHTSA primary sources do not substantiate for a defined C/K 1500 population.',
};

module.exports = buildConfig({
  label: 'GMC C/K 1500',
  make: 'GMC',
  model: 'C/K 1500',
  slug: 'gmc-c-k-1500',
  batchId: 'gmc-c-k-1500-full-record-cohort-146-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '14e5ceeded68f693ab102f4c045c7133fb2406901c6c9a8af5aaf082bd5f0aa2',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-c-k-1500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcck1500_blind:manual-primary-source-gate',
    edge: 'gmcck1500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
