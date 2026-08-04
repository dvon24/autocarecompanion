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

function recallSource(campaign, year, title) {
  return {
    type: 'recall',
    title: `NHTSA Recall ${campaign} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Explorer&modelYear=${year}`,
  };
}

const exhaustOdorProgram = {
  years: [2011, 2012, 2013, 2014, 2015, 2016, 2017],
  trims: ['Vehicles covered by expired Customer Satisfaction Program 17N03'],
  engines: [],
  category: 'exhaust',
  title: 'Exhaust-Odor Concerns and Ford Program 17N03 Service',
  description:
    'Ford Customer Satisfaction Program 17N03 documented exhaust or carbon-monoxide concerns on certain 2011-2017 Explorer vehicles and offered service intended to reduce the potential for exhaust to enter the cabin. NHTSA later closed Engineering Analysis EA17-002 after measured carbon-monoxide levels stayed below accepted health standards; the agency did not identify an unreasonable safety defect.',
  solution:
    'If exhaust odor enters the cabin, have a Ford dealer or qualified exhaust/body technician inspect the rear underbody plugs, air extractors, liftgate drain valves, weather sealing, spoiler sealing, and any aftermarket equipment holes. Ford\'s program also reprogrammed the climate-control module. Program 17N03 expired in 2019, so it should not be represented as current free coverage.',
  severity: 'medium',
  symptoms: ['Exhaust or sulfur-like odor in the passenger compartment', 'Odor during rapid acceleration or with rear climate control operating'],
  affectedSystems: ['rear body sealing', 'air extractors', 'liftgate drains and weather seals', 'climate-control module software'],
  dtcCodes: [],
  sources: [
    { type: 'tsb', title: 'Ford Customer Satisfaction Program 17N03 Supplement 2', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10153981-9999.pdf' },
    { type: 'nhtsa', title: 'NHTSA EA17-002 Closing Resume - Explorer Exhaust Odor', url: 'https://static.nhtsa.gov/odi/inv/2017/INCLA-EA17002-8587.PDF' },
  ],
  summary:
    'Reframed the alarmist carbon-monoxide card as Ford\'s exact expired 17N03 exhaust-entry service and added NHTSA\'s closing conclusion that testing did not identify an unreasonable CO safety defect.',
};

const transmission10R60 = {
  years: [2020, 2021, 2022, 2023],
  trims: ['Vehicles equipped with the 10R60 automatic transmission'],
  engines: [],
  category: 'transmission',
  title: '10R60 Harsh or Delayed Engagement and Shifting',
  description:
    'Ford TSB 23-2350 covers some 2020-2023 Explorer vehicles with the 10R60 transmission that exhibit harsh or delayed engagement or shifting, sometimes with the malfunction indicator lamp and listed transmission DTCs. Ford identifies several possible causes, including control-module software, solenoid identification strategy, sticking main-control valves, or axial movement of the CDF clutch-cylinder sleeve.',
  solution:
    'Have a Ford dealer or qualified transmission technician follow the bulletin\'s diagnostic procedure. The repair depends on the confirmed cause and may involve software or strategy correction, main-control valve-body service, or internal CDF clutch-cylinder work; the symptoms alone do not prove one failed part.',
  severity: 'high',
  symptoms: ['Harsh transmission engagement', 'Delayed transmission engagement', 'Harsh or delayed shifts', 'Malfunction indicator lamp may illuminate'],
  affectedSystems: ['10R60 transmission', 'PCM or TCM software', 'solenoid strategy', 'main-control valve body', 'CDF clutch-cylinder sleeve'],
  dtcCodes: ['P0751', 'P0752', 'P0756', 'P0757', 'P0761', 'P0762', 'P0766', 'P0767', 'P0771', 'P0772', 'P2700', 'P2701', 'P2702', 'P2703', 'P2704', 'P2705', 'P2707', 'P2708', 'P0729', 'P0731', 'P0732', 'P0733', 'P0734', 'P0735', 'P0736', 'P076F', 'P07D9', 'P07F6', 'P07F7'],
  sources: [{ type: 'tsb', title: 'Ford TSB 23-2350 - 10R60 Harsh or Delayed Engagement and Shifts', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241447-0001.pdf' }],
  summary:
    'Narrowed the frozen 2020-2024 general transmission card to Ford TSB 23-2350\'s exact 2020-2023 10R60 population, possible causes, DTCs, and cause-dependent repair process.',
};

const turboOilLine = {
  years: [2023],
  trims: ['Vehicles covered by recall 23V597 / Ford 23S50'],
  engines: ['2.3L GTDI'],
  category: 'engine',
  title: 'Damaged Turbo Oil-Supply Line Can Leak Oil and Cause Stall or Fire',
  description:
    'NHTSA recall 23V597 covers certain 2023 Explorer vehicles with the 2.3L GTDI engine. A damaged turbocharger oil-supply line can leak oil in the engine compartment, increasing fire risk near hot surfaces; oil loss can also stall the engine.',
  solution:
    'If the oil-pressure warning appears or smoke comes from the engine compartment, park and shut off the engine as soon as it is safe. Have a Ford dealer check recall 23S50 and replace the turbo oil-supply line assembly free of charge.',
  severity: 'high',
  symptoms: ['Oil-pressure warning lamp', 'Smoke from the engine compartment', 'Engine-oil leak', 'Engine stall'],
  affectedSystems: ['turbocharger oil-supply line', 'engine lubrication system'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall Report 23V597 - Turbo Oil-Supply Line', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V597-6273.PDF' },
    recallSource('23V597', 2023, 'Turbocharger Oil-Supply Line Leak'),
  ],
  summary: 'Removed secondary summaries and rebuilt the card from NHTSA recall 23V597\'s exact engine, hazard, warning signs, and oil-line replacement remedy.',
};

const speedControlSwitch = {
  years: [2000, 2001, 2002],
  trims: ['Vehicles equipped with the affected Texas Instruments speed-control deactivation switch and covered by recall 09V399'],
  engines: [],
  category: 'electrical',
  title: 'Speed-Control Deactivation Switch Can Leak, Overheat, and Burn',
  description:
    'NHTSA recall 09V399 includes certain 2000-2002 Explorer vehicles equipped with the affected speed-control deactivation switch. The switch can leak internally and then overheat, smoke, or burn, allowing a vehicle fire with or without the engine running.',
  solution:
    'Have a Ford dealer check the VIN for recall completion. The remedy installs a fused wiring harness in line with the speed-control deactivation switch free of charge.',
  severity: 'high',
  symptoms: ['Smoke or burning odor near the speed-control switch', 'Underhood fire with the engine running or off'],
  affectedSystems: ['speed-control deactivation switch', 'fused speed-control wiring harness'],
  dtcCodes: [],
  sources: [recallSource('09V399', 2000, 'Speed-Control Deactivation Switch Fire Risk')],
  summary: 'Corrected the frozen 2000-2010 scope to the 2000-2002 Explorer population represented in recall 09V399 and retained its exact fire mechanism and fused-harness remedy.',
};

const dynamicHeadlight = {
  years: [2025, 2026],
  trims: ['Vehicles covered by recall 26V121 / Ford 26C12'],
  engines: [],
  category: 'electrical',
  title: 'Dynamic Headlight Software Can Turn the Passenger Lamp the Wrong Way',
  description:
    'NHTSA recall 26V121 covers certain 2025-2026 Explorer vehicles. Dynamic Bending Light software may steer the passenger-side headlight in the wrong direction through a curve, increasing glare to other road users.',
  solution:
    'Have a Ford dealer check recall 26C12. The headlight-control-module software is updated by a dealer or over the air free of charge.',
  severity: 'high',
  symptoms: ['Passenger-side headlight turns the wrong direction in curves', 'Excessive glare toward other road users'],
  affectedSystems: ['Dynamic Bending Light software', 'headlight control module', 'passenger-side headlight'],
  dtcCodes: [],
  sources: [recallSource('26V121', 2025, 'Dynamic Bending Headlight Direction')],
  summary: 'Replaced secondary and forum citations with NHTSA recall 26V121\'s exact software defect, compliance risk, and module-update remedy.',
};

const egrValve = {
  years: [2025],
  trims: ['Vehicles covered by recall 26V122 / Ford 26S10'],
  engines: [],
  category: 'engine',
  title: 'EGR Valve Failure Can Cause Unexpected Loss of Drive Power',
  description:
    'NHTSA recall 26V122 covers certain 2025 Explorer vehicles. The exhaust-gas-recirculation valve may fail and cause an unexpected loss of drive power.',
  solution: 'Have a Ford dealer check the VIN for recall 26S10. Dealers replace the EGR valve free of charge.',
  severity: 'high',
  symptoms: ['Unexpected loss of drive power'],
  affectedSystems: ['exhaust-gas-recirculation valve', 'engine controls'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall Acknowledgement 26V122', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCAK-26V122-9462.pdf' },
    recallSource('26V122', 2025, 'EGR Valve Failure and Loss of Drive Power'),
  ],
  summary: 'Rebuilt the card from NHTSA recall 26V122, removing secondary incident language and preserving only the documented 2025 failure, power-loss risk, and valve replacement.',
};

const powerSteering = {
  years: [2011, 2012, 2013],
  trims: ['Vehicles built from May 17, 2010 through February 28, 2012 and covered by recall 14V286'],
  engines: [],
  category: 'steering',
  title: 'Intermittent Steering-Gear Connection Can Shut Down Power Assist',
  description:
    'NHTSA recall 14V286 covers certain 2011-2013 Explorer vehicles. An intermittent connection in the electric steering gear can interrupt the motor-position-sensor signal and shut down power steering assist, requiring greater steering effort at low speed.',
  solution:
    'Have a Ford dealer check recall 14S06. Dealers update Power Steering Control Module software; if the vehicle history shows loss of the motor-position-sensor signal, the steering-rack assembly is replaced free of charge.',
  severity: 'high',
  symptoms: ['Loss of electric power steering assist', 'Sudden increase in steering effort at low speed'],
  affectedSystems: ['electric power steering gear', 'motor position sensor signal', 'Power Steering Control Module'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'Ford Campaign 14S06 - Explorer Electric Power Steering', url: 'https://www.ford.com/support/campaign-details/15S18/' },
    recallSource('14V286', 2011, 'Electric Power Steering Assist Loss'),
  ],
  summary: 'Rebuilt the card from NHTSA recall 14V286, preserving the exact build population, intermittent signal fault, software remedy, and conditional rack replacement.',
};

