const cite = (type, title, url) => ({ type, title, url });

const citations = {
  sideSillWater: cite(
    'tsb',
    'Audi TSB 2061754/4 - A5 Sportback Water Sloshing in the Side Sills',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10250557-0001.pdf',
  ),
  trunkStrutNoise: cite(
    'tsb',
    'Audi TSB 2062669/2 - Trunk-Lid Strut Hydraulic or Chafing Noise',
    'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217903-0001.pdf',
  ),
  coolantPumpLeak: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2.0 TFSI Coolant-Pump Leak Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
};

const records = {
  'audi-a5-sportback-panoroof-drain-2018': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported panoramic-roof drain-clogging aggregation with the exact 2017-2023 A5 Sportback side-sill water-accumulation condition in Audi TSB 2061754/4. Remove annual cleaning, compressed-air, seal-product, electrical-damage and fixed-cost claims plus two unrelated liftgate-commerce claims.',
    evidence: [
      {
        label:
          'Audi TSB 2061754/4 explicitly covers 2017-2023 A5 Sportback vehicles and documents water sloshing from side-sill cavities when a sound absorber blocks normal drainage',
        url: citations.sideSillWater.url,
      },
    ],
    after: {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023],
      trims: [],
      engines: [],
      category: 'body',
      title: '2017-2023 A5 Sportback Water Sloshing in the Side Sills',
      description:
        'Audi TSB 2061754/4 covers a water-sloshing sound from the floor area of 2017-2023 A5 Sportback vehicles while driving, cornering or braking. Audi says water can collect in the side-member and sill cavities when a cavity sound absorber blocks the normal drainage path. This bulletin does not identify the panoramic-roof drains as the cause.',
      solution:
        'Have the side-sill cavities inspected for retained water. Audi directs the shop to access the side-member plugs, drain any accumulated water, modify the obstructing sound absorber so water can reach the normal drainage path, apply cavity preservative and confirm the front and rear drain plugs remain functional. Do not use compressed air, wire or a seal product on the panoramic roof solely from this card.',
      severity: 'low',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Water sloshing sound while driving, cornering or braking',
        'Noise described as coming from the floor area',
      ],
      affectedSystems: [
        'side-member and sill cavities',
        'sill-cavity sound absorbers',
        'side-member drainage paths',
      ],
      dtcCodes: [],
      citations: [citations.sideSillWater],
      summary:
        'Replaced an unsupported panoramic-roof drain narrative with Audi exact 2017-2023 side-sill water-accumulation guidance; removed preventive-maintenance, damage and fixed-cost assertions plus two unrelated commerce claims and URLs.',
    },
  },
  'audi-a5-sportback-rear-hatch-strut-2018': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported premature gas-strut weakness, falling-hatch and paired-replacement narrative with the exact 2018-2023 A5 Sportback trunk-strut noise condition in Audi TSB 2062669/2. Make clear that Audi calls the hydraulic or chafing sound a design-related characteristic and says parts replacement does not solve it; remove three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2062669/2 explicitly covers 2018-2023 A5 Sportback vehicles, identifies hydraulic-flow or chafing sounds during trunk-lid operation as a typical strut characteristic and says parts replacement does not solve the issue',
        url: citations.trunkStrutNoise.url,
      },
    ],
    after: {
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      trims: [],
      engines: [],
      category: 'body',
      title: '2018-2023 A5 Sportback Trunk-Strut Hydraulic or Chafing Noise',
      description:
        'Audi TSB 2062669/2 covers hydraulic-flow or chafing sounds from the trunk-lid struts while opening or closing a 2018-2023 A5 Sportback. Audi describes these sounds as a normal, design-related strut characteristic whose frequency and intensity can vary with temperature and operating speed; the bulletin does not establish weak struts or a hatch that can fall.',
      solution:
        'Compare the complaint with the hydraulic-flow or functional noise described by Audi while operating the trunk lid. Audi states that replacing parts does not solve this noise condition. A hatch that will not remain open, closes unexpectedly or has abnormal powered-lift operation is a different safety-relevant symptom and should be diagnosed independently rather than treated from this informational card.',
      severity: 'low',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Hydraulic-flow sound while opening or closing the trunk lid',
        'Chafing or functional noise from the trunk-lid struts',
      ],
      affectedSystems: ['trunk-lid struts'],
      dtcCodes: [],
      citations: [citations.trunkStrutNoise],
      summary:
        'Replaced an unsupported falling-hatch and premature-failure narrative with Audi exact informational guidance for 2018-2023 trunk-strut noise; removed a generic complaint root plus three commerce claims and five URLs.',
    },
  },
  'audi-a5-sportback-thermostat-2018': {
    disposition: 'remove',
    decision:
      'Archive the separate thermostat-housing crack aggregation because its generic NHTSA vehicle page does not establish an A5 Sportback housing defect, an updated revision, overlapping labor, fixed savings, coolant-mixing damage or the seeded DTCs. The exact Audi source found during review supports one narrower coolant-pump leak record instead.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 gives an exact 2020-2024 A5 Sportback 2.0 TFSI coolant-pump leak path but does not identify a thermostat-housing crack or support the seeded replacement and prevention claims',
        url: citations.coolantPumpLeak.url,
      },
    ],
    after: {
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      trims: [],
      engines: ['2.0T'],
      category: 'cooling',
      title: 'Archived A5 Sportback Thermostat-Housing Crack Aggregation',
      description:
        'The seeded card used a generic NHTSA vehicle page to claim a platform-wide thermostat-housing crack, fixed failure location and revised part. The exact Audi coolant-leak bulletin located during review addresses the coolant pump and does not substantiate this separate housing-defect aggregation.',
      solution:
        'Locate and verify the actual source of coolant loss before ordering a thermostat housing or water pump. Use the published A5 Sportback coolant-pump leak card when the leak is assigned to that component; otherwise follow current VIN-specific Audi service information for the diagnosed source.',
      severity: 'medium',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: ['engine cooling system', 'thermostat housing'],
      dtcCodes: [],
      citations: [citations.coolantPumpLeak],
      summary:
        'Archived an unsupported thermostat-housing crack aggregation; removed platform-wide failure, revised-part, overlapping-labor, coolant-mixing, fixed-savings and DTC assertions plus two commerce claims and four URLs.',
    },
  },
  'audi-a5-sportback-water-pump-2018': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported auxiliary electric turbo-cooling pump, seized-impeller, overheating, location, scan-tool and DTC narrative with the exact 2020-2024 A5 Sportback 2.0 TFSI coolant-pump leak diagnosis in Audi TSB 2071515/1. Remove the fake video, generic NHTSA vehicle page and all three commerce claims with five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 explicitly covers 2020-2024 A5 Sportback 2.0 TFSI vehicles with coolant loss, a leak or a coolant warning when the leak can be assigned to the coolant pump',
        url: citations.coolantPumpLeak.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: ['2.0T'],
      category: 'cooling',
      title: '2020-2024 A5 Sportback 2.0T Coolant-Pump Leak',
      description:
        'Audi TSB 2071515/1 covers coolant loss, a visible coolant leak or an illuminated coolant warning on 2020-2024 A5 Sportback 2.0 TFSI vehicles when the leak can be assigned to the coolant pump. The bulletin does not describe an auxiliary turbo-cooling pump, a seized impeller, post-shutdown turbo overheating or the seeded fault codes.',
      solution:
        'First locate and document the leak precisely and rule out a low level caused by incomplete bleeding after production or an earlier repair. Audi directs the shop to clean and dry the suspected area, fill the system to maximum and reassess it after driving a few miles. If no leak returns, continue to observe without replacing parts; if it returns, replace the confirmed component under current Audi repair information.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Coolant loss or visible coolant leak',
        'Coolant warning lamp illuminated',
      ],
      affectedSystems: ['coolant pump', 'engine cooling system'],
      dtcCodes: [],
      citations: [citations.coolantPumpLeak],
      summary:
        'Replaced an unsupported auxiliary turbo-pump failure narrative with Audi exact 2020-2024 2.0 TFSI coolant-pump leak verification; removed five seeded DTCs, a fake video, a generic source plus three commerce claims and five URLs.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2018-2021 A5 Sportback Hard Brake Pedal While Starting - Audi TSB 2055646/3',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2022/MC-10214476-0001.pdf',
    ],
  },
  {
    title:
      '2018-2019 A5 Sportback Quattro Ultra Malfunction C05ED00 - Audi TSB 2051558/6',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2021/MC-10188595-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi A5 Sportback',
  make: 'Audi',
  model: 'A5 Sportback',
  batchId: 'audi-a5-sportback-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '073b512aad936c7cc4273b0acde65bf8ef37c414364403b9e99474fa93cbd978',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a5-sportback/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a5_sportback_blind_review:no-blocker',
    edge: 'a5_sportback_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-a5-sportback-panoroof-drain-2018',
    'audi-a5-sportback-rear-hatch-strut-2018',
    'audi-a5-sportback-thermostat-2018',
    'audi-a5-sportback-water-pump-2018',
  ],
  records,
  expectedPerRecord: {
    'audi-a5-sportback-panoroof-drain-2018': {
      claimIds: [
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      urls: [
        'https://www.amazon.com/s?k=StrongArm%20liftgate%20struts&tag=au7o-20',
        'https://www.amazon.com/s?k=Sachs%20liftgate%20gas%20struts&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-a5-sportback-rear-hatch-strut-2018': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=8W8827851&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8W8827851',
        'https://www.ebay.com/sch/i.html?_nkw=8W8827851',
        'https://www.amazon.com/s?k=StrongArm%20liftgate%20struts&tag=au7o-20',
        'https://www.amazon.com/s?k=Sachs%20liftgate%20gas%20struts&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-a5-sportback-thermostat-2018': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=06L121111N&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121111N',
        'https://www.ebay.com/sch/i.html?_nkw=06L121111N',
        'https://www.amazon.com/s?k=Genuine+VW+Audi+06L121111J&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-a5-sportback-water-pump-2018': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=06L121012L&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121012L',
        'https://www.ebay.com/sch/i.html?_nkw=06L121012L',
        'https://www.amazon.com/s?k=Gates%20water%20pump&tag=au7o-20',
        'https://www.amazon.com/s?k=GMB%20water%20pump&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 10,
    urlCount: 16,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 3,
    remove: 1,
  },
  expectedPublished: 3,
  expectedArchived: 1,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const water = issues.find(
      (issue) => issue.id === 'audi-a5-sportback-panoroof-drain-2018',
    ).after;
    const struts = issues.find(
      (issue) => issue.id === 'audi-a5-sportback-rear-hatch-strut-2018',
    ).after;
    const thermostat = issues.find(
      (issue) => issue.id === 'audi-a5-sportback-thermostat-2018',
    ).after;
    const pump = issues.find(
      (issue) => issue.id === 'audi-a5-sportback-water-pump-2018',
    ).after;
    if (
      JSON.stringify(water.years) !==
        JSON.stringify([2017, 2018, 2019, 2020, 2021, 2022, 2023]) ||
      water.status !== 'published' ||
      water.citations.map((citation) => citation.url).join('|') !==
        citations.sideSillWater.url ||
      JSON.stringify(struts.years) !==
        JSON.stringify([2018, 2019, 2020, 2021, 2022, 2023]) ||
      struts.status !== 'published' ||
      struts.citations.map((citation) => citation.url).join('|') !==
        citations.trunkStrutNoise.url ||
      thermostat.status !== 'archived' ||
      JSON.stringify(pump.years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024]) ||
      pump.status !== 'published' ||
      pump.dtcCodes.length !== 0 ||
      pump.citations.map((citation) => citation.url).join('|') !==
        citations.coolantPumpLeak.url
    ) {
      throw new Error(
        'Audi A5 Sportback side-sill, trunk-strut, coolant-pump or archive after-state scope drifted.',
      );
    }
  },
};
