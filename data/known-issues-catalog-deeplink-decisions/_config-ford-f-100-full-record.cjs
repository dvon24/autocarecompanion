const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-f-100-6v-generator-points-ignition-weak-outdated-charging-spark':
    'The frozen card treats vintage design and a voluntary 12-volt conversion as a defect, relies on enthusiast and conversion-kit material, and incorrectly extends a 6-volt claim through 1976. It has no Ford primary source defining one charging or ignition failure.',
  'ford-f-100-cab-corner-floor-pan-rocker-rust':
    'The frozen card relies on a forum, repair-panel seller, and restoration guide to aggregate cab-corner, floor-pan, rocker, body-mount, and structural corrosion across 23 model years. No Ford campaign or defined geographic/production defect supports that scope.',
  'ford-f-100-cab-gas-tank-behind-seat':
    'The frozen card reframes the original in-cab fuel-tank design as a documented defect using a forum, parts seller, and modification article. No Ford recall, investigation, or service campaign reviewed defines the design as a 1957-1972 failure requiring relocation.',
  'ford-f-100-ethanol-era-vapor-lock-carburetor-fuel-boil':
    'The frozen card applies modern fuel-blend behavior, vapor lock, carburetor boiling, hard starts, stalls, and multiple modifications to every 1957-1979 F-100 using forums and a generic fleet article. It is not one Ford-defined defect or population.',
  'ford-f-100-twin-i-beam-kingpin-front-end-wear':
    'The frozen card describes ordinary kingpin, bushing, linkage, and tire wear across 1965-1979 using enthusiast and aftermarket suspension articles. No Ford primary source defines one premature defect and remedy for the entire population.',
  'ford-f-100-weak-4-wheel-drum-brakes-fade-single-circuit-risk':
    'The frozen card treats period-correct drum and single-circuit brake design as a defect and cites conversion guides and parts sellers. It does not identify a Ford recall, noncompliance, or component failure for the listed 1957-1972 vehicles.',
  'ford-f-100-y-block-top-end-oiling-starvation':
    'The frozen card relies on aftermarket engine guides and forums to apply sludged oil passages and rocker starvation to every 1957-1964 Y-block configuration. No Ford bulletin, investigation, recall, or exact maintenance population supports the aggregation.',
};

module.exports = buildConfig({
  label: 'Ford F-100',
  make: 'Ford',
  model: 'F-100',
  slug: 'ford-f-100',
  batchId: 'ford-f-100-full-record-cohort-113-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '79b3a0ad003d7b3759c2369e402c22196baf493d773dcb9bb824a96225a85782',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-100/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf100_blind:manual-primary-source-gate',
    edge: 'fordf100_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
