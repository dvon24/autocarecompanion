// Find duplicate issue IDs
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const ids = data.issues.map(i => i.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const uniqueDuplicates = [...new Set(duplicates)];

console.log('Duplicate IDs found:', uniqueDuplicates);
console.log('Total duplicate entries:', duplicates.length);

// Show details for each duplicate
uniqueDuplicates.forEach(dupId => {
  const issues = data.issues.filter(i => i.id === dupId);
  console.log(`\n${dupId}: ${issues.length} copies`);
  issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue.vehicleMatch.make} ${issue.vehicleMatch.model} (${issue.vehicleMatch.years[0]}-${issue.vehicleMatch.years[issue.vehicleMatch.years.length - 1]})`);
  });
});
