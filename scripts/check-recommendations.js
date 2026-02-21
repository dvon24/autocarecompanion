// Check which issues are missing communityRecommendations
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const missing = data.issues.filter(i => !i.communityRecommendations);
const hasRecommendations = data.issues.filter(i => i.communityRecommendations);

console.log('Total issues:', data.issues.length);
console.log('Issues WITH recommendations:', hasRecommendations.length);
console.log('Issues MISSING recommendations:', missing.length);
console.log('\nMissing recommendations:');
missing.forEach(i => console.log('-', i.id, `(${i.vehicleMatch.make} ${i.vehicleMatch.model})`));
