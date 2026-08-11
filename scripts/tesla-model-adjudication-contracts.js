const SNAPSHOT_FILE = 'data/_tesla-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const ids = Object.freeze({
  Cybertruck: [
    'tesla-cybertruck-accelerator-pedal-recall',
  ],
  'Model 3': [
    'tesla-model-3-charge-port-latch-freezes-cold-weather',
    'tesla-model-3-front-lower-lateral-link-control-arm-bushing-tears',
    'tesla-model-3-front-upper-control-arm-ball-joint-squeak-creak',
    'tesla-model-3-frozen-door-handles-cold-weather',
    'tesla-model-3-heat-pump-valve',
    'tesla-model-3-loss-power-steering-assist-epas-circuit-board-recall',
    'tesla-model-3-premature-inner-edge-tire-wear',
    'tesla-model-3-rearview-backup-camera-loss',
    'tesla-model-3-taillight-condensation-trunk-lid-water-leak',
    'tesla-model-3-touchscreen-yellow-border-yellow-band-around-display',
    'tesla-model-3-vampire-phantom-battery-drain-while-parked',
    'tesla-model-3-windshield-cabin-fogging-c-recirculation-cold',
    'tesla-model-3-y-12v-drain',
    'tesla-model-3-y-paint-chipping',
    'tesla-model-3-y-phantom-braking',
  ],
  'Model S': [
    'tesla-model-s-12v-auxiliary-battery-dc-dc-converter-failure-cascade',
    'tesla-model-s-center-touchscreen-yellow-border-lcd-delamination-bubbling',
    'tesla-model-s-charge-port-door-latch-actuator-failure',
    'tesla-model-s-drive-unit-battery-coolant-leak',
    'tesla-model-s-electronic-parking-brake-caliper-seizure',
    'tesla-model-s-first-row-seat-belt-not-connected-to-pretensioner-anchor',
    'tesla-model-s-front-suspension-fore-link-failure',
    'tesla-model-s-frunk-hood-latch-actuator-cable-failure',
    'tesla-model-s-high-voltage-battery-pack-failure-bms-u029-fault',
    'tesla-model-s-panoramic-sunroof-water-leak',
    'tesla-model-s-power-window-regulator-failure',
    'tesla-model-s-retractable-door-handle-failure',
    'tesla-model-s-x-air-suspension-droop',
    'tesla-model-s-x-drive-unit-milling',
    'tesla-model-s-x-mcu1-emmc-failure',
    'tesla-model-s-yoke-return-spring',
  ],
  'Model X': [
    'tesla-model-x-12v-auxiliary-battery-premature-failure',
    'tesla-model-x-air-suspension-leak-sagging-ride-height-compressor-failure',
    'tesla-model-x-electronic-power-steering-assist-loss',
    'tesla-model-x-falcon-wing-door',
    'tesla-model-x-first-row-seat-belt-anchor-may-detach',
    'tesla-model-x-front-door-auto-presenting-handle-fails-to-present-retract',
    'tesla-model-x-front-upper-control-arm-clunk-premature-suspension-wear',
    'tesla-model-x-large-drive-unit-bearing-whine-motor-failure',
    'tesla-model-x-mcu1-emmc-flash-memory-failure',
    'tesla-model-x-panoramic-windshield-cracking-delamination',
    'tesla-model-x-phantom-braking-autopilot-full-self-driving',
    'tesla-model-x-touchscreen-yellow-border-band-discoloration',
  ],
  'Model Y': [
    'tesla-model-y-autopilot-tacc-phantom-braking-highway',
    'tesla-model-y-battery-pack-contactor-opens-suddenly-causing-loss-drive-pow',
    'tesla-model-y-electronic-door-handles-inoperative-low-12v-voltage-occupant',
    'tesla-model-y-electronic-power-steering-assist-loss-from-overstressed-circ',
    'tesla-model-y-front-suspension-lateral-link-bolts-loose-separation-risk',
    'tesla-model-y-heat-pump-octovalve-failure-cold-weather',
    'tesla-model-y-liftgate-water-ingress-into-trunk-subtrunk',
    'tesla-model-y-premature-rear-tire-wear-from-aggressive-negative-camber',
    'tesla-model-y-rear-glass-shattering',
    'tesla-model-y-rearview-backup-camera-image-loss-from-shorted-computer-circ',
    'tesla-model-y-refreshed-model-y-turn-signal-stalk-fails-to-latch-cancels-e',
    'tesla-model-y-seatbelt-anchor-recall',
    'tesla-model-y-sentry-mode-cabin-overheat-protection-excessive-battery-drai',
    'tesla-model-y-tpms-warning-light-resets-between-drives-failing-to-warn-low',
    'tesla-model-y-windshield-cracking-during-cabin-preconditioning-defrost-col',
  ],
  Semi: [
    'tesla-semi-heavy-load-range-collapse-500-mile-rating-only-light-freight',
    'tesla-semi-lithium-ion-battery-thermal-runaway-after-crash-50-000-gallo',
    'tesla-semi-megacharger-network-gaps-strand-trucks-off-corridor',
    'tesla-semi-parking-brake-valve-module-fails-to-engage-rollaway-risk',
    'tesla-semi-touchscreen-flicker-shutdown-forcing-drivers-to-pull-over',
  ],
});

