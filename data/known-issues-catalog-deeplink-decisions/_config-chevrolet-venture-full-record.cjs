const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const door = {
  years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005],
  trims: ['Right-hand power sliding door with second-row bucket seats or captain\'s chairs; VIN included in recall 04V-597'],
  category: 'safety',
  title: 'Power-Door Interior Handle Can Create an Arm-Injury Hazard (Recall 04V-597)',
  description: 'Recall 04V-597 covers certain 1997-2005 Chevrolet Venture vehicles with a right-hand power sliding door and second-row bucket seats or captain\'s chairs. If a passenger pulls and continues holding the interior handle while the motor opens the door, the passenger\'s arm can be pushed into the seatback or armrest, creating a wrist or lower-arm injury risk. The recall does not describe a motor or cable failure.',
  solution: 'Check the VIN for open recall 04V-597 / GM 04110. Dealers replace the right-hand power sliding-door interior handle and may replace the other rear handle for matching appearance, at no charge. Until repaired, follow GM\'s owner guidance not to use the interior handle to initiate opening; use the driver switch, remote or switch ahead of the door and supervise children.',
  severity: 'high',
  symptoms: ['VIN included in recall 04V-597', 'Right-hand power door begins opening while the passenger holds the interior handle', 'Handle/seat geometry can trap or press the passenger\'s arm'],
  affectedSystems: ['right-hand power sliding-door interior handle', 'power door activation', 'second-row seat/armrest clearance'],
  sources: [{ type: 'recall', title: 'GM Recall 04110 / NHTSA 04V-597 - Right-Hand Power Sliding Door Interior Handle', url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V597-2512.PDF' }],
  summary: 'Replaced the unsupported motor/cable failure claim with recall 04V-597\'s exact equipment population, arm-injury mechanism and handle-replacement remedy.',
};

const published = {
  'chevrolet-venture-power-sliding-door-2000': replacement(door, 'Replace the uncited 2000-2005 motor/cable failure aggregation with recall 04V-597\'s exact 1997-2005 equipment, handle-related injury mechanism and dealer remedy.'),
};

const reasons = {
  'chevrolet-venture-intake-gasket-1997': 'The frozen card has no citations and spans nine years while attributing coolant and oil symptoms to one Dex-Cool intake-gasket failure. Current GM/NHTSA primary research did not establish that population, mechanism or universal repair.',
};

module.exports = buildConfig({
  label: 'Chevrolet Venture',
  make: 'Chevrolet',
  model: 'Venture',
  slug: 'chevrolet-venture',
  batchId: 'chevrolet-venture-full-record-cohort-46-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7a1eb1085cd70e02065f67dd32b2061491cd26a2e25106fa47ad6da02142d772',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-venture/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletventure_blind:manual-primary-source-gate',
    edge: 'chevroletventure_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
