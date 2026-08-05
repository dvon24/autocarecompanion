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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Transit&modelYear=${year}`;
const tenR80Bulletin = 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006772-0001.pdf';

const published = {
  'ford-transit-oil-pan-drain-plug-strip-2015': replacement(
    {
      years: [2025],
      category: 'engine',
      title: 'Connecting-Rod and Rod-Bearing Engine Recall',
      description: 'NHTSA campaign 25V344 covers certain 2025 Ford Transit vehicles. Manufacturing defects in connecting rods or rod bearings can damage the engine, cause engine failure, and stall the vehicle.',
      solution: 'Check recall completion by VIN with Ford. Dealers inspect the connecting rods and replace the engine long-block assembly when required, free of charge. Knocking, loss of power, warning indicators, or a stall warrants prompt shutdown and professional inspection.',
      severity: 'high',
      symptoms: ['Possible engine knock or abnormal noise', 'Possible loss of power or engine stall'],
      affectedSystems: ['connecting rods', 'rod bearings', 'engine long block'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V344 - Transit Connecting Rods and Bearings', url: recalls(2025) }],
      summary: 'Replaced an unsupported Reddit oil-pan-thread card with the exact 2025 engine hard-parts safety recall.',
    },
    'The frozen card applied a Reddit drain-plug discussion to every 2015-2020 Transit and prescribed thread repair without a Ford-defined population or procedure.',
  ),

  'ford-transit-roof-water-leak-rust-2015': replacement(
    {
      years: [2023, 2024],
      category: 'safety',
      title: 'Engine-Crossmember Fastener Recall',
      description: 'NHTSA campaign 26V061 covers certain 2023-2024 Ford Transit vehicles. An improperly secured engine crossmember can let the engine shift, potentially causing loss of drive power or brake failure.',
      solution: 'Check the VIN with Ford before assuming every Transit is affected. Dealers replace the crossmember fasteners free of charge. New underbody movement, clunks, braking changes, or power loss require immediate professional inspection.',
      severity: 'high',
      symptoms: ['Possible underbody movement or noise', 'Possible loss of drive power or braking'],
      affectedSystems: ['engine crossmember', 'crossmember fasteners', 'powertrain and brake connections'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V061 - Transit Engine Crossmember', url: recalls(2024) }],
      summary: 'Replaced a forum-derived roof-leak and rust generalization with the exact 2023-2024 crossmember safety recall.',
    },
    'The frozen card generalized multiple roof joints, seam sealer, rust locations and repair methods to all body styles without a Ford bulletin defining the affected build range.',
  ),

  'ford-transit-10r80-10-speed-harsh-delayed-shifts-and-shudder-software-valve-body-related': replacement(
    {
      years: [2020, 2021, 2022, 2023],
      trims: ['Vehicles equipped with the 10R80 transmission and covered by the bulletin'],
      category: 'transmission',
      title: '10R80 Harsh or Delayed Engagement and Shift Bulletin',
      description: 'Ford TSB 24-2254 covers certain 2020-2023 Transit vehicles with the 10R80 transmission that may have harsh or delayed engagement, harsh or delayed shifts, and specified ratio, shift-solenoid, or clutch-performance DTCs. Ford identifies possible PCM/TCM software, solenoid strategy, sticking main-control valves, or CDF clutch-cylinder sleeve movement rather than one universal cause.',
      solution: 'Confirm the model year, transmission, build criteria, software level and stored DTCs before repair. Follow Ford TSB 24-2254 to identify the applicable software, solenoid, main-control or CDF clutch-cylinder procedure; do not replace the valve body or transmission solely from a symptom match.',
      severity: 'medium',
      symptoms: ['Harsh or delayed engagement', 'Harsh or delayed shift', 'Possible transmission or powertrain warning indicator'],
      affectedSystems: ['10R80 transmission', 'PCM or TCM calibration', 'main control valve body', 'CDF clutch cylinder'],
      dtcCodes: ['P0751', 'P0752', 'P0756', 'P0757', 'P0761', 'P0762', 'P0766', 'P0767', 'P0771', 'P0772', 'P2700', 'P2701', 'P2702', 'P2703', 'P2704', 'P2705', 'P2707', 'P2708', 'P0729', 'P0731', 'P0732', 'P0733', 'P0734', 'P0735', 'P0736', 'P076F', 'P07D9', 'P07F6', 'P07F7'],
      sources: [{ type: 'tsb', title: 'Ford TSB 24-2254 - 10R80 Harsh or Delayed Engagement and Shift', url: tenR80Bulletin }],
      summary: 'Narrowed the 10R80 card to Ford TSB 24-2254, its exact population, diagnostic branches and listed DTCs.',
    },
    'The frozen card mixed software, adaptation, fluid, valve-body and internal transmission explanations across 2017-2023. Retain only the Ford-defined 2020-2023 10R80 condition and diagnostic branches.',
  ),

  'ford-transit-3-7l-ti-vct-throttle-body-failure-electronic-throttle-control-etc-limp-mode': replacement(
    {
      years: [2015],
      trims: ['Certain vehicles identified by VIN'],
      category: 'fuel',
      title: 'Fuel-Filter Bracket Detachment Recall',
      description: 'NHTSA campaign 14V708 covers certain 2015 Ford Transit vehicles whose fuel-filter bracket can detach from the frame crossmember. Disrupted fuel flow can stall the engine and increase crash risk.',
      solution: 'Check the VIN with Ford. Dealers install a reinforcement plate at the fuel-filter bracket free of charge. A fuel-system warning, leak, loss of power, or stall requires prompt professional inspection.',
      severity: 'high',
      symptoms: ['Possible fuel-filter bracket movement', 'Possible loss of power or engine stall'],
      affectedSystems: ['fuel-filter bracket', 'frame crossmember', 'fuel supply'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V708 - Transit Fuel-Filter Bracket', url: recalls(2015) }],
      summary: 'Replaced a broad throttle-body limp-mode claim with the exact 2015 fuel-filter bracket stall recall.',
    },
    'The frozen card generalized electronic throttle-control failures, codes and throttle-body replacement across gasoline engines without a Transit-specific Ford bulletin.',
  ),

  'ford-transit-35-ecoboost-turbo-failure-2015': replacement(
    {
      years: [2015],
      category: 'brakes',
      title: 'Rear Brake-Hose Junction Leak Recall',
      description: 'NHTSA campaign 14V482 covers certain 2015 Ford Transit vehicles. Brake fluid can leak at the rear brake-hose-to-caliper junctions, lengthening stopping distance and increasing crash risk.',
      solution: 'Check the VIN and recall history with Ford. Dealers replace the sealing washers at both rear brake-hose-to-caliper joints free of charge. Low fluid, a brake warning, a soft pedal, or visible leakage requires the vehicle not be driven until inspected.',
      severity: 'high',
      symptoms: ['Possible brake-fluid leak at a rear caliper hose joint', 'Possible soft pedal or increased stopping distance'],
      affectedSystems: ['rear brake hoses', 'caliper hose junctions', 'sealing washers'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V482 - Transit Rear Brake Hoses', url: recalls(2015) }],
      summary: 'Replaced a forum/video turbo-failure aggregation with the exact 2015 rear brake-hose leak recall.',
    },
    'The frozen card merged turbo bearing, oil-supply, wastegate and boost-leak theories across multiple engines and prescribed replacement without Ford primary-source scope.',
  ),

  'ford-transit-alternator-failure-2015': replacement(
    {
      years: [2015, 2016, 2017],
      trims: ['Vehicles equipped with the factory trailer-tow module and covered by the campaign'],
      category: 'electrical',
      title: 'Trailer-Tow Module Water-Intrusion Fire Recall',
      description: 'NHTSA campaigns 17V668 and 18V275 cover certain 2015-2017 Transit vehicles with a trailer-tow module. Water can enter the module and corrode its wiring, causing electrical faults, loss of instrument-cluster functions, or a short and fire even when no trailer is connected.',
      solution: 'Check the VIN for the applicable Ford campaign. Dealers add a drain hole to the driver-door stepwell and install a wiring-harness fuse free of charge. Burning odor, smoke, erratic turn signals, or cluster loss requires shutdown away from structures and immediate inspection.',
      severity: 'high',
      symptoms: ['Rapid turn-signal flashing', 'Possible loss of instrument-cluster functions', 'Possible burning odor, smoke, or electrical fire'],
      affectedSystems: ['trailer-tow module', 'module wiring', 'driver-door stepwell drainage', 'protective fuse'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 17V668 - Transit Trailer-Tow Module', url: recalls(2017) },
        { type: 'recall', title: 'NHTSA Campaign 18V275 - Expanded Transit Trailer-Tow Module Population', url: recalls(2017) },
      ],
      summary: 'Replaced generic alternator and regulator claims with the exact trailer-tow module water-intrusion and fire campaigns.',
    },
    'The frozen card generalized alternator and regulator failure across nearly every Transit year using aftermarket and forum material without a Ford-defined failure population.',
  ),

  'ford-transit-body-control-module-bcm-failure-causing-intermittent-electrical-gremlins': replacement(
    {
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      title: 'Rearview-Camera APIM Software Recall',
      description: 'NHTSA campaign 25V315 includes certain 2022-2025 Ford Transit vehicles. An accessory protocol interface module software error can delay, freeze, or suppress the rearview-camera image while reversing.',
      solution: 'Check the VIN with Ford. The APIM software is updated by a dealer or, where available, over the air at no charge. Do not rely on the camera alone; if the image is delayed, frozen, or absent, use direct observation and arrange the campaign remedy.',
      severity: 'high',
      symptoms: ['Delayed, frozen, or missing rearview-camera image'],
      affectedSystems: ['accessory protocol interface module', 'rearview-camera display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V315 - Transit Rearview-Camera Software', url: recalls(2024) }],
      summary: 'Replaced a generic BCM gremlins card with the exact rearview-camera APIM software recall.',
    },
    'The frozen card attributed many unrelated electrical symptoms to BCM hardware, connectors, grounds and programming without a Ford diagnostic bulletin defining that single condition.',
  ),

  'ford-transit-brake-vacuum-pump-oil-leak-reduced-brake-assist-3-5l-ecoboost-3-7l': replacement(
    {
      years: [2025],
      category: 'brakes',
      title: 'Brake-Pedal Pushrod Disconnection Recall',
      description: 'NHTSA campaign 26V090 covers certain 2025 Ford Transit vehicles. The brake pedal can disconnect from the brake-booster pushrod and cause loss of brake function.',
      solution: 'NHTSA states owners should not drive affected vehicles until repaired. Check the VIN immediately with Ford; dealers inspect and repair the brake-booster assembly free of charge.',
      severity: 'high',
      symptoms: ['Possible brake-pedal disconnection', 'Possible loss of brake function'],
      affectedSystems: ['brake pedal', 'brake-booster pushrod', 'brake-booster assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V090 - Transit Brake Pedal and Booster Pushrod', url: recalls(2025) }],
      summary: 'Replaced a generalized vacuum-pump oil-leak card with the current do-not-drive brake-pedal recall.',
    },
    'The frozen card combined oil leaks, reduced assist and pump replacement across two engines without a Transit-specific Ford source or exact affected build population.',
  ),

  'ford-transit-driveshaft-carrier-bearing-2015': replacement(
    {
      years: [2015, 2016, 2017],
      trims: ['Full-size Transit configurations covered by the campaign; exclusions apply'],
      category: 'drivetrain',
      title: 'Driveshaft Flexible-Coupling Failure Recall',
      description: 'NHTSA campaign 19V767 covers certain 2015-2017 full-size Transit vehicles whose driveshaft flexible coupling can crack and fail. Failure can cause loss of drive power, driveline damage, parking-brake or fuel-line damage, or rollaway when parked without the parking brake.',
      solution: 'Check the VIN and configuration with Ford because campaign exclusions apply. The final remedy replaces the front driveshaft section with one using a mechanical universal joint; follow Ford instructions for any interim inspection or coupling replacement.',
      severity: 'high',
      symptoms: ['Possible cracked or failed driveshaft flexible coupling', 'Possible driveline vibration, loss of drive power, or rollaway'],
      affectedSystems: ['driveshaft flexible coupling', 'front driveshaft section', 'parking-brake and fuel-line routing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 19V767 - Transit Driveshaft Flexible Coupling', url: recalls(2017) }],
      summary: 'Narrowed the carrier-bearing card to the exact 2015-2017 flexible-coupling safety campaign and its configuration exclusions.',
    },
    'The frozen card attributed broad vibration and clunk symptoms to a carrier bearing across 2015-2023 without a Ford source distinguishing the bearing from the documented flexible-coupling campaign.',
  ),

  'ford-transit-electric-power-steering-epas-assist-loss-steering-fault-warnings': replacement(
    {
      years: [2023, 2024],
      trims: ['Transit Trail package'],
      category: 'steering',
      title: 'EPAS Ground-Eyelet Corrosion Recall',
      description: 'NHTSA campaign 24V542 covers certain 2023-2024 Transit Trail vehicles. Corrosion at the electronic power-assist steering ground eyelet can cause loss of power-steering assist.',
      solution: 'Check the VIN and Trail-package coverage with Ford. Dealers install a new EPAS ground pigtail kit free of charge. A steering warning or sudden increase in steering effort requires cautious stopping and professional inspection.',
      severity: 'high',
      symptoms: ['Power-steering warning', 'Sudden increase in steering effort'],
      affectedSystems: ['electronic power-assist steering', 'EPAS ground eyelet', 'ground pigtail'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V542 - Transit Trail EPAS Ground', url: recalls(2024) }],
      summary: 'Narrowed the generic EPAS card to the exact Transit Trail ground-eyelet corrosion recall.',
    },
    'The frozen card generalized motor, module, rack, sensor, voltage and ground causes across 2015-2023 without a Ford-defined population or diagnostic path.',
  ),

  'ford-transit-front-brake-caliper-sticking-premature-pad-and-rotor-wear': replacement(
    {
      years: [2015, 2016, 2017, 2018, 2019, 2020],
      trims: ['Vehicles serviced with the affected driveshaft torsional-damper kit'],
      category: 'brakes',
      title: 'Parking-Brake Cable Damage Recall',
      description: 'NHTSA campaign 21V631 covers certain 2015-2020 Transit vehicles that may have received an incorrect driveshaft torsional-damper service kit. The damper shield can contact and damage the passenger-side parking-brake cable, reducing parking-brake performance.',
      solution: 'Check the VIN and service history with Ford. Dealers replace the passenger-side parking-brake cable free of charge. Until inspected, apply the service brake when selecting Park and avoid relying on the parking brake to hold the vehicle on a grade.',
      severity: 'high',
      symptoms: ['Possible reduced parking-brake holding ability', 'Possible cable contact or damage near the driveshaft damper shield'],
      affectedSystems: ['passenger-side parking-brake cable', 'driveshaft torsional-damper shield'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V631 - Transit Parking-Brake Cable', url: recalls(2020) }],
      summary: 'Replaced generic front-caliper wear claims with the exact parking-brake cable damage recall.',
    },
    'The frozen card generalized caliper sticking, hose restriction, fluid contamination, pad wear and rotor replacement across nine years without a Ford bulletin defining the condition.',
  ),

  'ford-transit-front-suspension-radius-arm-bushing-premature-wear-and-cracking': replacement(
    {
      years: [2019],
      trims: ['T-150, T-250 and T-350 vehicles with aluminum wheels covered by the campaign'],
      category: 'suspension',
      title: 'Rear-Axle Wheel-Stud Fracture Recall',
      description: 'NHTSA campaign 21V324 covers certain 2019 Transit T-150, T-250 and T-350 vehicles with aluminum wheels. A warped rear-axle flange surface can cause wheel studs to fracture and a rear wheel to detach.',
      solution: 'Check the VIN and wheel configuration with Ford. Dealers inspect the rear axle and replace the axle-shaft assembly, bolts and lug nuts as required, free of charge. Wheel looseness, vibration, or missing or broken studs requires the vehicle not be driven.',
      severity: 'high',
      symptoms: ['Possible loose rear wheel', 'Possible broken rear wheel studs or vibration'],
      affectedSystems: ['rear-axle flange', 'wheel studs', 'axle-shaft assembly', 'lug nuts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V324 - Transit Rear Wheel Studs', url: recalls(2019) }],
      summary: 'Replaced unsourced radius-arm bushing wear claims with the exact rear-axle wheel-stud safety recall.',
    },
    'The frozen card generalized bushing wear, alignment, tire wear and replacement to every 2015-2023 Transit without a Ford-defined build range or remedy.',
  ),

  'ford-transit-fuel-injector-failure-2017': replacement(
    {
      years: [2015, 2016],
      engines: ['3.2L diesel'],
      category: 'fuel',
      title: 'Diesel Fuel-System Metallic-Debris Recall',
      description: 'NHTSA campaign 16V618 covers certain 2015-2016 Ford Transit vehicles with the 3.2L diesel engine. Metallic debris can clog a fuel injector or the fuel-volume control valve and stall the engine.',
      solution: 'Check the VIN and engine with Ford. Dealers replace the fuel-injection pump and affected fuel-system parts, replace the filter, and flush the system as necessary under the campaign. Rough running or a stall requires professional diagnosis rather than assuming one injector failed.',
      severity: 'high',
      symptoms: ['Possible rough running', 'Possible engine stall'],
      affectedSystems: ['fuel-injection pump', 'fuel injectors', 'fuel-volume control valve', 'fuel filter and lines'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 16V618 - Transit 3.2L Diesel Fuel System', url: recalls(2016) }],
      summary: 'Corrected the non-U.S. EcoBlue injector card to the exact U.S.-market 3.2L diesel metallic-debris recall.',
    },
    'The frozen card mislabeled a broad 2017-2021 Transit population as EcoBlue and prescribed injector replacement from non-U.S. forum/video material. Retain only the U.S. 3.2L campaign.',
  ),

  'ford-transit-instrument-cluster-speedometer-erratic-readings-and-gauge-dropout': replacement(
    {
      years: [2022, 2023],
      category: 'electrical',
      title: 'Instrument-Cluster Illumination Recall',
      description: 'NHTSA campaign 25V339 covers certain 2022-2023 Transit vehicles previously repaired incorrectly under campaign 22V415. The instrument cluster may fail to illuminate critical warning lights, gauges, or the speedometer.',
      solution: 'Check the VIN and prior recall repair with Ford. Dealers update the instrument-panel-cluster software free of charge. If critical gauges or warning indicators are unreadable, stop safely and arrange service rather than continuing without required information.',
      severity: 'high',
      symptoms: ['Dark or unreadable cluster', 'Missing speedometer, gauge, or warning-light illumination'],
      affectedSystems: ['instrument panel cluster', 'cluster software', 'safety telltales and gauges'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V339 - Transit Instrument Cluster', url: recalls(2023) }],
      summary: 'Narrowed the broad cluster-dropout card to the exact 2022-2023 cluster illumination re-recall.',
    },
    'The frozen card mixed battery voltage, grounds, connectors, software and cluster replacement across 2015-2023 without a defined Ford population.',
  ),

  'ford-transit-pcm-ecm-software-calibration-causing-stall-or-no-start-after-refueling': replacement(
    {
      years: [2023],
      category: 'fuel',
      title: 'Fuel-Tank Grade-Vent Valve Weld Recall',
      description: 'NHTSA campaign 23V071 covers certain 2023 Ford Transit vehicles. The fuel-tank grade-vent valve may be improperly welded to the tank shell and allow fuel to leak, creating a fire risk near an ignition source.',
      solution: 'Check the VIN with Ford. Dealers replace the fuel tank free of charge. Fuel odor, dampness, or visible leakage requires immediate shutdown away from ignition sources and professional transport for inspection.',
      severity: 'high',
      symptoms: ['Fuel odor', 'Possible fuel leakage from the tank vent-valve weld'],
      affectedSystems: ['fuel tank', 'grade-vent valve weld'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V071 - Transit Fuel Tank', url: recalls(2023) }],
      summary: 'Replaced an unsupported after-refueling PCM card with the exact 2023 fuel-tank leak recall.',
    },
    'The frozen card asserted a software calibration, evaporative-emissions mechanism and module reprogramming across seven years without a Transit-specific Ford bulletin.',
  ),

  'ford-transit-rear-axle-seal-leak-2015': replacement(
    {
      years: [2023, 2024],
      trims: ['Vehicles previously repaired under NHTSA campaign 24V102'],
      category: 'drivetrain',
      title: 'Rear-Axle Shaft Bolt Re-Recall',
      description: 'NHTSA campaign 24V805 covers certain 2023-2024 Ford Transit vehicles previously repaired under campaign 24V102. Incorrect rear-axle shaft bolts may have been installed, which can cause rear-wheel lockup or separation, loss of drive power, or rollaway in Park without the parking brake.',
      solution: 'Check the VIN and prior repair with Ford. Dealers inspect the rear-axle shaft bolts, replace incorrect bolts and restore differential fluid as needed, free of charge. Wheel noise, lockup, looseness, or drive-power loss requires immediate professional inspection.',
      severity: 'high',
      symptoms: ['Possible rear-wheel lockup or looseness', 'Possible loss of drive power or rollaway'],
      affectedSystems: ['rear-axle shaft bolts', 'rear axle', 'differential lubricant'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V805 - Transit Rear-Axle Shaft Bolts', url: recalls(2024) }],
      summary: 'Replaced a generic axle-seal leak card with the exact rear-axle bolt re-recall.',
    },
    'The frozen card generalized seal wear, vent blockage, bearings and axle overhaul across 2015-2023 without a Ford-defined seal condition or population.',
  ),

  'ford-transit-rear-hvac-line-expansion-valve-leaks-dual-a-c-causing-loss-of-refrigerant': replacement(
    {
      years: [2022, 2023],
      trims: ['Vehicles previously repaired under NHTSA campaign 22V791'],
      category: 'hvac',
      title: 'HVAC Defrost and Defog Control Re-Recall',
      description: 'NHTSA campaign 25V168 covers certain 2022-2023 Transit vehicles previously repaired incorrectly under campaign 22V791. HVAC controls, including windshield defrost and defog functions, may become inoperative and reduce driver visibility.',
      solution: 'Check the VIN and prior campaign completion with Ford. Dealers update the remote climate-control module software free of charge. Do not drive when windshield visibility cannot be maintained.',
      severity: 'high',
      symptoms: ['Inoperative HVAC controls', 'Loss of windshield defrost or defog function'],
      affectedSystems: ['remote climate-control module', 'HVAC controls', 'windshield defrost and defog'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V168 - Transit HVAC Controls', url: recalls(2023) }],
      summary: 'Replaced generic refrigerant-leak repair claims with the exact HVAC visibility re-recall.',
    },
    'The frozen card combined hoses, O-rings, expansion valves, evaporators, leak detection and recharge across 2015-2023 without a Ford bulletin defining a single refrigerant-leak condition.',
  ),

  'ford-transit-rear-leaf-spring-u-bolt-and-spring-pack-fatigue-breakage': replacement(
    {
      years: [2023, 2024],
      category: 'drivetrain',
      title: 'Low Rear-Axle Lubricant Recall',
      description: 'NHTSA campaign 24V102 covers certain 2023-2024 Ford Transit vehicles that may have insufficient rear-axle lubricant. Tail-bearing damage and seizure can lock a wheel or separate the driveshaft, causing loss of drive power or rollaway in Park without the parking brake.',
      solution: 'Check the VIN with Ford. Dealers inspect the rear axle and replace the axle bearings or axle assembly as necessary free of charge. Rear-axle noise, binding, wheel lock, or drive-power loss requires immediate professional inspection.',
      severity: 'high',
      symptoms: ['Possible rear-axle noise or binding', 'Possible wheel lockup or driveshaft separation'],
      affectedSystems: ['rear-axle lubricant', 'tail bearing', 'rear axle assembly', 'driveshaft'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V102 - Transit Rear-Axle Lubricant', url: recalls(2024) }],
      summary: 'Replaced unsupported leaf-spring fatigue claims with the exact low-lubricant rear-axle safety recall.',
    },
    'The frozen card generalized spring fatigue, cracked leaves, U-bolt torque, ride-height diagnosis and spring-pack replacement across nine years without Ford evidence.',
  ),

  'ford-transit-sliding-door-track-roller-wear-causing-binding-noise-or-door-not-closing': replacement(
    {
      years: [2015],
      trims: ['Cargo vans without rear seats and with a windowless sliding door covered by the campaign'],
      category: 'safety',
      title: 'Windowless Sliding-Door Reinforcement Recall',
      description: 'NHTSA campaign 14V483 covers certain 2015 Transit cargo vans without rear seats. A windowless sliding door may lack required epoxy reinforcement and can unlatch during a side-impact crash.',
      solution: 'Check the VIN and cargo-door configuration with Ford. Dealers install a reinforcement plate in the sliding door free of charge. Door damage, looseness, or latching trouble warrants prompt inspection, but the recall remedy is reinforcement rather than roller replacement.',
      severity: 'high',
      symptoms: ['Possible inadequate structural reinforcement in the windowless sliding door'],
      affectedSystems: ['windowless sliding door', 'door reinforcement plate', 'latching retention in a side impact'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V483 - Transit Sliding-Door Reinforcement', url: recalls(2015) }],
      summary: 'Replaced generic roller and track wear claims with the exact sliding-door reinforcement recall.',
    },
    'The frozen card generalized roller wear, track lubrication, adjustment and replacement across every 2015-2023 Transit without a Ford-defined roller failure population.',
  ),
};

const reasons = {
  'ford-transit-35-ecoboost-timing-chain-2015': 'Current Ford/NHTSA primary-source research does not establish the asserted 2015-2020 Transit EcoBoost timing-chain population, mileage range, diagnostic chain or universal timing-set remedy.',
  'ford-transit-6r80-transmission-torque-converter-shudder-at-light-throttle': 'Current Ford/NHTSA primary-source research does not establish this frozen 2015-2019 Transit 6R80 converter-shudder aggregation, its claimed fluid mechanism, or a universal flush-versus-converter remedy.',
  'ford-transit-cooling-system-degas-bottle-coolant-reservoir-cracking-leak-leading-to-overheating': 'Current Ford/NHTSA primary-source research does not establish a single 2015-2023 Transit reservoir-cracking population or the asserted cap, hose, bottle and pressure-test repair path.',
  'ford-transit-nox-sensor-scr-def-system-faults-causing-reduced-power-2-0l-ecoblue-diesel': 'The frozen card is scoped to the 2.0L EcoBlue diesel and non-U.S. material; the U.S. Transit primary-source corpus does not support publishing that population as a U.S. catalog issue.',
  'ford-transit-turbo-wastegate-2015': 'Current Ford/NHTSA primary-source research does not establish the asserted 2015-2020 Transit wastegate-actuator population, diagnosis, or universal lubrication and turbocharger repair advice.',
  'ford-transit-turbocharger-boost-pressure-sensor-map-sensor-failure-2-0l-ecoblue': 'The frozen card is scoped to the 2.0L EcoBlue diesel and non-U.S. forum/video material; no U.S.-market Transit primary source supports its years, codes and sensor-replacement prescription.',
};

module.exports = buildConfig({
  label: 'Ford Transit',
  make: 'Ford',
  model: 'Transit',
  slug: 'ford-transit',
  batchId: 'ford-transit-full-record-cohort-135-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7b18dfdb9d284c22c6b329521ce5aabe84b0a62e6a6848394f0e6916942e75fd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-transit/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordtransit_blind:manual-primary-source-gate',
    edge: 'fordtransit_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
