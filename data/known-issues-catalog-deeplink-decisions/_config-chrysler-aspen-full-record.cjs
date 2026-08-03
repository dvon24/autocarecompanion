const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const pinionNut = {
  years: [2009],
  trims: ['Vehicles with a 9.25 or C235 rear axle included in recall N08 / 13V-038; verify by VIN'],
  engines: [],
  category: 'drivetrain',
  title: 'Rear-Axle Pinion Nut Can Loosen (Recall 13V-038)',
  description: 'Recall N08 / 13V-038 covers certain 2009 Chrysler Aspen vehicles with a 9.25 or C235 rear axle. Undersized pinion-shaft splines can allow relative motion between the pinion nut and companion flange, loosening the nut. The rear axle can seize or the driveshaft can separate, causing loss of motive power or vehicle control with little warning. The frozen card incorrectly included 2007 and 2008.',
  solution: 'Check the VIN for open recall N08. A Chrysler dealer inspects the rear-axle pinion nut and installs the specified retainer ring under the recall at no charge; the service instructions direct additional axle repair when inspection finds a loose nut or damage. Do not assume rear-end noise on a non-recalled Aspen has this cause.',
  severity: 'high',
  symptoms: ['VIN included in recall N08', 'Loose rear-axle pinion nut', 'Rear axle can seize', 'Driveshaft can separate with loss of motive power'],
  affectedSystems: ['rear-axle pinion shaft splines', 'pinion nut and companion flange', 'rear axle and driveshaft'],
  sources: [{ type: 'recall', title: 'Chrysler Safety Recall N08 / NHTSA 13V-038 - Rear Axle Pinion Nut', url: 'https://static.nhtsa.gov/odi/rcl/2013/RCONL-13V038-0123.pdf' }],
  summary: 'Corrected the card from 2007-2009 to recall N08\'s exact 2009 axle population and documented the undersized-spline mechanism, safety consequences, inspection and retainer remedy.',
};

const published = {
  'chrysler-aspen-rear-diff-2007': {
    disposition: 'replace',
    decision: 'Replace the three-year rear-differential aggregation with recall N08 / 13V-038\'s exact 2009 axle population, mechanism and remedy.',
    evidence: pinionNut.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: pinionNut.years,
      trims: pinionNut.trims,
      engines: [],
      category: pinionNut.category,
      title: pinionNut.title,
      description: pinionNut.description,
      solution: pinionNut.solution,
      severity: pinionNut.severity,
      confidence: 'high',
      symptoms: pinionNut.symptoms,
      affectedSystems: pinionNut.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: pinionNut.sources,
      source: 'nhtsa-verified',
      summary: pinionNut.summary,
    },
  },
};

const reasons = {
  'chrysler-aspen-control-arm-bushing-2007': 'The frozen three-year lower-control-arm bushing card relies on owner and aftermarket material without a Chrysler/NHTSA source defining an affected population, failure mechanism, or universal replacement.',
  'chrysler-aspen-hemi-exhaust-tick-2007': 'The frozen 5.7L exhaust-manifold-bolt claim is supported by secondary/aftermarket material and lacks a Chrysler/NHTSA bulletin establishing the full 2007-2009 population and repair.',
  'chrysler-aspen-hemi-tick-2007': 'The frozen HEMI MDS lifter/cam card combines a mechanical theory, mileage range, and replacement package without a qualifying Chrysler/NHTSA primary source for the Aspen population.',
  'chrysler-aspen-tipm-2007': 'The frozen TIPM card aggregates unrelated no-start, fuel-pump, lighting, wiper, and battery symptoms across all Aspen years without a single primary-source defect or universal module remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler Aspen',
  make: 'Chrysler',
  model: 'Aspen',
  slug: 'chrysler-aspen',
  batchId: 'chrysler-aspen-full-record-cohort-51-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'de22427bd0dee505f56c060276b89ef5901bb71d50ca8a1a2aba935d65b11053',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-aspen/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chrysleraspen_blind:manual-primary-source-gate',
    edge: 'chrysleraspen_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '06V386000',
    '15V313000',
    '16V352000',
    '16V947000',
    '18V021000',
  ],
});
