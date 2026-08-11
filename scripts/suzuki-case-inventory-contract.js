const SNAPSHOT_FILE = 'data/_suzuki-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const ids = Object.freeze({
  Across: ['suzuki-across-rav4-phev-12v-drain'],
  Alto: ['suzuki-alto-wagon-r-valve-clearance'],
  'Grand Vitara': [
    'suzuki-grand-vitara-drive-belt-tension-adjuster-pulley-spring-break',
    'suzuki-grand-vitara-manual-transmission-gear-shift-rear-shaft-can-break',
    'suzuki-grand-vitara-n32a-timing-chain',
    'suzuki-grand-vitara-occupant-classification-system-sensor-mat-failure-unwanted-p',
    'suzuki-grand-vitara-power-steering-pump-belt-tensioner-pulley-plastic-deteriorat',
    'suzuki-grand-vitara-premature-low-beam-headlight-failure-melted-headlight-connec',
    'suzuki-grand-vitara-v6-timing-chain-tensioner-rattle',
  ],
  Jimny: [
    'suzuki-jimny-mk3-king-pin-wear',
    'suzuki-jimny-mk3-rust-chassis',
    'suzuki-jimny-mk4-rust',
  ],
  Swift: [
    'suzuki-swift-k12b-timing-chain',
    'suzuki-swift-mk3-aircon-condenser',
    'suzuki-swift-sport-zc33s-clutch',
  ],
  SX4: ['suzuki-sx4-1.9-ddis-egr-dpf'],
  Vitara: [
    'suzuki-vitara-1.4-boosterjet-oil-dilution',
    'suzuki-vitara-m16a-oil-consumption',
  ],
});

const duplicateClusters = Object.freeze([
  {
    key: 'grand-vitara-v6-timing-identities',
    ids: ['suzuki-grand-vitara-n32a-timing-chain', 'suzuki-grand-vitara-v6-timing-chain-tensioner-rattle'],
    decision: 'Preserve both indexed identities; the N32A and H25A/H27A pages cover different engine families and partly different production windows.',
  },
  {
    key: 'grand-vitara-belt-tensioner-pulley-identities',
    ids: ['suzuki-grand-vitara-drive-belt-tension-adjuster-pulley-spring-break', 'suzuki-grand-vitara-power-steering-pump-belt-tensioner-pulley-plastic-deteriorat'],
    decision: 'Preserve both indexed identities; the later accessory-drive recall and 2006 power-steering-belt pulley condition are separate systems and campaigns.',
  },
]);

