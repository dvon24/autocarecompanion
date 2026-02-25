const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));

// Find issues with engine/transmission/fuel/cooling category but no DTC codes
const gaps = [];
data.issues.forEach(function(issue) {
  const cat = (issue.category || '').toLowerCase();
  const hasDtc = issue.dtcCodes && issue.dtcCodes.length > 0;
  if (!hasDtc && (cat === 'engine' || cat === 'transmission' || cat === 'fuel' || cat === 'cooling')) {
    const make = (issue.vehicleMatch && issue.vehicleMatch.make) || issue.make;
    const model = (issue.vehicleMatch && issue.vehicleMatch.model) || issue.model;
    gaps.push({ id: issue.id, make: make, model: model, cat: cat, title: issue.title });
  }
});

console.log('=== Engine/Trans/Fuel/Cooling Issues WITHOUT DTC codes (' + gaps.length + ') ===');
gaps.forEach(function(g) {
  console.log('  [' + g.cat + '] ' + g.make + ' ' + g.model + ': ' + g.title);
  console.log('    ID: ' + g.id);
});

// Category breakdown of all issues without DTC
const catBreakdown = {};
data.issues.forEach(function(issue) {
  if (!issue.dtcCodes || issue.dtcCodes.length === 0) {
    const cat = (issue.category || 'unknown').toLowerCase();
    if (catBreakdown[cat] === undefined) catBreakdown[cat] = 0;
    catBreakdown[cat]++;
  }
});
console.log('\n=== No-DTC Issues by Category ===');
Object.entries(catBreakdown).sort((a,b) => b[1] - a[1]).forEach(function([cat, count]) {
  console.log('  ' + cat + ': ' + count);
});
