const { readFileSync } = require('fs');
const specs = JSON.parse(readFileSync('./src/data/vehicle-specs.json', 'utf8'));
const ymmt = JSON.parse(readFileSync('./public/data/ymmt.json', 'utf8'));

const ymmtModels = {};
const makes2020 = ymmt['2020'] || {};
for (const [make, models] of Object.entries(makes2020)) {
  if (ymmtModels[make] === undefined) ymmtModels[make] = new Set();
  for (const model of Object.keys(models)) {
    ymmtModels[make].add(model);
  }
}

const specsModels = {};
for (const [make, models] of Object.entries(specs)) {
  if (make === '_note') continue;
  specsModels[make] = Object.keys(models);
}

let totalCovered = 0;
let totalMissing = 0;
for (const make of Object.keys(ymmtModels).sort()) {
  const models = ymmtModels[make];
  const covered = specsModels[make] || [];
  const missing = [...models].filter(m => {
    return covered.every(c => c.toLowerCase() !== m.toLowerCase());
  });
  totalCovered += covered.length;
  totalMissing += missing.length;
  console.log(make + ': ' + covered.length + ' covered, ' + missing.length + ' missing');
  if (missing.length > 0) console.log('  Missing:', missing.join(', '));
}
console.log('\nTotal: ' + totalCovered + ' covered, ' + totalMissing + ' missing');
