/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { isSubaruMake } = require('./subaru-audit-normalization');

const SNAPSHOT_FILE = 'data/_subaru-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';
const expectedPublishedModels = Object.freeze({
  Ascent: 11,
  Baja: 4,
  BRZ: 10,
  Crosstrek: 14,
  Forester: 33,
  Impreza: 12,
  Legacy: 15,
  Loyale: 2,
  Outback: 41,
  Solterra: 22,
  SVX: 2,
  Tribeca: 4,
  WRX: 19,
  'WRX STI': 16,
});
const supportedModels = Object.freeze(Object.keys(expectedPublishedModels));

const duplicateClusters = Object.freeze([
  {
    key: 'ascent-denso-fuel-pump-recalls',
    model: 'Ascent',
    ids: ['subaru-ascent-denso-low-pressure-fuel-pump-impeller-failure', 'subaru-ascent-fuel-pump-recall-2019'],
    decision: 'Preserve both indexed recall identities; their campaign and year scopes differ and no consolidation is authorized.',
  },
  {
    key: 'brz-valve-spring-pages',
    model: 'BRZ',
    ids: ['subaru-brz-fa20-valve-spring-fracture-stall-no-start', 'subaru-brz-valve-spring-recall-2013'],
    decision: 'Preserve both indexed identities; overlapping valve-spring scope requires separate identity policy and captured exact evidence.',
  },
  {
    key: 'legacy-head-gasket-pages',
    model: 'Legacy',
    ids: ['subaru-legacy-ej25-dohc-internal-head-gasket-failure', 'subaru-legacy-head-gasket-2000'],
    decision: 'Preserve both indexed identities; their engine and year boundaries cannot be silently collapsed.',
  },
  {
    key: 'outback-head-gasket-pages',
    model: 'Outback',
    ids: ['subaru-fb25-head-gasket-2011', 'subaru-head-gasket-2000'],
    decision: 'Preserve both indexed identities; their engine-generation scopes differ and no canonical URL is approved.',
  },
  {
    key: 'solterra-hub-bolt-pages',
    model: 'Solterra',
    ids: ['subaru-solterra-hub-bolt-loose-2023', 'subaru-solterra-hub-bolt-recall-2023'],
    decision: 'Preserve both indexed identities; consolidation or redirect policy is outside this audit.',
  },
]);

const modelObservations = Object.freeze(Object.fromEntries(supportedModels.map((model) => [model, [
  `All frozen Subaru ${model} pages remain published and byte-identical because no bounded rewrite has captured exact same-identity primary support.`,
]])));

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function snapshotRows() { return JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8')).records || []; }

function getContract(model, rows = snapshotRows()) {
  if (!Object.hasOwn(expectedPublishedModels, model)) throw new Error(`Unsupported Subaru model: ${model}`);
  const allIds = rows.filter((row) => isSubaruMake(row.make) && row.model === model && row.status === 'published').map((row) => row.id).sort();
  if (allIds.length !== expectedPublishedModels[model]) throw new Error(`${model}: expected ${expectedPublishedModels[model]} published IDs; found ${allIds.length}`);
  return {
    make: 'Subaru',
    model,
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: `data/known-issue-subaru-${model.toLowerCase().replace(/\s+/g, '-')}-adjudication-2026-08-11.json`,
    allIds,
    observations: modelObservations[model],
    evidenceInventory: {
      method: 'Every frozen citation was inventoried as metadata. No uncaptured source was promoted to exact primary proof and no negative-search conclusion is asserted.',
      exactConflictDocuments: 0,
      retainedRewriteDocuments: 0,
    },
    content: {},
  };
}

function clustersForModel(model) {
  return duplicateClusters.filter((cluster) => cluster.model === model);
}

module.exports = { clustersForModel, duplicateClusters, expectedPublishedModels, getContract, supportedModels };
