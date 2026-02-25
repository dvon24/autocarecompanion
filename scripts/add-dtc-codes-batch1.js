const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

// DTC code mapping by issue category and common problem types
// These are well-known OBD-II codes associated with specific failure modes
const dtcMap = {
  // Engine issues
  'timing-chain': ['P0011', 'P0012', 'P0014', 'P0016', 'P0017'],
  'timing-chain-misfire': ['P0011', 'P0012', 'P0016', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
  'oil-consumption': ['P0420', 'P0171', 'P0174'],
  'misfire': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
  'misfire-v8': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'],
  'vanos': ['P0011', 'P0012', 'P0014', 'P0015', 'P0021', 'P0022'],
  'vvt': ['P0011', 'P0012', 'P0014', 'P0021', 'P0022'],
  'turbo': ['P0234', 'P0299'],
  'turbo-wastegate': ['P0234', 'P0299', 'P2263'],
  'carbon-buildup': ['P0171', 'P0174', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
  'head-gasket': ['P0171', 'P0174', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0128'],
  'catalytic': ['P0420', 'P0430'],
  'egr': ['P0401', 'P0402', 'P0403', 'P0404'],
  'pcv': ['P0171', 'P0174', 'P052E'],
  'knock': ['P0325', 'P0327', 'P0328', 'P0332'],
  'rod-bearing': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
  'lifter': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'],
  'afm-dfm': ['P0300', 'P06DD', 'P0521'],
  'hpfp': ['P0087', 'P0088', 'P0190', 'P0191', 'P2293'],
  'fuel-pump': ['P0087', 'P0230', 'P0231', 'P0232'],
  'fuel-injector': ['P0201', 'P0202', 'P0203', 'P0204', 'P0261', 'P0262'],
  'ignition-coil': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0351', 'P0352', 'P0353', 'P0354'],
  'spark-plug': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
  'air-injection': ['P0410', 'P0411', 'P0412', 'P0418'],
  'exhaust-manifold': ['P0420', 'P0430'],
  'engine-stall': ['P0335', 'P0340', 'P0345'],
  'piston-ring': ['P0171', 'P0174', 'P0420'],

  // Transmission
  'cvt': ['P0700', 'P0730', 'P0740', 'P0868', 'P17F0', 'P17F1'],
  'dsg': ['P0700', 'P0730', 'P0741', 'P189C'],
  'auto-trans': ['P0700', 'P0730', 'P0741', 'P0751'],
  'auto-trans-shudder': ['P0700', 'P0741', 'P0742'],
  'torque-converter': ['P0740', 'P0741', 'P0742'],
  'dct': ['P0700', 'P0730', 'P0741', 'P0920'],

  // Cooling
  'thermostat': ['P0128', 'P0597', 'P0598', 'P0599'],
  'water-pump': ['P0128', 'P2181'],
  'coolant-leak': ['P0128', 'P2181'],
  'overheating': ['P0217', 'P0128'],
  'radiator': ['P0128'],

  // Electrical
  'battery-drain': [],
  'infotainment': [],
  'alternator': ['P0562', 'P0622'],

  // Fuel system
  'fuel-system': ['P0171', 'P0174'],
  'evap': ['P0440', 'P0441', 'P0442', 'P0446', 'P0455', 'P0456'],
  'o2-sensor': ['P0130', 'P0131', 'P0132', 'P0133', 'P0134', 'P0135', 'P0136', 'P0137'],

  // Emissions / DEF
  'def': ['P20EE', 'P2463', 'P249F', 'P207F'],
  'dpf': ['P2002', 'P2003', 'P244A', 'P246C'],
  'scr': ['P20EE', 'P2201', 'P249F'],

  // Drivetrain
  'awd': [],
  'differential': [],
  'axle': [],
  'transfer-case': [],

  // Suspension/Steering
  'air-suspension': [],
  'steering': [],
  'eps': [],

  // Body/Interior
  'body': [],
  'interior': [],
  'sunroof': [],
  'door': [],
  'window': [],

  // Brakes
  'brakes': [],
  'abs': ['C0035', 'C0040', 'C0045', 'C0050'],

  // Safety
  'airbag': ['B0100', 'B0101', 'B0102'],
  'takata': ['B0100'],
};

// Function to determine DTC codes based on issue content
function getDtcCodes(issue) {
  if (issue.dtcCodes && issue.dtcCodes.length > 0) return issue.dtcCodes; // already has codes

  const id = (issue.id || '').toLowerCase();
  const title = (issue.title || '').toLowerCase();
  const desc = (issue.description || '').toLowerCase();
  const cat = (issue.category || '').toLowerCase();
  const combined = id + ' ' + title + ' ' + desc;

  // Engine-specific matches
  if (combined.includes('timing chain') || combined.includes('timing-chain')) {
    if (combined.includes('misfire')) return dtcMap['timing-chain-misfire'];
    return dtcMap['timing-chain'];
  }
  if (combined.includes('vanos')) return dtcMap['vanos'];
  if (combined.includes('variable valve timing') || combined.includes('vvt') || combined.includes('cam phaser')) return dtcMap['vvt'];
  if (combined.includes('afm') || combined.includes('dfm') || combined.includes('active fuel management') || combined.includes('displacement on demand') || combined.includes('dynamic fuel management')) return dtcMap['afm-dfm'];
  if (combined.includes('lifter') && cat === 'engine') return dtcMap['lifter'];
  if (combined.includes('rod bearing')) return dtcMap['rod-bearing'];
  if (combined.includes('carbon buildup') || combined.includes('carbon deposit')) return dtcMap['carbon-buildup'];
  if (combined.includes('head gasket')) return dtcMap['head-gasket'];
  if (combined.includes('high-pressure fuel pump') || combined.includes('hpfp') || combined.includes('high pressure fuel pump') || combined.includes('cp4')) return dtcMap['hpfp'];
  if (combined.includes('fuel pump') && !combined.includes('high-pressure') && !combined.includes('hpfp')) return dtcMap['fuel-pump'];
  if (combined.includes('turbo') && combined.includes('wastegate')) return dtcMap['turbo-wastegate'];
  if ((combined.includes('turbo') && (combined.includes('failure') || combined.includes('leak') || combined.includes('boost'))) && cat === 'engine') return dtcMap['turbo'];
  if (combined.includes('pcv') || combined.includes('crankcase ventilation') || combined.includes('oil trap')) return dtcMap['pcv'];
  if (combined.includes('oil consumption') || combined.includes('oil burn') || combined.includes('excessive oil')) return dtcMap['oil-consumption'];
  if (combined.includes('egr')) return dtcMap['egr'];
  if (combined.includes('catalytic converter')) return dtcMap['catalytic'];
  if (combined.includes('air injection') && combined.includes('pump')) return dtcMap['air-injection'];
  if (combined.includes('exhaust manifold') && combined.includes('bolt')) return dtcMap['exhaust-manifold'];
  if (combined.includes('ignition coil')) return dtcMap['ignition-coil'];
  if (combined.includes('misfire') && cat === 'engine') return dtcMap['misfire'];
  if (combined.includes('piston ring') || combined.includes('ringland')) return dtcMap['piston-ring'];
  if (combined.includes('knock sensor')) return dtcMap['knock'];
  if (combined.includes('stall') && cat === 'engine') return dtcMap['engine-stall'];

  // Transmission
  if (combined.includes('cvt')) return dtcMap['cvt'];
  if (combined.includes('dsg') || combined.includes('mechatronic')) return dtcMap['dsg'];
  if (combined.includes('dct') || combined.includes('dual clutch') || combined.includes('dual-clutch') || combined.includes('powershift')) return dtcMap['dct'];
  if (combined.includes('torque converter')) return dtcMap['torque-converter'];
  if (cat === 'transmission' && (combined.includes('shudder') || combined.includes('harsh shift') || combined.includes('slipping'))) return dtcMap['auto-trans-shudder'];
  if (cat === 'transmission' && (combined.includes('failure') || combined.includes('transmission'))) return dtcMap['auto-trans'];

  // Cooling
  if (combined.includes('thermostat')) return dtcMap['thermostat'];
  if (combined.includes('water pump')) return dtcMap['water-pump'];
  if (combined.includes('coolant') && combined.includes('leak')) return dtcMap['coolant-leak'];
  if (combined.includes('overheat')) return dtcMap['overheating'];

  // Fuel
  if (combined.includes('def ') || combined.includes('diesel exhaust fluid') || combined.includes('urea')) return dtcMap['def'];
  if (combined.includes('dpf') || combined.includes('particulate filter')) return dtcMap['dpf'];
  if (combined.includes('evap') || combined.includes('fuel tank') && combined.includes('vapor')) return dtcMap['evap'];

  // Default: empty array for categories that typically don't have DTC codes
  if (cat === 'body' || cat === 'interior' || cat === 'exterior') return [];
  if (cat === 'brakes' && combined.includes('abs')) return dtcMap['abs'];
  if (cat === 'safety' && combined.includes('airbag')) return dtcMap['airbag'];

  return [];
}

let updated = 0;
let alreadyHad = 0;

data.issues.forEach(function(issue) {
  if (issue.dtcCodes && issue.dtcCodes.length > 0) {
    alreadyHad++;
    return;
  }
  const codes = getDtcCodes(issue);
  issue.dtcCodes = codes;
  if (codes.length > 0) updated++;
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));

console.log('DTC Code Assignment Results:');
console.log('  Already had codes: ' + alreadyHad);
console.log('  Assigned codes: ' + updated);
console.log('  No codes applicable: ' + (data.issues.length - alreadyHad - updated));
console.log('  Total issues: ' + data.issues.length);

// Summary by make
const makeStats = {};
data.issues.forEach(function(issue) {
  const make = (issue.vehicleMatch && issue.vehicleMatch.make) || issue.make || 'unknown';
  if (makeStats[make] === undefined) makeStats[make] = { total: 0, withDtc: 0 };
  makeStats[make].total++;
  if (issue.dtcCodes && issue.dtcCodes.length > 0) makeStats[make].withDtc++;
});
console.log('\n=== DTC Coverage by Make ===');
Object.entries(makeStats).sort((a,b) => a[0].localeCompare(b[0])).forEach(function([make, stats]) {
  const pct = Math.round(stats.withDtc / stats.total * 100);
  console.log('  ' + make + ': ' + stats.withDtc + '/' + stats.total + ' (' + pct + '%)');
});
