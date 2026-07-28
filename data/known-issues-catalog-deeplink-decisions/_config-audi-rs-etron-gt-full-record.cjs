const cite = (type, title, url) => ({ type, title, url });

const citations = {
  batteryRecall: cite(
    'recall',
    'NHTSA 24V726 / Audi 931A-931B - High-Voltage Battery Module Recall',
    'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V726-6852.PDF',
  ),
  brakeRecall: cite(
    'recall',
    'Audi Safety Recall 47UP / NHTSA 24V465 - Front Axle Brake Hoses',
    'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V465-1554.pdf',
  ),
  chargingUpdate: cite(
    'manual',
    'Audi Customer Satisfaction Package 91VT - e-tron GT Software Update Criteria',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009982-0001.pdf',
  ),
  connectTsb: cite(
    'tsb',
    'Audi TSB 2068824/2 - Audi connect Inoperative after Campaign 91DZ',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242957-0001.pdf',
  ),
  tirePressureRecall: cite(
    'recall',
    'NHTSA 22V085 - Tire-Pressure Manual Correction Recall',
    'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V085-5703.PDF',
  ),
};

const records = {
  'audi-rs-etron-gt-battery-short-2022': {
    disposition: 'recall-dealer',
    decision:
      'Replace the multi-campaign battery-fire aggregation and universal charging instruction with current NHTSA 24V726 / Audi 931A-931B. Scope the record to VIN-selected 2022-2024 RS e-tron GT vehicles with potentially suspect high-voltage battery modules and remove all six unrelated 12V-battery, relay, meter and portable-charger commerce claims and URLs.',
    evidence: [
      {
        label:
          'NHTSA 24V726 explicitly identifies 1,519 2022-2024 RS e-tron GT vehicles, the internal-short-circuit risk, lack of warning, online or dealer monitoring, final onboard diagnostic software and free replacement of anomalous modules',
        url: citations.batteryRecall.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2022-2024 RS e-tron GT High-Voltage Battery Recall 931A/931B (24V726)',
      description:
        'NHTSA recall 24V726 covers VIN-selected 2022-2024 Audi RS e-tron GT vehicles equipped with potentially suspect high-voltage battery modules. Production issues can permit an internal cell short circuit and increase the risk of a thermal event or fire. The filing lists 1,519 RS e-tron GT vehicles and states that the original condition may provide no warning. Audi campaigns 931A and 931B replace the earlier 93VM/93VN approach with continuing battery-data monitoring and a final onboard diagnostic software remedy.',
      solution:
        'Check the VIN for open Audi campaign 931A or 931B and complete the authorized dealer remedy. Under 931A, enrolled vehicles can be monitored through online battery data; Audi contacts owners if a module appears critical. Under 931B, the dealer performs diagnostic procedures until the final monitoring software is installed. Audi installs the onboard diagnostic software and replaces affected battery modules at no cost when anomalies are identified. Follow any vehicle- or dealer-specific 80-percent charging instruction; the filing does not direct every 931A vehicle to use that limit.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'No advance warning may occur before the recall remedy',
        'Battery-module warning after monitoring software detects an anomaly',
      ],
      affectedSystems: [
        'high-voltage battery cell block modules',
        'high-voltage battery monitoring software',
      ],
      dtcCodes: [],
      citations: [citations.batteryRecall],
      summary:
        'Replaced the earlier multi-campaign battery narrative with current VIN-first 24V726 / 931A-931B scope and remedy; removed unsupported universal charging and emergency instructions plus six unrelated commerce claims and URLs.',
    },
  },
  'audi-rs-etron-gt-brake-hose-2022': {
    disposition: 'recall-dealer',
    decision:
      'Retain the safety issue but replace the partly unsupported narrative and one-sided retail repair with VIN-first Audi 47UP / NHTSA 24V465. The campaign explicitly includes the RS e-tron GT and requires both front brake hoses and holders, with exact hose variants controlled by campaign criteria. Remove all three commerce claims and five search/category URLs.',
    evidence: [
      {
        label:
          'Audi 47UP explicitly lists 2,642 USA 2022-2024 RS e-tron GT vehicles and defines the front-hose tear and leak risk, warning condition, VIN gate, both-side hose/holder remedy and criteria-specific part variants',
        url: citations.brakeRecall.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'brakes',
      title:
        '2022-2024 RS e-tron GT Front Brake-Hose Recall 47UP (24V465)',
      description:
        'Audi safety recall 47UP covers VIN-selected 2022-2024 RS e-tron GT vehicles. Over time, tears can develop in the front axle brake hoses, allowing brake-fluid loss and possible brake-circuit failure. Audi states that a failed circuit can produce longer pedal travel, reduced braking capability and longer stopping distance. The correct hose suffix is campaign-criterion-specific, and the recall repair covers both front sides and their holders.',
      solution:
        'Check the VIN for an open 47UP action and have an authorized Audi dealer replace both front brake hoses and holders free of charge. If pedal travel increases or the vehicle displays a warning related to reduced brake fluid, contact an Audi dealer for diagnosis without delay. Do not buy a single hose or substitute generic brake lines from the prior links; the campaign controls the complete criteria-specific repair.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Longer brake-pedal travel',
        'Brake-fluid quantity warning',
        'Reduced braking capability',
        'Longer stopping distance',
      ],
      affectedSystems: [
        'left and right front flexible brake hoses',
        'front brake-hose holders',
        'hydraulic brake circuit',
      ],
      dtcCodes: [],
      citations: [citations.brakeRecall],
      summary:
        'Corrected the record to VIN-first 47UP / 24V465 and its complete both-side, criterion-specific dealer remedy; removed unsupported performance-use claims, three commerce claims and five search/category URLs.',
    },
  },
  'audi-rs-etron-gt-charging-port-2022': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the generic CCS communication, compatibility, cold-weather and charging-port-module failure aggregation with the exact Audi 91VT software criteria. Preserve only the criterion-specific red-LED/charging-abort or no-fast-charging path, keep eligibility action-screen-first and remove the unsupported charging-port retail claim and URL.',
    evidence: [
      {
        label:
          'Audi 91VT explicitly lists 2022-2024 RS e-tron GT vehicles and defines vehicle-specific software criteria, red charging LED or charging abort/no-fast-charging conditions and the high-voltage battery control-module update',
        url: citations.chargingUpdate.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2022-2024 RS e-tron GT Red Charging LED or Fast-Charging Abort - Audi 91VT',
      description:
        'Audi customer-satisfaction package 91VT applies only when the vehicle is assigned an eligible action criterion. For the charging-related criteria, Audi describes an unauthorized turtle indicator while the high-voltage system is not ready, a charging-duration loop below 100 percent, a charging abort with a red LED, or fast charging no longer being possible. The source identifies a software condition; it does not support a universal CCS communication defect, cold-weather incompatibility, port-lid failure or a failed charging-port module.',
      solution:
        'Have an Audi dealer check the VIN and assigned 91VT criterion in the campaign/action system. For the charging-related criteria, the authorized remedy updates the high-voltage battery control-module software, with the convenience-system control module also updated where the assigned criterion requires it. Diagnose charging failures outside that exact campaign branch rather than replacing the charging socket or module from symptoms alone.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Charging abort with red charging LED',
        'Fast charging unavailable',
        'Charging-duration loop below 100 percent',
        'Turtle indicator while the high-voltage system is not ready',
      ],
      affectedSystems: [
        'high-voltage battery control-module software',
        'convenience-system control-module software when criterion-specific',
      ],
      dtcCodes: [],
      citations: [citations.chargingUpdate],
      summary:
        'Replaced the generic charging-port failure aggregation with the exact VIN- and criterion-gated 91VT software path; removed unsupported compatibility, cold-weather, port-lid and hardware-replacement claims plus one commerce claim and URL.',
    },
  },
  'audi-rs-etron-gt-software-2022': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad MIB3 crash, OTA, CarPlay, navigation, climate and driver-profile aggregation with Audi TSB 2068824/2. Scope it to 2022 RS e-tron GT vehicles whose Audi connect services stop after campaign 91DZ and whose SOS LED is red or off. Remove the impossible retail software-update claim and URL.',
    evidence: [
      {
        label:
          'Audi TSB 2068824/2 explicitly lists the 2022 RS e-tron GT and defines the post-91DZ Audi connect condition, early-production backend coding cause and ODIS SVM Check Module Configuration remedy',
        url: citations.connectTsb.url,
      },
    ],
    after: {
      years: [2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2022 RS e-tron GT Audi connect Inoperative after 91DZ - TSB 2068824/2',
      description:
        'Audi TSB 2068824/2 applies to 2022 RS e-tron GT vehicles when Audi connect services in the MMI and myAudi app stop working after campaign 91DZ and the SOS button LED is red or off. Audi identifies an incorrect coding container for the J533 data-bus diagnostic interface on early-built vehicles, not a universal infotainment, OTA, CarPlay, navigation, climate-display or driver-profile defect.',
      solution:
        'Confirm that the failure began after 91DZ and matches the Audi connect/SOS-LED condition. An Audi technician should use ODIS Guided Fault Finding and run SVM Check Module Configuration for diagnostic address 0019, J533. Manual coding is no longer required. Escalate a continuing Audi connect failure through Audi support after the guided coding procedure rather than buying hardware or a retail software service.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Audi connect services unavailable in the MMI after 91DZ',
        'myAudi app services unavailable after 91DZ',
        'SOS button LED red or off',
      ],
      affectedSystems: [
        'data-bus diagnostic interface J533 coding',
        'Audi connect backend selection',
        'MMI and myAudi connected services',
      ],
      dtcCodes: [],
      citations: [citations.connectTsb],
      summary:
        'Replaced the broad infotainment and OTA aggregation with the exact post-91DZ 2022 Audi connect coding path in TSB 2068824/2; removed unsupported symptom families, fixed repair assertions and one retail software-update commerce claim and URL.',
    },
  },
  'audi-rs-etron-gt-tire-wear-2022': {
    disposition: 'remove',
    decision:
      'Archive the broad tire-wear row because its alignment, driving-mode, mileage, cost, tire-brand and rotation assertions have no exact RS e-tron GT primary source. The exact NHTSA tire-related record found in review is a VIN-gated owner-manual pressure correction, which is a different issue and remains proposal-only.',
    evidence: [
      {
        label:
          'NHTSA 22V085 documents a tire-pressure owner-manual correction for certain vehicles but does not establish abnormal tire wear, a fixed mileage range, alignment causation, rotation guidance or a replacement brand for the seeded RS e-tron GT row',
        url: citations.tirePressureRecall.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'other',
      title: 'Archived - Unsupported RS e-tron GT Tire-Wear Aggregation',
      description:
        'The prior row combined broad claims about inner-edge wear, vehicle weight, alignment, drive modes, replacement mileage, costs and tire choice without an exact Audi or NHTSA source establishing one RS e-tron GT defect. The tire-pressure manual recall found during review is a separate VIN-gated condition and does not validate this wear narrative.',
      solution:
        'Do not replace tires or authorize alignment from this archived aggregation. Inspect actual tread depth and wear pattern, verify tire size and pressure against the vehicle label and current owner information, and diagnose alignment or suspension only from vehicle-specific measurements. Check the VIN separately for any open tire-pressure-information campaign.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: ['tires', 'wheel alignment'],
      dtcCodes: [],
      citations: [citations.tirePressureRecall],
      summary:
        'Archived an unsupported tire-wear, mileage, cost, alignment and brand aggregation; removed its tire commerce claim and search URL while preserving the distinct VIN-gated tire-pressure manual recall only as a controlled proposal.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2022 RS e-tron GT Suspension-Strut Recall 42L2 / NHTSA 21V935',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V935-4296.PDF',
    ],
  },
  {
    title:
      '2022 RS e-tron GT Tire-Pressure Manual Recall / NHTSA 22V085',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V085-5703.PDF',
    ],
  },
  {
    title:
      '2022-2024 RS e-tron GT Portable Charging-Cable Recall 93U6/93U8 / NHTSA 23V842',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V842-7711.PDF',
    ],
  },
  {
    title:
      '2022-2026 RS e-tron GT Rearview-Camera Software Recall 90TV / NHTSA 25V900',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi RS e-tron GT',
  make: 'Audi',
  model: 'RS e-tron GT',
  batchId: 'audi-rs-etron-gt-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '6f885a7d85b6a9e6b757c174ab88b5887732ad9b67768800797a6961a5c0b9a1',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-rs-e-tron-gt/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'rs_etron_gt_blind_review:no-blocker',
    edge: 'rs_etron_gt_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-rs-etron-gt-battery-short-2022',
    'audi-rs-etron-gt-brake-hose-2022',
    'audi-rs-etron-gt-charging-port-2022',
    'audi-rs-etron-gt-software-2022',
    'audi-rs-etron-gt-tire-wear-2022',
  ],
  records,
  expectedPerRecord: {
    'audi-rs-etron-gt-battery-short-2022': {
      claimIds: [
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
        'communityRecommendations:7',
      ],
      urls: [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=Lectron%20Portable%20Level%202%20EV%20Charger%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs-etron-gt-brake-hose-2022': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      urls: [
        'https://www.amazon.com/s?k=9J1611707M&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=9J1611707M',
        'https://www.ebay.com/sch/i.html?_nkw=9J1611707M',
        'https://www.amazon.com/s?k=Dorman%20brake%20line%20kit%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
        'https://www.amazon.com/s?k=Raybestos%20brake%20hose%20Audi%20RS%20e-tron%20GT&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs-etron-gt-charging-port-2022': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=Genuine%20Audi%20charging%20port%20RS%20e-tron%20GT&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs-etron-gt-software-2022': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=Audi%20e-tron%20GT%20software%20update&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs-etron-gt-tire-wear-2022': {
      claimIds: ['communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=Michelin%20Pilot%20Sport%204S%20(305%2F30R21%20rear)&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 12,
    urlCount: 14,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 2,
    'diagnosis-hold': 2,
    remove: 1,
  },
  expectedPublished: 4,
  expectedArchived: 1,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const battery = issues.find(
      (issue) => issue.id === 'audi-rs-etron-gt-battery-short-2022',
    ).after;
    const brake = issues.find(
      (issue) => issue.id === 'audi-rs-etron-gt-brake-hose-2022',
    ).after;
    const charging = issues.find(
      (issue) => issue.id === 'audi-rs-etron-gt-charging-port-2022',
    ).after;
    const software = issues.find(
      (issue) => issue.id === 'audi-rs-etron-gt-software-2022',
    ).after;
    const tires = issues.find(
      (issue) => issue.id === 'audi-rs-etron-gt-tire-wear-2022',
    ).after;
    if (
      JSON.stringify(battery.years) !== JSON.stringify([2022, 2023, 2024]) ||
      battery.status !== 'published' ||
      battery.citations[0].url !== citations.batteryRecall.url ||
      brake.status !== 'published' ||
      brake.citations[0].url !== citations.brakeRecall.url ||
      charging.status !== 'published' ||
      charging.citations[0].url !== citations.chargingUpdate.url ||
      JSON.stringify(software.years) !== JSON.stringify([2022]) ||
      software.status !== 'published' ||
      software.citations[0].url !== citations.connectTsb.url ||
      tires.status !== 'archived'
    ) {
      throw new Error(
        'Audi RS e-tron GT recall, software, charging or archive after-state scope drifted.',
      );
    }
  },
};
