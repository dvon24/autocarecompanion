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
      source: card.source || 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const leftCylinderHead = {
  years: [2011, 2012, 2013],
  trims: ['Select vehicles with the 3.6L ERB engine and X56 coverage; verify by VIN'],
  engines: ['3.6L V6 (sales code ERB)'],
  category: 'engine',
  title: 'Left Cylinder-Head Valve-Guide or Seat Wear Can Cause Misfire (X56)',
  description:
    'Chrysler warranty bulletin D-14-12/X56 covers select 2011-2013 Dodge Journey vehicles with the 3.6L ERB engine. Valve-guide and valve-seat wear in the left cylinder head can cause a misfire and illuminate the malfunction indicator lamp.',
  solution:
    'Check DealerCONNECT/VIP for an X56 message and diagnose the misfire under FCA Service Bulletin 09-002-14 before replacing parts. The published X56 coverage was 10 years or 150,000 miles from the in-service date; current coverage and reimbursement eligibility must be confirmed for the VIN.',
  severity: 'medium',
  symptoms: ['Engine misfire', 'Malfunction indicator lamp', 'Misfire involving the left cylinder bank may be recorded'],
  affectedSystems: ['left cylinder-head valve guides', 'left cylinder-head valve seats', '3.6L ERB combustion and misfire monitoring'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Chrysler Warranty Bulletin D-14-12 / X56 - 3.6L Left Cylinder Head', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10069161-0335.pdf' }],
  source: 'manual',
  summary:
    'Retained the left-head condition but narrowed it to Chrysler\'s select 2011-2013 ERB/X56 population, valve-guide/seat wear mechanism, misfire boundary, and VIN-specific warranty procedure.',
};

