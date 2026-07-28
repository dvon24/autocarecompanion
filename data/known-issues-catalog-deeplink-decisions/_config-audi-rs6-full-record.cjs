const cite = (type, title, url) => ({ type, title, url });

const citations = {
  tfsiWalnutBlast: cite(
    'tsb',
    'Audi TSB 2075530/1 - TFSI Inlet-Valve and Inlet-Port Walnut-Blasting Procedure',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009928-0001.pdf',
  ),
  gasolineDeposits: cite(
    'tsb',
    'Audi TSB 2014753/13 - Gasoline Quality and Deposit-Related Misfire Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012476-0001.pdf',
  ),
  airSuspensionControl: cite(
    'tsb',
    'Audi TSB 2059363/5 - RS6 Air-Suspension Compressor-Control Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253255-0001.pdf',
  ),
  rs7MountScope: cite(
    'tsb',
    'Audi TSB 2036392/5 - 4.0T Active-Mount Vibration Scope',
    'https://static.nhtsa.gov/odi/tsbs/2016/MC-10128004-9999.pdf',
  ),
};

const records = {
  'audi-rs6-carbon-buildup-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported universal failure, high-boost causation, fixed 30,000-40,000-mile cleaning interval, fixed cost and essential catch-can claim with current Audi TFSI guidance for confirmed inlet deposits. Scope the USA-market RS6 Avant to 2021-2024 and remove the clicked commerce claim without treating one click as technical evidence.',
    evidence: [
      {
        label:
          'Current Audi TSB 2075530/1 covers all 2005-2024 Audi TFSI vehicles and ties cold-start rough idle plus sporadic misfire to confirmed inlet-port or inlet-valve deposits before directing walnut blasting',
        url: citations.tfsiWalnutBlast.url,
      },
      {
        label:
          'Current Audi TSB 2014753/13 provides the wider deposit differential and does not support a fixed cleaning interval, a fixed cost, high-boost causation or a mandatory catch can',
        url: citations.gasolineDeposits.url,
      },
    ],
    after: {
      years: [2021, 2022, 2023, 2024],
      trims: [],
      engines: ['4.0T V8'],
      category: 'engine',
      title:
        '2021-2024 RS6 4.0T Cold-Start Misfire from Confirmed Inlet Deposits',
      description:
        'Audi TSB 2075530/1 documents that deposits in TFSI inlet ports and inlet valves can cause rough idling after a cold start and sporadic misfires, especially on vehicles used mainly for short trips. For the 2021-2024 RS6 Avant 4.0T record, this supports a symptom-triggered diagnosis and repair path; it does not establish that every vehicle has a high-boost carbon defect or requires cleaning at a fixed mileage.',
      solution:
        'Confirm the cold-start complaint, review the engine-control-unit event memory and verify inlet-port or inlet-valve deposits before cleaning. When that condition is confirmed, Audi TSB 2075530/1 directs the shop to remove the intake manifold or compressor and clean the inlet valves and ports by walnut blasting; the cylinder head remains installed. The cited Audi guidance does not specify a 30,000-40,000-mile interval, a fixed price or a mandatory catch can. Do not buy a catch can or cleaning product solely from this card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Rough idle after a cold start',
        'Sporadic engine misfire recorded in event memory',
      ],
      affectedSystems: [
        'TFSI inlet ports',
        'TFSI inlet valves',
        'engine management system',
      ],
      dtcCodes: [],
      citations: [citations.tfsiWalnutBlast, citations.gasolineDeposits],
      summary:
        'Replaced a universal high-boost carbon-defect, fixed-interval, fixed-cost and mandatory-catch-can narrative with Audi current symptom-triggered TFSI walnut-blasting guidance for 2021-2024; removed one clicked commerce claim and URL.',
    },
  },
  'audi-rs6-air-suspension-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported front-strut leak, hard-braking causation, upgraded-strut, compressor-overwork, 2020-2026 and fixed-cost narrative with the exact 2021-2024 RS6 Avant air-suspension warning and compressor-control diagnostic path in Audi TSB 2059363/5. Remove the unverified part number and both commerce claims with four URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/5 explicitly covers 2021-2024 RS6 Avant vehicles with air suspension, C1260F0 or U112100 symptom 262400 and gives separate passive, repeated-passive and active diagnostic outcomes',
        url: citations.airSuspensionControl.url,
      },
    ],
    after: {
      years: [2021, 2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'suspension',
      title:
        '2021-2024 RS6 Air-Suspension Warning - Check C1260F0 or U112100',
      description:
        'Audi TSB 2059363/5 covers an air-suspension malfunction warning on 2021-2024 RS6 Avant vehicles when the suspension controller stores C1260F0 or U112100 with symptom code 262400. The bulletin is about communication with the compressor-control module, not proof that an air strut leaks or that the compressor has been overworked.',
      solution:
        'Have the wiring and connector contacts between suspension controller J775 and compressor controller J1135 inspected first. Audi says to clear a first passive or sporadic occurrence and release the vehicle. If the same passive fault returns a second time, or the fault is active or static after the wiring check, the bulletin directs replacement of J1135 under the applicable service procedure. Do not replace air struts, a compressor or an unverified aftermarket assembly solely from this warning card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: ['Air-suspension malfunction warning in the instrument cluster'],
      affectedSystems: [
        'air-suspension control module J775',
        'compressor control module J1135',
        'air-suspension wiring and connectors',
      ],
      dtcCodes: ['C1260F0', 'U112100'],
      citations: [citations.airSuspensionControl],
      summary:
        'Replaced an unsupported strut-leak and compressor-overwork aggregation with Audi exact 2021-2024 compressor-control diagnostic decision; removed 2020 and 2025-2026, fixed costs, an unverified part number and two commerce claims with four URLs.',
    },
  },
  'audi-rs6-rs7-carbon-buildup-2013': {
    disposition: 'remove',
    decision:
      'Archive this overlapping 2013-2023 RS6/RS7 carbon aggregation because the same RS6 model already has a current, narrower deposit-diagnosis record. The seed also combines non-USA C7 RS6 years with C8 years and asserts severity, damage, fixed intervals, fixed costs and prevention advice that the cited YouTube video does not establish.',
    evidence: [
      {
        label:
          'Current Audi TSB 2075530/1 supplies one bounded symptom-triggered TFSI deposit record, making this broader overlapping RS6 carbon card redundant',
        url: citations.tfsiWalnutBlast.url,
      },
    ],
    after: {
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      trims: [],
      engines: ['4.0T V8'],
      category: 'engine',
      title: 'Archived Duplicate RS6 4.0T Carbon-Buildup Aggregation',
      description:
        'This seeded card overlapped the audited RS6 inlet-deposit record and mixed non-USA C7 model years with C8 model years. Its severe-defect, valve-damage and accelerated-accumulation claims were not established by an exact primary source.',
      solution:
        'Use the published RS6 cold-start-misfire and confirmed-inlet-deposit card for the current Audi diagnostic path. This duplicate record is archived and must not direct a repair or purchase.',
      severity: 'medium',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: ['TFSI inlet ports', 'TFSI inlet valves'],
      dtcCodes: [],
      citations: [citations.tfsiWalnutBlast],
      summary:
        'Archived an overlapping cross-generation carbon aggregation; removed one commerce claim and URL, a generic video citation, fixed intervals and costs, valve-damage and prevention assertions plus four unsupported tips.',
    },
  },
  'audi-rs6-rs7-motor-mounts-2013': {
    disposition: 'remove',
    decision:
      'Archive the premature-mount aggregation because its generic forum root does not establish an RS6 defect, 40,000-80,000-mile rate, torque causation, downstream damage, fixed cost or preventive replacement. The exact Audi 4.0T active-mount bulletin found during review names S6, S7, RS7, A8 and S8 but not RS6, so it cannot be generalized into this RS6 record.',
    evidence: [
      {
        label:
          'Audi TSB 2036392/5 defines a software and basic-setting vibration path for named 2013-2015 4.0T models but does not include RS6, preventing unsupported model transfer',
        url: citations.rs7MountScope.url,
      },
    ],
    after: {
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      trims: [],
      engines: ['4.0T V8'],
      category: 'other',
      title: 'Archived RS6 Premature Motor-Mount Aggregation',
      description:
        'The seeded card used a generic forum root and platform-transfer assumptions to claim premature RS6 mount failure, a fixed mileage range and downstream damage. The exact Audi active-mount bulletin located during review does not list RS6, so the record lacks model-specific primary-source support.',
      solution:
        'Diagnose vibration or clunking on the exact vehicle instead of replacing mounts from this archived aggregation. Verify the VIN, mount type, stored faults and current Audi service information before ordering parts.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: ['engine mounts', 'driveline'],
      dtcCodes: [],
      citations: [citations.rs7MountScope],
      summary:
        'Archived an unsupported RS6 motor-mount aggregation after the exact Audi 4.0T bulletin excluded RS6; removed fixed mileage and cost claims, downstream-damage and preventive-replacement advice plus three commerce claims with five URLs.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2021 RS6 Passenger-Airbag Instrument-Panel Recall 70i2 / NHTSA 21V159 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V159-7020.PDF',
    ],
  },
  {
    title:
      '2021 RS6 Seat-Belt Automatic-Locking-Retractor Recall / NHTSA 21V606 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V606-2781.PDF',
    ],
  },
  {
    title:
      '2021 RS6 Fuel-Level-Sender Recall / NHTSA 22V155 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V155-7314.PDF',
    ],
  },
  {
    title:
      '2021 RS6 Virtual-Cockpit Black-Screen Recall / NHTSA 25V201 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V201-4645.PDF',
    ],
  },
];

