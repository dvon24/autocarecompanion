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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Windstar&modelYear=${year}`;

const published = {
  'ford-windstar-head-gasket-38l-1999': replacement(
    {
      years: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003],
      trims: ['Vehicles equipped with the affected Texas Instruments speed-control deactivation switch'],
      category: 'electrical',
      title: 'Speed-Control Deactivation Switch Fire Recall',
      description: 'NHTSA campaign 09V399 covers certain 1995-2003 Ford Windstar vehicles equipped with the affected speed-control deactivation switch. The switch can leak internally, overheat, smoke, or burn, and a vehicle fire can occur whether or not the engine is running.',
      solution: 'Check the VIN with Ford. Dealers install a fused wiring harness in line with the switch; on 1999-2003 Windstars with a leaking switch, they also inspect and repair the ABS control-module connector as necessary. Heat, smoke, or burning odor requires the vehicle be kept outside away from structures and not driven until inspected.',
      severity: 'high',
      symptoms: ['Possible leaking speed-control deactivation switch', 'Possible heat, smoke, or fire with the engine on or off'],
      affectedSystems: ['speed-control deactivation switch', 'fused jumper harness', 'ABS control-module connector on specified vehicles'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 09V399 - Windstar Speed-Control Switch', url: recalls(2003) }],
      summary: 'Replaced third-party head-gasket diagnosis and price claims with the exact Windstar speed-control switch fire recall.',
    },
    'The frozen card generalized head-gasket failure, mechanisms, testing, machine work, related cooling parts and repair prices across 1999-2003 from advocacy and complaint pages without a Ford service bulletin defining that population.',
  ),

  'ford-windstar-intake-gasket-1999': replacement(
    {
      years: [2000, 2001, 2002, 2003],
      category: 'electrical',
      title: 'Windshield-Wiper Motor Water-Intrusion Recall',
      description: 'NHTSA campaign 01V261 covers certain 2000-2003 Windstar vehicles. Water, salt, or washer fluid can enter the wiper-motor cover, and a cover-mounted switch can overheat. The result can be unintended wiper operation, loss of intermittent or park functions, complete wiper loss, smoke, or ignition of the plastic cover.',
      solution: 'Check the VIN with Ford. Dealers install a redesigned wiper cover with improved sealing and water resistance free of charge. Erratic or failed wipers, smoke, or heat at the wiper motor requires prompt shutdown and repair, especially before driving in precipitation.',
      severity: 'high',
      symptoms: ['Unintended wiper operation', 'Loss of intermittent, park, or all wiper functions', 'Possible smoke or heat at the wiper motor'],
      affectedSystems: ['windshield-wiper motor', 'motor cover and switch', 'cover sealing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 01V261 - Windstar Wiper Motor', url: recalls(2000) }],
      summary: 'Replaced a YouTube intake-gasket and aftermarket-parts prescription with the exact wiper-motor water-intrusion recall.',
    },
    'The frozen card cited only a video and prescribed named aftermarket intake gaskets, coolant flushing and oil changes without a Ford-defined condition or model-year population.',
  ),

  'ford-windstar-power-window-motor-1995': replacement(
    {
      years: [1999],
      trims: ['Vehicles with an instrument cluster without the message center'],
      category: 'electrical',
      title: 'Power-Window Retained-Power Compliance Recall',
      description: 'NHTSA campaign 00V351 covers certain 1999 Windstar vehicles with an instrument cluster that lacks the message center. The power windows may remain operable after the ignition is switched off and a front door is opened, contrary to the federal retained-power requirement.',
      solution: 'Check the VIN and cluster configuration with Ford. Dealers reconfigure the front-end electronic module free of charge. This campaign concerns unintended retained power, not proof that a window motor or regulator needs replacement.',
      severity: 'high',
      symptoms: ['Power windows remain operable after ignition off and a front door is opened'],
      affectedSystems: ['power-window retained-power logic', 'front-end electronic module', 'instrument-cluster configuration'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 00V351 - Windstar Power Windows', url: recalls(1999) }],
      summary: 'Replaced a placeholder-video motor and regulator card with the exact power-window retained-power campaign.',
    },
    'The frozen card generalized motor, regulator and plastic-guide failure across nine years, cited a placeholder-style video, and recommended aftermarket assemblies without Ford evidence.',
  ),

  'ford-windstar-rear-axle-break-1999': replacement(
    {
      years: [1998, 1999, 2000, 2001, 2002, 2003],
      trims: ['Campaign geography and VIN coverage apply'],
      category: 'suspension',
      title: 'Rear-Axle Corrosion, Fracture, and Bracket Re-Inspection Recalls',
      description: 'NHTSA campaign 10V385 covers certain 1998-2003 Windstar vehicles in specified corrosion jurisdictions. Corrosion and torsional stress can crack and completely fracture the rear axle. Campaign 15V608 requires re-inspection of some prior reinforcement-bracket repairs because misinstalled brackets may not protect the axle.',
      solution: 'Check the VIN, registration history, original sale region, and prior campaign repairs with Ford. Dealers inspect the axle, install reinforcement brackets where appropriate, or replace the axle; the later campaign verifies bracket installation and replaces the axle when a bracket was misinstalled. Cracks, severe corrosion, or altered handling means the vehicle should not be driven.',
      severity: 'high',
      symptoms: ['Rear-axle corrosion or cracking', 'Possible altered handling or complete axle fracture', 'Possible misinstalled prior reinforcement brackets'],
      affectedSystems: ['rear beam axle', 'axle reinforcement brackets', 'spring-seat region'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 10V385 - Windstar Rear Axle Corrosion', url: recalls(2003) },
        { type: 'recall', title: 'NHTSA Campaign 15V608 - Windstar Axle-Bracket Re-Inspection', url: recalls(2000) },
      ],
      summary: 'Preserved the axle topic but corrected the campaign number, geographic scope, remedy choices, and later bracket re-inspection campaign.',
    },
    'The frozen card called the campaign 10V-040, generalized the condition beyond the recall geography, prescribed owner-pay repairs and prices, and relied on third-party sites instead of the NHTSA campaigns.',
  ),

  'ford-windstar-transmission-failure-1996': replacement(
    {
      years: [1997],
      trims: ['Vehicles equipped with an affected AX4S automatic transaxle'],
      category: 'transmission',
      title: 'AX4S Servo-Cover Separation and Fire Recall',
      description: 'NHTSA campaign 97V097 covers certain 1997 Windstar vehicles with the AX4S automatic transaxle. The low/intermediate servo cover can separate while driving, releasing transmission fluid onto the catalytic converter and creating a vehicle-fire risk.',
      solution: 'Check the VIN and transmission with Ford. Dealers inspect the transaxle and replace affected servo covers free of charge. A sudden transmission-fluid leak, loss of function, smoke, or burning odor requires immediate shutdown away from structures.',
      severity: 'high',
      symptoms: ['Sudden transmission-fluid leak', 'Possible loss of transmission function', 'Possible smoke, burning odor, or fire'],
      affectedSystems: ['AX4S automatic transaxle', 'low/intermediate servo cover', 'catalytic-converter exposure'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 97V097 - Windstar AX4S Servo Cover', url: recalls(1997) }],
      summary: 'Narrowed the broad transmission-failure and remanufacturer recommendation card to the exact AX4S servo-cover fire recall.',
    },
    'The frozen card combined two transaxle families, lubrication, shift, converter, solenoid and catastrophic failure claims across eight years, then prescribed products, maintenance intervals and price ranges from third-party sources.',
  ),
};

module.exports = buildConfig({
  label: 'Ford Windstar',
  make: 'Ford',
  model: 'Windstar',
  slug: 'ford-windstar',
  batchId: 'ford-windstar-full-record-cohort-137-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '783e4ce365ce6435f62468d16ec34ebf3488b017a00032a7662cb95efd02aee2',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-windstar/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordwindstar_blind:manual-primary-source-gate',
    edge: 'fordwindstar_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