const pcmBoardRecall = {
  years: [2009],
  trims: ['Vehicles included in recall H33/08V-528; verify by VIN'],
  category: 'electrical',
  title: 'PCM Printed-Circuit Board Can Break and Stall the Engine (Recall 08V-528)',
  description:
    'NHTSA recall 08V-528 covers a narrow population of 2009 Dodge Journey vehicles. An adhesive introduced during PCM manufacture can cause the printed-circuit board to break, which can stall the engine without warning.',
  solution:
    'Check the VIN for recall 08V-528. Chrysler\'s remedy is free PCM replacement. This recall does not establish that ordinary 62TE slipping, limp mode, or solenoid DTCs require a transmission or solenoid-pack replacement.',
  severity: 'high',
  symptoms: ['Engine stalls without warning', 'Loss of PCM operation'],
  affectedSystems: ['powertrain control-module printed-circuit board', 'engine control'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 08V-528 - PCM Printed-Circuit Board Failure', url: 'https://www.nhtsa.gov/recalls?nhtsaId=08V528000' }],
  summary:
    'Replaced the twelve-year aftermarket 62TE aggregation with the exact 2009 PCM-board recall and removed unsupported solenoid, mileage, cost, and transmission-replacement claims.',
};

const ignitionRecall = {
  years: [2009, 2010],
  trims: ['Vehicles built through June 18, 2010 and included in recall R03; verify by VIN'],
  category: 'electrical',
  title: 'Wireless Ignition Node Can Move Out of Run and Shut Off the Engine (Recall 14V-373)',
  description:
    'FCA safety recall R03/NHTSA 14V-373 covers certain 2009-2010 Dodge Journey vehicles. The ignition key can unintentionally move from On to Accessory while driving, shutting off the engine and depowering systems including airbags, power steering, and power braking.',
  solution:
    'Check the VIN for recall R03 even if the earlier L25 action was completed. FCA\'s final remedy replaces the Wireless Ignition Node module and the FOBIKs and programs the new module.',
  severity: 'high',
  symptoms: ['Ignition key moves from On toward Accessory while driving', 'Engine shuts off unexpectedly', 'Power steering, power braking, or airbags can be depowered'],
  affectedSystems: ['Wireless Ignition Node module', 'FOBIK ignition keys', 'engine and safety-system power'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'FCA Safety Recall R03 / NHTSA 14V-373 - Wireless Ignition Node Module', url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V373-5366.pdf' }],
  summary:
    'Retained the ignition safety issue with FCA\'s final R03 instructions, exact 2009-2010 build scope, engine/safety-system consequence, and WIN-module-plus-FOBIK remedy.',
};

const steeringHoseRecall = {
  years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
  trims: ['Block-heater-equipped vehicles included in recall S08; verify engine, build date, and VIN'],
  category: 'steering',
  title: 'Power-Steering Return Hose Can Rupture After Extreme Cold (Recall 16V-273)',
  description:
    'FCA recall S08/NHTSA 16V-273 covers certain 2009-2016 Dodge Journey vehicles equipped with an engine block heater. After extended exposure to extreme cold, a return hose or cooler line can rupture at engine start, leak fluid, and cause loss of power-steering assist.',
  solution:
    'Check the VIN for recall S08/16V-273. FCA\'s remedy replaces the applicable power-steering return hoses, steel tubes, and oil cooler. Steering remains mechanically connected, but extra effort can be required, especially at low speed.',
  severity: 'high',
  symptoms: ['Power-steering fluid leak after a cold start', 'Noise may follow fluid loss', 'Steering effort increases after loss of assist'],
  affectedSystems: ['power-steering return hoses', 'power-steering steel tubes', 'power-steering fluid cooler'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'FCA Safety Recall S08 / NHTSA 16V-273 - Power Steering Return Hose and Fluid Cooler', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V273-8350.pdf' }],
  summary:
    'Retained the steering-hose recall with its exact block-heater/cold-weather boundary, loss-of-assist consequence, warning symptoms, and multi-line/cooler remedy.',
};

const transmissionPumpRecall = {
  years: [2015, 2016],
  trims: ['Vehicles built August 17, 2015-January 29, 2016 and included in recall S44; verify by VIN'],
  category: 'transmission',
  title: 'Transmission Pump Can Seize and Cause Loss of Motive Power (Recall 16V-461)',
  description:
    'FCA safety recall S44/NHTSA 16V-461 covers certain 2016 model-year Dodge Journey vehicles built during the stated 2015-2016 production window. A transmission pump may seize, causing loss of hydraulic pressure and motive power.',
  solution:
    'Check the VIN for recall S44/16V-461. FCA\'s remedy is free replacement of the transmission pump. Do not expand this recall to every 2015-2016 Journey or every transmission symptom without VIN confirmation.',
  severity: 'high',
  symptoms: ['Transmission pump seizes', 'Transmission loses hydraulic pressure', 'Vehicle loses motive power'],
  affectedSystems: ['automatic-transmission pump', 'transmission hydraulic-pressure circuit', 'vehicle propulsion'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'FCA Safety Recall S44 / NHTSA 16V-461 - Transaxle Oil Pump', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V461-1293.pdf' }],
  summary:
    'Retained the exact S44 pump-seizure recall, removed secondary media, corrected the model-year/build-window distinction, and limited the remedy to VIN-confirmed pump replacement.',
};

const published = {
  'dodge-journey-3-6l-pentastar-v6-left-cylinder-head-failure': replacement(leftCylinderHead, 'Retain the X56 left-cylinder-head condition but remove secondary sources and narrow all claims to Chrysler Warranty Bulletin D-14-12\'s select 2011-2013 ERB population and VIN-specific coverage.'),
  'dodge-journey-62te-trans-2009': replacement(pcmBoardRecall, 'Replace the twelve-year aftermarket 62TE slipping/solenoid aggregation with recall 08V-528\'s exact 2009 PCM printed-circuit-board stall condition and PCM remedy.'),
  'dodge-journey-ignition-switch-2009': replacement(ignitionRecall, 'Retain recall R03 with the final FCA instructions and exact 2009-2010 WIN-module failure, safety consequence, and WIN/FOBIK remedy.'),
  'dodge-journey-power-steering-2009': replacement(steeringHoseRecall, 'Retain recall S08 with the exact engine-block-heater, extreme-cold, hose/cooler-line, loss-of-assist, and dealer remedy boundaries.'),
  'dodge-journey-transmission-pump-seizure-loss-propulsion': replacement(transmissionPumpRecall, 'Retain recall S44 using the FCA dealer instructions, exact 2016 model-year production window, pump-seizure mechanism, and VIN-specific free remedy.'),
};

const reasons = {
  'dodge-journey-wireless-ignition-node-module-ignition-switch-defect':
    'This card duplicates the same R03/14V-373 WIN-module recall now preserved once under the existing ignition-switch card; retaining both would duplicate one population, mechanism, and remedy.',
  'dodge-journey-premature-brake-pad-rotor-wear':
    'This card duplicates the other 2009-2013 premature-brake-wear aggregation and relies on complaints, litigation, and secondary articles rather than a Dodge primary source defining the claimed population and repair.',
  'dodge-journey-tipm-failure-causing-widespread-electrical-faults':
    'This card duplicates the other broad TIPM card and attributes unrelated electrical behavior to a single module from complaint/forum evidence without FCA diagnosis or a manufacturer-defined defect population.',
  'dodge-journey-fuel-pump-relay-2009':
    'The frozen card imports TIPM fuel-pump-relay behavior and bypass products across seven model years from rebuilders and forums without a Journey-specific FCA campaign or bulletin establishing that scope.',
  'dodge-journey-head-gasket-2013':
    'The frozen card asserts 2013-2015 head-gasket failure, DTCs, mileage, costs, and replacement from one video; the verified X56 left-head valve-guide/seat condition is different and preserved separately.',
  'dodge-journey-rocker-arm-2011':
    'The frozen card treats all 2011-2020 Pentastar ticking/misfire as rocker-arm failure using lawsuits, news, and forums without a Journey-specific FCA bulletin establishing the population and repair boundary.',
  'dodge-journey-tipm-2009':
    'The frozen card attributes six model years of no-start, stall, wiper, lock, lighting, and fuel-pump behavior to TIPM failure from one video without an FCA primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Journey',
  make: 'Dodge',
  model: 'Journey',
  slug: 'dodge-journey',
  batchId: 'dodge-journey-full-record-cohort-75-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'e401d050176d5dc7b5df782e5e796349884415db0800ee9a9a501185497d4c5c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-journey/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgejourney_blind:manual-primary-source-gate',
    edge: 'dodgejourney_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '08V247000', '08V528000', '09V082000', '09V118000', '10V475000', '10V658000',
    '11V315000', '11V487000', '11V550000', '14V373000', '14V711000', '15V431000',
    '15V675000', '16V047000', '16V273000', '16V461000', '16V907000', '17V432000',
    '17V824000', '18V332000', '18V396000', '18V398000', '18V523000', '18V524000',
    '22V723000', '25V552000',
  ],
});
