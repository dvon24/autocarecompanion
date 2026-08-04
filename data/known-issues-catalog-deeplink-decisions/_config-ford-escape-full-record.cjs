const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
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

function recallSource(campaign, year, title) {
  return {
    type: 'recall',
    title: `NHTSA Recall ${campaign} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Escape&modelYear=${year}`,
  };
}

const crackedInjector = {
  years: [2020, 2021, 2022],
  trims: ['Vehicles covered by recall 25V467 / Ford 25S76'],
  engines: ['1.5L engine'],
  category: 'fuel',
  title: 'Cracked 1.5L Fuel Injector Can Leak Fuel and Increase Fire Risk',
  description:
    'NHTSA recall 25V467 covers certain 2020-2022 Escape vehicles with the 1.5L engine. A fuel injector may crack and leak fuel into the engine compartment, where hot engine or exhaust components can provide an ignition source.',
  solution:
    'Have a Ford dealer check the VIN for recall 25S76. Ford directs dealers to update engine-control software and replace the high-pressure fuel rail assembly and injectors free of charge; the software update was also offered as an interim repair while final parts became available.',
  severity: 'high',
  symptoms: ['Fuel odor', 'Fuel leaking in the engine compartment', 'Smoke or fire from the engine compartment'],
  affectedSystems: ['high-pressure fuel injectors', 'fuel rail assembly', 'engine control software'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'Ford Recall 25S76 - Cracked Fuel Injector and Underhood Fire Risk',
      url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/25s76-bronco-sport-2021-2024-and-escape-2020-2022-cracked-fuel-injector-and-underhood-fire-risk-recall/',
    },
    recallSource('25V467', 2020, 'Cracked 1.5L Fuel Injector'),
  ],
  summary:
    'Corrected the Escape population to 2020-2022 and rebuilt the card around the superseding 25V467/25S76 recall, including Ford\'s final fuel-rail and injector remedy without unsupported leak-rate or incident claims.',
};

