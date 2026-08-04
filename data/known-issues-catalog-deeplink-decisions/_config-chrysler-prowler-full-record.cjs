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
      dtcCodes: [],
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

const lowerBallJoint = {
  years: [1997, 1999, 2000, 2001, 2002],
  trims: ['Prowler vehicles included in recall C03 / 03V-034; confirm applicability by VIN'],
  category: 'suspension',
  title: 'Front Lower Ball Joints Can Wear and Separate (Recall 03V-034)',
  description: 'DaimlerChrysler recall C03 / NHTSA 03V-034 covers certain 1997 and 1999-2002 Prowler vehicles. Loss of lubrication in a front lower-control-arm ball joint can accelerate wear and allow the joint to separate from the steering knuckle, which can cause loss of vehicle control. NHTSA\'s campaign data lists the affected Prowlers under the Plymouth make label, including the later model years carried in this catalog under Chrysler.',
  solution: 'Check the VIN for recall C03 before buying suspension parts. An authorized dealer replaces both front lower ball-joint assemblies with modified parts at no charge. If the front suspension has looseness, clunking, abnormal steering, or visible joint damage, stop driving and have the vehicle transported for inspection because separation can cause loss of control.',
  severity: 'high',
  symptoms: ['Front suspension looseness or clunking', 'Accelerated lower-ball-joint wear', 'Ball joint separates from the steering knuckle'],
  affectedSystems: ['front lower control arms', 'lower ball joints', 'steering knuckles'],
  sources: [{ type: 'recall', title: 'NHTSA Campaign 03V-034 - Prowler Front Lower Ball Joints', url: 'https://www.nhtsa.gov/recalls?nhtsaId=03V034000' }],
  summary: 'Retained the exact Prowler safety card, matched its discontinuous model-year population to recall 03V-034, documented NHTSA\'s Plymouth label, and removed retail parts guidance from the no-charge recall remedy.',
};

const published = {
  'chrysler-prowler-front-lower-ball-joint-separation': replacement(lowerBallJoint, 'Keep the ball-joint card and anchor every scope, mechanism, consequence, and remedy claim to recall C03 / 03V-034.'),
};

const reasons = {
  'chrysler-prowler-transmission-adapt-1999': 'The frozen AutoStick card combines adaptation, software, hydraulic, and internal-wear theories across four model years without one DaimlerChrysler/NHTSA condition and remedy.',
  'chrysler-prowler-transmission-overheat-1999': 'The frozen rear-transmission overheating card combines fluid, cooler, airflow, sensor, and internal-failure claims without a primary manufacturer source defining the asserted population.',
  'chrysler-prowler-3-5l-cam-crank-sensor-o-ring-valve-cover-oil-weeping': 'The frozen oil-weeping card aggregates several seals and leak locations across five model years without one primary-source diagnosis or replacement scope.',
  'chrysler-prowler-42le-shift-solenoid-pack-failure-limp-mode': 'The frozen 42LE card treats limp mode as proof of solenoid-pack failure and universal replacement without one DaimlerChrysler bulletin or campaign establishing that mechanism and population.',
  'chrysler-prowler-cable-type-power-window-regulator-failure': 'The frozen regulator card combines cable, motor, track, and obsolete-part claims without a primary-source defect population and remedy.',
  'chrysler-prowler-convertible-top-rear-window-separation-top-leaks': 'The frozen convertible-top card combines material aging, adhesive separation, seals, adjustment, and replacement outcomes without one manufacturer condition covering the full population.',
  'chrysler-prowler-coolant-leak-1999': 'The frozen crossover-tube card asserts a four-year leak mechanism and parts replacement without a DaimlerChrysler/NHTSA source proving the complete scope.',
  'chrysler-prowler-cooling-overheat-1997': 'The frozen six-year overheating card combines airflow, fan, radiator, coolant, thermostat, and pump possibilities without a single defect condition or universal repair.',
  'chrysler-prowler-door-speaker-foam-surround-deterioration': 'The frozen speaker card describes age-related material deterioration and aftermarket repair choices rather than a manufacturer-defined vehicle defect population.',
  'chrysler-prowler-fuel-gauge-reads-inaccurately-won-t-show-full': 'The frozen fuel-gauge card treats one symptom as a confirmed sending-unit failure without a primary-source diagnostic boundary or population.',
  'chrysler-prowler-paint-aluminum-1999': 'The frozen paint card combines adhesion, corrosion, preparation, and refinishing claims across four years without a DaimlerChrysler program or technical source establishing the asserted scope.',
  'chrysler-prowler-pcm-internal-checksum-failure-obsolete-engine-computer': 'The frozen P0601 card treats a generic internal-module code as proof that an obsolete PCM must be replaced without a manufacturer source ruling out power, ground, programming, wiring, and other causes.',
  'chrysler-prowler-tank-fuel-pump-failure-no-rail-pressure': 'The frozen no-pressure card assumes in-tank pump failure and replacement across five model years without a primary-source diagnostic procedure or defect population.',
};

module.exports = buildConfig({
  label: 'Chrysler Prowler',
  make: 'Chrysler',
  model: 'Prowler',
  slug: 'chrysler-prowler',
  batchId: 'chrysler-prowler-full-record-cohort-60-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '18a2992b6962b92643fb484f88fd8d3cd5711d55fa134e6a05d79e0e97fda94f',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-prowler/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslerprowler_blind:manual-primary-source-gate',
    edge: 'chryslerprowler_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V366000',
    '98V047000',
    '98V104000',
    '98V184000',
    '99V245000',
    '99V313000',
  ],
});
