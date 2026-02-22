const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Honda) ymmt[yearStr].Honda = {};
  if (!ymmt[yearStr].Honda[model]) {
    ymmt[yearStr].Honda[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Civic (1996-2025, currently 2008-2025) ===
console.log('=== CIVIC ===');
// 6th gen (1996-2000)
for (let year = 1996; year <= 2000; year++) {
  if (addEntry(year, 'Civic', ['CX', 'DX', 'EX', 'HX', 'LX', 'Si'])) {
    console.log('  Added ' + year);
  }
}
// 7th gen (2001-2005)
for (let year = 2001; year <= 2005; year++) {
  if (addEntry(year, 'Civic', ['DX', 'EX', 'HX', 'LX', 'Si', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 8th gen (2006-2011)
for (let year = 2006; year <= 2011; year++) {
  if (addEntry(year, 'Civic', ['DX', 'EX', 'EX-L', 'LX', 'Si', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// Already have 2008-2025, but fill any gaps 2012-2025 should be there
// 9th gen (2012-2015)
for (let year = 2012; year <= 2015; year++) {
  if (addEntry(year, 'Civic', ['LX', 'EX', 'EX-L', 'Si', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 10th gen (2016-2021)
for (let year = 2016; year <= 2021; year++) {
  if (addEntry(year, 'Civic', ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'])) {
    console.log('  Added ' + year);
  }
}
// 11th gen (2022-2025) - should already exist
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Civic', ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R'])) {
    console.log('  Added ' + year);
  }
}

// === Accord (1998-2025, currently 2008-2025) ===
console.log('\n=== ACCORD ===');
// 6th gen (1998-2002)
for (let year = 1998; year <= 2002; year++) {
  if (addEntry(year, 'Accord', ['DX', 'LX', 'EX', 'SE'])) {
    console.log('  Added ' + year);
  }
}
// 7th gen (2003-2007)
for (let year = 2003; year <= 2007; year++) {
  if (addEntry(year, 'Accord', ['DX', 'LX', 'EX', 'EX-L', 'SE', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 8th gen (2008-2012) - should already have some
for (let year = 2008; year <= 2012; year++) {
  if (addEntry(year, 'Accord', ['LX', 'LX-P', 'EX', 'EX-L', 'SE'])) {
    console.log('  Added ' + year);
  }
}
// 9th gen (2013-2017)
for (let year = 2013; year <= 2017; year++) {
  if (addEntry(year, 'Accord', ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 10th gen (2018-2022)
for (let year = 2018; year <= 2022; year++) {
  if (addEntry(year, 'Accord', ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 11th gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Accord', ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}

// === CR-V (1997-2025, currently 2008-2025) ===
console.log('\n=== CR-V ===');
// 1st gen (1997-2001)
for (let year = 1997; year <= 2001; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'SE'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2002-2006)
for (let year = 2002; year <= 2006; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'SE'])) {
    console.log('  Added ' + year);
  }
}
// 3rd gen (2007-2011)
for (let year = 2007; year <= 2011; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'EX-L'])) {
    console.log('  Added ' + year);
  }
}
// 4th gen (2012-2016)
for (let year = 2012; year <= 2016; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'EX-L', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// 5th gen (2017-2022)
for (let year = 2017; year <= 2022; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'EX-L', 'Touring', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}
// 6th gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'CR-V', ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Hybrid'])) {
    console.log('  Added ' + year);
  }
}

// === Pilot (2003-2025, currently only 2020-2025 with gaps) ===
console.log('\n=== PILOT ===');
// 1st gen (2003-2008)
for (let year = 2003; year <= 2008; year++) {
  if (addEntry(year, 'Pilot', ['LX', 'EX', 'EX-L', 'SE', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2009-2015)
for (let year = 2009; year <= 2015; year++) {
  if (addEntry(year, 'Pilot', ['LX', 'EX', 'EX-L', 'SE', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// 3rd gen (2016-2022)
for (let year = 2016; year <= 2022; year++) {
  if (addEntry(year, 'Pilot', ['LX', 'EX', 'EX-L', 'Touring', 'Elite', 'Black Edition', 'Special Edition', 'TrailSport'])) {
    console.log('  Added ' + year);
  }
}
// 4th gen (2023-2025) - some exist
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Pilot', ['Sport', 'EX-L', 'TrailSport', 'Touring', 'Elite', 'Black Edition'])) {
    console.log('  Added ' + year);
  }
}

// === Odyssey (1999-2025, currently only 2022) ===
console.log('\n=== ODYSSEY ===');
// 2nd gen (1999-2004)
for (let year = 1999; year <= 2004; year++) {
  if (addEntry(year, 'Odyssey', ['LX', 'EX', 'EX-L'])) {
    console.log('  Added ' + year);
  }
}
// 3rd gen (2005-2010)
for (let year = 2005; year <= 2010; year++) {
  if (addEntry(year, 'Odyssey', ['LX', 'EX', 'EX-L', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// 4th gen (2011-2017)
for (let year = 2011; year <= 2017; year++) {
  if (addEntry(year, 'Odyssey', ['LX', 'EX', 'EX-L', 'SE', 'Touring', 'Touring Elite'])) {
    console.log('  Added ' + year);
  }
}
// 5th gen (2018-2025)
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Odyssey', ['LX', 'EX', 'EX-L', 'Sport', 'Touring', 'Elite'])) {
    console.log('  Added ' + year);
  }
}

// === HR-V (2016-2025, currently only 2023) ===
console.log('\n=== HR-V ===');
// 1st gen (2016-2022)
for (let year = 2016; year <= 2022; year++) {
  if (addEntry(year, 'HR-V', ['LX', 'EX', 'EX-L', 'Sport', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'HR-V', ['LX', 'Sport', 'EX-L'])) {
    console.log('  Added ' + year);
  }
}

// === Ridgeline (2006-2025, currently 2006-2023 with gap 2015-2016) ===
console.log('\n=== RIDGELINE ===');
// 1st gen (2006-2014) - mostly exists
for (let year = 2006; year <= 2014; year++) {
  if (addEntry(year, 'Ridgeline', ['RT', 'RTS', 'RTL', 'SE', 'Sport', 'Touring'])) {
    console.log('  Added ' + year);
  }
}
// No 2015-2016 (production gap - correct)
// 2nd gen (2017-2025)
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'Ridgeline', ['Sport', 'RTL', 'RTL-T', 'RTL-E', 'Black Edition', 'TrailSport'])) {
    console.log('  Added ' + year);
  }
}

// === S2000 (1999-2009, currently 2000-2009) ===
console.log('\n=== S2000 ===');
if (addEntry(1999, 'S2000', ['Base'])) {
  console.log('  Added 1999');
}
// Rest should exist (2000-2009)

// === Fit (2007-2020, currently has gap at 2014) ===
console.log('\n=== FIT ===');
// Fill gap and extend
for (let year = 2007; year <= 2020; year++) {
  if (addEntry(year, 'Fit', ['Base', 'Sport', 'EX', 'EX-L'])) {
    console.log('  Added ' + year);
  }
}

// === Element (2003-2011, currently covers this) ===
console.log('\n=== ELEMENT ===');
for (let year = 2003; year <= 2011; year++) {
  if (addEntry(year, 'Element', ['LX', 'EX', 'SC'])) {
    console.log('  Added ' + year);
  }
}

// === Passport (2019-2025, currently 2019-2023) ===
console.log('\n=== PASSPORT ===');
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Passport', ['Sport', 'EX-L', 'Touring', 'Elite', 'TrailSport'])) {
    console.log('  Added ' + year);
  }
}

// === Insight (2000-2022, currently has gaps 2007-2009, 2015-2018) ===
console.log('\n=== INSIGHT ===');
// 1st gen (2000-2006) - mostly exists
for (let year = 2000; year <= 2006; year++) {
  if (addEntry(year, 'Insight', ['Base'])) {
    console.log('  Added ' + year);
  }
}
// No 2007-2009 (production gap)
// 2nd gen (2010-2014)
for (let year = 2010; year <= 2014; year++) {
  if (addEntry(year, 'Insight', ['LX', 'EX'])) {
    console.log('  Added ' + year);
  }
}
// No 2015-2018 (production gap)
// 3rd gen (2019-2022)
for (let year = 2019; year <= 2022; year++) {
  if (addEntry(year, 'Insight', ['LX', 'EX', 'Touring'])) {
    console.log('  Added ' + year);
  }
}

// === Crosstour (2010-2015) ===
console.log('\n=== CROSSTOUR ===');
for (let year = 2010; year <= 2015; year++) {
  if (addEntry(year, 'Crosstour', ['EX', 'EX-L'])) {
    console.log('  Added ' + year);
  }
}

// === 2026 Model Year (current models only) ===
console.log('\n=== 2026 MODEL YEAR ===');
const honda2026 = {
  'Civic': ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R'],
  'Accord': ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Hybrid'],
  'CR-V': ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Hybrid'],
  'Pilot': ['Sport', 'EX-L', 'TrailSport', 'Touring', 'Elite', 'Black Edition'],
  'Odyssey': ['LX', 'EX', 'EX-L', 'Sport', 'Touring', 'Elite'],
  'HR-V': ['LX', 'Sport', 'EX-L'],
  'Ridgeline': ['Sport', 'RTL', 'RTL-T', 'RTL-E', 'Black Edition', 'TrailSport'],
  'Passport': ['Sport', 'EX-L', 'Touring', 'Elite', 'TrailSport']
};
Object.entries(honda2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) {
    console.log('  Added 2026 Honda ' + model);
  }
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Honda) {
    const sorted = {};
    Object.keys(ymmt[year].Honda).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Honda[model];
    });
    ymmt[year].Honda = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Honda YMMT entries total');
