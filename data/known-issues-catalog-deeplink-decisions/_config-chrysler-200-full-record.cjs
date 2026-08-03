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
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const oilConsumption = {
  years: [2015, 2016, 2017],
  trims: ['Vehicles with a 2.4L MultiAir engine covered by FCA bulletin 09-018-24; confirm applicability by VIN and engine sales code'],
  engines: ['2.4L I4 MultiAir (ED6, ED8, EDE, or EDD)'],
  category: 'engine',
  title: '2.4L MultiAir Excessive Oil Consumption (FCA Bulletin 09-018-24)',
  description: 'FCA bulletin 09-018-24 covers 2015-2017 Chrysler 200 vehicles with specified 2.4L MultiAir engines. Owners may report an oil-pressure-low warning between oil changes or excessive oil consumption. FCA identifies the cause as the interactive deceleration fuel-shutoff calibration. The bulletin also confirms completion of earlier W20 or W84 software actions before the oil-consumption test; this is a service bulletin, not a new safety recall.',
  solution: 'Have a Chrysler dealer confirm the VIN, engine sales code, software-action history, oil level, leaks, and test eligibility under bulletin 09-018-24. The procedure uses FCA\'s oil-consumption test after the required software actions. If the vehicle fails the test, the bulletin directs replacement of the engine long block. Coverage is VIN- and warranty-specific, so ask the dealer to verify current eligibility rather than assuming a universal free repair.',
  severity: 'medium',
  symptoms: ['Oil-pressure-low warning between oil changes', 'Oil level drops during the prescribed consumption test', 'Frequent need to add engine oil'],
  affectedSystems: ['2.4L MultiAir engine', 'engine-control calibration', 'engine lubrication'],
  sources: [{ type: 'tsb', title: 'FCA Bulletin 09-018-24 - 2.4L Excessive Oil Consumption XB1 Warranty Extension', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006983-0001.pdf' }],
  summary: 'Consolidated the duplicate oil-consumption cards into FCA bulletin 09-018-24\'s exact 2015-2017 2.4L population, test sequence and long-block remedy without retaining unsupported cost or mileage claims.',
};

const cruiseControl = {
  years: [2015, 2016, 2017],
  trims: ['Vehicles with a gasoline engine and Adaptive Cruise Control included in recall U59 / 18V-332; verify by VIN'],
  category: 'electrical',
  title: 'Cruise-Control Torque Request May Remain Active (Recall 18V-332)',
  description: 'Recall U59 / 18V-332 covers certain 2015-2017 Chrysler 200 vehicles with a gasoline engine and Adaptive Cruise Control. If a vehicle wiring short stops CAN-C communication while cruise control is requesting positive torque, the Powertrain Control Module may not remove that request. The vehicle may maintain speed or accelerate until the driver shifts to Neutral or brakes to a stop.',
  solution: 'Do not use cruise control until the VIN has been checked and any open recall U59 completed. An authorized dealer inspects the PCM software level and reprograms it when needed; 2.4L vehicles also receive the applicable TCM update. The recall repair is performed at no charge.',
  severity: 'high',
  symptoms: ['Cruise control does not cancel as expected', 'Vehicle maintains speed or accelerates after a CAN-C communication interruption', 'VIN included in recall U59'],
  affectedSystems: ['Powertrain Control Module software', 'CAN-C communication bus', 'adaptive cruise control torque request'],
  sources: [{ type: 'recall', title: 'FCA Safety Recall U59 / NHTSA 18V-332 - Reprogram Powertrain Control Module', url: 'https://static.nhtsa.gov/odi/rcl/2018/RCRIT-18V332-3588.pdf' }],
  summary: 'Replaced the generic cruise-control card with FCA recall U59\'s exact equipment scope, CAN-C failure mechanism, safe interim instruction and software remedy.',
};

const lowSpeedStall = {
  years: [2011],
  trims: ['Vehicles with the 3.6L engine in NHTSA investigation PE12-016 and Chrysler\'s customer-satisfaction campaign'],
  engines: ['3.6L V6'],
  category: 'engine',
  title: 'Low-Speed or Idle Stall From Purge-Monitor Calibration (PE12-016)',
  description: 'NHTSA investigation PE12-016 covered 2011 Chrysler 200 vehicles with the 3.6L engine. Chrysler found that a PCM purge-monitor check at idle could create an overly rich vapor condition and stall the engine while stopped or moving at very low speed; the engine typically restarted immediately. NHTSA closed the investigation in October 2012 after Chrysler began a customer-satisfaction campaign. This action was not a safety recall.',
  solution: 'Ask a Chrysler dealer to confirm whether the vehicle received the customer-satisfaction PCM reprogramming described in PE12-016. A current stall still requires diagnosis because fuel, ignition, electrical, mechanical, and emissions-system faults can cause similar symptoms; do not replace a throttle body solely from this historical card.',
  severity: 'medium',
  symptoms: ['Engine stalls while stopped', 'Engine stalls during very-low-speed travel or deceleration', 'Engine restarts immediately after the event'],
  affectedSystems: ['Powertrain Control Module calibration', 'evaporative-emissions purge monitoring', 'engine idle control'],
  sources: [{ type: 'nhtsa', title: 'NHTSA PE12-016 Closing Resume - 2011 Chrysler 200 Engine Stall', url: 'https://static.nhtsa.gov/odi/inv/2012/INCLA-PE12016-7243.PDF' }],
  summary: 'Narrowed the broad 2011-2013 stall claim to PE12-016\'s exact 2011 3.6L population, purge-monitor mechanism and non-recall PCM campaign.',
};

const activeHeadRestraint = {
  years: [2011, 2012, 2013, 2014],
  trims: ['Vehicles in the PE19-014 subject population; verify warranty-extension eligibility by VIN'],
  category: 'safety',
  title: 'Active Head Restraint Can Deploy Without a Rear Impact (PE19-014)',
  description: 'NHTSA investigation PE19-014 includes 2011-2014 Chrysler 200 vehicles whose driver or passenger Active Head Restraint may deploy without a rear impact. NHTSA reported that environmental stress cracking of the PC-ABS sled, combined with contamination and continuous spring load, can fracture the sled and release the retention pin. The agency closed the broad FCA investigation in February 2026 after a manufacturer ten-year, unlimited-mile warranty extension; closure was not a finding that no safety defect exists.',
  solution: 'If a front head restraint opens without an impact, avoid trying to force damaged internal parts back together. Have a Chrysler dealer inspect it and check the VIN against the current Active Head Restraint warranty extension. Ask the dealer to document coverage before authorizing paid work, because earlier program notices and the later investigation closure used different timing descriptions.',
  severity: 'high',
  symptoms: ['Front head restraint opens without a rear impact', 'Head-restraint halves separate and may not reset', 'Broken internal sled or released retention pin'],
  affectedSystems: ['front-seat Active Head Restraint', 'PC-ABS internal sled', 'retention pin and deployment spring'],
  sources: [
    { type: 'nhtsa', title: 'NHTSA PE19-014 Closing Report - Active Head Restraint Inadvertent Deployment', url: 'https://static.nhtsa.gov/odi/inv/2019/INCR-PE19014-12705.pdf' },
    { type: 'tsb', title: 'FCA Warranty Bulletin X84/X92 - Active Head Restraint Warranty Extension', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10224067-9999.pdf' },
  ],
  summary: 'Corrected the population to 2011-2014, replaced secondary material with NHTSA\'s 2026 closure and FCA warranty record, and preserved the investigation\'s mechanism and closure nuance.',
};

const parkRod = {
  years: [2015],
  trims: ['Vehicles with the 3.6L engine and 9-speed automatic transaxle included in recall R08 / 15V-090; verify by VIN'],
  engines: ['3.6L V6'],
  category: 'transmission',
  title: '9-Speed Transaxle May Not Engage Park (Recall 15V-090)',
  description: 'Recall R08 / 15V-090 covers certain 2015 Chrysler 200 vehicles with the 3.6L engine and 9-speed automatic transaxle. Assembly contamination can prevent the parking pawl from engaging, or the internal park rod may be damaged, dislodged, or broken. The indicator can display Park even though the park lock is not engaged, allowing the vehicle to roll away.',
  solution: 'Use the parking brake every time until the VIN is checked and any open recall R08 is completed. A Chrysler dealer performs the recall inspection and replaces a transmission found with contamination or a damaged park rod at no charge.',
  severity: 'high',
  symptoms: ['Shift indicator displays Park but the vehicle can roll', 'Parking pawl does not engage', 'VIN included in recall R08'],
  affectedSystems: ['9-speed automatic transaxle', 'internal park rod', 'parking pawl and park lock'],
  sources: [{ type: 'recall', title: 'FCA Safety Recall R08 / NHTSA 15V-090 - Transaxle Park Rod', url: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V090-2619.pdf' }],
  summary: 'Replaced the unsupported rollaway narrative with recall R08\'s exact 2015 3.6L/9-speed scope, contamination and park-rod mechanisms, interim parking-brake guidance and dealer remedy.',
};

const unexpectedNeutral = {
  years: [2015],
  trims: ['Vehicles with a 9HP48 or 948TE transmission included in recall S55 / 16V-529; verify by VIN'],
  category: 'transmission',
  title: 'Transmission Harness Can Cause an Unexpected Shift to Neutral (Recall 16V-529)',
  description: 'Recall S55 / 16V-529 covers certain 2015 Chrysler 200 vehicles with the 9HP48 or 948TE transmission. Insufficient crimps in the transmission wire harness can cause an unexpected shift to Neutral and sudden loss of motive power. The recall report does not identify a guaranteed warning before the event.',
  solution: 'Check the VIN for open recall S55. FCA dealers reprogram the Powertrain Control Module and Transmission Control Module; if an active or stored fault code is present, they also replace the transaxle range-sensor wire harness. Recall work is performed at no charge. A sudden loss of drive warrants moving to a safe location and arranging professional service.',
  severity: 'high',
  symptoms: ['Unexpected shift to Neutral', 'Sudden loss of motive power', 'Active or stored transmission fault code'],
  affectedSystems: ['transmission wire harness crimps', 'transaxle range sensor wiring', 'PCM and TCM control software'],
  sources: [{ type: 'recall', title: 'FCA Safety Recall S55 / NHTSA 16V-529 - 9-Speed Harness Crimp', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCLRPT-16V529-7638.PDF' }],
  summary: 'Kept only recall S55\'s exact 2015 9-speed population, harness-crimp failure mode, software remedy and conditional harness replacement.',
};

const published = {
  'chrysler-200-2-4l-tigershark-excessive-oil-consumption': replacement(oilConsumption, 'Keep one oil-consumption card and anchor it to FCA bulletin 09-018-24\'s exact engine scope and service procedure.'),
  'chrysler-200-cruise-control-cannot-be-cancelled': replacement(cruiseControl, 'Replace the broad card with the exact U59 / 18V-332 population, failure mechanism and no-charge software remedy.'),
  'chrysler-200-first-generation-engine-stalling-low-speed-idle': replacement(lowSpeedStall, 'Narrow the card to NHTSA PE12-016\'s 2011 3.6L population and clearly identify Chrysler\'s action as a customer-satisfaction campaign, not a recall.'),
  'chrysler-200-random-deployment-active-head-restraints': replacement(activeHeadRestraint, 'Correct the model years and use NHTSA\'s 2026 PE19-014 closure plus FCA warranty documentation without implying the investigation found no defect.'),
  'chrysler-200-transmission-may-not-shift-into-park-2015-v6': replacement(parkRod, 'Anchor the rollaway-risk card to recall R08 / 15V-090\'s exact 2015 3.6L and 9-speed scope and dealer remedy.'),
  'chrysler-200-zf-9-speed-transmission-unexpectedly-shifts-to-neutral': replacement(unexpectedNeutral, 'Anchor the neutral-shift card to recall S55 / 16V-529\'s exact wiring-crimp mechanism and remedy sequence.'),
};

const reasons = {
  'chrysler-200-62te-trans-2011': 'The frozen card generalizes a four-year 62TE failure pattern from owner forums and secondary material without one FCA/NHTSA record establishing the asserted mechanism, population and replacement guidance.',
  'chrysler-200-9speed-trans-2015': 'The frozen card blends several 9-speed complaints, software revisions and mechanical outcomes across 2015-2017. The exact safety-recall condition is retained separately under recall 16V-529.',
  'chrysler-200-ac-evaporator-2011': 'The seven-year evaporator-core claim relies on non-primary material and does not have an FCA/NHTSA source establishing a defined Chrysler 200 population, common leak location and universal dashboard-removal remedy.',
  'chrysler-200-electrical-drain-2015': 'The frozen card aggregates unrelated module, radio, battery and wiring possibilities from owner discussions. No single primary record supports the population or a universal software-or-module repair.',
  'chrysler-200-oil-consumption-2015': 'This is a duplicate of the retained 2015-2017 2.4L oil-consumption card; publishing both would split the same FCA bulletin and create conflicting guidance.',
  'chrysler-200-oil-filter-housing-leak-2015': 'The frozen card is supported by video/aftermarket material and does not establish an FCA/NHTSA-defined 2015-2017 2.4L population, diagnosis, or universal housing replacement.',
  'chrysler-200-ps-rack-leak-2015': 'The frozen card has no adequate primary evidence for a 2015-2017 steering-rack seal defect population or the asserted assembly-replacement remedy.',
  'chrysler-200-throttle-stall-2011': 'The seven-year electronic-throttle-body aggregation is unsupported and duplicates symptoms from the separately retained 2011 3.6L PE12-016 purge-monitor condition without proving the same mechanism.',
  'chrysler-200-zf-9-speed-harsh-rough-shifting-lurching-hesitation': 'The frozen card combines broad owner-reported shift quality complaints, adaptations and hardware theories without one primary source establishing a single defect and remedy. Recall 16V-529 remains as the exact safety condition.',
};

module.exports = buildConfig({
  label: 'Chrysler 200',
  make: 'Chrysler',
  model: '200',
  slug: 'chrysler-200',
  batchId: 'chrysler-200-full-record-cohort-48-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '106329ade29e35440a45307441dc067de5f58d856d0f0511d687c34026e14a72',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-200/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chrysler200_blind:manual-primary-source-gate',
    edge: 'chrysler200_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '16V668000',
    '11V315000',
    '13V282000',
    '17V640000',
    '11V487000',
    '13V043000',
    '13V552000',
    '15V470000',
    '15V461000',
    '16V114000',
    '14V480000',
    '14V392000',
    '16V589000',
  ],
});
