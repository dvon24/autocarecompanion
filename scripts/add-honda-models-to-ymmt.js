const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Honda S2000 (2000-2009)
const s2000Trims = {
  '2000-2003': ['Base'], // AP1
  '2004-2007': ['Base'], // AP2
  '2008-2009': ['Base', 'CR'] // AP2 with CR edition
};

// Honda Element (2003-2011)
const elementTrims = {
  '2003-2006': ['DX', 'EX', 'LX'], // First gen
  '2007-2011': ['LX', 'EX', 'SC'] // Second gen (added SC model)
};

// Honda Fit (2007-2020, skipped 2014 - no US model year)
const fitTrims = {
  '2007-2008': ['Base', 'Sport'], // First gen
  '2009-2013': ['Base', 'Sport'], // Second gen
  '2015-2020': ['LX', 'EX', 'EX-L'] // Third gen
};

// Honda Ridgeline (2006-2014, 2017-2023, skipped 2015-2016)
const ridgelineTrims = {
  '2006-2014': ['RT', 'RTS', 'RTL', 'RTX'], // First gen
  '2017-2023': ['RT', 'Sport', 'RTL', 'RTL-E', 'Black Edition'] // Second gen
};

function addModelToYear(year, model, trims) {
  // Ensure year exists
  if (!ymmt[year]) {
    ymmt[year] = {};
  }

  // Ensure Honda exists for this year
  if (!ymmt[year].Honda) {
    ymmt[year].Honda = {};
  }

  // Add model if it doesn't exist
  if (!ymmt[year].Honda[model]) {
    ymmt[year].Honda[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

// Add S2000 (2000-2009)
console.log('\nAdding Honda S2000...');
for (let year = 2000; year <= 2009; year++) {
  let trims = s2000Trims['2000-2003'];
  if (year >= 2004 && year <= 2007) trims = s2000Trims['2004-2007'];
  if (year >= 2008) trims = s2000Trims['2008-2009'];

  if (addModelToYear(year.toString(), 'S2000', trims)) {
    console.log(`  Added ${year} S2000`);
    addedCount++;
  }
}

// Add Element (2003-2011)
console.log('\nAdding Honda Element...');
for (let year = 2003; year <= 2011; year++) {
  let trims = year <= 2006 ? elementTrims['2003-2006'] : elementTrims['2007-2011'];

  if (addModelToYear(year.toString(), 'Element', trims)) {
    console.log(`  Added ${year} Element`);
    addedCount++;
  }
}

// Add Fit (2007-2013, 2015-2020)
console.log('\nAdding Honda Fit...');
for (let year = 2007; year <= 2020; year++) {
  if (year === 2014) continue; // No 2014 Fit in US

  let trims = fitTrims['2007-2008'];
  if (year >= 2009 && year <= 2013) trims = fitTrims['2009-2013'];
  if (year >= 2015) trims = fitTrims['2015-2020'];

  if (addModelToYear(year.toString(), 'Fit', trims)) {
    console.log(`  Added ${year} Fit`);
    addedCount++;
  }
}

// Add Ridgeline (2006-2014, 2017-2023)
console.log('\nAdding Honda Ridgeline...');
for (let year = 2006; year <= 2023; year++) {
  if (year === 2015 || year === 2016) continue; // No 2015-2016 Ridgeline

  let trims = year <= 2014 ? ridgelineTrims['2006-2014'] : ridgelineTrims['2017-2023'];

  if (addModelToYear(year.toString(), 'Ridgeline', trims)) {
    console.log(`  Added ${year} Ridgeline`);
    addedCount++;
  }
}

// Sort Honda models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Honda) {
    const sortedHonda = {};
    Object.keys(ymmt[year].Honda).sort().forEach(model => {
      sortedHonda[model] = ymmt[year].Honda[model];
    });
    ymmt[year].Honda = sortedHonda;
  }
});

// Write back to file
fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} year/model combinations to YMMT data`);
console.log('\nHonda models now available in selector:');
console.log('  - Accord');
console.log('  - Civic');
console.log('  - CR-V');
console.log('  - Element (2003-2011)');
console.log('  - Fit (2007-2020, excl 2014)');
console.log('  - HR-V');
console.log('  - Odyssey');
console.log('  - Pilot');
console.log('  - Ridgeline (2006-2014, 2017-2023)');
console.log('  - S2000 (2000-2009)');
