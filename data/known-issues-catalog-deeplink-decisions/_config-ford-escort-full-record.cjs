const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-escort-alternator-failure-1991':
    'The frozen card relies on one Reddit thread to apply alternator and voltage-regulator failure, dimming lights, battery warnings, stalls, noises, and electrical instability to every 1991-2003 Escort and two engines. No Ford bulletin, investigation, or recall reviewed defines that 13-year defect and remedy.',
  'ford-escort-auto-trans-failure-1991':
    'The frozen card has no citations and labels the transmission CD4E while applying delayed engagement, slipping, harsh shifts, fluid leaks, warning lamps, and complete failure to every 1991-2003 Escort. No Ford primary source reviewed defines one transmission, defect, population, and repair matching that aggregation.',
  'ford-escort-constant-control-relay-module-failure':
    'The frozen card relies on an aftermarket repair summary and an owner forum to assign intermittent no-start, stalling, cooling-fan, fuel-pump, and air-conditioning faults to a CCRM defect across 1997-1999. No Ford bulletin, investigation, or recall reviewed establishes that combined diagnosis and remedy.',
  'ford-escort-cv-joint-failure-1991':
    'The frozen card relies on a placeholder-style YouTube URL and applies ordinary CV-joint and boot wear symptoms to every 1991-2003 Escort without a Ford bulletin, investigation, or recall defining a defect, affected population, or corrective action.',
  'ford-escort-dropped-intake-valve-seat-1-9l-cvh':
    'The frozen card relies on owner forums and an aftermarket repair summary to apply a cylinder-number-specific dropped valve-seat failure to every 1991-1996 1.9L Escort. No Ford bulletin, investigation, or recall reviewed defines that six-year defect, warning signs, and engine-repair remedy.',
  'ford-escort-egr-flow-fault-check-engine-light-from-failed-dpfe-sensor':
    'The frozen card uses a Q&A page, a generic code site, and an owner discussion to treat P0401/P1401 as proof of DPFE-sensor failure across 1996-1999 and three engines. Those DTCs require diagnosis, and no Ford primary source reviewed defines this population and single-cause remedy.',
  'ford-escort-head-gasket-failure-1997':
    'The frozen card relies on a placeholder-style YouTube URL to apply 2.0L SPI head-gasket failure, overheating, coolant loss, smoke, contaminated oil, and misfire to every 1997-2003 Escort. No Ford bulletin, investigation, or recall reviewed defines that seven-year defect and remedy.',
  'ford-escort-rear-strut-mount-1997':
    'The frozen card relies on a placeholder-style YouTube URL and applies rear strut-mount or bearing noise and handling symptoms to every 1997-2003 Escort without a Ford bulletin, investigation, or recall defining one defect and repair.',
  'ford-escort-repeated-heater-core-failure-from-coolant-electrolysis':
    'The cited Ford TSB 06-21-19 is genuine heater-core leakage and electrolysis service information, but Ford\'s applicability list does not include Escort. The other two citations are trade articles, so they cannot extend that bulletin to every 1991-1999 Escort and three engines.',
  'ford-escort-timing-belt-is-age-interval-wear-item-that-can-strand-car':
    'The frozen card describes a maintenance wear item rather than a documented defect and relies on a generic interval site plus owner forums. It also applies one timing-belt claim across three engines and nine model years without exact Ford maintenance or service documentation.',
};

module.exports = buildConfig({
  label: 'Ford Escort',
  make: 'Ford',
  model: 'Escort',
  slug: 'ford-escort',
  batchId: 'ford-escort-full-record-cohort-108-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '4850d60ff4d446fda538001caf733a07102bece8b072f39aa69140ad20ad8042',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-escort/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordescort_blind:manual-primary-source-gate',
    edge: 'fordescort_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
