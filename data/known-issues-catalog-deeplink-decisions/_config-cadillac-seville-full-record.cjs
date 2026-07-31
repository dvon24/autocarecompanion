const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  trims = [],
  engines = [],
  category,
  title,
  description,
  solution,
  severity = 'low',
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
      trims,
      engines,
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source: 'manual',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded GM service scope and removed ${claims} commerce claims with ${urls} URLs.`,
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
      title: `Archived - Unsupported Cadillac Seville ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Seville population. ${reason}`,
      solution:
        'Do not order parts, use sealant, convert the suspension or apply a universal repair from this archived card. Verify the exact year, trim, equipment, symptoms, DTCs and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac Seville "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Seville',
  make: 'Cadillac',
  model: 'Seville',
  batchId: 'cadillac-seville-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '806ca1d4aabafdd7607367c174e3d14c0bcb42f472ae31d6ae35eb1db77e1cb7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-seville/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac5_blind:no-blocker',
    edge: 'cadillac5_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-seville-ecs-strut-1998',
    'cadillac-seville-northstar-hg-1993',
    'cadillac-seville-sts-suspension-2000',
  ],
  records: {
    'cadillac-seville-ecs-strut-1998': exactPath({
      oldTitle: 'Electronic Continuously Variable Real-Time Damping Strut Failure',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'manual',
          label: '2002 Cadillac Seville Owner Manual - STS CVRSS Message',
          url: 'https://experience.gm.com/ownercenter/content/dam/gmownercenter/gmna/dynamic/manuals/2002/cadillac/seville/2002_cadillac_seville_owners.pdf',
        },
        {
          type: 'manual',
          label: '2002 Seville STS OEM Service Manual Mirror - ESC Damper Actuator Test',
          url: 'https://charm.li/Cadillac/2002/Seville%20STS%20V8-4.6L%20VIN%209/Repair%20and%20Diagnosis/Steering%20and%20Suspension/Suspension/Suspension%20Control%20%28%20Automatic%20-%20Electronic%20%29/Testing%20and%20Inspection/Scan%20Tool%20Testing%20and%20Procedures/Scan%20Tool%20Testing%20-%20Electronic%20Suspension%20Control%20%28ESC%29/Scan%20Tool%20Output%20Controls%20-%20ESC/',
        },
      ],
      years: [2002],
      trims: [],
      engines: ['4.6L V8 (VIN 9)'],
      category: 'suspension',
      title: 'CVRSS Damper-Actuator DTC Requires Diagnosis Before Strut Replacement',
      description:
        'The 2002 Seville owner manual identifies Continuously Variable Road Sensing Suspension as STS-only and says it displays SERVICE SUSPENSION SYS when the controller detects a problem. The matching 2002 Seville STS RPO F45 OEM service procedure uses an Electronic Suspension Control damper-actuator test, including C0577 as an intermittent-circuit example. The message or DTC does not by itself prove that the electronic strut hardware failed.',
      solution:
        'Confirm that the 2002 Seville is an STS equipped with CVRSS RPO F45. Have a qualified technician retrieve the suspension DTCs and run the ESC damper-actuator output test. For an intermittent C0577-type fault, the OEM procedure commands the affected solenoid while the suspected wiring and connector are moved to isolate the circuit or component. Confirm the failed circuit or damper before replacing a strut; do not order a strut, install a passive-conversion kit or defeat the warning from this card.',
      symptoms: [
        'SERVICE SUSPENSION SYS message',
        'Intermittent C0577 damper-actuator circuit DTC',
      ],
      systems: [
        'Continuously Variable Road Sensing Suspension (RPO F45)',
        'Electronic Suspension Control',
        'strut and shock absorber solenoids',
        'damper-actuator wiring and connectors',
      ],
      dtcCodes: ['C0577'],
    }),
    'cadillac-seville-northstar-hg-1993': archived({
      oldTitle: 'Northstar 4.6L Head Gasket Failure',
      idSuffix: 'Northstar Head-Gasket Aggregation',
      claims: 2,
      urls: 2,
      years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004],
      category: 'engine',
      reason:
        'The frozen card called failure virtually guaranteed, prescribed one thread-insert repair and a price range, but cited only a generic NHTSA vehicle page and a video. The current primary-source sweep did not establish one defect mechanism, affected-year boundary, diagnostic gate or universal repair across every 1993-2004 Seville.',
    }),
    'cadillac-seville-sts-suspension-2000': archived({
      oldTitle: 'Magnetic Ride Control Shock Absorber Failure',
      idSuffix: 'Magnetic-Ride Shock Aggregation',
      claims: 2,
      urls: 2,
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004],
      category: 'suspension',
      reason:
        'The frozen card extended Magnetic Ride Control to years and trims that used different electronic suspension equipment, cited only a forum home page, and supplied no exact DTC, leak criterion or GM replacement procedure. A 2002 exchange-program bulletin establishes parts administration, not a common shock defect, so the claimed universal failure and passive-conversion remedy are not verified.',
    }),
  },
  expectedTelemetry: {
    claimCount: 6,
    urlCount: 6,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 1,
    remove: 2,
  },
  expectedPublished: 1,
  expectedArchived: 2,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-seville-ecs-strut-1998': {
      years: [2002],
      trims: [],
      engines: ['4.6L V8 (VIN 9)'],
      status: 'published',
    },
    'cadillac-seville-northstar-hg-1993': {
      years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004],
      trims: [],
      engines: [],
      status: 'archived',
    },
    'cadillac-seville-sts-suspension-2000': {
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004],
      trims: [],
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
        JSON.stringify(issue.after.trims) !==
          JSON.stringify(expected[issue.id].trims) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected[issue.id].engines),
    )
  ) {
    throw new Error('Cadillac Seville reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
