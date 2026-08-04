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
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const alternatorRecall = {
  years: [2011, 2012, 2013, 2014],
  trims: ['EHPS-equipped vehicles with 3.6L or 5.7L engines and affected 160-, 180-, or 220-amp alternators; verify by VIN'],
  category: 'electrical',
  title: 'Alternator Diode Failure Can Cause Stall or Fire (Recalls P60/T36)',
  description:
    'NHTSA recalls 14V-634 and 17V-435 cover defined 2011-2014 Dodge Charger populations. Thermal fatigue can cause alternator diodes to fail with little warning, resulting in loss of charging, a sudden stall, or a resistive short that produces heat, smoke, or fire.',
  solution:
    'Check the VIN for recall P60/14V-634 or T36/17V-435. FCA\'s remedy is inspection of the alternator part number and free replacement when required. Do not buy an alternator from charging symptoms alone before checking recall eligibility.',
  severity: 'high',
  symptoms: ['Battery-saver warning may appear shortly before failure', 'Sudden loss of charging', 'Vehicle stalls without warning', 'Heat, smoke, or fire may originate in the alternator'],
  affectedSystems: ['alternator diodes', 'vehicle charging system', 'electro-hydraulic power steering electrical load'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 14V-634 - 160-Amp Alternator Failure',
      url: 'https://static.nhtsa.gov/odi/rcl/2014/RCLRPT-14V634-8320.PDF',
    },
    {
      type: 'recall',
      title: 'NHTSA Recall 17V-435 - Expanded Alternator Failure Population',
      url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V435-8916.PDF',
    },
  ],
  summary:
    'Narrowed the ten-year charging-system card to the exact shared alternator-diode mechanism, engines, EHPS load, amperages, model years, VIN check, and free remedies in recalls P60 and T36.',
};

const daytonaClusterRecall = {
  years: [2024, 2025],
  trims: ['Battery-electric Charger Daytona vehicles built April 30, 2024-April 25, 2025 and included in recall 26V-262; verify by VIN'],
  category: 'electrical',
  title: 'Instrument Cluster Can Go Inoperative and Hide Required Warnings (Recall 26V-262)',
  description:
    'NHTSA recall 26V-262/39D covers certain 2024-2025 Dodge Charger Daytona electric vehicles. Instrument-cluster software can leave the display inoperative, preventing required indicators and telltales—including brake, ESC, TPMS, and gear-selection information—from appearing.',
  solution:
    'Check the VIN for recall 39D/26V-262. FCA\'s recall remedy is an instrument-panel-cluster software update. Because the cluster can hide safety warnings without advance notice, arrange the recall promptly and follow any current instructions supplied for the VIN.',
  severity: 'high',
  symptoms: ['Instrument-panel cluster is inoperative', 'Brake, ESC, or TPMS warning lights may not display', 'Gear-selection indicator may not display'],
  affectedSystems: ['instrument-panel-cluster software', 'driver warning indicators', 'gear-selection display'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 26V-262 - Inoperative Charger Daytona Instrument Cluster',
      url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V262-9341.pdf',
    },
  ],
  summary:
    'Replaced speculative two-model-year bricking and broad vehicle-software claims with the current NHTSA recall\'s exact Charger Daytona production window, IPC failure, hidden-warning consequence, and software remedy.',
};

const pursuitDriveshaftRecall = {
  years: [2015, 2016, 2017, 2018],
  trims: ['All-wheel-drive V8 Charger Pursuit police vehicles included in recall 18V-281; verify by VIN'],
  category: 'drivetrain',
  title: 'Front Driveshaft U-Joint Can Seize, Fracture, and Detach (Recall 18V-281)',
  description:
    'NHTSA recall 18V-281/U37 covers certain 2015-2018 all-wheel-drive V8 Dodge Charger Pursuit police vehicles. The front-driveshaft universal joint may seize or fracture, allowing the shaft to detach and become a road hazard.',
  solution:
    'Check the VIN for recall U37/18V-281. An authorized Dodge dealer replaces the front driveshaft free of charge. Do not apply this card to rear-wheel-drive cars or to the separate T03 loose-front-driveshaft-bolt recall.',
  severity: 'high',
  symptoms: ['Front driveshaft universal joint may seize', 'Front driveshaft universal joint may fracture', 'Front driveshaft may detach from the vehicle'],
  affectedSystems: ['front driveshaft', 'front-driveshaft universal joint'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'FCA Safety Recall U37 / NHTSA 18V-281 - Front Driveshaft',
      url: 'https://static.nhtsa.gov/odi/rcl/2018/RCRIT-18V281-7718.pdf',
    },
  ],
  summary:
    'Narrowed the nine-year Charger driveshaft card to the exact AWD V8 Pursuit U-joint recall and removed the separate loose-bolt mechanism, non-police population, costs, mileage, and commerce.',
};

