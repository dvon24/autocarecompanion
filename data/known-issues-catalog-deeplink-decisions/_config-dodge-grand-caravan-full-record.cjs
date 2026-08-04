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
      source: card.source || 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const transmissionPumpRecall = {
  years: [2015, 2016],
  trims: ['Vehicles built July 31, 2015-April 18, 2016 and included in recall S44; verify by VIN'],
  category: 'transmission',
  title: 'Transmission Pump Can Seize and Cause Loss of Motive Power (Recall 16V-461)',
  description:
    'FCA safety recall S44/NHTSA 16V-461 covers certain 2015-2016 Dodge Grand Caravan vehicles. A transmission pump that does not conform to specifications may seize, causing a loss of hydraulic pressure and loss of motive power while driving.',
  solution:
    'Check the VIN for recall S44/16V-461. FCA\'s recall remedy is free replacement of the transmission pump. Do not treat every 62TE shift complaint as this condition or replace a solenoid pack from this card; confirm recall eligibility and diagnose non-recall symptoms separately.',
  severity: 'high',
  symptoms: ['Transmission loses hydraulic pressure', 'Vehicle loses motive power', 'Transmission pump may seize'],
  affectedSystems: ['automatic-transmission pump', 'transmission hydraulic-pressure circuit', 'vehicle propulsion'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 16V-461 - Loss of Power From Transmission Pump Failure', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCAK-16V461-7968.pdf' }],
  summary:
    'Replaced the thirteen-year solenoid-pack aggregation with recall S44\'s exact 2015-2016 build window, pump-seizure mechanism, hydraulic-pressure consequence, and free pump replacement.',
};

