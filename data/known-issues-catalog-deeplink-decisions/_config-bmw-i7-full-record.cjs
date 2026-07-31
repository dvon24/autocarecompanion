const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function verifiedPath({
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
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source diagnosis path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with a bounded BMW bulletin path and removed ${claims} commerce claims with ${urls} URLs.`,
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
      title: `Archived - Unsupported BMW i7 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW i7 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, variant, production date, option codes, symptoms, DTCs, open recalls and current BMW service information before diagnosis. Air-suspension and high-voltage work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW i7 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW i7',
  make: 'BMW',
  model: 'i7',
  batchId: 'bmw-i7-full-record-cohort-11-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'e422f17d90b7b950bedbc12fa557dfe9f56158f3c2568748ac462297ef855697',
  sourceSnapshotFileHash:
    '440f6adb67badd1ac479a72dde477c2901716d8693ec04b39e6335e572ca8d72',
  packetFileHash:
    '31c25f8899d2dab2de3b1ddf87cbac08a77b9a7e6a30b4d7d253df896efed6ea',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-i7/e422f17d90b7/all-0001.json',
  reviewTokens: {
    blind: 'bmwi7_blind:no-blocker',
    edge: 'bmwi7_edge:no-blocker',
  },
  expectedIds: [
    'bmw-i7-air-suspension-calibration-2023',
    'bmw-i7-autonomous-system-updates-2025',
    'bmw-i7-ota-update-failures-2025',
  ],
  records: {
    'bmw-i7-air-suspension-calibration-2023': archived({
      oldTitle: 'Air Suspension Calibration and Sensor Issues',
      idSuffix: 'Air-Suspension Calibration Aggregation',
      years: [2023, 2024, 2025, 2026],
      category: 'suspension',
      claims: 3,
      urls: 5,
      reason:
        'It combines ride-height warnings, uneven stance, compressor operation and handling into a model-wide calibration defect using invalid forum evidence, then promotes generic air springs, a conversion kit and a scan tool without exact option-code, production-date, fault-code or BMW bulletin boundaries.',
    }),
    'bmw-i7-autonomous-system-updates-2025': verifiedPath({
      oldTitle: 'Level 2+ Driving Assist System Calibration',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 66 05 23 - ADCAM Camera-Based Assistance System Limits',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244242-0001.pdf',
        },
      ],
      years: [2023, 2024],
      category: 'safety',
      title: 'G70 i7 ADCAM Assistance-Limit Diagnosis',
      description:
        'BMW SIB 66 05 23 defines a G70 path for camera-based driver-assistance complaints including unexpected deactivation, inability to activate, missed road signs and frequent Check Control messages 930 or 2260. BMW identifies environmental visibility limits, windshield/camera installation, non-approved tires and chassis changes as possible boundaries. This is not proof of a universal Level 2+ software defect.',
      solution:
        'Read ADCAM fault memory with ISTA before replacing anything. Inspect and clean the windshield camera area, verify wiper performance and camera-holder installation, and document weather and traffic conditions. If fault 7E00A0 follows windshield replacement, start the required camera calibration in ISTA. If no fault or installation problem exists, explain the operating limits in the owner manual. BMW states that parts replacement does not correct environmental system limitations.',
      severity: 'medium',
      symptoms: [
        'ADCAM assistance deactivates or cannot be activated',
        'Check Control message 930 or 2260',
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
    'bmw-i7-ota-update-failures-2025': verifiedPath({
      oldTitle: 'OTA Software Update Failures',
      claims: 4,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 61 11 24 - BCP Faults after Remote Software Upgrade',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252135-0001.pdf',
        },
      ],
      years: [2023, 2024],
      category: 'electrical',
      title: 'G70 i7 Comfort-Access Faults after Remote Upgrade',
      description:
        'BMW SIB 61 11 24 defines a G70 path after a Remote Software Upgrade when Comfort Access or Passive Go/Exit functionality is reduced and Basic Central Platform faults 80424A through 80424F are stored. BMW identifies unfavorable communication between the BCP and one or more ultra-wideband remote-control receivers. The bulletin does not support the frozen card\'s broad stuck-download, battery-voltage, ConnectedDrive-account or all-year failure theories.',
      solution:
        'Confirm that the complaint followed a BMW Remote Software Upgrade and read the exact BCP faults. Follow SIB 61 11 24 in ISTA to program and pair all FBD5/FBD5s remote-control receivers, clear faults and verify Comfort Access and Passive Go/Exit. Keep phones disconnected during receiver programming. BMW states that parts replacement will not solve this path. ShowMeTheParts resolves the exact 2023 i7 but has no software or receiver repair candidate, so all marketplace links are removed.',
      severity: 'medium',
      symptoms: [
        'Reduced Comfort Access after a Remote Software Upgrade',
        'Reduced Passive Go or Passive Exit function',
        'BCP faults 80424A through 80424F',
      ],
      systems: [
        'Basic Central Platform',
        'FBD5 ultra-wideband remote-control receivers',
        'Comfort Access',
      ],
      dtcCodes: [
        '80424A',
        '80424B',
        '80424C',
        '80424D',
        '80424E',
        '80424F',
      ],
    }),
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 10,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 1,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 1,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i7-electric-drive-motor-software-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V395-7784.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i7-integrated-brake-servomotor-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V697-1756.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i7-steering-spindle-joint-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V714-4428.PDF',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i7-front-axle-parking-noise-sib',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031573-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-i7-electric-drive-motor-software-recall::https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V395-7784.pdf',
    'bmw-i7-integrated-brake-servomotor-recall::https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V697-1756.pdf',
    'bmw-i7-steering-spindle-joint-recall::https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V714-4428.PDF',
    'bmw-i7-front-axle-parking-noise-sib::https://static.nhtsa.gov/odi/tsbs/2026/MC-11031573-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const published = {
    'bmw-i7-autonomous-system-updates-2025': [2023, 2024],
    'bmw-i7-ota-update-failures-2025': [2023, 2024],
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
    throw new Error('BMW i7 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
