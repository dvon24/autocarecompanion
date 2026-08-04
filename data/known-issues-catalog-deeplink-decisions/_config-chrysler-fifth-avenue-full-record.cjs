const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-fifth-avenue-ac-compressor-1990': 'The frozen four-year A/C card combines compressor clutch, refrigerant leak, electrical, and full-system repair possibilities without a Chrysler/NHTSA primary source defining one failure population and remedy.',
  'chrysler-fifth-avenue-ball-joint-wear-1990': 'The frozen ball-joint/tie-rod wear card is a maintenance and parts aggregation without a manufacturer or NHTSA record establishing a 1990-1993 defect population and universal replacement set.',
  'chrysler-fifth-avenue-lean-burn-1990': 'The frozen 3.3L/3.8L plenum-gasket card combines oil consumption, deposits, smoke, and replacement guidance without one Chrysler/NHTSA source proving its complete engine and model-year scope.',
  'chrysler-fifth-avenue-power-seat-1990': 'The frozen power-seat card merges motors, tracks, gears, switches, and wiring across four model years without a primary-source failure mechanism or remedy.',
  'chrysler-fifth-avenue-transmission-1990': 'The frozen A604 card combines limp mode, solenoids, electronics, internal wear, rebuilds, and replacement across 1990-1993 without one Chrysler/NHTSA defect record supporting those claims.',
};

module.exports = buildConfig({
  label: 'Chrysler Fifth Avenue',
  make: 'Chrysler',
  model: 'Fifth Avenue',
  slug: 'chrysler-fifth-avenue',
  batchId: 'chrysler-fifth-avenue-full-record-cohort-55-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd66572a1119c52378bb2ecfcd3224d430277db424ab3188f7413b985104cb6fe',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-fifth-avenue/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslerfifthavenue_blind:manual-primary-source-gate',
    edge: 'chryslerfifthavenue_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '90V080000',
    '90V162000',
    '91V004000',
    '91V122000',
    '92V015000',
  ],
});
