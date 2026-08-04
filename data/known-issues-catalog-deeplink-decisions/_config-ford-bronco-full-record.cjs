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
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const hardtopLeak = {
  years: [2021, 2022],
  trims: ['Vehicles equipped with a hardtop roof'],
  engines: [],
  category: 'body',
  title: 'Misadjusted Front Hardtop Panels Can Leak or Be Difficult to Latch',
  description:
    'Ford service information covers some 2021-2022 Bronco vehicles with a hardtop roof whose front roof panels sit at an uneven height. Incorrect vertical adjustment of the front roof-panel latch strikers can cause poor appearance, excessive wind noise, water leaks, or difficulty latching.',
  solution:
    'Have a Ford dealer confirm that the bulletin applies. Ford\'s service procedure calls for adjustment of the front-panel latch strikers. The bulletin does not support treating every Bronco leak location or replacing and lubricating every seal as a universal repair.',
  severity: 'medium',
  symptoms: ['Uneven front roof-panel height', 'Excessive wind noise', 'Water leak at the front roof panels', 'Difficulty latching a front roof panel'],
  affectedSystems: ['front hardtop roof panels', 'front roof-panel latch strikers'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - 2021-2022 Bronco Hardtop Front Panel Adjustment', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216460-0001.pdf' }],
  source: 'manual',
  summary:
    'Narrowed the broad three-year leak aggregation to Ford\'s exact 2021-2022 hardtop front-panel condition, failure cause, symptoms, and latch-striker adjustment.',
};

const automaticShift = {
  years: [2021, 2022, 2023],
  trims: ['Vehicles equipped with the 10R60 automatic transmission'],
  engines: [],
  category: 'transmission',
  title: '10R60 Harsh or Delayed Engagement and Shifting',
  description:
    'Ford service information covers some 2021-2023 Bronco vehicles with the 10R60 transmission that exhibit harsh or delayed engagement or shifting, sometimes with the malfunction indicator lamp and PCM or TCM diagnostic codes. Ford identifies possible PCM/TCM software, transmission-solenoid ID strategy, or sticking main-control valve-body valves as causes.',
  solution:
    'Have a Ford dealer or qualified transmission technician follow Ford\'s service procedure to identify which documented condition applies and perform the specified correction. The bulletin does not support assuming a software update alone, unrelated park-pawl recall coverage, or the frozen generic DTC list.',
  severity: 'medium',
  symptoms: ['Harsh engagement', 'Delayed engagement', 'Harsh shifting', 'Delayed shifting', 'Malfunction indicator lamp with PCM or TCM codes'],
  affectedSystems: ['10R60 transmission', 'PCM/TCM software', 'main control valve body'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - 2021-2023 Bronco 10R60 Harsh or Delayed Shift', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10246125-0001.pdf' }],
  source: 'manual',
  summary:
    'Rewrote the card from Ford\'s 10R60 bulletin, preserving only its exact years, symptoms, possible causes, and diagnostic service path while removing unsupported shift scenarios, DTCs, and recall blending.',
};

const oilGalleyProgram = {
  years: [2023],
  trims: ['Affected VINs built at Michigan Assembly Plant from December 3-5, 2022'],
  engines: ['2.3L gasoline engine'],
  category: 'engine',
  title: 'Main Oil-Galley Plug May Not Seal Correctly (Program 23B08)',
  description:
    'Ford Customer Satisfaction Program 23B08 covered certain 2023 Bronco 2.3L vehicles built at Michigan Assembly Plant from December 3 through December 5, 2022. A damaged engine-block machining tool may have allowed the main oil galley to exceed specification, preventing the main oil-galley plug from sealing correctly and allowing an engine-block oil leak.',
  solution:
    'Check the VIN and service history with Ford. Program 23B08 instructed dealers to replace the engine assembly at no charge on affected vehicles and was in effect through March 31, 2024 with no mileage limit. Because that published program term has ended, ask Ford whether the VIN was completed or whether current assistance applies.',
  severity: 'high',
  symptoms: ['Oil leak from the engine block'],
  affectedSystems: ['engine block main oil galley', 'main oil-galley plug'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford Customer Satisfaction Program 23B08 - Recommended Engine Replacement', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10233849-0001.pdf' }],
  source: 'manual',
  summary:
    'Rewrote the card from Ford\'s program letter with exact build dates, machining cause, oil-leak consequence, engine-replacement action, and expired program term, removing trim guesses and unsupported starvation, fire, odor, and knock claims.',
};

