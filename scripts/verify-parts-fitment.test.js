/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  canReuseEvidenceResult,
  looserPartTypeTier,
  resolveModels,
  selectOrderedCategory,
  serializeCandidate,
  verifyEntry,
} = require('./verify-parts-fitment');

function reusableRows() {
  const entry = {
    id: 'cadillac-example',
    workItemId: 'cadillac-example--prescription-0-0--3-6l-v6',
    prescriptionKey: 'prescription--0--0',
    component: 'water pump',
    repairRoleEvidence: 'Replace the water pump after confirming shaft play.',
    articleScope: {
      make: 'Cadillac', model: 'Example', years: [2015, 2016], trims: [],
      engines: ['3.6L V6'], drivetrains: [], transmissions: [],
    },
    existingFixParts: [],
    partNumber: '',
    partTypeMatch: 'water pump',
    source: 'prescription',
    engineMatch: '3.6L',
  };
  const result = {
    id: entry.id,
    workItemId: entry.workItemId,
    prescriptionKey: entry.prescriptionKey,
    component: entry.component,
    repairRoleEvidence: entry.repairRoleEvidence,
    articleScope: entry.articleScope,
    existingFixParts: [],
    quotedPartNumber: '',
    partTypeMatch: entry.partTypeMatch,
    mappedFrom: 'prescription',
    engineMatch: entry.engineMatch,
    verdict: 'discovered',
  };
  return { entry, result };
}

test('resume reuses only exact worklist/evidence identity', () => {
  const { entry, result } = reusableRows();
  assert.equal(canReuseEvidenceResult(entry, result), true);
  assert.equal(canReuseEvidenceResult({ ...entry, component: 'thermostat' }, result), false);
  assert.equal(canReuseEvidenceResult({ ...entry, repairRoleEvidence: 'Replace the thermostat.' }, result), false);
  assert.equal(canReuseEvidenceResult({ ...entry, partTypeMatch: 'pump' }, result), false);
  assert.equal(canReuseEvidenceResult({ ...entry, engineMatch: '2.0L' }, result), false);
  assert.equal(canReuseEvidenceResult(entry, { ...result, verdict: '' }), false);
});

test('verifier output preserves every catalog restriction channel', () => {
  const projected = serializeCandidate({
    supplier: 'Example', partNumber: 'ABC123', partType: 'Disc Brake Caliper', brand: 'Example',
    engine: '2.0L', catalogModel: 'Sonata', application: 'Hybrid SE/SEL',
    comment: 'Without sport package', location: 'FRONT LEFT',
  });
  assert.equal(projected.application, 'Hybrid SE/SEL');
  assert.equal(projected.comment, 'Without sport package');
  assert.equal(projected.location, 'FRONT LEFT');
});

const models = (...names) => names.map((data, index) => ({ id: String(index + 1), data }));

test('C-Class aliases cannot swallow CL or CLS vehicles', () => {
  const result = resolveModels(models('C300', 'C63 AMG', 'CL500', 'CLS350'), 'C-Class', 'Mercedes-Benz');
  assert.deepEqual(result.rows.map((row) => row.data), ['C300', 'C63 AMG']);
});

test('SLK/SLC aliases retain both catalog stems', () => {
  const result = resolveModels(models('SLK250', 'SLC300', 'SL500'), 'SLK/SLC', 'Mercedes-Benz');
  assert.deepEqual(result.rows.map((row) => row.data), ['SLK250', 'SLC300']);
});

test('relaxation evidence always keeps the loosest tier', () => {
  let tier = looserPartTypeTier('', 'electric water pump');
  tier = looserPartTypeTier(tier, 'water pump');
  tier = looserPartTypeTier(tier, 'pump');
  tier = looserPartTypeTier(tier, 'electric water pump');
  assert.equal(tier, 'pump');
});

test('ordered category fallback never pools a lower-priority category', () => {
  const part = (part_type, id) => ({
    category: id.startsWith('primary') ? 'primary' : 'fallback',
    part: { part_type, part_number: id },
  });
  const result = selectOrderedCategory([
    part('Engine Water Pump', 'primary-1'),
    part('Engine Water Pump', 'fallback-1'),
    part('Engine Water Pump', 'fallback-2'),
  ], ['primary', 'fallback'], 'water pump');
  assert.equal(result.usedCategory, 'primary');
  assert.deepEqual(result.matched.map((entry) => entry.part.part_number), ['primary-1']);
});

test('fitment evidence preserves the exact How-to-Fix repair-role sentence', async () => {
  const result = await verifyEntry({
    id: 'acura-example', workItemId: 'acura-example--pump', prescriptionKey: 'pump',
    make: 'Acura', model: 'Example', years: [2001], component: 'water pump',
    repairRoleEvidence: 'Replace the water pump only after a failed pressure test.',
    mappingStatus: 'unmapped', productMatch: [], partTypeMatch: 'water pump',
  });
  assert.equal(result.repairRoleEvidence, 'Replace the water pump only after a failed pressure test.');
  assert.equal(result.verdict, 'unmapped');
});
