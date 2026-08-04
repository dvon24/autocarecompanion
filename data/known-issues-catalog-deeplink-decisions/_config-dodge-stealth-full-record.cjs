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

const transferCaseRecall = {
  years: [1991, 1992, 1993, 1994, 1995, 1996],
  trims: ['All-wheel-drive vehicles included by VIN in recall B17/02V-143'],
  engines: [],
  category: 'drivetrain',
  title: 'AWD Transfer-Case Oil Leak Can Cause Drivetrain Lockup (Recall 02V-143)',
  description:
    'DaimlerChrysler recall B17/NHTSA 02V-143 covers certain 1991-1996 Dodge Stealth all-wheel-drive vehicles built by Mitsubishi. Oil can leak from the transfer case. If the level becomes low, the transfer-case bearings can be damaged and the drivetrain can lock up, increasing crash risk.',
  solution:
    'Check the VIN for recall B17/02V-143 and confirm completion. Dealers inspect the transfer case for oil leakage. A unit with no leakage receives fresh transfer-case oil; a leaking unit is resealed or replaced as necessary. Tire matching, performance modifications, or replacing a viscous coupling is not the recall remedy.',
  severity: 'high',
  symptoms: ['Transfer-case oil leakage', 'Low transfer-case oil level', 'Potential drivetrain lockup after bearing damage'],
  affectedSystems: ['all-wheel-drive transfer case', 'transfer-case seals', 'transfer-case bearings'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 02V-143 - AWD Transfer-Case Oil Leakage', url: 'https://www.nhtsa.gov/recalls?nhtsaId=02V143002' }],
  summary:
    'Replaced the forum-based viscous-coupling and modification narrative with recall B17/02V-143\'s exact six-year AWD oil-leak condition, lockup consequence, and inspection/reseal/replacement remedy.',
};

const published = {
  'dodge-stealth-awd-transfer-case-1991': replacement(
    transferCaseRecall,
    'Replace the broad transfer-case modification, fluid-age, viscous-coupling, tire, and parts-availability claims with recall B17/02V-143\'s exact AWD leak defect and remedy.',
  ),
};

const reasons = {
  'dodge-stealth-6g72-timing-belt-1991':
    'The frozen card combines SOHC, DOHC twin-turbo, timing and balance belts, maintenance intervals, interference damage, and catastrophic outcomes across six model years without any citation or Dodge/Mitsubishi primary source.',
  'dodge-stealth-active-exhaust-failure-1991':
    'The frozen card combines trims, rust, carbon, valves, vacuum hardware, power loss, a check-engine light, platform sharing, and an emissions-altering removal recommendation across six years while providing only an empty citation and no manufacturer source.',
  'dodge-stealth-ecu-capacitor-1991':
    'The frozen card attributes six model years of no-start, rough idle, and stalling to leaking ECU capacitors from a placeholder video URL and platform generalization without a Dodge or Mitsubishi primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Stealth',
  make: 'Dodge',
  model: 'Stealth',
  slug: 'dodge-stealth',
  batchId: 'dodge-stealth-full-record-cohort-86-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'fc717802e482bb331535544cad3cb0f4339cbd1dd4ec0814cffe5da895d70ae9',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-stealth/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgestealth_blind:manual-primary-source-gate',
    edge: 'dodgestealth_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: ['02V143002', '93V033001', '95V103003', '96V143003'],
});
