const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;

function exactPath({
  disposition = 'diagnosis-hold',
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
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      summary: `Replaced the frozen "${oldTitle}" card with exact GM/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac CTS-V',
  make: 'Cadillac',
  model: 'CTS-V',
  batchId: 'cadillac-cts-v-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '9a87d7888bbd5864268e819aff1e7fec05d2ac987ce7c14d6e14dc1fc73d97b2',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-cts-v/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac3_followup_blind:no-blocker',
    edge: 'cadillac3_followup_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-cts-v-differential-2009',
    'cadillac-cts-v-supercharger-snout-2009',
    'cadillac-ctsv-mag-ride-2009',
  ],
  records: {
    'cadillac-cts-v-differential-2009': exactPath({
      disposition: 'recall-dealer',
      oldTitle: 'Rear Differential Pinion Seal and Bearing Failure Under Hard Use',
      claims: 4,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label: 'Cadillac CTS-V Recall 07V589 / GM 07204C',
          url: api('07V589000'),
        },
      ],
      years: [2005, 2006, 2007],
      category: 'drivetrain',
      title:
        'Rear-Axle Pinion-Seal Leak Can Damage the Differential (Recall 07V589)',
      description:
        'Certain 2005-2007 Cadillac CTS-V vehicles have a drive-axle differential seal that may leak because it did not meet GM specifications. Continued lubricant loss can increase differential noise, overheat bearings and, in an advanced case, allow the differential to jam or lock the drive wheels.',
      solution:
        'Check the VIN and recall-completion history. GM campaign 07204C directs dealers to replace the affected drive-axle differential pinion seal; confirm current campaign status before service.',
      severity: 'high',
      symptoms: [
        'Open safety recall',
        'Differential-fluid leak',
        'Increasing rear-differential noise',
      ],
      systems: ['rear-axle differential', 'drive-axle pinion seal'],
    }),
    'cadillac-cts-v-supercharger-snout-2009': exactPath({
      oldTitle: 'Eaton Supercharger Snout Coupler and Bearing Wear',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Special Coverage 13313 - 2009-2013 LSA Supercharger Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10092909-0335.pdf',
        },
        {
          type: 'tsb',
          label:
            'GM Special Coverage N192210220 - Certain 2014 CTS-V Superchargers',
          url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163853-9999.pdf',
        },
      ],
      years: [2009, 2010, 2011, 2012, 2013, 2014],
      engines: ['6.2L Supercharged V8 (LSA)'],
      category: 'engine',
      title:
        'LSA Supercharger Bearing Noise Needs VIN and Noise-Pattern Diagnosis',
      description:
        'GM special coverages 13313 and N192210220 identify a bounded 2009-2014 CTS-V LSA supercharger condition: excessive rattle or knock is strongest at idle and usually fades as engine speed rises; progression can contaminate grease, produce bearing squeal and eventually damage or seize the supercharger. GM distinguishes this from normal low-level mechanical supercharger noise.',
      solution:
        'Have a Cadillac dealer verify the VIN, installed supercharger and exact noise pattern before replacement. The published special-coverage periods were time- and mileage-limited, so current eligibility and cost must be confirmed rather than assumed.',
      symptoms: [
        'Excessive supercharger rattle or knock at idle',
        'Bearing squeal',
        'Possible no-start if the condition progresses',
      ],
      systems: ['LSA engine supercharger', 'supercharger bearing'],
    }),
    'cadillac-ctsv-mag-ride-2009': exactPath({
      oldTitle: 'Magnetic Ride Control Shock Failure',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM PI0430C - MagneRide Shock Electrical Connector Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163273-9999.pdf',
        },
      ],
      years: [2009, 2010, 2011, 2012, 2013, 2014],
      category: 'suspension',
      title:
        'Service Suspension Message Can Come from a MagneRide Shock Connector (PI0430C)',
      description:
        'GM PI0430C covers 2009-2014 Cadillac CTS-V vehicles with Magnetic Ride Control when the Service Suspension System message appears with DTC C0575, C0580, C0585 or C0590. A 90-degree electrical connector at the top of a shock actuator may be incompletely seated or partially disconnected; the bulletin does not establish universal shock failure.',
      solution:
        'Follow PI0430C connector inspection, seating and circuit checks before replacing a shock absorber. Continue normal service-information diagnosis if the connector path does not resolve the message or DTC.',
      symptoms: ['Service Suspension System message'],
      systems: ['Magnetic Ride Control', 'shock-actuator electrical connector'],
      dtcCodes: ['C0575', 'C0580', 'C0585', 'C0590'],
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
    'recall-dealer': 1,
    'diagnosis-hold': 2,
  },
  expectedPublished: 3,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-cts-v-differential-2009': [2005, 2006, 2007],
    'cadillac-cts-v-supercharger-snout-2009': [
      2009, 2010, 2011, 2012, 2013, 2014,
    ],
    'cadillac-ctsv-mag-ride-2009': [2009, 2010, 2011, 2012, 2013, 2014],
  };
  if (
    issues.some(
      (issue) =>
        issue.after.status !== 'published' ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expectedYears[issue.id]),
    )
  ) {
    throw new Error('Cadillac CTS-V reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
