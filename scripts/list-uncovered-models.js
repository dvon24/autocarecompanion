const ymmt = require('../public/data/ymmt.json');
const overrides = require('../src/data/maintenance-overrides.json');

// Collect all models from YMMT
const modelMap = {};
for (const [year, makes] of Object.entries(ymmt)) {
  for (const [make, models] of Object.entries(makes)) {
    for (const [model, trims] of Object.entries(models)) {
      const key = make + '|' + model;
      if (!modelMap[key]) {
        modelMap[key] = { make, model, trims: new Set(), years: [] };
      }
      modelMap[key].years.push(parseInt(year));
      if (Array.isArray(trims)) trims.forEach(t => modelMap[key].trims.add(t));
    }
  }
}

// Check which have trim schedules
const covered = new Set();
for (const [make, md] of Object.entries(overrides.makes)) {
  if (!md.models) continue;
  for (const [model, mdata] of Object.entries(md.models)) {
    if (mdata.trims) covered.add(make + '|' + model);
  }
}

// Sort by number of trims descending
const entries = Object.values(modelMap).sort((a, b) => b.trims.size - a.trims.size);

console.log('=== MODELS WITHOUT TRIM SCHEDULES (sorted by trim count) ===\n');
let uncovered = 0;
const byMake = {};
for (const e of entries) {
  const key = e.make + '|' + e.model;
  if (!covered.has(key) && e.trims.size > 1) {
    uncovered++;
    if (!byMake[e.make]) byMake[e.make] = [];
    byMake[e.make].push(e);
    const yearRange = Math.min(...e.years) + '-' + Math.max(...e.years);
    const trimList = [...e.trims].slice(0, 6).join(', ');
    const more = e.trims.size > 6 ? ` +${e.trims.size - 6} more` : '';
    console.log(`${e.make.padEnd(16)}${e.model.padEnd(25)}${String(e.trims.size).padStart(3)} trims  ${yearRange.padEnd(12)}${trimList}${more}`);
  }
}

console.log(`\nUncovered models with 2+ trims: ${uncovered}`);
console.log(`Already covered: ${covered.size}`);

console.log('\n=== UNCOVERED COUNT BY MAKE ===');
for (const [make, models] of Object.entries(byMake).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${make}: ${models.length} models (${models.map(m => m.model).join(', ')})`);
}
