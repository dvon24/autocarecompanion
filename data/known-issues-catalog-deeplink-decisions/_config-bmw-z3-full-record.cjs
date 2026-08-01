const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW Z3",
  model: "Z3",
  slug: "bmw-z3",
  batchId: "bmw-z3-full-record-cohort-36-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "4ea5c46078d5b5088fdc547ae8231ae9eb506e2b45064b641e9d72906d9db920",
  sourceSnapshotFileHash: "a6072e88c98f4d83693b0ed9eb36e31a24f40c65a5aac2ab8c48c11811c84362",
  packetFileHash: "fecbdc9b6055d428bfd886437c426f300ad9aad314dba3e941b598722ebdccc4",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-z3/4ea5c46078d5/all-0001.json",
  reviewTokens: { blind: "bmwz3_blind:self-no-blocker", edge: "bmwz3_edge:self-no-blocker" },
  reasons: {
    "bmw-z3-convertible-top-rear-window-cracking-clouding-bead-separatio":
      "The card combines aging, UV exposure, fold damage, zipper/bead separation and top condition into a universal failure and replacement path without an exact BMW inspection or production boundary.",
    "bmw-z3-cooling-system-failure-1996":
      "The aggregation combines radiator, expansion tank, cap, thermostat, pump, fan and hose failures across four- and six-cylinder variants and prescribes wholesale replacement without a BMW diagnostic boundary.",
    "bmw-z3-cracked-exhaust-manifold-1-9l-4-cylinder":
      "Owner and retailer material does not establish a production-bounded M43/M44 manifold defect, crack location or universal part identity, and the card mixes engine variants not sold in the same markets.",
    "bmw-z3-differential-mount-ear-trunk-floor-pan-tearing":
      "The card does not distinguish differential-mount damage, spot-weld separation, collision/corrosion, modification or fatigue and prescribes reinforcement without BMW structural measurements or a repair specification.",
    "bmw-z3-door-window-regulator-clip-mounting-tab-failure":
      "The card converts multiple glass-adjustment, guide, clip, regulator and mounting faults into one repair and cannot support a universal clip or adhesive recommendation across doors and production revisions.",
    "bmw-z3-fuel-level-sender-failure-causing-erratic-dead-fuel-gauge":
      "The card assigns erratic gauge behavior to the sender without separating wiring, connector, cluster, tank geometry or dual-sender diagnosis and lacks exact BMW test values and part selection.",
    "bmw-z3-hvac-blower-final-stage-resistor-failure":
      "The symptom title is not sufficient to distinguish resistor, switch, relay, fuse, motor, wiring or control faults, and the card lacks a BMW electrical test path and production boundary.",
    "bmw-z3-rear-subframe-crack-1996":
      "This duplicate structural aggregation does not provide BMW inspection limits, vehicle-condition exclusions or an approved repair and cannot turn visual symptoms into universal reinforcement advice.",
    "bmw-z3-rear-subframe-cracking-1996":
      "This duplicate structural card combines trunk-floor spot-weld and differential-mount conditions without a BMW-defined affected population, measurement or safe universal remedy.",
    "bmw-z3-valve-cover-gasket-oil-leak":
      "The card spans different M52/M54 covers and crankcase-ventilation conditions and prescribes a gasket before leak localization, cover inspection and VIN-specific part selection.",
    "bmw-z3-vanos-seals-1999":
      "The card assigns broad drivability symptoms to VANOS seals across M52, M54 and S52 variants and promotes aftermarket repair without BMW fault criteria or a production-bounded procedure.",
  },
  proposalCampaigns: [
    "06E026000",
    "97V131000",
    "99V272000",
    "98V275000",
  ],
});
