const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const validCategories = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','other'];

// Map invalid categories to valid ones
const categoryMap = {
  'steering': 'suspension',
  'Steering': 'suspension',
  'hvac': 'cooling',
  'Climate Control': 'cooling',
  'fuel_system': 'fuel',
  'Fuel System': 'fuel',
  'exhaust': 'engine',
  'emissions': 'engine',
  'Engine': 'engine',
  'Drivetrain': 'drivetrain',
  'Transmission': 'transmission',
  'Body': 'body',
  'Brakes': 'brakes',
  'Electrical': 'electrical',
  'Interior': 'interior',
  'Exterior': 'exterior',
  'Suspension': 'suspension',
  'Safety Systems': 'safety',
  'Safety': 'safety',
  'Cooling': 'cooling',
  'Fuel': 'fuel',
  'Other': 'other',
};

let catFixed = 0;
let catMissing = 0;
let costFixed = 0;

data.issues.forEach(function(issue) {
  // Fix categories
  if (!issue.category) {
    // Try to infer from id
    const id = issue.id || '';
    if (id.includes('timing-chain') || id.includes('oil-consumption') || id.includes('turbo') || id.includes('engine') || id.includes('vanos') || id.includes('hpfp') || id.includes('valve') || id.includes('rod-bearing') || id.includes('crank') || id.includes('ignition') || id.includes('idle') || id.includes('spark') || id.includes('oil-leak') || id.includes('carbon-buildup') || id.includes('water-pump') || id.includes('wastegate') || id.includes('pcv') || id.includes('injector') || id.includes('charge-pipe') || id.includes('ofhg') || id.includes('coolant')) {
      issue.category = 'engine';
    } else if (id.includes('transmission') || id.includes('dsg') || id.includes('cvt') || id.includes('dct') || id.includes('smg') || id.includes('mechatronic') || id.includes('clutch') || id.includes('gear') || id.includes('synchro')) {
      issue.category = 'transmission';
    } else if (id.includes('transfer-case') || id.includes('differential') || id.includes('driveshaft') || id.includes('cv-joint') || id.includes('drivetrain')) {
      issue.category = 'drivetrain';
    } else if (id.includes('electrical') || id.includes('battery') || id.includes('infotainment') || id.includes('idrive') || id.includes('alternator') || id.includes('window-regulator') || id.includes('connectivity') || id.includes('ibs') || id.includes('bcm') || id.includes('sensor') || id.includes('mmi') || id.includes('cue') || id.includes('electronics')) {
      issue.category = 'electrical';
    } else if (id.includes('brake') || id.includes('braking')) {
      issue.category = 'brakes';
    } else if (id.includes('suspension') || id.includes('bushing') || id.includes('strut') || id.includes('air-suspension') || id.includes('subframe') || id.includes('tie-rod') || id.includes('adaptive-suspension')) {
      issue.category = 'suspension';
    } else if (id.includes('cooling') || id.includes('ac-compressor') || id.includes('heater') || id.includes('hvac') || id.includes('heat-pump') || id.includes('ac-') || id.includes('coolant-expansion')) {
      issue.category = 'cooling';
    } else if (id.includes('fuel-pump') || id.includes('fuel-tank') || id.includes('fuel') || id.includes('egr') || id.includes('catalytic') || id.includes('exhaust') || id.includes('secondary-air')) {
      issue.category = 'fuel';
    } else if (id.includes('dashboard') || id.includes('interior') || id.includes('door-latch') || id.includes('door-lock') || id.includes('sunroof') || id.includes('camera')) {
      issue.category = 'interior';
    } else if (id.includes('paint') || id.includes('clearcoat') || id.includes('convertible-top') || id.includes('soft-top') || id.includes('rear-window') || id.includes('window-shattering') || id.includes('window-gasket') || id.includes('tailgate') || id.includes('trunk') || id.includes('liftgate') || id.includes('roof-drain') || id.includes('frunk')) {
      issue.category = 'body';
    } else if (id.includes('recall') || id.includes('phantom-braking') || id.includes('sensing') || id.includes('pedestrian') || id.includes('airbag')) {
      issue.category = 'safety';
    } else if (id.includes('tire') || id.includes('wheel-bearing') || id.includes('vibration') || id.includes('steering')) {
      issue.category = 'suspension';
    } else if (id.includes('charging') || id.includes('charge-port') || id.includes('12v') || id.includes('48v') || id.includes('dcdc') || id.includes('hv-battery')) {
      issue.category = 'electrical';
    } else if (id.includes('build-quality')) {
      issue.category = 'body';
    } else {
      issue.category = 'other';
    }
    catMissing++;
    console.log('Inferred category for ' + issue.id + ': ' + issue.category);
  } else if (!validCategories.includes(issue.category)) {
    const mapped = categoryMap[issue.category];
    if (mapped) {
      console.log('Fixed category ' + issue.id + ': "' + issue.category + '" -> "' + mapped + '"');
      issue.category = mapped;
      catFixed++;
    } else {
      console.log('UNMAPPED category ' + issue.id + ': "' + issue.category + '" -> "other"');
      issue.category = 'other';
      catFixed++;
    }
  }

  // Fix estimatedCost format: min/max -> low/high
  if (issue.estimatedCost) {
    if (issue.estimatedCost.min !== undefined && issue.estimatedCost.low === undefined) {
      issue.estimatedCost = {
        low: issue.estimatedCost.min,
        high: issue.estimatedCost.max
      };
      costFixed++;
    }
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nFixed ' + catFixed + ' invalid categories');
console.log('Inferred ' + catMissing + ' missing categories');
console.log('Fixed ' + costFixed + ' estimatedCost min/max -> low/high');
console.log('Total issues: ' + data.issues.length);