const coolant15 = {
  years: [2017, 2018, 2019],
  trims: ['Vehicles built on or before April 8, 2019'],
  engines: ['1.5L EcoBoost'],
  category: 'engine',
  title: '1.5L EcoBoost Coolant Intrusion Into a Cylinder',
  description:
    'Ford TSB 20-2100 covers some 2017-2019 Escape vehicles with the 1.5L EcoBoost engine that exhibit low coolant, white exhaust smoke, or rough running, with or without the malfunction indicator lamp. Ford identifies coolant intrusion into a cylinder as the cause.',
  solution:
    'Have a Ford dealer or qualified engine technician follow the bulletin diagnosis. If the documented condition is confirmed, Ford directs replacement of the short block and head gasket. This bulletin does not cover 2020-2022 three-cylinder Escape engines.',
  severity: 'high',
  symptoms: ['Low engine-coolant level', 'White exhaust smoke', 'Rough-running engine', 'Malfunction indicator lamp may illuminate'],
  affectedSystems: ['1.5L EcoBoost short block', 'head gasket', 'engine cylinders', 'engine cooling system'],
  dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0316', 'P0217', 'P1285', 'P1299'],
  sources: [{ type: 'tsb', title: 'Ford TSB 20-2100 - 1.5L EcoBoost Coolant Intrusion', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174400-0001.pdf' }],
  summary:
    'Narrowed the frozen six-year, two-engine aggregation to Ford TSB 20-2100\'s exact 2017-2019 1.5L EcoBoost population, symptoms, DTCs, diagnosis, and short-block/head-gasket repair.',
};

const coolant20 = {
  years: [2017, 2018, 2019],
  trims: [],
  engines: ['2.0L EcoBoost'],
  category: 'engine',
  title: '2.0L EcoBoost Coolant Intrusion Into a Cylinder',
  description:
    'Ford TSB 19-2346 covers some 2017-2019 Escape vehicles with the 2.0L EcoBoost engine that exhibit low coolant, white exhaust smoke, or rough running, with or without the malfunction indicator lamp. Ford identifies coolant intrusion into a cylinder as the cause.',
  solution:
    'Have a Ford dealer or qualified engine technician follow the bulletin inspection procedure. If coolant intrusion is confirmed, Ford directs replacement of the long-block engine assembly.',
  severity: 'high',
  symptoms: ['Low engine-coolant level', 'White exhaust smoke', 'Rough-running engine', 'Malfunction indicator lamp may illuminate'],
  affectedSystems: ['2.0L EcoBoost long-block engine', 'engine cylinders', 'engine cooling system'],
  dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0316', 'P0217', 'P1285', 'P1299'],
  sources: [{ type: 'tsb', title: 'Ford TSB 19-2346 - 2.0L EcoBoost Coolant Intrusion', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10169807-0001.pdf' }],
  summary:
    'Corrected the Escape scope from 2015-2019 to 2017-2019 and retained only Ford\'s documented 2.0L EcoBoost coolant-in-cylinder symptoms, DTCs, and long-block remedy.',
};

const hybridEngineFire = {
  years: [2020, 2021, 2022, 2023],
  trims: ['Hybrid and plug-in hybrid vehicles covered by recall 23V380 / Ford 23S27'],
  engines: ['2.5L HEV', '2.5L PHEV'],
  category: 'engine',
  title: 'Hybrid Engine Failure Can Release Oil or Fuel Vapor and Increase Fire Risk',
  description:
    'NHTSA recall 23V380 covers certain 2020-2023 Escape vehicles with 2.5L HEV or PHEV engines. An engine failure can release oil and fuel vapor into the engine compartment, where it may accumulate near hot engine or exhaust components and ignite.',
  solution:
    'If unexpected engine noise, reduced power, or smoke appears, park and shut off the engine as soon as it is safe. Have a Ford dealer check recall 23S27. The recall remedy includes powertrain-control software and, when connecting-rod bearing failure is detected, long-block replacement; Ford specifies long-block replacement for covered 2023 Escape vehicles.',
  severity: 'high',
  symptoms: ['Unexpected engine noise', 'Reduced vehicle power', 'Smoke from the engine compartment'],
  affectedSystems: ['2.5L hybrid engine long block', 'connecting-rod bearings', 'powertrain control software'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'Ford Recall 23S27 - Escape Hybrid Engine Failure and Fire Risk',
      url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/23s27-escape-2020-2023-and-maverick-2022-2023-engine-failure-recall/',
    },
    recallSource('23V380', 2020, 'Hybrid Engine Failure and Fire Risk'),
  ],
  summary:
    'Rebuilt the card around NHTSA 23V380/Ford 23S27, preserving the exact HEV/PHEV population, warning signs, fire mechanism, and staged software/engine remedy.',
};

const absConnector = {
  years: [2001, 2002, 2003, 2004],
  trims: ['Vehicles equipped with antilock brakes and covered by recall 07V156'],
  engines: [],
  category: 'brakes',
  title: 'ABS Module Connector Contamination Can Cause a Short and Fire',
  description:
    'NHTSA recall 07V156 covers certain 2001-2004 Escape vehicles equipped with ABS. Missing or displaced wire seals can allow contamination into the ABS module connector, creating a potential electrical short. The ABS warning lamp may illuminate and the module can overheat, producing a burning odor, smoke, or fire even with the ignition off.',
  solution:
    'Have a Ford dealer check the VIN and inspect the ABS-module harness connector and seals. The recall remedy is to repair or replace the harness connector as appropriate and replace the ABS module if its connector is corroded or damaged.',
  severity: 'high',
  symptoms: ['ABS warning lamp', 'Burning odor', 'Smoke near the ABS module', 'Underhood fire'],
  affectedSystems: ['ABS module connector', 'ABS wiring-harness seals'],
  dtcCodes: [],
  sources: [recallSource('07V156', 2001, 'ABS Module Connector Electrical Short')],
  summary:
    'Replaced the unsupported brake-fluid-leak claim with recall 07V156\'s actual defect: contaminated ABS connector seals, electrical short, ABS warning, overheating, smoke, or fire.',
};

const ptuSeal = {
  years: [2013, 2014, 2015, 2016, 2017, 2018],
  trims: ['All-wheel-drive vehicles equipped with a listed EcoBoost engine'],
  engines: ['1.5L EcoBoost', '1.6L EcoBoost', '2.0L EcoBoost'],
  category: 'drivetrain',
  title: 'PTU Intermediate-Shaft Seal Can Leak Dark Fluid on AWD Models',
  description:
    'Ford TSB 18-2250 covers some 2013-2018 Escape AWD vehicles with 1.5L, 1.6L, or 2.0L EcoBoost engines that exhibit a dark black fluid leak from the right side of the power transfer unit at the intermediate-shaft seal.',
  solution:
    'Have a Ford dealer or qualified driveline technician identify the leak source and follow the bulletin procedure for the PTU intermediate-shaft seal. The bulletin does not establish PTU overheating or internal failure from generic noise, odor, or AWD warnings.',
  severity: 'medium',
  symptoms: ['Dark black fluid leaking from the right side of the PTU intermediate-shaft seal'],
  affectedSystems: ['power transfer unit', 'right intermediate-shaft seal'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 18-2250 - PTU Intermediate-Shaft Seal Leak', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10144919-9999.pdf' }],
  summary:
    'Narrowed the seven-year PTU failure aggregation to Ford TSB 18-2250\'s exact 2013-2018 EcoBoost AWD seal-leak condition and removed unsupported overheating and internal-failure claims.',
};

const acceleratorCable = {
  years: [2002, 2003, 2004],
  trims: ['Vehicles covered by recall 04V574'],
  engines: ['3.0L V6'],
  category: 'engine',
  title: 'Accelerator Cable Can Prevent the Throttle From Returning to Idle',
  description:
    'NHTSA recall 04V574 covers certain 2002-2004 Escape vehicles with the 3.0L V6. The accelerator cable may prevent the throttle from returning to idle, which can unexpectedly increase engine idle speed and stopping distance.',
  solution:
    'Have a Ford dealer check the VIN for recall completion. The recall remedy is replacement of the accelerator cable free of charge.',
  severity: 'high',
  symptoms: ['Throttle does not return to idle', 'Unexpectedly high engine idle speed', 'Increased stopping distance'],
  affectedSystems: ['accelerator cable', 'throttle control'],
  dtcCodes: [],
  sources: [recallSource('04V574', 2002, 'Accelerator Cable and Stuck Throttle')],
  summary:
    'Corrected the frozen cruise-control wording and scope to recall 04V574\'s 2002-2004 3.0L V6 accelerator-cable defect and cable-replacement remedy.',
};

const cylinderHeadBallPlug = {
  years: [2023, 2024, 2025],
  trims: ['Vehicles covered by recall 25V372 / Ford 25S61'],
  engines: ['1.5L EcoBoost'],
  category: 'engine',
  title: 'Cylinder-Head Ball Plug Failure Can Leak Oil and Cause Power Loss or Fire',
  description:
    'NHTSA recall 25V372 covers certain 2023-2025 Escape vehicles. An improperly manufactured cylinder head can allow a ball plug to fail and leak oil, which may cause a loss of drive power or ignite near hot engine or exhaust components.',
  solution:
    'Have a Ford dealer check the VIN for recall 25S61. Dealers inspect the vehicle and replace the cylinder-head assembly as necessary free of charge.',
  severity: 'high',
  symptoms: ['Engine oil leak', 'Loss of drive power', 'Smoke or fire from the engine compartment'],
  affectedSystems: ['cylinder-head ball plugs', 'cylinder-head assembly', 'engine lubrication system'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall 25V372 Recall Acknowledgement', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V372-6845.pdf' },
    recallSource('25V372', 2023, 'Cylinder-Head Ball Plug Failure'),
  ],
  summary:
    'Rebuilt the card solely from NHTSA recall 25V372, preserving its exact model years, oil-leak mechanism, drive-power/fire risks, and cylinder-head inspection/replacement remedy.',
};

const doorLatch = {
  years: [2013, 2014, 2015],
  trims: ['Vehicles covered by recall 16V643 or the 20V331 re-recall'],
  engines: [],
  category: 'body',
  title: 'Side-Door Latch Component Can Break and Allow a Door to Open',
  description:
    'NHTSA recall 16V643 covers certain 2013-2015 Escape vehicles whose door-latch component may break, preventing a door from latching or making it appear securely closed when it is not. Recall 20V331 covers vehicles whose earlier latch repair may not have been completed correctly.',
  solution:
    'Have a Ford dealer check the VIN for recalls 16S30 and 20S30. The original remedy replaces the door latches with improved parts; the later campaign inspects latch date codes and replaces side-door latches when necessary.',
  severity: 'high',
  symptoms: ['Door is difficult or impossible to latch', 'Door appears closed but is not securely latched', 'Door may open while driving'],
  affectedSystems: ['side-door latch assemblies'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall 16V643 Manufacturer Communication', url: 'https://static.nhtsa.gov/odi/rcl/2016/RMISC-16V643-6918.pdf' },
    recallSource('20V331', 2015, 'Door-Latch Reinspection and Repair'),
  ],
  summary:
    'Retained the exact 2013-2015 latch defect and added the primary-source 20V331 re-recall context without carrying over unrelated engine or trim claims.',
};

const decelerationStall = {
  years: [2001, 2002, 2003],
  trims: ['Vehicles covered by recall 04V165'],
  engines: ['3.0L V6'],
  category: 'engine',
  title: '3.0L V6 Engine Can Stall During Deceleration',
  description:
    'NHTSA recall 04V165 covers certain 2001-2003 Escape vehicles with the 3.0L V6 whose engine can stall during deceleration, increasing crash risk.',
  solution:
    'Have a Ford dealer check the VIN for recall completion. The recall remedy is reprogramming the powertrain control module with the appropriate calibration.',
  severity: 'high',
  symptoms: ['Engine stalls while decelerating', 'Loss of engine power during deceleration'],
  affectedSystems: ['powertrain control module calibration', '3.0L V6 engine controls'],
  dtcCodes: [],
  sources: [recallSource('04V165', 2001, '3.0L V6 Deceleration Stall')],
  summary:
    'Converted the unsupported general stalling/misfire card into recall 04V165\'s exact 2001-2003 3.0L V6 deceleration-stall condition and PCM reprogramming remedy.',
};

const doorCheckArm = {
  years: [2020, 2021],
  trims: [],
  engines: [],
  category: 'body',
  title: 'Left Front Door Check-Arm Spot Welds Can Crack or Break',
  description:
    'Ford service message 22-2089 covers some 2020-2021 Escape vehicles with cracked or broken spot welds in the left front door at the check-arm attachment point. Ford notes the condition was reported on some high-usage fleet vehicles.',
  solution:
    'Have a Ford dealer or qualified body technician inspect the left front door and check-arm attachment. Ford identifies door-assembly replacement as the appropriate repair and points technicians to Workshop Manual section 501-03.',
  severity: 'medium',
  symptoms: ['Cracked or broken spot welds at the left front door check-arm attachment', 'Door check-arm attachment separates from the door assembly'],
  affectedSystems: ['left front door assembly', 'door check arm', 'check-arm spot welds'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford SSM 22-2089 - Escape Door Check-Arm Spot Welds', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10234590-0001.pdf' }],
  summary:
    'Replaced secondary lemon-law citations with Ford\'s exact service communication for 2020-2021 left-front-door check-arm spot-weld cracking and door-assembly replacement.',
};

