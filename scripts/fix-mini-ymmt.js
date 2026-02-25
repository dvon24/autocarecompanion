const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].MINI) ymmt[yearStr].MINI = {};
  if (!ymmt[yearStr].MINI[model]) {
    ymmt[yearStr].MINI[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Cooper Hardtop (2002-2025) ===
console.log('=== COOPER ===');
// R50/R53 Gen 1 (2002-2006)
for (let year = 2002; year <= 2006; year++) {
  if (addEntry(year, 'Cooper', ['Base', 'S'])) console.log('  Added ' + year);
}
// R56 Gen 2 (2007-2013)
for (let year = 2007; year <= 2013; year++) {
  if (addEntry(year, 'Cooper', ['Base', 'S', 'John Cooper Works'])) console.log('  Added ' + year);
}
// F56 Gen 3 (2014-2021)
for (let year = 2014; year <= 2021; year++) {
  if (addEntry(year, 'Cooper', ['Base', 'S', 'John Cooper Works'])) console.log('  Added ' + year);
}
// F56 LCI2 (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Cooper', ['Classic', 'S', 'John Cooper Works', 'SE'])) console.log('  Added ' + year);
}

// === Countryman (2011-2025) ===
console.log('\n=== COUNTRYMAN ===');
// R60 (2011-2016)
for (let year = 2011; year <= 2016; year++) {
  if (addEntry(year, 'Countryman', ['Base', 'S', 'S ALL4', 'John Cooper Works ALL4'])) console.log('  Added ' + year);
}
// F60 (2017-2025)
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'Countryman', ['Classic', 'S', 'S ALL4', 'John Cooper Works ALL4', 'SE ALL4'])) console.log('  Added ' + year);
}

// === Clubman (2008-2025) ===
console.log('\n=== CLUBMAN ===');
// R55 (2008-2014)
for (let year = 2008; year <= 2014; year++) {
  if (addEntry(year, 'Clubman', ['Base', 'S', 'John Cooper Works'])) console.log('  Added ' + year);
}
// F54 (2016-2025)
for (let year = 2016; year <= 2025; year++) {
  if (addEntry(year, 'Clubman', ['Classic', 'S', 'S ALL4', 'John Cooper Works ALL4'])) console.log('  Added ' + year);
}

// === Convertible (2005-2025) ===
console.log('\n=== CONVERTIBLE ===');
// R52 (2005-2008)
for (let year = 2005; year <= 2008; year++) {
  if (addEntry(year, 'Convertible', ['Base', 'S'])) console.log('  Added ' + year);
}
// R57 (2009-2015)
for (let year = 2009; year <= 2015; year++) {
  if (addEntry(year, 'Convertible', ['Base', 'S', 'John Cooper Works'])) console.log('  Added ' + year);
}
// F57 (2016-2025)
for (let year = 2016; year <= 2025; year++) {
  if (addEntry(year, 'Convertible', ['Classic', 'S', 'John Cooper Works'])) console.log('  Added ' + year);
}

// === Paceman (2013-2016) ===
console.log('\n=== PACEMAN ===');
for (let year = 2013; year <= 2016; year++) {
  if (addEntry(year, 'Paceman', ['Base', 'S', 'S ALL4', 'John Cooper Works ALL4'])) console.log('  Added ' + year);
}

// === Coupe (2012-2015) ===
console.log('\n=== COUPE ===');
for (let year = 2012; year <= 2015; year++) {
  if (addEntry(year, 'Coupe', ['S', 'John Cooper Works'])) console.log('  Added ' + year);
}

// === Roadster (2012-2015) ===
console.log('\n=== ROADSTER ===');
for (let year = 2012; year <= 2015; year++) {
  if (addEntry(year, 'Roadster', ['S', 'John Cooper Works'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const mini2026 = {
  'Cooper': ['Classic', 'S', 'John Cooper Works', 'SE'],
  'Countryman': ['Classic', 'S', 'S ALL4', 'John Cooper Works ALL4', 'SE ALL4'],
  'Clubman': ['Classic', 'S', 'S ALL4', 'John Cooper Works ALL4'],
  'Convertible': ['Classic', 'S', 'John Cooper Works'],
};
Object.entries(mini2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 MINI ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].MINI) {
    const sorted = {};
    Object.keys(ymmt[year].MINI).sort().forEach(function(model) {
      sorted[model] = ymmt[year].MINI[model];
    });
    ymmt[year].MINI = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' MINI YMMT entries total');
