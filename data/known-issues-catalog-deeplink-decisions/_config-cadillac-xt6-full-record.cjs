const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines = [],
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
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source diagnosis below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines,
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
      title: `Archived - Unsupported Cadillac XT6 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac XT6 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, engine, transmission, drivetrain, equipment, symptoms, DTCs, VIN campaign status and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac XT6 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac XT6',
  make: 'Cadillac',
  model: 'XT6',
  batchId: 'cadillac-xt6-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '895013b356ba9c15a496e22cd37f57eed42037692f24cb136dd0513cdc42b3bd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-xt6/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac6_blind:no-blocker',
    edge: 'cadillac6_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-xt6-9speed-transmission-2020',
    'cadillac-xt6-auto-stop-2020',
    'cadillac-xt6-ptu-leak-2020',
    'cadillac-xt6-transmission-shudder-2020',
    'cadillac-xt6-timing-chain-2020',
  ],
  records: {
    'cadillac-xt6-9speed-transmission-2020': exactPath({
      oldTitle: '9-Speed Automatic Transmission Shudder and Hesitation',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PIP5608F - 2020-2021 XT6 Low-Speed TCC Shudder',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201297-9999.pdf',
        },
      ],
      years: [2020, 2021],
      category: 'transmission',
      title:
        'Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill',
      description:
        'GM PIP5608F covers 2020-2021 XT6 vehicles with 9-speed transmissions RPO M3G or M3W when torque-converter clutch shudder occurs on re-apply after a shift at 40 mph or below. GM identifies possible excessive assembly lubricant in the fluid and requires confirmation with TCC slip data or the scan-tool command test.',
      solution:
        'Have a qualified transmission technician verify RPO M3G or M3W and confirm the event is TCC shudder using slip-speed data or the commanded-on test. If the bulletin criteria are met, follow the GM DEXRON VI drain-and-fill procedure and drive at least 200 miles before judging the repair. Do not use a universal additive or flush kit. The exact ShowMeTheParts lookup returned no transmission-fluid candidate.',
      symptoms: [
        'Low-speed shudder on TCC re-apply after a shift',
        'Concern occurs at 40 mph or below',
        'Concern changes when TCC is commanded on',
      ],
      systems: [
        'torque-converter clutch',
        '9-speed automatic transmission (RPO M3G or M3W)',
      ],
    }),
    'cadillac-xt6-auto-stop-2020': archived({
      oldTitle: 'Auto Start-Stop Harshness and Battery Issues',
      idSuffix: 'Start-Stop and Battery Aggregation',
      claims: 4,
      urls: 4,
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'electrical',
      reason:
        'The frozen card combines restart feel, AGM battery wear, multiple electrical symptoms, a diagnostic code, module reset advice and an aftermarket disable device across six years using generic complaint/forum material. ShowMeTheParts returned three valid 2020 XT6 AGM battery fitment candidates, but fitment does not establish this asserted defect or make a battery the remedy, so none is approved for commerce.',
    }),
    'cadillac-xt6-ptu-leak-2020': archived({
      oldTitle: 'AWD Power Transfer Unit Fluid Leak',
      idSuffix: 'PTU-Leak Aggregation',
      claims: 2,
      urls: 2,
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'drivetrain',
      reason:
        'The frozen card asserts a shared PTU housing/shaft-seal defect, mileage onset and fluid service interval across every XT6 year without one exact GM source. The ShowMeTheParts differential lookup returned one generic differential pinion-seal candidate, not a verified XT6 PTU repair part, so it is not eligible for commerce.',
    }),
    'cadillac-xt6-transmission-shudder-2020': archived({
      oldTitle: '9-Speed Automatic Transmission Shudder and Harsh Shifts',
      idSuffix: 'Duplicate Transmission Aggregation',
      claims: 2,
      urls: 2,
      years: [2020, 2021, 2022, 2023],
      category: 'transmission',
      reason:
        'This is a duplicate, broader stable identity for the same 9-speed symptom family. It adds harsh-shift, calibration and generic additive/flush claims beyond the exact GM evidence. The valid 2020-2021 low-speed TCC diagnosis is retained under the higher-click transmission identity above, with all commerce removed.',
    }),
    'cadillac-xt6-timing-chain-2020': archived({
      oldTitle: '3.6L V6 Timing Chain Concern (XT6)',
      idSuffix: 'Timing-Chain Aggregation',
      claims: 1,
      urls: 1,
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      reason:
        'The frozen card extrapolates timing-chain wear from older GM V6 generations, predicts a preventive replacement interval and links an older application kit and water pump. Its cited bulletin is not an exact XT6 timing-chain population and does not support that preventive replacement claim.',
    }),
  },
  expectedTelemetry: {
    claimCount: 11,
    urlCount: 11,
    claimClickCount: 5,
    recordClickCount: 5,
    priorityClickCount: 5,
  },
  expectedDispositionCounts: {
    remove: 4,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 4,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-xt6-obstructed-fuel-flow-recall-2020',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2020/RCSB-20V639-1823.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-xt6-blank-radio-display-no-audio-2020',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2020/MC-10175766-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-xt6-high-pressure-fuel-pump-emission-recall-2024',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253045-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'cadillac-xt6-obstructed-fuel-flow-recall-2020::https://static.nhtsa.gov/odi/rcl/2020/RCSB-20V639-1823.pdf',
    'cadillac-xt6-blank-radio-display-no-audio-2020::https://static.nhtsa.gov/odi/tsbs/2020/MC-10175766-9999.pdf',
    'cadillac-xt6-high-pressure-fuel-pump-emission-recall-2024::https://static.nhtsa.gov/odi/tsbs/2024/MC-10253045-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-xt6-9speed-transmission-2020': {
      years: [2020, 2021],
      engines: [],
      status: 'published',
    },
    'cadillac-xt6-auto-stop-2020': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt6-ptu-leak-2020': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt6-transmission-shudder-2020': {
      years: [2020, 2021, 2022, 2023],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt6-timing-chain-2020': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
  };
  if (
    issues.some(
      (issue) =>
        !expected[issue.id] ||
        issue.after.status !== expected[issue.id].status ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expected[issue.id].years) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected[issue.id].engines),
    )
  ) {
    throw new Error('Cadillac XT6 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
