const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function recalledPath({
  oldTitle,
  claims,
  urls,
  recallNumber,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  const evidence = [
    {
      type: 'recall',
      label: `UK DVSA BMW iX3 Safety Recall ${recallNumber}`,
      url: 'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/BMW/model/iX3/year/2021/recalls',
    },
  ];
  return {
    disposition: 'recall-dealer',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded government recall path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years: [2021],
      trims: [],
      engines: [],
      category: 'electrical',
      title,
      description,
      solution,
      severity: 'high',
      confidence: 'high',
      source: 'recall-related',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with UK DVSA recall ${recallNumber} and removed ${claims} commerce claims with ${urls} URLs.`,
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
      title: `Archived - Unsupported BMW iX3 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW iX3 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact market, model year, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis. High-voltage work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW iX3 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW iX3',
  make: 'BMW',
  model: 'iX3',
  batchId: 'bmw-ix3-full-record-cohort-14-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'd523a2ad9b32687002267b4796440401027f9ccdd3fa60ebbe458445638b6b16',
  sourceSnapshotFileHash:
    '60d765abd15df5e12d48e1a3e1d79d29a341646a62472f79a6491570e19c87bf',
  packetFileHash:
    '8b260fa5097c7ca05adf2745807513896c8f903904e25a1afffb3501b8729961',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-ix3/d523a2ad9b32/all-0001.json',
  reviewTokens: {
    blind: 'bmwix3_blind:no-blocker',
    edge: 'bmwix3_edge:no-blocker',
  },
  expectedIds: [
    'bmw-ix3-12v-battery-drain-2022',
    'bmw-ix3-charging-socket-lock-fault-cable-will-not-unlock-charging-wo',
    'bmw-ix3-drivetrain-wire-harness-2022',
    'bmw-ix3-onboard-charger-manufacturing-fault-electric-shock-risk',
    'bmw-ix3-rear-brake-disc-corrosion-caliper-seizure-from-regen-under-u',
    'bmw-ix3-regen-braking-inconsistency-2022',
    'bmw-ix3-software-infotainment-glitches-2022',
  ],
  records: {
    'bmw-ix3-12v-battery-drain-2022': archived({
      oldTitle: '12V Auxiliary Battery Drain and Failure',
      idSuffix: '12V Battery Aggregation',
      years: [2022, 2023, 2024],
      category: 'electrical',
      claims: 4,
      urls: 4,
      reason:
        'It treats parking duration, cold weather, app connectivity and repeated starts as a model-wide parasitic-drain defect, then promotes generic batteries, a maintainer and a scan tool without a G08 BMW energy-diagnosis bulletin, exact faults or verified battery fitment.',
    }),
    'bmw-ix3-charging-socket-lock-fault-cable-will-not-unlock-charging-wo':
      archived({
        oldTitle:
          'Charging Socket Lock Fault - Cable Will Not Unlock / Charging Won\'t Initiate',
        idSuffix: 'Charging-Socket Lock Aggregation',
        years: [2021, 2022, 2023, 2024],
        category: 'electrical',
        claims: 0,
        urls: 0,
        reason:
          'It asserts lock-actuator and cable-release hardware failure across all G08 years without a matching iX3 BMW bulletin, exact faults, production boundary or market-specific recall. Older BMW charging-lock instructions do not establish applicability to this model.',
      }),
    'bmw-ix3-drivetrain-wire-harness-2022': recalledPath({
      oldTitle:
        'Drivetrain Warning from Wire Harness Connection Fault',
      claims: 4,
      urls: 4,
      recallNumber: 'R/2023/133',
      title: '2021 iX3 Cell-Supervision Cable-Bridge Recall',
      description:
        'UK DVSA recall R/2023/133 covers a VIN-defined group of 2021 BMW iX3 vehicles. A cable-bridge connection between two circuit boards in the high-voltage battery cell supervision circuit may not have been installed correctly. The official recall population is 28 vehicles; this does not support the frozen card\'s broad drivetrain harness and connector-reseating theory.',
      solution:
        'Check the VIN with BMW for an open R/2023/133 campaign or its market-equivalent code. If included, an authorized high-voltage-qualified BMW facility replaces the cell supervision circuit inside the high-voltage battery at no charge. Do not reseat battery connectors or order a generic wiring harness from this card. Exact ShowMeTheParts iX3 coverage contains no high-voltage component candidate.',
      symptoms: [
        'VIN shows an open R/2023/133 campaign',
        'High-voltage battery or drivetrain warning',
        'Fault associated with the cell supervision circuit',
      ],
      systems: [
        'high-voltage battery cell supervision circuit',
        'internal circuit-board cable bridge',
      ],
    }),
    'bmw-ix3-onboard-charger-manufacturing-fault-electric-shock-risk':
      recalledPath({
        oldTitle:
          'Onboard Charger Manufacturing Fault - Electric Shock Risk (Neue Klasse NA5)',
        claims: 0,
        urls: 0,
        recallNumber: 'R/2021/361',
        title: '2021 iX3 Intermediate-Circuit Discharge Recall',
        description:
          'UK DVSA recall R/2021/361 covers 384 VIN-defined 2021 BMW iX3 vehicles. A software error can rarely trigger fast intermediate-circuit discharge later than intended. The remedy is Battery Management Unit reprogramming. This official G08 campaign replaces the frozen card, which incorrectly mixed a future Neue Klasse model, an onboard-charger manufacturing claim and an electric-shock theory.',
        solution:
          'Check the VIN with BMW for an open R/2021/361 campaign or its market-equivalent code. If included, have an authorized BMW facility reprogram the Battery Management Unit at no charge. Do not replace an onboard charger or perform high-voltage measurements from this card; vehicles outside the recall require BMW fault-led diagnosis.',
        symptoms: [
          'VIN shows an open R/2021/361 campaign',
          'Battery Management Unit software requires recall programming',
          'Intermediate-circuit discharge timing is outside specification',
        ],
        systems: [
          'Battery Management Unit software',
          'high-voltage intermediate-circuit discharge',
        ],
      }),
    'bmw-ix3-rear-brake-disc-corrosion-caliper-seizure-from-regen-under-u':
      archived({
        oldTitle:
          'Rear Brake Disc Corrosion and Caliper Seizure from Regen Under-Use',
        idSuffix: 'Rear-Brake Corrosion Aggregation',
        years: [2021, 2022, 2023, 2024, 2025],
        category: 'brakes',
        claims: 0,
        urls: 0,
        reason:
          'It converts general EV friction-brake under-use and environmental corrosion into an iX3-specific disc and caliper defect without BMW wear limits, inspection criteria, a service bulletin or a recall.',
      }),
    'bmw-ix3-regen-braking-inconsistency-2022': archived({
      oldTitle: 'Regenerative Braking Lag and Inconsistency',
      idSuffix: 'Regenerative-Braking Aggregation',
      years: [2022, 2023, 2024],
      category: 'brakes',
      claims: 1,
      urls: 1,
      reason:
        'It treats state-of-charge-, temperature- and drive-mode-dependent regenerative braking as a model-wide defect without a BMW communication, measured boundary, fault code or recall, then promotes unrelated brake pads.',
    }),
    'bmw-ix3-software-infotainment-glitches-2022': archived({
      oldTitle: 'iDrive Infotainment Software Freezes and Reboots',
      idSuffix: 'Infotainment Aggregation',
      years: [2022, 2023, 2024],
      category: 'electrical',
      claims: 4,
      urls: 4,
      reason:
        'It combines screen freezing, rebooting, Bluetooth, navigation and camera behavior into a G08-wide software defect using forum-level evidence, then promotes generic scan and phone accessories without a matching market-specific BMW bulletin or software-level boundary.',
    }),
  },
  expectedTelemetry: {
    claimCount: 13,
    urlCount: 13,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'recall-dealer': 2,
  },
  expectedPublished: 2,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const published = {
    'bmw-ix3-drivetrain-wire-harness-2022': [2021],
    'bmw-ix3-onboard-charger-manufacturing-fault-electric-shock-risk':
      [2021],
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
    throw new Error('BMW iX3 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