const intakeValveRecall = {
  years: [2021, 2022],
  trims: ['Vehicles included in Ford recall 24S55 / NHTSA 24V635'],
  engines: ['2.7L Nano EcoBoost', '3.0L Nano EcoBoost when included by VIN'],
  category: 'engine',
  title: 'Engine Intake Valves Can Break and Cause Loss of Drive Power (Recall)',
  description:
    'Ford recall 24S55, NHTSA campaign 24V635, covers certain 2021-2022 Bronco and other Ford/Lincoln vehicles equipped with 2.7L or 3.0L Nano EcoBoost engines. An intake valve may break while driving, causing engine failure and loss of drive power and increasing crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers perform an engine cycle test and replace the engine as necessary, free of charge. The recall record does not establish the frozen alloy explanation, low-mileage threshold, warning sounds, or a universal 10-year/150,000-mile warranty for every Bronco.',
  severity: 'high',
  symptoms: ['Engine failure while driving', 'Loss of drive power'],
  affectedSystems: ['engine intake valves', 'engine assembly'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Ford Recall 24S55 - 2021-2022 Engine Intake Valves', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/24s55-bronco-edge-explorer-f-150-2021-2022-engine-intake-valves-recall/' }],
  source: 'manual',
  summary:
    'Narrowed the valve card to Ford/NHTSA recall 24S55/24V635 and its exact engine-test and conditional-replacement remedy, removing unsupported metallurgy, mileage, symptom, and warranty claims.',
};

const manualScraping = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles equipped with the MT88 manual transmission'],
  engines: [],
  category: 'transmission',
  title: 'MT88 Rotational Scraping Noise From 5th/6th Synchronizer Rings',
  description:
    'Ford service information covers some 2021-2024 Bronco vehicles with the MT88 manual transmission that exhibit a rotational scraping noise in neutral, first, or second gear with the clutch pedal released. The sound may be more noticeable below 50°F (10°C) after a cold soak and may diminish as the transmission warms. Ford identifies the fifth- and sixth-gear synchronizer rings as the cause.',
  solution:
    'Have a Ford dealer verify that the bulletin applies and follow its current service procedure for the fifth- and sixth-gear synchronizer-ring condition. The bulletin does not support a generic complete-transmission replacement, parts-backorder prediction, broad DTC list, or owner cost estimate.',
  severity: 'medium',
  symptoms: ['Rotational scraping noise in neutral, first, or second gear with clutch released', 'Noise more noticeable after a cold soak below 50°F', 'Noise may diminish as the transmission warms'],
  affectedSystems: ['MT88 manual transmission', 'fifth- and sixth-gear synchronizer rings'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - 2021-2024 Bronco MT88 Rotational Scraping Noise', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251466-0001.pdf' }],
  source: 'manual',
  summary:
    'Updated the population through 2024 and rewrote the card from Ford\'s superseding MT88 bulletin, removing unsupported grinding scenarios, DTCs, transmission replacement, backorder, and cost claims.',
};