module.exports = {
  label: 'Audi RS6',
  make: 'Audi',
  model: 'RS6',
  batchId: 'audi-rs6-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '01a8f11f11856ee24e9662b8b8e42c4d504384bb50341acd4a12c2309fb0d5cc',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-rs6/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'rs6_blind_review:no-blocker',
    edge: 'rs6_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-rs6-carbon-buildup-2020',
    'audi-rs6-air-suspension-2020',
    'audi-rs6-rs7-carbon-buildup-2013',
    'audi-rs6-rs7-motor-mounts-2013',
  ],
  records,
  expectedPerRecord: {
    'audi-rs6-carbon-buildup-2020': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=034Motorsport%20034-101-1030%20catch%20can%204.0T%20RS6&tag=au7o-20',
      ],
      claimClicks: 1,
      recordClicks: 1,
      priorityClicks: 1,
    },
    'audi-rs6-air-suspension-2020': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=4K0616039M&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4K0616039M',
        'https://www.ebay.com/sch/i.html?_nkw=4K0616039M',
        'https://www.amazon.com/s?k=Arnott%20AS-3340%20air%20strut%20RS6&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs6-rs7-carbon-buildup-2013': {
      claimIds: ['communityRecommendations:2'],
      urls: [
        'https://www.amazon.com/s?k=Mishimoto%20MMBCC-UNI-BK&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs6-rs7-motor-mounts-2013': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=4H0199256T&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4H0199256T',
        'https://www.ebay.com/sch/i.html?_nkw=4H0199256T',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20Engine%20Mount%20(4.0T%20V8)&tag=au7o-20',
        'https://www.amazon.com/s?k=034%20Motorsport%20Density-Line%20Motor%20Mounts&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 7,
    urlCount: 11,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 2,
    remove: 2,
  },
  expectedPublished: 2,
  expectedArchived: 2,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const carbon = issues.find(
      (issue) => issue.id === 'audi-rs6-carbon-buildup-2020',
    ).after;
    const suspension = issues.find(
      (issue) => issue.id === 'audi-rs6-air-suspension-2020',
    ).after;
    const duplicate = issues.find(
      (issue) => issue.id === 'audi-rs6-rs7-carbon-buildup-2013',
    ).after;
    const mounts = issues.find(
      (issue) => issue.id === 'audi-rs6-rs7-motor-mounts-2013',
    ).after;
    if (
      JSON.stringify(carbon.years) !==
        JSON.stringify([2021, 2022, 2023, 2024]) ||
      carbon.status !== 'published' ||
      carbon.dtcCodes.length !== 0 ||
      JSON.stringify(suspension.years) !==
        JSON.stringify([2021, 2022, 2023, 2024]) ||
      suspension.status !== 'published' ||
      JSON.stringify(suspension.dtcCodes) !==
        JSON.stringify(['C1260F0', 'U112100']) ||
      suspension.citations.map((citation) => citation.url).join('|') !==
        citations.airSuspensionControl.url ||
      duplicate.status !== 'archived' ||
      mounts.status !== 'archived'
    ) {
      throw new Error(
        'Audi RS6 deposit, suspension-control or archive after-state scope drifted.',
      );
    }
  },
};
