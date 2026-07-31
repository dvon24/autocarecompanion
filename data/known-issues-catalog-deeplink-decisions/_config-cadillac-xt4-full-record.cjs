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
      title: `Archived - Unsupported Cadillac XT4 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac XT4 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, engine, transmission, equipment, symptoms, DTCs and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac XT4 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac XT4',
  make: 'Cadillac',
  model: 'XT4',
  batchId: 'cadillac-xt4-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'df9e4b8c4993b977c89ee4d3ebefa38179c665a8aa3bf6a10c044a767b5944bf',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-xt4/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac6_blind:no-blocker',
    edge: 'cadillac6_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-xt4-20t-timing-chain-2019',
    'cadillac-xt4-infotainment-issues-2019',
    'cadillac-xt4-transmission-hesitation-2019',
    'cadillac-xt4-turbo-issues-2019',
    'cadillac-xt4-turbo-oil-consumption-2019',
  ],
  records: {
    'cadillac-xt4-20t-timing-chain-2019': exactPath({
      oldTitle: '2.0T Engine Timing Chain Tensioner Issues',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PIP5652A - 2019 XT4 LSY Front-Engine Rattle and Timing-Chain Tensioner Inspection',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10234239-9999.pdf',
        },
      ],
      years: [2019],
      engines: ['2.0L Turbo I4 (RPO LSY)'],
      category: 'engine',
      title:
        'Front-Engine Rattle May Require Timing-Chain Tensioner Inspection',
      description:
        'GM PIP5652A covers the 2019 XT4 with the 2.0L LSY engine when a front-engine rattle is present, with or without P0011, P0014, P0016 or P0017. A stuck or collapsed timing-chain tensioner can damage camshaft actuator valve hardware, so GM directs inspection of the actuator snap rings, tensioner and guides rather than automatic replacement of a generic timing kit.',
      solution:
        'Have a qualified technician verify the engine RPO and DTCs, inspect both camshaft actuator valve snap rings, then inspect the timing-chain tensioner and guides using current Cadillac service information. Replace only the failed or damaged components identified by that inspection. The exact ShowMeTheParts lookup returned no timing-chain candidate, so the former aftermarket kit and water-pump links were removed.',
      symptoms: [
        'Rattle from the front of the engine',
        'Check-engine light may be present',
        'P0011, P0014, P0016 or P0017',
      ],
      systems: [
        'timing-chain tensioner',
        'timing-chain guides',
        'camshaft actuator valve hardware',
      ],
      dtcCodes: ['P0011', 'P0014', 'P0016', 'P0017'],
    }),
    'cadillac-xt4-infotainment-issues-2019': exactPath({
      oldTitle: 'Infotainment System Freezing and Audio Dropouts',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Bulletin 20-NA-087 - Blank Radio Display or No Audio on 2020 XT4',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10175766-9999.pdf',
        },
      ],
      years: [2020],
      category: 'electrical',
      title:
        'Blank Radio Display or No Audio Is Limited to Early Radio Software',
      description:
        'GM bulletin 20-NA-087 covers a 2020 XT4 equipped with Premium Audio RPO UQS and infotainment IOS, IOU or IOT when the display is blank or black and recovers after an ignition cycle, or audio or video is lost. The bulletin applies only when the radio software is below U146/V146.',
      solution:
        'Check the equipment RPOs and radio build number before applying this bulletin. If the version is U145/V145 or earlier, a qualified technician should reprogram the A11 radio by USB under current GM procedures. If it is U146/V146 or later, stop and diagnose through current service information. The former generic replacement-screen link was removed.',
      symptoms: [
        'Blank or black display that may recover after an ignition cycle',
        'Loss of audio',
        'Loss of video',
      ],
      systems: ['A11 radio', 'infotainment software'],
    }),
    'cadillac-xt4-transmission-hesitation-2019': exactPath({
      oldTitle: '9-Speed Automatic Hesitation and Shift Hunting',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Bulletin 18-NA-378 - 2019 XT4 9T50 Surge, Chuggle, Fishbite or Shudder',
          url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10161883-9999.pdf',
        },
      ],
      years: [2019],
      engines: ['2.0L Turbo I4 (RPO LSY)'],
      category: 'transmission',
      title:
        '9T50 Surge or Shudder Requires a Transmission Glycol Test',
      description:
        'GM bulletin 18-NA-378 covers the 2019 XT4 with the 2.0L LSY engine and 9T50 transmission RPO M3H when the vehicle surges, chuggles, fishbites or shudders. GM identifies possible glycol contamination from the stack-plate heat exchanger and requires a fluid-condition check and glycol test before choosing a repair.',
      solution:
        'Have a qualified transmission technician verify RPO M3H, check fluid level and condition and perform the GM glycol test. With no detected glycol, follow the bulletin drain-and-fill procedure using the specified DEXRON VI fluid; at 50 ppm or more, follow the transmission and cooler replacement path. Do not substitute a universal additive or flush kit. The exact ShowMeTheParts lookup returned no transmission-fluid candidate.',
      symptoms: ['Surge', 'Chuggle', 'Fishbite sensation', 'Shudder'],
      systems: [
        '9T50 automatic transmission (RPO M3H)',
        'transmission fluid cooling exchanger',
      ],
    }),
    'cadillac-xt4-turbo-issues-2019': archived({
      oldTitle: '2.0T LSY Engine - PCV and Turbo Coolant Line Issues',
      idSuffix: 'Turbo and PCV Aggregation',
      claims: 2,
      urls: 2,
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      reason:
        'The frozen card combines PCV failure, turbocharger failure and coolant-line leakage across seven model years, cites generic complaint/forum pages, assigns unrelated parts and prescribes a universal coolant-line redesign without one exact GM bulletin establishing that combined population or repair.',
    }),
    'cadillac-xt4-turbo-oil-consumption-2019': archived({
      oldTitle: '2.0L Turbo Excessive Oil Consumption',
      idSuffix: 'Oil-Consumption Aggregation',
      claims: 2,
      urls: 2,
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      reason:
        'The frozen card extrapolates a universal oil-consumption defect, mileage onset, piston-ring cause and repair path from generic complaint and forum material. The primary-source sweep did not establish that all-year XT4 population or authorize the linked additives and PCV part as a remedy.',
    }),
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 9,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 2,
    'diagnosis-hold': 3,
  },
  expectedPublished: 3,
  expectedArchived: 2,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-xt4-20t-timing-chain-2019': {
      years: [2019],
      engines: ['2.0L Turbo I4 (RPO LSY)'],
      status: 'published',
    },
    'cadillac-xt4-infotainment-issues-2019': {
      years: [2020],
      engines: [],
      status: 'published',
    },
    'cadillac-xt4-transmission-hesitation-2019': {
      years: [2019],
      engines: ['2.0L Turbo I4 (RPO LSY)'],
      status: 'published',
    },
    'cadillac-xt4-turbo-issues-2019': {
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt4-turbo-oil-consumption-2019': {
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
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
    throw new Error('Cadillac XT4 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
