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

const mlsHeadGasketBulletin = {
  years: [1995, 1996, 1997, 1998, 1999, 2000],
  trims: ['JA-platform Stratus covered by TSB 09-08-99'],
  engines: ['2.4L gasoline I4'],
  category: 'engine',
  title: 'Composite Head-Gasket Replacement Requires the MLS Service Procedure (TSB 09-08-99)',
  description:
    'DaimlerChrysler TSB 09-08-99 covers 1995-2000 JA-platform Dodge Stratus vehicles with the 2.4L engine. It supersedes TSB 09-05-98 and specifies a multi-layer-steel head gasket for service where a composite gasket was previously installed. The bulletin warns that remaining gasket material, metal transfer, or gouged aluminum sealing surfaces can prevent the MLS gasket from sealing.',
  solution:
    'When diagnosis requires cylinder-head gasket replacement, follow TSB 09-08-99: remove old composite material without damaging the aluminum head or block, clean and inspect the sealing surfaces to the bulletin standard, use the listed MLS gasket and revised parts, and follow the bulletin’s installation and torque sequence.',
  severity: 'high',
  symptoms: ['A diagnosed head-gasket sealing problem requires replacement', 'Composite gasket material remains during cylinder-head service'],
  affectedSystems: ['cylinder-head gasket', 'cylinder head sealing surface', 'engine block sealing surface'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'DaimlerChrysler TSB 09-08-99 - Multi-Layer Steel Head Gasket Installation Procedures', url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bbff1d.pdf' }],
  summary:
    'Narrowed the twelve-year failure narrative to DaimlerChrysler TSB 09-08-99\'s exact 1995-2000 JA Stratus 2.4L scope and documented MLS installation requirements, removing unsupported prevalence, cause, symptom, and cooling-maintenance claims.',
};

const published = {
  'dodge-stratus-24l-head-gasket-1995': replacement(
    mlsHeadGasketBulletin,
    'Keep only what DaimlerChrysler TSB 09-08-99 establishes: the exact 1995-2000 JA/2.4L scope, MLS service gasket, surface-preparation risk, and installation procedure.',
  ),
};

const reasons = {
  'dodge-stratus-27l-sludge-2001':
    'The frozen card attributes six model years of 2.7L failure to oil drain-back, internal water-pump leakage, coolant/oil mixing, sludge, bearing starvation, mileage, and reputation using complaint sites only and no Chrysler primary source proving that complete causal chain.',
  'dodge-stratus-blend-door-2001':
    'The frozen card attributes six model years of temperature-control and clicking symptoms to a blend-door actuator from one video without a Chrysler bulletin defining the condition, diagnostic boundary, or remedy.',
  'dodge-stratus-trans-solenoid-pack-1995':
    'The frozen card combines 41TE and 42RLE transmissions, twelve model years, four solenoid functions, connector corrosion, multiple symptoms, service-access claims, and repair-cost framing while providing only an empty citation and no Dodge primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Stratus',
  make: 'Dodge',
  model: 'Stratus',
  slug: 'dodge-stratus',
  batchId: 'dodge-stratus-full-record-cohort-87-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '65f43337ab0234ca25694e7158e309c717fe068e9141dc311587b66a3e57d09c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-stratus/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgestratus_blind:manual-primary-source-gate',
    edge: 'dodgestratus_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V066000', '00V067000', '00V196000', '00V225002', '00V278000', '00V299002',
    '00V306000', '00V320002', '00V366000', '01V005002', '01V011002', '03V443000',
    '04V021000', '04V313000', '04V532000', '04V579000', '06E088000', '06E091000',
    '06V001000', '07E023000', '09E025000', '09E043000', '09E056000', '10E059000',
    '15V338000', '16V401000', '96V006000', '96V074000', '96V075000', '97V095000',
    '97V201000', '98V063000', '98V183000', '99V244000',
  ],
});
