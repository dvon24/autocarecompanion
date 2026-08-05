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

const recall = (model, year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=${model}&modelYear=${year}`;

const published = {
  'gmc-hummer-ev-suv-air-suspension-2024': replacement(
    {
      years: [2024],
      category: 'drivetrain',
      title: 'Rear Drive-Unit Wiring Recall',
      description: 'NHTSA campaign 24V320 covers certain 2024 GMC Hummer EV SUVs. Insufficient insulation can allow wires inside the rear drive-unit motors to contact each other and cause a loss of drive power.',
      solution: 'Check the VIN with GMC or the EV Concierge. Dealers replace the rear drive unit free of charge under GM campaign N242447080.',
      symptoms: ['Possible loss of drive power'],
      affectedSystems: ['rear drive unit', 'electric-motor wiring insulation'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V320 - Hummer EV SUV Rear Drive Unit', url: recall('HUMMER%20EV', 2024) }],
      summary: 'Replaced an uncited air-suspension software and compressor narrative with the exact rear drive-unit safety recall.',
    },
    'The frozen card had blank citations and asserted height, software, sensor, compressor, cooldown and GDS2 procedures across three years without a GM-defined issue population.',
  ),

  'gmc-hummer-ev-suv-charge-port-2024': replacement(
    {
      years: [2024],
      category: 'safety',
      title: 'Front Seat-Belt Buckle Bolt Recall',
      description: 'NHTSA campaign 23V786 covers certain 2024 GMC Hummer EV SUVs. A left or right front seat-belt buckle attachment bolt may not be tightened properly.',
      solution: 'Check the VIN with GMC or the EV Concierge. Dealers tighten both front seat-belt buckle attachment bolts free of charge under GM campaign N232419280.',
      symptoms: ['Front seat-belt buckle attachment may be loose'],
      affectedSystems: ['front seat-belt buckle bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V786 - Hummer EV SUV Seat-Belt Bolts', url: recall('HUMMER%20EV', 2024) }],
      summary: 'Replaced a fabricated Reddit link and generic charging workaround card with the exact seat-belt fastener recall.',
    },
    'The frozen card cited a Reddit URL with a placeholder identifier and asserted charger-network, 80-percent, preconditioning and firmware behavior without a GM primary source.',
  ),

  'gmc-hummer-ev-suv-charging-2024': replacement(
    {
      years: [2026],
      category: 'safety',
      title: 'Front Passenger Airbag Connection Recall',
      description: 'NHTSA campaign 25V769 covers certain 2026 GMC Hummer EV SUVs. An improperly crimped wire at the front-passenger airbag connection can prevent the airbag from deploying as intended.',
      solution: 'Check the VIN with GMC. Dealers install a jumper harness free of charge under GM campaign N252524530.',
      symptoms: ['No reliable warning before an affected passenger airbag is needed'],
      affectedSystems: ['front-passenger airbag connection', 'jumper harness'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V769 - Hummer EV SUV Passenger Airbag', url: recall('HUMMER%20EV%20SUV', 2026) }],
      summary: 'Replaced uncited charging-speed, charge-port and connector claims with the exact 2026 airbag connection recall.',
    },
    'The frozen card had blank citations and asserted charging power, battery conditioning, software, port-door actuator, connector fit, warranty and multi-network behavior across three years.',
  ),

  'gmc-hummer-ev-suv-infotainment-2024': replacement(
    {
      years: [2026],
      category: 'electrical',
      title: 'Electronic Owner-Manual Download Recall',
      description: 'NHTSA campaign 26V114 covers certain 2026 GMC Hummer EV SUVs. The radio may not have been configured to download the electronic owner manual, causing the vehicles to fail a federal occupant-protection information requirement.',
      solution: 'Check the VIN with GMC. Dealers reset the radio so the electronic owner manual downloads automatically free of charge under GM campaign N252540430.',
      symptoms: ['Electronic owner manual may be unavailable through the vehicle radio'],
      affectedSystems: ['radio configuration', 'electronic owner-manual download'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V114 - Hummer EV SUV Owner Manual', url: recall('HUMMER%20EV%20SUV', 2026) }],
      summary: 'Replaced an uncited catch-all about screens, Bluetooth, cameras and resets with the exact radio-configuration recall.',
    },
    'The frozen card had blank citations and generalized freezing, reboots, connectivity, camera, feature-control and hardware-replacement claims across three years with improvised reset advice.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Hummer EV SUV',
  make: 'GMC',
  model: 'Hummer EV SUV',
  slug: 'gmc-hummer-ev-suv',
  batchId: 'gmc-hummer-ev-suv-full-record-cohort-152-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '0b402db796635ead3c1a6867d3a1537c0fb3fb1826b0973eed81694e8d02b872',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-hummer-ev-suv/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmchummerevsuv_blind:manual-primary-source-gate',
    edge: 'gmchummerevsuv_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
