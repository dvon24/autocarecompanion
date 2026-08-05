const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

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

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SONOMA&modelYear=${year}`;

const published = {
  'gmc-sonoma-43l-intake-gasket-1996': replacement(
    {
      years: [1996],
      trims: ['Manual-transmission trucks covered by the campaign'],
      category: 'drivetrain',
      title: 'Manual-Transmission Seizure Recall',
      description: 'NHTSA campaign 96V035 covers certain 1996 GMC Sonoma trucks whose manual transmissions contain parts not machined to GM specifications. The transmission can seize and lock the rear wheels while driving.',
      solution: 'Check the VIN and transmission with GMC or NHTSA. Dealers measure main-shaft output torque with the specified tool and replace the transmission if it does not meet specification.',
      symptoms: ['No reliable warning before an affected transmission seizes', 'Rear drive wheels can lock'],
      affectedSystems: ['manual transmission', 'main shaft', 'rear drive wheels'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 96V035 - Sonoma Manual Transmission', url: recall(1996) }],
      summary: 'Replaced an intake-gasket card supported only by blank and generic vehicle-page citations with the exact manual-transmission recall.',
    },
    'The frozen card generalized intake-gasket leakage, coolant/oil symptoms, sealant procedure and costs across nine years; a generic NHTSA vehicle page did not establish that defect.',
  ),

  'gmc-sonoma-door-handle-break-1994': replacement(
    {
      years: [1998],
      category: 'electrical',
      title: 'Underhood Wiring-Clip Fire Recall',
      description: 'NHTSA campaign 97V208 covers certain 1998 GMC Sonoma trucks. An underhood wiring-harness clip can melt and drip onto the exhaust manifold, where it can ignite and start a vehicle fire.',
      solution: 'Check the VIN with GMC or NHTSA. The campaign directed affected vehicles to be towed to a dealer so the underhood wiring harness could be rerouted.',
      symptoms: ['No reliable warning before the wiring-harness clip melts'],
      affectedSystems: ['underhood wiring harness', 'wiring-harness clip', 'exhaust-manifold clearance'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 97V208 - Sonoma Wiring Harness', url: recall(1998) }],
      summary: 'Replaced an eleven-year door-handle claim supported only by a video with the exact underhood wiring fire recall.',
    },
    'The frozen card generalized exterior handle breakage, rod clips, replacement and pricing across 1994-2004 from a single video without a manufacturer-defined issue population.',
  ),

  'gmc-sonoma-fuel-pump-1991': replacement(
    {
      years: [2000],
      trims: ['Trucks with four-wheel disc brakes covered by the campaign'],
      category: 'brakes',
      title: 'ABS Motor Spring-Clip Recall',
      description: 'NHTSA campaign 00V055 covers certain 2000 GMC Sonoma trucks with four-wheel disc brakes. An out-of-specification spring clip can misalign the ABS motor bearing and eventually disable ABS and dynamic rear proportioning while base brakes remain functional.',
      solution: 'Check the VIN and brake configuration with GMC or NHTSA. Dealers replace the brake pressure-modulator valve assembly under the recall.',
      symptoms: ['ABS may become nonfunctional', 'Dynamic rear brake proportioning may become inoperative'],
      affectedSystems: ['ABS motor', 'motor-bearing spring clip', 'brake pressure-modulator valve', 'dynamic rear proportioning'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 00V055 - Sonoma ABS Motor', url: recall(2000) }],
      summary: 'Replaced an uncited fourteen-year fuel-pump aggregation with the exact ABS motor spring-clip recall.',
    },
    'The frozen card used blank and generic NHTSA vehicle-page links to assert pump, tank, relay, mileage and replacement claims across 1991-2004 without primary evidence.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Sonoma',
  make: 'GMC',
  model: 'Sonoma',
  slug: 'gmc-sonoma',
  batchId: 'gmc-sonoma-full-record-cohort-159-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '3c60538438a03e892e13a37b7281b27976d87fd0542968cf24d007c8ece1d830',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-sonoma/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsonoma_blind:manual-primary-source-gate',
    edge: 'gmcsonoma_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
