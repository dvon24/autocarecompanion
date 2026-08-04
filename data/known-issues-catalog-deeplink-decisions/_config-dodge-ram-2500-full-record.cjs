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
  trims: ['Ram 2500 4x4 vehicles included by VIN in recall N62/13V-528'],
  engines: [],
  category: 'steering',
  title: 'Left Tie-Rod Assembly Can Break and Cause Loss of Steering (Recall 13V-528)',
  description:
    'NHTSA recall 13V-528 covers certain 2003-2008 Dodge Ram 2500 4x4 trucks manufactured from February 12, 2002 through February 13, 2008. The left tie-rod assembly may break, which can cause loss of steering control and increase the risk of a crash. The campaign supersedes the earlier 11V-350 tie-rod recall.',
  solution:
    'Check the VIN for recall N62/13V-528 even if recall 11V-350 was previously performed. Chrysler\'s remedy is inspection of the steering linkage and installation of a new left tie-rod assembly when required. General alignment work, a steering stabilizer, or replacing unrelated ball joints is not the recall remedy.',
  severity: 'high',
  symptoms: ['The tie-rod assembly may break without a reliable advance warning', 'Loss of steering control if the assembly fails'],
  affectedSystems: ['left tie-rod assembly', 'steering linkage'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 13V-528 - Failure of the Left Tie Rod Assembly', url: 'https://static.nhtsa.gov/odi/rcl/2013/RCAK-13V528-5875.pdf' }],
  summary:
    'Replaced the broad “death wobble” diagnosis and multi-part repair advice with recall 13V-528\'s exact 2003-2008 4x4 tie-rod breakage condition, loss-of-steering consequence, and recall remedy.',
};

const published = {
  'dodge-ram-2500-steering-shimmy-1994': replacement(
    tieRodRecall,
    'Replace the vendor/forum “death wobble” aggregation with recall 13V-528\'s manufacturer-defined Ram 2500 4x4 population, tie-rod failure mechanism, and steering-linkage remedy.',
  ),
};

const reasons = {
  'dodge-ram-2500-fuel-lift-pump-1998':
    'The frozen card combines mechanical and electric lift pumps, VP44 and CP3 injection systems, eleven model years, and an injection-pump damage claim from one video without a Dodge, Cummins, or Bosch primary source defining that population and causal chain.',
  'dodge-ram2500-47re-48re-trans-1994':
    'The frozen card combines two transmissions, sixteen model years, tuning, towing, heat, clutch, converter, governor, and design-capacity claims from repair sellers and forums without a Dodge primary source defining one failure mechanism and remedy.',
  'dodge-ram2500-ball-joint-failure-1994':
    'The frozen card attributes sixteen model years of ball-joint wear to diesel-engine weight and vehicle use, adds mileage and wheel-separation claims, and relies on aftermarket vendors and a forum rather than a Dodge bulletin; the exact tie-rod recall is retained separately.',
  'dodge-ram2500-killer-dowel-pin-1994':
    'The frozen card asserts a nine-year 12-valve/24-valve Cummins failure population, catastrophic damage outcomes, costs, and an aftermarket retaining-tab remedy from forums, media, and parts sellers without a Cummins or Dodge primary service publication.',
};

module.exports = buildConfig({
  label: 'Dodge Ram 2500',
  make: 'Dodge',
  model: 'Ram 2500',
  slug: 'dodge-ram-2500',
  batchId: 'dodge-ram-2500-full-record-cohort-81-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '6038b00aa581a7f71342ac985f3e4f13aa67ac78df96b8d1ba68ecb17ab149e5',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-ram-2500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeram2500_blind:manual-primary-source-gate',
    edge: 'dodgeram2500_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '01V153000', '03V033000', '03V212000', '03V503000', '04V221000', '05V462000',
    '06E024000', '06V038000', '07E009000', '07E104000', '07V093000', '07V247000',
    '08E027000', '08V641000', '09V005000', '10E013000', '11V350000', '13V528000',
    '13V529000', '14V770000', '14V795000', '15V312000', '15V313000', '16V352000',
  ],
});