const pillarTrim = {
  years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
  trims: ['Vehicles covered by recall 24V031 / Ford 24S02'],
  engines: [],
  category: 'body',
  title: 'A-Pillar Trim Can Detach and Become a Road Hazard',
  description:
    'NHTSA recall 24V031 covers certain 2011-2019 Explorer vehicles. A-pillar trim retention clips may not be fully engaged, allowing the trim to detach and become a road hazard.',
  solution: 'Have a Ford dealer check recall 24S02. Dealers inspect the A-pillar trim and replace it as necessary free of charge.',
  severity: 'high',
  symptoms: ['Loose A-pillar exterior trim', 'A-pillar trim detaches while driving'],
  affectedSystems: ['A-pillar trim panels', 'trim retention clips'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'Ford Recall 24S02 - Explorer A-Pillar Trim Detachment', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/24s02-explorer-2011-2019-a-pillar-trim-detachment-recall/' },
    recallSource('24V031', 2011, 'A-Pillar Trim Detachment'),
  ],
  summary: 'Removed secondary summaries and retained Ford/NHTSA recall 24S02/24V031\'s exact model years, clip defect, road hazard, and inspection/replacement remedy.',
};

const firestoneTires = {
  years: [1995, 1996, 1997, 1998, 1999, 2000, 2001],
  trims: ['Vehicles fitted with recalled Firestone ATX, ATX II, or Wilderness AT P235/75R15 tires within covered DOT production populations'],
  engines: [],
  category: 'safety',
  title: 'Historical Firestone P235/75R15 Tire Tread-Separation Recalls',
  description:
    'NHTSA documented the historical recall of specified Firestone Radial ATX, Radial ATX II, and Wilderness AT P235/75R15 tires after elevated tread-separation failures, including tires used on Ford Explorer vehicles. Coverage depends on the tire model, size, manufacturing plant, and DOT date code—not simply the Explorer model year.',
  solution:
    'Inspect the tire sidewalls for manufacturer, model, size, and DOT code and check those identifiers through NHTSA. Do not assume a current replacement tire is affected merely because it is installed on an older Explorer; any tire within a recalled population should be removed from service and replaced.',
  severity: 'high',
  symptoms: ['Tread or belt separation', 'Bulge or distortion in the tread', 'Vibration before tire failure', 'Sudden tire failure or loss of control'],
  affectedSystems: ['Firestone Radial ATX tires', 'Firestone Radial ATX II tires', 'Firestone Wilderness AT tires'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Firestone Tire Recall and Investigation Report', url: 'https://www.nhtsa.gov/sites/nhtsa.gov/files/firestonereport.pdf' }],
  summary: 'Converted the vehicle-wide allegation into a historical tire-specific card whose applicability depends on the recalled Firestone model, size, plant, and DOT date code; the overlapping Firestone card is removed as a duplicate.',
};

const wiperMotor = {
  years: [2020, 2021, 2022],
  trims: ['Vehicles covered by recall 26V117 / Ford 26S14'],
  engines: [],
  category: 'body',
  title: 'Front Wiper Motor Can Fail and Reduce Visibility',
  description: 'NHTSA recall 26V117 covers certain 2020-2022 Explorer vehicles whose front windshield-wiper motor may fail and prevent proper wiper operation.',
  solution: 'Have a Ford dealer check recall 26S14. Dealers inspect and replace the front wiper motor as necessary free of charge.',
  severity: 'high',
  symptoms: ['Front windshield wipers stop operating properly', 'Reduced visibility in rain or snow'],
  affectedSystems: ['front windshield-wiper motor', 'windshield-wiper system'],
  dtcCodes: [],
  sources: [recallSource('26V117', 2020, 'Front Windshield-Wiper Motor Failure')],
  summary: 'Replaced news and parts-page citations with NHTSA recall 26V117\'s exact population, visibility risk, and inspection/replacement remedy.',
};

const ipmaReset = {
  years: [2025],
  trims: ['Vehicles covered by recall 26V165 / Ford 26S21'],
  engines: [],
  category: 'electrical',
  title: 'IPMA Resets Can Disable the Rearview Camera and Driver-Assistance Features',
  description:
    'NHTSA recall 26V165 covers certain 2025 Explorer vehicles. Repeated unexpected resets of Image Processing Module A can remove the rearview-camera image and disable pre-collision assist, lane-keeping assist, and blind-spot monitoring.',
  solution: 'Have a Ford dealer check recall 26S21. The IPMA software is updated by a dealer or over the air free of charge.',
  severity: 'high',
  symptoms: ['Rearview-camera image disappears', 'Pre-collision assist unavailable', 'Lane-keeping assist unavailable', 'Blind-spot monitoring unavailable'],
  affectedSystems: ['Image Processing Module A software', 'rearview camera', 'advanced driver-assistance systems'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall Acknowledgement 26V165', url: 'https://static.nhtsa.gov/odi/rcl/2026/RCAK-26V165-7730.pdf' },
    recallSource('26V165', 2025, 'IPMA Resets and Camera/ADAS Loss'),
  ],
  summary: 'Rebuilt the card from NHTSA recall 26V165 and retained only the documented 2025 IPMA reset, affected functions, and software remedy.',
};

const seatBeltBolts = {
  years: [2020, 2021],
  trims: ['Vehicles covered by recall 25V093 / Ford 25S09'],
  engines: [],
  category: 'safety',
  title: 'Seat-Belt Anchor or Buckle Bolts May Be Improperly Secured',
  description:
    'NHTSA recall 25V093 covers certain 2020-2021 Explorer vehicles. One or more seat-belt buckle anchor bolts may be loose; some vehicles may also have an improperly secured retractor or anchor bolt at the second-row center position.',
  solution: 'Have a Ford dealer check recall 25S09. Dealers inspect the covered anchor bolts and replace affected seat components when loose fasteners are found, free of charge.',
  severity: 'high',
  symptoms: ['Loose seat-belt buckle or anchor', 'Seat belt may not restrain an occupant properly in a crash'],
  affectedSystems: ['seat-belt buckle anchor bolts', 'seat-belt retractor anchor bolts', 'second-row center seat-belt anchor'],
  dtcCodes: [],
  sources: [recallSource('25V093', 2020, 'Improperly Secured Seat-Belt Anchor Bolts')],
  summary: 'Removed secondary recall summaries and preserved NHTSA 25V093\'s exact seating hardware, model years, restraint risk, inspection, and component-replacement remedy.',
};

const ptuOdor = {
  years: [2011, 2012, 2013, 2014, 2015, 2016],
  trims: ['All-wheel-drive vehicles built on or before June 30, 2016'],
  engines: [],
  category: 'drivetrain',
  title: 'Overheated PTU Fluid Can Cause a Propane-Like Odor',
  description:
    'Ford TSB 18-2058 covers some 2011-2016 Explorer AWD vehicles built on or before June 30, 2016 that produce a propane or natural-gas odor at idle or low speed. Ford says excessive heat can break down PTU fluid; when the odor is confirmed to originate at the PTU, an idler-bearing repair kit may be used.',
  solution:
    'Have a Ford dealer or qualified driveline technician confirm the odor source and inspect the PTU under Workshop Manual section 308-07. If repairable under the bulletin, Ford directs use of the PTU idler gear/shaft/bearing kit. The bulletin does not support diagnosing every noise, warning, or AWD symptom as complete PTU failure.',
  severity: 'medium',
  symptoms: ['Propane-like or natural-gas odor at idle', 'Propane-like or natural-gas odor during low-speed driving'],
  affectedSystems: ['power transfer unit fluid', 'PTU idler gear, shaft, and bearing'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 18-2058 - PTU Fluid Breakdown Odor', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10137131-9999.pdf' }],
  summary: 'Narrowed the frozen overheating/bearing-failure card to Ford TSB 18-2058\'s exact 2011-2016 AWD odor condition, heat-degraded fluid cause, and conditional idler-bearing-kit repair; the second PTU card is removed as a duplicate.',
};

