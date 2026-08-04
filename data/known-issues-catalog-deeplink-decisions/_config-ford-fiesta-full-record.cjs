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

function recall(title, url) {
  return { type: 'recall', title, url };
}

const fiesta2014Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fiesta&modelYear=2014';
const fiesta2015Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Fiesta&modelYear=2015';

const published = {
  'ford-fiesta-1-0l-ecoboost-degas-hose-coolant-loss-ecoboom-overheating-en': replacement(
    {
      years: [2014, 2015],
      trims: ['Fiesta ST vehicles identified by VIN'],
      engines: ['1.6L GTDI'],
      category: 'cooling',
      title: 'Recall 17S09: Low Coolant Can Overheat and Crack the Cylinder Head',
      description:
        'NHTSA campaign 17V209 covers certain 2014-2015 Fiesta ST vehicles with the 1.6L GTDI engine. If the vehicle is driven with insufficient coolant, the cylinder head can overheat, crack, and leak oil. Oil contacting a hot engine or exhaust component can cause a fire.',
      solution:
        'Check the VIN for Ford recall 17S09 and maintain the correct coolant level. A Ford dealer installs a coolant-level sensor and supporting hardware and software free of charge. This campaign does not establish the frozen card\'s 1.0L engine, six-year degas-hose failure, or universal engine-replacement claim.',
      severity: 'high',
      symptoms: ['Low coolant level', 'Engine overheating', 'Possible oil leak after a cracked cylinder head', 'Possible smoke or fire if oil reaches a hot surface'],
      affectedSystems: ['engine cooling system', 'coolant-level monitoring', 'cylinder head'],
      sources: [recall('NHTSA Campaign 17V209 / Ford Recall 17S09', fiesta2014Recalls)],
      summary:
        'Corrected the frozen 1.0L degas-hose aggregation to the exact 2014-2015 Fiesta ST 1.6L GTDI low-coolant/cylinder-head safety recall and sensor remedy.',
    },
    'Replace the secondary-source 1.0L “EcoBoom” aggregation with the actual Ford/NHTSA Fiesta coolant-related safety campaign.',
  ),

  'ford-fiesta-door-latch-2011': replacement(
    {
      years: [2011, 2012, 2013, 2014, 2015],
      trims: ['Campaign coverage varies by VIN, prior repair, and for some campaigns registration jurisdiction'],
      engines: [],
      category: 'body',
      title: 'Door-Latch Recalls: Doors May Not Latch or May Open While Driving',
      description:
        'Several NHTSA campaigns cover specific 2011-2015 Fiesta populations. A component inside a side-door latch can break, making the door difficult to latch or allowing it to open while driving. Later campaigns expanded hot-climate coverage or re-inspected vehicles whose earlier recall repair may have used an incorrect latch.',
      solution:
        'Check the VIN for every open Ford door-latch campaign rather than relying on model year alone. Depending on the campaign, a Ford dealer inspects latch date codes and replaces affected side-door latches or all four latches free of charge.',
      severity: 'high',
      symptoms: ['Door is difficult to latch', 'Door appears closed but is not securely latched', 'Door may open while driving'],
      affectedSystems: ['side-door latches'],
      sources: [
        recall('Ford Recall 20S30 / NHTSA Campaign 20V331', 'https://static.nhtsa.gov/odi/rcl/2020/RCMN-20V331-1020.pdf'),
        recall('NHTSA Fiesta Recall Results - Door-Latch Campaigns', fiesta2014Recalls),
        recall('NHTSA Campaign 23V775 / Ford Recall 20S15 Expansion', fiesta2015Recalls),
      ],
      summary:
        'Rewrote the card as a VIN-gated 2011-2015 multi-campaign latch defect, including original, hot-climate, expansion, and prior-repair inspection populations.',
    },
    'Retain the safety condition while reflecting the overlapping campaign populations and later inspection/expansion actions instead of implying one universal recall.',
  ),

  'ford-fiesta-powershift-dps6-2011': replacement(
    {
      years: [2011, 2012, 2013, 2014, 2015],
      trims: ['Vehicles equipped with the DPS6 automatic transmission and covered by Ford program 14M02'],
      engines: [],
      category: 'transmission',
      title: 'DPS6 Transmission Control Module Can Cause Loss of Engagement or No-Start',
      description:
        'Ford Customer Satisfaction Program 14M02 covers certain 2011-2015 Fiesta vehicles with the DPS6 automatic transmission. Electrical circuit failures inside the transmission control module can cause intermittent loss of transmission engagement while driving, an intermittent no-start, or loss of power. The historical program supplied time- and mileage-limited extended coverage whose current applicability must be checked.',
      solution:
        'Have a Ford dealer verify the VIN, program status, DPS6 equipment, symptoms, stored codes, software level, and TCM communication. The program addresses a confirmed TCM failure and includes required Ford software procedures. Do not assume every shudder, slip, clutch leak, or drivability concern is a failed TCM, and do not assume the historical coverage period remains open.',
      severity: 'high',
      symptoms: ['Intermittent loss of transmission engagement while driving', 'Intermittent no-start', 'Loss of power', 'Possible warning lamp or flashing gear display'],
      affectedSystems: ['DPS6 automatic transmission', 'transmission control module'],
      dtcCodes: ['U0100', 'U0101', 'U1013', 'P0606'],
      sources: [
        { type: 'tsb', title: 'Ford Program 14M02 - DPS6 TCM Extended Coverage', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237441-0001.pdf' },
        { type: 'tsb', title: 'Ford DPS6 TCM Coverage and Documented Failure Symptoms', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199780-0001.pdf' },
      ],
      summary:
        'Narrowed the frozen nine-year shudder/slip/failure aggregation to the exact 2011-2015 DPS6 TCM program, electrical-failure symptoms, diagnostic gate, and historically limited coverage.',
    },
    'Retain the exact Ford TCM program and remove the unsupported claim that all shudder, slip, clutch, and complete-transmission failures share one remedy.',
  ),

  'ford-fiesta-tank-fuel-pump-failure-stall-without-warning': replacement(
    {
      years: [2014, 2015],
      trims: ['Certain vehicles manufactured within the campaign production window and identified by VIN'],
      engines: [],
      category: 'fuel',
      title: 'Recall 14S30: Improper Fuel-Pump Plating Can Cause a Stall',
      description:
        'NHTSA campaign 15V005 covers certain 2014-2015 Fiesta vehicles manufactured during a limited 2014 production window. Improper nickel plating on internal fuel-pump components can cause the pump to fail and the engine to stall without warning.',
      solution:
        'Check the VIN for Ford recall 14S30. A Ford dealer replaces the fuel pump free of charge. Do not infer campaign eligibility from model year alone or replace the pump without confirming the VIN and diagnosis.',
      severity: 'high',
      symptoms: ['Engine stall without warning', 'Possible no-start after fuel-pump failure'],
      affectedSystems: ['in-tank fuel pump'],
      sources: [recall('NHTSA Campaign 15V005 / Ford Recall 14S30', fiesta2014Recalls)],
      summary:
        'Replaced secondary recall summaries with the exact VIN- and production-window-gated 2014-2015 fuel-pump plating defect and free dealer replacement.',
    },
    'Retain the exact NHTSA 15V005 safety recall and remove forum and secondary-source citations.',
  ),
};

const reasons = {
  'ford-fiesta-1-6l-ecoboost-intake-valve-carbon-buildup':
    'The frozen card treats direct-injection architecture and deposits observed in forum posts as a universal six-year defect, then prescribes cleaning intervals and methods without a Ford bulletin defining a failure population and remedy.',
  'ford-fiesta-blend-door-actuator-2011':
    'The frozen card has no citations and applies one actuator-failure diagnosis and replacement to every 2011-2019 Fiesta without identifying the affected actuator, DTC, HVAC configuration, or Ford service procedure.',
  'ford-fiesta-coil-spring-fracture-snapped-suspension-spring':
    'The frozen card relies on owner and advice forums to aggregate front and rear spring fractures across twelve model years without a Ford campaign, geographic population, component identifier, or single repair.',
  'ford-fiesta-coolant-leak-thermostat-2011':
    'The only citation is a fabricated-looking placeholder YouTube URL, and no Ford primary source reviewed supports one thermostat-housing leak and replacement across every 2011-2019 Fiesta engine.',
  'ford-fiesta-electric-power-steering-assist-fault-sudden-loss-assist':
    'The frozen card relies on complaint aggregation and a law-firm page, combines electrical, mechanical, sensor, voltage, and module causes, and recommends rack replacement across nine model years without an exact Ford condition.',
  'ford-fiesta-electronic-throttle-body-failure-sudden-limp-mode-wrench-lig':
    'The frozen card combines a wrench lamp, limp mode, throttle-body hardware, wiring, PCM, and several DTC paths from commercial and owner sources. It does not establish one Ford-defined throttle-body failure and remedy.',
  'ford-fiesta-fiesta-st-rear-motor-mount-bushing-failure-vibration-wheel-h':
    'The frozen card relies only on enthusiast forums and presents wear, vibration, wheel hop, launch behavior, mount inserts, and upgraded mounts as one defect across all 2014-2019 Fiesta ST vehicles without a Ford primary source.',
  'ford-fiesta-ignition-coil-spark-plug-misfire-oil-fouled-coils-water-ingr':
    'The frozen card combines ignition-coil failure, spark-plug wear, oil contamination, water ingress, wiring faults, and several repairs across nine years using forum and generic symptom material rather than a Ford-defined population.',
  'ford-fiesta-manual-transmission-clutch-judder-slave-release-cylinder-fai':
    'The frozen card merges clutch friction, hydraulic slave/release-cylinder, flywheel, master-cylinder, and gearbox conditions from owner forums and applies them to every manual Fiesta across nine years without an exact Ford source.',
  'ford-fiesta-power-window-regulator-cable-failure-glass-drops-into-door':
    'The frozen card aggregates motor, regulator, cable, switch, glass, and door-trim conditions across twelve years from repair and owner forums, with no Ford bulletin or campaign defining one premature failure and remedy.',
  'ford-fiesta-purge-valve-2011':
    'The frozen card has no citations and applies one purge-valve diagnosis to hard starting, EVAP codes, fuel economy, idle, and stalling across every 2011-2019 Fiesta without a Ford-defined engine or production population.',
  'ford-fiesta-rear-suspension-knock-worn-rear-shock-top-mounts-damper-bush':
    'The frozen card relies on owner forums and combines top mounts, shock absorbers, bushings, springs, and several noise sources across nine years without an exact Ford service condition.',
  'ford-fiesta-sync-apim-infotainment-freezing-rebooting-bluetooth-carplay':
    'The frozen card combines multiple SYNC generations, APIM hardware, Bluetooth, CarPlay, software, wiring, battery resets, and replacement across nine years using non-primary sources and no exact Ford bulletin population.',
  'ford-fiesta-tdci-diesel-dpf-blockage-failed-regeneration':
    'The frozen card is based on UK owner/advice material, combines short-trip use, sensor faults, failed regeneration, cleaning, additives, and replacement across nine years, and does not identify a Ford bulletin or U.S.-market population.',
  'ford-fiesta-water-leak-into-footwell-blocked-scuttle-drain-pollen-filter':
    'The frozen card aggregates several possible body-water paths and repairs across nine years using only owner forums. It identifies no Ford-defined build range, leak test, seam, drain, or exact remedy.',
  'ford-fiesta-wet-belt-timing-belt-degradation-clogging-oil-pump-pickup':
    'The frozen card relies on a news article about a federal inquiry and a commercial engine source, then applies belt degradation, oil-pump blockage, pressure loss, turbo damage, and engine failure to every 2013-2019 Fiesta without an exact Ford/NHTSA Fiesta campaign.',
};

module.exports = buildConfig({
  label: 'Ford Fiesta',
  make: 'Ford',
  model: 'Fiesta',
  slug: 'ford-fiesta',
  batchId: 'ford-fiesta-full-record-cohort-119-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '769de95ad588632721fe7279ccce051d912bf945cb2a55c7f600958f1dd808ac',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-fiesta/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfiesta_blind:manual-primary-source-gate',
    edge: 'fordfiesta_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
