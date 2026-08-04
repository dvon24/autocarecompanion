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
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const fuelWiringRecall = {
  years: [1994, 1995],
  trims: ['Vehicles included in NHTSA campaign 99V028000'],
  engines: [],
  category: 'electrical',
  title: 'Fuel-Pump Wiring Can Short, Disable the Vehicle, or Cause a Fire (Recall)',
  description:
    'NHTSA campaign 99V028000 covers certain 1994-1995 Ford Aerostar minivans. Heat in the wiring harness to the fuel-pump and sender assembly can create an electrical short. An affected vehicle may lose power and become immobilized, the fuel gauge may behave erratically, and heat damage can melt or char the harness; the short can also cause a vehicle fire.',
  solution:
    'Check the VIN for an open recall with NHTSA or a Ford dealer. The recall remedy is installation of a fused jumper harness in the fuel-pump ground circuit at the fuel-pump inertia shut-off switch. Do not replace the pump or relay solely from the former generic card.',
  severity: 'high',
  symptoms: ['Loss of vehicle power', 'Vehicle becomes immobilized', 'Erratic fuel-gauge operation', 'Melted or charred fuel-pump wiring'],
  affectedSystems: ['fuel-pump and sender wiring harness', 'fuel-pump ground circuit'],
  dtcCodes: [],
  sources: [
    { type: 'nhtsa', title: 'NHTSA Recall API - 1994 Ford Aerostar (Campaign 99V028000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Aerostar&modelYear=1994' },
    { type: 'nhtsa', title: 'NHTSA Recall API - 1995 Ford Aerostar (Campaign 99V028000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Aerostar&modelYear=1995' },
  ],
  source: 'manual',
  summary:
    'Replaced the unsupported eight-year in-tank pump-failure narrative with NHTSA campaign 99V028000, correcting the population, failure component, symptoms, hazard, and fused-jumper-harness remedy.',
};

const awdPowertrainRecall = {
  years: [1992, 1993, 1994, 1995, 1996, 1997],
  trims: ['All-wheel drive vehicles included in NHTSA campaigns 97V204000 or 99V094000'],
  engines: [],
  category: 'drivetrain',
  title: 'AWD Transfer-Case or Transmission Structure Can Fail (Recalls)',
  description:
    'NHTSA campaigns 97V204000 and 99V094000 cover affected 1992-1997 all-wheel-drive Ford Aerostar minivans, with the later campaign adding 1992 vehicles not included previously. Powertrain bending resonance or displacement of the transfer-case output-shaft bushing can cause structural failure of the transmission and/or transfer case. Fluid expulsion, driveshaft separation, or loss of drive can result, creating loss-of-control and fire risks.',
  solution:
    'Check the VIN for both campaigns with NHTSA or a Ford dealer. The recall remedy is installation of a new transfer-case rear output-shaft bushing and an aluminum driveshaft. The former A4LD rebuild, shift-kit, fluid-interval, and transmission-swap advice is not part of these campaigns.',
  severity: 'high',
  symptoms: ['Loss of vehicle drive', 'Driveshaft separation', 'Fluid expelled from the transmission or transfer case'],
  affectedSystems: ['transfer-case rear output-shaft bushing', 'transmission structure', 'transfer case', 'driveshaft'],
  dtcCodes: [],
  sources: [
    { type: 'nhtsa', title: 'NHTSA Recall API - 1992 Ford Aerostar (Campaigns 97V204000 and 99V094000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Aerostar&modelYear=1992' },
    { type: 'nhtsa', title: 'NHTSA Recall API - 1997 Ford Aerostar (Campaign 97V204000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Aerostar&modelYear=1997' },
  ],
  source: 'manual',
  summary:
    'Replaced the unsupported eight-year A4LD/4R transmission aggregation with the exact AWD structural-failure recall scope and remedy, removing generic design claims, DTCs, upgrades, costs, and maintenance advice.',
};

const published = {
  'ford-aerostar-fuel-pump-1990': replacement(
    fuelWiringRecall,
    'Retain only the directly related NHTSA fuel-pump wiring recall, corrected to its exact 1994-1995 scope and fused-jumper remedy; archive the generic pump and relay failure narrative.',
  ),
  'ford-aerostar-transmission-failure-1990': replacement(
    awdPowertrainRecall,
    'Retain only the directly related NHTSA AWD transmission/transfer-case structural-failure campaigns, replacing the unsupported A4LD chronic-failure and rebuild narrative.',
  ),
};

const reasons = {
  'ford-aerostar-ball-joint-1990':
    'The frozen card applies front ball-joint wear, warning symptoms, inspection advice, and a replacement interval to all eight model years from a single how-to video without a Ford bulletin, investigation, or recall defining that population.',
  'ford-aerostar-head-gasket-1990':
    'The frozen card generalizes one forum thread and generic 3.0L/3.8L/4.0L diagnostic articles into an eight-year Aerostar head-gasket defect, engine-specific explanation, and machining/replacement remedy without a Ford primary publication.',
  'ford-aerostar-rear-axle-bearing-1990':
    'The frozen card has no usable cited primary source and applies rear axle-bearing and seal failure, symptoms, axle-shaft damage, costs, and a repair procedure to all eight model years without a Ford bulletin or NHTSA campaign establishing that scope.',
};

module.exports = buildConfig({
  label: 'Ford Aerostar',
  make: 'Ford',
  model: 'Aerostar',
  slug: 'ford-aerostar',
  batchId: 'ford-aerostar-full-record-cohort-98-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '33e63fe832459aff6909e1d41a0937c3a0323c00ec8f1fd8e12ddcb719975094',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-aerostar/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordaerostar_blind:manual-primary-source-gate',
    edge: 'fordaerostar_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
