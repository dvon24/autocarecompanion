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
  assert.deepEqual(parts.map((part) => part.component), ['ignitor', 'cap', 'rotor']);
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

test('extracts the omitted Acura imperative purchase and replace-with branches', () => {
  const cl = extractPrescriptionComponents('Replacements/rebuilds may need a fresh torque converter. Add an aftermarket transmission cooler at rebuild time.');
  assert.deepEqual(cl.map((part) => part.component), ['torque converter', 'aftermarket transmission cooler']);
  assert.equal(cl[0]?.diagnosisDependent, true);

  assert.deepEqual(
    extractPrescribedParts('Order eight of Honda part number 91608-SJ6-003 (the clear grommet/seal pieces) from a Honda dealer. Then replace the old foam strip with new urethane weatherstripping.'),
    ['clear grommet/seal pieces', 'urethane weatherstripping'],
  );
  assert.deepEqual(extractPrescribedParts('Replace with OEM Honda bolts (M10x1.25).'), ['honda bolts m10x1.25']);
  assert.deepEqual(extractPrescribedParts('Or replace with OEM Omron unit ($50-100).'), ['omron unit']);
  assert.deepEqual(extractPrescribedParts('Always replace the axle nut and use a new transaxle retaining ring.'), ['axle nut', 'transaxle retaining ring']);
});

test('extracts omitted Acura replacement lists and slash-separated assemblies', () => {
  assert.deepEqual(
    extractPrescribedParts('Rebuild the pump motor (clean commutator, replace brushes) or replace pump/accumulator assembly.'),
    ['brushes', 'pump/accumulator'],
  );
  assert.deepEqual(extractPrescribedParts('If tubes are split, headliner removal is required to replace them.'), ['tubes']);
  const slx = extractPrescriptionComponents('Once whine is pronounced, the only durable fix is a remanufactured rear axle assembly. If the case is whining, source the correct Borg-Warner rebuild kit by part number from the exact year and transmission.');
  assert.deepEqual(slx.map((part) => part.component), ['remanufactured rear axle', 'borg-warner rebuild kit']);
  assert.ok(slx.every((part) => part.diagnosisDependent));
  assert.deepEqual(
    extractPrescribedParts('Full timing kit replacement: belt + hydraulic tensioner + water pump + idler + all front seals + accessory belts as one job.'),
    ['belt', 'hydraulic tensioner', 'water pump', 'idler', 'front seals', 'accessory belts', 'timing kit'],
  );
});

test('extracts all Acura part-before-modal replacement forms', () => {
  const cases = [
    ['If reboots continue, the infotainment control module may need hardware replacement under warranty.', 'infotainment control module'],
    ['If shudder persists, the torque converter assembly must be replaced.', 'torque converter'],
    ['If reboots persist, the infotainment control unit may require replacement.', 'infotainment control unit'],
    ['If freezing persists, the head unit may need replacement with revised hardware.', 'head unit'],
  ] as const;
  for (const [source, component] of cases) {
    const parts = extractPrescriptionComponents(source);
    assert.deepEqual(parts.map((part) => part.component), [component], source);
    assert.equal(parts[0]?.diagnosisDependent, true, source);
  }
});

test('covers next-make Alfa owner-buyable and noun-first replacement prose', () => {
  assert.deepEqual(extractPrescribedParts('Replace worn bushings with polyurethane or spherical upgrades for improved longevity.'), ['bushings']);
  const cases = [
    ['A water-damaged BCM must be replaced and re-programmed.', 'water-damaged bcm'],
    ['ECM replacement with updated software may be required.', 'ecm'],
    ['If the issue recurs, the head unit hardware may need replacement under warranty.', 'head unit'],
    ['ECM replacement with updated calibration may be needed for persistent cases.', 'ecm'],
    ['If the onboard charger module has failed, it requires replacement.', 'onboard charger module'],
  ] as const;
  for (const [source, component] of cases) {
    const parts = extractPrescriptionComponents(source);
    assert.deepEqual(parts.map((part) => part.component), [component], source);
    assert.equal(parts[0]?.diagnosisDependent, true, source);
  }
});

test('holds a bare replacement pronoun when more than one antecedent is plausible', () => {
  assert.deepEqual(extractPrescribedParts('Inspect the blower motor and resistor. If corroded, replace them.'), []);
  assert.deepEqual(
    extractPrescribedParts('If the blower motor or resistor has already corroded, replace those at the same time.'),
    ['blower motor', 'resistor'],
  );
  assert.deepEqual(extractPrescribedParts('Inspect the pump and accumulator. Replace it.'), []);
  assert.deepEqual(extractPrescribedParts('Test the ignitor before replacing it. If no pulse: replace.'), ['ignitor']);
});

test('preserves Acura replacement objects, coordinated branches, and exact specifications', () => {
  assert.deepEqual(
    extractPrescribedParts('Replace the high-pressure hose with OEM Honda part and flush the system. Replace return hose too.'),
    ['high-pressure hose', 'return hose'],
  );
  assert.deepEqual(extractPrescribedParts('Replace O-rings and the pump motor brushes if worn.'), ['o-rings', 'pump motor brushes']);
  assert.deepEqual(extractPrescribedParts('The only fix is replacing the whole distributor assembly.'), ['distributor']);
  assert.deepEqual(extractPrescribedParts('Replace the timing belt every 90,000 miles.'), ['timing belt']);
  assert.deepEqual(extractPrescribedParts('Replace front, rear, and upper seals.'), ['front seals', 'rear seals', 'upper seals']);
  assert.deepEqual(extractPrescribedParts('Replace or machine rotors if within spec.'), ['rotors']);
  assert.deepEqual(extractPrescribedParts('Install a new receiver/drier to prevent moisture contamination.'), ['receiver/drier']);
  assert.deepEqual(extractPrescribedParts('Apply anti-squeal shims if missing from the factory.'), ['anti-squeal shims']);
  assert.deepEqual(extractPrescribedParts('If noise persists, rebuild the differential with new clutch packs.'), ['clutch packs']);
});

test('keeps modal and passive prescriptions conditional and rejects imperative negation', () => {
  for (const source of [
    'You may need to replace the water pump.',
    'The sensor may need to be replaced.',
    'Replacement of the water pump may be required.',
  ]) {
    const parts = extractPrescriptionComponents(source);
    assert.equal(parts.length, 1, source);
    assert.equal(parts[0]?.diagnosisDependent, true, source);
  }
  assert.deepEqual(extractPrescribedParts('The water pump is to be replaced.'), ['water pump']);
  assert.deepEqual(extractPrescribedParts('Never Use an aftermarket sensor.'), []);
  assert.deepEqual(extractPrescribedParts('DO NOT USE an aftermarket sensor.'), []);
});

test('does not turn fluids, workarounds, or explicit avoid-replacement prose into parts', () => {
  assert.deepEqual(extractPrescribedParts('Use ONLY Honda PSF - no universal/ATF.'), []);
  assert.deepEqual(extractPrescribedParts('Use a wired USB connection as a workaround for reliable CarPlay.'), []);
  assert.deepEqual(extractPrescribedParts('Avoid full Acura CCU replacement: the rebuilt original works identically.'), []);
  assert.deepEqual(extractPrescribedParts("Never use a generic 'timing belt only' service — replacing the belt without the water pump guarantees a second teardown."), []);
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
