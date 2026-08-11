import assert from 'node:assert/strict';
import test from 'node:test';
import {
  codeFamilyOf,
  proceduresInSolution,
  scannersForCodeFamilies,
  toolsForProcedures,
} from './diagnostic-tools';

test('a scanner must support every family on a mixed-code issue', () => {
  const tools = scannersForCodeFamilies(['P', 'B']);
  assert.ok(tools.length > 0);
  assert.ok(tools.every((tool) => tool.codeFamilies.includes('P') && tool.codeFamilies.includes('B')));
  assert.notEqual(tools[0]?.id, 'ancel-ad310');
});

test('manufacturer-specific numeric codes do not default to generic P codes', () => {
  assert.equal(codeFamilyOf('2E81'), null);
  assert.equal(codeFamilyOf('P0300'), 'P');
});

test('scan procedure filtering cannot reintroduce an incapable scanner', () => {
  const tools = toolsForProcedures(['scan-codes'], ['U']);
  assert.ok(tools.length > 0);
  assert.ok(tools.every((tool) => tool.codeFamilies.includes('U')));
});

test('unsupported procedure mentions are not claimed as covered', () => {
  assert.deepEqual(proceduresInSolution('Blue smoke test after startup.'), []);
  assert.deepEqual(proceduresInSolution('Perform a cooling-system pressure test.'), []);
});
