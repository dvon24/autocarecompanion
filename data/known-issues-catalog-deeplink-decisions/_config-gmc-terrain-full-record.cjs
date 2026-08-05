const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=TERRAIN&modelYear=${year}`;

function replacement(card) {
  const source = {
    type: 'recall',
    title: `NHTSA Campaign ${card.campaign} - ${card.title}`,
    url: card.sourceUrl || recall(card.sourceYear),
  };
  return {
    disposition: 'replace',
    decision: card.decision,
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
      summary: card.summary,
    },
  };
}

const cards = {
  'gmc-terrain-1-5t-pcv-oil-leak-2018': {
    campaign: '09V489', sourceYear: 2010, years: [2010],
    category: 'electrical', title: 'Center-Control Module and Defroster Recall',
    description: 'NHTSA campaign 09V489 covers certain 2010 GMC Terrain vehicles. Center-panel software can disable the heating, air-conditioning, defrost, radio controls and panel illumination, leaving the windshield defroster inoperative.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the center instrument-panel computer module free of charge.',
    symptoms: ['HVAC, defrost or radio controls may stop working', 'Center-panel illumination may become inoperative'],
    affectedSystems: ['center instrument-panel module', 'windshield defroster', 'HVAC controls', 'radio controls'],
    summary: 'Replaced a forum-only 1.5L PCV/oil-leak aggregation with the exact defroster-control recall.',
    decision: 'The frozen card combined PCV, coolant, oil-cooler, turbo and water-pump claims across 2018-2025 using four forum threads and no GM primary source.',
  },

  'gmc-terrain-2-4l-oil-consumption-2010': {
    campaign: '10V623', sourceYear: 2011, years: [2011],
    category: 'safety', title: 'Front Seat-Belt Buckle Anchor Recall',
    description: 'NHTSA campaign 10V623 covers certain 2011 GMC Terrain vehicles. A driver or front-passenger seat-belt buckle anchor can fracture and separate near the seat attachment during a crash.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers modify the affected driver and passenger seat-belt buckles free of charge.',
    symptoms: ['No reliable warning before a buckle anchor is loaded in a crash'],
    affectedSystems: ['driver seat-belt buckle anchor', 'front-passenger seat-belt buckle anchor'],
    summary: 'Replaced a lawsuit- and settlement-based oil-consumption aggregation with the exact buckle-anchor recall.',
    decision: 'The frozen card generalized piston rings, oil consumption, warranty history, testing, repair and engine replacement across eight years from legal and third-party sources rather than a directly applicable GM bulletin.',
  },

  'gmc-terrain-ecotec-timing-chain-2010': {
    campaign: '14V447', sourceYear: 2010, years: [2010, 2011, 2012],
    trims: ['Vehicles with power height-adjustable front seats covered by the campaign'],
    category: 'safety', title: 'Power-Seat Height-Adjuster Bolt Recall',
    description: 'NHTSA campaign 14V447 covers certain 2010-2012 GMC Terrain vehicles with power height-adjustable front seats. A height-adjuster bolt can fall out and make the seat drop suddenly to its lowest position.',
    solution: 'Check the VIN and seat equipment with GMC or NHTSA. Dealers replace the height-adjuster shoulder bolts free of charge under GM recall 14271.',
    symptoms: ['Power front seat may drop suddenly to its lowest position'],
    affectedSystems: ['power front seats', 'height adjusters', 'shoulder bolts'],
    summary: 'Replaced a generic-page and video timing-chain card with the exact power-seat bolt recall.',
    decision: 'The frozen card extrapolated timing-chain stretch, tensioner failure, oil level, DTCs, timing procedure and cost across 2010-2014 without a directly applicable GM source.',
  },

  'gmc-terrain-electric-power-steering-sticking-increased-steering-effort': {
    campaign: '15V666', sourceYear: 2015, years: [2015],
    category: 'safety', title: 'Front Side-Airbag Inflator Recall',
    description: 'NHTSA campaign 15V666 covers certain 2015 GMC Terrain vehicles. A front seat-mounted side-impact airbag inflator can rupture during deployment, fail to inflate the bag properly and propel metal fragments.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the side-impact airbag modules free of charge under GM recall 01320.',
    symptoms: ['No reliable warning before an affected side airbag deploys'],
    affectedSystems: ['front seat-mounted side airbags', 'airbag inflators'],
    summary: 'Replaced a news-based steering-investigation card with the exact side-airbag recall.',
    decision: 'The frozen card treated a closed investigation with no recall as proof of one electric-steering defect and repair across 2010-2012, relying entirely on news summaries.',
  },

  'gmc-terrain-electronic-shifter-fault-vehicle-stuck-park-shift-to-park-me': {
    campaign: '16V502', sourceYear: 2011, years: [2011, 2012, 2013],
    trims: ['Vehicles serviced with the covered replacement park-lock lever'],
    category: 'drivetrain', title: 'Replacement Park-Lock Lever Recall',
    description: 'NHTSA campaign 16V502 covers certain 2011-2013 GMC Terrain vehicles that may have been serviced with a defective replacement electronic park-lock lever. The ignition key can be removed when the transmission is not in park, allowing a rollaway.',
    solution: 'Check the VIN and repair history with GMC or NHTSA. Dealers inspect and replace the key-cylinder lock housing as necessary under GM recalls 50490 and 50491.',
    symptoms: ['Ignition key may be removable when the transmission is not in park'],
    affectedSystems: ['electronic park-lock lever', 'key-cylinder lock housing', 'shift interlock'],
    summary: 'Replaced a forum and Acadia-adjacent shifter card with the exact Terrain park-lock service-part recall.',
    decision: 'The frozen card generalized a 2018-2022 electronic-shifter mechanism from a Terrain forum, an Acadia article and a generic inspection page without a Terrain primary source.',
  },

  'gmc-terrain-engine-driven-brake-vacuum-pump-failure-sudden-loss-power-br': {
    campaign: '16V582', sourceYear: 2013, years: [2013],
    category: 'electrical', title: 'Windshield-Wiper Module Recall',
    description: 'NHTSA campaign 16V582 covers certain 2013 GMC Terrain vehicles. Corrosion and wear at ball joints in the windshield-wiper module can make one or both wipers inoperative.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers repair the AIP hole and inspect or replace the front wiper module as needed under GM recall 25302.',
    symptoms: ['One or both windshield wipers may stop working'],
    affectedSystems: ['front wiper module', 'wiper-module ball joints', 'AIP hole'],
    summary: 'Replaced a lawsuit- and forum-based brake-vacuum-pump card with the exact wiper-module recall.',
    decision: 'The frozen card relied on 2026 litigation and owner material to assert sudden brake-assist loss, pump debris, cam damage and repair across 2018-2022 without a finalized GM campaign or bulletin.',
  },

  'gmc-terrain-high-pressure-fuel-pump-failure-causing-engine-stall': {
    campaign: '23V013', sourceYear: 2022, years: [2022],
    category: 'fuel', title: 'Inadequate Fuel-Pump Flow Recall',
    description: 'NHTSA campaign 23V013 covers certain 2022 GMC Terrain vehicles. The fuel-pump module may not consistently provide sufficient fuel to the engine, which can cause an engine stall.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the fuel-pump module free of charge under GM recall N222372310.',
    symptoms: ['Engine may stall from inadequate fuel flow'],
    affectedSystems: ['fuel-pump module', 'fuel delivery system'],
    sourceUrl: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V013-4432.pdf',
    summary: 'Kept recall-backed fuel-pump coverage but corrected the Terrain population to 2022 and removed unsupported fracture, debris, injector, engine and software claims.',
    decision: 'The frozen card cited the campaign but expanded Terrain coverage to 2021-2023, invented an internal fracture-and-metal-debris mechanism, specified an engine/RPO and added an engine-software remedy not stated in the official recall acknowledgement.',
  },

  'gmc-terrain-hvac-blend-door-actuator-failure': {
    campaign: '17V516', sourceYear: 2018, years: [2018],
    category: 'drivetrain', title: 'Right Front Intermediate Driveshaft Recall',
    description: 'NHTSA campaign 17V516 covers certain 2018 GMC Terrain vehicles. The right-front intermediate driveshaft can fracture and separate, causing loss of propulsion or allowing a parked vehicle to roll on a grade if the parking brake is not set.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the right-front intermediate driveshaft assembly free of charge under GM recall 17329. Apply the parking brake when parked.',
    symptoms: ['Loss of propulsion if the driveshaft separates', 'Vehicle may roll on a grade without the parking brake'],
    affectedSystems: ['right-front intermediate driveshaft', 'front driveline'],
    summary: 'Replaced a repair-site and forum HVAC actuator aggregation with the exact driveshaft recall.',
    decision: 'The frozen card generalized blend-door gears, clicking, recalibration, replacement and cost across eight years using repair and owner pages rather than a GM-defined population.',
  },

  'gmc-terrain-intellilink-infotainment-freezing-rebooting-backup-camera-bl': {
    campaign: '18V340', sourceYear: 2018, years: [2018],
    category: 'safety', title: 'Airbag Control-Module Power-Down Recall',
    description: 'NHTSA campaign 18V340 covers certain 2018 GMC Terrain vehicles. The sensing and diagnostic module may not power down correctly when the vehicle is shut off and can be inoperative after restart, preventing crash detection and airbag deployment.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers reprogram the sensing and diagnostic module with updated software under GM recall 18179.',
    symptoms: ['No reliable warning that the airbag control module is inoperative after restart'],
    affectedSystems: ['sensing and diagnostic module', 'airbag deployment controls'],
    summary: 'Replaced an infotainment forum aggregation with the exact airbag-control-module recall.',
    decision: 'The frozen card combined screens, audio, camera, Bluetooth, reset, update and hardware claims across seven years from discussion forums without a GM primary source.',
  },

  'gmc-terrain-start-stop-transmission-accumulator-endcap-missing-bolts-flu': {
    campaign: '20V668', sourceYear: 2018, years: [2018, 2019, 2020],
    category: 'drivetrain', title: 'Start/Stop Accumulator Endcap Recall',
    description: 'NHTSA campaign 20V668 covers certain 2018-2020 GMC Terrain vehicles. Missing bolts on the transmission start/stop accumulator endcap can cause a transmission-fluid leak, loss of propulsion and possible fire.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the start/stop accumulator and replace it if any bolts are missing under GM recall N202313440.',
    symptoms: ['Transmission-fluid leak', 'Possible loss of propulsion'],
    affectedSystems: ['start/stop transmission accumulator', 'accumulator endcap bolts', 'transmission-fluid containment'],
    summary: 'Kept the recall subject but removed third-party citations and narrowed the card to the exact 2018-2020 campaign population and remedy.',
    decision: 'The frozen card was recall-adjacent, but it mixed the official bulletin with recall aggregators and should rely on the exact campaign population, condition and inspection/replacement remedy only.',
  },

  'gmc-terrain-throttle-body-throttle-position-sensor-failure-reduced-engin': {
    campaign: '18V358', sourceYear: 2018, years: [2018],
    category: 'fuel', title: 'High-Pressure Fuel-Pump Mounting Recall',
    description: 'NHTSA campaign 18V358 covers certain 2018 GMC Terrain vehicles. The high-pressure fuel pump can detach from its mounting flange and damage the high-pressure fuel line, allowing a fuel leak.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the high-pressure fuel pump and high-pressure fuel pipe free of charge under GM recall 18188.',
    symptoms: ['No reliable warning before the pump detaches', 'Fuel may leak if the high-pressure line is damaged'],
    affectedSystems: ['high-pressure fuel pump', 'pump mounting flange', 'high-pressure fuel pipe'],
    summary: 'Replaced a repair-site throttle-body aggregation with the exact high-pressure-pump mounting recall.',
    decision: 'The frozen card generalized throttle-body sensors, reduced-power messages, cleaning, replacement and pricing across eight years from news, repair, parts and forum pages without a GM-defined population.',
  },

  'gmc-terrain-transmission-shudder-2010': {
    campaign: '18V576', sourceYear: 2018, years: [2018, 2019],
    category: 'brakes', title: 'Rear Brake-Caliper Piston Recall',
    description: 'NHTSA campaign 18V576 covers certain 2018-2019 GMC Terrain vehicles. Insufficient coating on rear brake-caliper pistons can form gas pockets and reduce rear braking performance.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers bleed the brake system free of charge under GM recall 18279.',
    symptoms: ['Reduced rear braking performance'],
    affectedSystems: ['rear brake calipers', 'caliper pistons', 'hydraulic brake system'],
    summary: 'Replaced an uncited eight-year transmission-shudder card with the exact rear-caliper recall.',
    decision: 'The frozen card had a blank citation entry and generalized two transmission families, converter lockup, valve body, fluid service and replacement across 2010-2017 without primary evidence.',
  },

  'gmc-terrain-water-pump-failure-coolant-leak': {
    campaign: '23V869', sourceYear: 2024, years: [2024],
    category: 'safety', title: 'Door-Striker Fracture Recall',
    description: 'NHTSA campaign 23V869 covers certain 2024 GMC Terrain vehicles. A door striker can fracture and allow a door to open unexpectedly while driving.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace all four door strikers and their attaching bolts free of charge under GM recall N232429911.',
    symptoms: ['Door may open unexpectedly while driving'],
    affectedSystems: ['door strikers', 'door-striker attaching bolts'],
    summary: 'Replaced a repair-site and forum water-pump aggregation with the exact door-striker recall.',
    decision: 'The frozen card generalized engines, pumps, coolant leaks, replacement procedure and cost across eight years using repair, forum and generic symptom pages rather than a manufacturer-defined issue population.',
  },
};

const published = Object.fromEntries(
  Object.entries(cards).map(([id, card]) => [id, replacement(card)]),
);

module.exports = buildConfig({
  label: 'GMC Terrain',
  make: 'GMC',
  model: 'Terrain',
  slug: 'gmc-terrain',
  batchId: 'gmc-terrain-full-record-cohort-161-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '8f67cb6c1c600d3fa4bf4709c8fd3f8658142d8ecf4e760ec6b90feca0841559',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-terrain/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcterrain_blind:manual-primary-source-gate',
    edge: 'gmcterrain_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
