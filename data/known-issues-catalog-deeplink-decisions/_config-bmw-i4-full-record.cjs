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
      dtcCodes: [],
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
      title: `Archived - Unsupported BMW i4 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW i4 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, variant, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis. High-voltage and refrigerant work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW i4 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW i4',
  make: 'BMW',
  model: 'i4',
  batchId: 'bmw-i4-full-record-cohort-9-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '3472dede2a1adda460b6ad8753dcc0dd175a0038a87dfe95fea235e744553137',
  sourceSnapshotFileHash:
    '4fdfeabd9d811bd66a6abbb29cda0a49bc7de2983c2c69b539dec8551c4247cb',
  packetFileHash:
    '6ee5380038a48d6e1496703f16df0435fa73a274c115a1518d2f2f08c6c90bf6',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-i4/3472dede2a1a/all-0001.json',
  reviewTokens: {
    blind: 'bmwi4_blind:no-blocker',
    edge: 'bmwi4_edge:no-blocker',
  },
  expectedIds: [
    'bmw-i4-12v-battery-drain-2022',
    'bmw-i4-12v-battery-sleep-mode-2022',
    'bmw-i4-brake-feel-regen-2022',
    'bmw-i4-drivetrain-malfunction-2022',
    'bmw-i4-heat-pump-cold-weather-2022',
    'bmw-i4-heat-pump-malfunction-2022',
    'bmw-i4-idrive8-software-bugs-2022',
    'bmw-i4-infotainment-glitches-2022',
    'bmw-i4-pedestrian-sound-2022',
  ],
  records: {
    'bmw-i4-12v-battery-drain-2022': archived({
      oldTitle: '12V Auxiliary Battery Drain',
      idSuffix: '12V Drain Aggregation',
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'electrical',
      claims: 7,
      urls: 9,
      reason:
        'It assigns connectivity, iDrive and over-the-air activity as causes, promises multiple unspecified software fixes, and promotes an ICE-era battery part, tools, a relay and a tender without an exact G26 BMW fault path or battery fitment.',
    }),
    'bmw-i4-12v-battery-sleep-mode-2022': archived({
      oldTitle: '12V Battery Drain - Sleep Mode Failure',
      idSuffix: 'Duplicate Sleep-Mode Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      claims: 7,
      urls: 9,
      reason:
        'It duplicates the first 12V card and asserts a 60Ah battery, CCU/DC-DC failure, mandatory third-party registration apps, exterior-light behavior and starter-motor recommendations without a matching BMW communication.',
    }),
    'bmw-i4-brake-feel-regen-2022': archived({
      oldTitle: 'Regenerative Braking Pedal Feel Complaints - Grabby/Aggressive',
      idSuffix: 'Brake-Feel Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'brakes',
      claims: 2,
      urls: 2,
      reason:
        'It converts subjective forum impressions and an unverified variant comparison into an all-year defect, then promotes pads and drilled rotors even though those parts do not address the asserted blended-braking calibration.',
    }),
    'bmw-i4-drivetrain-malfunction-2022': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle: 'Drivetrain Malfunction / High Voltage System Shutdown',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'recall',
          label:
            'NHTSA Part 573 Safety Recall 25V-395 - Electric Drive Motor Software',
          url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V395-7784.pdf',
        },
      ],
      years: [2022, 2023, 2024, 2025],
      category: 'drivetrain',
      title: '2022-2025 i4 Propulsion-Loss Recall 25V-395',
      description:
        'BMW recall 25V-395 covers a VIN-defined group of 2022-2025 i4 vehicles produced March 17, 2021 through January 18, 2024. Electric-drive-motor software can mistakenly identify a double-isolation condition and shut down the high-voltage system about 15-20 seconds after a red warning, causing loss of propulsion. Power-assisted steering and braking remain available. This does not prove the frozen card’s separate battery-module, charger-account or DC-fast-charge theories.',
      solution:
        'Check the VIN for an open 25V-395 campaign. If included, install BMW’s free electric-drive-motor software update through the authorized dealer or the approved over-the-air recall process. Do not buy gear oil, gaskets or drivetrain parts as a substitute. Capture any red warning and arrange diagnosis if the VIN is not included or the fault remains after the recall remedy.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 25V-395 recall',
        'Red drivetrain warning and red warning symbol',
        'High-voltage shutdown and loss of propulsion about 15-20 seconds later',
      ],
      systems: ['electric drive motor software', 'high-voltage shutdown logic'],
    }),
    'bmw-i4-heat-pump-cold-weather-2022': verifiedPath({
      oldTitle: 'Heat Pump & Cold Weather Range Loss / Coolant Valve Leak',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 17 01 24 - G26 Coolant Leak at Changeover Valve',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253344-0002.pdf',
        },
      ],
      years: [2022, 2023, 2024],
      category: 'cooling',
      title: 'G26 i4 Coolant Changeover-Valve Leak Diagnosis',
      description:
        'BMW SIB 17 01 24 defines a G26 i4 path for coolant leaking under the car, low heater output, Check Control Message ID49 and specified coolant/heater faults. BMW identifies leakage from the coolant changeover valve and distinguishes improved valves produced January 5, 2024 or later. The bulletin does not support a universal below-19°F threshold, normal winter-range percentage, compressor failure or every-variant heat-pump defect.',
      solution:
        'Check coolant level, read the exact BMW fault memory and inspect the G26 changeover valve for active or dried leakage. Follow SIB 17 01 24 and VIN-specific AIR/ETK instructions; replace the applicable older-production valve and bleed/test the cooling system with ISTA when the BMW criteria are met. ShowMeTheParts resolves exact 2022 i4 HVAC and water-pump categories but returned no changeover-valve candidate, so the frozen marketplace searches and generic coolant are removed.',
      severity: 'medium',
      symptoms: [
        'Coolant leaking from under the vehicle',
        'Low heater output',
        'Check Control Message ID49 or BMW coolant-loss/heater communication faults',
      ],
      systems: [
        'coolant changeover valve',
        'high-voltage battery and power-electronics cooling',
        'electric auxiliary heater',
      ],
    }),
    'bmw-i4-heat-pump-malfunction-2022': archived({
      oldTitle: 'Heat Pump Malfunction in Cold Weather',
      idSuffix: 'Duplicate Heat-Pump Aggregation',
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'hvac',
      claims: 4,
      urls: 6,
      reason:
        'It duplicates the retained valve-leak path but adds an unsupported temperature threshold, mode-switching and refrigerant-pressure theory, resistive-heating fallback, unspecified software fixes and an all-year scope.',
    }),
    'bmw-i4-idrive8-software-bugs-2022': archived({
      oldTitle: 'iDrive 8 Software Bugs - Screen Crashes, Reboots & Freezing',
      idSuffix: 'iDrive 8 Aggregation',
      years: [2022, 2023, 2024, 2025],
      category: 'electrical',
      claims: 2,
      urls: 2,
      reason:
        'It claims widespread all-year instability, a fabricated polling percentage, specific outage durations and version fixes, and promotes unrelated scan tools/sensors from an invalid forum citation without a bounded BMW bulletin.',
    }),
    'bmw-i4-infotainment-glitches-2022': archived({
      oldTitle: 'iDrive 8 Software and Infotainment Glitches',
      idSuffix: 'Duplicate Infotainment Aggregation',
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'electrical',
      claims: 1,
      urls: 1,
      reason:
        'It duplicates the iDrive card, extends through an unsupported future model year, conflates Bluetooth, navigation, phone integration, camera, climate and head-unit hardware, and supplies generic reset/replacement advice without an exact fault path.',
    }),
    'bmw-i4-pedestrian-sound-2022': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle: 'Pedestrian Warning Sound System Failure (AVAS)',
      claims: 0,
      urls: 0,
      evidence: [
        {
          type: 'recall',
          label:
            'NHTSA Part 573 Noncompliance Recall 23V-026 - Vehicle Sound Generator',
          url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V026-3963.PDF',
        },
        {
          type: 'recall',
          label:
            'BMW Remedy Instructions 23V-026 - Receiver Audio Module Programming',
          url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V026-0361.pdf',
        },
      ],
      years: [2022, 2023],
      category: 'safety',
      title: '2022-2023 i4 eDrive40 Sound-Generator Recall 23V-026',
      description:
        'BMW recall 23V-026 covers certain 2022-2023 i4 eDrive40 vehicles produced November 11, 2021 through December 22, 2022. Unfavorable external artificial sound-generator software can fail during startup, leaving the vehicle without the low-speed pedestrian warning required by FMVSS 141. Variant, production date and VIN determine inclusion.',
      solution:
        'Check the VIN for an open 23V-026 campaign. If included, arrange the free BMW programming remedy for the Receiver Audio Module/external artificial sound generator. Do not replace a speaker or module based only on a missing sound; if the VIN is outside the campaign, diagnose the exact warning and faults separately.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 23V-026 recall',
        'External artificial warning sound is absent at low speed',
        'Vehicle sound-generator fault occurs during startup',
      ],
      systems: [
        'external artificial sound generator',
        'Receiver Audio Module software',
      ],
    }),
  },
  expectedTelemetry: {
    claimCount: 28,
    urlCount: 36,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    remove: 6,
    'recall-dealer': 2,
    'diagnosis-hold': 1,
  },
  expectedPublished: 3,
  expectedArchived: 6,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i4-hv-battery-software-recall-2022-2023',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V944-8744.PDF',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i4-combined-charging-unit-recall-2022-2023',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V449-1660.PDF',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i4-ihka-insufficient-cooling-path',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11026957-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-i4-hv-battery-software-recall-2022-2023::https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V944-8744.PDF',
    'bmw-i4-combined-charging-unit-recall-2022-2023::https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V449-1660.PDF',
    'bmw-i4-ihka-insufficient-cooling-path::https://static.nhtsa.gov/odi/tsbs/2026/MC-11026957-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-i4-drivetrain-malfunction-2022': [2022, 2023, 2024, 2025],
    'bmw-i4-heat-pump-cold-weather-2022': [2022, 2023, 2024],
    'bmw-i4-pedestrian-sound-2022': [2022, 2023],
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
    throw new Error('BMW i4 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
