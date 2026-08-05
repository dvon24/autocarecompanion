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
      severity: card.severity || 'high',
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

const recall = (model, year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=${model}&modelYear=${year}`;

const published = {
  'gmc-ck-3500-oil-pressure-sender-1990': replacement(
    {
      years: [1994],
      category: 'electrical',
      title: 'Brake-Lamp Switch Wiring Recall',
      description: 'NHTSA campaign 99V025 covers certain 1994 GMC C3500 trucks. Reversed wiring polarity can prematurely wear the brake-switch contacts and cause the brake lamps to stop working without warning.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the brake switch and correct the wiring polarity under the recall.',
      symptoms: ['Brake lamps may stop working without warning'],
      affectedSystems: ['brake-lamp switch', 'brake-switch wiring'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 99V025 - GMC C3500 Brake Switch', url: recall('C3500', 1994) }],
      summary: 'Replaced a video-sourced oil-sender generalization with the model-year-specific NHTSA brake-lamp recall.',
    },
    'The frozen card relied only on a video and asserted sender location, heat exposure, parts, sealant and gauge-testing instructions across nine model years without GMC primary evidence.',
  ),

  'gmc-ck-3500-rear-axle-seal-1990': replacement(
    {
      years: [1992],
      category: 'brakes',
      title: 'Brake-Pedal Pivot-Bolt Recall',
      description: 'NHTSA campaign 92V056 covers certain 1992 GMC C3500 trucks. The brake-pedal pivot bolt may be improperly tightened and can disengage from its nut.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the brake-pedal pivot bolt and tighten it to the specified torque.',
      symptoms: ['Brake-pedal pivot bolt may loosen or disengage'],
      affectedSystems: ['brake pedal', 'pivot bolt and support bracket'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 92V056 - GMC C3500 Brake Pedal', url: recall('C3500', 1992) }],
      summary: 'Replaced an entirely uncited axle-seal card with the direct NHTSA brake-pedal recall.',
    },
    'The frozen card had no citation and generalized hub-seal, inner-seal, bearing and brake-shoe replacement procedures across nine model years.',
  ),

  'gmc-ck3500-brake-hydroboost-1990': replacement(
    {
      years: [1993],
      category: 'transmission',
      title: 'Automatic-Transmission Vent-Hose Recall',
      description: 'NHTSA campaign 93V016 covers certain 1993 GMC C3500 trucks. Unanticipated transmission heat can force automatic-transmission fluid out of the vent tube.',
      solution: 'Check the VIN with GMC or NHTSA. The recall remedy installs a longer transmission vent hose routed to the left side of the engine compartment.',
      symptoms: ['Transmission fluid may be expelled from the vent tube'],
      affectedSystems: ['automatic transmission', 'transmission vent tube and hose'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V016 - GMC C3500 Transmission Vent', url: recall('C3500', 1993) }],
      summary: 'Replaced a forum-derived hydroboost aggregation with the model-specific NHTSA transmission vent recall.',
    },
    'The frozen card combined diesel and gasoline configurations, multiple assumed hydraulic failure modes, remanufactured parts and accumulator tests based only on forum threads.',
  ),

  'gmc-ck3500-fuel-pump-1990': replacement(
    {
      years: [1990],
      category: 'safety',
      title: 'Rear Seat-Belt Adjustment Instructions Recall',
      description: 'NHTSA campaign 90V170 covers certain 1990 GMC K3500 trucks whose owner information contained incorrect instructions for adjusting the rear lap-shoulder belts.',
      solution: 'Check the VIN and campaign applicability with GMC or NHTSA. The recall remedy provides the corrected owner-manual insert for rear seat-belt adjustment.',
      symptoms: ['Incorrect rear seat-belt adjustment instructions may be present'],
      affectedSystems: ['rear lap-shoulder belts', 'owner instructions'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 90V170 - GMC K3500 Seat-Belt Instructions', url: recall('K3500', 1990) }],
      summary: 'Replaced an uncited universal fuel-pump failure narrative with the verified NHTSA seat-belt instructions campaign.',
    },
    'The frozen card had blank citations and asserted mileage, tank size, cooling, dual-tank, part-brand and preventive-monitoring claims across eleven model years without primary evidence.',
  ),
};

const reasons = {
  'gmc-ck3500-idler-pitman-arm-1990': 'The frozen card has blank citations and generalizes cab configuration, component wear, axle weight, tire and lift-kit effects, part brands, alignment and lubrication advice across eleven years without a GMC/NHTSA primary source defining the issue population.',
};

module.exports = buildConfig({
  label: 'GMC C/K 3500',
  make: 'GMC',
  model: 'C/K 3500',
  slug: 'gmc-c-k-3500',
  batchId: 'gmc-c-k-3500-full-record-cohort-148-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c1b5110f54fa3ce1b682fab30c2d9c14f9ba7dbf6753b04a6f5a4dd0dab94dfb',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-c-k-3500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcck3500_blind:manual-primary-source-gate',
    edge: 'gmcck3500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
