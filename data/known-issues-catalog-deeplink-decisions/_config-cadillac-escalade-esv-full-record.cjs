const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  disposition = 'diagnosis-hold',
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines = [],
  category,
  title,
  description,
  solution,
  severity = 'medium',
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines,
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with exact GM/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
  evidence = [
    {
      type: 'nhtsa',
      label: 'NHTSA Manufacturer Communications Data Corpus',
      url: communicationsCorpus,
    },
  ],
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac Escalade ESV ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Escalade ESV population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, equipment, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Archived the unsupported Cadillac Escalade ESV "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Escalade ESV',
  make: 'Cadillac',
  model: 'Escalade ESV',
  batchId: 'cadillac-escalade-esv-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '156b65b69470889a2a098f6637fb2182ee138ab3c6de54c5774fb921b57938a2',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-escalade-esv/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac4_blind:no-blocker',
    edge: 'cadillac4_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-escalade-esv-air-ride-2007',
    'cadillac-escalade-esv-transfer-case-2002',
    'cadillac-escalade-esv-liftgate-struts-2007',
    'cadillac-escalade-esv-air-suspension-2002',
    'cadillac-escaladeesv-10-speed-10l8010l90-harsh-shifting-2021',
    'cadillac-escaladeesv-62l-l87-connecting-rodbearing-2021',
    'cadillac-escaladeesv-intermittent-no-start-battery-drain-2021',
    'cadillac-escaladeesv-oled-curved-display-blackout-2021',
    'cadillac-escaladeesv-super-cruise-and-driver-2021',
  ],
  records: {
    'cadillac-escalade-esv-air-ride-2007': exactPath({
      oldTitle: 'Rear Air Suspension Compressor and Air Spring Failure',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIT4954C - Automatic Level Control Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10113019-9999.pdf',
        },
      ],
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      category: 'suspension',
      title:
        'Rear Level-Control Message or Low Ride Height Needs Circuit Diagnosis',
      description:
        'GM PIT4954C separates several Escalade ESV level-control paths. On 2007-2009 vehicles, pinched pressure-sensor wiring can contribute to C0696 or C0711. A low rear ride height under heavy payload with C0711 has a moisture-damaged sensor/filter/dryer branch. A visibly loose or damaged left-rear inlet hose has a separate hose-and-filter path. No brief key-up compressor run can be normal because startup operation occurs only below 10 psi. The bulletin does not establish universal compressor or air-spring failure.',
      solution:
        'Confirm RPO Z55 or Z95, model year, DTCs, load condition and visible hose condition, then follow the matching PIT4954C branch. Apply the pressure-sensor wiring check only to 2007-2009 vehicles; use the moisture or inlet-hose path only when its stated condition is present. Do not treat a missing key-up compressor run by itself as a failure: startup operation occurs only below 10 psi, typically after a long park or when a small leak already exists. GM warns against replacing the complete compressor for these conditions.',
      symptoms: [
        'Service Suspension System message',
        'Rear ride height is low',
      ],
      systems: [
        'rear automatic level control',
        'compressor pressure sensor and inlet path',
      ],
      dtcCodes: ['C0696', 'C0711'],
    }),
    'cadillac-escalade-esv-transfer-case-2002': archived({
      oldTitle: 'Transfer Case Encoder Motor and Position Sensor Failure',
      idSuffix: 'Transfer-Case Encoder-and-Position-Sensor Aggregation',
      claims: 2,
      urls: 2,
      years: [
        2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
        2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      category: 'drivetrain',
      reason:
        'The current primary-source sweep did not establish the asserted encoder-motor and position-sensor failure across 2002-2020. GM service update 14616 describes a materially different VIN-gated 2015 TCCM software condition and is retained only as a controlled proposal.',
      evidence: [
        {
          type: 'tsb',
          label: 'GM Service Update 14616 - 2015 Transfer-Case Control Calibration',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10067393-9133.pdf',
        },
      ],
    }),
    'cadillac-escalade-esv-liftgate-struts-2007': archived({
      oldTitle: 'Power Liftgate Strut Failure and Liftgate Falling',
      idSuffix: 'Power-Liftgate-Strut Aggregation',
      claims: 1,
      urls: 1,
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      category: 'body',
      reason:
        'The current primary-source sweep did not establish the asserted falling-liftgate and generic gas-strut failure across 2007-2014. GM service update 14300 describes a materially different VIN-gated 2015 left power-assist actuator that can lock the gate and is retained only as a controlled proposal.',
      evidence: [
        {
          type: 'tsb',
          label: 'GM Service Update 14300 - Power Liftgate Actuator',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10248762-9999.pdf',
        },
      ],
    }),
    'cadillac-escalade-esv-air-suspension-2002': exactPath({
      oldTitle: 'Autoride Air Suspension Compressor and Shock Failure',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIT4954C - Automatic Level Control Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10113019-9999.pdf',
        },
      ],
      years: [2003, 2004, 2005, 2006],
      category: 'suspension',
      title:
        'Early Escalade ESV Level-Control Faults Need Sensor and Inlet Diagnosis',
      description:
        'GM PIT4954C separates several level-control paths for the 2003-2006 Escalade ESV generation with RPO Z55 or Z95. Pinched pressure-sensor wiring can contribute to C0696 or C0711. A low rear ride height under heavy payload with C0711 has a moisture-damaged sensor/filter/dryer branch. A visibly loose or damaged left-rear inlet hose has a separate hose-and-filter path. No brief key-up compressor run can be normal because startup operation occurs only below 10 psi. Escalade ESV did not exist for model year 2002.',
      solution:
        'Confirm the model year, suspension RPO, DTCs, load condition and visible hose condition, then follow only the matching PIT4954C branch. Do not treat a missing key-up compressor run by itself as a failure: startup operation occurs only below 10 psi, typically after a long park or when a small leak already exists. Do not replace the complete compressor or convert the suspension solely from this symptom card.',
      symptoms: [
        'Service Suspension System message',
        'Rear ride height is low',
      ],
      systems: [
        'rear automatic level control',
        'compressor pressure sensor and inlet path',
      ],
      dtcCodes: ['C0696', 'C0711'],
    }),
    'cadillac-escaladeesv-10-speed-10l8010l90-harsh-shifting-2021':
      exactPath({
        oldTitle:
          '10-Speed 10L80/10L90 Harsh Shifting, Shudder, and Valve Body Control Solenoid Issues',
        claims: 2,
        urls: 2,
        evidence: [
          {
            type: 'tsb',
            label: 'GM 22-NA-182 - 10-Speed Cooler-Line Diagnosis',
            url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008962-0001.pdf',
          },
        ],
        years: [2021, 2022, 2023, 2024, 2025],
        engines: ['6.2L L87 V8', '3.0L LM2 diesel', '6.2L LT4 V8'],
        category: 'transmission',
        title:
          '10-Speed Harsh Shift, Shudder or Flare Can Come From a Twisted Cooler Line',
        description:
          'GM 22-NA-182 covers 2021-2025 Escalade ESV vehicles with L87, LM2 or LT4 engines and MHS, MHO or MQC 10-speed transmissions. A twisted cooler line can contribute to harsh shifts, shudder, surge, stall, flare or overheat; P27EC applies to the ETRS MHS/MQC branch. The bulletin does not prove a universal valve-body or solenoid failure.',
        solution:
          'Verify the exact engine/transmission branch and DTCs, inspect the cooler lines for a twist or misshapen section, correct the routing or replace a confirmed damaged line, set fluid level and evaluate the thermal bypass valve as directed. Continue normal diagnosis if the concern remains; do not order transmission parts from this card.',
        symptoms: [
          'Harsh transmission shift',
          'Transmission shudder or surge',
          'Transmission flare or overheat',
        ],
        systems: [
          '10-speed automatic transmission',
          'transmission cooler lines',
          'thermal bypass valve',
        ],
        dtcCodes: ['P27EC'],
      }),
    'cadillac-escaladeesv-62l-l87-connecting-rodbearing-2021':
      exactPath({
        disposition: 'recall-dealer',
        oldTitle:
          '6.2L L87 Connecting Rod/Bearing Failure Leading to Engine Seizure',
        claims: 2,
        urls: 2,
        evidence: [
          {
            type: 'recall',
            label: 'NHTSA Recall 25V274 - L87 Engine Failure',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V274-1938.PDF',
          },
          {
            type: 'recall',
            label: 'GM N252494002 Recall Remedy and FAQ',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RMISC-25V274-6877.pdf',
          },
          {
            type: 'recall',
            label: 'GM N252494002 VIN-Specific Routing Notice',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RCMN-25V274-7820.pdf',
          },
        ],
        years: [2021, 2022, 2023, 2024],
        engines: ['6.2L L87 V8'],
        category: 'safety',
        title:
          'L87 Connecting-Rod or Crankshaft Defect Can Cause Engine Failure (Recall 25V274)',
        description:
          'Certain 2021-2024 Escalade ESV vehicles with the 6.2L L87 engine are covered by recall 25V274 / GM N252494002. Manufacturing defects in connecting-rod or crankshaft components can damage or seize the engine and cause loss of propulsion, increasing crash risk.',
        solution:
          'Check the VIN and current recall assignment with Cadillac. GM routes involved vehicles through VIN-specific inspection and remedy instructions and replaces the engine when required at no charge. If abnormal engine noise, warning messages or loss of power occurs, stop safely and arrange dealer service or towing.',
        severity: 'high',
        symptoms: [
          'Open safety recall',
          'Abnormal engine noise',
          'Engine damage or seizure',
          'Loss of propulsion',
        ],
        systems: [
          'L87 engine connecting rods',
          'crankshaft and bearings',
        ],
      }),
    'cadillac-escaladeesv-intermittent-no-start-battery-drain-2021':
      exactPath({
        oldTitle:
          'Intermittent No-Start, Battery Drain, and Control Module Sleep/Wake Electrical Faults',
        claims: 2,
        urls: 2,
        evidence: [
          {
            type: 'tsb',
            label: 'GM PIT5993D - Dead Battery From Glass-Breakage Loop',
            url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11015584-0001.pdf',
          },
        ],
        years: [2021, 2022, 2023, 2024, 2025],
        category: 'electrical',
        title:
          'Dead Battery or No-Crank Can Come From the Alarm Glass-Breakage Loop',
        description:
          'GM PIT5993D covers 2021-2025 Escalade ESV vehicles with theft-alarm RPO UTT or UTR. High resistance in the rear-defogger and rear-quarter-glass breakage loop can cause a low or dead battery, no-crank or unwanted alarm. The bulletin does not establish a generic module sleep/wake defect.',
        solution:
          'Have a qualified technician confirm the theft-alarm RPO and reproduce the draw with the vehicle closed and locked when needed. PIT5993D requires de-energizing and isolating the specified battery and BCM connections, checking BCM X7 terminal 27 tension with the specified test probe, and measuring the glass-breakage loop at the prescribed BCM ground terminals; the complete loop should be under 20 ohms. Repair confirmed high resistance, then test the battery. Do not order one from this card.',
        symptoms: [
          'Low or dead 12-volt battery',
          'No crank due to a dead battery',
          'Unwanted theft alarm',
        ],
        systems: [
          'theft-deterrent glass-breakage loop',
          'rear defogger grid',
          'rear quarter-glass connections',
        ],
      }),
    'cadillac-escaladeesv-oled-curved-display-blackout-2021': exactPath({
      oldTitle:
        'OLED Curved Display Blackout, Flicker, and Infotainment Module Failures',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM 21-NA-209 - Black Radio Screen and VPM Reprogramming',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10205558-9999.pdf',
        },
      ],
      years: [2021],
      category: 'electrical',
      title:
        'Black Radio Screen With U023C and B1A62-86 Needs VPM Recovery',
      description:
        'GM 21-NA-209 covers a bounded 2021 Escalade ESV condition with RPO UXP: a black radio screen showing a triangle and camera-slash symbol with current or recent U023C and B1A62-86. It does not establish general OLED hardware, flicker or infotainment-module failure.',
      solution:
        'Confirm the exact display pattern, RPO and DTCs. The GM procedure removes VPM fuse F28 for one minute, reinstalls it and has the dealer reprogram the K157 Video Processing Module. Do not replace the OLED display from this card.',
      symptoms: [
        'Black radio screen',
        'Triangle and camera-slash symbol on the display',
      ],
      systems: ['K157 video processing module', 'radio display'],
      dtcCodes: ['U023C', 'B1A62-86'],
    }),
    'cadillac-escaladeesv-super-cruise-and-driver-2021': exactPath({
      oldTitle:
        'Super Cruise and Driver Assistance System Faults from Camera/Radar Module Errors',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIT6056A - Startup Super Cruise U1624 Reset',
          url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017780-0001.pdf',
        },
      ],
      years: [2021, 2022, 2023, 2024],
      category: 'electrical',
      title:
        'Startup Super Cruise Unavailable With U1624 Has a Module-Reset Path',
      description:
        'GM PIT6056A covers 2021-2024 Escalade ESV vehicles with Super Cruise RPO UKL when the system is intermittently unavailable at startup and U1624 is stored in K124. The bulletin does not establish broad camera, radar or calibration failure and says not to replace K124 or K73 for this path.',
      solution:
        'Confirm RPO UKL and U1624 in K124. Follow the GM procedure to reset K73 by removing its fuse for at least one minute. If the code does not move to history, continue Service Information diagnosis. Do not replace modules or order driver-assistance parts from this card.',
      symptoms: ['Super Cruise unavailable at startup'],
      systems: ['Super Cruise', 'K124 and K73 driver-assistance modules'],
      dtcCodes: ['U1624'],
    }),
  },
  expectedTelemetry: {
    claimCount: 16,
    urlCount: 16,
    claimClickCount: 5,
    recordClickCount: 5,
    priorityClickCount: 5,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 6,
    'recall-dealer': 1,
    remove: 2,
  },
  expectedPublished: 7,
  expectedArchived: 2,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade ESV 2015 NQH transfer-case control-module calibration',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2014/SB-10067393-9133.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade ESV 2015 locked power-liftgate actuator service update',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2014/MC-10248762-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade ESV 2021 F47 vehicle-level-module ride-height calibration',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2021/MC-10190768-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade ESV 2025 Service 4WD U3000 diagnostic hold',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019076-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'Cadillac Escalade ESV 2015 NQH transfer-case control-module calibration::https://static.nhtsa.gov/odi/tsbs/2014/SB-10067393-9133.pdf',
    'Cadillac Escalade ESV 2015 locked power-liftgate actuator service update::https://static.nhtsa.gov/odi/tsbs/2014/MC-10248762-9999.pdf',
    'Cadillac Escalade ESV 2021 F47 vehicle-level-module ride-height calibration::https://static.nhtsa.gov/odi/tsbs/2021/MC-10190768-9999.pdf',
    'Cadillac Escalade ESV 2025 Service 4WD U3000 diagnostic hold::https://static.nhtsa.gov/odi/tsbs/2025/MC-11019076-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-escalade-esv-air-ride-2007': [
      2007, 2008, 2009, 2010, 2011, 2012, 2013,
    ],
    'cadillac-escalade-esv-air-suspension-2002': [2003, 2004, 2005, 2006],
    'cadillac-escaladeesv-10-speed-10l8010l90-harsh-shifting-2021': [
      2021, 2022, 2023, 2024, 2025,
    ],
    'cadillac-escaladeesv-62l-l87-connecting-rodbearing-2021': [
      2021, 2022, 2023, 2024,
    ],
    'cadillac-escaladeesv-intermittent-no-start-battery-drain-2021': [
      2021, 2022, 2023, 2024, 2025,
    ],
    'cadillac-escaladeesv-oled-curved-display-blackout-2021': [2021],
    'cadillac-escaladeesv-super-cruise-and-driver-2021': [
      2021, 2022, 2023, 2024,
    ],
  };
  if (
    issues.some((issue) =>
      Object.prototype.hasOwnProperty.call(expectedYears, issue.id)
        ? issue.after.status !== 'published' ||
          JSON.stringify(issue.after.years) !==
            JSON.stringify(expectedYears[issue.id])
        : issue.after.status !== 'archived',
    )
  ) {
    throw new Error('Cadillac Escalade ESV reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
