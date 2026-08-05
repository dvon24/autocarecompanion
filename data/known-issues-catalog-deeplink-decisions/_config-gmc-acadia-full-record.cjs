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
      severity: card.severity || 'medium',
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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=Acadia&modelYear=${year}`;

const tsb = {
  radio: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217855-0001.pdf',
  steering: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10248773-9999.pdf',
  shiftToPark: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251901-0001.pdf',
  timingChain: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10245795-9999.pdf',
  harshShift: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10187372-9999.pdf',
  waterPump: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10246712-9999.pdf',
};

const published = {
  'gmc-acadia-fuel-pump-mixing-tube-burr-causing-engine-stall-low-fuel': replacement(
    {
      years: [2020],
      category: 'fuel',
      title: 'Fuel-Pump Jet-Nozzle Blockage Recall',
      description: 'NHTSA campaign 20V639 covers certain 2020 GMC Acadia vehicles. A plastic burr left in the fuel pump jet nozzle can block the nozzle and reduce fuel delivery to the engine, which can cause an engine stall.',
      solution: 'Check the VIN with GMC. Dealers replace the fuel-pump module free of charge under GM campaign N202314760.',
      severity: 'high',
      symptoms: ['Insufficient fuel supply', 'Possible engine stall'],
      affectedSystems: ['fuel-pump module', 'fuel-pump jet nozzle'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V639 - Acadia Fuel Pump', url: recalls(2020) }],
      summary: 'Corrected the frozen card from airbag campaign 20V446 to the actual fuel-pump campaign 20V639 and removed secondary citations.',
    },
    'The frozen card named NHTSA 20V446, which is a roof-rail airbag recall, while its GM campaign number and fuel-pump description belong to NHTSA 20V639.',
  ),

  'gmc-acadia-incorrect-transmission-sun-gear-causing-driver-side-half-sha': replacement(
    {
      years: [2023],
      category: 'transmission',
      title: 'Incorrect Transmission Sun-Gear Recall',
      description: 'NHTSA campaign 23V172 covers certain 2023 GMC Acadia vehicles. An incorrect transmission sun gear can allow the driver-side half-shaft to disengage, causing a loss of drive power or a vehicle rollaway while in Park.',
      solution: 'Check the VIN with GMC. Dealers replace the sun gears free of charge under GM campaign N222389310. Use the parking brake until the recall repair is completed.',
      severity: 'high',
      symptoms: ['Possible loss of drive power', 'Possible rollaway while in Park'],
      affectedSystems: ['transmission sun gears', 'driver-side half-shaft', 'park holding function'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V172 - Acadia Transmission Sun Gear', url: recalls(2023) }],
      summary: 'Replaced secondary recall pages and fleet-size details with the exact NHTSA campaign, hazards and free remedy.',
    },
    'The frozen card described a real GM campaign but omitted the NHTSA campaign number and relied on secondary sources for scope and remedy.',
  ),

  'gmc-acadia-infotainment-system-lockup-black-screen-random-reboots': replacement(
    {
      years: [2019],
      category: 'electrical',
      title: 'Radio Reset or Reboot Service Bulletin',
      description: 'GM bulletin 10217855 covers specified 2019 GMC Acadia vehicles whose radio can reset or reboot and display the GMC splash animation.',
      solution: 'Have a GMC dealer confirm the symptom and follow the bulletin’s radio diagnostic and repair procedure. Avoid battery disconnection or connector work unless directed by GM service information.',
      symptoms: ['Radio resets or reboots', 'GMC splash animation may appear'],
      affectedSystems: ['radio', 'infotainment software and hardware'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10217855 - Acadia Radio Resets or Reboots', url: tsb.radio }],
      summary: 'Narrowed an owner-forum catch-all to the model-year-specific GM radio reboot bulletin and removed improvised reset and connector advice.',
    },
    'The frozen card generalized freezes, black screens, cameras and litigation across five years and recommended battery disconnection and connector manipulation without a GM primary source.',
  ),

  'gmc-acadia-power-steering-failure-2007': replacement(
    {
      years: [2007, 2008, 2009, 2010, 2011],
      category: 'steering',
      title: 'Hydraulic Power-Steering Pump Wear Special Coverage',
      description: 'GM special-coverage bulletin 10248773 covers specified 2007-2011 GMC Acadia vehicles with power-steering pump wear that can intermittently reduce hydraulic pressure and steering assist. Manual steering remains available but requires greater effort, especially at low speeds.',
      solution: 'Have a GMC dealer check eligibility for the special coverage and diagnose the hydraulic steering system. The GM procedure flushes the system, replaces the power-steering pump and installs the updated steering-gear valve housing when required.',
      severity: 'high',
      symptoms: ['Intermittent reduced or lost steering assist', 'Increased steering effort at low speed'],
      affectedSystems: ['hydraulic power-steering pump', 'steering-gear valve housing'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10248773 - Acadia Loss of Steering Assist', url: tsb.steering }],
      summary: 'Corrected the system from electric to hydraulic steering, narrowed the years and replaced complaint and lawsuit claims with GM’s special coverage.',
    },
    'The frozen card incorrectly said 2007-2016 Acadia used an electric steering rack, attributed overheating and climate patterns without GM support, and prescribed EPAS parts and programming.',
  ),

  'gmc-acadia-shift-to-park-message-no-shutdown-door-lock-lockout-battery': replacement(
    {
      years: [2017, 2018, 2019],
      category: 'transmission',
      title: 'Intermittent Shift-to-Park Message While in Park',
      description: 'GM bulletin 10251901 covers specified 2017-2019 GMC Acadia vehicles that can intermittently display a Shift-to-Park message even though the transmission selector is in Park.',
      solution: 'Have a GMC dealer reproduce the message and follow the bulletin’s diagnostic and repair procedure. Do not assume that every occurrence requires replacement of the complete shifter assembly.',
      symptoms: ['Intermittent Shift-to-Park message while the selector is in Park'],
      affectedSystems: ['transmission range confirmation', 'shift-control system'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10251901 - Acadia Shift-to-Park Message', url: tsb.shiftToPark }],
      summary: 'Kept the documented Shift-to-Park condition while removing lawsuit, cost, microswitch and battery-drain claims not established by the primary bulletin summary.',
    },
    'The frozen card treated one assumed microswitch cause and complete shifter replacement as universal, and added door-lock, key-retention, battery-drain, lawsuit and repair-cost claims from secondary sites.',
  ),

  'gmc-acadia-start-stop-transmission-accumulator-missing-bolts-fluid-leak': replacement(
    {
      years: [2019, 2020],
      category: 'transmission',
      title: 'Start/Stop Transmission Accumulator Recall',
      description: 'NHTSA campaign 20V668 covers certain 2019-2020 GMC Acadia vehicles. The start/stop transmission-accumulator endcap may be missing bolts, which can cause an oil leak and loss of transmission function and may increase fire risk.',
      solution: 'Check the VIN with GMC. Dealers inspect the start/stop transmission accumulator and replace it when bolts are missing free of charge under GM campaign N202313440.',
      severity: 'high',
      symptoms: ['Possible transmission-fluid leak', 'Possible loss of transmission function'],
      affectedSystems: ['start/stop transmission accumulator', 'accumulator endcap bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V668 - Acadia Transmission Accumulator', url: recalls(2020) }],
      summary: 'Replaced a recall attachment and aftermarket summary with the official NHTSA campaign and limited the remedy to the documented inspection criteria.',
    },
    'The frozen card described a real recall but mixed a safety-bulletin attachment with an aftermarket source and added harsh-operation progression not needed for the owner-facing record.',
  ),

  'gmc-acadia-surround-vision-rearview-camera-coaxial-cable-crimp-failure': replacement(
    {
      years: [2020, 2021],
      trims: ['Vehicles equipped with optional Surround Vision'],
      category: 'safety',
      title: 'Surround-View Rear-Camera Cable Recall',
      description: 'NHTSA campaign 22V709 covers certain 2020-2021 GMC Acadia vehicles with optional Surround Vision. Improperly crimped rearview-camera coaxial connectors can cause the camera image to fail or work intermittently.',
      solution: 'Check the VIN and equipment with GMC. Dealers replace the rearview-camera coaxial cables free of charge under GM campaign N222378380.',
      severity: 'high',
      symptoms: ['Rearview-camera image may fail or become intermittent'],
      affectedSystems: ['rearview camera', 'coaxial cable connectors'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V709 - Acadia Rearview Camera', url: recalls(2021) }],
      summary: 'Replaced two secondary news stories and outdated mailing language with the exact NHTSA scope and cable remedy.',
    },
    'The frozen card described a real recall but relied entirely on secondary sites and included investigation and notification chronology that does not improve the repair guidance.',
  ),

  'gmc-acadia-timing-chain-2007': replacement(
    {
      years: [2007, 2008, 2009, 2010, 2011, 2012],
      engines: ['High Feature V6'],
      category: 'engine',
      title: 'High-Feature V6 Timing-Chain Correlation DTC Bulletin',
      description: 'GM bulletin 10245795 documents timing-chain and guide service information for High Feature V6 engines that set camshaft-to-crankshaft correlation DTCs P0008, P0009, P0016, P0017, P0018 or P0019.',
      solution: 'Have a GMC dealer or qualified technician complete the GM diagnostic procedure before ordering parts. When timing-chain wear is confirmed, use the applicable GM chain and guide service kit and follow factory timing procedures.',
      symptoms: ['Check-engine light', 'Camshaft-to-crankshaft correlation DTC'],
      affectedSystems: ['timing chains', 'timing-chain guides', 'camshaft and crankshaft timing'],
      dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10245795 - High Feature V6 Timing-Chain Kits', url: tsb.timingChain }],
      summary: 'Preserved the GM-documented timing-chain diagnostic path while removing universal failure rates, mileage ranges, catastrophic predictions, costs and maintenance prescriptions.',
    },
    'The frozen card claimed every 2007-2016 three-chain engine was notorious for premature failure, supplied mileage and labor ranges, and prescribed replacement and oil intervals using non-GM sources.',
  ),

  'gmc-acadia-transmission-9t65-2017': replacement(
    {
      years: [2017, 2018, 2019, 2020, 2021],
      category: 'transmission',
      title: 'Low-Mileage Harsh Shift, Slip or Flare Adaptive-Learn Bulletin',
      description: 'GM bulletin 10187372 provides service information for low-mileage harsh shifts, slips or flares and explains transmission adaptive functions on specified vehicles, including the GMC Acadia.',
      solution: 'Have a GMC dealer identify the installed transmission and follow the bulletin’s adaptive-learn and diagnostic procedure. Fluid exchanges, valve-body replacement or controller resets should not be prescribed before the applicable GM diagnosis.',
      symptoms: ['Harsh shift at low mileage', 'Possible shift slip or flare'],
      affectedSystems: ['automatic transmission', 'transmission adaptive values'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10187372 - Transmission Adaptive Functions', url: tsb.harshShift }],
      summary: 'Removed the incorrect claim that every 2017-plus Acadia uses a 9T65 and replaced generic fluid and parts advice with GM’s adaptive-function bulletin.',
    },
    'The frozen card assigned one transmission to nine model years, generalized shared-model complaints, prescribed a 45,000-mile fluid interval and named a valve-body part without any citation.',
  ),

  'gmc-acadia-water-pump-failure-2007': replacement(
    {
      years: [2009, 2010, 2011, 2012, 2013],
      engines: ['HFV6 engines covered by the program'],
      category: 'cooling',
      title: 'Water-Pump Shaft-Seal Leak Special Coverage',
      description: 'GM bulletin 10246712 covers specified 2009-2013 GMC Acadia vehicles with High Feature V6 engines for water-pump shaft-seal leakage.',
      solution: 'Have a GMC dealer check the VIN and special-coverage eligibility, pressure-test the cooling system and follow the GM water-pump service procedure when shaft-seal leakage is confirmed.',
      symptoms: ['Coolant leak from the water-pump shaft seal'],
      affectedSystems: ['water pump', 'water-pump shaft seal', 'engine cooling system'],
      sources: [{ type: 'tsb', title: 'GM Bulletin 10246712 - Acadia Water-Pump Shaft Seal', url: tsb.waterPump }],
      summary: 'Corrected the pump from an internal timing-chain-driven design to the actual GM shaft-seal leak program and removed mileage, cost and combined timing-job claims.',
    },
    'The frozen card falsely described the Acadia 3.6-liter water pump as internal and accessible only during timing-chain work, then supplied unsupported failure mileage, parts, labor and preventive-replacement advice.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Acadia',
  make: 'GMC',
  model: 'Acadia',
  slug: 'gmc-acadia',
  batchId: 'gmc-acadia-full-record-cohort-145-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'b7b23439c62a7b140196e89c526cbe453b48e6682966633138bdbe57db52fe7',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-acadia/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcacadia_blind:manual-primary-source-gate',
    edge: 'gmcacadia_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
