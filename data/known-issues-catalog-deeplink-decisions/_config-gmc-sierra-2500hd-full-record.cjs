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
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SIERRA%202500&modelYear=${year}`;

const published = {
  'gmc-sierra-hd-allison-tcm-2011': replacement(
    {
      years: [2007, 2008, 2009, 2010, 2011],
      trims: ['Trucks equipped with an auxiliary battery and covered by the campaign'],
      category: 'electrical',
      title: 'Auxiliary-Battery Fusible-Link Recall',
      description: 'NHTSA campaign 14V407 covers certain 2007-2011 GMC Sierra 2500HD trucks with an auxiliary battery. Excess current drawn through the trailer harness can melt the auxiliary-battery fusible link, which can contact adjacent components and create a fire risk.',
      solution: 'Check the VIN and equipment with GMC or NHTSA. Dealers replace the jumper harness with one containing a 40-amp inline fuse and provide supplemental owner-manual information.',
      symptoms: ['No reliable warning before the auxiliary-battery fusible link melts'],
      affectedSystems: ['auxiliary battery', 'fusible link', 'trailer harness', 'jumper harness'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V407 - Sierra 2500 Auxiliary Battery', url: recall(2011) }],
      summary: 'Replaced a fifteen-year Allison TCM aggregation with the exact auxiliary-battery fusible-link recall.',
    },
    'The frozen card generalized TCM electronics, limp mode, class-action allegations, repairs and parts across 2011-2025 using forums and repair vendors without a directly applicable GM campaign or bulletin.',
  ),

  'gmc-sierra-hd-duramax-cp4-failure-2011': replacement(
    {
      years: [2017, 2018, 2019],
      engines: ['6.6L Duramax diesel'],
      category: 'electrical',
      title: 'Duramax Engine-Block Heater Short Recall',
      description: 'NHTSA campaign 21V496 covers certain 2017-2019 GMC Sierra 2500HD trucks with a 6.6L Duramax diesel and optional engine-block heater. The heater cable or its terminals can short circuit and increase fire risk.',
      solution: 'Check the VIN and equipment with GMC or NHTSA. Dealers replace the block heater and heater cord; vehicles previously covered by 19V328 also receive a rerouted cord.',
      symptoms: ['No reliable warning before the heater cable or terminals short'],
      affectedSystems: ['engine-block heater', 'heater cable', 'heater terminals'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V496 - Sierra 2500 Block Heater', url: recall(2017) }],
      summary: 'Replaced a litigation-based CP4 fuel-pump aggregation with the exact Duramax block-heater electrical recall.',
    },
    'The frozen card extrapolated CP4 failure, contamination, fuel-quality causation, costs and preventive hardware across 2011-2020 from litigation and forum sources without a GM primary service document.',
  ),

  'gmc-sierra-hd-duramax-egr-cooler-2011': replacement(
    {
      years: [2017, 2018, 2019],
      trims: ['Trucks with the dual-fuel-tank option covered by the campaign'],
      category: 'fuel',
      title: 'Rear Fuel-Tank Collapse Recall',
      description: 'NHTSA campaign 23V047 covers certain 2017-2019 GMC Sierra 2500HD trucks with the dual-fuel-tank option. The rear tank can collapse and prevent the fuel pump from transferring fuel to the front tank, causing an engine stall.',
      solution: 'Check the VIN and tank configuration with GMC or NHTSA. Dealers inspect the rear tank and pump module, replace them as needed and add a vent hose to the rear-tank assembly.',
      symptoms: ['Engine may stall when fuel cannot transfer from the rear tank'],
      affectedSystems: ['rear fuel tank', 'fuel-pump module', 'tank vent hose', 'dual-tank transfer system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V047 - Sierra 2500 Rear Fuel Tank', url: recall(2017) }],
      summary: 'Replaced an aftermarket EGR-cooler narrative with the exact dual-tank collapse and stall recall.',
    },
    'The frozen card combined EGR cooler, bypass valve, coolant, DTC, cleaning and replacement claims across 2011-2016 from vendors and forums; one old bulletin did not support the entire aggregation.',
  ),

  'gmc-sierra-hd-front-axle-4wd-actuator-2011': replacement(
    {
      years: [2024],
      category: 'steering',
      title: 'Steering-Gear Shaft Fracture Recall',
      description: 'NHTSA campaign 23V549 covers certain 2024 GMC Sierra 2500HD trucks. The steering-gear shaft can fracture and disconnect from the steering arm, causing a total loss of steering control.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect and replace the steering gear as necessary free of charge under GM recall N232414720.',
      symptoms: ['No reliable warning before the steering-gear shaft fractures', 'Total loss of steering control can occur'],
      affectedSystems: ['steering gear', 'steering-gear shaft', 'steering arm'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V549 - Sierra 2500 Steering Gear', url: recall(2024) }],
      summary: 'Replaced an uncited four-wheel-drive actuator aggregation with the exact steering-gear shaft recall.',
    },
    'The frozen card had no citation and combined front-axle actuator, encoder, wiring, transfer-case and hub claims across thirteen years, including Ford-specific IWE terminology.',
  ),

  'gmc-sierra-hd-gas-engine-oil-consumption-2014': replacement(
    {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: ['Trucks with power-unlatching tailgates covered by the campaign'],
      category: 'electrical',
      title: 'Power Tailgate Water-Intrusion Recall',
      description: 'NHTSA campaign 24V060 covers certain 2020-2024 GMC Sierra 2500HD trucks with power-unlatching tailgates. Water can short the exterior gate-release switch and allow the tailgate to unlatch while the truck is in park, creating a cargo-loss hazard after driving begins.',
      solution: 'Check that the tailgate is closed and latched before driving. Check the VIN with GMC or NHTSA; dealers replace the exterior touchpad switch assemblies free of charge.',
      symptoms: ['Tailgate may unlatch while the truck is in park', 'Unsecured cargo may be lost if an unlatched gate opens while driving'],
      affectedSystems: ['power tailgate', 'exterior gate-release switch', 'touchpad switch assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V060 - Sierra 2500 Power Tailgate', url: recall(2020) }],
      summary: 'Replaced an inaccurate 6.0L AFM/oil-consumption card with the exact power-tailgate water-intrusion recall.',
    },
    'The frozen card conflated 6.0L and 6.2L engines, asserted AFM lifter wear and consumption across seven years, and cited legal and news material about other engines rather than a primary Sierra 2500HD source.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Sierra 2500HD',
  make: 'GMC',
  model: 'Sierra 2500HD',
  slug: 'gmc-sierra-2500hd',
  batchId: 'gmc-sierra-2500hd-full-record-cohort-157-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '712271f8e004b8ea22109c996385ad2e81f5df93c02f18b5128110271aa7cc12',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-sierra-2500hd/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsierra2500hd_blind:manual-primary-source-gate',
    edge: 'gmcsierra2500hd_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
