const cite = (type, title, url) => ({ type, title, url });

const citations = {
  airSuspension: cite(
    'tsb',
    'Audi TSB 2059363/6 - Air Suspension Warning with C1260F0 or U112100',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002225-0001.pdf',
  ),
  coolantSender: cite(
    'tsb',
    'Audi TSB 2062951/4 - Red Coolant Warning and G407 Temperature-Sender Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012481-0001.pdf',
  ),
  brakeSqueal: cite(
    'tsb',
    'Audi TSB 2062052/1 - RS Q8 Front Steel-Brake Squeal',
    'https://static.nhtsa.gov/odi/tsbs/2021/MC-10186555-0001.pdf',
  ),
};

const archivedSuspension = (title, description, summary) => ({
  years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  trims: [],
  engines: [],
  category: 'suspension',
  title,
  description,
  solution:
    'Do not use this aggregate row to select struts, air springs, a compressor or a conversion kit. Use the retained Audi-bulletin card only when the vehicle has the exact C1260F0 or U112100 symptom-262400 communication condition. Sagging, hissing, ride-height or ride-quality complaints outside that condition require VIN-, equipment- and component-specific diagnosis.',
  severity: 'low',
  confidence: 'low',
  source: 'manual',
  symptoms: [],
  affectedSystems: [],
  dtcCodes: [],
  citations: [citations.airSuspension],
  summary,
});

