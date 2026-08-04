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

const ecmRecall = {
  years: [2025],
  trims: ['Nova Strada within chassis range SYF98007-SYG52837'],
  engines: [],
  category: 'electrical',
  title: 'ECM Water Intrusion Can Shut Down the Engine While Driving (Brazil Recall)',
  description:
    'Stellantis\'s May 2025 Brazilian recall covers 2025-model-year Nova Strada vehicles within the listed non-sequential chassis range. Water may enter the engine control module (ECM), creating a risk that the engine will shut down unexpectedly while the vehicle is moving and increasing the risk of a crash and injury.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s recall remedy is free replacement of the ECM. The official notice estimates approximately one hour for the service and advises scheduling it with a dealer.',
  severity: 'high',
  symptoms: ['Unexpected engine shutdown while driving'],
  affectedSystems: ['engine control module', 'engine management system'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Stellantis Brazil - May 2025 Fiat ECM Recall', url: 'https://www.media.stellantis.com/br-pt/corporate/press/comunicado-de-recall-modelos-marca-fiat' }],
  source: 'manual',
  summary:
    'Rewrote the card from Stellantis\'s primary notice: exact 2025 Nova Strada chassis scope, ECM water-intrusion consequence, and free replacement, removing unsupported build dates, weather anecdotes, warning symptoms, and discovery claims.',
};

const bodyBoltRecall = {
  years: [2024, 2025],
  trims: ['Nova Strada within chassis range RYF16242-SYF59556'],
  engines: [],
  category: 'safety',
  title: 'Upper Body Fixing Bolt May Be Missing (Brazil Recall)',
  description:
    'Fiat\'s September 2024 Brazilian recall covers 2024-2025 Nova Strada vehicles within the listed non-sequential chassis range. On some recalled vehicles, an upper body fixing bolt may be absent. In a collision, the missing bolt can permit unexpected body deformation and increase the risk of serious or fatal occupant injury.',
  solution:
    'Check the VIN with Fiat Brazil or an authorized Fiat dealer. Fiat\'s campaign calls for a free inspection for the missing upper body fixing bolt and correction when required. Some vehicles in the same campaign also require a parking-brake-lever inspection or replacement; the official notice estimates approximately two hours when both repairs are needed.',
  severity: 'high',
  symptoms: ['Latent assembly defect may only affect vehicle performance during a collision'],
  affectedSystems: ['upper body structure', 'occupant crash protection'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Stellantis Brazil - September 2024 Fiat Recall', url: 'https://www.media.stellantis.com/br-pt/corporate/press/comunicado-de-recall-fiat' }],
  source: 'manual',
  summary:
    'Corrected the chassis endpoint and rewrote the card from Fiat\'s primary notice, removing unsupported steering-column wording, rattles, a 1.5-hour estimate, and a claim that dealers automatically install bolts rather than first inspect.',
};

const published = {
  'fiat-strada-engine-control-module-water-intrusion-causes-engine-stall-wh': replacement(
    ecmRecall,
    'Retain the safety recall using Stellantis\'s primary notice, limited to the exact 2025 Nova Strada chassis scope, engine-shutdown consequence, and free ECM replacement.',
  ),
  'fiat-strada-missing-upper-steering-column-body-fixing-bolts': replacement(
    bodyBoltRecall,
    'Retain the safety recall only after correcting its chassis endpoint, component wording, inspection-first remedy, and official service-time scope from Fiat\'s primary notice.',
  ),
};

const reasons = {
  'fiat-strada-cvt-jerking-low-speed-premature-transmission-failures':
    'The frozen card turns individual owner complaints and secondary buying-guide summaries into a four-model-year CVT population, failure progression, diagnostic workflow, software claim, and replacement remedy without a Fiat bulletin or recall defining that defect and scope.',
  'fiat-strada-dualogic-automated-manual-gearbox-faults-jerky-shifts-clutch':
    'The frozen card combines nine model years, a used-car article, independent repair guidance, generic Dualogic DTC information, and a parts listing into one Strada Adventure clutch-and-actuator defect claim without a Fiat primary publication defining the affected vehicles or remedy.',
  'fiat-strada-premature-suspension-noise-wheel-bearing-wear':
    'The frozen card aggregates owner complaints and secondary articles about bushings, one front side, and rear wheel bearings across four model years without a Fiat bulletin defining a common population, component failure, diagnostic procedure, or repair.',
  'fiat-strada-water-infiltration-into-cabin-through-door-seals':
    'The frozen card generalizes complaints, a forum category, and secondary articles into a four-model-year door-seal defect and repair sequence without a Fiat bulletin identifying the affected body configuration, leak path, or remedy.',
};

module.exports = buildConfig({
  label: 'Fiat Strada',
  make: 'Fiat',
  model: 'Strada',
  slug: 'fiat-strada',
  batchId: 'fiat-strada-full-record-cohort-95-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '782b234d2bb3699b4a3360318781257b9baa387c3e93258e49b04c2b4c36413f',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-strada/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiatstrada_blind:manual-primary-source-gate',
    edge: 'fiatstrada_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
