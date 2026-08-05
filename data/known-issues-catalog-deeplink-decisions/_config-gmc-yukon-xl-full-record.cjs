const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=YUKON%20XL&modelYear=${year}`;

function replacement(card) {
  const source = {
    type: 'recall',
    title: `NHTSA Campaign ${card.campaign} - ${card.title}`,
    url: recall(card.sourceYear),
  };
  return {
    disposition: 'replace',
    decision: `The frozen ${card.frozenClaim} card did not establish its complete population, single mechanism, diagnosis and remedy with a directly applicable GM primary source.`,
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
      summary: `Replaced the unsupported ${card.frozenClaim} aggregation with exact NHTSA campaign ${card.campaign}.`,
    },
  };
}

const cards = {
  'gmc-yukon-xl-6l80-6l90-transmission-cooler-line-leak-at-crimp-fitting-fluid-loss': {
    campaign: '00V345', sourceYear: 2000, years: [2000],
    category: 'brakes', title: 'Front Brake-Pipe Clearance Recall',
    description: 'NHTSA campaign 00V345 covers certain 2000 GMC Yukon XL vehicles. Insufficient clearance can let the right-front brake pipe contact the body cross sill, wear through and cause brake-fluid and pressure loss in half of the brake system.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the brake pipe, replace a worn section or install a spacer clip to maintain clearance.',
    symptoms: ['Brake warning lamp may illuminate', 'Brake pedal may travel lower than normal', 'Stopping distance may increase'],
    affectedSystems: ['right-front brake pipe', 'body cross sill', 'hydraulic brake circuit'],
    frozenClaim: 'generic-vehicle-page transmission cooler-line leak',
  },

  'gmc-yukon-xl-ac-compressor-2007': {
    campaign: '01V159', sourceYear: 2001, years: [2001],
    category: 'safety', title: 'Rear Outboard Seat-Belt Retractor Recall',
    description: 'NHTSA campaign 01V159 covers certain 2001 GMC Yukon XL vehicles. An internal component in second- or third-row outboard retractors can crack and eventually prevent the seat belt from locking.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect retractor lot numbers and replace affected seat belts.',
    symptoms: ['Second- or third-row outboard seat belt may no longer lock'],
    affectedSystems: ['second-row outboard seat-belt retractors', 'third-row outboard seat-belt retractors'],
    frozenClaim: 'generic-page and video A/C compressor/rear-A/C failure',
  },

  'gmc-yukon-xl-afm-lifter-tick-2007': {
    campaign: '03V019', sourceYear: 2003, years: [2003],
    category: 'fuel', title: 'Fuel-Tank Impact Shield Recall',
    description: 'NHTSA campaign 03V019 covers certain 2003 GMC Yukon XL vehicles. In a severe angled frontal impact, the mid-frame cross member can tear and create a sharp edge that may puncture the fuel tank.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers install a fuel-tank shield free of charge.',
    symptoms: ['No reliable warning before a qualifying crash loads the cross member'],
    affectedSystems: ['fuel tank', 'mid-frame cross member', 'fuel-tank shield'],
    frozenClaim: 'generic-page and video AFM lifter tick',
  },

  'gmc-yukon-xl-brake-lines-2007': {
    campaign: '05V379', sourceYear: 2000, years: [2000, 2001, 2002],
    trims: ['Vehicles in the campaign\'s listed salt-belt jurisdictions'],
    category: 'brakes', title: 'Corrosion-Related Unwanted ABS Recall',
    description: 'NHTSA campaign 05V379 covers certain GMC Yukon XL vehicles in listed salt-belt jurisdictions. Corrosion at a wheel-speed-sensor mounting surface can cause unwanted ABS activation and increase low-speed stopping distance.',
    solution: 'Check the VIN and campaign jurisdiction with GMC or NHTSA. Dealers remove the sensor, clean and protect the mounting surface, reinstall it and verify signal voltage.',
    symptoms: ['Unwanted ABS activation during low-speed braking', 'Increased low-speed stopping distance'],
    affectedSystems: ['wheel-speed sensors', 'sensor mounting surfaces', 'antilock brakes'],
    frozenClaim: 'complaint- and forum-sourced brake-line corrosion',
  },

  'gmc-yukon-xl-cracked-exhaust-manifold-bolts-manifold-leak-5-3l-6-2l-v8-causing-cold-start-tick': {
    campaign: '04V045', sourceYear: 2003, years: [2003],
    category: 'brakes', title: 'Hydro-Boost Relief-Valve Recall',
    description: 'NHTSA campaign 04V045 covers certain 2003 GMC Yukon XL vehicles. An out-of-specification hydro-boost relief-valve bore can fracture an O-ring seal and increase steering or brake-pedal effort.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the hydro-boost relief valve free of charge.',
    symptoms: ['Slightly increased steering effort while braking or parking', 'Increased brake-pedal effort'],
    affectedSystems: ['hydro-boost brake assist', 'relief valve', 'O-ring seal'],
    frozenClaim: 'generic-page and video exhaust-manifold bolt failure',
  },

  'gmc-yukon-xl-dashboard-cracking-2015': {
    campaign: '03V037', sourceYear: 2003, years: [2003],
    category: 'safety', title: 'Rear Door Upper-Hinge Weld Recall',
    description: 'NHTSA campaign 03V037 covers certain 2003 GMC Yukon XL vehicles. One or two welds at the left rear door upper hinge may be out of specification and reduce door strength in a side-impact crash.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the hinge welds and install a securing bolt if a weld is out of specification.',
    symptoms: ['No reliable warning that a rear-door hinge weld is out of specification'],
    affectedSystems: ['left rear door', 'upper hinge welds'],
    frozenClaim: 'generic-page and video dashboard cracking',
  },

  'gmc-yukon-xl-door-handle-linkage-failure-exterior-handle-pulls-but-door-won-t-open': {
    campaign: '05V103', sourceYear: 2005, years: [2005],
    category: 'brakes', title: 'Brake-Pedal Pushrod Retainer Recall',
    description: 'NHTSA campaign 05V103 covers certain 2005 GMC Yukon XL vehicles. A missing brake-pedal pushrod retainer can let the brake-booster pushrod disengage from the pedal and cause loss of braking.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect for the retainer and install one if it is missing.',
    symptoms: ['No reliable warning before a booster pushrod disengages', 'Loss of brake-pedal control can occur'],
    affectedSystems: ['brake pedal', 'brake-booster pushrod', 'pushrod retainer'],
    frozenClaim: 'generic-page and video door-handle/linkage failure',
  },

  'gmc-yukon-xl-electric-power-steering-eps-assist-loss-reduced-assist-nhtsa-14v-153': {
    campaign: '16V256', sourceYear: 2016, years: [2016, 2017],
    category: 'suspension', title: 'Front Upper Control-Arm Weld Recall',
    description: 'NHTSA campaign 16V256 covers certain 2016-2017 GMC Yukon XL vehicles. Inadequate welds near a front upper control-arm bushing can allow the arm to separate and compromise steering.',
    solution: 'Do not drive an affected vehicle until repaired. Check the VIN with GMC or NHTSA; dealers replace both front upper control arms and realign the vehicle.',
    symptoms: ['No reliable warning before an inadequate control-arm weld separates'],
    affectedSystems: ['front upper control arms', 'control-arm bushings', 'welds'],
    frozenClaim: 'misidentified 14V153 electric-steering recall',
  },

  'gmc-yukon-xl-liftgate-struts-2015': {
    campaign: '05V005', sourceYear: 2000, years: [2000],
    category: 'steering', title: 'Hydraulic-Pump Driveshaft Recall',
    description: 'NHTSA campaign 05V005 covers certain GMC Yukon XL vehicles. A hydraulic-pump driveshaft can fracture, immediately eliminating hydraulic steering assist and, on hydro-boost vehicles, brake assist after reserve pressure is depleted.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the hydraulic pump free of charge.',
    symptoms: ['Sudden increase in steering effort', 'Brake effort may increase after hydro-boost reserve pressure is depleted'],
    affectedSystems: ['hydraulic pump driveshaft', 'power-steering assist', 'hydro-boost brake assist'],
    frozenClaim: 'generic complaint-page liftgate support-strut failure',
  },

  'gmc-yukon-xl-magnetic-ride-control-mrc-shock-strut-fluid-leak-and-service-suspension-system-warnings': {
    campaign: '08V441', sourceYear: 2007, years: [2007, 2008],
    trims: ['Vehicles with the heated windshield-washer system'],
    category: 'electrical', title: 'Heated Washer-Fluid Module Fire Recall',
    description: 'NHTSA campaign 08V441 covers certain 2007-2008 GMC Yukon XL vehicles with heated washer fluid. A circuit-board short can overheat the control-circuit ground wire and cause malfunctions, odor, smoke or fire.',
    solution: 'Check the VIN and washer equipment with GMC or NHTSA. Dealers install a fused inline wiring harness free of charge.',
    symptoms: ['Electrical features may malfunction', 'Electrical odor or smoke may occur'],
    affectedSystems: ['heated washer-fluid module', 'printed circuit board', 'control-circuit ground wire'],
    frozenClaim: 'generic-vehicle-page magnetic-ride shock and strut leak',
  },

  'gmc-yukon-xl-rear-air-suspension-auto-leveling-compressor-failure-air-shock-leaks-z55-z95-equipped': {
    campaign: '09V154', sourceYear: 2009, years: [2009],
    category: 'fuel', title: 'Fuel-System Control-Module Water-Intrusion Recall',
    description: 'NHTSA campaign 09V154 covers certain 2009 GMC Yukon XL vehicles. Separation of the module housing seal can admit water and cause a short or open circuit, leading to a hard start, no-start or engine stall.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers install a new fuel-system control module free of charge.',
    symptoms: ['Service-engine-soon lamp', 'Hard start or no-start', 'Engine may stall'],
    affectedSystems: ['fuel-system control module', 'module housing seal'],
    frozenClaim: 'generic-page rear auto-leveling compressor and air-shock failure',
  },

  'gmc-yukon-xl-rear-wiper-motor-washer-hose-failure-no-rear-wipe-or-washer-spray': {
    campaign: '13V001', sourceYear: 2013, years: [2013],
    category: 'drivetrain', title: 'Park-Lock Cable and Column Actuator Recall',
    description: 'NHTSA campaign 13V001 covers certain 2013 GMC Yukon XL vehicles. A fractured park-lock cable or malformed steering-column lock-actuator gear can allow shifting from park with the key removed or without pressing the brake.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect and replace the steering column as necessary. Apply the parking brake whenever parked.',
    symptoms: ['Vehicle may shift from park with the key removed', 'Vehicle may shift from park without brake-pedal application'],
    affectedSystems: ['park-lock cable', 'steering-column lock actuator', 'shift interlock'],
    frozenClaim: 'generic-page rear wiper motor and washer-hose failure',
  },

  'gmc-yukon-xl-steering-column-click-2015': {
    campaign: '14V614', sourceYear: 2013, years: [2013, 2014],
    category: 'electrical', title: 'Chassis Electronic-Module Short Recall',
    description: 'NHTSA campaign 14V614 covers certain 2013-2014 GMC Yukon XL vehicles. Internal contamination can short the chassis electronic module and stall the vehicle.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the chassis electronic module free of charge under GM recall 14515.',
    symptoms: ['Vehicle may stall if the chassis electronic module shorts'],
    affectedSystems: ['chassis electronic module', 'vehicle electrical system'],
    frozenClaim: 'generic-page and video steering-column lock actuator click',
  },

  'gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050': {
    campaign: '18V673', sourceYear: 2018, years: [2018, 2019],
    category: 'safety', title: 'Rear Seat-Belt Automatic-Locking Recall',
    description: 'NHTSA campaign 18V673 covers certain 2018-2019 GMC Yukon XL vehicles. Some second- or third-row retractors may not switch to automatic-locking mode when fully extended, preventing a child seat from being secured properly.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the rear retractors and replace them as necessary under GM recall 18315.',
    symptoms: ['Rear seat belt may not lock automatically when fully extended'],
    affectedSystems: ['second-row seat-belt retractors', 'third-row seat-belt retractors', 'child-seat installation'],
    frozenClaim: 'Takata card that incorrectly assigned 21V050 to 2015-2017 Yukon XL',
  },

  'gmc-yukon-xl-torque-converter-shudder-2015': {
    campaign: '25V274', sourceYear: 2021, years: [2021, 2022, 2023, 2024],
    engines: ['6.2L gasoline V8'],
    category: 'engine', title: '6.2L Connecting-Rod and Crankshaft Recall',
    description: 'NHTSA campaign 25V274 covers certain 2021-2024 GMC Yukon XL vehicles with the 6.2L gasoline V8. Manufacturing defects in connecting-rod or crankshaft components can damage the engine and cause engine failure.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect and repair or replace the engine as needed; passing vehicles receive the specified oil, fill cap, filter and owner-manual update.',
    symptoms: ['Engine damage or failure may occur', 'Loss of propulsion can follow engine failure'],
    affectedSystems: ['6.2L V8 engine', 'connecting rods', 'crankshaft'],
    frozenClaim: 'blank-citation 8L90/10L80 torque-converter shudder',
  },

  'gmc-yukon-xl-transfer-case-leak-2015': {
    campaign: '26V289', sourceYear: 2018, years: [2015, 2016, 2017, 2018, 2019, 2020, 2026],
    trims: ['Four-wheel-drive or all-wheel-drive vehicles covered by the campaign'],
    category: 'drivetrain', title: 'Missing Transfer-Case Component Stop-Drive Recall',
    description: 'NHTSA campaign 26V289 covers certain 2015-2020 and 2026 four-wheel-drive or all-wheel-drive GMC Yukon XL vehicles. A missing transfer-case component can cause the front or rear wheels to lock without warning.',
    solution: 'Do not drive an affected vehicle until repaired. Check the VIN with GMC or NHTSA; dealers inspect and replace the transfer-case assembly as necessary.',
    symptoms: ['Front or rear wheels may lock without warning'],
    affectedSystems: ['transfer case', 'four-wheel-drive or all-wheel-drive system'],
    frozenClaim: 'blank and complaint-page transfer-case output-seal leak',
  },

  'gmc-yukonxl-blend-door-hvac-2000': {
    campaign: '21V455', sourceYear: 2021, years: [2021],
    category: 'steering', title: 'Power-Steering Module Software Recall',
    description: 'NHTSA campaign 21V455 covers certain 2021 GMC Yukon XL vehicles. A software issue can cause loss of power-steering assist at startup or while driving.',
    solution: 'Check the VIN with GMC or NHTSA. The steering-module software is updated by a dealer or over the air under GM recall N212333900.',
    symptoms: ['Loss of power-steering assist', 'Increased steering effort, especially at low speed'],
    affectedSystems: ['power-steering module', 'electric steering assist'],
    frozenClaim: 'generic Yukon page used for Yukon XL HVAC actuator failure',
  },

  'gmc-yukonxl-front-hub-bearing-and-2000': {
    campaign: '26V304', sourceYear: 2025, years: [2025, 2026],
    trims: ['Vehicles with 24-inch wheels covered by the campaign'],
    category: 'suspension', title: 'Front Wheel-Hub Bolt Recall',
    description: 'NHTSA campaign 26V304 covers certain 2025-2026 GMC Yukon XL vehicles with 24-inch wheels. Incorrect front wheel-hub bolts can loosen or deform and cause loss of vehicle control.',
    solution: 'Check the VIN and wheel size with GMC or NHTSA. Dealers replace the left and right front wheel-hub bolts under GM recall N262554630.',
    symptoms: ['Front wheel-hub bolt may loosen or break'],
    affectedSystems: ['left front wheel hub', 'right front wheel hub', 'hub bolts', '24-inch wheels'],
    frozenClaim: 'generic Yukon page used for Yukon XL hub-bearing/ABS corrosion',
  },

  'gmc-yukonxl-fuel-pump-module-failure-2000': {
    campaign: '05V155', sourceYear: 2000, years: [2000, 2001],
    category: 'fuel', title: 'Fuel-Pump Module Connector Recall',
    description: 'NHTSA campaign 05V155 covers certain GMC Yukon XL vehicles. Fuel-pump wire connectors can overheat, blow the pump fuse, cause a stall or no-start, create inaccurate fuel readings and potentially allow fuel vapor or liquid to leak through a damaged connector.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers remove the tank and install the specified module-reservoir service kit.',
    symptoms: ['Engine stall or no-start', 'Service-engine-soon lamp', 'Inaccurate fuel-level reading', 'Possible fuel vapor or liquid leak'],
    affectedSystems: ['fuel-pump module', 'wire connectors', 'pass-through connector', 'fuel-level sender'],
    frozenClaim: 'generic vehicle-page fuel-pump module failure',
  },

  'gmc-yukonxl-instrument-cluster-stepper-motor-2003': {
    campaign: '22V036', sourceYear: 2021, years: [2021],
    category: 'drivetrain', title: 'Rear Driveshaft Heat-Treatment Recall',
    description: 'NHTSA campaign 22V036 covers certain 2021 GMC Yukon XL vehicles. Internal rear driveshaft components may not have been heat treated properly and can fail, causing sudden loss of drive power.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the affected left or right rear driveshaft assemblies under GM recall N212351030.',
    symptoms: ['Sudden loss of drive power if a rear driveshaft fails'],
    affectedSystems: ['left rear driveshaft', 'right rear driveshaft', 'heat-treated internal components'],
    frozenClaim: 'generic vehicle-page instrument-cluster stepper-motor failure',
  },

  'gmc-yukonxl-intermediate-steering-shaft-clunk-2000': {
    campaign: '23V642', sourceYear: 2023, years: [2023],
    category: 'suspension', title: 'Rear Control-Arm Bolt Recall',
    description: 'NHTSA campaign 23V642 covers certain 2023 GMC Yukon XL vehicles. Improperly heat-treated rear outer control-arm bolts can break and misalign a rear wheel.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace both rear outer control-arm bolts free of charge under GM recall N232415910.',
    symptoms: ['Rear wheel may become misaligned if a control-arm bolt breaks'],
    affectedSystems: ['rear outer control arms', 'control-arm bolts', 'rear-wheel alignment'],
    frozenClaim: 'uncited intermediate steering-shaft clunk and binding',
  },

  'gmc-yukonxl-knock-sensor-water-intrusion-2000': {
    campaign: '24V674', sourceYear: 2024, years: [2023, 2024],
    category: 'brakes', title: 'Low Brake-Fluid Warning Software Recall',
    description: 'NHTSA campaign 24V674 covers certain 2023-2024 GMC Yukon XL vehicles. Brake-control software may fail to display a warning when brake fluid is lost, allowing the vehicle to be driven with reduced braking performance.',
    solution: 'Check the VIN with GMC or NHTSA. The electronic brake-control-module software is updated by a dealer or over the air under GM recall N242447990.',
    symptoms: ['Low brake-fluid warning may not appear after fluid loss'],
    affectedSystems: ['electronic brake-control module', 'low brake-fluid warning lamp', 'hydraulic brake system'],
    frozenClaim: 'uncited knock-sensor water-intrusion card',
  },
};

const published = Object.fromEntries(
  Object.entries(cards).map(([id, card]) => [id, replacement(card)]),
);

module.exports = buildConfig({
  label: 'GMC Yukon XL',
  make: 'GMC',
  model: 'Yukon XL',
  slug: 'gmc-yukon-xl',
  batchId: 'gmc-yukon-xl-full-record-cohort-163-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '206942707fa69160eeac2f24a8b16d3be81b0b5544d8b2d414b078b0479f80b9',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-yukon-xl/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcyukonxl_blind:manual-primary-source-gate',
    edge: 'gmcyukonxl_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
