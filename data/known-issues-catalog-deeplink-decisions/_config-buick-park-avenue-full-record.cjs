const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const fuelRegulator = {
  type: 'recall',
  title: 'GM Recall 03054B / NHTSA 04V090 - Fuel Pressure Regulator',
  url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V090-6207.pdf',
};

module.exports = buildConfig({
  label: 'Buick Park Avenue',
  model: 'Park Avenue',
  slug: 'buick-park-avenue',
  batchId: 'buick-park-avenue-full-record-cohort-9-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    'c02bd49d1e7e75654281c32190b5903f13b5769d7779059c8a73852593d3734f',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-park-avenue/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickparkavenue_blind:self-no-blocker',
    edge: 'buickparkavenue_edge:self-no-blocker',
  },
  published: {
    'buick-3800-lower-intake-gasket-park-avenue': {
      disposition: 'replace',
      decision:
        'Replace the citation-free 1995-2005 lower-intake-gasket aggregation, cross-model claims, aftermarket part, cost range, coolant substitution and catastrophic-damage advice with the exact Park Avenue fuel-pressure-regulator safety recall.',
      evidence: [
        {
          type: fuelRegulator.type,
          label: fuelRegulator.title,
          url: fuelRegulator.url,
        },
      ],
      after: {
        years: [1998, 1999, 2000],
        trims: [],
        engines: ['3.8L V6 RPO L36 / VIN K'],
        category: 'fuel',
        title: 'Fuel Pressure Regulator Can Leak and Cause Fire (Recall 04V090)',
        description:
          'GM Recall 03054B, NHTSA 04V090, covers certain 1998-2000 Buick Park Avenue vehicles with the 3.8L V6 L36 engine and affected fuel-pressure regulators. A leaking diaphragm can send fuel through a vacuum line into the intake manifold. During a failed start with a low battery, the fuel and a mistimed spark can backfire, rupture the intake, displace a fuel line or injector and create a fuel leak and fire risk.',
        solution:
          'Check the VIN for recall completion. The no-charge recall remedy replaces the fuel-pressure regulator with the improved part. A slow crank, difficult start, poor drivability or malfunction indicator should be inspected promptly, but only the VIN check determines recall inclusion.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Slow cranking or difficult starting',
          'Poor drivability or malfunction indicator from a leaking regulator',
          'Loud intake backfire with possible fuel leak or fire',
        ],
        affectedSystems: ['fuel pressure regulator', 'intake manifold and fuel rail'],
        dtcCodes: [],
        citations: [
          {
            type: fuelRegulator.type,
            title: fuelRegulator.title,
            url: fuelRegulator.url,
          },
        ],
        summary:
          'Replaced an unsupported decade-wide lower-intake-gasket card with the exact 1998-2000 L36 fuel-pressure-regulator recall and removed aftermarket, cost, coolant and damage claims.',
      },
    },
  },
  proposalCampaigns: [],
});