const subframeCorrosion = {
  years: [2001, 2002, 2003, 2004],
  trims: ['Vehicles originally sold or registered in recall 14V165 corrosion states'],
  engines: [],
  category: 'suspension',
  title: 'Front Lower-Control-Arm Attachment Can Corrode and Separate',
  description:
    'NHTSA recall 14V165 covers certain 2001-2004 Escape vehicles in specified corrosion states. Excessive corrosion at the front lower-control-arm attachment can allow the arm to separate and cause a significant loss of steering control.',
  solution:
    'Have a Ford dealer check the VIN for recall 14S02. The recall remedy is installation of a redesigned reinforcement cross-brace free of charge.',
  severity: 'high',
  symptoms: ['Corrosion at the front lower-control-arm attachment', 'Lower control arm may separate', 'Loss of steering control'],
  affectedSystems: ['front subframe', 'front lower-control-arm attachment', 'reinforcement cross-brace'],
  dtcCodes: [],
  sources: [recallSource('14V165', 2001, 'Lower-Control-Arm Attachment Corrosion')],
  summary:
    'Rebuilt the card around recall 14V165, including its 2001-2004 salt-state population, lower-control-arm separation risk, and cross-brace remedy.',
};

const hybridNeutral = {
  years: [2020, 2021, 2022],
  trims: ['Hybrid vehicles covered by recall 24V330 / Ford 24S33'],
  engines: ['2.5L hybrid powertrain'],
  category: 'drivetrain',
  title: 'Hybrid Control Software Can Shift the Vehicle Into Neutral Unexpectedly',
  description:
    'NHTSA recall 24V330 covers certain 2020-2022 Escape vehicles. Hybrid Powertrain Control Module software can cause an unexpected shift into neutral and loss of drive power.',
  solution:
    'Have a Ford dealer check the VIN for recall 24S33. Dealers update the Hybrid Powertrain Control Module software free of charge.',
  severity: 'high',
  symptoms: ['Unexpected shift into neutral', 'Sudden loss of drive power'],
  affectedSystems: ['Hybrid Powertrain Control Module software', 'hybrid drivetrain'],
  dtcCodes: [],
  sources: [recallSource('24V330', 2020, 'Unexpected Neutral and Loss of Drive Power')],
  summary:
    'Replaced secondary summaries with NHTSA recall 24V330\'s exact 2020-2022 Escape software defect, loss-of-power risk, and HPCM update remedy.',
};

