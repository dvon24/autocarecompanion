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
  trims: ['PL-platform Neon with a naturally aspirated 2.0L SOHC or DOHC engine'],
  engines: ['2.0L naturally aspirated SOHC I4', '2.0L naturally aspirated DOHC I4'],
  category: 'engine',
  title: 'Composite Head-Gasket Replacement Requires the MLS Service Procedure (TSB 09-08-99)',
  description:
    'DaimlerChrysler TSB 09-08-99 covers 1995-2000 PL-platform Neon vehicles with naturally aspirated 2.0L SOHC or DOHC engines. It supersedes TSB 09-05-98 and specifies a multi-layer-steel head gasket for service where a composite gasket was previously installed. The bulletin warns that remaining gasket material, metal transfer, or gouged aluminum sealing surfaces can prevent the MLS gasket from sealing.',
  solution:
    'When cylinder-head service requires gasket replacement, follow TSB 09-08-99: remove old composite material without damaging the aluminum head or block, clean the surfaces to the bulletin standard, check flatness, use the listed MLS gasket and revised parts, and follow the bulletin’s installation sequence and torque procedure.',
  severity: 'high',
  symptoms: ['A diagnosed head-gasket sealing problem requires replacement', 'Composite gasket material remains during cylinder-head service'],
  affectedSystems: ['cylinder-head gasket', 'cylinder head sealing surface', 'engine block sealing surface'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'DaimlerChrysler TSB 09-08-99 - Multi-Layer Steel Head Gasket Installation Procedures', url: 'https://starparts.chrysler.com/tsb/en_us/dto/pbd2/08/00/22/080022dc80bbff1d.pdf' }],
  summary:
    'Narrowed the head-gasket card to DaimlerChrysler TSB 09-08-99\'s exact 1995-2000 naturally aspirated 2.0L scope and documented MLS installation requirements, removing unsupported failure-rate, mileage, cause, and cost claims.',
};

const lowerControlArmRecall = {
  years: [2000],
  trims: ['Vehicles included by VIN in recall 841/99V-114'],
  engines: [],
  category: 'suspension',
  title: 'Lower-Control-Arm Pivot-Tube Weld Can Separate (Recall 99V-114)',
  description:
    'NHTSA recall 99V-114 covers certain 2000 Dodge Neon passenger cars. The front lower control arm may have been inadequately welded between the pivot tube and the arm. Separation can cause a loss of vehicle control.',
  solution:
    'Check the VIN for recall 99V-114 and confirm completion. DaimlerChrysler\'s remedy is replacement of the affected lower control arm. Do not treat rust repair, bushing replacement, or a general suspension inspection as a substitute for the recall remedy.',
  severity: 'high',
  symptoms: ['The weld defect may not provide a reliable warning before separation', 'Loss of vehicle control if the pivot tube separates from the control arm'],
  affectedSystems: ['front lower control arm', 'control-arm pivot tube', 'control-arm weld'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 99V-114 - Inadequately Welded Front Lower Control Arms', url: 'https://www.nhtsa.gov/recalls?nhtsaId=99V114000' }],
  summary:
    'Corrected the frozen card\'s inaccurate 1995-1996 corrosion framing to recall 99V-114\'s actual 2000 lower-control-arm pivot-tube weld defect and replacement remedy.',
};

const published = {
  'dodge-neon-2-0l-head-gasket-failure-sohc-dohc': replacement(
    mlsHeadGasketBulletin,
    'Keep only what DaimlerChrysler TSB 09-08-99 establishes: the exact vehicle/engine scope, MLS service gasket, surface-preparation risk, and installation procedure.',
  ),
  'dodge-neon-body-subframe-corrosion-rockers-rear-quarters-1995-1996-lowe': replacement(
    lowerControlArmRecall,
    'Replace the mixed rust, subframe, bushing, ball-joint, and incorrectly dated recall aggregation with NHTSA recall 99V-114\'s exact 2000 control-arm weld defect.',
  ),
};

const reasons = {
  'dodge-neon-3-speed-torqueflite-automatic-durability-problems':
    'The frozen card combines governor, sprag, clutch, band, cooling, and fluid-maintenance theories across five years from an enthusiast site and complaint aggregator without a Chrysler bulletin defining one failure mechanism and remedy.',
  'dodge-neon-cooling-system-weakness-water-pump-thermostat-collapsing-low':
    'The frozen card combines water-pump, thermostat, hose, trapped-air, and head-gasket claims across five years from a forum and trade article without one manufacturer bulletin defining that population, diagnosis, and remedy.',
  'dodge-neon-head-gasket-1995':
    'This is a broader duplicate of the separately retained TSB-backed MLS service card and adds eleven model years, coolant-loss symptoms, engine-variant prevalence, and a generic diagnosis from secondary sources that TSB 09-08-99 does not establish.',
  'dodge-neon-interference-engine-timing-belt-hydraulic-tensioner-failure':
    'The frozen card combines timing-belt age, hydraulic-tensioner failure, interference damage, symptoms, and a replacement interval across two engines and five years from a repair article and forum without a Dodge primary source proving the full claim.',
  'dodge-neon-rear-suspension-clunk-1995':
    'The frozen card attributes rear clunking across eleven model years to trailing-arm bushings and prescribes replacement from a single video without a Chrysler bulletin defining the condition or affected population.',
  'dodge-neon-srt4-turbo-oil-2003':
    'The frozen card attributes 2003-2005 SRT-4 turbo failure to oil-feed restriction with mileage and replacement costs from aftermarket vendor articles and a turbo seller, without a Chrysler bulletin defining that failure mode.',
  'dodge-neon-timing-belt-2000':
    'The frozen card claims every Neon engine is interference-type, assigns a universal 100,000-mile belt interval, requires water-pump replacement, and predicts engine destruction from forums and a secondary guide without a manufacturer primary source covering that complete scope.',
};

module.exports = buildConfig({
  label: 'Dodge Neon',
  make: 'Dodge',
  model: 'Neon',
  slug: 'dodge-neon',
  batchId: 'dodge-neon-full-record-cohort-77-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '977c64eeae2b2bc7750e9e8179d611a42d5c0de1659a7433e042542470e2b051',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-neon/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeneon_blind:manual-primary-source-gate',
    edge: 'dodgeneon_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V194000', '00V366000', '00V415000', '01V039000', '01V154000', '06E026000',
    '06E049000', '06E060000', '08E033000', '08E050000', '09E012000', '09E025000',
    '94V026000', '94V033000', '94V034000', '96V026000', '96V075000', '96V228000',
    '97V080000', '97V169000', '99V001000', '99V043000', '99V114000',
  ],
});
