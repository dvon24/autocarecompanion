const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

// Targeted DTC assignments for issues missed by batch 1
const specificDtc = {
  // Oil dilution / fuel in oil
  'honda-civic-oil-dilution-2016': ['P0171', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
  'honda-crv-oil-dilution-2017': ['P0171', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304'],

  // Spark plug issues
  'ford-f150-spark-plug-blowout': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'],

  // Radiator / cooling
  'dodge-challenger-radiator-failure': ['P0217', 'P0128'],
  'toyota-4runner-ac-compressor-2010': [],
  'honda-crv-ac-compressor-seal-2017': [],
  'honda-crv-ac-compressor-clutch-2007': [],
  'gmc-sierra-ac-compressor-failure': [],

  // Fuel system
  'toyota-rav4-fuel-tank-refueling-2019': ['P0440', 'P0441', 'P0455', 'P0456'],
  'toyota-rav4-fuel-tank-2019': ['P0440', 'P0441', 'P0455', 'P0456'],
  'kia-k5-fuel-tank-expansion': [],
  'audi-a3-tdi-injector-2010': ['P0201', 'P0202', 'P0203', 'P0204', 'P2146', 'P2149'],

  // Transfer case
  'gmc-sierra-transfer-case-neutral-shift': ['P1875', 'P0218'],

  // Engine specific
  'ford-bronco-27-ecoboost-valve-failure': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
  'ford-bronco-23-ecoboost-oil-galley-plug': ['P0520', 'P0521'],
  'kia-optima-theta-ii-engine-failure': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0520', 'P0521'],
  'bmw-m3-s65-throttle-actuator-failure': ['P1014', 'P1016', 'P1024', 'P1026'],
  'subaru-wrx-rev-hang-2015': [],
  'nissan-370z-oil-gallery-gasket-2009': [],
  'ford-f150-oil-pan-leak-2015': [],

  // Oil filter housing leaks (various makes)
  'bmw-n55-oil-filter-housing-2012': [],
  'jeep-cherokee-kl-oil-filter-housing-2014': [],
  'chrysler-300-oil-filter-housing-2011': [],
  'mini-clubman-oil-filter-housing-2016': [],
  'volkswagen-rabbit-oil-leak-valve-cover-2006': [],

  // Charge pipe / boost / wastegate
  'bmw-n55-charge-pipe-2012': ['P0299', 'P0234'],
  'bmw-n55-boost-solenoid-2012': ['P0234', 'P0299', 'P2263'],
  'bmw-n55-injector-2012': ['P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206', 'P030C', 'P030D'],

  // Rocker arm / valve train
  'dodge-journey-rocker-arm-2011': ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],

  // Clutch
  'subaru-wrx-clutch-judder-2015': [],

  // Rollaway / shifter
  'jeep-cherokee-kl-shifter-rollaway-2014': [],
  'chrysler-300-shifter-rollaway': [],

  // Turbo lag / hesitation (engine response issues)
  'volkswagen-atlas-cross-sport-turbo-lag-hesitation-2020': ['P0299'],
};

// Also catch common patterns missed
const patternDtc = {
  'oil-filter-housing': [],  // mechanical leak, no DTC
  'valve-cover': [],  // mechanical leak, no DTC
  'oil-pan-leak': [], // mechanical leak, no DTC
  'oil-gallery': [],  // mechanical leak, usually no DTC
  'ac-compressor': [], // A/C system, no engine DTC
  'clutch': [],  // mechanical, no OBD DTC
  'shifter': [], // mechanical/electronic, vehicle-specific
  'rollaway': [], // vehicle-specific
  'oil-leak': [], // mechanical, no DTC
  'gasket-leak': [], // mechanical, no DTC
  'seal-leak': [], // mechanical, no DTC
  'rev-hang': [], // calibration issue, no DTC
};

let updated = 0;

data.issues.forEach(function(issue) {
  if (issue.dtcCodes && issue.dtcCodes.length > 0) return; // already has codes
  if (issue.dtcCodes !== undefined) return; // already processed (empty array)

  const id = issue.id || '';

  // Check specific mappings first
  if (specificDtc[id] !== undefined) {
    issue.dtcCodes = specificDtc[id];
    if (specificDtc[id].length > 0) updated++;
    return;
  }

  // Check pattern-based for remaining engine/trans/fuel/cooling without codes
  const cat = (issue.category || '').toLowerCase();
  const combined = (id + ' ' + (issue.title || '') + ' ' + (issue.description || '')).toLowerCase();

  if (cat === 'engine' || cat === 'transmission' || cat === 'fuel' || cat === 'cooling') {
    // Engine issues with specific patterns
    if (combined.includes('oil filter housing') || combined.includes('valve cover') || combined.includes('oil pan leak') || combined.includes('oil gallery') || combined.includes('gasket leak') || combined.includes('seal leak') || combined.includes('oil leak')) {
      issue.dtcCodes = []; // mechanical leak, no DTC
      return;
    }
    if (combined.includes('ac compressor') || combined.includes('a/c compressor') || combined.includes('air conditioning')) {
      issue.dtcCodes = []; // A/C system
      return;
    }
    if (combined.includes('clutch') && !combined.includes('torque converter')) {
      issue.dtcCodes = []; // manual clutch
      return;
    }
    if (combined.includes('shifter') || combined.includes('rollaway')) {
      issue.dtcCodes = []; // shifter mechanism
      return;
    }
    if (combined.includes('rev hang') || combined.includes('throttle response') || combined.includes('hesitation') || combined.includes('turbo lag')) {
      issue.dtcCodes = combined.includes('boost') || combined.includes('turbo') ? ['P0299'] : [];
      if (issue.dtcCodes.length > 0) updated++;
      return;
    }
    if (combined.includes('engine seizure') || combined.includes('engine failure') || combined.includes('engine knock')) {
      issue.dtcCodes = ['P0300', 'P0520', 'P0521'];
      updated++;
      return;
    }
    if (combined.includes('injector')) {
      issue.dtcCodes = ['P0201', 'P0202', 'P0203', 'P0204'];
      updated++;
      return;
    }
    if (combined.includes('throttle') && combined.includes('failure')) {
      issue.dtcCodes = ['P0120', 'P0121', 'P0122', 'P0123', 'P2101', 'P2135'];
      updated++;
      return;
    }

    // Catch-all for remaining engine/trans/fuel/cooling
    issue.dtcCodes = [];
  }
});

// Ensure ALL issues have dtcCodes field (even if empty array)
data.issues.forEach(function(issue) {
  if (issue.dtcCodes === undefined) {
    issue.dtcCodes = [];
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));

// Count final stats
let withDtc = 0;
data.issues.forEach(function(issue) {
  if (issue.dtcCodes && issue.dtcCodes.length > 0) withDtc++;
});

console.log('Batch 2 Results:');
console.log('  Newly assigned codes: ' + updated);
console.log('  Total with DTC codes: ' + withDtc + '/' + data.issues.length);
console.log('  Coverage: ' + Math.round(withDtc / data.issues.length * 100) + '%');