const reviewReasons = Object.freeze({
  'suzuki-across-rav4-phev-12v-drain': 'The frozen body relies on Toyota platform inheritance and claims Toyota bulletin coverage for a Suzuki-badged vehicle without an exact Suzuki applicability path; hold the complete indexed identity unchanged.',
  'suzuki-alto-wagon-r-valve-clearance': 'No locally captured exact Suzuki service schedule establishes the complete model, engine, interval, failure, and cost scope; hold unchanged.',
  'suzuki-grand-vitara-drive-belt-tension-adjuster-pulley-spring-break': 'The frozen recall citation metadata is exact-looking, but no local source capture was required because no bounded rewrite is proposed; preserve the published recall identity unchanged.',
  'suzuki-grand-vitara-manual-transmission-gear-shift-rear-shaft-can-break': 'The frozen recall citation metadata is exact-looking, but it does not authorize changing any indexed or content field without a locally captured same-identity review; hold unchanged.',
  'suzuki-grand-vitara-n32a-timing-chain': 'The frozen page mixes model-year, XL-7, report-count, maintenance, failure and cost claims without exact complete-scope primary support; preserve it byte-identical.',
  'suzuki-grand-vitara-occupant-classification-system-sensor-mat-failure-unwanted-p': 'The frozen recall citation metadata is exact-looking, but no content correction is necessary or authorized; preserve the complete published record unchanged.',
  'suzuki-grand-vitara-power-steering-pump-belt-tensioner-pulley-plastic-deteriorat': 'The record combines multiple campaign years, complaint counts and an updated-part characterization without locally captured exact complete-scope evidence; hold unchanged.',
  'suzuki-grand-vitara-premature-low-beam-headlight-failure-melted-headlight-connec': 'The citation inventory is secondary and forum-based and does not prove the complete prevalence, root-cause, safety, year and remedy scope; hold unchanged.',
  'suzuki-grand-vitara-v6-timing-chain-tensioner-rattle': 'The cited bulletin mirror and secondary sources do not independently establish the complete Grand Vitara identity, engine range, interference-engine consequence, labor and remedy scope; hold unchanged.',
  'suzuki-jimny-mk3-king-pin-wear': 'No exact primary evidence is captured for the full generation, mileage, usage, failure, part-quality and cost claims; hold unchanged.',
  'suzuki-jimny-mk3-rust-chassis': 'No exact primary evidence is captured for the full generation, geography, inspection-failure prevalence, repair and cost claims; hold unchanged.',
  'suzuki-jimny-mk4-rust': 'No exact primary evidence is captured for the full generation, timing, goodwill, geography and repair-cost claims; hold unchanged.',
  'suzuki-swift-k12b-timing-chain': 'No exact primary evidence is captured for the complete engine/model applicability, mileage, DTC, maintenance and repair-cost claims; hold unchanged.',
  'suzuki-swift-mk3-aircon-condenser': 'No exact primary evidence is captured for the generation-wide design, failure timing, remedy and cost claims; hold unchanged.',
  'suzuki-swift-sport-zc33s-clutch': 'No exact primary evidence is captured for prevalence, mileage, flywheel characterization, replacement choices and cost claims; hold unchanged.',
  'suzuki-sx4-1.9-ddis-egr-dpf': 'The body relies on Fiat engine similarity and extends EGR, DPF, turbo and driving-advice claims without an exact Suzuki applicability path; hold unchanged.',
  'suzuki-vitara-1.4-boosterjet-oil-dilution': 'No exact primary evidence is captured for the asserted dilution mechanism, prevalence, oil-spec change rationale, cross-generation scope and remedy; hold unchanged.',
  'suzuki-vitara-m16a-oil-consumption': 'No exact primary evidence is captured for the multi-model prevalence, consumption range, mileage, causes and remedy; hold unchanged.',
});

const modelObservations = Object.freeze({
  Across: ['Toyota/RAV4 rebadge similarity is not an exact Suzuki bulletin-applicability path.'],
  Alto: ['The frozen multi-model service claim remains unsupported at its complete scope.'],
  'Grand Vitara': ['Recall rows and two overlap families remain separately indexed; uncaptured source metadata does not authorize rewrites.'],
  Jimny: ['Generation-wide corrosion and steering claims lack exact complete-scope primary support.'],
  Swift: ['Timing-chain, condenser and clutch pages remain separate unsupported identities.'],
  SX4: ['Fiat engine similarity is not exact Suzuki applicability evidence.'],
  Vitara: ['Oil-dilution and oil-consumption identities remain separate and unsupported at their complete scope.'],
});

const supportedModels = Object.freeze(['Across', 'Alto', 'Grand Vitara', 'Jimny', 'Swift', 'SX4', 'Vitara']);

function getContract(model) {
  if (!ids[model]) throw new Error(`Unsupported Suzuki model: ${model}`);
  const allIds = [...ids[model]].sort();
  return {
    make: 'Suzuki',
    model,
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: `data/known-issue-suzuki-${model.toLowerCase().replace(/\s+/g, '-')}-adjudication-2026-08-11.json`,
    allIds,
    retainedIds: [],
    observations: modelObservations[model],
    evidenceInventory: {
      method: 'Every frozen citation was inventoried as metadata. No exact primary conflict was established and no retained rewrite was proposed, so the decision relies on no uncaptured source content.',
      exactConflictDocuments: 0,
      retainedRewriteDocuments: 0,
    },
  };
}

function clustersForModel(model) {
  const allowed = new Set(ids[model] || []);
  return duplicateClusters.filter((cluster) => cluster.ids.every((id) => allowed.has(id)));
}

module.exports = { clustersForModel, duplicateClusters, getContract, ids, reviewReasons, supportedModels };
