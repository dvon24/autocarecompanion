const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function verifiedPath({
  disposition = 'diagnosis-hold',
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  category,
  title,
  description,
  solution,
  severity,
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source:
        disposition === 'recall-dealer'
          ? 'recall-related'
          : 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded BMW/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
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
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Data Corpus',
        url: communicationsCorpus,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported BMW iX ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW iX population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, variant, production date, option codes, symptoms, DTCs, open recalls and current BMW service information before diagnosis. High-voltage and air-suspension work belongs with properly trained personnel.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Data Corpus',
          url: communicationsCorpus,
        },
      ],
      summary: `Archived the unsupported BMW iX "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW iX',
  make: 'BMW',
  model: 'iX',
  batchId: 'bmw-ix-full-record-cohort-13-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '43d81a8eb5278559a8826882bdebb48ceb92623aa935145c945f4e45aaec2649',
  sourceSnapshotFileHash:
    '760742ea7dc69bb53caaaa6ab9136a5c51ea926e16d7b27478276a4d68b558b1',
  packetFileHash:
    '6bfe513f8e85880ac1a12c51d62ce3b3ee8e4c13479ed7b432541bf078b6a094',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-ix/43d81a8eb527/all-0001.json',
  reviewTokens: {
    blind: 'bmwix_blind:no-blocker',
    edge: 'bmwix_edge:no-blocker',
  },
  expectedIds: [
    'bmw-ix-12v-battery-drain-2022',
    'bmw-ix-air-suspension-2022',
    'bmw-ix-air-suspension-calibration-2022',
    'bmw-ix-build-quality-2022',
    'bmw-ix-charging-failures-2022',
    'bmw-ix-dc-fast-charging-issues-2022',
    'bmw-ix-hv-battery-ecu-software-2022',
    'bmw-ix-idrive8-crashes-2022',
    'bmw-ix-infotainment-screen-blackout-2022',
    'bmw-ix-phantom-braking-2022',
  ],
  records: {
    'bmw-ix-12v-battery-drain-2022': archived({
      oldTitle:
        '12V Auxiliary Battery Drain - Sleep Mode & Module Wake Issues',
      idSuffix: '12V Sleep and Wake Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      claims: 8,
      urls: 10,
      reason:
        'It assigns telematics, comfort-access, over-the-air, charging and app behavior as parasitic-draw causes across the model, then promotes generic batteries, maintainers and scan tools without a matching I20 BMW energy-diagnosis bulletin, exact faults or verified battery fitment.',
    }),
    'bmw-ix-air-suspension-2022': archived({
      oldTitle:
        'Air Suspension Compressor & Air Spring Failures - xDrive50/M60',
      idSuffix: 'Air-Compressor and Spring Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'suspension',
      claims: 3,
      urls: 5,
      reason:
        'It turns sag, compressor noise, ride changes and cold-weather behavior into an xDrive50/M60 defect using forum-level evidence, then promotes generic compressors, air springs and a conversion kit without option-code, production-date, leakage-test or BMW bulletin boundaries.',
    }),
    'bmw-ix-air-suspension-calibration-2022': archived({
      oldTitle: 'Air Suspension Calibration Errors',
      idSuffix: 'Air-Suspension Calibration Aggregation',
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'suspension',
      claims: 2,
      urls: 2,
      reason:
        'It duplicates the air-suspension card and treats ride-height warnings, uneven stance and handling changes as model-wide calibration or sensor failure without a BMW communication, exact faults, option codes or measured ride-height criteria.',
    }),
    'bmw-ix-build-quality-2022': archived({
      oldTitle: 'Panel Gaps & Build Quality Issues',
      idSuffix: 'Build-Quality Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'body',
      claims: 2,
      urls: 2,
      reason:
        'It combines cosmetic alignment, trim, wind noise, seals and interior rattles into a model-wide defect using owner-video and forum evidence, then promotes generic trim tools and weatherstrip without BMW dimensional criteria or a bounded repair procedure.',
    }),
    'bmw-ix-charging-failures-2022': verifiedPath({
      oldTitle:
        'DC Fast Charging Failures & Reduced Charging Speed',
      claims: 4,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 61 06 24 - BEV/PHEV Charging Complaint Related to Charger or Infrastructure',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252029-0001.pdf',
        },
      ],
      years: [2022, 2023, 2024],
      category: 'electrical',
      title: 'iX Charger/Infrastructure-First Charging Diagnosis',
      description:
        'BMW SIB 61 06 24 defines an I20 iX path for charging complaints where the charger, infrastructure, authentication, vehicle settings, connector condition, temperature or the vehicle may be responsible. BMW requires the customer complaint and charging conditions to be documented before assigning a vehicle fault. The bulletin does not support a universal iX DC-fast-charge defect or fixed charging-speed threshold.',
      solution:
        'Document where and how the failure occurred, displayed messages, charger type, authentication method and vehicle charge settings. Test another charger, outlet, adapter or public station, inspect the plug/socket, and run BMW ISTA charging tests before condemning the vehicle. Only after the vehicle works at the dealer and fails at the customer location should infrastructure be treated as likely. Exact 2022 iX ShowMeTheParts data contains no charging category or candidate, so no retail link is approved.',
      severity: 'medium',
      symptoms: [
        'Charging does not start or is interrupted',
        'Charging power is lower than expected',
        'Complaint changes with charger, station, authentication or settings',
      ],
      systems: [
        'charging infrastructure',
        'high-voltage charging socket',
        'vehicle charging settings and electronics',
      ],
    }),
    'bmw-ix-dc-fast-charging-issues-2022': archived({
      oldTitle: 'DC Fast Charging Speed Inconsistency',
      idSuffix: 'Duplicate DC-Charging Aggregation',
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'electrical',
      claims: 4,
      urls: 4,
      reason:
        'It duplicates the retained infrastructure-first diagnosis but adds asserted charging curves, battery-temperature and session-frequency thresholds across unsupported future years, then promotes chargers and adapters that do not diagnose the cause.',
    }),
    'bmw-ix-hv-battery-ecu-software-2022': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle:
        'High Voltage Battery ECU Software - Loss of Drive Power (Recall)',
      claims: 5,
      urls: 5,
      evidence: [
        {
          type: 'recall',
          label:
            'NHTSA Part 573 Safety Recall 25V-395 - Electric Drive Motor Software',
          url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V395-0855.pdf',
        },
      ],
      years: [2022, 2023, 2024],
      category: 'drivetrain',
      title: '2022-2024 iX Propulsion-Loss Recall 25V-395',
      description:
        'BMW recall 25V-395 covers 25,447 VIN-defined 2022-2024 iX vehicles produced February 4, 2021 through January 16, 2024. Electric-drive-motor software can mistakenly identify a double-isolation condition and shut down the high-voltage system about 15-20 seconds after a red warning, causing loss of propulsion. Power-assisted steering and braking remain available.',
      solution:
        'Check the VIN for an open 25V-395 campaign. If included, install BMW\'s free electric-drive-motor software update through the authorized dealer or approved recall over-the-air process. Do not order a battery ECU, motor or battery part from this card. Capture any red warning and arrange diagnosis if the VIN is not included or the fault remains after the recall remedy.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 25V-395 recall',
        'Red drivetrain warning and red warning symbol',
        'High-voltage shutdown and loss of propulsion about 15-20 seconds later',
      ],
      systems: [
        'electric drive motor software',
        'high-voltage shutdown logic',
      ],
    }),
    'bmw-ix-idrive8-crashes-2022': archived({
      oldTitle: 'iDrive 8 System Crashes, Reboots & Screen Blank',
      idSuffix: 'iDrive 8 Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      claims: 5,
      urls: 5,
      reason:
        'It combines freezing, rebooting, black screens, audio, navigation, phone integration and climate controls into a single all-year defect using owner anecdotes, then promotes generic scan tools and accessories without exact head-unit version, software level or BMW test path.',
    }),
    'bmw-ix-infotainment-screen-blackout-2022': verifiedPath({
      oldTitle: 'Infotainment Screen Blackouts',
      claims: 4,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 65 28 25 - Multifunction Display Operation Issues',
          url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11026964-0001.pdf',
        },
      ],
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'electrical',
      title: 'iX HU-H4/H5/H6 Multifunction Black-Screen Path',
      description:
        'BMW SIB 65 28 25 defines an I20 iX path with Head Unit 4, 5 or 6 for an intermittent or permanent Multifunction Display black screen, including a missing navigation display. BMW identifies unfavorable head-unit software. This does not support the frozen card\'s broad hardware, wiring, battery-voltage or all-screen replacement assumptions.',
      solution:
        'Confirm the installed head-unit generation and current I-level. With the vehicle stationary, follow the bulletin sequence: full sleep cycle, a volume-control head-unit reset longer than 70 seconds, the BMW-directed 12-volt reset when necessary, then ISTA display test plan ABL-DIT-AT6581_CID3. Program the complete vehicle only through the BMW path and do not replace the display before the required tests.',
      severity: 'medium',
      symptoms: [
        'Intermittent Multifunction Display black screen',
        'Permanent Multifunction Display black screen',
        'Head-unit function such as navigation is not displayed',
      ],
      systems: [
        'Multifunction Display',
        'Head Unit 4, 5 or 6',
      ],
    }),
    'bmw-ix-phantom-braking-2022': verifiedPath({
      oldTitle:
        'Phantom Braking & False Forward Collision Warnings',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 66 05 23 - ADCAM Camera-Based Assistance System Limits',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244242-0001.pdf',
        },
      ],
      years: [2022, 2023, 2024],
      category: 'safety',
      title: 'iX ADCAM False-Warning and Sensor-Limit Diagnosis',
      description:
        'BMW SIB 66 05 23 defines an I20 iX path for camera-based assistance complaints including deactivation, missed road signs and excessively frequent Check Control messages 930 or 2260. BMW identifies environmental visibility limits, windshield/camera installation, non-approved tires and chassis changes as possible boundaries. The bulletin does not establish model-wide phantom braking or prove a failed radar sensor.',
      solution:
        'Read ADCAM fault memory with ISTA before replacing anything. Inspect and clean the windshield camera area, verify wiper performance and camera-holder installation, and document weather, light, traffic and road conditions. If fault 7E00A0 follows windshield replacement, start the required camera calibration in ISTA. If no fault or installation problem exists, explain the owner-manual operating limits; BMW states parts replacement does not correct environmental system limitations.',
      severity: 'high',
      symptoms: [
        'ADCAM assistance deactivates or cannot be activated',
        'Check Control message 930 or 2260 appears excessively',
        'Fault 7E0197 for short-term sensor blindness',
        'Fault 7E00A0 after windshield replacement or incomplete calibration',
      ],
      systems: [
        'ADCAM front camera',
        'camera-based driver assistance',
        'windshield camera holder and calibration',
      ],
      dtcCodes: ['7E0197', '7E00A0'],
    }),
  },
  expectedTelemetry: {
    claimCount: 39,
    urlCount: 43,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 6,
    'recall-dealer': 1,
    'diagnosis-hold': 3,
  },
  expectedPublished: 4,
  expectedArchived: 6,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-ix-high-voltage-battery-cell-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2022/RCMN-22V541-5322.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-ix-combined-charging-unit-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V449-6650.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-ix-periodic-central-display-flicker',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019580-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-ix-comfort-access-faults-after-remote-upgrade',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252135-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-ix-high-voltage-battery-cell-recall::https://static.nhtsa.gov/odi/rcl/2022/RCMN-22V541-5322.pdf',
    'bmw-ix-combined-charging-unit-recall::https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V449-6650.pdf',
    'bmw-ix-periodic-central-display-flicker::https://static.nhtsa.gov/odi/tsbs/2025/MC-11019580-0001.pdf',
    'bmw-ix-comfort-access-faults-after-remote-upgrade::https://static.nhtsa.gov/odi/tsbs/2024/MC-10252135-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const published = {
    'bmw-ix-charging-failures-2022': [2022, 2023, 2024],
    'bmw-ix-hv-battery-ecu-software-2022': [2022, 2023, 2024],
    'bmw-ix-infotainment-screen-blackout-2022': [
      2022,
      2023,
      2024,
      2025,
      2026,
    ],
    'bmw-ix-phantom-braking-2022': [2022, 2023, 2024],
  };
  if (
    issues.some((issue) => {
      const years = published[issue.id];
      return (
        issue.after.status !== (years ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            years || config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !== JSON.stringify([])
      );
    })
  ) {
    throw new Error('BMW iX reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
