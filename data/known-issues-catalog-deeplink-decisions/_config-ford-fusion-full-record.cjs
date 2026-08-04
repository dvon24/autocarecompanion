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

const fusion2011Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fusion&modelYear=2011';
const fusion2014Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fusion&modelYear=2014';
const fusion2015Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fusion&modelYear=2015';
const fusion2016Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fusion&modelYear=2016';
const fusion2017Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fusion&modelYear=2017';

const published = {
  'ford-fusion-1-6l-ecoboost-localized-cylinder-head-overheating-engine-fir': replacement(
    {
      years: [2013, 2014],
      engines: ['1.6L GTDI / EcoBoost'],
      trims: ['Certain vehicles identified by VIN and campaign build dates'],
      category: 'engine',
      title: '1.6L Coolant-Loss and Cylinder-Head Fire Recalls',
      description:
        'NHTSA campaign 12V551 covers certain 2013 Fusion 1.6L vehicles whose coolant-system leaks can overheat the engine and release flammable fluids. Campaign 17V209 covers certain 2013-2014 Fusion 1.6L vehicles in which driving with insufficient coolant can overheat and crack the cylinder head, allowing an oil leak and increasing fire risk.',
      solution:
        'Check the VIN for every open Ford campaign. The 12V551 remedy includes a coolant-system leak inspection plus updated PCM and instrument-cluster overheat strategy. The 17V209 remedy installs a coolant-level sensor with supporting hardware and software. Ford dealers perform covered recall work free of charge; an overheated, smoking, or leaking engine should be shut down and inspected rather than driven.',
      severity: 'high',
      symptoms: ['Low coolant or coolant warning', 'Engine overheat warning', 'Oil or coolant leak', 'Smoke or burning-fluid odor'],
      affectedSystems: ['1.6L engine cylinder head', 'engine cooling system', 'coolant-level monitoring'],
      sources: [{ type: 'recall', title: 'NHTSA Fusion Recall Results - Campaigns 12V551 and 17V209', url: fusion2014Recalls }],
      summary:
        'Corrected the wrong 14V437 identifier and separated the exact 12V551 and 17V209 populations and remedies without promising engine replacement.',
    },
    'Retain the exact 1.6L safety campaigns while removing the wrong campaign number, unsupported universal failure language, repair-price claims, and automatic cylinder-head or long-block replacement.',
  ),

  'ford-fusion-15-ecoboost-coolant-intrusion-2014': replacement(
    {
      years: [2014, 2015, 2016, 2017, 2018, 2019],
      engines: ['1.5L EcoBoost'],
      trims: ['Vehicles built on or before 10-Jun-2019 that meet Ford diagnostic criteria'],
      category: 'engine',
      title: '1.5L EcoBoost Coolant Intrusion into a Cylinder',
      description:
        'Ford TSB 20-2100 applies to some 2014-2019 Fusion vehicles with the 1.5L EcoBoost built on or before 10-Jun-2019. Low coolant, white exhaust smoke, rough running, and specified misfire or overtemperature codes can result from coolant entering a cylinder.',
      solution:
        'A technician should pressure-test the cooling system and inspect the cylinders under Ford service procedures. When the bulletin criteria confirm coolant intrusion, Ford directs replacement of the short block and head gasket. A TSB does not itself guarantee warranty coverage, so verify the VIN, build date, diagnosis, and current coverage before authorizing repair.',
      severity: 'high',
      symptoms: ['Low coolant with no confirmed external leak', 'White exhaust smoke', 'Rough running or misfire', 'Possible overtemperature warning'],
      affectedSystems: ['1.5L EcoBoost short block', 'head gasket', 'engine cooling system'],
      dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0316', 'P0217', 'P1285', 'P1299'],
      sources: [
        { type: 'tsb', title: 'Ford TSB 20-2100 - 1.5L EcoBoost Coolant Intrusion', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174400-0001.pdf' },
        { type: 'tsb', title: 'Ford TSB 19-2375 - Earlier 1.5L Coolant-Intrusion Procedure', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10168739-0001.pdf' },
      ],
      summary:
        'Narrowed the card to Ford TSB 20-2100 build dates, diagnostic symptoms and codes, and short-block/head-gasket procedure while removing litigation and blanket coverage claims.',
    },
    'Retain Ford\'s exact 1.5L bulletin condition and remove the unsupported porous-block theory, class-action assertions, FTC claim, 7-year/84,000-mile promise, hydrolock anecdote, coolant-brand advice, and owner-report counts.',
  ),

  'ford-fusion-6f35-6-speed-automatic-harsh-delayed-shifting-torque-convert': replacement(
    {
      years: [2017],
      engines: ['2.0L gasoline engine'],
      trims: ['Certain vehicles with a six-speed automatic transmission identified by VIN'],
      category: 'transmission',
      title: 'Recall 17S16: Torque-Converter Weld Studs May Detach',
      description:
        'NHTSA campaign 17V427 covers certain 2017 Fusion vehicles with a 2.0L gasoline engine and six-speed automatic transmission. Inadequately welded torque-converter studs can detach and cause loss of torque transmission to the driveline.',
      solution:
        'Check the VIN for Ford recall 17S16. Ford dealers replace the torque converter free of charge on covered vehicles. Harsh shifts or shudder on vehicles outside this precise campaign require transmission diagnosis and should not be attributed automatically to the recall.',
      severity: 'high',
      symptoms: ['Sudden loss of motive power', 'Engine runs but torque is not transmitted to the driveline'],
      affectedSystems: ['six-speed automatic transmission', 'torque converter weld studs'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 17V427 / Ford Recall 17S16', url: fusion2017Recalls }],
      summary:
        'Replaced the decade-wide 6F35 failure aggregation with the exact 2017 torque-converter weld-stud safety recall and VIN-gated remedy.',
    },
    'Retain the exact torque-converter safety action while removing universal 6F35 wear, fluid-service, valve-body, rebuild, replacement-price, settlement, and owner-forum claims.',
  ),

  'ford-fusion-door-latch-2013': replacement(
    {
      years: [2013, 2014, 2015, 2016],
      trims: ['Coverage varies by VIN, build date, registration region, and prior-recall repair'],
      category: 'body',
      title: 'Door-Latch Recalls: Door May Not Latch or May Open While Driving',
      description:
        'Ford and NHTSA issued multiple Fusion door-latch actions. Campaigns include nationwide coverage for certain 2013-2014 vehicles, warm-climate coverage for certain 2014-2016 vehicles, and inspections of vehicles whose prior latch recall may have been repaired incorrectly. A broken latch component can make a door difficult to secure or allow it to open while driving.',
      solution:
        'Check the VIN for every open Ford door-latch campaign rather than relying on model year alone. Depending on the campaign, a Ford dealer replaces all four side-door latches or inspects latch date codes and replaces the affected latches. Covered recall work is free of charge.',
      severity: 'high',
      symptoms: ['Door is difficult or impossible to latch', 'Door appears closed but is not secure', 'Door may open while driving'],
      affectedSystems: ['side-door latch assemblies'],
      sources: [
        { type: 'recall', title: 'NHTSA 2014 Fusion Recall Results - Door-Latch Campaigns', url: fusion2014Recalls },
        { type: 'recall', title: 'NHTSA 2016 Fusion Recall Results - Door-Latch Campaigns', url: fusion2016Recalls },
      ],
      summary:
        'Preserved the safety defect but made the overlapping original, regional, and prior-repair campaigns VIN-specific instead of presenting one blanket 2013-2016 recall.',
    },
    'Retain the exact door-latch safety actions while removing a single-campaign oversimplification and requiring VIN, region, build-date, and prior-repair checks.',
  ),

  'ford-fusion-electronic-throttle-body-failure-limp-mode-wrench-light': replacement(
    {
      years: [2009, 2010, 2011, 2012, 2013],
      engines: ['2.5L', '3.0L'],
      trims: ['Certain vehicles covered by historical Customer Satisfaction Program 13N03'],
      category: 'engine',
      title: 'Program 13N03: Throttle-Body Motor-Contact Contamination',
      description:
        'Ford Customer Satisfaction Program 13N03 addressed certain 2009-2013 Fusion vehicles whose throttle-body internal motor contacts could develop contamination and intermittent electrical connectivity. The condition can illuminate the MIL or wrench lamp and place the engine in a reduced-power default-throttle mode while steering, braking, lighting, and climate functions remain available. This was an extended-coverage program, not a safety recall.',
      solution:
        'Diagnose warning lamps and reduced power under Ford procedures, including stored or historical throttle codes. The historical program authorized throttle-body replacement when dealer diagnosis identified it as the causal component and included a PCM calibration update. Verify VIN and current coverage; do not assume the old time/mileage extension remains available or replace a throttle body from symptoms alone.',
      severity: 'medium',
      symptoms: ['MIL or wrench lamp', 'Intermittent reduced engine power', 'Fixed-RPM default-throttle mode'],
      affectedSystems: ['electronic throttle body', 'throttle-body motor contacts', 'Powertrain Control Module calibration'],
      dtcCodes: ['P2111', 'P2112'],
      sources: [
        { type: 'tsb', title: 'Ford Program 13N03 Service Procedure', url: 'https://static.nhtsa.gov/odi/inv/2013/INME-PE13003-58942.pdf' },
        { type: 'nhtsa', title: 'NHTSA PE13-003 Closing Resume', url: 'https://static.nhtsa.gov/odi/inv/2013/INCLA-PE13003-4125.PDF' },
      ],
      summary:
        'Narrowed the broad 2010-2016 limp-mode card to Ford\'s exact 2009-2013 13N03 population, failure mode, diagnostic gate, and historical coverage status.',
    },
    'Retain the documented Ford program while removing unsupported 2014-2016 coverage, universal engine applicability, generic cleaning advice, repeated-stall language, parts pricing, and an unverified replacement part number.',
  ),

  'ford-fusion-evap-purge-valve-stuck-leaking-check-engine-light-rough-runn': replacement(
    {
      years: [2010, 2011],
      trims: ['Certain vehicles identified by VIN and campaign build dates'],
      category: 'fuel',
      title: 'Recall 15S34: Purge-Valve Fault Can Crack the Fuel Tank',
      description:
        'NHTSA campaign 15V793 covers certain 2010-2011 Fusion vehicles whose canister purge valve may malfunction and create abnormal fuel-tank pressure changes. Repeated pressure cycling can crack the tank and cause a fuel leak, increasing fire risk near an ignition source.',
      solution:
        'Check the VIN for Ford recall 15S34. Ford dealers update PCM software, inspect for related diagnostic codes, leak-test the canister purge valve, and inspect the fuel tank. The purge valve and fuel tank are replaced when the campaign inspection shows that they are necessary. Covered recall work is free of charge.',
      severity: 'high',
      symptoms: ['Possible fuel odor or fuel leak', 'Possible warning lamp associated with a purge-valve fault'],
      affectedSystems: ['canister purge valve', 'fuel tank', 'Powertrain Control Module software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V793 / Ford Recall 15S34', url: 'https://static.nhtsa.gov/odi/rcl/2015/RCAK-15V793-3847.pdf' }],
      summary:
        'Replaced generic EVAP troubleshooting with the exact 2010-2011 purge-valve/fuel-tank safety recall, inspection sequence, and conditional parts replacement.',
    },
    'Retain the exact safety recall while removing generic P0442/P0455 diagnosis, rough-running claims, DIY replacement instructions, universal part numbers, and price estimates.',
  ),

  'ford-fusion-front-brake-hose-rupture-loss-brake-fluid-longer-stopping': replacement(
    {
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      trims: ['Certain vehicles identified by VIN'],
      category: 'brakes',
      title: 'Recall 23S12: Front Brake Hoses May Rupture',
      description:
        'NHTSA campaign 23V162 covers certain 2013-2018 Fusion vehicles whose front brake hoses may rupture and leak brake fluid. A progressive loss of brake fluid can increase pedal travel and stopping distance and raises crash risk.',
      solution:
        'Check the VIN for Ford recall 23S12. Ford dealers replace both front brake hoses free of charge. If the brake-fluid warning appears, pedal travel increases, or fluid is visible near a front wheel, stop driving and have the vehicle inspected or towed rather than merely topping off the reservoir.',
      severity: 'high',
      symptoms: ['Brake-fluid warning lamp', 'Longer or softer brake-pedal travel', 'Brake fluid near a front wheel', 'Longer stopping distance'],
      affectedSystems: ['front flexible brake hoses', 'hydraulic brake system'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 23V162 / Ford Recall 23S12', url: fusion2017Recalls },
        { type: 'recall', title: 'Ford 23S12 Fusion Front Brake Hose Recall', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/23s12-fusion-and-edge-2013-2019-front-brake-hose-recall/' },
      ],
      summary:
        'Retained the exact front-brake-hose recall with VIN verification, free hose replacement, and safe response to fluid-loss symptoms.',
    },
    'Retain the exact 23V162 campaign while removing non-primary media citations and any implication that model year alone proves recall inclusion.',
  ),

  'ford-fusion-hybrid-battery-degradation-2010': replacement(
    {
      years: [2010, 2011, 2012],
      trims: ['Fusion Hybrid (HEV)'],
      category: 'electrical',
      title: 'Age-Related Software Can Reduce Hybrid Electric Operation',
      description:
        'Ford TSB 20-2142 applies to some 2010-2012 Fusion Hybrid vehicles that develop reduced electric-vehicle operation and increased gasoline-engine operation around ten years of vehicle age. Ford attributes this specific condition to BECM and PCM software, not automatically to high-voltage battery degradation.',
      solution:
        'Have a Ford-capable technician confirm the symptom and software level. The bulletin directs reprogramming the Battery Energy Control Module and Powertrain Control Module. Diagnose battery-health codes or a confirmed loss of battery capacity separately; the bulletin does not direct routine high-voltage battery replacement or guarantee current warranty coverage.',
      severity: 'medium',
      symptoms: ['Reduced electric-only operation', 'Gasoline engine runs more often around ten years of vehicle age'],
      affectedSystems: ['Battery Energy Control Module', 'Powertrain Control Module', 'hybrid operating strategy'],
      sources: [{ type: 'tsb', title: 'Ford TSB 20-2142 - Reduced Electric Vehicle Operation', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174404-0001.pdf' }],
      summary:
        'Corrected the universal battery-degradation/replacement card to Ford\'s exact 2010-2012 software condition and module-reprogramming remedy.',
    },
    'Retain Ford\'s exact hybrid operating-condition bulletin while removing unsupported battery-life percentages, mileage thresholds, warning codes, pack-replacement prices, remanufactured-battery sales advice, and placeholder video citation.',
  ),

  'ford-fusion-power-steering-failure-2013': replacement(
    {
      years: [2013, 2014, 2015, 2016],
      trims: ['Certain salt-belt vehicles identified by VIN and registration history'],
      category: 'steering',
      title: 'Salt-Belt Recall: Steering-Gear Motor Bolts Can Corrode',
      description:
        'NHTSA campaigns 15V250 and 19V632 cover certain 2013-2016 Fusion vehicles sold or registered in specified salt-belt jurisdictions. Road salt or other contaminants can corrode electric steering-gear motor attachment bolts. Broken or missing bolts can cause a loss of power steering assist while manual steering remains possible with greater effort.',
      solution:
        'Check the VIN and registration history for Ford campaigns 15S14 and 19S26. A Ford dealer replaces the steering-gear motor bolts and applies protective sealer; if bolts are broken or missing, the steering gear is replaced. Covered recall work is free of charge.',
      severity: 'high',
      symptoms: ['Power steering assist fault warning', 'Sudden increase in steering effort'],
      affectedSystems: ['electric steering gear', 'steering-gear motor attachment bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaigns 15V250 and 19V632 / Ford 15S14 and 19S26', url: fusion2015Recalls }],
      summary:
        'Narrowed the broad 2013-2018 rack-failure claim to the exact salt-belt bolt-corrosion recalls, geographic gate, and conditional steering-gear replacement.',
    },
    'Retain the exact salt-belt safety campaigns while removing unsupported 2017-2018 coverage, generic electronic rack failure, unrelated DTCs, remanufactured-part advice, and repair-price claims.',
  ),

  'ford-fusion-shifter-cable-bushing-detaches-vehicle-rollaway-risk': replacement(
    {
      years: [2013, 2014, 2015, 2016],
      trims: ['Certain vehicles with six-speed automatic transmissions identified by VIN'],
      category: 'transmission',
      title: 'Recall 22S43: Shift-Cable Bushing Can Detach',
      description:
        'NHTSA campaign 22V413 covers certain 2013-2016 Fusion vehicles whose under-hood shift-cable bushing may degrade or detach. The selected gear may then differ from the transmission gear, creating unintended movement or rollaway risk.',
      solution:
        'Check the VIN for Ford recall 22S43 and use the parking brake consistently until any open remedy is completed. Ford dealers replace the under-hood shift bushing and add a protective cap free of charge. Do not rely on the shifter display alone if the vehicle does not behave as expected.',
      severity: 'high',
      symptoms: ['Shifter position does not match transmission gear', 'Vehicle may move after Park is selected', 'No-start if the transmission is not actually in Park or Neutral'],
      affectedSystems: ['transmission shift cable', 'under-hood shift-cable bushing', 'protective bushing cap'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 22V413 / Ford Recall 22S43', url: fusion2014Recalls }],
      summary:
        'Updated the card to the superseding 22S43 population and complete bushing-plus-cap remedy, with a parking-brake interim precaution.',
    },
    'Retain the exact superseding safety recall while removing the older incomplete campaign framing, 2.5L-only scope, DIY clip advice, and parts-shopping claims.',
  ),

  'ford-fusion-steering-rack-failure-2010': replacement(
    {
      years: [2011, 2012],
      trims: ['Certain vehicles without the 3.5L engine identified by VIN'],
      category: 'steering',
      title: 'Recall 15S18: Steering-Motor Sensor Fault Can Disable Assist',
      description:
        'NHTSA campaign 15V340 covers certain 2011-2012 Fusion vehicles without the 3.5L engine. A steering-motor sensor fault can shut down electric power steering assist, increasing steering effort while manual steering remains available.',
      solution:
        'Check the VIN for Ford recall 15S18. A Ford dealer checks the Power Steering Control Module for loss-of-assist codes. The recall remedy updates PSCM software when no qualifying code is present and replaces the steering gear when a qualifying loss-of-assist code is found. Covered recall work is free of charge.',
      severity: 'high',
      symptoms: ['Power steering assist warning', 'Sudden increase in steering effort'],
      affectedSystems: ['electric power steering motor sensor', 'Power Steering Control Module', 'steering gear'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V340 / Ford Recall 15S18', url: fusion2011Recalls }],
      summary:
        'Corrected the model years and rewrote the card around the exact sensor-fault recall, diagnostic split, software remedy, and conditional gear replacement.',
    },
    'Retain the exact 15V340 campaign while removing unsupported 2013 coverage, generic rack-failure claims, unrelated DTCs, non-primary citations, and repair pricing.',
  ),
};

const reasons = {
  'ford-fusion-awd-power-transfer-unit-overheating-fluid-leak-failure':
    'The frozen card applies one overheating, seal, fluid-life, drain-plug, maintenance, and replacement narrative to every 2010-2019 AWD Fusion, but its Ford bulletin citation is for other Ford/Lincoln models and its remaining source is an owner-forum aggregation rather than a Fusion-specific primary document.',
  'ford-fusion-hvac-blend-door-actuator-failure-clicking-knocking-behind-da':
    'The frozen card combines every Fusion generation, engine, actuator location, temperature and airflow symptom, reset procedure, part choice, and repair price from an estimator and answer forum without a Ford-defined failure population.',
  'ford-fusion-myford-touch-sync-2-freezing-black-screen-rebooting':
    'Ford publishes general SYNC troubleshooting and software bulletins for specific versions and symptoms, but the frozen card turns those into one 2013-2016 APIM hardware defect with fuse resets, battery disconnection, module replacement, pricing, and upgrade advice unsupported by one exact Ford bulletin.',
  'ford-fusion-parasitic-battery-drain-dead-battery-no-start':
    'The frozen card combines BCM, APIM, TCU, radio, trunk-latch, alternator, wiring, hybrid-system, sleep-current, fuse-pull, charger, battery, and software explanations across nine model years using only forum and paid-answer sources, with no single Ford-defined condition or remedy.',
  'ford-fusion-power-window-regulator-failure-window-bounce-back':
    'The frozen card combines normal bounce-back initialization, regulator and motor failure, guide lubrication, glass alignment, universal all-door coverage, and repair prices from a forum and estimator rather than an exact Ford service communication.',
  'ford-fusion-water-intrusion-into-trunk-tire-well-wet-carpet-corroded-mod':
    'The frozen card combines taillight gaskets, rivets, weatherstrips, rear glass, split welds, drains, hybrid electronics, rust, mold, sealers, and replacement parts across 2013-2018 vehicles from forum and paid-answer posts without a Ford bulletin defining this population and repair.',
};

module.exports = buildConfig({
  label: 'Ford Fusion',
  make: 'Ford',
  model: 'Fusion',
  slug: 'ford-fusion',
  batchId: 'ford-fusion-full-record-cohort-125-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7a2875cc0e38c2fe3f7b3263a81230bff2862a91204583b3f14990b5dce00b81',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-fusion/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfusion_blind:manual-primary-source-gate',
    edge: 'fordfusion_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
