const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'known-issues.json'), 'utf8'));
const nissan = data.issues.filter(i => (i.vehicleMatch && i.vehicleMatch.make === 'Nissan') || i.make === 'Nissan');
console.log('=== NISSAN ISSUES BY MODEL ===');
const models = {};
let totalNR = 0, totalUnreviewed = 0;
nissan.forEach(i => {
  const m = (i.vehicleMatch && i.vehicleMatch.model) || i.model || 'unknown';
  if (models[m] === undefined) models[m] = { count: 0, nr: 0, unreviewed: 0 };
  models[m].count++;
  if (i.communityRecommendations) i.communityRecommendations.forEach(r => { if (r.needsReview) { models[m].nr++; totalNR++; } });
  if (!i.reviewedOn || i.reviewedOn === '') { models[m].unreviewed++; totalUnreviewed++; }
});
Object.entries(models).sort((a, b) => b[1].count - a[1].count).forEach(([m, s]) => {
  console.log('  ' + m + ': ' + s.count + ' issues, ' + s.nr + ' needsReview, ' + s.unreviewed + ' unreviewed');
});
console.log('\nTotal: ' + nissan.length + ' issues, ' + totalNR + ' needsReview, ' + totalUnreviewed + ' unreviewed');

const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));
let ymmtCount = 0;
const ymmtModels = new Set();
Object.keys(ymmt).forEach(yr => { if(ymmt[yr].Nissan) { Object.keys(ymmt[yr].Nissan).forEach(m => { ymmtCount++; ymmtModels.add(m); }); } });
console.log('\nYMMT: ' + ymmtCount + ' entries, models: ' + Array.from(ymmtModels).sort().join(', '));
console.log('DB total: ' + data.issues.length);
