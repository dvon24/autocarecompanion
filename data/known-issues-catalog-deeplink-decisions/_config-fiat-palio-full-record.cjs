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

const alternatorRecall = {
  years: [2016, 2017],
  trims: [],
  engines: [],
  category: 'electrical',
  title: 'Alternator Failure Can Cause Unexpected Engine Shutdown (Brazil Recall)',
  description:
    'PROCON-SP reported Fiat\'s May 2017 Brazilian recall for all versions of affected 2016-2017 Novo Palio vehicles produced in Brazil or Argentina, Palio Fire, and Palio Weekend vehicles, among other Fiat models. An alternator failure can make the engine run irregularly and, in an extreme case, shut down unexpectedly while driving, increasing collision risk.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. The recall procedure is to inspect the alternator and replace it if necessary at no charge. Keep proof of recall completion with the vehicle records.',
  severity: 'high',
  symptoms: ['Irregular engine operation', 'Unexpected engine shutdown while driving'],
  affectedSystems: ['alternator', 'charging system', 'engine electrical supply'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'PROCON-SP - Fiat Alternator Recall for 2016-2017 Models', url: 'https://www.procon.sp.gov.br/fiat-comunica-recall/' }],
  source: 'manual',
  summary:
    'Rewrote the recall card directly from PROCON-SP: exact 2016-2017 Brazilian recall scope, alternator failure consequence, and free inspection/replacement, removing secondary counts and unrelated charging advice.',
};

const seatBeltRecall = {
  years: [2012, 2013],
  trims: ['Palio Fire equipped with dual front airbags'],
  engines: [],
  category: 'safety',
  title: 'Front Seat-Belt Buckles Can Rupture in a Crash (Brazil Recall)',
  description:
    'Fiat\'s July 2013 Brazilian recall covers Palio Fire vehicles produced in 2012-2013 and equipped with dual front airbags, as part of a 3,029-vehicle campaign that also included Strada variants. A manufacturing fault in a specific batch of front seat-belt buckles can compromise their operation; in a crash, a buckle may rupture and intensify occupant contact with the inflated airbag, causing injury.',
  solution:
    'Check recall completion by VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s recall remedy is free replacement of the front seat-belt buckles. Keep the completed-recall document with the vehicle records.',
  severity: 'high',
  symptoms: ['Latent seat-belt-buckle defect may only become apparent during a collision'],
  affectedSystems: ['front seat-belt buckles', 'occupant restraint system', 'front airbags'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Fiat/Stellantis - Recall for 2012-2013 Palio Fire and Strada Fire with Airbags', url: 'https://www.media.stellantis.com/br-pt/fiat/press/recall-para-palio-fire-e-strada-fire-2012-e-2013-equipados-com-air-bag' }],
  source: 'manual',
  summary:
    'Corrected the frozen anchor-fastener narrative to Fiat\'s actual front-buckle recall, preserving only the 2012-2013 dual-airbag Palio Fire scope, crash consequence, and free replacement.',
};

const published = {
  'fiat-palio-official-recall-defective-alternator-can-cause-unexpected-en': replacement(
    alternatorRecall,
    'Retain the safety recall using the PROCON-SP primary government notice, limited to its exact models, years, failure consequence, and Fiat inspection/replacement remedy.',
  ),
  'fiat-palio-official-recall-front-seat-belt-anchor-fasteners-can-rupture': replacement(
    seatBeltRecall,
    'Retain the recall only after correcting the component from anchor fasteners to front seat-belt buckles and narrowing the population to Fiat\'s 2012-2013 dual-airbag Palio Fire notice.',
  ),
};

const reasons = {
  'fiat-palio-cooling-system-weak-points-water-pump-impeller-failure-therm':
    'The frozen card combines 17 model years, unspecified engines, pump-impeller loss, thermostat housing and seal leakage, head-gasket escalation, maintenance intervals, and repair procedures from trade press and a forum without a Fiat primary publication defining that population.',
  'fiat-palio-electronic-throttle-body-wear-causes-power-loss-erratic-idle':
    'The frozen card applies one throttle-body gear, sensor, harness, pedal, and relearn narrative to 17 years and unspecified engines from trade articles, blogs, and forums without a Fiat bulletin defining the affected hardware and remedy.',
  'fiat-palio-fire-engine-valve-train-neglect-30-000-km-valve-adjustments':
    'The frozen card merges scheduled maintenance, sump capacity, sludge, camshaft wear, valve-guide wear, head-gasket failure, oil intervals, flushing, and machining advice across 17 years using secondary sources instead of an exact Fiat owner or service publication.',
  'fiat-palio-rear-twist-beam-axle-develops-cracks-without-impact':
    'The frozen card turns owner complaints, litigation language, repair quotes, and a recall for different Fiat models into a 15-year Palio structural-defect claim; no Fiat or Brazilian recall source establishes that Palio population or replacement remedy.',
};

module.exports = buildConfig({
  label: 'Fiat Palio',
  make: 'Fiat',
  model: 'Palio',
  slug: 'fiat-palio',
  batchId: 'fiat-palio-full-record-cohort-94-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '5ca404fc14b56ec301397f31b94d277ceafb50aee91dd78098f85ed184e5f30e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-palio/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiatpalio_blind:manual-primary-source-gate',
    edge: 'fiatpalio_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
