const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addModel(year, model, trims) {
  const y = String(year);
  if (!ymmt[y]) ymmt[y] = {};
  if (!ymmt[y]['Porsche']) ymmt[y]['Porsche'] = {};
  if (!ymmt[y]['Porsche'][model]) {
    ymmt[y]['Porsche'][model] = trims;
    addedCount++;
  }
}

// 911 generations
// 996: 2000-2004
for (let y = 2000; y <= 2004; y++) {
  const trims = ['Carrera', 'Carrera 4'];
  if (y >= 2002) trims.push('Carrera 4S');
  trims.push('Turbo');
  if (y >= 2001) trims.push('Turbo S');
  if (y >= 2004) trims.push('GT3');
  if (y === 2001 || y === 2004) trims.push('GT2');
  trims.push('Targa');
  addModel(y, '911', trims);
}

// 997: 2005-2011
for (let y = 2005; y <= 2011; y++) {
  const trims = ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S'];
  if (y >= 2007) trims.push('Turbo');
  if (y >= 2011) trims.push('Turbo S');
  if (y >= 2007) trims.push('GT3');
  if (y >= 2007) trims.push('GT3 RS');
  if (y === 2008 || y === 2009) trims.push('GT2');
  if (y >= 2010) trims.push('GT2 RS');
  trims.push('Targa 4', 'Targa 4S');
  if (y >= 2011) trims.push('GTS');
  addModel(y, '911', trims);
}

// 991: 2012-2019
for (let y = 2012; y <= 2019; y++) {
  const trims = ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S'];
  if (y >= 2014) trims.push('Turbo', 'Turbo S');
  if (y >= 2014) trims.push('GT3');
  if (y >= 2016) trims.push('GT3 RS');
  if (y === 2018 || y === 2019) trims.push('GT2 RS');
  trims.push('Targa 4', 'Targa 4S');
  if (y >= 2015) trims.push('GTS');
  addModel(y, '911', trims);
}

// 992: 2020-2026
for (let y = 2020; y <= 2026; y++) {
  const trims = ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S'];
  trims.push('Turbo', 'Turbo S');
  if (y >= 2022) trims.push('GT3');
  if (y >= 2023) trims.push('GT3 RS');
  if (y >= 2025) trims.push('GT2 RS');
  trims.push('Targa 4', 'Targa 4S');
  if (y >= 2022) trims.push('GTS');
  addModel(y, '911', trims);
}

// Cayenne: 2003-2026
for (let y = 2003; y <= 2026; y++) {
  const trims = ['Base'];
  trims.push('S');
  if (y >= 2008) trims.push('GTS');
  trims.push('Turbo');
  if (y >= 2006) trims.push('Turbo S');
  if (y >= 2015) trims.push('E-Hybrid');
  if (y >= 2020) {
    trims.push('Coupe', 'Coupe S', 'Coupe GTS', 'Coupe Turbo');
    if (y >= 2020) trims.push('Coupe E-Hybrid');
    if (y >= 2022) trims.push('Coupe Turbo GT');
  }
  if (y >= 2024) trims.push('Turbo E-Hybrid');
  addModel(y, 'Cayenne', trims);
}

// Macan: 2015-2026
for (let y = 2015; y <= 2026; y++) {
  if (y >= 2024) {
    // EV Macan from 2024+
    const trims = ['Base', 'S', 'GTS', 'Turbo', 'T', 'Electric', 'Electric 4S', 'Electric Turbo'];
    addModel(y, 'Macan', trims);
  } else {
    const trims = ['Base', 'S'];
    if (y >= 2017) trims.push('GTS');
    if (y >= 2015 && y <= 2019) trims.push('Turbo');
    if (y >= 2020) trims.push('Turbo');
    if (y >= 2022) trims.push('T');
    addModel(y, 'Macan', trims);
  }
}

// Panamera: 2010-2026
for (let y = 2010; y <= 2026; y++) {
  const trims = ['Base', '4'];
  if (y >= 2012) trims.push('4S');
  else trims.push('S');
  if (y >= 2012) trims.push('S');
  if (y >= 2014) trims.push('GTS');
  trims.push('Turbo');
  if (y >= 2012) trims.push('Turbo S');
  if (y >= 2014) trims.push('E-Hybrid');
  if (y >= 2018) trims.push('Turbo S E-Hybrid');
  if (y >= 2018) trims.push('Sport Turismo');
  addModel(y, 'Panamera', trims);
}

// Boxster: 2000-2016
for (let y = 2000; y <= 2016; y++) {
  const trims = ['Base', 'S'];
  if (y >= 2014) trims.push('GTS');
  if (y >= 2016) trims.push('Spyder');
  addModel(y, 'Boxster', trims);
}

// 718 Boxster: 2017-2026
for (let y = 2017; y <= 2026; y++) {
  const trims = ['Base', 'S'];
  if (y >= 2018) trims.push('GTS');
  if (y >= 2020) trims.push('Spyder');
  if (y >= 2021) trims.push('25 Years');
  addModel(y, '718 Boxster', trims);
}

// Cayman: 2006-2016
for (let y = 2006; y <= 2016; y++) {
  const trims = ['Base', 'S'];
  if (y === 2012) trims.push('R');
  if (y >= 2015) trims.push('GTS');
  if (y >= 2016) trims.push('GT4');
  addModel(y, 'Cayman', trims);
}

// 718 Cayman: 2017-2026
for (let y = 2017; y <= 2026; y++) {
  const trims = ['Base', 'S'];
  if (y >= 2018) trims.push('GTS');
  if (y >= 2020) trims.push('GT4');
  if (y >= 2022) trims.push('GT4 RS');
  addModel(y, '718 Cayman', trims);
}

// Taycan: 2020-2026
for (let y = 2020; y <= 2026; y++) {
  const trims = ['Base', '4S'];
  if (y >= 2022) trims.push('GTS');
  trims.push('Turbo', 'Turbo S');
  if (y >= 2022) trims.push('Cross Turismo');
  if (y >= 2022) trims.push('Sport Turismo');
  addModel(y, 'Taycan', trims);
}

// Write back
fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`Added ${addedCount} Porsche model/year entries to ymmt.json`);

// Count by model
const modelCounts = {};
for (const year of Object.keys(ymmt)) {
  if (ymmt[year]['Porsche']) {
    for (const model of Object.keys(ymmt[year]['Porsche'])) {
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    }
  }
}
console.log('\nPorsche models by year count:');
for (const [model, count] of Object.entries(modelCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model}: ${count} years`);
}
console.log(`\nTotal unique model-year entries: ${Object.values(modelCounts).reduce((a, b) => a + b, 0)}`);