const pcmReset = {
  years: [2025],
  trims: ['Vehicles covered by recall 25V239 / Ford 25S35'],
  engines: [],
  category: 'electrical',
  title: 'PCM Reset Can Damage the Park System or Stall the Engine',
  description:
    'NHTSA recall 25V239 covers certain 2025 Explorer vehicles. The powertrain control module may reset while driving, damaging the park system or stalling the engine and causing rollaway or loss-of-power risk.',
  solution: 'Have a Ford dealer check recall 25S35. Dealers update the PCM software free of charge. Until repaired, use the parking brake whenever parked.',
  severity: 'high',
  symptoms: ['Engine stall while driving', 'Loss of drive power', 'Vehicle may roll when placed in Park without the parking brake'],
  affectedSystems: ['powertrain control module software', 'transmission park system'],
  dtcCodes: [],
  sources: [recallSource('25V239', 2025, 'PCM Reset, Engine Stall, and Park-System Damage')],
  summary: 'Replaced secondary summaries with NHTSA recall 25V239\'s exact 2025 PCM reset, stall/rollaway hazards, parking-brake precaution, and software remedy.',
};

const axleBolt = {
  years: [2020, 2021, 2022],
  trims: ['Vehicles covered by recall 23V675 / Ford 23S55'],
  engines: [],
  category: 'drivetrain',
  title: 'Rear-Axle Mounting Bolt Can Fracture and Disconnect the Driveshaft',
  description:
    'NHTSA recall 23V675 covers certain 2020-2022 Explorer vehicles. The rear-axle horizontal mounting bolt may fracture and allow the driveshaft to disconnect, causing loss of drive power or rollaway when the parking brake is not applied.',
  solution:
    'Have a Ford dealer check all applicable axle-bolt recall history for the VIN. Recall 23S55 replaces the subframe bushing and rear-axle bolt and inspects the axle cover for damage; later campaigns address some incorrectly repaired vehicles. Use the parking brake whenever parked until recall status is resolved.',
  severity: 'high',
  symptoms: ['Rear-axle mounting bolt fracture', 'Driveshaft disconnects', 'Loss of drive power', 'Vehicle rollaway when parked without the parking brake'],
  affectedSystems: ['rear-axle horizontal mounting bolt', 'subframe bushing', 'rear axle cover', 'driveshaft'],
  dtcCodes: [],
  sources: [recallSource('23V675', 2020, 'Rear-Axle Bolt Fracture and Driveshaft Disconnect'), recallSource('25V166', 2020, 'Incorrect Prior Rear-Axle Recall Repair')],
  summary: 'Rebuilt the card around NHTSA 23V675\'s physical bolt/bushing remedy and added the later re-repair context without treating every covered VIN as having the same incomplete repair.',
};