const batteryDraw = {
  years: [2021, 2022, 2023, 2024],
  trims: [],
  engines: [],
  category: 'electrical',
  title: 'Damaged Interior Door-Lock Switch Can Cause a Parasitic Battery Draw',
  description:
    'Ford service information states that some 2021-2024 Bronco vehicles may exhibit a parasitic battery draw caused by an interior door-lock switch on the driver or passenger door panel. A sustained draw can discharge the 12-volt battery and result in slow cranking or a no-start condition.',
  solution:
    'Before continuing with normal battery-draw diagnostics, inspect both front interior door-lock control switches for damage and correct operation and repair a switch that does not operate as designed. If neither switch is at fault or the draw remains, continue with Ford Workshop Manual Section 414-00 diagnostics.',
  severity: 'medium',
  symptoms: ['Measured parasitic battery draw', 'Discharged 12-volt battery', 'Slow crank or no-start after the battery discharges'],
  affectedSystems: ['front interior door-lock control switches', '12-volt battery'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford SSM - 2021-2024 Bronco Parasitic Draw and Door-Lock Switches', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10250522-0001.pdf' }],
  source: 'manual',
  summary:
    'Replaced the generic owner-report battery card with Ford\'s exact 2021-2024 door-lock-switch parasitic-draw service message and its inspection-first diagnostic path.',
};

const windowInitialization = {
  years: [2021, 2022, 2023, 2024],
  trims: [],
  engines: [],
  category: 'body',
  title: 'Door Windows Can Repeatedly Lose Short-Drop and One-Touch Initialization',
  description:
    'Ford service information covers some 2021-2024 Bronco vehicles with repeat loss of power-window initialization. The condition can disable the frameless-window short-drop function and/or one-touch up and down operation and may be caused by a recent short-drop enhancement in the driver and passenger door-module software.',
  solution:
    'Ford\'s procedure calls for updating the driver door module and passenger door module to the latest software, then running the Loss Of Power Window Initialization Concern application in Ford Diagnosis and Repair System. Diagnose separate latch, alignment, or low-voltage concerns on their own evidence.',
  severity: 'medium',
  symptoms: ['Loss of window short-drop operation', 'Loss of one-touch window up operation', 'Loss of one-touch window down operation'],
  affectedSystems: ['driver door module', 'passenger door module', 'power-window initialization'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford SSM - 2021-2024 Bronco Repeat Loss of Window Initialization', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10254136-0001.pdf' }],
  source: 'manual',
  summary:
    'Replaced the incorrect Mazda PDF and broad latch/alignment narrative with Ford\'s exact 2021-2024 window-initialization software condition and FDRS remedy.',
};

