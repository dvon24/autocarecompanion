import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPrescribedParts, extractPrescriptionComponents } from './prescription';

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

test('enumerates every owner-buyable component in one repair clause', () => {
  assert.deepEqual(
    extractPrescribedParts('Replace the camshaft synchronizer and the camshaft position sensor as a set.'),
    ['camshaft synchronizer', 'camshaft position sensor'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the water pump, thermostat, and upper radiator hose.'),
    ['water pump', 'thermostat', 'upper radiator hose'],
  );
});

test('keeps repair-role evidence and diagnosis conditions per component', () => {
  const parts = extractPrescriptionComponents('If testing confirms low pressure, replace the fuel pump and fuel pump relay.');
  assert.deepEqual(parts.map((part) => part.component), ['fuel pump', 'fuel pump relay']);
  assert.ok(parts.every((part) => part.diagnosisDependent));
  assert.match(parts[0]!.condition || '', /if testing confirms/i);
  assert.match(parts[0]!.evidence, /replace the fuel pump/i);
});

test('stops enumerating when the next coordinated phrase is an inspection', () => {
  assert.deepEqual(
    extractPrescribedParts('Replace the water pump and inspect the timing cover and belt.'),
    ['water pump'],
  );
});

test('a parenthetical warning about cheap alternatives does not negate replacement', () => {
  assert.deepEqual(
    extractPrescribedParts('Replace the complete OEM distributor assembly (avoid cheap aftermarket units).'),
    ['distributor'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the ignition switch electrical portion (not the cylinder or lock).'),
    ['ignition switch electrical portion'],
  );
});

test('later Acura qualifiers and fault conditions do not negate their replacement object', () => {
  assert.deepEqual(
    extractPrescribedParts('Inspect the mounts and replace the failed engine mount, not all four preemptively.'),
    ['engine mount'],
  );
  const actuator = extractPrescriptionComponents('Replace the VTEC actuator if it is not engaging after the oil-pressure test.');
  assert.deepEqual(actuator.map((part) => part.component), ['vtec actuator']);
  assert.equal(actuator[0]?.diagnosisDependent, true);
  assert.match(actuator[0]?.condition || '', /if it is not engaging/i);
  const unpunctuated = extractPrescriptionComponents('If the actuator does not engage replace the actuator.');
  assert.deepEqual(unpunctuated.map((part) => part.component), ['actuator']);
  assert.equal(unpunctuated[0]?.diagnosisDependent, true);
});

test('resolves a tested Acura ignitor when the later conditional replacement is anaphoric', () => {
  const parts = extractPrescriptionComponents(
    'Test the ignitor before replacing it. If no pulse: replace. Replace cap + rotor at the same time as a preventive measure.',
  );
  assert.deepEqual(parts.map((part) => part.component), ['ignitor', 'cap rotor']);
  assert.equal(parts[0]?.diagnosisDependent, true);
  assert.match(parts[0]?.condition || '', /if no pulse/i);
  assert.match(parts[0]?.evidence || '', /test the ignitor[\s\S]*if no pulse:\s*replace/i);
});

test('extracts passive and modal Acura replacement prescriptions with their conditions', () => {
  const clutch = extractPrescriptionComponents(
    'Update the DCT software. In severe cases, the clutch pack assembly needs replacement.',
  );
  assert.deepEqual(clutch.map((part) => part.component), ['clutch pack']);
  assert.equal(clutch[0]?.diagnosisDependent, true);
  assert.match(clutch[0]?.condition || '', /severe cases/i);
  assert.match(clutch[0]?.evidence || '', /clutch pack assembly needs replacement/i);

  const screen = extractPrescriptionComponents(
    'Perform a factory reset. If the touchscreen digitizer has failed, the lower screen unit needs replacement.',
  );
  assert.deepEqual(screen.map((part) => part.component), ['lower screen unit']);
  assert.equal(screen[0]?.diagnosisDependent, true);
  assert.match(screen[0]?.condition || '', /if the touchscreen digitizer has failed/i);

  const converter = extractPrescriptionComponents(
    'Update the transmission control module. Severe cases may require torque converter replacement.',
  );
  assert.deepEqual(converter.map((part) => part.component), ['torque converter']);
  assert.equal(converter[0]?.diagnosisDependent, true);
  assert.match(converter[0]?.condition || '', /severe cases/i);
});

test('resolves cost-to-replace and vague-unit wording to the nearest specific Acura component', () => {
  const solenoid = extractPrescriptionComponents(
    'A screwed up lock-up solenoid will give you a general CEL #70; the solenoid is accessible and costs less than $200 to replace.',
  );
  assert.deepEqual(solenoid.map((part) => part.component), ['lock-up solenoid']);
  assert.equal(solenoid[0]?.diagnosisDependent, false);
  assert.match(solenoid[0]?.evidence || '', /lock-up solenoid[\s\S]*costs less than \$200 to replace/i);

  const fanUnit = extractPrescriptionComponents(
    'Pull the fan control unit from under the passenger carpet and reflow the cracked solder joints, or replace the unit.',
  );
  assert.deepEqual(fanUnit.map((part) => part.component), ['fan control unit']);
  assert.equal(fanUnit[0]?.diagnosisDependent, false);
  assert.match(fanUnit[0]?.evidence || '', /fan control unit[\s\S]*replace the unit/i);
});

test('passive and anaphoric extraction remains fail-closed under negation', () => {
  assert.deepEqual(extractPrescribedParts('The water pump does not need replacement.'), []);
  assert.deepEqual(extractPrescribedParts('No water pump needs replacement.'), []);
  assert.deepEqual(extractPrescribedParts('Test the ignition coil. Do not replace it.'), []);
  assert.deepEqual(extractPrescribedParts('Inspect the fan control unit rather than replace the unit.'), []);
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
  assert.deepEqual(extractPrescribedParts('Replacing the water pump must be avoided.'), []);
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
