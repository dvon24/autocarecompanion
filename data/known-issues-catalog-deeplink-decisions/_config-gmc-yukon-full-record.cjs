const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=YUKON&modelYear=${year}`;

function replacement(card) {
  const source = {
    type: 'recall',
    title: `NHTSA Campaign ${card.campaign} - ${card.title}`,
    url: recall(card.sourceYear),
  };
  return {
    disposition: 'replace',
    decision: card.decision || `The frozen ${card.frozenClaim} card did not establish its complete population, single mechanism, diagnosis and remedy with a directly applicable GM primary source.`,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
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
      citations: [source],
      source: 'manual',
      summary: card.summary || `Replaced the unsupported ${card.frozenClaim} aggregation with exact NHTSA campaign ${card.campaign}.`,
    },
  };
}

const cards = {
  'gmc-yukon-10l80-10-speed-transmission-harsh-shifting-shudder-rear-whee': {
    campaign: '24V797', sourceYear: 2021, years: [2021],
    engines: ['Diesel engine'], category: 'drivetrain',
    title: 'Diesel Transmission Control-Valve Recall',
    description: 'NHTSA campaign 24V797 covers certain 2021 diesel GMC Yukon vehicles. A transmission control valve can fail and cause the rear wheels to lock.',
    solution: 'Check the VIN and engine with GMC or NHTSA. Dealers install new transmission-control-module software; GM provides special coverage for transmissions the software identifies as containing a defective valve.',
    symptoms: ['Rear wheels may lock if the transmission control valve fails'],
    affectedSystems: ['automatic transmission control valve', 'transmission control module', 'rear wheels'],
    frozenClaim: '10L80 harsh-shift, shudder and rear-wheel-lock',
    summary: 'Corrected the transmission card to the exact 2021 diesel Yukon population, failed control-valve condition and software/special-coverage remedy in campaign 24V797.',
    decision: 'The frozen card cited law-firm, news and forum summaries, omitted the diesel restriction and generalized harsh shifting and shudder across 2021-2023 even though the recall-backed wheel-lock condition has a narrower population.',
  },

  'gmc-yukon-5-3l-v8-excessive-oil-consumption': {
    campaign: '00V343', sourceYear: 2000, years: [2000],
    category: 'safety', title: 'Rear Wheelhouse Plug Exhaust-Gas Recall',
    description: 'NHTSA campaign 00V343 covers certain 2000 GMC Yukon vehicles. Loose or missing rear wheelhouse plugs can allow exhaust gases to accumulate in the wheelhouse and enter the passenger compartment.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the rear wheelhouse plugs and install new plugs when needed.',
    symptoms: ['Exhaust odor or gases may enter the passenger compartment'],
    affectedSystems: ['rear wheelhouse plugs', 'passenger-compartment sealing'],
    frozenClaim: 'lawsuit-sourced 5.3L oil consumption',
  },

  'gmc-yukon-6-2l-l87-v8-rod-bearing-failure-loss-propulsion': {
    campaign: '25V274', sourceYear: 2021, years: [2021, 2022, 2023, 2024],
    engines: ['6.2L gasoline V8'], category: 'engine',
    title: '6.2L Connecting-Rod and Crankshaft Recall',
    description: 'NHTSA campaign 25V274 covers certain 2021-2024 GMC Yukon vehicles with the 6.2L gasoline V8. Manufacturing defects in connecting-rod or crankshaft components can damage the engine and cause engine failure.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect and repair or replace the engine as needed. Vehicles that pass receive the specified higher-viscosity oil, oil-fill cap, oil filter and owner-manual update.',
    symptoms: ['Engine damage or failure may occur', 'Loss of propulsion can follow engine failure'],
    affectedSystems: ['6.2L V8 engine', 'connecting rods', 'crankshaft'],
    frozenClaim: '6.2L rod-bearing and propulsion-loss',
    summary: 'Kept the recall-backed 6.2L engine subject while narrowing it to the exact connecting-rod/crankshaft manufacturing defect and campaign remedy.',
    decision: 'The frozen card cited the recall report but mixed it with third-party engine-failure and post-recall investigation commentary; the published card should state only the exact 25V274 population, condition and remedy.',
  },

  'gmc-yukon-8l90-transmission-shudder-2015': {
    campaign: '14V152', sourceYear: 2015, years: [2015],
    trims: ['Vehicles with the MYC six-speed automatic transmission'],
    category: 'drivetrain', title: 'Transmission Oil-Cooler Line Recall',
    description: 'NHTSA campaign 14V152 covers certain 2015 GMC Yukon vehicles with the MYC six-speed automatic. A cooler line may not be seated securely in its fitting, allowing transmission oil to leak onto a hot surface and cause a fire.',
    solution: 'Check the VIN and transmission code with GMC or NHTSA. Dealers inspect and repair the cooler-line connection as needed under GM recall 14121.',
    symptoms: ['Transmission oil may leak at the cooler-line fitting'],
    affectedSystems: ['transmission oil-cooler line', 'cooler-line fitting', 'transmission-fluid containment'],
    frozenClaim: 'law- and complaint-sourced 8L90 shudder',
  },

  'gmc-yukon-afm-lifter-failure-2007': {
    campaign: '11V007', sourceYear: 2011, years: [2011],
    category: 'drivetrain', title: 'Rear-Axle Cross-Pin Recall',
    description: 'NHTSA campaign 11V007 covers certain 2011 GMC Yukon vehicles. An improperly heat-treated rear-axle cross pin can fracture, shift inside the axle and lock the rear axle.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers install a new rear-axle cross pin free of charge.',
    symptoms: ['No reliable warning before the rear axle locks'],
    affectedSystems: ['rear axle', 'differential cross pin'],
    frozenClaim: 'forum- and aftermarket-sourced AFM lifter failure',
  },

  'gmc-yukon-air-suspension-compressor-2007': {
    campaign: '14V451', sourceYear: 2015, years: [2015],
    trims: ['Vehicles manufactured on May 13, 2014 and covered by the campaign'],
    category: 'safety', title: 'Roof-Rail Airbag Reinforcement Recall',
    description: 'NHTSA campaign 14V451 covers certain 2015 GMC Yukon vehicles built on May 13, 2014. The roof-rail airbags may lack reinforcement where they contact roof-carrier hardware and can be punctured or torn during deployment.',
    solution: 'Check the VIN and build date with GMC or NHTSA. Dealers replace the roof-carrier attaching hardware free of charge under GM recall 14359.',
    symptoms: ['No reliable warning that roof-carrier hardware can damage the airbag during deployment'],
    affectedSystems: ['roof-rail airbags', 'roof-carrier attaching hardware'],
    frozenClaim: 'uncited fourteen-year Autoride compressor and air-spring failure',
  },

  'gmc-yukon-automatic-4wd-transfer-case-position-sensor-encoder-motor-fa': {
    campaign: '14V374', sourceYear: 2015, years: [2015],
    trims: ['Four-wheel-drive vehicles covered by the campaign'],
    category: 'drivetrain', title: 'Unintended Transfer-Case Neutral Recall',
    description: 'NHTSA campaign 14V374 covers certain 2015 GMC Yukon vehicles. An electrical signal short can make the transfer case shift to neutral without driver input, causing loss of drive power or a parked-vehicle rollaway when the parking brake is not applied.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers reprogram the transfer-case control-module software under GM recall 14192. Apply the parking brake when parked.',
    symptoms: ['Transfer case may shift to neutral unexpectedly', 'Loss of drive power', 'Vehicle may roll while parked without the parking brake'],
    affectedSystems: ['transfer case', 'transfer-case control module', 'four-wheel-drive system'],
    frozenClaim: 'repair-site transfer-case encoder and selector failure',
  },

  'gmc-yukon-brake-vacuum-pump-failure-causing-hard-brake-pedal': {
    campaign: '19V645', sourceYear: 2015, years: [2015, 2016, 2017, 2018],
    category: 'brakes', title: 'Decreasing Vacuum Brake-Assist Recall',
    description: 'NHTSA campaign 19V645 covers certain 2015-2018 GMC Yukon vehicles. Vacuum-pump output can decrease over time, reducing brake assist, increasing pedal effort and extending stopping distance.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers reprogram the electronic brake-control module free of charge under GM recall N192268490.',
    symptoms: ['Harder brake pedal', 'Increased stopping distance as vacuum assist decreases'],
    affectedSystems: ['vacuum pump', 'brake assist', 'electronic brake-control module'],
    frozenClaim: 'brake vacuum-pump failure',
    summary: 'Kept the recall-backed braking subject while limiting it to the exact 2015-2018 vacuum-output condition and EBCM remedy.',
    decision: 'The frozen card cited the correct recall report but mixed in a consumer article and generalized pump replacement and debris inspection; the recall remedy is EBCM reprogramming.',
  },

  'gmc-yukon-cracked-dashboard-over-airbag-instrument-panel': {
    campaign: '14V614', sourceYear: 2013, years: [2013, 2014],
    category: 'electrical', title: 'Chassis Electronic-Module Short Recall',
    description: 'NHTSA campaign 14V614 covers certain 2013-2014 GMC Yukon vehicles. Internal contamination can short the chassis electronic module and stall the vehicle.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the chassis electronic module free of charge under GM recall 14515.',
    symptoms: ['Vehicle may stall if the chassis electronic module shorts'],
    affectedSystems: ['chassis electronic module', 'vehicle electrical system'],
    frozenClaim: 'complaint- and forum-sourced cracked dashboard',
  },

  'gmc-yukon-engine-overheat-fail-safe-mode-from-thermostat-coolant-temp': {
    campaign: '19V837', sourceYear: 2020, years: [2020],
    category: 'fuel', title: 'Fuel Pump Missing Pressure Regulator Recall',
    description: 'NHTSA campaign 19V837 covers certain 2020 GMC Yukon vehicles. A fuel pump may be missing its pressure regulator, allowing overpressure that can crack the pump and leak fuel.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the fuel pump free of charge under GM recall N192283991. Stop driving and arrange professional service if fuel is leaking.',
    symptoms: ['No reliable warning before fuel-system overpressure cracks the pump', 'Fuel may leak'],
    affectedSystems: ['fuel pump', 'pressure regulator', 'fuel delivery system'],
    frozenClaim: 'forum- and parts-page thermostat/temperature-sensor failure',
  },

  'gmc-yukon-hvac-blend-door-actuator-failure': {
    campaign: '18V586', sourceYear: 2015, years: [2015],
    category: 'steering', title: 'Momentary Electric Steering-Assist Loss Recall',
    description: 'NHTSA campaign 18V586 covers certain 2015 GMC Yukon vehicles. Electric power-steering assist can disappear momentarily and then return suddenly, making low-speed steering difficult.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers update the electric power-steering module software under GM recall 18289.',
    symptoms: ['Momentary loss of steering assist', 'Sudden return of steering assist', 'Increased low-speed steering effort'],
    affectedSystems: ['electric power-steering module', 'steering assist'],
    frozenClaim: 'forum- and parts-page HVAC blend-door actuator failure',
  },

  'gmc-yukon-instrument-cluster-stepper-motor-gauge-failure': {
    campaign: '03V037', sourceYear: 2003, years: [2003],
    category: 'safety', title: 'Rear Door Upper-Hinge Weld Recall',
    description: 'NHTSA campaign 03V037 covers certain 2003 GMC Yukon vehicles. One or two welds at the left rear door upper hinge may be out of specification and reduce door strength in a side-impact crash.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the hinge welds and install a securing bolt when a weld is out of specification.',
    symptoms: ['No reliable warning that a rear-door hinge weld is out of specification'],
    affectedSystems: ['left rear door', 'upper hinge welds'],
    frozenClaim: 'repair-site instrument-cluster stepper-motor failure',
  },

  'gmc-yukon-intermediate-steering-shaft-clunk-pop': {
    campaign: '21V421', sourceYear: 2021, years: [2021],
    category: 'safety', title: 'Airbag Warning-Lamp Software Recall',
    description: 'NHTSA campaign 21V421 covers certain 2021 GMC Yukon vehicles. The communications gateway can process loss of communication with the airbag module incorrectly, causing the airbag malfunction light to illuminate inconsistently.',
    solution: 'Check the VIN with GMC or NHTSA. The communications-gateway software is updated by a dealer or over the air under GM recall N212338110.',
    symptoms: ['Airbag malfunction light may fail to warn of an airbag-system problem'],
    affectedSystems: ['communications gateway module', 'sensing diagnostic module', 'airbag warning lamp'],
    frozenClaim: 'repair-site and forum intermediate steering-shaft clunk',
  },

  'gmc-yukon-mylink-intellilink-8-inch-touchscreen-failure': {
    campaign: '22V617', sourceYear: 2022, years: [2021, 2022],
    trims: ['Vehicles with third-row seats covered by the campaign'],
    category: 'safety', title: 'Third-Row Seat-Belt Buckle Rivet Recall',
    description: 'NHTSA campaign 22V617 covers certain 2021-2022 GMC Yukon vehicles with third-row seating. A rivet retaining a left or right third-row buckle to its bracket may be formed improperly and may not restrain an occupant correctly.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect both third-row buckle rivets and replace buckle assemblies as needed under GM recall N222372380.',
    symptoms: ['No reliable warning that a third-row buckle rivet is malformed'],
    affectedSystems: ['third-row seat-belt buckles', 'buckle mounting brackets', 'retaining rivets'],
    frozenClaim: 'repair-vendor and forum touchscreen failure',
  },

  'gmc-yukon-power-running-boards-2015': {
    campaign: '26V289', sourceYear: 2019, years: [2015, 2016, 2017, 2018, 2019, 2020, 2026],
    trims: ['Four-wheel-drive or all-wheel-drive vehicles covered by the campaign'],
    category: 'drivetrain', title: 'Missing Transfer-Case Component Stop-Drive Recall',
    description: 'NHTSA campaign 26V289 covers certain 2015-2020 and 2026 four-wheel-drive or all-wheel-drive GMC Yukon vehicles. A missing transfer-case component can make the front or rear wheels lock without warning.',
    solution: 'Do not drive an affected vehicle until the remedy is completed. Check the VIN with GMC or NHTSA; dealers inspect and replace the transfer-case assembly as needed.',
    symptoms: ['Front or rear wheels may lock without warning'],
    affectedSystems: ['transfer case', 'four-wheel-drive or all-wheel-drive system'],
    frozenClaim: 'uncited eleven-year power-running-board failure',
  },

  'gmc-yukon-water-pump-weep-hole-leak-coolant-loss': {
    campaign: '26V304', sourceYear: 2025, years: [2025, 2026],
    trims: ['Vehicles with 24-inch wheels covered by the campaign'],
    category: 'suspension', title: 'Front Wheel-Hub Bolt Recall',
    description: 'NHTSA campaign 26V304 covers certain 2025-2026 GMC Yukon vehicles with 24-inch wheels. Incorrect front wheel-hub bolts can loosen or deform over time and cause loss of vehicle control.',
    solution: 'Check the VIN and wheel size with GMC or NHTSA. Dealers replace the left and right front wheel-hub bolts free of charge under GM recall N262554630.',
    symptoms: ['Front wheel-hub bolt may loosen or break'],
    affectedSystems: ['left front wheel hub', 'right front wheel hub', 'hub bolts', '24-inch wheels'],
    frozenClaim: 'repair-site water-pump weep-hole and coolant-loss',
  },
};

const published = Object.fromEntries(
  Object.entries(cards).map(([id, card]) => [id, replacement(card)]),
);

module.exports = buildConfig({
  label: 'GMC Yukon',
  make: 'GMC',
  model: 'Yukon',
  slug: 'gmc-yukon',
  batchId: 'gmc-yukon-full-record-cohort-162-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '3896d91593a987c35504387d4bf4f3e40c1ba8df3a3e8737bc7e47dc33cd4c1d',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-yukon/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcyukon_blind:manual-primary-source-gate',
    edge: 'gmcyukon_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
