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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Ranger&modelYear=${year}`;

const published = {
  'ford-ranger-timing-chain-guide-and-2001': replacement(
    {
      years: [2025, 2026],
      trims: ['Certain vehicles identified by VIN'],
      category: 'engine',
      title: 'Engine Failure and Loss-of-Drive-Power Recall 26S35',
      description:
        'NHTSA campaign 26V343 covers certain 2025-2026 Ford Ranger vehicles whose engine may fail, resulting in a sudden loss of drive power and increased crash risk.',
      solution:
        'Check the VIN for Ford recall 26S35 and the current remedy schedule. Ford directs replacement of the engine long block free of charge. A loss-of-power warning, abnormal engine behavior, or stalling requires prompt dealer diagnosis; the recall record does not support guessing a timing-chain cause.',
      severity: 'high',
      symptoms: ['Possible engine failure', 'Possible sudden loss of drive power'],
      affectedSystems: ['engine long block'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V343 / Ford Recall 26S35', url: recalls(2026) }],
      summary:
        'Replaced an uncited 2001-2011 timing-chain catastrophe narrative with the exact current Ranger engine-failure recall and long-block remedy.',
    },
    'No Ford primary source in the frozen record established universal guide failure, engine removal, debris circulation, or engine replacement for every 2001-2011 4.0L Ranger. Retain the exact current safety action instead.',
  ),

  'ford-ranger-10speed-shudder-2019': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      trims: ['Vehicles equipped with the 10R80 that meet the applicable Ford TSB criteria'],
      category: 'transmission',
      title: '10R80 Harsh or Delayed Engagement and Shifting',
      description:
        'Ford TSBs cover some 2019-2023 Ranger vehicles with harsh or delayed engagement or shifts and specified ratio, solenoid, or clutch-performance codes. Ford identifies hydraulic leakage from axial movement of the CDF clutch-cylinder sleeve as one possible cause; a separate current bulletin covers harsh 3-4 or 4-5 upshifts, harsh 5-3 or 4-3 downshifts, or harsh reverse on some 2022-2023 vehicles from F-clutch plate brinelling.',
      solution:
        'Retrieve codes and follow the model-year-specific Ford procedure. The diagnostic flow distinguishes software, valve-body, CDF sleeve, and F-clutch faults and may require internal inspection and targeted repair. Do not add friction modifier, perform repeated fluid changes, reset adaptations, or replace the torque converter without the applicable diagnosis.',
      severity: 'medium',
      symptoms: ['Harsh or delayed engagement', 'Harsh or delayed shifts', 'Harsh reverse engagement', 'Possible transmission-related MIL and DTCs'],
      affectedSystems: ['10R80 automatic transmission', 'main control valve body', 'CDF clutch-cylinder sleeve', 'F-clutch friction plates'],
      dtcCodes: ['P0751', 'P0752', 'P0756', 'P0757', 'P0761', 'P0762', 'P0766', 'P0767', 'P0771', 'P0772', 'P2700', 'P2701', 'P2702', 'P2703', 'P2704', 'P2705', 'P2707', 'P2708', 'P0729', 'P0731', 'P0732', 'P0733', 'P0734', 'P0735', 'P0736', 'P076F', 'P07D9', 'P07F6', 'P07F7'],
      sources: [
        { type: 'tsb', title: 'Ford 10R80 CDF Clutch-Cylinder TSB for 2019-2023 Ranger', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017141-0001.pdf' },
        { type: 'tsb', title: 'Ford 10R80 F-Clutch TSB for 2022-2023 Ranger', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034224-0001.pdf' },
      ],
      summary:
        'Replaced a generic shudder card with the exact Ford 10R80 symptoms, codes, CDF and F-clutch causes, and diagnostic repair scope.',
    },
    'Retain the Ford-defined 10R80 conditions while removing unsupported comparison to the F-150, adaptive-reset advice, friction modifier, repeated fluid changes, and automatic torque-converter replacement.',
  ),

  'ford-ranger-2-3l-lima-i4-oil-pan-gasket-leak-oil-pump-related-knock': replacement(
    {
      years: [1990],
      trims: ['Certain vehicles identified by campaign eligibility'],
      engines: ['4.0L'],
      category: 'engine',
      title: 'Throttle Lever Can Contact the Air-Inlet Tube',
      description:
        'NHTSA campaigns 89V234 and 90V044 cover certain 1990 Ranger trucks whose throttle lever may contact the throttle-body air-inlet tube, potentially leaving the throttle open after the accelerator is released from full throttle.',
      solution:
        'Check campaign completion by VIN with Ford. The remedy replaces the air-inlet tube with a revised part that provides more throttle-lever clearance. A throttle that does not return normally is an urgent safety condition; stop driving and arrange service rather than attempting an oil-system repair.',
      severity: 'high',
      symptoms: ['Throttle may remain open after release from full throttle'],
      affectedSystems: ['throttle lever', 'throttle-body air-inlet tube'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 89V234 and 90V044 - 1990 Ranger Throttle Clearance', url: recalls(1990) }],
      summary:
        'Replaced a secondary-source oil-pan and oil-pump narrative with the exact 1990 Ford throttle interference campaigns.',
    },
    'The frozen record combined two mechanisms, years, a cork-gasket theory, pickup blockage, revised oil pump, gallery plug, pressure-damping rod, and repair instructions without a Ford primary citation.',
  ),

  'ford-ranger-3-0l-vulcan-timing-cover-coolant-leak-leading-to-overheating': replacement(
    {
      years: [1994],
      trims: ['Certain vehicles identified by VIN'],
      category: 'fuel',
      title: 'Front Fuel-Line Cracking and Leak Recall',
      description:
        'NHTSA campaign 94V111001 covers certain 1994 Ford Ranger vehicles whose front fuel lines contain a flexible-hose section susceptible to cracking. A cracked hose can leak fuel and create a fire risk.',
      solution:
        'Check the VIN and recall-completion history with Ford. Dealers inspect the front fuel-line assembly and replace it when necessary. Fuel odor or visible leakage requires the engine to be shut off and the truck kept away from ignition sources until professionally inspected.',
      severity: 'high',
      symptoms: ['Fuel odor', 'Possible visible leak from the front fuel-line assembly'],
      affectedSystems: ['front fuel-line assembly', 'flexible fuel hose section'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 94V111001 - Ford Ranger Front Fuel Line', url: recalls(1994) }],
      summary:
        'Replaced a forum-based universal timing-cover coolant-leak and cracked-head narrative with the exact 1994 fuel-line safety recall.',
    },
    'The frozen card extrapolated forum reports into a ten-year dissimilar-metal defect, universal head damage, RTV and thread-sealant procedure, oil-pan disturbance, and pressure-test prescription without Ford evidence.',
  ),

  'ford-ranger-a4ld-4-speed-automatic-transmission-failures': replacement(
    {
      years: [2024],
      trims: ['Certain vehicles identified by VIN'],
      category: 'transmission',
      title: 'Transmission Valve-Body Recall for Unexpected Movement',
      description:
        'NHTSA campaign 25V164 covers certain 2024 Ranger vehicles with an incorrectly machined transmission valve body. The condition can cause reverse-gear failure or unexpected forward movement while reverse or neutral is selected.',
      solution:
        'Check the VIN for Ford recall 25S19. Ford dealers replace the transmission main control valve body free of charge. Until repaired, unexpected movement or a mismatch between the selected direction and vehicle movement requires immediate service; apply the parking brake whenever parked.',
      severity: 'high',
      symptoms: ['Reverse gear may fail', 'Vehicle may move forward while reverse or neutral is selected'],
      affectedSystems: ['transmission main control valve body'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V164 / Ford Recall 25S19', url: recalls(2024) }],
      summary:
        'Replaced a broad enthusiast-sourced A4LD weak-point narrative with the exact current Ranger valve-body safety recall.',
    },
    'The frozen card mixed solenoids, sprag, bands, governor, cable adjustment, towing, rebuilds, coolers, and fluid service without a Ford-defined failure population. Retain the exact transmission safety action instead.',
  ),

  'ford-ranger-automatic-transmission-slips-out-park': replacement(
    {
      years: [1991],
      trims: ['Certain automatic-transmission vehicles identified by campaign eligibility'],
      category: 'transmission',
      title: 'Automatic-Transmission Park-Pawl Recall 91V189',
      description:
        'NHTSA campaign 91V189 covers certain 1991 Ford Ranger vehicles whose automatic-transmission park pawl may not fully engage the park gear when Park is selected. The truck can then roll unexpectedly.',
      solution:
        'Check recall completion by VIN with Ford. The campaign repair installs a new park pawl. Use the parking brake before relying on Park, especially on a grade, and arrange immediate inspection if the truck moves after Park is selected.',
      severity: 'high',
      symptoms: ['Vehicle may roll after Park is selected'],
      affectedSystems: ['automatic-transmission park pawl', 'park gear'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 91V189 - Ford Ranger Park Pawl', url: recalls(1991) }],
      summary:
        'Kept the real park-pawl recall while correcting the frozen five-year scope, removing approximate population claims, and linking directly to the Ranger recall result.',
    },
    'Retain the exact safety campaign rather than a broad 1990-1994 claim and secondary buyer-guide citation.',
  ),

  'ford-ranger-brake-shudder-2019': replacement(
    {
      years: [2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'brakes',
      title: 'Electronic Brake Booster Loss-of-Assist Recalls',
      description:
        'NHTSA campaign 25V488 covers certain 2025 Ranger vehicles whose electronic brake booster module can malfunction, causing a loss of power brake assist while driving or while an advanced driver-assistance feature is active. Campaign 25V823 provides electronic brake booster replacement for covered vehicles.',
      solution:
        'Check the VIN for Ford recalls 25S77 and 25SD4 even after an earlier software action. Depending on campaign status, Ford updates the module software or replaces the electronic brake booster free of charge. A sudden hard pedal or reduced assist requires increased pedal force and immediate service.',
      severity: 'high',
      symptoms: ['Possible loss of power brake assist', 'Longer stopping distance or braking not occurring as expected during ADAS operation'],
      affectedSystems: ['electronic brake booster', 'electronic brake booster control software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 25V488 and 25V823 - 2025 Ranger Electronic Brake Booster', url: recalls(2025) }],
      summary:
        'Replaced an uncited generic rotor-warping card with the exact current electronic brake-booster safety actions.',
    },
    'The frozen card prescribed rotors, resurfacing, bedding, towing upgrades, and driving-style changes without Ford evidence. Retain the verified brake-assist risk instead.',
  ),

  'ford-ranger-camshaft-synchronizer-chirp-and-2000': replacement(
    {
      years: [2011],
      trims: ['Certain trucks and certain service switches identified by recall eligibility'],
      category: 'electrical',
      title: 'Multi-Function Switch Recall for Inoperative Rear Lamps',
      description:
        'NHTSA campaign 11V352 covers certain 2011 Ranger trucks and specified service switches distributed for 2004-2011 Rangers. A deformed slider in the multi-function switch can prevent turn signals, tail lamps, hazard flashers, or brake lamps from activating.',
      solution:
        'Check the VIN and any service-switch history with Ford. Dealers replace covered multi-function switches free of charge. Verify all rear lighting functions before driving and arrange prompt repair if stop, turn, hazard, position, or reverse lamps fail.',
      severity: 'high',
      symptoms: ['Turn signals, tail lamps, hazard flashers, or brake lamps may not activate'],
      affectedSystems: ['multi-function switch slider', 'rear exterior lighting circuits'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 11V352 - Ranger Multi-Function Switch', url: recalls(2011) }],
      summary:
        'Replaced an uncited camshaft-synchronizer narrative with the exact 2011 truck and service-switch lighting recall.',
    },
    'The frozen card asserted a multi-engine wear mechanism, oil-pump-drive failure, sensor failure, debris, alignment, and replacement for twelve model years from one forum citation. Retain the exact Ford recall instead.',
  ),

  'ford-ranger-cruise-control-deactivation-switch-2000': replacement(
    {
      years: [1995, 1996, 1997, 2000, 2001, 2002, 2003],
      trims: ['Vehicles equipped with the affected speed-control deactivation switch and identified by VIN'],
      category: 'electrical',
      title: 'Speed-Control Deactivation Switch Fire Recalls',
      description:
        'NHTSA campaigns 07V336 and 09V399 include specified Ranger populations with a speed-control deactivation switch that can leak internally, overheat, smoke, or burn. The electrical event can occur even when the vehicle is not being driven.',
      solution:
        'Check the VIN for every applicable Ford speed-control campaign. The recall remedy installs a fused wiring harness in line with the switch; follow current Ford instructions for any leaking or heat-damaged components. Smoke, heat, or burning odor near the master-cylinder area requires immediate isolation from structures and professional service.',
      severity: 'high',
      symptoms: ['Possible smoke, overheating, or fire at the speed-control deactivation switch'],
      affectedSystems: ['speed-control deactivation switch', 'fused switch wiring harness'],
      sources: [
        { type: 'recall', title: 'NHTSA Speed-Control Recall Results - 2000 Ford Ranger', url: recalls(2000) },
        { type: 'recall', title: 'NHTSA Speed-Control Recall Results - 1995 Ford Ranger', url: recalls(1995) },
      ],
      summary:
        'Retained the documented switch fire risk with direct NHTSA campaign links and exact fused-harness remedy, removing unsupported connector-cleaning instructions.',
    },
    'Keep the real recalls, but do not infer the condition from owner complaints or prescribe cleaning and reuse of contaminated connectors outside Ford procedure.',
  ),

  'ford-ranger-diff-whine-2019': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      trims: ['Non-Tremor vehicles that meet Ford TSB 23-2250 criteria'],
      category: 'drivetrain',
      title: 'Take-Off Shudder from Rear-Axle Pinion or Driveline Angles',
      description:
        'Ford TSB 23-2250 covers some 2019-2023 non-Tremor Ranger vehicles with a shudder or vibration during acceleration. Ford identifies excessive rear-axle pinion angle on rear-wheel-drive trucks, or the pinion and driveshaft assemblies on four-wheel-drive non-Tremor trucks, as the covered causes.',
      solution:
        'Confirm that the symptom and vehicle configuration match the bulletin. Ford directs rear-axle pinion-angle adjustment on 4x2 vehicles or replacement of the rear axle pinion and driveshaft on qualifying 4x4 non-Tremor vehicles. Do not diagnose a differential rebuild from highway whine alone.',
      severity: 'medium',
      symptoms: ['Shudder or vibration while accelerating from a stop'],
      affectedSystems: ['rear axle pinion angle', 'rear axle pinion', 'driveshaft assembly'],
      sources: [{ type: 'tsb', title: 'Ford TSB 23-2250 - 2019-2023 Ranger Take-Off Shudder', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241524-0001.pdf' }],
      summary:
        'Corrected a generic differential-whine card to the exact Ford non-Tremor take-off shudder, configurations, cause branches, and repairs.',
    },
    'Retain the Ford bulletin condition while removing low-fluid guesses, universal ring-and-pinion setup claims, gear-oil service, warranty promises, and axle replacement anecdotes.',
  ),

  'ford-ranger-fuel-filler-neck-and-2000': replacement(
    {
      years: [2022, 2024],
      trims: ['2022 vehicles with 2.3L engines and certain 2024 vehicles identified by VIN'],
      engines: ['2.3L (2022 campaign)'],
      category: 'fuel',
      title: 'Fuel-Line, Vapor-Line, and Pump-Fastener Leak Recalls',
      description:
        'NHTSA campaign 22V685 covers certain 2022 2.3L Rangers with an improperly tightened fuel-line connection. Campaign 24V848 covers certain 2024 trucks whose fuel-vapor-line bracket can damage the line. Campaign 25V597 covers certain 2024 trucks with improperly tightened high-pressure fuel-pump bolts. Each condition can cause a fuel or vapor leak and increase fire risk.',
      solution:
        'Check the VIN for Ford recalls 22S60, 24S71, and 25S90. Depending on the campaign, Ford inspects or replaces the fuel-line assembly, secures the vapor line, or replaces the high-pressure fuel-pump mounting bolts free of charge. Fuel odor or visible leakage requires immediate shutdown away from ignition sources.',
      severity: 'high',
      symptoms: ['Fuel odor', 'Possible fuel or fuel-vapor leak'],
      affectedSystems: ['fuel-line connection', 'fuel-vapor line and bracket', 'high-pressure fuel-pump mounting bolts'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 22V685 / Ford 22S60', url: recalls(2022) },
        { type: 'recall', title: 'NHTSA Campaigns 24V848 and 25V597 / Ford 24S71 and 25S90', url: recalls(2024) },
      ],
      summary:
        'Replaced an owner-forum corrosion card with the exact modern Ranger liquid-fuel and vapor-leak campaigns and their distinct repairs.',
    },
    'The frozen card asserted regional filler-neck and strap corrosion, tank movement, EVAP codes, and wholesale replacement from one forum thread. Retain the Ford-defined leak campaigns instead.',
  ),

  'ford-ranger-instrument-cluster-solder-joint-2000': replacement(
    {
      years: [2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Instrument-Panel Configuration Recall 25C23',
      description:
        'NHTSA campaign 25V399 covers certain 2025 Ranger trucks whose instrument panel was not configured correctly. Safety warnings and gauges—including forward-collision, automatic-emergency-braking, traction-control, roll-stability, fuel, distance-to-empty, and fuel-economy information—may not display correctly.',
      solution:
        'Check the VIN for Ford recall 25C23. Ford dealers update the instrument-panel software free of charge. Missing or inaccurate safety warnings or gauges should not be treated as a solder-joint repair from the frozen card.',
      severity: 'high',
      symptoms: ['Safety warnings or gauges may be missing or inaccurate'],
      affectedSystems: ['instrument-panel software', 'warning lamps and gauges'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V399 / Ford Recall 25C23', url: recalls(2025) }],
      summary:
        'Replaced a forum-based eleven-year cracked-solder narrative with the exact current Ranger instrument-panel software recall.',
    },
    'The frozen card prescribed circuit-board reflow, replacement clusters, mileage programming, and PATS assumptions without Ford evidence. Retain the exact current compliance defect instead.',
  ),

  'ford-ranger-leaf-spring-shackle-and-2000': replacement(
    {
      years: [2024, 2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'suspension',
      title: 'Front Upper Control-Arm Ball-Joint Fastener Recalls',
      description:
        'NHTSA campaigns 24V770 and 25V310 cover certain 2024-2025 Ranger vehicles whose front upper control-arm ball-joint fastener may be missing, loose, or improperly tightened. The control arm can detach from the knuckle, causing a loss of steering and vehicle control.',
      solution:
        'Check the VIN for Ford recalls 24S64 and 25S45, including after a prior inspection. Ford dealers inspect and tighten or replace the fastener and, when required by the campaign, replace related ball-joint or knuckle components free of charge.',
      severity: 'high',
      symptoms: ['Loose or missing upper ball-joint fastener', 'Possible control-arm separation and loss of steering control'],
      affectedSystems: ['front upper control arm', 'upper ball joint fastener', 'steering knuckle'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 24V770 and 25V310 - Ranger Upper Control Arm', url: recalls(2024) }],
      summary:
        'Replaced an uncited rust-belt shackle and welding narrative with the exact current upper-control-arm safety recalls.',
    },
    'The frozen card generalized salt corrosion and frame welding to twelve model years without a Ford-defined population or repair. Retain the exact suspension safety actions instead.',
  ),

  'ford-ranger-plastic-thermostat-housing-cracks-2001': replacement(
    {
      years: [2000],
      trims: ['Certain vehicles identified by VIN'],
      engines: ['2.5L OHC'],
      category: 'hvac',
      title: 'Plugged Heater Return Tube and Defrost Recall',
      description:
        'NHTSA campaign 00V094 covers certain 2000 Ranger trucks with 2.5L OHC engines. A plugged heater return tube at the water pump can prevent coolant circulation through the heater circuit, impairing windshield defrosting and defogging performance.',
      solution:
        'Check recall completion by VIN with Ford. Dealers replace the plugged heater water-return tube. If cabin heat or windshield clearing is inadequate, confirm coolant level safely and have the heater circuit diagnosed rather than assuming a cracked thermostat housing.',
      severity: 'high',
      symptoms: ['Inadequate heater output', 'Impaired windshield defrosting or defogging'],
      affectedSystems: ['heater water-return tube', 'heater coolant circuit', 'windshield defrosting system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 00V094 - 2000 Ranger Heater Return Tube', url: recalls(2000) }],
      summary:
        'Replaced a forum-based eleven-year plastic-housing claim with the exact 2000 2.5L heater-circuit compliance recall.',
    },
    'The frozen record had no Ford source for a universal plastic housing defect, updated parts, bundled thermostat replacement, bleeding, fan diagnosis, or head-gasket testing.',
  ),

  'ford-ranger-sync3-freeze-2019': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      trims: ['Vehicles equipped with SYNC 3 that meet Ford TSB 24-2185 criteria'],
      category: 'electrical',
      title: 'SYNC 3 Software Performance Concerns',
      description:
        'Ford TSB 24-2185 covers various SYNC 3 performance concerns on some 2019-2023 Ranger vehicles and identifies SYNC software as the cause. Earlier Ford communications specifically included frozen or unresponsive screens among the covered symptoms.',
      solution:
        'Confirm the symptom and current software level, then follow the Ford service procedure to update APIM software. Use normal Workshop Manual diagnosis if the condition remains after the applicable update; do not replace the APIM, disconnect hardware, or blame USB devices without evidence.',
      severity: 'medium',
      symptoms: ['Frozen or unresponsive infotainment screen', 'Other Ford-defined SYNC 3 performance concerns'],
      affectedSystems: ['SYNC 3 software', 'Accessory Protocol Interface Module'],
      sources: [{ type: 'tsb', title: 'Ford TSB 24-2185 - SYNC 3 Performance Concerns', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001646-0001.pdf' }],
      summary:
        'Replaced a fabricated video citation and generic troubleshooting with the current Ford SYNC 3 software bulletin and APIM update path.',
    },
    'Retain the Ford software condition while removing unsupported climate-control impact, loose-connection diagnosis, master-reset prescription, USB blame, and automatic APIM replacement.',
  ),

  'ford-ranger-takata-passenger-airbag-inflator-2004': replacement(
    {
      years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
      trims: ['Coverage, geographic phase, and prior-repair status vary by VIN'],
      category: 'safety',
      title: 'Takata Driver and Passenger Airbag Inflator Recalls',
      description:
        'Multiple NHTSA campaigns cover 2004-2011 Ranger driver or passenger frontal airbag inflators that may rupture during deployment and send metal fragments into the cabin. Ford issued phased, superseding, and corrective campaigns, so a vehicle repaired under an earlier action may still require another inflator replacement.',
      solution:
        'Check the VIN for every open Ford airbag campaign and follow any do-not-drive instruction shown for that vehicle. Ford dealers replace the covered inflator or module free of charge. Do not rely on model year, geography, or an earlier repair receipt as proof that all current actions are complete.',
      severity: 'high',
      symptoms: ['No reliable warning occurs before an inflator rupture during deployment'],
      affectedSystems: ['driver frontal airbag inflator', 'passenger frontal airbag inflator'],
      sources: [
        { type: 'recall', title: 'NHTSA Airbag Recall Results - 2004 Ford Ranger', url: recalls(2004) },
        { type: 'recall', title: 'NHTSA Airbag Recall Results - 2011 Ford Ranger', url: recalls(2011) },
      ],
      summary:
        'Expanded the frozen passenger-only card to the direct NHTSA driver, passenger, phased, superseding, and corrective campaign history through the latest Ranger actions.',
    },
    'Retain this critical documented risk, but require a live VIN check because campaign scope and prior-repair status are more complex than the frozen regional summary.',
  ),

  'ford-ranger-transfer-case-2019': replacement(
    {
      years: [2021],
      trims: ['Four-wheel-drive vehicles built 06-Apr-2021 through 26-Jul-2021 that meet Ford communication criteria'],
      category: 'drivetrain',
      title: '4WD Mode-Select Module Hardware Communication Fault',
      description:
        'Ford SSM 50231 covers some 2021 four-wheel-drive Rangers built from 06-Apr-2021 through 26-Jul-2021 that set one or more controller-area-network communication DTCs. Ford identifies an internal hardware fault in the all-terrain control module and mode-select switch as the covered cause.',
      solution:
        'Confirm the build date, stored communication codes, and module network state with Ford diagnostic equipment. Follow SSM 50231 and the Workshop Manual for the qualifying hardware fault; do not replace a transfer case motor or change fluid from a generic delayed-shift report.',
      severity: 'medium',
      symptoms: ['One or more vehicle-network communication fault codes', 'Possible 4WD mode-selection concern'],
      affectedSystems: ['all-terrain control module', 'mode-select switch', 'controller-area network'],
      sources: [{ type: 'tsb', title: 'Ford SSM 50231 - 2021 Ranger 4WD ATCM/Mode-Select Hardware Fault', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203657-0001.pdf' }],
      summary:
        'Narrowed a five-year Reddit-based transfer-case card to Ford SSM 50231, its exact build window, 4WD configuration, network-code condition, and hardware cause.',
    },
    'Retain the exact Ford communication while removing fluid advice, driving procedure, software-update assumption, and transfer-case motor or encoder replacement from a forum report.',
  ),

  'ford-ranger-water-leak-2019': replacement(
    {
      years: [2022, 2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'body',
      title: 'Windshield Bonding Recalls',
      description:
        'NHTSA campaign 22V451 covers certain 2022 Ranger windshields that may not have been properly bonded and could detach in a crash. Campaign 25V683 covers a separate population of 2025 Rangers with the same windshield-mounting noncompliance.',
      solution:
        'Check the VIN for Ford recalls 22C12 and 25C52. Ford dealers remove and reinstall or replace the covered windshield free of charge according to the applicable campaign. Suspected separation at a bonded edge requires prompt inspection.',
      severity: 'high',
      symptoms: ['Possible windshield separation from the body during a crash'],
      affectedSystems: ['windshield bonding', 'windshield mounting'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 22V451 / Ford 22C12', url: recalls(2022) },
        { type: 'recall', title: 'NHTSA Campaign 25V683 / Ford 25C52', url: recalls(2025) },
      ],
      summary:
        'Replaced a video-based rear-window and brake-light resealing card with the exact 2022 and 2025 windshield-bonding recalls.',
    },
    'The frozen card generalized rear-window and third-brake-light leakage, carpet damage, electrical risk, drain holes, and resealing to every 2019-2023 truck without Ford evidence.',
  ),

  'ford-ranger-wind-noise-2019': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      trims: ['Recall coverage and remedy vary by VIN, camera hardware, and software'],
      category: 'electrical',
      title: 'Rearview-Camera Hardware and Software Recalls',
      description:
        'Ranger rearview-camera campaigns include 20V575 for a poor electrical connection on certain 2020 cameras, 25V572 for distorted, inverted, or blank images on certain 2019 cameras, 25V442 for a blank or persistent image from software on certain 2019-2023 trucks, and 25V315 for delayed, frozen, or missing images on certain 2024 vehicles.',
      solution:
        'Check the VIN for every open Ford camera campaign, including newer actions after an earlier repair. Depending on the campaign, Ford replaces or inspects the camera or updates rearview-camera/APIM software free of charge. Continue direct visual checks while reversing.',
      severity: 'high',
      symptoms: ['Blank, distorted, inverted, delayed, frozen, intermittent, or persistent rearview image'],
      affectedSystems: ['rearview camera', 'camera electrical connection', 'rearview-camera software', 'APIM software'],
      sources: [
        { type: 'recall', title: 'NHTSA 2019 Ranger Camera Recall Results', url: recalls(2019) },
        { type: 'recall', title: 'NHTSA 2020 Ranger Camera Recall Results', url: recalls(2020) },
        { type: 'recall', title: 'NHTSA 2024 Ranger Camera Recall Results', url: recalls(2024) },
      ],
      summary:
        'Replaced an uncited wind-noise and aftermarket-weatherstrip card with the distinct Ranger camera hardware, connection, and software safety campaigns through 2026.',
    },
    'The frozen card had no citation for a universal door, mirror, or A-pillar seal defect or warranty replacement. Retain the verified visibility safety campaigns instead.',
  ),
};

const reasons = {
  'ford-ranger-4-0l-sohc-ohv-waste-spark-coil-pack-misfire':
    'The frozen card merges two engine families and nineteen model years into one high-failure coil-pack theory from forums and generic diagnostic sites, then prescribes an invalid coil-position swap on a single pack, parts replacement, and vacuum-leak diagnosis without a Ford bulletin.',
  'ford-ranger-auto-start-stop-2019':
    'The frozen card describes normal default-on start-stop behavior and subjective aggressiveness as a defect, cites a fabricated-looking video URL, and promotes an aftermarket defeat device without Ford evidence.',
  'ford-ranger-camshaft-synchronizer-chirp-failure':
    'This duplicates the other synchronizer card and expands it to engines and years that may not use the described assembly, while relying on enthusiast and secondary sources for catastrophic oil-pressure failure, brand recommendations, and aftermarket failure mileage.',
  'ford-ranger-door-ajar-switch-failure-2000':
    'The frozen card has no citation and applies one latch-switch contamination mechanism, dome-lamp drain, lock behavior, cleaning method, and replacement path to twelve model years without Ford-defined symptoms or scope.',
  'ford-ranger-sticky-idle-air-control-valve-causing-hard-starting-stalling':
    'A general buyer-guide page does not establish one IAC carbon defect on every 1995-1997 Ranger, and the frozen card prescribes solvent cleaning as a universal inexpensive DIY repair without engine, code, build, or Ford procedure boundaries.',
  'ford-ranger-throttle-position-sensor-and-2000':
    'The frozen card combines TPS, IAC, throttle-body deposits, vacuum leaks, PCV hoses, intake gaskets, live-data testing, parts replacement, and idle reset across twelve model years without any citation or Ford-defined condition.',
};

module.exports = buildConfig({
  label: 'Ford Ranger',
  make: 'Ford',
  model: 'Ranger',
  slug: 'ford-ranger',
  batchId: 'ford-ranger-full-record-cohort-131-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '60bd3e0cfd7f3ffdbc2f27727cc87456adcc6276a2d681b5f60ba14b8b1b2469',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-ranger/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordranger_blind:manual-primary-source-gate',
    edge: 'fordranger_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
