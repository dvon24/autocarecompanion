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
      title: `Archived - Unsupported Cadillac SRX ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac SRX population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, drivetrain, equipment, symptoms, DTCs and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac SRX "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac SRX',
  make: 'Cadillac',
  model: 'SRX',
  batchId: 'cadillac-srx-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '96a9442a04663335ba5c0dd0b2c3c7f371537bc18585e5c849e32909f95dfd91',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-srx/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac5_blind:no-blocker',
    edge: 'cadillac5_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-srx-strut-mount-2010',
    'cadillac-srx-timing-chain-2010',
    'cadillac-srx-awd-power-transfer-2010',
    'cadillac-srx-cue-screen-2013',
    'cadillac-srx-liftgate-2010',
  ],
  records: {
    'cadillac-srx-strut-mount-2010': archived({
      oldTitle: 'Front Strut Mount Bearing Failure and Clunking',
      idSuffix: 'Strut-Mount Failure Aggregation',
      claims: 2,
      urls: 2,
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
      category: 'suspension',
      reason:
        'The frozen card relied on generic vehicle and complaint-index pages, asserted premature bearing wear across every second-generation year and prescribed simultaneous strut replacement at 60,000 miles without one exact GM diagnostic or wear criterion. The current primary-source sweep did not establish that universal failure or replacement threshold.',
    }),
    'cadillac-srx-timing-chain-2010': exactPath({
      oldTitle: '3.6L V6 Timing Chain Stretch - SRX',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM Bulletin 12-06-01-009E - High Feature V6 Timing Chain Kits and Guide Inspection',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10246588-9999.pdf',
        },
      ],
      years: [2010, 2011, 2012],
      engines: [
        '2.8L Turbo V6 (RPO LAU)',
        '3.0L V6 (RPO LF1)',
        '3.6L V6 (RPO LFX)',
        '3.0L V6 (RPO LFW)',
      ],
      category: 'engine',
      title: 'High-Feature V6 Timing-Chain DTCs Require Exact Kit Identification',
      description:
        'GM bulletin 12-06-01-009E covers listed 2010-2012 SRX High Feature V6 applications when worn timing chains set P0008, P0009 or P0016-P0019. It identifies application-specific service kits and warns that sprockets, actuators and guides should not be replaced automatically; guides are replaced only when wear reaches the base friction material.',
      solution:
        'Have a qualified technician confirm the DTCs, engine RPO, build information and chain wear through current service information. If the bulletin applies, use the GM kit mapped to the exact application, inspect guides using the bulletin criterion and inspect pre-June 5, 2009 cylinder-head hardware when applicable. Do not order the frozen aftermarket kit or water pump from this card; the ShowMeTheParts lookup returned no candidate.',
      symptoms: [
        'Check-engine light',
        'P0008 or P0009',
        'P0016 through P0019',
      ],
      systems: ['timing chains', 'timing-chain guides', 'camshaft timing'],
      dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
    }),
    'cadillac-srx-awd-power-transfer-2010': archived({
      oldTitle: 'AWD Power Transfer Unit (PTU) Seal Leak and Bearing Noise',
      idSuffix: 'AWD Power-Transfer Aggregation',
      claims: 2,
      urls: 2,
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
      category: 'drivetrain',
      reason:
        'The frozen card relied on generic vehicle and complaint-index pages, asserted one seal-and-bearing defect across every AWD year and declared the unit non-rebuildable without an exact GM source. The exact GM PTU leak service update surfaced in review applies to the later XT5 and other platforms, not this SRX, so it cannot support this stable identity.',
    }),
    'cadillac-srx-cue-screen-2013': archived({
      oldTitle: 'CUE Infotainment Touchscreen Delamination',
      idSuffix: 'CUE Touchscreen Aggregation',
      claims: 1,
      urls: 1,
      years: [2013, 2014, 2015, 2016],
      category: 'electrical',
      reason:
        'The frozen card supplied no source URL for its claimed customer-satisfaction program. GM campaign 17287 is a frontal-airbag and pretensioner software recall for a different vehicle population, not a CUE screen program, and the generic complaint page does not establish the stated all-year defect, part number or DIY repair.',
    }),
    'cadillac-srx-liftgate-2010': exactPath({
      oldTitle: 'Power Liftgate Motor and Strut Failure',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label: 'GM Preliminary Information PI1186 - Diagnosing and Repairing Power Liftgate Operation',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10070199-9133.pdf',
        },
      ],
      years: [2010, 2011, 2012, 2013, 2014],
      category: 'body',
      title: 'Power Liftgate May Sag or Reverse When the Right Gas Strut Is Worn',
      description:
        'GM PI1186 covers a 2010-2014 SRX equipped with power liftgate RPO TB5 when the liftgate lowers slightly from its selected position or reverses while opening or closing. It directs inspection of the right gas strut for wear, cracks, leaks, damage and hold-open ability before replacement.',
      solution:
        'Have the right gas strut inspected and replace it only if it fails the GM condition checks. Do not replace the actuator or pump without diagnosis. The ShowMeTheParts lookup returned no candidate, so this card does not link or prescribe a generic pair of struts or a liftgate motor.',
      symptoms: [
        'Liftgate sags slightly from selected open position',
        'Liftgate reverses while opening or closing',
      ],
      systems: ['power liftgate', 'right liftgate gas strut'],
    }),
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 8,
    claimClickCount: 2,
    recordClickCount: 2,
    priorityClickCount: 2,
  },
  expectedDispositionCounts: {
    remove: 3,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 3,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-srx-liftgate-support-strut-detachment-2016',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2017/MC-10126025-9999.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'cadillac-srx-liftgate-support-strut-detachment-2016::https://static.nhtsa.gov/odi/tsbs/2017/MC-10126025-9999.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-srx-strut-mount-2010': {
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
      engines: [],
      status: 'archived',
    },
    'cadillac-srx-timing-chain-2010': {
      years: [2010, 2011, 2012],
      engines: [
        '2.8L Turbo V6 (RPO LAU)',
        '3.0L V6 (RPO LF1)',
        '3.6L V6 (RPO LFX)',
        '3.0L V6 (RPO LFW)',
      ],
      status: 'published',
    },
    'cadillac-srx-awd-power-transfer-2010': {
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
      engines: [],
      status: 'archived',
    },
    'cadillac-srx-cue-screen-2013': {
      years: [2013, 2014, 2015, 2016],
      engines: [],
      status: 'archived',
    },
    'cadillac-srx-liftgate-2010': {
      years: [2010, 2011, 2012, 2013, 2014],
      engines: [],
      status: 'published',
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
    throw new Error('Cadillac SRX reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
