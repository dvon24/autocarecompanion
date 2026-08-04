const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const tieRodRecall = {
  years: [2003, 2004, 2005, 2006, 2007, 2008],
  trims: ['Ram 3500 4x4; 2007-2008 Ram 3500 4x2 Cab Chassis; recall N62/13V-528 eligibility must be verified by VIN'],
  engines: [],
  category: 'steering',
  title: 'Left Tie-Rod Assembly Can Break and Cause Loss of Steering (Recall 13V-528)',
  description:
    'NHTSA recall 13V-528 covers certain 2003-2008 Dodge Ram 3500 4x4 trucks and certain 2007-2008 Ram 3500 4x2 Cab Chassis vehicles manufactured from February 12, 2002 through February 13, 2008. The left tie-rod assembly may break, causing loss of steering control and increasing crash risk. The campaign supersedes the earlier 11V-350 tie-rod recall.',
  solution:
    'Check the VIN for recall N62/13V-528 even if recall 11V-350 was previously performed. Chrysler\'s remedy is inspection of the steering linkage and installation of a new left tie-rod assembly when required. A steering stabilizer, alignment, or replacement of unrelated worn components is not the recall remedy.',
  severity: 'high',
  symptoms: ['The tie-rod assembly may break without a reliable advance warning', 'Loss of steering control if the assembly fails'],
  affectedSystems: ['left tie-rod assembly', 'steering linkage'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 13V-528 - Failure of the Left Tie Rod Assembly', url: 'https://static.nhtsa.gov/odi/rcl/2013/RCAK-13V528-5875.pdf' }],
  summary:
    'Narrowed the forum-based steering-wear and “death wobble” aggregation to recall 13V-528\'s exact 2003-2008 Ram 3500 configurations, tie-rod failure mechanism, and recall remedy.',
};

const published = {
  'dodge-ram-3500-steering-linkage-2003': replacement(
    tieRodRecall,
    'Replace the multi-component wear diagnosis and lift-related “death wobble” claim with recall 13V-528\'s manufacturer-defined tie-rod defect, configuration scope, and steering-linkage remedy.',
  ),
};

const reasons = {
  'dodge-ram-3500-front-axle-u-joint-1994':
    'The frozen card attributes fifteen model years of front-axle U-joint wear to heavy use, axle angles, lifts, and accessories but provides no citation or Dodge/Dana primary source defining a defect population and remedy.',
  'dodge-ram-3500-steering-gear-box-1994':
    'The frozen card asserts fifteen model years of steering-gear seal leakage and play, attributes it to weight and solid-axle design, and predicts pump damage without any citation or Dodge primary source.',
  'dodge-ram3500-kdp-cummins-1994':
    'The frozen card asserts a nine-year Cummins dowel-pin failure population, no-warning catastrophic engine damage, universal urgency, costs, and an aftermarket retaining-tab procedure from enthusiast and vendor sources without a Cummins or Dodge primary publication.',
  'dodge-ram3500-rear-axle-seal-leak-1994':
    'The frozen card combines two axle families, sixteen model years, multiple seal locations, towing/load causes, brake contamination, and symptoms while providing only an empty citation and no Dodge, Dana, or AAM primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Ram 3500',
  make: 'Dodge',
  model: 'Ram 3500',
  slug: 'dodge-ram-3500',
  batchId: 'dodge-ram-3500-full-record-cohort-82-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '37c76cff48e996f943d6c99418650d3f4bdc6c098da1616f3d47a7e29dd4c784',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-ram-3500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeram3500_blind:manual-primary-source-gate',
    edge: 'dodgeram3500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '01V153000', '03V033000', '03V212000', '05V462000', '06V038000', '06V073000',
    '06V341000', '06V380000', '07E009000', '07E104000', '07V472000', '08E027000',
    '08V344000', '08V641000', '09V005000', '09V434000', '10E013000', '11V350000',
    '13V528000', '13V529000', '14V770000', '14V795000', '15V312000', '15V313000',
    '16V352000', '99V024000',
  ],
});
