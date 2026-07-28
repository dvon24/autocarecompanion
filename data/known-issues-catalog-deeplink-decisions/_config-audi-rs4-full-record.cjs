const cite = (type, title, url) => ({ type, title, url });

const citations = {
  gasolineDeposits: cite(
    'tsb',
    'Audi TSB 2014753/13 - Gasoline Quality and Deposit-Related Misfire Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012476-0001.pdf',
  ),
  tfsiWalnutBlast: cite(
    'tsb',
    'Audi TSB 2075530/1 - TFSI Inlet-Valve and Inlet-Port Walnut-Blasting Procedure',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009928-0001.pdf',
  ),
  b7MisfireDiagnosis: cite(
    'tsb',
    'Audi TSB 2022030/2 - B7 RS4 Deposit-Related Cold-Start Misfire Diagnosis',
    'https://charm.li/Audi/2008/RS4%20Quattro%20Cabriolet%20%288HE%29%20V8-4.2L%20%28BNS%29/Repair%20and%20Diagnosis/Powertrain%20Management/Technical%20Service%20Bulletins/Customer%20Interest/Fuel%20System%20-%20MIL%20ON%2FDTC%20P0300%2FP0301-P0310%20Stored/',
  ),
};

const records = {
  'audi-rs4-b7-carbon-buildup-2007': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported assertion that every 2007-2008 B7 RS4 develops significant intake-valve carbon and needs a fixed 30,000-60,000-mile, $800-$1,500 service with Audi deposit and cold-start-misfire guidance. Retain a symptom-triggered diagnosis card, distinguish injector deposits from confirmed intake-valve deposits, and remove both unrelated commerce recommendations.',
    evidence: [
      {
        label:
          'Current Audi TSB 2014753/13 covers all 2000-2025 Audi vehicles, lists deposit-related cold-start roughness, misfires and reduced performance, and says gasoline additive removes injector and combustion-chamber deposits but not FSI intake-valve deposits',
        url: citations.gasolineDeposits.url,
      },
      {
        label:
          'Audi TSB 2022030/2 is specific to the B7 RS4 4.2L BNS engine and uses P0300/P0301-P0310 cold-start misfire diagnosis to distinguish injector deposits before additional repairs',
        url: citations.b7MisfireDiagnosis.url,
      },
    ],
    after: {
      years: [2007, 2008],
      trims: [],
      engines: ['4.2L FSI V8'],
      category: 'engine',
      title:
        '2007-2008 RS4 Deposit-Related Cold-Start Misfire - Diagnose Before Cleaning',
      description:
        'Audi guidance documents that fuel-related deposits can cause a rough cold start, hesitation, reduced performance and misfire faults. For the B7 RS4 4.2L FSI V8, Audi TSB 2022030/2 treats P0300 and cylinder-misfire faults as a diagnostic starting point and first distinguishes injector deposits from other causes. These symptoms do not by themselves prove intake-valve buildup, and Audi does not specify a recurring 30,000-60,000-mile cleaning interval in the cited guidance.',
      solution:
        'Have the cold-start event and stored faults diagnosed before authorizing intake cleaning. The B7 RS4 bulletin first checks whether its fuel-additive and follow-up procedure resolves injector-deposit misfires. Current TSB 2014753/13 warns that gasoline additive can clean FSI injectors and combustion chambers but not FSI intake valves. If the misfire remains, the shop should continue guided diagnosis and confirm inlet-valve deposits before using the applicable mechanical-cleaning procedure. Do not buy a scanner, oil bundle or cleaning service solely from this card.',
      severity: 'medium',
      confidence: 'medium',
      source: 'manual',
      symptoms: [
        'Rough running after a cold start',
        'Cold-start misfire with the malfunction indicator lamp on',
        'Hesitation or reduced engine performance',
      ],
      affectedSystems: [
        'fuel injectors',
        'intake valves',
        'engine management system',
      ],
      dtcCodes: [
        'P0300',
        'P0301',
        'P0302',
        'P0303',
        'P0304',
        'P0305',
        'P0306',
        'P0307',
        'P0308',
      ],
      citations: [
        citations.gasolineDeposits,
        citations.b7MisfireDiagnosis,
      ],
      summary:
        'Replaced a universal carbon-buildup, fixed-interval and fixed-cost narrative with Audi symptom-triggered cold-start-misfire diagnosis; distinguished injector deposits from confirmed FSI intake-valve deposits and removed two unrelated commerce claims and URLs.',
    },
  },
  'audi-rs4-rs5-carbon-buildup-2018': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported chronic-defect, fixed 60,000-mile, $1,000-$1,800, dual-catch-can, additive, 5,000-mile oil and drive-hard narrative with current Audi TFSI guidance for rough cold idle and sporadic misfire caused by confirmed inlet-port or inlet-valve deposits. Remove the generic forum citation, the commerce claim and all unsupported tips.',
    evidence: [
      {
        label:
          'Current Audi TSB 2075530/1 covers all 2005-2024 Audi TFSI vehicles, identifies inlet-port and inlet-valve deposits when cold-start rough idle and sporadic misfire are confirmed, and specifies walnut blasting without cylinder-head removal',
        url: citations.tfsiWalnutBlast.url,
      },
      {
        label:
          'Current Audi TSB 2014753/13 provides the wider gasoline-quality and deposit differential and does not prescribe the seeded catch-can, oil interval, fixed cleaning interval or drive-hard advice',
        url: citations.gasolineDeposits.url,
      },
    ],
    after: {
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      trims: [],
      engines: ['2.9T'],
      category: 'engine',
      title:
        '2018-2023 RS4 2.9T Cold-Start Misfire from Confirmed Inlet Deposits',
      description:
        'Audi TSB 2075530/1 documents that deposits in TFSI inlet ports and inlet valves can cause rough idling after a cold start and sporadic misfires, especially on vehicles used mainly for short trips. For the 2018-2023 RS4 2.9T record, this supports a symptom-triggered diagnosis and repair path; it does not establish that every vehicle has a chronic defect or needs cleaning at a fixed mileage.',
      solution:
        'Confirm the cold-start complaint, review the engine-control-unit event memory and verify inlet-port or inlet-valve deposits before cleaning. When that condition is confirmed, Audi TSB 2075530/1 directs the shop to remove the intake manifold or compressor and clean the inlet valves and ports by walnut blasting; the cylinder head remains installed. The cited Audi guidance does not support a mandatory 60,000-mile interval, a fixed price, dual catch cans, additive at every oil change, a 5,000-mile oil interval or a drive-hard prescription. Do not buy a catch can or cleaning product solely from this card.',
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
        'Replaced a chronic carbon-defect, fixed-interval, fixed-cost and prevention narrative with Audi current symptom-triggered TFSI walnut-blasting guidance; removed one commerce claim and URL, a generic forum citation and three unsupported tips.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2007-2008 RS4 Passenger-Frontal-Airbag Inflator Recall / NHTSA 17V032 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2017/RCAK-17V032-8559.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi RS4',
  make: 'Audi',
  model: 'RS4',
  batchId: 'audi-rs4-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '82afbdde990dad7c5e0e3055d28927226ee377f2e5901aeaa8b52bd79267bbcd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-rs4/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'rs4_blind_review:no-blocker',
    edge: 'rs4_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-rs4-b7-carbon-buildup-2007',
    'audi-rs4-rs5-carbon-buildup-2018',
  ],
  records,
  expectedPerRecord: {
    'audi-rs4-b7-carbon-buildup-2007': {
      claimIds: [
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=Audi%20RS4%20BlueDriver%20Bluetooth%20OBD2%20Diagnostic%20Scan%20Tool&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20RS4%20Mobil%201%20Full%20Synthetic%20Oil%20and%20Filter%20Bundle&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-rs4-rs5-carbon-buildup-2018': {
      claimIds: ['communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=034%20Motorsport%20034-101-1016&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 3,
    urlCount: 3,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 0,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const b7 = issues.find(
      (issue) => issue.id === 'audi-rs4-b7-carbon-buildup-2007',
    ).after;
    const b9 = issues.find(
      (issue) => issue.id === 'audi-rs4-rs5-carbon-buildup-2018',
    ).after;
    if (
      JSON.stringify(b7.years) !== JSON.stringify([2007, 2008]) ||
      b7.status !== 'published' ||
      b7.confidence !== 'medium' ||
      JSON.stringify(b7.dtcCodes) !==
        JSON.stringify([
          'P0300',
          'P0301',
          'P0302',
          'P0303',
          'P0304',
          'P0305',
          'P0306',
          'P0307',
          'P0308',
        ]) ||
      b7.citations.map((citation) => citation.url).join('|') !==
        [
          citations.gasolineDeposits.url,
          citations.b7MisfireDiagnosis.url,
        ].join('|') ||
      JSON.stringify(b9.years) !==
        JSON.stringify([2018, 2019, 2020, 2021, 2022, 2023]) ||
      b9.status !== 'published' ||
      b9.confidence !== 'high' ||
      b9.dtcCodes.length !== 0 ||
      b9.citations.map((citation) => citation.url).join('|') !==
        [
          citations.tfsiWalnutBlast.url,
          citations.gasolineDeposits.url,
        ].join('|')
    ) {
      throw new Error(
        'Audi RS4 deposit-diagnosis or confirmed-walnut-blast after-state scope drifted.',
      );
    }
  },
};
