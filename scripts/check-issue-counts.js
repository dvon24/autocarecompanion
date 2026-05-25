const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));

var makeCount = {};
data.issues.forEach(function(i) {
  var make = (i.vehicleMatch && i.vehicleMatch.make) || i.make || 'unknown';
  var model = (i.vehicleMatch && i.vehicleMatch.model) || i.model || 'unknown';
  var key = make + '|' + model;
  if (makeCount[key] === undefined) makeCount[key] = 0;
  makeCount[key]++;
});

var entries = Object.entries(makeCount).sort(function(a,b) { return a[1] - b[1]; });
console.log('=== Models with fewest issues (need deep research) ===');
entries.filter(function(e) { return e[1] <= 3; }).forEach(function(e) {
  console.log('  ' + e[0].replace('|', ' ') + ': ' + e[1]);
});

console.log('\n=== Issue count per make ===');
var makes = {};
data.issues.forEach(function(i) {
  var make = (i.vehicleMatch && i.vehicleMatch.make) || i.make || 'unknown';
  if (makes[make] === undefined) makes[make] = 0;
  makes[make]++;
});
Object.entries(makes).sort(function(a,b) { return a[1] - b[1]; }).forEach(function(e) {
  console.log('  ' + e[0] + ': ' + e[1]);
});
