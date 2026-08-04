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

const recalls = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Mustang&modelYear=${year}`;

const published = {
  'ford-mustang-10r80-transmission-problems-2018': replacement(
    {
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      trims: ['Vehicles equipped with the 10R80 transmission that meet the applicable Ford TSB criteria'],
      engines: ['2.3L EcoBoost', '5.0L V8'],
      category: 'transmission',
      title: '10R80 Harsh or Delayed Engagement and Shifting',
      description:
        'Ford TSBs cover some 2018-2023 Mustang vehicles with a 10R80 that exhibit harsh or delayed engagement or shifts, sometimes with specified ratio, shift-solenoid, or clutch-performance codes. Depending on model year and diagnosis, Ford identifies software or solenoid strategy, sticking main-control valves, or axial movement of the CDF clutch-cylinder sleeve as possible causes.',
      solution:
        'Use the model-year-specific Ford procedure and stored codes to separate software, hydraulic, valve-body, and CDF sleeve faults. The service flow may require programming, hydraulic testing, valve-body work, or internal repair; it does not direct automatic transmission replacement. Ford coverage depends on the vehicle and current warranty status.',
      severity: 'medium',
      symptoms: ['Harsh or delayed engagement', 'Harsh or delayed shifts', 'Possible transmission-related MIL and DTCs'],
      affectedSystems: ['10R80 automatic transmission', 'PCM/TCM strategy', 'main control valve body', 'CDF clutch-cylinder sleeve'],
      dtcCodes: ['P0751', 'P0756', 'P0761', 'P0766', 'P0771', 'P2700', 'P2701', 'P2702', 'P2703', 'P2704', 'P2705', 'P2707', 'P2708'],
      sources: [
        { type: 'tsb', title: 'Ford 10R80 TSB - 2018-2021 Mustang Harsh or Delayed Shifting', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251469-0001.pdf' },
        { type: 'tsb', title: 'Ford 10R80 TSB - 2022-2023 Mustang Harsh or Delayed Shifting', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252662-0001.pdf' },
      ],
      summary:
        'Replaced an uncited universal failure card with Ford model-year-specific 10R80 symptoms, codes, causal branches, and diagnostic repair flow.',
    },
    'Retain the exact Ford bulletin conditions while removing undefined forum evidence, adaptation resets as a universal fix, fluid intervals, litigation, rebuild prices, and automatic transmission replacement.',
  ),

  'ford-mustang-2-3l-ecoboost-turbo-wastegate-rattle-p0299-underboost-limp-m': replacement(
    {
      years: [2015, 2016],
      trims: ['Vehicles built on or before 01-Jan-2016 that meet TSB 16-0121 criteria'],
      engines: ['2.3L GTDI / EcoBoost'],
      category: 'engine',
      title: 'P0299 from a Disconnected Turbo Wastegate Actuator Rod',
      description:
        'Ford TSB 16-0121 applies to some 2015-2016 Mustang 2.3L vehicles with lack of power and P0299. Ford identifies a wastegate actuator rod that has disconnected from the wastegate as the specific cause covered by this bulletin.',
      solution:
        'Retrieve codes and inspect the wastegate linkage. When the actuator rod is disconnected, Ford directs reinstalling it with a new retaining clip under the TSB procedure. Other P0299 causes require normal boost-system diagnosis; the bulletin does not support replacing the turbocharger from rattle or underboost alone.',
      severity: 'medium',
      symptoms: ['Lack of power', 'MIL with P0299'],
      affectedSystems: ['turbocharger wastegate actuator rod', 'wastegate retaining clip'],
      dtcCodes: ['P0299'],
      sources: [{ type: 'tsb', title: 'Ford TSB 16-0121 - 2.3L P0299 Wastegate Rod Disconnected', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10109039-9999.pdf' }],
      summary:
        'Narrowed nine model years of generic turbo failure to Ford TSB 16-0121, its exact build date, P0299 condition, inspection, and retaining-clip repair.',
    },
    'Retain the exact Ford bulletin while removing unrelated generic-code and Focus forum citations, 2017-2023 coverage, wastegate wear theory, limp-mode claims, turbo replacement, tuning advice, and prices.',
  ),

  'ford-mustang-2011-2014-37l-v6-electric-2011': replacement(
    {
      years: [2022, 2023],
      trims: ['Certain vehicles identified by VIN; prior recall repair may also require correction'],
      category: 'steering',
      title: 'Steering Torque-Sensor Calibration Recalls 24S44 and 25S11',
      description:
        'NHTSA campaign 24V493 covers certain 2022-2023 Mustang vehicles whose secondary steering torque sensor may be calibrated incorrectly, allowing the steering wheel to turn against the driver\'s intention. Campaign 25V096 covers vehicles whose earlier repair may have been completed incorrectly.',
      solution:
        'Check the VIN for Ford recalls 24S44 and 25S11 even after a prior software recall. A Ford dealer updates the Power Steering Control Module software free of charge. Unexpected steering input requires prompt inspection; do not diagnose it as a failed rack from warning text alone.',
      severity: 'high',
      symptoms: ['Steering wheel may move side to side against driver input'],
      affectedSystems: ['secondary steering torque sensor calibration', 'Power Steering Control Module software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 24V493 and 25V096 / Ford 24S44 and 25S11', url: recalls(2022) }],
      summary:
        'Replaced an unsupported 2011-2014 V6 steering-failure card with the current original and corrective steering calibration recalls.',
    },
    'The frozen 2011-2014 electric-rack failure card had no primary citation. Retain the exact current Mustang steering safety actions instead of owner-anecdote rack replacement and price claims.',
  ),

  'ford-mustang-3-8l-essex-v6-head-gasket-failure': replacement(
    {
      years: [1995],
      trims: ['Certain vehicles identified by campaign eligibility'],
      engines: ['3.8L V6', '5.0L V8'],
      category: 'engine',
      title: '1995 Cooling-Fan Motor Fire Campaign',
      description:
        'NHTSA records Ford campaign 01V390 and related safety-improvement action 01I011 for certain 1995 Mustangs. A cooling-fan bearing could seize, generate excessive heat, melt the motor connector, and potentially ignite components in the fan motor.',
      solution:
        'Check the VIN and campaign completion history with Ford. The safety recall directed inspection of the cooling-fan assembly, installation of a circuit breaker, and replacement of an inoperative fan/motor assembly. Historical extended-coverage dates have expired, so do not promise current warranty coverage beyond any open recall obligation.',
      severity: 'high',
      symptoms: ['Inoperative engine cooling fan', 'Overheated fan connector or underhood electrical odor'],
      affectedSystems: ['engine cooling fan bearing', 'fan motor electrical connector', 'fan circuit protection'],
      sources: [{ type: 'recall', title: 'NHTSA 1995 Mustang Recall Results - 01V390 and 01I011', url: recalls(1995) }],
      summary:
        'Removed the unsupported head-gasket campaign narrative and retained the exact 1995 Ford cooling-fan fire safety action instead.',
    },
    'The cited head-gasket sources were advocacy and forum pages and did not establish the frozen repair promises. Retain the primary-source cooling-system safety campaign for this population.',
  ),

  'ford-mustang-backup-camera-failure-2015': replacement(
    {
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      trims: ['Campaign coverage and remedy vary by VIN, model year, camera hardware, wiring, and software'],
      category: 'electrical',
      title: 'Rearview-Camera Recalls: Wiring, Camera Hardware, and Software',
      description:
        'Mustang rearview-camera recalls now include 22V082 for certain 2015-2017 decklid wiring or camera faults, 20V575 for certain 2020 camera connections, 25V572 and 25V695 for distorted, inverted, intermittent, or blank camera images, and 25V442 for certain 2019-2023 software that can show a blank or persistent image.',
      solution:
        'Check the VIN for every open Ford camera campaign, including newer actions after an earlier repair. Depending on the campaign, Ford inspects or repairs decklid wiring, replaces the camera, or updates camera software free of charge. Continue direct visual checks while reversing and diagnose non-campaign faults separately.',
      severity: 'high',
      symptoms: ['Blank, distorted, inverted, intermittent, frozen, or persistent rearview image'],
      affectedSystems: ['rearview camera', 'decklid camera wiring', 'camera connection', 'rearview-camera software'],
      sources: [
        { type: 'recall', title: 'NHTSA 2015 Mustang Recall Results - Camera Campaigns', url: recalls(2015) },
        { type: 'recall', title: 'NHTSA 2020 Mustang Recall Results - Camera Campaigns', url: recalls(2020) },
        { type: 'recall', title: 'NHTSA 2022 Mustang Recall Results - Camera Software Campaign', url: recalls(2022) },
      ],
      summary:
        'Replaced an uncited nine-year camera-failure card with the distinct wiring, hardware, connection, and software recalls through 2026.',
    },
    'Retain the exact safety campaigns while removing undefined forum evidence, universal failure scope, DIY harness assumptions, part numbers, and repair prices.',
  ),

  'ford-mustang-brake-booster-2015': replacement(
    {
      years: [2020, 2024],
      trims: ['2020 automatic-transmission recall population and certain 2024 vehicles identified by VIN'],
      category: 'brakes',
      title: 'Brake-Pedal Bracket and Assembly Safety Recalls',
      description:
        'NHTSA campaign 20V573 covers certain 2020 automatic-transmission Mustangs whose brake-pedal bracket may fracture during sudden stopping. Campaign 23V800 covers certain 2024 Mustangs with an incorrectly manufactured brake-pedal assembly that can leave the pedal loose. Either condition can reduce braking ability.',
      solution:
        'Check the VIN for Ford recalls 20S52 and 23S61. Ford replaces the covered pedal bracket or pedal-and-bracket assembly free of charge. Owners subject to 23S61 were advised not to drive until repaired; a loose, cracking, or displaced pedal requires immediate service.',
      severity: 'high',
      symptoms: ['Loose or displaced brake pedal', 'Brake-pedal bracket may fracture during hard braking'],
      affectedSystems: ['brake-pedal bracket', 'brake-pedal assembly'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 20V573 / Ford 20S52', url: recalls(2020) },
        { type: 'recall', title: 'NHTSA Campaign 23V800 / Ford 23S61', url: recalls(2024) },
      ],
      summary:
        'Replaced a fabricated track-use brake-booster card with the exact 2020 fracture and 2024 loose-pedal safety recalls.',
    },
    'The frozen booster card relied on a placeholder video and mixed track heat, vacuum leaks, fluid, pads, rotors, hoses, and booster replacement. Retain the actual brake-pedal recalls instead.',
  ),

  'ford-mustang-brake-pedal-bumper-2015': replacement(
    {
      years: [2015],
      trims: ['Certain vehicles sold or registered in the warm, humid, or salt-air jurisdictions listed by NHTSA'],
      category: 'brakes',
      title: 'Recall 22S02: Brake-Pedal Bumper Can Corrode and Separate',
      description:
        'NHTSA campaign 22V011 covers certain 2015 Mustangs in specified warm, humid, or salt-air jurisdictions. A corroded pedal bumper can separate, leaving brake lights continuously illuminated and, on automatic vehicles, allowing a shift out of Park without pressing the brake.',
      solution:
        'Check the VIN and registration history for Ford recall 22S02. A Ford dealer replaces the brake- and clutch-pedal bumpers free of charge. Continuously illuminated brake lights or the ability to shift from Park without the brake requires prompt inspection.',
      severity: 'high',
      symptoms: ['Brake lights stay on', 'Automatic transmission may shift out of Park without brake-pedal input'],
      affectedSystems: ['brake-pedal bumper', 'clutch-pedal bumper', 'stop-lamp and shift-interlock inputs'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V011 / Ford Recall 22S02', url: recalls(2015) }],
      summary:
        'Narrowed nine years of uncited bumper failure to the exact 2015 regional safety recall and free bumper replacement.',
    },
    'Retain the exact regional recall while removing 2016-2023 coverage, universal limp-mode and battery-drain claims, DIY replacement, part numbers, and prices.',
  ),

  'ford-mustang-coyote-tick-noise-2015': replacement(
    {
      years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      engines: ['5.0L V8'],
      category: 'engine',
      title: '5.0L “Typewriter” Tick After an Oil Change Is a Documented Characteristic',
      description:
        'Ford documents a tick, tap, or typewriter-like noise on some 2011-2024 Mustang 5.0L engines after an oil change. It is typically heard after oil reaches about 150°F, from idle to roughly 1,700 rpm, near the bellhousing or oil-pan area. Ford states that this precise noise has no short- or long-term effect on engine function or durability.',
      solution:
        'First confirm that the sound matches Ford\'s documented typewriter-noise conditions. Ford directs no repair for the characteristic itself. Diagnose low oil pressure, warning lamps, metal debris, persistent knock under load, misfire, or a noise outside these conditions separately instead of using additives or replacing internal engine parts.',
      severity: 'low',
      symptoms: ['Irregular typewriter-like tick at warm idle after an oil change', 'Noise often heard near the bellhousing or oil pan'],
      affectedSystems: ['5.0L engine operating acoustics'],
      sources: [{ type: 'tsb', title: 'Ford Service Communication - 5.0L Typewriter Tick', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251951-0001.pdf' }],
      summary:
        'Corrected a failure/knock card to Ford\'s explicit non-damaging operating characteristic and no-repair guidance.',
    },
    'Retain Ford\'s exact characteristic while removing undefined TSB citation, universal defect language, oil-additive advice, internal-engine theories, repair pricing, and failure predictions.',
  ),

  'ford-mustang-door-latch-recall-2015': replacement(
    {
      years: [2015, 2017],
      trims: ['Coverage varies by VIN and prior-recall repair'],
      category: 'body',
      title: 'Door-Latch and Driver-Handle Safety Recalls',
      description:
        'NHTSA campaign 16V643 covers certain 2015 Mustangs whose latch component may break and prevent secure latching; 20V331 inspects vehicles whose prior latch repair may have been incorrect. Campaign 17V168 covers certain 2017 Mustangs whose driver interior-handle return spring can loosen and allow unlatching in a side-impact crash.',
      solution:
        'Check the VIN for Ford recalls 16S30, 20S30, and 17C04. Depending on the campaign, Ford replaces side-door latches, verifies prior-repair latch date codes, or inspects and repairs the driver-handle return spring free of charge.',
      severity: 'high',
      symptoms: ['Door is difficult or impossible to latch', 'Door appears closed but is not secure', 'Driver interior handle may not return normally'],
      affectedSystems: ['side-door latch', 'driver interior-handle return spring'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 16V643 / Ford 16S30', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCMN-16V643-1077.pdf' },
        { type: 'recall', title: 'NHTSA 2017 Mustang Recall Results - 17V168', url: recalls(2017) },
        { type: 'recall', title: 'NHTSA 2015 Mustang Recall Results - 20V331', url: recalls(2015) },
      ],
      summary:
        'Separated the 2015 latch defect, incorrect prior repairs, and distinct 2017 driver-handle spring recall.',
    },
    'Retain the exact safety campaigns while removing forum framing and the false implication that one pawl-spring recall covers every 2015-2017 Mustang.',
  ),

  'ford-mustang-manual-transmission-hydraulic-clutch-pedal-sticks-to-floor': replacement(
    {
      years: [2015, 2016, 2017],
      trims: ['Manual-transmission vehicles built on or before 15-Jun-2016 that meet the Ford bulletin criteria'],
      category: 'transmission',
      title: 'Damaged Clutch-Pedal Position Switch Can Cause a No-Crank',
      description:
        'Ford documented a no-crank condition on some 2015-2017 manual-transmission Mustangs built on or before 15-Jun-2016 caused by damage to the clutch-pedal position switch.',
      solution:
        'For a no-crank with normal battery and starting-system checks, inspect the clutch-pedal position switch and follow the Ford service procedure. Do not attribute a pedal that stays down at high rpm, clutch slip, difficult shifting, or hydraulic leakage to this bulletin without separate diagnosis.',
      severity: 'medium',
      symptoms: ['No crank when the clutch pedal is depressed'],
      affectedSystems: ['clutch-pedal position switch', 'starter interlock input'],
      sources: [{ type: 'tsb', title: 'Ford Bulletin - Mustang Clutch-Pedal Position Switch No-Crank', url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10092363-5448.pdf' }],
      summary:
        'Replaced a nine-year hydraulic clutch-failure aggregation with Ford\'s exact CPP-switch no-crank condition and build-date gate.',
    },
    'Retain the exact Ford bulletin while removing forum-only high-rpm pedal, master/slave cylinder, clutch, flywheel, fluid, modification, and repair-price claims.',
  ),

  'ford-mustang-p0420-bank-1-catalytic-converter-efficiency-loss': replacement(
    {
      years: [2018, 2019],
      engines: ['5.0L V8'],
      category: 'emissions',
      title: 'P0420 or P0430 on 2018-2019 5.0L Mustang',
      description:
        'Ford TSB 19-2201 applies to some 2018-2019 Mustang vehicles with the 5.0L engine and P0420 and/or P0430. Ford attributes this bulletin condition to PCM operation rather than establishing that every catalyst-efficiency code proves a failed converter.',
      solution:
        'Confirm the model, engine, codes, exhaust integrity, and bulletin applicability. Ford directs replacing the affected catalytic converter and reprogramming the PCM under the TSB procedure. Coverage depends on current emissions-warranty and vehicle status; do not replace oxygen sensors or converters solely from a code without diagnosis.',
      severity: 'medium',
      symptoms: ['MIL with P0420 and/or P0430'],
      affectedSystems: ['catalytic converter', 'Powertrain Control Module calibration'],
      dtcCodes: ['P0420', 'P0430'],
      sources: [{ type: 'tsb', title: 'Ford TSB 19-2201 - Mustang P0420/P0430', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164469-0001.pdf' }],
      summary:
        'Combined both catalyst-efficiency codes into Ford\'s exact 2018-2019 5.0L bulletin and removed generic bank-specific parts guesses.',
    },
    'Retain the exact Ford bulletin condition and both codes in one card while removing secondary code pages, forum guesses, universal sensor replacement, prices, and unsupported warranty promises.',
  ),

  'ford-mustang-s197-hood-corrosion-and-2010': replacement(
    {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
      trims: ['Vehicles with an affected aluminum body panel that meet Ford TSB 19-2026 criteria'],
      category: 'body',
      title: 'Aluminum Panel Corrosion with Bubbling or Peeling Paint',
      description:
        'Ford TSB 19-2026 includes 2005-2018 Mustang vehicles with aluminum body panels that show corrosion as bubbled or peeling paint, with or without white corrosion dust. The bulletin distinguishes this from ordinary surface contamination and recommends panel replacement for the documented condition.',
      solution:
        'Confirm that the affected panel is aluminum and inspect the corrosion location under Ford body-service procedures. Follow the TSB repair path; do not sand through or cover structural hem-flange corrosion without proper evaluation. A TSB does not itself extend corrosion warranty coverage, so verify current coverage separately.',
      severity: 'low',
      symptoms: ['Bubbled or peeling paint on an aluminum panel', 'White corrosion dust beneath damaged paint'],
      affectedSystems: ['aluminum exterior body panels', 'paint and corrosion protection'],
      sources: [{ type: 'tsb', title: 'Ford TSB 19-2026 - Aluminum Panel Corrosion', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10156863-9999.pdf' }],
      summary:
        'Replaced an uncited S197-only hood card with Ford\'s exact 2005-2018 aluminum-panel corrosion bulletin and no warranty promise.',
    },
    'Retain the exact Ford body bulletin while removing unsupported hood-only root causes, repaint instructions, replacement prices, and warranty assertions.',
  ),

  'ford-mustang-s197-passenger-seat-occupant-2005': replacement(
    {
      years: [2008],
      trims: ['Model-year 2008 vehicles covered by Ford recall 08C02'],
      category: 'safety',
      title: 'Recall 08C02: Passenger Restraint Calibration Does Not Meet a Neck-Injury Requirement',
      description:
        'NHTSA campaign 08V082 covers model-year 2008 Mustangs that did not meet one FMVSS 208 neck-injury requirement for an unbelted small female in the front passenger seat at the full-forward position. This is a restraint calibration issue, not evidence of a failed occupant sensor across 2005-2010 vehicles.',
      solution:
        'Check the VIN for Ford recall 08C02. A Ford dealer reprograms the restraint control module free of charge. An airbag warning lamp or passenger-airbag status concern outside this recall requires normal restraint-system diagnosis.',
      severity: 'high',
      symptoms: ['No reliable driver-visible symptom for the compliance condition'],
      affectedSystems: ['restraint control module calibration', 'front passenger airbag deployment strategy'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 08V082 / Ford Recall 08C02', url: recalls(2008) }],
      summary:
        'Corrected a six-year occupant-sensor failure claim to the exact 2008 restraint-calibration compliance recall.',
    },
    'Retain the exact safety recall while removing unsupported 2005-2010 sensor-mat failure, connector repair, bypass, seat replacement, and price claims.',
  ),

  'ford-mustang-shelby-gt350-gt350r-5-2l-voodoo-oil-cooler-tube-assembly-lea': replacement(
    {
      years: [2015, 2016, 2017],
      trims: ['Shelby GT350 and GT350R vehicles in the campaign build population'],
      engines: ['5.2L V8'],
      category: 'engine',
      title: 'Recall 16S40: Shelby Oil-Cooler Tube Can Separate and Leak',
      description:
        'NHTSA campaign 16V779 covers certain 2015-2017 Mustang Shelby vehicles built from 24-Feb-2015 through 30-Aug-2016. A hose can separate from the engine oil-cooler tube assembly, causing sudden oil loss, possible engine failure, crash risk, and fire risk near an ignition source.',
      solution:
        'Check the VIN for Ford recall 16S40. A Ford dealer replaces the engine oil-cooler tube assembly free of charge. Stop the engine promptly for sudden oil-pressure loss, a major oil leak, smoke, or burning-oil odor.',
      severity: 'high',
      symptoms: ['Sudden engine-oil leak', 'Low oil pressure', 'Smoke or burning-oil odor'],
      affectedSystems: ['engine oil-cooler tube and hose assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 16V779 / Ford Recall 16S40', url: recalls(2017) }],
      summary:
        'Replaced secondary recall aggregators with the direct NHTSA population, risk, build dates, and free tube-assembly replacement.',
    },
    'Retain the exact safety recall while removing third-party citations and any non-VIN-gated implication.',
  ),

  'ford-mustang-sync-infotainment-2015': replacement(
    {
      years: [2019, 2020, 2021, 2022, 2023],
      trims: ['Certain vehicles covered by Ford Customer Satisfaction Program 24B47'],
      category: 'electrical',
      title: 'Program 24B47: SYNC Software Instability and Black Screen',
      description:
        'Ford Customer Satisfaction Program 24B47 includes certain 2019-2023 Mustangs whose SYNC software may become unstable, show a black infotainment screen, lose saved language or radio settings, or fail to install updates. Ford states that the program\'s black-screen condition does not disable the rearview camera.',
      solution:
        'Have Ford verify VIN eligibility and installed SYNC software. The program directs a SYNC software update. Check current program status before assuming coverage, and diagnose camera loss, power or wiring faults, or a persistent blank screen separately rather than replacing the APIM automatically.',
      severity: 'low',
      symptoms: ['Black infotainment screen with rearview camera still available', 'SYNC instability', 'Lost settings', 'Software update failure'],
      affectedSystems: ['SYNC software', 'infotainment display and saved settings'],
      sources: [{ type: 'tsb', title: 'Ford Customer Satisfaction Program 24B47 - SYNC Software Update', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006036-0001.pdf' }],
      summary:
        'Replaced a fabricated Reddit URL with Ford\'s exact 24B47 symptoms, software remedy, and rear-camera distinction.',
    },
    'Retain the exact Ford program while removing unsupported 2015-2018 scope, generic resets, APIM replacement, hardware-failure claims, and prices.',
  ),

  'ford-mustang-takata-driver-airbag-inflator-2005': replacement(
    {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      trims: ['Campaign and inflator position vary by VIN and model year'],
      category: 'safety',
      title: 'Takata Driver and Passenger Airbag Inflator Recalls',
      description:
        'Multiple NHTSA Takata campaigns cover certain 2005-2014 Mustangs. A defective inflator can rupture during airbag deployment and propel metal fragments at occupants, causing serious injury or death. Driver and passenger coverage differs by model year, inflator, region, and prior repair.',
      solution:
        'Check the VIN in both Ford and NHTSA recall tools for every open or repeat Takata campaign. An authorized Ford dealer replaces the covered inflator or airbag module free of charge. Do not rely on model year alone or assume a prior airbag repair completed every later campaign.',
      severity: 'high',
      symptoms: ['No reliable warning before inflator rupture during deployment'],
      affectedSystems: ['driver airbag inflator', 'front passenger airbag inflator'],
      sources: [
        { type: 'recall', title: 'NHTSA 2010 Mustang Recall Results - Takata Campaigns', url: recalls(2010) },
        { type: 'recall', title: 'NHTSA Recall Lookup', url: 'https://www.nhtsa.gov/recalls' },
        { type: 'recall', title: 'Ford Recall Lookup', url: 'https://www.ford.com/support/recalls/' },
      ],
      summary:
        'Preserved the high-priority Takata warning while making driver/passenger position, VIN, repeat-campaign, and free dealer replacement explicit.',
    },
    'Retain the exact recall class and authoritative lookup paths while removing any blanket assumption that one campaign or prior repair covers every 2005-2014 vehicle.',
  ),
};

const reasons = {
  'ford-mustang-2001-cobra-and-2003-2004-2001':
    'The frozen card uses only a forum home page and combines three model years, GT and Cobra transmissions, throwout bearing, pilot bearing, clutch fork, cable, quadrant, input shaft, lubrication, full clutch replacement, and prices without a Ford primary document.',
  'ford-mustang-2005-2010-smart-junction-box-2005':
    'The frozen record has no citations and combines cowl drains, grommets, windshield seals, Smart Junction Box corrosion, wipers, lighting, locks, starting, module replacement, sealing, and prices across six years without a Ford-defined population.',
  'ford-mustang-289-302-v8-overheating-from-undersized-2-row-radiator':
    'This is a classic-car cooling-system upgrade guide assembled from media, forums, and radiator shopping pages, not one Ford defect with an affected population and remedy.',
  'ford-mustang-4-6l-sohc-composite-intake-manifold-coolant-crossover-cracki':
    'The frozen card relies on forums, settlement commentary, and a performance-parts seller, then adds universal failure years, parts, labor, prices, and reimbursement implications without a current Ford primary service source.',
  'ford-mustang-40l-cologne-v6-thermostat-2005':
    'The only citation is a complaint aggregator home page and the card combines housing seams, thermostat, sensors, hoses, O-rings, coolant, overheating, part choices, and prices across six model years without a Ford bulletin.',
  'ford-mustang-46l-plastic-intake-manifold-2000':
    'The record has no citations and duplicates the composite-manifold topic with a different year range, universal replacement, gasket, coolant, torque, and price claims unsupported by a Ford primary document.',
  'ford-mustang-5-0-spark-plug-wire-melt-through-exhaust-manifolds':
    'The frozen card turns a generic problem page and forum roundup into one six-year wire-routing and header-heat defect with aftermarket sleeve and ignition-part recommendations but no Ford-defined condition.',
  'ford-mustang-blend-door-actuator-2015':
    'The only citation is a video and the card combines every actuator location, temperature and airflow symptom, calibration, dashboard access, part replacement, and pricing across nine years without a Ford bulletin.',
  'ford-mustang-cowl-vent-plenum-leaks-soaking-interior-rotting-cowl':
    'This is a classic restoration problem assembled from forums and a repair-kit seller, with structural cutting, welding, caps, seam sealer, drainage, and prices but no Ford campaign or service document defining one affected population.',
  'ford-mustang-ecoboost-coolant-2015':
    'The frozen card has no citations and applies coolant intrusion, misfire, smoke, head gasket, block, pressure testing, warranty, and engine replacement to 2015-2018 Mustang 2.3L vehicles without a Mustang-specific Ford bulletin.',
  'ford-mustang-ecoboost-head-gasket-failure-2015':
    'The card duplicates the uncited coolant-intrusion record using forums and legal or generic 2.3L articles, with no Mustang-specific Ford primary document supporting its population, repair, litigation, or price claims.',
  'ford-mustang-front-shock-tower-flex-sag-throwing-out-steering-geometry':
    'The frozen card is a classic chassis-modification guide sourced from brace sellers and a forum, not a Ford-defined defect; it mixes alignment, fatigue, rust, export braces, welding, and track-use recommendations.',
  'ford-mustang-front-strut-mount-and-2005':
    'The only citation is a forum home page and the card combines strut mounts, bearings, sway-bar links, bushings, ball joints, shocks, steering, alignment, and prices across ten years without a Ford bulletin.',
  'ford-mustang-fuel-tank-cracking-and-2005':
    'The frozen record has no citations and combines tank seams, filler neck, grommets, pump seals, EVAP leaks, crash damage, fuel odor, tank replacement, seal replacement, and prices across six years without a Ford safety or service source.',
  'ford-mustang-gen-3-coyote-5-0l-excessive-oil-consumption':
    'The frozen card relies on media, a forum, and F-150 litigation to assert a Mustang piston-ring defect, consumption threshold, monitor schedule, long-block replacement, class action, and prices without a Mustang-specific Ford bulletin.',
  'ford-mustang-irs-rear-clunk-2015':
    'The record has no usable citation and combines differential mounts, subframe bushings, axle nuts, driveshaft, half-shafts, wheel bearings, exhaust, shocks, braces, alignment, and prices across nine years without a Ford-defined condition.',
  'ford-mustang-marginal-front-drum-brakes':
    'This is classic-vehicle modernization advice from restoration content and parts sellers, not a defect record; it combines original design limitations, dual-circuit conversion, disc conversion, proportioning, wheels, and costs.',
  'ford-mustang-mt82-transmission-problems-2015':
    'The frozen card uses forums and a performance shop to generalize grinding, lockout, forks, synchros, fluid, clutch, shifter, rebuild, replacement, and prices across nine years without one Ford bulletin defining that failure population.',
  'ford-mustang-p0016-bank-1-crank-cam-correlation-from-coyote-timing-chain':
    'The frozen card labels a generic code page as a TSB and combines timing-chain stretch, phasers, solenoids, oil pressure, sensors, engine timing, parts, and prices across eight years without a Mustang-specific Ford source.',
  'ford-mustang-p0430-bank-2-catalytic-converter-efficiency-loss':
    'Ford TSB 19-2201 covers P0420 and P0430 together. This duplicate card adds forum and secondary-code speculation; both DTCs remain indexed on the retained primary-source card.',
  'ford-mustang-p0442-small-evap-leak-from-failing-canister-purge-valve':
    'The frozen card turns three forum discussions into a nine-year purge-valve defect with a revised part, cap, hoses, smoke testing, DIY replacement, prices, and repeated-failure claims but no Ford primary document.',
  'ford-mustang-plastic-clutch-quadrant-clutch-cable-failure':
    'This is Fox-body upgrade guidance sourced from parts sellers and a forum, combining plastic quadrant wear, cable stretch, firewall adjusters, clutch damage, aftermarket kits, installation, and prices without a Ford-defined defect.',
  'ford-mustang-rear-leaf-spring-axle-wrap-wheel-hop-under-acceleration':
    'The frozen record is classic suspension modification advice from forums and a spring seller, not one Ford defect; it combines spring fatigue, bushings, shocks, pinion angle, traction devices, ride quality, and costs.',
  'ford-mustang-rust-torque-boxes-frame-rails-floor-pans-trunk-drop-offs':
    'The frozen card is a broad classic-restoration inspection and welding guide sourced from media, parts catalogs, and forums, without a Ford campaign defining a specific affected population or remedy.',
  'ford-mustang-shelby-gt500-tr-9070-dct-overheating-derate-cooler-line-fail':
    'The frozen card relies only on owner forums and combines normal track thermal protection, cooler lines, filters, fluid, limp mode, pump or clutch damage, cooldown technique, upgrades, and prices without a Ford bulletin defining a defect.',
  'ford-mustang-sn95-rear-torque-box-control-arm-mount-tearing':
    'The frozen card is a racing-oriented reinforcement guide from forums and an aftermarket seller, combining launches, tires, rust, welds, bushings, control arms, chassis repair, and pricing without a Ford-defined failure population.',
  'ford-mustang-tfi-iv-ignition-module-heat-soak-failure':
    'The frozen card relies on generic aftermarket articles and a forum to prescribe one heat-soak module failure, relocation, distributor service, coil, PIP sensor, thermal compound, and prices across four years without a Ford primary source.',
  'ford-mustang-weak-generator-low-output-charging-system':
    'This is an alternator-conversion shopping and modification guide for classic cars, not a Ford defect; it combines original generator capacity, regulators, wiring, pulleys, one-wire conversions, and prices.',
};

module.exports = buildConfig({
  label: 'Ford Mustang',
  make: 'Ford',
  model: 'Mustang',
  slug: 'ford-mustang',
  batchId: 'ford-mustang-full-record-cohort-128-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c11a1f4f40dfdabc199c059abdc3590145b3c4d450fb47be080ec2de3704a92a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-mustang/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordmustang_blind:manual-primary-source-gate',
    edge: 'fordmustang_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