const liftgateHingeCover = {
  years: [2020, 2021, 2022, 2025],
  trims: ['Vehicles covered by recall 25V829 / Ford 25SD6'],
  engines: [],
  category: 'body',
  title: 'Liftgate Hinge Covers Can Detach and Become a Road Hazard',
  description:
    'NHTSA recall 25V829 covers certain 2020-2022 and 2025 Escape vehicles. Improperly secured liftgate hinge covers can detach, distract other drivers, or become a road hazard.',
  solution:
    'Have a Ford dealer check the VIN for recall 25SD6. Dealers inspect and reinstall the hinge covers or replace missing covers as necessary free of charge.',
  severity: 'medium',
  symptoms: ['Loose liftgate hinge cover', 'Missing liftgate hinge cover', 'Hinge cover detaches while driving'],
  affectedSystems: ['liftgate hinge covers', 'liftgate hinge attachments'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall Report 25V829 - Liftgate Hinge Covers', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V829-2637.pdf' },
    recallSource('25V829', 2020, 'Liftgate Hinge Cover Detachment'),
  ],
  summary:
    'Removed secondary news citations and retained NHTSA recall 25V829\'s exact discontiguous model years, detachment hazard, and inspection/reinstallation remedy.',
};

const vctSolenoid = {
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021],
  trims: [],
  engines: [],
  category: 'engine',
  title: 'Debris Can Temporarily Stick a VCT Solenoid and Set Cam-Timing DTCs',
  description:
    'Ford service message 21-2151 applies to listed 2015-2021 Ford and Lincoln vehicles, including Escape. Small debris can cause a variable-camshaft-timing solenoid to stick and illuminate the malfunction indicator lamp with one or more listed cam-timing DTCs.',
  solution:
    'Before replacing a VCT solenoid, have a Ford dealer or qualified technician follow Powertrain Control and Emissions Diagnosis pinpoint test HK11 and cycle the affected solenoid ten times to try to clear the debris. Further diagnosis is required if the condition remains.',
  severity: 'medium',
  symptoms: ['Malfunction indicator lamp', 'One or more documented cam-timing DTCs'],
  affectedSystems: ['variable camshaft timing solenoids', 'engine oil control passages'],
  dtcCodes: ['P0011', 'P0012', 'P0014', 'P0015', 'P0016', 'P0017', 'P0018', 'P0019', 'P0021', 'P0022', 'P0024', 'P0025'],
  sources: [{ type: 'tsb', title: 'Ford SSM 21-2151 - VCT Solenoid Debris and Cam-Timing DTCs', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194428-0001.pdf' }],
  summary:
    'Replaced generic diagnostic-site claims with Ford\'s exact VCT service message, preserving only the documented 2015-2021 scope, DTC set, debris mechanism, and pre-replacement cycling step.',
};

const torqueConverter = {
  years: [2013, 2014, 2015],
  trims: [],
  engines: ['1.6L EcoBoost'],
  category: 'transmission',
  title: 'Internal Torque-Converter Damage Can Set P0741 or P1744',
  description:
    'Ford TSB 19-2139 covers some 2013-2015 Escape vehicles with the 1.6L EcoBoost engine that have an illuminated malfunction indicator lamp or a Transmission Malfunction Service Now warning with only P0741 and/or P1744 stored. Ford identifies internal torque-converter damage as the cause.',
  solution:
    'Have a Ford dealer or qualified transmission technician confirm that only the bulletin\'s listed DTCs and symptoms are present, then follow the service procedure to repair or replace the affected internal transmission components.',
  severity: 'high',
  symptoms: ['Malfunction indicator lamp', 'Transmission Malfunction Service Now warning'],
  affectedSystems: ['torque converter', 'internal transmission components'],
  dtcCodes: ['P0741', 'P1744'],
  sources: [{ type: 'tsb', title: 'Ford TSB 19-2139 - P0741/P1744 From Torque-Converter Damage', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159457-0001.pdf' }],
  summary:
    'Narrowed the eight-year multi-engine P0741 diagnosis to Ford TSB 19-2139\'s exact 2013-2015 1.6L EcoBoost population, warning indications, DTC pair, and internal transmission repair.',
};

const phevBattery = {
  years: [2020, 2021, 2022, 2023, 2024],
  trims: ['Plug-in hybrid vehicles covered by recall 24V954 / Ford 24S79'],
  engines: ['2.5L PHEV'],
  category: 'electrical',
  title: 'PHEV Battery-Cell Defect Can Cause Power Loss or Fire',
  description:
    'NHTSA recall 24V954 covers certain 2020-2024 Escape plug-in hybrids. A manufacturing defect in one or more high-voltage battery cells can cause an internal short circuit and battery failure, resulting in loss of drive power or fire risk.',
  solution:
    'Do not charge the high-voltage battery until the recall remedy is complete. Have a Ford dealer check recall 24S79; dealers update Battery Energy Control Module software and replace the high-voltage battery pack as necessary free of charge.',
  severity: 'high',
  symptoms: ['High-voltage battery warning', 'Loss of drive power', 'Battery overheating, smoke, or fire'],
  affectedSystems: ['high-voltage battery cells', 'high-voltage battery pack', 'Battery Energy Control Module'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'Ford Recall 24S79 - Escape PHEV Battery Software and Pack Remedy',
      url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/24s79-escape-phev-2020-2024-battery-ecm-software-update-recall/',
    },
    recallSource('24V954', 2020, 'PHEV High-Voltage Battery Internal Short'),
  ],
  summary:
    'Removed secondary and forum citations and retained recall 24V954/24S79\'s exact PHEV population, cell-short failure mode, no-charge instruction, software update, and conditional pack replacement.',
};

const rearviewCamera = {
  years: [2022, 2023, 2024, 2025],
  trims: ['Vehicles covered by recall 25V315 / Ford 25S49'],
  engines: [],
  category: 'electrical',
  title: 'APIM Software Can Delay, Freeze, or Blank the Rearview Camera Image',
  description:
    'NHTSA recall 25V315 covers certain 2022-2025 Escape vehicles. An Accessory Protocol Interface Module software error can delay, freeze, or prevent the rearview-camera image from displaying while the vehicle is in reverse.',
  solution:
    'Have a Ford dealer check the VIN for recall 25S49. The APIM software is updated by a dealer or through an over-the-air update free of charge.',
  severity: 'high',
  symptoms: ['Rearview image is delayed', 'Rearview image freezes', 'Rearview image does not display in reverse'],
  affectedSystems: ['Accessory Protocol Interface Module software', 'rearview camera display'],
  dtcCodes: [],
  sources: [recallSource('25V315', 2023, 'Rearview Camera Image Delay, Freeze, or Blank Display')],
  summary:
    'Replaced three secondary articles with NHTSA recall 25V315, expanded the Escape scope to the exact 2022-2025 population, and preserved only the documented APIM software symptoms and remedy.',
};

const wiperLinkage = {
  years: [2001],
  trims: ['Vehicles covered by recall 00V387'],
  engines: [],
  category: 'body',
  title: 'Windshield-Wiper Linkage Ball Socket Can Break and Disengage',
  description:
    'NHTSA recall 00V387 covers certain 2001 Escape vehicles. A broken ball socket can allow the windshield-wiper linkage to disengage, causing sudden loss of all wiper operation or driver-side wiper operation.',
  solution:
    'Have a Ford dealer check recall completion and inspect the wiper linkage. The recall remedy is replacement of the wiper module when necessary.',
  severity: 'high',
  symptoms: ['Sudden complete loss of windshield-wiper operation', 'Sudden loss of driver-side wiper operation'],
  affectedSystems: ['windshield-wiper linkage', 'linkage ball socket', 'wiper module'],
  dtcCodes: [],
  sources: [recallSource('00V387', 2001, 'Windshield-Wiper Linkage Separation')],
  summary:
    'Added the missing primary source and rebuilt the card around recall 00V387\'s exact 2001 linkage ball-socket defect, visibility risk, and wiper-module remedy.',
};

const published = {
  'ford-escape-1-5l-ecoboost-cracked-fuel-injector-leaking-fuel-onto-hot-en': replacement(crackedInjector, 'Retain the current cracked-injector safety issue, corrected to the superseding 25V467/25S76 scope and final remedy.'),
  'ford-escape-15-ecoboost-coolant-intrusion-2017': replacement(coolant15, 'Retain only Ford TSB 20-2100\'s exact 2017-2019 1.5L EcoBoost coolant-intrusion condition.'),
  'ford-escape-20-ecoboost-coolant-2015': replacement(coolant20, 'Retain only Ford TSB 19-2346\'s exact 2017-2019 2.0L EcoBoost coolant-intrusion condition.'),
  'ford-escape-25-hybrid-engine-fire-2020': replacement(hybridEngineFire, 'Retain NHTSA 23V380/Ford 23S27 with its exact hybrid population, fire mechanism, warnings, and remedy.'),
  'ford-escape-abs-module-brake-fluid-leak-and-underhood-fire-risk': replacement(absConnector, 'Retain the underlying recall card only after correcting the defect from a brake-fluid leak to ABS connector contamination and electrical short.'),
  'ford-escape-awd-power-transfer-unit-overheating-fluid-leak-failure': replacement(ptuSeal, 'Retain the primary-source PTU seal leak only within TSB 18-2250\'s exact 2013-2018 EcoBoost AWD scope.'),
  'ford-escape-cruise-control-cable-throttle-sticking-and-unintended-acceleration': replacement(acceleratorCable, 'Retain the safety issue as recall 04V574\'s 2002-2004 3.0L accelerator-cable defect, not a four-year cruise-control aggregation.'),
  'ford-escape-cylinder-head-ball-plug-ejection-causing-oil-leak-fire-engin': replacement(cylinderHeadBallPlug, 'Retain NHTSA recall 25V372\'s exact cylinder-head ball-plug defect and remedy.'),
  'ford-escape-door-latch-2013': replacement(doorLatch, 'Retain the 2013-2015 side-door latch defect with both the original and re-recall context.'),
  'ford-escape-engine-stalling-misfire-and-loss-of-power': replacement(decelerationStall, 'Retain a precise stalling card only for recall 04V165\'s 2001-2003 3.0L V6 deceleration condition.'),
  'ford-escape-front-door-check-arm-weld-failure-doors-pop-bind-won-t-stay': replacement(doorCheckArm, 'Retain the 2020-2021 check-arm weld condition using Ford\'s exact service message and door-assembly remedy.'),
  'ford-escape-front-subframe-rust-and-lower-control-arm-separation': replacement(subframeCorrosion, 'Retain recall 14V165\'s exact corrosion-state lower-control-arm attachment defect and cross-brace remedy.'),
  'ford-escape-hybrid-forced-neutral-sudden-loss-motive-power': replacement(hybridNeutral, 'Retain NHTSA recall 24V330\'s precise HPCM software defect and update remedy.'),
  'ford-escape-liftgate-hinge-cover-can-detach-become-road-hazard': replacement(liftgateHingeCover, 'Retain NHTSA recall 25V829 using only primary-source scope, hazard, and remedy.'),
  'ford-escape-p0011-intake-cam-timing-over-advanced-from-sticking-vct-sole': replacement(vctSolenoid, 'Retain Ford\'s documented VCT-solenoid debris service condition and remove generic code-site diagnoses.'),
  'ford-escape-p0741-torque-converter-clutch-failure-6f35-automatic': replacement(torqueConverter, 'Retain Ford TSB 19-2139\'s exact 2013-2015 1.6L torque-converter condition and DTC pair.'),
  'ford-escape-phev-high-voltage-battery-cell-internal-short-circuit-loss-p': replacement(phevBattery, 'Retain NHTSA 24V954/Ford 24S79 with the exact PHEV battery risk, instruction, and remedy.'),
  'ford-escape-sync-4-rearview-camera-image-freezes-delays-goes-blank-rever': replacement(rearviewCamera, 'Retain NHTSA recall 25V315 and correct the Escape scope to 2022-2025.'),
  'ford-escape-windshield-wiper-linkage-failure': replacement(wiperLinkage, 'Retain the 2001 wiper-linkage failure after adding NHTSA recall 00V387 and its exact defect and remedy.'),
};

const reasons = {
  'ford-escape-8f35-8-speed-automatic-transmission-needle-bearing-failure-s':
    'Both Ford bulletins cited by the frozen card apply to other vehicles: MC-10189788 covers 2019-2021 Edge and 2019-2020 Nautilus software-related shudder, while MC-10226926 covers 2019-2021 Transit Connect needle-bearing wear. Neither supports an Escape 8F35 needle-bearing defect.',
  'ford-escape-automatic-transmission-failure-and-loss-of-drive':
    'The frozen card has no citations and aggregates eight model years of slipping, harsh shifts, warning lamps, noises, and complete failure without a Ford bulletin, investigation, or recall defining one defect, population, and remedy. Narrow documented Escape transmission conditions are audited separately.',
  'ford-escape-electric-steering-rack-2013':
    'The frozen card relies on one Reddit thread to apply electric steering-rack failure, binding, warning lamps, intermittent assist, and multiple noises to every 2013-2022 Escape. No matching Ford primary source reviewed defines that ten-year defect and remedy.',
  'ford-escape-fuel-tank-strap-corrosion-and-fuel-tank-drop-risk':
    'The frozen 2002 card has no citations, and the NHTSA Escape campaign review did not identify a Ford fuel-tank-strap corrosion recall matching the claimed tank-drop and leak condition.',
  'ford-escape-liftgate-latch-2013':
    'The frozen card has no citations and applies seven years of intermittent power-liftgate operation, latch failure, warning messages, and manual closure without an exact Ford bulletin, investigation, or recall defining one condition and remedy.',
  'ford-escape-p0420-failed-catalytic-converter-ecoboost-escapes':
    'The cited Ford bulletin MC-10230765 applies to 2018-2020 F-150 and 2020-2021 Expedition/Navigator high-sulfur-fuel conditions, not Escape. The remaining forum and generic diagnostic pages cannot establish failed converters across ten Escape model years and five engines.',
  'ford-escape-p0430-failed-bank-2-catalytic-converter-3-0l-duratec-v6-esca':
    'The frozen card relies on a forum, a Q&A page, and a generic code explainer to diagnose converter failure across every 2001-2012 3.0L Escape. P0430 alone does not prove one converter defect, and no Ford primary source reviewed defines this 12-year population and remedy.',
  'ford-escape-p0442-small-evap-leak-from-gas-cap-canister-purge-valve':
    'The frozen card turns a small-leak DTC into several possible part failures across 15 model years and five engines using forum and generic diagnostic pages. No Ford primary source reviewed defines that aggregation as one known issue.',
  'ford-escape-p0455-gross-evap-leak-from-capless-filler-neck-purge-valve':
    'The frozen card turns a gross-leak/no-flow DTC into filler-neck, purge-valve, hose, canister, and fuel-cap diagnoses across ten years using generic and Q&A pages. No Ford primary source reviewed defines one defect and remedy for that population.',
  'ford-escape-sunroof-leak-2013':
    'The frozen card has no citations and applies clogged drains, seal failure, stained headliners, wet carpets, odors, electrical damage, and corrosion to every 2013-2022 Escape without an exact Ford bulletin, investigation, or recall.',
  'ford-escape-transmission-shudder-2020':
    'The frozen card has no citations and applies launch shudder, low-speed judder, shift hesitation, noises, warnings, and loss of drive to every 2020-2025 Escape without separating conventional automatic, hybrid, and plug-in hybrid powertrains or identifying an exact Ford defect and remedy.',
};

module.exports = buildConfig({
  label: 'Ford Escape',
  make: 'Ford',
  model: 'Escape',
  slug: 'ford-escape',
  batchId: 'ford-escape-full-record-cohort-107-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '12157d6ea5af15e4cd7a8f6b259e14be8e33cd8cd50e53a584735230fbc4c8a5',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-escape/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordescape_blind:manual-primary-source-gate',
    edge: 'fordescape_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
