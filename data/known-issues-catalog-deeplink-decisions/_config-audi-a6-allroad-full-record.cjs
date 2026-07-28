const cite = (type, title, url) => ({ type, title, url });

const citations = {
  starterAlternatorAction: cite(
    'manual',
    'Audi Service Action 27BQ - 48V Belt Starter Alternator',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012543-0001.pdf',
  ),
  starterAlternatorDiagnosis: cite(
    'tsb',
    'Audi TSB 2058831/15 - 48V Starter-Alternator U046900 Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011249-0001.pdf',
  ),
  canSensorDiagnosis: cite(
    'tsb',
    'Audi TSB 2073284/3 - U046900 CAN and Sensor Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11005866-0001.pdf',
  ),
  batteryLowSoc: cite(
    'tsb',
    'Audi TSB 2067906/5 - 48V Battery Low-State-of-Charge Recharge Procedure',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253253-0002.pdf',
  ),
};

const records = {
  'audi-a6-allroad-48v-mild-hybrid-2020': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported 2020-2026 belt-alternator-starter failure aggregation with current Audi Service Action 27BQ for VIN-qualified 2020-2024 A6 allroad vehicles. Preserve the action as a VIN-first dealer path rather than a universal defect or parts-shopping instruction. Remove 2025-2026, five overbroad DTCs, fixed failure/cost claims, owner-report telemetry and all eight commerce claims with ten URLs.',
    evidence: [
      {
        label:
          'Audi Service Action 27BQ identifies 2020-2024 A6 allroad vehicles in its USA/Canada applicability table and makes the open campaign shown for the VIN in Elsa the controlling eligibility check',
        url: citations.starterAlternatorAction.url,
      },
      {
        label:
          'Current Audi TSB 2058831/15 requires the ODIS C29 test plan and says starter-alternator replacement is supported only by its defined B200096 faulty-control-module result',
        url: citations.starterAlternatorDiagnosis.url,
      },
      {
        label:
          'Audi TSB 2073284/3 documents U046900 cases caused by sensor or CAN faults and explicitly warns that starter-alternator replacement will not correct that path',
        url: citations.canSensorDiagnosis.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2020-2024 A6 allroad Starter-Alternator Service Action 27BQ - Check VIN',
      description:
        'Audi Service Action 27BQ includes certain 2020-2024 A6 allroad vehicles equipped with a 48V belt starter-alternator. Audi states that an affected unit can inhibit the start-stop function and increase emissions while the vehicle is stopped, while emissions remain within legal limits. Model year alone does not establish eligibility: the VIN must show 27BQ open in Audi Elsa. A general electrical-system warning or a stored communication code does not by itself prove that the starter-alternator has failed.',
      solution:
        'Check the VIN and current open-action status with an Audi dealer. If 27BQ is open, Audi directs the dealer to replace the 48V belt starter-alternator at no cost under the service action. If the action is not open, use Audi guided diagnostics before replacing parts: TSB 2058831/15 ties replacement to its defined C29/B200096 test result, while TSB 2073284/3 identifies sensor and CAN faults for which starter-alternator replacement will not fix the concern. Do not buy a starter, alternator, 12V battery or charger from this campaign card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Start-stop function unavailable on a VIN with Service Action 27BQ open',
        'Electrical-system warning requiring Audi guided diagnosis',
      ],
      affectedSystems: [
        '48V belt starter-alternator',
        '48V mild-hybrid electrical system',
        'start-stop system',
      ],
      dtcCodes: [],
      citations: [
        citations.starterAlternatorAction,
        citations.starterAlternatorDiagnosis,
        citations.canSensorDiagnosis,
      ],
      summary:
        'Replaced a broad 2020-2026 starter-alternator failure and parts-shopping narrative with VIN-first Audi Service Action 27BQ for 2020-2024 vehicles and current guided-diagnosis limits; removed five overbroad DTCs, unsupported failure, cost and owner-report claims plus eight commerce claims and ten URLs.',
    },
  },
  'audi-a6-allroad-mild-hybrid-battery-2020': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported 2020-2025 battery-degradation aggregation with Audi TSB 2067906/5 for the exact low-state-of-charge protection and recharge decision on 2020-2024 vehicles. The bulletin says a protected 48V battery at 5%-15% state of charge must be recharged through the 12V system rather than replaced and that P0B2900 alone is not a replacement basis. Remove 2025, three unrelated DTCs, degradation/cost claims and all seven commerce claims with nine URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2067906/5 covers all 2017-2024 Audi vehicles and defines P0A7D00 low-state-of-charge protection, the 5%-15% recharge path, the below-5% or guided-fault replacement boundary and the non-replacement meaning of P0B2900',
        url: citations.batteryLowSoc.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2020-2024 A6 allroad 48V Battery Low-SoC Protection - Recharge Before Replacement',
      description:
        'Audi TSB 2067906/5 explains that the 48V battery can enter low-state-of-charge protection and open its internal relays. P0A7D00 can accompany this condition. When measured 48V state of charge is 5%-15%, Audi directs a controlled recharge through the 12V electrical system and says the 48V battery must not be replaced for that condition. P0B2900 alone is also not a reason to replace the battery. This is a guided service procedure, not proof of battery degradation.',
      solution:
        'Have an Audi-trained technician measure both battery states of charge and follow the current guided procedure. For a 48V battery at 5%-15%, TSB 2067906/5 requires an approved high-capacity 12V charger and the ODIS charging-contactor test plan; it is not a consumer battery-maintainer procedure. Audi permits replacement only when the 48V state of charge is below 5% or guided fault finding directs replacement. Do not buy a 48V battery, 12V battery, charger, tape, wire loom or connector kit from this diagnostic card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        '48V battery state of charge at 5%-15%',
        '48V low-state-of-charge protection active',
      ],
      affectedSystems: [
        '48V lithium-ion battery',
        '12V charging support system',
        '48V charging contactor',
      ],
      dtcCodes: ['P0A7D00', 'P0B2900'],
      citations: [citations.batteryLowSoc],
      summary:
        'Replaced an unsupported battery-degradation and replacement narrative with Audi’s exact low-state-of-charge protection decision for 2020-2024 vehicles; removed 2025, three unrelated DTCs, unsupported degradation and cost claims plus seven commerce claims and nine URLs.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2020-2021 A6 allroad Passenger-Airbag Instrument-Panel Recall 70i2 / NHTSA 21V159 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V159-4098.PDF',
    ],
  },
  {
    title:
      '2020-2021 A6 allroad Rear-Axle Lock-Nut Recall 42L1 with 42L5 Alignment Follow-Up - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V295-6898.PDF',
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V034-4804.PDF',
    ],
  },
  {
    title:
      '2021 A6 allroad Seat-Belt Automatic-Locking-Retractor Recall 69CS / NHTSA 21V606 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V606-2781.PDF',
    ],
  },
  {
    title:
      '2020-2021 A6 allroad Fuel-Level-Sender Recall 20DN / NHTSA 22V155 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V155-1562.PDF',
    ],
  },
  {
    title:
      '2020-2022 A6 allroad Gateway-Control-Module Liquid-Ingress Recall 90V2 / NHTSA 22V861 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V861-2610.PDF',
    ],
  },
  {
    title:
      '2021 A6 allroad Brake-Fluid-Reservoir-Cap Recall 47T9 / NHTSA 23V601 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V601-9768.PDF',
    ],
  },
  {
    title:
      '2021 A6 allroad Virtual-Cockpit Black-Screen Recall 90VC / NHTSA 25V201 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V201-4645.PDF',
    ],
  },
  {
    title:
      '2020-2023 A6 allroad U046900/34763 CAN and Sensor Diagnosis - TSB 2073284/3',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2024/MC-11005866-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi A6 allroad',
  make: 'Audi',
  model: 'A6 allroad',
  batchId: 'audi-a6-allroad-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'bd5cd6ec1962b0c7cb668c44401c7e558488d1f184601e583639a6706d1a132a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a6-allroad/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a6_allroad_blind_review:no-blocker',
    edge: 'a6_allroad_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-a6-allroad-48v-mild-hybrid-2020',
    'audi-a6-allroad-mild-hybrid-battery-2020',
  ],
  records,
  expectedPerRecord: {
    'audi-a6-allroad-48v-mild-hybrid-2020': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
        'communityRecommendations:7',
        'communityRecommendations:8',
        'communityRecommendations:9',
      ],
      urls: [
        'https://www.amazon.com/s?k=4N0903028R&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4N0903028R',
        'https://www.ebay.com/sch/i.html?_nkw=4N0903028R',
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Denso%20Remanufactured%20Alternator%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Remy%20Premium%20Remanufactured%20Alternator%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Denso%20Starter%20Motor%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Remy%20Remanufactured%20Starter%20Motor%20Audi%20A6%20allroad&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-a6-allroad-mild-hybrid-battery-2020': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
      ],
      urls: [
        'https://www.amazon.com/s?k=4N0915105F&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4N0915105F',
        'https://www.ebay.com/sch/i.html?_nkw=4N0915105F',
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=3M%20Super%2033%2B%20Vinyl%20Electrical%20Tape%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=DEI%20Split%20Wire%20Loom%20Tubing%20Audi%20A6%20allroad&tag=au7o-20',
        'https://www.amazon.com/s?k=Molex%20Automotive%20Terminal%20Connector%20Kit%20Audi%20A6%20allroad&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 15,
    urlCount: 19,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 1,
    'diagnosis-hold': 1,
  },
  expectedPublished: 2,
  expectedArchived: 0,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const serviceAction = issues.find(
      (issue) => issue.id === 'audi-a6-allroad-48v-mild-hybrid-2020',
    ).after;
    const battery = issues.find(
      (issue) =>
        issue.id === 'audi-a6-allroad-mild-hybrid-battery-2020',
    ).after;
    if (
      JSON.stringify(serviceAction.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024]) ||
      serviceAction.status !== 'published' ||
      serviceAction.severity !== 'medium' ||
      serviceAction.dtcCodes.length !== 0 ||
      serviceAction.citations.map((citation) => citation.url).join('|') !==
        [
          citations.starterAlternatorAction.url,
          citations.starterAlternatorDiagnosis.url,
          citations.canSensorDiagnosis.url,
        ].join('|') ||
      JSON.stringify(battery.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024]) ||
      battery.status !== 'published' ||
      JSON.stringify(battery.dtcCodes) !==
        JSON.stringify(['P0A7D00', 'P0B2900']) ||
      battery.citations.map((citation) => citation.url).join('|') !==
        citations.batteryLowSoc.url
    ) {
      throw new Error(
        'Audi A6 allroad VIN-first 27BQ or low-state-of-charge after-state scope drifted.',
      );
    }
  },
};