const driveshaftWeld = {
  years: [2020],
  trims: ['All-wheel-drive vehicles with a 10-speed automatic transmission covered by recall 20V693'],
  engines: ['2.0L engine', '3.3L engine'],
  category: 'drivetrain',
  title: 'Driveshaft Weld Seam Can Fracture',
  description:
    'NHTSA recall 20V693 covers certain 2020 Explorer AWD vehicles with a 2.0L or 3.3L engine and 10-speed automatic transmission. The driveshaft may fracture along its weld seam, causing loss of drive, rollaway in Park, or contact with the fuel tank.',
  solution: 'Have a Ford dealer check recall 20S65. Dealers inspect the driveshaft label and replace the driveshaft as necessary free of charge.',
  severity: 'high',
  symptoms: ['Loss of drive', 'Vehicle rollaway in Park', 'Driveshaft deformation or separation'],
  affectedSystems: ['driveshaft weld seam', 'transfer-case-to-rear-axle driveline', 'fuel tank'],
  dtcCodes: [],
  sources: [recallSource('20V693', 2020, 'Driveshaft Weld-Seam Fracture')],
  summary: 'Replaced third-party recall reproductions with NHTSA 20V693\'s exact AWD, engine, transmission, hazard, and inspection/replacement scope.',
};

const toeLink = {
  years: [2017, 2018, 2019],
  trims: ['Vehicles covered by recall 26V101 / Ford 26S08'],
  engines: [],
  category: 'suspension',
  title: 'Rear Suspension Toe Links Can Fracture',
  description: 'NHTSA recall 26V101 covers certain 2017-2019 Explorer vehicles whose rear suspension toe links may fracture, potentially causing loss of steering control.',
  solution: 'Have a Ford dealer check recall 26S08 and earlier toe-link campaign history. Dealers replace the rear toe links free of charge.',
  severity: 'high',
  symptoms: ['Rear toe-link fracture', 'Loss of steering control'],
  affectedSystems: ['rear suspension toe links'],
  dtcCodes: [],
  sources: [recallSource('26V101', 2017, 'Rear Suspension Toe-Link Fracture')],
  summary: 'Updated the frozen 2017-2019 toe-link card to the exact current NHTSA 26V101/26S08 expansion and its replacement remedy.',
};