const powerSteeringHoseRecall = {
  years: [2002, 2003, 2004],
  trims: ['Vehicles with a 3.3L or 3.8L V6 included in recall 04V-386; verify by VIN'],
  engines: ['3.3L V6', '3.8L V6'],
  category: 'steering',
  title: 'Upper Power-Steering Cooler Hose Can Split and Leak (Recall 04V-386)',
  description:
    'NHTSA recall 04V-386 covers certain 2002-2004 Dodge Grand Caravan minivans with 3.3L or 3.8L engines. The upper power-steering cooler hose can split and leak fluid; leaked fluid can ignite if it reaches an ignition source under the hood.',
  solution:
    'Check the VIN for recall 04V-386. DaimlerChrysler\'s remedy is replacement of the upper power-steering cooler hose. Do not assume pump whine proves this hose defect; inspect the steering-fluid level and leak source and handle any fire evidence as urgent.',
  severity: 'high',
  symptoms: ['Power-steering fluid leak', 'Low steering-fluid level', 'Under-hood smoke or fire may occur if fluid reaches an ignition source'],
  affectedSystems: ['upper power-steering cooler hose', 'hydraulic power-steering fluid circuit'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 04V-386 - Power-Steering Cooler Hose Leak', url: 'https://www.nhtsa.gov/recalls?nhtsaId=04V386000' }],
  summary:
    'Replaced the thirteen-year pump-whine aggregation and video with recall 04V-386\'s exact 2002-2004 3.3L/3.8L hose-split condition, fire risk, and hose remedy.',
};

const slidingDoorActuator = {
  years: [2015, 2016, 2017],
  trims: ['Vehicles built May 1, 2015-January 9, 2017 with power locks (JPB) and X98 coverage; verify by VIN'],
  category: 'body',
  title: 'Sliding-Door Locks Can Buzz or Stop Working (X98 Warranty Extension)',
  description:
    'FCA TSB 23-036-21 covers certain 2015-2017 Dodge Grand Caravan vehicles with power locks. A sliding-door lock actuator can emit a loud buzzing sound or stop locking and unlocking. FCA states the door can still be manually locked or unlocked for this bulletin condition.',
  solution:
    'Check DealerCONNECT or the VIN for X98 coverage and confirm the exact lock symptom. FCA directs replacement of the affected left or right sliding-door lock actuator when necessary under the warranty extension; diagnose a door that cannot be opened manually as a different or additional condition.',
  severity: 'medium',
  symptoms: ['One or both sliding-door power locks do not function', 'Loud buzzing during lock or unlock operation', 'Door does not power-lock or power-unlock'],
  affectedSystems: ['left sliding-door lock actuator', 'right sliding-door lock actuator', 'power-lock system'],
  dtcCodes: [],
  sources: [
    { type: 'tsb', title: 'FCA TSB 23-036-21 - Sliding Door Lock(s) Inoperative, X98 Warranty Extension', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10204383-9999.pdf' },
    { type: 'nhtsa', title: 'NHTSA Investigation PE21-016 Closing Resume - Sliding Doors Inoperative', url: 'https://static.nhtsa.gov/odi/inv/2021/INCLA-PE21016-4007.PDF' },
  ],
  source: 'manual',
  summary:
    'Narrowed the thirteen-year motor/actuator card to FCA\'s exact 2015-2017 power-lock build range, buzzing/inoperative-lock symptoms, manual-lock boundary, actuator remedy, and X98 coverage.',
};

const published = {
  'dodge-grand-caravan-62te-trans-2008': replacement(
    transmissionPumpRecall,
    'Replace the thirteen-year aftermarket solenoid-pack aggregation with recall S44/16V-461\'s exact 2015-2016 pump-seizure condition and free transmission-pump replacement.',
  ),
  'dodge-grand-caravan-ps-pump-2008': replacement(
    powerSteeringHoseRecall,
    'Replace the thirteen-year pump-whine card and video with recall 04V-386\'s exact 2002-2004 upper cooler-hose split, fluid-leak/fire risk, and hose replacement.',
  ),
  'dodge-grand-caravan-sliding-door-2008': replacement(
    slidingDoorActuator,
    'Replace the thirteen-year uncited motor/actuator aggregation with FCA TSB 23-036-21 and NHTSA PE21-016\'s exact 2015-2017 lock-actuator population, symptoms, manual-lock boundary, and X98 remedy.',
  ),
};

const reasons = {
  'dodge-grand-caravan-cooling-2001':
    'The frozen card combines water pumps, lower-intake gaskets, coolant hoses, radiator tanks, two engines, ten model years, mileage, costs, and multiple repairs from forums without one DaimlerChrysler/FCA primary source defining a common failure condition.',
  'dodge-grand-caravan-engine-mount-2008':
    'The frozen card asserts engine and transmission mount deterioration across thirteen model years with mileage, symptoms, costs, and mount replacement but provides no manufacturer bulletin establishing the affected mount, build population, or diagnostic boundary.',
  'dodge-grand-caravan-oil-sludge-2011':
    'The frozen card attributes ten model years of Pentastar noise, pressure warnings, and timing-related DTCs to oil sludge and prescribes flushing or engine teardown from one video without an FCA primary source proving the condition.',
  'dodge-grand-caravan-rocker-arm-2011':
    'The frozen card treats all 2011-2020 Pentastar ticking and misfires as rocker-arm and camshaft failure with common mileage, costs, DTCs, and parts replacement from lawsuits, news, and forums without one FCA bulletin defining that complete population and remedy.',
  'dodge-grand-caravan-tipm-2008':
    'The frozen card combines no-start, stalls, wipers, locks, lighting, fuel-pump relay, TIPM replacement, relay bypasses, thirteen model years, mileage, and costs from secondary and repair-service sources without one FCA primary source supporting a universal TIPM failure diagnosis.',
  'dodge-grand-caravan-trans-cooler-leak-2008':
    'The frozen card asserts a radiator-connection transmission-cooler-line leak across thirteen model years and prescribes hose and fitting replacement from one video without an FCA bulletin defining the connection, build population, diagnosis, or remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Grand Caravan',
  make: 'Dodge',
  model: 'Grand Caravan',
  slug: 'dodge-grand-caravan',
  batchId: 'dodge-grand-caravan-full-record-cohort-72-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7934e4fa346297205c52169ef094de12270913f3a710738370f1d9f33f9d91a2',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-grand-caravan/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgegrandcaravan_blind:manual-primary-source-gate',
    edge: 'dodgegrandcaravan_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V268000', '01I003000', '01V152000', '01V310000', '02V274000', '02V293000',
    '03E053000', '03V094000', '03V505000', '04V047000', '04V386000', '04V480000',
    '04V531000', '06E091000', '06V067000', '07E104000', '09V046000', '09V351000',
    '10V008000', '10V235000', '10V261000', '10V270000', '10V271000', '10V338000',
    '10V611000', '11V139000', '11V315000', '11V394000', '11V487000', '12V141000',
    '12V191000', '13V283000', '13V291000', '14V055000', '14V234000', '14V373000',
    '14V632000', '15V595000', '16V044000', '16V047000', '16V300000', '16V461000',
    '17V376000', '17V824000', '18V523000', '18V524000', '19V759000', '20V278000',
    '20V396000', '25V876000', '95I001001', '95I001005', '95I004000', '95V225000',
    '95V236000', '96V002000', '96V006000', '96V136000', '96V215000', '97I001000',
    '97V200000', '97V231000', '98V185000', '99V113000', '99V116000', '99V216000',
  ],
});