const evapPcmSoftware = {
  years: [2022],
  trims: ['Vehicles with 5.7L HEMI sales code EZH or 6.4L SRT HEMI MDS sales code ESG'],
  category: 'emissions',
  title: 'P0440/P0441/P0455/P0456 May Be Caused by PCM Software',
  description:
    'FCA TSBs 18-093-23 and 18-094-23 identify PCM software as the cause of P0440, P0441, P0455, or P0456 on certain 2022 Dodge Charger 5.7L and 6.4L vehicles. These codes alone do not prove that an ESIM, gas cap, or another EVAP component has failed.',
  solution:
    'Confirm the engine sales code and stored DTCs, then follow current FCA diagnosis for unrelated faults. If the bulletin applies, reprogram the PCM with the latest available software before replacing EVAP hardware.',
  severity: 'low',
  symptoms: ['Malfunction indicator lamp', 'P0440 stored', 'P0441 stored', 'P0455 stored', 'P0456 stored'],
  affectedSystems: ['powertrain control module software', 'EVAP leak diagnostics'],
  dtcCodes: ['P0440', 'P0441', 'P0455', 'P0456'],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 18-093-23 - 2022 Charger 5.7L PCM Update',
      url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243256-9999.pdf',
    },
    {
      type: 'tsb',
      title: 'FCA TSB 18-094-23 - 2022 Charger 6.4L PCM Update',
      url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243281-9999.pdf',
    },
  ],
  summary:
    'Replaced the eighteen-year ESIM/NVLD failure aggregation with FCA\'s exact 2022 5.7L/6.4L code set, PCM-software cause, and flash-before-parts boundary.',
};

const frontControlArmBushings = {
  years: [2023],
  trims: ['Vehicles built February 8-9, 2023; verify by VIN'],
  category: 'suspension',
  title: 'Knock or Rattle Over Bumps From Under-Cured Front Control-Arm Bushings',
  description:
    'FCA TSB 02-008-24 identifies under-cured front lower-control-arm bushings on a narrow group of 2023 Dodge Charger vehicles. The documented symptom is a knock or rattle while driving over bumps.',
  solution:
    'Verify the build window and VIN, inspect both lower front control-arm bushings, and replace the affected control arm followed by an alignment when required. FCA notes that the proactive North American service action no longer applies, so North American repairs should follow current Service Library diagnosis and coverage rules.',
  severity: 'medium',
  symptoms: ['Knock or rattle noise while driving over bumps'],
  affectedSystems: ['front lower control arms', 'front control-arm bushings'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 02-008-24 - Front Control Arm Bushings Under Cured',
      url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001236-0001.pdf',
    },
  ],
  summary:
    'Replaced the eighteen-year multi-component suspension-wear card with FCA\'s two-day 2023 build cohort, single under-cured-bushing cause, exact symptom, and conditional control-arm remedy.',
};

const transmissionSoftware = {
  years: [2016],
  trims: ['Vehicles built on or before August 5, 2016 with 6.4L ESG/8HP70 DFK or 6.2L ESD/8HP90 DFE'],
  category: 'transmission',
  title: 'Undesirable 3-2, 2-1, or 6-5 Coast Downshifts From TCM Software',
  description:
    'FCA TSB 21-028-16 covers certain 2016 Dodge Charger 6.2L and 6.4L automatic-transmission vehicles. The documented condition is a less-than-desirable 3-2, 2-1, or 6-5 coast downshift caused by transmission-control software.',
  solution:
    'Confirm the build date, engine, transmission sales code, and exact downshift condition. After ruling out unrelated transmission faults, FCA directs technicians to reprogram the transmission control module with the latest software.',
  severity: 'medium',
  symptoms: ['Harsh or undesirable 3-2 coast downshift', 'Harsh or undesirable 2-1 coast downshift', 'Harsh or undesirable 6-5 coast downshift'],
  affectedSystems: ['transmission control module software', '8HP70 automatic transmission', '8HP90 automatic transmission'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 21-028-16 - Transmission Shift and Drivability Enhancements',
      url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10224865-9999.pdf',
    },
  ],
  summary:
    'Replaced the nine-year generic 8HP harsh-shift card with FCA\'s exact 2016 build, powertrain, three coast-downshift events, and TCM software remedy.',
};

const uconnectSoftware = {
  years: [2018, 2019, 2020, 2021],
  trims: ['North American vehicles built April 1, 2017-May 24, 2021 with Uconnect 4C 8.4-inch UAS or UCS radio'],
  category: 'electrical',
  title: 'Intermittent Black Screen or Radio Freeze on Uconnect 4C',
  description:
    'FCA TSB 08-102-21 Rev. A documents intermittent black displays and radio freezes, among other listed software symptoms, on certain 2018-2021 Dodge Charger vehicles equipped with UAS or UCS Uconnect 4C radios.',
  solution:
    'Confirm radio sales code, build date, market, and the exact symptom. After checking for unrelated DTCs or hardware faults, FCA directs inspection of the current software level and an update to version 39.5 when required.',
  severity: 'medium',
  symptoms: ['Intermittent black radio display', 'Intermittent radio freeze'],
  affectedSystems: ['Uconnect 4C radio software', '8.4-inch radio display'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 08-102-21 Rev. A - UAS/UCS Radio Enhancements',
      url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10204379-9999.pdf',
    },
  ],
  summary:
    'Narrowed the seven-year generic Uconnect card to FCA\'s exact 2018-2021 North American UAS/UCS build range, black-screen/freeze symptoms, and software-level remedy.',
};