const records = {
  'audi-rs-q8-air-suspension-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the generic compressor-failure, air-spring, weight, cost and conversion-kit narrative with current Audi TSB 2059363/6. The supported condition is a J775/J1135 communication fault on air-suspension-equipped 2020-2025 RS Q8 vehicles. Remove all three commerce claims and five search/category URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 explicitly lists 2020-2025 RS Q8 vehicles and defines the C1260F0/U112100 symptom-262400 wiring, first-passive, repeated-passive and active/static J1135 branches',
        url: citations.airSuspension.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      trims: [],
      engines: [],
      category: 'suspension',
      title:
        '2020-2025 RS Q8 Air-Suspension J1135 Communication Fault - TSB 2059363/6',
      description:
        'Audi TSB 2059363/6 applies to air-suspension-equipped 2020-2025 RS Q8 vehicles when the instrument cluster reports an air-suspension malfunction and suspension control unit J775 stores C1260F0 for no communication or U112100 for a missing message, both with symptom code 262400. The bulletin identifies communication with compressor-control unit J1135; it does not establish universal air-strut, air-spring, compressor or complete-system wear.',
      solution:
        'Inspect the wiring and connector contacts between J775 and J1135 before replacing a component. For a first passive or sporadic occurrence, clear the fault and release the vehicle. If the same passive fault returns a second time, or the fault is active or static after wiring inspection, Audi directs replacement of J1135 under current repair and parts information. Do not buy struts, springs, a compressor or a conversion kit solely from this warning.',
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
        'Replaced a generic compressor, spring and vehicle-weight aggregation with exact TSB 2059363/6 J775/J1135 diagnosis; removed 2026 scope, fixed costs and three commerce claims with five URLs.',
    },
  },
  'audi-rsq8-4.0t-coolant-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad turbo-coolant hose, pump, heat, mileage, cost and owner-maintenance aggregation with exact Audi TSB 2062951/4. Scope it to 2020 and early-production 2021 RS Q8 vehicles with the listed coolant warning and G407-related faults. Remove the unrelated coolant-hose commerce claim and URL.',
    evidence: [
      {
        label:
          'Audi TSB 2062951/4 explicitly lists all 2020 RS Q8 vehicles and early 2021 vehicles through chassis WUARRDF11MD011353, the red coolant warning, P218100/P017B00/P017C00/P017E00 and O-ring moisture damage at G407',
        url: citations.coolantSender.url,
      },
    ],
    after: {
      years: [2020, 2021],
      trims: [],
      engines: ['4.0T V8'],
      category: 'cooling',
      title:
        '2020-Early 2021 RS Q8 Red Coolant Warning - Check G407 per TSB 2062951/4',
      description:
        'Audi TSB 2062951/4 covers all 2020 RS Q8 vehicles and early-production 2021 vehicles through chassis WUARRDF11MD011353 when a red coolant warning appears and the engine controller stores P218100, P017B00, P017C00 or P017E00. Audi documents that a damaged or pinched O-ring can allow moisture to reach coolant temperature sender G407. This bounded sensor condition does not establish universal turbo-coolant hose, pump or heat-related failure.',
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
        'Replaced a universal turbo-coolant degradation narrative with exact 2020/early-2021 G407 warning and fault diagnosis; removed 2022-2026 scope, fixed mileage and cost assertions, owner repair guidance, one commerce claim and URL.',
    },
  },
  'audi-rsq8-air-suspension-2020': {
    disposition: 'remove',
    decision:
      'Archive this duplicate unsupported vehicle-weight, strut, compressor, mileage, cost and conversion aggregation. TSB 2059363/6 supports the separate retained J775/J1135 communication-fault record, not this universal component-failure row. Remove both commerce claims and four URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 supports the retained symptom-262400 communication diagnosis but does not establish the duplicate weight, component-life, fixed-cost or conversion narrative',
        url: citations.airSuspension.url,
      },
    ],
    after: archivedSuspension(
      'Archived - Duplicate Unsupported RS Q8 Air-Suspension Failure Aggregation',
      'The former row duplicated the retained RS Q8 air-suspension diagnosis card and combined alleged vehicle-weight stress, air-strut and compressor failure, fixed mileage and cost claims without an Audi source establishing one universal RS Q8 condition.',
      'Archived a duplicate unsupported RS Q8 air-suspension component aggregation; removed seeded owner telemetry, fixed mileage and cost claims plus two commerce claims and four URLs.',
    ),
  },
  'audi-rsq8-air-suspension-leak-2020': {
    disposition: 'remove',
    decision:
      'Archive this second duplicate unsupported sagging, leaking-spring, weight, strut, mileage, cost and conversion aggregation. The exact Audi bulletin supports only the separate retained J775/J1135 communication card. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 does not convert sagging or hissing into proof of the seeded universal leak, vehicle-weight, service-life or replacement narrative',
        url: citations.airSuspension.url,
      },
    ],
    after: archivedSuspension(
      'Archived - Duplicate Unsupported RS Q8 Air-Spring Leak Aggregation',
      'The former row used broad sagging and hissing symptoms to assert recurring air-spring leaks, vehicle-weight causation, fixed component life and generic replacements without exact Audi support. It also duplicated the retained RS Q8 J775/J1135 diagnosis card.',
      'Archived a second duplicate unsupported RS Q8 air-suspension leak aggregation; removed fixed life, cost and vehicle-weight assertions plus three commerce claims and five URLs.',
    ),
  },
  'audi-rsq8-brake-wear-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported premature-wear, vehicle-weight, mileage, cost and aftermarket-pad aggregation with the exact 2020-2021 RS Q8 steel-brake squeal condition in Audi TSB 2062052/1. Preserve only the warm-brake 7.3-kHz noise path and remove both commerce claims and four URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2062052/1 explicitly covers 2020-2021 RS Q8 vehicles with steel brakes, defines a 7.3-kHz front squeal while driving forward up to 40 mph with warm brakes, and specifies front-pad replacement plus bedding',
        url: citations.brakeSqueal.url,
      },
    ],
    after: {
      years: [2020, 2021],
      trims: [],
      engines: [],
      category: 'brakes',
      title:
        '2020-2021 RS Q8 Front Steel-Brake Squeal - TSB 2062052/1',
      description:
        'Audi TSB 2062052/1 covers 2020-2021 RS Q8 vehicles equipped with steel brakes when a roughly 7.3-kHz squeal comes from the front brakes while driving forward at up to 40 mph with warm brakes. This is a noise bulletin; it does not establish premature pad or rotor wear, a vehicle-weight failure, a fixed replacement interval or a generic aftermarket-pad remedy.',
      solution:
        'Confirm the frequency and operating conditions and inspect the discs for corrosion, grooves or glazing. When the bulletin applies, Audi directs replacement of the front pad set using current parts information followed by the specified bedding procedure. Do not perform ABS stops for bedding, and do not replace rotors or buy aftermarket pads solely from the prior wear narrative.',
      severity: 'low',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Approximately 7.3-kHz squeal from the front brakes',
        'Noise while driving forward up to 40 mph with warm brakes',
      ],
      affectedSystems: ['front steel-brake pads', 'front brake discs'],
      dtcCodes: [],
      citations: [citations.brakeSqueal],
      summary:
        'Replaced an unsupported premature brake-wear aggregation with exact 2020-2021 warm front steel-brake squeal guidance; removed 2022-2026 scope, seeded owner telemetry, fixed mileage and cost claims plus two commerce claims and four URLs.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2023-2024 RS Q8 Driver-Seat Side-Airbag Mount Recall 69GA / NHTSA 23V868',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V868-5357.PDF',
    ],
  },
  {
    title:
      '2020-2026 RS Q8 Rearview-Camera Software Recall 90TV / NHTSA 25V900',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
    ],
  },
  {
    title:
      '2020-2022 RS Q8 Front-End Creak during Steering or Load Change - TSB 2060304/6',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216010-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi RS Q8',
  make: 'Audi',
  model: 'RS Q8',
  batchId: 'audi-rs-q8-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'ae34db8a8ca46def02a5783fe23bde8353097b9dc89c6cc9c91112be3e7b05c3',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-rs-q8/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'rs_q8_blind_review:no-blocker',
    edge: 'rs_q8_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-rs-q8-air-suspension-2020',
    'audi-rsq8-4.0t-coolant-2020',
    'audi-rsq8-air-suspension-2020',
    'audi-rsq8-air-suspension-leak-2020',
    'audi-rsq8-brake-wear-2020',
  ],
  records,
  expectedPerRecord: {
    'audi-rs-q8-air-suspension-2020': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=4M0616005H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616005H',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616005H',
        'https://www.amazon.com/s?k=Arnott%20air%20spring%20Audi%20RS%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Strutmasters%20air%20suspension%20conversion%20Audi%20RS%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rsq8-4.0t-coolant-2020': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=Genuine%20Audi%204M0145735%20turbo%20coolant%20RS%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rsq8-air-suspension-2020': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=4M0616039AD&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616039AD',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616039AD',
        'https://www.amazon.com/s?k=Arnott%20AS-3350%20air%20strut%20RS%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rsq8-air-suspension-leak-2020': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=4M0616001AK&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616001AK',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616001AK',
        'https://www.amazon.com/s?k=Arnott%20air%20spring%20Audi%20RS%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Strutmasters%20air%20suspension%20conversion%20Audi%20RS%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rsq8-brake-wear-2020': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=4M8698151D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M8698151D',
        'https://www.ebay.com/sch/i.html?_nkw=4M8698151D',
        'https://www.amazon.com/s?k=Akebono%20EUR1894%20brake%20pads%20RS%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 11,
    urlCount: 19,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 3,
    remove: 2,
  },
  expectedPublished: 3,
  expectedArchived: 2,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const air = issues.find(
      (issue) => issue.id === 'audi-rs-q8-air-suspension-2020',
    ).after;
    const coolant = issues.find(
      (issue) => issue.id === 'audi-rsq8-4.0t-coolant-2020',
    ).after;
    const duplicate = issues.find(
      (issue) => issue.id === 'audi-rsq8-air-suspension-2020',
    ).after;
    const leak = issues.find(
      (issue) => issue.id === 'audi-rsq8-air-suspension-leak-2020',
    ).after;
    const brakes = issues.find(
      (issue) => issue.id === 'audi-rsq8-brake-wear-2020',
    ).after;
    if (
      JSON.stringify(air.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024, 2025]) ||
      air.status !== 'published' ||
      JSON.stringify(air.dtcCodes) !==
        JSON.stringify(['C1260F0', 'U112100']) ||
      JSON.stringify(coolant.years) !== JSON.stringify([2020, 2021]) ||
      coolant.status !== 'published' ||
      JSON.stringify(coolant.dtcCodes) !==
        JSON.stringify(['P218100', 'P017B00', 'P017C00', 'P017E00']) ||
      duplicate.status !== 'archived' ||
      leak.status !== 'archived' ||
      JSON.stringify(brakes.years) !== JSON.stringify([2020, 2021]) ||
      brakes.status !== 'published' ||
      brakes.citations[0].url !== citations.brakeSqueal.url
    ) {
      throw new Error(
        'Audi RS Q8 suspension, coolant, brake or archive after-state scope drifted.',
      );
    }
  },
};
