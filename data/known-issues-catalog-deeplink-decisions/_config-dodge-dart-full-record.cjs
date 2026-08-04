const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
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

const ddctTcmRecall = {
  years: [2013, 2014, 2015],
  trims: [
    'Vehicles with the 1.4L engine (sales code EAF) and Dry Dual Clutch Transaxle (sales code DA1) included in recall R42; verify by VIN',
  ],
  engines: ['1.4L engine (sales code EAF)'],
  category: 'transmission',
  title: 'DDCT Control-Module Solder Joint Can Cause a Shift to Neutral (Recall 15V-542)',
  description:
    'FCA safety recall R42/NHTSA 15V-542 covers certain 2013-2015 Dodge Dart vehicles with the 1.4L engine and Dry Dual Clutch Transaxle. The TCM mounting bracket can contribute to separation of printed-circuit-board solder joints, creating an electrical open circuit that may shift the transaxle into Neutral without warning and cause loss of motive power.',
  solution:
    'Check the VIN for recall R42/15V-542. FCA\'s dealer instructions require replacement of both the transmission control module and its mounting bracket on involved vehicles. Do not diagnose every DDCT hesitation or warning as this recall condition; confirm recall eligibility and the exact symptom first.',
  severity: 'high',
  symptoms: [
    'Transaxle unexpectedly shifts into Neutral',
    'Loss of motive power while the engine remains running',
    'The condition may occur without advance warning',
  ],
  affectedSystems: [
    'dry dual clutch transaxle',
    'transmission control module printed-circuit-board solder joints',
    'transmission control module mounting bracket',
  ],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'FCA Safety Recall R42 / NHTSA 15V-542 - Transmission Control Module',
      url: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V542-3209.pdf',
    },
  ],
  summary:
    'Replaced the broad DDCT failure aggregation with FCA recall R42\'s exact 2013-2015 1.4L/DDCT population, solder-joint mechanism, neutral-shift consequence, and TCM-plus-bracket remedy.',
};

const published = {
  'dodge-dart-ddct-trans-2013': replacement(
    ddctTcmRecall,
    'Replace the owner-forum DDCT failure aggregation with FCA recall R42/NHTSA 15V-542\'s exact 2013-2015 1.4L/DDCT population, TCM solder-joint failure, loss-of-motive-power risk, and two-part remedy.',
  ),
};

const reasons = {
  'dodge-dart-multiair-solenoid-2013':
    'The frozen card attributes rough running, reduced power, several DTCs, mileage, costs, and a complete MultiAir solenoid-assembly replacement to all 2013-2016 engines without any cited source or one FCA bulletin establishing that scope and remedy.',
  'dodge-dart-ac-compressor-2013':
    'The frozen card treats four model years of weak cooling or compressor noise as premature compressor failure and prescribes compressor-system replacement from one video without an FCA bulletin defining the affected hardware, diagnosis, or repair.',
  'dodge-dart-electrical-drain-2013':
    'The frozen card asserts a four-year body-control-module sleep defect, fuse-pull diagnosis, battery replacement, and BCM reprogramming without any citation or FCA primary source defining the condition.',
  'dodge-dart-idle-stall-2013':
    'The frozen card combines throttle-body deposits, PCM software, low battery voltage, vacuum leaks, and four model years from one Reddit discussion without one FCA primary source proving a single failure mechanism or remedy.',
  'dodge-dart-oil-consumption-2013':
    'The frozen card asserts excessive 2.4L oil consumption across four model years, a mileage range, costs, monitoring thresholds, and engine repair from forums and a secondary complaint aggregator without an FCA bulletin defining the affected population and remedy.',
  'dodge-dart-rear-suspension-clunk-2013':
    'The frozen card attributes rear clunking to shock mounts, sway-bar links, or trailing-arm bushings across all 2013-2016 vehicles and cites a placeholder-style video URL, with no FCA primary source defining one condition and repair.',
  'dodge-dart-tcm-failure-2013':
    'The frozen card claims a separate 2.4L automatic TCM failure pattern, three DTCs, mileage, costs, and module replacement from one video without FCA evidence. The verified FCA TCM recall applies instead to the 1.4L DDCT population and is preserved separately.',
};

module.exports = buildConfig({
  label: 'Dodge Dart',
  make: 'Dodge',
  model: 'Dart',
  slug: 'dodge-dart',
  batchId: 'dodge-dart-full-record-cohort-70-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'aaae9c7bd0047781be273d47b1d4438d98f7c0318495be3a7b35e4d48feab81d',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-dart/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgedart_blind:manual-primary-source-gate',
    edge: 'dodgedart_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '14V800000',
    '15V542000',
    '15V800000',
    '16V113000',
    '16V813000',
    '17V824000',
    '19V293000',
    '25V674000',
  ],
});
