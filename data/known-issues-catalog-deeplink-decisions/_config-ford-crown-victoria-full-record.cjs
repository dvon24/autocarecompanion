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

const intakeManifold = {
  years: [1996, 1997, 1998, 1999, 2000, 2001],
  trims: [],
  engines: ['4.6L 2-valve engine'],
  category: 'cooling',
  title: '4.6L Intake-Manifold Coolant Crossover Can Crack and Seep Coolant',
  description:
    'Ford TSB 02-2-2 covers some 1996-2001 Crown Victoria vehicles with the 4.6L 2-valve engine that exhibit coolant seepage at the first-runner intake-manifold crossover. Ford identifies a crack in the intake-manifold coolant crossover as the cause.',
  solution:
    'Have a qualified technician inspect the first-runner coolant-crossover area behind the alternator. If seepage is confirmed there, Ford directs installation of the applicable service kit using the model-year Workshop Manual procedure. Earlier no-charge program 97M91 covered only specified vehicle populations and had a seven-year term, so do not assume current free coverage.',
  severity: 'medium',
  symptoms: ['Coolant seepage at the first-runner intake-manifold crossover', 'Coolant loss that can lead to overheating if ignored'],
  affectedSystems: ['4.6L intake manifold', 'coolant crossover'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 02-2-2 - 4.6L Intake-Manifold Crossover Coolant Seepage', url: 'https://static.nhtsa.gov/complaints/10115084/10115084-AF0DEE50B68502CAE05375E8789808C8.pdf' }],
  source: 'manual',
  summary:
    'Rebuilt the uncited card from Ford TSB 02-2-2, preserving the exact 1996-2001 4.6L scope, crossover crack, inspection location, and service-kit remedy while removing unsupported broad symptoms.',
};

const axleRecall = {
  years: [2003],
  trims: ['Police, commercial, and passenger vehicles sold to fleets included in Ford recall 04S16 / NHTSA 04V328'],
  engines: [],
  category: 'drivetrain',
  title: 'Rear Wheel-Bearing and Axle Wear Can Lead to Axle-Shaft Fracture (Recall)',
  description:
    'NHTSA campaign 04V328, Ford recall 04S16, covers certain 2003 Crown Victoria police, commercial, and passenger vehicles sold to fleets. Higher chassis loads can overload the rear wheel bearings and axles, causing early bearing failure and ultimately axle-shaft fracture. A fracture can cause loss of drive and increase crash risk.',
  solution:
    'Check the VIN and fleet recall history with Ford or NHTSA. Dealers replace the rear wheel bearings, seals, and axle shafts free of charge. The campaign does not support extending this condition across 1998-2011 vehicles or attributing generic differential whine, leaks, clunks, vibration, or axle play to it.',
  severity: 'high',
  symptoms: ['Early rear wheel-bearing failure', 'Rear axle-shaft fracture', 'Loss of drive after axle-shaft fracture'],
  affectedSystems: ['rear wheel bearings', 'rear axle shafts', 'rear axle seals'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'Ford Recall 04S16 - 2003 Crown Victoria Fleet Rear Axle-Shaft Fracture', url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V328-5971.PDF' }],
  source: 'manual',
  summary:
    'Replaced a 14-year YouTube-based differential aggregation with the exact 2003 fleet rear-bearing and axle-shaft recall population, failure progression, loss-of-drive risk, and free remedy.',
};

const planetaryGear = {
  years: [2008, 2009, 2010, 2011],
  trims: ['Vehicles equipped with the 4R75E transmission'],
  engines: [],
  category: 'transmission',
  title: '4R75E Planetary-Gear Failure Can Cause Noise, Slippage, Vibration, or Loss of Reverse',
  description:
    'Ford TSB 16-0032 covers 2008-2011 Crown Victoria vehicles with the 4R75E transmission that exhibit grinding or whine-type noise, vibration, gear slippage while driving, or loss of reverse because of planetary-gear assembly failure.',
  solution:
    'Have a Ford dealer or qualified transmission specialist follow TSB 16-0032, retrieve and record diagnostic codes, inspect the transmission pan, and perform the bulletin-directed repair. Ford released a service kit for the condition. The bulletin does not identify a shift-solenoid pack as the cause or support the frozen 1998-2011 scope.',
  severity: 'high',
  symptoms: ['Grinding noise while driving', 'Whine-type noise while driving', 'Vibration while driving', 'Gear slippage while driving', 'Loss of reverse'],
  affectedSystems: ['4R75E transmission', 'planetary-gear assembly'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 16-0032 - 4R75E Planetary-Gear Failure', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10204997-9999.pdf' }],
  source: 'manual',
  summary:
    'Replaced the YouTube-based shift-solenoid claim with Ford\'s exact 2008-2011 4R75E planetary-gear failure, documented symptoms, and bulletin-directed service path.',
};

const published = {
  'ford-crown-victoria-intake-manifold-crack-2001': replacement(intakeManifold, 'Retain the condition under Ford TSB 02-2-2 with exact 4.6L, year, crossover, inspection, and service-kit scope.'),
  'ford-crown-victoria-rear-diff-whine-1998': replacement(axleRecall, 'Retain only the directly related rear-axle wear safety issue, narrowed to Ford 04S16/NHTSA 04V328 and its exact 2003 fleet population.'),
  'ford-crown-victoria-trans-solenoid-pack-1998': replacement(planetaryGear, 'Replace the unsupported solenoid-pack diagnosis with Ford TSB 16-0032\'s exact 4R75E planetary-gear failure and 2008-2011 scope.'),
};

const reasons = {
  'ford-crown-victoria-air-suspension-failure-1992':
    'The frozen card has no citations and applies compressor, air-spring, ride-height, warning-light, noise, harsh-ride, bottoming, hissing, and side-to-side sag claims to every 1992-2011 Crown Victoria without a Ford bulletin, investigation, or recall defining that 20-year population.',
  'ford-crown-victoria-spark-plug-breakage-2004':
    'The frozen card has no citations and applies spark-plug ejection or breakage, popping, misfire, power loss, and plug expulsion to every 1992-2011 Crown Victoria. NHTSA spark-plug-ejection investigation DP05-005 concerns specified 1997-2004 Triton V8/V10 vehicle populations and does not substantiate this 20-year Crown Victoria card.',
};

module.exports = buildConfig({
  label: 'Ford Crown Victoria',
  make: 'Ford',
  model: 'Crown Victoria',
  slug: 'ford-crown-victoria',
  batchId: 'ford-crown-victoria-full-record-cohort-103-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ac4e18cdf735421b4abb5eb5d0af50639d989c44d77a2e53b8437b5bc1e2450e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-crown-victoria/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordcrownvictoria_blind:manual-primary-source-gate',
    edge: 'fordcrownvictoria_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
