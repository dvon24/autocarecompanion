const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
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

function tsb(title, url) {
  return { type: 'tsb', title, url };
}

function recall(title, url) {
  return { type: 'recall', title, url };
}

const nhtsa2017 =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=F-150&modelYear=2017';
const nhtsa2019 =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=F-150&modelYear=2019';
const nhtsa2021 =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=F-150&modelYear=2021';
const nhtsa2025 =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=F-150&modelYear=2025';

const published = {
  'ford-f-150-10r80-10-speed-transmission-harsh-erratic-shifting-torque-co': replacement(
    {
      years: [2017, 2018, 2019, 2020],
      engines: [],
      category: 'transmission',
      title: '10R80 Adaptive Calibration Can Cause Harsh or Delayed Shifts',
      description:
        'Ford TSB 23-2250 covers some 2017-2020 F-150 trucks with the 10R80 automatic transmission. Harsh engagement, harsh or delayed shifts, a malfunction indicator lamp, and listed ratio or shift-solenoid DTCs can result when the adaptive calibration does not adapt correctly to hardware break-in over time.',
      solution:
        'Have a Ford dealer or qualified transmission technician verify the exact symptom and stored codes. Ford directs technicians to follow the bulletin procedure to overhaul the main-control valve body and/or complete an adaptive-learning drive cycle. The bulletin does not support a universal fluid additive, torque-converter replacement, or complete-transmission replacement.',
      severity: 'high',
      symptoms: ['Harsh transmission engagement', 'Harsh or delayed shifts', 'Malfunction indicator lamp with a listed transmission DTC'],
      affectedSystems: ['10R80 automatic transmission', 'main-control valve body', 'adaptive shift strategy'],
      dtcCodes: ['P0751', 'P0752', 'P0756', 'P0757', 'P0761', 'P0762', 'P0766', 'P0767', 'P0771', 'P0772', 'P2700', 'P2701', 'P2702', 'P2703', 'P2704', 'P2705', 'P2707', 'P2708', 'P0729', 'P0731', 'P0732', 'P0733', 'P0734', 'P0735', 'P0736', 'P076F', 'P07D9', 'P07F6', 'P07F7'],
      sources: [tsb('Ford TSB 23-2250 - 10R80 Harsh or Delayed Shift', 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10234596-0002.pdf')],
      summary:
        'Narrowed the seven-year aggregation to Ford TSB 23-2250\'s exact 2017-2020 10R80 population, documented symptoms and DTCs, adaptive-calibration cause, and valve-body/adaptive-learning procedure.',
    },
    'Replace the class-action, additive, converter, CDF-drum, and universal-replacement aggregation with the exact Ford TSB 23-2250 condition.',
  ),

  'ford-f-150-2025-5-2-7l-ecoboost-engine-wire-harness-chafing-coolant-hos': replacement(
    {
      years: [2025],
      engines: [],
      category: 'electrical',
      title: 'Recall 25S63: Coolant Hose Can Damage the Engine Wiring Harness',
      description:
        'NHTSA campaign 25V398 covers certain 2025 F-150 trucks. Contact with the engine coolant hose can chafe the engine wiring harness or pull Powertrain Control Module connector pins, which can cause the engine to stall.',
      solution:
        'Check the VIN for Ford recall 25S63. A Ford dealer will inspect the truck, replace the engine wiring harness when necessary, and relocate the engine coolant hose free of charge. Do not infer eligibility from model year alone.',
      severity: 'high',
      symptoms: ['Engine stall', 'Possible warning lights or drivability faults before a stall'],
      affectedSystems: ['engine wiring harness', 'engine coolant hose', 'Powertrain Control Module connector'],
      sources: [recall('NHTSA Campaign 25V398 / Ford Recall 25S63', nhtsa2025)],
      summary:
        'Rewrote the frozen card to the exact 2025 VIN-scoped engine-harness/coolant-hose safety recall and dealer inspection, harness replacement, and hose-relocation remedy.',
    },
    'Retain the current safety condition using NHTSA campaign 25V398 and remove speculative engine-size, parts, and do-it-yourself claims.',
  ),

  'ford-f-150-3-5l-ecoboost-cam-phaser-rattle-cold-start': replacement(
    {
      years: [2011, 2012, 2013, 2014, 2015],
      trims: ['Vehicles built on or before May 29, 2015'],
      engines: ['3.5L EcoBoost'],
      category: 'engine',
      title: 'Brief Cold-Start Rattle From the Upper Front-Cover Area',
      description:
        'Ford TSB 18-2305 covers some 2011-2015 F-150 trucks with the 3.5L EcoBoost engine built on or before May 29, 2015. A ticking, tapping, or rattle from the upper front-cover area can last two to five seconds after an initial start following a cold soak of at least six hours.',
      solution:
        'Have a Ford dealer or qualified engine technician confirm the exact cold-soak duration, sound location, build date, and bulletin applicability, then follow the Ford service procedure. Do not replace timing components solely from a generic startup-noise description.',
      severity: 'medium',
      symptoms: ['Two-to-five-second ticking, tapping, or rattle after a cold soak of at least six hours'],
      affectedSystems: ['engine upper front-cover area', 'variable camshaft timing system'],
      sources: [tsb('Ford TSB 18-2305 - 3.5L EcoBoost Cold-Start Rattle', 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10148706-9999.pdf')],
      summary:
        'Corrected the frozen 2017-2020 scope to Ford TSB 18-2305\'s exact 2011-2015 build population and two-to-five-second cold-soak symptom.',
    },
    'Retain only the Ford-defined 2011-2015 cold-start condition; the frozen card used the wrong model years and mixed later cam-phaser programs into the claim.',
  ),

  'ford-f-150-3-5l-powerboost-hybrid-exhaust-heat-exchanger-coolant-leak': replacement(
    {
      years: [2021, 2022, 2023],
      engines: ['3.5L PowerBoost hybrid'],
      category: 'cooling',
      title: 'Cracked Exhaust Heat-Exchanger Spigots Can Leak Coolant',
      description:
        'Ford TSB 23-2161 covers some 2021-2023 F-150 trucks with the 3.5L PowerBoost engine. Cracks in the two coolant spigots at the top of the exhaust heat exchanger can cause coolant loss, possible engine overheating, and/or an illuminated malfunction indicator lamp.',
      solution:
        'Have the leak source confirmed before repair. Ford says the heat-exchanger coolant spigots are serviceable and should be replaced in pairs; the muffler inlet-pipe assembly no longer needs replacement for this condition.',
      severity: 'high',
      symptoms: ['Loss of engine coolant', 'Possible engine over-temperature warning', 'Possible malfunction indicator lamp'],
      affectedSystems: ['exhaust heat exchanger', 'coolant spigots', 'engine cooling system'],
      sources: [tsb('Ford TSB 23-2161 - PowerBoost Exhaust Heat-Exchanger Coolant Leak', 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10233768-0001.pdf')],
      summary:
        'Retained the exact 2021-2023 PowerBoost coolant-spigot condition and Ford\'s revised pair-of-spigots repair instead of replacing the muffler inlet-pipe assembly.',
    },
    'Retain the exact Ford TSB 23-2161 condition while removing shopping links and universal replacement advice.',
  ),

  'ford-f-150-5-0l-coyote-excessive-oil-consumption': replacement(
    {
      years: [2018, 2019, 2020],
      engines: ['5.0L'],
      category: 'engine',
      title: '5.0L Oil Consumption During Deceleration Fuel Shutoff',
      description:
        'Ford TSB 19-2365 covers some 2018-2020 F-150 trucks with the 5.0L engine that consume more than one quart of oil in 3,000 miles without a visible leak. Ford attributes the condition to high intake-manifold vacuum during some deceleration fuel-shutoff events pulling oil into the combustion chamber.',
      solution:
        'Have a technician first document consumption and rule out visible leaks. Ford directs PCM reprogramming, installation of a revised engine-oil level indicator, and an engine-oil and filter change. The revised calibration reduces engine vacuum during applicable deceleration events.',
      severity: 'medium',
      symptoms: ['Oil consumption greater than one quart in 3,000 miles', 'No visible external oil leak'],
      affectedSystems: ['5.0L engine', 'PCM calibration', 'crankcase ventilation', 'engine-oil level indicator'],
      sources: [tsb('Ford TSB 19-2365 - 5.0L Excessive Oil Consumption', 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10169811-0001.pdf')],
      summary:
        'Retained Ford TSB 19-2365\'s exact 2018-2020 5.0L consumption threshold, DFSO-vacuum cause, and PCM/dipstick/oil-service procedure.',
    },
    'Retain the exact Ford TSB 19-2365 condition and remove unsupported ring, cylinder, long-block, additive, and universal-repair claims.',
  ),

  'ford-f-150-brake-master-cylinder-fluid-leak-into-booster-causing-front': replacement(
    {
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      trims: ['Recall eligibility varies by campaign; verify the VIN'],
      engines: [],
      category: 'brakes',
      title: 'Brake Master-Cylinder Leak Safety Recalls',
      description:
        'Multiple NHTSA campaigns cover certain 2013-2018 F-150 trucks whose brake master cylinder can leak brake fluid into the brake booster. The affected engine and production population differs by campaign. A leak can reduce front-brake function, increase pedal travel, and lengthen stopping distance.',
      solution:
        'Check the VIN for open Ford brake master-cylinder recalls, including the latest applicable expansion. Dealers replace the master cylinder free of charge and replace the brake booster if inspection shows it has been affected. Do not assume every truck in the listed years is included.',
      severity: 'high',
      symptoms: ['Low brake-fluid warning', 'Longer brake-pedal travel', 'Reduced front-brake function', 'Increased stopping distance'],
      affectedSystems: ['brake master cylinder', 'front brake circuit', 'brake booster'],
      sources: [
        recall('NHTSA Campaign 16V345 - Brake Master-Cylinder Leak', 'https://static.nhtsa.gov/odi/rcl/2016/RCMN-16V345-1450.pdf'),
        recall('NHTSA F-150 Recall Results - Campaigns 20V332, 22V150 and 25V236', nhtsa2017),
        recall('NHTSA Campaign 25V236 - Brake Master-Cylinder Leak Expansion', 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V236-6954.PDF'),
      ],
      summary:
        'Consolidated overlapping master-cylinder cards into one VIN-gated 2013-2018 recall card covering the campaign-specific population and dealer master-cylinder/booster remedy.',
    },
    'Consolidate the overlapping brake cards into one recall-accurate, VIN-gated safety entry instead of presenting every 2013-2018 truck as affected.',
  ),

  'ford-f-150-door-latch-failure-doors-won-t-latch-open-while-driving': replacement(
    {
      years: [2015, 2016, 2017],
      trims: ['Certain vehicles identified by VIN'],
      engines: [],
      category: 'body',
      title: 'Recall 17S33: Door Latches Can Freeze or Cables Can Bind',
      description:
        'NHTSA campaign 17V652 covers certain 2015-2017 F-150 trucks. Water entering a latch can freeze it, or a latch actuation cable can be bent or kinked. A door may fail to open or close, or may open while driving even though it appeared closed.',
      solution:
        'Check the VIN for Ford recall 17S33. A Ford dealer will inspect and repair affected actuation cables as needed and install water shields over the applicable door latches free of charge.',
      severity: 'high',
      symptoms: ['Door will not open', 'Door will not latch closed', 'Door may open while driving'],
      affectedSystems: ['door latches', 'door-latch actuation cables', 'latch water protection'],
      sources: [recall('Ford Safety Recall 17S33 / NHTSA Campaign 17V652', 'https://static.nhtsa.gov/odi/rcl/2017/RCMN-17V652-8183.pdf')],
      summary:
        'Retained the exact 2015-2017 frozen-latch or kinked-cable recall condition and Ford\'s water-shield/cable remedy.',
    },
    'Retain the exact NHTSA 17V652 safety recall and remove unrelated latch-actuator shopping advice.',
  ),

  'ford-f-150-ecoboost-turbocharger-wastegate-actuator-rattle': replacement(
    {
      years: [2017],
      engines: ['3.5L EcoBoost'],
      category: 'engine',
      title: '3.5L EcoBoost Wastegate-Linkage Rattle',
      description:
        'Ford TSB 20-2016 covers some 2017 F-150 trucks with the 3.5L EcoBoost engine. Excessive play in the turbocharger wastegate linkage can produce a rattle from the engine compartment under various operating conditions.',
      solution:
        'Have the noise localized to the wastegate linkage before repair. Ford directs installation of the wastegate-linkage spring kit for this condition; the bulletin does not direct automatic turbocharger replacement.',
      severity: 'low',
      symptoms: ['Rattle from the engine compartment under various operating conditions'],
      affectedSystems: ['turbocharger wastegate linkage'],
      sources: [tsb('Ford TSB 20-2016 - 3.5L EcoBoost Wastegate-Linkage Rattle', 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10171858-0001.pdf')],
      summary:
        'Narrowed the 14-year aggregation to Ford TSB 20-2016\'s exact 2017 3.5L EcoBoost wastegate-linkage rattle and spring-kit repair.',
    },
    'Retain only the exact 2017 Ford bulletin; the frozen card improperly extended one linkage-rattle condition through 2024.',
  ),

  'ford-f-150-front-seat-belt-pretensioner-fire-risk': replacement(
    {
      years: [2015, 2016, 2017, 2018],
      trims: ['Regular Cab and SuperCrew Cab vehicles identified by VIN'],
      engines: [],
      category: 'safety',
      title: 'Recall 18S27: Pretensioner Sparks Can Ignite B-Pillar Material',
      description:
        'NHTSA campaign 18V568 covers certain 2015-2018 F-150 Regular Cab and SuperCrew Cab trucks. If a front seat-belt pretensioner deploys during a crash, sparks can ignite carpeting or insulation in the B-pillar area and cause a vehicle fire.',
      solution:
        'Check the VIN for Ford recall 18S27. A Ford dealer will remove specified B-pillar insulation and wiring-harness tape and install heat-resistant tape free of charge.',
      severity: 'high',
      symptoms: ['No reliable warning before pretensioner deployment in a crash'],
      affectedSystems: ['front seat-belt pretensioners', 'B-pillar insulation', 'B-pillar wiring-harness tape'],
      sources: [recall('NHTSA Campaign 18V568 / Ford Recall 18S27', nhtsa2017)],
      summary:
        'Retained the exact 2015-2018 cab-style and crash-deployment fire-risk population with the Ford insulation/tape remedy.',
    },
    'Retain the exact NHTSA 18V568 safety recall without adding parts recommendations.',
  ),

  'ford-f-150-fuel-tank-strap-corrosion-straps-rust-break-tank-can-drop': replacement(
    {
      years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004],
      trims: ['1997-2003 F-150 and 2004 F-150 Heritage vehicles in specified high-corrosion jurisdictions'],
      engines: [],
      category: 'fuel',
      title: 'Recall 11S21: Fuel-Tank Straps Can Corrode and Fracture',
      description:
        'NHTSA campaign 11V385 covers certain 1997-2003 F-150 and 2004 F-150 Heritage trucks originally sold or registered in specified high-corrosion jurisdictions. Long exposure to road deicing chemicals can severely corrode one or both fuel-tank straps, allowing the tank to move, contact the ground, or separate fuel lines and leak.',
      solution:
        'Check the VIN for Ford recall 11S21. Ford dealers replace the straps with parts having increased corrosion protection free of charge; campaign documents also describe interim or reinforcement procedures used during early parts constraints.',
      severity: 'high',
      symptoms: ['Severely corroded fuel-tank straps', 'Fuel tank movement or contact with the ground', 'Possible fuel leak'],
      affectedSystems: ['fuel-tank mounting straps', 'fuel tank', 'fuel lines'],
      sources: [recall('NHTSA Campaign 11V385 / Ford Recall 11S21', 'https://static.nhtsa.gov/odi/rcl/2011/RCAK-11V385-6658.pdf')],
      summary:
        'Corrected the frozen scope to the campaign\'s F-150/F-150 Heritage and high-corrosion-jurisdiction population and VIN-gated strap-replacement remedy.',
    },
    'Retain the exact NHTSA 11V385 high-corrosion recall and remove universal rust-repair or parts-purchase advice.',
  ),

  'ford-f-150-integrated-trailer-module-loses-communication-loss-trailer-b': replacement(
    {
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      trims: ['Vehicles equipped with the affected integrated trailer module and identified by VIN'],
      engines: [],
      category: 'electrical',
      title: 'Recall 26C10: Integrated Trailer Module Can Lose Communication',
      description:
        'NHTSA campaign 26V104 covers certain 2021-2026 F-150 trucks. While towing, the integrated trailer module can lose communication with the vehicle, potentially causing loss of trailer brake and turn-signal lights or loss of trailer brake function.',
      solution:
        'Check the VIN for Ford recall 26C10. The integrated trailer module software is updated by a dealer or through an over-the-air update free of charge. Do not replace the module or trailer wiring without diagnosis.',
      severity: 'high',
      symptoms: ['Loss of trailer brake lights', 'Loss of trailer turn-signal lights', 'Loss of trailer brake function'],
      affectedSystems: ['integrated trailer module', 'trailer lighting', 'trailer brakes'],
      sources: [recall('NHTSA Campaign 26V104 / Ford Recall 26C10', nhtsa2021)],
      summary:
        'Replaced the generic module-failure card with the exact 2021-2026 noncompliance recall and free software-update remedy.',
    },
    'Retain the exact current NHTSA 26V104 campaign and remove speculative hardware replacement.',
  ),

  'ford-f-150-p0700-transmission-control-system-malfunction-from-failed-6r': replacement(
    {
      years: [2011, 2012, 2013],
      trims: ['Certain vehicles covered by Customer Satisfaction Program 19N01'],
      engines: [],
      category: 'transmission',
      title: '6R80 Molded Leadframe Output-Speed-Sensor Extended Coverage',
      description:
        'Ford Customer Satisfaction Program 19N01 covered certain 2011-2013 F-150 trucks with a 6R80 transmission. A failure of the output shaft speed sensor within the molded leadframe can illuminate the malfunction indicator or wrench lamp and store P0720, P0722, P0731, and/or P1500. The original program provided time- and mileage-limited extended coverage, so current eligibility must be verified.',
      solution:
        'Have a Ford dealer verify the VIN, program status, stored codes, and live output-speed data. The program procedure replaces the molded leadframe when the covered condition is confirmed. Do not diagnose this from generic P0700 alone, and do not assume the historical coverage period remains open.',
      severity: 'high',
      symptoms: ['Malfunction indicator lamp', 'Wrench warning lamp', 'Erratic or unexpected transmission behavior associated with output-speed-sensor loss'],
      affectedSystems: ['6R80 transmission molded leadframe', 'output shaft speed sensor'],
      dtcCodes: ['P0720', 'P0722', 'P0731', 'P1500'],
      sources: [tsb('Ford Customer Satisfaction Program 19N01 - 6R80 Molded Leadframe', 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10162411-0001.pdf')],
      summary:
        'Narrowed the frozen 2011-2020 P0700 aggregation to the exact 2011-2013 6R80 molded-leadframe program, documented DTCs, and historically limited coverage.',
    },
    'Retain the exact 19N01 molded-leadframe condition; generic P0700 is not a component diagnosis and the frozen ten-year population was unsupported.',
  ),

  'ford-f-150-positive-battery-cable-bms-terminal-connection-loosens-stall': replacement(
    {
      years: [2019, 2020],
      trims: ['Certain vehicles identified by VIN'],
      engines: [],
      category: 'electrical',
      title: 'Recall 19S40: Positive Battery-Terminal Joint Can Loosen',
      description:
        'NHTSA campaign 19V805 covers certain 2019-2020 F-150 trucks. The fastener securing the power-distribution-box cable and battery-monitoring-system eyelets to the positive battery terminal can loosen, affecting displays, steering or brake assist, causing an engine stall, or creating a resistive short and fire risk.',
      solution:
        'Check the VIN for Ford recall 19S40. A Ford dealer will inspect the positive-terminal joint for excess sealant adhesive, remove excess material when present, reassemble the joint, and retorque the fastener as necessary free of charge.',
      severity: 'high',
      symptoms: ['Engine stall', 'Instrument display faults', 'Reduced steering or brake assist', 'Possible overheating at the positive battery connection'],
      affectedSystems: ['positive battery-terminal joint', 'Power Distribution Box cable', 'Battery Monitoring System eyelets'],
      sources: [recall('NHTSA Campaign 19V805 / Ford Recall 19S40', nhtsa2019)],
      summary:
        'Retained the exact 2019-2020 battery-terminal-joint safety recall, potential system effects, and dealer inspection/reassembly remedy.',
    },
    'Retain the exact NHTSA 19V805 recall and remove universal cable-replacement claims.',
  ),

  'ford-f-150-rear-axle-hub-bolt-fatigues-breaks-vehicle-rollaway-park-los': replacement(
    {
      years: [2023, 2024, 2025],
      trims: ['Trailer Tow Max Duty package with 9.75-inch heavy-duty 3/4-float rear axle; verify VIN'],
      engines: [],
      category: 'drivetrain',
      title: 'Recall 25S82: Rear-Axle Hub Bolt Can Fatigue and Break',
      description:
        'NHTSA campaign 25V512 covers certain 2023-2025 F-150 trucks with the Trailer Tow Max Duty package and 9.75-inch heavy-duty axle using a 3/4-float design. A rear hub bolt can fatigue and break, allowing spline damage that can cause loss of drive power or vehicle rollaway while in Park without the parking brake applied.',
      solution:
        'Check the VIN for Ford recall 25S82 and apply the parking brake whenever parked. Ford dealers replace both rear axle-shaft assemblies free of charge. This campaign expands earlier NHTSA campaign 23V896.',
      severity: 'high',
      symptoms: ['Clicking or rattling near a rear wheel', 'Loss of drive power', 'Vehicle rollaway while in Park without the parking brake applied'],
      affectedSystems: ['rear axle hub bolts', 'rear axle-shaft assemblies', 'rear hub splines'],
      sources: [
        recall('NHTSA Campaign 25V512 / Ford Recall 25S82', nhtsa2025),
        recall('NHTSA Campaign 23V896 - Earlier Rear-Axle Hub-Bolt Population', 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V896-5481.PDF'),
      ],
      summary:
        'Updated the card to the 2025 expansion\'s exact equipment, 2023-2025 population, rollaway/loss-of-drive risk, and both-axle-shaft dealer remedy.',
    },
    'Retain the latest expanded NHTSA 25V512 campaign rather than the frozen card\'s incomplete and partly outdated remedy.',
  ),

  'ford-f-150-rearview-camera-image-freezes-blacks-out-delays-when-reversi': replacement(
    {
      years: [2021, 2022, 2023, 2024],
      trims: ['Certain vehicles identified by VIN'],
      engines: [],
      category: 'electrical',
      title: 'Recall 25S49: Rearview Camera Image Can Delay, Freeze, or Disappear',
      description:
        'NHTSA campaign 25V315 covers certain 2021-2024 F-150 trucks. An APIM/SYNC software error can make the rearview camera image delay, freeze, or fail to display while the vehicle is in Reverse, reducing the driver\'s view behind the truck.',
      solution:
        'Check the VIN for Ford recall 25S49. Ford updates the accessory protocol interface module software at a dealer or through an over-the-air update free of charge. Confirm campaign applicability before replacing camera hardware.',
      severity: 'high',
      symptoms: ['Delayed rearview image', 'Frozen rearview image', 'Missing rearview image while in Reverse'],
      affectedSystems: ['rearview camera display', 'SYNC software', 'Accessory Protocol Interface Module'],
      sources: [recall('NHTSA Campaign 25V315 / Ford Recall 25S49', 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V315-4242.PDF')],
      summary:
        'Replaced the generic camera-failure entry with the exact 2021-2024 software recall and APIM software-update remedy.',
    },
    'Retain the exact NHTSA 25V315 recall and remove speculative camera, wiring, and APIM replacement advice.',
  ),

  'ford-f-150-speed-control-deactivation-switch-underhood-fire': replacement(
    {
      years: [1997, 1998, 1999, 2000, 2001, 2002],
      trims: ['Campaign population varies by model year and equipment; verify VIN'],
      engines: [],
      category: 'electrical',
      title: 'Speed-Control Deactivation Switch Fire Recalls',
      description:
        'Ford safety campaigns included certain F-150 trucks whose speed-control deactivation switch could leak brake fluid internally. Corrosion and electrical resistance could overheat the switch and cause an underhood fire, including while the vehicle was parked.',
      solution:
        'Check the VIN for all open Ford speed-control deactivation switch recalls before relying on a model-year list. Follow current Ford/NHTSA interim guidance. Campaign procedures used a fused jumper harness and, when leakage or damage was present, switch replacement and related inspection. Recall service is performed by a Ford dealer.',
      severity: 'high',
      symptoms: ['Possible smoke or burning odor near the speed-control deactivation switch', 'Underhood fire can occur without warning'],
      affectedSystems: ['speed-control deactivation switch', 'speed-control wiring', 'brake-fluid interface'],
      sources: [recall('NHTSA Campaign 05V388 / Ford Recall 05S28', 'https://static.nhtsa.gov/odi/rcl/2005/RCDNN-05V388-9228.PDF')],
      summary:
        'Retained one VIN-gated speed-control-switch fire card and removed the duplicate 2004-only card and do-it-yourself parts advice.',
    },
    'Retain one primary-source, VIN-gated speed-control-switch recall entry and consolidate the duplicate cruise-control fire card.',
  ),

  'ford-f-150-sync-2-sync-3-apim-failure-black-screen-freezing-reboot-loop': replacement(
    {
      years: [2016, 2017, 2018],
      trims: ['Vehicles equipped with SYNC 3'],
      engines: [],
      category: 'electrical',
      title: 'SYNC 3 Performance and Stability Concerns',
      description:
        'Ford TSB 20-2363 covers some 2016-2018 F-150 trucks equipped with SYNC 3. Documented concerns include an unresponsive or frozen touchscreen, intermittent audio or Bluetooth issues, Wi-Fi prompts, AppLink or Apple CarPlay problems, and other listed SYNC performance symptoms.',
      solution:
        'Confirm that the truck has SYNC 3 and match the symptom to the bulletin before replacing hardware. Follow Ford\'s service procedure and current software path. The bulletin does not establish that every black screen or reboot requires APIM replacement.',
      severity: 'low',
      symptoms: ['Frozen or unresponsive touchscreen', 'Intermittent Bluetooth audio echo', 'AppLink or Apple CarPlay problems', 'Recurring Wi-Fi prompt or infotainment application issue'],
      affectedSystems: ['SYNC 3', 'Accessory Protocol Interface Module', 'center touchscreen'],
      sources: [tsb('Ford TSB 20-2363 - SYNC 3 Performance Concerns', 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10179117-0001.pdf')],
      summary:
        'Narrowed the frozen SYNC 2/SYNC 3 hardware-failure aggregation to Ford\'s exact 2016-2018 SYNC 3 performance bulletin and software-led diagnosis.',
    },
    'Retain only the documented SYNC 3 performance population; the frozen card mixed SYNC generations and treated varied symptoms as universal APIM hardware failure.',
  ),

  'ford-f-150-warped-cracked-dashboard-defrost-vents-xl-xlt-instrument-pan': replacement(
    {
      years: [2015, 2016, 2017, 2018, 2019],
      trims: ['XL', 'XLT'],
      engines: [],
      category: 'interior',
      title: 'XL/XLT Instrument Panel Can Warp at the Defrost Vents',
      description:
        'Ford TSB 19-2041 covers some 2015-2019 F-150 XL and XLT trucks whose instrument panel upper section warps or separates around the defrost vents.',
      solution:
        'Confirm the trim and exact separation location. Ford directs replacement of the instrument-panel upper section for the documented condition; the bulletin does not cover every dashboard crack or cosmetic defect.',
      severity: 'low',
      symptoms: ['Warping at the defrost vents', 'Instrument-panel separation at the defrost vents'],
      affectedSystems: ['instrument-panel upper section', 'defrost vent area'],
      sources: [tsb('Ford TSB 19-2041 - Instrument Panel Warping at Defrost Vents', 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10155554-9999.pdf')],
      summary:
        'Narrowed the frozen 2015-2020 all-trim card to Ford\'s exact 2015-2019 XL/XLT defrost-vent warping condition and upper-panel replacement.',
    },
    'Retain the exact Ford TSB 19-2041 population and remove universal dashboard-kit recommendations.',
  ),
};

const reasons = {
  'ford-f-150-5-0l-coyote-excessive-oil-consumption-from-deceleration-fuel':
    'This duplicates the retained 5.0L oil-consumption card, but its cited Ford document MC-10175884 concerns 2017-2019 3.5L EcoBoost PCV/valve-cover service rather than the asserted 5.0L condition.',
  'ford-f-150-6r80-6-speed-automatic-harsh-1-2-upshift-erratic-shifting-le':
    'The frozen card aggregates harsh shifts, leadframe faults, valve-body wear, torque-converter shudder, complete failure, and multiple unrelated repair paths across 2009-2017. The retained 19N01 card isolates the exact 2011-2013 molded-leadframe condition.',
  'ford-f-150-brake-master-cylinder-fluid-leak-loss-front-brake-function':
    'This duplicates the consolidated master-cylinder recall card. The retained entry covers the campaign-specific 2013-2018 population and latest NHTSA expansion without implying every listed truck is affected.',
  'ford-f-150-cruise-control-deactivation-switch-fire-risk':
    'This one-year card duplicates the retained VIN-gated speed-control deactivation switch recall entry and does not represent the campaign population accurately.',
  'ford-f-150-f-150-lightning-high-voltage-battery-cell-defect-internal-sh':
    'The frozen snapshot has a separate Ford F-150 Lightning model that will receive its own complete audit. Keeping this battery card under gasoline/hybrid F-150 would duplicate and misclassify the vehicle population.',
  'ford-f150-10speed-shudder-2017':
    'This is a duplicate of the retained Ford TSB 23-2250 10R80 card and broadens the bulletin into an unsupported torque-converter-shudder diagnosis.',
  'ford-f150-blend-door-2015':
    'The only citation is a fabricated-looking placeholder YouTube URL. No Ford primary source reviewed supports one blend-door actuator failure and repair across every 2015-2020 truck.',
  'ford-f150-cam-phaser-2018':
    'This duplicates the retained Ford cold-start-rattle card and relies on a fabricated-looking placeholder YouTube URL. The retained card uses Ford\'s exact 2011-2015 TSB population.',
};

module.exports = buildConfig({
  label: 'Ford F-150',
  make: 'Ford',
  model: 'F-150',
  slug: 'ford-f-150',
  batchId: 'ford-f-150-full-record-cohort-114-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'fd47885c9a36703c4d6125cdfbc26e05bae13e37b6bf4b26a8d1a58db411fb88',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-150/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf150_blind:manual-primary-source-gate',
    edge: 'fordf150_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
