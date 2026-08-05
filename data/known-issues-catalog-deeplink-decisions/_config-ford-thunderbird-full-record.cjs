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
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Thunderbird&modelYear=${year}`;

const published = {
  'ford-thunderbird-hardtop-leak-2002': replacement(
    {
      years: [2002],
      trims: ['Certain vehicles identified by VIN'],
      category: 'safety',
      title: 'Driver Seat-Belt Webbing Contact Recall',
      description:
        'NHTSA campaign 02V169 covers certain 2002 Ford Thunderbird vehicles. During a frontal impact, the driver seat-belt webbing can contact an edge of the seat-recliner mechanism and be partially cut, increasing injury risk.',
      solution:
        'Check recall completion by VIN with Ford. Dealers install an insert behind the driver-side lower seat trim panel to protect the belt webbing. Frayed, cut, or damaged seat-belt webbing requires immediate inspection and replacement under the manufacturer procedure.',
      severity: 'high',
      symptoms: ['Possible cut or damaged lap-belt webbing near the driver seat recliner'],
      affectedSystems: ['driver seat-belt webbing', 'seat-recliner mechanism', 'protective trim insert'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 02V169 - 2002 Thunderbird Driver Seat Belt', url: recalls(2002) }],
      summary:
        'Replaced a club-site water-leak and weatherstrip-adjustment card with the exact 2002 Thunderbird seat-belt safety recall.',
    },
    'The frozen card generalized hardtop, soft-top, window, and header leaks plus electrical damage to every 2002-2005 Thunderbird from a club home page, then prescribed adhesives and alignment without a Ford bulletin.',
  ),

  'ford-thunderbird-head-gasket-38l-1994': replacement(
    {
      years: [1993],
      trims: ['Vehicles in the road-salt jurisdictions specified by NHTSA'],
      category: 'fuel',
      title: 'Fuel-Line Chafing and Leak Recall',
      description:
        'NHTSA campaign 97V159 covers certain 1993 Thunderbirds originally sold or registered in specified road-salt jurisdictions. Fuel-line movement can cause a nylon jumper line to chafe against the floor pan, create a pinhole, leak fuel, and increase fire risk.',
      solution:
        'Check the VIN and registration history with Ford. Dealers install a protective plastic convolute around the fuel lines and replace leaking lines first when necessary. Fuel dampness or odor requires shutdown away from ignition sources and prompt professional inspection.',
      severity: 'high',
      symptoms: ['Fuel dampness or odor from a chafed nylon fuel-line jumper'],
      affectedSystems: ['nylon fuel-line jumper', 'floor-pan contact point', 'protective line covering'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 97V159 - Thunderbird Fuel-Line Chafing', url: recalls(1993) }],
      summary:
        'Replaced a placeholder-video 3.8L head-gasket card with the exact regional fuel-line fire-risk recall.',
    },
    'The frozen card offered no solution and cited only a placeholder-style video URL for a multi-model head-gasket analogy. Retain the Ford-defined fuel safety condition instead.',
  ),

  'ford-thunderbird-hydraulic-top-2002': replacement(
    {
      years: [2004],
      trims: ['Vehicles equipped with affected power-adjustable seats'],
      category: 'safety',
      title: 'Power-Seat Upper Support Weld Recall',
      description:
        'NHTSA campaign 04V330 covers certain 2004 Thunderbirds with power-adjustable seats whose upper support assembly may have been inadequately welded. The seat may not perform as intended in a crash.',
      solution:
        'Check the VIN and recall-completion history with Ford. Dealers replace the upper support assembly on covered power seats. Seat looseness, movement, or visible structural damage warrants immediate inspection.',
      severity: 'high',
      symptoms: ['Possible loose or inadequately supported power seat'],
      affectedSystems: ['power-seat upper support assembly', 'seat structural welds'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 04V330 - Thunderbird Power Seat Support', url: recalls(2004) }],
      summary:
        'Replaced a fabricated video-based convertible-top hydraulic card with the exact 2004 power-seat structural recall.',
    },
    'The frozen card generalized pump, cylinder, line, and fluid failures to four model years and prescribed system bleeding without a Ford primary source.',
  ),

  'ford-thunderbird-supercharger-failure-1989': replacement(
    {
      years: [1990, 1991, 1992, 1993],
      trims: ['Campaign coverage varies by VIN and model year'],
      category: 'electrical',
      title: 'Battery-Cable and Ignition-Switch Fire Recalls',
      description:
        'NHTSA campaign 90V026 covers certain 1990 Thunderbirds whose overlong battery-to-starter cable can contact the engine damper pulley, wear through, short to ground, and cause an underhood fire. Campaign 96V071 includes certain Thunderbirds whose ignition switch can short internally, overheat, smoke, or burn in the steering-column area.',
      solution:
        'Check the VIN for every applicable Ford campaign. The 1990 remedy replaces the battery-to-starter cable with the correct-length part, while the ignition-switch campaign replaces the switch. Heat, smoke, melting, or burning odor requires immediate shutdown away from structures.',
      severity: 'high',
      symptoms: ['Possible overheated or shorted starter cable', 'Possible heat, smoke, or fire in the steering-column area'],
      affectedSystems: ['battery-to-starter cable', 'engine damper pulley clearance', 'ignition switch'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 90V026 - Thunderbird Starter Cable', url: recalls(1990) },
        { type: 'recall', title: 'NHTSA Campaign 96V071 - Thunderbird Ignition Switch', url: recalls(1993) },
      ],
      summary:
        'Replaced a forum-only Super Coupe supercharger rebuild and price card with the exact battery-cable and ignition-switch fire recalls.',
    },
    'The frozen card applied boost leaks, coupler, bearing, intercooler, hose, oil, pressure-test, rebuild, replacement, and price claims across six years from an enthusiast forum home page without a Ford-defined condition.',
  ),

  'ford-thunderbird-window-regulator-2002': replacement(
    {
      years: [2005],
      trims: ['Certain vehicles identified by VIN'],
      category: 'fuel',
      title: 'Thin-Wall Fuel-Tank Leak Recall',
      description:
        'NHTSA campaign 05V113 covers certain 2005 Thunderbirds whose fuel tank may have a localized thin-wall section in its lower half. The tank can crack, causing fuel odor, leakage, and possibly a Service Engine Soon lamp, with fire risk near an ignition source.',
      solution:
        'Check the VIN for the fuel-tank recall. Ford dealers replace the covered fuel tank free of charge. Fuel odor or visible leakage requires the engine to be shut off and the vehicle kept away from ignition sources until repaired.',
      severity: 'high',
      symptoms: ['Fuel odor', 'Possible fuel leak', 'Possible Service Engine Soon indicator'],
      affectedSystems: ['fuel tank lower wall'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 05V113 - 2005 Thunderbird Fuel Tank', url: recalls(2005) }],
      summary:
        'Replaced a placeholder-video window-regulator and silicone-spray card with the exact 2005 fuel-tank safety recall.',
    },
    'The frozen card generalized frameless-window regulator failure, glass drop, security risk, channel lubrication, and alignment to every 2002-2005 car without Ford evidence.',
  ),
};

module.exports = buildConfig({
  label: 'Ford Thunderbird',
  make: 'Ford',
  model: 'Thunderbird',
  slug: 'ford-thunderbird',
  batchId: 'ford-thunderbird-full-record-cohort-134-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '6d498caae51740cb81e9b3cc969bdfa18ef9b2de78d84334b70a0508322c1c0a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-thunderbird/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordthunderbird_blind:manual-primary-source-gate',
    edge: 'fordthunderbird_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
