/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  diagnosticDispositionsForIssue,
  proceduresInSolution,
  scannerToolIdForCodes,
} = require('./diagnostic-procedures');

test('links only a tool explicitly required by the solution', () => {
  const dispositions = diagnosticDispositionsForIssue(
    'Test the ignitor with a digital multimeter before replacing it.',
    [],
  );
  assert.deepEqual(dispositions, [{
    source: 'solution',
    status: 'tool-linked',
    procedure: 'multimeter-basic',
    toolId: 'fluke-15b-plus',
    productUrl: 'https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus',
    reasonCode: 'explicit-procedure-tool-matched',
    excerpt: 'Test the ignitor with a digital multimeter before replacing it.',
  }]);
});

test('DTC family chooses a capable scanner and unknown codes fail closed', () => {
  assert.equal(scannerToolIdForCodes(['P0300', 'P0700']).toolId, 'ancel-ad310');
  assert.equal(scannerToolIdForCodes(['U1000']).toolId, 'autel-mk808s');
  assert.equal(scannerToolIdForCodes(['22', 'P1259']).toolId, null);

  const held = diagnosticDispositionsForIssue('Pull codes with a scan tool.', ['22', 'P1259']);
  assert.equal(held.every((item) => item.status === 'unresolved-tool-hold'), true);
  assert.equal(held.every((item) => item.reasonCode === 'manufacturer-code-capability-unverified'), true);
});

test('delegated, visual and ambiguous instructions get explicit non-commerce dispositions', () => {
  const delegated = diagnosticDispositionsForIssue('Have the dealer perform an oil consumption test.', []);
  assert.equal(delegated[0]?.status, 'procedure-no-tool');
  assert.equal(delegated[0]?.procedure, 'professional-or-dealer-test');

  const visual = diagnosticDispositionsForIssue('Inspect the belt for cracks before replacement.', []);
  assert.equal(visual[0]?.status, 'procedure-no-tool');
  assert.equal(visual[0]?.procedure, 'inspection-or-monitoring');

  const ambiguous = diagnosticDispositionsForIssue('Test the module before replacing it.', []);
  assert.equal(ambiguous[0]?.status, 'unresolved-tool-hold');
  assert.equal(ambiguous[0]?.toolId, null);
});

test('broad symptoms never turn into tool recommendations', () => {
  assert.deepEqual(proceduresInSolution('Blue smoke appears after startup.'), []);
  assert.deepEqual(proceduresInSolution('Low fuel pressure may cause stalling.'), []);
  assert.deepEqual(proceduresInSolution('Compression is low on cylinder three.'), []);
});

test('true battery load tests do not get a conductance tester', () => {
  const dispositions = diagnosticDispositionsForIssue('Load-test the battery before replacement.', []);
  assert.equal(dispositions[0]?.status, 'unresolved-tool-hold');
  assert.equal(dispositions[0]?.toolId, null);
});

test('fuel-pressure and compression tools require proven compatible engine context', () => {
  const fuelUnsafe = diagnosticDispositionsForIssue(
    'Perform a fuel pressure test.',
    [],
    { engines: ['2.0L gasoline direct-injection I4'] },
  );
  assert.equal(fuelUnsafe[0]?.status, 'unresolved-tool-hold');
  assert.equal(fuelUnsafe[0]?.reasonCode, 'low-pressure-gasoline-application-unproven');

  const fuelSafe = diagnosticDispositionsForIssue(
    'Perform a fuel pressure test.',
    [],
    { engines: ['2.4L gasoline port-injection I4'] },
  );
  assert.equal(fuelSafe[0]?.toolId, 'otc-5630-fuel-pressure');

  const compressionDiesel = diagnosticDispositionsForIssue(
    'Perform a compression test.',
    [],
    { engines: ['3.0L turbodiesel V6'] },
  );
  assert.equal(compressionDiesel[0]?.status, 'unresolved-tool-hold');
  assert.equal(compressionDiesel[0]?.reasonCode, 'gasoline-compression-application-unproven');
});
