const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
  evidenceTitle = 'NHTSA Manufacturer Communications Data Corpus',
  evidenceUrl = communicationsCorpus,
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac Eldorado ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Eldorado population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, engine or equipment, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        { type: 'nhtsa', title: evidenceTitle, url: evidenceUrl },
      ],
      summary: `Archived the unsupported Cadillac Eldorado "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const recallEvidence = {
  label: 'Cadillac Eldorado Recall 04V110 / GM 04014E',
  url: 'https://static.nhtsa.gov/odi/rcl/2004/RCSB-04V110-8047.pdf',
};

const config = {
  label: 'Cadillac Eldorado',
  make: 'Cadillac',
  model: 'Eldorado',
  batchId: 'cadillac-eldorado-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '77a31e8dbfa6f02336b0c2a44a2b6e6f49ff7d6d793850ff17b0b74aa246cf4c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-eldorado/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac3_followup_blind:no-blocker',
    edge: 'cadillac3_followup_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-eldorado-abs-traction-1992',
    'cadillac-eldorado-climate-control-head-blank-display-unresponsive-buttons',
    'cadillac-eldorado-crankshaft-position-sensor-failure-causing-intermittent-stal',
    'cadillac-eldorado-electronic-level-control-compressor-air-shock-failure-causin',
    'cadillac-eldorado-northstar-cold-start-carbon-knock',
    'cadillac-eldorado-northstar-head-gasket-1993',
    'cadillac-eldorado-northstar-v8-chronic-oil-leaks',
    'cadillac-eldorado-nylon-fuel-rail-cracking-fuel-leak-fire-risk',
    'cadillac-eldorado-water-pump-drive-belt-tensioner-pulley-failure-causing-sudde',
  ],
  records: {
    'cadillac-eldorado-abs-traction-1992': archived({
      oldTitle: 'ABS Modulator and Traction Control System Failure',
      idSuffix: 'ABS and Traction-Control Aggregation',
      years: [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
      category: 'brakes',
      claims: 2,
      urls: 2,
      reason:
        'A broad vehicle page and video do not establish one eleven-year hydraulic-modulator failure mechanism, scope or repair, and the current primary-source sweep did not supply that missing evidence.',
    }),
    'cadillac-eldorado-climate-control-head-blank-display-unresponsive-buttons':
      archived({
        oldTitle:
          'Climate Control Head Blank Display and Unresponsive Buttons',
        idSuffix: 'Climate-Control-Head Aggregation',
        years: [1997, 1998, 1999, 2000, 2001, 2002],
        category: 'hvac',
        claims: 0,
        urls: 0,
        reason:
          'Retailer, advice-site and forum references do not establish one six-year failure cause or universal control-head replacement.',
      }),
    'cadillac-eldorado-crankshaft-position-sensor-failure-causing-intermittent-stal':
      archived({
        oldTitle:
          'Crankshaft Position Sensor Failure Causing Intermittent Stalling and No-Start',
        idSuffix: 'Crankshaft-Position-Sensor Aggregation',
        years: [2000, 2001, 2002],
        category: 'engine',
        claims: 0,
        urls: 0,
        reason:
          'The frozen citations are secondary repair and forum sources. The NHTSA PE06-016 material surfaced during review applies to GM C/K-platform trucks, not Eldorado, so it cannot support this Cadillac card.',
        evidenceTitle:
          'NHTSA PE06-016 GM Response - C/K 8.1L Truck Scope',
        evidenceUrl:
          'https://static.nhtsa.gov/odi/inv/2006/INRL-PE06016-24774P.PDF',
      }),
    'cadillac-eldorado-electronic-level-control-compressor-air-shock-failure-causin':
      archived({
        oldTitle:
          'Electronic Level Control (ELC) Compressor and Air Shock Failure Causing Rear Sag',
        idSuffix: 'Electronic-Level-Control Aggregation',
        years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
        category: 'suspension',
        claims: 0,
        urls: 0,
        reason:
          'Secondary repair and forum references do not establish one ten-year compressor-and-air-shock failure mechanism or a universal repair.',
      }),
    'cadillac-eldorado-northstar-cold-start-carbon-knock': archived({
      oldTitle:
        'Northstar Cold-Start Carbon Knock (Carbon Rap / Piston Slap Noise)',
      idSuffix: 'Cold-Start Carbon-Knock Aggregation',
      years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
      category: 'engine',
      claims: 0,
      urls: 0,
      reason:
        'The frozen advice and forum citations do not establish one ten-year carbon-knock cause or universal cleaning and piston repair path.',
    }),
    'cadillac-eldorado-northstar-head-gasket-1993': archived({
      oldTitle: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
      idSuffix: 'Northstar Head-Gasket Aggregation',
      years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'A complaint page and owner forum do not establish the complete ten-year head-bolt thread-failure population, diagnostic gates or one repair.',
    }),
    'cadillac-eldorado-northstar-v8-chronic-oil-leaks': archived({
      oldTitle:
        'Northstar V8 Chronic Oil Leaks (Rear Main Seal and Lower Crankcase Half-Case Seal)',
      idSuffix: 'Rear-Main and Half-Case Leak Aggregation',
      years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
      category: 'engine',
      claims: 0,
      urls: 0,
      reason:
        'Independent repair and forum references do not support collapsing multiple potential leak locations into one ten-year diagnosis or repair.',
      evidenceTitle:
        'GM Bulletin 01-06-01-011O - Engine Oil Consumption and Leak-Diagnosis Guidelines',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
    }),
    'cadillac-eldorado-nylon-fuel-rail-cracking-fuel-leak-fire-risk': {
      disposition: 'recall-dealer',
      decision:
        'Keep the underlying fuel-rail safety issue but replace its mixed citation set with exact VIN-gated NHTSA/GM campaign scope. This frozen record has no commerce.',
      evidence: [recallEvidence],
      after: {
        years: [1995, 1996, 1997],
        trims: [],
        engines: [],
        category: 'fuel',
        title:
          'Nylon Fuel Rail Can Crack and Leak Fuel (Recall 04V110)',
        description:
          'GM recall bulletin 04014E includes all 1995-1997 Cadillac Eldorado vehicles. Nylon fuel-rail tubing can degrade and crack, allowing gasoline to leak into the engine compartment and creating a fire risk near an ignition source.',
        solution:
          'Check the VIN and recall-completion history. The GM campaign directs Cadillac dealers to inspect the nylon engine fuel rail and replace it with a stainless-steel rail when required; confirm current campaign status before service.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: ['Open safety recall', 'Fuel odor', 'Engine-compartment fuel leak'],
        affectedSystems: ['engine fuel rail'],
        dtcCodes: [],
        citations: [
          {
            type: 'recall',
            title: recallEvidence.label,
            url: recallEvidence.url,
          },
        ],
        summary:
          'Replaced mixed secondary citations with exact Recall 04V110 / GM 04014E scope; the record remains VIN-first and contains no commerce.',
      },
    },
    'cadillac-eldorado-water-pump-drive-belt-tensioner-pulley-failure-causing-sudde':
      archived({
        oldTitle:
          'Water Pump Drive Belt and Tensioner Pulley Failure Causing Sudden Overheating',
        idSuffix: 'Water-Pump Belt and Tensioner Aggregation',
        years: [1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
        category: 'cooling',
        claims: 0,
        urls: 0,
        reason:
          'Forum and advice references do not establish one ten-year belt/tensioner failure population, sudden-overheating progression or universal parts remedy.',
      }),
  },
  expectedTelemetry: {
    claimCount: 3,
    urlCount: 3,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 8,
    'recall-dealer': 1,
  },
  expectedPublished: 1,
  expectedArchived: 8,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  if (
    issues.some((issue) =>
      issue.id ===
      'cadillac-eldorado-nylon-fuel-rail-cracking-fuel-leak-fire-risk'
        ? issue.after.status !== 'published' ||
          JSON.stringify(issue.after.years) !==
            JSON.stringify([1995, 1996, 1997])
        : issue.after.status !== 'archived',
    )
  ) {
    throw new Error('Cadillac Eldorado reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
