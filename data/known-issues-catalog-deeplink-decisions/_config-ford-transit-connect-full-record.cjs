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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Transit%20Connect&modelYear=${year}`;
const eightF35Bulletin = 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253889-0001.pdf';

const published = {
  'ford-transit-connect-a-c-compressor-failure-or-no-cool-condition-refrigerant-leak-compressor-damage': replacement(
    {
      years: [2014, 2015, 2016, 2017],
      trims: ['Vehicles equipped with the Panoramic Fixed-Glass Vista roof'],
      category: 'body',
      title: 'Panoramic Roof Bond and Separation Recall',
      description: 'NHTSA campaign 20V260 covers certain 2014-2017 Transit Connect vehicles with a Panoramic Fixed-Glass Vista roof. An improper bond can cause wind noise, a water leak, or roof-panel separation while driving.',
      solution: 'Check the VIN and roof equipment with Ford. Dealers remove, clean, and reinstall the panoramic roof panel free of charge. New wind noise, water entry, or panel movement requires prompt inspection and avoidance of highway driving until secured.',
      severity: 'high',
      symptoms: ['Wind noise at the panoramic roof', 'Water leakage', 'Possible roof-panel movement or separation'],
      affectedSystems: ['panoramic fixed-glass roof', 'roof-to-body adhesive bond'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V260 - Transit Connect Panoramic Roof', url: recalls(2017) }],
      summary: 'Replaced a complaint-site A/C aggregation with the exact panoramic-roof bond and separation recall.',
    },
    'The frozen card generalized refrigerant leaks, clutch and compressor failure, contamination and full-system replacement across eight years from a complaint-site index without a Ford bulletin.',
  ),

  'ford-transit-connect-abs-wheel-speed-sensor-wiring-fault-abs-traction-control-lights-on': replacement(
    {
      years: [2016],
      category: 'brakes',
      title: 'Brake Hydraulic-Control-Unit Pump Recall',
      description: 'NHTSA campaign 16V482 covers certain 2016 Transit Connect vehicles. Metallic debris can contaminate the brake hydraulic-control-unit pump and degrade electronic stability-control and related brake-system performance.',
      solution: 'Check the VIN with Ford. Dealers replace the brake HCU pump free of charge. ABS, traction-control, stability-control, or brake warnings require code-based diagnosis and campaign verification rather than automatic wheel-speed-sensor replacement.',
      severity: 'high',
      symptoms: ['Possible ABS, stability-control, or traction-control warning', 'Possible degraded electronic brake-system performance'],
      affectedSystems: ['brake hydraulic control unit', 'HCU pump', 'electronic stability control'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 16V482 - Transit Connect Brake HCU Pump', url: recalls(2016) }],
      summary: 'Replaced a Reddit wheel-speed-sensor diagnosis with the exact HCU contamination recall.',
    },
    'The frozen card treated warning lamps as proof of a sensor or harness failure across eight years and prescribed hub, sensor and wiring repairs without a Ford diagnostic source.',
  ),

  'ford-transit-connect-brake-vacuum-pump-leak-failure-hard-brake-pedal-reduced-assist': replacement(
    {
      years: [2014],
      category: 'brakes',
      title: 'Brake-Fluid Reservoir Cap Label Recall',
      description: 'NHTSA campaign 14V406 covers certain 2014 Transit Connect vehicles whose brake-reservoir cap lacks the required brake-fluid specification. Adding the wrong fluid can damage seals, cause leaks, and lengthen stopping distance.',
      solution: 'Check the VIN with Ford. Dealers replace the brake-reservoir cap with the correctly labeled part free of charge. Never select brake fluid from this card; use the current Ford specification for the VIN.',
      severity: 'high',
      symptoms: ['Missing brake-fluid specification on the reservoir cap', 'Possible brake-system seal damage if incorrect fluid was added'],
      affectedSystems: ['brake-fluid reservoir cap', 'hydraulic brake seals and fluid'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V406 - Transit Connect Brake Reservoir Cap', url: recalls(2014) }],
      summary: 'Replaced an uncited vacuum-pump card with the exact brake-fluid labeling safety recall.',
    },
    'The frozen card had no citation and generalized vacuum-pump leaks, reduced assist, oil contamination and pump replacement across six years.',
  ),

  'ford-transit-connect-catalytic-converter-efficiency-fault-p0420-on-2-5l-duratec': replacement(
    {
      years: [2014],
      category: 'fuel',
      title: 'Fuel and Vapor Line Routing Recall',
      description: 'NHTSA campaign 14V703 covers certain 2014 Transit Connect vehicles whose fuel and vapor lines may be routed so they contact one another. Abrasion can produce a fuel leak and fire risk.',
      solution: 'Check the VIN with Ford. Dealers inspect the line routing and replace and reroute the fuel line when necessary, free of charge. Fuel odor or visible leakage requires immediate shutdown away from ignition sources.',
      severity: 'high',
      symptoms: ['Possible fuel odor or leakage', 'Possible abrasion where fuel and vapor lines contact'],
      affectedSystems: ['fuel line', 'vapor line', 'engine-compartment routing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V703 - Transit Connect Fuel-Line Routing', url: recalls(2014) }],
      summary: 'Replaced a complaint-site P0420 and converter card with the exact fuel-line abrasion recall.',
    },
    'The frozen card generalized P0420 to eight years, blamed multiple upstream causes and prescribed converter replacement without a Transit Connect Ford diagnostic bulletin.',
  ),

  'ford-transit-connect-evap-purge-valve-stuck-open-hard-start-after-refueling': replacement(
    {
      years: [2014, 2015],
      category: 'fuel',
      title: 'Fuel-Pump Plating and Stall Recall',
      description: 'NHTSA campaign 15V005 includes certain 2014-2015 Transit Connect vehicles. Improper nickel plating inside the fuel pump can cause pump failure and an engine stall without warning.',
      solution: 'Check the VIN with Ford. Dealers replace the fuel pump free of charge. Loss of fuel pressure, no-start, or a stall requires professional diagnosis and recall verification.',
      severity: 'high',
      symptoms: ['Possible no-start', 'Possible engine stall without warning'],
      affectedSystems: ['in-tank fuel pump', 'nickel-plated pump components'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V005 - Transit Connect Fuel Pump', url: recalls(2015) }],
      summary: 'Removed an unrelated coolant-intrusion citation and replaced the purge-valve card with the exact fuel-pump stall recall.',
    },
    'The frozen card cited NHTSA document MC-10169807, but that bulletin covers coolant intrusion on other Ford/Lincoln models and does not include Transit Connect. Its purge-valve population and remedy are therefore unsupported.',
  ),

  'ford-transit-connect-front-wheel-bearing-hubs-premature-wear-growl-hum-increases-with-speed': replacement(
    {
      years: [2021],
      category: 'safety',
      title: 'Passenger Seat-Belt ALR Recall',
      description: 'NHTSA campaign 21V592 includes certain 2021 Transit Connect vehicles. The front-passenger seat belt automatic locking retractor can deactivate early and fail to secure a child restraint properly.',
      solution: 'Check the VIN with Ford. Dealers inspect the front-passenger seat-belt assembly and replace it as necessary free of charge. Verify that a child restraint remains locked according to the vehicle and restraint instructions.',
      severity: 'high',
      symptoms: ['Passenger belt may not remain locked around a child restraint'],
      affectedSystems: ['front-passenger seat-belt assembly', 'automatic locking retractor'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V592 - Transit Connect Passenger Seat Belt', url: recalls(2021) }],
      summary: 'Replaced an uncited wheel-bearing wear card with the exact passenger seat-belt retractor recall.',
    },
    'The frozen card had no citation and generalized bearing noise, play, ABS effects and hub replacement across eight model years.',
  ),

  'ford-transit-connect-hvac-blower-motor-resistor-control-module-failure-fan-works-only-on-high-or-not': replacement(
    {
      years: [2014, 2015],
      category: 'electrical',
      title: 'Blank Instrument-Cluster Software Recall',
      description: 'NHTSA campaign 15V406 covers certain 2014-2015 Transit Connect vehicles. A software incompatibility can blank the multifunction display and disable warning chimes, messages, and warning lights.',
      solution: 'Check the VIN with Ford. Dealers update the instrument-panel software free of charge. A blank display or missing safety warnings requires prompt service because the driver may not receive tire-pressure, air-bag, and other warnings.',
      severity: 'high',
      symptoms: ['Blank multifunction display', 'Missing warning chimes, messages, or warning lights'],
      affectedSystems: ['instrument panel cluster', 'multifunction display', 'cluster software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V406 - Transit Connect Instrument Cluster', url: recalls(2015) }],
      summary: 'Replaced an uncited blower-resistor aggregation with the exact instrument-cluster software recall.',
    },
    'The frozen card had no citation and treated fan behavior as proof of a resistor, module, connector or motor failure across eight years.',
  ),

  'ford-transit-connect-ignition-coil-failure-and-misfires-2-5l-1-6l': replacement(
    {
      years: [2016, 2017],
      category: 'safety',
      title: 'Front Seat-Belt Pretensioner Recall',
      description: 'NHTSA campaign 20V305 covers certain 2016-2017 Transit Connect vehicles. An improper generant mixture in a front seat-belt pretensioner initiator can prevent the pretensioner from deploying in a crash.',
      solution: 'Check the VIN with Ford. Dealers inspect and replace the affected driver or passenger seat-belt assembly as necessary free of charge. Do not attempt pyrotechnic restraint repairs outside the manufacturer procedure.',
      severity: 'high',
      symptoms: ['No reliable pre-crash warning; pretensioner may not deploy as intended'],
      affectedSystems: ['front seat-belt pretensioner initiator', 'driver or passenger seat-belt assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V305 - Transit Connect Seat-Belt Pretensioners', url: recalls(2017) }],
      summary: 'Replaced an uncited ignition-coil and misfire card with the exact seat-belt pretensioner recall.',
    },
    'The frozen card had no citation and generalized coils, plugs, boots, oil intrusion and PCM drivers across multiple engines and eight years.',
  ),

  'ford-transit-connect-pcm-stalling-2017': replacement(
    {
      years: [2019, 2020],
      engines: ['2.5L'],
      category: 'engine',
      title: 'PCM Fail-Safe Cooling Re-Recall',
      description: 'NHTSA campaign 25V196 covers certain 2019-2020 Transit Connect vehicles with the 2.5L engine that were repaired incorrectly under campaign 20V636. PCM fail-safe temperature thresholds may remain too high, delaying protective cooling during coolant loss and allowing overheating.',
      solution: 'Check the VIN and prior recall completion with Ford. Dealers update the PCM software free of charge. A coolant warning, overheating, steam, or loss of power requires immediate safe shutdown.',
      severity: 'high',
      symptoms: ['Possible delayed fail-safe cooling response', 'Possible engine overheating during coolant loss'],
      affectedSystems: ['powertrain control module', 'fail-safe cooling calibration', 'engine cooling system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V196 - Transit Connect PCM Cooling Thresholds', url: recalls(2020) }],
      summary: 'Replaced a fabricated Reddit stalling link with the exact 2.5L PCM fail-safe cooling re-recall.',
    },
    'The frozen card used a non-authoritative Reddit URL and asserted a broad intermittent-stall calibration across four years. Retain only Ford’s exact 2.5L overheat-protection calibration campaign.',
  ),

  'ford-transit-connect-power-steering-motor-2014': replacement(
    {
      years: [2016, 2020],
      category: 'body',
      title: 'Windshield Adhesion Recall',
      description: 'NHTSA campaign 22V192 covers certain 2016 and 2020 Transit Connect vehicles whose windshield may have inadequate adhesion to the body. The windshield can detach in a crash and increase injury risk.',
      solution: 'Check the VIN with Ford. Dealers inspect the windshield and remove and reinstall it when necessary, free of charge. Visible bond gaps, wind noise, or movement requires prompt inspection.',
      severity: 'high',
      symptoms: ['Possible windshield bond gap, wind noise, or movement'],
      affectedSystems: ['front windshield', 'windshield-to-body adhesive bond'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V192 - Transit Connect Windshield Adhesion', url: recalls(2020) }],
      summary: 'Replaced a fabricated Reddit steering-motor card with the exact windshield adhesion recall.',
    },
    'The frozen card asserted motor, torque-sensor, rack and software failures across seven years from a fabricated-style Reddit URL without Ford evidence.',
  ),

  'ford-transit-connect-rear-door-wiring-harness-break-liftgate-rear-electrical-intermittent': replacement(
    {
      years: [2018, 2019, 2020, 2021, 2022],
      category: 'electrical',
      title: 'Rearview-Camera Software Recall',
      description: 'NHTSA campaign 25V442 includes certain 2018-2022 Transit Connect vehicles. A software error can produce a blank rearview-camera image or leave the image displayed after the backing event ends.',
      solution: 'Check the VIN with Ford. Dealers update rearview-camera software free of charge. Do not rely on the camera alone; use direct observation if the image is blank, stale, or remains displayed outside Reverse.',
      severity: 'high',
      symptoms: ['Blank rearview-camera image', 'Rearview image remains after shifting out of Reverse'],
      affectedSystems: ['rearview camera', 'camera display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V442 - Transit Connect Rearview-Camera Software', url: recalls(2020) }],
      summary: 'Replaced an uncited rear-door wiring diagnosis with the exact rearview-camera software recall.',
    },
    'The frozen card had no citation and attributed many liftgate electrical functions to a broken harness across eight years without Ford diagnostic scope.',
  ),

  'ford-transit-connect-rear-liftgate-latch-handle-failure-liftgate-won-t-open': replacement(
    {
      years: [2014, 2015, 2016],
      category: 'body',
      title: 'Front Door-Latch Pawl Recall',
      description: 'NHTSA campaign 23V502 covers certain 2014-2016 Transit Connect vehicles. A front door-latch pawl can crack and prevent the door from latching, allowing it to open while driving.',
      solution: 'Check the VIN with Ford. Dealers inspect and replace the front door latches as necessary free of charge. Do not drive with a door that will not latch securely; tying or holding it closed is not a repair.',
      severity: 'high',
      symptoms: ['Front door difficult or impossible to latch', 'Door may appear closed without being secured'],
      affectedSystems: ['front door latch', 'latch pawl'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V502 - Transit Connect Front Door Latches', url: recalls(2016) }],
      summary: 'Replaced an uncited liftgate-handle card with the exact front door-latch pawl recall.',
    },
    'The frozen card had no citation and generalized handle, microswitch, actuator and wiring causes to every 2014-2021 vehicle.',
  ),

  'ford-transit-connect-rear-suspension-clunk-2014': replacement(
    {
      years: [2019, 2020],
      category: 'transmission',
      title: 'Start/Stop Accumulator Fluid-Leak Recall',
      description: 'NHTSA campaign 20V550 covers certain 2019-2020 Transit Connect vehicles. Missing or loose bolts on the transmission start/stop accumulator endcap can cause a fluid leak, loss of transmission function, and possible fire near an ignition source.',
      solution: 'Check the VIN with Ford. Dealers replace the start/stop accumulator free of charge. Transmission-fluid leakage, loss of drive, or burning odor requires immediate shutdown away from ignition sources.',
      severity: 'high',
      symptoms: ['Possible transmission-fluid leak', 'Possible loss of transmission function', 'Possible burning odor or fire'],
      affectedSystems: ['start/stop accumulator', 'accumulator endcap bolts', 'automatic transmission fluid'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 20V550 - Transit Connect Start/Stop Accumulator', url: recalls(2020) }],
      summary: 'Replaced a fabricated Reddit suspension-clunk card with the exact transmission accumulator recall.',
    },
    'The frozen card generalized links, bushings and clunks across nine years from a fabricated-style Reddit URL and offered parts replacement without Ford evidence.',
  ),

  'ford-transit-connect-sliding-door-cable-2014': replacement(
    {
      years: [2014],
      trims: ['Cargo vans with the affected plastic sliding-door panel'],
      category: 'body',
      title: 'Sliding-Door Exterior Panel Bond Recall',
      description: 'NHTSA campaign 14V777 covers certain 2014 Transit Connect cargo vans. Improper bond strength between a plastic sliding-door panel and the paint primer can let the panel separate while driving.',
      solution: 'Check the VIN and door configuration with Ford. Dealers reinstall the panel with the proper materials free of charge. Panel lifting, looseness, or separation requires the vehicle not be driven until secured.',
      severity: 'high',
      symptoms: ['Loose or lifting plastic sliding-door panel', 'Possible panel separation while driving'],
      affectedSystems: ['plastic sliding-door panel', 'panel-to-primer adhesive bond'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 14V777 - Transit Connect Sliding-Door Panel', url: recalls(2014) }],
      summary: 'Replaced an uncited cable-and-roller aggregation with the exact sliding-door exterior-panel bond recall.',
    },
    'The frozen card had no citation and generalized cable, roller, track and adjustment failures across ten model years.',
  ),

  'ford-transit-connect-taillight-water-leak-2014': replacement(
    {
      years: [2015, 2016, 2017, 2018],
      category: 'electrical',
      title: 'Rearview-Camera Image Distortion Recall',
      description: 'NHTSA campaign 25V572 includes certain 2015-2018 Transit Connect vehicles. The rearview camera may display a distorted, inverted, or blank image while the vehicle is in Reverse.',
      solution: 'Check the VIN with Ford. Dealers inspect and replace the rearview camera as necessary free of charge. Use direct observation rather than relying on a distorted, inverted, or blank image.',
      severity: 'high',
      symptoms: ['Distorted, inverted, or blank rearview-camera image'],
      affectedSystems: ['rearview camera', 'rear visibility display'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V572 - Transit Connect Rearview Camera', url: recalls(2017) }],
      summary: 'Replaced a placeholder YouTube taillight-leak card with the exact rearview-camera image recall.',
    },
    'The frozen card cited a placeholder-style YouTube URL and generalized taillight gasket leaks, corrosion and resealing across eight years.',
  ),

  'ford-transit-connect-throttle-body-etc-fault-causing-limp-mode-reduced-engine-power': replacement(
    {
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      engines: ['2.5L'],
      category: 'transmission',
      title: 'Shifter-Cable Bushing Rollaway Recall',
      description: 'NHTSA campaign 22V413 includes 2013-2021 Transit Connect vehicles with the 2.5L engine. The bushing that attaches the shifter cable to the transmission can degrade or detach, causing an unintended gear selection or rollaway after Park is selected.',
      solution: 'Check the VIN and engine with Ford. Dealers replace the underhood shifter-cable bushing and add a protective cap free of charge. Always set the parking brake; unexpected shifter feel or vehicle movement requires immediate inspection.',
      severity: 'high',
      symptoms: ['Shifter position may not match the transmission gear', 'Possible rollaway after selecting Park'],
      affectedSystems: ['underhood shifter cable', 'transmission selector bushing', 'protective cap'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V413 - Transit Connect Shifter-Cable Bushing', url: recalls(2021) }],
      summary: 'Replaced an uncited throttle-body limp-mode card with the exact shifter-cable bushing rollaway recall.',
    },
    'The frozen card had no citation and treated reduced power as proof of throttle-body failure across eight years without a Ford diagnostic bulletin.',
  ),

  'ford-transitconnect-16-ecoboost-coolant-2014': replacement(
    {
      years: [2013, 2014, 2015],
      engines: ['1.6L GTDI'],
      category: 'engine',
      title: '1.6L GTDI Coolant-Loss and Cylinder-Head Fire Recall',
      description: 'NHTSA campaign 17V209 covers certain 2013-2015 Transit Connect vehicles with the 1.6L GTDI engine. Driving with insufficient coolant can overheat and crack the cylinder head, allowing oil to contact hot engine or exhaust components and start a fire.',
      solution: 'Check the VIN and engine with Ford. Dealers install a coolant-level sensor plus supporting hardware and software free of charge. A low-coolant warning, overheating, steam, or oil leak requires immediate safe shutdown.',
      severity: 'high',
      symptoms: ['Low coolant or coolant warning', 'Engine overheating', 'Possible oil leak, smoke, or fire'],
      affectedSystems: ['1.6L GTDI cooling system', 'cylinder head', 'coolant-level sensor'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 17V209 - Transit Connect 1.6L GTDI Cooling', url: recalls(2015) }],
      summary: 'Corrected the years and replaced the forum citation with the exact 1.6L GTDI coolant-loss fire recall.',
    },
    'The frozen card named a real recall but included 2016-2018 vehicles outside the NHTSA Transit Connect population and cited an unrelated forum transmission thread.',
  ),

  'ford-transitconnect-8f35-trans-shudder-2019': replacement(
    {
      years: [2019, 2020, 2021],
      trims: ['Vehicles built on or before December 20, 2021 and equipped with the 8F35 transmission'],
      category: 'transmission',
      title: '8F35 Slipping and Harsh-Engagement Bulletin',
      description: 'Ford TSB 23-2333 covers certain 2019-2021 Transit Connect vehicles built on or before December 20, 2021 with the 8F35 transmission. Slipping, harsh engagement, clutch DTCs, or torque-converter-clutch DTCs may result from worn needle bearings in the output planet carrier assembly.',
      solution: 'Confirm the build date, 8F35 transmission and stored DTCs, then follow Ford TSB 23-2333. The Ford procedure diagnoses the output planet carrier and related internal damage; do not assume a fluid service or complete transmission replacement from shudder alone.',
      severity: 'medium',
      symptoms: ['Transmission slipping', 'Harsh engagement', 'Possible clutch or torque-converter-clutch DTCs'],
      affectedSystems: ['8F35 automatic transmission', 'output planet carrier needle bearings', 'transmission clutches'],
      sources: [{ type: 'tsb', title: 'Ford TSB 23-2333 - Transit Connect 8F35 Slipping and Harsh Engagement', url: eightF35Bulletin }],
      summary: 'Narrowed the 8F35 card to Ford TSB 23-2333, its build cutoff, mechanism and diagnostic scope.',
    },
    'The frozen card cited only Reddit and extended the condition through 2023 while prescribing fluid, valve-body and transmission replacement. Retain Ford’s exact 2019-2021 bulletin condition.',
  ),

  'ford-transitconnect-door-latch-recall-2014': replacement(
    {
      years: [2014, 2015, 2016],
      category: 'body',
      title: 'Side Door-Latch Failure and Re-Inspection Recall',
      description: 'NHTSA campaigns 16V643 and 20V331 cover certain 2014-2016 Transit Connect vehicles. A door-latch component can break so a door will not latch or only appears secured; some prior repairs also require re-inspection because they may have been completed incorrectly.',
      solution: 'Check the VIN and recall-repair history with Ford. Dealers replace affected latches and inspect prior repair date codes as required, free of charge. Do not drive with a door that does not latch securely.',
      severity: 'high',
      symptoms: ['Door difficult or impossible to latch', 'Door may appear closed without being secured'],
      affectedSystems: ['side door latches', 'latch pawl and internal components', 'prior recall repair parts'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 16V643 - Transit Connect Door Latches', url: recalls(2016) },
        { type: 'recall', title: 'NHTSA Campaign 20V331 - Transit Connect Door-Latch Re-Inspection', url: recalls(2015) },
      ],
      summary: 'Preserved the door-latch topic but replaced Reddit with the exact original campaign and later re-inspection campaign.',
    },
    'The frozen card named the Ford campaign but relied on Reddit and omitted the later re-inspection campaign for potentially incorrect prior repairs.',
  ),
};

module.exports = buildConfig({
  label: 'Ford Transit Connect',
  make: 'Ford',
  model: 'Transit Connect',
  slug: 'ford-transit-connect',
  batchId: 'ford-transit-connect-full-record-cohort-136-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '3a6871974d3cb30f5c11dd0dd4e4ac7cd4396d2df251e3fd5c7d9163c5146963',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-transit-connect/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordtransitconnect_blind:manual-primary-source-gate',
    edge: 'fordtransitconnect_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
