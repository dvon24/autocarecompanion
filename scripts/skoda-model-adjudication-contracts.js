const SNAPSHOT_FILE = 'data/_skoda-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const ids = Object.freeze({
  Enyaq: [
    'skoda-enyaq-12v-drain',
    'skoda-enyaq-infotainment',
  ],
  Fabia: [
    'skoda-fabia-1-2-tsi-ea111-timing-chain-stretch-tensioner-failure',
    'skoda-fabia-1-2-tsi-timing-chain-stretch-tensioner-failure',
    'skoda-fabia-1-6-tdi-diesel-injector-fuel-system-faults',
    'skoda-fabia-1-6-tdi-dieselgate-recall-post-fix-egr-dpf-failures',
    'skoda-fabia-7-speed-dsg-dry-clutch-mechatronic-failures',
    'skoda-fabia-7-speed-dsg-mechatronic-jerky-shifting-faults',
    'skoda-fabia-abs-pump-control-module-internal-failure',
    'skoda-fabia-central-locking-actuator-door-lock-failures',
    'skoda-fabia-curtain-airbag-wiring-recall',
    'skoda-fabia-mk1-ignition-coil-pack-misfire',
    'skoda-fabia-rear-axle-rust',
    'skoda-fabia-rear-wiper-motor-failure',
    'skoda-fabia-spurious-dashboard-warning-lights-abs-wheel-speed-sensor-fau',
    'skoda-fabia-tsi-timing-chain',
    'skoda-fabia-water-ingress-through-rear-door-seals-into-footwells',
    'skoda-fabia-water-pump-thermostat-housing-coolant-leaks',
  ],
  Kodiaq: [
    'skoda-kodiaq-coolant-loss-from-water-pump-thermostat-housing',
    'skoda-kodiaq-dpf-clogging-adblue-scr-system-faults-2-0-tdi-diesels',
    'skoda-kodiaq-dsg-dual-clutch-transmission-jerking-mechatronic-failure',
    'skoda-kodiaq-dsg-hesitation',
    'skoda-kodiaq-general-electrical-faults-central-locking-sensors-climate-co',
    'skoda-kodiaq-infotainment-screen-freezing-blanking-rebooting',
    'skoda-kodiaq-iv-battery',
    'skoda-kodiaq-recall-low-engine-torque-low-rpm',
    'skoda-kodiaq-recall-takata-driver-airbag-inflator-may-rupture',
  ],
  Octavia: [
    'skoda-octavia-1-4-tsi-plastic-water-pump-thermostat-housing-coolant-leak',
    'skoda-octavia-1-5-tsi-evo-kangaroo-jerking-hesitation-low-revs',
    'skoda-octavia-1-6-tdi-diesel-injector-egr-valve-failures',
    'skoda-octavia-1-8-2-0-tsi-timing-chain-tensioner-failure',
    'skoda-octavia-2-0-tdi-egr-cooler-cracking-dpf-blockage',
    'skoda-octavia-abs-esp-brake-pressure-sensor-fault-mk2',
    'skoda-octavia-dq200-7-speed-dry-clutch-dsg-mechatronic-clutch-pack-failure',
    'skoda-octavia-dsg-mechatronic',
    'skoda-octavia-dual-mass-flywheel-failure-tdi-tsi',
    'skoda-octavia-glove-box-damper',
    'skoda-octavia-rear-bushings',
    'skoda-octavia-tdi-egr-cooler',
    'skoda-octavia-tsi-timing-chain',
  ],
  Scala: [
    'skoda-scala-1-0-tsi-leaking-fuel-injectors-emissions-recall',
    'skoda-scala-1-5-tsi-evo-kangaroo-juddering-hesitation-when-pulling-away',
    'skoda-scala-1-6-tdi-dpf-clogging-oil-dilution-short-journey-use',
    'skoda-scala-7-speed-dsg-jerky-shifts-mechatronic-failure',
    'skoda-scala-air-conditioning-weak-intermittent-cooling-compressor-conden',
    'skoda-scala-bolero-amundsen-infotainment-freezing-random-reboots',
    'skoda-scala-ecall-online-connectivity-unit-emergency-call-software-fault',
    'skoda-scala-premature-front-brake-pad-disc-wear',
    'skoda-scala-side-airbag-seat-cover-stitching-defect-safety-recall',
  ],
  Superb: [
    'skoda-superb-2.0-tdi-egr',
    'skoda-superb-7-speed-dry-clutch-dsg-mechatronic-clutch-pack-failures',
    'skoda-superb-columbus-infotainment-freezes-shutdowns-reboot-loops',
    'skoda-superb-diesel-particulate-filter-clogging-regeneration-failure',
    'skoda-superb-ea888-gen2-petrol-oil-consumption-stretched-timing-chain',
    'skoda-superb-electromechanical-parking-brake-sticking-rapid-rear-disc-pad',
    'skoda-superb-high-pressure-fuel-pipe-leak-recall-2009-2011-diesel',
    'skoda-superb-p2015-intake-manifold-swirl-flap-actuator-failure',
    'skoda-superb-water-ingress-through-blocked-plenum-drains-causing-wet-foot',
    'skoda-superb-water-pump',
  ],
  Yeti: [
    'skoda-yeti-haldex-coupling',
  ],
});

