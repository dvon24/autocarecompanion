const datasetUrl =
  'https://static.nhtsa.gov/odi/ffdd/tsbs/TSBS_RECEIVED_2000-2004.zip';

function bulletin({
  oldTitle,
  claims,
  urls,
  bulletinId,
  nhtsaId,
  years,
  engines = ['3.0L V6'],
  category,
  title,
  description,
  solution,
  severity,
  symptoms,
  systems,
}) {
  const evidenceTitle = `GM Bulletin ${bulletinId} - NHTSA Manufacturer-Communication ID ${nhtsaId}`;
  return {
    disposition: 'replace',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded GM manufacturer-communication path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: datasetUrl }],
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
      source: 'manual',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: [{ type: 'tsb', title: evidenceTitle, url: datasetUrl }],
      summary: `Replaced the frozen "${oldTitle}" card with exact GM bulletin ${bulletinId} scope from NHTSA's official dataset and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const allYears = [1997, 1998, 1999, 2000, 2001];

const config = {
  label: 'Cadillac Catera',
  make: 'Cadillac',
  model: 'Catera',
  batchId: 'cadillac-catera-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '65ee994c3a7ad93a64cc9689cbb917e383f134509afbfeb2c8bf39a48ed4b5a5',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-catera/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'catera_blind_review:no-blocker',
    edge: 'catera_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-catera-coolant-crossover-1997',
    'cadillac-catera-coolant-leak-1997',
    'cadillac-catera-timing-belt-1997',
    'cadillac-catera-transmission-slip-1997',
    'cadillac-catera-window-regulator-1997',
  ],
  records: {
    'cadillac-catera-coolant-crossover-1997': bulletin({
      oldTitle: 'Coolant Crossover Pipe and Thermostat Housing Leak',
      claims: 4,
      urls: 4,
      bulletinId: '200601',
      nhtsaId: '623743',
      years: allYears,
      category: 'cooling',
      title: 'Coolant Can Leak at the Engine Oil-Cooler Cover (GM Bulletin 200601)',
      description:
        'GM bulletin 200601 identifies coolant leaks at the engine oil-cooler cover on 1997-2001 Catera vehicles. The primary record does not support the former universal crossover-pipe and thermostat-housing diagnosis.',
      solution:
        'Pressure-test and locate the leak before replacing parts. If leakage is at the engine oil-cooler cover, have a qualified technician follow the current GM service procedure for that joint and verify the repair with a second pressure test.',
      severity: 'medium',
      symptoms: ['Coolant loss', 'Coolant residue at the engine oil-cooler cover'],
      systems: ['engine oil-cooler cover', 'engine cooling system'],
    }),
    'cadillac-catera-coolant-leak-1997': bulletin({
      oldTitle: '3.0L V6 Coolant Leak and Overheating',
      claims: 6,
      urls: 6,
      bulletinId: '010602009',
      nhtsaId: '623880',
      years: allYears,
      category: 'cooling',
      title: 'Coolant Loss, Low-Coolant Warning, or Overheating (GM Bulletin 010602009)',
      description:
        'GM bulletin 010602009 covers 1997-2001 Catera owner reports of coolant loss, a low-coolant warning, and/or engine overheating. The bulletin record confirms the symptom path but not a single universal failed component.',
      solution:
        'Stop if the engine is overheating and allow it to cool. Have the cooling system pressure-tested and diagnosed under the GM procedure before replacing a water pump, thermostat, hose, or other component.',
      severity: 'high',
      symptoms: [
        'Coolant loss',
        'Low-coolant warning',
        'Engine overheating',
      ],
      systems: ['engine cooling system'],
    }),
    'cadillac-catera-timing-belt-1997': bulletin({
      oldTitle: '3.0L V6 Timing Belt Failure',
      claims: 2,
      urls: 2,
      bulletinId: '02041A',
      nhtsaId: '10000186',
      years: allYears,
      category: 'engine',
      title:
        'Timing-Belt Idler, Tensioner, or Water Pump May Fail (Customer Program 02041A)',
      description:
        'GM customer-satisfaction program 02041A covers 1997-2001 Catera 3.0L V6 vehicles because the cam-drive timing-belt idler pulleys, tensioner pulley, and water pump may fail.',
      solution:
        'Ask a Cadillac service department to check the VIN and program-completion history. Diagnosis and replacement must follow the GM program and service procedure; do not rely on the former unverified parts links.',
      severity: 'high',
      symptoms: [
        'Timing-belt drive noise',
        'Coolant leak near the water pump',
        'Program 02041A not completed',
      ],
      systems: [
        'cam-drive timing belt',
        'idler and tensioner pulleys',
        'water pump',
      ],
    }),
    'cadillac-catera-transmission-slip-1997': bulletin({
      oldTitle: '4L30-E Automatic Transmission Harsh Shifts and Slipping',
      claims: 2,
      urls: 2,
      bulletinId: '00042A',
      nhtsaId: '616377',
      years: [1997, 1998, 1999],
      category: 'engine',
      title:
        'Crankshaft Harmonic-Balancer Bond Can Fail (GM Program 00042A)',
      description:
        'GM program 00042A covers certain 1997-1999 Catera 3.0L V6 vehicles in which the adhesive bond between the rubber hub and metal rim of the crankshaft harmonic balancer can fail, potentially resulting in engine failure.',
      solution:
        'Have the VIN and campaign history checked. A qualified technician should inspect the harmonic balancer and replace it only under the applicable GM procedure and vehicle scope.',
      severity: 'high',
      symptoms: [
        'Harmonic-balancer separation or movement',
        'Abnormal crank-pulley vibration',
      ],
      systems: ['crankshaft harmonic balancer'],
    }),
    'cadillac-catera-window-regulator-1997': bulletin({
      oldTitle: 'Power Window Regulator Cable Failure',
      claims: 1,
      urls: 1,
      bulletinId: '010602005',
      nhtsaId: '620831',
      years: allYears,
      engines: [],
      category: 'cooling',
      title:
        'Temperature Gauge May Read Red With Overheat Light On When Engine Is Not Overheating (GM Bulletin 010602005)',
      description:
        'GM bulletin 010602005 covers 1997-2001 Catera vehicles where the temperature gauge may read in the red zone and/or the overheat light may illuminate even though the vehicle is not actually overheating.',
      solution:
        'Treat any overheat indication cautiously, but verify actual coolant temperature and system condition before replacing cooling parts. A qualified technician should follow the GM diagnostic procedure for the false indication.',
      severity: 'medium',
      symptoms: [
        'Temperature gauge reads in the red zone',
        'Overheat warning light with normal measured temperature',
      ],
      systems: ['temperature indication', 'engine cooling warning system'],
    }),
  },
  expectedTelemetry: {
    claimCount: 15,
    urlCount: 15,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: { replace: 5 },
  expectedPublished: 5,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-catera-coolant-crossover-1997': allYears,
    'cadillac-catera-coolant-leak-1997': allYears,
    'cadillac-catera-timing-belt-1997': allYears,
    'cadillac-catera-transmission-slip-1997': [1997, 1998, 1999],
    'cadillac-catera-window-regulator-1997': allYears,
  };
  if (
    issues.some(
      (issue) =>
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expectedYears[issue.id]) ||
        issue.after.status !== 'published',
    )
  ) {
    throw new Error('Cadillac Catera reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
