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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=HUMMER%20EV&modelYear=${year}`;

const published = {
  'gmc-hummer-ev-a-pillar-leak-2022': replacement(
    {
      years: [2022],
      category: 'electrical',
      title: 'X500 Connector Corrosion and Body-Panel Sealing Bulletin',
      description: 'GM bulletin 10217073 covers specified 2022 GMC Hummer EV Pickups and directs technicians to inspect the X500 electrical connector for corrosion.',
      solution: 'A GMC dealer inspects and repairs the X500 connector when corrosion is present and reseals the relevant body panels under the bulletin whether or not connector corrosion is found.',
      severity: 'medium',
      symptoms: ['Door electrical functions may be affected when the X500 connector corrodes'],
      affectedSystems: ['X500 electrical connector', 'body-panel sealing'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10217073 - Hummer EV X500 Connector Corrosion', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217073-0001.pdf' }],
      summary: 'Narrowed the card to the 2022 GM connector-inspection and panel-reseal procedure and removed roof-panel, cost and dielectric-grease claims.',
    },
    'The frozen card expanded a 2022 bulletin across three years, attributed the condition to removable roof panels and prescribed connector terminals, weatherstripping, costs and dielectric grease beyond the GM summary.',
  ),

  'gmc-hummer-ev-battery-seal-water-2022': replacement(
    {
      years: [2022, 2023],
      trims: ['Hummer EV Pickup vehicles covered by the campaign'],
      category: 'electrical',
      title: 'High-Voltage Battery Enclosure Water-Ingress Recall',
      description: 'NHTSA campaign 22V771 covers certain 2022-2023 GMC Hummer EV Pickups. The high-voltage battery-pack enclosure may not be properly sealed, allowing water to enter the pack and increasing the risk of a loss of drive power or fire.',
      solution: 'Check the VIN with GMC or the EV Concierge. Follow the current manufacturer campaign instructions; the public NHTSA record states that the final remedy is under development rather than promising a specific reseal procedure.',
      severity: 'high',
      symptoms: ['Possible battery-pack water intrusion', 'Possible loss of drive power'],
      affectedSystems: ['high-voltage battery-pack enclosure', 'battery-pack sealing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V771 - Hummer EV Battery Enclosure', url: recalls(2023) }],
      summary: 'Corrected the frozen card’s unsupported completed-remedy claim and removed secondary reporting, incident counts and deep-water driving advice.',
    },
    'The frozen card mixed official and secondary sources, asserted flange and coating details, incident counts and a free inspect-and-reseal remedy even though the NHTSA campaign record states the remedy is under development.',
  ),

  'gmc-hummer-ev-charging-software-2022': replacement(
    {
      years: [2022],
      category: 'electrical',
      title: 'High-Voltage Battery Connection Recall',
      description: 'NHTSA campaign 23V367 covers certain 2022 GMC Hummer EV vehicles. Connections inside the high-voltage battery pack may be out of position or welded incorrectly and can cause a loss of drive power.',
      solution: 'Check the VIN with GMC or the EV Concierge. Dealers inspect the high-voltage battery pack and replace it when necessary free of charge under GM campaign N232404441.',
      severity: 'high',
      symptoms: ['Possible loss of drive power'],
      affectedSystems: ['high-voltage battery pack', 'internal battery connections'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V367 - Hummer EV Battery Connections', url: recalls(2022) }],
      summary: 'Replaced an uncited charging-software aggregation with the exact high-voltage battery-connection safety recall.',
    },
    'The frozen card had no citation and combined public-charger terminal damage, software behavior, commissioning state, BECM and drive-motor programming across three years without one GM-defined issue population.',
  ),

  'gmc-hummer-ev-warning-lights-limp-2022': replacement(
    {
      years: [2023, 2024],
      category: 'safety',
      title: 'Front Seat-Belt Buckle Bolt Recall',
      description: 'NHTSA campaign 23V786 covers certain 2023-2024 GMC Hummer EV Pickups. A left or right front seat-belt buckle attachment bolt may not be tightened properly.',
      solution: 'Check the VIN with GMC or the EV Concierge. Dealers tighten both front seat-belt buckle attachment bolts free of charge under GM campaign N232419280.',
      severity: 'high',
      symptoms: ['Front seat-belt buckle attachment may be loose'],
      affectedSystems: ['front seat-belt buckle bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V786 - Hummer EV Seat-Belt Buckle Bolts', url: recalls(2024) }],
      summary: 'Replaced a single-forum warning-message card and improvised reset advice with the exact seat-belt fastener recall.',
    },
    'The frozen card relied on one forum thread and asserted a 36-mph limit, module communication cause, feature effects, power-cycle workaround and repeated dealer visits without GM primary evidence.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Hummer EV',
  make: 'GMC',
  model: 'Hummer EV',
  slug: 'gmc-hummer-ev',
  batchId: 'gmc-hummer-ev-full-record-cohort-151-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f502dbfc22affd1deb60009f13af4f83092206f3078bcc65de07b1ccab658593',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-hummer-ev/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmchummerev_blind:manual-primary-source-gate',
    edge: 'gmchummerev_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