const duplicateClusters = Object.freeze([
  {
    key: 'fabia-ea111-timing-chain',
    ids: ['skoda-fabia-1-2-tsi-ea111-timing-chain-stretch-tensioner-failure', 'skoda-fabia-1-2-tsi-timing-chain-stretch-tensioner-failure', 'skoda-fabia-tsi-timing-chain'],
    decision: 'Preserve all three indexed identities; consolidation or redirects require separate approval.',
  },
  {
    key: 'fabia-dq200',
    ids: ['skoda-fabia-7-speed-dsg-dry-clutch-mechatronic-failures', 'skoda-fabia-7-speed-dsg-mechatronic-jerky-shifting-faults'],
    decision: 'Preserve both indexed identities; their year and symptom scopes differ and no canonical URL is approved.',
  },
  {
    key: 'octavia-dsg-mechatronic',
    ids: ['skoda-octavia-dq200-7-speed-dry-clutch-dsg-mechatronic-clutch-pack-failure', 'skoda-octavia-dsg-mechatronic'],
    decision: 'Preserve both indexed identities; the broader DQ200/DQ250 page cannot silently replace the DQ200-only page.',
  },
  {
    key: 'octavia-egr-cooler',
    ids: ['skoda-octavia-2-0-tdi-egr-cooler-cracking-dpf-blockage', 'skoda-octavia-tdi-egr-cooler'],
    decision: 'Preserve both indexed identities; the composite EGR/DPF page and narrower EGR-cooler page need a reviewed canonical policy.',
  },
  {
    key: 'kodiaq-dsg',
    ids: ['skoda-kodiaq-dsg-dual-clutch-transmission-jerking-mechatronic-failure', 'skoda-kodiaq-dsg-hesitation'],
    decision: 'Preserve both indexed identities; their overlap and any canonical policy remain unresolved and require separate approval.',
  },
]);

const modelObservations = Object.freeze({
  Enyaq: ['Complete same-identity Skoda applicability remains unresolved; both indexed pages stay unchanged.'],
  Fabia: ['Timing-chain and DSG clusters remain separate because consolidation is outside this audit.'],
  Kodiaq: ['The captured first-PHEV source conflicts with one frozen identity; all other applicability questions remain unresolved.'],
  Octavia: ['DSG and EGR clusters remain separate because consolidation is outside this audit.'],
  Scala: ['Frozen trim routing includes unresolved model/year/selectable-trim mismatches; no metadata write is authorized.'],
  Superb: ['Frozen trim routing includes unresolved model/year/selectable-trim mismatches; no metadata write is authorized.'],
  Yeti: ['Captured Skoda maintenance evidence supports only the stated general interval boundary; the frozen row stays unchanged.'],
});

const evidenceFor = Object.freeze({
  'skoda-kodiaq-iv-battery': ['kodiaqFirstPhev2024'],
  'skoda-yeti-haldex-coupling': ['skodaServiceMaintenance2023'],
});

const supportedModels = Object.freeze(['Enyaq', 'Fabia', 'Kodiaq', 'Octavia', 'Scala', 'Superb', 'Yeti']);

function getContract(model) {
  if (!ids[model]) throw new Error(`Unsupported Skoda model: ${model}`);
  const allIds = [...ids[model]].sort();
  return {
    make: 'Skoda',
    model,
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: `data/known-issue-skoda-${model.toLowerCase()}-adjudication-2026-08-11.json`,
    allIds,
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: modelObservations[model],
    evidenceInventory: {
      method: 'Frozen citation metadata and locally captured Skoda sources were reviewed conservatively; no external negative-search proof is asserted.',
      exactConflictDocuments: allIds.reduce((sum, id) => sum + (evidenceFor[id]?.length || 0), 0),
      retainedRewriteDocuments: 0,
    },
    content: {},
  };
}

function clustersForModel(model) {
  const allowed = new Set(ids[model] || []);
  return duplicateClusters.filter((cluster) => cluster.ids.every((id) => allowed.has(id)));
}

module.exports = { clustersForModel, duplicateClusters, getContract, supportedModels };
