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

const hvacSoftware = {
  years: [2014, 2015],
  trims: ['Vehicles with dual-zone ATC (HAF) or three-zone ATC (HAH)'],
  category: 'hvac',
  title: 'Erratic Automatic-Climate Operation May Require an HVAC Software Update',
  description:
    'FCA TSB 24-004-17 covers certain 2014-2015 Dodge Durango vehicles with dual-zone or three-zone automatic temperature control. Documented software symptoms include the HVAC shutting off during a cold-engine crank, erratic blower speed in Auto mode, or a brief burst of hot or cold air after a temperature adjustment.',
  solution:
    'Confirm the HVAC sales code and exact symptom, then diagnose unrelated DTCs or hardware faults first. If the bulletin applies, FCA directs technicians to reprogram the HVAC control module with the latest software.',
  severity: 'low',
  symptoms: ['HVAC shuts off during a cold-engine crank', 'Erratic blower speed in Auto mode', 'Brief burst of hot or cold air after changing the temperature setting'],
  affectedSystems: ['HVAC control-module software', 'automatic temperature control', 'blower-speed control'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'FCA TSB 24-004-17 - HVAC System Improvements', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10224948-9999.pdf' }],
  source: 'manual',
  summary:
    'Replaced the eleven-year compressor and climate-system aggregation with FCA\'s exact 2014-2015 automatic-climate software conditions and module-reprogramming remedy.',
};

const alternatorRecall = {
  years: [2011, 2012, 2013, 2014],
  trims: ['EHPS-equipped vehicles with 3.6L or 5.7L engines and affected 160-, 180-, or 220-amp alternators; verify by VIN'],
  engines: ['3.6L V6', '5.7L V8'],
  category: 'electrical',
  title: 'Alternator Diode Failure Can Cause Stall or Fire (Recalls P60/T36)',
  description:
    'NHTSA recalls 14V-634 and 17V-435 cover defined 2011-2014 Dodge Durango populations. Thermal fatigue can cause alternator diodes to fail with little warning, resulting in loss of charging, a sudden stall, or a resistive short that produces heat, smoke, or fire.',
  solution:
    'Check the VIN for recall P60/14V-634 or T36/17V-435. FCA\'s remedy is inspection of the alternator part number and free replacement when required. Do not buy an alternator from charging symptoms alone before checking recall eligibility.',
  severity: 'high',
  symptoms: ['Battery-saver warning may appear shortly before failure', 'Sudden loss of charging', 'Vehicle stalls without warning', 'Heat, smoke, or fire may originate in the alternator'],
  affectedSystems: ['alternator diodes', 'vehicle charging system', 'electro-hydraulic power steering electrical load'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'NHTSA Recall 14V-634 - 160-Amp Alternator Failure', url: 'https://static.nhtsa.gov/odi/rcl/2014/RCLRPT-14V634-8320.PDF' },
    { type: 'recall', title: 'NHTSA Recall 17V-435 - Expanded Alternator Failure Population', url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V435-8916.PDF' },
  ],
  summary:
    'Narrowed the ten-year alternator card to the exact shared diode-failure mechanism, engines, EHPS load, amperages, model years, VIN check, and free remedies in recalls P60 and T36.',
};

const upperBallJointRecall = {
  years: [2000, 2001, 2002, 2003],
  trims: ['Four-wheel-drive vehicles included in recall 04V-596; verify by VIN'],
  category: 'suspension',
  title: 'Upper Ball-Joint Corrosion Can Lead to Wheel Separation (Recall 04V-596)',
  description:
    'NHTSA recall 04V-596 covers certain 2000-2003 four-wheel-drive Dodge Durango SUVs. Water can enter a front upper ball joint, remove lubricant, and corrode the joint. Extended wear can allow the joint—and potentially the front wheel—to separate, causing loss of control.',
  solution:
    'Check the VIN for recall 04V-596. DaimlerChrysler\'s campaign remedy is replacement of both front upper ball joints. A clunk may occur as wear progresses, but the recall warns that occupants may not always hear it.',
  severity: 'high',
  symptoms: ['Front-suspension clunk may develop', 'Upper ball joint may wear excessively', 'Front wheel may separate if the joint fails'],
  affectedSystems: ['front upper ball joints', 'front suspension', 'front-wheel retention'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'DaimlerChrysler Recall 04V-596 - Durango Upper Ball Joints', url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V596-3958.pdf' }],
  summary:
    'Narrowed the 1998-2003 ball-joint card to the exact 2000-2003 4x4 recall population, moisture-corrosion mechanism, imperfect warning, separation risk, and both-joints remedy.',
};

const plenumPanGasket = {
  years: [1998, 1999],
  trims: ['Vehicles equipped with a 3.9L, 5.2L, or 5.9L gasoline engine'],
  engines: ['3.9L V6', '5.2L V8', '5.9L V8'],
  category: 'engine',
  title: 'Spark Knock or Oil Consumption From an Intake Plenum-Pan Gasket Leak',
  description:
    'DaimlerChrysler TSB 09-05-00 applies to 1998-1999 Dodge Durango vehicles with 3.9L, 5.2L, or 5.9L gasoline engines. An internal intake-manifold plenum-pan gasket leak can cause engine oil consumption or spark knock without an external oil leak.',
  solution:
    'Follow the bulletin\'s diagnostic procedure to confirm an internal plenum vacuum leak and complete the prerequisite PCM calibration check. If the gasket leak is confirmed, replace the intake-manifold plenum-pan gasket using the specified cleaning, torque, and tightening sequence.',
  severity: 'medium',
  symptoms: ['Increased engine oil consumption without an external leak', 'Spark knock', 'Internal vacuum leak at the intake plenum pan'],
  affectedSystems: ['intake-manifold plenum-pan gasket', 'intake manifold vacuum', 'engine oil consumption'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'DaimlerChrysler TSB 09-05-00 - Spark Knock and Oil Consumption', url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bc0972.pdf' }],
  source: 'manual',
  summary:
    'Narrowed the 1998-2003 plenum aggregation to DaimlerChrysler TSB 09-05-00\'s exact 1998-1999 Durango and 3.9L/5.2L/5.9L scope, internal-leak symptoms, diagnostic boundary, and gasket remedy.',
};

const tipmFuelPumpRelay = {
  years: [2011, 2012, 2013],
  trims: ['Vehicles with a 3.6L or 5.7L engine previously included in recall P54 or R09 and now included in V62; verify by VIN'],
  engines: ['3.6L V6', '5.7L V8'],
  category: 'fuel',
  title: 'TIPM Fuel-Pump Relay Can Cause a No-Start or Stall (Recall 19V-813)',
  description:
    'FCA recall V62/NHTSA 19V-813 supersedes the earlier P54 and R09 remedies for certain 2011-2013 Dodge Durango vehicles. The fuel-pump relay associated with the TIPM can fail, causing a no-start condition or an engine stall without warning.',
  solution:
    'Check the VIN for recall V62/19V-813 even if P54 or R09 was previously completed. FCA\'s final service procedure replaces the affected external fuel-pump relay and related wire harness. Do not replace the entire TIPM or fuel pump solely from this card without confirming recall status and diagnosis.',
  severity: 'high',
  symptoms: ['Engine does not start', 'Engine stalls without warning', 'Loss of fuel-pump power'],
  affectedSystems: ['fuel-pump relay', 'TIPM electrical circuits', 'fuel-pump power supply'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'FCA Safety Recall V62 / NHTSA 19V-813 - Fuel Pump Relay', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V813-0002.pdf' }],
  summary:
    'Replaced the eight-year catch-all TIPM card with the exact 2011-2013 fuel-pump-relay defect, superseding recall, stall/no-start boundary, and relay-plus-harness remedy.',
};

const transmissionSoftware = {
  years: [2015],
  trims: ['Vehicles with the 5.7L engine (EZH) and 8HP70 transmission (DFD or DFK)'],
  engines: ['5.7L V8'],
  category: 'transmission',
  title: 'Shift Flare or Poor Shift Quality May Require a TCM Software Update',
  description:
    'FCA TSB 21-030-16 documents shift-quality calibration improvements for 2015 Dodge Durango vehicles with the 5.7L engine and 8HP70 transmission. The listed concerns include shift flare, garage-shift complaints, and timing or engagement issues during several operating modes.',
  solution:
    'Confirm the engine and transmission sales codes and diagnose any unrelated DTCs or symptoms first. If the bulletin applies, FCA directs technicians to reprogram the TCM with the latest software and specifically warns not to clear the stored shift adaptives.',
  severity: 'medium',
  symptoms: ['Shift flare', 'Poor garage-shift quality', 'Poor upshift or downshift timing', 'Poor torque-converter engagement'],
  affectedSystems: ['transmission control-module software', '8HP70 eight-speed automatic transmission'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'FCA TSB 21-030-16 - Transmission Shift Enhancements', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10223824-9999.pdf' }],
  source: 'manual',
  summary:
    'Replaced the ten-year generic 8-speed failure card with FCA\'s exact 2015 5.7L/8HP70 shift-quality conditions, diagnostic boundary, and TCM software remedy.',
};

const uconnectSoftware = {
  years: [2018, 2019, 2020],
  trims: ['North American vehicles with an 8.4-inch Uconnect navigation radio (UAQ or UCQ)'],
  category: 'electrical',
  title: 'Intermittent Black Screen or Radio Freeze on 8.4-Inch Uconnect',
  description:
    'FCA TSB 08-099-21 documents intermittent black displays, radio freezes, Bluetooth connection problems, lost presets, and other listed software symptoms on certain 2018-2020 Dodge Durango vehicles with UAQ or UCQ 8.4-inch navigation radios.',
  solution:
    'Confirm the market, radio sales code, and exact symptom. After checking for unrelated DTCs or hardware faults, FCA directs inspection of the current software level and an update to version 39.5 when required.',
  severity: 'medium',
  symptoms: ['Intermittent black radio display', 'Intermittent radio freeze', 'Bluetooth pairing or connection problems', 'Lost radio presets'],
  affectedSystems: ['Uconnect radio software', '8.4-inch navigation radio', 'Bluetooth connectivity'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'FCA TSB 08-099-21 - UAQ and UCQ Radio Enhancements', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10212486-9999.pdf' }],
  source: 'manual',
  summary:
    'Narrowed the eight-year generic Uconnect card to FCA\'s exact 2018-2020 North American UAQ/UCQ population, listed black-screen/freeze symptoms, and software-level remedy.',
};

const published = {
  'dodge-durango-ac-2011': replacement(hvacSoftware, 'Replace the eleven-year compressor/dual-zone aggregation and video with FCA TSB 24-004-17\'s exact 2014-2015 automatic-climate software conditions and reflash remedy.'),
  'dodge-durango-alternator-2011': replacement(alternatorRecall, 'Replace the ten-year generic alternator card with recalls P60 and T36\'s exact alternator-diode mechanism, affected engines/EHPS/amperages, risks, and VIN-specific remedy.'),
  'dodge-durango-ball-joint-1998': replacement(upperBallJointRecall, 'Replace the 1998-2003 owner-source aggregation with recall 04V-596\'s exact 2000-2003 4x4 population, corrosion mechanism, separation risk, and both-upper-joints remedy.'),
  'dodge-durango-plenum-gasket-1998': replacement(plenumPanGasket, 'Replace the six-year forum aggregation with official TSB 09-05-00\'s exact 1998-1999 Durango engine scope, internal-leak symptoms, confirmation procedure, and gasket replacement.'),
  'dodge-durango-tipm-2011': replacement(tipmFuelPumpRelay, 'Replace the eight-year catch-all TIPM card with current recall V62/19V-813\'s exact 2011-2013 fuel-pump-relay defect and final relay-plus-harness remedy.'),
  'dodge-durango-transmission-2011': replacement(transmissionSoftware, 'Replace the ten-year generic 8-speed failure card with FCA TSB 21-030-16\'s exact 2015 5.7L/8HP70 calibration conditions and TCM reflash boundary.'),
  'dodge-durango-uconnect-2014': replacement(uconnectSoftware, 'Replace the eight-year unsupported Uconnect aggregation with FCA TSB 08-099-21\'s exact 2018-2020 UAQ/UCQ scope, listed symptoms, and software-level remedy.'),
};

const reasons = {
  'dodge-durango-hemi-tick-2011':
    'The frozen card treats all 2011-2023 5.7L valvetrain ticking as MDS lifter and camshaft failure with common mileage, costs, diagnosis, and replacement guidance but cites no Durango-specific FCA primary source establishing that population and boundary.',
  'dodge-durango-suspension-2011':
    'The frozen card asserts front lower-control-arm bushing wear across thirteen model years with mileage, costs, alignment guidance, and control-arm replacement but provides no FCA bulletin defining the affected build range, cause, or remedy.',
  'dodge-durango-transfer-case-leak-1998':
    'The frozen card combines three transfer-case families, twelve model years, several seal positions, fluid guidance, costs, and replacement steps without a usable primary citation or one DaimlerChrysler bulletin defining a common defect.',
  'dodge-durango-water-pump-2011':
    'The frozen card asserts 2011-2021 Pentastar water-pump bearing and seal failure with mileage, costs, DTCs, overheating guidance, and pump replacement but supplies no FCA primary source establishing the complete population and diagnostic boundary.',
};

module.exports = buildConfig({
  label: 'Dodge Durango',
  make: 'Dodge',
  model: 'Durango',
  slug: 'dodge-durango',
  batchId: 'dodge-durango-full-record-cohort-71-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'b20eb95ac6405ac1aff9b44c97b2f4ca4dc73a2ff3c15889c649c694988ce18b',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-durango/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgedurango_blind:manual-primary-source-gate',
    edge: 'dodgedurango_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V366000', '01V077000', '01V119000', '01V153000', '02V322000', '03V528000',
    '04V020000', '04V216000', '04V578000', '04V596000', '05V034000', '05V460000',
    '05V554000', '06E022000', '06E024000', '06V039000', '06V044000', '06V067000',
    '06V240000', '06V339000', '06V341000', '06V386000', '07V092000', '07V555000',
    '08E064000', '09E012000', '09V003000', '11V487000', '12V391000', '12V560000',
    '13V038000', '14V104000', '14V154000', '14V293000', '14V391000', '14V530000',
    '14V634000', '14V636000', '14V643000', '14V770000', '15V115000', '15V313000',
    '15V461000', '15V469000', '15V879000', '16V168000', '16V352000', '16V814000',
    '16V947000', '17V435000', '17V541000', '17V572000', '17V741000', '17V824000',
    '18V021000', '18V280000', '18V332000', '18V524000', '19V813000', '20V183000',
    '20V191000', '21V280000', '21V842000', '22V140000', '22V154000', '22V284000',
    '22V426000', '22V866000', '23V115000', '23V640000', '24V415000', '24V436000',
    '24V838000', '98V019000', '99V341000', '99V342000',
  ],
});
