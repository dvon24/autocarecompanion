const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  wiperMotor: {
    type: 'recall',
    title: 'NHTSA Recall 03V159 - Windshield-Wiper Motor Circuit Board',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V159000',
  },
  stopLamps: {
    type: 'recall',
    title: 'NHTSA Recall 05V099 - Stop and Hazard Lamp Switch',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V099000',
  },
  ballJoint: {
    type: 'recall',
    title: 'NHTSA Recall 03V328 - Lower Ball-Joint Boot Interference',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V328000',
  },
  mirrorSwitch: {
    type: 'recall',
    title: 'NHTSA Recall 03V093 - Exterior-Mirror Switch Short Circuit',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V093000',
  },
};

function evidence(...items) {
  return items.map((item) => ({ type: item.type, label: item.title, url: item.url }));
}

function citations(...items) {
  return items.map((item) => ({ type: item.type, title: item.title, url: item.url }));
}

module.exports = buildConfig({
  label: 'Chevrolet Astro',
  make: 'Chevrolet',
  model: 'Astro',
  slug: 'chevrolet-astro',
  batchId: 'chevrolet-astro-full-record-cohort-1-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '2a2cccbcbe6c6ddf34f773dc5f463ed7b4d3da5f967efb0d16e69d031c444914',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-astro/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletastro_blind:self-no-blocker',
    edge: 'chevroletastro_edge:self-no-blocker',
  },
  published: {
    'chevrolet-astro-43l-intake-gasket-1996': {
      disposition: 'replace',
      decision:
        'Replace the unsupported intake-gasket aggregation, repair-cost estimate and search links with the exact 1995-1997 windshield-wiper motor circuit-board recall.',
      evidence: evidence(sources.wiperMotor),
      after: {
        years: [1995, 1996, 1997],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Windshield Wipers Can Fail Intermittently or Completely (Recall 03V159)',
        description:
          'NHTSA Recall 03V159 covers certain 1995-1997 Chevrolet Astro vehicles with specified model-engine combinations. Cracked solder joints on the wiper-motor controller circuit board can make the windshield wipers operate intermittently or stop working. A failure in bad weather can reduce visibility and increase crash risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the windshield-wiper motor circuit board and cover under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Windshield wipers operate intermittently', 'Windshield wipers do not operate'],
        affectedSystems: ['windshield-wiper motor controller circuit board'],
        dtcCodes: [],
        citations: citations(sources.wiperMotor),
        summary:
          'Replaced an unsupported intake-gasket and cost card with the exact 1995-1997 wiper-controller recall and removed both search-link commerce claims.',
      },
    },
    'chevrolet-astro-fuel-spider-1990': {
      disposition: 'replace',
      decision:
        'Replace the forum and complaint-page-derived fuel-spider aggregation, part number and search link with the exact 2001-2002 stop/hazard-lamp switch recall.',
      evidence: evidence(sources.stopLamps),
      after: {
        years: [2001, 2002],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Stop and Hazard Lamps Can Become Inoperative (Recall 05V099)',
        description:
          'NHTSA Recall 05V099 covers certain 2001-2002 Chevrolet Astro vehicles. The multifunction switch can develop an open circuit in the stop-lamp or hazard-lamp circuit, leaving the rear stop and hazard lamps inoperative. Following drivers may not be warned that the van is braking or stopped.',
        solution:
          'Check the VIN for recall completion. The dealer replaces the hazard-warning flasher switch and applies specified contact grease when the slider remains movable; if the slider is frozen, the dealer replaces the entire multifunction switch.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Stop lamps do not illuminate', 'Rear hazard lamps do not illuminate', 'Hazard slider button is frozen'],
        affectedSystems: ['multifunction switch, stop-lamp circuit and hazard-lamp circuit'],
        dtcCodes: [],
        citations: citations(sources.stopLamps),
        summary:
          'Replaced a broad fuel-spider aggregation with the exact 2001-2002 stop/hazard-lamp recall and removed the unsupported part recommendation and search link.',
      },
    },
    'chevrolet-astro-rear-differential-noise-1995': {
      disposition: 'replace',
      decision:
        'Replace the complaint-page-derived differential-noise aggregation and four generic search links with the exact 2003 lower-ball-joint boot interference recall.',
      evidence: evidence(sources.ballJoint),
      after: {
        years: [2003],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Lower Ball-Joint Boots Can Be Cut by Steering Knuckles (Recall 03V328)',
        description:
          'NHTSA Recall 03V328 covers certain 2003 Chevrolet Astro vehicles. Interference between each lower ball-joint rubber boot and steering knuckle can cut the boot, letting road contamination enter and accelerate joint wear. A worn joint can separate, impair directional control and braking, and in an extreme case allow the wheel assembly to separate.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces both steering knuckles under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Cut or damaged lower ball-joint rubber boot', 'Accelerated lower ball-joint wear', 'Difficulty maintaining directional control if separation occurs'],
        affectedSystems: ['lower ball joints, steering knuckles and front suspension'],
        dtcCodes: [],
        citations: citations(sources.ballJoint),
        summary:
          'Replaced an unsupported differential-noise card with the exact 2003 lower-ball-joint campaign and removed four generic commerce links.',
      },
    },
    'chevy-astro-awd-transfer-case-1990': {
      disposition: 'replace',
      decision:
        'Replace the video and complaint-page-derived AWD transfer-case aggregation, incorrect fluid claim and search links with the exact 1998 exterior-mirror switch fire-risk recall.',
      evidence: evidence(sources.mirrorSwitch),
      after: {
        years: [1998],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Exterior-Mirror Switch Can Short and Cause a Door Fire (Recall 03V093)',
        description:
          'NHTSA Recall 03V093 covers certain 1998 Chevrolet Astro vehicles. The electric outside-rearview-mirror switch can short circuit, leaving the switch inoperative, damaging the driver door with heat, or igniting door components and causing a vehicle fire without warning.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer installs a fused jumper harness at the electric exterior-mirror switch under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Exterior-mirror switch stops working', 'Heat damage in the driver door', 'Smoke or fire in the driver door without prior warning'],
        affectedSystems: ['electric exterior-mirror switch and driver-door wiring'],
        dtcCodes: [],
        citations: citations(sources.mirrorSwitch),
        summary:
          'Replaced an unsupported AWD transfer-case card and incorrect fluid recommendation with the exact 1998 mirror-switch fire-risk recall and removed both search links.',
      },
    },
  },
  proposalCampaigns: [],
});
