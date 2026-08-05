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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=G70&modelYear=${year}`;
const tsb = {
  horn: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017471-0001.pdf',
  navigation: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11033711-0001.pdf',
  battery: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10247603-0001.pdf',
  headlamp: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230903-0001.pdf',
  sunroof: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11027051-0001.pdf',
  torqueConverter: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230913-0001.pdf',
};

const published = {
  'genesis-g70-3-3t-oil-consumption-smoke-fouled-plugs': replacement(
    {
      years: [2019],
      category: 'electrical',
      title: 'Starter-Solenoid Water-Intrusion Fire Recall',
      description: 'NHTSA campaign 24V107 covers certain 2019 Genesis G70 vehicles. Water can enter the starter solenoid, create an electrical short, and cause an engine-compartment fire while parked or driving.',
      solution: 'Owners are advised to park outside and away from structures until the recall repair is complete. Check the VIN with Genesis; dealers install a remedy relay kit in the engine junction box free of charge. Heat, smoke, or burning odor requires immediate shutdown.',
      severity: 'high',
      symptoms: ['Possible starter-solenoid electrical short', 'Possible smoke or engine-compartment fire while parked or driving'],
      affectedSystems: ['starter solenoid', 'engine-junction-box relay kit'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V107 - G70 Starter Solenoid', url: recalls(2019) }],
      summary: 'Replaced forum-only oil-consumption, carbon, plug and engine-repair claims with the exact 2019 starter-solenoid fire recall.',
    },
    'The frozen card generalized oil consumption, smoke, plug fouling, turbo seals, PCV behavior, carbon cleaning and engine repair across five years using only owner-forum threads.',
  ),

  'genesis-g70-abs-module-electrical-short-causing-engine-bay-fire-risk': replacement(
    {
      years: [2019, 2020, 2021],
      category: 'brakes',
      title: 'ABS Module Short-Circuit Fire Recall',
      description: 'NHTSA campaign 21V161 covers certain 2019-2021 Genesis G70 vehicles. The anti-lock brake system module can malfunction and short internally, causing an engine-compartment fire while parked or driving.',
      solution: 'Owners are advised to park outside and away from structures until repaired. Check the VIN with Genesis; dealers replace the ABS module fuse free of charge. Smoke, heat, or burning odor requires immediate shutdown.',
      severity: 'high',
      symptoms: ['Possible ABS module electrical short', 'Possible smoke or engine-compartment fire'],
      affectedSystems: ['anti-lock brake system module', 'ABS module fuse'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V161 - G70 ABS Module', url: recalls(2020) }],
      summary: 'Preserved the ABS fire topic but replaced third-party and forum material with the exact NHTSA campaign, parking instruction, and fuse remedy.',
    },
    'The frozen card named a real campaign but mixed a third-party recall summary and forum discussion into the diagnosis. Retain only NHTSA-defined scope and remedy.',
  ),

  'genesis-g70-electronic-parking-brake-actuator-failure-won-t-release-enga': replacement(
    {
      years: [2021],
      engines: ['2.0L GDI'],
      category: 'fuel',
      title: 'Fuel-Pump Jet-Nozzle Stall Recall',
      description: 'NHTSA campaign 20V569 covers certain 2021 Genesis G70 vehicles with the 2.0L GDI engine. A plastic burr in the fuel-pump jet nozzle can block fuel flow, reduce supply to the engine, and cause a stall.',
      solution: 'Check the VIN and engine with Genesis. Dealers inspect and repair the fuel-pump assembly jet nozzle free of charge. A no-start, loss of power, or stall requires professional diagnosis and recall verification.',
      severity: 'high',
      symptoms: ['Possible insufficient fuel supply', 'Possible loss of power or engine stall'],
      affectedSystems: ['fuel-pump assembly', 'jet nozzle', 'engine fuel supply'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V569 - G70 Fuel-Pump Jet Nozzle', url: recalls(2021) }],
      summary: 'Replaced forum-only electronic parking-brake actuator claims with the exact 2021 2.0L fuel-pump stall recall.',
    },
    'The frozen card generalized EPB actuator, wiring, calibration and replacement across six years using forum anecdotes without a Genesis bulletin defining a population or procedure.',
  ),

  'genesis-g70-front-brake-rotor-warping-pulsation': replacement(
    {
      years: [2019],
      category: 'body',
      title: 'Internal Trunk-Release Latch Recall',
      description: 'NHTSA campaign 22V196 covers certain 2019 Genesis G70 vehicles. The trunk latch can become damaged and prevent the trunk from being opened from inside, creating an entrapment hazard.',
      solution: 'Check the VIN with Genesis. Dealers inspect the trunk latch and replace the latch base as necessary free of charge. Do not allow anyone to occupy the trunk, and repair an inoperative internal release promptly.',
      severity: 'high',
      symptoms: ['Internal trunk release may not open the trunk'],
      affectedSystems: ['trunk latch', 'internal trunk-release mechanism', 'latch base'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V196 - G70 Trunk Latch', url: recalls(2019) }],
      summary: 'Replaced owner-forum rotor and pad-deposit generalizations with the exact 2019 internal trunk-release recall.',
    },
    'The frozen card generalized rotor warping, pad deposits, lug torque, bedding, resurfacing and replacement through 2026 from forums and a generic symptom page without Genesis primary-source scope.',
  ),

  'genesis-g70-gdi-intake-valve-carbon-buildup': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'electrical',
      title: 'Inoperative Horn Diagnostic Bulletin',
      description: 'Genesis bulletin 11017471 covers certain 2019-2025 G70 vehicles whose horn may become inoperative because of moisture or carbonization at the electrical contact point.',
      solution: 'Confirm horn operation and vehicle coverage, then follow the Genesis inspection procedure. Replace only the horn components that fail the manufacturer test; do not infer intake-valve deposits or prescribe engine cleaning from rough-idle symptoms alone.',
      severity: 'medium',
      symptoms: ['Horn inoperative or intermittent'],
      affectedSystems: ['horn assemblies', 'horn electrical contact points'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11017471 - Inoperative Horn Inspection', url: tsb.horn }],
      summary: 'Replaced forum-only carbon-cleaning claims with the exact Genesis horn moisture and contact-carbonization bulletin.',
    },
    'The frozen card treated misfire and rough-idle symptoms as proof of GDI intake deposits and prescribed chemical or walnut-shell cleaning across six years without a Genesis diagnostic bulletin.',
  ),

  'genesis-g70-headlight-condensation-moisture-causing-lighting-failure': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'electrical',
      title: 'Exterior-Lamp Condensation Assessment Bulletin',
      description: 'Genesis bulletin 10230903 covers 2019-2023 G70 vehicles and distinguishes normal accumulated moisture from a lamp condition that needs repair. It states that headlamp, rear-combination-lamp, DRL, or fog-lamp replacement is not necessary in most condensation cases.',
      solution: 'Inspect the moisture pattern using the bulletin criteria. Normal condensation can clear after the lamps operate with the engine running or during driving; persistent water pooling, electrical failure, physical damage, or a condition outside the bulletin criteria requires dealer diagnosis before assembly replacement.',
      severity: 'low',
      symptoms: ['Condensation or accumulated moisture inside an exterior lamp'],
      affectedSystems: ['headlamps', 'rear combination lamps', 'daytime running lamps', 'fog lamps'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10230903 - Exterior Lamp Condensation', url: tsb.headlamp }],
      summary: 'Narrowed the lamp card to the exact 2019-2023 Genesis condensation assessment and removed the aftermarket assembly recommendation.',
    },
    'The frozen card extended the condition through 2026, treated condensation as lighting failure, and included an aftermarket parts source despite the Genesis bulletin stating replacement is usually unnecessary.',
  ),

  'genesis-g70-high-pressure-fuel-pump-failure-causing-power-loss': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'fuel',
      title: 'Fuel-Pump Failure and Loss-of-Power Recall',
      description: 'NHTSA campaign 24V528 includes certain 2019-2023 Genesis G70 vehicles. The fuel pump can fail and cause a loss of drive power, increasing crash risk.',
      solution: 'Check the VIN with Genesis. Dealers update engine-control-module software, then inspect and replace the fuel-pump assembly as necessary free of charge. Hesitation, power loss, or stalling requires prompt professional diagnosis.',
      severity: 'high',
      symptoms: ['Possible hesitation or loss of drive power', 'Possible engine stall'],
      affectedSystems: ['fuel-pump assembly', 'engine-control-module software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V528 - G70 Fuel Pump', url: recalls(2023) }],
      summary: 'Preserved the fuel-pump recall topic while replacing third-party and forum material with NHTSA scope and the software-plus-inspection remedy.',
    },
    'The frozen card named a real campaign but framed every symptom as high-pressure-pump failure and mixed third-party and forum sources into the repair advice.',
  ),

  'genesis-g70-infotainment-lag': replacement(
    {
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      title: '2026 Navigation and Head-Unit Software Update Bulletin',
      description: 'Genesis bulletin 11033711 covers 2022-2025 G70 vehicles and documents navigation and head-unit software changes introduced in the 2026 first navigation-map and software update. The applicable changes vary by model and system.',
      solution: 'Identify the installed navigation/head-unit system and current software version, then use the Genesis Navigation Updater and USB process described by Genesis. Do not replace the head unit solely because the interface seems slow or resets before version-specific diagnosis.',
      severity: 'low',
      symptoms: ['Navigation or head-unit behavior addressed by the model-specific software update'],
      affectedSystems: ['navigation system', 'infotainment head unit', 'navigation-map and system software'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11033711 - 2026 Navigation and Head-Unit Update', url: tsb.navigation }],
      summary: 'Replaced an uncited lag-and-crash aggregation with the exact Genesis navigation and head-unit update bulletin.',
    },
    'The frozen card had no citation and generalized lag, crashes, resets, updates and head-unit replacement across 2019-2022 without a Genesis-defined software version or repair path.',
  ),

  'genesis-g70-parasitic-battery-drain-dead-12v-battery': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'electrical',
      title: 'Extended 12-Volt Battery Diagnosis Bulletin',
      description: 'Genesis bulletin 10247603 covers 2019-2023 G70 vehicles and provides an extended GDS battery-diagnosis procedure. It evaluates internal short circuit, deterioration, electronic-component malfunction, insufficient charge, charging defects, and the preceding 30 days of state-of-charge and parasitic-draw history.',
      solution: 'Use the Genesis GDS battery diagnosis and saved battery-sensor history before replacing the battery or blaming a module. Follow the result-specific charging, electrical-system, or battery procedure; a dead battery alone does not establish parasitic draw.',
      severity: 'medium',
      symptoms: ['Discharged or dead 12-volt battery', 'Possible low state of charge or charging-system fault'],
      affectedSystems: ['12-volt battery', 'battery sensor history', 'charging system', 'parasitic-draw diagnosis'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10247603 - Extended Battery Diagnosis', url: tsb.battery }],
      summary: 'Narrowed the owner-forum battery-drain card to Genesis’s exact GDS diagnostic branches and five-year population.',
    },
    'The frozen card generalized batteries, telematics, keys, accessories and modules through 2025 from owner forums and an unaffiliated article, then prescribed replacement and disconnect tests without Genesis scope.',
  ),

  'genesis-g70-sunroof-headliner-rattle-creaking-noise': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      trims: ['Vehicles equipped with the wide sunroof and covered by the bulletin'],
      category: 'body',
      title: 'Wide-Sunroof Creak and Rattle Repair Bulletin',
      description: 'Genesis bulletin 11027051 covers certain 2019-2023 G70 vehicles that may exhibit abnormal creaking or rattling from the wide-sunroof assembly while driving on uneven roads.',
      solution: 'Confirm that the noise originates from the wide-sunroof assembly and follow the Genesis inspection and repair procedure. Do not apply generic lubricants, tighten unrelated fasteners, or disturb the headliner without the bulletin’s isolation steps.',
      severity: 'low',
      symptoms: ['Creaking or rattling from the wide sunroof on uneven roads'],
      affectedSystems: ['wide-sunroof assembly', 'sunroof attachment and contact points'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11027051 - G70 Wide-Sunroof Noise', url: tsb.sunroof }],
      summary: 'Replaced forum repair lore with the current Genesis wide-sunroof noise bulletin and exact 2019-2023 scope.',
    },
    'The frozen card generalized headliner, shade, frame, tracks, seals and clips through 2024 using long owner-forum threads without a manufacturer procedure.',
  ),

  'genesis-g70-torque-converter-internal-rivet-damage-scratching-noise-low': replacement(
    {
      years: [2023],
      trims: ['Vehicles covered by Genesis campaign T27G'],
      category: 'transmission',
      title: 'Torque-Converter Rivet Damage Campaign T27G',
      description: 'Genesis bulletin 10230913 covers certain 2023 G70 vehicles whose torque converter can develop internal rivet damage and cracks. Symptoms can include a scratching noise and, rarely, an engine stall at idle or creep speed.',
      solution: 'Verify campaign eligibility and reproduce the defined symptom using the Genesis procedure. Covered vehicles receive torque-converter replacement under campaign T27G; do not substitute an engine-control-module part or rely on a forum hesitation discussion.',
      severity: 'high',
      symptoms: ['Scratching noise from the torque converter', 'Rare engine stall at idle or creep speed'],
      affectedSystems: ['torque converter', 'internal torque-converter rivets'],
      sources: [{ type: 'tsb', title: 'Genesis Campaign T27G - G70 Torque Converter', url: tsb.torqueConverter }],
      summary: 'Preserved campaign T27G but replaced unrelated aftermarket and forum citations with the exact Genesis bulletin.',
    },
    'The frozen card described a real Genesis campaign but cited an unrelated ECM parts page and a forum hesitation thread instead of the manufacturer campaign document.',
  ),

  'genesis-g70-turbo-oil-line-leak': replacement(
    {
      years: [2019, 2020, 2021, 2022],
      engines: ['3.3L V6 turbocharged'],
      category: 'engine',
      title: 'Left Turbocharger Oil-Feed Pipe Fire Recall',
      description: 'NHTSA campaign 24V191 covers certain 2019-2022 Genesis G70 vehicles with the 3.3L V6 turbo engine. The left turbocharger oil-feed pipe can deteriorate and leak oil onto hot engine components, increasing fire risk.',
      solution: 'Check the VIN and engine with Genesis. Dealers replace the left turbocharger oil-feed pipe free of charge. This campaign replaces the earlier 19V538 remedy, so vehicles repaired previously need the new remedy. Oil odor, smoke, or visible leakage requires immediate shutdown.',
      severity: 'high',
      symptoms: ['Oil odor or visible leak near the left turbocharger', 'Possible smoke or engine-compartment fire'],
      affectedSystems: ['left turbocharger oil-feed pipe', '3.3L turbocharger lubrication system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V191 - G70 Turbo Oil-Feed Pipe', url: recalls(2022) }],
      summary: 'Preserved the turbo oil-line topic and added exact engine, years, superseded-recall status, fire risk, and replacement remedy.',
    },
    'The frozen card named the campaign but had no citation and omitted that the new recall replaces 19V538 and requires a new remedy even on previously repaired vehicles.',
  ),
};

const reasons = {
  'genesis-g70-lsd-noise': 'Current Genesis/NHTSA primary-source research does not establish the frozen 2019-2026 limited-slip differential chatter population, claimed fluid cause, diagnosis, or universal fluid-versus-differential remedy.',
  'genesis-g70-power-folding-mirror-failure': 'Current Genesis/NHTSA primary-source research does not establish a 2019-2024 power-folding mirror motor, gear or module failure population or the forum-derived replacement procedure.',
  'genesis-g70-soft-clear-coat-easy-chipping-peeling-swirl-marks': 'Current Genesis/NHTSA primary-source research does not establish a universal 2019-2026 soft-clear-coat defect, failure mechanism, refinishing procedure or warranty outcome from the owner-forum paint discussions.',
  'genesis-g70-transmission-shift-quality': 'Current Genesis/NHTSA primary-source research does not support one 2019-2026 G70 shift-quality condition spanning adaptations, fluid, software, valve body, clutches and transmission replacement without a defined DTC and build population.',
};

module.exports = buildConfig({
  label: 'Genesis G70',
  make: 'Genesis',
  model: 'G70',
  slug: 'genesis-g70',
  batchId: 'genesis-g70-full-record-cohort-138-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '824fa913ce34111857e424803023212de68564e13111b6db697efbf9f95e9c4a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-g70/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisg70_blind:manual-primary-source-gate',
    edge: 'genesisg70_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
