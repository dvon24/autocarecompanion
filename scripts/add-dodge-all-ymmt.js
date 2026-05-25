const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

function addModelToYear(year, model, trimList) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Dodge) ymmt[yearStr].Dodge = {};
  if (!ymmt[yearStr].Dodge[model]) {
    ymmt[yearStr].Dodge[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// === Extend Charger to 2006-2007 (currently starts at 2008) ===
console.log('\nAdding Dodge Charger (2006-2007)...');
for (let year = 2006; year <= 2007; year++) {
  if (addModelToYear(year, 'Charger', ['SE', 'SXT', 'R/T', 'SRT8'])) {
    console.log('  Added ' + year + ' Charger');
    addedCount++;
  }
}

// === Extend Charger to 2025 and add Daytona ===
console.log('\nAdding Dodge Charger (2025)...');
if (addModelToYear(2025, 'Charger', ['Daytona R/T', 'Daytona Scat Pack', 'SIXPACK'])) {
  console.log('  Added 2025 Charger');
  addedCount++;
}

// === Dodge Grand Caravan (2001-2020) ===
console.log('\nAdding Dodge Grand Caravan (2001-2020)...');
for (let year = 2001; year <= 2007; year++) {
  if (addModelToYear(year, 'Grand Caravan', ['SE', 'Sport', 'SXT', 'ES'])) {
    console.log('  Added ' + year + ' Grand Caravan');
    addedCount++;
  }
}
for (let year = 2008; year <= 2010; year++) {
  if (addModelToYear(year, 'Grand Caravan', ['SE', 'SXT', 'Crew'])) {
    console.log('  Added ' + year + ' Grand Caravan');
    addedCount++;
  }
}
for (let year = 2011; year <= 2020; year++) {
  if (addModelToYear(year, 'Grand Caravan', ['AVP', 'SE', 'SXT', 'Crew', 'R/T', 'GT'])) {
    console.log('  Added ' + year + ' Grand Caravan');
    addedCount++;
  }
}

// === Dodge Dart (2013-2016) ===
console.log('\nAdding Dodge Dart (2013-2016)...');
for (let year = 2013; year <= 2016; year++) {
  if (addModelToYear(year, 'Dart', ['SE', 'SXT', 'Aero', 'Limited', 'GT'])) {
    console.log('  Added ' + year + ' Dart');
    addedCount++;
  }
}

// === Dodge Hornet (2023-2025) ===
console.log('\nAdding Dodge Hornet (2023-2025)...');
for (let year = 2023; year <= 2025; year++) {
  if (addModelToYear(year, 'Hornet', ['GT', 'GT Plus', 'R/T', 'R/T Plus'])) {
    console.log('  Added ' + year + ' Hornet');
    addedCount++;
  }
}

// === Dodge Avenger (2008-2014) ===
console.log('\nAdding Dodge Avenger (2008-2014)...');
for (let year = 2008; year <= 2014; year++) {
  if (addModelToYear(year, 'Avenger', ['SE', 'SXT', 'R/T'])) {
    console.log('  Added ' + year + ' Avenger');
    addedCount++;
  }
}

// === Dodge Caliber (2007-2012) ===
console.log('\nAdding Dodge Caliber (2007-2012)...');
for (let year = 2007; year <= 2012; year++) {
  if (addModelToYear(year, 'Caliber', ['SE', 'SXT', 'R/T', 'Heat'])) {
    console.log('  Added ' + year + ' Caliber');
    addedCount++;
  }
}

// === Dodge Nitro (2007-2011) ===
console.log('\nAdding Dodge Nitro (2007-2011)...');
for (let year = 2007; year <= 2011; year++) {
  if (addModelToYear(year, 'Nitro', ['SE', 'SXT', 'R/T', 'Heat', 'Detonator'])) {
    console.log('  Added ' + year + ' Nitro');
    addedCount++;
  }
}

// === Dodge Dakota (1997-2011) ===
console.log('\nAdding Dodge Dakota (1997-2011)...');
for (let year = 1997; year <= 2004; year++) {
  if (addModelToYear(year, 'Dakota', ['Base', 'Sport', 'SLT', 'R/T'])) {
    console.log('  Added ' + year + ' Dakota');
    addedCount++;
  }
}
for (let year = 2005; year <= 2011; year++) {
  if (addModelToYear(year, 'Dakota', ['ST', 'SLT', 'Laramie', 'TRX', 'Big Horn'])) {
    console.log('  Added ' + year + ' Dakota');
    addedCount++;
  }
}

// === Dodge Neon / SRT-4 (2000-2005) ===
console.log('\nAdding Dodge Neon (2000-2005)...');
for (let year = 2000; year <= 2002; year++) {
  if (addModelToYear(year, 'Neon', ['SE', 'ES', 'ACR', 'R/T'])) {
    console.log('  Added ' + year + ' Neon');
    addedCount++;
  }
}
for (let year = 2003; year <= 2005; year++) {
  if (addModelToYear(year, 'Neon', ['SE', 'SXT', 'SRT-4'])) {
    console.log('  Added ' + year + ' Neon');
    addedCount++;
  }
}

// === Dodge Viper (1992-2017) ===
console.log('\nAdding Dodge Viper (1992-2017)...');
for (let year = 1992; year <= 1995; year++) {
  if (addModelToYear(year, 'Viper', ['RT/10'])) {
    console.log('  Added ' + year + ' Viper');
    addedCount++;
  }
}
for (let year = 1996; year <= 2002; year++) {
  if (addModelToYear(year, 'Viper', ['RT/10', 'GTS'])) {
    console.log('  Added ' + year + ' Viper');
    addedCount++;
  }
}
for (let year = 2003; year <= 2006; year++) {
  if (addModelToYear(year, 'Viper', ['SRT-10'])) {
    console.log('  Added ' + year + ' Viper');
    addedCount++;
  }
}
for (let year = 2008; year <= 2010; year++) {
  if (addModelToYear(year, 'Viper', ['SRT-10', 'SRT-10 ACR'])) {
    console.log('  Added ' + year + ' Viper');
    addedCount++;
  }
}
for (let year = 2013; year <= 2017; year++) {
  if (addModelToYear(year, 'Viper', ['SRT', 'GTS', 'ACR', 'TA'])) {
    console.log('  Added ' + year + ' Viper');
    addedCount++;
  }
}

// === Extend Durango to 1998-2010 (currently starts at 2011) ===
console.log('\nAdding Dodge Durango (1998-2010)...');
for (let year = 1998; year <= 2003; year++) {
  if (addModelToYear(year, 'Durango', ['Base', 'SLT', 'SLT Plus', 'R/T'])) {
    console.log('  Added ' + year + ' Durango');
    addedCount++;
  }
}
for (let year = 2004; year <= 2009; year++) {
  if (addModelToYear(year, 'Durango', ['ST', 'SLT', 'Limited', 'SXT', 'Adventurer'])) {
    console.log('  Added ' + year + ' Durango');
    addedCount++;
  }
}
// 2010 was a gap year - no production
// 2011+ already exists

// === Extend Durango to 2025 ===
if (addModelToYear(2025, 'Durango', ['SXT', 'GT', 'R/T', 'Citadel', 'SRT Hellcat'])) {
  console.log('  Added 2025 Durango');
  addedCount++;
}

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Dodge) {
    const sorted = {};
    Object.keys(ymmt[year].Dodge).sort().forEach(model => {
      sorted[model] = ymmt[year].Dodge[model];
    });
    ymmt[year].Dodge = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nSuccessfully added ' + addedCount + ' Dodge year/model combinations');
