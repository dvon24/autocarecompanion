const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const strutMountRecall = {
  type: 'recall',
  title: 'NHTSA Recall 10E002 - Aftermarket Front Strut Mount Missing Weld',
  url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=10E002000',
};

const published = {
  'chevrolet-prizm-rear-strut-mount': {
    disposition: 'replace',
    decision: 'Replace the unsupported model-wide rear-strut wear card with exact NHTSA equipment recall 10E002. The campaign applies only to certain aftermarket Gabriel Ride Control or ArvinMeritor front strut mounts, not original GM equipment. Remove both generic Monroe and Moog retailer searches because neither identifies the recalled manufacturer or part number.',
    evidence: [
      {
        type: strutMountRecall.type,
        label: strutMountRecall.title,
        url: strutMountRecall.url,
      },
    ],
    after: {
      years: [1998, 1999, 2000, 2001, 2002],
      trims: [],
      engines: [],
      category: 'suspension',
      title: 'Certain Aftermarket Front Strut Mounts Can Separate (Recall 10E002)',
      description: 'NHTSA equipment recall 10E002 includes 1998-2002 Chevrolet Prizm applications fitted with certain aftermarket Gabriel Ride Control or ArvinMeritor front strut mounts, part numbers 142435, 142193, 142305 or 142303. A recalled mount may be missing the weld between its bearing housing and rate plate. Under extreme driving conditions, the strut can move out of its mounting position, damage nearby components and increase crash risk. NHTSA states that this campaign does not concern original equipment installed by General Motors.',
      solution: 'Inspect service records and the front strut-mount markings before assuming the campaign applies. If one of the listed Gabriel Ride Control or ArvinMeritor part numbers is installed, contact the recall manufacturer or NHTSA for campaign 10E002 remedy status. The campaign remedy replaces an affected aftermarket mount free of charge. Do not replace unrelated rear mounts or buy a generic quick-strut from this card.',
      severity: 'high',
      confidence: 'high',
      symptoms: [
        'The recalled mount may have no reliable warning before separation',
        'Front strut shifts out of its mounting position under extreme driving conditions',
        'Damage to components surrounding the front strut mount',
      ],
      affectedSystems: [
        'aftermarket front strut mount bearing housing and rate plate',
        'front strut mounting position and nearby suspension components',
      ],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: [
        {
          type: strutMountRecall.type,
          title: strutMountRecall.title,
          url: strutMountRecall.url,
        },
      ],
      source: 'nhtsa-verified',
      summary: 'Replaced the unsupported rear-strut wear card with exact aftermarket equipment recall 10E002, clearly excluded original GM equipment, and removed two unrelated commerce searches.',
    },
  },
};

const reasons = {
  'chevrolet-prizm-oil-consumption': 'The frozen card cross-applies a Toyota bulletin to every 1998-2002 Chevrolet Prizm without an exact Prizm bulletin, bounded production population or authoritative support for the asserted consumption rate, piston-ring mechanism, oil-viscosity substitution or universal ring replacement. Current NHTSA recall and manufacturer-communication research does not substantiate those claims. The Mobil 1 and Wix searches neither diagnose the condition nor establish a repair.',
  'chevrolet-prizm-oxygen-sensor': 'The frozen card describes a normal high-mileage diagnostic possibility as a model-wide failure and supplies no identifiable owner reports, campaign, DTC scope, sensor position or tested failure mechanism. Current NHTSA recall and manufacturer-communication research does not substantiate the 1998-2002 universal claim, and the generic Denso search does not prove fitment or diagnosis.',
};

module.exports = buildConfig({
  label: 'Chevrolet Prizm',
  make: 'Chevrolet',
  model: 'Prizm',
  slug: 'chevrolet-prizm',
  batchId: 'chevrolet-prizm-full-record-cohort-29-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '2eb333fe4f2202266356a54db7f7ab0a8d3e92638ec8d9ccd6bb58756534ba78',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-prizm/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletprizm_blind:self-no-blocker',
    edge: 'chevroletprizm_edge:self-no-blocker',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