const duplicateClusters = Object.freeze([
  {
    key: 'model-3-y-phantom-braking',
    ids: ['tesla-model-3-y-phantom-braking', 'tesla-model-y-autopilot-tacc-phantom-braking-highway', 'tesla-model-x-phantom-braking-autopilot-full-self-driving'],
    decision: 'Preserve all model-specific indexed identities; their investigations, years and vehicle scopes cannot be silently merged.',
  },
  {
    key: 'model-3-y-heat-pump',
    ids: ['tesla-model-3-heat-pump-valve', 'tesla-model-y-heat-pump-octovalve-failure-cold-weather'],
    decision: 'Preserve both URLs; a bounded EXV recall and a broader cold-weather thermal complaint are not interchangeable.',
  },
  {
    key: 'model-3-y-rearview-camera',
    ids: ['tesla-model-3-rearview-backup-camera-loss', 'tesla-model-y-rearview-backup-camera-image-loss-from-shorted-computer-circ'],
    decision: 'Preserve both URLs; the frozen pages combine different years and asserted hardware or firmware mechanisms.',
  },
  {
    key: 'model-s-x-seatbelt-anchor',
    ids: ['tesla-model-s-first-row-seat-belt-not-connected-to-pretensioner-anchor', 'tesla-model-x-first-row-seat-belt-anchor-may-detach', 'tesla-model-y-seatbelt-anchor-recall'],
    decision: 'Preserve all three URLs pending identity policy; the Model Y slug currently carries a Model S/X title contradiction.',
  },
  {
    key: 'model-s-x-air-suspension',
    ids: ['tesla-model-s-x-air-suspension-droop', 'tesla-model-x-air-suspension-leak-sagging-ride-height-compressor-failure'],
    decision: 'Preserve both indexed identities; the cross-model and Model X-only scopes overlap but are not approved for consolidation.',
  },
  {
    key: 'model-s-x-drive-unit',
    ids: ['tesla-model-s-x-drive-unit-milling', 'tesla-model-x-large-drive-unit-bearing-whine-motor-failure'],
    decision: 'Preserve both identities; similar noise symptoms do not establish one root cause or one canonical page.',
  },
  {
    key: 'model-s-x-mcu1-emmc',
    ids: ['tesla-model-s-x-mcu1-emmc-failure', 'tesla-model-x-mcu1-emmc-flash-memory-failure'],
    decision: 'Preserve both URLs; any redirect or canonicalization requires separate approval.',
  },
  {
    key: 'cross-model-touchscreen-yellow-border',
    ids: ['tesla-model-3-touchscreen-yellow-border-yellow-band-around-display', 'tesla-model-s-center-touchscreen-yellow-border-lcd-delamination-bubbling', 'tesla-model-x-touchscreen-yellow-border-band-discoloration'],
    decision: 'Preserve the three model-specific pages; similar display symptoms do not authorize cross-model applicability.',
  },
]);

const modelObservations = Object.freeze({
  Cybertruck: ['The frozen recall identity remains published unchanged; no new source bytes were captured in this audit.'],
  'Model 3': ['Cross-model heat-pump, camera and phantom-braking overlaps remain separate; frozen commerce is preserved without endorsement.'],
  'Model S': ['Cross-model Model S/X suspension, drive-unit, MCU and seatbelt identities remain separate pending canonical policy.'],
  'Model X': ['Model X overlaps with cross-model Model S/X pages, but no consolidation or scope rewrite is authorized.'],
  'Model Y': ['The seatbelt-anchor slug has a frozen Model S/X title and is a hard byte-identical hold pending identity policy.'],
  Semi: ['Sparse production and incident claims lack newly captured exact source content; all five identities remain held.'],
});

const modelSlugs = Object.freeze({ Cybertruck: 'cybertruck', 'Model 3': 'model-3', 'Model S': 'model-s', 'Model X': 'model-x', 'Model Y': 'model-y', Semi: 'semi' });
const supportedModels = Object.freeze(['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Semi']);

function getContract(model) {
  if (!ids[model]) throw new Error(`Unsupported Tesla model: ${model}`);
  const allIds = [...ids[model]].sort();
  return {
    make: 'Tesla',
    model,
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: `data/known-issue-tesla-${modelSlugs[model]}-adjudication-2026-08-11.json`,
    allIds,
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: modelObservations[model],
    evidenceInventory: {
      method: 'Every frozen citation was inventoried as metadata only; no new external source bytes were captured or promoted to exact primary proof.',
      capturedSourceDocuments: 0,
      retainedRewriteDocuments: 0,
    },
    content: {},
  };
}

function clustersForModel(model) {
  const allowed = new Set(ids[model] || []);
  return duplicateClusters.filter((cluster) => cluster.ids.some((id) => allowed.has(id)));
}

module.exports = { clustersForModel, duplicateClusters, getContract, supportedModels };
