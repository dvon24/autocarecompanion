const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: [],
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

const published = {
  'gmc-ck-2500-65l-diesel-pmd-1994': replacement(
    {
      years: [1990],
      category: 'transmission',
      title: 'Automatic-Transmission Vent-Hose Recall',
      description: 'NHTSA campaign 93V016 covers certain GMC K2500 trucks. Unanticipated transmission heat can force automatic-transmission fluid out of the vent tube.',
      solution: 'Check the VIN and campaign applicability with GMC or NHTSA. The recall remedy installs a longer transmission vent hose routed to the left side of the engine compartment.',
      symptoms: ['Transmission fluid may be expelled from the vent tube'],
      affectedSystems: ['automatic transmission', 'transmission vent tube and hose'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V016 - GMC K2500 Transmission Vent', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=K2500&modelYear=1990' }],
      summary: 'Replaced an uncited Chevrolet-derived diesel PMD claim with the model-specific NHTSA transmission vent recall.',
    },
    'The frozen card said only that the GMC had the same PMD failure as Chevrolet, asserted overheating and stalling, provided no remedy and linked only to a video.',
  ),
};

const reasons = {
  'gmc-ck-2500-abs-sensor-1995': 'The frozen card cites only a video, combines a rear speed sensor and control module into one assumed failure, and recommends disabling anti-lock brakes; current GMC/NHTSA primary sources do not establish this defined C/K 2500 issue or endorse disabling a safety system.',
  'gmc-ck-2500-brake-line-rust-1999': 'The frozen card relies on a newspaper article about a closed investigation and adds universal failure, material, labor, price and repair-procedure claims; current GMC/NHTSA primary sources do not establish one recall or service population matching the card.',
  'gmc-ck-2500-pitman-arm-1990': 'The frozen card cites only a forum homepage and generalizes component wear, vehicle weight, replacement pairing, part numbers and alignment advice across nine model years without a GMC primary source.',
  'gmc-ck2500-fuel-pump-1996': 'The frozen card relies on forums and repair sites and asserts towing, climate, fuel-level, part-quality and replacement-procedure claims that current GMC/NHTSA primary sources do not establish for a defined C/K 2500 population.',
};

module.exports = buildConfig({
  label: 'GMC C/K 2500',
  make: 'GMC',
  model: 'C/K 2500',
  slug: 'gmc-c-k-2500',
  batchId: 'gmc-c-k-2500-full-record-cohort-147-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'fcf819d3b16dc6559c4babd5c79b214c0d40e107a0699502696ee56918cce48e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-c-k-2500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcck2500_blind:manual-primary-source-gate',
    edge: 'gmcck2500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
