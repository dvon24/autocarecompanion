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
      title: `Archived - Unsupported Cadillac STS ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac STS population. ${reason}`,
      solution:
        'Do not order parts, add sealant, weld structure or apply a universal repair from this archived card. Verify the exact model year, engine, drivetrain, symptoms, DTCs and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac STS "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac STS',
  make: 'Cadillac',
  model: 'STS',
  batchId: 'cadillac-sts-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '94302bb9e4f0c9d50de9d90eafb5d4488245632b6969384c9ed59439280255dd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-sts/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac5_blind:no-blocker',
    edge: 'cadillac5_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-sts-cue-screen-2008',
    'cadillac-sts-northstar-headgasket-1998',
    'cadillac-sts-rear-subframe-2005',
    'cadillac-sts-timing-chain-2005',
    'cadillac-sts-transmission-overheating-2005',
  ],
  records: {
    'cadillac-sts-cue-screen-2008': archived({
      oldTitle: 'Navigation and Climate Control Screen Delamination',
      idSuffix: 'Navigation-Screen Delamination Aggregation',
      claims: 1,
      urls: 1,
      years: [2008, 2009, 2010, 2011],
      category: 'electrical',
      reason:
        'The frozen card cited only generic NHTSA vehicle pages, asserted heat-caused layer separation and prescribed a refurbished display without an exact GM bulletin, DTC or part boundary. The current primary-source sweep did not establish that mechanism or repair across the stated years.',
    }),
    'cadillac-sts-northstar-headgasket-1998': archived({
      oldTitle: '4.6L Northstar V8 Head Gasket Failure and Bolt Pull-Out',
      idSuffix: 'Northstar Head-Gasket Aggregation',
      claims: 1,
      urls: 1,
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
      category: 'engine',
      reason:
        'The frozen card incorrectly merges the pre-2005 Seville STS naming period with the 2005-2011 Sigma-platform STS, calls the issue virtually universal and recommends both an insert procedure and stop-leak without an exact primary-source defect boundary. The cited forum/vendor descriptions are not auditable source URLs and do not justify those claims or remedies.',
    }),
    'cadillac-sts-rear-subframe-2005': archived({
      oldTitle: 'Rear Subframe Cradle Mount Cracking and Separation',
      idSuffix: 'Rear-Subframe Structural Aggregation',
      claims: 2,
      urls: 2,
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
      category: 'suspension',
      reason:
        'The frozen card supplied only forum and generic complaint descriptions, asserted an STS design identity with a different CTS recall, and recommended structural welding without an exact Cadillac bulletin, recall population, inspection criterion or approved repair. That safety-critical claim and remedy cannot remain public without primary evidence.',
    }),
    'cadillac-sts-timing-chain-2005': exactPath({
      oldTitle: '3.6L V6 Timing Chain Stretch and Guide Failure',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM Bulletin 12-06-01-009E - High Feature V6 Timing Chain Kits and Guide Inspection',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10246588-9999.pdf',
        },
      ],
      years: [2007, 2008, 2009, 2010, 2011],
      engines: ['3.6L V6 (RPO LY7)', '3.6L V6 (RPO LLT)'],
      category: 'engine',
      title: '3.6L V6 Timing-Chain DTCs Require Exact Kit and Guide Inspection',
      description:
        'GM bulletin 12-06-01-009E covers listed 2007-2011 STS 3.6L High Feature V6 applications when worn timing chains set P0008, P0009 or P0016-P0019. It identifies application-specific service kits and warns that sprockets, actuators and guides should not be replaced automatically; guides are replaced only when wear reaches the base friction material.',
      solution:
        'Have a qualified technician confirm the 3.6L engine RPO, DTCs, build information and chain wear through current service information. For a 2007 vehicle, use the current 07-06-01-013 early-build identification instructions where directed. If 12-06-01-009E applies, use the GM kit mapped to the exact application, inspect guides using the bulletin criterion and inspect pre-June 5, 2009 cylinder-head hardware when applicable. Do not order a generic timing kit or oil from this card; the ShowMeTheParts lookup returned no candidate.',
      symptoms: [
        'Check-engine light',
        'P0008 or P0009',
        'P0016 through P0019',
      ],
      systems: ['timing chains', 'timing-chain guides', 'camshaft timing'],
      dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
    }),
    'cadillac-sts-transmission-overheating-2005': archived({
      oldTitle: '6L50 6-Speed Automatic Transmission Overheating and Harsh Shifts',
      idSuffix: 'Transmission Overheating Aggregation',
      claims: 1,
      urls: 1,
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
      category: 'transmission',
      reason:
        'The frozen card assigns a 6L50, undersized cooler, solenoid heat damage, 30,000-mile service interval and auxiliary-cooler remedy across years and engines without an exact GM source. The cited bulletin number is only a generic harsh-shift diagnosis reference in the card, and the current primary-source sweep did not verify this combined overheating and torque-converter mechanism.',
    }),
  },
  expectedTelemetry: {
    claimCount: 7,
    urlCount: 7,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 4,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 4,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-sts-cue-screen-2008': {
      years: [2008, 2009, 2010, 2011],
      engines: [],
      status: 'archived',
    },
    'cadillac-sts-northstar-headgasket-1998': {
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
      engines: [],
      status: 'archived',
    },
    'cadillac-sts-rear-subframe-2005': {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
      engines: [],
      status: 'archived',
    },
    'cadillac-sts-timing-chain-2005': {
      years: [2007, 2008, 2009, 2010, 2011],
      engines: ['3.6L V6 (RPO LY7)', '3.6L V6 (RPO LLT)'],
      status: 'published',
    },
    'cadillac-sts-transmission-overheating-2005': {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
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
    throw new Error('Cadillac STS reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
