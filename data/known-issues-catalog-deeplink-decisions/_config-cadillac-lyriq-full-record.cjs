const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
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
    disposition: 'diagnosis-hold',
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
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded GM/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function recall({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  category,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  return {
    disposition: 'recall-dealer',
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact VIN-gated safety campaign below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title,
      description,
      solution,
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with an exact VIN-first GM/NHTSA recall path and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({ oldTitle, idSuffix, years, category, claims, urls, reason }) {
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
      title: `Archived - Unsupported Cadillac Lyriq ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Lyriq population. ${reason}`,
      solution:
        'Do not order parts or apply a universal reset or repair from this archived card. Verify the exact model year, drivetrain, symptoms, DTCs, recall status and current Cadillac EV service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac Lyriq "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Lyriq',
  make: 'Cadillac',
  model: 'Lyriq',
  batchId: 'cadillac-lyriq-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'd6699280e8e107ff5e502b8853a86d1e540f640041ab821b36ef368bcddb7b79',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-lyriq/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac5_blind:no-blocker',
    edge: 'cadillac5_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-lyriq-12v-battery-drain-2023',
    'cadillac-lyriq-abs-releases-brake-pressure-reduced-braking-low-speeds',
    'cadillac-lyriq-charge-port-2023',
    'cadillac-lyriq-front-stabilizer-bar-bracket-bolts-loosen-separate',
    'cadillac-lyriq-heat-pump-climate-system-failure-no-heat-extreme-cold',
    'cadillac-lyriq-inconsistent-dc-fast-charging-speed-mid-session-power-dips',
    'cadillac-lyriq-instrument-cluster-display-goes-blank-while-driving',
    'cadillac-lyriq-range-estimation-2023',
    'cadillac-lyriq-rear-camera-glitch-2023',
    'cadillac-lyriq-rear-seat-belt-anchor-bracket-improperly-welded',
  ],
  records: {
    'cadillac-lyriq-12v-battery-drain-2023': exactPath({
      oldTitle: '12V Auxiliary Battery Drain from Module Wake Cycles',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label: 'GM Bulletin 23-NA-124 - Dead Battery from Communication Gateway Module Activity',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239643-0001.pdf',
        },
        {
          type: 'tsb',
          label: 'GM Preliminary Information PIP6021 - Potential 12V Battery Discharge',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011188-0001.pdf',
        },
      ],
      years: [2023, 2024],
      category: 'electrical',
      title: 'Dead 12V Battery from Gateway or BECM Software Conditions',
      description:
        'GM bulletin 23-NA-124 covers a dead 12V battery, no-start, inoperative passive-key functions and parasitic draw on the 2023 Lyriq when a Serial Data Gateway Module software anomaly keeps activity alive. PIP6021 separately covers 2023-2024 Lyriq discharge only when its complete listed BECM DTC set is present.',
      solution:
        'Have an EV-qualified Cadillac technician reproduce the draw and scan every module. For the 2023 gateway condition, cycle the specified fuse and verify or update the gateway software. Apply PIP6021 only when all listed DTCs are present; otherwise continue normal service-information diagnosis. Accept applicable future OTA updates. Do not disconnect the 12V or high-voltage system from this card.',
      symptoms: [
        'Dead or discharged 12V battery',
        'No start',
        'Passive key functions unavailable',
        'Parasitic draw',
      ],
      systems: [
        '12V battery',
        'Serial Data Gateway Module',
        'Battery Energy Control Module',
      ],
      dtcCodes: [
        'P2C8A',
        'P2C8B',
        'U3577',
        'U3578',
        'U3579',
        'U357A',
        'U357B',
        'U357C',
        'U357D',
        'U357E',
        'U357F',
        'U3580',
        'U35AF',
      ],
    }),
    'cadillac-lyriq-abs-releases-brake-pressure-reduced-braking-low-speeds':
      recall({
        oldTitle:
          'ABS Releases Brake Pressure / Reduced Braking at Low Speeds (Recall 24V589)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label: 'GM Recall N242453471 - Reduction or Loss of Braking at Low Speeds',
            url: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V589-3950.pdf',
          },
        ],
        years: [2023, 2024],
        category: 'brakes',
        title: 'False ABS Activation Can Reduce Braking Below 25 mph (Recall 24V589)',
        description:
          'Certain 2023-2024 Lyriq all-wheel-drive vehicles can falsely detect wheel slip on dry pavement below 25 mph. Under a specific wheel-movement sequence, ABS can continue releasing service-brake pressure and reduce or remove normal braking performance.',
        solution:
          'Check the VIN and open-field-action status. Cadillac updates the Electronic Brake Control Module software over the air or at an authorized dealer under recall 24V589 / GM N242453471 at no charge. Do not assume a rear-wheel-drive Lyriq is included.',
        symptoms: [
          'Unexpected ABS activation on dry pavement below 25 mph',
          'Reduced braking performance',
          'Open safety recall',
        ],
        systems: ['Electronic Brake Control Module', 'anti-lock brake system'],
      }),
    'cadillac-lyriq-charge-port-2023': exactPath({
      oldTitle: 'Charge Port Door and Charging Session Issues',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'tsb',
          label: 'GM Preliminary Information PIC6586 - Charge Port Door Does Not Auto Close',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011213-0001.pdf',
        },
      ],
      years: [2023, 2024, 2025],
      category: 'electrical',
      title: 'Charge Port Door May Not Auto-Close After Unplugging',
      description:
        'PIC6586 states that the 2023-2025 Lyriq charge-port door may remain open after the charging plug is removed because automatic closing was intentionally disabled to keep the dust cover from catching and breaking the door. This is a feature behavior, not proof of a failed door motor or charging module.',
      solution:
        'No repair is required for this exact condition. Close the door with its button, or it will close automatically when the vehicle is shifted out of Park. If the door will not respond to either action or charging itself fails, have Cadillac diagnose that separate symptom.',
      severity: 'low',
      symptoms: ['Charge port door remains open after unplugging'],
      systems: ['charge port door'],
    }),
    'cadillac-lyriq-front-stabilizer-bar-bracket-bolts-loosen-separate':
      recall({
        oldTitle:
          'Front Stabilizer Bar Bracket Bolts Loosen and Separate (Recall 25V232)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label: 'NHTSA Part 573 Report 25V232 / GM N252494190',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V232-4582.PDF',
          },
        ],
        years: [2023, 2024, 2025],
        category: 'suspension',
        title: 'Loose Stabilizer Bracket Bolts Can Damage EV Cables (Recall 25V232)',
        description:
          'On 17 identified 2023-2025 Lyriqs, improperly fastened left or right front stabilizer-bar bracket bolts can loosen and separate. A loose bar or bracket can damage high-voltage cables or battery-coolant lines, eventually making the vehicle shut off or become undriveable.',
        solution:
          'Check the VIN for recall 25V232 / GM N252494190. An authorized Cadillac EV dealer inspects and, as necessary, properly fastens the affected bracket bolts at no charge. A clunk or rattle may precede separation; do not work near high-voltage cables from this card.',
        symptoms: [
          'Open safety recall',
          'Front clunk or rattle',
          'Vehicle may shut off if adjacent EV systems are damaged',
        ],
        systems: [
          'front stabilizer bar bracket',
          'high-voltage cables',
          'battery coolant lines',
        ],
      }),
    'cadillac-lyriq-heat-pump-climate-system-failure-no-heat-extreme-cold':
      archived({
        oldTitle: 'Heat Pump / Climate System Failure and No Heat in Extreme Cold',
        idSuffix: 'Heat-Pump and No-Heat Aggregation',
        claims: 0,
        urls: 0,
        years: [2024, 2025],
        category: 'hvac',
        reason:
          'The frozen card combines no-heat reports, extreme-cold performance, communication faults and a coolant-sensor harness update into one defect. GM service update N232414770 only establishes stressed coolant-sensor wiring and a harness-clip adjustment on certain 2024 RWD vehicles; it does not establish the frozen heat-pump/no-heat condition or consequence, so that distinct finding remains proposal-only.',
      }),
    'cadillac-lyriq-inconsistent-dc-fast-charging-speed-mid-session-power-dips':
      archived({
        oldTitle: 'Inconsistent DC Fast-Charging Speed With Mid-Session Power Dips',
        idSuffix: 'DC Fast-Charging Curve Aggregation',
        claims: 0,
        urls: 0,
        years: [2023, 2024, 2025],
        category: 'electrical',
        reason:
          'The frozen card treats third-party charging-curve test results, charger conditions and normal state-of-charge taper as one vehicle defect, but it supplies no DTC-gated GM diagnostic or repair. Charging rate varies with battery temperature, state of charge, charger output and software, so the asserted universal power dips and average rates are not a repairable stable issue.',
      }),
    'cadillac-lyriq-instrument-cluster-display-goes-blank-while-driving':
      recall({
        oldTitle:
          'Instrument Cluster Display Goes Blank While Driving (Recall 25V356)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label: 'NHTSA Part 573 Report 25V356 / GM N252500680',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V356-1033.pdf',
          },
        ],
        years: [2023, 2024],
        category: 'electrical',
        title: 'Driver Display Can Go Blank While Driving (Recall 25V356)',
        description:
          'Certain 2023-2024 Lyriqs can intermittently lose the driver video display while driving because of video-display-control-module software. The instrument panel, rear-vision camera image and other regulated information can become unavailable and increase crash risk.',
        solution:
          'Check the VIN and recall-completion status. Cadillac updates the video display control module over the air or at a dealer under recall 25V356 / GM N252500680 at no charge.',
        symptoms: [
          'Driver display goes blank while driving',
          'Speedometer or warning information unavailable',
          'Rear-vision camera image unavailable',
          'Open safety recall',
        ],
        systems: ['video display control module', 'driver display'],
      }),
    'cadillac-lyriq-range-estimation-2023': archived({
      oldTitle: 'Inaccurate Range Estimation in Cold Weather',
      idSuffix: 'Cold-Weather Range-Estimate Aggregation',
      claims: 3,
      urls: 3,
      years: [2023, 2024, 2025],
      category: 'electrical',
      reason:
        'The frozen card relied on a generic vehicle page and fabricated-looking forum/video URLs, asserted a temperature threshold and a 30-percent route buffer without primary support, and did not identify a GM DTC, campaign or repair. Normal cold-weather range variation cannot be published as a universal estimator defect from this evidence.',
      }),
    'cadillac-lyriq-rear-camera-glitch-2023': archived({
      oldTitle: 'Rear Camera and Surround Vision System Intermittent Failure',
      idSuffix: 'Rear-Camera Glitch Aggregation',
      claims: 4,
      urls: 4,
      years: [2023, 2024, 2025],
      category: 'electrical',
      reason:
        'The frozen card relied on a generic vehicle page and a fabricated-looking forum URL, mixed black image, distortion, wrong-angle, moisture and module-reset theories, and supplied no exact DTC or GM diagnostic. The verified 2023-2024 blank-display safety defect is already represented by the separate 25V356 record and must not be duplicated here.',
      }),
    'cadillac-lyriq-rear-seat-belt-anchor-bracket-improperly-welded': recall({
      oldTitle:
        'Rear Seat Belt Anchor Bracket Improperly Welded (Recall 23V785)',
      claims: 0,
      urls: 0,
      evidence: [
        {
          type: 'recall',
          label: 'GM Recall N232425220 - Incorrect Weld on Rear Seat Belt Anchorage',
          url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V785-8984.pdf',
        },
      ],
      years: [2023, 2024],
      category: 'safety',
      title: 'Rear Seat-Belt Anchor Bracket May Be Improperly Welded (Recall 23V785)',
      description:
        'Certain 2023-2024 Lyriqs may have a rear seat-belt bracket improperly welded to the seat frame. The bracket anchors the left-rear and center-rear belts and may not restrain occupants as intended in a crash.',
      solution:
        'Check the VIN for recall 23V785 / GM N232425220. Until an involved vehicle is repaired, do not use the left-rear or center-rear seating positions. An authorized Cadillac EV dealer replaces the rear seat cushion frame at no charge.',
      symptoms: [
        'Open safety recall',
        'No reliable visual symptom before a crash',
      ],
      systems: ['rear seat cushion frame', 'rear seat-belt anchor bracket'],
    }),
  },
  expectedTelemetry: {
    claimCount: 11,
    urlCount: 11,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 2,
    'recall-dealer': 4,
    remove: 4,
  },
  expectedPublished: 6,
  expectedArchived: 4,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-lyriq-hvac-coolant-sensor-harness-2024-rwd',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2023/MC-10245166-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'cadillac-lyriq-hvac-coolant-sensor-harness-2024-rwd::https://static.nhtsa.gov/odi/tsbs/2023/MC-10245166-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-lyriq-12v-battery-drain-2023': {
      years: [2023, 2024],
      status: 'published',
    },
    'cadillac-lyriq-abs-releases-brake-pressure-reduced-braking-low-speeds': {
      years: [2023, 2024],
      status: 'published',
    },
    'cadillac-lyriq-charge-port-2023': {
      years: [2023, 2024, 2025],
      status: 'published',
    },
    'cadillac-lyriq-front-stabilizer-bar-bracket-bolts-loosen-separate': {
      years: [2023, 2024, 2025],
      status: 'published',
    },
    'cadillac-lyriq-heat-pump-climate-system-failure-no-heat-extreme-cold': {
      years: [2024, 2025],
      status: 'archived',
    },
    'cadillac-lyriq-inconsistent-dc-fast-charging-speed-mid-session-power-dips':
      {
        years: [2023, 2024, 2025],
        status: 'archived',
      },
    'cadillac-lyriq-instrument-cluster-display-goes-blank-while-driving': {
      years: [2023, 2024],
      status: 'published',
    },
    'cadillac-lyriq-range-estimation-2023': {
      years: [2023, 2024, 2025],
      status: 'archived',
    },
    'cadillac-lyriq-rear-camera-glitch-2023': {
      years: [2023, 2024, 2025],
      status: 'archived',
    },
    'cadillac-lyriq-rear-seat-belt-anchor-bracket-improperly-welded': {
      years: [2023, 2024],
      status: 'published',
    },
  };
  if (
    issues.some(
      (issue) =>
        !expected[issue.id] ||
        issue.after.status !== expected[issue.id].status ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expected[issue.id].years),
    )
  ) {
    throw new Error('Cadillac Lyriq reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
