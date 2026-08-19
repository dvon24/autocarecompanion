import assert from 'node:assert/strict';
import test from 'node:test';
import {
  diagnosticTools,
  diagnosticToolsForIssue,
  codeFamilyOf,
  proceduresInSolution,
  scannersForCodeFamilies,
  toolsForProcedures,
} from './diagnostic-tools';
import { isKnownIssueProductUrl } from '@/lib/known-issue-commerce';

test('every linked diagnostic tool uses a guarded product URL', () => {
  for (const tool of diagnosticTools) {
    if (tool.productUrl) assert.equal(isKnownIssueProductUrl(tool.productUrl), true, `${tool.id}: ${tool.productUrl}`);
  }
});

test('a scanner must support every family on a mixed-code issue', () => {
  const tools = scannersForCodeFamilies(['P', 'B']);
  assert.ok(tools.length > 0);
  assert.ok(tools.every((tool) => tool.codeFamilies.includes('P') && tool.codeFamilies.includes('B')));
  assert.notEqual(tools[0]?.id, 'ancel-ad310');
});

test('manufacturer-specific numeric codes do not default to generic P codes', () => {
  assert.equal(codeFamilyOf('2E81'), null);
  assert.equal(codeFamilyOf('P17BF'), null);
  assert.equal(codeFamilyOf('P0300'), 'P');
});

test('scan procedure filtering cannot reintroduce an incapable scanner', () => {
  const tools = toolsForProcedures(['scan-codes'], ['U']);
  assert.ok(tools.length > 0);
  assert.ok(tools.every((tool) => tool.codeFamilies.includes('U')));
});

test('DTC presence alone never creates scanner commerce for a repair article', () => {
  const selection = diagnosticToolsForIssue(
    'Replace the timing belt, tensioner, water pump, and all idler pulleys as a complete kit.',
    ['P0340', 'P0341'],
  );
  assert.deepEqual(selection.procedures, []);
  assert.deepEqual(selection.tools, []);
});

test('an explicit scan instruction selects a capability-matched scanner', () => {
  const selection = diagnosticToolsForIssue(
    'Connect a scan tool and retrieve the stored fault codes before replacing any component.',
    ['P0340'],
  );
  assert.deepEqual(selection.procedures, ['scan-codes']);
  assert.ok(selection.tools.length > 0);
  assert.ok(selection.tools.every((tool) => tool.kind === 'scanner' && tool.codeFamilies.includes('P')));
});

test('an explicit scan instruction with an unknown manufacturer code does not guess coverage', () => {
  const selection = diagnosticToolsForIssue(
    'Use a scanner to retrieve the stored fault codes before continuing.',
    ['2E81'],
  );
  assert.equal(selection.hasUnknownCode, true);
  assert.deepEqual(selection.tools, []);
});

test('unsupported procedure mentions are not claimed as covered', () => {
  assert.deepEqual(proceduresInSolution('Blue smoke test after startup.'), []);
  assert.deepEqual(proceduresInSolution('Perform a cooling-system pressure test.'), []);
  assert.deepEqual(proceduresInSolution('Perform a battery load test.'), []);
  assert.deepEqual(proceduresInSolution('Load-test the battery.'), []);
  assert.deepEqual(proceduresInSolution('Perform a battery state-of-health test.'), ['battery-state-of-health']);
  assert.equal(toolsForProcedures(['battery-state-of-health'])[0]?.id, 'battery-conductance-tester');
});

test('a parasitic-drain symptom mention is not a test prescription', () => {
  for (const solution of [
    'Disconnect the TCB to prevent parasitic drain.',
    'Install software that improves parasitic drain management.',
    'The update may reduce parasitic drain while parked.',
  ]) {
    assert.deepEqual(proceduresInSolution(solution), [], solution);
  }
});

test('an explicit parasitic-draw test still recommends the procedure', () => {
  assert.deepEqual(proceduresInSolution('Perform a parasitic draw test after the modules enter sleep mode.'), ['parasitic-draw']);
  assert.deepEqual(proceduresInSolution('Measure the parasitic drain with a low-current DC clamp meter.'), ['parasitic-draw']);
});

test('delegated, negated and not-required tests never produce affiliate guidance', () => {
  for (const solution of [
    'Have the dealer perform a parasitic draw test.',
    'Do not perform a parasitic draw test.',
    'A low-current DC clamp meter is not required.',
    'It is unnecessary to perform a parasitic draw test.',
    'There is no reason to perform a parasitic draw test.',
    'A parasitic draw test is not recommended.',
    'A low-current DC clamp meter is unnecessary.',
    'A low-current DC clamp meter is not needed.',
    'A low-current DC clamp meter should not be used.',
    'A low-current DC clamp meter must not be used.',
    'A low-current DC clamp meter should not be connected.',
    'A low-current DC clamp meter is not appropriate.',
    "A low-current DC clamp meter isn't needed.",
    "A low-current DC clamp meter won't be needed.",
    "A low-current DC clamp meter wouldn't be appropriate.",
    "A low-current DC clamp meter needn't be used.",
    'Have a mechanic perform a parasitic draw test.',
    'Ask your mechanic to perform a parasitic draw test.',
    'A qualified repair facility should perform a parasitic draw test.',
    'Let a garage perform a parasitic draw test.',
  ]) {
    assert.deepEqual(proceduresInSolution(solution), [], solution);
  }
});

test('malformed family-prefixed strings are not treated as supported DTCs', () => {
  assert.equal(codeFamilyOf('P0300'), 'P');
  assert.equal(codeFamilyOf('U0100'), 'U');
  assert.equal(codeFamilyOf('U1000'), null);
  for (const code of ['Pbanana', 'U', 'C-', 'B12', '2E81']) assert.equal(codeFamilyOf(code), null, code);
});
