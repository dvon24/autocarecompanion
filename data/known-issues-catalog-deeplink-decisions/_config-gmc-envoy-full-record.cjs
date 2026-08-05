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

const recalls = 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=Envoy&modelYear=2002';

const published = {
  'gmc-envoy-4-2l-crankshaft-sensor-2002': replacement(
    {
      years: [2002],
      category: 'suspension',
      title: 'Front Lower Control-Arm Bracket Recall',
      description: 'NHTSA campaign 01V126 covers certain 2002 GMC Envoy vehicles. A front lower control-arm bracket can fracture and allow the control arm to separate from the frame.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace both front lower control-arm brackets under the recall.',
      symptoms: ['Front control-arm bracket may fracture without a reliable warning'],
      affectedSystems: ['front lower control arms', 'control-arm frame brackets'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 01V126 - Envoy Control-Arm Brackets', url: recalls }],
      summary: 'Replaced a repair-site and forum crank-sensor generalization with the model-year-specific NHTSA suspension recall.',
    },
    'The frozen card called the sensor notorious, asserted heat-soak and highway-stall behavior across eight years and prescribed parts and calibration steps from non-GM sources.',
  ),

  'gmc-envoy-fan-clutch-2002': replacement(
    {
      years: [2002],
      category: 'fuel',
      title: 'Fuel-Filter Quick-Connect Recall',
      description: 'NHTSA campaign 02V121 covers certain 2002 GMC Envoy vehicles. A fuel-filter fitting can disconnect, causing a no-start and allowing fuel to be pumped onto the ground during a start attempt.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the fuel-filter quick-connect retainers under the recall. A fuel leak requires immediate shutdown and professional service.',
      symptoms: ['No-start condition', 'Fuel may leak near the fuel filter during cranking'],
      affectedSystems: ['fuel filter fitting', 'quick-connect retainers'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 02V121 - Envoy Fuel-Filter Fitting', url: recalls }],
      summary: 'Replaced a video-only cooling-fan claim and aftermarket conversion advice with the exact fuel-system recall.',
    },
    'The frozen card cited only a video, assumed one fan-clutch electronics failure across eight years, named an aftermarket part and suggested an unapproved electric-fan conversion.',
  ),

  'gmc-envoy-instrument-cluster-stepper-2003': replacement(
    {
      years: [2002],
      category: 'electrical',
      title: 'Instrument-Panel Cluster Startup Recall',
      description: 'NHTSA campaign 03V096 covers certain 2002 GMC Envoy vehicles. During startup, the instrument-panel cluster may fail to power up, leaving most displays, telltales and functions inoperative.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers reprogram the instrument-panel cluster under the recall.',
      symptoms: ['Most instrument-cluster displays and warning functions may not power up'],
      affectedSystems: ['instrument-panel cluster', 'cluster software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 03V096 - Envoy Instrument Cluster', url: recalls }],
      summary: 'Replaced an uncited stepper-motor repair and pricing card with the exact federal cluster-compliance recall.',
    },
    'The frozen card had no citation and asserted universal stepper-motor failures, platform prevalence, part numbers, DIY soldering, remanufactured-cluster behavior and prices.',
  ),

  'gmc-envoy-transfer-case-4wd-failure-2002': replacement(
    {
      years: [2002],
      trims: ['Four-wheel-drive vehicles covered by the campaign'],
      category: 'drivetrain',
      title: 'Cracked Transfer-Case Range Collar Recall',
      description: 'NHTSA campaign 01V283 covers certain 2002 four-wheel-drive GMC Envoy vehicles whose transfer-case range-shift collar can contain cracks.',
      solution: 'Check the VIN and drivetrain with GMC or NHTSA. Dealers replace the transfer case and update the transfer-case control-module calibration under the recall.',
      symptoms: ['No reliable warning before a cracked range collar affects transfer-case operation'],
      affectedSystems: ['transfer case', 'range-shift collar', 'transfer-case control module'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 01V283 - Envoy Transfer Case', url: recalls }],
      summary: 'Kept transfer-case content but replaced an uncited multi-component wear narrative with the exact range-collar recall and combined hardware/software remedy.',
    },
    'The frozen card had no citations and asserted encoder-motor, hall-sensor, front-axle actuator, neutral-shift, mileage, fluid and wiring failures across eight years without a defined GM population.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Envoy',
  make: 'GMC',
  model: 'Envoy',
  slug: 'gmc-envoy',
  batchId: 'gmc-envoy-full-record-cohort-150-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '53799b8fed2c26e8b4343f0122d62a1d5bbb7bf9adf1d6fa48742bda84cb27dd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-envoy/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcenvoy_blind:manual-primary-source-gate',
    edge: 'gmcenvoy_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