const invertedCamera = {
  years: [2020, 2021, 2022, 2023, 2024],
  trims: ['Vehicles covered by recall 26V123 / Ford 26C11'],
  engines: [],
  category: 'electrical',
  title: 'APIM Software Can Flip or Invert the Rearview Camera Image',
  description:
    'NHTSA recall 26V123 covers certain 2020-2024 Explorer vehicles. Accessory Protocol Interface Module software can flip or invert the center-display image and show the rearview scene incorrectly when the vehicle is in reverse.',
  solution: 'Have a Ford dealer check recall 26C11. Dealers update APIM software free of charge.',
  severity: 'high',
  symptoms: ['Rearview camera image appears flipped', 'Rearview camera image appears inverted'],
  affectedSystems: ['Accessory Protocol Interface Module software', 'center display', 'rearview camera image'],
  dtcCodes: [],
  sources: [recallSource('26V123', 2020, 'Flipped or Inverted Rearview Image')],
  summary: 'Converted the generic rearview-camera failure card into NHTSA 26V123\'s exact 2020-2024 APIM software compliance defect and update remedy.',
};

const syncSoftware = {
  years: [2020],
  trims: ['Vehicles equipped with SYNC 3'],
  engines: [],
  category: 'electrical',
  title: 'SYNC 3 Software Can Freeze, Blank, or Disrupt Connected Features',
  description:
    'Ford TSB 20-2259 covers some 2020 Explorer vehicles with SYNC 3. Documented concerns include a frozen or blank screen, repeated Wi-Fi prompts, a blue screen, a camera image that remains on while moving forward slowly, inoperative apps, poor AppLink, CarPlay launch or black-screen problems, interrupted voice prompts, Travel Link problems, and FordPass remote-start scheduling failure.',
  solution:
    'Have a Ford dealer confirm the vehicle and symptom meet TSB 20-2259 and update APIM software. Ford notes that some APIMs were replaced unnecessarily when a software update would have resolved the condition.',
  severity: 'medium',
  symptoms: ['Frozen or blank SYNC screen', 'CarPlay does not launch or shows a black screen', 'Inoperative infotainment apps', 'Repeated Wi-Fi message', 'Rearview image remains displayed while moving forward slowly'],
  affectedSystems: ['SYNC 3 software', 'Accessory Protocol Interface Module', 'infotainment display'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 20-2259 - SYNC 3 Performance Concerns', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10179121-0001.pdf' }],
  summary: 'Narrowed the frozen 2020-2022 card to TSB 20-2259\'s exact 2020 Explorer SYNC 3 scope, documented symptom set, software cause, and APIM update remedy.',
};

const rearWaterLeak = {
  years: [2020, 2021],
  trims: [],
  engines: [],
  category: 'body',
  title: 'Water Can Enter the Rear Liftgate or Spare-Tire Area',
  description:
    'Ford TSB 20-2425 covers some 2020-2021 Explorer vehicles with water in the rear liftgate or spare-tire area. The service procedure checks multiple possible leak paths, including liftgate and wiring grommets, margin seals, washer hose, body-hole tape, and BLIS-module harness sealing.',
  solution:
    'Have a Ford dealer or qualified body-water-leak technician follow TSB 20-2425 to identify the actual leak path before sealing or replacing parts. The bulletin does not assign every vehicle one universal failed seal.',
  severity: 'medium',
  symptoms: ['Water in the rear liftgate area', 'Water in the spare-tire well'],
  affectedSystems: ['liftgate grommets and seals', 'rear body-hole sealing', 'washer hose', 'BLIS-module harness grommets'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 20-2425 - Rear Liftgate and Spare-Tire-Area Water Leak', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10184645-0001.pdf' }],
  summary: 'Corrected the frozen 2020-2022 scope to Ford TSB 20-2425\'s exact 2020-2021 population and preserved its multi-path inspection rather than inventing one universal seal failure.',
};