const steeringRecall = {
  years: [2022, 2023],
  trims: ['2022 Bronco Raptor', '2023 Bronco Wildtrak included in NHTSA 23V155 / Ford 23S09'],
  engines: [],
  category: 'safety',
  title: 'Internal Steering-Gear Damage Can Lock the Steering Wheel (Recall)',
  description:
    'NHTSA campaign 23V155, Ford recall 23S09, covers certain 2022 Bronco Raptor and 2023 Bronco Wildtrak vehicles. Internal steering-gear damage can require increased steering effort or cause the steering wheel to lock, resulting in complete loss of steering control and increased crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Owners in the campaign were advised not to drive until repaired; dealers replace the steering gear free of charge. The campaign does not support extending the claim to all 2021-2024 Broncos or adding unrelated wiring, battery, DTC, and paid-repair guidance.',
  severity: 'high',
  symptoms: ['Increased steering effort', 'Steering wheel lock-up'],
  affectedSystems: ['steering gear'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 2022 Ford Bronco (Campaign 23V155000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco&modelYear=2022' }],
  source: 'manual',
  summary:
    'Narrowed the four-year steering-rack aggregation to the exact Raptor/Wildtrak safety recall, its two warning conditions, do-not-drive instruction, and free steering-gear replacement.',
};

const seatBeltRecall = {
  years: [2021, 2022, 2023],
  trims: ['5-door body style included in NHTSA 23V358 / Ford 23C16'],
  engines: [],
  category: 'safety',
  title: 'Front Seat-Belt Latch Plates May Be Difficult to Access (Recall)',
  description:
    'NHTSA campaign 23V358, Ford recall 23C16, covers certain 2021-2023 Bronco vehicles with the 5-door body style. The first-row seat-belt latch plates may be difficult to access from their stowed position, potentially discouraging belt use and increasing injury risk in a crash. This is not a pretensioner non-deployment campaign.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers add a sliding clip latch stop to the driver and front-passenger seat belts free of charge. The campaign does not call for pretensioner replacement or support the frozen SRS DTC list.',
  severity: 'high',
  symptoms: ['Driver or front-passenger seat-belt latch plate is difficult to access from its stowed position'],
  affectedSystems: ['driver seat belt', 'front-passenger seat belt', 'latch-plate stowage'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 2021 Ford Bronco (Campaign 23V358000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco&modelYear=2021' }],
  source: 'manual',
  summary:
    'Corrected the component from pretensioners to first-row latch-plate accessibility and rewrote the card to the exact 5-door recall population and sliding-clip remedy.',
};

const micRoofRecall = {
  years: [2021, 2022],
  trims: ['3-door and 5-door MIC hardtop vehicles included in NHTSA 26V299 / Ford 26S32'],
  engines: [],
  category: 'safety',
  title: 'MIC Hardtop Outer Panel Can Separate and Detach (Recall)',
  description:
    'NHTSA campaign 26V299, Ford recall 26S32, covers certain 2021-2022 Bronco vehicles with 3-door or 5-door Molded-In-Color hardtop roof panels. Improper manufacturing can allow sections of the outer roof panel to separate and detach, creating a road hazard and increasing crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers will inspect and replace the hardtop as necessary free of charge. NHTSA records that interim letters were mailed in May 2026 and that the final remedy was anticipated in November 2026; confirm current parts availability with Ford before scheduling.',
  severity: 'high',
  symptoms: ['Separation of an outer MIC hardtop panel section', 'Hardtop panel section detaches from the vehicle'],
  affectedSystems: ['MIC hardtop outer roof panels'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 2021 Ford Bronco (Campaign 26V299000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco&modelYear=2021' }],
  source: 'manual',
  summary:
    'Superseded the appearance-only CSP narrative with the current 2026 MIC hardtop detachment safety recall and removed unsupported crazing, headliner, warping, leak, discount, and lubricant claims.',
};

const shockRecall = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles included in NHTSA 25V025 / Ford 25S01'],
  engines: [],
  category: 'suspension',
  title: 'Rear Shock Reservoir Can Corrode and Detach (Recall)',
  description:
    'NHTSA campaign 25V025, Ford recall 25S01, covers certain 2021-2024 Bronco vehicles. A rear shock absorber may corrode and fail, allowing its external reservoir to detach and create a road hazard that increases crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers replace the rear shock absorbers as necessary free of charge. The recall does not limit the population to the three frozen trims or establish clunks, leakage, road-salt exposure, pair replacement, secondary damage, or owner repair costs.',
  severity: 'high',
  symptoms: ['External rear shock reservoir detaches from the vehicle'],
  affectedSystems: ['rear shock absorbers', 'external shock reservoirs'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 2021 Ford Bronco (Campaign 25V025000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco&modelYear=2021' }],
  source: 'manual',
  summary:
    'Corrected the campaign number and population to the current 2021-2024 recall and retained only its corrosion, reservoir-detachment hazard, and conditional free shock replacement.',
};

const softTopHeadliner = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles equipped with a factory soft top roof'],
  engines: [],
  category: 'body',
  title: 'Factory Soft-Top Headliner Can Detach From the Top Material',
  description:
    'Ford service information covers some 2021-2024 Bronco vehicles with a factory soft top whose headliner detaches from the soft-top material because of the factory installation process.',
  solution:
    'Have a Ford dealer confirm bulletin applicability. Ford\'s service procedure calls for reattaching the headliner or replacing the soft-top roof material. The bulletin does not establish heat-melted adhesive, water leaks, a universal 3M product, aftermarket re-gluing, or an owner cost range.',
  severity: 'low',
  symptoms: ['Soft-top headliner detaches from the soft-top material'],
  affectedSystems: ['factory soft-top headliner', 'soft-top roof material'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - 2021-2024 Bronco Soft-Top Headliner Detachment', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001584-0001.pdf' }],
  source: 'manual',
  summary:
    'Extended the exact Ford bulletin population through 2024 and narrowed the card to the documented factory-installation headliner detachment and reattach-or-replace remedy.',
};

const speedControlRecall = {
  years: [1994, 1995],
  trims: ['Vehicles equipped with speed control and included in NHTSA 05V388'],
  engines: [],
  category: 'safety',
  title: 'Speed-Control Deactivation Switch Can Overheat or Burn (Recall)',
  description:
    'NHTSA campaign 05V388 covers certain 1994-1995 Ford Bronco vehicles equipped with speed control. The speed-control deactivation switch may overheat, smoke, or burn, and a fire can occur at the switch.',
  solution:
    'Check the VIN with Ford or NHTSA for completion of this campaign and have any open recall remedied free of charge. The NHTSA record documents an interim switch disconnect followed by remedy availability. It does not support the frozen brake-fluid mechanism, parked-vehicle scenario, engine list, separate ignition-switch campaign, indoor-parking instruction, or owner cost.',
  severity: 'high',
  symptoms: ['Speed-control deactivation switch overheats', 'Smoke at the speed-control deactivation switch', 'Burning or fire at the switch'],
  affectedSystems: ['speed-control deactivation switch'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 1994 Ford Bronco (Campaign 05V388000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco&modelYear=1994' }],
  source: 'manual',
  summary:
    'Rewrote the card to NHTSA 05V388\'s exact 1994-1995 speed-control population, condition, hazard, and recall path while removing unsupported mechanisms and unrelated campaign advice.',
};

const syncBulletin = {
  years: [2021, 2022, 2023],
  trims: ['Vehicles equipped with SYNC 4'],
  engines: [],
  category: 'electrical',
  title: 'SYNC 4 Software Can Cause a Blank, Frozen, or Resetting Center Display',
  description:
    'Ford service information covers some 2021-2023 Bronco vehicles with an intermittent blank or frozen center display that resets automatically, Android Auto or Apple CarPlay connectivity concerns, a checkerboard display, center-display resets, or Bluetooth connectivity concerns. Ford identifies SYNC module (APIM) software as the cause.',
  solution:
    'Have a Ford dealer confirm bulletin applicability and update or reprogram the APIM using Ford\'s current service procedure. Diagnose a missing rearview camera under any applicable safety recall separately; the bulletin does not support universal APIM replacement, battery causation, master reset, broad DTCs, or owner cost estimates.',
  severity: 'medium',
  symptoms: ['Intermittent blank or frozen center display that resets', 'Android Auto or Apple CarPlay connectivity concern', 'Checkerboard display', 'Center-display reset', 'Bluetooth connectivity concern'],
  affectedSystems: ['SYNC 4 accessory protocol interface module', 'center display'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - 2021-2023 Bronco SYNC 4 Display and Connectivity Concerns', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10249753-0001.pdf' }],
  source: 'manual',
  summary:
    'Narrowed the broad 2021-2024 infotainment/camera aggregation to Ford\'s exact 2021-2023 APIM software bulletin, documented symptoms, and update path.',
};

const published = {
  'ford-bronco-hardtop-water-leaks': replacement(hardtopLeak, 'Retain only Ford\'s exact 2021-2022 front hardtop panel adjustment bulletin and archive the broad leak-location and seal-treatment aggregation.'),
  'ford-bronco-10-speed-auto-shifting': replacement(automaticShift, 'Retain the Ford 10R60 bulletin with its exact 2021-2023 population and possible software, strategy, and valve-body causes; remove unsupported recall blending and generic repair claims.'),
  'ford-bronco-23-ecoboost-oil-galley-plug': replacement(oilGalleyProgram, 'Retain Ford program 23B08 with its exact build dates, engine, defect, oil-leak consequence, engine-replacement action, and historical program term.'),
  'ford-bronco-27-ecoboost-valve-failure': replacement(intakeValveRecall, 'Retain only Ford/NHTSA recall 24S55/24V635 and its exact intake-valve failure, cycle test, and conditional engine-replacement remedy.'),
  'ford-bronco-7-speed-manual-grinding': replacement(manualScraping, 'Retain Ford\'s superseding MT88 bulletin and correct the population through 2024, symptoms, synchronizer-ring cause, and dealer service path.'),
  'ford-bronco-battery-drain-and-no-start-2021': replacement(batteryDraw, 'Retain only Ford\'s exact door-lock-switch parasitic-draw service message and remove the generic multi-cause owner-report narrative.'),
  'ford-bronco-door-latch-and-window-2021': replacement(windowInitialization, 'Replace the incorrect Mazda citation and broad latch claim with Ford\'s exact repeat window-initialization software condition and remedy.'),
  'ford-bronco-electric-power-steering-assist-2021': replacement(steeringRecall, 'Retain only NHTSA 23V155/Ford 23S09, narrowed to the affected 2022 Raptor and 2023 Wildtrak steering gears and free replacement.'),
  'ford-bronco-front-seat-belt-pretensioner-2021': replacement(seatBeltRecall, 'Correct the frozen card from a nonexistent pretensioner narrative to NHTSA 23V358\'s exact 5-door latch-plate accessibility noncompliance and sliding-clip remedy.'),
  'ford-bronco-mic-hardtop-delamination': replacement(micRoofRecall, 'Supersede the appearance CSP aggregation with the current NHTSA 26V299/Ford 26S32 outer-panel detachment safety recall.'),
  'ford-bronco-rear-shock-absorber-corrosion-2021': replacement(shockRecall, 'Retain the current NHTSA 25V025/Ford 25S01 recall, corrected to its exact 2021-2024 population and external-reservoir detachment hazard.'),
  'ford-bronco-soft-top-adhesive-failure': replacement(softTopHeadliner, 'Retain Ford\'s exact 2021-2024 factory soft-top headliner bulletin and remove unsupported adhesive chemistry, leak, DIY, and cost claims.'),
  'ford-bronco-speed-control-deactivation-switch-fire': replacement(speedControlRecall, 'Retain NHTSA 05V388 with its exact 1994-1995 Bronco speed-control-switch condition and recall path, removing unrelated mechanisms and campaigns.'),
  'ford-bronco-sync-4-infotainment-freezing-2021': replacement(syncBulletin, 'Retain Ford\'s exact 2021-2023 SYNC 4 APIM software bulletin and separate its display/connectivity condition from safety-camera recalls and generic module replacement.'),
};

const reasons = {
  'ford-bronco-23l-ecoboost-coolant-intrusion-2021':
    'The frozen card has no citations and combines three model years with cracked-head, head-gasket, coolant-intrusion, misfire, pressure-test, bore-scope, head replacement, and engine replacement claims without a Ford bulletin defining that population.',
  'ford-bronco-302-v8-runs-hot-traffic':
    'The frozen card turns enthusiast articles into a nine-year factory cooling-design defect, thermostat and radiator specifications, fan-shroud upgrade, electric-fan recommendation, and restoration cost without a Ford primary publication.',
  'ford-bronco-body-rust-floors-rockers-door-posts-rot-from-drip-rails-down':
    'The frozen card aggregates restoration-vendor and enthusiast material into a 12-year structural rust pattern, inspection map, fabrication procedure, reinforcement plan, cavity treatment, and cost range without a Ford service publication defining the condition.',
  'ford-bronco-cam-phaser-rattle-and-2021':
    'The frozen card has no citations and combines 2.7L and 3.0L cam phasers, timing chains, startup rattle, oil pressure, software, phaser replacement, timing-system replacement, DTCs, and owner costs across four years without a Ford bulletin matching that narrative.',
  'ford-bronco-e4od-automatic-transmission-failure':
    'The frozen card uses secondary repair articles and a forum to generalize E4OD heat, brake-circuit, torque-converter, overdrive, valve-body, cooler, fluid, rebuild, and cost claims across seven model years without an exact Ford bulletin or recall.',
  'ford-bronco-frame-rot-cracks-rear-shock-mounts-spring-hangers':
    'The frozen card turns an enthusiast repair page, a parts vendor, and a forum into a 12-year boxed-frame defect, suspension-safety claim, welding procedure, reinforcement plan, internal coating recommendation, and cost range without Ford primary evidence.',
  'ford-bronco-front-end-death-wobble':
    'The frozen card applies an imprecise death-wobble label, multiple Twin-Traction Beam and Dana 44 wear components, alignment specifications, steering stabilizer advice, rebuild sequence, and costs to seven years using enthusiast sources rather than a Ford bulletin.',
  'ford-bronco-inadequate-front-drum-brakes':
    'The frozen card converts enthusiast and vendor material into a ten-year factory brake inadequacy claim, fade mechanism, pulling behavior, adjustment instructions, disc conversion recommendation, master-cylinder change, and costs without a Ford publication defining a defect.',
  'ford-bronco-intake-manifold-gasket-egr-tube-failures':
    'The frozen card merges intake-gasket coolant/vacuum leaks, EGR tube failures, seven model years, unspecified engines, DTCs, smoke testing, gasket replacement, tube replacement, and costs from generic secondary sources without exact Ford service information.',
  'ford-bronco-rear-differential-lockinggrinding-and-2021':
    'The frozen card has no citations and generalizes three model years of locking, grinding, bearings, gears, fluid, locker operation, complete differential failure, rebuild, replacement, DTCs, and costs without a Ford bulletin identifying the affected axle and remedy.',
  'ford-bronco-rusty-undersized-under-cab-fuel-tank':
    'The frozen card combines corrosion, leakage, fuel odor, sender faults, limited range, tank capacity, replacement, auxiliary-tank modification, line replacement, and restoration cost across 12 years from enthusiast and vendor material without Ford primary evidence.',
  'ford-bronco-sasquatchhoss-front-cv-axle-2021':
    'The frozen card has no citations and combines four years, multiple HOSS/Sasquatch configurations, clicking, vibration, boot failure, joint damage, lift effects, axle replacement, boot repair, geometry advice, and costs without a Ford bulletin defining an affected population.',
  'ford-bronco-smart-wiper-malfunction':
    'Ford\'s manufacturer communication explains that speed or sweep reduction under heat, dry-glass, snow, ice, or obstruction conditions is a smart-motor protection characteristic, not a defect; the frozen card incorrectly labels expected behavior a malfunction and supplies unsupported repair advice.',
  'ford-bronco-structural-rust-floor-pans-rockers-tailgate-rear-cargo-sill':
    'The frozen card aggregates restoration and enthusiast sources into a seven-year structural-rust map, hidden-frame warning, inspection method, panel replacement, welding, coating, and cost claims without a Ford bulletin defining the condition or repair.',
  'ford-bronco-tfi-ignition-module-heat-soak-stalling-no-start':
    'The frozen card generalizes secondary articles about TFI systems into a seven-year Bronco heat-soak defect, stall/no-start pattern, spark test, relocation kit, module replacement, distributor work, and cost without a Ford campaign or bulletin matching the population.',
  'ford-bronco-weak-charging-system-useless-vacuum-wipers':
    'The frozen card combines charging-output limitations, idle voltage, accessory loads, vacuum-wiper behavior, engine-load effects, alternator conversion, electric-wiper conversion, wiring changes, and cost across 12 years from enthusiast sources without Ford primary evidence.',
  'ford-bronco-worn-out-manual-steering-box':
    'The frozen card turns a restoration article and parts-vendor page into a 12-year manual-steering-box defect, wandering, sector-shaft wear, adjustment, rebuild, power-steering conversion, alignment advice, and cost range without a Ford service publication.',
};

module.exports = buildConfig({
  label: 'Ford Bronco',
  make: 'Ford',
  model: 'Bronco',
  slug: 'ford-bronco',
  batchId: 'ford-bronco-full-record-cohort-99-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f5ca0bca281808ef7e33d1720ede1cc30c8391ed4570afc2f78e1d1bddff7cb3',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-bronco/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordbronco_blind:manual-primary-source-gate',
    edge: 'fordbronco_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
