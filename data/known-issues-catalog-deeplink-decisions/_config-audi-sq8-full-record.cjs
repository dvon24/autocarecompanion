const cite = (type, title, url) => ({ type, title, url });

const citations = {
  airSuspension: cite(
    'tsb',
    'Audi TSB 2059363/6 - Air Suspension Warning with C1260F0 or U112100',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002225-0001.pdf',
  ),
  airbagRecall: cite(
    'recall',
    'NHTSA 23V868 / Audi 69GA - Driver-Seat Side-Airbag Mount Recall',
    'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V868-5357.PDF',
  ),
  cameraRecall: cite(
    'recall',
    'NHTSA 25V900 / Audi 90TV - Rearview Camera Software Recall',
    'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
  ),
  coolantSender: cite(
    'tsb',
    'Audi TSB 2062951/4 - Red Coolant Warning and G407 Temperature-Sender Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012481-0001.pdf',
  ),
};

const records = {
  'audi-sq8-air-susp-compressor-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported strut/compressor wear, vehicle-weight, mileage, cost and aftermarket-replacement narrative with current Audi TSB 2059363/6. The supported condition is a J775/J1135 communication fault on air-suspension-equipped 2020-2025 SQ8 vehicles. Remove both commerce claims and four URLs, including the clicked recommendation.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 explicitly lists 2020-2025 SQ8 vehicles and defines the C1260F0/U112100 symptom-262400 wiring, first-passive, repeated-passive and active/static J1135 branches',
        url: citations.airSuspension.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      trims: [],
      engines: [],
      category: 'suspension',
      title:
        '2020-2025 SQ8 Air-Suspension J1135 Communication Fault - TSB 2059363/6',
      description:
        'Audi TSB 2059363/6 applies to air-suspension-equipped 2020-2025 SQ8 vehicles when the instrument cluster reports an air-suspension malfunction and suspension control unit J775 stores C1260F0 for no communication or U112100 for a missing message, both with symptom code 262400. The bulletin identifies communication with compressor-control unit J1135; it does not establish universal air-strut, air-spring, compressor or complete-system wear.',
      solution:
        'Inspect the wiring and connector contacts between J775 and J1135 before replacing a component. For a first passive or sporadic occurrence, clear the fault and release the vehicle. If the same passive fault returns a second time, or the fault is active or static after wiring inspection, Audi directs replacement of J1135 under current repair and parts information. Do not buy struts, springs or a compressor solely from this warning.',
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
      citations: [citations.airSuspension],
      summary:
        'Replaced a generic strut, compressor, weight and service-life aggregation with exact TSB 2059363/6 J775/J1135 diagnosis; removed seeded owner telemetry, fixed costs, two commerce claims, four URLs, one clicked claim, one record click and one priority click.',
    },
  },
  'audi-sq8-air-suspension-2020': {
    disposition: 'remove',
    decision:
      'Archive this duplicate unsupported air-spring, compressor, valve-block, sensor, vehicle-weight, cost and conversion aggregation. Current Audi TSB 2059363/6 supports the separate retained J775/J1135 communication-fault record, not this universal component-failure row. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 supports the retained symptom-262400 communication diagnosis but does not establish the duplicate multi-component, fixed-life, fixed-cost or conversion narrative',
        url: citations.airSuspension.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: ['4.0T V8'],
      category: 'suspension',
      title:
        'Archived - Duplicate Unsupported SQ8 Air-Suspension Failure Aggregation',
      description:
        'The former row duplicated the retained SQ8 air-suspension diagnosis card and combined alleged air-spring, compressor, valve-block and sensor failures with vehicle-weight, climate, fixed service-life, cost and conversion claims without an Audi source establishing one universal SQ8 condition.',
      solution:
        'Do not use this aggregate row to select struts, air springs, a compressor, valve block, sensor or conversion kit. Use the retained Audi-bulletin card only when the vehicle has the exact C1260F0 or U112100 symptom-262400 communication condition. Other ride-height or ride-quality complaints require VIN-, equipment- and component-specific diagnosis.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [citations.airSuspension],
      summary:
        'Archived a duplicate unsupported SQ8 multi-component air-suspension aggregation; removed fixed life, cost, climate and vehicle-weight assertions plus three commerce claims and five URLs.',
    },
  },
  'audi-sq8-airbag-mount-2023': {
    disposition: 'recall-dealer',
    decision:
      'Retain the safety recall but replace generic repair and unrelated clock-spring guidance with VIN-first NHTSA 23V868 / Audi 69GA. Scope it to VIN-selected 2023-2024 SQ8 vehicles whose driver-seat side airbag may have been mounted incorrectly, and remove the unrelated commerce claim and URL.',
    evidence: [
      {
        label:
          'NHTSA 23V868 explicitly identifies 109 2023-2024 SQ8 vehicles, the improperly mounted driver-seat side airbag, lack of warning, crash injury risk and inspect/reinstall remedy without parts replacement',
        url: citations.airbagRecall.url,
      },
    ],
    after: {
      years: [2023, 2024],
      trims: [],
      engines: ['4.0T V8'],
      category: 'safety',
      title:
        '2023-2024 SQ8 Driver-Seat Side-Airbag Mount Recall 69GA (23V868)',
      description:
        'NHTSA recall 23V868 covers VIN-selected 2023-2024 Audi SQ8 vehicles that may have been assembled with the driver-seat side airbag mounted incorrectly in the seatback frame. The filing lists 109 SQ8 vehicles and states that there is no warning before a crash. If deployed from the wrong position, the side airbag may not perform as designed and can increase injury risk.',
      solution:
        'Check the VIN for open Audi recall 69GA and have an authorized dealer inspect the driver-seat side-airbag installation. If needed, the dealer will reinstall the airbag correctly; the recall filing says no parts are replaced. A clock spring or generic airbag part is not the recall remedy.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: ['No warning is expected before the recall remedy'],
      affectedSystems: [
        'driver-seat thorax side airbag',
        'driver-seatback airbag mounting',
      ],
      dtcCodes: [],
      citations: [citations.airbagRecall],
      summary:
        'Corrected the record to VIN-first 23V868 / 69GA, its exact 2023-2024 SQ8 population and inspect/reinstall remedy; removed generic repair claims plus one unrelated clock-spring commerce claim and URL.',
    },
  },
  'audi-sq8-mmi-mib3-freeze-2020': {
    disposition: 'recall-dealer',
    decision:
      'Replace the uncited MIB3 freeze, reboot, firmware and head-unit aggregation with VIN-first NHTSA 25V900 / Audi 90TV. The amended report explicitly covers certain 2020-2026 SQ8 vehicles whose installed parts and software meet the recall criteria. Remove the unrelated scan-tool claim and URL.',
    evidence: [
      {
        label:
          'The amended NHTSA 25V900 report explicitly lists 11,590 2020-2026 SQ8 vehicles, installed-parts/software eligibility, intermittent rearview-image failure, reversing crash risk and the more robust driver-assistance software remedy',
        url: citations.cameraRecall.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      trims: [],
      engines: ['4.0T V8'],
      category: 'safety',
      title: '2020-2026 SQ8 Rearview Camera Software Recall 90TV (25V900)',
      description:
        'Certain 2020-2026 SQ8 vehicles are included in NHTSA recall 25V900 / Audi 90TV because a software issue can prevent the rearview camera image from displaying. The amended filing lists 11,590 SQ8 vehicles, but eligibility depends on VIN and the installed parts and software rather than model year alone. A missing rearview image reduces visibility while reversing and increases crash risk.',
      solution:
        'Check the VIN for recall 25V900/90TV and contact an authorized Audi dealer. Dealers will install more robust driver-assistance software free of charge. Until repaired, use extra caution when reversing and do not treat a restart, bus sleep or temporary image recovery as completion of the recall. A generic scan tool or head-unit replacement is not the recall remedy.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Rearview camera image does not display',
        'One or more Top View camera images may fail sporadically',
        'Camera image may return after restart or bus sleep',
      ],
      affectedSystems: [
        'driver-assistance control-unit software',
        'rearview camera display',
        'Top View camera system',
      ],
      dtcCodes: [],
      citations: [citations.cameraRecall],
      summary:
        'Replaced the unsupported general MIB3-freeze aggregation with VIN-specific recall 25V900/90TV, exact SQ8 scope and free software remedy; removed reboot-rate, fixed-cost and head-unit claims plus one unrelated scan-tool commerce claim and URL.',
    },
  },
  'audi-sq8-turbo-coolant-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad turbo-coolant hose, pump, heat, mileage, cost and owner-maintenance aggregation with exact Audi TSB 2062951/4. Scope it to 2020 and early-production 2021 SQ8 vehicles with the listed coolant warning and G407-related faults. Remove the unrelated turbo-coolant commerce claim and URL.',
    evidence: [
      {
        label:
          'Audi TSB 2062951/4 explicitly lists all 2020 SQ8 vehicles and early 2021 vehicles through chassis WA1CWBF17MD010458, the red coolant warning, P218100/P017B00/P017C00/P017E00 and O-ring moisture damage at G407',
        url: citations.coolantSender.url,
      },
    ],
    after: {
      years: [2020, 2021],
      trims: [],
      engines: ['4.0T V8'],
      category: 'cooling',
      title:
        '2020-Early 2021 SQ8 Red Coolant Warning - Check G407 per TSB 2062951/4',
      description:
        'Audi TSB 2062951/4 covers all 2020 SQ8 vehicles and early-production 2021 vehicles through chassis WA1CWBF17MD010458 when a red coolant warning appears and the engine controller stores P218100, P017B00, P017C00 or P017E00. Audi documents that a damaged or pinched O-ring can allow moisture to reach coolant temperature sender G407. This bounded sensor condition does not establish universal turbo-coolant hose, pump or heat-related failure.',
      solution:
        'Have the vehicle checked with Audi Guided Fault Finding and inspect G407 and its O-ring. Replace G407 only if the O-ring is damaged or pinched and the diagnosis matches the bulletin; follow the related Audi diagnostic path if additional listed faults are stored. Do not replace turbo coolant hoses, pumps or other cooling parts from this card alone.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: ['Red coolant warning lamp'],
      affectedSystems: [
        'coolant temperature sender G407',
        'G407 sealing O-ring',
        'engine cooling-system diagnostics',
      ],
      dtcCodes: ['P218100', 'P017B00', 'P017C00', 'P017E00'],
      citations: [citations.coolantSender],
      summary:
        'Replaced a universal turbo-coolant degradation narrative with exact 2020/early-2021 G407 warning and fault diagnosis; removed 2022-2024 scope, seeded owner telemetry, fixed mileage and cost assertions, owner repair guidance, one commerce claim and URL.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2020-2022 SQ8 Front-End Creak during Steering or Load Change - TSB 2060304/6',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216010-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi SQ8',
  make: 'Audi',
  model: 'SQ8',
  batchId: 'audi-sq8-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'a0378c5e4b8b8318a65bdf68a5e901014eb8ee825a01a1771265b118319d86fa',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-sq8/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'sq8_blind_review:no-blocker',
    edge: 'sq8_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-sq8-air-susp-compressor-2020',
    'audi-sq8-air-suspension-2020',
    'audi-sq8-airbag-mount-2023',
    'audi-sq8-mmi-mib3-freeze-2020',
    'audi-sq8-turbo-coolant-2020',
  ],
  records,
  expectedPerRecord: {
    'audi-sq8-air-susp-compressor-2020': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=4M0616039AD&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616039AD',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616039AD',
        'https://www.amazon.com/s?k=Arnott%20AS-3348%20SQ8%20air%20strut&tag=au7o-20',
      ],
      claimClicks: 1,
      recordClicks: 1,
      priorityClicks: 1,
    },
    'audi-sq8-air-suspension-2020': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      urls: [
        'https://www.amazon.com/s?k=4M0616005H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616005H',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616005H',
        'https://www.amazon.com/s?k=Arnott%20air%20spring%20Audi%20SQ8&tag=au7o-20',
        'https://www.amazon.com/s?k=Strutmasters%20air%20suspension%20conversion%20Audi%20SQ8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-sq8-airbag-mount-2023': {
      claimIds: ['communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=Dorman%20clock%20spring&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-sq8-mmi-mib3-freeze-2020': {
      claimIds: ['communityRecommendations:2'],
      urls: [
        'https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20SQ8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-sq8-turbo-coolant-2020': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=Genuine%20Audi%204M8145735%20SQ8%20turbo%20coolant&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 12,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 2,
    remove: 1,
    'recall-dealer': 2,
  },
  expectedPublished: 4,
  expectedArchived: 1,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const air = issues.find(
      (issue) => issue.id === 'audi-sq8-air-susp-compressor-2020',
    ).after;
    const duplicate = issues.find(
      (issue) => issue.id === 'audi-sq8-air-suspension-2020',
    ).after;
    const airbag = issues.find(
      (issue) => issue.id === 'audi-sq8-airbag-mount-2023',
    ).after;
    const camera = issues.find(
      (issue) => issue.id === 'audi-sq8-mmi-mib3-freeze-2020',
    ).after;
    const coolant = issues.find(
      (issue) => issue.id === 'audi-sq8-turbo-coolant-2020',
    ).after;
    if (
      JSON.stringify(air.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024, 2025]) ||
      air.status !== 'published' ||
      JSON.stringify(air.dtcCodes) !==
        JSON.stringify(['C1260F0', 'U112100']) ||
      duplicate.status !== 'archived' ||
      JSON.stringify(airbag.years) !== JSON.stringify([2023, 2024]) ||
      airbag.status !== 'published' ||
      airbag.citations[0].url !== citations.airbagRecall.url ||
      JSON.stringify(camera.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024, 2025, 2026]) ||
      camera.status !== 'published' ||
      camera.citations[0].url !== citations.cameraRecall.url ||
      JSON.stringify(coolant.years) !== JSON.stringify([2020, 2021]) ||
      coolant.status !== 'published' ||
      JSON.stringify(coolant.dtcCodes) !==
        JSON.stringify(['P218100', 'P017B00', 'P017C00', 'P017E00'])
    ) {
      throw new Error(
        'Audi SQ8 suspension, airbag, camera, coolant or archive after-state scope drifted.',
      );
    }
  },
};