const published = {
  'ford-explorer-carbon-monoxide-exhaust-intrusion': replacement(exhaustOdorProgram, 'Retain one accurate exhaust-odor service card with Ford 17N03 and NHTSA\'s no-safety-defect closing conclusion; remove the duplicate alarmist card.'),
  'ford-explorer-10-speed-transmission-harsh-shifting': replacement(transmission10R60, 'Retain only Ford TSB 23-2350\'s exact 2020-2023 10R60 harsh/delayed engagement and shift condition.'),
  'ford-explorer-2-3l-ecoboost-turbocharger-oil-supply-line-o-ring-leak-under': replacement(turboOilLine, 'Retain NHTSA 23V597/Ford 23S50 with its exact 2023 2.3L population, oil-line hazard, and replacement remedy.'),
  'ford-explorer-cruise-control-deactivation-switch-2000': replacement(speedControlSwitch, 'Retain recall 09V399\'s exact speed-control switch fire condition within the frozen card\'s 2000-2002 Explorer overlap.'),
  'ford-explorer-dynamic-bending-light-headlight-turns-wrong-way-curves-glari': replacement(dynamicHeadlight, 'Retain NHTSA 26V121\'s exact 2025-2026 headlight software noncompliance and update remedy.'),
  'ford-explorer-egr-valve-poppet-head-detachment-causing-unexpected-loss-dri': replacement(egrValve, 'Retain NHTSA 26V122\'s exact 2025 EGR-valve power-loss issue and replacement remedy.'),
  'ford-explorer-electric-power-steering-failure': replacement(powerSteering, 'Retain NHTSA 14V286\'s exact intermittent steering-gear signal failure, software update, and conditional rack replacement.'),
  'ford-explorer-exterior-pillar-windshield-trim-can-detach-become-road-hazar': replacement(pillarTrim, 'Retain Ford/NHTSA recall 24S02/24V031 with its exact 2011-2019 A-pillar trim defect and remedy.'),
  'ford-explorer-firestone-wilderness-tire-tread-separation-causing-blowouts': replacement(firestoneTires, 'Retain one historical tire-specific Firestone card whose applicability depends on model, size, plant, and DOT date code.'),
  'ford-explorer-front-windshield-wiper-motor-failure': replacement(wiperMotor, 'Retain NHTSA 26V117\'s exact 2020-2022 wiper-motor failure and remedy.'),
  'ford-explorer-image-processing-module-overload-reset-causing-loss-rearview': replacement(ipmaReset, 'Retain NHTSA 26V165\'s exact 2025 IPMA reset, camera/ADAS effects, and software update.'),
  'ford-explorer-improperly-secured-seat-belt-anchor-buckle-bolts-may-not-res': replacement(seatBeltBolts, 'Retain NHTSA 25V093\'s exact 2020-2021 anchor-bolt inspection and affected-component replacement.'),
  'ford-explorer-power-transfer-unit-overheating-bearing-failure-awd-models': replacement(ptuOdor, 'Retain Ford TSB 18-2058\'s precise PTU odor/fluid-breakdown condition and conditional idler-bearing-kit repair; remove the duplicate PTU card.'),
  'ford-explorer-powertrain-control-module-reset-damaging-park-system-causing': replacement(pcmReset, 'Retain NHTSA 25V239\'s exact 2025 PCM reset, stall/rollaway risks, and software remedy.'),
  'ford-explorer-rear-axle-bolt-fracture': replacement(axleBolt, 'Retain NHTSA 23V675\'s physical rear-axle bolt defect and later re-repair context.'),
  'ford-explorer-rear-driveshaft-weld-seam-fracture': replacement(driveshaftWeld, 'Retain NHTSA 20V693\'s exact 2020 AWD engine/transmission population and driveshaft inspection/replacement remedy.'),
  'ford-explorer-rear-suspension-toe-link-ball-joint-corrosion-fracture-causi': replacement(toeLink, 'Retain the current 2017-2019 toe-link issue under NHTSA 26V101/Ford 26S08.'),
  'ford-explorer-rearview-camera-failure': replacement(invertedCamera, 'Retain a precise camera card for NHTSA 26V123\'s flipped/inverted-image software defect.'),
  'ford-explorer-sync-3-apim-touchscreen-freezing-black-screen': replacement(syncSoftware, 'Retain Ford TSB 20-2259\'s exact 2020 SYNC 3 software symptom set and APIM update.'),
  'ford-explorer-water-leak-into-rear-cargo-area-spare-tire-well': replacement(rearWaterLeak, 'Retain Ford TSB 20-2425\'s exact 2020-2021 rear water-leak inspection and repair process.'),
};

