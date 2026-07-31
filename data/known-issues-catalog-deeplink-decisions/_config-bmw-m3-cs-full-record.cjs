const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function archived({
  oldTitle,
  idSuffix,
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
      years: [2024],
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported BMW M3 CS ${idSuffix}`,
      description: `The former 2024 BMW M3 CS card asserted "${oldTitle}". ${reason}`,
      solution:
        'Do not order performance parts or apply a universal repair from this archived card. Confirm the VIN, production date, symptoms, DTCs, software level, vehicle modifications and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW M3 CS "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW M3 CS',
  make: 'BMW',
  model: 'M3 CS',
  batchId: 'bmw-m3-cs-full-record-cohort-18-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'b4bb46ceaacab006b7c894fa61644733699ea84e5fd33e7a828485cf52b18275',
  sourceSnapshotFileHash:
    '77ccf82994d2117876b95d733720b975a3b7bba2d0a17a50cd4d1dd3952a68a4',
  packetFileHash:
    '9c98afb40d02ff4f7ca7c21024cd082d1651de1d2818b1979629b4621d6d90b7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m3-cs/b4bb46ceaaca/all-0001.json',
  reviewTokens: {
    blind: 'bmwm3cs_blind:self-no-blocker',
    edge: 'bmwm3cs_edge:self-no-blocker',
  },
  expectedIds: [
    'bmw-m3-cs-s58-charge-pipe-2024',
    'bmw-m3cs-idrive-software-2024',
    'bmw-m3cs-s58-carbon-buildup-2024',
    'bmw-m3cs-s58-charge-pipe-crack-2024',
  ],
  records: {
    'bmw-m3-cs-s58-charge-pipe-2024': archived({
      oldTitle: 'Charge Pipe Cracking Under High Boost (S58 Engine)',
      idSuffix: 'Charge-Pipe Aggregation A',
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'It converts track use and higher output into a stock-vehicle plastic-pipe defect, claims the CS calibration exceeds the pipe fatigue life and promotes three aftermarket pipes without BMW pressure diagnostics, a bulletin or a verified repair role.',
    }),
    'bmw-m3cs-idrive-software-2024': archived({
      oldTitle: 'iDrive 8 Software Glitches and Screen Blackouts',
      idSuffix: 'iDrive Aggregation',
      category: 'electrical',
      claims: 6,
      urls: 6,
      reason:
        'It combines display, stereo, phone, cluster, gateway, head-unit and 12-volt behavior under one owner-report narrative, then recommends reboot, programming or hardware replacement without an M3 CS software level, fault code, production boundary or applicable BMW bulletin.',
    }),
    'bmw-m3cs-s58-carbon-buildup-2024': archived({
      oldTitle: 'S58 Intake Valve Carbon Buildup',
      idSuffix: 'Carbon-Buildup Aggregation',
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'It treats a general direct-injection mechanism as an inevitable 40,000-to-50,000-mile M3 CS failure and promotes walnut blasting, a catch can and short oil intervals without BMW measured deposits, adaptation values, DTCs or a service schedule.',
    }),
    'bmw-m3cs-s58-charge-pipe-crack-2024': archived({
      oldTitle: 'S58 Plastic Charge Pipe Cracking Under Boost',
      idSuffix: 'Charge-Pipe Aggregation B',
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'It duplicates the other charge-pipe card, again extrapolates track and tuning risk into a stock defect and promotes aluminum replacements without BMW pressure tests, a campaign or exact catalog support. ShowMeTheParts has no separate 2024 M3 CS model identity, and fitment would not prove the claim.',
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
    remove: 4,
  },
  expectedPublished: 0,
  expectedArchived: 4,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-g80-m3-cs-front-tie-rod-creak',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11021817-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-g80-m3-cs-front-tie-rod-creak::https://static.nhtsa.gov/odi/tsbs/2025/MC-11021817-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  if (
    issues.some(
      (issue) =>
        issue.after.status !== 'archived' ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify([2024]),
    )
  ) {
    throw new Error(
      'BMW M3 CS reviewed scopes or statuses drifted.',
    );
  }
};

module.exports = config;
