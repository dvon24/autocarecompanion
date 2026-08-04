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
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const sparkPlugEjection = {
  years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004],
  trims: ['Vehicles equipped with affected Triton V8 or V10 engines'],
  engines: ['4.6L Triton V8', '5.4L Triton V8', '6.8L Triton V10'],
  category: 'engine',
  title: 'Spark Plug Can Detach From or Eject Out of a Triton V8/V10 Cylinder Head',
  description:
    'NHTSA defect-petition review DP05-005 examined spark-plug detachment and ejection in 1997-2004 Ford vehicles equipped with Triton V8 or V10 engines. By January 2007, ODI had identified 652 non-duplicate complaints across the reviewed Ford population. The typical event involved a spark plug detaching from the cylinder head while driving, with engine noise and loss of one cylinder rather than a complete stall.',
  solution:
    'If a plug detaches or ejects, stop and have the cylinder head, plug threads, ignition coil, and affected cylinder inspected by a qualified Ford or engine-repair specialist before further driving. NHTSA denied the petition and did not order a safety recall; its reexamination found no injuries or fatalities and reported that most events did not stall the engine. Confirm the exact engine and build before selecting a thread-repair or cylinder-head procedure.',
  severity: 'medium',
  symptoms: ['Loud engine noise when a spark plug detaches or ejects', 'Misfire or operation with one cylinder lost', 'Spark plug detached from the cylinder head'],
  affectedSystems: ['Triton V8 or V10 cylinder head spark-plug threads', 'spark plug', 'affected ignition coil'],
  dtcCodes: [],
  sources: [
    { type: 'nhtsa', title: 'NHTSA DP05-005 Final Decision - Ford Triton Spark-Plug Ejection', url: 'https://static.nhtsa.gov/odi/inv/2005/INFD-DP05005-23649P.PDF' },
    { type: 'nhtsa', title: 'NHTSA DP05-005 Reexamination Memorandum', url: 'https://static.nhtsa.gov/odi/inv/2005/INME-DP05005-25227.pdf' },
  ],
  source: 'manual',
  summary:
    'Replaced secondary repair-site citations with NHTSA\'s formal petition review, narrowed the card from 1997-2008 to 1997-2004, and stated the observed event pattern and no-recall outcome without repeating unsubstantiated fire or universal-stall claims.',
};

const published = {
  'ford-eseries-sparkplug-blowout-1997': replacement(sparkPlugEjection, 'Retain the condition only within NHTSA DP05-005\'s 1997-2004 Triton V8/V10 review scope and replace all secondary repair-site citations.'),
};

const reasons = {
  'ford-eseries-door-hinge-2003':
    'The frozen card contains only blank citation entries and applies hinge-pin wear, door sag, difficult latching, noise, body contact, and uneven gaps to every 2003-2014 E-Series without a Ford bulletin, investigation, or recall defining that population.',
  'ford-eseries-idle-air-control-1997':
    'The frozen card relies on a placeholder YouTube URL and applies sticking idle-air-control valves, erratic idle, stalling, surging, and high idle to eight model years and two engines without a Ford service publication defining the condition.',
  'ford-eseries-rear-ac-leak-2000':
    'The frozen card has no citations and applies rear evaporator and refrigerant-line leaks, warm rear air, repeated low charge, and hissing to every 2000-2014 E-Series without a Ford bulletin, investigation, or recall identifying the affected HVAC configuration.',
  'ford-eseries-transmission-cooler-line-2000':
    'The frozen card contains only blank citation entries and turns cooler-line hose degradation into a 15-year fluid-leak, slip, delay, odor, low-fluid, and overheat pattern without an exact Ford bulletin, campaign, transmission, build range, or hose location.',
};

module.exports = buildConfig({
  label: 'Ford E-Series',
  make: 'Ford',
  model: 'E-Series',
  slug: 'ford-e-series',
  batchId: 'ford-e-series-full-record-cohort-104-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'dab989480ce93059ca175a6d338b081fd7d3a83d84cc2a49310b2656a64975c5',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-e-series/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordeseries_blind:manual-primary-source-gate',
    edge: 'fordeseries_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
