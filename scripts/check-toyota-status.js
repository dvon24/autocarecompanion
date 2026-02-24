const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));
const toyota = data.issues.filter(i => (i.vehicleMatch && i.vehicleMatch.make === 'Toyota') || i.make === 'Toyota');
console.log('=== TOYOTA ISSUES BY MODEL ===');
const models = {};
let totalNR = 0, totalUnreviewed = 0;
toyota.forEach(i => {
  const m = (i.vehicleMatch && i.vehicleMatch.model) || i.model || 'unknown';
  if (models[m] === undefined) models[m] = { count: 0, nr: 0, unreviewed: 0 };
  models[m].count++;
  if (i.communityRecommendations) i.communityRecommendations.forEach(r => { if (r.needsReview) { models[m].nr++; totalNR++; } });
  if (!i.reviewedOn || i.reviewedOn === '') { models[m].unreviewed++; totalUnreviewed++; }
});
Object.entries(models).sort((a, b) => b[1].count - a[1].count).forEach(([m, s]) => {
  console.log('  ' + m + ': ' + s.count + ' issues, ' + s.nr + ' needsReview, ' + s.unreviewed + ' unreviewed');
});
console.log('\nTotal: ' + toyota.length + ' issues, ' + totalNR + ' needsReview, ' + totalUnreviewed + ' unreviewed');

const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));
let ymmtCount = 0;
const ymmtModels = new Set();
Object.keys(ymmt).forEach(yr => { if(ymmt[yr].Toyota) { Object.keys(ymmt[yr].Toyota).forEach(m => { ymmtCount++; ymmtModels.add(m); }); } });
console.log('\nYMMT: ' + ymmtCount + ' entries, models: ' + Array.from(ymmtModels).sort().join(', '));
console.log('DB total: ' + data.issues.length);