const published = {
  'dodge-charger-alternator-2011': replacement(
    alternatorRecall,
    'Replace the broad 2011-2020 charging-system card with the exact shared alternator-diode mechanism and affected EHPS, engine, amperage, model-year, VIN, and remedy scope from recalls P60 and T36.',
  ),
  'dodge-charger-daytona-ev-software-2024': replacement(
    daytonaClusterRecall,
    'Replace secondary-media bricking and broad 2024+ software claims with NHTSA recall 26V-262\'s exact 2024-2025 Charger Daytona IPC-software noncompliance and update remedy.',
  ),
  'dodge-charger-driveshaft-2015': replacement(
    pursuitDriveshaftRecall,
    'Replace the nine-year driveshaft/U-joint aggregation with recall 18V-281\'s exact 2015-2018 AWD V8 Pursuit U-joint seizure/fracture mechanism and free front-driveshaft replacement.',
  ),
  'dodge-charger-evap-leak-detection-module-failure-triggers-false-p0455-p045': replacement(
    evapPcmSoftware,
    'Replace the eighteen-year ESIM/NVLD failure card with FCA TSBs 18-093-23/18-094-23\'s exact 2022 5.7L/6.4L PCM-software code condition and flash-before-parts boundary.',
  ),
  'dodge-charger-front-suspension-2006': replacement(
    frontControlArmBushings,
    'Replace the eighteen-year multi-component premature-wear card with FCA TSB 02-008-24\'s two-day 2023 build cohort and under-cured lower-control-arm bushing condition.',
  ),
  'dodge-charger-transmission-2015': replacement(
    transmissionSoftware,
    'Replace the nine-year generic 8HP harsh-shift card with FCA TSB 21-028-16\'s exact 2016 powertrain/build scope and three TCM-software coast-downshift events.',
  ),
  'dodge-charger-uconnect-2015': replacement(
    uconnectSoftware,
    'Replace the seven-year generic Uconnect card and video citation with FCA TSB 08-102-21 Rev. A\'s exact UAS/UCS build range, symptoms, and radio update.',
  ),
};

const reasons = {
  'dodge-charger-42rle-trans-2006':
    'The frozen card asserts a 2006-2010 42RLE solenoid/connector failure pattern, DTCs, limp mode, mileage, costs, and parts replacement without one Charger-specific FCA bulletin or campaign proving that complete condition and remedy.',
  'dodge-charger-mds-tick-2011':
    'The frozen card treats 2011-2023 HEMI ticking as MDS lifter/cam failure with a common mileage and repair path but supplies no Charger-specific FCA/NHTSA primary source establishing that population and diagnostic boundary.',
  'dodge-charger-nag1-trans-2006':
    'The frozen card asserts 2006-2011 NAG1 water contamination, speed limitation, valve-body/conductor-plate damage, coolant source, costs, and transmission replacement from forums and secondary sites without one FCA primary source defining the full mechanism.',
  'dodge-charger-pentastar-tick-2011':
    'The frozen card treats all 2011-2023 3.6L valvetrain ticking as rocker-arm/lifter failure without one Charger-specific FCA bulletin establishing the exact build range, affected parts, DTC boundary, diagnosis, and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Charger',
  make: 'Dodge',
  model: 'Charger',
  slug: 'dodge-charger',
  batchId: 'dodge-charger-full-record-cohort-68-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'de3cdaeec9d797d13aa2f6079506e765db81ede691ef9792f2bb5e912e81a952',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-charger/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgecharger_blind:manual-primary-source-gate',
    edge: 'dodgecharger_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '05V460000',
    '06V149000',
    '06V341000',
    '06V493000',
    '08V295000',
    '08V583000',
    '08V642000',
    '09V420000',
    '10V200000',
    '11V487000',
    '12V004000',
    '12V042000',
    '12V197000',
    '13V118000',
    '13V610000',
    '14V101000',
    '14V567000',
    '15V114000',
    '15V313000',
    '15V461000',
    '15V467000',
    '16V043000',
    '16V240000',
    '16V352000',
    '17V097000',
    '17V496000',
    '17V741000',
    '17V824000',
    '18E053000',
    '18V021000',
    '18V280000',
    '18V332000',
    '18V524000',
    '19V018000',
    '19V203000',
    '19V246000',
    '19V758000',
    '20V512000',
    '21V516000',
    '22V504000',
    '22V808000',
    '22V866000',
    '24V112000',
    '24V198000',
    '24V574000',
  ],
});
