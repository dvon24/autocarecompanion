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
  assert.equal(scannerToolIdForCodes(['U1000']).toolId, null);
  assert.equal(scannerToolIdForCodes(['U1000']).reasonCode, 'non-powertrain-module-capability-unverified');
  assert.equal(scannerToolIdForCodes(['22', 'P1259']).toolId, null);

  const held = diagnosticDispositionsForIssue('Pull codes with a scan tool.', ['22', 'P1259']);
  assert.equal(held.every((item) => item.status === 'unresolved-tool-hold'), true);
  assert.equal(held.every((item) => item.reasonCode === 'manufacturer-code-capability-unverified'), true);
});

test('generic scanner recommendations fail closed for manufacturer and hybrid/EV powertrain codes', () => {
  assert.deepEqual(scannerToolIdForCodes(['P17D0']), {
    toolId: null,
    families: ['P'],
    reasonCode: 'manufacturer-code-capability-unverified',
  });
  assert.deepEqual(scannerToolIdForCodes(['P0A0F'], { engines: ['1.3L Turbo PHEV'] }), {
    toolId: null,
    families: ['P'],
    reasonCode: 'hybrid-ev-scanner-capability-unverified',
  });
  const rows = diagnosticDispositionsForIssue('', ['P0A0F'], { engines: ['1.3L Turbo PHEV'] });
  assert.equal(rows[0]?.status, 'unresolved-tool-hold');
  assert.equal(rows[0]?.toolId, null);
});

test('reviewed Audi context selects VCDS for manufacturer and control-module codes', () => {
  assert.equal(scannerToolIdForCodes(['P17D0'], { make: 'Audi', years: [2016] }).toolId, 'ross-tech-vcds-hex-v2');
  assert.equal(scannerToolIdForCodes(['C1132'], { make: 'Audi', years: [2014] }).toolId, 'ross-tech-vcds-hex-v2');
  assert.equal(scannerToolIdForCodes(['P17D0'], { make: 'Acura', years: [2016] }).toolId, null);
  assert.equal(scannerToolIdForCodes(['P17D0'], { make: 'Audi', years: [1994] }).toolId, null);
  assert.deepEqual(proceduresInSolution('Scan with VCDS before repair.'), ['vag-scan-codes']);
  assert.deepEqual(proceduresInSolution('Use a VAG-capable scan tool to identify address 03.'), ['vag-scan-codes']);
  assert.deepEqual(proceduresInSolution('Scan the TCM and retain the printout.'), ['vag-scan-codes']);
});

test('explicit multimeter and parasitic-draw noun forms resolve without symptom inference', () => {
  assert.deepEqual(proceduresInSolution('Connect a multimeter to terminals 1 and 2.'), ['multimeter-basic']);
  assert.deepEqual(proceduresInSolution('Begin with a parasitic draw measurement after sleep.'), ['parasitic-draw']);
});

test('explicit passive cooling-pressure and battery-SOH testing forms resolve', () => {
  assert.deepEqual(proceduresInSolution('Have the cooling system pressure-tested.'), ['cooling-pressure-test']);
  assert.deepEqual(proceduresInSolution('Begin with battery state-of-health testing.'), ['battery-state-of-health']);
});

test('inline manufacturer codes override an otherwise generic P-code scanner choice', () => {
  const rows = diagnosticDispositionsForIssue(
    'Pull DTCs with a scan tool and check Honda Code 22 before replacing the part.',
    ['P1259'],
  );
  assert.ok(rows.length >= 2);
  assert.equal(rows.every((row) => row.status === 'unresolved-tool-hold'), true);
  assert.equal(rows.every((row) => row.reasonCode === 'manufacturer-code-capability-unverified'), true);
});

test('diagnostic negation binds to the procedure, not an unrelated later condition', () => {
  assert.deepEqual(proceduresInSolution('Pull codes with a scan tool if the actuator is not engaging.'), ['scan-codes']);
  assert.deepEqual(proceduresInSolution('Pull DTCs before replacement.'), ['scan-codes']);
  assert.deepEqual(proceduresInSolution('Do not pull codes with a scan tool.'), []);
  assert.deepEqual(proceduresInSolution('A scan tool is not required.'), []);
  assert.deepEqual(
    diagnosticDispositionsForIssue('Do not replace the battery before performing a parasitic draw test.', [])
      .map((row) => row.toolId),
    ['dc-clamp-meter-low-current'],
  );
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
