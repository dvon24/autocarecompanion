// Script to add Chrysler 300 and Dodge Journey to ymmt.json
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Chrysler 300 trims by generation
const chrysler300Trims = {
  '2011-2014': ['Touring', 'Limited', 'S', 'C', 'SRT8'],
  '2015-2023': ['Touring', 'Touring L', 'Limited', 'S', '300C', 'SRT8'],
};

// Dodge Journey trims
const journeyTrims = {
  '2009-2010': ['SE', 'SXT', 'R/T'],
  '2011-2020': ['SE', 'SXT', 'Crossroad', 'R/T', 'GT'],
};

// Add Chrysler 300 for 2011-2023
for (let year = 2011; year <= 2023; year++) {
  if (!data[year]) data[year] = {};
  if (!data[year]['Chrysler']) data[year]['Chrysler'] = {};

  const trims = year <= 2014 ? chrysler300Trims['2011-2014'] : chrysler300Trims['2015-2023'];
  data[year]['Chrysler']['300'] = trims;
}

// Add Dodge Journey for 2009-2020
for (let year = 2009; year <= 2020; year++) {
  if (!data[year]) data[year] = {};
  if (!data[year]['Dodge']) data[year]['Dodge'] = {};

  const trims = year <= 2010 ? journeyTrims['2009-2010'] : journeyTrims['2011-2020'];
  data[year]['Dodge']['Journey'] = trims;
}

// Ensure Jeep Cherokee exists for 2014-2023 (it should already be there, but verify)
const cherokeeTrims = ['Sport', 'Latitude', 'Latitude Plus', 'Altitude', 'Limited', 'Trailhawk', 'Overland'];
for (let year = 2014; year <= 2023; year++) {
  if (!data[year]) data[year] = {};
  if (!data[year]['Jeep']) data[year]['Jeep'] = {};
  if (!data[year]['Jeep']['Cherokee']) {
    data[year]['Jeep']['Cherokee'] = cherokeeTrims;
  }
}

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('✓ Successfully added:');
console.log('  - Chrysler 300 (2011-2023)');
console.log('  - Dodge Journey (2009-2020)');
console.log('  - Verified Jeep Cherokee (2014-2023)');
