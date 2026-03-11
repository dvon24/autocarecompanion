#!/usr/bin/env node
/**
 * Add bulb specifications to vehicle-specs.json for all existing entries.
 * Uses common bulb fitment data based on make/model/generation.
 */

const fs = require('fs');
const path = require('path');

const SPECS_FILE = path.join(__dirname, '..', 'src', 'data', 'vehicle-specs.json');
const data = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf-8'));

// Common bulb fitments by make/model. These are the most common sizes.
// Format: { headlightLow, headlightHigh, fogLight, frontTurnSignal, rearTurnSignal, taillight, brakeLight, reverseLight, licensePlate }

const BULB_DATABASE = {
  // DODGE
  'Dodge Challenger 2015+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Dodge Challenger 2008-2014': { headlightLow: 'H13', headlightHigh: 'H13', fogLight: 'H10', frontTurnSignal: '3457', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Dodge Charger 2015+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Dodge Charger 2011-2014': { headlightLow: 'D3S HID', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Dodge Durango 2014+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },

  // CHEVROLET
  'Chevrolet Camaro 2016+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '7443', rearTurnSignal: '7443', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Camaro 2010-2015': { headlightLow: 'H13', headlightHigh: 'H13', fogLight: '5202', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Silverado 1500 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '7443', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Silverado 1500 2014-2018': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Equinox 2018+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7444', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Traverse 2018+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7444', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Chevrolet Colorado 2015+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '7443', rearTurnSignal: '7443', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },

  // FORD
  'Ford F-150 2021+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford F-150 2015-2020': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford Mustang 2015+ 5.0L V8': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford Mustang 2015+ EcoBoost': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford Explorer 2020+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford Escape 2020+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },
  'Ford Bronco 2021+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Ford Ranger 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },

  // HONDA
  'Honda Civic 2016+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },
  'Honda Civic 2006-2015': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '168' },
  'Honda Accord 2018+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },
  'Honda Accord 2013-2017': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '168' },
  'Honda CR-V 2017+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },
  'Honda Pilot 2016+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },
  'Honda Odyssey 2018+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7444', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '168' },

  // TOYOTA
  'Toyota Camry 2018+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Toyota RAV4 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Toyota Corolla 2020+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Toyota Tacoma 2016+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7443', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },
  'Toyota Tundra 2022+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Toyota 4Runner 2014+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },

  // BMW
  'BMW 3 Series 2019+ G20': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W', notes: 'Most G20 come with full LED. Halogen option uses H7.' },
  'BMW 3 Series 2012-2018 F30': { headlightLow: 'H7', headlightHigh: 'H7', fogLight: 'H8', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },
  'BMW X5 2019+ G05': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W', notes: 'All G05 X5 use LED headlights. Laser light option available.' },
  'BMW X3 2018+ G01': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },

  // HYUNDAI
  'Hyundai Tucson 2022+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'LED Module', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Hyundai Elantra 2021+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Hyundai Santa Fe 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Hyundai Sonata 2020+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'LED Module', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // KIA
  'Kia Telluride 2020+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'LED Module', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Kia Sorento 2021+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // JEEP
  'Jeep Wrangler 2018+ JL': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'PSX24W', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194', notes: 'Many owners upgrade to LED headlights. JL uses projector housing.' },
  'Jeep Grand Cherokee 2022+ WL': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'LED Module', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Jeep Grand Cherokee 2011-2021 WK2': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },

  // NISSAN
  'Nissan Altima 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Nissan Rogue 2021+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'H8', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // SUBARU
  'Subaru Outback 2020+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Subaru WRX 2015+ VA/VB': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H16', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },

  // RAM
  'RAM 1500 2019+ DT': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // VOLKSWAGEN
  'Volkswagen Jetta 2019+': { headlightLow: 'H7', headlightHigh: 'H7', fogLight: 'H11', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },
  'Volkswagen Golf/GTI 2015+': { headlightLow: 'H7', headlightHigh: 'H7', fogLight: 'H11', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },
  'Volkswagen Tiguan 2018+': { headlightLow: 'H7', headlightHigh: 'H7', fogLight: 'H11', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },

  // VOLVO
  'Volvo XC90 2016+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W', notes: 'All SPA platform Volvos use Thor Hammer LED headlights.' },
  'Volvo XC60 2018+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },

  // MAZDA
  'Mazda CX-5 2017+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },
  'Mazda Mazda3 2019+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // GMC
  'GMC Sierra 1500 2019+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: '5202', frontTurnSignal: '7443', rearTurnSignal: '7440', taillight: '7443', brakeLight: '7443', reverseLight: '921', licensePlate: '194' },
  'GMC Yukon 2021+': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // CHRYSLER
  'Chrysler 300 2015+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '3157', rearTurnSignal: '3157', taillight: '3157', brakeLight: '3157', reverseLight: '921', licensePlate: '194' },
  'Chrysler Pacifica 2017+': { headlightLow: 'H11', headlightHigh: '9005', fogLight: 'H11', frontTurnSignal: '7440', rearTurnSignal: '7440', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: '921', licensePlate: '194' },

  // AUDI
  'Audi A4/S4 2017+ B9': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W', notes: 'All B9 A4/S4 use LED headlights standard. Matrix LED option.' },
  'Audi Q5 2018+ FY': { headlightLow: 'LED Module', headlightHigh: 'LED Module', fogLight: 'LED Module', frontTurnSignal: 'PY21W', rearTurnSignal: 'LED Module', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W' },

  // MINI
  'MINI Cooper 2014+ F56': { headlightLow: 'H11', headlightHigh: 'H7', fogLight: 'H8', frontTurnSignal: 'PY21W', rearTurnSignal: 'PY21W', taillight: 'LED Module', brakeLight: 'LED Module', reverseLight: 'W16W', licensePlate: 'W5W', notes: 'LED headlight option does not use replaceable bulbs.' },
};

// Match vehicle specs entries to bulb data
function findBulbMatch(entry) {
  const key = `${entry.make} ${entry.model} ${entry.generation}`;

  // Try exact match first
  for (const [pattern, bulbs] of Object.entries(BULB_DATABASE)) {
    if (key.includes(pattern.replace(/\s+/g, ' '))) return bulbs;
  }

  // Try make + model match
  const makeModel = `${entry.make} ${entry.model}`;
  for (const [pattern, bulbs] of Object.entries(BULB_DATABASE)) {
    const patternMakeModel = pattern.split(/\d/)[0].trim();
    if (makeModel === patternMakeModel) return bulbs;
  }

  return null;
}

let updated = 0;
let skipped = 0;

// Data is { make: { model: { generation: specs } } }
for (const [make, models] of Object.entries(data)) {
  if (make === '_note') continue;
  for (const [model, generations] of Object.entries(models)) {
    for (const [genKey, specs] of Object.entries(generations)) {
      if (specs.bulbs) {
        skipped++;
        continue;
      }

      const entry = { make, model, generation: genKey };
      const bulbs = findBulbMatch(entry);
      if (bulbs) {
        specs.bulbs = bulbs;
        updated++;
      } else {
        skipped++;
      }
    }
  }
}

fs.writeFileSync(SPECS_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Done! Updated: ${updated}, Skipped: ${skipped} (no match or already has bulbs)`);
