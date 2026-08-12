import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPrescribedParts } from './prescription';

// Every case below is real solution text from the catalog whose article was
// given the WRONG part when the title alone drove the choice.
test('pulls the exact sensor the solution names, not the one in the title', () => {
  const p = extractPrescribedParts('Replace crankshaft position sensor (use OEM part). Inspect and clean sensor connector for corrosion.');
  assert.equal(p[0], 'crankshaft position sensor');
});

test('reads a part named only in the solution', () => {
  const p = extractPrescribedParts('Inspect the fuel pump driver module and its mounting bracket for corrosion. Repair usually involves replacing the FPDM and often the bracket.');
  assert.ok(p.some((x) => x.startsWith('fpdm')), `got ${JSON.stringify(p)}`);
});

test('keeps the first of several prescribed parts', () => {
  const p = extractPrescribedParts('Replace the camshaft synchronizer AND the camshaft position sensor as a set.');
  assert.equal(p[0], 'camshaft synchronizer');
});

test('handles "swap or replace"', () => {
  const p = extractPrescribedParts('Swap or replace the failed GDI injector (intake manifold removal required).');
  assert.ok(p[0]?.includes('gdi injector'), `got ${JSON.stringify(p)}`);
});

test('preserves side qualifiers needed to avoid the wrong variant', () => {
  const p = extractPrescribedParts("The usual fix is to replace the driver's master window switch assembly.");
  assert.equal(p[0], 'driver master window switch');
  assert.equal(extractPrescribedParts('Replace the passenger-side mirror motor.')[0], 'passenger-side mirror motor');
});

// The negation cases are the whole reason the solution could not be trusted
// wholesale — each names a part the article is steering you away from.
test('ignores a part the solution says NOT to replace', () => {
  assert.deepEqual(extractPrescribedParts('Test the circuit before replacing the ignition coil.'), []);
  assert.deepEqual(extractPrescribedParts('Clean the throttle body instead of replacing the throttle position sensor.'), []);
  assert.deepEqual(extractPrescribedParts('Do not replace the catalytic converter until the misfire is fixed.'), []);
  assert.deepEqual(extractPrescribedParts('There is no reason to replace the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('Replacing the water pump is not recommended.'), []);
  assert.deepEqual(extractPrescribedParts('Replacement of the water pump is not required.'), []);
  assert.deepEqual(extractPrescribedParts('Installing the water pump is unnecessary.'), []);
  assert.deepEqual(extractPrescribedParts('There is little benefit in replacing the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('There is no benefit in replacing the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('There is no need for replacement of the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('No replacement of the water pump is necessary.'), []);
  assert.deepEqual(extractPrescribedParts('No replacement of the water pump is recommended.'), []);
  assert.deepEqual(extractPrescribedParts('Replacing the water pump should be avoided.'), []);
  assert.deepEqual(extractPrescribedParts('Replacement of the water pump is prohibited.'), []);
  assert.deepEqual(extractPrescribedParts('Installing the water pump is inadvisable.'), []);
  assert.deepEqual(extractPrescribedParts('Replacing the water pump is contraindicated.'), []);
});

test('a purely diagnostic solution prescribes nothing', () => {
  assert.deepEqual(extractPrescribedParts('Read freeze-frame data and compare fuel-trim values. Check for vacuum leaks.'), []);
  assert.deepEqual(extractPrescribedParts(''), []);
});

test('stops at the clause boundary rather than swallowing the sentence', () => {
  const p = extractPrescribedParts('Replace the water pump and inspect the timing cover for scoring.');
  assert.equal(p[0], 'water pump');
});

test('does not return a one-word phrase, which is too vague to query', () => {
  assert.deepEqual(extractPrescribedParts('Replace it. Replace both.'), []);
});

test('de-duplicates repeated prescriptions', () => {
  const p = extractPrescribedParts('Replace the water pump. Later, replace the water pump again if it weeps.');
  assert.equal(p.filter((x) => x === 'water pump').length, 1);
});
