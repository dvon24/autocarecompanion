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
  assert.deepEqual(
    extractPrescribedParts('Replace upper and lower ball joints.'),
    ['upper ball joints', 'lower ball joints'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the camshaft synchronizer assembly along with the camshaft position sensor.'),
    ['camshaft synchronizer', 'camshaft position sensor'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the complete intake manifold assembly with the updated design, along with a new thermostat, intake gaskets, heater hose O-rings, and fresh coolant.'),
    ['intake manifold', 'thermostat', 'intake gaskets', 'heater hose o-rings'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the complete intake manifold assembly with the updated design that uses an aluminum coolant crossover, along with a new thermostat, intake gaskets, heater hose O-rings, and fresh coolant.'),
    ['intake manifold', 'thermostat', 'intake gaskets', 'heater hose o-rings'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the failed exterior and/or interior door handle with an upgraded handle.'),
    ['exterior door handle', 'interior door handle'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the DPFE sensor with the updated Motorcraft plastic-body unit.'),
    ['dpfe sensor'],
  );
  assert.deepEqual(
    extractPrescribedParts('Always replace transmission fluid and filter simultaneously.'),
    ['filter'],
  );
  assert.deepEqual(
    extractPrescribedParts('Press in a new upper ball joint using a ball-joint press.'),
    ['upper ball joint'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the thermostat every ~2 years.'),
    ['thermostat'],
  );
  const sensor = extractPrescriptionComponents('If the Bank 2 downstream O2 sensor is sluggish, replace it first.');
  assert.deepEqual(sensor.map((part) => part.component), ['bank 2 downstream o2 sensor']);
  assert.ok(sensor[0]?.diagnosisDependent);
  assert.deepEqual(
    extractPrescribedParts('If fluid is burnt, the torque converter (and often the pump stator support bushing) needs replacement.'),
    ['torque converter', 'pump stator support bushing'],
  );
  assert.deepEqual(
    extractPrescribedParts('Bolt-on front drum-to-disc kits add vented rotors and calipers.'),
    ['bolt-on front drum-to-disc kits'],
  );
  assert.deepEqual(
    extractPrescribedParts("Many restorers also fit an external top-oiler kit and switch to non-tabbed aftermarket valve covers."),
    ['external top-oiler kit', 'non-tabbed aftermarket valve covers'],
  );
  assert.deepEqual(
    extractPrescribedParts('Reseal the housing with fresh butyl tape.'),
    ['butyl tape'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the degas bottle and cracked quick-connect fittings.'),
    ['degas bottle', 'quick-connect fittings'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the plastic hydraulic clutch line with a braided stainless steel line.'),
    ['braided stainless steel line'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the plastic hydraulic clutch line with a braided stainless steel line; some also remove or adjust the over-center assist spring. Persistent cases point to a failing concentric slave cylinder, which requires transmission removal to replace.'),
    ['braided stainless steel line', 'concentric slave cylinder'],
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

test('captures every Acura branch found by the fifth exact-commit review', () => {
  assert.deepEqual(
    extractPrescribedParts('Proper repair is to replace the complete rear quarter. Aftermarket wheel arch and quarter patch panels are available.'),
    ['rear quarter', 'quarter patch panels'],
  );
  assert.deepEqual(
    extractPrescribedParts('Some owners replace the rear as a complete pre-pressed hub assembly; others source just the bearing/race and press it.'),
    ['rear pre-pressed hub', 'bearing/race'],
  );
  assert.deepEqual(extractPrescribedParts('To avoid recurrence, install an aftermarket auto-disable module.'), ['aftermarket auto-disable module']);
  assert.deepEqual(
    extractPrescribedParts('Replace failed hydraulic motor mounts (front + rear) and any oil-fouled plugs. Many owners install a VCM Tuner / S-VCM Controller.'),
    ['hydraulic motor mounts', 'oil-fouled plugs', 'vcm tuner / s-vcm controller'],
  );
  assert.deepEqual(extractPrescribedParts('Repairs may involve updated pistons/rings under prior warranty programs.'), ['pistons/rings']);
  assert.deepEqual(extractPrescribedParts('A long-term fix is swapping to a later C-series engine.'), ['later c-series engine']);
  assert.deepEqual(
    extractPrescribedParts('Most owners simply swap the full reman half-shaft for under $100/side.'),
    ['reman half-shaft'],
  );
  assert.deepEqual(extractPrescribedParts('For track use, consider upgrading to carbon-lined synchros.'), ['carbon-lined synchros']);
  assert.deepEqual(
    extractPrescribedParts('DIY O-ring rebuild with the SOS or egmCarTech kit. There is an upgrade path to swap the 1991-1999 NA1 modulator for the 2000-2005 NA2 unit using the SOS conversion kit.'),
    ['o-ring rebuild kit', '2000-2005 na2 unit', 'sos conversion kit'],
  );
  assert.deepEqual(extractPrescribedParts('Replace the complete OEM distributor assembly (avoid cheap aftermarket).'), ['distributor']);
  assert.deepEqual(
    extractPrescribedParts('Replace the complete OEM distributor assembly (avoid cheap aftermarket — many fail within months).'),
    ['distributor'],
  );
  assert.deepEqual(extractPrescribedParts('Inspect and replace caliper bracket hardware if corroded.'), ['caliper bracket hardware']);
});

test('fix and rebuild helper paths bind negation to their own action', () => {
  assert.deepEqual(extractPrescribedParts('The fix is not replacing the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('The only fix is not to replace the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('Do not rebuild the transmission with new clutch packs.'), []);
});

test('captures the remaining Acura owner-buyable branches without turning prose into prescriptions', () => {
  const boot = extractPrescriptionComponents(
    'If the boot has just torn and no debris entered the joint, regreasing and rebooting can work — a $10 boot kit versus a $60 replacement axle.',
  );
  assert.deepEqual(boot.map((part) => part.component), ['boot kit']);
  assert.equal(boot[0]?.diagnosisDependent, true);

  assert.deepEqual(
    extractPrescribedParts('Aftermarket intercooler upgrades significantly reduce heat soak on the 1.5T.'),
    ['aftermarket intercooler'],
  );
  assert.deepEqual(
    extractPrescribedParts('Use the exact butyl tape (0.5mm) and EPT sealer (3.0mm) called out in the service manual, plus sealant #08712-0004.'),
    ['exact butyl tape 0.5mm', 'ept sealer 3.0mm', 'sealant 08712-0004'],
  );
  const heatSink = extractPrescriptionComponents('Civic/Integra units may require heat sink #30121-PM5-A02 for correct fitment.');
  assert.deepEqual(heatSink.map((part) => part.component), ['heat sink 30121-pm5-a02']);
  assert.equal(heatSink[0]?.diagnosisDependent, true);

  assert.deepEqual(extractPrescribedParts('Avoid replacing the water pump but replace the thermostat.'), ['thermostat']);
  assert.deepEqual(extractPrescribedParts('Repairs may not involve replacing the water pump.'), []);
  assert.deepEqual(extractPrescribedParts('The price to replace the water pump is $900.'), []);
  assert.deepEqual(extractPrescribedParts('Most owners use a specialist for the install.'), []);
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

test('captures every Challenger driveshaft and front-suspension repair branch', () => {
  const driveshaft = extractPrescriptionComponents(
    'Replace failed U-joints with high-strength units like Spicer SPL70 or SPL90. '
    + 'For repeated failures, upgrade to an aftermarket one-piece aluminum driveshaft from DSS, The Driveshaft Shop, or Tom Woods ($600-1,200). '
    + 'If drag racing or running 500+ HP, a carbon fiber driveshaft ($1,500-2,500) is recommended.',
  );
  assert.equal(driveshaft[0]?.component, 'u-joints');
  assert.ok(driveshaft.some((part) => part.component === 'aftermarket one-piece aluminum driveshaft'));
  assert.ok(driveshaft.some((part) => part.component === 'carbon fiber driveshaft' && part.diagnosisDependent));
  assert.ok(!driveshaft.some((part) => part.component === 'driveshaft shop'));

  const suspension = extractPrescribedParts(
    'If links are worn, replace the front sway-bar end links. '
    + 'For noise that remains after the links, replace worn outer tie-rod ends, front control-arm bushings, and/or ball joints as inspection dictates.',
  );
  assert.deepEqual(suspension, [
    'front sway-bar end links',
    'outer tie-rod ends',
    'front control-arm bushings',
    'ball joints',
  ]);
});

test('captures explicit Ford fit, conversion, body, and service-part branches', () => {
  assert.deepEqual(
    extractPrescribedParts('Fit a high-efficiency aluminum radiator sized for the Bronco V8. Pair it with a 16-inch electric fan and a proper shroud.'),
    ['high-efficiency aluminum radiator', '16-inch electric fan', 'shroud'],
  );
  assert.deepEqual(extractPrescribedParts('Replace both rear shock absorbers as a pair.'), ['rear shock absorbers']);
  assert.deepEqual(extractPrescribedParts('Replace the window regulator assembly.'), ['window regulator']);
  assert.deepEqual(
    extractPrescribedParts('Replace all three timing chains, guides, tensioners, and sprockets.'),
    ['three timing chains', 'guides', 'tensioners', 'sprockets'],
  );
  assert.deepEqual(
    extractPrescribedParts('Convert to a modern one-wire alternator. Run a properly sized charge cable straight to the battery.'),
    ['modern one-wire alternator'],
  );
  assert.deepEqual(extractPrescribedParts('Installing an oil catch can on the intake tract reduces future buildup.'), ['oil catch can']);
  assert.deepEqual(extractPrescribedParts('Install a Time-Sert thread repair insert in the damaged cylinder head.'), ['time-sert thread repair insert']);
  assert.deepEqual(extractPrescribedParts('Replace the EGR cooler. Upgrade kits are available.'), ['egr cooler', 'upgrade kits']);
});

test('keeps Ford required-replacement prose conditional only when the source is conditional', () => {
  const conditional = extractPrescriptionComponents('In severe cases, torque converter replacement required under warranty.');
  assert.deepEqual(conditional.map((part) => part.component), ['torque converter']);
  assert.equal(conditional[0]?.diagnosisDependent, true);

  const unconditional = extractPrescriptionComponents('Complete timing chain replacement required.');
  assert.deepEqual(unconditional.map((part) => part.component), ['timing chain']);
  assert.equal(unconditional[0]?.diagnosisDependent, false);

  const phaser = extractPrescriptionComponents('If noise is excessive, cam phaser replacement may be needed.');
  assert.deepEqual(phaser.map((part) => part.component), ['cam phaser']);
  assert.equal(phaser[0]?.diagnosisDependent, true);
});

test('does not turn a feature or installation location into a second Ford part', () => {
  assert.deepEqual(
    extractPrescribedParts('Replace the regulator assembly. Aftermarket regulators with metal gears are available.'),
    ['regulator'],
  );
  assert.deepEqual(
    extractPrescribedParts('Install a steel thread insert in the damaged cylinder head. Preventive installation of inserts on all cylinders is recommended.'),
    ['steel thread insert'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the failed exterior handle and free the linkage.'),
    ['exterior handle'],
  );
  assert.deepEqual(extractPrescribedParts('Use top-tier gasoline which contains enhanced additives.'), []);
  assert.deepEqual(extractPrescribedParts('The fastener may require an EZ-out or head removal.'), []);
});

test('normalizes Ford repair lists without losing the actual part roles', () => {
  const modules = extractPrescriptionComponents('Persistent failures may require APIM or camera module diagnosis and replacement.');
  assert.deepEqual(modules.map((part) => part.component), ['apim', 'camera module']);
  assert.ok(modules.every((part) => part.diagnosisDependent));

  assert.deepEqual(
    extractPrescribedParts('Repairs may include replacing the cruise control cable, cleaning or replacing the throttle body, and adjusting or replacing the accelerator cable/linkage.'),
    ['cruise control cable', 'throttle body', 'accelerator cable/linkage'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace worn steering/suspension parts: track-bar and radius-arm bushings, ball joints, and tie-rod ends.'),
    ['track-bar bushings', 'radius-arm bushings', 'ball joints', 'tie-rod ends'],
  );
  assert.deepEqual(
    extractPrescribedParts('Both the upper and lower roller assemblies should be replaced together.'),
    ['upper roller', 'lower roller'],
  );
  assert.deepEqual(extractPrescribedParts('Replace the in-tank pump/sender module.'), ['in-tank pump/sender module']);
  assert.deepEqual(extractPrescribedParts('Replace the exhaust flex pipe section.'), ['exhaust flex pipe section']);
  assert.deepEqual(extractPrescribedParts('Replace the rear liftgate harness section.'), ['rear liftgate harness section']);
  assert.deepEqual(extractPrescribedParts('Replace the instrument cluster assembly.'), ['instrument cluster']);
});

test('captures explicitly offered and functional Ford repair options', () => {
  const kit = extractPrescriptionComponents('A thread repair kit can permanently restore the damaged threads.');
  assert.deepEqual(kit.map((part) => part.component), ['thread repair kit']);
  assert.equal(kit[0]?.diagnosisDependent, true);

  assert.deepEqual(
    extractPrescribedParts('Aftermarket auto start-stop eliminator devices are available that remember your preference.'),
    ['aftermarket auto start-stop eliminator devices'],
  );
  assert.deepEqual(
    extractPrescribedParts('Aftermarket rebuilt rear axle assemblies are available and can be more economical.'),
    ['aftermarket rebuilt rear axle'],
  );
  assert.deepEqual(
    extractPrescribedParts('Aftermarket latch assemblies are also available if out of recall coverage.'),
    ['aftermarket latch'],
  );
  const heater = extractPrescriptionComponents('Consider an engine block heater to reduce cold-start enrichment.');
  assert.deepEqual(heater.map((part) => part.component), ['engine block heater']);
  assert.equal(heater[0]?.diagnosisDependent, true);

  assert.deepEqual(extractPrescribedParts('Replace engine long block.'), ['engine long block']);
  assert.deepEqual(extractPrescribedParts('Replace broken exhaust manifold studs.'), ['exhaust manifold studs']);
  assert.deepEqual(extractPrescribedParts('Mechanics recommend replacing the wet belt preventively.'), ['wet belt']);
  assert.deepEqual(extractPrescribedParts('Always install the updated one-piece Motorcraft replacement plug.'), ['one-piece motorcraft plug']);
  assert.deepEqual(extractPrescribedParts('Ford sells a winter charge-port cover accessory.'), ['winter charge-port cover accessory']);
  assert.deepEqual(extractPrescribedParts('Replace Firestone ATX Wilderness AT tires immediately.'), ['firestone atx wilderness at tires']);
  assert.deepEqual(extractPrescribedParts('Installs a revised oil level dipstick.'), ['oil level dipstick']);

  const converter = extractPrescriptionComponents('In severe cases, torque converter replacement may be necessary.');
  assert.deepEqual(converter.map((part) => part.component), ['torque converter']);
  assert.equal(converter[0]?.diagnosisDependent, true);

  const axle = extractPrescriptionComponents('If the fluid does not resolve it, rear axle assembly replacement under warranty.');
  assert.deepEqual(axle.map((part) => part.component), ['rear axle']);
  assert.equal(axle[0]?.diagnosisDependent, true);

  assert.deepEqual(
    extractPrescribedParts('The accepted repair is a remanufactured head with updated valve seats.'),
    ['remanufactured head'],
  );
  assert.deepEqual(extractPrescribedParts('The price of water pump replacement is $900.'), []);
  assert.deepEqual(extractPrescribedParts('Pump replacement cost is $500.'), []);
  assert.deepEqual(extractPrescribedParts('Ford agreed to cover replacement under warranty.'), []);
  assert.deepEqual(extractPrescribedParts('Valve body replacement is needed in severe cases.'), ['valve body']);
  assert.deepEqual(extractPrescribedParts('Torque converter replacement may be required.'), ['torque converter']);
  assert.deepEqual(extractPrescribedParts('Reference the TSB for synchronizer ring replacement.'), ['synchronizer ring']);
  assert.deepEqual(extractPrescribedParts('VCT solenoid replacement may help.'), ['vct solenoid']);
  assert.deepEqual(
    extractPrescribedParts('Ford covers short block and head gasket replacement under warranty.'),
    ['short block', 'head gasket'],
  );
  assert.deepEqual(
    extractPrescribedParts('Repairs range from head gasket and cylinder head replacement to complete long-block replacement depending on severity.'),
    ['head gasket', 'cylinder head', 'long block'],
  );
  assert.deepEqual(
    extractPrescribedParts("Install a cam phaser lockout kit that replaces the moving vanes with solid blocks, fixing valve timing."),
    ['cam phaser lockout kit'],
  );
  assert.deepEqual(
    extractPrescribedParts('Cleaning intake-valve carbon can reduce consumption.'),
    [],
  );
});

test('captures Ford replacement-with, passive, failed-part, and repair-with branches', () => {
  assert.deepEqual(
    extractPrescribedParts('Free replacement with MIC 2.0 hardtop under warranty.'),
    ['mic 2.0 hardtop'],
  );
  assert.deepEqual(
    extractPrescribedParts('Complete soft top replacement under warranty for severe cases.'),
    ['soft top'],
  );
  assert.deepEqual(extractPrescribedParts('A failed PTU must be replaced.'), ['ptu']);
  assert.deepEqual(
    extractPrescribedParts('If the rack itself has failed, replacement is necessary.'),
    ['rack'],
  );
  assert.deepEqual(
    extractPrescribedParts('The APIM is replaced under the extended warranty.'),
    ['apim'],
  );
  assert.deepEqual(
    extractPrescribedParts('The shift motor is the most commonly replaced component.'),
    ['shift motor'],
  );
  assert.deepEqual(
    extractPrescribedParts('Repair the stripped port with a heli-coil-style thread insert designed for the job.'),
    ['heli-coil-style thread insert'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replacement with an AGM battery has resolved the issue for many owners.'),
    ['agm battery'],
  );
  assert.deepEqual(extractPrescribedParts('The damaged panel is replaced per the TSB.'), ['panel']);
  assert.deepEqual(extractPrescribedParts('Some owners have had entire axle assemblies replaced.'), ['axle']);
  assert.deepEqual(extractPrescribedParts('The APIM, which is replaced and reprogrammed at a dealer.'), ['apim']);
  assert.deepEqual(extractPrescribedParts('Persistently weak batteries are replaced under warranty.'), ['batteries']);
  assert.deepEqual(
    extractPrescribedParts('Perforated subframes must be replaced with a sound used or new cradle.'),
    ['subframes'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replacement cameras cost $100-300 for aftermarket or $200-400 for OEM.'),
    ['cameras'],
  );
  assert.deepEqual(
    extractPrescribedParts('Aftermarket remanufactured battery packs are cheaper than dealer replacement.'),
    ['aftermarket remanufactured battery packs'],
  );
  assert.deepEqual(
    extractPrescribedParts('Individual cell replacement at specialized hybrid shops is an option.'),
    ['individual cell'],
  );
  assert.deepEqual(
    extractPrescribedParts('Severe cases involve PCV/valve-guide or short-block work.'),
    ['pcv/valve guide', 'short block'],
  );
  assert.deepEqual(
    extractPrescribedParts('Advanced perforation usually requires frame section repair, shackle mount repair kits, or vehicle retirement.'),
    ['shackle mount repair kits'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the distributor assembly. Remanufactured units are available. Ensure the O-ring seal is replaced.'),
    ['distributor', 'o-ring seal'],
  );
  assert.deepEqual(
    extractPrescribedParts('First, identify which actuator has failed. RepairPal estimates professional replacement.'),
    ['actuator'],
  );
  assert.deepEqual(
    extractPrescribedParts('The steering column assembly with motor costs $400-$800 for the part.'),
    ['steering column'],
  );
  assert.deepEqual(
    extractPrescribedParts('Persistent freezing traces to a failing APIM, which is replaced and reprogrammed at a dealer.'),
    ['apim'],
  );
  assert.deepEqual(
    extractPrescribedParts('Many owners retrofit later software or a replacement APIM.'),
    ['apim'],
  );
  assert.deepEqual(
    extractPrescribedParts('Inspect hydraulic lines, cylinders, and the pump for leaks. Replace failed components.'),
    ['hydraulic lines', 'cylinders', 'pump'],
  );
  assert.deepEqual(
    extractPrescribedParts('Common repairs are the low/reverse sprag, reverse/forward clutch packs, and valve-body/EPC solenoid rebuild.'),
    ['low/reverse sprag', 'reverse/forward clutch packs', 'valve body/epc solenoid'],
  );
  assert.deepEqual(
    extractPrescribedParts('Surface rocker rust can be patched with reproduction repair panels.'),
    ['reproduction repair panels'],
  );
  assert.deepEqual(extractPrescribedParts('Maintain oil changes and consider an oil catch can.'), ['oil catch can']);
  assert.deepEqual(
    extractPrescribedParts('Refresh the cooling system proactively: thermostat, radiator cap, water pump, hoses, and radiator as needed.'),
    ['thermostat', 'radiator cap', 'water pump', 'hoses', 'radiator'],
  );
  assert.deepEqual(
    extractPrescribedParts('DIY fix involves applying clear RTV silicone along the seam.'),
    ['clear rtv silicone'],
  );
  assert.deepEqual(
    extractPrescribedParts('Confirmed head-gasket failure requires head removal, resurfacing check, and new gaskets.'),
    ['gaskets'],
  );
  assert.deepEqual(
    extractPrescribedParts('Seal all roof plug holes with Dicor lap sealant or Eternabond RV roof tape.'),
    ['dicor lap sealant', 'eternabond rv roof tape'],
  );
});

test('captures Ford proactive, conditional software, and plural failed-component branches', () => {
  assert.deepEqual(
    extractPrescribedParts('Have the oil pump belt and tensioner inspected. Replace the tensioner proactively at 60,000-80,000 miles.'),
    ['tensioner'],
  );
  assert.deepEqual(extractPrescribedParts('Replace the 12V battery proactively every 3-4 years.'), ['12v battery']);
  const tune = extractPrescriptionComponents('Aftermarket tune (SCT, Lund Racing) can address cold-start calibration but voids the warranty.');
  assert.deepEqual(tune.map((part) => part.component), ['aftermarket tune']);
  assert.equal(tune[0]?.diagnosisDependent, true);
  const hydraulic = extractPrescriptionComponents('Inspect hydraulic lines, cylinders, and the pump for leaks. Replace failed components.');
  assert.deepEqual(hydraulic.map((part) => part.component), ['hydraulic lines', 'cylinders', 'pump']);
  assert.ok(hydraulic.every((part) => part.diagnosisDependent && part.condition === 'confirmed component failure'));
  const cruise = extractPrescriptionComponents('Inspect the switch and connector. If the switch or connector shows heat damage, replace the affected components.');
  assert.deepEqual(cruise.map((part) => part.component), ['switch', 'connector']);
  assert.ok(cruise.every((part) => part.diagnosisDependent));
  const catchCan = extractPrescriptionComponents('Reduce future buildup by fitting an oil catch can, using low-NOACK oil, and keeping up with oil changes.');
  assert.deepEqual(catchCan.map((part) => part.component), ['oil catch can']);
  assert.equal(catchCan[0]?.condition, 'optional prevention branch');
});

test('keeps integrated assembly qualifiers out of the part list and prefers exact material dimensions', () => {
  assert.deepEqual(
    extractPrescribedParts('Use a genuine Honda/Acura replacement hose with updated crimp fittings.'),
    ['honda/acura hose'],
  );
  assert.deepEqual(
    extractPrescribedParts('Replace the high-pressure power steering hose assembly. Use a genuine Honda/Acura replacement hose with updated crimp fittings.'),
    ['high-pressure power steering hose'],
  );
  assert.deepEqual(
    extractPrescribedParts('Use the exact butyl tape (0.5mm) and EPT sealer (3.0mm) called out in the service manual, plus sealant #08712-0004. Most owners use a specialist for the install.'),
    ['exact butyl tape 0.5mm', 'ept sealer 3.0mm', 'sealant 08712-0004'],
  );
});
