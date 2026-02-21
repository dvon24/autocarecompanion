// Script to add Mazda CX-5 to ymmt.json
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Mazda CX-5 trims by generation
const cx5Trims = {
  '2013-2016': ['Sport', 'Touring', 'Grand Touring'],
  '2017-2023': ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
};

// Add Mazda CX-5 for 2013-2023
for (let year = 2013; year <= 2023; year++) {
  if (!data[year]) data[year] = {};
  if (!data[year]['Mazda']) data[year]['Mazda'] = {};

  const trims = year <= 2016 ? cx5Trims['2013-2016'] : cx5Trims['2017-2023'];
  data[year]['Mazda']['CX-5'] = trims;
}

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('✓ Successfully added Mazda CX-5 (2013-2023)');
