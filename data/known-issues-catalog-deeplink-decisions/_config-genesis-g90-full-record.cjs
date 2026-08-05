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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=G90&modelYear=${year}`;
const tsb = {
  shift: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163285-9999.pdf',
  coolant: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158795-9999.pdf',
  sunroof: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10154546-9999.pdf',
  battery: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008141-0001.pdf',
  navigation: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11033711-0001.pdf',
};

const published = {
  'genesis-g90-5-0l-tau-v8-gdi-intake-valve-carbon-buildup-some-oil-consump': replacement(
    {
      years: [2018],
      category: 'body',
      title: 'Windshield and Rear-Window Bond Recall',
      description: 'NHTSA campaign 18V305 covers certain 2018 Genesis G90 vehicles. Incorrect primer can reduce the bonding strength of the windshield and rear window, allowing the glass to detach while driving.',
      solution: 'Check the VIN with Genesis. Dealers replace the front and rear glass free of charge. Visible separation, wind noise, or glass movement requires prompt inspection and avoidance of high-speed driving.',
      severity: 'high',
      symptoms: ['Possible weak windshield or rear-window bond', 'Possible wind noise, movement, or glass detachment'],
      affectedSystems: ['windshield', 'rear window', 'glass primer and adhesive bond'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 18V305 - G90 Glass Bond', url: recalls(2018) }],
      summary: 'Replaced owner-forum carbon and oil-consumption claims with the exact 2018 glass-bond safety recall.',
    },
    'The frozen card generalized intake deposits, oil consumption, PCV behavior and cleaning across four V8 model years from owner-forum discussions without a Genesis-defined condition.',
  ),

  'genesis-g90-8-speed-automatic-harsh-jerky-upshifts-low-speed-lurch': replacement(
    {
      years: [2017, 2018],
      category: 'transmission',
      title: '8-Speed Harsh or Delayed Shift Diagnostic Bulletin',
      description: 'Genesis bulletin 10163285 covers certain 2017-2018 G90 vehicles and provides the manufacturer diagnostic procedure for an 8-speed automatic transaxle with a harsh or delayed shift.',
      solution: 'Confirm the exact shift condition, transmission, DTCs and fluid state, then follow the Genesis bulletin diagnostic tree. Do not treat every lurch as a failed solenoid or replace components from forum symptom matching.',
      severity: 'medium',
      symptoms: ['Harsh automatic-transmission shift', 'Delayed automatic-transmission shift'],
      affectedSystems: ['8-speed automatic transmission', 'transmission hydraulic and electronic controls'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10163285 - 8-Speed Harsh or Delayed Shift', url: tsb.shift }],
      summary: 'Narrowed forum shift complaints to the exact 2017-2018 Genesis 8-speed diagnostic bulletin.',
    },
    'The frozen card attributed four years of shift behavior to a solenoid from owner forums without the manufacturer diagnostic scope.',
  ),

  'genesis-g90-blank-instrument-cluster-startup-due-to-lg-software-logic-er': replacement(
    {
      years: [2023, 2024, 2025],
      category: 'electrical',
      title: 'Instrument-Panel Display Software Recall',
      description: 'NHTSA campaign 25V474 covers certain 2023-2025 Genesis G90 vehicles. A software error can cause the instrument-panel display to fail and hide critical information such as the speedometer and warning lights.',
      solution: 'Check the VIN with Genesis. The instrument-panel display software is updated over the air or by a dealer free of charge. If the display fails, stop safely and arrange service rather than continuing without required information.',
      severity: 'high',
      symptoms: ['Blank or failed instrument-panel display', 'Critical speedometer or warning information unavailable'],
      affectedSystems: ['instrument-panel display', 'display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V474 - G90 Instrument Display', url: recalls(2025) }],
      summary: 'Replaced third-party reporting with the exact G90 instrument-display software recall and OTA/dealer remedy.',
    },
    'The frozen card identified a real display issue but cited only secondary news and supplied an unsupported vendor-specific software mechanism.',
  ),

  'genesis-g90-coolant-leaks-from-water-pump-thermostat-housing': replacement(
    {
      years: [2017, 2018],
      category: 'cooling',
      title: 'ATF-Warmer Connector Coolant-Leak Bulletin',
      description: 'Genesis bulletin 10158795 covers certain 2017-2018 G90 vehicles that may leak coolant between the automatic-transmission-fluid warmer connector and the engine-side heater pipe.',
      solution: 'Pressure-test and inspect the exact ATF-warmer connector joint. Follow the Genesis procedure to replace the connector O-ring; do not replace the water pump or thermostat housing solely from a generic coolant-loss symptom.',
      severity: 'medium',
      symptoms: ['Coolant leakage at the ATF-warmer connector and heater-pipe joint'],
      affectedSystems: ['ATF warmer connector', 'connector O-ring', 'engine-side heater pipe'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10158795 - G90 ATF-Warmer Coolant Leak', url: tsb.coolant }],
      summary: 'Corrected the generic water-pump card to the exact 2017-2018 ATF-warmer connector coolant-leak bulletin.',
    },
    'The frozen card generalized water-pump and thermostat-housing leaks over six years and cited forums, unrelated parts content and generic pricing instead of Genesis service information.',
  ),

  'genesis-g90-fuel-crossover-pipe-leaks-engine-rail-fire-risk': replacement(
    {
      years: [2023, 2024, 2025],
      category: 'fuel',
      title: 'Fuel-Pipe-to-Rail Connection Leak Recall',
      description: 'NHTSA campaign 26V229 covers certain 2023-2025 Genesis G90 vehicles. Fuel can leak at the connection between the fuel pipe and fuel rail, increasing fire risk.',
      solution: 'Check the VIN with Genesis. Dealers inspect and tighten or replace the fuel pipe as necessary free of charge. Fuel odor, dampness, or visible leakage requires immediate shutdown away from ignition sources.',
      severity: 'high',
      symptoms: ['Fuel odor', 'Possible fuel leak at the fuel-pipe-to-rail connection'],
      affectedSystems: ['fuel pipe', 'fuel rail connection'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V229 - G90 Fuel Pipe', url: recalls(2024) }],
      summary: 'Preserved the fuel-pipe topic but replaced secondary 2026 articles with the exact NHTSA campaign and remedy.',
    },
    'The frozen card described a real current recall but cited only news and aggregator pages and asserted under-torqued fasteners beyond the NHTSA summary.',
  ),

  'genesis-g90-infotainment-navigation-screen-freezes-goes-blank-requiring': replacement(
    {
      years: [2023, 2024, 2025, 2026],
      category: 'electrical',
      title: '2026 Navigation and Head-Unit Software Update Bulletin',
      description: 'Genesis bulletin 11033711 covers 2023-2026 G90 vehicles and documents navigation and head-unit software changes in the 2026 first navigation-map and software update. Applicable changes vary by model and installed system.',
      solution: 'Identify the installed navigation/head-unit system and current software version, then use the Genesis Navigation Updater and USB procedure. Do not replace the head unit or use generic reboot sequences without version-specific diagnosis.',
      severity: 'low',
      symptoms: ['Navigation or head-unit behavior addressed by the model-specific update'],
      affectedSystems: ['navigation system', 'infotainment head unit', 'navigation-map and system software'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11033711 - 2026 G90 Navigation Update', url: tsb.navigation }],
      summary: 'Replaced forum reboot advice and an owner manual with the exact current Genesis navigation/head-unit update bulletin.',
    },
    'The frozen card generalized freezes, black screens, resets, updates and head-unit replacement across 2017-2020 from forums and an owner manual rather than a defect-specific bulletin.',
  ),

  'genesis-g90-intermittent-dashboard-warning-cascade-electronic-parking-br': replacement(
    {
      years: [2023, 2024, 2025, 2026],
      category: 'safety',
      title: 'Front Seat-Belt Anchor Detachment Recall',
      description: 'NHTSA campaign 26V218 includes certain 2023-2026 Genesis G90 vehicles. Driver or passenger seat-belt anchors can detach and fail to restrain an occupant adequately in a crash.',
      solution: 'Check the VIN with Genesis. Dealers inspect and reinforce or replace the seat-belt anchors as necessary free of charge. A loose anchor, damaged belt attachment, or restraint warning requires immediate inspection.',
      severity: 'high',
      symptoms: ['Possible loose or detached driver or passenger seat-belt anchor'],
      affectedSystems: ['front seat-belt anchors', 'occupant restraint mounting points'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V218 - G90 Seat-Belt Anchors', url: recalls(2026) }],
      summary: 'Replaced forum-only warning-cascade and EPB lockout anecdotes with the exact seat-belt anchor recall.',
    },
    'The frozen card inferred one electrical fault from two owner-forum threads and prescribed battery disconnects, module updates and parking-brake work without Genesis diagnostic scope.',
  ),

  'genesis-g90-left-turbocharger-oil-feed-pipe-cracks-leaks-oil-onto-exhaus': replacement(
    {
      years: [2017, 2018, 2019, 2020, 2021, 2022],
      engines: ['3.3L V6 turbocharged'],
      category: 'engine',
      title: 'Left Turbocharger Oil-Feed Pipe Fire Recall',
      description: 'NHTSA campaign 24V191 covers certain 2017-2022 Genesis G90 vehicles with the 3.3L V6 turbo engine. The left turbocharger oil-feed pipe can deteriorate and leak oil onto hot components, increasing fire risk.',
      solution: 'Check the VIN and engine with Genesis. Dealers replace the left turbocharger oil-feed pipe free of charge. The campaign replaces 19V538, so previously repaired vehicles need the new remedy. Oil odor, leakage, or smoke requires immediate shutdown.',
      severity: 'high',
      symptoms: ['Oil odor or leak near the left turbocharger', 'Possible smoke or engine-compartment fire'],
      affectedSystems: ['left turbocharger oil-feed pipe', '3.3L turbocharger lubrication system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V191 - G90 Turbo Oil-Feed Pipe', url: recalls(2021) }],
      summary: 'Preserved the turbo oil-pipe issue but replaced secondary and forum sources with exact NHTSA scope and superseded-recall instructions.',
    },
    'The frozen card named a real recall but mixed a recall attachment, news article and forum discussion instead of the direct NHTSA campaign record.',
  ),

  'genesis-g90-low-pressure-fuel-pump-impeller-deforms-heat-causing-stallin': replacement(
    {
      years: [2022, 2023],
      category: 'fuel',
      title: 'Fuel-Pump Failure and Loss-of-Power Recall',
      description: 'NHTSA campaign 24V282 covers certain 2022-2023 Genesis G90 vehicles. The fuel pump can fail and cause a loss of drive power, increasing crash risk.',
      solution: 'Check the VIN with Genesis. Dealers inspect and replace the fuel-pump assembly free of charge. Hesitation, loss of power, or stalling requires prompt professional diagnosis.',
      severity: 'high',
      symptoms: ['Possible hesitation or loss of drive power', 'Possible engine stall'],
      affectedSystems: ['fuel-pump assembly', 'engine fuel supply'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V282 - G90 Fuel Pump', url: recalls(2023) }],
      summary: 'Preserved the fuel-pump recall but removed an unsupported heat-deformed-impeller mechanism and secondary citations.',
    },
    'The frozen card named a real campaign but cited an attachment and secondary sites and stated a heat-deformed impeller mechanism beyond the NHTSA summary.',
  ),

  'genesis-g90-panoramic-sunroof-creaking-rattling-wind-noise': replacement(
    {
      years: [2017, 2018],
      trims: ['Vehicles equipped with the panoramic sunroof and covered by the bulletin'],
      category: 'body',
      title: 'Panoramic Sunroof Noise Repair Bulletin',
      description: 'Genesis bulletin 10154546 covers certain 2017-2018 G90 vehicles that may exhibit a rattle or popping noise from the panoramic sunroof while driving over uneven surfaces.',
      solution: 'Confirm the noise originates from the panoramic sunroof, then follow the Genesis inspection and repair procedure. Do not tighten unspecified frame bolts, apply generic lubricant, or disturb the headliner outside the bulletin steps.',
      severity: 'low',
      symptoms: ['Rattle or popping noise from the panoramic sunroof over uneven roads'],
      affectedSystems: ['panoramic sunroof assembly', 'sunroof attachment and contact points'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10154546 - G90 Panoramic Sunroof Noise', url: tsb.sunroof }],
      summary: 'Narrowed the sunroof card to the exact 2017-2018 Genesis noise bulletin and removed forum repair lore.',
    },
    'The frozen card extended through 2022 and asserted loose or under-torqued frame bolts, multiple noises and generic fixes beyond the bulletin population.',
  ),

  'genesis-g90-repeated-12v-battery-drain-dead-battery-from-head-unit-modul': replacement(
    {
      years: [2017, 2018, 2019],
      trims: ['Vehicles equipped with the DIS2.0 head unit and covered by the bulletin'],
      category: 'electrical',
      title: 'DIS2.0 Head-Unit Battery-Drain Software Bulletin',
      description: 'Genesis bulletin 11008141 covers certain 2017-2019 G90 vehicles whose DIS2.0 head unit may cause battery drain, Connected Services activation problems, remote-service failures, or point-of-interest failures.',
      solution: 'Confirm the DIS2.0 head unit and bulletin applicability, then update the audio-video-navigation software using the Genesis procedure. Test battery condition and charging performance rather than replacing the battery solely from a no-start.',
      severity: 'medium',
      symptoms: ['12-volt battery drain', 'Connected Services activation, remote-service, or point-of-interest failure'],
      affectedSystems: ['DIS2.0 head unit', 'audio-video-navigation software', '12-volt battery'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11008141 - G90 DIS2.0 Battery Drain', url: tsb.battery }],
      summary: 'Narrowed the broad battery-drain card to the exact DIS2.0 population, symptoms and AVN software remedy.',
    },
    'The frozen card generalized head units, modules, batteries and parasitic draws through 2023 using forums and an unaffiliated article without a defined system or procedure.',
  ),

  'genesis-g90-savile-silver-paint-reflects-corner-radar-triggering-phantom': replacement(
    {
      years: [2023, 2024, 2025, 2026],
      category: 'safety',
      title: 'Highway Drive Assist False-Braking Recall',
      description: 'NHTSA campaign 25V833 covers certain 2023-2026 Genesis G90 vehicles. A Highway Drive Assist corner radar can falsely detect another vehicle and trigger sudden unintended braking.',
      solution: 'Owners are advised not to use Highway Drive Assist until the remedy is performed. Check the VIN with Genesis; dealers replace the front bumper beam free of charge.',
      severity: 'high',
      symptoms: ['Sudden unintended braking while Highway Drive Assist is active', 'False corner-radar vehicle detection'],
      affectedSystems: ['Highway Drive Assist', 'corner radar', 'front bumper beam'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V833 - G90 Highway Drive Assist', url: recalls(2025) }],
      summary: 'Preserved the false-braking issue while replacing paint-focused secondary coverage with NHTSA scope, do-not-use guidance, and bumper-beam remedy.',
    },
    'The frozen card relied entirely on secondary articles and framed Savile Silver paint as the defect, while the regulator record defines the covered vehicles, corner-radar risk and front-bumper-beam remedy.',
  ),

  'genesis-g90-seat-belt-pretensioner-over-pressurization-can-rupture-eject': replacement(
    {
      years: [2023],
      category: 'safety',
      title: 'Seat-Belt Pretensioner Fragment Recall',
      description: 'NHTSA campaign 23V210 covers certain 2023 Genesis G90 vehicles. Front and rear seat-belt pretensioners can explode during deployment and project metal fragments into the passenger compartment.',
      solution: 'Check the VIN with Genesis. Dealers secure the affected pretensioners with protective caps free of charge. Do not disassemble pyrotechnic restraint components outside the manufacturer campaign procedure.',
      severity: 'high',
      symptoms: ['No reliable warning before a pretensioner deploys in a crash'],
      affectedSystems: ['front seat-belt pretensioners', 'rear seat-belt pretensioners', 'protective caps'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V210 - G90 Seat-Belt Pretensioners', url: recalls(2023) }],
      summary: 'Preserved the pretensioner issue but replaced secondary recall sites with the exact NHTSA campaign and cap remedy.',
    },
    'The frozen card described a real recall but relied exclusively on secondary sites and attributed over-pressurization beyond the regulator summary.',
  ),

  'genesis-g90-water-intrusion-into-starter-solenoid-causes-electrical-shor': replacement(
    {
      years: [2017, 2018, 2019],
      category: 'electrical',
      title: 'Starter-Solenoid Water-Intrusion Fire Recall',
      description: 'NHTSA campaign 24V107 covers certain 2017-2019 Genesis G90 vehicles. Water can enter the starter solenoid, cause an electrical short, and start an engine-compartment fire while parked or driving.',
      solution: 'Owners are advised to park outside and away from structures until repaired. Check the VIN with Genesis; dealers install a remedy relay kit in the engine junction box free of charge. Heat, smoke, or burning odor requires immediate shutdown.',
      severity: 'high',
      symptoms: ['Possible starter-solenoid electrical short', 'Possible smoke or engine-compartment fire'],
      affectedSystems: ['starter solenoid', 'engine-junction-box relay kit'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V107 - G90 Starter Solenoid', url: recalls(2019) }],
      summary: 'Preserved the starter-solenoid issue but replaced secondary and forum material with the exact NHTSA parking instruction and relay-kit remedy.',
    },
    'The frozen card named a real recall but mixed a secondary recall page, recall attachment and forum discussion instead of the direct NHTSA campaign record.',
  ),
};

const reasons = {
  'genesis-g90-air-suspension-failures-leaking-air-struts-bags-compressor-b': 'Current Genesis/NHTSA primary-source research does not establish the frozen 2017-2022 air-strut, bag, compressor, valve-block, ride-height and conversion aggregation or a universal repair population.',
  'genesis-g90-power-trunk-fails-to-close-latch-release-often-due-to-lid-mi': 'Current Genesis/NHTSA primary-source research does not establish one 2017-2022 G90 power-trunk misalignment, latch, switch, motor or module condition or the forum-derived adjustment and replacement procedure.',
};

module.exports = buildConfig({
  label: 'Genesis G90',
  make: 'Genesis',
  model: 'G90',
  slug: 'genesis-g90',
  batchId: 'genesis-g90-full-record-cohort-140-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '36d8e725ba68b2aa4c9e7dbebb2e1aa51185969d5eaa685645601398ca151bcf',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-g90/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisg90_blind:manual-primary-source-gate',
    edge: 'genesisg90_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
