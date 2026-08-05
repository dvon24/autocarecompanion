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

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SAFARI&modelYear=${year}`;

const published = {
  'gmc-safari-fuel-spider-injector-1996': replacement(
    {
      years: [1990],
      category: 'fuel',
      title: 'Fuel-Return Hose Recall',
      description: 'NHTSA campaign 90V146 covers certain 1990 GMC Safari vans. A fuel-return hose can break at either crimped coupling and leak fuel.',
      solution: 'Check the VIN with GMC or NHTSA. The recall remedy installs a properly crimped fuel-return hose. Stop driving and arrange professional service if fuel is leaking.',
      symptoms: ['Fuel may leak at a fuel-return-hose crimped coupling'],
      affectedSystems: ['fuel-return hose', 'crimped hose couplings'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 90V146 - Safari Fuel-Return Hose', url: recall(1990) }],
      summary: 'Replaced a ten-year central-injection generalization supported only by repair and aftermarket pages with the exact fuel-return-hose recall.',
    },
    'The frozen card generalized poppet sticking and internal fuel-line cracking across 1996-2005, prescribed an MPFI conversion and cited no GM campaign or bulletin.',
  ),

  'gmc-safari-43l-intake-gasket-1996': replacement(
    {
      years: [2003],
      category: 'suspension',
      title: 'Lower Ball-Joint Boot Interference Recall',
      description: 'NHTSA campaign 03V328 covers certain 2003 GMC Safari vans. Interference between a lower ball-joint rubber boot and the steering knuckle can cut the boot, admit road contamination and accelerate ball-joint wear.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the steering knuckles free of charge under the recall.',
      symptoms: ['A lower ball-joint boot may be cut', 'Contamination can accelerate lower ball-joint wear'],
      affectedSystems: ['lower ball joints', 'rubber ball-joint boots', 'steering knuckles'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 03V328 - Safari Ball-Joint Boots', url: recall(2003) }],
      summary: 'Replaced an uncited intake-gasket card with the exact 2003 lower-ball-joint boot and steering-knuckle recall.',
    },
    'The frozen card had no citations and asserted a shared Astro gasket defect, engine-location labor impact, coolant/oil symptoms, sealant procedure and pricing across ten years.',
  ),

  'gmc-safari-fuel-pump-1990': replacement(
    {
      years: [1995],
      category: 'fuel',
      title: 'Loose Fuel-Tank Line Recall',
      description: 'NHTSA campaign 94V188 covers certain 1995 GMC Safari vans whose fuel lines were not tightened properly where they attach to the fuel tank.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers lower the fuel tank and tighten the fuel-tank lines to the specified torque under the recall. Stop driving and arrange professional service if fuel is leaking.',
      symptoms: ['Fuel may leak from improperly tightened fuel-tank line connections'],
      affectedSystems: ['fuel tank', 'fuel-line connections'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 94V188 - Safari Fuel-Tank Lines', url: recall(1995) }],
      summary: 'Replaced an uncited sixteen-year fuel-pump and supposed twin-tank narrative with the exact fuel-tank-line recall.',
    },
    'The frozen card had no citations, labeled fuel-pump failure common across every 1990-2005 model year and asserted twin-tank switching complexity without defining an affected population.',
  ),

  'gmc-safari-rear-door-latch-1990': replacement(
    {
      years: [2001, 2002],
      category: 'electrical',
      title: 'Stop-Lamp and Hazard-Lamp Switch Recall',
      description: 'NHTSA campaign 05V099 covers certain 2001-2002 GMC Safari vans. An open circuit in the multifunction switch can make the stop lamps or hazard lamps inoperative.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers replace the hazard-warning flasher switch and grease its contacts; if the hazard slider is frozen, they replace the entire multifunction switch.',
      symptoms: ['Stop lamps may not illuminate', 'Hazard lamps may not illuminate', 'Hazard slider button may be frozen'],
      affectedSystems: ['multifunction switch', 'hazard-warning flasher switch', 'stop lamps', 'hazard lamps'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 05V099 - Safari Stop and Hazard Lamps', url: recall(2001) }],
      summary: 'Replaced a sixteen-year rear-door claim supported only by a video with the exact stop-lamp and hazard-lamp switch recall.',
    },
    'The frozen card extrapolated Dutch-door latch, hinge, glass and adjustment failures across every 1990-2005 model year from one video and supplied no manufacturer-defined population.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Safari',
  make: 'GMC',
  model: 'Safari',
  slug: 'gmc-safari',
  batchId: 'gmc-safari-full-record-cohort-154-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd772b9f44199e653af7e6fce9cc64caa7c7f0860050884bc2d6c728602e4338e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-safari/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsafari_blind:manual-primary-source-gate',
    edge: 'gmcsafari_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
