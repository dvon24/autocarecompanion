const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));

var statusCount = {};
var sevCount = {};
data.issues.forEach(function(i) {
  var s = i.status || 'undefined';
  if (statusCount[s] === undefined) statusCount[s] = 0;
  statusCount[s]++;
  var sev = i.severity || 'undefined';
  if (sevCount[sev] === undefined) sevCount[sev] = 0;
  sevCount[sev]++;
});
console.log('Status breakdown:', JSON.stringify(statusCount));
console.log('Severity breakdown:', JSON.stringify(sevCount));

var nr = 0;
data.issues.forEach(function(i) { if (i.needsReview) nr++; });
console.log('needsReview=true:', nr);

// Check if any issue has status that would be filtered
var noStatus = 0;
data.issues.forEach(function(i) {
  if (i.status === undefined) noStatus++;
});
console.log('Issues without status field:', noStatus, '(will default to published)');
