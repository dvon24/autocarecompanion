const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));

const issues = data.issues.filter(i => {
  const vm = i.vehicleMatch || {};
  const make = (vm.make || i.make || '').toLowerCase();
  const model = (vm.model || i.model || '').toLowerCase();
  return make === 'dodge' && model.includes('challenger');
});

console.log('=== Dodge Challenger Issues ===');
issues.forEach(i => {
  const hasVM = i.vehicleMatch !== undefined;
  const ec = i.estimatedCost;
  const hasLowHigh = ec && ec.low !== undefined;
  const hasMinMax = ec && ec.min !== undefined;
  console.log(`${i.id}`);
  console.log(`  category: ${i.category}`);
  console.log(`  estimatedCost: ${JSON.stringify(ec)}`);
  console.log(`  format: ${hasLowHigh ? 'low/high' : hasMinMax ? 'min/max' : 'none'}`);
  console.log(`  hasVehicleMatch: ${hasVM}`);
  console.log(`  severity: ${i.severity}`);
  console.log(`  symptoms: ${JSON.stringify(i.symptoms)}`);
  console.log(`  reportCount: ${i.reportCount}`);
  console.log('');
});

// Now check ALL Dodge issues for bad estimatedCost format
console.log('\n=== ALL Dodge issues with min/max format ===');
const dodgeIssues = data.issues.filter(i => {
  const vm = i.vehicleMatch || {};
  return (vm.make || i.make || '').toLowerCase() === 'dodge';
});
dodgeIssues.forEach(i => {
  const ec = i.estimatedCost;
  if (ec && ec.min !== undefined && ec.low === undefined) {
    console.log(`PROBLEM: ${i.id} has min/max but NO low/high: ${JSON.stringify(ec)}`);
  }
  if (ec && ec.low !== undefined && ec.min !== undefined) {
    console.log(`BOTH: ${i.id} has both formats: ${JSON.stringify(ec)}`);
  }
});

// Check ALL issues in the entire database for this problem
console.log('\n=== ALL issues with min/max but missing low/high ===');
let problemCount = 0;
data.issues.forEach(i => {
  const ec = i.estimatedCost;
  if (ec && ec.min !== undefined && ec.low === undefined) {
    const vm = i.vehicleMatch || {};
    const make = vm.make || i.make || 'unknown';
    const model = vm.model || i.model || 'unknown';
    console.log(`${make} ${model}: ${i.id} -> ${JSON.stringify(ec)}`);
    problemCount++;
  }
});
console.log(`Total problematic issues: ${problemCount}`);

// Also check for issues with missing/invalid categories
console.log('\n=== Issues with invalid categories ===');
const validCats = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','other'];
let badCatCount = 0;
data.issues.forEach(i => {
  if (i.category && !validCats.includes(i.category)) {
    const vm = i.vehicleMatch || {};
    console.log(`BAD CATEGORY "${i.category}": ${i.id} (${vm.make||i.make} ${vm.model||i.model})`);
    badCatCount++;
  }
  if (!i.category) {
    const vm = i.vehicleMatch || {};
    console.log(`MISSING CATEGORY: ${i.id} (${vm.make||i.make} ${vm.model||i.model})`);
    badCatCount++;
  }
});
console.log(`Total bad category issues: ${badCatCount}`);
