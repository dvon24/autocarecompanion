const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  mirrorSwitch: {
    type: 'recall',
    title: 'NHTSA Recall 03V093 - Exterior Mirror-Switch Short Circuit',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V093000',
  },
  rotorCorrosion: {
    type: 'recall',
    title: 'NHTSA Recall 93V119 - Front Rotor Corrosion and Separation',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=93V119000',
  },
  dieselFuelLines: {
    type: 'recall',
    title: 'NHTSA Recall 90V015 - Diesel Fuel-Line Chafing',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=90V015000',
  },
  transmissionCase: {
    type: 'recall',
    title: 'NHTSA Recall 95V026 - 4L80-E Transmission Case Leak',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=95V026000',
  },
};

function replace(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      ...after,
      citations: [{ type: source.type, title: source.title, url: source.url }],
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet C/K 2500',
  make: 'Chevrolet',
  model: 'C/K 2500',
  slug: 'chevrolet-c-k-2500',
  batchId: 'chevrolet-c-k-2500-full-record-cohort-9-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'dbe888757ea79e3a397525e987abdc7c29f1b28238974224105aac38255f68b7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-c-k-2500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletck2500_blind:self-no-blocker',
    edge: 'chevroletck2500_edge:self-no-blocker',
  },
  published: {
    'chevrolet-ck-2500-65l-diesel-injection-pump-1992': replace(
      sources.mirrorSwitch,
      'Replace an unsupported seven-year PMD/FSD aggregation and two unrelated search links with the exact 1998 exterior-mirror switch fire recall.',
      {
        years: [1998],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Exterior Mirror Switch Can Short and Ignite the Door (Recall 03V093)',
        description:
          'NHTSA Recall 03V093 covers certain 1998 Chevrolet C/K pickups. The electric exterior-mirror switch can short circuit, become inoperative, damage the driver door with heat or ignite door components without warning.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer installs a fused jumper harness at the exterior-mirror switch.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Exterior mirror switch stops working', 'Heat damage in the driver door', 'Smoke or fire in the driver door without warning'],
        affectedSystems: ['electric exterior-mirror switch, driver-door wiring and fused jumper harness'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported diesel PMD card with the exact 1998 mirror-switch fire recall and removed two search links.',
      },
    ),
    'chevrolet-ck-2500-brake-line-rust-1999': replace(
      sources.rotorCorrosion,
      'Replace a mismatched 1999-2003 Silverado brake-line aggregation and two search links with the exact salt-state front-rotor corrosion recall for K2500 trucks.',
      {
        years: [1988, 1989, 1990, 1991, 1992],
        trims: ['K-series 4WD vehicles in specified salt-belt states'],
        engines: [],
        category: 'brakes',
        title: 'Road Salt Can Separate the Front Brake Rotor Sections (Recall 93V119)',
        description:
          'NHTSA Recall 93V119 covers certain 1988-1992 Chevrolet K-series light trucks sold or registered in specified salt-belt states. Severe corrosion at the joint between the stamped-steel rotor center and cast outer section can separate the sections, reduce braking at that wheel and increase stopping distance.',
        solution:
          'Check the VIN for recall completion and the campaign VIN/state criteria. The remedy replaces affected front brake rotors with corrosion-protected rotors.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Severe corrosion at the front rotor joint', 'Reduced braking at an affected wheel', 'Increased stopping distance or loss of control'],
        affectedSystems: ['front disc-brake rotor center and cast outer section'],
        dtcCodes: [],
        summary:
          'Replaced a mis-scoped Silverado brake-line card with the exact salt-state K2500 rotor recall and removed two search links.',
      },
    ),
    'chevrolet-ck-2500-fuel-pump-1990': replace(
      sources.dieselFuelLines,
      'Replace an eleven-year fuel-pump aggregation and two search links with the exact 1990 6.2L diesel fuel-line chafing recall.',
      {
        years: [1990],
        trims: [],
        engines: ['6.2L diesel'],
        category: 'fuel',
        title: 'Diesel Fuel Lines Can Chafe and Leak Near the Exhaust (Recall 90V015)',
        description:
          'NHTSA Recall 90V015 covers certain 1990 Chevrolet C/K pickups with 6.2L diesel engines. Feed or return fuel lines can contact the automatic-transmission shift linkage, and K-series lines can also contact the front propeller shaft, wearing through and leaking fuel near the exhaust crossover pipe.',
        solution:
          'Check the VIN for recall completion. The campaign installs a redesigned fuel-line routing bracket and replaces damaged fuel lines when necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Fuel-line contact with the shift linkage or front propeller shaft', 'Chafed or leaking diesel fuel line', 'Engine-compartment fire risk near the exhaust crossover'],
        affectedSystems: ['diesel feed and return lines, routing bracket, shift linkage and front propeller shaft'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported fuel-pump card with the exact 1990 diesel fuel-line recall and removed two search links.',
      },
    ),
    'chevrolet-ck-2500-transfer-case-chain-1996': replace(
      sources.transmissionCase,
      'Replace a five-year transfer-case chain aggregation and two unrelated search links with the exact 1995 4L80-E case-casting recall.',
      {
        years: [1995],
        trims: [],
        engines: [],
        category: 'transmission',
        title: 'Thin 4L80-E Case Casting Can Leak Oil onto the Exhaust (Recall 95V026)',
        description:
          'NHTSA Recall 95V026 covers certain 1995 Chevrolet C/K pickups equipped with the 4L80-E automatic transmission. A thin case casting can leak externally and spray transmission oil onto the exhaust, creating a vehicle-fire risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects the transmission case assembly and replaces the transmission when the affected casting is present.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['External transmission-oil leak', 'Oil sprayed onto the exhaust system', 'Smoke or fire risk beneath the vehicle'],
        affectedSystems: ['4L80-E transmission case and adjacent exhaust system'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported transfer-case chain card with the exact 1995 4L80-E case recall and removed two search links.',
      },
    ),
  },
  proposalCampaigns: [],
});