const reasons = {
  'ford-explorer-3-5l-ecoboost-ignition-coil-spark-plug-misfire': 'The frozen card relies on owner forums and an aftermarket technical article to diagnose coils or spark plugs across eight model years, including 2020. No Ford primary source reviewed defines one 3.5L EcoBoost misfire defect and remedy for that population.',
  'ford-explorer-4-0l-ohv-cracked-cylinder-heads-blown-head-gaskets-from-over': 'The frozen card relies on a generic test article and owner forums to apply cracked heads, blown gaskets, overheating, coolant loss, smoke, and contaminated oil to every 1991-1999 4.0L OHV Explorer. No Ford primary source reviewed defines that nine-year defect.',
  'ford-explorer-4-0l-sohc-camshaft-position-sensor-synchronizer-failure-caus': 'The frozen card relies only on owner forum discussions and applies sensor, synchronizer, chirp, stall, no-start, and timing symptoms across 1997-2005. No exact Ford bulletin, investigation, or recall reviewed supports that combined diagnosis.',
  'ford-explorer-4-0l-sohc-timing-chain-cassette-guide-tensioner-failure': 'The frozen card relies on an aftermarket repair summary and owner forums. It does not cite Ford\'s exact service-program population, build dates, or repair terms, so the broad cassette, guide, and tensioner failure claim cannot pass the primary-source gate.',
  'ford-explorer-4-6l-2-valve-triton-v8-spark-plug-ejection-stripped-head-thr': 'The frozen card relies on complaint aggregators and applies spark-plug ejection and stripped threads to every 2002-2005 4.6L Explorer without an exact Ford bulletin, investigation, or recall defining the defect and remedy.',
  'ford-explorer-5r55e-automatic-transmission-reverse-loss-forward-clutch-sli': 'The frozen card uses two owner-forum threads to combine reverse loss, forward-clutch slip, delayed engagement, flare, noise, and complete transmission failure across 1997-2001. No Ford primary source reviewed defines one cause and repair.',
  'ford-explorer-5r55w5r55s-transmission-servo-bore-2002': 'The only citation is the Motorcraft Service homepage, not a bulletin or record. The frozen card applies servo-bore wear, multiple shift symptoms, DTCs, and several repairs to nine model years without an exact Ford source.',
  'ford-explorer-6f50-6f55-six-speed-automatic-harsh-bump-shifts-sluggish-low': 'The frozen card relies on a forum and generic transmission sites to apply two transmissions and nine years of shifting symptoms without a Ford-defined population, cause, or service procedure.',
  'ford-explorer-aluminum-hood-paint-bubbling-corrosion': 'The frozen card relies on complaint and news sites and applies paint bubbling, corrosion, peeling, perforation, and a replacement remedy to 2011-2020 without an exact Ford bulletin, recall, or warranty program.',
  'ford-explorer-auto-start-stop-system-stops-working-due-to-auxiliary-batter': 'The frozen card relies on two owner forums to diagnose an auxiliary battery or battery-monitor state across 2020-2023. Auto-start-stop can be inhibited for many normal or fault conditions, and no exact Ford primary source reviewed establishes this one-cause card.',
  'ford-explorer-automatic-transmission-overdrive-failure': 'The frozen card relies on owner and generic transmission forums to combine A4LD/4R55E overdrive loss, slipping, flares, noises, and complete failure across 1991-1999 without an exact Ford defect and remedy.',
  'ford-explorer-c-compressor-failure-causing-loss-cold-air-whining-burning-s': 'The frozen card uses an aftermarket symptom page and owner forum to diagnose compressor failure across 2016-2020. No Ford primary source reviewed defines that five-year compressor defect and repair.',
  'ford-explorer-cam-phaser-rattle-3-5l-ecoboost-causing-cold-start-knock': 'The cited Ford TSB MC-10148706 applies to F-150, Expedition, and Navigator populations, not Explorer. The owner forum cannot extend that VCT-unit defect to 2013-2019 Explorer vehicles.',
  'ford-explorer-camshaft-synchronizer-cmp-sensor-bushing-failure': 'The frozen card relies on an aftermarket repair summary and owner forums to apply synchronizer bushing noise, sensor failure, stalling, no-start, and timing symptoms to every 1991-1999 Explorer without an exact Ford source.',
  'ford-explorer-door-latch-door-lock-actuator-failure-causing-persistent-doo': 'The frozen card relies on forums, a parts seller, and a complaint aggregator to combine latch and actuator failure across 2011-2019. No Ford primary source reviewed defines one defect and remedy for all those symptoms and years.',
  'ford-explorer-dpfe-sensor-egr-failure-setting-p0401-companion-p0171-p0174': 'The frozen card uses an owner forum and generic diagnostic article to treat P0401/P0171/P0174 as proof of DPFE failure across 1997-2005. Those DTCs require diagnosis, and no Ford primary source reviewed defines this one-cause population.',
  'ford-explorer-evap-canister-purge-valve-failure-triggering-small-leak-chec': 'The frozen card relies on generic and forum pages to assign P0456 and multiple EVAP symptoms to a purge-valve defect across 2011-2020. No Ford primary source reviewed defines that ten-year diagnosis and remedy.',
  'ford-explorer-exhaust-carbon-monoxide-odor-entering-cabin': 'This card duplicates the retained 17N03 exhaust-odor record while omitting NHTSA\'s closing conclusion. Keeping both would double-count one concern and preserve unsupported claims that the investigation established dangerous carbon-monoxide exposure.',
  'ford-explorer-firestone-tire-tread-separation-rollover-safety-crisis': 'This card duplicates the retained historical Firestone tire record and applies the controversy broadly to every 1991-1999 Explorer. Applicability is determined by the tire model, size, plant, and DOT date code, not merely vehicle model year.',
  'ford-explorer-frame-rear-subframe-rocker-body-mount-rust': 'The frozen card relies entirely on owner forums and combines frame, subframe, rocker, and body-mount corrosion across 1991-1999 without a Ford bulletin, investigation, recall, geographic population, or defined repair.',
  'ford-explorer-front-lower-ball-joint-control-arm-wear-causing-clunk-loose': 'The frozen card relies on owner forums to apply ordinary lower-ball-joint and control-arm wear symptoms to every 2006-2010 Explorer without a Ford-defined defect, population, or remedy.',
  'ford-explorer-front-upper-ball-joint-wear-causing-clunk-steering-wander-un': 'The frozen card relies on owner forums and applies upper-ball-joint wear, clunks, wandering, uneven tire wear, and looseness across 2002-2010 without an exact Ford primary source.',
  'ford-explorer-hard-dropping-brake-pedal-loss-braking-reported-2025-explore': 'The frozen card relies on a lemon-law article and complaint aggregator to claim a 2025 brake-pedal defect. NHTSA recall review did not identify a matching Explorer campaign, and complaint reports alone do not establish one cause or remedy.',
  'ford-explorer-hvac-blend-door-actuator-failure-causing-clicking-noise-no-h': 'The frozen card relies on an owner forum and a parts listing to diagnose HVAC blend-door actuator failure across 2011-2019 without an exact Ford bulletin or defined affected actuator and repair.',
  'ford-explorer-hvac-blower-motor-resistor-failure-melted-connector': 'The frozen card relies on generic aftermarket articles to apply resistor failure and melted wiring to 2011-2019. No Ford primary source reviewed defines this nine-year electrical defect and remedy.',
  'ford-explorer-instrument-cluster-gauge-failure-causing-erratic-dead-speedo': 'The frozen card relies on an owner forum and a repair vendor to apply cluster failure, erratic gauges, dead displays, and battery drain to every 2002-2005 Explorer without a Ford primary source.',
  'ford-explorer-intake-manifold-pcv-vacuum-leak-4-0l-sohc-causing-p0171-p017': 'The frozen card relies on an owner forum and generic code page to treat P0171/P0174 as proof of an intake or PCV vacuum leak across 1997-2003. No Ford primary source reviewed defines one leak point and remedy.',
  'ford-explorer-intake-valve-carbon-buildup-direct-injected-ecoboost-engines': 'The frozen card relies on a trade article and a Taurus SHO forum to apply intake-valve carbon buildup to every 2011-2019 Explorer EcoBoost configuration without Ford-specific population, threshold, diagnosis, or remedy.',
  'ford-explorer-interior-exterior-door-handle-breakage-causing-doors-that-wo': 'The frozen card relies on a forum and parts seller to combine interior and exterior handle breakage across 2002-2010 without a Ford bulletin, investigation, recall, or single affected component.',
  'ford-explorer-internal-radiator-transmission-cooler-rupture-causing-coolan': 'The frozen card relies on two owner-forum discussions to apply internal radiator/transmission-cooler rupture and fluid mixing across 2002-2006 without an exact Ford primary source or defined repair population.',
  'ford-explorer-internal-timing-chain-driven-water-pump-failure-leading-to-c': 'The frozen card relies on news, complaint, and lawsuit articles to apply internal water-pump failure and catastrophic coolant-oil mixing to 2011-2019. No Ford bulletin, investigation, or recall reviewed defines that entire nine-year defect and remedy.',
  'ford-explorer-internal-water-pump-failure': 'This card duplicates the other internal water-pump aggregation and relies only on forums. Keeping both would double-count the same unsupported 2011-2019 allegation.',
  'ford-explorer-liftgate-applique-panel-cracking-2002': 'The frozen card has no citations and applies cosmetic liftgate-applique cracking and water-entry claims to every 2002-2005 Explorer without an exact Ford bulletin, warranty program, or repair record.',
  'ford-explorer-panoramic-sunroof-moonroof-water-leak-tempered-glass-shatter': 'The frozen card combines drain or seal leaks with tempered-glass shattering across 2016-2023 using forums and a lemon-law article. These are distinct failure modes, and no Ford primary source reviewed supports the aggregation.',
  'ford-explorer-parasitic-battery-drain-from-wifi-apim-accessory-modules-cau': 'The frozen card relies on owner forums and assigns battery drain to Wi-Fi, APIM, or accessory modules across 2016-2020 without an exact Ford bulletin, measured draw, module state, or remedy.',
  'ford-explorer-power-folding-third-row-seat-motor-latch-failure': 'The frozen card relies on two forums to combine seat-motor and latch failure across 2016-2019 without a Ford bulletin, investigation, recall, or defined service procedure.',
  'ford-explorer-power-window-regulator-cable-clip-failure-causing-window-to': 'The frozen card relies on a forum and parts seller to apply regulator cable/clip failure to 16 model years without a Ford-defined defect, exact door positions, or remedy.',
  'ford-explorer-ptu-transfer-case-failure': 'This uncited card duplicates the retained primary-sourced PTU record but adds noise, leaks, warnings, overheating, and complete AWD failure across 2011-2019. The Ford bulletin supports a much narrower odor/fluid-breakdown condition.',
  'ford-explorer-rear-c-line-corrosion-leak-causing-no-rear-air-conditioning': 'The frozen card relies on owner forums to apply rear A/C line corrosion and refrigerant loss across 2011-2019 without a Ford bulletin, geographic population, affected line specification, or repair.',
  'ford-explorer-rear-coil-spring-rust-fracture-causing-sudden-ride-height-dr': 'The frozen card relies on complaint aggregators to apply rear coil-spring corrosion and fracture across 2002-2005. NHTSA recall review did not identify a matching Ford Explorer safety campaign, and no Ford service source was cited.',
  'ford-explorer-rear-wheel-bearing-and-2002': 'The frozen card has no citations and applies rear wheel-bearing noise, vibration, play, ABS warnings, and failure to every 2002-2010 Explorer without an exact Ford primary source or affected population.',
  'ford-explorer-throttle-body-failure-on-2006': 'The frozen card cites a third-party TSB index without the underlying Ford document and applies throttle-body failure to 2006-2010. No accessible Ford primary source reviewed substantiates the exact population, symptoms, and remedy.',
  'ford-explorer-timing-chain-cassette-and-2000': 'The frozen card has no citations and overlaps the earlier SOHC timing-chain card while extending cassette, guide, tensioner, rattle, timing, and engine-damage claims across 2000-2010. No exact Ford program or bulletin is tied to that scope.',
};

module.exports = buildConfig({
  label: 'Ford Explorer',
  make: 'Ford',
  model: 'Explorer',
  slug: 'ford-explorer',
  batchId: 'ford-explorer-full-record-cohort-111-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '19d85a781e68f2dcb2016af2ab8d59dff32278ce02d5bf48261e8fd996332ab7',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-explorer/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordexplorer_blind:manual-primary-source-gate',
    edge: 'fordexplorer_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
